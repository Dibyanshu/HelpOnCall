# HelpOnCall API

Node.js + Fastify + Drizzle ORM + SQLite API with a code-first user management module for admin operations.

## Implemented Features

- Admin login with JWT
- Change password (authenticated)
- Create users (Super Admin only)
- SMTP email service (Gmail SMTP compatible)
- Role-based permission model with these roles:
  - `content_publisher`
  - `resume_reviewer`
  - `job_poster`
  - `admin`
  - `super_admin`

## Tech Stack

- Node.js + TypeScript
- Fastify
- Drizzle ORM
- SQLite (`better-sqlite3`)
- JWT (`@fastify/jwt`)
- Validation (`zod`)

## Project Structure

```txt
api/
  src/
    app.ts
    server.ts
    config/
      env.ts
    db/
      index.ts
      schema.ts
      bootstrap.ts
      seed.ts
    plugins/
      auth.ts
    routes/
      auth.ts
      admin-users.ts
      health.ts
    scripts/
      seed.ts
    types/
      auth.ts
      fastify.d.ts
      fastify-plugins.d.ts
    utils/
      crypto.ts
  drizzle.config.ts
  package.json
  tsconfig.json
  .env.example
```

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create environment file from example:

```bash
cp .env.example .env
```

3. Start API:

```bash
npm run dev
```

API default URL:

```txt
http://localhost:3000
```

## API Endpoints

Base prefix: `/api/v1`

Detailed endpoint definitions (request/response samples and Postman-ready examples) are maintained in [ROUTES.md](ROUTES.md).

Quick endpoint index:

- [GET /api/v1/health](ROUTES.md#1-health-check)
- [GET /api/v1/health/mail](ROUTES.md#11-mail-health-check)
- [POST /api/v1/auth/admin/login](ROUTES.md#2-admin-login)
- [POST /api/v1/auth/register](ROUTES.md#3-public-user-registration)
- [POST /api/v1/auth/change-password](ROUTES.md#4-change-password)
- [GET /api/v1/admin/roles](ROUTES.md#61-list-roles-super-admin)
- [POST /api/v1/admin/users](ROUTES.md#5-create-user-super-admin)
- [GET /api/v1/admin/users](ROUTES.md#6-list-users-super-admin)
- [POST /api/v1/admin/users/status](ROUTES.md#7-update-user-status-super-admin)
- [PATCH /api/v1/admin/users/:userId](ROUTES.md#8-edit-user-admin-or-super-admin) or [PUT /api/v1/admin/users/:userId](ROUTES.md#8-edit-user-admin-or-super-admin)

## Seed Data

Run seed data manually:

```bash
npm run seed
```

The seed includes:

- Super admin user from `.env` (`SUPER_ADMIN_EMAIL`, `SUPER_ADMIN_PASSWORD`)
- Initial `service_categories` data:
  - Household Chores
  - Personal Care
  - Mobility & Companionship
- Initial `services` entries under each category (from `temp/servicesList.txt`)

Notes:

- Service and category seeds are idempotent and safe to run multiple times.
- Startup also runs `seedInitialServices()` after table bootstrap.


## Security Notes

- Passwords are hashed with `bcryptjs`.
- JWT auth guards protected routes.
- Role authorization checks are applied at route pre-handler level.
- Ensure `JWT_SECRET` is strong in production.

## Next Expansion Suggestions

- Add refresh token flow
- Add account lockout and failed login tracking
- Add audit logs for admin operations
- Add endpoint-level permissions table in database
- Add OpenAPI/Swagger docs
