import { sql } from "drizzle-orm";
import { db } from "./index.js";

function supportsRunMethod(): boolean {
  const candidate = db as unknown as { run?: unknown };
  return typeof candidate.run === "function";
}

function supportsSqliteIntrospection(): boolean {
  const candidate = db as unknown as { get?: unknown; all?: unknown };
  return typeof candidate.get === "function" && typeof candidate.all === "function";
}

function buildUsersTableDdl(tableName = "users") {
  return sql.raw(`
    CREATE TABLE IF NOT EXISTS ${tableName} (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      personal_email TEXT NOT NULL UNIQUE,
      full_name TEXT NOT NULL,
      gender TEXT,
      date_of_birth INTEGER,
      date_of_joining INTEGER,
      staff_id TEXT UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL CHECK (role IN ('content_publisher', 'resume_reviewer', 'job_poster', 'admin', 'super_admin')),
      created_by TEXT NOT NULL DEFAULT '',
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    )
  `);
}

const USERS_TABLE_DDL = buildUsersTableDdl();

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

const CUSTOMER_TESTIMONIALS_TABLE_DDL = sql`
  CREATE TABLE IF NOT EXISTS customer_testimonials (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    message TEXT NOT NULL,
    rating REAL NOT NULL,
    profile_pic TEXT,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_by TEXT NOT NULL DEFAULT '',
    created_at INTEGER NOT NULL DEFAULT 0,
    updated_at INTEGER NOT NULL DEFAULT 0
  )
`;

const EMAIL_TEMPLATES_TABLE_DDL = sql`
  CREATE TABLE IF NOT EXISTS email_templates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    template_key TEXT NOT NULL UNIQUE,
    module TEXT NOT NULL CHECK (module IN ('employee', 'user_registration', 'rfq', 'system')),
    channel TEXT NOT NULL DEFAULT 'email',
    subject_template TEXT NOT NULL,
    text_template TEXT NOT NULL,
    html_template TEXT,
    variables_schema TEXT,
    description TEXT,
    is_active INTEGER NOT NULL DEFAULT 1,
    version INTEGER NOT NULL DEFAULT 1,
    created_by TEXT NOT NULL DEFAULT '',
    created_at INTEGER NOT NULL DEFAULT 0,
    updated_at INTEGER NOT NULL DEFAULT 0
  )
`;

const EMAIL_VALIDATOR_TABLE_DDL = sql`
  CREATE TABLE IF NOT EXISTS email_validator (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL,
    data TEXT NOT NULL,
    code TEXT NOT NULL UNIQUE DEFAULT (
      lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))), 2) || '-' || substr('89ab', abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))), 2) || '-' || lower(hex(randomblob(6)))
    ),
    module TEXT NOT NULL CHECK (module IN ('employee', 'user_registration', 'rfq')),
    created_by TEXT NOT NULL DEFAULT '',
    created_at INTEGER NOT NULL DEFAULT 0,
    updated_at INTEGER NOT NULL DEFAULT 0
  )
`;

const RFQS_TABLE_DDL = sql`
  CREATE TABLE IF NOT EXISTS rfqs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    rfq_id TEXT NOT NULL UNIQUE DEFAULT (
      lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))), 2) || '-' || substr('89ab', abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))), 2) || '-' || lower(hex(randomblob(6)))
    ),
    email TEXT NOT NULL,
    full_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    address TEXT NOT NULL,
    preferred_contact TEXT NOT NULL CHECK (preferred_contact IN ('email', 'phone', 'any')),
    service_selected TEXT NOT NULL CHECK (json_valid(service_selected) AND json_type(service_selected) = 'array'),
    start_date INTEGER NOT NULL, -- Timestamp
    duration_val INTEGER NOT NULL,
    duration_type TEXT NOT NULL CHECK (duration_type IN ('Day', 'Week', 'Month')),
    self_care INTEGER NOT NULL DEFAULT 0, -- Boolean
    recipient_name TEXT NOT NULL,
    recipient_relation TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'approve', 'reject')),
    created_by TEXT NOT NULL DEFAULT '',
    created_at INTEGER NOT NULL DEFAULT 0,
    updated_at INTEGER NOT NULL DEFAULT 0
  )
`;


