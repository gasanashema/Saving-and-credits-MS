const express = require("express");
const UssdController = require("../utilities/ussDcontroller");
const ussdRouter = express.Router();
ussdRouter.post("/", async (req, res) => {
  const { text } = req.body;
  const ussdCtr = new UssdController();
  try {
    const response = await ussdCtr.getResponse(text);
    res.send(response);
  } catch (err) {
    console.error(err);
    res.send(err.message);
  }
});

module.exports = ussdRouter;
