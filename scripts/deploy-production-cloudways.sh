#!/usr/bin/env bash
set -euo pipefail

# Ensure user-global npm binaries are available in non-login shells.
export PATH="$HOME/.npm-global/bin:$PATH"

required_vars=(
  APP_PATH
  DEPLOY_BRANCH
  API_PROCESS_NAME
  PUBLIC_HTML_PATH
)

for var_name in "${required_vars[@]}"; do
  if [[ -z "${!var_name:-}" ]]; then
    echo "Missing required variable: $var_name" >&2
    exit 1
  fi
done

echo "[deploy] app path: $APP_PATH"
echo "[deploy] branch: $DEPLOY_BRANCH"
echo "[deploy] pm2 process: $API_PROCESS_NAME"

cd "$APP_PATH"

if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo "APP_PATH is not a git repository: $APP_PATH" >&2
  exit 1
fi

git fetch origin "$DEPLOY_BRANCH"
current_branch="$(git rev-parse --abbrev-ref HEAD)"
if [[ "$current_branch" != "$DEPLOY_BRANCH" ]]; then
  git checkout "$DEPLOY_BRANCH"
fi

git pull --ff-only origin "$DEPLOY_BRANCH"

# Backend build and restart
cd Apps/api
npm install
npm run build

if pm2 describe "$API_PROCESS_NAME" >/dev/null 2>&1; then
  pm2 restart "$API_PROCESS_NAME"
else
  pm2 start dist/server.js --name "$API_PROCESS_NAME"
fi
pm2 save

# Frontend build and publish
cd ../web
npm install
VITE_API_BASE_URL="${WEB_API_BASE_URL:-}" VITE_BASE_PATH="${WEB_BASE_PATH:-/}" npm run build

mkdir -p "$PUBLIC_HTML_PATH"
# Cloudways public_html may not allow preserving ownership/perms/timestamps.
rsync -rltvz --delete \
  --omit-dir-times \
  --no-perms \
  --no-owner \
  --no-group \
  dist/ "$PUBLIC_HTML_PATH/"

echo "[deploy] deployment completed successfully"
