require("dotenv").config();
const jwt = require("jsonwebtoken");
const conn = require("../db/connection");

const getMemberNotifications = async (req, res) => {
  try {
    const { memberId } = req.params;
    const userId = parseInt(memberId);

    // Get notifications for this member
    // For now, create some sample notifications based on their activity
    const [loans] = await conn.query(
      "SELECT * FROM loan WHERE memberId = ? ORDER BY requestDate DESC LIMIT 5",
      [userId]
    );

    const [payments] = await conn.query(
      "SELECT lp.*, l.amount as loan_amount FROM loanpayment lp INNER JOIN loan l ON lp.loanId = l.loanId WHERE l.memberId = ? ORDER BY lp.pay_date DESC LIMIT 5",
      [userId]
    );

    const [penalties] = await conn.query(
      "SELECT * FROM penalties WHERE memberId = ? ORDER BY date DESC LIMIT 5",
      [userId]
    );

    const notifications = [];

    // Loan notifications
    loans.forEach(loan => {
      if (loan.status === 'pending') {
        notifications.push({
          id: `loan_pending_${loan.loanId}`,
          title: 'Loan Application Pending',
          message: `Your loan application for ${loan.amount} RWF is being reviewed.`,
          date: loan.requestDate,
          read: false,
          type: 'loan'
        });
      } else if (loan.status === 'active') {
        notifications.push({
          id: `loan_approved_${loan.loanId}`,
          title: 'Loan Approved',
          message: `Your loan of ${loan.amount} RWF has been approved and is now active.`,
          date: loan.applovedDate || loan.requestDate,
          read: false,
          type: 'loan'
        });
      } else if (loan.status === 'paid') {
        notifications.push({
          id: `loan_paid_${loan.loanId}`,
          title: 'Loan Fully Paid',
          message: `Congratulations! Your loan has been fully repaid.`,
          date: new Date().toISOString().slice(0, 19).replace('T', ' '),
          read: false,
          type: 'loan'
        });
      }
    });

    // Payment notifications
    payments.forEach(payment => {
      notifications.push({
        id: `payment_${payment.pay_id}`,
        title: 'Payment Received',
        message: `Payment of ${payment.amount} RWF received for your loan.`,
        date: payment.pay_date,
        read: false,
        type: 'repayment'
      });
    });

    // Penalty notifications
    penalties.forEach(penalty => {
      if (penalty.pstatus === 'wait') {
        notifications.push({
          id: `penalty_${penalty.p_id}`,
          title: 'Penalty Due',
          message: `You have an outstanding penalty of ${penalty.amount} RWF.`,
          date: penalty.date,
          read: false,
          type: 'penalty'
        });
      } else {
        notifications.push({
          id: `penalty_paid_${penalty.p_id}`,
          title: 'Penalty Paid',
          message: `Your penalty of ${penalty.amount} RWF has been paid.`,
          date: penalty.PayedArt || penalty.date,
          read: false,
          type: 'penalty'
        });
      }
    });

    // Sort by date descending
    notifications.sort((a, b) => new Date(b.date) - new Date(a.date));

    return res.json(notifications);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: error.message });
  }
};

const markNotificationAsRead = async (req, res) => {
  try {
    const { memberId, notificationId } = req.params;
    // In a real app, you'd store read status in database
    // For now, just return success
    return res.json({ message: 'Notification marked as read' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getMemberNotifications,
  markNotificationAsRead,
};