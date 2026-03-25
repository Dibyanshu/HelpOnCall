CREATE TABLE `customer_testimonials` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`customer_name` text NOT NULL,
	`customer_email` text NOT NULL,
	`message` text NOT NULL,
	`rating` real NOT NULL,
	`profile_pic` text,
	`status` text DEFAULT 'active' NOT NULL,
	`created_by` text DEFAULT '' NOT NULL,
	`created_at` integer DEFAULT '"1970-01-01T00:00:00.000Z"' NOT NULL,
	`updated_at` integer DEFAULT '"1970-01-01T00:00:00.000Z"' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `employment` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`emp_id` text DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))), 2) || '-' || substr('89ab', abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))), 2) || '-' || lower(hex(randomblob(6)))) NOT NULL,
	`full_name` text NOT NULL,
	`email_address` text NOT NULL,
	`phone_number` text NOT NULL,
	`specializations` text DEFAULT '[]' NOT NULL,
	`cover_letter` text,
	`resume_file_name` text NOT NULL,
	`status` text DEFAULT 'new' NOT NULL,
	`created_by` text DEFAULT '' NOT NULL,
	`created_at` integer DEFAULT '"1970-01-01T00:00:00.000Z"' NOT NULL,
	`updated_at` integer DEFAULT '"1970-01-01T00:00:00.000Z"' NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `employment_emp_id_unique` ON `employment` (`emp_id`);--> statement-breakpoint
CREATE TABLE `email_validator` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`email` text NOT NULL,
	`data` text NOT NULL,
	`code` text DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))), 2) || '-' || substr('89ab', abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))), 2) || '-' || lower(hex(randomblob(6)))) NOT NULL,
	`module` text NOT NULL,
	`created_at` integer DEFAULT '"1970-01-01T00:00:00.000Z"' NOT NULL,
	`updated_at` integer DEFAULT '"1970-01-01T00:00:00.000Z"' NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `email_validator_code_unique` ON `email_validator` (`code`);--> statement-breakpoint
CREATE TABLE `service_categories` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`display_order` integer DEFAULT 0,
	`created_by` text DEFAULT '' NOT NULL,
	`created_at` integer DEFAULT '"1970-01-01T00:00:00.000Z"' NOT NULL,
	`updated_at` integer DEFAULT '"1970-01-01T00:00:00.000Z"' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `services` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`category_id` integer NOT NULL,
	`label` text NOT NULL,
	`description` text,
	`image_url` text,
	`icon_name` text,
	`display_order` integer DEFAULT 0,
	`created_by` text DEFAULT '' NOT NULL,
	`created_at` integer DEFAULT '"1970-01-01T00:00:00.000Z"' NOT NULL,
	`updated_at` integer DEFAULT '"1970-01-01T00:00:00.000Z"' NOT NULL,
	FOREIGN KEY (`category_id`) REFERENCES `service_categories`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`email` text NOT NULL,
	`name` text NOT NULL,
	`password_hash` text NOT NULL,
	`role` text NOT NULL,
	`created_by` text DEFAULT '' NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);