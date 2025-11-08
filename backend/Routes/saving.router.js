const express = require("express");
const savingRouter = express.Router();

const {
  addSavig,
  getSavings,
  getSavingSelectList,
  editSaving,
  completeSaving,
  getSavingChanges,
  getAllSavings
} = require("../services/saving.service");
savingRouter.post("/", addSavig);
savingRouter.put("/", editSaving);
savingRouter.get("/:limit", getAllSavings);
savingRouter.post("/data", getSavings);
savingRouter.get("/on/:date", getSavings);
savingRouter.post("/complete", completeSaving);
savingRouter.get("/type/list", getSavingSelectList);
savingRouter.get("/changes/:id",getSavingChanges)
module.exports = savingRouter;
