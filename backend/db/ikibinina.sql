-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Sep 28, 2024 at 04:32 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `ikibinina`
--

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
  `applovedDate` int(11) NOT NULL,
  `apploverId` int(11) DEFAULT NULL,
  `memberId` int(11) NOT NULL,
  `amountTopay` decimal(10,0) NOT NULL,
  `payedAmount` int(11) NOT NULL,
  `status` enum('pending','active','paid','rejected') NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `loan`
--

INSERT INTO `loan` (`loanId`, `requestDate`, `re`, `amount`, `rate`, `duration`, `applovedDate`, `apploverId`, `memberId`, `amountTopay`, `payedAmount`, `status`) VALUES
(1, '2024-07-26 09:32:29', 'test', 100000, 5, 5, 2024, 1, 1, 105000, 0, 'rejected'),
(2, '2024-07-26 09:36:48', 'test', 100000, 5, 3, 2024, 1, 1, 105000, 105000, 'paid'),
(3, '2024-07-26 09:44:08', 'tedtgdgdg', 700000, 5, 4, 2024, 1, 1, 735000, 0, 'rejected'),
(4, '2024-07-26 10:25:33', 'testebbbvbvbfbfbfb', 200000, 5, 500000, 2024, 1, 1, 210000, 210000, 'paid'),
(5, '2024-07-26 15:33:59', 'xxx', 200000, 5, 2, 2024, 1, 1, 210000, 60789, 'active'),
(6, '2024-09-03 18:56:21', 'dfghj', 3000, 5, 4, 2024, 1, 2, 3150, 0, 'active');

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
(1, 2, '2024-08-03 12:33:55', 5000, 1),
(2, 2, '2024-08-03 12:40:31', 100000, 1),
(3, 4, '2024-08-03 12:42:15', 210000, 1),
(4, 5, '2024-08-03 12:51:33', 10000, 1),
(5, 5, '2024-08-03 12:51:50', 50000, 1),
(6, 5, '2024-09-03 18:58:02', 789, 2);

-- --------------------------------------------------------

--
-- Table structure for table `members`
--

