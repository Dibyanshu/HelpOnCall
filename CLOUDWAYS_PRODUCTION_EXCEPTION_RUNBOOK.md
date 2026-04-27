# Cloudways Production Deployment Exception Runbook

Last updated: 2026-04-16

## 1) Purpose

This runbook documents the split-app production deployment flow and every exception observed during setup.
Use it for fast diagnosis when GitHub Actions or server deployment fails.

Scope:
- API app: xjbdxtgyjr
- Web app: ytfmrwppdt
- Server host: 159.203.16.174

## 2) Architecture Snapshot

- Repo on server: /home/master/helponcall-repo
- API runtime process: help-on-call-api (PM2)
- API app URL: https://phpstack-1608575-6325198.cloudwaysapps.com
- Web app URL: https://phpstack-1608575-6323934.cloudwaysapps.com
- API local bind: 127.0.0.1:3000

Important path behavior:
- External API route currently resolves as /api/api/v1/... for successful responses.
- Health URL currently used by pipeline should be:
  https://phpstack-1608575-6325198.cloudwaysapps.com/api/api/v1/health

## 3) GitHub Workflow Jobs

Workflow file: .github/workflows/deploy-production.yml

Job order:
1. build-and-validate
2. deploy-api
3. deploy-web

Both deploy jobs do:
- Secret validation
- SSH key setup
- Host key scan
- Remote preflight script
- Remote deploy script
- Health check

## 4) Required Secrets

Shared:
- CLOUDWAYS_SSH_PRIVATE_KEY

API:
- API_CLOUDWAYS_SSH_HOST
- API_CLOUDWAYS_SSH_PORT
- API_CLOUDWAYS_SSH_USER
- API_CLOUDWAYS_APP_PATH
- API_CLOUDWAYS_PM2_PROCESS_NAME
- API_HEALTHCHECK_URL

Web:
- WEB_CLOUDWAYS_SSH_HOST
- WEB_CLOUDWAYS_SSH_PORT
- WEB_CLOUDWAYS_SSH_USER
- WEB_CLOUDWAYS_APP_PATH
- WEB_CLOUDWAYS_PUBLIC_HTML_PATH
- WEB_HEALTHCHECK_URL

Frontend build:
- PRODUCTION_API_BASE_URL

## 5) Baseline Pre-Deploy Verification

Run from local terminal:

	ssh -i ~/.ssh/cloudways_help_on_call -o IdentitiesOnly=yes -o StrictHostKeyChecking=accept-new -p 22 master_jhffypnzbd@159.203.16.174 "cd /home/master/helponcall-repo && git status --short"

Expected:
- No tracked changes before deployment.

## 6) Known Exceptions and Exact Fixes

### A) SSH Key Parse Failure in GitHub Actions

Symptom:
- Load key "/home/runner/.ssh/cloudways_deploy_key": error in libcrypto

Cause:
- Secret format mismatch (quoted value, escaped newlines, or base64 text not decoded)

Fix implemented:
- .github/workflows/deploy-production.yml now normalizes SSH key secret by:
  - trimming wrapping quotes
  - converting escaped newline sequences
  - attempting base64 decode when needed
  - validating with ssh-keygen -y

If still failing:
- Re-save CLOUDWAYS_SSH_PRIVATE_KEY as raw multiline private key including BEGIN/END lines.

### B) API Deploy Fails on Git Pull Due to Local Changes

Symptom:
- error: Your local changes to the following files would be overwritten by merge

Cause:
- Tracked local edits on server repo block git pull --ff-only.

Fix implemented:
- scripts/deploy-production-cloudways-api.sh auto-stashes tracked changes before fetch/checkout/pull.
- scripts/deploy-production-cloudways-web.sh uses same logic.
- Both scripts now print pre-sync git status for easier debugging.

Manual immediate unblock command:

	ssh -i ~/.ssh/cloudways_help_on_call -o IdentitiesOnly=yes -o StrictHostKeyChecking=accept-new -p 22 master_jhffypnzbd@159.203.16.174 "cd /home/master/helponcall-repo && git stash push -m manual-predeploy-autostash-$(date -u +%Y%m%dT%H%M%SZ)"

### C) API Crash on Startup Due to Missing Environment

Symptom:
- PM2 restarts repeatedly
- Zod errors for required vars such as JWT_SECRET

Cause:
- /home/master/helponcall-repo/Apps/api/.env was empty.

Fix:
- Restore full production .env with required variables.
- Ensure APP_ENV=production and DB_PROVIDER=turso for this setup.

Verify:

	ssh -i ~/.ssh/cloudways_help_on_call -o IdentitiesOnly=yes -o StrictHostKeyChecking=accept-new -p 22 master_jhffypnzbd@159.203.16.174 "export PATH=$HOME/.npm-global/bin:$PATH; pm2 logs --nostream --lines 80 help-on-call-api"

### D) API Crash with SQL_INPUT_ERROR no such column users.email

Symptom:
- LibsqlError SQL_INPUT_ERROR no such column: users.email

Cause:
- Turso users table schema differed from current application schema.

Observed legacy columns:
- personal_email instead of email
- full_name instead of name

Recovery applied:
- Added users.email and backfilled from users.personal_email.
- Added users.name and backfilled from users.full_name.
- Ensured users_email_unique index.

Post-fix verification:

	ssh -i ~/.ssh/cloudways_help_on_call -o IdentitiesOnly=yes -o StrictHostKeyChecking=accept-new -p 22 master_jhffypnzbd@159.203.16.174 "curl -sS -i http://127.0.0.1:3000/api/v1/health"

Expected:
- HTTP 200 with {"status":"ok"}

### E) Drizzle Push Returns 401 Against Turso

