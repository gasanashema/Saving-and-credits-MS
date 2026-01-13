-- Update notifications table to add missing 'url' column
-- Run this if the notifications table is missing the 'url' column

ALTER TABLE `notifications` ADD COLUMN `url` varchar(255) DEFAULT NULL AFTER `message`;

-- Verify the table structure
DESCRIBE `notifications`;