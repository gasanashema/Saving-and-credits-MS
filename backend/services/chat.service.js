require("dotenv").config();
const jwt = require("jsonwebtoken");
const conn = require("../db/connection");
const { createNotification } = require("../utilities/notify.helper");

const verifyToken = (req) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new Error("Unauthorized");
  }
  const token = authHeader.substring(7);
  return jwt.verify(token, process.env.JWT_SECRET);
};

const isAdminRole = (role) => {
  const adminRoles = new Set([
    "admin",
    "sadmin",
    "supperadmin",
    "super-admin",
    "supper-admin",
  ]);
  return adminRoles.has(role);
};

// Send a single chat message
const sendMessage = async (req, res) => {
  try {
    const decoded = verifyToken(req);
    const { receiverType, receiverId, message } = req.body;
    console.debug("chat.send: body raw", req.body);
    // validate message
    if (!message || typeof message !== "string" || message.trim() === "") {
      return res.status(400).json({ error: "message is required" });
    }
    // validate receiverType
    if (!["admin", "member"].includes(receiverType)) {
      return res
        .status(400)
        .json({ error: 'receiverType must be "admin" or "member"' });
    }
    // validate receiverId (allow 0)
    if (receiverId == null || Number.isNaN(Number(receiverId))) {
      return res.status(400).json({ error: "receiverId is required" });
    }

    const toReceiverId = Number(receiverId);

    const senderType = decoded.role === "member" ? "member" : "admin";
    const senderId = decoded.id;

    // Insert chat
    console.debug("chat.send: payload", {
      senderType,
      senderId,
      receiverType,
      receiverId: toReceiverId,
      message: message?.slice?.(0, 200),
    });
    const [result] = await conn.query(
      "INSERT INTO chats (sender_type, sender_id, receiver_type, receiver_id, message) VALUES (?, ?, ?, ?, ?)",
      [senderType, senderId, receiverType, toReceiverId, message],
    );

    const insertedId = result && result.insertId ? result.insertId : null;
    console.debug("chat.send: insertId", insertedId);

    if (!insertedId) {
      console.error("chat.send: insert failed, no insertId returned");
      return res.status(500).json({ error: "Chat insert failed" });
    }

    // fetch the inserted row to return it to the client
    const [rows] = await conn.query(
      "SELECT id, sender_type, sender_id, receiver_type, receiver_id, message, is_read, created_at FROM chats WHERE id = ?",
      [insertedId],
    );
    const insertedRow = rows && rows[0] ? rows[0] : null;
    console.debug("chat.send: insertedRow", insertedRow);

    // If an admin sends a message to a member, create a lightweight notification so the member sees there's a new chat
    try {
      if (senderType === "admin" && receiverType === "member") {
        const title = "New message from admin";
        const shortMsg =
          message.length > 120 ? message.slice(0, 117) + "..." : message;
        const url = "/member/chat";
        await createNotification({
          senderAdminId: senderId,
          receiverType: "member",
          receiverId,
          title,
          message: shortMsg,
          url,
        });
      }
    } catch (e) {
      console.error("Failed to create notification for chat message", e);
    }

    return res.json({ message: "Sent", id: insertedId, chat: insertedRow });
  } catch (error) {
    console.error("sendMessage error:", error);
    if (error.name === "JsonWebTokenError" || error.message === "Unauthorized")
      return res.status(401).json({ error: "Unauthorized" });
    return res.status(500).json({ error: error.message });
  }
};

