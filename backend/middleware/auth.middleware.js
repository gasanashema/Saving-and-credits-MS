const jwt = require("jsonwebtoken");
require("dotenv").config();

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split(" ")[1];
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) {
        return res.status(403).json("Token is not valid!");
      }
      req.user = user;
      next();
    });
  } else {
    res.status(401).json("You are not authenticated!");
  }
};

const verifyAdmin = (req, res, next) => {
  verifyToken(req, res, () => {
    if (
      req.user.role === "admin" ||
      req.user.role === "sadmin" ||
      req.user.role === "super-admin"
    ) {
      next();
    } else {
      res.status(403).json("You are not allowed to do that!");
    }
  });
};

const verifySuperAdmin = (req, res, next) => {
  verifyToken(req, res, () => {
    if (req.user.role === "sadmin" || req.user.role === "super-admin") {
      next();
    } else {
      res
        .status(403)
        .json("You are not allowed to do that! Super Admin access required.");
    }
  });
};

module.exports = {
  verifyToken,
  verifyAdmin,
  verifySuperAdmin,
};
