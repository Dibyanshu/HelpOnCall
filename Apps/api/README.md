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

## Environment Variables

```env
PORT=3000
HOST=0.0.0.0
JWT_SECRET=change-this-to-a-long-random-secret
SQLITE_DB_PATH=./db/database.sqlite
SUPER_ADMIN_EMAIL=superadmin@helponcall.local
SUPER_ADMIN_PASSWORD=ChangeMe123!
MAIL_ENABLED=false
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=
SMTP_PASS=
MAIL_FROM=
MAIL_REPLY_TO=
SMTP_CONNECTION_TIMEOUT_MS=10000
SMTP_GREETING_TIMEOUT_MS=10000
```

For Gmail, use a Google App Password (not your normal account password) in `SMTP_PASS`.

## How to configure on Cloudways

1. Open your Cloudways app and add these environment variables in the app settings:
  - `MAIL_ENABLED=true`
  - `SMTP_HOST=smtp.gmail.com`
  - `SMTP_PORT=587`
  - `SMTP_SECURE=false`
  - `SMTP_USER=<your-gmail-or-workspace-email>`
  - `SMTP_PASS=<google-app-password>`
  - `MAIL_FROM=HelpOnCall <same-sender-email-as-SMTP_USER-or-verified-alias>`
  - `MAIL_REPLY_TO=<support-email>`
  - `SMTP_CONNECTION_TIMEOUT_MS=10000`
  - `SMTP_GREETING_TIMEOUT_MS=10000`
2. Redeploy or restart the app after saving variables.
3. Confirm Cloudways allows outbound SMTP on your chosen port.
4. Send a test registration request to verify end-to-end email delivery.

## Notes

- Gmail SMTP requires a Google App Password with 2FA enabled. Standard account passwords will fail.
- Keep `MAIL_FROM` aligned with the authenticated sender identity to reduce spam/reject risk.
- For production deliverability, configure SPF, DKIM, and DMARC records for your sending domain.
- Gmail sending limits are restrictive for higher volume traffic; switch to a transactional provider (for example SES, SendGrid, Mailgun) when volume grows.
- Registration flow is non-blocking for email delivery: user creation still succeeds even if SMTP send fails.

## Database: Code-First Approach

- Schema is defined in `src/db/schema.ts`.
- Table creation is guaranteed at boot using `src/db/bootstrap.ts`.
- Super Admin seed is executed at startup (`src/db/seed.ts`) if not already present.
- Drizzle migration tooling is configured in `drizzle.config.ts`.

Commands:

```bash
npm run db:generate
npm run db:push
npm run seed
```

## Roles and Permissions

The role model is implemented in `src/types/auth.ts`.

- `content_publisher` -> `content:publish`
- `resume_reviewer` -> `resume:review`
- `job_poster` -> `job:post`
- `admin` -> `admin:user:read`
- `super_admin` -> `*` (all permissions)

## API Endpoints

Base prefix: `/api/v1`

### 0) Mail Health Check

`GET /api/v1/health/mail`

Response (SMTP reachable):

```json
{
  "status": "ok",
  "smtp": "reachable",
  "latencyMs": 123
}
```

Response (SMTP unreachable):

```json
{
  "status": "error",
  "smtp": "unreachable",
  "latencyMs": 1250
}
```

Response (`MAIL_ENABLED=false`):

```json
{
  "status": "mail_disabled"
}
```

### 1) Admin Login

`POST /api/v1/auth/admin/login`

Request:

```json
{
  "email": "superadmin@helponcall.local",
  "password": "ChangeMe123!"
}
```

Response:

```json
{
  "token": "<jwt>",
  "user": {
    "id": 1,
    "email": "superadmin@helponcall.local",
    "name": "Super Admin",
    "role": "super_admin"
  }
}
```

### 2) Change Password

`POST /api/v1/auth/change-password`

Headers:

```txt
Authorization: Bearer <jwt>
```

Request:

```json
{
  "currentPassword": "ChangeMe123!",
  "newPassword": "NewStrongPassword123!"
}
```

Response:

```json
{
  "message": "Password updated successfully"
}
```

### 3) Create User (Super Admin)

`POST /api/v1/admin/users`

Headers:

```txt
Authorization: Bearer <jwt>
```

Request:

```json
{
  "email": "publisher@helponcall.local",
  "name": "Content Publisher User",
  "password": "UserPass123!",
  "role": "content_publisher",
  "isActive": true
}
```

Response:

```json
{
  "message": "User created successfully",
  "user": {
    "id": 2,
    "email": "publisher@helponcall.local",
    "name": "Content Publisher User",
    "role": "content_publisher",
    "isActive": true,
    "createdAt": "2026-03-12T10:00:00.000Z"
  }
}
```

### 4) List Users (Super Admin)

`GET /api/v1/admin/users`

Headers:

```txt
Authorization: Bearer <jwt>
```

Response:

```json
{
  "data": [
    {
      "id": 2,
      "email": "publisher@helponcall.local",
      "name": "Content Publisher User",
      "role": "content_publisher",
      "isActive": true,
      "createdAt": "2026-03-12T10:00:00.000Z",
      "updatedAt": "2026-03-12T10:00:00.000Z"
    }
  ]
}
```

### 5) List Roles (Super Admin)

`GET /api/v1/admin/roles`

Headers:

```txt
Authorization: Bearer <jwt>
```

Response:

```json
{
  "data": [
    {
      "value": "content_publisher",
      "label": "Content Publisher"
    },
    {
      "value": "admin",
      "label": "Admin"
    },
    {
      "value": "super_admin",
      "label": "Super Admin"
    }
  ]
}
```

### 6) Update User Status (Super Admin)

`POST /api/v1/admin/users/status`

Headers:

```txt
Authorization: Bearer <jwt>
```

Request:

```json
{
  "userId": 2,
  "isActive": false
}
```

Response:

```json
{
  "message": "User status updated successfully",
  "user": {
    "id": 2,
    "email": "publisher@helponcall.local",
    "name": "Content Publisher User",
    "role": "content_publisher",
    "createdBy": "super_admin",
    "isActive": false,
    "createdAt": "2026-03-12T10:00:00.000Z",
    "updatedAt": "2026-03-14T10:00:00.000Z"
  }
}
```

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