// Send to a group (admin only)
const sendToGroup = async (req, res) => {
  try {
    const decoded = verifyToken(req);
    if (!isAdminRole(decoded.role))
      return res.status(403).json({ error: "Only admins can send to groups" });

    const { groupId, message } = req.body;
    if (!groupId || !message)
      return res.status(400).json({ error: "groupId and message required" });

    const [members] = await conn.query(
      "SELECT recipient_type, recipient_id FROM notification_group_members WHERE group_id = ?",
      [groupId],
    );

    if (members.length === 0)
      return res.status(400).json({ error: "Group empty or not found" });

    const inserts = members.map((m) =>
      conn.query(
        "INSERT INTO chats (sender_type, sender_id, receiver_type, receiver_id, message) VALUES (?, ?, ?, ?, ?)",
        ["admin", decoded.id, m.recipient_type, m.recipient_id, message],
      ),
    );
    await Promise.all(inserts);

    return res.json({
      message: `Message sent to ${members.length} recipients`,
    });
  } catch (error) {
    console.error("sendToGroup error:", error);
    if (error.name === "JsonWebTokenError" || error.message === "Unauthorized")
      return res.status(401).json({ error: "Unauthorized" });
    return res.status(500).json({ error: error.message });
  }
};

// Get conversation between the authenticated user and another user
const getConversation = async (req, res) => {
  try {
    const decoded = verifyToken(req);
    const { otherType, otherId } = req.params;

    // Validate otherType
    if (!["admin", "member"].includes(otherType))
      return res.status(400).json({ error: "Invalid otherType" });

    // Members may only fetch conversations with admins; admins can fetch any conversation
    if (decoded.role === "member" && otherType !== "admin")
      return res
        .status(403)
        .json({ error: "Members can only view conversations with admins" });

    const myType = decoded.role === "member" ? "member" : "admin";
    const myId = decoded.id;

    // Only allow fetching conversations that involve the authenticated user
    const [messages] = await conn.query(
      "SELECT id, sender_type, sender_id, receiver_type, receiver_id, message, is_read, created_at FROM chats WHERE (sender_type = ? AND sender_id = ? AND receiver_type = ? AND receiver_id = ?) OR (sender_type = ? AND sender_id = ? AND receiver_type = ? AND receiver_id = ?) ORDER BY created_at ASC",
      [myType, myId, otherType, otherId, otherType, otherId, myType, myId],
    );

    return res.json(messages);
  } catch (error) {
    console.error("getConversation error:", error);
    if (error.name === "JsonWebTokenError" || error.message === "Unauthorized")
      return res.status(401).json({ error: "Unauthorized" });
    return res.status(500).json({ error: error.message });
  }
};

// unread count
const getUnreadCount = async (req, res) => {
  try {
    const decoded = verifyToken(req);
    const { type, id } = req.params;

    // ownership checks
    if (decoded.role === "member") {
      if (type !== "member" || Number(decoded.id) !== Number(id))
        return res.status(403).json({ error: "Access denied" });
    } else {
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
      "SELECT COUNT(*) as unread FROM chats WHERE receiver_type = ? AND receiver_id = ? AND is_read = 0",
      [type, id],
    );
    return res.json({ unread: result[0].unread });
  } catch (error) {
    console.error("getUnreadCount error:", error);
    if (error.name === "JsonWebTokenError" || error.message === "Unauthorized")
      return res.status(401).json({ error: "Unauthorized" });
    return res.status(500).json({ error: error.message });
  }
};

