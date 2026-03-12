import { eq } from "drizzle-orm";
import { env } from "../config/env.js";
import { hashPassword } from "../utils/crypto.js";
import { db } from "./index.js";
import { users } from "./schema.js";

export async function seedSuperAdmin(): Promise<void> {
  const existing = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, env.SUPER_ADMIN_EMAIL))
    .limit(1);

  if (existing.length > 0) {
    return;
  }

  const now = new Date();
  const passwordHash = await hashPassword(env.SUPER_ADMIN_PASSWORD);

  await db.insert(users).values({
    email: env.SUPER_ADMIN_EMAIL,
    name: "Super Admin",
    passwordHash,
    role: "super_admin",
    isActive: true,
    createdAt: now,
    updatedAt: now
  });

  console.log(`Seeded super admin: ${env.SUPER_ADMIN_EMAIL}`);
}
