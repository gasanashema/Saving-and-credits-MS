require("dotenv").config();
const jwt = require("jsonwebtoken");
const conn = require("../db/connection");
const { createEventNotification } = require('../utilities/notify.helper');

const addLoan = async (req, res) => {
  try {
    const { amount, duration, re, rate, amountTopay, memberId: bodyMemberId } = req.body;
    const authHeader = req.headers.authorization;
    let memberId = bodyMemberId ? parseInt(bodyMemberId) : 1; // default

    if (!bodyMemberId && authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.substring(7);
        memberId = jwt.verify(token, process.env.JWT_SECRET).id;
      } catch (err) {
        // invalid token, use default
      }
    }
    const dt = new Date();
    const amountNum = parseFloat(amount);
    const durationNum = parseInt(duration);
    const rateNum = parseFloat(rate);
    const amountTopayNum = parseFloat(amountTopay);
    const [loan] = await conn.query(
      "INSERT INTO `loan`(`requestDate`, `re`, `amount`, `duration`,`memberId`, `amountTopay`,`rate`) VALUES (?,?,?,?,?,?,?)",
      [dt, re, amountNum, durationNum, memberId, amountTopayNum, rateNum]
    );

    // Notify all admins about new loan application
    try {
      await createEventNotification({ type: 'loan_applied', loanId: loan.insertId });
    } catch (e) {
      console.error('Failed to create admin notifications for loan application', e);
    }

    return res.json({ status: 201, message: "loan Request success", loan });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ error: error.message });
  }
};

