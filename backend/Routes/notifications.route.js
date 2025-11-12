const express = require("express");
const {
  getMemberNotifications,
  markNotificationAsRead,
} = require("../services/notifications.service");
const notificationsRouter = express.Router();

notificationsRouter.get("/:memberId", getMemberNotifications);
notificationsRouter.put("/:memberId/:notificationId/read", markNotificationAsRead);

module.exports = notificationsRouter;