# Production Cloudways Rollout Checklist

This checklist is aligned with the production workflow at .github/workflows/deploy-production.yml.

## A. GitHub Setup

1. Ensure production branch exists and is protected.
2. Ensure GitHub Environment production exists with required reviewers.
3. Confirm workflow file is present: .github/workflows/deploy-production.yml.

## B. GitHub Secrets (Required)

1. CLOUDWAYS_SSH_PRIVATE_KEY
2. CLOUDWAYS_SSH_HOST
3. CLOUDWAYS_SSH_PORT
4. CLOUDWAYS_SSH_USER
5. CLOUDWAYS_APP_PATH
6. CLOUDWAYS_PUBLIC_HTML_PATH
7. CLOUDWAYS_PM2_PROCESS_NAME
8. PRODUCTION_WEB_API_BASE_URL
9. PRODUCTION_HEALTHCHECK_URL

## C. Suggested Secret Values for This Repository

1. CLOUDWAYS_PM2_PROCESS_NAME=help-on-call-api
2. PRODUCTION_HEALTHCHECK_URL=https://<your-domain>/api/v1/health
3. PRODUCTION_WEB_API_BASE_URL=https://<your-domain>
4. CLOUDWAYS_APP_PATH=<cloudways path containing Apps/api and Apps/web>
5. CLOUDWAYS_PUBLIC_HTML_PATH=<cloudways public_html path for your application>

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
cd <CLOUDWAYS_APP_PATH>
git remote -v
git fetch origin production
git rev-parse --abbrev-ref HEAD
ls Apps/api Apps/web
```

Validate web root path:

```bash
mkdir -p <CLOUDWAYS_PUBLIC_HTML_PATH>
test -w <CLOUDWAYS_PUBLIC_HTML_PATH> && echo writable
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

## F. Nginx Routing Expectations

1. /api/* proxies to http://127.0.0.1:3000
2. / serves frontend static files
3. SPA fallback rewrites to /index.html
4. Authorization header is forwarded to API upstream

## G. First Production Pipeline Run

1. Push a small, safe commit to production branch.
2. Wait for Build and Validate to pass.
3. Approve the production environment gate.
4. Confirm remote preflight checks pass.
5. Confirm remote deployment step passes.
6. Confirm health check step passes.

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



Key Gen Command
$ ssh-keygen -t ed25519 -C "cloudways-access-help-on-call" -f ~/.ssh/cloudways_help_on_call -N ""

Then go to folder: 
/c/Users/dibyanshu/.ssh/cloudways_help_on_call.pub

CLOUDWAYS_PUBLIC_HTML_PATH = /public_html

ssh -i ~/.ssh/cloudways_help_on_call -p 22 master_jhffypnzbd@159.203.16.174 "mkdir -p ~/helponcall-repo && cd ~/helponcall-repo && if [ ! -d .git ]; then git clone -b production git@github.com:Dibyanshu/HelpOnCall.git .; else git fetch origin production; fi && ls Apps/api Apps/web"

ssh -i ~/.ssh/cloudways_help_on_call -p 22 master_jhffypnzbd@159.203.16.174 \
"mkdir -p ~/helponcall-repo && cd ~/helponcall-repo && if [ ! -d .git ]; then git clone -b production git@github.com:Dibyanshu/HelpOnCall.git .; else git fetch origin production; fi && ls Apps/api Apps/web"

Add GitHub host key on Cloudways server

ssh -i ~/.ssh/cloudways_help_on_call -p 22 master_jhffypnzbd@159.203.16.174 "mkdir -p ~/.ssh && chmod 700 ~/.ssh && ssh-keyscan -H github.com >> ~/.ssh/known_hosts && chmod 600 ~/.ssh/known_hosts && tail -n 3 ~/.ssh/known_hosts"

Generate a GitHub deploy key on Cloudways server

ssh -i ~/.ssh/cloudways_help_on_call -p 22 master_jhffypnzbd@159.203.16.174 "ssh-keygen -t ed25519 -C 'cloudways-github-deploy' -f ~/.ssh/github_deploy -N '' && cat ~/.ssh/github_deploy.pub"

ssh -i ~/.ssh/cloudways_help_on_call -p 22 master_jhffypnzbd@159.203.16.174 "ls -la /home/master/applications/6323970/public_html"

ssh -i ~/.ssh/cloudways_help_on_call -p 22 master_jhffypnzbd@159.203.16.174 "for d in \$(find /home/master/applications -maxdepth 4 -type d -name public_html 2>/dev/null); do echo '---'; echo \$d; ls -la \$d | head; done"

cat ~/.ssh/cloudways_help_on_call | clip

# fallback: install with user prefix and expose PATH
ssh -i ~/.ssh/cloudways_help_on_call -p 22 master_jhffypnzbd@159.203.16.174 "mkdir -p ~/.npm-global && npm config set prefix '~/.npm-global' && echo 'export PATH=\$HOME/.npm-global/bin:\$PATH' >> ~/.profile && export PATH=\$HOME/.npm-global/bin:\$PATH && npm install -g pm2 && command -v pm2 && pm2 --version"
