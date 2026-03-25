import "dotenv/config";
import { defineConfig } from "drizzle-kit";

const dbUrl = process.env.TURSO_DATABASE_URL ?? process.env.SQLITE_DB_PATH ?? "./db/database.sqlite";

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "sqlite",
  dbCredentials: {
    url: dbUrl
  },
  verbose: true,
  strict: true
});
