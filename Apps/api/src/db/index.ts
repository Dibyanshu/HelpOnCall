import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import type { drizzle as drizzleBetterSqlite } from "drizzle-orm/better-sqlite3";
import { env } from "../config/env.js";

const usesTurso = env.DB_PROVIDER === "turso";
const usesCloudwaysDb = env.DB_PROVIDER === "cloudways";
type BetterSqliteDb = ReturnType<typeof drizzleBetterSqlite>;

let dbInstance: BetterSqliteDb;
let sqliteInstance: any | undefined;

if (usesCloudwaysDb) {
  const { createPool } = await import("mysql2/promise");
  const { drizzle } = await import("drizzle-orm/mysql2");

  const pool = createPool({
    host: env.MYSQL_HOST!,
    port: env.MYSQL_PORT,
    user: env.MYSQL_USER!,
    password: env.MYSQL_PASSWORD!,
    database: env.MYSQL_DATABASE!,
    waitForConnections: true,
    connectionLimit: 10
  });

  dbInstance = drizzle(pool) as unknown as BetterSqliteDb;
  console.log("Connected to CloudWays MySQL (production)");
} else if (usesTurso) {
  const { createClient } = await import("@libsql/client");
  const { drizzle } = await import("drizzle-orm/libsql");

  const client = createClient({
    url: env.TURSO_DATABASE_URL!,
    authToken: env.TURSO_AUTH_TOKEN!
  });

  dbInstance = drizzle(client) as unknown as BetterSqliteDb;
  console.log(`Connected to Turso Edge SQLite (DB_PROVIDER=turso)`);
} else {
  const Database = (await import("better-sqlite3")).default;
  const { drizzle } = await import("drizzle-orm/better-sqlite3");

  const sqliteDbPath = resolve(env.SQLITE_DB_PATH);
  mkdirSync(dirname(sqliteDbPath), { recursive: true });

  sqliteInstance = new Database(sqliteDbPath);
  sqliteInstance.pragma("journal_mode = WAL");

  dbInstance = drizzle(sqliteInstance);
  console.log("Connected to local better-sqlite3");
}

export const db = dbInstance;
export const sqlite = sqliteInstance;
