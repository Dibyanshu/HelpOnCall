# HELP-ON-CALL Api details

## Node.js Fastify API with Drizzle ORM and SQLite

## Overview

This project is a lightweight backend application built with a **modern TypeScript-first stack**:

* **Node.js** for the runtime
* **Fastify** for a high-performance web framework
* **Drizzle ORM** for a type-safe, code-first database layer
* **SQLite** as a simple, file-based relational database

The architecture is designed for:

* Internal enterprise tools
* Lightweight SaaS prototypes
* Microservices
* Local-first applications
* Rapid backend development

The stack prioritizes **performance, simplicity, and developer experience** while maintaining a clear upgrade path to larger databases such as PostgreSQL.

---

# Technology Stack

| Layer      | Technology     | Purpose                         |
| ---------- | -------------- | ------------------------------- |
| Runtime    | Node.js        | JavaScript runtime              |
| Framework  | Fastify        | High-performance HTTP server    |
| ORM        | Drizzle ORM    | Type-safe SQL query builder     |
| Database   | SQLite         | Lightweight embedded database   |
| Language   | TypeScript     | Type safety and maintainability |
| Validation | Zod (optional) | Schema validation               |
| Migrations | Drizzle Kit    | Database schema migrations      |

---

# Project Structure

```
project-root
│
├── src
│   ├── db
│   │   ├── schema.ts
│   │   └── index.ts
│   │
│   ├── routes
│   │   └── userRoutes.ts
│   │
│   ├── server.ts
│   └── app.ts
│
├── drizzle.config.ts
├── package.json
└── README.md
```

---

# Prerequisites

Ensure the following are installed:

* Node.js >= 18
* npm or yarn
* Git

---

# Installation

Clone the repository

```bash
git clone https://github.com/your-org/fastify-drizzle-sqlite-app.git
cd fastify-drizzle-sqlite-app
```

Install dependencies

```bash
npm install
```

---

# Running the Application

Start the development server

```bash
npm run dev
```

The API will start at

```
http://localhost:3000
```

---

# Database Configuration

This project uses **SQLite** for simplicity and local persistence.

Database file:

```
/db/database.sqlite
```

Connection example:

```ts
import Database from "better-sqlite3"
import { drizzle } from "drizzle-orm/better-sqlite3"

const sqlite = new Database("database.sqlite")
export const db = drizzle(sqlite)
```

---

# Defining Schema (Code-First)

Example schema using **Drizzle ORM**:

```ts
import { sqliteTable, integer, text } from "drizzle-orm/sqlite-core"

export const users = sqliteTable("users", {
  id: integer("id").primaryKey(),
  name: text("name"),
  email: text("email").unique()
})
```

---

# Running Migrations

Generate migration files

```bash
npx drizzle-kit generate
```

Run migrations

```bash
npx drizzle-kit push
```

---

# Example API Route

Example Fastify route:

```ts
fastify.get("/users", async () => {
  return await db.select().from(users)
})
```

---

# Hosting Considerations

SQLite is a **file-based database**, which introduces some hosting considerations.

### Recommended Hosting Platforms

* Railway
* Render
* Fly.io
* DigitalOcean
* Docker containers
* Self-hosted servers

### Platforms with Limitations

Serverless platforms with **ephemeral storage** may reset the database:

* Vercel
* Netlify
* AWS Lambda

For these platforms consider:

* Turso (Distributed SQLite)
* PostgreSQL
* Managed database services

---

# Scaling Strategy

The stack is designed to scale gradually:

Initial Stage

```
Node.js + Fastify + Drizzle + SQLite
```

Production Scale

```
Node.js + Fastify + Drizzle + PostgreSQL
```

Drizzle ORM allows **minimal code changes when switching databases**.

---

# Benefits of This Stack

* Extremely fast API performance
* Minimal infrastructure requirements
* Type-safe SQL queries
* Easy local development
* Small deployment footprint
* Clear migration path to enterprise databases

---

# Future Enhancements

Possible improvements for the project:

* Authentication (JWT / OAuth)
* Role-based access control
* API documentation with Swagger
* Logging with Pino
* Docker containerization
* CI/CD pipeline
* Postgres support

---

# License

MIT License

---

# Contributors

Maintained by the development team.
