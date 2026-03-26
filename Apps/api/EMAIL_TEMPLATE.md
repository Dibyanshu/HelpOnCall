# Email Template CRUD - End-to-End Implementation Plan

This document defines the full implementation plan for a module-agnostic Email Template system with:

- super_admin-only management
- reusable template rendering utility
- API-wide integration for all outgoing emails
- admin UI for managing templates

## 1. Goals and Constraints

### Functional goals

1. Create and manage dynamic email templates from Admin UI.
2. Support module-agnostic usage (employee, user_registration, rfq, future modules).
3. Replace hardcoded email content in API with template-driven rendering.
4. Support both subject and body (text + html) with variables/placeholders.

### Access rules

1. UI page is admin area only.
2. Only super_admin can view and operate template CRUD.
3. API endpoints for template CRUD must enforce super_admin only.

### Non-functional goals

1. Backward-safe rollout with defaults/fallback templates.
2. Validation to prevent broken templates.
3. Audit fields and consistent patterns with existing tables/routes.

## 2. Current Mail Sending Touchpoints (Must Be Hooked)

Current known email send flows:

1. src/routes/auth.ts
- Public registration acknowledgement email (buildRegistrationEmail).

2. src/routes/emailValidator.ts
- Email verification code email (buildVerificationEmail).

These hardcoded builders will be replaced by utility-driven rendering from database templates.

## 3. Data Model Design

## 3.1 New table: email_templates

Add a new Drizzle table in src/db/schema.ts:

Suggested columns:

1. id: integer PK autoincrement.
2. templateKey: text unique not null.
- Example: user_registration_ack, email_verification_code, employment_status_update.
3. module: text not null.
- Suggested enum values now: employee, user_registration, rfq, system.
- Keep module generic and extensible.
4. channel: text not null default email.
- Future-ready for sms/push.
5. subjectTemplate: text not null.
6. textTemplate: text not null.
7. htmlTemplate: text nullable.
8. variablesSchema: text nullable.
- JSON text describing required/optional variables.
9. description: text nullable.
10. isActive: boolean not null default true.
11. version: integer not null default 1.
12. createdBy: text not null default ''.
13. createdAt: timestamp not null.
14. updatedAt: timestamp not null.

Recommended unique indexes:

1. unique(template_key)
2. unique(template_key, version) if versioning history is implemented later.

## 3.2 Optional history table (phase 2)

email_template_versions for immutable history and rollback.

For initial scope, version in same table is sufficient.

## 3.3 Migration

1. Add Drizzle migration SQL under drizzle/.
2. Add bootstrap compatibility for existing environments.
3. Seed default templates for all currently active email events.

## 4. Template Syntax and Variable Rules

Use a simple placeholder format:

- {{name}}
- {{code}}
- {{moduleLabel}}

Rules:

1. Placeholder names: alphanumeric + underscore only.
2. Unknown variables should fail render in strict mode.
3. Missing required variables should throw validation error.
4. Escape HTML values by default in htmlTemplate render path.

Suggested utility behavior:

1. textTemplate: raw replacement.
2. htmlTemplate: escaped replacement unless explicitly marked safe in future.

## 4.1 Injectable Properties (Current Backend Reality)

This section documents what can be injected into templates today.

### Currently used by live API flows

1. `name`
- Used by `user_registration_ack` flow in auth registration.

2. `code`
- Used by `email_verification_code` flow.

3. `moduleLabel`
- Used by `email_verification_code` flow.

### Supported by API contract (dynamic keys)

1. Any string key is accepted for rendering payload (`Record<string, string>`).
2. Admin test-send endpoint accepts arbitrary string keys in `data` JSON.
3. Placeholders in templates can therefore use any key name matching `{{keyName}}` pattern.

Examples:

- `{{fullName}}`
- `{{requestId}}`
- `{{empId}}`
- `{{expiryMinutes}}`

### How `variablesSchema` affects injection

1. `variablesSchema` can define `required` and `optional` arrays.
2. Only `required` is strictly enforced at runtime.
3. `optional` is descriptive (useful for UI/docs) and not strictly enforced.
4. If `variablesSchema` is empty/null/missing, rendering still works with provided keys.

Examples:

1. `{"required":["name"]}`
2. `{"required":["code","moduleLabel"],"optional":["expiryMinutes"]}`
3. `{}`
4. `null`

## 5. API Utility Layer (Central Mail Hook)

Create a dedicated utility service (example):

- src/utils/email-template/email-template.service.ts

Responsibilities:

1. Fetch active template by templateKey.
2. Validate payload variables against variablesSchema.
3. Render subject/text/html.
4. Provide fallback behavior:
- If template missing and strict=false, use supplied fallback builders.
- If strict=true, fail and log.
5. Expose one method to be used by routes/services:
- sendTemplatedEmail({ to, templateKey, module, data, fallback? })

Suggested supporting files:

1. src/utils/email-template/template-renderer.ts
- Pure rendering + variable extraction.

2. src/utils/email-template/template-registry.ts
- Constants for template keys to avoid string duplication.

3. src/types/email-template.ts
- Types for render input, template entity, errors.

## 6. API CRUD Endpoints (Super Admin Only)

Create a route file (example):

- src/routes/emailTemplates.ts

All routes under:

- /api/v1/admin/email-templates

Pre-handler:

1. fastify.authenticate
2. fastify.authorize(["super_admin"])

Endpoints:

1. GET /api/v1/admin/email-templates
- List with optional filters: module, isActive, search.

