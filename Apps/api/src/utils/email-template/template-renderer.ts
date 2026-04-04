import type { RenderedEmail, TemplateVariablesSchema } from "../../types/email-template.js";
import { TemplateRenderError } from "../../types/email-template.js";

const PLACEHOLDER_REGEX = /\{\{([a-zA-Z0-9_]+)\}\}/g;

export function extractPlaceholders(template: string): string[] {
  const matches = new Set<string>();
  let match: RegExpExecArray | null;

  const regex = new RegExp(PLACEHOLDER_REGEX.source, "g");

  while ((match = regex.exec(template)) !== null) {
    matches.add(match[1]);
  }

  return Array.from(matches);
}

export function validateVariables(
  data: Record<string, string>,
  variablesSchema: TemplateVariablesSchema | null
): void {
  if (!variablesSchema) {
    return;
  }

  const required = variablesSchema.required ?? [];

  for (const key of required) {
    if (!(key in data) || data[key] === undefined) {
      throw new TemplateRenderError(`Missing required template variable: ${key}`);
    }
  }
}

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function replacePlaceholders(template: string, data: Record<string, string>, escapeValues = false): string {
  return template.replace(PLACEHOLDER_REGEX, (_, key: string) => {
    if (!(key in data)) {
      return `{{${key}}}`;
    }

    const value = data[key] ?? "";
    return escapeValues ? escapeHtml(value) : value;
  });
}

export function renderTemplate(
  subjectTemplate: string,
  textTemplate: string,
  htmlTemplate: string | null | undefined,
  data: Record<string, string>
): RenderedEmail {
  const subject = replacePlaceholders(subjectTemplate, data, false);
  const text = replacePlaceholders(textTemplate, data, false);
  const html = htmlTemplate ? replacePlaceholders(htmlTemplate, data, true) : undefined;

  return { subject, text, html };
}
