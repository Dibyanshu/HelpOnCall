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
	`is_active` integer DEFAULT 1 NOT NULL,
	`version` integer DEFAULT 1 NOT NULL,
	`created_by` text DEFAULT '' NOT NULL,
	`created_at` integer DEFAULT 0 NOT NULL,
	`updated_at` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `email_templates_template_key_unique` ON `email_templates` (`template_key`);
