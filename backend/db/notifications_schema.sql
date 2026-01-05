-- New tables for notifications feature

CREATE TABLE IF NOT EXISTS notification_groups (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  created_by INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX (created_by)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS notification_group_members (
  id INT AUTO_INCREMENT PRIMARY KEY,
  group_id INT NOT NULL,
  recipient_type ENUM('admin','member') NOT NULL,
  recipient_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_group_member (group_id, recipient_type, recipient_id),
  FOREIGN KEY (group_id) REFERENCES notification_groups(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  sender_admin_id INT NOT NULL,
  receiver_type ENUM('admin','member') NOT NULL,
  receiver_id INT NOT NULL,
  group_id INT DEFAULT NULL,
  title VARCHAR(150) NOT NULL,
  message TEXT NOT NULL,
  is_read TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX (sender_admin_id),
  INDEX (receiver_type, receiver_id),
  INDEX (group_id)
) ENGINE=InnoDB;
