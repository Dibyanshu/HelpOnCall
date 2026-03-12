import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  PORT: z.coerce.number().default(3000),
  HOST: z.string().default("0.0.0.0"),
  JWT_SECRET: z.string().min(16),
  SQLITE_DB_PATH: z.string().default("./db/database.sqlite"),
  SUPER_ADMIN_EMAIL: z.string().email().default("superadmin@helponcall.local"),
  SUPER_ADMIN_PASSWORD: z.string().min(8).default("ChangeMe123!")
});

export const env = envSchema.parse(process.env);
