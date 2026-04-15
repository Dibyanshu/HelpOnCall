# Production Cloudways Rollout Checklist

This checklist is aligned with the split-app production workflow at .github/workflows/deploy-production.yml.

## A. GitHub Setup

1. Ensure production branch exists and is protected.
2. Ensure GitHub Environment production exists with required reviewers.
3. Confirm workflow file is present: .github/workflows/deploy-production.yml.

## B. GitHub Secrets (Required)

Shared:

1. CLOUDWAYS_SSH_PRIVATE_KEY

API target app (`xjbdxtgyjr`):

1. API_CLOUDWAYS_SSH_HOST
2. API_CLOUDWAYS_SSH_PORT
3. API_CLOUDWAYS_SSH_USER
4. API_CLOUDWAYS_APP_PATH
5. API_CLOUDWAYS_PM2_PROCESS_NAME
6. API_HEALTHCHECK_URL

Web target app (`ytfmrwppdt`):

1. WEB_CLOUDWAYS_SSH_HOST
2. WEB_CLOUDWAYS_SSH_PORT
3. WEB_CLOUDWAYS_SSH_USER
4. WEB_CLOUDWAYS_APP_PATH
5. WEB_CLOUDWAYS_PUBLIC_HTML_PATH
6. WEB_HEALTHCHECK_URL

Frontend build target:

1. PRODUCTION_WEB_API_BASE_URL

## C. Suggested Secret Values for This Repository

1. API_CLOUDWAYS_PM2_PROCESS_NAME=help-on-call-api
2. API_HEALTHCHECK_URL=https://<api-cloudways-internal-url>/api/v1/health
3. WEB_HEALTHCHECK_URL=https://<web-cloudways-internal-url>/
4. PRODUCTION_WEB_API_BASE_URL=https://<api-cloudways-internal-url>
5. API_CLOUDWAYS_APP_PATH=<cloudways path containing Apps/api and Apps/web for api app>
6. WEB_CLOUDWAYS_APP_PATH=<cloudways path containing Apps/api and Apps/web for web app>
7. WEB_CLOUDWAYS_PUBLIC_HTML_PATH=<cloudways web app public_html path>

## D. Cloudways Server Checks

Run these once over SSH on Cloudways:

```bash
command -v git node npm pm2 rsync
node --version
npm --version
pm2 --version
```

Validate repository and branch access:

```bash
cd <API_CLOUDWAYS_APP_PATH>
git remote -v
git fetch origin production
git rev-parse --abbrev-ref HEAD
ls Apps/api Apps/web

cd <WEB_CLOUDWAYS_APP_PATH>
git remote -v
git fetch origin production
git rev-parse --abbrev-ref HEAD
ls Apps/api Apps/web
```

Validate web root path:

```bash
mkdir -p <WEB_CLOUDWAYS_PUBLIC_HTML_PATH>
test -w <WEB_CLOUDWAYS_PUBLIC_HTML_PATH> && echo writable
```

## E. API Runtime Variables on Cloudways

Set in Apps/api/.env on server:

1. APP_ENV=production
2. DB_PROVIDER=turso (current safe mode)
3. HOST=0.0.0.0
4. PORT=3000
5. JWT_SECRET=<min 16 chars>
6. TURSO_DATABASE_URL=<required in current runtime>
7. TURSO_AUTH_TOKEN=<required in current runtime>

Optional operational settings:

1. SUPER_ADMIN_EMAIL
2. SUPER_ADMIN_PASSWORD
3. MAIL_ENABLED and SMTP_* vars
4. EMPLOYMENT_RESUME_UPLOAD_DIR
5. EMPLOYMENT_RESUME_MAX_FILE_SIZE_MB

## F. Runtime Expectations (Split Apps)

1. Web and API are deployed to separate Cloudways applications.
2. Frontend calls API using full URL from `PRODUCTION_WEB_API_BASE_URL`.
3. No same-host `/api` reverse proxy is required for web-to-api traffic.
4. API CORS must allow requests from the web app internal URL.

## G. First Production Pipeline Run

1. Push a small, safe commit to production branch.
2. Wait for Build and Validate to pass.
3. Approve production deployment gate.
4. Confirm API preflight and API deploy steps pass.
5. Confirm API health check passes.
6. Confirm Web preflight and Web deploy steps pass.
7. Confirm Web health check passes.

