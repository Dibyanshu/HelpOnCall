import { sql } from "drizzle-orm";
import {
  boolean,
  datetime,
  double,
  int,
  json,
  mysqlEnum,
  mysqlTable,
  text,
  varchar
} from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  personalEmail: varchar("personal_email", { length: 255 }).notNull().unique(),
  fullName: text("full_name").notNull(),
  gender: varchar("gender", { length: 50 }),
  dateOfBirth: datetime("date_of_birth"),
  dateOfJoining: datetime("date_of_joining"),
  staffId: varchar("staff_id", { length: 100 }).unique(),
  passwordHash: text("password_hash").notNull(),
  role: mysqlEnum("role", [
    "content_publisher",
    "resume_reviewer",
    "job_poster",
    "admin",
    "super_admin"
  ]).notNull(),
  createdBy: varchar("created_by", { length: 255 }).notNull().default(""),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: datetime("created_at").notNull(),
  updatedAt: datetime("updated_at").notNull()
});

export const serviceCategories = mysqlTable("service_categories", {
  id: int("id").autoincrement().primaryKey(),
  title: text("title").notNull(),
  displayOrder: int("display_order").default(0),
  createdBy: varchar("created_by", { length: 255 }).notNull().default(""),
  createdAt: datetime("created_at").notNull(),
  updatedAt: datetime("updated_at").notNull()
});

export const services = mysqlTable("services", {
  id: int("id").autoincrement().primaryKey(),
  categoryId: int("category_id")
    .notNull()
    .references(() => serviceCategories.id, { onDelete: "cascade" }),
  label: text("label").notNull(),
  description: text("description"),
  imageUrl: text("image_url"),
  iconName: varchar("icon_name", { length: 100 }),
  displayOrder: int("display_order").default(0),
  createdBy: varchar("created_by", { length: 255 }).notNull().default(""),
  createdAt: datetime("created_at").notNull(),
  updatedAt: datetime("updated_at").notNull()
});

export const employment = mysqlTable("employment", {
  id: int("id").autoincrement().primaryKey(),
  empId: varchar("emp_id", { length: 36 })
    .notNull()
    .unique()
    .default(sql`(UUID())`),
  fullName: text("full_name").notNull(),
  emailAddress: varchar("email_address", { length: 255 }).notNull(),
  phoneNumber: varchar("phone_number", { length: 50 }).notNull(),
  specializations: text("specializations").notNull().default("[]"),
  coverLetter: text("cover_letter"),
  resumeFileName: text("resume_file_name").notNull(),
  status: mysqlEnum("status", ["new", "approve", "reject"]).notNull().default("new"),
  createdBy: varchar("created_by", { length: 255 }).notNull().default(""),
  createdAt: datetime("created_at").notNull(),
  updatedAt: datetime("updated_at").notNull()
});

export const customerTestimonials = mysqlTable("customer_testimonials", {
  id: int("id").autoincrement().primaryKey(),
  customerName: text("customer_name").notNull(),
  customerEmail: varchar("customer_email", { length: 255 }).notNull(),
  message: text("message").notNull(),
  rating: double("rating").notNull(),
  profilePic: text("profile_pic"),
  status: mysqlEnum("status", ["active", "inactive"]).notNull().default("active"),
  createdBy: varchar("created_by", { length: 255 }).notNull().default(""),
  createdAt: datetime("created_at").notNull(),
  updatedAt: datetime("updated_at").notNull()
});

export const emailValidator = mysqlTable("email_validator", {
  id: int("id").autoincrement().primaryKey(),
  email: varchar("email", { length: 255 }).notNull(),
  data: text("data").notNull(),
  code: varchar("code", { length: 36 })
    .notNull()
    .unique()
    .default(sql`(UUID())`),
  module: mysqlEnum("module", ["employee", "user_registration", "rfq"]).notNull(),
  createdBy: varchar("created_by", { length: 255 }).notNull().default(""),
  createdAt: datetime("created_at").notNull(),
  updatedAt: datetime("updated_at").notNull()
});

export const EMAIL_TEMPLATE_MODULE_VALUES = ["employee", "user_registration", "rfq", "system"] as const;

export type RfqServiceSelection = {
  categoryId: number;
  serviceId: number;
};

export const emailTemplates = mysqlTable("email_templates", {
  id: int("id").autoincrement().primaryKey(),
  templateKey: varchar("template_key", { length: 255 }).notNull().unique(),
  module: mysqlEnum("module", EMAIL_TEMPLATE_MODULE_VALUES).notNull(),
  channel: varchar("channel", { length: 50 }).notNull().default("email"),
  subjectTemplate: text("subject_template").notNull(),
  textTemplate: text("text_template").notNull(),
  htmlTemplate: text("html_template"),
  variablesSchema: text("variables_schema"),
  description: text("description"),
  isActive: boolean("is_active").notNull().default(true),
  version: int("version").notNull().default(1),
  createdBy: varchar("created_by", { length: 255 }).notNull().default(""),
  createdAt: datetime("created_at").notNull(),
  updatedAt: datetime("updated_at").notNull()
});

export const rfqs = mysqlTable("rfqs", {
  id: int("id").autoincrement().primaryKey(),
  rfqId: varchar("rfq_id", { length: 36 })
    .notNull()
    .unique()
    .default(sql`(UUID())`),
  email: varchar("email", { length: 255 }).notNull(),
  fullName: text("full_name").notNull(),
  phone: varchar("phone", { length: 50 }).notNull(),
  address: text("address").notNull(),
  preferredContact: mysqlEnum("preferred_contact", ["email", "phone", "any"]).notNull(),
  serviceSelected: json("service_selected").$type<RfqServiceSelection[]>().notNull(),
  startDate: datetime("start_date").notNull(),
  durationVal: int("duration_val").notNull(),
  durationType: mysqlEnum("duration_type", ["Day", "Week", "Month"]).notNull(),
  selfCare: boolean("self_care").notNull().default(false),
  recipientName: text("recipient_name").notNull(),
  recipientRelation: text("recipient_relation").notNull(),
  status: mysqlEnum("status", ["new", "approve", "reject"]).notNull().default("new"),
  createdBy: varchar("created_by", { length: 255 }).notNull().default(""),
  createdAt: datetime("created_at").notNull(),
  updatedAt: datetime("updated_at").notNull()
});
