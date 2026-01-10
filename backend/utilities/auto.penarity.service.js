const conn = require("../db/connection");
const penalityQueryGenerator = require("../db/query");

const AutoPenalityService = async () => {
  try {
    const dt = new Date();
    const today = new Date(); // Current date
    const yesterday = new Date(); // Create a new Date object for yesterday
    yesterday.setDate(today.getDate() - 1); // Subtract one day
    yesterdayFormarted = yesterday.toISOString().split("T")[0];
    const sql = penalityQueryGenerator(yesterdayFormarted, 500, 1);
    await conn.query(sql);
    const [setZero] = await conn.query(
      "INSERT INTO savings(date,stId,memberId) SELECT ?, 0, id FROM members LEFT JOIN savings ON savings.memberId=id WHERE id NOT IN (SELECT memberId FROM `members` INNER JOIN savings WHERE members.id = savings.memberId AND savings.date=?)",
      [yesterdayFormarted, yesterdayFormarted]
    );
    await conn.query(sql);
    console.log("Penality aplied success fully");
  } catch (error) {
    console.log(error);
  }
};

module.exports = AutoPenalityService;
