CREATE TABLE `email_templates` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`template_key` text NOT NULL,
	`module` text NOT NULL,
	`channel` text DEFAULT 'email' NOT NULL,
	`subject_template` text NOT NULL,
	`text_template` text NOT NULL,
	`html_template` text,
	`variables_schema` text,
	`description` text,
	`is_active` integer DEFAULT true NOT NULL,
	`version` integer DEFAULT 1 NOT NULL,
	`created_by` text DEFAULT '' NOT NULL,
	`created_at` integer DEFAULT '"1970-01-01T00:00:00.000Z"' NOT NULL,
	`updated_at` integer DEFAULT '"1970-01-01T00:00:00.000Z"' NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `email_templates_template_key_unique` ON `email_templates` (`template_key`);--> statement-breakpoint
CREATE TABLE `rfqs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`rfq_id` text DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))), 2) || '-' || substr('89ab', abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))), 2) || '-' || lower(hex(randomblob(6)))) NOT NULL,
	`email` text NOT NULL,
	`full_name` text NOT NULL,
	`phone` text NOT NULL,
	`address` text NOT NULL,
	`preferred_contact` text NOT NULL,
	`service_selected` text NOT NULL,
	`start_date` integer NOT NULL,
	`duration_val` integer NOT NULL,
	`duration_type` text NOT NULL,
	`self_care` integer DEFAULT false NOT NULL,
	`recipient_name` text NOT NULL,
	`recipient_relation` text NOT NULL,
	`status` text DEFAULT 'new' NOT NULL,
	`created_by` text DEFAULT '' NOT NULL,
	`created_at` integer DEFAULT '"1970-01-01T00:00:00.000Z"' NOT NULL,
	`updated_at` integer DEFAULT '"1970-01-01T00:00:00.000Z"' NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `rfqs_rfq_id_unique` ON `rfqs` (`rfq_id`);