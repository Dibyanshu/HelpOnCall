# Help On Call - Production CI/CD and Deployment (Cloudways DigitalOcean)

This document is the implementation runbook for production deployment of the Help On Call monorepo using GitHub Actions and Cloudways (DigitalOcean provider).

- Frontend: React app in Apps/web
- Backend: Fastify + Drizzle API in Apps/api
- Staging strategy: unchanged Vercel pipeline with manual approval gate
- Production strategy: same promotion pattern as staging (build/validate -> approval -> deploy)

## Implementation Status

- Added production workflow: .github/workflows/deploy-production.yml
- Added remote preflight script: scripts/cloudways-preflight.sh
- Added remote deploy script: scripts/deploy-production-cloudways.sh
- Staging workflow remains unchanged: .github/workflows/deploy-staging.yml
- Added operator checklist: PRODUCTION_CLOUDWAYS_CHECKLIST.md

## Production CI/CD Flow (Parity With Staging)

1. Push to production branch.
2. GitHub Actions job Build and Validate runs:
   - API install + typecheck + build
   - Web install + build
3. Workflow waits at manual approval gate (GitHub Environment: production).
4. After approval, workflow runs remote preflight checks on Cloudways via SSH.
5. Workflow runs remote deployment script on Cloudways via SSH.
6. Remote deploy script updates branch, builds API/web, restarts PM2 API, publishes web dist.
7. Workflow runs production health checks against /api/v1/health.

## Branch and Workflow Files

- Production branch trigger: production
- Workflow file: .github/workflows/deploy-production.yml
- Remote script: scripts/deploy-production-cloudways.sh

## GitHub Configuration

### Required GitHub Environment

Create environment production and set Required reviewers to enforce manual Go/No-Go approval before deploy.

### Required GitHub Secrets

Repository or environment secrets required by deploy-production.yml:

API deploy secrets:

- CLOUDWAYS_SSH_PRIVATE_KEY
- API_CLOUDWAYS_SSH_HOST
- API_CLOUDWAYS_SSH_PORT
- API_CLOUDWAYS_SSH_USER
- API_CLOUDWAYS_APP_PATH
- API_CLOUDWAYS_PM2_PROCESS_NAME
- API_HEALTHCHECK_URL
- MYSQL_HOST
- MYSQL_PORT
- MYSQL_USER
- MYSQL_PASSWORD
- MYSQL_DATABASE

Web deploy secrets:

- WEB_CLOUDWAYS_SSH_HOST
- WEB_CLOUDWAYS_SSH_PORT
- WEB_CLOUDWAYS_SSH_USER
- WEB_CLOUDWAYS_APP_PATH
- WEB_CLOUDWAYS_PUBLIC_HTML_PATH
- WEB_HEALTHCHECK_URL
- PRODUCTION_API_BASE_URL

Recommended values:

- API_CLOUDWAYS_PM2_PROCESS_NAME=help-on-call-api
- API_HEALTHCHECK_URL=https://\<your-api-domain\>/api/v1/health
- PRODUCTION_API_BASE_URL=https://\<your-api-domain\>
- MYSQL_PORT=3306

## Cloudways DigitalOcean Setup (Step-by-Step)

