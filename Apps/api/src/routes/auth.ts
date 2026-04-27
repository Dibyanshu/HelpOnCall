import { and, eq } from "drizzle-orm";
import type { FastifyPluginAsync } from "fastify";
import { z } from "zod";
import { buildAuditCreateFields, buildAuditUpdateFields } from "../db/audit.js";
import { db } from "../db/index.js";
import * as mysqlSchema from "../db/schema.mysql.js";
import * as sqliteSchema from "../db/schema.js";
const isProd = process.env.APP_ENV === "production";
const { users } = isProd ? mysqlSchema : sqliteSchema;
import { hashPassword, verifyPassword } from "../utils/crypto.js";
import { buildRegistrationEmail } from "../utils/email-template/email-builders.js";
import { sendTemplatedEmail } from "../utils/email-template/email-template.service.js";
import { TEMPLATE_KEYS } from "../utils/email-template/template-registry.js";

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

    const exists = await db.select({ id: users.id }).from(users).where(eq(users.personalEmail, email)).limit(1);

    if (exists.length > 0) {
      return reply.code(409).send({ message: "User with this email already exists" });
    }

    const auditCreateFields = buildAuditCreateFields("self_registration");
    const passwordHash = await hashPassword(password);

    const inserted = await db
      .insert(users)
      .values({
        personalEmail: email,
        fullName: name,
        passwordHash,
        role,
        ...auditCreateFields,
        isActive: false,
      })
      .returning({
        id: users.id,
        personalEmail: users.personalEmail,
        fullName: users.fullName,
        email: users.personalEmail,
        name: users.fullName,
        role: users.role,
        isActive: users.isActive,
        createdAt: users.createdAt
      });

    void sendTemplatedEmail(
      {
        to: email,
        templateKey: TEMPLATE_KEYS.USER_REGISTRATION_ACK,
        data: { name },
        fallback: () => buildRegistrationEmail(name),
        strict: false
      },
      fastify.mail,
      fastify.log
    ).catch((error) => {
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

    const found = await db.select().from(users).where(eq(users.personalEmail, email)).limit(1);
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
      email: user.personalEmail,
      role: user.role
    });

    return {
      token,
      user: {
        id: user.id,
        email: user.personalEmail,
        name: user.fullName,
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
      const auditUpdateFields = buildAuditUpdateFields();

      await db
        .update(users)
        .set({
          passwordHash: newPasswordHash,
          ...auditUpdateFields
        })
        .where(eq(users.id, user.id));

      return { message: "Password updated successfully" };
    }
  );
};

export default authRoutes;
