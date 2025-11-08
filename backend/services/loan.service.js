require("dotenv").config();
const jwt = require("jsonwebtoken");
const conn = require("../db/connection");
const addLoan = async (req, res) => {
  try {
    const { amount, duration, re, rate, amountTopay } = req.body;
    const token = req.headers.authorization;
    const memberId = jwt.verify(token, process.env.JWT_SECRET).id;
    const dt = new Date();
    const [loan] = await conn.query(
      "INSERT INTO `loan`(`requestDate`, `re`, `amount`, `duration`,`memberId`, `amountTopay`,`rate`) VALUES (?,?,?,?,?,?,?)",
      [dt, re, amount, duration, memberId, amountTopay, rate]
    );
    return res.json({ status: 201, message: "loan Request success", loan });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ error: error.message });
  }
};

const loanAction = async (req, res) => {
  try {
    const token = req.headers.authorization;
    const { loanId, action } = req.params;
    const approverId = jwt.verify(token, process.env.JWT_SECRET).id;
    const dt = new Date();

    const [users] = await conn.query(
      "UPDATE `loan` set status=?, apploverId=?,   applovedDate=?  WHERE loanId=?",
      [action, approverId, dt, loanId]
    );
    return res.json({ data: users, message: "igikorwa cyangenze neza cyane" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
const getMemberLoans = async (req, res) => {
  const token = req.headers.authorization;
  const memberId = jwt.verify(token, process.env.JWT_SECRET).id;
  try {
    const [users] = await conn.query(
      "SELECT * FROM `loan` WHERE memberId='?'",
      [memberId]
    );
    return res.json(users);
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
      "SELECT `loanId`, `requestDate`, `re`, `amount`, `rate`, `duration`, `applovedDate`, `apploverId`, `memberId`, `amountTopay`, `payedAmount`, loan.status lstatus,`member_id`, `nid`, `firstName`, `lastName` FROM `loan` INNER JOIN members WHERE member_id=memberId AND loan.status = ? LIMIT ?, ?",
      [status, Number(start), Number(end)]
    );
    return res.json(loans);
  } catch (error) {
    console.log();
    res.status(400).json({ error: error.message });
  }
};
const payLoan = async (req, res) => {
  try {
    const { loanId, amount, status } = req.body;
    const token = req.headers.authorization;
    const dt = new Date();
    const userId = jwt.verify(token, process.env.JWT_SECRET).id;
    const payment = await conn.query(
      "INSERT INTO `loanpayment`(`loanId`, `amount`, `recorderID`) VALUES(?,?,?)",
      [loanId, amount, userId]
    );
    await conn.query(
      "UPDATE `loan` SET `payedAmount`=payedAmount+?,`status`=? WHERE `loanId`=?",
      [amount, status, loanId]
    );
    return res.json({ status: 201, message: "pay successfully", payment });
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
    console.log({ search });
    res.status(400).json({ error: JSON.stringify(error) });
    throw error;
  }
};
const getLoansByStatus = async (req, res) => {
  const {limit } = req.params;
  try {
    const [loans] = await conn.query(
      "SELECT `loanId`, `requestDate`, `re`, `amount`, `rate`, `duration`, `applovedDate`, `apploverId`, `memberId`, `amountTopay`, `payedAmount`, loan.status as lstatus, members.id as member_id, `nid`, `firstName`, `lastName` FROM `loan` INNER JOIN members ON members.id = loan.memberId LIMIT ?",
      [Number(limit)]
    );
    return res.json(loans);
  } catch (error) {
    console.log();
    res.status(400).json({ error: error.message });
  }
};

const getAllLoanPayments = async (req, res) => {
  const { limit = 50 } = req.query; // Default limit of 50 recent payments
  try {
    const [payments] = await conn.query(
      `SELECT 
        lp.pay_id,
        lp.pay_date,
        lp.amount as payment_amount,
        l.loanId,
        l.amount as loan_amount,
        l.amountTopay,
        l.payedAmount,
        l.status as loan_status,
        m.firstName,
        m.lastName,
        m.telephone,
        u.fullname as recorder_name
       FROM loanpayment lp 
       INNER JOIN loan l ON lp.loanId = l.loanId
       INNER JOIN members m ON l.memberId = m.id
       INNER JOIN users u ON lp.recorderID = u.user_id 
       ORDER BY lp.pay_date DESC
       LIMIT ?`,
      [Number(limit)]
    );

    const response = {
      payments: payments.map(payment => ({
        ...payment,
        remainingAmount: payment.amountTopay - payment.payedAmount
      })),
      total: payments.length
    };

    return res.json(response);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: error.message });
  }
};

const getLoanPaymentDetails = async (req, res) => {
  const { loanId } = req.params;
  try {
    // Get loan and member details
    const [loanDetails] = await conn.query(
      `SELECT l.*, m.firstName, m.lastName, m.telephone, m.email 
       FROM loan l 
       INNER JOIN members m ON l.memberId = m.id 
       WHERE l.loanId = ?`,
      [loanId]
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
      [loanId]
    );

    const response = {
      loan: loanDetails[0],
      payments: payments,
      summary: {
        totalAmount: loanDetails[0].amountTopay,
        paidAmount: loanDetails[0].payedAmount,
        remainingAmount: loanDetails[0].amountTopay - loanDetails[0].payedAmount,
        status: loanDetails[0].status
      }
    };

    return res.json(response);
  } catch (error) {
    console.log(error);
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
  getAllLoanPayments
};
