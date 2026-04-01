# Apps Deployment Notes

This document captures the production deployment setup details used by the GitHub Actions workflow.

## Generate CLOUDWAYS_SSH_PRIVATE_KEY (Git Bash on Windows)

Use the commands below to generate an SSH key pair for GitHub Actions to access Cloudways.

```bash
# 1) Generate a dedicated key pair for GitHub Actions -> Cloudways
ssh-keygen -t ed25519 -C "github-actions-cloudways" -f ~/.ssh/cloudways_github_actions -N ""

# 2) Print public key (copy this output into Cloudways SSH Public Keys)
cat ~/.ssh/cloudways_github_actions.pub

# 3) Copy private key to clipboard (paste into GitHub secret CLOUDWAYS_SSH_PRIVATE_KEY)
cat ~/.ssh/cloudways_github_actions | clip

# 4) Optional: verify key fingerprints
ssh-keygen -lf ~/.ssh/cloudways_github_actions
ssh-keygen -lf ~/.ssh/cloudways_github_actions.pub

# 5) Test SSH connectivity to Cloudways with this key
ssh -i ~/.ssh/cloudways_github_actions -p <PORT> <USER>@<HOST> "echo ok"

# 6) Optional: test git access on server after login
ssh -i ~/.ssh/cloudways_github_actions -p <PORT> <USER>@<HOST> "cd <APP_PATH> && git fetch origin production && echo git-ok"
```

Replace placeholders:

1. `<PORT>`: Cloudways SSH port
2. `<USER>`: Cloudways SSH user
3. `<HOST>`: Cloudways server host/IP
4. `<APP_PATH>`: server path containing Apps/api and Apps/web

## Where to paste each key

1. Public key (`.pub`): Cloudways panel -> SSH Public Keys.
2. Private key: GitHub repository -> Settings -> Environments -> production -> secret `CLOUDWAYS_SSH_PRIVATE_KEY`.

## Required production environment secrets

The production workflow at `.github/workflows/deploy-production.yml` expects these secrets in GitHub Environment `production`:

1. `CLOUDWAYS_SSH_PRIVATE_KEY`
2. `CLOUDWAYS_SSH_HOST`
3. `CLOUDWAYS_SSH_PORT`
4. `CLOUDWAYS_SSH_USER`
5. `CLOUDWAYS_APP_PATH`
6. `CLOUDWAYS_PUBLIC_HTML_PATH`
7. `CLOUDWAYS_PM2_PROCESS_NAME`
8. `PRODUCTION_WEB_API_BASE_URL`
9. `PRODUCTION_HEALTHCHECK_URL`

## Cloudways Configuration Checklist (For This Repository)

Use this checklist before running the production workflow.

### 1) Create and prepare Cloudways server

1. Create a Cloudways server on DigitalOcean.
2. Choose server size based on expected load (start small and scale vertically as needed).
3. Confirm SSH access is enabled for your user.
4. Note down:
	- Server public host/IP
	- SSH port
	- SSH username

Guide:

1. In Cloudways panel, open your server.
2. Go to Master Credentials or SSH Access area.
3. Copy host, port, and username into your deployment notes.

### 2) Create and configure the Cloudways application

1. Create or attach the production application on the server.
2. Ensure application path contains your git checkout with Apps/api and Apps/web.
3. Identify your application web root path (public_html).

Guide:

1. In Cloudways, open Applications and select your production app.
2. Verify application path and public_html path.
3. Map these to GitHub environment secrets:
	- CLOUDWAYS_APP_PATH
	- CLOUDWAYS_PUBLIC_HTML_PATH

### 3) Configure domain and SSL