2. GET /api/v1/admin/email-templates/:id
- Fetch one template.

3. POST /api/v1/admin/email-templates
- Create template.

4. PATCH /api/v1/admin/email-templates/:id
- Update editable fields.

5. DELETE /api/v1/admin/email-templates/:id
- Soft delete preferred: set isActive=false.
- Hard delete optional for now.

6. POST /api/v1/admin/email-templates/:id/test-send
- Send sample email to supplied recipient with sample payload.

Validation with zod:

1. validate templateKey uniqueness and format.
2. validate module enum.
3. validate variablesSchema JSON structure.
4. validate placeholders used in templates are declared in schema.

## 7. Hook Existing Mail Workflows

## 7.1 Auth registration flow

In src/routes/auth.ts:

1. Remove direct usage of buildRegistrationEmail.
2. Call sendTemplatedEmail using template key user_registration_ack.
3. Payload example: { name }.
4. Keep non-blocking send behavior as currently implemented.

## 7.2 Email validator request-code flow

In src/routes/emailValidator.ts:

1. Remove direct usage of buildVerificationEmail.
2. Call sendTemplatedEmail using template key email_verification_code.
3. Payload example: { code, moduleLabel, expiryMinutes }.
4. Keep blocking behavior for this endpoint (if mail fails, return failure), same as current logic.

## 7.3 Future integrations

Add template keys for future events:

1. employment_approved
2. employment_rejected
3. rfq_received
4. admin_user_created

## 8. Admin UI Plan (User Friendly + Super Admin Only)

## 8.1 Route and access

In web/src/App.jsx add:

- /admin/email-templates

Wrap with:

- <RequireAdminAuth allowedRoles={['super_admin']}>

Add sidebar/menu item in Admin layout only for super_admin.

## 8.2 Page and components

New page:

- web/src/admin/pages/AdminEmailTemplatesPage.jsx

Recommended UI sections:

1. Template list panel
- Search by key/module
- Filter active/inactive
- Quick badges: module, active state, version

2. Editor panel
- Form fields: key, module, subject, text, html, variables schema, active toggle
- Placeholder helper chips generated from variables schema
- Live preview tabs: Subject, Text, HTML

3. Validation feedback
- Missing variables
- Unknown placeholders
- JSON schema parse errors

4. Test send panel
- Recipient email
- Sample payload JSON
- Send test button + result toast

Suggested support files:

1. web/src/appServices/useEmailTemplateManagement.js
2. web/src/admin/pages/emailTemplates/EmailTemplateForm.jsx
3. web/src/admin/pages/emailTemplates/EmailTemplateList.jsx
4. web/src/admin/pages/emailTemplates/TemplatePreview.jsx

UX details:

1. Unsaved changes warning before switching template.
2. Confirm dialog for deactivate/delete.
3. Toasts for create/update/test-send outcomes.
4. Loading and empty states consistent with existing admin pages.

## 9. Security and Authorization

1. API routes only allow super_admin.
2. UI route only available for super_admin.
3. Backend remains source of truth for authorization (do not rely on UI only).
4. Sanitize and validate template content to reduce injection risk.
5. Log all template CRUD events with actor and timestamp.

## 10. Rollout Strategy

## Phase A: Backend foundation

1. Add schema + migration + seed default templates.
2. Add template service utility + renderer.
3. Add CRUD + test-send endpoints.
4. Add API documentation in ROUTES.md and README endpoint index.

## Phase B: Integrate existing email flows

1. Hook auth registration email.
2. Hook email validator verification email.
3. Validate behavior with and without templates present.

## Phase C: Frontend admin page

1. Build super_admin-only route/page.
2. Implement CRUD + preview + test-send.
3. Add final UX polishing and validation messages.

## Phase D: QA and stabilization

1. Manual testing with real SMTP credentials.
2. Verify migration on existing DB.

## 11. Testing Checklist

Backend tests:

1. Template CRUD validation and authorization.
2. Rendering success with complete payload.
3. Rendering failure for missing required variables.
4. test-send endpoint behavior.
5. Existing flows still send mail through template service.

Frontend tests:

1. super_admin can access page.
2. admin and other roles are blocked.
3. Create/edit/deactivate template works.
4. Preview updates in real time.
5. Test-send error/success states shown correctly.

Manual end-to-end:

1. Create/update template from UI.
2. Trigger auth registration and verify email content matches template.
3. Trigger email-validator request-code and verify content.

## 12. Acceptance Criteria

1. Email template table exists and is seeded with defaults.
2. Template CRUD API exists and is restricted to super_admin only.
3. Admin UI page exists and is restricted to super_admin only.
4. Existing outgoing emails use template utility, not hardcoded builders.
5. Missing template handling is predictable and logged.
6. ROUTES.md and README API endpoint list include new endpoints.

## 13. Suggested Initial Template Keys

1. user_registration_ack
- Variables: name

2. email_verification_code
- Variables: code, moduleLabel, expiryMinutes

3. employment_approved
- Variables: fullName, empId

4. employment_rejected
- Variables: fullName, empId

5. rfq_received
- Variables: fullName, requestId

## 14. Implementation Notes for This Codebase

1. Follow existing patterns:
- zod validation in route files
- buildAuditCreateFields/buildAuditUpdateFields for audit fields
- fastify.authenticate and fastify.authorize pre-handlers

2. Keep module enums aligned between:
- schema table enum
- zod schemas
- frontend select options

3. Prefer soft delete with isActive for operational safety.

4. Keep template service independent from route handlers so future modules can reuse it directly.
