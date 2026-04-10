// routes/partners.js — Study Partner Search, Requests, List (UC 7–9)
const express = require('express');
const crypto = require('crypto');
const db = require('../db');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();
router.use(authMiddleware);

function uuid() { return crypto.randomUUID(); }

// UC 7 — Search Students (filter by dept/name)
router.get('/search', (req, res) => {
  const { q, dept } = req.query;
  let query = `SELECT id, name, email, department, semester, bio, avgRating, status
               FROM Users WHERE id != ? AND role = 'student' AND status = 'active'`;
  const params = [req.user.id];

  if (q) {
    query += ` AND (name LIKE ? OR bio LIKE ?)`;
    params.push(`%${q}%`, `%${q}%`);
  }
  if (dept) {
    query += ` AND department = ?`;
    params.push(dept);
  }

  const users = db.prepare(query).all(...params);
  res.json(users);
});

// UC 8 — Send Partner Request
router.post('/requests', (req, res) => {
  const { toId } = req.body;
  if (!toId) return res.status(400).json({ error: 'toId is required' });

  // Check if request already exists
  const existing = db.prepare(
    `SELECT id FROM PartnerRequests WHERE fromId = ? AND toId = ? AND status = 'pending'`
  ).get(req.user.id, toId);
  if (existing) return res.status(409).json({ error: 'Request already sent' });

  // Check if already partners
  const alreadyPartners = db.prepare(
    `SELECT id FROM PartnerRequests
     WHERE ((fromId = ? AND toId = ?) OR (fromId = ? AND toId = ?)) AND status = 'accepted'`
  ).get(req.user.id, toId, toId, req.user.id);
  if (alreadyPartners) return res.status(409).json({ error: 'Already partners' });

  const id = uuid();
  db.prepare('INSERT INTO PartnerRequests (id, fromId, toId) VALUES (?, ?, ?)').run(id, req.user.id, toId);
  res.status(201).json({ message: 'Partner request sent', requestId: id });
});

// UC 9 — Get incoming partner requests
router.get('/requests', (req, res) => {
  const requests = db.prepare(`
    SELECT pr.id, pr.status, pr.createdAt,
           u.id as fromId, u.name as fromName, u.email as fromEmail,
           u.department as fromDept, u.semester as fromSemester, u.bio as fromBio
    FROM PartnerRequests pr
    JOIN Users u ON u.id = pr.fromId
    WHERE pr.toId = ? AND pr.status = 'pending'
    ORDER BY pr.createdAt DESC
  `).all(req.user.id);
  res.json(requests);
});

// UC 9 — Accept or Decline partner request
router.put('/requests/:id', (req, res) => {
  const { action } = req.body; // 'accept' or 'decline'
  if (!['accept', 'decline'].includes(action)) {
    return res.status(400).json({ error: 'action must be accept or decline' });
  }

  const request = db.prepare('SELECT * FROM PartnerRequests WHERE id = ? AND toId = ?').get(req.params.id, req.user.id);
  if (!request) return res.status(404).json({ error: 'Request not found' });

  const newStatus = action === 'accept' ? 'accepted' : 'declined';
  db.prepare('UPDATE PartnerRequests SET status = ? WHERE id = ?').run(newStatus, req.params.id);
  res.json({ message: `Request ${newStatus}` });
});

// Get my partners (accepted requests)
router.get('/', (req, res) => {
  const partners = db.prepare(`
    SELECT u.id, u.name, u.email, u.department, u.semester, u.bio, u.avgRating
    FROM PartnerRequests pr
    JOIN Users u ON (u.id = pr.fromId OR u.id = pr.toId)
    WHERE ((pr.fromId = ? OR pr.toId = ?) AND pr.status = 'accepted')
      AND u.id != ?
  `).all(req.user.id, req.user.id, req.user.id);
  res.json(partners);
});

// Remove a partner
router.delete('/:partnerId', (req, res) => {
  db.prepare(`
    DELETE FROM PartnerRequests
    WHERE ((fromId = ? AND toId = ?) OR (fromId = ? AND toId = ?)) AND status = 'accepted'
  `).run(req.user.id, req.params.partnerId, req.params.partnerId, req.user.id);
  res.json({ message: 'Partner removed' });
});

module.exports = router;