async function migrateUsersTableToCanonicalShape(): Promise<void> {
  const columns = await db.all<{ name: string }>(sql`PRAGMA table_info(users)`);
  const columnNames = new Set(columns.map((column) => column.name));
  const expectedColumns = [
    "id",
    "personal_email",
    "full_name",
    "gender",
    "date_of_birth",
    "date_of_joining",
    "staff_id",
    "password_hash",
    "role",
    "created_by",
    "is_active",
    "created_at",
    "updated_at"
  ];

  if (expectedColumns.every((column) => columnNames.has(column)) && columns.length === expectedColumns.length) {
    return;
  }

  const personalEmailExpr = columnNames.has("personal_email")
    ? "personal_email"
    : columnNames.has("email")
      ? "email"
      : null;
  const fullNameExpr = columnNames.has("full_name")
    ? "full_name"
    : columnNames.has("name")
      ? "name"
      : null;

  if (!personalEmailExpr || !fullNameExpr || !columnNames.has("password_hash") || !columnNames.has("role")) {
    await db.run(sql`DROP TABLE users`);
    await db.run(USERS_TABLE_DDL);
    return;
  }

  const genderExpr = columnNames.has("gender") ? "gender" : "NULL";
  const dateOfBirthExpr = columnNames.has("date_of_birth") ? "date_of_birth" : "NULL";
  const dateOfJoiningExpr = columnNames.has("date_of_joining") ? "date_of_joining" : "NULL";
  const staffIdExpr = columnNames.has("staff_id") ? "staff_id" : "NULL";
  const createdByExpr = columnNames.has("created_by") ? "COALESCE(created_by, '')" : "''";
  const isActiveExpr = columnNames.has("is_active") ? "COALESCE(is_active, 1)" : "1";
  const createdAtExpr = columnNames.has("created_at") ? "created_at" : "strftime('%s', 'now')";
  const updatedAtExpr = columnNames.has("updated_at") ? "updated_at" : "strftime('%s', 'now')";

  await db.run(sql`BEGIN`);

  try {
    await db.run(sql`DROP TABLE IF EXISTS users_new`);
    await db.run(buildUsersTableDdl("users_new"));
    await db.run(
      sql.raw(`
        INSERT INTO users_new (
          id,
          personal_email,
          full_name,
          gender,
          date_of_birth,
          date_of_joining,
          staff_id,
          password_hash,
          role,
          created_by,
          is_active,
          created_at,
          updated_at
        )
        SELECT
          id,
          ${personalEmailExpr},
          ${fullNameExpr},
          ${genderExpr},
          ${dateOfBirthExpr},
          ${dateOfJoiningExpr},
          ${staffIdExpr},
          password_hash,
          role,
          ${createdByExpr},
          ${isActiveExpr},
          ${createdAtExpr},
          ${updatedAtExpr}
        FROM users
      `)
    );
    await db.run(sql`DROP TABLE users`);
    await db.run(sql`ALTER TABLE users_new RENAME TO users`);
    await db.run(sql`COMMIT`);
  } catch (error) {
    await db.run(sql`ROLLBACK`);
    throw error;
  }
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

async function migrateEmailValidatorAddCreatedByColumn(): Promise<void> {
  const columns = await db.all<{ name: string }>(sql`PRAGMA table_info(email_validator)`);
  const hasCreatedBy = columns.some((column) => column.name === "created_by");

  if (hasCreatedBy) {
    return;
  }

  await db.run(sql`ALTER TABLE email_validator ADD COLUMN created_by TEXT NOT NULL DEFAULT ''`);
}

export async function ensureTables(): Promise<void> {
  // MySQL driver does not expose a .run() method; tables are managed externally
  // via scripts/mysql-migrate-seed.sql. Skip all DDL when using MySQL.
  if (!supportsRunMethod()) {
    console.log("MySQL driver detected: skipping DDL — tables managed via scripts/mysql-migrate-seed.sql");
    return;
  }

  await db.run(USERS_TABLE_DDL);
  await db.run(SERVICE_CATEGORIES_TABLE_DDL);
  await db.run(SERVICES_TABLE_DDL);
  await db.run(EMPLOYMENT_TABLE_DDL);
  await db.run(SERVICES_CATEGORY_ID_INDEX_DDL);
  await db.run(CUSTOMER_TESTIMONIALS_TABLE_DDL);
  await db.run(EMAIL_VALIDATOR_TABLE_DDL);
  await db.run(EMAIL_TEMPLATES_TABLE_DDL);
  await db.run(RFQS_TABLE_DDL);

  // These migration helpers depend on better-sqlite3 specific db.get/db.all APIs.
  // Turso/libsql uses a different driver shape, so skip introspection-based migrations there.
  if (!supportsSqliteIntrospection()) {
    return;
  }

  await migrateUsersTableToCanonicalShape();
  await migrateServiceCategoriesAddStandardColumns();
  await migrateServicesAddStandardColumns();
  await migrateEmploymentToAddIdAndAuditColumns();
  await migrateEmailValidatorAddCreatedByColumn();
}
