const express = require("express");
const { updateSettings, getSettings, getSavingDay } = require("../services/settings.service");

const settingsRouter = express.Router();
settingsRouter.get("/", getSettings);
settingsRouter.get("/saving-day", getSavingDay);
settingsRouter.put("/", updateSettings);

module.exports = settingsRouter;