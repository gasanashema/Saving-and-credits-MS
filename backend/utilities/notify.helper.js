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

/**
 * Create event-based notifications for Android/web notifications
 * @param {Object} opts
 * @param {string} opts.type - event type ('loan_applied', 'loan_approved', etc.)
 * @param {number} opts.loanId - loan ID for loan-related events
 * @param {number} opts.senderAdminId - admin who triggered the event (for approvals)
 */
async function createEventNotification({ type, loanId, senderAdminId = 0 }) {
  try {
    console.log('createEventNotification called with type:', type, 'loanId:', loanId, 'senderAdminId:', senderAdminId);
    let title, message, url, receivers = [];

    if (type === 'loan_applied') {
      // Notify all admins about new loan application
      const [admins] = await conn.query("SELECT user_id FROM users WHERE role IN ('admin','supperadmin','sadmin')");
      receivers = admins.map(a => ({ type: 'admin', id: a.user_id }));
      title = 'New loan application';
      const [loan] = await conn.query(
        'SELECT l.memberId, m.firstName, m.lastName FROM loan l JOIN members m ON l.memberId = m.id WHERE l.loanId = ?',
        [loanId]
      );
      if (loan.length > 0) {
        const memberName = `${loan[0].firstName} ${loan[0].lastName}`;
        message = `${memberName} submitted a loan application`;
      } else {
        message = 'A new loan application has been submitted';
      }
      url = `/admin/loans/${loanId}`;
    } else if (type === 'loan_approved') {
      // Notify member about loan approval
      const [loan] = await conn.query('SELECT memberId FROM loan WHERE loanId = ?', [loanId]);
      if (loan.length > 0) {
        receivers = [{ type: 'member', id: loan[0].memberId }];
        title = 'Loan approved';
        message = `Your loan #${loanId} has been approved`;
        url = `/member/loans/${loanId}`;
      }
    } else if (type === 'loan_rejected') {
      // Notify member about loan rejection
      const [loan] = await conn.query('SELECT memberId FROM loan WHERE loanId = ?', [loanId]);
      if (loan.length > 0) {
        receivers = [{ type: 'member', id: loan[0].memberId }];
        title = 'Loan rejected';
        message = `Your loan #${loanId} has been rejected`;
        url = `/member/loans/${loanId}`;
      }
    } else if (type === 'payment_received') {
      // Notify member about payment recorded
      const [loan] = await conn.query('SELECT memberId FROM loan WHERE loanId = ?', [loanId]);
      if (loan.length > 0) {
        receivers = [{ type: 'member', id: loan[0].memberId }];
        title = 'Payment received';
        message = `Your payment for loan #${loanId} has been recorded`;
        url = `/member/loans/${loanId}`;
      }
    }

    console.log('Receivers for notification:', receivers);
    // Create notifications for all receivers
    const promises = receivers.map(receiver =>
      createNotification({
        senderAdminId,
        receiverType: receiver.type,
        receiverId: receiver.id,
        title,
        message,
        url
      })
    );

    await Promise.all(promises);
    console.log('Notifications created successfully, count:', receivers.length);
    return { success: true, count: receivers.length };
  } catch (error) {
    console.error('Error creating event notification:', error);
    throw error;
  }
}

module.exports = {
  createNotification,
  createEventNotification,
};