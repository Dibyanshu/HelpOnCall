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

- CLOUDWAYS_SSH_PRIVATE_KEY
- CLOUDWAYS_SSH_HOST
- CLOUDWAYS_SSH_PORT
- CLOUDWAYS_SSH_USER
- CLOUDWAYS_APP_PATH
- CLOUDWAYS_PUBLIC_HTML_PATH
- CLOUDWAYS_PM2_PROCESS_NAME
- PRODUCTION_WEB_API_BASE_URL
- PRODUCTION_HEALTHCHECK_URL

Recommended values:

- CLOUDWAYS_PM2_PROCESS_NAME=help-on-call-api
- PRODUCTION_HEALTHCHECK_URL=https://<your-domain>/api/v1/health
- PRODUCTION_WEB_API_BASE_URL=https://<your-domain>

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

Required baseline:

- APP_ENV=production
- HOST=0.0.0.0
- PORT=3000
- JWT_SECRET=<strong-random-secret-min-16-chars>

Current runtime requirement note:

- Existing API code currently requires TURSO_DATABASE_URL and TURSO_AUTH_TOKEN when APP_ENV=production.
- Cloudways non-Turso DB cutover is an in-progress migration and must be completed in API code before disabling Turso vars.

Additional commonly required variables:

- SUPER_ADMIN_EMAIL
- SUPER_ADMIN_PASSWORD
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

Set via GitHub secret PRODUCTION_WEB_API_BASE_URL used during Apps/web build.

- PRODUCTION_WEB_API_BASE_URL=https://<your-domain>

Important:

- Use domain root value so web calls /api/v1/... correctly through Nginx proxy.

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

## Cloudways DB Migration Track (Production)

Production pipeline is implemented first without changing staging behavior.

For full Cloudways managed DB cutover, complete these API changes in a controlled follow-up:

1. Refactor Apps/api/src/config/env.ts to validate production DB vars for selected engine.
2. Refactor Apps/api/src/db/index.ts to use Cloudways DB driver for APP_ENV=production.
3. Align Drizzle schema/dialect and migration workflow with chosen engine.
4. Migrate data from Turso and validate all API flows.
5. Remove production dependence on TURSO_DATABASE_URL and TURSO_AUTH_TOKEN only after successful cutover.
