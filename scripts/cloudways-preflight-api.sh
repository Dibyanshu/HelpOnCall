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
    echo "[preflight-api] missing required variable: $var_name" >&2
    exit 1
  fi
done

echo "[preflight-api] starting"
echo "[preflight-api] app path: $APP_PATH"
echo "[preflight-api] deploy branch: $DEPLOY_BRANCH"
echo "[preflight-api] process: $API_PROCESS_NAME"

for bin_name in git node npm pm2; do
  if ! command -v "$bin_name" >/dev/null 2>&1; then
    echo "[preflight-api] missing dependency: $bin_name" >&2
    exit 1
  fi
done

if [[ ! -d "$APP_PATH" ]]; then
  echo "[preflight-api] APP_PATH does not exist: $APP_PATH" >&2
  exit 1
fi

cd "$APP_PATH"

if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo "[preflight-api] APP_PATH is not a git repository" >&2
  exit 1
fi

if ! git ls-remote --heads origin "$DEPLOY_BRANCH" >/dev/null 2>&1; then
  echo "[preflight-api] unable to confirm branch origin/$DEPLOY_BRANCH" >&2
  exit 1
fi

if [[ ! -d "Apps/api" ]]; then
  echo "[preflight-api] missing Apps/api under APP_PATH" >&2
  exit 1
fi

if pm2 describe "$API_PROCESS_NAME" >/dev/null 2>&1; then
  echo "[preflight-api] pm2 process found: $API_PROCESS_NAME"
else
  echo "[preflight-api] pm2 process not found yet: $API_PROCESS_NAME (will be created on first deploy)"
fi

if [[ -n "${HEALTH_URL:-}" ]]; then
  echo "[preflight-api] checking current health URL: $HEALTH_URL"
  if curl -sS -m 10 "$HEALTH_URL" >/dev/null 2>&1; then
    echo "[preflight-api] health URL reachable"
  else
    echo "[preflight-api] health URL not reachable yet (non-blocking for first deploy)"
  fi
fi

echo "[preflight-api] passed"
