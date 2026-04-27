import "dotenv/config";
import { z } from "zod";

const optionalUrlFromEnv = z.preprocess((value) => {
  if (typeof value === "string" && value.trim() === "") {
    return undefined;
  }

  return value;
}, z.string().url().optional());

const optionalNonEmptyStringFromEnv = z.preprocess((value) => {
  if (typeof value === "string" && value.trim() === "") {
    return undefined;
  }

  return value;
}, z.string().min(1).optional());

const envBoolean = z.preprocess((value) => {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();

    if (["true", "1", "yes", "on"].includes(normalized)) {
      return true;
    }

    if (["false", "0", "no", "off", ""].includes(normalized)) {
      return false;
    }
  }

  return value;
}, z.boolean());

const envSchema = z.object({
  APP_ENV: z.enum(["development", "staging", "production"]).default("development"),
  DB_PROVIDER: z.enum(["turso", "cloudways"]).default("turso"),
  PORT: z.coerce.number().default(3000),
  HOST: z.string().default("0.0.0.0"),
  JWT_SECRET: z.string().min(16),
  SQLITE_DB_PATH: z.string().default("./db/database.sqlite"),
  TURSO_DATABASE_URL: optionalUrlFromEnv,
  TURSO_AUTH_TOKEN: optionalNonEmptyStringFromEnv,
  DB_HOST: optionalNonEmptyStringFromEnv,
  DB_PORT: z.preprocess((value) => {
    if (value === undefined || value === null || value === "") {
      return undefined;
    }

    return Number(value);
  }, z.number().int().positive().optional()),
  DB_NAME: optionalNonEmptyStringFromEnv,
  DB_USER: optionalNonEmptyStringFromEnv,
  DB_PASSWORD: optionalNonEmptyStringFromEnv,
  DB_SSL: envBoolean.default(false),
  // CloudWays managed MySQL — required only when APP_ENV=production
  MYSQL_HOST: optionalNonEmptyStringFromEnv,
  MYSQL_PORT: z.coerce.number().int().positive().default(3306),
  MYSQL_USER: optionalNonEmptyStringFromEnv,
  MYSQL_PASSWORD: optionalNonEmptyStringFromEnv,
  MYSQL_DATABASE: optionalNonEmptyStringFromEnv,
  SUPER_ADMIN_EMAIL: z.string().email().default("superadmin@helponcall.local"),
  SUPER_ADMIN_PASSWORD: z.string().min(8).default("ChangeMe123!"),
  MAIL_ENABLED: envBoolean.default(false),
  SMTP_HOST: z.string().default("smtp.gmail.com"),
  SMTP_PORT: z.coerce.number().int().positive().default(587),
  SMTP_SECURE: envBoolean.default(false),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  MAIL_FROM: z.string().optional(),
  MAIL_REPLY_TO: z.string().optional(),
  SMTP_CONNECTION_TIMEOUT_MS: z.coerce.number().int().positive().default(10000),
  SMTP_GREETING_TIMEOUT_MS: z.coerce.number().int().positive().default(10000),
  CORS_ALLOWED_ORIGINS: optionalNonEmptyStringFromEnv,
  EMPLOYMENT_RESUME_UPLOAD_DIR: z.string().default("./uploads/resumes"),
  EMPLOYMENT_RESUME_MAX_FILE_SIZE_MB: z.coerce.number().int().positive().default(10)
}).superRefine((data, ctx) => {

  // --- STAGING and TURSO checks ---
  const usesTursoInStaging = data.APP_ENV === "staging";
  const usesTursoInProduction = data.APP_ENV === "production" && data.DB_PROVIDER === "turso";
  const usesCloudwaysDbInProduction = data.APP_ENV === "production" && data.DB_PROVIDER === "cloudways";

  if (usesTursoInStaging || usesTursoInProduction) {
    if (!data.TURSO_DATABASE_URL) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["TURSO_DATABASE_URL"],
        message: "TURSO_DATABASE_URL is required for staging and production when DB_PROVIDER=turso"
      });
    }

    if (!data.TURSO_AUTH_TOKEN) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["TURSO_AUTH_TOKEN"],
        message: "TURSO_AUTH_TOKEN is required when APP_ENV is staging or production with DB_PROVIDER=turso"
      });
    }
  }

  // --- PRODUCTION checks ---
  if (data.APP_ENV === "production") {
    if (!data.MYSQL_HOST) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["MYSQL_HOST"],
        message: "MYSQL_HOST is required when APP_ENV is production"
      });
    }

    if (!data.MYSQL_USER) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["MYSQL_USER"],
        message: "MYSQL_USER is required when APP_ENV is production"
      });
    }

    if (!data.MYSQL_PASSWORD) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["MYSQL_PASSWORD"],
        message: "MYSQL_PASSWORD is required when APP_ENV is production"
      });
    }

    if (!data.MYSQL_DATABASE) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["MYSQL_DATABASE"],
        message: "MYSQL_DATABASE is required when APP_ENV is production"
      });
    }
  }

  // --- CLOUDWAYS DB checks for production ---
  if (usesCloudwaysDbInProduction) {
    if (!data.MYSQL_HOST) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["MYSQL_HOST"],
        message: "MYSQL_HOST is required when APP_ENV=production and DB_PROVIDER=cloudways"
      });
    }

    if (!data.MYSQL_PORT) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["MYSQL_PORT"],
        message: "MYSQL_PORT is required when APP_ENV=production and DB_PROVIDER=cloudways"
      });
    }

    if (!data.MYSQL_DATABASE) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["MYSQL_DATABASE"],
        message: "MYSQL_DATABASE is required when APP_ENV=production and DB_PROVIDER=cloudways"
      });
    }

    if (!data.MYSQL_USER) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["MYSQL_USER"],
        message: "MYSQL_USER is required when APP_ENV=production and DB_PROVIDER=cloudways"
      });
    }

    if (!data.MYSQL_PASSWORD) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["MYSQL_PASSWORD"],
        message: "MYSQL_PASSWORD is required when APP_ENV=production and DB_PROVIDER=cloudways"
      });
    }
  }

  // --- MAIL checks ---
  if (!data.MAIL_ENABLED) {
    return;
  }

  if (!data.SMTP_USER) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["SMTP_USER"],
      message: "SMTP_USER is required when MAIL_ENABLED=true"
    });
  }

  if (!data.SMTP_PASS) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["SMTP_PASS"],
      message: "SMTP_PASS is required when MAIL_ENABLED=true"
    });
  }

  if (!data.MAIL_FROM) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["MAIL_FROM"],
      message: "MAIL_FROM is required when MAIL_ENABLED=true"
    });
  }
});

export const env = envSchema.parse(process.env);
