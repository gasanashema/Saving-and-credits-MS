require("dotenv").config();
const jwt = require("jsonwebtoken");
const conn = require("../db/connection");
const addPenalities = async (req, res) => {
  try {
    const { pType, amount, memberId } = req.body;
    const dt = new Date();
    const [penality] = await conn.query(
      "INSERT INTO `penalties`(`date`, `pType`, `amount`, `memberId`) VALUES (?,?,?,?)",
      [dt, pType, amount, memberId]
    );
    return res.json({ status: 201, message: "new Penality added", penality });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ error: error.message });
  }
};

const getPenalities = async (req, res) => {
  const { search, start, end } = req.params;
  try {
    const authHeader = req.headers.authorization;
    let memberId = null;

    // Check if request is from a member
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.substring(7);
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded.role === 'member') {
          memberId = decoded.id;
        }
      } catch (err) {
        // Token invalid, continue without filtering
      }
    }

    let sql = "SELECT id,firstName,lastName,date,amount,PayedArt,confirmedBy,p_id, pstatus FROM penalties INNER JOIN members WHERE id = memberId";

    if (search !== "all") {
      sql += ` AND pstatus='${search}'`;
    }

    if (memberId) {
      sql += ` AND id = ${memberId}`;
    }

    sql += " ORDER BY pstatus,date LIMIT ?, ?";

    const [users] = await conn.query(sql, [Number(start), Number(end)]);
    return res.json(users);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
const payPenality = async (req, res) => {
  try {
    const { pid } = req.params;
    const authHeader = req.headers.authorization;
    const dt = new Date();
    let userId = 1; // default

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      userId = jwt.verify(token, process.env.JWT_SECRET).id;
    }
    const [payment] = await conn.query(
      "UPDATE `penalties` SET `pstatus`=?,`PayedArt`=?,`confirmedBy`=? WHERE `p_id`=?",
      ["paid", dt, userId, pid]
    );
    return res.json({ status: 201, message: "pay successfully", payment });
  } catch (error) {
    res.status(400).json({ error: JSON.stringify(error) });
    throw error;
  }
};
const getSelectList = async (req, res) => {
  try {
    const [list] = await conn.query(
      "SELECT ptId as value, CONCAT(title,' (',amount,')') as name,amount from ptypes"
    );
    return res.json(list);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
const getTotal = async (req, res) => {
  const { search } = req.params;
  try {
    const sql =
      search == "all"
        ? "SELECT count(*) total  FROM penalties"
        : `SELECT count(*) total  FROM penalties WHERE pstatus='${search}'`;
    const [data] = await conn.query(sql);
    return res.json(data[0].total);
  } catch (error) {
    res.status(400).json({ error: JSON.stringify(error) });
    throw error;
  }
};

const getMemberPenalties = async (req, res) => {
  const { memberId } = req.params;
  const memberIdNum = parseInt(memberId);

  try {
    const [penalties] = await conn.query(
      "SELECT id,firstName,lastName,telephone,date,amount,PayedArt,confirmedBy,p_id, pstatus, pType as reason FROM penalties INNER JOIN members ON id = memberId WHERE id = ? ORDER BY pstatus,date",
      [memberIdNum]
    );

    return res.json(penalties);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

module.exports = {
  addPenalities,
  getPenalities,
  getTotal,
  payPenality,
  getSelectList,
  getMemberPenalties,
};
