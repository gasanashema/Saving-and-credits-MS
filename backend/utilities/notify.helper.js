const conn = require('../db/connection');

/**
 * Create a notification entry
 * @param {Object} opts
 * @param {number} opts.senderAdminId - admin id who triggers the notification (0 if system)
 * @param {'admin'|'member'} opts.receiverType
 * @param {number} opts.receiverId
 * @param {string} opts.title
 * @param {string} opts.message
 * @param {string|null} opts.url
 */
async function createNotification({ senderAdminId = 0, receiverType, receiverId, title, message, url = null }) {
  const [result] = await conn.query(
    'INSERT INTO notifications (sender_admin_id, receiver_type, receiver_id, title, message, url) VALUES (?, ?, ?, ?, ?, ?)',
    [senderAdminId, receiverType, receiverId, title, message, url]
  );
  return result.insertId;
}

module.exports = {
  createNotification,
};