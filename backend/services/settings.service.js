require("dotenv").config();
const conn = require("../db/connection");

const getSettings = async (req, res) => {
  try {
    const [settings] = await conn.query("SELECT * FROM `settings`");
    return res.json({ status: 200, message: "Settings retrieved successfully", data: settings });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
};

const updateSettings = async (req, res) => {
  try {
    const { settingId, settingValue } = req.body;

    if (!settingId || !settingValue) {
      return res.status(400).json({ error: "Setting ID and value are required" });
    }

    const [result] = await conn.query(
      "UPDATE `settings` SET `setting_value` = ? WHERE `id` = ?",
      [JSON.stringify(settingValue), settingId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Setting not found" });
    }

    return res.json({ status: 200, message: "Setting updated successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
};
// In your settings controller or similar file

const getSavingDay = async (req, res) => {
  try {
    const [settings] = await conn.query("SELECT setting_value FROM settings WHERE setting_name = 'general'");
    const settingValue = JSON.parse(settings[0].setting_value);
    const savingDay = settingValue.savingDay;
    return res.json({ status: 200, data: savingDay });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ error: error.message });
  }
};

module.exports = {
  getSettings,
  updateSettings,getSavingDay
};
