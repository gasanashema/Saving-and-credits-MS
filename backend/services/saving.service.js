require("dotenv").config();
const jwt = require("jsonwebtoken");
const conn = require("../db/connection");
const penalityQueryGenerator = require("../db/query");
const editSaving = async (req, res) => {
  try {
    const { savId, memberId, stId, numberOfShares, shareValue } = req.body;
    const token = req.headers.authorization;
    const dt = new Date();
    const userId = jwt.verify(token, process.env.JWT_SECRET).id;
    const [recorder] = await conn.query(
      "INSERT INTO `saving_edit_history`(`savId`,`date`, `memberId`, `stId`, `numberOfShares`, `shareValue`, `user_id`) SELECT  `sav_id`, `date`, `memberId`, `stId`, `numberOfShares`, `shareValue`, `user_id` FROM `savings` WHERE  sav_id= ?",
      [savId]
    );
    const [updeter] = await conn.query(
      "UPDATE savings Set `memberId`=?, `stId`=?, `numberOfShares`=?, `shareValue`=?, `user_id`=?, `updatedAt`=? WHERE sav_id =? ",
      [memberId, stId, numberOfShares, shareValue, userId, dt, savId]
    );
    
    const total = numberOfShares * shareValue;
    await conn.query(
      "UPDATE members set balance= balance + ? where id=?",
      [total, memberId]
    );

    return res.json({
      status: 201,
      message: "Data updated",
      updeter,
      recorder,
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ error: error.message });
  }
};
const addSavig = async (req, res) => {
  try {
    const { memberId, stId, numberOfShares, shareValue } = req.body;
    const token = req.headers.authorization;
    const dt = new Date();
    const dateStr = dt.toISOString().split('T')[0]; // YYYY-MM-DD
    let userId = 1; // default
    if (token) {
      try {
        userId = jwt.verify(token, process.env.JWT_SECRET).id;
      } catch (err) {
        // invalid token, use default
      }
    }
    console.log('addSavig called with body:', req.body);
    console.log('resolved userId:', userId);
    const memberIdNum = parseInt(memberId);
    const stIdNum = parseInt(stId);
    const numberOfSharesNum = parseFloat(numberOfShares);
    const shareValueNum = parseFloat(shareValue);

    // Basic validation (allow memberId or stId to be 0 if present in DB)
    if (memberIdNum === undefined || memberIdNum === null || isNaN(memberIdNum)) {
      console.log('Invalid memberId:', memberId);
      return res.status(400).json({ error: 'Invalid memberId' });
    }

    if (stIdNum === undefined || stIdNum === null || isNaN(stIdNum)) {
      console.log('Invalid stId:', stId);
      return res.status(400).json({ error: 'Invalid saving type (stId)' });
    }

    if (!numberOfSharesNum || numberOfSharesNum <= 0 || !shareValueNum || shareValueNum <= 0) {
      console.log('Invalid share values:', numberOfShares, shareValue);
      return res.status(400).json({ error: 'Invalid numberOfShares or shareValue' });
    }

    // Ensure member exists
    const [memberRows] = await conn.query(
      'SELECT id FROM members WHERE id = ?',
      [memberIdNum]
    );
    if (!memberRows || memberRows.length === 0) {
      console.log('Member not found for id:', memberIdNum);
      return res.status(400).json({ error: 'Member not found' });
    }

    // Ensure saving type exists
    const [typeRows] = await conn.query(
      'SELECT stId FROM savingtypes WHERE stId = ?',
      [stIdNum]
    );
    if (!typeRows || typeRows.length === 0) {
      console.log('Saving type not found for stId:', stIdNum);
      return res.status(400).json({ error: 'Saving type not found' });
    }

    const [insertResult] = await conn.query(
      "INSERT INTO `savings`(`date`, `memberId`, `stId`, `numberOfShares`, `shareValue`, `user_id`, `updatedAt`, `createdAt`) VALUES (?,?,?,?,?,?,?,?)",
      [dateStr, memberIdNum, stIdNum, numberOfSharesNum, shareValueNum, userId, dt, dt]
    );
    console.log('savings INSERT result:', insertResult);
    const total = numberOfSharesNum * shareValueNum;
    const [updateResult] = await conn.query(
      "UPDATE members set balance= balance + ? where id=?",
      [total, memberIdNum]
    );
    console.log('members UPDATE result:', updateResult);

    return res.json({ status: 201, message: "new saving added", insertResult, updateResult });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ error: error.message });
  }
};


const getAllSavings = async (req, res) => {
  const { limit } = req.params;
  const actualLimit = limit && limit > 0 ? limit : 40;
  
  try {
    const token = req.headers.authorization;
    let memberId = null;
    
    // Check if request is from a member
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded.role === 'member') {
          memberId = decoded.id;
        }
      } catch (err) {
        // Token invalid, continue without filtering
      }
    }

    let query = "SELECT members.id AS id, `sav_id`, `nid`, `firstName`, `lastName`, telephone, savings.date, savings.shareValue, `numberOfShares`, (savings.shareValue * savings.numberOfShares) as total FROM `members` INNER JOIN savings ON members.id = savings.memberId";
    const params = [Number(actualLimit)];

    if (memberId) {
      query += " WHERE members.id = ?";
      params.unshift(memberId);
    }
    
    query += " ORDER BY savings.updatedAt DESC LIMIT ?";

    const [users] = await conn.query(query, params);
    return res.json(users);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
