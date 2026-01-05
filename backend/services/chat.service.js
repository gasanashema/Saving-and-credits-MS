require('dotenv').config();
const jwt = require('jsonwebtoken');
const conn = require('../db/connection');

const verifyToken = (req) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Unauthorized');
  }
  const token = authHeader.substring(7);
  return jwt.verify(token, process.env.JWT_SECRET);
};

const isAdminRole = (role) => {
  const adminRoles = new Set(['admin','sadmin','supperadmin','super-admin','supper-admin']);
  return adminRoles.has(role);
}

// Send a single chat message
const sendMessage = async (req, res) => {
  try {
    const decoded = verifyToken(req);
    const { receiverType, receiverId, message } = req.body;
    if (!receiverType || !receiverId || !message) return res.status(400).json({ error: 'receiverType, receiverId and message are required' });

    let senderType = decoded.role === 'member' ? 'member' : 'admin';
    const senderId = decoded.id;

    // If sender is member, ensure they are sending as themselves
    if (senderType === 'member' && String(senderId) !== String(decoded.id)) return res.status(403).json({ error: 'Access denied' });

    // Insert chat
    const [result] = await conn.query(
      'INSERT INTO chats (sender_type, sender_id, receiver_type, receiver_id, message) VALUES (?, ?, ?, ?, ?)',
      [senderType, senderId, receiverType, receiverId, message]
    );

    return res.json({ message: 'Sent', id: result.insertId });
  } catch (error) {
    console.error('sendMessage error:', error);
    if (error.name === 'JsonWebTokenError' || error.message === 'Unauthorized') return res.status(401).json({ error: 'Unauthorized' });
    return res.status(500).json({ error: error.message });
  }
};

// Send to a group (admin only)
const sendToGroup = async (req, res) => {
  try {
    const decoded = verifyToken(req);
    if (!isAdminRole(decoded.role)) return res.status(403).json({ error: 'Only admins can send to groups' });

    const { groupId, message } = req.body;
    if (!groupId || !message) return res.status(400).json({ error: 'groupId and message required' });

    const [members] = await conn.query('SELECT recipient_type, recipient_id FROM notification_group_members WHERE group_id = ?', [groupId]);

    if (members.length === 0) return res.status(400).json({ error: 'Group empty or not found' });

    const inserts = members.map(m => conn.query('INSERT INTO chats (sender_type, sender_id, receiver_type, receiver_id, message) VALUES (?, ?, ?, ?, ?)', ['admin', decoded.id, m.recipient_type, m.recipient_id, message]));
    await Promise.all(inserts);

    return res.json({ message: `Message sent to ${members.length} recipients` });
  } catch (error) {
    console.error('sendToGroup error:', error);
    if (error.name === 'JsonWebTokenError' || error.message === 'Unauthorized') return res.status(401).json({ error: 'Unauthorized' });
    return res.status(500).json({ error: error.message });
  }
};

// Get conversation between the authenticated user and another user
const getConversation = async (req, res) => {
  try {
    const decoded = verifyToken(req);
    const { otherType, otherId } = req.params;

    // Build where clause: messages where (sender = me AND receiver = other) OR (sender = other AND receiver = me)
    const myType = decoded.role === 'member' ? 'member' : 'admin';
    const myId = decoded.id;

    // If member, ensure they are only fetching conversations involving themselves
    if (decoded.role === 'member' && myType !== otherType && String(myId) !== String(req.params.otherId) && otherType !== 'admin') {
      // continue; member can fetch conversation with admin only
    }

    const [messages] = await conn.query(
      'SELECT id, sender_type, sender_id, receiver_type, receiver_id, message, is_read, created_at FROM chats WHERE (sender_type = ? AND sender_id = ? AND receiver_type = ? AND receiver_id = ?) OR (sender_type = ? AND sender_id = ? AND receiver_type = ? AND receiver_id = ?) ORDER BY created_at ASC',
      [myType, myId, otherType, otherId, otherType, otherId, myType, myId]
    );

    return res.json(messages);
  } catch (error) {
    console.error('getConversation error:', error);
    if (error.name === 'JsonWebTokenError' || error.message === 'Unauthorized') return res.status(401).json({ error: 'Unauthorized' });
    return res.status(500).json({ error: error.message });
  }
};

// unread count
const getUnreadCount = async (req, res) => {
  try {
    const decoded = verifyToken(req);
    const { type, id } = req.params;

    // ownership checks
    if (decoded.role === 'member') {
      if (type !== 'member' || Number(decoded.id) !== Number(id)) return res.status(403).json({ error: 'Access denied' });
    } else {
      if (type !== 'admin' || Number(decoded.id) !== Number(id)) return res.status(403).json({ error: 'Access denied' });
    }

    const [result] = await conn.query('SELECT COUNT(*) as unread FROM chats WHERE receiver_type = ? AND receiver_id = ? AND is_read = 0', [type, id]);
    return res.json({ unread: result[0].unread });
  } catch (error) {
    console.error('getUnreadCount error:', error);
    if (error.name === 'JsonWebTokenError' || error.message === 'Unauthorized') return res.status(401).json({ error: 'Unauthorized' });
    return res.status(500).json({ error: error.message });
  }
};

// mark message as read
const markAsRead = async (req, res) => {
  try {
    const decoded = verifyToken(req);
    const { messageId } = req.params;

    const [rows] = await conn.query('SELECT receiver_type, receiver_id FROM chats WHERE id = ?', [messageId]);
    if (rows.length === 0) return res.status(404).json({ error: 'Message not found' });
    const msg = rows[0];

    // only recipient can mark
    const expectedType = decoded.role === 'member' ? 'member' : 'admin';
    if (msg.receiver_type !== expectedType || Number(msg.receiver_id) !== Number(decoded.id)) return res.status(403).json({ error: 'Access denied' });

    await conn.query('UPDATE chats SET is_read = 1 WHERE id = ?', [messageId]);
    return res.json({ message: 'Marked' });
  } catch (error) {
    console.error('markAsRead error:', error);
    if (error.name === 'JsonWebTokenError' || error.message === 'Unauthorized') return res.status(401).json({ error: 'Unauthorized' });
    return res.status(500).json({ error: error.message });
  }
};

module.exports = {
  sendMessage,
  sendToGroup,
  getConversation,
  getUnreadCount,
  markAsRead,
};