-- =================================================================
-- Loan Module Tables (Extensions)
-- =================================================================
-- This file contains ONLY the new tables required for the automatic loan 
-- eligibility logic. It assumes 'loan', 'loanpayment', 'members', 
-- and 'users' tables already exist.

-- =================================================================
-- TABLE: loan_eligibility_logs
-- PURPOSE: Stores the eligibility calculation details for audit purposes.
-- Whenever a member requests a loan (or checks eligibility), we can log 
-- the factors that determined their limit.
-- =================================================================
CREATE TABLE IF NOT EXISTS `loan_eligibility_logs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `member_id` int(11) NOT NULL,
  `calculation_date` datetime NOT NULL DEFAULT current_timestamp(),
  `total_savings` decimal(15,2) NOT NULL DEFAULT 0.00,
  `base_limit` decimal(15,2) NOT NULL DEFAULT 0.00,
  `consistency_factor` decimal(5,2) NOT NULL DEFAULT 1.00,
  `repayment_factor` decimal(5,2) NOT NULL DEFAULT 1.00,
  `final_limit` decimal(15,2) NOT NULL DEFAULT 0.00,
  `is_eligible` tinyint(1) NOT NULL DEFAULT 0,
  `rejection_reason` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_member_date` (`member_id`, `calculation_date`),
  CONSTRAINT `fk_log_member` FOREIGN KEY (`member_id`) REFERENCES `members` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =================================================================
-- TABLE: loan_configs
-- PURPOSE: Stores dynamic configuration for loan logic (e.g. multiplier).
-- Using a key-value structure or single row for global settings.
-- =================================================================
CREATE TABLE IF NOT EXISTS `loan_configs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `config_key` varchar(50) NOT NULL,
  `config_value` varchar(255) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_config_key` (`config_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Insert default configurations
INSERT IGNORE INTO `loan_configs` (`config_key`, `config_value`, `description`) VALUES 
('SAVINGS_MULTIPLIER', '3', 'Multiplier applied to total savings to determine base loan limit'),
('MIN_MEMBERSHIP_MONTHS', '3', 'Minimum months of membership required to be eligible'),
('CONSISTENCY_CHECK_MONTHS', '6', 'Number of months to look back for saving consistency'),
('INTEREST_RATE', '5', 'Default interest rate (%)');
