require("dotenv").config();
const jwt = require("jsonwebtoken");
const conn = require("../db/connection");

// Helper function to verify admin token
const verifyAdmin = (req) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new Error("Unauthorized");
  }
  const token = authHeader.substring(7);
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  // Accept different admin role spellings used across the codebase
  const adminRoles = new Set([
    "admin",
    "sadmin",
    "supperadmin",
    "super-admin",
    "supper-admin",
  ]);
  if (!adminRoles.has(decoded.role)) {
    throw new Error("Only admins can perform this action");
  }
  return decoded;
};

// Generic token verification helper
const verifyToken = (req) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new Error("Unauthorized");
  }
  const token = authHeader.substring(7);
  return jwt.verify(token, process.env.JWT_SECRET);
};

// Send message from admin to another admin
const sendAdminToAdmin = async (req, res) => {
  try {
    const decoded = verifyAdmin(req);
    const { receiverId, title, message } = req.body;

    if (!receiverId || !title || !message) {
      return res
        .status(400)
        .json({ error: "receiverId, title, and message are required" });
    }

    // Check if receiver admin exists
    const [receiver] = await conn.query(
      "SELECT user_id FROM users WHERE user_id = ? AND role IN ('admin', 'supperadmin')",
      [receiverId],
    );
    if (receiver.length === 0) {
      return res.status(404).json({ error: "Admin not found" });
    }

    const url = req.body.url || null;
    const { createNotification } = require("../utilities/notify.helper");
    const id = await createNotification({
      senderAdminId: decoded.id,
      receiverType: "admin",
      receiverId,
      title,
      message,
      url,
    });

    return res.json({ message: "Message sent successfully", id });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: error.message });
  }
};

// Send message from admin to member
const sendAdminToMember = async (req, res) => {
  try {
    const decoded = verifyAdmin(req);
    const { receiverId, title, message } = req.body;

    if (!receiverId || !title || !message) {
      return res
        .status(400)
        .json({ error: "receiverId, title, and message are required" });
    }

    // Check if member exists
    const [member] = await conn.query("SELECT id FROM members WHERE id = ?", [
      receiverId,
    ]);
    if (member.length === 0) {
      return res.status(404).json({ error: "Member not found" });
    }

    // support optional url in request body
    const url = req.body.url || null;

    // use helper to create notification
    const { createNotification } = require("../utilities/notify.helper");
    const id = await createNotification({
      senderAdminId: decoded.id,
      receiverType: "member",
      receiverId,
      title,
      message,
      url,
    });

    return res.json({ message: "Message sent successfully", id });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: error.message });
  }
};

// Send message to a group
const sendToGroup = async (req, res) => {
  try {
    const decoded = verifyAdmin(req);
    const { groupId, title, message } = req.body;

    if (!groupId || !title || !message) {
      return res
        .status(400)
        .json({ error: "groupId, title, and message are required" });
    }

    // Check if group exists
    const [group] = await conn.query(
      "SELECT id FROM notification_groups WHERE id = ?",
      [groupId],
    );
    if (group.length === 0) {
      return res.status(404).json({ error: "Group not found" });
    }

    // Get group members
    const [members] = await conn.query(
      "SELECT recipient_type, recipient_id FROM notification_group_members WHERE group_id = ?",
      [groupId],
    );

    if (members.length === 0) {
      return res.status(400).json({ error: "Group has no members" });
    }

    const url = req.body.url || null;
    const { createNotification } = require("../utilities/notify.helper");

    // Insert notifications for each member
    const insertPromises = members.map((member) =>
      createNotification({
        senderAdminId: decoded.id,
        receiverType: member.recipient_type,
        receiverId: member.recipient_id,
        title,
        message,
        url,
      }),
    );

    await Promise.all(insertPromises);

    return res.json({
      message: `Message sent to ${members.length} recipients`,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: error.message });
  }
};

