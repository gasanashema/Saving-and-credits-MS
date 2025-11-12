const express = require("express");
const {
  addPenalities,
  getPenalities,
  getTotal,
  payPenality,
  getSelectList,
  getMemberPenalties,
} = require("../services/Penalities.service");
const penaltiesRouter = express.Router();

penaltiesRouter.post("/", addPenalities);
penaltiesRouter.get("/data/:start/:end/:search", getPenalities);
penaltiesRouter.get("/total/:search", getTotal);
penaltiesRouter.get("/selectlist", getSelectList);
penaltiesRouter.put("/pay/:pid", payPenality);
penaltiesRouter.get("/member/:memberId", getMemberPenalties);

module.exports = penaltiesRouter;
