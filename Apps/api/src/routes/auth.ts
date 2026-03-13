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

const PUBLIC_REGISTRATION_ROLE_VALUES = [
  "content_publisher",
  "resume_reviewer",
  "job_poster"
] as const;

const publicRegistrationSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2),
  password: z.string().min(8),
  role: z.enum(PUBLIC_REGISTRATION_ROLE_VALUES).optional().default("content_publisher")
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(8),
  newPassword: z.string().min(8)
});

function buildRegistrationEmail(name: string) {
  const subject = "HelpOnCall registration received";
  const text = [
    `Hi ${name},`,
    "",
    "Your registration has been received successfully.",
    "An administrator will review and activate your account soon.",
    "",
    "Thanks,",
    "HelpOnCall Team"
  ].join("\n");

  const html = `
    <p>Hi ${name},</p>
    <p>Your registration has been received successfully.</p>
    <p>An administrator will review and activate your account soon.</p>
    <p>Thanks,<br/>HelpOnCall Team</p>
  `;

  return { subject, text, html };
}

const authRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.post("/auth/register", async (request, reply) => {
    const bodyParse = publicRegistrationSchema.safeParse(request.body);

    if (!bodyParse.success) {
      return reply.code(400).send({
        message: "Invalid request body",
        errors: bodyParse.error.flatten()
      });
    }

    const { email, name, password, role } = bodyParse.data;

    const exists = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);

    if (exists.length > 0) {
      return reply.code(409).send({ message: "User with this email already exists" });
    }

    const now = new Date();
    const passwordHash = await hashPassword(password);

    const inserted = await db
      .insert(users)
      .values({
        email,
        name,
        passwordHash,
        role,
        createdBy: "self_registration",
        isActive: false,
        createdAt: now,
        updatedAt: now
      })
      .returning({
        id: users.id,
        email: users.email,
        name: users.name,
        role: users.role,
        isActive: users.isActive,
        createdAt: users.createdAt
      });

    const emailContent = buildRegistrationEmail(name);

    void fastify.mail
      .send({
        to: email,
        subject: emailContent.subject,
        text: emailContent.text,
        html: emailContent.html
      })
      .catch((error) => {
        fastify.log.error({ error, email }, "Failed to send registration acknowledgment email");
      });

    return reply.code(201).send({
      message: "Registration submitted successfully. Your account will be activated by an admin.",
      user: inserted[0]
    });
  });

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
