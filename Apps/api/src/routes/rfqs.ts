import type { FastifyPluginAsync } from "fastify";
import { z } from "zod";
import { buildRfqConfirmationEmail } from "../utils/email-template/email-builders.js";
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

    await sendTemplatedEmail(
      {
        to: payload.email,
        templateKey: TEMPLATE_KEYS.RFQ_CONFIRMATION,
        data: { fullName: payload.fullName, email: payload.email },
        fallback: () => buildRfqConfirmationEmail({ fullName: payload.fullName, email: payload.email }),
        strict: false
      },
      fastify.mail,
      fastify.log
    );

    return reply.code(201).send({
      message: "Quotation request submitted successfully"
    });
  });
};

export default rfqRoutes;
