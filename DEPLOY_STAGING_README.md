# Help On Call - Staging CI/CD and Deployment

This document describes the staging deployment setup for the Help On Call monorepo:

- Frontend: React app in Apps/web
- Backend: Fastify + Drizzle API in Apps/api
- Hosting: Vercel (static site + serverless API)
- Staging database: Turso (libSQL)

## Architecture Flow

1. Push to the staging branch.
2. GitHub Actions builds and deploys a Vercel preview build.
3. Manual approval gate blocks promotion.
4. After approval, workflow deploys the prebuilt artifact to the staging target.

Workflow file: .github/workflows/deploy-staging.yml

## Dynamic Database Routing

The API switches database drivers using APP_ENV:

- development: better-sqlite3 local file
- staging or production: @libsql/client (Turso)

Implementation files:

- Apps/api/src/config/env.ts
- Apps/api/src/db/index.ts

Dependency rule:

- better-sqlite3 stays in devDependencies
- @libsql/client is a runtime dependency

## Required Environment Variables

Vercel project variables:

- APP_ENV
  - preview scope: staging
  - production scope: production
- TURSO_DATABASE_URL
- TURSO_AUTH_TOKEN
- JWT_SECRET
- Any mail/upload variables your API requires

GitHub repository secrets:

- VERCEL_TOKEN
- VERCEL_ORG_ID
- VERCEL_PROJECT_ID

GitHub environment:

- Name: staging
- Required reviewers: enabled (manual Go/No-Go gate)

## Vercel Configuration

Root config file: vercel.json

It builds and routes:

- Apps/api/src/vercel.ts as Node serverless handler
- Apps/web/package.json as static frontend build
- /api/* requests to API handler
- all other routes fallback to SPA index.html

## Serverless API Entry

Serverless handler file: Apps/api/src/vercel.ts

Behavior:

- Creates Fastify app lazily on cold start
- Runs ensureTables and seed routines once per cold start
- Reuses initialized app for subsequent invocations

## Deployment Steps Checklist

1. Create and protect the staging branch.
2. Configure Vercel environment variables.
3. Configure GitHub secrets.
4. Create GitHub environment named staging with required reviewers.
5. Push to staging and validate:
   - preview deploy succeeds
   - manual approval gate appears
   - post-approval deploy succeeds

## Notes

- Local development keeps using SQLite file storage by default.
- Staging/prod require valid Turso URL and token.
- If your staging target is a separate Vercel project, keep VERCEL_PROJECT_ID mapped to that project.

## Section added for comit & push test - 2