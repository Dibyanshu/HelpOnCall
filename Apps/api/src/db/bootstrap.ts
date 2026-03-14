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

const SERVICE_CATEGORIES_TABLE_DDL = sql`
  CREATE TABLE IF NOT EXISTS service_categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    display_order INTEGER DEFAULT 0,
    created_by TEXT NOT NULL DEFAULT '',
    created_at INTEGER NOT NULL DEFAULT 0,
    updated_at INTEGER NOT NULL DEFAULT 0
  )
`;

const SERVICES_TABLE_DDL = sql`
  CREATE TABLE IF NOT EXISTS services (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category_id INTEGER NOT NULL,
    label TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    icon_name TEXT,
    display_order INTEGER DEFAULT 0,
    created_by TEXT NOT NULL DEFAULT '',
    created_at INTEGER NOT NULL DEFAULT 0,
    updated_at INTEGER NOT NULL DEFAULT 0,
    FOREIGN KEY (category_id) REFERENCES service_categories(id) ON DELETE CASCADE
  )
`;

const SERVICES_CATEGORY_ID_INDEX_DDL = sql`
  CREATE INDEX IF NOT EXISTS idx_services_category_id ON services(category_id)
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

async function migrateServiceCategoriesAddStandardColumns(): Promise<void> {
  const columns = await db.all<{ name: string }>(sql`PRAGMA table_info(service_categories)`);
  const hasCreatedBy = columns.some((column) => column.name === "created_by");
  const hasCreatedAt = columns.some((column) => column.name === "created_at");
  const hasUpdatedAt = columns.some((column) => column.name === "updated_at");

  if (!hasCreatedBy) {
    await db.run(sql`ALTER TABLE service_categories ADD COLUMN created_by TEXT NOT NULL DEFAULT ''`);
  }

  if (!hasCreatedAt) {
    await db.run(sql`ALTER TABLE service_categories ADD COLUMN created_at INTEGER NOT NULL DEFAULT 0`);
  }

  if (!hasUpdatedAt) {
    await db.run(sql`ALTER TABLE service_categories ADD COLUMN updated_at INTEGER NOT NULL DEFAULT 0`);
  }
}

async function migrateServicesAddStandardColumns(): Promise<void> {
  const columns = await db.all<{ name: string }>(sql`PRAGMA table_info(services)`);
  const hasCreatedBy = columns.some((column) => column.name === "created_by");
  const hasCreatedAt = columns.some((column) => column.name === "created_at");
  const hasUpdatedAt = columns.some((column) => column.name === "updated_at");

  if (!hasCreatedBy) {
    await db.run(sql`ALTER TABLE services ADD COLUMN created_by TEXT NOT NULL DEFAULT ''`);
  }

  if (!hasCreatedAt) {
    await db.run(sql`ALTER TABLE services ADD COLUMN created_at INTEGER NOT NULL DEFAULT 0`);
  }

  if (!hasUpdatedAt) {
    await db.run(sql`ALTER TABLE services ADD COLUMN updated_at INTEGER NOT NULL DEFAULT 0`);
  }
}

export async function ensureTables(): Promise<void> {
  await db.run(USERS_TABLE_DDL);
  await db.run(SERVICE_CATEGORIES_TABLE_DDL);
  await db.run(SERVICES_TABLE_DDL);
  await db.run(SERVICES_CATEGORY_ID_INDEX_DDL);
  await migrateUsersRoleConstraintForAdmin();
  await migrateUsersAddCreatedByColumn();
  await migrateServiceCategoriesAddStandardColumns();
  await migrateServicesAddStandardColumns();
}
