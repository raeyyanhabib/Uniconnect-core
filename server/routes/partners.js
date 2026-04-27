// routes/partners.js — Study Partner Search, Requests, List (UC 7–9)
// This file handles everything related to study partners: finding new ones,
// sending/receiving requests, and managing your existing partner list.

const express = require('express');
const crypto = require('crypto');
const db = require('../db');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();
router.use(authMiddleware);


// Quick helper to mint a fresh UUID for new database records
function uuid() { return crypto.randomUUID(); }


// UC 7 — Search for students you might want to partner up with.
// You can optionally filter by name/bio text (q) and department (dept).
// Only shows active students, and never shows yourself in the results.
router.get('/search', async (req, res) => {
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

  const users = await db.prepare(query).all(...params);
  res.json(users);
});


// UC 8 — Send a partner request to another student.
// Prevents duplicate pending requests and blocks re-partnering with existing partners.
router.post('/requests', async (req, res) => {
  const { toId } = req.body;
  if (!toId) return res.status(400).json({ error: 'toId is required' });

  // Make sure we haven't already sent them a pending request
  const existing = await db.prepare(
    `SELECT id FROM PartnerRequests WHERE fromId = ? AND toId = ? AND status = 'pending'`
  ).get(req.user.id, toId);
  if (existing) return res.status(409).json({ error: 'Request already sent' });

  // Make sure we aren't already partners with this person
  const alreadyPartners = await db.prepare(
    `SELECT id FROM PartnerRequests
     WHERE ((fromId = ? AND toId = ?) OR (fromId = ? AND toId = ?)) AND status = 'accepted'`
  ).get(req.user.id, toId, toId, req.user.id);
  if (alreadyPartners) return res.status(409).json({ error: 'Already partners' });

  const id = uuid();
  await db.prepare('INSERT INTO PartnerRequests (id, fromId, toId) VALUES (?, ?, ?)').run(id, req.user.id, toId);
  res.status(201).json({ message: 'Partner request sent', requestId: id });
});


// UC 9 — Fetch all incoming partner requests waiting for your response.
// Returns the sender's profile info alongside each request so the UI can show who it's from.
router.get('/requests', async (req, res) => {
  const requests = await db.prepare(`
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


// UC 9 — Accept or decline a partner request that was sent to you.
// Updates the request status accordingly in the database.
router.put('/requests/:id', async (req, res) => {
  const { action } = req.body; // 'accept' or 'decline'
  if (!['accept', 'decline'].includes(action)) {
    return res.status(400).json({ error: 'action must be accept or decline' });
  }

  const request = await db.prepare('SELECT * FROM PartnerRequests WHERE id = ? AND toId = ?').get(req.params.id, req.user.id);
  if (!request) return res.status(404).json({ error: 'Request not found' });

  const newStatus = action === 'accept' ? 'accepted' : 'declined';
  await db.prepare('UPDATE PartnerRequests SET status = ? WHERE id = ?').run(newStatus, req.params.id);
  res.json({ message: `Request ${newStatus}` });
});


// Grab your full partner list — everyone who you've mutually accepted.
// Uses SELECT DISTINCT to make sure nobody shows up twice (which could happen
// if there are multiple accepted request rows between the same two people).
router.get('/', async (req, res) => {
  const partners = await db.prepare(`
    SELECT DISTINCT u.id, u.name, u.email, u.department, u.semester, u.bio, u.avgRating
    FROM PartnerRequests pr
    JOIN Users u ON (u.id = pr.fromId OR u.id = pr.toId)
    WHERE ((pr.fromId = ? OR pr.toId = ?) AND pr.status = 'accepted')
      AND u.id != ?
    GROUP BY u.id
  `).all(req.user.id, req.user.id, req.user.id);

  res.json(partners);
});


// Remove an existing partner — deletes the accepted request between you two.
router.delete('/:partnerId', async (req, res) => {
  await db.prepare(`
    DELETE FROM PartnerRequests
    WHERE ((fromId = ? AND toId = ?) OR (fromId = ? AND toId = ?)) AND status = 'accepted'
  `).run(req.user.id, req.params.partnerId, req.params.partnerId, req.user.id);

  res.json({ message: 'Partner removed' });
});


module.exports = router;
