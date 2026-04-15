export const TEMPLATE_KEYS = {
  USER_REGISTRATION_ACK: "user_registration_ack",
  EMAIL_VERIFICATION_CODE: "email_verification_code",
  NEW_STAFF_ACCOUNT_CREATED: "new_staff_account_created",
  RFQ_CONFIRMATION: "rfq_confirmation",
  RFQ_STATUS: "rfq_status",
  EMPLOYMENT_APPLICANT_CONFIRMATION: "employment_applicant_confirmation",
  EMPLOYMENT_ADMIN_NOTIFICATION: "employment_admin_notification",
  EMPLOYMENT_APPLICANT_STATUS: "employment_applicant_status",
} as const;

export type TemplateKey = (typeof TEMPLATE_KEYS)[keyof typeof TEMPLATE_KEYS];

export const TEMPLATE_KEY_REGEX = /^[a-z0-9_]+$/;
