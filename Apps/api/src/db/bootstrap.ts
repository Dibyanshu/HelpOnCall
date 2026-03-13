import { sql } from "drizzle-orm";
import { db } from "./index.js";

const USERS_TABLE_DDL = sql`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('content_publisher', 'resume_reviewer', 'job_poster', 'admin', 'super_admin')),
    created_by TEXT NOT NULL DEFAULT '',
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  )
`;

async function migrateUsersRoleConstraintForAdmin(): Promise<void> {
  const tableMeta = await db.get<{ sql: string | null }>(
    sql`SELECT sql FROM sqlite_master WHERE type = 'table' AND name = 'users'`
  );

  const currentSql = tableMeta?.sql ?? "";

  if (!currentSql || currentSql.includes("'admin'")) {
    return;
  }

  await db.run(sql`BEGIN`);

  try {
    await db.run(sql`
      CREATE TABLE users_new (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT NOT NULL CHECK (role IN ('content_publisher', 'resume_reviewer', 'job_poster', 'admin', 'super_admin')),
        created_by TEXT NOT NULL DEFAULT '',
        is_active INTEGER NOT NULL DEFAULT 1,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      )
    `);

    await db.run(sql`
      INSERT INTO users_new (id, email, name, password_hash, role, created_by, is_active, created_at, updated_at)
      SELECT id, email, name, password_hash, role, '', is_active, created_at, updated_at
      FROM users
    `);

    await db.run(sql`DROP TABLE users`);
    await db.run(sql`ALTER TABLE users_new RENAME TO users`);
    await db.run(sql`COMMIT`);
  } catch (error) {
    await db.run(sql`ROLLBACK`);
    throw error;
  }
}

async function migrateUsersAddCreatedByColumn(): Promise<void> {
  const columns = await db.all<{ name: string }>(sql`PRAGMA table_info(users)`);
  const hasCreatedBy = columns.some((column) => column.name === "created_by");

  if (hasCreatedBy) {
    return;
  }

  await db.run(sql`ALTER TABLE users ADD COLUMN created_by TEXT NOT NULL DEFAULT ''`);
}

export async function ensureTables(): Promise<void> {
  await db.run(USERS_TABLE_DDL);
  await migrateUsersRoleConstraintForAdmin();
  await migrateUsersAddCreatedByColumn();
}
