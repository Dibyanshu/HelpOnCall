import type { FastifyPluginAsync } from "fastify";
import { z } from "zod";

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

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function buildRfqConfirmationEmail(input: z.infer<typeof createRfqSchema>) {
  const subject = "HelpOnCall quotation request received";

  const text = [
    `Hi ${input.fullName},`,
    "",
    "Request Received!",
    "",
    "Your quotation request has been logged in our premium care system.",
    `A detailed confirmation and next steps have been sent to ${input.email}.`,
    "A care coordinator will be in touch within the next 2 hours.",
    "",
    "HelpOnCall Team"
  ].join("\n");

  const html = `
    <div style="font-family:Arial,sans-serif;background:#f8fafc;padding:32px 16px;text-align:center;">
      <div style="max-width:640px;margin:0 auto;">
        <div style="margin:0 auto 24px;display:flex;height:96px;width:96px;align-items:center;justify-content:center;border-radius:9999px;background:linear-gradient(135deg,#14b8a6,#0f766e);color:#ffffff;box-shadow:0 20px 32px rgba(20,184,166,0.3);font-size:44px;font-weight:700;">✓</div>
        <h2 style="font-size:36px;line-height:1.2;color:#0f172a;margin:0 0 16px;font-weight:800;">Request Received!</h2>
        <div style="max-width:560px;margin:0 auto 16px;">
          <p style="font-size:20px;line-height:1.6;color:#475569;margin:0 0 20px;font-weight:500;">
            Your application for a personal statement has been logged in our premium care system.
          </p>
          <div style="background:#f8fafc;border:1px solid #e2e8f0;padding:24px;border-radius:16px;">
            <p style="margin:0;color:#374151;font-size:16px;line-height:1.7;">
              A detailed confirmation and next steps have been sent to
              <span style="color:#0f766e;font-weight:700;"> ${escapeHtml(input.email)}</span>.
              A care coordinator will be in touch within the next 2 hours.
            </p>
          </div>
        </div>
      </div>
    </div>
  `;

  return { subject, text, html };
}

const rfqRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.post("/rfq", async (request, reply) => {
    const bodyParse = createRfqSchema.safeParse(request.body);

    if (!bodyParse.success) {
      return reply.code(400).send({
        message: "Invalid request body",
        errors: bodyParse.error.flatten()
      });
    }

    const payload = bodyParse.data;
    const email = buildRfqConfirmationEmail(payload);

    await fastify.mail.send({
      to: payload.email,
      subject: email.subject,
      text: email.text,
      html: email.html
    });

    return reply.code(201).send({
      message: "Quotation request submitted successfully"
    });
  });
};

export default rfqRoutes;
