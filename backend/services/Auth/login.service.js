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

    // Debug: show what columns we got from DB
    console.log('Authenticated user record from DB (keys):', Object.keys(user));
    console.log('Authenticated user record from DB (full):', user);

    // Determine id robustly from any possible column (user_id, id, member_id)
    let id = user.user_id ?? user.id ?? user.member_id ?? null;

    // If the id is missing for a member record, try an explicit lookup as a fallback
    if ((id === null || id === undefined) && role === 'member') {
      try {
        const [idRows] = await conn.query('SELECT id, member_id FROM members WHERE telephone = ? LIMIT 1', [username]);
        if (idRows && idRows[0]) {
          id = idRows[0].id ?? idRows[0].member_id ?? id;
          console.log('Fallback member id lookup result:', idRows[0]);
        } else {
          console.log('Fallback member id lookup found no rows for telephone:', username);
        }
      } catch (err) {
        console.log('Error during fallback id lookup for member:', err.message);
      }
    }

    // Determine fullname from available fields
    const fullname = user.fullname || `${user.firstName || ""} ${user.lastName || ""}`.trim();

    console.log('Resolved id for token/payload:', id);

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

    // Ensure a canonical numeric id and include a user object in the response
    const parsedId = Number(id);
    const canonicalId = Number.isFinite(parsedId) ? parsedId : null;
    const responseObj = {
      login: true,
      role: responseRole,
      message: "Login Successful",
      token,
      email: user.email || null,
      fullname,
      id: canonicalId,
      user: {
        id: canonicalId,
        fullname,
        email: user.email || null,
        role: responseRole,
      },
    };

    console.log("Login response to frontend:", responseObj);

    return res.status(200).json(responseObj);
  } catch (error) {
    console.error("Auth error:", error);
    return res.status(500).json({ login: false, error: "Server error" });
  }
};

module.exports = Auth;
