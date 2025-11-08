-- ikibina_with_dummy.sql
-- Generated: Adds relationships, dummy data, and auto-increment set to start from 0
SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";
SET NAMES utf8mb4;

-- Drop existing tables (for a clean import)
DROP TABLE IF EXISTS `loanpayment`;
DROP TABLE IF EXISTS `loan`;
DROP TABLE IF EXISTS `penalties`;
DROP TABLE IF EXISTS `saving_edit_history`;
DROP TABLE IF EXISTS `savings`;
DROP TABLE IF EXISTS `savingtypes`;
DROP TABLE IF EXISTS `ptypes`;
DROP TABLE IF EXISTS `members`;
DROP TABLE IF EXISTS `users`;
DROP TABLE IF EXISTS `settings`;

-- =============================
-- USERS
-- =============================
CREATE TABLE `users` (
  `user_id` int(11) NOT NULL AUTO_INCREMENT,
  `fullname` varchar(100) NOT NULL,
  `role` enum('supperadmin','admin') NOT NULL,
  `email` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `status` enum('active','deactivated') NOT NULL DEFAULT 'active',
  PRIMARY KEY (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `users` VALUES
(0,'System Admin','supperadmin','sadmin@example.com','$2y$10$examplehash','active'),
(1,'Alice Admin','admin','alice@example.com','$2y$10$examplehash','active'),
(2,'Bob Recorder','admin','bob@example.com','$2y$10$examplehash','active');

-- =============================
-- MEMBERS
-- =============================
CREATE TABLE `members` (
  `id` int(20) NOT NULL AUTO_INCREMENT,
  `nid` varchar(16) NOT NULL,
  `firstName` varchar(100) NOT NULL,
  `lastName` varchar(100) NOT NULL,
  `telephone` varchar(15) NOT NULL,
  `email` varchar(100) NOT NULL,
  `balance` decimal(50,0) NOT NULL DEFAULT 0,
  `password` varchar(255) NOT NULL,
  `pin` int(6) NOT NULL DEFAULT 12345,
  `status` int(11) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE KEY `nid` (`nid`),
  UNIQUE KEY `unique_telephone` (`telephone`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `members` VALUES
(0,'1200000000000000','NYIRABATESI','Angel','0780000000','nyira@example.com',100000,'$2y$10$hash',12345,0),
(1,'1200000000000001','Kamumpa','Allen','0780000001','allen@example.com',6000,'$2y$10$hash',12345,0),
(2,'1200000000000002','MUGISHA','Peter','0780000002','peter@example.com',0,'$2y$10$hash',12345,0),
(3,'1200000000000003','SEBAHINZI','Daniel','0780000003','daniel@example.com',9000,'$2y$10$hash',12345,0),
(4,'1200000000000004','Kagabo','Jean','0780000004','kagabo@example.com',5000,'$2y$10$hash',12345,0);

-- =============================
-- SAVING TYPES
-- =============================
CREATE TABLE `savingtypes` (
  `stId` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(100) NOT NULL,
  `Description` varchar(255) NOT NULL,
  `amount` decimal(11,0) NOT NULL,
  PRIMARY KEY (`stId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `savingtypes` VALUES
(0,'utateye','gusiba',0),
(1,'Main Share','BIG SHARE',10000),
(2,'basic share','basic',3000),
(3,'Medium Share','Middle size share',5000);

-- =============================
-- PENALTY TYPES (ptypes)
-- =============================
CREATE TABLE `ptypes` (
  `ptId` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(100) NOT NULL,
  `amount` decimal(22,0) NOT NULL,
  `description` text NOT NULL,
  PRIMARY KEY (`ptId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `ptypes` VALUES
(0,'GUSIBA GUTERA',500,'kurenza amasaha...'),
(1,'GUSAKUZA',300,'Guteza urusaku...'),
(2,'GUKERERWA',200,'kuza nyuma...');

-- =============================
-- SETTINGS
-- =============================
CREATE TABLE `settings` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `setting_name` varchar(255) NOT NULL,
  `setting_value` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`setting_value`)),
  PRIMARY KEY (`id`),
  UNIQUE KEY `setting_name` (`setting_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `settings` VALUES
(0,'general','{\"savingDay\":\"2\"}');

-- =============================
-- SAVINGS
-- =============================
CREATE TABLE `savings` (
  `sav_id` int(11) NOT NULL AUTO_INCREMENT,
  `date` date NOT NULL DEFAULT current_timestamp(),
  `memberId` int(11) NOT NULL,
  `stId` int(11) NOT NULL,
  `numberOfShares` decimal(12,0) NOT NULL DEFAULT 0,
  `shareValue` decimal(12,0) NOT NULL DEFAULT 0,
  `user_id` int(11) NOT NULL DEFAULT 1,
  `updatedAt` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `createdAt` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`sav_id`),
  CONSTRAINT `savings_member_fk` FOREIGN KEY (`memberId`) REFERENCES `members` (`id`) ON DELETE CASCADE,
  CONSTRAINT `savings_type_fk` FOREIGN KEY (`stId`) REFERENCES `savingtypes` (`stId`),
  CONSTRAINT `savings_user_fk` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `savings` VALUES
(0,'2025-01-02',0,1,5,10000,1,'2025-01-02 10:00:00','2025-01-02 10:00:00'),
(1,'2025-02-02',1,2,3,3000,1,'2025-02-02 11:00:00','2025-02-02 11:00:00'),
(2,'2025-03-02',2,3,4,5000,2,'2025-03-02 12:00:00','2025-03-02 12:00:00');

-- =============================
-- SAVING EDIT HISTORY
-- =============================
CREATE TABLE `saving_edit_history` (
  `historyId` int(11) NOT NULL AUTO_INCREMENT,
  `savId` int(11) NOT NULL,
  `date` date NOT NULL,
  `memberId` int(11) NOT NULL,
  `stId` int(11) NOT NULL,
  `numeberOfShares` decimal(12,0) NOT NULL,
  `shareValue` decimal(12,0) NOT NULL,
  `user_id` int(11) NOT NULL,
  `createdAt` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`historyId`),
  CONSTRAINT `seh_sav_fk` FOREIGN KEY (`savId`) REFERENCES `savings` (`sav_id`) ON DELETE CASCADE,
  CONSTRAINT `seh_member_fk` FOREIGN KEY (`memberId`) REFERENCES `members` (`id`) ON DELETE CASCADE,
  CONSTRAINT `seh_type_fk` FOREIGN KEY (`stId`) REFERENCES `savingtypes` (`stId`),
  CONSTRAINT `seh_user_fk` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `saving_edit_history` VALUES
(0,0,'2025-01-02',0,1,5,10000,1,'2025-01-02 10:05:00'),
(1,1,'2025-02-02',1,2,3,3000,1,'2025-02-02 11:05:00');

-- =============================
-- PENALTIES
-- =============================
CREATE TABLE `penalties` (
  `p_id` int(11) NOT NULL AUTO_INCREMENT,
  `date` datetime NOT NULL DEFAULT current_timestamp(),
  `pType` int(11) NOT NULL,
  `amount` int(11) NOT NULL,
  `memberId` int(11) NOT NULL,
  `pstatus` enum('wait','paid') NOT NULL DEFAULT 'wait',
  `PayedArt` timestamp NULL DEFAULT NULL ON UPDATE current_timestamp(),
  `confirmedBy` int(11) NOT NULL DEFAULT 1,
  PRIMARY KEY (`p_id`),
  CONSTRAINT `penalties_ptype_fk` FOREIGN KEY (`pType`) REFERENCES `ptypes` (`ptId`),
  CONSTRAINT `penalties_member_fk` FOREIGN KEY (`memberId`) REFERENCES `members` (`id`) ON DELETE CASCADE,
  CONSTRAINT `penalties_user_fk` FOREIGN KEY (`confirmedBy`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `penalties` VALUES
(0,'2025-02-10 09:00:00',0,500,1,'wait',NULL,1),
(1,'2025-03-10 09:00:00',2,200,3,'paid','2025-03-11 08:00:00',2);

-- =============================
-- LOANS
-- =============================
CREATE TABLE `loan` (
  `loanId` int(11) NOT NULL AUTO_INCREMENT,
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
  `status` enum('pending','active','paid','rejected') NOT NULL DEFAULT 'pending',
  PRIMARY KEY (`loanId`),
  CONSTRAINT `loan_member_fk` FOREIGN KEY (`memberId`) REFERENCES `members` (`id`) ON DELETE CASCADE,
  CONSTRAINT `loan_user_fk` FOREIGN KEY (`apploverId`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `loan` VALUES
(0,'2025-05-01 10:00:00','Emergency medical',50000,5,12,'2025-05-02',1,0,52500,10000,'active'),
(1,'2025-06-01 11:00:00','Business capital',100000,5,24,NULL,NULL,2,110000,0,'pending');

-- =============================
-- LOAN PAYMENTS
-- =============================
CREATE TABLE `loanpayment` (
  `pay_id` int(11) NOT NULL AUTO_INCREMENT,
  `loanId` int(11) NOT NULL,
  `pay_date` datetime NOT NULL DEFAULT current_timestamp(),
  `amount` decimal(10,0) NOT NULL,
  `recorderID` int(11) NOT NULL,
  PRIMARY KEY (`pay_id`),
  CONSTRAINT `loanpayment_loan_fk` FOREIGN KEY (`loanId`) REFERENCES `loan` (`loanId`) ON DELETE CASCADE,
  CONSTRAINT `loanpayment_user_fk` FOREIGN KEY (`recorderID`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `loanpayment` VALUES
(0,0,'2025-06-01 12:00:00',5000,2),
(1,0,'2025-07-01 12:00:00',5000,1),
(2,1,'2025-08-01 12:00:00',10000,1);

-- Auto increment reset
ALTER TABLE `users` AUTO_INCREMENT = 0;
ALTER TABLE `members` AUTO_INCREMENT = 0;
ALTER TABLE `savingtypes` AUTO_INCREMENT = 0;
ALTER TABLE `ptypes` AUTO_INCREMENT = 0;
ALTER TABLE `settings` AUTO_INCREMENT = 0;
ALTER TABLE `savings` AUTO_INCREMENT = 0;
ALTER TABLE `saving_edit_history` AUTO_INCREMENT = 0;
ALTER TABLE `penalties` AUTO_INCREMENT = 0;
ALTER TABLE `loan` AUTO_INCREMENT = 0;
ALTER TABLE `loanpayment` AUTO_INCREMENT = 0;

COMMIT;
