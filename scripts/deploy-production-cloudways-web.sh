#!/usr/bin/env bash
set -euo pipefail

# Ensure user-global npm binaries are available in non-login shells.
export PATH="$HOME/.npm-global/bin:$PATH"

required_vars=(
  APP_PATH
  DEPLOY_BRANCH
  PUBLIC_HTML_PATH
  WEB_API_BASE_URL
)

for var_name in "${required_vars[@]}"; do
  if [[ -z "${!var_name:-}" ]]; then
    echo "[deploy-web] missing required variable: $var_name" >&2
    exit 1
  fi
done

echo "[deploy-web] app path: $APP_PATH"
echo "[deploy-web] branch: $DEPLOY_BRANCH"
echo "[deploy-web] public html path: $PUBLIC_HTML_PATH"

cd "$APP_PATH"

if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo "[deploy-web] APP_PATH is not a git repository: $APP_PATH" >&2
  exit 1
fi

echo "[deploy-web] git status (pre-sync):"
git status --short || true

if ! git diff --quiet || ! git diff --cached --quiet; then
  stash_name="deploy-web-autostash-$(date -u +%Y%m%dT%H%M%SZ)"
  echo "[deploy-web] local tracked changes detected; stashing as $stash_name"
  git stash push -m "$stash_name"
fi

git fetch origin "$DEPLOY_BRANCH"
current_branch="$(git rev-parse --abbrev-ref HEAD)"
if [[ "$current_branch" != "$DEPLOY_BRANCH" ]]; then
  git checkout "$DEPLOY_BRANCH"
fi

git pull --ff-only origin "$DEPLOY_BRANCH"

cd Apps/web
npm ci
VITE_API_BASE_URL="$WEB_API_BASE_URL" VITE_BASE_PATH="${WEB_BASE_PATH:-/}" npm run build

mkdir -p "$PUBLIC_HTML_PATH"
rsync -rltvz --delete \
  --omit-dir-times \
  --no-perms \
  --no-owner \
  --no-group \
  dist/ "$PUBLIC_HTML_PATH/"

echo "[deploy-web] deployment completed successfully"
