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
    const sql =
      search == "all"
        ? "SELECT id,firstName,lastName,date,amount,PayedArt,confirmedBy,p_id, pstatus FROM   `penalties` INNER JOIN  members WHERE id =memberId ORDER BY pstatus,date LIMIT ?, ?"
        : `SELECT id,firstName,lastName,date,amount,PayedArt,confirmedBy,p_id, pstatus FROM   penalties INNER JOIN  members WHERE id =memberId AND pstatus='${search}' ORDER BY pstatus,date LIMIT ?, ?`;
    const [users] = await conn.query(sql, [Number(start), Number(end)]);
    return res.json(users);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
const payPenality = async (req, res) => {
  try {
    const { pid } = req.params;
    const token = req.headers.authorization;
    const dt = new Date();
    const userId = jwt.verify(token, process.env.JWT_SECRET).id;
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
    console.log({ search });
    res.status(400).json({ error: JSON.stringify(error) });
    throw error;
  }
};

module.exports = {
  addPenalities,
  getPenalities,
  getTotal,
  payPenality,
  getSelectList,
};