1. Provision a Cloudways server on DigitalOcean.
2. Create/attach the production application.
3. Map the production domain to the Cloudways app.
4. Enable SSL certificate (Let's Encrypt) in Cloudways.
5. Ensure server has Node.js and PM2 available for API runtime.
6. Set application path (repo root path containing Apps/) and store it for CLOUDWAYS_APP_PATH.
7. Configure web root path (Cloudways public_html path) and store it for CLOUDWAYS_PUBLIC_HTML_PATH.
8. Add a deploy user SSH key:
   - Generate a deploy keypair for GitHub Actions.
   - Add the public key in Cloudways SSH Public Keys.
   - Store the private key in CLOUDWAYS_SSH_PRIVATE_KEY.
9. Configure Git access from Cloudways server to your repository:
   - Ensure origin remote is set to your Git provider repository.
   - Add repository deploy key or machine-user key on the Cloudways server.
   - Verify git fetch origin production works on server before enabling pipeline deploy.
10. Ensure API uploads path exists and is writable:
   - default: Apps/api/uploads/resumes
   - or set EMPLOYMENT_RESUME_UPLOAD_DIR to a persistent writable path.
11. Configure API environment variables on server (see section below).

## API Environment Variables on Cloudways

Create/update Apps/api/.env on the server deployment path.

Required baseline (set once manually before first deployment):

- APP_ENV=production
- HOST=0.0.0.0
- PORT=3000
- JWT_SECRET=\<strong-random-secret-min-16-chars\>
- SUPER_ADMIN_EMAIL=\<admin-email\>
- SUPER_ADMIN_PASSWORD=\<strong-password\>

MySQL connection variables (written automatically by the deploy script via MYSQL_* GitHub secrets):

- MYSQL_HOST
- MYSQL_PORT (default: 3306)
- MYSQL_USER
- MYSQL_PASSWORD
- MYSQL_DATABASE

The deploy script (scripts/deploy-production-cloudways-api.sh) reads the MYSQL_* values from
GitHub secrets and writes them into Apps/api/.env on the Cloudways server on every deployment,
keeping the database credentials in sync with the GitHub secrets store.

Additional commonly required variables (set manually in .env):

- MAIL_ENABLED
- SMTP_HOST
- SMTP_PORT
- SMTP_SECURE
- SMTP_USER
- SMTP_PASS
- MAIL_FROM
- MAIL_REPLY_TO
- SMTP_CONNECTION_TIMEOUT_MS
- SMTP_GREETING_TIMEOUT_MS
- EMPLOYMENT_RESUME_UPLOAD_DIR
- EMPLOYMENT_RESUME_MAX_FILE_SIZE_MB

## Frontend Build Variables

Set via GitHub secret PRODUCTION_API_BASE_URL used during Apps/web build.

- PRODUCTION_API_BASE_URL=https://\<your-api-domain\>

Important:

- Use the domain root value so web calls /api/v1/... correctly through Nginx proxy.
- This secret is used in both the build-and-validate and deploy-web CI jobs.

## Nginx Routing (Cloudways)

Configure Nginx so:

- /api/* proxies to local API at http://127.0.0.1:3000
- / serves frontend static files from public_html
- SPA fallback rewrites unknown frontend routes to /index.html

Reference snippet:

```nginx
location /api/ {
  proxy_pass http://127.0.0.1:3000;
  proxy_http_version 1.1;
  proxy_set_header Host $host;
  proxy_set_header Authorization $http_authorization;
  proxy_set_header X-Real-IP $remote_addr;
  proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
  proxy_set_header X-Forwarded-Proto $scheme;
}

location / {
  root /home/master/applications/<app-id>/public_html;
  try_files $uri $uri/ /index.html;
}
```

## PM2 Process Management

The deploy script restarts existing PM2 process, or starts one if absent:

```bash
pm2 restart help-on-call-api || pm2 start dist/server.js --name help-on-call-api
pm2 save
```

Adjust process name through CLOUDWAYS_PM2_PROCESS_NAME.

## Deployment Checklist

Use PRODUCTION_CLOUDWAYS_CHECKLIST.md as the execution checklist.

1. Confirm branch protection and reviewers on production branch and production environment.
2. Configure all required GitHub secrets listed above.
3. Verify Cloudways SSH key access from GitHub Actions.
4. Verify Cloudways app and public_html paths.
5. Push to production branch.
6. Confirm Build and Validate job succeeds.
7. Approve production environment gate.
8. Confirm deploy step finishes and health check passes.
9. Perform smoke tests:
   - admin login
   - one protected admin read endpoint
   - public API endpoint
   - employment upload flow
   - SPA deep-link refresh in frontend

## Rollback Procedure

If deployment fails after approval:

1. Re-run pipeline on last known good commit in production branch.
2. Or SSH to server and manually checkout known good commit, rebuild, and PM2 restart.
3. Re-run health endpoint and smoke tests.

## MySQL Initial Setup (First-Time Production)

Before the first production deployment, run the MySQL schema and seed script against the
CloudWays managed MySQL database:

```bash
mysql -h <MYSQL_HOST> -P <MYSQL_PORT> -u <MYSQL_USER> -p <MYSQL_DATABASE> \
  < scripts/mysql-migrate-seed.sql
```

This creates all tables and populates seed reference data (service categories, services,
testimonials, and baseline email templates). On first server startup, seedInitialEmailTemplates()
will update email templates with fully rendered HTML.

## Migrating Existing Data from Turso (Optional)

If there is live data in the Turso production database that needs to be carried over:

1. Run the schema script first (above).
2. Export data from Turso:
   ```bash
   TURSO_DATABASE_URL=libsql://... TURSO_AUTH_TOKEN=... \
   tsx scripts/export-turso-to-mysql.ts > /tmp/turso-export.sql
   ```
3. Review the generated SQL file.
4. Apply to MySQL:
   ```bash
   mysql -h <MYSQL_HOST> -P <MYSQL_PORT> -u <MYSQL_USER> -p <MYSQL_DATABASE> \
     < /tmp/turso-export.sql
   ```
5. Verify row counts match between Turso and MySQL before switching traffic.
