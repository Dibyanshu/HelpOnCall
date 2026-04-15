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
  git checkout "$DEPLOY_BRANCH"
fi

git pull --ff-only origin "$DEPLOY_BRANCH"

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