CREATE TABLE `members` (
  `member_id` int(20) NOT NULL,
  `nid` varchar(16) NOT NULL,
  `firstName` varchar(100) NOT NULL,
  `lastName` varchar(100) NOT NULL,
  `telephone` varchar(10) NOT NULL,
  `email` varchar(100) NOT NULL,
  `balance` decimal(50,0) NOT NULL DEFAULT 0,
  `password` varchar(255) NOT NULL DEFAULT '$2b$10$Ulp3ExTGM31PTl8j4VeLeO0fMj4r59ieHWv4opI8VwvNQiyi8FqEq',
  `pin` int(5) NOT NULL DEFAULT 12345,
  `status` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `members`
--

INSERT INTO `members` (`member_id`, `nid`, `firstName`, `lastName`, `telephone`, `email`, `balance`, `password`, `pin`, `status`) VALUES
(1, '1200085666564745', 'MUKIZA', 'oliniete', '0784589448', 'mukiza@test.com', 718000, '$2b$10$Ulp3ExTGM31PTl8j4VeLeO0fMj4r59ieHWv4opI8VwvNQiyi8FqEq', 12345, 1),
(2, '1200080137900044', 'JOHN', 'Doe', '0784589448', 'test@test.org', 0, '$2b$10$Ulp3ExTGM31PTl8j4VeLeO0fMj4r59ieHWv4opI8VwvNQiyi8FqEq', 12345, 0),
(3, '1200070012801142', 'Izabayo', 'Samuel', '0784589448', 'sam@test.com', 72000, '$2b$10$Ulp3ExTGM31PTl8j4VeLeO0fMj4r59ieHWv4opI8VwvNQiyi8FqEq', 12345, 0),
(7, '1200080181888843', 'TESI', 'Anitha', '0784589448', 'tesi@test.com', 0, '$2b$10$Ulp3ExTGM31PTl8j4VeLeO0fMj4r59ieHWv4opI8VwvNQiyi8FqEq', 123456, 0),
(8, '1200080181888841', 'TESI', 'Anitha', '0784589448', 'tesi@test.com', 0, '$2b$10$Ulp3ExTGM31PTl8j4VeLeO0fMj4r59ieHWv4opI8VwvNQiyi8FqEq', 123456, 0),
(9, '1200070181888847', 'NYIRABATESI', 'Angel', '0784589772', 'nyira@test.com', 20000, '$2b$10$Ulp3ExTGM31PTl8j4VeLeO0fMj4r59ieHWv4opI8VwvNQiyi8FqEq', 12345, 0),
(11, '1200080123243537', 'Kamumpa', 'Allen', '0789937007', 'allen@test.com', 6000, '$2b$10$Ulp3ExTGM31PTl8j4VeLeO0fMj4r59ieHWv4opI8VwvNQiyi8FqEq', 12345, 0),
(12, '1200080123243535', 'MUGISHA', 'Peter', '0722123139', 'test@test.com', 0, '$2b$10$Ulp3ExTGM31PTl8j4VeLeO0fMj4r59ieHWv4opI8VwvNQiyi8FqEq', 123445, 0),
(13, '12343548755694', 'SEBAHINZI', 'Daniel', '0722123139', 'abc124@gmail.com', 9000, '$2b$10$Ulp3ExTGM31PTl8j4VeLeO0fMj4r59ieHWv4opI8VwvNQiyi8FqEq', 12345, 0),
(14, '1234567890123456', 'ELISA', 'KWIZERA', '0784589448', 'shikamusenge@tyaza.org', 32000, '$2b$10$Ulp3ExTGM31PTl8j4VeLeO0fMj4r59ieHWv4opI8VwvNQiyi8FqEq', 12345, 0),
(15, '1200080137900043', 'Philemon', 'SHIKAMUSENGE', '0784589448', 'sadmin@test.com', 40000, '$2b$10$Ulp3ExTGM31PTl8j4VeLeO0fMj4r59ieHWv4opI8VwvNQiyi8FqEq', 12345678, 0),
(18, '1200080137900047', 'Philemon', 'SHIKAMUSENGE', '0784589448', 'hello@test.com', 0, '$2b$10$Ulp3ExTGM31PTl8j4VeLeO0fMj4r59ieHWv4opI8VwvNQiyi8FqEq', 12345678, 0);

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
  `pstatus` enum('wait','paid') NOT NULL,
  `PayedArt` timestamp NULL DEFAULT NULL ON UPDATE current_timestamp(),
  `confirmedBy` int(11) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `penalties`
--

INSERT INTO `penalties` (`p_id`, `date`, `pType`, `amount`, `memberId`, `pstatus`, `PayedArt`, `confirmedBy`) VALUES
(1, '2024-07-24 00:00:00', 1, 500, 3, 'paid', '2024-07-25 10:39:23', 2),
(2, '2024-07-24 00:00:00', 1, 500, 11, 'paid', '2024-09-03 16:37:40', 1),
(3, '2024-07-24 00:00:00', 1, 500, 9, 'wait', '2024-07-25 07:37:34', 0),
(4, '2024-07-24 00:00:00', 1, 500, 8, 'paid', '2024-09-03 16:38:32', 1),
(5, '2024-07-24 00:00:00', 1, 500, 7, 'paid', '2024-09-03 16:41:53', 1),
(6, '2024-07-24 00:00:00', 1, 500, 2, 'paid', '2024-09-03 16:52:37', 2),
(7, '2024-07-25 15:02:06', 2, 300, 1, 'wait', NULL, 0),
(8, '2024-07-25 15:03:38', 2, 300, 1, 'wait', NULL, 0),
(16, '2024-07-25 15:12:08', 3, 200, 1, 'paid', '2024-09-03 16:38:50', 1),
(18, '2024-07-25 15:17:30', 2, 300, 1, 'paid', '2024-07-25 13:18:30', 2),
(19, '2024-07-25 15:17:54', 2, 300, 7, 'wait', NULL, 0),
(20, '2024-07-25 19:56:47', 3, 200, 3, 'paid', '2024-07-25 17:57:33', 1),
(21, '2024-07-25 20:54:22', 1, 500, 8, 'wait', NULL, 0),
(265, '2024-08-03 11:36:06', 1, 500, 3, 'wait', NULL, 1),
(266, '2024-08-03 11:36:06', 1, 500, 11, 'wait', NULL, 1),
(267, '2024-08-03 11:36:06', 1, 500, 8, 'paid', '2024-09-03 16:52:42', 2),
(268, '2024-08-03 11:36:06', 1, 500, 7, 'paid', '2024-09-03 16:41:42', 1),
(269, '2024-08-03 11:36:06', 1, 500, 13, 'wait', NULL, 1),
(270, '2024-08-03 11:36:06', 1, 500, 2, 'wait', NULL, 1),
(271, '2024-09-03 18:35:06', 2, 300, 2, 'paid', '2024-09-03 16:41:37', 1),
(272, '2024-09-03 18:51:19', 3, 200, 1, 'wait', NULL, 1);

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
(1, 'GUSIBA GUTERA', 500, 'kurenza amasaha yoguterana utaratanga amafaranga na mpavu yumvikana'),
(2, 'GUSAKUZA', 300, 'Guteza urusaku mugiterane'),
(3, 'GUKERERWA', 200, 'kuza nyuma yisaha yemejwe nabanyamuryango');

-- --------------------------------------------------------

--
-- Table structure for table `savings`
--

CREATE TABLE `savings` (
  `sav_id` int(11) NOT NULL AUTO_INCREMENT,
  `date` date NOT NULL DEFAULT current_timestamp(),
  `memberId` int(11) NOT NULL,
  `stId` int(11) NOT NULL,
  `numberOfShares` decimal(12,0) NOT NULL DEFAULT 0,
  `shareValue` decimal(12,0) NOT NULL DEFAULT 0,
  `user_id` int(11) NOT NULL DEFAULT 1,
  `updatedAt` timestamp NOT NULL DEFAULT current_timestamp(),
  `createdAt` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`sav_id`),
  CONSTRAINT `savings_member_fk` FOREIGN KEY (`memberId`) REFERENCES `members` (`member_id`) ON DELETE CASCADE,
  CONSTRAINT `savings_type_fk` FOREIGN KEY (`stId`) REFERENCES `savingtypes` (`stId`),
  CONSTRAINT `savings_user_fk` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `savings`
--

INSERT INTO `savings` (`sav_id`, `date`, `memberId`, `stId`, `numberOfShares`, `shareValue`, `user_id`, `updatedAt`, `createdAt`) VALUES
(5, '2024-08-02', 1, 3, 9, 5000, 2, '2024-08-02 09:46:08', '2024-07-24 13:55:49'),
(6, '2024-07-24', 11, 2, 7, 10000, 2, '2024-08-02 09:30:36', '2024-07-24 15:42:01'),
(10, '2024-08-02', 12, 2, 9, 3000, 2, '2024-08-02 09:30:36', '2024-07-25 19:51:07'),
(11, '2024-08-02', 14, 1, 2, 10000, 2, '2024-08-02 09:56:19', '2024-07-25 20:39:40'),
(15, '2024-08-02', 9, 3, 4, 5000, 2, '2024-08-02 09:45:31', '2024-08-02 09:26:36'),
(104, '2024-08-02', 3, 0, 0, 0, 1, '2024-08-03 09:36:06', '2024-08-03 11:36:06'),
(105, '2024-08-02', 11, 0, 0, 0, 1, '2024-08-03 09:36:06', '2024-08-03 11:36:06'),
(106, '2024-08-02', 8, 0, 0, 0, 1, '2024-08-03 09:36:06', '2024-08-03 11:36:06'),
(107, '2024-08-02', 7, 0, 0, 0, 1, '2024-08-03 09:36:06', '2024-08-03 11:36:06'),
(108, '2024-08-02', 13, 0, 0, 0, 1, '2024-08-03 09:36:06', '2024-08-03 11:36:06'),
(109, '2024-08-02', 2, 0, 0, 0, 1, '2024-08-03 09:36:06', '2024-08-03 11:36:06'),
(110, '2024-09-03', 1, 1, 4, 10000, 1, '2024-09-03 14:59:07', '2024-09-03 16:59:07'),
(111, '2024-09-03', 2, 2, 0, 3000, 1, '2024-09-03 15:09:36', '2024-09-03 17:09:36'),
(112, '2024-09-03', 3, 2, 4, 3000, 1, '2024-09-03 15:13:09', '2024-09-03 17:13:09'),
(113, '2024-09-03', 13, 2, 3, 3000, 1, '2024-09-03 15:16:33', '2024-09-03 17:16:33'),
(114, '2024-09-03', 15, 1, 4, 10000, 1, '2024-09-03 15:17:21', '2024-09-03 17:17:21');

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
(1, 'Main Share', 'BIG SARE', 10000),
(2, 'basic share', 'basic', 3000),
(3, 'Medium Share', 'Middle size share ', 5000);

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
  `numberOfShares` decimal(12,0) NOT NULL,
  `shareValue` decimal(12,0) NOT NULL,
  `user_id` int(11) NOT NULL,
  `createdAt` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `saving_edit_history`
--

INSERT INTO `saving_edit_history` (`historyId`, `savId`, `date`, `memberId`, `stId`, `numberOfShares`, `shareValue`, `user_id`, `createdAt`) VALUES
(1, 15, '2024-08-02', 9, 3, 4, 5000, 2, '2024-08-02 11:45:31'),
(2, 5, '2024-08-02', 1, 3, 9, 5000, 2, '2024-08-02 11:46:09'),
(3, 11, '2024-08-02', 14, 2, 4, 3000, 2, '2024-08-02 11:49:39'),
(4, 11, '2024-08-02', 14, 1, 2, 10000, 2, '2024-08-02 11:56:19');

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
(1, 'general', '{\"savingDay\":\"2\"}');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `user_id` int(11) NOT NULL,
  `fullname` varchar(100) NOT NULL,
  `role` enum('supperadmin','admin') NOT NULL,
  `email` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL DEFAULT '$2b$10$YqztHs0qioARq3F02ge7r.Z7ipqWANtTFfI/G2jEyPo3ZW3kg1Z.C',
  `status` enum('active','deactivated') NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`user_id`, `fullname`, `role`, `email`, `password`, `status`) VALUES
