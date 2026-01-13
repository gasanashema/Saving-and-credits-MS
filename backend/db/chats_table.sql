-- Add missing chats table to existing database
-- Run this SQL to add the chats table

CREATE TABLE `chats` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `sender_type` enum('admin','member') NOT NULL,
  `sender_id` int(11) NOT NULL,
  `receiver_type` enum('admin','member') NOT NULL,
  `receiver_id` int(11) NOT NULL,
  `message` text NOT NULL,
  `is_read` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Optional: Add some demo chat data
INSERT INTO `chats` (`sender_type`, `sender_id`, `receiver_type`, `receiver_id`, `message`, `is_read`, `created_at`) VALUES
('admin', 1, 'member', 1, 'Welcome to our savings system!', 1, '2025-01-01 10:00:00'),
('member', 1, 'admin', 1, 'Thank you! How do I apply for a loan?', 0, '2025-01-01 10:05:00'),
('admin', 1, 'member', 2, 'Your loan application has been received.', 0, '2025-01-02 11:00:00');