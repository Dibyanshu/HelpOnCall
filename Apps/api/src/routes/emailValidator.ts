import { and, desc, eq } from "drizzle-orm";
import type { FastifyPluginAsync } from "fastify";
import { z } from "zod";
import { buildAuditCreateFields, buildAuditUpdateFields } from "../db/audit.js";
import { db } from "../db/index.js";
import { emailValidator, employment } from "../db/schema.js";
import type { Role } from "../types/auth.js";
import { sendTemplatedEmail } from "../utils/email-template/email-template.service.js";
import { TEMPLATE_KEYS } from "../utils/email-template/template-registry.js";

const MODULE_VALUES = ["employee", "user_registration", "rfq"] as const;
const VERIFICATION_CODE_TTL_MS = 1 * 60 * 1000;

function serializePayloadData(data: unknown): string {
  if (typeof data === "string") {
    return data;
  }

  return JSON.stringify(data);
}

function deserializePayloadData(data: string): unknown {
  try {
    return JSON.parse(data);
  } catch {
    return data;
  }
}

const moduleLabelMap: Record<(typeof MODULE_VALUES)[number], string> = {
  employee: "Employment",
  user_registration: "User Registration",
  rfq: "Request for Quote"
};

function buildVerificationEmailFallback(input: { module: (typeof MODULE_VALUES)[number]; code: string }) {
  const moduleLabel = moduleLabelMap[input.module];
  const subject = `HelpOnCall ${moduleLabel} email verification code`;
  const text = [
    `Your HelpOnCall verification code is: ${input.code}`,
    "",
    "This code expires in 15 minutes.",
    "If you did not request this, you can ignore this email."
  ].join("\n");

  const html = `
    <p>Your HelpOnCall verification code is:</p>
    <p style="font-size: 22px; font-weight: 700; letter-spacing: 1px;">${input.code}</p>
    <p>This code expires in 15 minutes.</p>
    <p>If you did not request this, you can ignore this email.</p>
  `;

  return { subject, text, html };
}

const createPublicVerificationSchema = z.object({
  email: z.string().email(),
  module: z.enum(MODULE_VALUES),
  data: z.unknown()
});

const verifyPublicCodeSchema = z.object({
  email: z.string().email(),
  module: z.enum(MODULE_VALUES),
  code: z.string().trim().min(1)
});

const createValidatorSchema = z.object({
  email: z.string().email(),
  data: z.string(),
  module: z.enum(MODULE_VALUES)
});

const updateValidatorSchema = z.object({
  email: z.string().email().optional(),
  data: z.string().optional(),
  module: z.enum(MODULE_VALUES).optional()
}).refine(
  (data) => data.email !== undefined || data.data !== undefined || data.module !== undefined,
  { message: "At least one editable field is required" }
);

const idParamSchema = z.object({
  id: z.coerce.number().int().positive()
});

