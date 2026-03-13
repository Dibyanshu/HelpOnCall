# HelpOnCall API

Node.js + Fastify + Drizzle ORM + SQLite API with a code-first user management module for admin operations.

## Implemented Features

- Admin login with JWT
- Change password (authenticated)
- Create users (Super Admin only)
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
```

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
