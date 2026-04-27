import { and, desc, eq, inArray, sql } from "drizzle-orm";
import type { FastifyPluginAsync } from "fastify";
import { z } from "zod";
import { buildAuditCreateFields, buildAuditUpdateFields } from "../db/audit.js";
import { db } from "../db/index.js";
import * as mysqlSchema from "../db/schema.mysql.js";
import * as sqliteSchema from "../db/schema.js";
const isProd = process.env.APP_ENV === "production";
const { rfqs, serviceCategories, services, users } = isProd ? mysqlSchema : sqliteSchema;
import type { Role } from "../types/auth.js";
import {
  buildRfqAdminNotificationEmail,
  buildRfqConfirmationEmail,
  buildRfqStatusEmail,
  buildRfqStatusTemplateData
} from "../utils/email-template/email-builders.js";
import { sendTemplatedEmail } from "../utils/email-template/email-template.service.js";
import { TEMPLATE_KEYS } from "../utils/email-template/template-registry.js";

const serviceSelectionSchema = z.object({
  categoryId: z.number().int().positive(),
  serviceId: z.number().int().positive()
});

const createRfqSchema = z
  .object({
    fullName: z.string().min(2),
    email: z.string().email(),
    phone: z.string().min(7),
    address: z.string().min(1),
    serviceCategories: z.array(serviceSelectionSchema).min(1),
    contactPreference: z.enum(["email", "phone", "any"]),
    careType: z.enum(["self", "someone_else"]),
    personName: z.string().optional(),
    personRelation: z.string().optional(),
    startDate: z.string().regex(/^\d{2}\/\d{2}\/\d{4}$/),
    durationValue: z.coerce.number().positive(),
    durationUnit: z.enum(["days", "weeks", "months"]),
    consent: z.literal(true)
  })
  .superRefine((value, ctx) => {
    if (value.careType === "someone_else") {
      if (!value.personName || value.personName.trim().length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["personName"],
          message: "Recipient name is required"
        });
      }

      if (!value.personRelation || value.personRelation.trim().length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["personRelation"],
          message: "Recipient relation is required"
        });
      }
    }
  });

const rfqIdParamsSchema = z.object({
  rfqId: z.string().uuid()
});

const adminRfqQuerySchema = z.object({
  search: z.string().trim().optional().default(""),
  status: z.enum(["new", "approve", "reject"]).optional()
});

const updateRfqStatusBodySchema = z.object({
  status: z.enum(["approve", "reject"])
});

const DURATION_UNIT_MAP = {
  days: "Day",
  weeks: "Week",
  months: "Month"
} as const satisfies Record<string, "Day" | "Week" | "Month">;

function escapeLikePattern(input: string): string {
  return input.replace(/\\/g, "\\\\").replace(/%/g, "\\%").replace(/_/g, "\\_");
}

async function findAdminRecipientEmails(): Promise<string[]> {
  const rows = await db
    .select({ email: users.personalEmail } as any)
    .from(users)
    .where(
      and(
        inArray(users.role, ["admin", "super_admin"]),
        eq(users.isActive, true)
      )
    );

  return [...new Set(rows.map((item) => item.email.trim()).filter((email) => email.length > 0))];
}

const rfqRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.post("/rfqs", async (request, reply) => {
    const bodyParse = createRfqSchema.safeParse(request.body);

    if (!bodyParse.success) {
      return reply.code(400).send({
        message: "Invalid request body",
        errors: bodyParse.error.flatten()
      });
    }

    const payload = bodyParse.data;

    const [month, day, year] = payload.startDate.split("/");
    const startDate = new Date(Number(year), Number(month) - 1, Number(day));

    const inserted = await db
      .insert(rfqs)
      .values({
        email: payload.email,
        fullName: payload.fullName,
        phone: payload.phone,
        address: payload.address,
        preferredContact: payload.contactPreference,
        serviceSelected: payload.serviceCategories,
        startDate,
        durationVal: payload.durationValue,
        durationType: DURATION_UNIT_MAP[payload.durationUnit],
        selfCare: payload.careType === "self",
        recipientName: payload.careType === "someone_else" ? (payload.personName ?? "") : "",
        recipientRelation: payload.careType === "someone_else" ? (payload.personRelation ?? "") : "",
        status: "new",
        ...buildAuditCreateFields("public_rfq_form")
      })
      .returning({
        rfqId: rfqs.rfqId,
        email: rfqs.email,
        fullName: rfqs.fullName,
        phone: rfqs.phone,
        createdAt: rfqs.createdAt
      } as any);

    const created = inserted[0];

    void sendTemplatedEmail(
      {
        to: payload.email,
        templateKey: TEMPLATE_KEYS.RFQ_CONFIRMATION,
        data: { fullName: payload.fullName, email: payload.email },
        fallback: () => buildRfqConfirmationEmail({ fullName: payload.fullName, email: payload.email }),
        strict: false
      },
      fastify.mail,
      fastify.log
    ).catch((error) => {
      fastify.log.error({ error }, "Failed to send RFQ confirmation email");
    });

    void findAdminRecipientEmails()
      .then(async (adminEmails) => {
        if (adminEmails.length === 0) {
          return;
        }

        const emailContent = buildRfqAdminNotificationEmail({
          fullName: created.fullName,
          email: created.email,
          phone: created.phone,
          rfqId: created.rfqId
        });

        await fastify.mail.send({
          to: adminEmails,
          subject: emailContent.subject,
          text: emailContent.text,
          html: emailContent.html
        });
      })
      .catch((error) => {
        fastify.log.error({ error }, "Failed to send RFQ notification email to admins");
      });

    return reply.code(201).send({
      message: "Quotation request submitted successfully",
      rfqId: created.rfqId
    });
  });

  fastify.get(
    "/admin/rfqs",
    {
      preHandler: [
        fastify.authenticate,
        fastify.authorize(["super_admin" as Role, "admin" as Role])
      ]
    },
    async (request, reply) => {
      const queryParse = adminRfqQuerySchema.safeParse(request.query);

      if (!queryParse.success) {
        return reply.code(400).send({
          message: "Invalid query params",
          errors: queryParse.error.flatten()
        });
      }

      const statusClause = queryParse.data.status
        ? eq(rfqs.status, queryParse.data.status)
        : undefined;

      const searchClause = queryParse.data.search
        ? (() => {
            const normalizedSearch = `%${escapeLikePattern(queryParse.data.search.toLowerCase())}%`;
            return sql`(
              lower(${rfqs.fullName}) LIKE ${normalizedSearch} ESCAPE '\\'
              OR lower(${rfqs.email}) LIKE ${normalizedSearch} ESCAPE '\\'
              OR lower(${rfqs.phone}) LIKE ${normalizedSearch} ESCAPE '\\'
              OR lower(${rfqs.rfqId}) LIKE ${normalizedSearch} ESCAPE '\\'
            )`;
          })()
        : undefined;

      const whereClause =
        statusClause && searchClause
          ? and(statusClause, searchClause)
          : statusClause ?? searchClause;

      const baseQuery = db
        .select({
          id: rfqs.id,
          rfqId: rfqs.rfqId,
          email: rfqs.email,
          fullName: rfqs.fullName,
          phone: rfqs.phone,
          address: rfqs.address,
          preferredContact: rfqs.preferredContact,
          serviceSelected: rfqs.serviceSelected,
          startDate: rfqs.startDate,
          durationVal: rfqs.durationVal,
          durationType: rfqs.durationType,
          selfCare: rfqs.selfCare,
          recipientName: rfqs.recipientName,
          recipientRelation: rfqs.recipientRelation,
          status: rfqs.status,
          createdBy: rfqs.createdBy,
          createdAt: rfqs.createdAt,
          updatedAt: rfqs.updatedAt
        } as any)
        .from(rfqs)
        .orderBy(desc(rfqs.createdAt), desc(rfqs.id));

      const list = whereClause ? await baseQuery.where(whereClause) : await baseQuery;

      const categoryIds = new Set<number>();
      const serviceIds = new Set<number>();

      for (const row of list) {
        for (const item of row.serviceSelected) {
          categoryIds.add(item.categoryId);
          serviceIds.add(item.serviceId);
        }
      }

      const [categoryRows, serviceRows] = await Promise.all([
        categoryIds.size > 0
            ? db
              .select({ id: serviceCategories.id, title: serviceCategories.title } as any)
              .from(serviceCategories)
              .where(inArray(serviceCategories.id, Array.from(categoryIds)))
          : Promise.resolve([]),
        serviceIds.size > 0
          ? db
              .select({ id: services.id, label: services.label } as any)
              .from(services)
              .where(inArray(services.id, Array.from(serviceIds)))
          : Promise.resolve([])
      ]);

      const categoryTitleById = new Map(categoryRows.map((item) => [item.id, item.title]));
      const serviceLabelById = new Map(serviceRows.map((item) => [item.id, item.label]));

      const enriched = list.map((row) => {
        const resolved = row.serviceSelected.map((item: { categoryId: number; serviceId: number }) => {
          const categoryTitle = categoryTitleById.get(item.categoryId);
          const serviceLabel = serviceLabelById.get(item.serviceId);

          if (categoryTitle && serviceLabel) {
            return `${categoryTitle}: ${serviceLabel}`;
          }

          if (serviceLabel) {
            return serviceLabel;
          }

          if (categoryTitle) {
            return categoryTitle;
          }

          return `${item.categoryId}:${item.serviceId}`;
        });

        return {
          ...row,
          serviceSelected: JSON.stringify(resolved)
        };
      });

      return reply.send({ data: enriched });
    }
  );

  fastify.patch(
    "/admin/rfqs/:rfqId/status",
    {
      preHandler: [
        fastify.authenticate,
        fastify.authorize(["super_admin" as Role, "admin" as Role])
      ]
    },
    async (request, reply) => {
      const paramsParse = rfqIdParamsSchema.safeParse(request.params);

      if (!paramsParse.success) {
        return reply.code(400).send({
          message: "Invalid route params",
          errors: paramsParse.error.flatten()
        });
      }

      const bodyParse = updateRfqStatusBodySchema.safeParse(request.body);

      if (!bodyParse.success) {
        return reply.code(400).send({
          message: "Invalid request body",
          errors: bodyParse.error.flatten()
        });
      }

      const updated = await db
        .update(rfqs)
        .set({
          status: bodyParse.data.status,
          ...buildAuditUpdateFields()
        })
        .where(eq(rfqs.rfqId, paramsParse.data.rfqId))
        .returning({
          id: rfqs.id,
          rfqId: rfqs.rfqId,
          email: rfqs.email,
          fullName: rfqs.fullName,
          status: rfqs.status,
          updatedAt: rfqs.updatedAt
        } as any);

      const result = updated[0];

      if (!result) {
        return reply.code(404).send({ message: "RFQ not found" });
      }

      void sendTemplatedEmail(
        {
          to: result.email,
          templateKey: TEMPLATE_KEYS.RFQ_STATUS,
          data: {
            fullName: result.fullName,
            rfqId: result.rfqId,
            ...buildRfqStatusTemplateData(bodyParse.data.status)
          },
          fallback: () =>
            buildRfqStatusEmail({ fullName: result.fullName, rfqId: result.rfqId, status: bodyParse.data.status }),
          strict: false
        },
        fastify.mail,
        fastify.log
      ).catch((error) => {
        fastify.log.error({ error, rfqId: result.rfqId }, "Failed to send RFQ status email");
      });

      return reply.send({
        message: `RFQ ${bodyParse.data.status === "approve" ? "approved" : "rejected"} successfully`,
        rfq: {
          id: result.id,
          rfqId: result.rfqId,
          status: result.status,
          updatedAt: result.updatedAt
        }
      });
    }
  );
};

export default rfqRoutes;