// Get notifications for admin (requires auth; admins can only fetch their own notifications)
const getAdminNotifications = async (req, res) => {
  try {
    const decoded = verifyToken(req);
    const { adminId } = req.params;
    console.log(
      "getAdminNotifications called for adminId:",
      adminId,
      "decoded:",
      decoded,
    );
    const adminRoles = new Set([
      "admin",
      "sadmin",
      "supperadmin",
      "super-admin",
      "supper-admin",
    ]);
    if (
      !adminRoles.has(decoded.role) ||
      Number(decoded.id) !== Number(adminId)
    ) {
      console.log("Access denied for admin notifications");
      return res.status(403).json({ error: "Access denied" });
    }

    const [notifications] = await conn.query(
      "SELECT id, title, message, url, is_read, created_at FROM notifications WHERE receiver_type = 'admin' AND receiver_id = ? ORDER BY created_at DESC",
      [adminId],
    );
    console.log("Admin notifications fetched:", notifications.length, "items");

    return res.json(notifications);
  } catch (error) {
    console.log("getAdminNotifications error:", error);
    if (error.name === "JsonWebTokenError" || error.message === "Unauthorized")
      return res.status(401).json({ error: "Unauthorized" });
    return res.status(500).json({ error: error.message });
  }
};

// Get notifications for member (requires auth; members can only fetch their own notifications)
const getMemberNotifications = async (req, res) => {
  try {
    const decoded = verifyToken(req);
    const { memberId } = req.params;

    if (decoded.role === "member" && Number(decoded.id) !== Number(memberId)) {
      return res.status(403).json({ error: "Access denied" });
    }

    const [notifications] = await conn.query(
      "SELECT id, title, message, url, is_read, created_at FROM notifications WHERE receiver_type = 'member' AND receiver_id = ? ORDER BY created_at DESC",
      [memberId],
    );

    return res.json(notifications);
  } catch (error) {
    console.log(error);
    if (error.name === "JsonWebTokenError" || error.message === "Unauthorized")
      return res.status(401).json({ error: "Unauthorized" });
    return res.status(500).json({ error: error.message });
  }
};

// Get unread count (requires auth; users can only access their own counts)
const getUnreadCount = async (req, res) => {
  try {
    const { type, id } = req.params;
    console.log("getUnreadCount called for type:", type, "id:", id);

    if (!["admin", "member"].includes(type)) {
      return res.status(400).json({ error: "Invalid type" });
    }

    const decoded = verifyToken(req);
    console.log("Decoded token:", decoded);

    if (decoded.role === "member") {
      if (type !== "member" || Number(decoded.id) !== Number(id))
        return res.status(403).json({ error: "Access denied" });
    } else {
      // admin-like roles
      const adminRoles = new Set([
        "admin",
        "sadmin",
        "supperadmin",
        "super-admin",
        "supper-admin",
      ]);
      if (
        !adminRoles.has(decoded.role) ||
        type !== "admin" ||
        Number(decoded.id) !== Number(id)
      )
        return res.status(403).json({ error: "Access denied" });
    }

    const [result] = await conn.query(
      "SELECT COUNT(*) as unread FROM notifications WHERE receiver_type = ? AND receiver_id = ? AND is_read = 0",
      [type, id],
    );
    console.log("Unread count result:", result[0].unread);

    return res.json({ unread: result[0].unread });
  } catch (error) {
    console.log("getUnreadCount error:", error);
    if (error.name === "JsonWebTokenError" || error.message === "Unauthorized")
      return res.status(401).json({ error: "Unauthorized" });
    return res.status(500).json({ error: error.message });
  }
};

