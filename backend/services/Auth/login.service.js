const conn = require("../../db/connection");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const Auth = async (req, res) => {
  try {
    const { username, password, role } = req.body;
    let user;

    if (role === "admin") {
      const [userdata] = await conn.query(
        "SELECT * FROM users WHERE email=?",
        [username]
      );
      user = userdata[0];
    } else if (role === "member") {
      const [userdata] = await conn.query(
        "SELECT * FROM members WHERE telephone=?",
        [username]
      );
      user = userdata[0];
      console.log(user)
    }

    if (!user) {
      return res.status(200).json({ login: false, error: "User not found" });
    }

    // Ensure password exists
    if (!user.password) {
      console.log("User has no password:", user);
      return res.status(200).json({ login: false, error: "No password set" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(200).json({ login: false, error: "Invalid Credentials" });
    }

    // Assign role explicitly if member
    const userRole = role === "admin" ? user.role : "member";

    const id = role === "admin" ? user.user_id : user.member_id;
    const fullname =
      role === "admin"
        ? user.fullname
        : `${user.firstName || ""} ${user.lastName || ""}`.trim();

    const token = jwt.sign({ id, role: userRole }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    // Check account status safely
    if (user.status && user.status === "deactivated") {
      return res
        .status(200)
        .json({ login: false, error: "Your account is deactivated" });
    }

    return res.status(200).json({
      login: true,
      role: userRole,
      message: "Login Successful",
      token,
      email: user.email || null,
      fullname,
      id,
    });
  } catch (error) {
    console.error("Auth error:", error);
    return res.status(500).json({ login: false, error: "Server error" });
  }
};

module.exports = Auth;