1. Add your production domain to the Cloudways application.
2. Install SSL certificate (Let's Encrypt).
3. Force HTTPS once certificate is active.

Guide:

1. Application panel -> Domain Management: set primary domain.
2. SSL Certificate section: issue certificate for domain and www variant if used.
3. Enable HTTPS redirection.

### 4) Add SSH key for GitHub Actions deploy

1. Generate key pair locally (documented above).
2. Add public key to Cloudways SSH Public Keys.
3. Add private key to GitHub environment secret CLOUDWAYS_SSH_PRIVATE_KEY.

Guide:

1. Cloudways server settings -> SSH Public Keys.
2. Create key label (example: github-actions-cloudways).
3. Paste .pub key and save.

### 5) Configure git access on Cloudways server

1. Ensure the server can pull from your git repository.
2. Ensure origin remote points to your repository.
3. Verify branch production is available.

Guide:

Run on server:

```bash
cd <CLOUDWAYS_APP_PATH>
git remote -v
git fetch origin production
git rev-parse --abbrev-ref HEAD
```

If fetch fails:

1. Add deploy key or machine user key to your git provider.
2. Re-test git fetch until successful.

### 6) Install runtime dependencies on Cloudways server

Required tools:

1. git
2. node
3. npm
4. pm2
5. rsync

Guide:

Run on server:

```bash
command -v git node npm pm2 rsync
node --version
npm --version
pm2 --version
```

### 7) Configure API environment on server

Create or update Apps/api/.env in server deployment path.

Required for current runtime:

1. APP_ENV=production
2. DB_PROVIDER=turso
3. HOST=0.0.0.0
4. PORT=3000
5. JWT_SECRET=<strong-random-value>
6. TURSO_DATABASE_URL=<value>
7. TURSO_AUTH_TOKEN=<value>

Optional but recommended:

1. SUPER_ADMIN_EMAIL
2. SUPER_ADMIN_PASSWORD
3. MAIL_ENABLED and SMTP settings
4. EMPLOYMENT_RESUME_UPLOAD_DIR
5. EMPLOYMENT_RESUME_MAX_FILE_SIZE_MB

Guide:

1. Keep this file only on server.
2. Never commit server secrets to git.
3. Restart PM2 after env changes.

### 8) Prepare uploads and writable directories

1. Ensure resume upload directory exists.
2. Ensure upload directory is writable by runtime user.
3. If required, move uploads path to persistent location and set EMPLOYMENT_RESUME_UPLOAD_DIR.

Guide:

```bash
cd <CLOUDWAYS_APP_PATH>
mkdir -p Apps/api/uploads/resumes
test -w Apps/api/uploads/resumes && echo writable
```

### 9) Configure PM2 process behavior

1. Use process name help-on-call-api (or keep secret value aligned).
2. Ensure PM2 can restart/start API during deploy.
3. Persist PM2 process list.

Guide:

```bash
cd <CLOUDWAYS_APP_PATH>/Apps/api
npm install
npm run build
pm2 start dist/server.js --name help-on-call-api || pm2 restart help-on-call-api
pm2 save
```

Set GitHub secret:

1. CLOUDWAYS_PM2_PROCESS_NAME=help-on-call-api

### 10) Configure web publishing target

1. Ensure public_html is writable.
2. Confirm deployment can sync Apps/web/dist to public_html.

Guide:

```bash
mkdir -p <CLOUDWAYS_PUBLIC_HTML_PATH>
test -w <CLOUDWAYS_PUBLIC_HTML_PATH> && echo writable
```

### 11) Configure Nginx routing for SPA + API proxy

Requirements:

1. /api requests must proxy to API on 127.0.0.1:3000.
2. Frontend files must serve from public_html.
3. SPA routes must fallback to /index.html.
4. Authorization header should be forwarded to API.

Guide:

Use equivalent Nginx rules from DEPLOY_PRODUCTION_README.md and validate:

1. GET /api/v1/health returns API response.
2. Direct deep-link route load in frontend works after refresh.

### 12) Configure GitHub environment and secrets

1. Environment name must be production.
2. Add required reviewers.
3. Add all required secrets listed in this document.

Guide:

1. GitHub repository -> Settings -> Environments -> production.
2. Add reviewers.
3. Add secrets.
4. Re-run workflow if any secret was missing.

### 13) First production run (safe rollout)

1. Push a small change to production branch.
2. Wait for Build and Validate job to pass.
3. Approve deployment gate.
4. Verify remote preflight step passes.
5. Verify remote deploy step passes.
6. Verify health check step passes.

### 14) Post-deploy smoke tests

1. API health endpoint.
2. Admin login.
3. One admin protected endpoint.
4. One public endpoint.
5. Employment upload flow.
6. Optional mail health endpoint if mail enabled.

### 15) Backup and recovery baseline

1. Enable automated backup in Cloudways for app and database.
2. Keep rollback strategy ready:
	- Re-run workflow at last known good commit
	- Or manually checkout last good commit on server and redeploy
3. Store rollback runbook with responsible owners.
