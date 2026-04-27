// routes/news.js — University News feed (dashboard widget)
// Handles fetching and posting campus news articles that show up on the dashboard.
const express = require('express');
const crypto = require('crypto');
const db = require('../db');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();
router.use(authMiddleware);

function uuid() { return crypto.randomUUID(); }

// Grab latest news articles — the dashboard pulls from here to stay synced
router.get('/', async (req, res) => {
  const news = await db.prepare(`
    SELECT n.*, u.name as authorName
    FROM News n
    JOIN Users u ON u.id = n.authorId
    ORDER BY n.createdAt DESC
    LIMIT 20
  `).all();
  res.json(news);
});

// Post a new news article — called from the AddNewsPage form
router.post('/', async (req, res) => {
  const { title, content, imageUrl } = req.body;
  if (!title) return res.status(400).json({ error: 'Title is required' });

  const id = uuid();
  await db.prepare('INSERT INTO News (id, title, content, imageUrl, authorId) VALUES (?, ?, ?, ?, ?)')
    .run(id, title, content || null, imageUrl || null, req.user.id);
  res.status(201).json({ message: 'News posted', newsId: id });
});

module.exports = router;