// Get list of partners (admins for members, members for admins) with latest message and unread count
const getPartners = async (req, res) => {
  try {
    const decoded = verifyToken(req);
    const myType = decoded.role === "member" ? "member" : "admin";
    const myId = decoded.id;

    if (myType === "member") {
      // list admins
      const [admins] = await conn.query(
        "SELECT user_id, fullname, email FROM users WHERE role IN ('admin','supperadmin','sadmin')",
      );
      const result = await Promise.all(
        admins.map(async (admin) => {
          const [last] = await conn.query(
            "SELECT id, sender_type, sender_id, receiver_type, receiver_id, message, is_read, created_at FROM chats WHERE (sender_type = ? AND sender_id = ? AND receiver_type = ? AND receiver_id = ?) OR (sender_type = ? AND sender_id = ? AND receiver_type = ? AND receiver_id = ?) ORDER BY created_at DESC LIMIT 1",
            [
              "admin",
              admin.user_id,
              "member",
              myId,
              "member",
              myId,
              "admin",
              admin.user_id,
            ],
          );
          const [unread] = await conn.query(
            "SELECT COUNT(*) as c FROM chats WHERE sender_type = ? AND sender_id = ? AND receiver_type = ? AND receiver_id = ? AND is_read = 0",
            ["admin", admin.user_id, "member", myId],
          );
          return {
            partnerType: "admin",
            user_id: admin.user_id,
            fullname: admin.fullname,
            email: admin.email,
            lastMessage: last[0] || null,
            unreadCount: unread[0].c,
          };
        }),
      );
      return res.json(result);
    } else {
      // admin: list members who have chatted with this admin
      const [members] = await conn.query(
        'SELECT DISTINCT m.id, m.firstName, m.lastName, m.telephone FROM chats c JOIN members m ON ((c.sender_type = \"member\" AND c.sender_id = m.id) OR (c.receiver_type = \"member\" AND c.receiver_id = m.id)) WHERE (c.sender_type = ? AND c.sender_id = ?) OR (c.receiver_type = ? AND c.receiver_id = ?) ORDER BY m.firstName',
        ["admin", myId, "admin", myId],
      );
      const result = await Promise.all(
        members.map(async (member) => {
          const [last] = await conn.query(
            "SELECT id, sender_type, sender_id, receiver_type, receiver_id, message, is_read, created_at FROM chats WHERE (sender_type = ? AND sender_id = ? AND receiver_type = ? AND receiver_id = ?) OR (sender_type = ? AND sender_id = ? AND receiver_type = ? AND receiver_id = ?) ORDER BY created_at DESC LIMIT 1",
            [
              "admin",
              myId,
              "member",
              member.id,
              "member",
              member.id,
              "admin",
              myId,
            ],
          );
          const [unread] = await conn.query(
            "SELECT COUNT(*) as c FROM chats WHERE sender_type = ? AND sender_id = ? AND receiver_type = ? AND receiver_id = ? AND is_read = 0",
            ["member", member.id, "admin", myId],
          );
          return {
            partnerType: "member",
            id: member.id,
            fullname: `${member.firstName} ${member.lastName}`,
            telephone: member.telephone,
            lastMessage: last[0] || null,
            unreadCount: unread[0].c,
          };
        }),
      );
      return res.json(result);
    }
  } catch (error) {
    console.error("getPartners error:", error);
    if (error.name === "JsonWebTokenError" || error.message === "Unauthorized")
      return res.status(401).json({ error: "Unauthorized" });
    return res.status(500).json({ error: error.message });
  }
};

// mark message as read
const markAsRead = async (req, res) => {
  try {
    const decoded = verifyToken(req);
    const { messageId } = req.params;

    const [rows] = await conn.query(
      "SELECT receiver_type, receiver_id FROM chats WHERE id = ?",
      [messageId],
    );
    if (rows.length === 0)
      return res.status(404).json({ error: "Message not found" });
    const msg = rows[0];

    // only recipient can mark
    const expectedType = decoded.role === "member" ? "member" : "admin";
    if (
      msg.receiver_type !== expectedType ||
      Number(msg.receiver_id) !== Number(decoded.id)
    )
      return res.status(403).json({ error: "Access denied" });

    await conn.query("UPDATE chats SET is_read = 1 WHERE id = ?", [messageId]);
    return res.json({ message: "Marked" });
  } catch (error) {
    console.error("markAsRead error:", error);
    if (error.name === "JsonWebTokenError" || error.message === "Unauthorized")
      return res.status(401).json({ error: "Unauthorized" });
    return res.status(500).json({ error: error.message });
  }
};

module.exports = {
  sendMessage,
  sendToGroup,
  getConversation,
  getUnreadCount,
  markAsRead,
  getPartners,
};