Symptom:
- drizzle-kit push fails with SERVER_ERROR HTTP status 401

Cause:
- drizzle.config.ts did not pass TURSO_AUTH_TOKEN to dbCredentials.

Fix implemented:
- Apps/api/drizzle.config.ts now sets authToken when URL is libsql.

## 7) Current Recommended Production Values

API health URL:
- https://phpstack-1608575-6325198.cloudwaysapps.com/api/api/v1/health

Web API base URL for Vite build:
- https://phpstack-1608575-6325198.cloudwaysapps.com/api

Web app URL:
- https://phpstack-1608575-6323934.cloudwaysapps.com

Cloudways MySQL connection snapshot:
- MYSQL_HOST=1608575.cloudwaysapps.com
- MYSQL_PORT=3306
- MYSQL_USER=xjbdxtgyjr
- MYSQL_DATABASE=xjbdxtgyjr
- MYSQL_PASSWORD=<stored in GitHub Environment secret only>

## 8) Fast Incident Triage Checklist

1. Confirm GitHub Actions failure step and error text.
2. Check SSH key step first if deployment did not connect.
3. Check remote git status in /home/master/helponcall-repo.
4. Check PM2 process state and logs.
5. Check local API health on 127.0.0.1:3000.
6. Check external API health URL from runner and from server.
7. If DB error appears, inspect Turso schema mismatch before retrying.

## 9) Useful Commands

PM2 status:

	ssh -i ~/.ssh/cloudways_help_on_call -o IdentitiesOnly=yes -o StrictHostKeyChecking=accept-new -p 22 master_jhffypnzbd@159.203.16.174 "export PATH=$HOME/.npm-global/bin:$PATH; pm2 list"

PM2 logs:

	ssh -i ~/.ssh/cloudways_help_on_call -o IdentitiesOnly=yes -o StrictHostKeyChecking=accept-new -p 22 master_jhffypnzbd@159.203.16.174 "export PATH=$HOME/.npm-global/bin:$PATH; pm2 logs --nostream --lines 120 help-on-call-api"

Local health check:

	ssh -i ~/.ssh/cloudways_help_on_call -o IdentitiesOnly=yes -o StrictHostKeyChecking=accept-new -p 22 master_jhffypnzbd@159.203.16.174 "curl -sS -i http://127.0.0.1:3000/api/v1/health"

External health check:

	curl -sS -i https://phpstack-1608575-6325198.cloudwaysapps.com/api/api/v1/health

Repo status:

	ssh -i ~/.ssh/cloudways_help_on_call -o IdentitiesOnly=yes -o StrictHostKeyChecking=accept-new -p 22 master_jhffypnzbd@159.203.16.174 "cd /home/master/helponcall-repo && git status --short && git stash list | head -10"


## 11) 502 Bad Gateway - nginx: Troubleshooting and Fix Steps (2026-04-28)

### Symptom

- Visiting the API health URL (e.g., https://phpstack-1608575-6325198.cloudwaysapps.com/api/api/v1/health) returns 502 Bad Gateway (nginx).

### Step-by-step Troubleshooting and Fixes

1. **Check PM2 Process State**
	 - SSH into the server using:
		 ```sh
		 ssh -i ~/.ssh/cloudways_help_on_call -p 22 master_jhffypnzbd@159.203.16.174
		 ```
	 - Run:
		 ```sh
		 export PATH=$HOME/.npm-global/bin:$PATH; pm2 list
		 ```
	 - If no API process is running, start it (see below).

2. **Check .env File**
	 - Ensure `/home/master/helponcall-repo/Apps/api/.env` exists and is populated.
	 - Confirm `APP_ENV=production` and `DB_PROVIDER` is set as intended (`turso` for Turso, `cloudways` for MySQL).
	 - If switching to Turso, ensure all `MYSQL_*` variables are removed or commented out.

3. **Start or Restart API Process**
	 - Change to the API directory:
		 ```sh
		 cd /home/master/helponcall-repo/Apps/api
		 ```
	 - If needed, build the project:
		 ```sh
		 npm install
		 npm run build
		 ```
	 - Start the server:
		 ```sh
		 pm2 start dist/server.js --name help-on-call-api
		 ```
	 - Or restart if already running:
		 ```sh
		 pm2 restart help-on-call-api
		 ```

4. **Check PM2 Logs for Errors**
	 - Run:
		 ```sh
		 pm2 logs help-on-call-api
		 ```
	 - Look for errors about missing environment variables or database connection issues.

5. **Fix Environment Validation**
	 - If logs show errors like `MYSQL_USER is required when APP_ENV is production` but you are using Turso, update your validation logic (e.g., in `src/config/env.ts`) so MySQL variables are only required if `DB_PROVIDER` is `cloudways` or `mysql`.
	 - After updating, restart the API process.

6. **Verify Health Endpoint**
	 - After the API is running, check:
		 ```sh
		 curl -sS -i http://127.0.0.1:3000/api/v1/health
		 ```
	 - Or externally:
		 ```sh
		 curl -sS -i https://phpstack-1608575-6325198.cloudwaysapps.com/api/api/v1/health
		 ```
	 - Expect HTTP 200 and `{ "status": "ok" }`.

### Key Lessons

- The workflow `DB_PROVIDER` environment variable does not update the `.env` file on the server; update `.env` directly for persistent changes.
- Always check PM2 status and logs for root cause.
- Environment validation must match the selected DB provider.

---

- Do not edit tracked files directly on server unless unavoidable.
- If emergency server-side patch is required, document file and reason, then either:
  - commit upstream quickly, or
  - stash and remove patch after incident.
- Keep API and Web deployments independent, but verify API health before Web deploy.
