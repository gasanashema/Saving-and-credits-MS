const express = require("express");
const Auth = require("../services/Auth/login.service");
const {
  addUser,
  getAllUsers,
  dashBoard,
  updateStatus,
  resetPassword,
  getAdminContacts,
} = require("../services/users.service");
const {
  verifySuperAdmin,
  verifyAdmin,
} = require("../middleware/auth.middleware");

const usersRouter = express.Router();

usersRouter.get("/", verifyAdmin, getAllUsers);
// usersRouter.get("/:id", (req, res) => res.json("users router"));
usersRouter.post("/", verifySuperAdmin, addUser);
usersRouter.put("/:action/:id", verifySuperAdmin, updateStatus);
usersRouter.put("/:id/reset-password", verifySuperAdmin, resetPassword);

usersRouter.post("/auth", Auth);
usersRouter.get("/admin/dashboard", verifyAdmin, dashBoard);
usersRouter.get("/admin/contacts", verifyAdmin, getAdminContacts);
// usersRouter.delete("/:id", (req, res) => res.json("users router"));

module.exports = usersRouter;
