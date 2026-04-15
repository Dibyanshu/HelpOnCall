#!/usr/bin/env bash
set -euo pipefail

# Ensure user-global npm binaries are available in non-login shells.
export PATH="$HOME/.npm-global/bin:$PATH"

required_vars=(
  APP_PATH
  DEPLOY_BRANCH
  PUBLIC_HTML_PATH
)

for var_name in "${required_vars[@]}"; do
  if [[ -z "${!var_name:-}" ]]; then
    echo "[preflight] missing required variable: $var_name" >&2
    exit 1
  fi
done

echo "[preflight] starting"
echo "[preflight] app path: $APP_PATH"
echo "[preflight] deploy branch: $DEPLOY_BRANCH"
echo "[preflight] public html path: $PUBLIC_HTML_PATH"

for bin_name in git node npm pm2 rsync; do
  if ! command -v "$bin_name" >/dev/null 2>&1; then
    echo "[preflight] missing dependency: $bin_name" >&2
    exit 1
  fi
done

echo "[preflight] node: $(node --version)"
echo "[preflight] npm: $(npm --version)"
echo "[preflight] pm2: $(pm2 --version)"

if [[ ! -d "$APP_PATH" ]]; then
  echo "[preflight] APP_PATH does not exist: $APP_PATH" >&2
  exit 1
fi

cd "$APP_PATH"

if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo "[preflight] APP_PATH is not a git repository" >&2
  exit 1
fi

if ! git ls-remote --heads origin "$DEPLOY_BRANCH" >/dev/null 2>&1; then
  echo "[preflight] unable to confirm branch origin/$DEPLOY_BRANCH" >&2
  exit 1
fi

if [[ ! -d "Apps/api" ]]; then
  echo "[preflight] missing Apps/api under APP_PATH" >&2
  exit 1
fi

if [[ ! -d "Apps/web" ]]; then
  echo "[preflight] missing Apps/web under APP_PATH" >&2
  exit 1
fi

mkdir -p "$PUBLIC_HTML_PATH"
if [[ ! -w "$PUBLIC_HTML_PATH" ]]; then
  echo "[preflight] PUBLIC_HTML_PATH is not writable: $PUBLIC_HTML_PATH" >&2
  exit 1
fi

if [[ -n "${API_PROCESS_NAME:-}" ]]; then
  if pm2 describe "$API_PROCESS_NAME" >/dev/null 2>&1; then
    echo "[preflight] pm2 process found: $API_PROCESS_NAME"
  else
    echo "[preflight] pm2 process not found yet: $API_PROCESS_NAME (will be created on first deploy)"
  fi
fi

if [[ -n "${HEALTH_URL:-}" ]]; then
  echo "[preflight] checking current health URL: $HEALTH_URL"
  if curl -sS -m 10 "$HEALTH_URL" >/dev/null 2>&1; then
    echo "[preflight] health URL reachable"
  else
    echo "[preflight] health URL not reachable yet (non-blocking for first deploy)"
  fi
fi

echo "[preflight] passed"
