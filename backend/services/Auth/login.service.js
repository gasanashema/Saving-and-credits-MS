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
      // console.log(user)
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

    // Determine role directly from DB when available (users table contains 'admin' and 'supperadmin')
    let userRole;
    if (user && user.role) {
      if (user.role === "supperadmin") {
        userRole = "sadmin";
      } else if (user.role === "admin") {
        userRole = "admin";
      } else {
        // Unexpected role value in users table - use it lowercased as a fallback
        userRole = String(user.role).toLowerCase();
      }
    } else {
      // No role in DB (likely a member table) - fallback to requested role
      userRole = role === "admin" ? "admin" : "member";
    }

    // For id/fullname selection, treat super-admin as an admin-type user
    const isAdminType = userRole === "admin" || userRole === "sadmin";
    const id = isAdminType ? user.user_id : user.id;
    const fullname = isAdminType
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

    // Provide a route-friendly role for the frontend while keeping canonical role in the token
    const responseRole = userRole === "sadmin" ? "super-admin" : userRole;

    // Build response object and log it for verification
    const responseObj = {
      login: true,
      role: responseRole,
      message: "Login Successful",
      token,
      email: user.email || null,
      fullname,
      id,
    };

    console.log("Login response to frontend:", responseObj);

    return res.status(200).json(responseObj);
  } catch (error) {
    console.error("Auth error:", error);
    return res.status(500).json({ login: false, error: "Server error" });
  }
};

module.exports = Auth;