const emailValidatorRoutes: FastifyPluginAsync = async (fastify) => {
  // Public: request an email verification code
  fastify.post("/email-validator/request-code", async (request, reply) => {
    const bodyParse = createPublicVerificationSchema.safeParse(request.body);

    if (!bodyParse.success) {
      return reply.code(400).send({
        message: "Invalid request body",
        errors: bodyParse.error.flatten()
      });
    }

    const { email, module, data } = bodyParse.data;

    if (module === "employee") {
      const employmentMatch = await db
        .select({ id: employment.id })
        .from(employment)
        .where(eq(employment.emailAddress, email))
        .limit(1);

      if (employmentMatch.length > 0) {
        return reply.code(400).send({
          message: "Employment application already exists for this email"
        });
      }
    }

    // Keep only the latest verification request per email+module.
    await db
      .delete(emailValidator)
      .where(and(eq(emailValidator.email, email), eq(emailValidator.module, module)));

    const auditCreateFields = buildAuditCreateFields("public_email_verification");

    const inserted = await db
      .insert(emailValidator)
      .values({
        email,
        module,
        data: serializePayloadData(data),
        ...auditCreateFields
      })
      .returning({
        code: emailValidator.code
      });

    const verificationCode = inserted[0]?.code;

    if (!verificationCode) {
      return reply.code(500).send({ message: "Unable to generate verification code" });
    }

    try {
      await sendTemplatedEmail(
        {
          to: email,
          templateKey: TEMPLATE_KEYS.EMAIL_VERIFICATION_CODE,
          data: { code: verificationCode, moduleLabel: moduleLabelMap[module] },
          fallback: () => buildVerificationEmailFallback({ module, code: verificationCode }),
          strict: false
        },
        fastify.mail,
        fastify.log
      );
    } catch (error) {
      fastify.log.error({ error, email, module }, "Failed to send verification code email");
      return reply.code(500).send({ message: "Failed to send verification code" });
    }

    return reply.code(201).send({
      message: "Verification code sent successfully",
      data: {
        email,
        module,
        expiresInSeconds: VERIFICATION_CODE_TTL_MS / 1000
      }
    });
  });

  // Public: verify email verification code
  fastify.post("/email-validator/verify-code", async (request, reply) => {
    const bodyParse = verifyPublicCodeSchema.safeParse(request.body);

    if (!bodyParse.success) {
      return reply.code(400).send({
        message: "Invalid request body",
        errors: bodyParse.error.flatten()
      });
    }

    const { email, module, code } = bodyParse.data;

    const found = await db
      .select()
      .from(emailValidator)
      .where(
        and(
          eq(emailValidator.email, email),
          eq(emailValidator.module, module),
          eq(emailValidator.code, code)
        )
      )
      .limit(1);

    const record = found[0];

    if (!record) {
      return reply.code(400).send({ message: "Invalid verification code" });
    }

    const now = Date.now();
    const createdAtMs = new Date(record.createdAt).getTime();

    if (Number.isNaN(createdAtMs) || now - createdAtMs > VERIFICATION_CODE_TTL_MS) {
      await db.delete(emailValidator).where(eq(emailValidator.id, record.id));
      return reply.code(400).send({ message: "Verification code has expired" });
    }

    await db.delete(emailValidator).where(eq(emailValidator.id, record.id));

    return reply.send({
      message: "Email verified successfully",
      data: {
        email: record.email,
        module: record.module,
        verified: true,
        payload: deserializePayloadData(record.data)
      }
    });
  });

  // GET all validators
  fastify.get(
    "/admin/email-validators",
    {
      preHandler: [
        fastify.authenticate,
        fastify.authorize(["super_admin" as Role, "admin" as Role])
      ]
    },
    async (request) => {
      const list = await db
        .select()
        .from(emailValidator)
        .orderBy(desc(emailValidator.createdAt));

      return { data: list };
    }
  );

  // POST create new validator
  fastify.post(
    "/admin/email-validator",
    {
      preHandler: [
        fastify.authenticate,
        fastify.authorize(["super_admin" as Role, "admin" as Role])
      ]
    },
    async (request, reply) => {
      const bodyParse = createValidatorSchema.safeParse(request.body);

      if (!bodyParse.success) {
        return reply.code(400).send({
          message: "Invalid request body",
          errors: bodyParse.error.flatten()
        });
      }

      const { email, data, module } = bodyParse.data;
      const auditCreateFields = buildAuditCreateFields(request.authUser?.role ?? "");

      const inserted = await db
        .insert(emailValidator)
        .values({
          email,
          data,
          module,
          ...auditCreateFields
        })
        .returning();

      return reply.code(201).send({
        message: "Email validator created successfully",
        data: inserted[0]
      });
    }
  );

  // PATCH update validator
  fastify.patch(
    "/admin/email-validator/:id",
    {
      preHandler: [
        fastify.authenticate,
        fastify.authorize(["super_admin" as Role, "admin" as Role])
      ]
    },
    async (request, reply) => {
      const paramsParse = idParamSchema.safeParse(request.params);
      if (!paramsParse.success) {
        return reply.code(400).send({ message: "Invalid ID", errors: paramsParse.error.flatten() });
      }

      const bodyParse = updateValidatorSchema.safeParse(request.body);
      if (!bodyParse.success) {
        return reply.code(400).send({ message: "Invalid request body", errors: bodyParse.error.flatten() });
      }

      const { id } = paramsParse.data;
      const auditUpdateFields = buildAuditUpdateFields();

      const updated = await db
        .update(emailValidator)
        .set({
          ...bodyParse.data,
          updatedAt: auditUpdateFields.updatedAt
        })
        .where(eq(emailValidator.id, id))
        .returning();

      if (updated.length === 0) {
        return reply.code(404).send({ message: "Validator not found" });
      }

      return reply.send({
        message: "Email validator updated successfully",
        data: updated[0]
      });
    }
  );

  // DELETE validator
  fastify.delete(
    "/admin/email-validator/:id",
    {
      preHandler: [
        fastify.authenticate,
        fastify.authorize(["super_admin" as Role, "admin" as Role])
      ]
    },
    async (request, reply) => {
      const paramsParse = idParamSchema.safeParse(request.params);
      if (!paramsParse.success) {
        return reply.code(400).send({ message: "Invalid ID", errors: paramsParse.error.flatten() });
      }

      const { id } = paramsParse.data;

      const deleted = await db
        .delete(emailValidator)
        .where(eq(emailValidator.id, id))
        .returning();

      if (deleted.length === 0) {
        return reply.code(404).send({ message: "Validator not found" });
      }

      return reply.send({
        message: "Email validator deleted successfully",
        data: deleted[0]
      });
    }
  );
};

export default emailValidatorRoutes;
