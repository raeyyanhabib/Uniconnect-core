// routes/lostfound.js — Lost & Found (UC 30)
const express = require('express');
const crypto = require('crypto');
const db = require('../db');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();
router.use(authMiddleware);

function uuid() { return crypto.randomUUID(); }

// Browse lost & found items
router.get('/', async (req, res) => {
  const { type, status } = req.query;
  let query = `SELECT lf.*, u.name as reporterName FROM LostFound lf JOIN Users u ON u.id = lf.reporterId WHERE 1=1`;
  const params = [];

  if (type && type !== 'All') {
    query += ` AND lf.type = ?`;
    params.push(type);
  }
  if (status) {
    query += ` AND lf.status = ?`;
    params.push(status);
  }

  query += ` ORDER BY lf.createdAt DESC`;
  res.json(await db.prepare(query).all(...params));
});

// Report lost or found item
router.post('/', async (req, res) => {
  const { type, description, location } = req.body;
  if (!description || !location) return res.status(400).json({ error: 'Description and location are required' });

  const id = uuid();
  await db.prepare('INSERT INTO LostFound (id, type, description, location, reporterId) VALUES (?, ?, ?, ?, ?)').run(id, type || 'Lost', description, location, req.user.id);
  res.status(201).json({ message: 'Item reported', itemId: id });
});

// Mark item as resolved
router.put('/:id/resolve', async (req, res) => {
  await db.prepare("UPDATE LostFound SET status = 'resolved' WHERE id = ? AND reporterId = ?").run(req.params.id, req.user.id);
  res.json({ message: 'Item marked as resolved' });
});

module.exports = router;
