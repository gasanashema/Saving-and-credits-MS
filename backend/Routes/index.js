const express = require("express");
const usersRouter = require("./users.router");
const membersRouter = require("./members.router");
const savingRouter = require("./saving.router");
const penaltiesRouter = require("./penalities.route");
const loanRouter = require("./loan.route");
const ussdRouter = require("./ussd.route");
const settingsRouter = require("./settings.route");
const PayRouter = require("./pay.route");
const paymentRouter = require("./payment");
const notificationsRouter = require("./notifications.route");
const chatRouter = require("./chat.route");

const appRouter = express.Router();

appRouter.use("/users", usersRouter);
appRouter.use("/members", membersRouter);
appRouter.use("/saving", savingRouter);
appRouter.use("/penalities", penaltiesRouter);
appRouter.use("/loans", loanRouter);
appRouter.use("/pay",PayRouter)
appRouter.use("/payment", paymentRouter);
appRouter.use("/ussd", ussdRouter);
appRouter.use("/settings", settingsRouter);
appRouter.use("/notifications", notificationsRouter);
appRouter.use("/chat", chatRouter);

module.exports = appRouter;
