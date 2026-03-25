import { and, asc, desc, eq, like, or } from "drizzle-orm";
import type { FastifyPluginAsync } from "fastify";
import { z } from "zod";
import { buildAuditCreateFields, buildAuditUpdateFields } from "../db/audit.js";
import { db } from "../db/index.js";
import { EMAIL_TEMPLATE_MODULE_VALUES, emailTemplates } from "../db/schema.js";
import { sendTemplatedEmail } from "../utils/email-template/email-template.service.js";
import { TEMPLATE_KEY_REGEX } from "../utils/email-template/template-registry.js";
import type { Role } from "../types/auth.js";

const createTemplateSchema = z.object({
  templateKey: z
    .string()
    .min(1)
    .regex(TEMPLATE_KEY_REGEX, "templateKey must be lowercase alphanumeric with underscores only"),
  module: z.enum(EMAIL_TEMPLATE_MODULE_VALUES),
  channel: z.string().default("email"),
  subjectTemplate: z.string().min(1),
  textTemplate: z.string().min(1),
  htmlTemplate: z.string().nullable().optional(),
  variablesSchema: z
    .string()
    .nullable()
    .optional()
    .refine(
      (value) => {
        if (!value) return true;
        try {
          JSON.parse(value);
          return true;
        } catch {
          return false;
        }
      },
      { message: "variablesSchema must be valid JSON" }
    ),
  description: z.string().nullable().optional(),
  isActive: z.boolean().optional().default(true),
});

const updateTemplateSchema = z
  .object({
    subjectTemplate: z.string().min(1).optional(),
    textTemplate: z.string().min(1).optional(),
    htmlTemplate: z.string().nullable().optional(),
    variablesSchema: z
      .string()
      .nullable()
      .optional()
      .refine(
        (value) => {
          if (!value) return true;
          try {
            JSON.parse(value);
            return true;
          } catch {
            return false;
          }
        },
        { message: "variablesSchema must be valid JSON" }
      ),
    description: z.string().nullable().optional(),
    isActive: z.boolean().optional(),
    module: z.enum(EMAIL_TEMPLATE_MODULE_VALUES).optional(),
    channel: z.string().optional(),
  })
  .refine(
    (data) =>
      data.subjectTemplate !== undefined ||
      data.textTemplate !== undefined ||
      data.htmlTemplate !== undefined ||
      data.variablesSchema !== undefined ||
      data.description !== undefined ||
      data.isActive !== undefined ||
      data.module !== undefined ||
      data.channel !== undefined,
    { message: "At least one editable field is required" }
  );

const idParamSchema = z.object({
  id: z.coerce.number().int().positive()
});

const listQuerySchema = z.object({
  module: z.enum(EMAIL_TEMPLATE_MODULE_VALUES).optional(),
  isActive: z
    .preprocess((v) => {
      if (v === "true") return true;
      if (v === "false") return false;
      return v;
    }, z.boolean())
    .optional(),
  search: z.string().optional()
});

const testSendSchema = z.object({
  to: z.string().email(),
  data: z.record(z.string(), z.string()).optional().default({})
});

