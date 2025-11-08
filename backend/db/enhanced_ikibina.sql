-- Enhanced ikibina database with comprehensive data for all 12 months
SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";
SET NAMES utf8mb4;

-- Drop existing tables for clean import
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
(1,'System Admin','supperadmin','sadmin@example.com','$2a$12$TvP1sL65u4Kf7I9GPtZOYeCg1OQ8HTH84rOkeXwRVNR0uE4smi4fK','active'),
(2,'Alice Admin','admin','alice@example.com','$2a$12$TvP1sL65u4Kf7I9GPtZOYeCg1OQ8HTH84rOkeXwRVNR0uE4smi4fK','active'),
(3,'Bob Recorder','admin','bob@example.com','$2a$12$TvP1sL65u4Kf7I9GPtZOYeCg1OQ8HTH84rOkeXwRVNR0uE4smi4fK','active');

-- =============================
-- MEMBERS (Progressive growth throughout the year)
-- =============================
CREATE TABLE `members` (
  `member_id` int(20) NOT NULL AUTO_INCREMENT,
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
  PRIMARY KEY (`member_id`),
  UNIQUE KEY `nid` (`nid`),
  UNIQUE KEY `unique_telephone` (`telephone`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- January members (5 members)
INSERT INTO `members` VALUES
(1,'1200000000000001','NYIRABATESI','Angel','0780000001','nyira@example.com',150000,'$2a$12$TvP1sL65u4Kf7I9GPtZOYeCg1OQ8HTH84rOkeXwRVNR0uE4smi4fK',12345,0,'2024-01-15 10:00:00'),
(2,'1200000000000002','Kamumpa','Allen','0780000002','allen@example.com',85000,'$2a$12$TvP1sL65u4Kf7I9GPtZOYeCg1OQ8HTH84rOkeXwRVNR0uE4smi4fK',12345,0,'2024-01-20 11:00:00'),
(3,'1200000000000003','MUGISHA','Peter','0780000003','peter@example.com',120000,'$2a$12$TvP1sL65u4Kf7I9GPtZOYeCg1OQ8HTH84rOkeXwRVNR0uE4smi4fK',12345,0,'2024-01-25 12:00:00'),
(4,'1200000000000004','SEBAHINZI','Daniel','0780000004','daniel@example.com',95000,'$2a$12$TvP1sL65u4Kf7I9GPtZOYeCg1OQ8HTH84rOkeXwRVNR0uE4smi4fK',12345,0,'2024-01-28 13:00:00'),
(5,'1200000000000005','Kagabo','Jean','0780000005','kagabo@example.com',75000,'$2a$12$TvP1sL65u4Kf7I9GPtZOYeCg1OQ8HTH84rOkeXwRVNR0uE4smi4fK',12345,0,'2024-01-30 14:00:00'),

-- February members (3 new)
(6,'1200000000000006','UWIMANA','Grace','0780000006','grace@example.com',60000,'$2a$12$TvP1sL65u4Kf7I9GPtZOYeCg1OQ8HTH84rOkeXwRVNR0uE4smi4fK',12345,0,'2024-02-10 10:00:00'),
(7,'1200000000000007','NZEYIMANA','Paul','0780000007','paul@example.com',45000,'$2a$12$TvP1sL65u4Kf7I9GPtZOYeCg1OQ8HTH84rOkeXwRVNR0uE4smi4fK',12345,0,'2024-02-18 11:00:00'),
(8,'1200000000000008','MUKAMANA','Sarah','0780000008','sarah@example.com',55000,'$2a$12$TvP1sL65u4Kf7I9GPtZOYeCg1OQ8HTH84rOkeXwRVNR0uE4smi4fK',12345,0,'2024-02-25 12:00:00'),

-- March members (4 new)
(9,'1200000000000009','BIZIMANA','Eric','0780000009','eric@example.com',40000,'$2a$12$TvP1sL65u4Kf7I9GPtZOYeCg1OQ8HTH84rOkeXwRVNR0uE4smi4fK',12345,0,'2024-03-05 10:00:00'),
(10,'1200000000000010','UWAMAHORO','Marie','0780000010','marie@example.com',65000,'$2a$12$TvP1sL65u4Kf7I9GPtZOYeCg1OQ8HTH84rOkeXwRVNR0uE4smi4fK',12345,0,'2024-03-12 11:00:00'),
(11,'1200000000000011','HAKIZIMANA','David','0780000011','david@example.com',70000,'$2a$12$TvP1sL65u4Kf7I9GPtZOYeCg1OQ8HTH84rOkeXwRVNR0uE4smi4fK',12345,0,'2024-03-20 12:00:00'),
(12,'1200000000000012','NYIRAHABIMANA','Claire','0780000012','claire@example.com',50000,'$2a$12$TvP1sL65u4Kf7I9GPtZOYeCg1OQ8HTH84rOkeXwRVNR0uE4smi4fK',12345,0,'2024-03-28 13:00:00'),

-- April members (2 new)
(13,'1200000000000013','MUTABAZI','Frank','0780000013','frank@example.com',35000,'$2a$12$TvP1sL65u4Kf7I9GPtZOYeCg1OQ8HTH84rOkeXwRVNR0uE4smi4fK',12345,0,'2024-04-08 10:00:00'),
(14,'1200000000000014','UWIZEYIMANA','Rose','0780000014','rose@example.com',80000,'$2a$12$TvP1sL65u4Kf7I9GPtZOYeCg1OQ8HTH84rOkeXwRVNR0uE4smi4fK',12345,0,'2024-04-22 11:00:00'),

-- May members (3 new)
(15,'1200000000000015','NIYONZIMA','James','0780000015','james@example.com',90000,'$2a$12$TvP1sL65u4Kf7I9GPtZOYeCg1OQ8HTH84rOkeXwRVNR0uE4smi4fK',12345,0,'2024-05-05 10:00:00'),
(16,'1200000000000016','MUKANDAYISENGA','Agnes','0780000016','agnes@example.com',25000,'$2a$12$TvP1sL65u4Kf7I9GPtZOYeCg1OQ8HTH84rOkeXwRVNR0uE4smi4fK',12345,0,'2024-05-15 11:00:00'),
(17,'1200000000000017','HABIMANA','Joseph','0780000017','joseph@example.com',110000,'$2a$12$TvP1sL65u4Kf7I9GPtZOYeCg1OQ8HTH84rOkeXwRVNR0uE4smi4fK',12345,0,'2024-05-28 12:00:00'),

-- June members (4 new)
(18,'1200000000000018','NYIRAMANA','Beatrice','0780000018','beatrice@example.com',45000,'$2a$12$TvP1sL65u4Kf7I9GPtZOYeCg1OQ8HTH84rOkeXwRVNR0uE4smi4fK',12345,0,'2024-06-03 10:00:00'),
(19,'1200000000000019','UWIMANA','Patrick','0780000019','patrick@example.com',75000,'$2a$12$TvP1sL65u4Kf7I9GPtZOYeCg1OQ8HTH84rOkeXwRVNR0uE4smi4fK',12345,0,'2024-06-10 11:00:00'),
(20,'1200000000000020','MUKAMUGANGA','Immaculee','0780000020','immaculee@example.com',55000,'$2a$12$TvP1sL65u4Kf7I9GPtZOYeCg1OQ8HTH84rOkeXwRVNR0uE4smi4fK',12345,0,'2024-06-18 12:00:00'),
(21,'1200000000000021','BIZUMUREMYI','Emmanuel','0780000021','emmanuel@example.com',85000,'$2a$12$TvP1sL65u4Kf7I9GPtZOYeCg1OQ8HTH84rOkeXwRVNR0uE4smi4fK',12345,0,'2024-06-25 13:00:00'),

-- July members (2 new)
(22,'1200000000000022','NYIRABAGENZI','Esperance','0780000022','esperance@example.com',65000,'$2a$12$TvP1sL65u4Kf7I9GPtZOYeCg1OQ8HTH84rOkeXwRVNR0uE4smi4fK',12345,0,'2024-07-08 10:00:00'),
(23,'1200000000000023','HAKIZAMUNGU','Vincent','0780000023','vincent@example.com',95000,'$2a$12$TvP1sL65u4Kf7I9GPtZOYeCg1OQ8HTH84rOkeXwRVNR0uE4smi4fK',12345,0,'2024-07-20 11:00:00'),

-- August members (3 new)
(24,'1200000000000024','UWAMWEZI','Claudine','0780000024','claudine@example.com',40000,'$2a$12$TvP1sL65u4Kf7I9GPtZOYeCg1OQ8HTH84rOkeXwRVNR0uE4smi4fK',12345,0,'2024-08-05 10:00:00'),
(25,'1200000000000025','NZABONIMPA','Robert','0780000025','robert@example.com',70000,'$2a$12$TvP1sL65u4Kf7I9GPtZOYeCg1OQ8HTH84rOkeXwRVNR0uE4smi4fK',12345,0,'2024-08-15 11:00:00'),
(26,'1200000000000026','MUKANDORI','Vestine','0780000026','vestine@example.com',30000,'$2a$12$TvP1sL65u4Kf7I9GPtZOYeCg1OQ8HTH84rOkeXwRVNR0uE4smi4fK',12345,0,'2024-08-28 12:00:00'),

-- September members (4 new)
(27,'1200000000000027','BIZIMUNGU','Alphonse','0780000027','alphonse@example.com',100000,'$2a$12$TvP1sL65u4Kf7I9GPtZOYeCg1OQ8HTH84rOkeXwRVNR0uE4smi4fK',12345,0,'2024-09-02 10:00:00'),
(28,'1200000000000028','NYIRANEZA','Chantal','0780000028','chantal@example.com',60000,'$2a$12$TvP1sL65u4Kf7I9GPtZOYeCg1OQ8HTH84rOkeXwRVNR0uE4smi4fK',12345,0,'2024-09-12 11:00:00'),
(29,'1200000000000029','UWIMANA','Gilbert','0780000029','gilbert@example.com',80000,'$2a$12$TvP1sL65u4Kf7I9GPtZOYeCg1OQ8HTH84rOkeXwRVNR0uE4smi4fK',12345,0,'2024-09-20 12:00:00'),
(30,'1200000000000030','MUKAMANA','Solange','0780000030','solange@example.com',45000,'$2a$12$TvP1sL65u4Kf7I9GPtZOYeCg1OQ8HTH84rOkeXwRVNR0uE4smi4fK',12345,0,'2024-09-28 13:00:00'),

-- October members (2 new)
(31,'1200000000000031','HABIYAMBERE','Innocent','0780000031','innocent@example.com',55000,'$2a$12$TvP1sL65u4Kf7I9GPtZOYeCg1OQ8HTH84rOkeXwRVNR0uE4smi4fK',12345,0,'2024-10-10 10:00:00'),
(32,'1200000000000032','NYIRAHABIMANA','Francine','0780000032','francine@example.com',75000,'$2a$12$TvP1sL65u4Kf7I9GPtZOYeCg1OQ8HTH84rOkeXwRVNR0uE4smi4fK',12345,0,'2024-10-25 11:00:00'),

-- November members (3 new)
(33,'1200000000000033','MUKAMUGIRE','Jeanne','0780000033','jeanne@example.com',35000,'$2a$12$TvP1sL65u4Kf7I9GPtZOYeCg1OQ8HTH84rOkeXwRVNR0uE4smi4fK',12345,0,'2024-11-08 10:00:00'),
(34,'1200000000000034','NZEYIMANA','Celestin','0780000034','celestin@example.com',90000,'$2a$12$TvP1sL65u4Kf7I9GPtZOYeCg1OQ8HTH84rOkeXwRVNR0uE4smi4fK',12345,0,'2024-11-18 11:00:00'),
(35,'1200000000000035','UWAMAHORO','Drocelle','0780000035','drocelle@example.com',65000,'$2a$12$TvP1sL65u4Kf7I9GPtZOYeCg1OQ8HTH84rOkeXwRVNR0uE4smi4fK',12345,0,'2024-11-28 12:00:00'),

-- December members (2 new)
(36,'1200000000000036','BIZIMANA','Theogene','0780000036','theogene@example.com',50000,'$2a$12$TvP1sL65u4Kf7I9GPtZOYeCg1OQ8HTH84rOkeXwRVNR0uE4smi4fK',12345,0,'2024-12-05 10:00:00'),
(37,'1200000000000037','NYIRAMUGWERA','Consolee','0780000037','consolee@example.com',85000,'$2a$12$TvP1sL65u4Kf7I9GPtZOYeCg1OQ8HTH84rOkeXwRVNR0uE4smi4fK',12345,0,'2024-12-20 11:00:00');

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
-- PENALTY TYPES
-- =============================
CREATE TABLE `ptypes` (
  `ptId` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(100) NOT NULL,
  `amount` decimal(22,0) NOT NULL,
  `description` text NOT NULL,
  PRIMARY KEY (`ptId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `ptypes` VALUES
(1,'GUSIBA GUTERA',500,'kurenza amasaha yoguterana utaratanga amafaranga na mpavu yumvikana'),
(2,'GUSAKUZA',300,'Guteza urusaku mugiterane'),
(3,'GUKERERWA',200,'kuza nyuma yisaha yemejwe nabanyamuryango');

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
(1,'general','{"savingDay":"2"}');

-- =============================
-- LOANS (Distributed throughout the year)
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
  CONSTRAINT `loan_member_fk` FOREIGN KEY (`memberId`) REFERENCES `members` (`member_id`) ON DELETE CASCADE,
  CONSTRAINT `loan_user_fk` FOREIGN KEY (`apploverId`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `loan` VALUES
-- January loans
(1,'2024-01-15 10:00:00','Emergency medical expenses',50000,5,12,'2024-01-16',1,1,52500,52500,'paid'),
(2,'2024-01-25 11:00:00','Business capital',100000,5,24,'2024-01-26',2,3,105000,45000,'active'),

-- February loans
(3,'2024-02-10 09:00:00','School fees',75000,5,18,'2024-02-11',1,6,78750,78750,'paid'),
(4,'2024-02-20 14:00:00','Home renovation',120000,5,36,NULL,NULL,7,126000,0,'pending'),

-- March loans
(5,'2024-03-05 08:00:00','Agricultural inputs',80000,5,12,'2024-03-06',2,9,84000,30000,'active'),
(6,'2024-03-15 13:00:00','Medical treatment',60000,5,24,'2024-03-16',1,11,63000,63000,'paid'),
(7,'2024-03-25 10:00:00','Business expansion',150000,5,36,NULL,NULL,12,157500,0,'rejected'),

-- April loans
(8,'2024-04-08 11:00:00','Emergency repair',40000,5,6,'2024-04-09',2,13,42000,42000,'paid'),
(9,'2024-04-18 15:00:00','Education loan',90000,5,24,'2024-04-19',1,14,94500,25000,'active'),

-- May loans
(10,'2024-05-05 09:00:00','Vehicle purchase',200000,5,48,'2024-05-06',2,15,210000,50000,'active'),
(11,'2024-05-20 12:00:00','Wedding expenses',85000,5,18,NULL,NULL,16,89250,0,'pending'),

-- June loans
(12,'2024-06-03 10:00:00','Business stock',110000,5,24,'2024-06-04',1,18,115500,35000,'active'),
(13,'2024-06-15 14:00:00','Home appliances',70000,5,12,'2024-06-16',2,20,73500,73500,'paid'),

-- July loans
(14,'2024-07-08 08:00:00','Agricultural equipment',95000,5,36,'2024-07-09',1,22,99750,20000,'active'),
(15,'2024-07-22 11:00:00','Emergency fund',45000,5,6,NULL,NULL,23,47250,0,'rejected'),

-- August loans
(16,'2024-08-05 13:00:00','Business loan',130000,5,30,'2024-08-06',2,24,136500,40000,'active'),
(17,'2024-08-18 09:00:00','Medical expenses',55000,5,12,'2024-08-19',1,25,57750,57750,'paid'),

-- September loans
(18,'2024-09-02 10:00:00','Education fees',75000,5,18,'2024-09-03',2,27,78750,25000,'active'),
(19,'2024-09-15 14:00:00','Home construction',180000,5,48,NULL,NULL,28,189000,0,'pending'),

-- October loans
(20,'2024-10-10 11:00:00','Business expansion',105000,5,24,'2024-10-11',1,31,110250,30000,'active'),
(21,'2024-10-25 15:00:00','Emergency repair',35000,5,6,'2024-10-26',2,32,36750,36750,'paid'),

-- November loans
(22,'2024-11-08 09:00:00','Agricultural loan',88000,5,18,'2024-11-09',1,33,92400,20000,'active'),
(23,'2024-11-20 12:00:00','Medical treatment',65000,5,12,NULL,NULL,34,68250,0,'pending'),

-- December loans
(24,'2024-12-05 10:00:00','Year-end business',125000,5,36,'2024-12-06',2,36,131250,25000,'active'),
(25,'2024-12-18 13:00:00','Holiday expenses',50000,5,6,'2024-12-19',1,37,52500,15000,'active');

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
-- Payments for various loans throughout the year
(1,1,'2024-02-15 12:00:00',25000,1),
(2,1,'2024-03-15 12:00:00',27500,1),
(3,2,'2024-02-25 10:00:00',15000,2),
(4,2,'2024-03-25 10:00:00',15000,2),
(5,2,'2024-04-25 10:00:00',15000,1),
(6,3,'2024-03-10 14:00:00',40000,2),
(7,3,'2024-04-10 14:00:00',38750,2),
(8,5,'2024-04-05 09:00:00',15000,1),
(9,5,'2024-05-05 09:00:00',15000,1),
(10,6,'2024-04-15 11:00:00',30000,2),
(11,6,'2024-05-15 11:00:00',33000,2),
(12,8,'2024-05-08 13:00:00',20000,1),
(13,8,'2024-06-08 13:00:00',22000,1),
(14,9,'2024-05-18 16:00:00',12000,2),
(15,9,'2024-06-18 16:00:00',13000,2),
(16,10,'2024-06-05 10:00:00',25000,1),
(17,10,'2024-07-05 10:00:00',25000,1),
(18,12,'2024-07-03 11:00:00',17000,2),
(19,12,'2024-08-03 11:00:00',18000,2),
(20,13,'2024-07-15 15:00:00',35000,1),
(21,13,'2024-08-15 15:00:00',38500,1),
(22,14,'2024-08-08 09:00:00',10000,2),
(23,14,'2024-09-08 09:00:00',10000,2),
(24,16,'2024-09-05 14:00:00',20000,1),
(25,16,'2024-10-05 14:00:00',20000,1),
(26,17,'2024-09-18 10:00:00',28000,2),
(27,17,'2024-10-18 10:00:00',29750,2),
(28,18,'2024-10-02 11:00:00',12000,1),
(29,18,'2024-11-02 11:00:00',13000,1),
(30,20,'2024-11-10 12:00:00',15000,2),
(31,20,'2024-12-10 12:00:00',15000,2),
(32,21,'2024-11-25 16:00:00',18000,1),
(33,21,'2024-12-25 16:00:00',18750,1),
(34,22,'2024-12-08 10:00:00',10000,2),
(35,22,'2024-12-28 10:00:00',10000,2),
(36,24,'2024-12-20 11:00:00',12000,1),
(37,24,'2024-12-30 11:00:00',13000,1),
(38,25,'2024-12-25 14:00:00',7500,2),
(39,25,'2024-12-31 14:00:00',7500,2);

-- =============================
-- SAVINGS (Monthly data for all members)
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
  CONSTRAINT `savings_member_fk` FOREIGN KEY (`memberId`) REFERENCES `members` (`member_id`) ON DELETE CASCADE,
  CONSTRAINT `savings_type_fk` FOREIGN KEY (`stId`) REFERENCES `savingtypes` (`stId`),
  CONSTRAINT `savings_user_fk` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Sample savings data for key members throughout the year
INSERT INTO `savings` VALUES
-- January savings
(1,'2024-01-31',1,1,5,10000,1,'2024-01-31 10:00:00','2024-01-31 10:00:00'),
(2,'2024-01-31',2,2,3,3000,1,'2024-01-31 11:00:00','2024-01-31 11:00:00'),
(3,'2024-01-31',3,3,4,5000,2,'2024-01-31 12:00:00','2024-01-31 12:00:00'),

-- February savings
(4,'2024-02-29',1,1,6,10000,1,'2024-02-29 10:00:00','2024-02-29 10:00:00'),
(5,'2024-02-29',2,2,4,3000,1,'2024-02-29 11:00:00','2024-02-29 11:00:00'),
(6,'2024-02-29',6,2,2,3000,2,'2024-02-29 12:00:00','2024-02-29 12:00:00'),

-- March savings
(7,'2024-03-31',1,1,7,10000,1,'2024-03-31 10:00:00','2024-03-31 10:00:00'),
(8,'2024-03-31',9,3,3,5000,2,'2024-03-31 11:00:00','2024-03-31 11:00:00'),
(9,'2024-03-31',10,1,2,10000,1,'2024-03-31 12:00:00','2024-03-31 12:00:00'),

-- Continue with more savings data for remaining months...
(10,'2024-04-30',13,2,2,3000,2,'2024-04-30 10:00:00','2024-04-30 10:00:00'),
(11,'2024-05-31',15,1,4,10000,1,'2024-05-31 11:00:00','2024-05-31 11:00:00'),
(12,'2024-06-30',18,3,3,5000,2,'2024-06-30 12:00:00','2024-06-30 12:00:00'),
(13,'2024-07-31',22,2,5,3000,1,'2024-07-31 10:00:00','2024-07-31 10:00:00'),
(14,'2024-08-31',24,1,3,10000,2,'2024-08-31 11:00:00','2024-08-31 11:00:00'),
(15,'2024-09-30',27,3,4,5000,1,'2024-09-30 12:00:00','2024-09-30 12:00:00'),
(16,'2024-10-31',31,2,3,3000,2,'2024-10-31 10:00:00','2024-10-31 10:00:00'),
(17,'2024-11-30',33,1,5,10000,1,'2024-11-30 11:00:00','2024-11-30 11:00:00'),
(18,'2024-12-31',36,3,6,5000,2,'2024-12-31 12:00:00','2024-12-31 12:00:00');

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
  CONSTRAINT `penalties_member_fk` FOREIGN KEY (`memberId`) REFERENCES `members` (`member_id`) ON DELETE CASCADE,
  CONSTRAINT `penalties_user_fk` FOREIGN KEY (`confirmedBy`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `penalties` VALUES
(1,'2024-02-10 09:00:00',1,500,2,'paid','2024-02-15 08:00:00',1),
(2,'2024-03-15 10:00:00',2,300,7,'wait',NULL,2),
(3,'2024-04-20 11:00:00',3,200,13,'paid','2024-04-25 09:00:00',1),
(4,'2024-05-25 12:00:00',1,500,16,'wait',NULL,2),
(5,'2024-06-30 13:00:00',2,300,20,'paid','2024-07-05 10:00:00',1),
(6,'2024-08-15 14:00:00',3,200,25,'wait',NULL,2),
(7,'2024-09-20 15:00:00',1,500,28,'paid','2024-09-25 11:00:00',1),
(8,'2024-10-25 16:00:00',2,300,32,'wait',NULL,2),
(9,'2024-11-30 17:00:00',3,200,34,'paid','2024-12-05 12:00:00',1),
(10,'2024-12-15 18:00:00',1,500,37,'wait',NULL,2);

-- =============================
-- SAVING EDIT HISTORY
-- =============================
CREATE TABLE `saving_edit_history` (
  `historyId` int(11) NOT NULL AUTO_INCREMENT,
  `savId` int(11) NOT NULL,
  `date` date NOT NULL,
  `memberId` int(11) NOT NULL,
  `stId` int(11) NOT NULL,
  `numberOfShares` decimal(12,0) NOT NULL,
  `shareValue` decimal(12,0) NOT NULL,
  `user_id` int(11) NOT NULL,
  `createdAt` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`historyId`),
  CONSTRAINT `seh_sav_fk` FOREIGN KEY (`savId`) REFERENCES `savings` (`sav_id`) ON DELETE CASCADE,
  CONSTRAINT `seh_member_fk` FOREIGN KEY (`memberId`) REFERENCES `members` (`member_id`) ON DELETE CASCADE,
  CONSTRAINT `seh_type_fk` FOREIGN KEY (`stId`) REFERENCES `savingtypes` (`stId`),
  CONSTRAINT `seh_user_fk` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `saving_edit_history` VALUES
(1,1,'2024-01-31',1,1,5,10000,1,'2024-02-01 10:05:00'),
(2,4,'2024-02-29',1,1,6,10000,1,'2024-03-01 11:05:00'),
(3,7,'2024-03-31',1,1,7,10000,1,'2024-04-01 12:05:00');

COMMIT;