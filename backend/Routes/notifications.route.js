const express = require("express");
const {
  sendAdminToAdmin,
  sendAdminToMember,
  sendToGroup,
  getAdminNotifications,
  getMemberNotifications,
  getUnreadCount,
  markAsRead,
  createGroup,
  getGroups,
  getGroupMembers,
  removeGroupMember,
} = require("../services/notifications.service");
const notificationsRouter = express.Router();

// Messaging endpoints
notificationsRouter.post("/admin-to-admin", sendAdminToAdmin);
notificationsRouter.post("/admin-to-member", sendAdminToMember);
notificationsRouter.post("/group", sendToGroup);

// Retrieval endpoints
notificationsRouter.get("/admin/:adminId", getAdminNotifications);
notificationsRouter.get("/member/:memberId", getMemberNotifications);
notificationsRouter.get("/unread/:type/:id", getUnreadCount);

// Mark as read
notificationsRouter.put("/read/:notificationId", markAsRead);

// Group management
notificationsRouter.post("/groups", createGroup);
notificationsRouter.get("/groups", getGroups);
notificationsRouter.get("/groups/:groupId/members", getGroupMembers);
notificationsRouter.delete("/groups/:groupId/members", removeGroupMember);

module.exports = notificationsRouter;