const getSavings = async (req, res) => {
  const { date } = req.body;

  try {
    const [users] = await conn.query(
      "SELECT members.id AS id, `sav_id`, `nid`, `firstName`, `lastName`, savings.shareValue, `numberOfShares`, (savings.shareValue*`numberOfShares`) as total FROM `members` LEFT JOIN savings ON members.id = savings.memberId AND savings.date=?",
      [date]
    );
    return res.json(users);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getSavingChanges= async (req,res)=>{
  try {
    const [edite_history] = await conn.query(
      "SELECT saving_edit_history.date date, fullname, saving_edit_history.numberOfShares*saving_edit_history.shareValue amount FROM `saving_edit_history` INNER JOIN users WHERE saving_edit_history.user_id=users.user_id and savId=?",
      [req.params.id]
    );
    return res.json(edite_history);
    
  } catch (error) {
   return res.status(500).json("Internal Server Error Some thing went wrong");
  }
}

const getSavingSelectList = async (req, res) => {
  try {
    const [lists] = await conn.query(
      "SELECT CONCAT(`title`, '(',`amount`,')') name,amount, stId as value  FROM `savingtypes` WHERE 1"
    );
    return res.json(lists);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};


const getMembersSavingsOverview = async (req, res) => {
  try {
    const { search } = req.query;
    let query = `
      SELECT 
        m.id, 
        m.nid, 
        m.firstName, 
        m.lastName, 
        m.telephone,
        (SELECT COALESCE(SUM(numberOfShares * shareValue), 0) FROM savings WHERE memberId = m.id) as totalSavings,
        (SELECT MAX(date) FROM savings WHERE memberId = m.id) as lastSavingDate,
        (SELECT COUNT(*) FROM loan WHERE memberId = m.id AND status = 'active') as activeLoanCount,
        (SELECT COALESCE(SUM(CAST(amountTopay AS DECIMAL(10,2)) - CAST(payedAmount AS DECIMAL(10,2))), 0) FROM loan WHERE memberId = m.id AND status = 'active') as activeLoanAmount
      FROM members m
    `;
    
    const params = [];

    if (search) {
      query += ` WHERE m.firstName LIKE ? OR m.lastName LIKE ? OR m.nid LIKE ?`;
      const searchPattern = `%${search}%`;
      params.push(searchPattern, searchPattern, searchPattern);
    }
    
    query += ` ORDER BY totalSavings DESC`;

    const [overview] = await conn.query(query, params);
    
    return res.json(overview);
  } catch (error) {
    console.error('getMembersSavingsOverview error:', error);
    res.status(400).json({ error: error.message });
  }
};

const getMemberSavings = async (req, res) => {
  try {
    const {memberId} = req.params;
    console.log('getMemberSavings called for memberId:', memberId);
    
    const [savings] = await conn.query(
      "SELECT s.sav_id, s.date, s.numberOfShares, s.shareValue, (s.numberOfShares * s.shareValue) as amount, st.title as type FROM savings s INNER JOIN savingtypes st ON s.stId = st.stId WHERE s.memberId = ? ORDER BY s.date DESC",
      [memberId]
    );
    console.log('getMemberSavings result count:', savings.length, 'sample:', savings[0] || null);
    
    const totalSavings = savings.reduce((sum, saving) => sum + Number(saving.amount), 0);
    
    return res.json({
      savings,
      totalSavings,
      count: savings.length
    });
  } catch (error) {
    console.log('getMemberSavings error:', error.message);
    res.status(400).json({ error: error.message });
  }
};
const completeSaving = () => async (req, res) => {
  try {
    const token = req.headers.authorization;
    const dt = new Date();
    const dat = `${dt.getFullYear()}-0${dt.getMonth() + 1}-${dt.getDate()}`;
    const userId = jwt.verify(token, process.env.JWT_SECRET).id;
    const psql = penalityQueryGenerator(dat, 500, 1);
    await conn.query(psql);
    const [setZero] = await conn.query(
      "SELECT  id,0 FROM members LEFT JOIN savings ON savings.memberId=id WHERE id NOT IN (SELECT memberId FROM `members` INNER JOIN savings WHERE members.id = savings.memberId AND savings.date=?)",
      [dat]
    );

    return res.json({
      status: 201,
      message: "saving for day completed new Member added",
      setZero,
      setZero,
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ error: error.message });
  }
};

module.exports = {
  addSavig,
  getSavings,
  getSavingSelectList,
  editSaving,
  completeSaving,
  getSavingChanges,
  getAllSavings,
  getMemberSavings,
  getMembersSavingsOverview
};
