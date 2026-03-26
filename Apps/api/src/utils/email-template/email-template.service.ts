import { eq } from "drizzle-orm";
import type { FastifyBaseLogger } from "fastify";
import { db } from "../../db/index.js";
import { emailTemplates } from "../../db/schema.js";
import type { SendTemplatedEmailInput, TemplateVariablesSchema } from "../../types/email-template.js";
import { TemplateNotFoundError } from "../../types/email-template.js";
import type { MailService } from "../../plugins/mail.js";
import { renderTemplate, validateVariables } from "./template-renderer.js";

export async function sendTemplatedEmail(
  input: SendTemplatedEmailInput,
  mail: MailService,
  log: FastifyBaseLogger
): Promise<void> {
  const { to, templateKey, data, fallback, strict = false } = input;

  const found = await db
    .select()
    .from(emailTemplates)
    .where(eq(emailTemplates.templateKey, templateKey))
    .limit(1);

  const template = found[0];

  if (!template || !template.isActive) {
    if (!strict && fallback) {
      log.warn({ templateKey }, "Email template not found or inactive, using fallback");
      const rendered = fallback();

      await mail.send({
        to,
        subject: rendered.subject,
        text: rendered.text,
        html: rendered.html
      });

      return;
    }

    throw new TemplateNotFoundError(templateKey);
  }

  let variablesSchema: TemplateVariablesSchema | null = null;

  if (template.variablesSchema) {
    try {
      variablesSchema = JSON.parse(template.variablesSchema) as TemplateVariablesSchema;
    } catch {
      log.warn({ templateKey }, "Failed to parse variablesSchema for template");
    }
  }

  validateVariables(data, variablesSchema);

  const rendered = renderTemplate(
    template.subjectTemplate,
    template.textTemplate,
    template.htmlTemplate,
    data
  );

  await mail.send({
    to,
    subject: rendered.subject,
    text: rendered.text,
    html: rendered.html
  });
}
