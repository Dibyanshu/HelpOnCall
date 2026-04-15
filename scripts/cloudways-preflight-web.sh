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
    echo "[preflight-web] missing required variable: $var_name" >&2
    exit 1
  fi
done

echo "[preflight-web] starting"
echo "[preflight-web] app path: $APP_PATH"
echo "[preflight-web] deploy branch: $DEPLOY_BRANCH"
echo "[preflight-web] public html path: $PUBLIC_HTML_PATH"

for bin_name in git node npm rsync; do
  if ! command -v "$bin_name" >/dev/null 2>&1; then
    echo "[preflight-web] missing dependency: $bin_name" >&2
    exit 1
  fi
done

if [[ ! -d "$APP_PATH" ]]; then
  echo "[preflight-web] APP_PATH does not exist: $APP_PATH" >&2
  exit 1
fi

cd "$APP_PATH"

if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo "[preflight-web] APP_PATH is not a git repository" >&2
  exit 1
fi

if ! git ls-remote --heads origin "$DEPLOY_BRANCH" >/dev/null 2>&1; then
  echo "[preflight-web] unable to confirm branch origin/$DEPLOY_BRANCH" >&2
  exit 1
fi

if [[ ! -d "Apps/web" ]]; then
  echo "[preflight-web] missing Apps/web under APP_PATH" >&2
  exit 1
fi

mkdir -p "$PUBLIC_HTML_PATH"
if [[ ! -w "$PUBLIC_HTML_PATH" ]]; then
  echo "[preflight-web] PUBLIC_HTML_PATH is not writable: $PUBLIC_HTML_PATH" >&2
  exit 1
fi

if [[ -n "${HEALTH_URL:-}" ]]; then
  echo "[preflight-web] checking current web URL: $HEALTH_URL"
  if curl -sS -m 10 "$HEALTH_URL" >/dev/null 2>&1; then
    echo "[preflight-web] web URL reachable"
  else
    echo "[preflight-web] web URL not reachable yet (non-blocking for first deploy)"
  fi
fi

echo "[preflight-web] passed"
