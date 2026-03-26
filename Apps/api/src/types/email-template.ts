import type { EMAIL_TEMPLATE_MODULE_VALUES } from "../db/schema.js";

export type EmailTemplateModule = (typeof EMAIL_TEMPLATE_MODULE_VALUES)[number];

export interface TemplateVariablesSchema {
  required?: string[];
  optional?: string[];
}

export interface RenderInput {
  templateKey: string;
  data: Record<string, string>;
}

export interface RenderedEmail {
  subject: string;
  text: string;
  html?: string;
}

export interface SendTemplatedEmailInput {
  to: string | string[];
  templateKey: string;
  data: Record<string, string>;
  fallback?: () => RenderedEmail;
  strict?: boolean;
}

export class TemplateNotFoundError extends Error {
  constructor(templateKey: string) {
    super(`Email template not found: ${templateKey}`);
    this.name = "TemplateNotFoundError";
  }
}

export class TemplateRenderError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TemplateRenderError";
  }
}