(1, 'JOHN Doe', 'supperadmin', 'sadmin@test.com', '$2b$10$YqztHs0qioARq3F02ge7r.Z7ipqWANtTFfI/G2jEyPo3ZW3kg1Z.C', 'active'),
(2, 'IZABAYO Samwel', 'admin', 'admin@test.com', '$2b$10$YqztHs0qioARq3F02ge7r.Z7ipqWANtTFfI/G2jEyPo3ZW3kg1Z.C', 'active'),
(3, 'John Doe', 'admin', 'tyaza@tyaza.org', '$2b$10$YqztHs0qioARq3F02ge7r.Z7ipqWANtTFfI/G2jEyPo3ZW3kg1Z.C', 'active'),
(4, 'Kamana John', 'admin', 'kamana@gmail.com', '$2b$10$YqztHs0qioARq3F02ge7r.Z7ipqWANtTFfI/G2jEyPo3ZW3kg1Z.C', 'active');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `loan`
--
ALTER TABLE `loan`
  ADD PRIMARY KEY (`loanId`),
  ADD KEY `memberId` (`memberId`),
  ADD KEY `apploverId` (`apploverId`);

--
-- Indexes for table `loanpayment`
--
ALTER TABLE `loanpayment`
  ADD PRIMARY KEY (`pay_id`),
  ADD KEY `recorderID` (`recorderID`),
  ADD KEY `loanId` (`loanId`);

