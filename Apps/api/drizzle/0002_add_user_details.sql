ALTER TABLE `users` ADD COLUMN `gender` text;
--> statement-breakpoint
ALTER TABLE `users` ADD COLUMN `date_of_birth` integer;
--> statement-breakpoint
ALTER TABLE `users` ADD COLUMN `date_of_joining` integer;
--> statement-breakpoint
ALTER TABLE `users` ADD COLUMN `staff_id` text;
--> statement-breakpoint
CREATE UNIQUE INDEX `users_staff_id_unique` ON `users` (`staff_id`);