// Mark notification as read (requires auth; only the notification recipient may mark it)
const markAsRead = async (req, res) => {
  try {
    const decoded = verifyToken(req);
    const { notificationId } = req.params;

    const [rows] = await conn.query(
      "SELECT receiver_type, receiver_id, is_read FROM notifications WHERE id = ?",
      [notificationId],
    );
    if (rows.length === 0)
      return res.status(404).json({ error: "Notification not found" });

    const notification = rows[0];

    if (notification.receiver_type === "member") {
      if (
        decoded.role !== "member" ||
        Number(decoded.id) !== Number(notification.receiver_id)
      ) {
        return res.status(403).json({ error: "Access denied" });
      }
    } else if (notification.receiver_type === "admin") {
      const adminRoles = new Set([
        "admin",
        "sadmin",
        "supperadmin",
        "super-admin",
        "supper-admin",
      ]);
      if (
        !adminRoles.has(decoded.role) ||
        Number(decoded.id) !== Number(notification.receiver_id)
      ) {
        return res.status(403).json({ error: "Access denied" });
      }
    } else {
      return res.status(403).json({ error: "Access denied" });
    }

    await conn.query("UPDATE notifications SET is_read = 1 WHERE id = ?", [
      notificationId,
    ]);

    return res.json({ message: "Notification marked as read" });
  } catch (error) {
    console.log(error);
    if (error.name === "JsonWebTokenError" || error.message === "Unauthorized")
      return res.status(401).json({ error: "Unauthorized" });
    return res.status(500).json({ error: error.message });
  }
};

// Create notification group
const createGroup = async (req, res) => {
  try {
    const decoded = verifyAdmin(req);
    const { name, members } = req.body; // members: [{type: 'admin'|'member', id: number}]

    if (!name || !members || !Array.isArray(members)) {
      return res
        .status(400)
        .json({ error: "name and members array are required" });
    }

    // Insert group
    const [groupResult] = await conn.query(
      "INSERT INTO notification_groups (name, created_by) VALUES (?, ?)",
      [name, decoded.id],
    );

    const groupId = groupResult.insertId;

    // Insert members
    const memberInserts = members.map((member) =>
      conn.query(
        "INSERT INTO notification_group_members (group_id, recipient_type, recipient_id) VALUES (?, ?, ?)",
        [groupId, member.type, member.id],
      ),
    );

    await Promise.all(memberInserts);

    return res.json({ message: "Group created successfully", groupId });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: error.message });
  }
};

// Get all groups
const getGroups = async (req, res) => {
  try {
    const [groups] = await conn.query(
      "SELECT id, name, created_at FROM notification_groups ORDER BY created_at DESC",
    );
    return res.json(groups);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: error.message });
  }
};

// Get group members
const getGroupMembers = async (req, res) => {
  try {
    const { groupId } = req.params;

    const [members] = await conn.query(
      "SELECT ngm.recipient_type, ngm.recipient_id, CASE WHEN ngm.recipient_type = 'admin' THEN u.fullname ELSE CONCAT(m.firstName, ' ', m.lastName) END as name FROM notification_group_members ngm LEFT JOIN users u ON ngm.recipient_type = 'admin' AND ngm.recipient_id = u.user_id LEFT JOIN members m ON ngm.recipient_type = 'member' AND ngm.recipient_id = m.id WHERE ngm.group_id = ?",
      [groupId],
    );

    return res.json(members);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: error.message });
  }
};

// Remove member from group
const removeGroupMember = async (req, res) => {
  try {
    const decoded = verifyAdmin(req);
    const { groupId } = req.params;
    const { recipientType, recipientId } = req.body;

    if (!recipientType || !recipientId) {
      return res
        .status(400)
        .json({ error: "recipientType and recipientId are required" });
    }

    // Check if the group exists and belongs to the admin
    const [group] = await conn.query(
      "SELECT id FROM notification_groups WHERE id = ? AND created_by = ?",
      [groupId, decoded.id],
    );
    if (group.length === 0) {
      return res
        .status(404)
        .json({ error: "Group not found or access denied" });
    }

    // Remove the member
    await conn.query(
      "DELETE FROM notification_group_members WHERE group_id = ? AND recipient_type = ? AND recipient_id = ?",
      [groupId, recipientType, recipientId],
    );

    return res.json({ message: "Member removed from group successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: error.message });
  }
};

module.exports = {
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
};
