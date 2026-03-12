import { and, eq } from "drizzle-orm";
import type { FastifyPluginAsync } from "fastify";
import { z } from "zod";
import { db } from "../db/index.js";
import { users } from "../db/schema.js";
import { hashPassword, verifyPassword } from "../utils/crypto.js";

const loginBodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(8),
  newPassword: z.string().min(8)
});

const authRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.post("/auth/admin/login", async (request, reply) => {
    const bodyParse = loginBodySchema.safeParse(request.body);

    if (!bodyParse.success) {
      return reply.code(400).send({
        message: "Invalid request body",
        errors: bodyParse.error.flatten()
      });
    }

    const { email, password } = bodyParse.data;

    const found = await db.select().from(users).where(eq(users.email, email)).limit(1);
    console.log("Login attempt for email:", email, "Found user:", found.length > 0);
    const user = found[0];

    if (!user || !user.isActive) {
      return reply.code(401).send({ message: "Invalid credentials" });
    }

    const passwordValid = await verifyPassword(password, user.passwordHash);

    if (!passwordValid) {
      return reply.code(401).send({ message: "Invalid credentials" });
    }

    const token = await reply.jwtSign({
      userId: user.id,
      email: user.email,
      role: user.role
    });

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    };
  });

  fastify.post(
    "/auth/change-password",
    { preHandler: [fastify.authenticate] },
    async (request, reply) => {
      const bodyParse = changePasswordSchema.safeParse(request.body);

      if (!bodyParse.success) {
        return reply.code(400).send({
          message: "Invalid request body",
          errors: bodyParse.error.flatten()
        });
      }

      const authUser = request.authUser;

      if (!authUser) {
        return reply.code(401).send({ message: "Unauthorized" });
      }

      const found = await db
        .select()
        .from(users)
        .where(and(eq(users.id, authUser.userId), eq(users.isActive, true)))
        .limit(1);

      const user = found[0];

      if (!user) {
        return reply.code(404).send({ message: "User not found" });
      }

      const currentPasswordValid = await verifyPassword(
        bodyParse.data.currentPassword,
        user.passwordHash
      );

      if (!currentPasswordValid) {
        return reply.code(400).send({ message: "Current password is incorrect" });
      }

      const newPasswordHash = await hashPassword(bodyParse.data.newPassword);

      await db
        .update(users)
        .set({
          passwordHash: newPasswordHash,
          updatedAt: new Date()
        })
        .where(eq(users.id, user.id));

      return { message: "Password updated successfully" };
    }
  );
};

export default authRoutes;