const emailTemplateRoutes: FastifyPluginAsync = async (fastify) => {
  const superAdminOnly = [
    fastify.authenticate,
    fastify.authorize(["super_admin" as Role])
  ];

  // GET /admin/email-templates - list with optional filters
  fastify.get(
    "/admin/email-templates",
    { preHandler: superAdminOnly },
    async (request, reply) => {
      const queryParse = listQuerySchema.safeParse(request.query);

      if (!queryParse.success) {
        return reply.code(400).send({
          message: "Invalid query parameters",
          errors: queryParse.error.flatten()
        });
      }

      const { module, isActive, search } = queryParse.data;

      let query = db.select().from(emailTemplates).$dynamic();

      const conditions = [];

      if (module !== undefined) {
        conditions.push(eq(emailTemplates.module, module));
      }

      if (isActive !== undefined) {
        conditions.push(eq(emailTemplates.isActive, isActive));
      }

      if (search) {
        conditions.push(
          or(
            like(emailTemplates.templateKey, `%${search}%`),
            like(emailTemplates.description, `%${search}%`)
          )
        );
      }

      if (conditions.length > 0) {
        query = query.where(and(...conditions));
      }

      const list = await query.orderBy(asc(emailTemplates.templateKey));

      return { data: list };
    }
  );

  // GET /admin/email-templates/:id - fetch one
  fastify.get(
    "/admin/email-templates/:id",
    { preHandler: superAdminOnly },
    async (request, reply) => {
      const paramsParse = idParamSchema.safeParse(request.params);

      if (!paramsParse.success) {
        return reply.code(400).send({ message: "Invalid ID", errors: paramsParse.error.flatten() });
      }

      const found = await db
        .select()
        .from(emailTemplates)
        .where(eq(emailTemplates.id, paramsParse.data.id))
        .limit(1);

      if (found.length === 0) {
        return reply.code(404).send({ message: "Email template not found" });
      }

      return { data: found[0] };
    }
  );

  // POST /admin/email-templates - create
  fastify.post(
    "/admin/email-templates",
    { preHandler: superAdminOnly },
    async (request, reply) => {
      const bodyParse = createTemplateSchema.safeParse(request.body);

      if (!bodyParse.success) {
        return reply.code(400).send({
          message: "Invalid request body",
          errors: bodyParse.error.flatten()
        });
      }

      const existing = await db
        .select({ id: emailTemplates.id })
        .from(emailTemplates)
        .where(eq(emailTemplates.templateKey, bodyParse.data.templateKey))
        .limit(1);

      if (existing.length > 0) {
        return reply.code(409).send({ message: "A template with this key already exists" });
      }

      const auditCreateFields = buildAuditCreateFields(request.authUser?.role ?? "");

      const inserted = await db
        .insert(emailTemplates)
        .values({
          ...bodyParse.data,
          ...auditCreateFields
        })
        .returning();

      return reply.code(201).send({
        message: "Email template created successfully",
        data: inserted[0]
      });
    }
  );

  // PATCH /admin/email-templates/:id - update
  fastify.patch(
    "/admin/email-templates/:id",
    { preHandler: superAdminOnly },
    async (request, reply) => {
      const paramsParse = idParamSchema.safeParse(request.params);

      if (!paramsParse.success) {
        return reply.code(400).send({ message: "Invalid ID", errors: paramsParse.error.flatten() });
      }

      const bodyParse = updateTemplateSchema.safeParse(request.body);

      if (!bodyParse.success) {
        return reply.code(400).send({
          message: "Invalid request body",
          errors: bodyParse.error.flatten()
        });
      }

      const { id } = paramsParse.data;
      const auditUpdateFields = buildAuditUpdateFields();

      const existing = await db
        .select({ id: emailTemplates.id })
        .from(emailTemplates)
        .where(eq(emailTemplates.id, id))
        .limit(1);

      if (existing.length === 0) {
        return reply.code(404).send({ message: "Email template not found" });
      }

      const updated = await db
        .update(emailTemplates)
        .set({
          ...bodyParse.data,
          ...auditUpdateFields
        })
        .where(eq(emailTemplates.id, id))
        .returning();

      return reply.send({
        message: "Email template updated successfully",
        data: updated[0]
      });
    }
  );

  // DELETE /admin/email-templates/:id - soft delete (set isActive=false)
  fastify.delete(
    "/admin/email-templates/:id",
    { preHandler: superAdminOnly },
    async (request, reply) => {
      const paramsParse = idParamSchema.safeParse(request.params);

      if (!paramsParse.success) {
        return reply.code(400).send({ message: "Invalid ID", errors: paramsParse.error.flatten() });
      }

      const { id } = paramsParse.data;

      const existing = await db
        .select({ id: emailTemplates.id })
        .from(emailTemplates)
        .where(eq(emailTemplates.id, id))
        .limit(1);

      if (existing.length === 0) {
        return reply.code(404).send({ message: "Email template not found" });
      }

      const auditUpdateFields = buildAuditUpdateFields();

      const updated = await db
        .update(emailTemplates)
        .set({ isActive: false, ...auditUpdateFields })
        .where(eq(emailTemplates.id, id))
        .returning();

      return reply.send({
        message: "Email template deactivated successfully",
        data: updated[0]
      });
    }
  );

  // POST /admin/email-templates/:id/test-send - send test email
  fastify.post(
    "/admin/email-templates/:id/test-send",
    { preHandler: superAdminOnly },
    async (request, reply) => {
      const paramsParse = idParamSchema.safeParse(request.params);

      if (!paramsParse.success) {
        return reply.code(400).send({ message: "Invalid ID", errors: paramsParse.error.flatten() });
      }

      const bodyParse = testSendSchema.safeParse(request.body);

      if (!bodyParse.success) {
        return reply.code(400).send({
          message: "Invalid request body",
          errors: bodyParse.error.flatten()
        });
      }

      const found = await db
        .select()
        .from(emailTemplates)
        .where(eq(emailTemplates.id, paramsParse.data.id))
        .limit(1);

      if (found.length === 0) {
        return reply.code(404).send({ message: "Email template not found" });
      }

      const template = found[0];

      try {
        await sendTemplatedEmail(
          {
            to: bodyParse.data.to,
            templateKey: template.templateKey,
            data: bodyParse.data.data,
            strict: false,
          },
          fastify.mail,
          fastify.log
        );
      } catch (error) {
        fastify.log.error({ error, templateId: paramsParse.data.id }, "Test send failed");
        return reply.code(500).send({ message: "Failed to send test email" });
      }

      return reply.send({ message: "Test email sent successfully" });
    }
  );
};

export default emailTemplateRoutes;
