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
  getAllSavingTypes,
} = require("../services/saving.service");
const {
  verifySuperAdmin,
  verifyAdmin,
  verifyToken,
} = require("../middleware/auth.middleware");

// Super Admin Routes for Saving Types
savingRouter.get("/types", verifyToken, getAllSavingTypes);
savingRouter.post("/types", verifySuperAdmin, createSavingType);
savingRouter.put("/types/:id", verifySuperAdmin, updateSavingType);
savingRouter.delete("/types/:id", verifySuperAdmin, deleteSavingType);

savingRouter.post("/", verifyAdmin, addSavig);
savingRouter.put("/", verifyAdmin, editSaving);
savingRouter.get("/overview", verifyToken, getMembersSavingsOverview);
savingRouter.get("/type/list", verifyToken, getSavingSelectList);
savingRouter.get("/changes/:id", verifyToken, getSavingChanges);
savingRouter.get("/transactions/:memberId", verifyToken, getMemberSavings);
savingRouter.get("/:limit", verifyToken, getAllSavings);
savingRouter.post("/data", verifyToken, getSavings);
savingRouter.get("/on/:date", verifyToken, getSavings);
savingRouter.post("/complete", verifyAdmin, completeSaving);
module.exports = savingRouter;
