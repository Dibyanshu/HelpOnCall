import { sql } from "drizzle-orm";
import { integer, sqliteTable, text, real } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  passwordHash: text("password_hash").notNull(),
  role: text("role", {
    enum: ["content_publisher", "resume_reviewer", "job_poster", "admin", "super_admin"]
  }).notNull(),
  createdBy: text("created_by").notNull().default(""),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull()
});

export const serviceCategories = sqliteTable("service_categories", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  displayOrder: integer("display_order").default(0),
  createdBy: text("created_by").notNull().default(""),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(new Date(0)),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().default(new Date(0))
});

export const services = sqliteTable("services", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  categoryId: integer("category_id")
    .notNull()
    .references(() => serviceCategories.id, { onDelete: "cascade" }),
  label: text("label").notNull(),
  description: text("description"),
  imageUrl: text("image_url"),
  iconName: text("icon_name"),
  displayOrder: integer("display_order").default(0),
  createdBy: text("created_by").notNull().default(""),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(new Date(0)),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().default(new Date(0))
});

export const employment = sqliteTable("employment", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  empId: text("emp_id")
    .notNull()
    .unique()
    .default(
      sql`(lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))), 2) || '-' || substr('89ab', abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))), 2) || '-' || lower(hex(randomblob(6))))`
    ),
  fullName: text("full_name").notNull(),
  emailAddress: text("email_address").notNull(),
  phoneNumber: text("phone_number").notNull(),
  specializations: text("specializations").notNull().default("[]"),
  coverLetter: text("cover_letter"),
  resumeFileName: text("resume_file_name").notNull(),
  status: text("status", { enum: ["new", "approve", "reject"] }).notNull().default("new"),
  createdBy: text("created_by").notNull().default(""),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(new Date(0)),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().default(new Date(0))
});

export const customerTestimonials = sqliteTable("customer_testimonials", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  customerName: text("customer_name").notNull(),
  customerEmail: text("customer_email").notNull(),
  message: text("message").notNull(),
  rating: real("rating").notNull(),
  profilePic: text("profile_pic"),
  status: text("status", { enum: ["active", "inactive"] }).notNull().default("active"),
  createdBy: text("created_by").notNull().default(""),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(new Date(0)),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().default(new Date(0))
});

export const emailValidator = sqliteTable("email_validator", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  email: text("email").notNull(),
  data: text("data").notNull(), // Unstructured JSON stored as text
  code: text("code")
    .notNull()
    .unique()
    .default(
      sql`(lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))), 2) || '-' || substr('89ab', abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))), 2) || '-' || lower(hex(randomblob(6))))`
    ),
  module: text("module", { enum: ["employee", "user_registration", "rfq"] }).notNull(),
  createdBy: text("created_by").notNull().default(""),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(new Date(0)),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().default(new Date(0))
});

export const EMAIL_TEMPLATE_MODULE_VALUES = ["employee", "user_registration", "rfq", "system"] as const;

export type RfqServiceSelection = {
  categoryId: number;
  serviceId: number;
};

export const emailTemplates = sqliteTable("email_templates", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  templateKey: text("template_key").notNull().unique(),
  module: text("module", { enum: EMAIL_TEMPLATE_MODULE_VALUES }).notNull(),
  channel: text("channel").notNull().default("email"),
  subjectTemplate: text("subject_template").notNull(),
  textTemplate: text("text_template").notNull(),
  htmlTemplate: text("html_template"),
  variablesSchema: text("variables_schema"),
  description: text("description"),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  version: integer("version").notNull().default(1),
  createdBy: text("created_by").notNull().default(""),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(new Date(0)),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().default(new Date(0))
});

export const rfqs = sqliteTable("rfqs", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  rfqId: text("rfq_id")
    .notNull()
    .unique()
    .default(
      sql`(lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))), 2) || '-' || substr('89ab', abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))), 2) || '-' || lower(hex(randomblob(6))))`
    ),
  email: text("email").notNull(),
  fullName: text("full_name").notNull(),
  phone: text("phone").notNull(),
  address: text("address").notNull(),
  preferredContact: text("preferred_contact", { enum: ["email", "phone", "any"] }).notNull(),
  serviceSelected: text("service_selected", { mode: "json" }).$type<RfqServiceSelection[]>().notNull(),
  startDate: integer("start_date", { mode: "timestamp" }).notNull(),
  durationVal: integer("duration_val").notNull(),
  durationType: text("duration_type", { enum: ["Day", "Week", "Month"] }).notNull(),
  selfCare: integer("self_care", { mode: "boolean" }).notNull().default(false),
  recipientName: text("recipient_name").notNull(),
  recipientRelation: text("recipient_relation").notNull(),
  status: text("status", { enum: ["new", "approve", "reject"] }).notNull().default("new"),
  createdBy: text("created_by").notNull().default(""),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(new Date(0)),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().default(new Date(0))
});

export type UserRole = typeof users.$inferSelect.role;
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type ServiceCategory = typeof serviceCategories.$inferSelect;
export type NewServiceCategory = typeof serviceCategories.$inferInsert;
export type Service = typeof services.$inferSelect;
export type NewService = typeof services.$inferInsert;
export type Employment = typeof employment.$inferSelect;
export type NewEmployment = typeof employment.$inferInsert;
export type CustomerTestimonial = typeof customerTestimonials.$inferSelect;
export type NewCustomerTestimonial = typeof customerTestimonials.$inferInsert;
export type EmailValidator = typeof emailValidator.$inferSelect;
export type NewEmailValidator = typeof emailValidator.$inferInsert;
export type EmailTemplate = typeof emailTemplates.$inferSelect;
export type NewEmailTemplate = typeof emailTemplates.$inferInsert;
export type Rfq = typeof rfqs.$inferSelect;
export type NewRfq = typeof rfqs.$inferInsert;
