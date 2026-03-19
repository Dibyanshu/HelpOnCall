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

const EMPLOYMENT_TABLE_DDL = sql`
  CREATE TABLE IF NOT EXISTS employment (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    emp_id TEXT NOT NULL UNIQUE DEFAULT (
      lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))), 2) || '-' || substr('89ab', abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))), 2) || '-' || lower(hex(randomblob(6)))
    ),
    full_name TEXT NOT NULL,
    email_address TEXT NOT NULL,
    phone_number TEXT NOT NULL,
    specializations TEXT NOT NULL DEFAULT '[]',
    cover_letter TEXT,
    resume_file_name TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'approve', 'reject')),
    created_by TEXT NOT NULL DEFAULT '',
    created_at INTEGER NOT NULL DEFAULT 0,
    updated_at INTEGER NOT NULL DEFAULT 0
  )
`;

const TOTP_CHALLENGES_TABLE_DDL = sql`
  CREATE TABLE IF NOT EXISTS totp_challenges (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    challenge_id TEXT NOT NULL UNIQUE DEFAULT (
      lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))), 2) || '-' || substr('89ab', abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))), 2) || '-' || lower(hex(randomblob(6)))
    ),
    purpose TEXT NOT NULL,
    subject TEXT,
    secret_base32 TEXT NOT NULL,
    algorithm TEXT NOT NULL DEFAULT 'SHA1',
    digits INTEGER NOT NULL DEFAULT 6,
    period_seconds INTEGER NOT NULL DEFAULT 30,
    verified_at INTEGER,
    expires_at INTEGER NOT NULL,
    consumed_at INTEGER,
    created_by TEXT NOT NULL DEFAULT '',
    created_at INTEGER NOT NULL DEFAULT 0,
    updated_at INTEGER NOT NULL DEFAULT 0
  )
`;

const TOTP_CHALLENGES_PURPOSE_INDEX_DDL = sql`
  CREATE INDEX IF NOT EXISTS idx_totp_challenges_purpose ON totp_challenges(purpose)
`;

const TOTP_CHALLENGES_EXPIRES_AT_INDEX_DDL = sql`
  CREATE INDEX IF NOT EXISTS idx_totp_challenges_expires_at ON totp_challenges(expires_at)
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

async function migrateEmploymentToAddIdAndAuditColumns(): Promise<void> {
  const tableMeta = await db.get<{ sql: string | null }>(
    sql`SELECT sql FROM sqlite_master WHERE type = 'table' AND name = 'employment'`
  );

  const currentSql = (tableMeta?.sql ?? "").toLowerCase();

  if (!currentSql) {
    return;
  }

  const hasId = currentSql.includes("id integer primary key autoincrement");
  const hasCreatedBy = currentSql.includes("created_by");
  const hasCreatedAt = currentSql.includes("created_at");
  const hasUpdatedAt = currentSql.includes("updated_at");

  if (hasId && hasCreatedBy && hasCreatedAt && hasUpdatedAt) {
    return;
  }

  await db.run(sql`BEGIN`);

  try {
    await db.run(sql`
      CREATE TABLE employment_new (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        emp_id TEXT NOT NULL UNIQUE DEFAULT (
          lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))), 2) || '-' || substr('89ab', abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))), 2) || '-' || lower(hex(randomblob(6)))
        ),
        full_name TEXT NOT NULL,
        email_address TEXT NOT NULL,
        phone_number TEXT NOT NULL,
        specializations TEXT NOT NULL DEFAULT '[]',
        cover_letter TEXT,
        resume_file_name TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'approve', 'reject')),
        created_by TEXT NOT NULL DEFAULT '',
        created_at INTEGER NOT NULL DEFAULT 0,
        updated_at INTEGER NOT NULL DEFAULT 0
      )
    `);

    await db.run(sql`
      INSERT INTO employment_new (
        emp_id,
        full_name,
        email_address,
        phone_number,
        specializations,
        cover_letter,
        resume_file_name,
        status,
        created_by,
        created_at,
        updated_at
      )
      SELECT
        emp_id,
        full_name,
        email_address,
        phone_number,
        specializations,
        cover_letter,
        resume_file_name,
        status,
        '',
        0,
        0
      FROM employment
    `);

    await db.run(sql`DROP TABLE employment`);
    await db.run(sql`ALTER TABLE employment_new RENAME TO employment`);
    await db.run(sql`COMMIT`);
  } catch (error) {
    await db.run(sql`ROLLBACK`);
    throw error;
  }
}

export async function ensureTables(): Promise<void> {
  await db.run(USERS_TABLE_DDL);
  await db.run(SERVICE_CATEGORIES_TABLE_DDL);
  await db.run(SERVICES_TABLE_DDL);
  await db.run(EMPLOYMENT_TABLE_DDL);
  await db.run(TOTP_CHALLENGES_TABLE_DDL);
  await db.run(SERVICES_CATEGORY_ID_INDEX_DDL);
  await db.run(TOTP_CHALLENGES_PURPOSE_INDEX_DDL);
  await db.run(TOTP_CHALLENGES_EXPIRES_AT_INDEX_DDL);
  await migrateUsersRoleConstraintForAdmin();
  await migrateUsersAddCreatedByColumn();
  await migrateServiceCategoriesAddStandardColumns();
  await migrateServicesAddStandardColumns();
  await migrateEmploymentToAddIdAndAuditColumns();
}
