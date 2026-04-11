// routes/messages.js — Direct Messaging (UC 28)
// Handles all peer-to-peer messaging: listing conversations,
// fetching message history, and sending new messages.
// Creates conversations automatically when two users message for the first time.

const express = require('express');
const crypto = require('crypto');
const db = require('../db');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();
router.use(authMiddleware);


// Quick UUID generator for new conversations and messages
function uuid() { return crypto.randomUUID(); }


// Get all conversations for the logged-in user.
// Joins with the Users table to show the other participant's name,
// and grabs the last message text/time for preview in the sidebar.
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


// Get all messages in a specific conversation, ordered chronologically.
// The "mine" flag tells the frontend which side to render each bubble on.
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


// Send a new message — either to an existing conversation or start a new one.
// If you provide a toUserId without a conversationId, it checks for an existing
// conversation between you two (or creates one if needed), then drops the message in.
router.post('/send', (req, res) => {
  const { toUserId, text, conversationId } = req.body;

  if (!text) return res.status(400).json({ error: 'Text is required' });

  let convId = conversationId;

  // If no conversation ID was given, find or create one with the target user
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
