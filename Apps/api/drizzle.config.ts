import "dotenv/config";
import { defineConfig } from "drizzle-kit";

const dbUrl = process.env.TURSO_DATABASE_URL ?? process.env.SQLITE_DB_PATH ?? "./db/database.sqlite";
const tursoAuthToken = process.env.TURSO_AUTH_TOKEN;

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "sqlite",
  dbCredentials: {
    url: dbUrl,
    authToken: dbUrl.startsWith("libsql://") ? tursoAuthToken : undefined
  },
  verbose: true,
  strict: true
});
