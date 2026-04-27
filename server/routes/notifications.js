// routes/notifications.js — Automated Notifications (UC 29)
const express = require('express');
const db = require('../db');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();
router.use(authMiddleware);

// Get all notifications for current user
router.get('/', async (req, res) => {
  const notifs = await db.prepare(`
    SELECT * FROM Notifications WHERE userId = ? ORDER BY sentAt DESC
  `).all(req.user.id);
  res.json(notifs);
});

// Mark all as read
router.put('/read-all', async (req, res) => {
  await db.prepare('UPDATE Notifications SET isRead = 1 WHERE userId = ?').run(req.user.id);
  res.json({ message: 'All notifications marked as read' });
});

// Mark single as read
router.put('/:id/read', async (req, res) => {
  await db.prepare('UPDATE Notifications SET isRead = 1 WHERE id = ? AND userId = ?').run(req.params.id, req.user.id);
  res.json({ message: 'Notification marked as read' });
});

// the sidebar badge pulls this number to show how many unread notifs you have
// Get unread count
router.get('/unread-count', async (req, res) => {
  const result = await db.prepare('SELECT COUNT(*) as count FROM Notifications WHERE userId = ? AND isRead = 0').get(req.user.id);
  res.json({ count: result.count || 0 });
});

module.exports = router;
