# Help On Call - Production CI/CD and Deployment (Cloudways)

This document describes the production deployment setup for the Help On Call monorepo on Cloudways.

- Frontend: React app in Apps/web
- Backend: Fastify + Drizzle API in Apps/api
- Hosting: Cloudways managed server
- Production database: Cloudways-managed database service

## Architecture Flow

1. Push changes to the production branch (for example: main).
2. Cloudways Git deployment (or your CI job) pulls the latest commit onto the server.
3. Backend dependencies are installed and API is rebuilt.
4. Frontend dependencies are installed and static files are rebuilt.
5. PM2 restarts the API process.
6. Nginx serves frontend static files and proxies /api requests to the Node API.

## Production Topology on Cloudways

Recommended topology on one Cloudways server:

- Frontend static files served by Nginx from Apps/web/dist
- Backend Fastify process managed by PM2 from Apps/api/dist/server.js
- Reverse proxy routing:
  - /api/* -> http://127.0.0.1:3000
  - all other routes -> frontend index.html (SPA fallback)

## Dynamic Database Routing

The API switches database drivers using APP_ENV:

- development: better-sqlite3 local file
- production: Cloudways database (non-Turso)

Current implementation files:

- Apps/api/src/config/env.ts
- Apps/api/src/db/index.ts

Production adjustment note:

- The current API codebase is still wired for Turso when APP_ENV is staging/production.
- To use Cloudways database in production, update the Drizzle driver and database client in Apps/api/src/db/index.ts.
- Update Apps/api/src/config/env.ts to validate the new production database variables.

## Required Environment Variables

### Backend (.env on Cloudways)

Create or update Apps/api/.env in the server deployment path.

Required:

- APP_ENV=production
- HOST=0.0.0.0
- PORT=3000
- JWT_SECRET=<strong random secret>
- DB_HOST=<cloudways database host>
- DB_PORT=<cloudways database port>
- DB_NAME=<cloudways database name>
- DB_USER=<cloudways database user>
- DB_PASSWORD=<cloudways database password>

Optional but commonly needed:

- MAIL_ENABLED=true|false
- SMTP_HOST
- SMTP_PORT
- SMTP_SECURE
- SMTP_USER
- SMTP_PASS
- MAIL_FROM
- MAIL_REPLY_TO
- SUPER_ADMIN_EMAIL
- SUPER_ADMIN_PASSWORD
- EMPLOYMENT_RESUME_UPLOAD_DIR
- EMPLOYMENT_RESUME_MAX_FILE_SIZE_MB

### Frontend build variables

Set frontend build variables before running build in Apps/web:

- VITE_API_BASE_URL=https://<your-domain>
- VITE_GOOGLE_MAPS_API_KEY=<your maps key, if used>

Important:

- Use domain root for VITE_API_BASE_URL because frontend calls /api/v1/... paths.

## Cloudways Application Setup

1. Create a Cloudways server and attach your production domain.
2. Configure SSL (Let's Encrypt) in Cloudways.
3. Enable Git deployment in Cloudways and connect your repository/branch.
4. Set your deployment path for the monorepo (root containing Apps/).
5. Ensure Node.js is available on the server for API build and runtime.

## Build and Start Commands (Current Repo)

### Backend (Apps/api)

- Install: npm install
- Build: npm run build
- Start: npm run start

### Frontend (Apps/web)

- Install: npm install
- Build: npm run build
- Output: Apps/web/dist

## Process Management with PM2

Use PM2 to keep the API alive across restarts.

Example commands (run from Apps/api):

```bash
npm install
npm run build
pm2 start dist/server.js --name help-on-call-api
pm2 save
pm2 startup
```

For updates:

```bash
npm install
npm run build
pm2 restart help-on-call-api
```

## Nginx Routing (Concept)

Configure Cloudways/Nginx so:

- /api passes through to http://127.0.0.1:3000
- / serves Apps/web/dist
- SPA fallback rewrites unknown frontend routes to /index.html

Example Nginx snippet (adapt to Cloudways UI/templates):

```nginx
location /api/ {
  proxy_pass http://127.0.0.1:3000;
  proxy_http_version 1.1;
  proxy_set_header Host $host;
  proxy_set_header X-Real-IP $remote_addr;
  proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
  proxy_set_header X-Forwarded-Proto $scheme;
}

location / {
  root /home/master/applications/<app-id>/public_html;
  try_files $uri $uri/ /index.html;
}
```

If Apps/web/dist is not your public_html folder, copy the dist contents to the active web root during deploy.

## Suggested Deployment Script (Server-side)

Run from your monorepo root on Cloudways:

```bash
# Backend
cd Apps/api
npm install
npm run build
pm2 restart help-on-call-api || pm2 start dist/server.js --name help-on-call-api

# Frontend
cd ../web
npm install
npm run build

# Publish frontend build to web root (adjust destination path)
rsync -av --delete dist/ /home/master/applications/<app-id>/public_html/
```

## Health and Verification

After each production deployment:

1. Verify API health endpoint:
   - GET https://<your-domain>/api/v1/health
2. Verify admin login and key read/write API operations.
3. Verify frontend pages load directly (deep-link test).
4. Verify file uploads (employment resume flow).
5. Verify mail test endpoint if mail is enabled.

## Deployment Steps Checklist

1. Configure Cloudways server, domain, and SSL.
2. Configure Git deployment for production branch.
3. Set backend .env variables for production.
4. Set frontend build env variables.
5. Configure PM2 process for API.
6. Configure Nginx routing for /api and SPA fallback.
7. Run deployment script.
8. Run post-deploy health checks.

## Notes

- Local development can keep using SQLite.
- Production should use Cloudways database credentials.
- Keep JWT_SECRET and SMTP credentials outside source control.
- Use Cloudways scheduled jobs or CI to automate repeatable deployments.
- Consider blue/green or maintenance windows for zero-downtime updates.

## Database Migration Checklist (Turso -> Cloudways)

1. Choose your Cloudways database engine and version.
2. Add a compatible runtime DB driver package to Apps/api.
3. Refactor Apps/api/src/db/index.ts to initialize Cloudways DB client for APP_ENV=production.
4. Update schema migration strategy for the new engine.
5. Replace Turso variables in production secrets with Cloudways DB credentials.
6. Run migration and smoke-test all admin/public API flows.
