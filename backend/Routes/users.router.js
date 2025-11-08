const express = require("express");
const Auth = require("../services/Auth/login.service");
const {
  addUser,
  getAllUsers,
  dashBoard,
  updateStatus,
} = require("../services/users.service");
const usersRouter = express.Router();

usersRouter.get("/", getAllUsers);
usersRouter.get("/:id", (req, res) => res.json("users router"));
usersRouter.post("/", addUser);
usersRouter.put("/:action/:id", updateStatus);

usersRouter.post("/auth", Auth);
usersRouter.get("/admin/dashboard", dashBoard);
usersRouter.delete("/:id", (req, res) => res.json("users router"));

module.exports = usersRouter;
