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
  getAllPenaltyTypes,
  markPenaltyPending,
} = require("../services/Penalities.service");
const {
  verifySuperAdmin,
  verifyAdmin,
  verifyToken,
} = require("../middleware/auth.middleware");
const penalitiesRouter = express.Router();

penalitiesRouter.post("/", verifyAdmin, addPenalities);
penalitiesRouter.get("/data/:start/:end/:search", verifyToken, getPenalities);
penalitiesRouter.get("/total/:search", verifyToken, getTotal);
penalitiesRouter.get("/selectlist", verifyToken, getSelectList);
penalitiesRouter.put("/pay/:pid", verifyAdmin, payPenality);
penalitiesRouter.put("/markPending/:pid", verifyToken, markPenaltyPending);
penalitiesRouter.get("/member/:memberId", verifyToken, getMemberPenalties);

// Penalty Types Routes
penalitiesRouter.get("/types", verifyToken, getAllPenaltyTypes);
penalitiesRouter.post("/types", verifySuperAdmin, createPenaltyType);
penalitiesRouter.put("/types/:id", verifySuperAdmin, updatePenaltyType);
penalitiesRouter.delete("/types/:id", verifySuperAdmin, deletePenaltyType);

module.exports = penalitiesRouter;
