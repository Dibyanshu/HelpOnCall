import "dotenv/config";
import { z } from "zod";

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
  PORT: z.coerce.number().default(3000),
  HOST: z.string().default("0.0.0.0"),
  JWT_SECRET: z.string().min(16),
  SQLITE_DB_PATH: z.string().default("./db/database.sqlite"),
  TURSO_DATABASE_URL: z.string().url().optional(),
  TURSO_AUTH_TOKEN: z.string().min(1).optional(),
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
  EMPLOYMENT_RESUME_UPLOAD_DIR: z.string().default("./uploads/resumes"),
  EMPLOYMENT_RESUME_MAX_FILE_SIZE_MB: z.coerce.number().int().positive().default(10)
}).superRefine((data, ctx) => {
  const usesTurso = data.APP_ENV === "staging" || data.APP_ENV === "production";

  if (usesTurso) {
    if (!data.TURSO_DATABASE_URL) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["TURSO_DATABASE_URL"],
        message: "TURSO_DATABASE_URL is required when APP_ENV is staging or production"
      });
    }

    if (!data.TURSO_AUTH_TOKEN) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["TURSO_AUTH_TOKEN"],
        message: "TURSO_AUTH_TOKEN is required when APP_ENV is staging or production"
      });
    }
  }

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
