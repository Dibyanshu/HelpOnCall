import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

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

export type UserRole = typeof users.$inferSelect.role;
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type ServiceCategory = typeof serviceCategories.$inferSelect;
export type NewServiceCategory = typeof serviceCategories.$inferInsert;
export type Service = typeof services.$inferSelect;
export type NewService = typeof services.$inferInsert;
