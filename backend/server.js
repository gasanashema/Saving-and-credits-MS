const express = require("express");
const cron = require("node-cron");
const cors = require("cors");
const appRouter = require("./Routes");
const AutoPenalityService = require("./utilities/auto.penarity.service");
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const port = 3000;
app.get("/", (req, res) => res.json({ message: "api-isworking" }));
app.use("/api/ikv1", appRouter);
cron.schedule("0 0 * * 0", async () => {
  console.log("Running a task every Sunday at 00:00");
  await AutoPenalityService();
});
app.listen(port, async () => {
  console.log(`app started on ${port}`);
});
