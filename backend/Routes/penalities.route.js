const express = require("express");
const {
  addPenalities,
  getPenalities,
  getTotal,
  payPenality,
  getSelectList,
  getMemberPenalties,
  createPenaltyType,
  updatePenaltyType,
  deletePenaltyType,
} = require("../services/Penalities.service");
const {
  verifySuperAdmin,
  verifyAdmin,
  verifyToken,
} = require("../middleware/auth.middleware");
const penaltiesRouter = express.Router();

penaltiesRouter.post("/", verifyAdmin, addPenalities);
penaltiesRouter.get("/data/:start/:end/:search", verifyToken, getPenalities);
penaltiesRouter.get("/total/:search", verifyToken, getTotal);
penaltiesRouter.get("/selectlist", verifyToken, getSelectList);
penaltiesRouter.put("/pay/:pid", verifyAdmin, payPenality);
penaltiesRouter.get("/member/:memberId", verifyToken, getMemberPenalties);

// Penalty Types Routes
penaltiesRouter.post("/types", verifySuperAdmin, createPenaltyType);
penaltiesRouter.put("/types/:id", verifySuperAdmin, updatePenaltyType);
penaltiesRouter.delete("/types/:id", verifySuperAdmin, deletePenaltyType);

module.exports = penaltiesRouter;