const loanAction = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const { loanId, action } = req.params;
    let userId = { id: 1 }; // default

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      userId = jwt.verify(token, process.env.JWT_SECRET);
    }
    const dt = new Date();

    if (action === 'cancel') {
      // For cancel, check if member owns the loan
      const [loanCheck] = await conn.query(
        "SELECT memberId FROM `loan` WHERE loanId=?",
        [loanId]
      );
      if (loanCheck.length === 0 || loanCheck[0].memberId !== userId.id) {
        return res.status(403).json({ error: "Unauthorized to cancel this loan" });
      }
      const [result] = await conn.query(
        "DELETE FROM `loan` WHERE loanId=? AND status='pending'",
        [loanId]
      );
      return res.json({ data: result, message: "Loan cancelled successfully" });
    } else {
      // For approve/reject, admin action
      const approverId = userId.id;
      const [result] = await conn.query(
        "UPDATE `loan` SET status=?, apploverId=?, applovedDate=? WHERE loanId=?",
        [action, approverId, dt, loanId]
      );

      // Notify member about status change
      try {
        if (action === 'active') {
          await createEventNotification({ type: 'loan_approved', loanId, senderAdminId: approverId });
        } else if (action === 'rejected') {
          await createEventNotification({ type: 'loan_rejected', loanId, senderAdminId: approverId });
        }
      } catch (e) {
        console.error('Failed to create notification for loan action', e);
      }

      return res.json({ data: result, message: "igikorwa cyangenze neza cyane" });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
const getMemberLoans = async (req, res) => {
  const { memberId } = req.params;
  try {
    const [loans] = await conn.query(
      "SELECT `loanId`, `requestDate`, `re`, `amount`, `rate`, `duration`, `applovedDate`, `apploverId`, `memberId`, `amountTopay`, `payedAmount`, loan.status as lstatus, members.id as member_id, `nid`, `firstName`, `lastName` FROM `loan` INNER JOIN members ON members.id = loan.memberId WHERE loan.memberId = ?",
      [parseInt(memberId)]
    );
    return res.json(loans);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
const getLoanHistory = async (req, res) => {
  try {
    const [history] = await conn.query(
      "SELECT pay_date date, fullname, amount FROM `loanpayment` INNER JOIN users WHERE users.user_id=recorderID AND loanId=?",
      [req.params.id]
    );
    return res.json(history);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
const getAllLoans = async (req, res) => {
  const { status, start, end } = req.params;
  try {
    const [loans] = await conn.query(
      "SELECT `loanId`, `requestDate`, `re`, `amount`, `rate`, `duration`, `applovedDate`, `apploverId`, `memberId`, `amountTopay`, `payedAmount`, loan.status lstatus, members.id as member_id, `nid`, `firstName`, `lastName` FROM `loan` INNER JOIN members ON members.id = loan.memberId WHERE loan.status = ? LIMIT ?, ?",
      [status, Number(start), Number(end)]
    );
    return res.json(loans);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
const payLoan = async (req, res) => {
  try {
    const { loanId, amount } = req.body;
    const authHeader = req.headers.authorization;
    const dt = new Date();
    let userId = 1; // default
    let recorderID = 1; // default admin

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      userId = decoded.id;
      // If the user is a member, recorderID is admin 1; if admin, use their userId
      recorderID = decoded.role === 'member' ? 1 : userId;
    }

    // Insert the payment
    const payment = await conn.query(
      "INSERT INTO `loanpayment`(`loanId`, `amount`, `recorderID`) VALUES(?,?,?)",
      [loanId, amount, recorderID]
    );

    // Sum all payments for this loan
    const [paymentSum] = await conn.query(
      "SELECT SUM(amount) as totalPaid FROM `loanpayment` WHERE `loanId`=?",
      [loanId]
    );

    const totalPaid = paymentSum[0].totalPaid || 0;

    // Get loan details to check amountTopay
    const [loanDetails] = await conn.query(
      "SELECT amountTopay FROM `loan` WHERE `loanId`=?",
      [loanId]
    );

    const amountTopay = loanDetails[0].amountTopay;
    const newStatus = totalPaid >= amountTopay ? 'paid' : 'active';

    // Update loan with new payedAmount and status
    await conn.query(
      "UPDATE `loan` SET `payedAmount`=?,`status`=? WHERE `loanId`=?",
      [totalPaid, newStatus, loanId]
    );

    // Notify member about payment recorded
    try {
      await createEventNotification({ type: 'payment_received', loanId, senderAdminId: recorderID });
    } catch (e) {
      console.error('Failed to create payment notification', e);
    }

    return res.json({ status: 201, message: "pay successfully", payment, totalPaid, newStatus });
  } catch (error) {
    res.status(400).json({ error: JSON.stringify(error) });
    throw error;
  }
};
const getTotal = async (req, res) => {
  const { search } = req.params;
  try {
    const sql =
      search == "all"
        ? "SELECT count(*) total  FROM loan"
        : `SELECT count(*) total  FROM loan WHERE pstatus='${search}'`;
    const [data] = await conn.query(sql);
    return res.json(data[0].total);
  } catch (error) {
    res.status(400).json({ error: JSON.stringify(error) });
    throw error;
  }
};
const getLoansByStatus = async (req, res) => {
  const { limit } = req.params;
  try {
    const [loans] = await conn.query(
      "SELECT `loanId`, `requestDate`, `re`, `amount`, `rate`, `duration`, `applovedDate`, `apploverId`, `memberId`, `amountTopay`, `payedAmount`, loan.status as lstatus, members.id as member_id, `nid`, `firstName`, `lastName` FROM `loan` INNER JOIN members ON members.id = loan.memberId LIMIT ?",
      [Number(limit)]
    );
    return res.json(loans);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getAllLoanPayments = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    let memberId = null;

    // Check if request is from a member (has token)
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.substring(7);
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // If user role is member, filter by member ID
        if (decoded.role === 'member') {
          memberId = decoded.id;
        }
      } catch (err) {
        // Token invalid, continue without filtering
      }
    }

    let query = `
      SELECT 
        lp.pay_id,
        lp.pay_date,
        lp.amount,
        lp.loanId,
        l.amount as loan_amount,
        l.amountTopay as amount_to_pay,
        l.payedAmount,
        l.status as loan_status,
        l.rate,
        l.duration,
        l.requestDate as request_date,
        l.applovedDate as approved_date,
        l.re as purpose,
        m.firstName,
        m.lastName,
        m.telephone,
        u.fullname as recorder_name,
        (l.amountTopay - l.payedAmount) as remaining_amount
      FROM loanpayment lp
      INNER JOIN loan l ON lp.loanId = l.loanId 
      INNER JOIN members m ON l.memberId = m.id
      INNER JOIN users u ON lp.recorderID = u.user_id`;
    
    const params = [50];
    
    if (memberId) {
      query += ` WHERE l.memberId = ?`;
      params.unshift(memberId);
    }
    
    query += ` ORDER BY lp.pay_date DESC LIMIT ?`;

    const [payments] = await conn.query(query, params);
    
    res.json({
      payments,
      total: payments.length
    });
  } catch (error) {
    console.error('Error fetching loan payments:', error);
    res.status(500).json({ message: 'Failed to fetch loan payments' });
  }
};

const getLoanPaymentDetails = async (req, res) => {
  const { loanId } = req.params;
  const loanIdNum = parseInt(loanId);
  try {
    // Get loan and member details
    const [loanDetails] = await conn.query(
      `SELECT l.*, m.firstName, m.lastName, m.telephone, m.email
       FROM loan l
       INNER JOIN members m ON l.memberId = m.id
       WHERE l.loanId = ?`,
      [loanIdNum]
    );

    if (!loanDetails || loanDetails.length === 0) {
      return res.status(404).json({ message: "Loan not found" });
    }

    // Get payment history
    const [payments] = await conn.query(
      `SELECT lp.*, u.fullname as recorder_name
       FROM loanpayment lp
       INNER JOIN users u ON lp.recorderID = u.user_id
       WHERE lp.loanId = ?
       ORDER BY lp.pay_date DESC`,
      [loanIdNum]
    );

    // Calculate total paid from payments
    const paidAmount = payments.reduce((sum, payment) => sum + parseFloat(payment.amount), 0);
    const totalAmount = parseFloat(loanDetails[0].amountTopay);
    const remainingAmount = totalAmount - paidAmount;

    const response = {
      loan: loanDetails[0],
      payments: payments,
      summary: {
        totalAmount: totalAmount,
        paidAmount: paidAmount,
        remainingAmount: remainingAmount,
        status: loanDetails[0].status,
      },
    };

    return res.json(response);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: error.message });
  }
};

const getMemberPaymentHistory = async (req, res) => {
  const { memberId } = req.params;
  const memberIdNum = parseInt(memberId);

  try {
    // Get all payments for this member
    const [payments] = await conn.query(
      `SELECT
        lp.pay_id,
        lp.pay_date,
        lp.amount,
        lp.loanId,
        l.amount as loan_amount,
        l.amountTopay as amount_to_pay,
        l.payedAmount,
        l.status as loan_status,
        l.rate,
        l.duration,
        l.requestDate as request_date,
        l.applovedDate as approved_date,
        l.re as purpose,
        m.firstName,
        m.lastName,
        m.telephone,
        u.fullname as recorder_name,
        (l.amountTopay - l.payedAmount) as remaining_amount
      FROM loanpayment lp
      INNER JOIN loan l ON lp.loanId = l.loanId
      INNER JOIN members m ON l.memberId = m.id
      INNER JOIN users u ON lp.recorderID = u.user_id
      WHERE l.memberId = ?
      ORDER BY lp.pay_date DESC`,
      [memberIdNum]
    );

    // Calculate totals
    const totalPaid = payments.reduce((sum, p) => sum + parseFloat(p.amount), 0);
    const totalRemaining = payments.reduce((sum, p) => sum + parseFloat(p.remaining_amount), 0);

    const response = {
      payments,
      summary: {
        totalPayments: payments.length,
        totalAmountPaid: totalPaid,
        totalRemaining: totalRemaining
      }
    };

    return res.json(response);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

module.exports = {
  addLoan,
  getTotal,
  payLoan,
  getMemberLoans,
  getAllLoans,
  loanAction,
  getLoanHistory,
  getLoansByStatus,
  getLoanPaymentDetails,
  getAllLoanPayments,
  getMemberPaymentHistory,
};
