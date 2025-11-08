const express = require("express");
const membersRouter = express.Router();
const conn = require("../db/connection");
const {
  addMember,
  getAllMembers,
  getTotal,
  savingGetAllMembers,
  getSelectList,
  updateMember,
  getDashboard,
  getOneMemberSavings,
  resetPassword
} = require("../services/members.service");
membersRouter.get("/", getAllMembers);
membersRouter.get("/saving/:start/:end", savingGetAllMembers);
membersRouter.get("/:id/savings/:limit", getOneMemberSavings);
membersRouter.get("/selectlist", getSelectList);
membersRouter.put("/dashboard/:id/data", getDashboard);
membersRouter.get("/total", getTotal);
membersRouter.post("/", addMember);
membersRouter.put("/:id", updateMember);
membersRouter.put("/:id/reset-password", resetPassword);
module.exports = membersRouter;
