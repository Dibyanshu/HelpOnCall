export const TEMPLATE_KEYS = {
  USER_REGISTRATION_ACK: "user_registration_ack",
  EMAIL_VERIFICATION_CODE: "email_verification_code",
} as const;

export type TemplateKey = (typeof TEMPLATE_KEYS)[keyof typeof TEMPLATE_KEYS];

export const TEMPLATE_KEY_REGEX = /^[a-z0-9_]+$/;
