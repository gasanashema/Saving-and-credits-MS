SET FOREIGN_KEY_CHECKS=0;

CREATE TABLE IF NOT EXISTS `savings` (
  `sav_id` int(11) NOT NULL AUTO_INCREMENT,
  `date` date NOT NULL,
  `memberId` int(11) NOT NULL,
  `stId` int(11) NOT NULL,
  `numberOfShares` decimal(12,0) NOT NULL DEFAULT 0,
  `shareValue` decimal(12,0) NOT NULL DEFAULT 0,
  `user_id` int(11) NOT NULL DEFAULT 1,
  `updatedAt` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `createdAt` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`sav_id`),
  KEY `savings_member_fk` (`memberId`),
  KEY `savings_type_fk` (`stId`),
  KEY `savings_user_fk` (`user_id`),
  CONSTRAINT `savings_member_fk` FOREIGN KEY (`memberId`) REFERENCES `members` (`id`) ON DELETE CASCADE,
  CONSTRAINT `savings_type_fk` FOREIGN KEY (`stId`) REFERENCES `savingtypes` (`stId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `savings` (`sav_id`, `date`, `memberId`, `stId`, `numberOfShares`, `shareValue`, `user_id`, `updatedAt`, `createdAt`) VALUES
(1, '2026-01-01', 9, 1, 2, 10000, 1, '2026-01-01 10:00:00', '2026-01-01 10:00:00'),
(2, '2026-01-01', 9, 2, 3, 3000, 1, '2026-01-01 10:05:00', '2026-01-01 10:05:00'),
(3, '2026-01-08', 9, 1, 1, 10000, 1, '2026-01-08 10:00:00', '2026-01-08 10:00:00'),
(4, '2026-01-08', 9, 3, 2, 5000, 1, '2026-01-08 10:10:00', '2026-01-08 10:10:00'),
(5, '2026-01-11', 9, 2, 2, 60000, 1, '2026-01-11 20:32:11', '2026-01-11 22:32:11'),
(6, '2026-01-11', 9, 1, 1, 10000, 1, '2026-01-11 20:35:08', '2026-01-11 22:35:08'),
(7, '2026-01-14', 9, 1, 3, 10000, 1, '2026-01-14 09:00:00', '2026-01-14 09:00:00'),
(8, '2026-01-14', 9, 2, 5, 3000, 1, '2026-01-14 09:15:00', '2026-01-14 09:15:00');

SET FOREIGN_KEY_CHECKS=1;
