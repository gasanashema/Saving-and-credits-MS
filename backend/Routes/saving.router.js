const express = require("express");
const savingRouter = express.Router();

const {
  addSavig,
  getSavings,
  getSavingSelectList,
  editSaving,
  completeSaving,
  getSavingChanges,
  getAllSavings,
  getMemberSavings,
  getMembersSavingsOverview,
  createSavingType,
  updateSavingType,
  deleteSavingType,
} = require("../services/saving.service");
const {
  verifySuperAdmin,
  verifyAdmin,
  verifyToken,
} = require("../middleware/auth.middleware");

savingRouter.post("/", verifyAdmin, addSavig);
savingRouter.put("/", verifyAdmin, editSaving);
savingRouter.get("/overview", verifyToken, getMembersSavingsOverview);
savingRouter.get("/:limit", verifyToken, getAllSavings);
savingRouter.post("/data", verifyToken, getSavings);
savingRouter.get("/on/:date", verifyToken, getSavings);
savingRouter.post("/complete", verifyAdmin, completeSaving);
savingRouter.get("/type/list", verifyToken, getSavingSelectList);
savingRouter.get("/changes/:id", verifyToken, getSavingChanges);
savingRouter.get("/transactions/:memberId", verifyToken, getMemberSavings);

// Super Admin Routes for Saving Types
savingRouter.post("/types", verifySuperAdmin, createSavingType);
savingRouter.put("/types/:id", verifySuperAdmin, updateSavingType);
savingRouter.delete("/types/:id", verifySuperAdmin, deleteSavingType);
module.exports = savingRouter;
