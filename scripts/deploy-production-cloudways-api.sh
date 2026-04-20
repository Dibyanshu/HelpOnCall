#!/usr/bin/env bash
set -euo pipefail

# Ensure user-global npm binaries are available in non-login shells.
export PATH="$HOME/.npm-global/bin:$PATH"

required_vars=(
  APP_PATH
  DEPLOY_BRANCH
  API_PROCESS_NAME
)

for var_name in "${required_vars[@]}"; do
  if [[ -z "${!var_name:-}" ]]; then
    echo "[deploy-api] missing required variable: $var_name" >&2
    exit 1
  fi
done

echo "[deploy-api] app path: $APP_PATH"
echo "[deploy-api] branch: $DEPLOY_BRANCH"
echo "[deploy-api] process: $API_PROCESS_NAME"

cd "$APP_PATH"

if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo "[deploy-api] APP_PATH is not a git repository: $APP_PATH" >&2
  exit 1
fi

echo "[deploy-api] git status (pre-sync):"
git status --short || true

if ! git diff --quiet || ! git diff --cached --quiet; then
  stash_name="deploy-api-autostash-$(date -u +%Y%m%dT%H%M%SZ)"
  echo "[deploy-api] local tracked changes detected; stashing as $stash_name"
  git stash push -m "$stash_name"
fi

git fetch origin "$DEPLOY_BRANCH"
current_branch="$(git rev-parse --abbrev-ref HEAD)"
if [[ "$current_branch" != "$DEPLOY_BRANCH" ]]; then
  if git show-ref --verify --quiet "refs/heads/$DEPLOY_BRANCH"; then
    git checkout "$DEPLOY_BRANCH"
  else
    git checkout -B "$DEPLOY_BRANCH" "origin/$DEPLOY_BRANCH"
  fi
fi

echo "[deploy-api] syncing branch to origin/$DEPLOY_BRANCH"
git reset --hard "origin/$DEPLOY_BRANCH"

# ---------------------------------------------------------------------------
# Write MySQL connection vars into Apps/api/.env (production only).
# Only updates the five MySQL_* keys; all other .env content is preserved.
# The .env file must already exist on the server with the baseline vars
# (APP_ENV, PORT, HOST, JWT_SECRET, SUPER_ADMIN_*, MAIL_*, etc.).
# ---------------------------------------------------------------------------
if [[ -n "${MYSQL_HOST:-}" ]]; then
  ENV_FILE="$APP_PATH/Apps/api/.env"

  if [[ ! -f "$ENV_FILE" ]]; then
    echo "[deploy-api] WARNING: $ENV_FILE not found; creating a minimal stub." >&2
    echo "APP_ENV=production" > "$ENV_FILE"
  fi

  # Helper: update an existing KEY=value line or append it.
  update_env_var() {
    local key="$1"
    local value="$2"
    local file="$3"
    if grep -q "^${key}=" "$file" 2>/dev/null; then
      sed -i "s|^${key}=.*|${key}=${value}|" "$file"
    else
      echo "${key}=${value}" >> "$file"
    fi
  }

  update_env_var MYSQL_HOST     "$MYSQL_HOST"              "$ENV_FILE"
  update_env_var MYSQL_PORT     "${MYSQL_PORT:-3306}"      "$ENV_FILE"
  update_env_var MYSQL_USER     "$MYSQL_USER"              "$ENV_FILE"
  update_env_var MYSQL_PASSWORD "$MYSQL_PASSWORD"          "$ENV_FILE"
  update_env_var MYSQL_DATABASE "$MYSQL_DATABASE"          "$ENV_FILE"

  echo "[deploy-api] MySQL connection vars written to $ENV_FILE"
fi

cd Apps/api
npm ci
npm run build

if pm2 describe "$API_PROCESS_NAME" >/dev/null 2>&1; then
  pm2 restart "$API_PROCESS_NAME"
else
  pm2 start dist/server.js --name "$API_PROCESS_NAME"
fi
pm2 save

echo "[deploy-api] deployment completed successfully"
