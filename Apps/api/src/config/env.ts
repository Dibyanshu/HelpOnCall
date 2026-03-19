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
  PORT: z.coerce.number().default(3000),
  HOST: z.string().default("0.0.0.0"),
  JWT_SECRET: z.string().min(16),
  SQLITE_DB_PATH: z.string().default("./db/database.sqlite"),
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
  EMPLOYMENT_RESUME_MAX_FILE_SIZE_MB: z.coerce.number().int().positive().default(10),
  TOTP_ISSUER: z.string().min(1).default("HelpOnCall"),
  TOTP_PERIOD_SECONDS: z.coerce.number().int().positive().default(30),
  TOTP_DIGITS: z.coerce
    .number()
    .int()
    .refine((value) => value === 6 || value === 8, "TOTP_DIGITS must be 6 or 8")
    .default(6),
  TOTP_CHALLENGE_TTL_SECONDS: z.coerce.number().int().positive().default(600),
  TOTP_VALIDATION_WINDOW: z.coerce.number().int().min(0).max(3).default(1)
}).superRefine((data, ctx) => {
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
