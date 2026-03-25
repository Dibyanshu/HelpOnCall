import { desc, eq } from "drizzle-orm";
import type { FastifyPluginAsync } from "fastify";
import { z } from "zod";
import { buildAuditCreateFields, buildAuditUpdateFields } from "../db/audit.js";
import { db } from "../db/index.js";
import { emailValidator } from "../db/schema.js";
import type { Role } from "../types/auth.js";

const MODULE_VALUES = ["employee", "user_registration", "rfq"] as const;

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
      const auditCreateFields = buildAuditCreateFields(request.authUser?.email || "");

      const inserted = await db
        .insert(emailValidator)
        .values({
          email,
          data,
          module,
          createdAt: auditCreateFields.createdAt,
          updatedAt: auditCreateFields.updatedAt
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