## H. Smoke Tests After Deploy

1. Open frontend home page and a deep link route.
2. Perform admin login.
3. Call one protected admin endpoint.
4. Verify one public API endpoint.
5. Submit employment form with file upload.
6. Check mail health endpoint if MAIL_ENABLED=true.

## I. Rollback

1. Re-run workflow from last known good production commit.
2. If needed, SSH and manually checkout known good commit, rebuild API/web, restart PM2.
3. Re-run health and smoke checks.

## J. Bash Login and SSH Quickstart

Use Git Bash on Windows.

1. Ensure key permissions are correct:

```bash
chmod 600 ~/.ssh/cloudways_help_on_call
```

2. Interactive login:

```bash
ssh -i ~/.ssh/cloudways_help_on_call -o StrictHostKeyChecking=accept-new -p 22 master_jhffypnzbd@159.203.16.174
```

3. In the remote shell, make PM2 available in PATH:

```bash
export PATH=$HOME/.npm-global/bin:$PATH
pm2 list
```

4. Exit remote shell:

```bash
exit
```

## K. One-Shot Remote Commands (No Interactive Login)

```bash
ssh -i ~/.ssh/cloudways_help_on_call -o BatchMode=yes -o ConnectTimeout=15 -o StrictHostKeyChecking=accept-new -p 22 master_jhffypnzbd@159.203.16.174 "export PATH=\$HOME/.npm-global/bin:\$PATH; pm2 show help-on-call-api"
```

Common checks:

```bash
ssh -i ~/.ssh/cloudways_help_on_call -p 22 master_jhffypnzbd@159.203.16.174 "readlink -f /home/master/applications"
ssh -i ~/.ssh/cloudways_help_on_call -p 22 master_jhffypnzbd@159.203.16.174 "ls -la /home/master/helponcall-repo/Apps/api"
ssh -i ~/.ssh/cloudways_help_on_call -p 22 master_jhffypnzbd@159.203.16.174 "grep -E '^(APP_ENV|DB_PROVIDER|TURSO_DATABASE_URL|TURSO_AUTH_TOKEN|JWT_SECRET)=' /home/master/helponcall-repo/Apps/api/.env"
```

## L. Git Access Setup on Cloudways Server

Add GitHub host key:

```bash
ssh -i ~/.ssh/cloudways_help_on_call -p 22 master_jhffypnzbd@159.203.16.174 "mkdir -p ~/.ssh && chmod 700 ~/.ssh && ssh-keyscan -H github.com >> ~/.ssh/known_hosts && chmod 600 ~/.ssh/known_hosts && tail -n 3 ~/.ssh/known_hosts"
```

Generate a GitHub deploy key on Cloudways server:

```bash
ssh -i ~/.ssh/cloudways_help_on_call -p 22 master_jhffypnzbd@159.203.16.174 "ssh-keygen -t ed25519 -C 'cloudways-github-deploy' -f ~/.ssh/github_deploy -N '' && cat ~/.ssh/github_deploy.pub"
```

Clone or update production branch repo:

```bash
ssh -i ~/.ssh/cloudways_help_on_call -p 22 master_jhffypnzbd@159.203.16.174 "mkdir -p ~/helponcall-repo && cd ~/helponcall-repo && if [ ! -d .git ]; then git clone -b production git@github.com:Dibyanshu/HelpOnCall.git .; else git fetch origin production; fi && ls Apps/api Apps/web"
```

## M. Current Environment Snapshot

1. Cloudways applications found: 3
2. Application IDs:
	- nmngndxcqm
	- xjbdxtgyjr
	- ytfmrwppdt
3. Active PM2 API process:
	- name: help-on-call-api
	- status: online
	- script: /home/master/helponcall-repo/Apps/api/dist/server.js
	- cwd: /home/master/helponcall-repo/Apps/api
4. Application mapping notes:
	- Web: ytfmrwppdt
	- API: xjbdxtgyjr

## N. Split Deployment Scripts Used by Workflow

1. API preflight: scripts/cloudways-preflight-api.sh
2. Web preflight: scripts/cloudways-preflight-web.sh
3. API deploy: scripts/deploy-production-cloudways-api.sh
4. Web deploy: scripts/deploy-production-cloudways-web.sh