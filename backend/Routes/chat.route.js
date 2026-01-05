const express = require('express');
const { sendMessage, sendToGroup, getConversation, getUnreadCount, markAsRead } = require('../services/chat.service');
const router = express.Router();

router.post('/send', sendMessage);
router.post('/group', sendToGroup);
router.get('/with/:otherType/:otherId', getConversation);
router.get('/unread/:type/:id', getUnreadCount);
router.put('/read/:messageId', markAsRead);

module.exports = router;
