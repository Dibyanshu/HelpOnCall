#!/usr/bin/env tsx
/**
 * export-turso-to-mysql.ts
 *
 * One-time helper: exports all rows from Turso (libsql/SQLite) and generates
 * MySQL-compatible INSERT statements that can be piped into a MySQL client.
 *
 * Usage:
 *   TURSO_DATABASE_URL=libsql://... TURSO_AUTH_TOKEN=... \
 *   tsx scripts/export-turso-to-mysql.ts > /tmp/turso-export.sql
 *
 *   Then apply to MySQL:
 *   mysql -h <host> -u <user> -p <database> < /tmp/turso-export.sql
 *
 * Notes:
 * - Timestamps are stored in Turso/SQLite as Unix seconds (integer).
 *   This script converts them to MySQL DATETIME strings (UTC).
 * - The users, employment, email_validator, and rfqs tables are exported
 *   with INSERT IGNORE so re-running is safe.
 * - Run mysql-migrate-seed.sql first to create the tables.
 * - The super admin user is included in the export.  If a super admin already
 *   exists in MySQL (seeded at server startup), INSERT IGNORE will skip it.
 */

import { createClient } from "@libsql/client";

const TURSO_DATABASE_URL = process.env.TURSO_DATABASE_URL;
const TURSO_AUTH_TOKEN = process.env.TURSO_AUTH_TOKEN;

if (!TURSO_DATABASE_URL || !TURSO_AUTH_TOKEN) {
  console.error("Error: TURSO_DATABASE_URL and TURSO_AUTH_TOKEN must be set.");
  process.exit(1);
}

const client = createClient({
  url: TURSO_DATABASE_URL,
  authToken: TURSO_AUTH_TOKEN
});

/** Convert a raw SQLite timestamp value to a MySQL DATETIME string (UTC).
 *  Turso stores mode:"timestamp" columns as Unix seconds (integer).
 *  Returns 'NULL' for falsy values.
 */
function toMySqlDatetime(raw: unknown): string {
  if (raw === null || raw === undefined || raw === 0) {
    return "NULL";
  }
  const secs = typeof raw === "bigint" ? Number(raw) : Number(raw);
  if (!Number.isFinite(secs) || secs === 0) {
    return "NULL";
  }
  const d = new Date(secs * 1000);
  // Format: 'YYYY-MM-DD HH:MM:SS'
  const pad = (n: number) => String(n).padStart(2, "0");
  const str =
    `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())} ` +
    `${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}:${pad(d.getUTCSeconds())}`;
  return `'${str}'`;
}

