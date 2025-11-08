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
      [memberId, stId, numeberOfShares, shareValue, userId, dt, savId]
    );
    
    const total = numberOfShares * shareValue;
    await conn.query(
      "UPDATE members set balance= balance + ? where member_id=?",
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
    const userId = jwt.verify(token, process.env.JWT_SECRET).id;
    const [member] = await conn.query(
      "INSERT INTO `savings`(`date`, `memberId`, `stId`, `numberOfShares`, `shareValue`, `user_id`, `updatedAt`, `createdAt`) VALUES (?,?,?,?,?,?,?,?)",
      [dt, memberId, stId, numberOfShares, shareValue, userId, dt, dt]
    );
    const total = numberOfShares * shareValue;
    await conn.query(
      "UPDATE members set balance= balance + ? where member_id=?",
      [total, memberId]
    );

    return res.json({ status: 201, message: "new saving added", member });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ error: error.message });
  }
};


const getAllSavings = async (req, res) => {
  const { limit } = req.params;
  limit&&limit>0?limit:limit=40;

  try {
    const [users] = await conn.query(
      "SELECT `id`,`sav_id`, `nid`, `firstName`, `lastName`,telephone,date, sharevalue,`numberOfShares`,sharevalue*numberOfShares as total FROM `members` INNER JOIN savings ON members.id = savings.memberId ORDER BY savings.updatedAt DESC LIMIT ?",
      [Number(limit)]
    );
    return res.json(users);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
const getSavings = async (req, res) => {
  const { date } = req.body;

  try {
    const [users] = await conn.query(
      "SELECT `id`,`sav_id`, `nid`, `firstName`, `lastName`, sharevalue,`numberOfShares`,sharevalue*numberOfShares as total FROM `members` LEFT JOIN savings ON members.id = savings.memberId AND savings.date=?",
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
const completeSaving = () => async (req, res) => {
  try {
    const token = req.headers.authorization;
    const dt = new Date();
    const dat = `${dt.getFullYear()}-0${dt.getMonth() + 1}-${dt.getDate()}`;
    const userId = jwt.verify(token, process.env.JWT_SECRET).id;
    const psql = penalityQueryGenerator(dat, 500, 1);
    await conn.query(psql);
    const [setZero] = await conn.query(
      "SELECT  member_id,0 FROM members LEFT JOIN savings ON savings.memberId=member_id WHERE member_id NOT IN (SELECT memberId FROM `members` INNER JOIN savings WHERE members.member_id = savings.memberId AND savings.date=?)",
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
  getAllSavings
};
