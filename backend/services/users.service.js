const conn = require("../db/connection");

const addUser = async (req, res) => {
  const { fullName, email } = req.body;

  try {
    const [users] = await conn.query(
      "INSERT INTO `users`(`fullname`, `role`, `email`) VALUES (?,?,?)",
      [fullName, "admin", email]
    );
    return res.json({ status: 201, message: "new User added", users });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};
const updateStatus = async (req, res) => {
  const { id,action } = req.params;
  const status = action == "activate" ? 'active' : 'deactivated';
  try {
    const [users] = await conn.query(
      "UPDATE users set status = ? where user_id=?",
      [status, id]
    );
    return res.json({ status: 201, message: "new User added", users });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const [users] = await conn.query(
      "SELECT `user_id`, `fullname`, `role`, `email`, `password`, `status` FROM `users`"
    );
    return res.json(users);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const dashBoard = async (req, res) => {
  try {
    let [loans] = await conn.query(
      "SELECT SUM(amount) AMOUNT,pstatus FROM penalties GROUP BY pstatus"
    );
    const loanData = {
      paidLoan: loans[1].AMOUNT,
      unpaidLoan: loans[0].AMOUNT,
    };
    const [members] = await conn.query(
      "SELECT COUNT(*) members, sum(balance) amount FROM `members`"
    );
    const data = { loan: loanData, members: members[0] };
    return res.json(data);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
const getSelectList = async (req, res) => {
  try {
    const [list] = await conn.query(
      "SELECT member_id as value, CONCAT(firstName,' ',lastName) as name from members"
    );
    return res.json(list);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const resetPassword = async (req, res) => {
  const { id } = req.params;
  
  try {
    // Reset to default password "12345" with the provided hash
    const defaultPasswordHash = '$2a$12$TvP1sL65u4Kf7I9GPtZOYeCg1OQ8HTH84rOkeXwRVNR0uE4smi4fK';
    
    const [result] = await conn.query(
      "UPDATE users SET password = ? WHERE user_id = ?",
      [defaultPasswordHash, id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    
    return res.json({ status: 200, message: "Password reset successfully" });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};
module.exports = {
  getAllUsers,
  addUser,
  getSelectList,
  dashBoard, 
  updateStatus,
  resetPassword
};
