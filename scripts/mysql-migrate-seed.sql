-- =============================================================================
-- HelpOnCall — MySQL Initial Schema + Seed Data
-- Target: CloudWays managed MySQL 8.0+ (InnoDB, utf8mb4)
--
-- Usage:
--   mysql -h <host> -u <user> -p <database> < scripts/mysql-migrate-seed.sql
--
-- This script is idempotent: all CREATE TABLE statements use IF NOT EXISTS and
-- all seed INSERTs use INSERT IGNORE or ON DUPLICATE KEY UPDATE.
--
-- After running this script, start the API server once to let seedInitialEmailTemplates()
-- populate the html_template column with properly rendered HTML for all email templates.
-- The server's seed functions are idempotent and will not overwrite existing data.
-- =============================================================================

SET NAMES utf8mb4;
SET time_zone = '+00:00';

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `users` (
  `id`             INT            NOT NULL AUTO_INCREMENT,
  `personal_email` VARCHAR(255)   NOT NULL,
  `full_name`      TEXT           NOT NULL,
  `gender`         VARCHAR(50)    DEFAULT NULL,
  `date_of_birth`  DATETIME       DEFAULT NULL,
  `date_of_joining` DATETIME      DEFAULT NULL,
  `staff_id`       VARCHAR(100)   DEFAULT NULL,
  `password_hash`  TEXT           NOT NULL,
  `role`           ENUM('content_publisher','resume_reviewer','job_poster','admin','super_admin') NOT NULL,
  `created_by`     VARCHAR(255)   NOT NULL DEFAULT '',
  `is_active`      TINYINT(1)     NOT NULL DEFAULT 1,
  `created_at`     DATETIME       NOT NULL,
  `updated_at`     DATETIME       NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_personal_email_unique` (`personal_email`),
  UNIQUE KEY `users_staff_id_unique` (`staff_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `service_categories` (
  `id`            INT          NOT NULL AUTO_INCREMENT,
  `title`         TEXT         NOT NULL,
  `display_order` INT          DEFAULT 0,
  `created_by`    VARCHAR(255) NOT NULL DEFAULT '',
  `created_at`    DATETIME     NOT NULL,
  `updated_at`    DATETIME     NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `services` (
  `id`            INT          NOT NULL AUTO_INCREMENT,
  `category_id`   INT          NOT NULL,
  `label`         TEXT         NOT NULL,
  `description`   TEXT         DEFAULT NULL,
  `image_url`     TEXT         DEFAULT NULL,
  `icon_name`     VARCHAR(100) DEFAULT NULL,
  `display_order` INT          DEFAULT 0,
  `created_by`    VARCHAR(255) NOT NULL DEFAULT '',
  `created_at`    DATETIME     NOT NULL,
  `updated_at`    DATETIME     NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_services_category_id` (`category_id`),
  CONSTRAINT `fk_services_category_id`
    FOREIGN KEY (`category_id`) REFERENCES `service_categories` (`id`)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `employment` (
  `id`              INT          NOT NULL AUTO_INCREMENT,
  `emp_id`          VARCHAR(36)  NOT NULL,
  `full_name`       TEXT         NOT NULL,
  `email_address`   VARCHAR(255) NOT NULL,
  `phone_number`    VARCHAR(50)  NOT NULL,
  `specializations` TEXT         NOT NULL,
  `cover_letter`    TEXT         DEFAULT NULL,
  `resume_file_name` TEXT        NOT NULL,
  `status`          ENUM('new','approve','reject') NOT NULL DEFAULT 'new',
  `created_by`      VARCHAR(255) NOT NULL DEFAULT '',
  `created_at`      DATETIME     NOT NULL,
  `updated_at`      DATETIME     NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `employment_emp_id_unique` (`emp_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `customer_testimonials` (
  `id`            INT          NOT NULL AUTO_INCREMENT,
  `customer_name` TEXT         NOT NULL,
  `customer_email` VARCHAR(255) NOT NULL,
  `message`       TEXT         NOT NULL,
  `rating`        DOUBLE       NOT NULL,
  `profile_pic`   TEXT         DEFAULT NULL,
  `status`        ENUM('active','inactive') NOT NULL DEFAULT 'active',
  `created_by`    VARCHAR(255) NOT NULL DEFAULT '',
  `created_at`    DATETIME     NOT NULL,
  `updated_at`    DATETIME     NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `email_validator` (
  `id`         INT          NOT NULL AUTO_INCREMENT,
  `email`      VARCHAR(255) NOT NULL,
  `data`       TEXT         NOT NULL,
  `code`       VARCHAR(36)  NOT NULL DEFAULT (UUID()),
  `module`     ENUM('employee','user_registration','rfq') NOT NULL,
  `created_by` VARCHAR(255) NOT NULL DEFAULT '',
  `created_at` DATETIME     NOT NULL,
  `updated_at` DATETIME     NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email_validator_code_unique` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `email_templates` (
  `id`               INT          NOT NULL AUTO_INCREMENT,
  `template_key`     VARCHAR(255) NOT NULL,
  `module`           ENUM('employee','user_registration','rfq','system') NOT NULL,
  `channel`          VARCHAR(50)  NOT NULL DEFAULT 'email',
  `subject_template` TEXT         NOT NULL,
  `text_template`    TEXT         NOT NULL,
  `html_template`    TEXT         DEFAULT NULL,
  `variables_schema` TEXT         DEFAULT NULL,
  `description`      TEXT         DEFAULT NULL,
  `is_active`        TINYINT(1)   NOT NULL DEFAULT 1,
  `version`          INT          NOT NULL DEFAULT 1,
  `created_by`       VARCHAR(255) NOT NULL DEFAULT '',
  `created_at`       DATETIME     NOT NULL,
  `updated_at`       DATETIME     NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email_templates_template_key_unique` (`template_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `rfqs` (
  `id`                INT          NOT NULL AUTO_INCREMENT,
  `rfq_id`            VARCHAR(36)  NOT NULL DEFAULT (UUID()),
  `email`             VARCHAR(255) NOT NULL,
  `full_name`         TEXT         NOT NULL,
  `phone`             VARCHAR(50)  NOT NULL,
  `address`           TEXT         NOT NULL,
  `preferred_contact` ENUM('email','phone','any') NOT NULL,
  `service_selected`  JSON         NOT NULL,
  `start_date`        DATETIME     NOT NULL,
  `duration_val`      INT          NOT NULL,
  `duration_type`     ENUM('Day','Week','Month') NOT NULL,
  `self_care`         TINYINT(1)   NOT NULL DEFAULT 0,
  `recipient_name`    TEXT         NOT NULL,
  `recipient_relation` TEXT        NOT NULL,
  `status`            ENUM('new','approve','reject') NOT NULL DEFAULT 'new',
  `created_by`        VARCHAR(255) NOT NULL DEFAULT '',
  `created_at`        DATETIME     NOT NULL,
  `updated_at`        DATETIME     NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `rfqs_rfq_id_unique` (`rfq_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- Seed: service_categories  (3 categories)
-- ---------------------------------------------------------------------------

INSERT IGNORE INTO `service_categories`
  (`title`, `display_order`, `created_by`, `created_at`, `updated_at`)
VALUES
  ('Household Chores',        1, 'system_seed', NOW(), NOW()),
  ('Personal Care',           2, 'system_seed', NOW(), NOW()),
  ('Mobility & Companionship',3, 'system_seed', NOW(), NOW());

-- ---------------------------------------------------------------------------
-- Seed: services  (9 services — matched to categories by title)
-- ---------------------------------------------------------------------------

INSERT IGNORE INTO `services`
  (`category_id`, `label`, `description`, `image_url`, `icon_name`, `display_order`, `created_by`, `created_at`, `updated_at`)
SELECT
  sc.id,
  svc.label,
  svc.description,
  svc.image_url,
  svc.icon_name,
  svc.display_order,
  'system_seed',
  NOW(),
  NOW()
FROM (
  -- Household Chores
  SELECT 'Household Chores' AS category_title, 'Moderate Housekeeping' AS label,
    'Light home making like Organizing closets & cabinets etc., Preparing & folding laundry, In-house dusting & cleaning, Taking out garbage, Bed making' AS description,
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' AS image_url,
    'Home' AS icon_name, 1 AS display_order
  UNION ALL
  SELECT 'Household Chores', 'Meal Preparation',
    'Kitchen & pantry organization, Ordering groceries & supplies (based upon your need & request), Meal preparation (according to your diet chart & need)',
    'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    'ChefHat', 2
  UNION ALL
  SELECT 'Household Chores', 'Feeding',
    'Feeding assistance (as per need), Keeping Kitchen clean',
    'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    'Utensils', 3
  -- Personal Care
  UNION ALL
  SELECT 'Personal Care', 'Bathing',
    'Bed baths, Shower and tub assistance, Stand-by assistance',
    'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    'Bath', 1
  UNION ALL
  SELECT 'Personal Care', 'Personal Hygiene',
    'Grooming, Dressing, Oral care, Bathroom and incontinence assistance',
    'https://images.unsplash.com/photo-1628771065518-0d82f1938462?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    'Sparkles', 2
  UNION ALL
  SELECT 'Personal Care', 'Dressing',
    'Adaptive Clothing Usage, Clothing Selection Support, Dressing and Undressing Assistance, Incontinence Management, Fastening and Zippers, Footwear Support',
    'https://images.unsplash.com/photo-1445205170230-053b83016050?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    'Shirt', 3
  -- Mobility & Companionship
  UNION ALL
  SELECT 'Mobility & Companionship', 'Mobility Assistance',
    'Follow the delegated mobility protocols (post trauma & surgery), Walking assistance, Wheelchair assistance, Safety supervision, Transferring',
    'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    'Accessibility', 1
  UNION ALL
  SELECT 'Mobility & Companionship', 'Companionship',
    'Our Companion Services enrich clients lives through genuine social engagement, uplifting activities, and dependable support. From staying active to attending appointments, our compassionate companions help clients remain connected to the world and engaged in the things they love.',
    'https://images.unsplash.com/photo-1521737852567-6949f3f9f2b5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    'Users', 2
  UNION ALL
  SELECT 'Mobility & Companionship', 'Walking support',
    'Provide walking assistance',
    'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    'Footprints', 3
) AS svc
JOIN `service_categories` sc ON sc.title = svc.category_title
WHERE NOT EXISTS (
  SELECT 1 FROM `services` s WHERE s.category_id = sc.id AND s.label = svc.label
);

-- ---------------------------------------------------------------------------
-- Seed: customer_testimonials  (6 testimonials)
-- ---------------------------------------------------------------------------

INSERT IGNORE INTO `customer_testimonials`
  (`customer_name`, `customer_email`, `message`, `rating`, `profile_pic`, `status`, `created_by`, `created_at`, `updated_at`)
VALUES
  ('Fatima Khoury', 'dilatory_curtains_98',
   'The progress tracker is fantastic and motivating. It helps me see improvements over time with a great mix of common and challenging vocabulary words that keep me engaged.',
   5, 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80',
   'active', 'system_seed', NOW(), NOW()),
  ('David Chen', 'david_chen_wellness',
   'The nursing team was incredibly professional and caring throughout our experience. They made our family feel truly supported with their exceptional care and attention to our needs.',
   4.8, 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80',
   'active', 'system_seed', NOW(), NOW()),
  ('Sarah Thompson', 'sarah_thompson_corp',
   'Outstanding services with great attention to detail. The corporate solutions exceeded all expectations for comfort and quality standards in every aspect of service.',
   4, 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=100&q=80',
   'active', 'system_seed', NOW(), NOW()),
  ('Michael Rodriguez', 'michael_rodriguez_pro',
   'The customer support team went above and beyond to ensure complete satisfaction. Their dedication to providing excellent service is truly commendable and professional.',
   5, 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=100&q=80',
   'active', 'system_seed', NOW(), NOW()),
  ('Emily Johnson', 'emily_johnson_expert',
   'From start to finish, the entire process was seamless and highly professional. The team''s expertise and commitment to excellence made all the difference in results.',
   5, 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=100&q=80',
   'active', 'system_seed', NOW(), NOW()),
  ('James Wilson', 'james_wilson_innovator',
   'I was impressed by the innovative approach and meticulous attention to detail. The final result exceeded my expectations in every way possible with outstanding quality.',
   4.5, 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&q=80',
   'active', 'system_seed', NOW(), NOW());

-- ---------------------------------------------------------------------------
-- Seed: email_templates  (6 templates — html_template intentionally NULL here)
-- NOTE: On first server startup, seedInitialEmailTemplates() will upsert all
-- templates with fully rendered HTML via the TypeScript layout builders.
-- ---------------------------------------------------------------------------

INSERT INTO `email_templates`
  (`template_key`, `module`, `channel`, `subject_template`, `text_template`, `html_template`,
   `variables_schema`, `description`, `is_active`, `version`, `created_by`, `created_at`, `updated_at`)
VALUES
  ('user_registration_ack', 'user_registration', 'email',
   'HelpOnCall registration received',
   'Hi {{name}},\n\nYour registration has been received successfully.\nAn administrator will review and activate your account soon.\n\nThanks,\nHelpOnCall Team',
   NULL,
   '{"required":["name"]}',
   'Sent to users after public registration',
   1, 1, 'system_seed', NOW(), NOW()),

  ('email_verification_code', 'system', 'email',
   'HelpOnCall {{moduleLabel}} email verification code',
   'Your HelpOnCall verification code is: {{code}}\n\nThis code expires in 15 minutes.\nIf you did not request this, you can ignore this email.',
   NULL,
   '{"required":["code","moduleLabel"]}',
   'Sent when a user requests an email verification code',
   1, 1, 'system_seed', NOW(), NOW()),

  ('new_staff_account_created', 'system', 'email',
   'Your HelpOnCall staff account is ready',
   'Hi {{fullName}},\n\nYour HelpOnCall staff account has been created successfully.\nYou can now log in using the credentials below:\n\nStaff Email: {{staffEmail}}\nPassword: {{password}}\n\nPlease change your password after first login.\n\nRegards,\nHelpOnCall Team',
   NULL,
   '{"required":["fullName","personalEmail","staffEmail","password"]}',
   'Sent after admin creates a new staff account',
   1, 1, 'system_seed', NOW(), NOW()),

  ('rfq_confirmation', 'rfq', 'email',
   'HelpOnCall quotation request received',
   'Hi {{fullName}},\n\nRequest Received!\n\nYour quotation request has been logged in our premium care system.\nA detailed confirmation and next steps have been sent to {{email}}.\nA care coordinator will be in touch within the next 2 hours.\n\nHelpOnCall Team',
   NULL,
   '{"required":["fullName","email"]}',
   'Sent to users after a quotation request is submitted',
   1, 1, 'system_seed', NOW(), NOW()),

  ('employment_applicant_confirmation', 'employee', 'email',
   'HelpOnCall employment application received',
   'Hi {{fullName}},\n\nApplication Sent!\n\nYour profile has entered our orbit. Our recruitment team will review your application and reach out shortly.\nA confirmation has been sent to {{emailAddress}}.\n\nHelpOnCall Team',
   NULL,
   '{"required":["fullName","emailAddress"]}',
   'Sent to applicants after successful employment application submission',
   1, 1, 'system_seed', NOW(), NOW()),

  ('employment_applicant_status', 'employee', 'email',
   'HelpOnCall employment application {{statusSubject}}',
   'Hi {{fullName}},\n\n{{statusLine}}\nReference ID: {{empId}}\n\nThank you for your interest in HelpOnCall.\nHelpOnCall Team',
   NULL,
   '{"required":["fullName","empId","statusSubject","statusHeading","statusLine","statusBadgeColor","statusTextColor","statusBadgeLabel"]}',
   'Sent to applicants when their employment application status is updated (approved or rejected)',
   1, 1, 'system_seed', NOW(), NOW()),

  ('rfq_status', 'rfq', 'email',
   'HelpOnCall quotation request {{statusSubject}}',
   'Hi {{fullName}},\n\n{{statusLine}}\nReference ID: {{rfqId}}\n\nThank you for choosing HelpOnCall.\nHelpOnCall Team',
   NULL,
   '{"required":["fullName","rfqId","statusSubject","statusHeading","statusLine","statusBadgeColor","statusTextColor","statusBadgeLabel"]}',
   'Sent to users when their quotation request status is updated (approved or rejected)',
   1, 1, 'system_seed', NOW(), NOW())

ON DUPLICATE KEY UPDATE
  `subject_template` = VALUES(`subject_template`),
  `text_template`    = VALUES(`text_template`),
  `variables_schema` = VALUES(`variables_schema`),
  `description`      = VALUES(`description`),
  `updated_at`       = NOW();