/** Escape a string value for MySQL single-quoted literals. */
function esc(value: unknown): string {
  if (value === null || value === undefined) {
    return "NULL";
  }
  const str = String(value);
  return "'" + str.replace(/\\/g, "\\\\").replace(/'/g, "\\'").replace(/\n/g, "\\n").replace(/\r/g, "\\r") + "'";
}

/** Escape a boolean/integer-boolean column. */
function escBool(value: unknown): string {
  if (value === null || value === undefined) return "NULL";
  return value ? "1" : "0";
}

async function exportUsers(): Promise<void> {
  const result = await client.execute("SELECT * FROM users ORDER BY id");
  if (result.rows.length === 0) {
    console.log("-- [users] no rows to export");
    return;
  }

  console.log(`-- [users] ${result.rows.length} row(s)`);
  console.log("INSERT IGNORE INTO `users`");
  console.log("  (`id`,`personal_email`,`full_name`,`gender`,`date_of_birth`,`date_of_joining`,");
  console.log("   `staff_id`,`password_hash`,`role`,`created_by`,`is_active`,`created_at`,`updated_at`)");
  console.log("VALUES");

  const lines: string[] = [];
  for (const row of result.rows) {
    lines.push(
      `  (${row.id},${esc(row.personal_email)},${esc(row.full_name)},` +
        `${esc(row.gender)},${toMySqlDatetime(row.date_of_birth)},${toMySqlDatetime(row.date_of_joining)},` +
        `${esc(row.staff_id)},${esc(row.password_hash)},${esc(row.role)},` +
        `${esc(row.created_by)},${escBool(row.is_active)},` +
        `${toMySqlDatetime(row.created_at)},${toMySqlDatetime(row.updated_at)})`
    );
  }
  console.log(lines.join(",\n") + ";");
  console.log();
}

async function exportServiceCategories(): Promise<void> {
  const result = await client.execute("SELECT * FROM service_categories ORDER BY id");
  if (result.rows.length === 0) {
    console.log("-- [service_categories] no rows to export");
    return;
  }

  console.log(`-- [service_categories] ${result.rows.length} row(s)`);
  console.log("INSERT IGNORE INTO `service_categories`");
  console.log("  (`id`,`title`,`display_order`,`created_by`,`created_at`,`updated_at`)");
  console.log("VALUES");

  const lines: string[] = [];
  for (const row of result.rows) {
    lines.push(
      `  (${row.id},${esc(row.title)},${row.display_order ?? 0},` +
        `${esc(row.created_by)},${toMySqlDatetime(row.created_at)},${toMySqlDatetime(row.updated_at)})`
    );
  }
  console.log(lines.join(",\n") + ";");
  console.log();
}

async function exportServices(): Promise<void> {
  const result = await client.execute("SELECT * FROM services ORDER BY id");
  if (result.rows.length === 0) {
    console.log("-- [services] no rows to export");
    return;
  }

  console.log(`-- [services] ${result.rows.length} row(s)`);
  console.log("INSERT IGNORE INTO `services`");
  console.log("  (`id`,`category_id`,`label`,`description`,`image_url`,`icon_name`,");
  console.log("   `display_order`,`created_by`,`created_at`,`updated_at`)");
  console.log("VALUES");

  const lines: string[] = [];
  for (const row of result.rows) {
    lines.push(
      `  (${row.id},${row.category_id},${esc(row.label)},${esc(row.description)},` +
        `${esc(row.image_url)},${esc(row.icon_name)},${row.display_order ?? 0},` +
        `${esc(row.created_by)},${toMySqlDatetime(row.created_at)},${toMySqlDatetime(row.updated_at)})`
    );
  }
  console.log(lines.join(",\n") + ";");
  console.log();
}

async function exportEmployment(): Promise<void> {
  const result = await client.execute("SELECT * FROM employment ORDER BY id");
  if (result.rows.length === 0) {
    console.log("-- [employment] no rows to export");
    return;
  }

  console.log(`-- [employment] ${result.rows.length} row(s)`);
  console.log("INSERT IGNORE INTO `employment`");
  console.log("  (`id`,`emp_id`,`full_name`,`email_address`,`phone_number`,`specializations`,");
  console.log("   `cover_letter`,`resume_file_name`,`status`,`created_by`,`created_at`,`updated_at`)");
  console.log("VALUES");

  const lines: string[] = [];
  for (const row of result.rows) {
    lines.push(
      `  (${row.id},${esc(row.emp_id)},${esc(row.full_name)},${esc(row.email_address)},` +
        `${esc(row.phone_number)},${esc(row.specializations)},${esc(row.cover_letter)},` +
        `${esc(row.resume_file_name)},${esc(row.status)},${esc(row.created_by)},` +
        `${toMySqlDatetime(row.created_at)},${toMySqlDatetime(row.updated_at)})`
    );
  }
  console.log(lines.join(",\n") + ";");
  console.log();
}

async function exportCustomerTestimonials(): Promise<void> {
  const result = await client.execute("SELECT * FROM customer_testimonials ORDER BY id");
  if (result.rows.length === 0) {
    console.log("-- [customer_testimonials] no rows to export");
    return;
  }

  console.log(`-- [customer_testimonials] ${result.rows.length} row(s)`);
  console.log("INSERT IGNORE INTO `customer_testimonials`");
  console.log("  (`id`,`customer_name`,`customer_email`,`message`,`rating`,`profile_pic`,");
  console.log("   `status`,`created_by`,`created_at`,`updated_at`)");
  console.log("VALUES");

  const lines: string[] = [];
  for (const row of result.rows) {
    lines.push(
      `  (${row.id},${esc(row.customer_name)},${esc(row.customer_email)},` +
        `${esc(row.message)},${row.rating},${esc(row.profile_pic)},` +
        `${esc(row.status)},${esc(row.created_by)},` +
        `${toMySqlDatetime(row.created_at)},${toMySqlDatetime(row.updated_at)})`
    );
  }
  console.log(lines.join(",\n") + ";");
  console.log();
}

async function exportEmailTemplates(): Promise<void> {
  const result = await client.execute("SELECT * FROM email_templates ORDER BY id");
  if (result.rows.length === 0) {
    console.log("-- [email_templates] no rows to export");
    return;
  }

  console.log(`-- [email_templates] ${result.rows.length} row(s)`);
  console.log("INSERT INTO `email_templates`");
  console.log("  (`id`,`template_key`,`module`,`channel`,`subject_template`,`text_template`,");
  console.log("   `html_template`,`variables_schema`,`description`,`is_active`,`version`,");
  console.log("   `created_by`,`created_at`,`updated_at`)");
  console.log("VALUES");

  const lines: string[] = [];
  for (const row of result.rows) {
    lines.push(
      `  (${row.id},${esc(row.template_key)},${esc(row.module)},${esc(row.channel)},` +
        `${esc(row.subject_template)},${esc(row.text_template)},${esc(row.html_template)},` +
        `${esc(row.variables_schema)},${esc(row.description)},` +
        `${escBool(row.is_active)},${row.version ?? 1},` +
        `${esc(row.created_by)},${toMySqlDatetime(row.created_at)},${toMySqlDatetime(row.updated_at)})`
    );
  }
  console.log(lines.join(",\n"));
  console.log("ON DUPLICATE KEY UPDATE");
  console.log("  `subject_template` = VALUES(`subject_template`),");
  console.log("  `text_template`    = VALUES(`text_template`),");
  console.log("  `html_template`    = VALUES(`html_template`),");
  console.log("  `variables_schema` = VALUES(`variables_schema`),");
  console.log("  `updated_at`       = NOW();");
  console.log();
}

async function exportEmailValidator(): Promise<void> {
  const result = await client.execute("SELECT * FROM email_validator ORDER BY id");
  if (result.rows.length === 0) {
    console.log("-- [email_validator] no rows to export (transient data, typically empty)");
    return;
  }

  console.log(`-- [email_validator] ${result.rows.length} row(s)`);
  console.log("INSERT IGNORE INTO `email_validator`");
  console.log("  (`id`,`email`,`data`,`code`,`module`,`created_by`,`created_at`,`updated_at`)");
  console.log("VALUES");

  const lines: string[] = [];
  for (const row of result.rows) {
    lines.push(
      `  (${row.id},${esc(row.email)},${esc(row.data)},${esc(row.code)},` +
        `${esc(row.module)},${esc(row.created_by)},` +
        `${toMySqlDatetime(row.created_at)},${toMySqlDatetime(row.updated_at)})`
    );
  }
  console.log(lines.join(",\n") + ";");
  console.log();
}

async function exportRfqs(): Promise<void> {
  const result = await client.execute("SELECT * FROM rfqs ORDER BY id");
  if (result.rows.length === 0) {
    console.log("-- [rfqs] no rows to export");
    return;
  }

  console.log(`-- [rfqs] ${result.rows.length} row(s)`);
  console.log("INSERT IGNORE INTO `rfqs`");
  console.log("  (`id`,`rfq_id`,`email`,`full_name`,`phone`,`address`,`preferred_contact`,");
  console.log("   `service_selected`,`start_date`,`duration_val`,`duration_type`,`self_care`,");
  console.log("   `recipient_name`,`recipient_relation`,`status`,`created_by`,`created_at`,`updated_at`)");
  console.log("VALUES");

  const lines: string[] = [];
  for (const row of result.rows) {
    lines.push(
      `  (${row.id},${esc(row.rfq_id)},${esc(row.email)},${esc(row.full_name)},` +
        `${esc(row.phone)},${esc(row.address)},${esc(row.preferred_contact)},` +
        `${esc(row.service_selected)},${toMySqlDatetime(row.start_date)},` +
        `${row.duration_val},${esc(row.duration_type)},${escBool(row.self_care)},` +
        `${esc(row.recipient_name)},${esc(row.recipient_relation)},${esc(row.status)},` +
        `${esc(row.created_by)},${toMySqlDatetime(row.created_at)},${toMySqlDatetime(row.updated_at)})`
    );
  }
  console.log(lines.join(",\n") + ";");
  console.log();
}

async function main() {
  console.log("-- =============================================================");
  console.log("-- HelpOnCall — Turso → MySQL data export");
  console.log(`-- Generated: ${new Date().toISOString()}`);
  console.log("-- Source:    " + TURSO_DATABASE_URL);
  console.log("-- =============================================================");
  console.log();
  console.log("SET NAMES utf8mb4;");
  console.log("SET time_zone = '+00:00';");
  console.log("SET FOREIGN_KEY_CHECKS = 0;");
  console.log();

  // Export tables in dependency order (parent tables before child tables)
  await exportUsers();
  await exportServiceCategories();
  await exportServices();
  await exportEmployment();
  await exportCustomerTestimonials();
  await exportEmailTemplates();
  await exportEmailValidator();
  await exportRfqs();

  console.log("SET FOREIGN_KEY_CHECKS = 1;");
  console.log();
  console.log("-- Export complete.");

  await client.close();
}

main().catch((err) => {
  console.error("Export failed:", err);
  process.exit(1);
});
