import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { env } from "../config/env.js";

const sqliteDbPath = resolve(env.SQLITE_DB_PATH);
mkdirSync(dirname(sqliteDbPath), { recursive: true });

const sqlite = new Database(sqliteDbPath);
sqlite.pragma("journal_mode = WAL");

export const db = drizzle(sqlite);
export { sqlite };
