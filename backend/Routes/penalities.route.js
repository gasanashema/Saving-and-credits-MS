const express = require("express");
const {
  addPenalities,
  getPenalities,
  getTotal,
  payPenality,
  getSelectList,
} = require("../services/Penalities.service");
const penaltiesRouter = express.Router();

penaltiesRouter.post("/", addPenalities);
penaltiesRouter.get("/data/:start/:end/:search", getPenalities);
penaltiesRouter.get("/total/:search", getTotal);
penaltiesRouter.get("/selectlist", getSelectList);
penaltiesRouter.put("/pay/:pid", payPenality);

module.exports = penaltiesRouter;
