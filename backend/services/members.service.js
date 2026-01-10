const conn = require("../db/connection");
const jwt = require("jsonwebtoken");
const bcrypt = require('bcrypt');

const addMember = async (req, res) => {
  const { nid, firstName, lastName, telephone, email, balance = 0, password = '12345', pin = 12345 } = req.body;

  try {
    // Use the provided bcrypt hash for password "12345"
    const hashedPassword = '$2a$12$TvP1sL65u4Kf7I9GPtZOYeCg1OQ8HTH84rOkeXwRVNR0uE4smi4fK';
    
    const [member] = await conn.query(
      "INSERT INTO `members`(`nid`, `firstName`, `lastName`, `telephone`, `email`, `balance`, `password`, `pin`) VALUES (?,?,?,?,?,?,?,?)",
      [nid, firstName, lastName, telephone, email, balance, hashedPassword, pin]
    );
    return res.json({ status: 201, message: "new Member added", member });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};
const updateMember = async (req, res) => {
  try {
    const { nid, firstName, lastName, telephone } = req.body;

    // Update the member using their unique identifier (nid in this case)
    const [result] = await conn.query(
      "UPDATE `members` SET `firstName` = ?, `lastName` = ?, `telephone` = ?, `nid` = ? WHERE id=?",
      [firstName, lastName, telephone, nid, req.params.id]
    );

    // Check if any rows were affected
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Member not found" });
    }

    return res.json({ status: 200, message: "Member updated successfully" });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

const savingGetAllMembers = async (req, res) => {
  const { start, end } = req.params;
  const dt = new Date();

  const dat = `${dt.getFullYear()}-0${dt.getMonth() + 1}-${dt.getDate()}`;

  try {
    const [users] = await conn.query(
      "SELECT `id`, `nid`, `firstName`, `lastName`, sharevalue,numberOfShares FROM `members` LEFT JOIN savings ON members.id = savings.memberId AND savings.date=? LIMIT ?, ?",
      [dat, Number(start), +end]
    );
    return res.json(users);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
const getOneMemberSavings = async (req, res) => {
  const { id, limit } = req.params;

  try {
    const query =
      limit && limit > 0
        ? "SELECT sav_id,date, shareValue,numberOfShares FROM savings WHERE savings.memberId = ? LIMIT ?"
        : "SELECT sav_id,date, shareValue,numberOfShares FROM savings WHERE savings.memberId = ?";

    const params = limit && limit > 0 ? [id, Number(limit)] : [id];
    const [savings] = await conn.query(query, params);
    
    if (!savings.length) {
      return res
        .status(404)
        .json({ error: "No savings found for the given member" });
    }

    return res.json(savings);
  } catch (error) {
    console.error(error);
    return res.status(400).json({ error: error.message });
  }
};
const getAllMembers = async (req, res) => {
  try {
    const [users] = await conn.query(
      "SELECT  `id`, `nid`, `firstName`, `lastName`, `telephone`, `email`, `balance`, `status` FROM members"
    );
    return res.json(users);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
const getSelectList = async (req, res) => {
  try {
    const [list] = await conn.query(
      "SELECT id as value, CONCAT(firstName,' ',lastName) as name from members"
    );
    return res.json(list);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
const getDashboard = async (req, res) => {
  try {
    const token = req.headers.authorization;
    const id = jwt.verify(token, process.env.JWT_SECRET).id;

    // Fetch member's total shares
    const [shares] = await conn.query(
      "SELECT SUM(numberOfShares) AS shares FROM `savings` WHERE memberId = ?",
      [id]
    );

    // Fetch member's total penalties
    const [penalties] = await conn.query(
      "SELECT SUM(amount) AS penalties FROM `penalties` WHERE memberId = ?",
      [id]
    );

    // Fetch total balance of all members (General balance)
    const [generalBalance] = await conn.query(
      "SELECT SUM(balance) AS generalBalance FROM `members`"
    );

    // Fetch total paid penalties
    const [totalPenaltiesPaid] = await conn.query(
      "SELECT SUM(amount) AS totalPenaltiesPaid FROM `penalties` WHERE pstatus = 'paid'"
    );

    // Fetch total interest from loan payments
    const [totalInterest] = await conn.query(
      "SELECT SUM(amount) AS totalInterest FROM `loanpayment`"
    );

    // Fetch member's outstanding loan
    const [loan] = await conn.query(
      "SELECT SUM(COALESCE(amountTopay, 0) - COALESCE(payedAmount, 0)) AS outstandingLoan FROM loan WHERE memberId = ? AND status = 'active'",
      [id]
    );

    // Fetch member's total savings based on shares
    const [savings] = await conn.query(
      "SELECT SUM(numberOfShares * shareValue) AS savings FROM savings WHERE memberId = ?",
      [id]
    );

    // Fetch total number of shares across all members
    const [totalShares] = await conn.query(
      "SELECT SUM(numberOfShares * shareValue) AS totalShares FROM savings"
    );

    // Improved Interest Calculation Formula:
    let myInterest = 0;
    I =
      Number(totalInterest[0].totalInterest) +
      Number(totalPenaltiesPaid[0].totalPenaltiesPaid);
    if (Number(totalShares[0].totalShares) > 0) {
      myInterest =
        (I * Number(savings[0].savings)) /
        Number(generalBalance[0].generalBalance);
    }

    return res.json({
      I,
      ...totalInterest[0],
      ...totalPenaltiesPaid[0],
      ...shares[0],
      ...penalties[0],
      ...loan[0],
      ...savings[0],
      myInterest,
      ...generalBalance[0],
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ error: error.message, message: "Internal Server Error" });
  }
};
const getTotal = async (req, res) => {
  try {
    const [users] = await conn.query("SELECT count(*) total  FROM members");
    return res.json(users[0].total);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getMemberProfile = async (req, res) => {
  try {
    const token = req.headers.authorization;
    const id = jwt.verify(token, process.env.JWT_SECRET).id;

    const [member] = await conn.query(
      "SELECT id as member_id, nid, firstName, lastName, telephone, email, balance FROM members WHERE id = ?",
      [id]
    );

    if (member.length === 0) {
      return res.status(404).json({ message: "Member not found" });
    }

    return res.json(member[0]);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

const resetPassword = async (req, res) => {
  const { id } = req.params;

  try {
    // Reset to default password "12345" with the provided hash
    const defaultPasswordHash = '$2a$12$TvP1sL65u4Kf7I9GPtZOYeCg1OQ8HTH84rOkeXwRVNR0uE4smi4fK';

    const [result] = await conn.query(
      "UPDATE members SET password = ? WHERE id = ?",
      [defaultPasswordHash, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Member not found" });
    }

    return res.json({ status: 200, message: "Password reset successfully" });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

module.exports = {
  getDashboard,
  addMember,
  getAllMembers,
  getTotal,
  savingGetAllMembers,
  getSelectList,
  updateMember,
  getOneMemberSavings,
  resetPassword,
  getMemberProfile,
};