--
-- Indexes for table `members`
--
ALTER TABLE `members`
  ADD PRIMARY KEY (`member_id`),
  ADD UNIQUE KEY `nid` (`nid`);

--
-- Indexes for table `penalties`
--
ALTER TABLE `penalties`
  ADD PRIMARY KEY (`p_id`),
  ADD KEY `pType` (`pType`),
  ADD KEY `memberId` (`memberId`),
  ADD KEY `pType_2` (`pType`);

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
  ADD UNIQUE KEY `uq_saving_date` (`date`,`memberId`),
  ADD KEY `memberId_2` (`memberId`),
  ADD KEY `stId` (`stId`),
  ADD KEY `user_id` (`user_id`);

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
  ADD KEY `memberId` (`memberId`),
  ADD KEY `memberId_2` (`memberId`),
  ADD KEY `stId` (`stId`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `savId` (`savId`);

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
-- AUTO_INCREMENT for table `loan`
--
ALTER TABLE `loan`
  MODIFY `loanId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `loanpayment`
--
ALTER TABLE `loanpayment`
  MODIFY `pay_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `members`
--
ALTER TABLE `members`
  MODIFY `member_id` int(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT for table `penalties`
--
ALTER TABLE `penalties`
  MODIFY `p_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=273;

--
-- AUTO_INCREMENT for table `ptypes`
--
ALTER TABLE `ptypes`
  MODIFY `ptId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `savings`
--
ALTER TABLE `savings`
  MODIFY `sav_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=115;

--
-- AUTO_INCREMENT for table `savingtypes`
--
ALTER TABLE `savingtypes`
  MODIFY `stId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `saving_edit_history`
--
ALTER TABLE `saving_edit_history`
  MODIFY `historyId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `settings`
--
ALTER TABLE `settings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `user_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `penalties`
--
ALTER TABLE `penalties`
  ADD CONSTRAINT `penalties_ibfk_1` FOREIGN KEY (`pType`) REFERENCES `ptypes` (`ptId`),
  ADD CONSTRAINT `penalties_ibfk_2` FOREIGN KEY (`memberId`) REFERENCES `members` (`member_id`) ON DELETE CASCADE;

--
-- Constraints for table `savings`
--
ALTER TABLE `savings`
  ADD CONSTRAINT `savings_ibfk_1` FOREIGN KEY (`memberId`) REFERENCES `members` (`member_id`),
  ADD CONSTRAINT `savings_ibfk_2` FOREIGN KEY (`stId`) REFERENCES `savingtypes` (`stId`) ON UPDATE NO ACTION;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
