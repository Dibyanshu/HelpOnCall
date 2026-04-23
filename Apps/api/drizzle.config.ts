import "dotenv/config";
import { defineConfig } from "drizzle-kit";

const appEnv = process.env.APP_ENV ?? "development";

export default appEnv === "production"
  ? defineConfig({
      schema: "./src/db/schema.mysql.ts",
      out: "./drizzle/mysql",
      dialect: "mysql2",
      dbCredentials: {
        host: process.env.MYSQL_HOST!,
        port: Number(process.env.MYSQL_PORT ?? 3306),
        user: process.env.MYSQL_USER!,
        password: process.env.MYSQL_PASSWORD!,
        database: process.env.MYSQL_DATABASE!
      },
      verbose: true,
      strict: true
    })
  : defineConfig({
      schema: "./src/db/schema.ts",
      out: "./drizzle",
      dialect: "sqlite",
      dbCredentials: {
        url:
          process.env.TURSO_DATABASE_URL ??
          process.env.SQLITE_DB_PATH ??
          "./db/database.sqlite"
      },
      verbose: true,
      strict: true
    });
const dbUrl = process.env.TURSO_DATABASE_URL ?? process.env.SQLITE_DB_PATH ?? "./db/database.sqlite";
const tursoAuthToken = process.env.TURSO_AUTH_TOKEN;
