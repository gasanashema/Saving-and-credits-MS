-- Create loan_packages table
CREATE TABLE IF NOT EXISTS `loan_packages` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `min_savings` decimal(15,2) NOT NULL DEFAULT 0.00,
  `max_loan_amount` decimal(15,2) NOT NULL DEFAULT 0.00,
  `min_membership_months` int(11) NOT NULL DEFAULT 0,
  `loan_multiplier` decimal(5,2) NOT NULL DEFAULT 1.00,
  `repayment_duration_months` int(11) NOT NULL DEFAULT 1,
  `interest_rate` decimal(5,2) NOT NULL DEFAULT 5.00,
  `description` text,
  `status` enum('active','inactive') NOT NULL DEFAULT 'active',
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Add package_id to loan table
-- We check if column exists first to avoid errors if re-running (simplest way in basic MySQL script without stored procs is just try altering, or ignore error)
-- But for safety in this environment, I'll just run the ALTER. If it exists, it might error, but the previous part works.
-- Actually, better to just run it.
ALTER TABLE `loan` ADD COLUMN `package_id` int(11) DEFAULT NULL;
ALTER TABLE `loan` ADD CONSTRAINT `fk_loan_package` FOREIGN KEY (`package_id`) REFERENCES `loan_packages` (`id`) ON DELETE SET NULL;

-- Insert Seed Data
INSERT INTO `loan_packages` (`name`, `min_savings`, `max_loan_amount`, `min_membership_months`, `loan_multiplier`, `repayment_duration_months`, `interest_rate`, `description`) VALUES
('Standard Loan', 300000.00, 900000.00, 6, 2.00, 12, 18.00, 'Standard loan for established members'),
('Progressive Saver Loan', 500000.00, 1500000.00, 12, 3.00, 18, 16.00, 'For members with higher savings history'),
('Loyalty Advantage Loan', 1000000.00, 4000000.00, 24, 4.00, 24, 14.00, 'Best rates for long-term members'),
('Emergency Loan', 150000.00, 150000.00, 3, 1.00, 6, 0.00, 'Quick small loans for emergencies');
