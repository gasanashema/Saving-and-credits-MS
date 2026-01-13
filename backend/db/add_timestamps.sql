-- Add timestamp columns to members table
ALTER TABLE `members` 
ADD COLUMN `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- Add timestamp columns to users table
ALTER TABLE `users` 
ADD COLUMN `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;
