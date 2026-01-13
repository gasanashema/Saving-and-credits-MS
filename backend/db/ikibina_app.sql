-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jan 13, 2026 at 10:17 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `ikibina_app`
--

-- --------------------------------------------------------

--
-- Table structure for table `chats`
--

CREATE TABLE `chats` (
  `id` int(11) NOT NULL,
  `sender_type` enum('admin','member') NOT NULL,
  `sender_id` int(11) NOT NULL,
  `receiver_type` enum('admin','member') NOT NULL,
  `receiver_id` int(11) NOT NULL,
  `message` text NOT NULL,
  `is_read` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `chats`
--

INSERT INTO `chats` (`id`, `sender_type`, `sender_id`, `receiver_type`, `receiver_id`, `message`, `is_read`, `created_at`) VALUES
(1, 'admin', 1, 'member', 1, 'Welcome to our savings system!', 1, '2025-01-01 08:00:00'),
(2, 'member', 1, 'admin', 1, 'Thank you! How do I apply for a loan?', 0, '2025-01-01 08:05:00'),
(3, 'admin', 1, 'member', 2, 'Your loan application has been received.', 0, '2025-01-02 09:00:00');

-- --------------------------------------------------------

--
-- Table structure for table `loan`
--

CREATE TABLE `loan` (
  `loanId` int(11) NOT NULL,
  `requestDate` datetime NOT NULL,
  `re` text NOT NULL,
  `amount` decimal(10,0) NOT NULL,
  `rate` decimal(10,0) NOT NULL DEFAULT 5,
  `duration` int(11) NOT NULL,
  `applovedDate` date DEFAULT NULL,
  `apploverId` int(11) DEFAULT NULL,
  `memberId` int(11) NOT NULL,
  `amountTopay` decimal(10,0) NOT NULL,
  `payedAmount` decimal(10,0) NOT NULL DEFAULT 0,
  `status` enum('pending','active','paid','rejected','canceled') NOT NULL DEFAULT 'pending'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `loan`
--

INSERT INTO `loan` (`loanId`, `requestDate`, `re`, `amount`, `rate`, `duration`, `applovedDate`, `apploverId`, `memberId`, `amountTopay`, `payedAmount`, `status`) VALUES
(6, '2026-01-11 22:50:24', 'emergency: qwerty', 100000, 0, 4, NULL, NULL, 9, 100000, 0, 'rejected'),
(7, '2026-01-11 22:50:56', 'emergency: qwerty', 200000, 18, 6, '2026-01-11', 1, 9, 218689, 218689, 'paid'),
(8, '2026-01-12 22:53:25', 'business: umushinga w\' inkoko', 600000, 18, 12, NULL, NULL, 9, 717371, 0, 'canceled'),
(9, '2026-01-13 21:16:28', 'personal: details', 600000, 18, 12, '2026-01-13', 1, 9, 717371, 0, 'rejected');

-- --------------------------------------------------------

--
-- Table structure for table `loanpayment`
--

CREATE TABLE `loanpayment` (
  `pay_id` int(11) NOT NULL,
  `loanId` int(11) NOT NULL,
  `pay_date` datetime NOT NULL DEFAULT current_timestamp(),
  `amount` decimal(10,0) NOT NULL,
  `recorderID` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `loanpayment`
--

INSERT INTO `loanpayment` (`pay_id`, `loanId`, `pay_date`, `amount`, `recorderID`) VALUES
(12, 7, '2026-01-12 22:29:56', 100000, 1),
(13, 7, '2026-01-13 23:04:52', 118689, 1);

-- --------------------------------------------------------

--
-- Table structure for table `loan_configs`
--

CREATE TABLE `loan_configs` (
  `id` int(11) NOT NULL,
  `config_key` varchar(50) NOT NULL,
  `config_value` varchar(255) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `loan_configs`
--

INSERT INTO `loan_configs` (`id`, `config_key`, `config_value`, `description`, `updated_at`) VALUES
(1, 'SAVINGS_MULTIPLIER', '3', 'Multiplier applied to total savings to determine base loan limit', '2026-01-13 22:50:04'),
(2, 'MIN_MEMBERSHIP_MONTHS', '3', 'Minimum months of membership required to be eligible', '2026-01-13 22:50:04'),
(3, 'CONSISTENCY_CHECK_MONTHS', '6', 'Number of months to look back for saving consistency', '2026-01-13 22:50:04'),
(4, 'INTEREST_RATE', '5', 'Default interest rate (%)', '2026-01-13 22:50:04');

-- --------------------------------------------------------

--
-- Table structure for table `loan_eligibility_logs`
--

CREATE TABLE `loan_eligibility_logs` (
  `id` int(11) NOT NULL,
  `member_id` int(11) NOT NULL,
  `calculation_date` datetime NOT NULL DEFAULT current_timestamp(),
  `total_savings` decimal(15,2) NOT NULL DEFAULT 0.00,
  `base_limit` decimal(15,2) NOT NULL DEFAULT 0.00,
  `consistency_factor` decimal(5,2) NOT NULL DEFAULT 1.00,
  `repayment_factor` decimal(5,2) NOT NULL DEFAULT 1.00,
  `final_limit` decimal(15,2) NOT NULL DEFAULT 0.00,
  `is_eligible` tinyint(1) NOT NULL DEFAULT 0,
  `rejection_reason` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `loan_eligibility_logs`
--

INSERT INTO `loan_eligibility_logs` (`id`, `member_id`, `calculation_date`, `total_savings`, `base_limit`, `consistency_factor`, `repayment_factor`, `final_limit`, `is_eligible`, `rejection_reason`) VALUES
(1, 9, '2026-01-13 23:05:02', 130000.00, 390000.00, 0.80, 1.00, 312000.00, 1, NULL),
(2, 9, '2026-01-13 23:05:09', 130000.00, 390000.00, 0.80, 1.00, 312000.00, 1, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `members`
--

CREATE TABLE `members` (
  `id` int(20) NOT NULL,
  `nid` varchar(16) NOT NULL,
  `firstName` varchar(100) NOT NULL,
  `lastName` varchar(100) NOT NULL,
  `telephone` varchar(15) NOT NULL,
  `email` varchar(100) NOT NULL,
  `balance` decimal(50,0) NOT NULL DEFAULT 0,
  `password` varchar(255) NOT NULL,
  `pin` int(6) NOT NULL DEFAULT 12345,
  `status` int(11) NOT NULL DEFAULT 0,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `members`
--

INSERT INTO `members` (`id`, `nid`, `firstName`, `lastName`, `telephone`, `email`, `balance`, `password`, `pin`, `status`, `created_at`, `updated_at`) VALUES
(9, '1234567890098765', 'umwari', 'laetitia', '0781884859', 'umwari@gmail.com', 132000, '$2a$12$TvP1sL65u4Kf7I9GPtZOYeCg1OQ8HTH84rOkeXwRVNR0uE4smi4fK', 12345, 0, '2025-01-13 22:59:22', '2025-02-13 22:59:22');

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

CREATE TABLE `notifications` (
  `id` int(11) NOT NULL,
  `sender_admin_id` int(11) NOT NULL,
  `receiver_type` enum('admin','member') NOT NULL,
  `receiver_id` int(11) NOT NULL,
  `group_id` int(11) DEFAULT NULL,
  `title` varchar(150) NOT NULL,
  `message` text NOT NULL,
  `url` varchar(255) DEFAULT NULL,
  `is_read` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `notifications`
--

INSERT INTO `notifications` (`id`, `sender_admin_id`, `receiver_type`, `receiver_id`, `group_id`, `title`, `message`, `url`, `is_read`, `created_at`) VALUES
(1, 1, 'member', 0, 1, 'Kwibutsa', 'I\'m reaching out to remind you that you have to pay', NULL, 0, '2025-12-31 07:29:57'),
(2, 1, 'member', 2, 1, 'Kwibutsa', 'I\'m reaching out to remind you that you have to pay', NULL, 0, '2025-12-31 07:29:57'),
(3, 1, 'member', 1, 1, 'Kwibutsa', 'I\'m reaching out to remind you that you have to pay', NULL, 0, '2025-12-31 07:29:57'),
(4, 0, 'admin', 0, NULL, 'New loan application', 'Member 9 submitted a loan application', '/admin/loans/9', 0, '2026-01-13 19:16:28'),
(5, 0, 'admin', 2, NULL, 'New loan application', 'Member 9 submitted a loan application', '/admin/loans/9', 0, '2026-01-13 19:16:28'),
(6, 0, 'admin', 1, NULL, 'New loan application', 'Member 9 submitted a loan application', '/admin/loans/9', 1, '2026-01-13 19:16:28'),
(7, 1, 'member', 9, NULL, 'Loan rejected', 'Your loan #9 has been rejected', '/member/loans/9', 1, '2026-01-13 19:32:32'),
(8, 1, 'member', 9, NULL, 'Payment received', 'Your payment for loan #7 has been recorded', '/member/loans/7', 1, '2026-01-13 21:04:52');

-- --------------------------------------------------------

--
-- Table structure for table `notification_groups`
--

CREATE TABLE `notification_groups` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `created_by` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `notification_groups`
--

INSERT INTO `notification_groups` (`id`, `name`, `created_by`, `created_at`) VALUES
(1, 'abatarishyura', 1, '2025-12-31 07:29:11');

-- --------------------------------------------------------

--
-- Table structure for table `notification_group_members`
--

CREATE TABLE `notification_group_members` (
  `id` int(11) NOT NULL,
  `group_id` int(11) NOT NULL,
  `recipient_type` enum('admin','member') NOT NULL,
  `recipient_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `notification_group_members`
--

INSERT INTO `notification_group_members` (`id`, `group_id`, `recipient_type`, `recipient_id`) VALUES
(1, 1, 'member', 0),
(2, 1, 'member', 1),
(3, 1, 'member', 2);

-- --------------------------------------------------------

--
-- Table structure for table `penalties`
--

CREATE TABLE `penalties` (
  `p_id` int(11) NOT NULL,
  `date` datetime NOT NULL DEFAULT current_timestamp(),
  `pType` int(11) NOT NULL,
  `amount` int(11) NOT NULL,
  `memberId` int(11) NOT NULL,
  `pstatus` enum('wait','paid') NOT NULL DEFAULT 'wait',
  `PayedArt` timestamp NULL DEFAULT NULL ON UPDATE current_timestamp(),
  `confirmedBy` int(11) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `ptypes`
--

CREATE TABLE `ptypes` (
  `ptId` int(11) NOT NULL,
  `title` varchar(100) NOT NULL,
  `amount` decimal(22,0) NOT NULL,
  `description` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `ptypes`
--

INSERT INTO `ptypes` (`ptId`, `title`, `amount`, `description`) VALUES
(0, 'GUSIBA GUTERA', 500, 'kurenza amasaha...'),
(1, 'GUSAKUZA', 300, 'Guteza urusaku...'),
(2, 'GUKERERWA', 200, 'kuza nyuma...');

-- --------------------------------------------------------

--
-- Table structure for table `savings`
--

CREATE TABLE `savings` (
  `sav_id` int(11) NOT NULL,
  `date` date NOT NULL DEFAULT current_timestamp(),
  `memberId` int(11) NOT NULL,
  `stId` int(11) NOT NULL,
  `numberOfShares` decimal(12,0) NOT NULL DEFAULT 0,
  `shareValue` decimal(12,0) NOT NULL DEFAULT 0,
  `user_id` int(11) NOT NULL DEFAULT 1,
  `updatedAt` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `createdAt` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `savings`
--

INSERT INTO `savings` (`sav_id`, `date`, `memberId`, `stId`, `numberOfShares`, `shareValue`, `user_id`, `updatedAt`, `createdAt`) VALUES
(40, '2026-01-11', 9, 2, 2, 60000, 1, '2026-01-11 20:32:11', '2026-01-11 22:32:11'),
(41, '2026-01-11', 9, 1, 1, 10000, 1, '2026-01-11 20:35:08', '2026-01-11 22:35:08');

-- --------------------------------------------------------

--
-- Table structure for table `savingtypes`
--

CREATE TABLE `savingtypes` (
  `stId` int(11) NOT NULL,
  `title` varchar(100) NOT NULL,
  `Description` varchar(255) NOT NULL,
  `amount` decimal(11,0) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `savingtypes`
--

INSERT INTO `savingtypes` (`stId`, `title`, `Description`, `amount`) VALUES
(0, 'utateye', 'gusiba', 0),
(1, 'Main Share', 'BIG SHARE', 10000),
(2, 'basic share', 'basic', 3000),
(3, 'Medium Share', 'Middle size share', 5000);

-- --------------------------------------------------------

--
-- Table structure for table `saving_edit_history`
--

CREATE TABLE `saving_edit_history` (
  `historyId` int(11) NOT NULL,
  `savId` int(11) NOT NULL,
  `date` date NOT NULL,
  `memberId` int(11) NOT NULL,
  `stId` int(11) NOT NULL,
  `numeberOfShares` decimal(12,0) NOT NULL,
  `shareValue` decimal(12,0) NOT NULL,
  `user_id` int(11) NOT NULL,
  `createdAt` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `settings`
--

CREATE TABLE `settings` (
  `id` int(11) NOT NULL,
  `setting_name` varchar(255) NOT NULL,
  `setting_value` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`setting_value`))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `settings`
--

INSERT INTO `settings` (`id`, `setting_name`, `setting_value`) VALUES
(0, 'general', '{\"savingDay\":\"2\"}');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `user_id` int(11) NOT NULL,
  `fullname` varchar(100) NOT NULL,
  `role` enum('supperadmin','admin') NOT NULL,
  `email` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `status` enum('active','deactivated') NOT NULL DEFAULT 'active',
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`user_id`, `fullname`, `role`, `email`, `password`, `status`, `created_at`, `updated_at`) VALUES
(0, 'System Admin', 'supperadmin', 'sadmin@example.com', '$2a$12$TvP1sL65u4Kf7I9GPtZOYeCg1OQ8HTH84rOkeXwRVNR0uE4smi4fK', 'active', '2026-01-13 22:59:22', '2026-01-13 22:59:22'),
(1, 'Alice Admin', 'admin', 'alice@example.com', '$2a$12$TvP1sL65u4Kf7I9GPtZOYeCg1OQ8HTH84rOkeXwRVNR0uE4smi4fK', 'active', '2026-01-13 22:59:22', '2026-01-13 22:59:22'),
(2, 'Bob Recorder', 'admin', 'bob@example.com', '$2a$12$TvP1sL65u4Kf7I9GPtZOYeCg1OQ8HTH84rOkeXwRVNR0uE4smi4fK', 'active', '2026-01-13 22:59:22', '2026-01-13 22:59:22');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `chats`
--
ALTER TABLE `chats`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `loan`
--
ALTER TABLE `loan`
  ADD PRIMARY KEY (`loanId`),
  ADD KEY `loan_member_fk` (`memberId`),
  ADD KEY `loan_user_fk` (`apploverId`);

--
-- Indexes for table `loanpayment`
--
ALTER TABLE `loanpayment`
  ADD PRIMARY KEY (`pay_id`),
  ADD KEY `loanpayment_loan_fk` (`loanId`),
  ADD KEY `loanpayment_user_fk` (`recorderID`);

--
-- Indexes for table `loan_configs`
--
ALTER TABLE `loan_configs`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `idx_config_key` (`config_key`);

--
-- Indexes for table `loan_eligibility_logs`
--
ALTER TABLE `loan_eligibility_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_member_date` (`member_id`,`calculation_date`);

--
-- Indexes for table `members`
--
ALTER TABLE `members`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `nid` (`nid`),
  ADD UNIQUE KEY `unique_telephone` (`telephone`);

--
-- Indexes for table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `notifications_sender_fk` (`sender_admin_id`),
  ADD KEY `notifications_group_fk` (`group_id`);

--
-- Indexes for table `notification_groups`
--
ALTER TABLE `notification_groups`
  ADD PRIMARY KEY (`id`),
  ADD KEY `notification_groups_created_by_fk` (`created_by`);

--
-- Indexes for table `notification_group_members`
--
ALTER TABLE `notification_group_members`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_group_recipient` (`group_id`,`recipient_type`,`recipient_id`);

--
-- Indexes for table `penalties`
--
ALTER TABLE `penalties`
  ADD PRIMARY KEY (`p_id`),
  ADD KEY `penalties_ptype_fk` (`pType`),
  ADD KEY `penalties_member_fk` (`memberId`),
  ADD KEY `penalties_user_fk` (`confirmedBy`);

--
-- Indexes for table `ptypes`
--
ALTER TABLE `ptypes`
  ADD PRIMARY KEY (`ptId`);

--
-- Indexes for table `savings`
--
ALTER TABLE `savings`
  ADD PRIMARY KEY (`sav_id`),
  ADD KEY `savings_member_fk` (`memberId`),
  ADD KEY `savings_type_fk` (`stId`),
  ADD KEY `savings_user_fk` (`user_id`);

--
-- Indexes for table `savingtypes`
--
ALTER TABLE `savingtypes`
  ADD PRIMARY KEY (`stId`);

--
-- Indexes for table `saving_edit_history`
--
ALTER TABLE `saving_edit_history`
  ADD PRIMARY KEY (`historyId`),
  ADD KEY `seh_sav_fk` (`savId`),
  ADD KEY `seh_member_fk` (`memberId`),
  ADD KEY `seh_type_fk` (`stId`),
  ADD KEY `seh_user_fk` (`user_id`);

--
-- Indexes for table `settings`
--
ALTER TABLE `settings`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `setting_name` (`setting_name`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`user_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `chats`
--
ALTER TABLE `chats`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `loan`
--
ALTER TABLE `loan`
  MODIFY `loanId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `loanpayment`
--
ALTER TABLE `loanpayment`
  MODIFY `pay_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT for table `loan_configs`
--
ALTER TABLE `loan_configs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `loan_eligibility_logs`
--
ALTER TABLE `loan_eligibility_logs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `members`
--
ALTER TABLE `members`
  MODIFY `id` int(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `notifications`
--
ALTER TABLE `notifications`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `notification_groups`
--
ALTER TABLE `notification_groups`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `notification_group_members`
--
ALTER TABLE `notification_group_members`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `penalties`
--
ALTER TABLE `penalties`
  MODIFY `p_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `ptypes`
--
ALTER TABLE `ptypes`
  MODIFY `ptId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `savings`
--
ALTER TABLE `savings`
  MODIFY `sav_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=42;

--
-- AUTO_INCREMENT for table `savingtypes`
--
ALTER TABLE `savingtypes`
  MODIFY `stId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `saving_edit_history`
--
ALTER TABLE `saving_edit_history`
  MODIFY `historyId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `settings`
--
ALTER TABLE `settings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `user_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `loan`
--
ALTER TABLE `loan`
  ADD CONSTRAINT `loan_member_fk` FOREIGN KEY (`memberId`) REFERENCES `members` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `loan_user_fk` FOREIGN KEY (`apploverId`) REFERENCES `users` (`user_id`);

--
-- Constraints for table `loanpayment`
--
ALTER TABLE `loanpayment`
  ADD CONSTRAINT `loanpayment_loan_fk` FOREIGN KEY (`loanId`) REFERENCES `loan` (`loanId`) ON DELETE CASCADE,
  ADD CONSTRAINT `loanpayment_user_fk` FOREIGN KEY (`recorderID`) REFERENCES `users` (`user_id`);

--
-- Constraints for table `loan_eligibility_logs`
--
ALTER TABLE `loan_eligibility_logs`
  ADD CONSTRAINT `fk_log_member` FOREIGN KEY (`member_id`) REFERENCES `members` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `notifications`
--
ALTER TABLE `notifications`
  ADD CONSTRAINT `notifications_group_fk` FOREIGN KEY (`group_id`) REFERENCES `notification_groups` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `notifications_sender_fk` FOREIGN KEY (`sender_admin_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `notification_groups`
--
ALTER TABLE `notification_groups`
  ADD CONSTRAINT `notification_groups_created_by_fk` FOREIGN KEY (`created_by`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `notification_group_members`
--
ALTER TABLE `notification_group_members`
  ADD CONSTRAINT `notification_group_members_group_fk` FOREIGN KEY (`group_id`) REFERENCES `notification_groups` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `penalties`
--
ALTER TABLE `penalties`
  ADD CONSTRAINT `penalties_member_fk` FOREIGN KEY (`memberId`) REFERENCES `members` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `penalties_ptype_fk` FOREIGN KEY (`pType`) REFERENCES `ptypes` (`ptId`),
  ADD CONSTRAINT `penalties_user_fk` FOREIGN KEY (`confirmedBy`) REFERENCES `users` (`user_id`);

--
-- Constraints for table `savings`
--
ALTER TABLE `savings`
  ADD CONSTRAINT `savings_member_fk` FOREIGN KEY (`memberId`) REFERENCES `members` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `savings_type_fk` FOREIGN KEY (`stId`) REFERENCES `savingtypes` (`stId`),
  ADD CONSTRAINT `savings_user_fk` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`);

--
-- Constraints for table `saving_edit_history`
--
ALTER TABLE `saving_edit_history`
  ADD CONSTRAINT `seh_member_fk` FOREIGN KEY (`memberId`) REFERENCES `members` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `seh_sav_fk` FOREIGN KEY (`savId`) REFERENCES `savings` (`sav_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `seh_type_fk` FOREIGN KEY (`stId`) REFERENCES `savingtypes` (`stId`),
  ADD CONSTRAINT `seh_user_fk` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
