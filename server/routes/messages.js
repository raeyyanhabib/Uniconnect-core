// routes/messages.js — Direct Messaging (UC 28)
const express = require('express');
const crypto = require('crypto');
const db = require('../db');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();
router.use(authMiddleware);

function uuid() { return crypto.randomUUID(); }

// Get all conversations for current user
router.get('/', (req, res) => {
  const conversations = db.prepare(`
    SELECT c.*,
           u.id as participantId, u.name as participantName, u.department as participantDept,
           (SELECT text FROM Messages WHERE convId = c.id ORDER BY sentAt DESC LIMIT 1) as lastMessage,
           (SELECT sentAt FROM Messages WHERE convId = c.id ORDER BY sentAt DESC LIMIT 1) as lastMessageTime
    FROM Conversations c
    JOIN Users u ON (u.id = c.user1Id OR u.id = c.user2Id) AND u.id != ?
    WHERE c.user1Id = ? OR c.user2Id = ?
    ORDER BY lastMessageTime DESC
  `).all(req.user.id, req.user.id, req.user.id);
  res.json(conversations);
});

// Get messages in a conversation
router.get('/:id/messages', (req, res) => {
  const messages = db.prepare(`
    SELECT m.*, u.name as senderName,
           (CASE WHEN m.senderId = ? THEN 1 ELSE 0 END) as mine
    FROM Messages m
    JOIN Users u ON u.id = m.senderId
    WHERE m.convId = ?
    ORDER BY m.sentAt ASC
  `).all(req.user.id, req.params.id);
  res.json(messages);
});

// Send a message (creates conversation if needed)
router.post('/send', (req, res) => {
  const { toUserId, text, conversationId } = req.body;
  if (!text) return res.status(400).json({ error: 'Text is required' });

  let convId = conversationId;

  // If no conversation exists, create one
  if (!convId && toUserId) {
    const existing = db.prepare(`
      SELECT id FROM Conversations
      WHERE (user1Id = ? AND user2Id = ?) OR (user1Id = ? AND user2Id = ?)
    `).get(req.user.id, toUserId, toUserId, req.user.id);

    if (existing) {
      convId = existing.id;
    } else {
      convId = uuid();
      db.prepare('INSERT INTO Conversations (id, user1Id, user2Id) VALUES (?, ?, ?)').run(convId, req.user.id, toUserId);
    }
  }

  if (!convId) return res.status(400).json({ error: 'conversationId or toUserId required' });

  const msgId = uuid();
  db.prepare('INSERT INTO Messages (id, convId, senderId, text) VALUES (?, ?, ?, ?)').run(msgId, convId, req.user.id, text);
  res.status(201).json({ message: 'Message sent', msgId, conversationId: convId });
});

module.exports = router;
