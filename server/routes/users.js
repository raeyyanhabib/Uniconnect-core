// routes/users.js — Profile & Privacy (UC 4, 6)
const express = require('express');
const db = require('../db');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// All routes here require authentication
router.use(authMiddleware);

// UC 4 — Get own profile
router.get('/me', (req, res) => {
  const user = db.prepare(`
    SELECT id, name, email, department, semester, bio, studentId,
           role, status, isVerified, avgRating,
           showEmail, showDept, showSemester, showRating,
           allowRequests, visibility, createdAt
    FROM Users WHERE id = ?
  `).get(req.user.id);

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  res.json(user);
});

// UC 4 — Update profile (name, bio, department, semester)
router.put('/me', (req, res) => {
  const { name, bio, department, semester } = req.body;

  db.prepare(`
    UPDATE Users
    SET name = COALESCE(?, name),
        bio = COALESCE(?, bio),
        department = COALESCE(?, department),
        semester = COALESCE(?, semester)
    WHERE id = ?
  `).run(name, bio, department, semester, req.user.id);

  const updated = db.prepare('SELECT id, name, email, department, semester, bio, role, status, avgRating FROM Users WHERE id = ?').get(req.user.id);
  res.json(updated);
});

// UC 6 — Update privacy settings
router.put('/me/privacy', (req, res) => {
  const { showEmail, showDept, showSemester, showRating, allowRequests, visibility } = req.body;

  db.prepare(`
    UPDATE Users
    SET showEmail = COALESCE(?, showEmail),
        showDept = COALESCE(?, showDept),
        showSemester = COALESCE(?, showSemester),
        showRating = COALESCE(?, showRating),
        allowRequests = COALESCE(?, allowRequests),
        visibility = COALESCE(?, visibility)
    WHERE id = ?
  `).run(
    showEmail != null ? (showEmail ? 1 : 0) : null,
    showDept != null ? (showDept ? 1 : 0) : null,
    showSemester != null ? (showSemester ? 1 : 0) : null,
    showRating != null ? (showRating ? 1 : 0) : null,
    allowRequests != null ? (allowRequests ? 1 : 0) : null,
    visibility || null,
    req.user.id
  );

  res.json({ message: 'Privacy settings updated' });
});

// Get real user dashboard stats
router.get('/dashboard', (req, res) => {
  const userId = req.user.id;
  
  const partners = db.prepare(`SELECT count(*) as c FROM PartnerRequests WHERE (fromId = ? OR toId = ?) AND status = 'accepted'`).get(userId, userId).c || 0;
  const groups = db.prepare(`SELECT count(*) as c FROM GroupMembers WHERE userId = ?`).get(userId).c || 0;
  const resources = db.prepare(`SELECT count(*) as c FROM Resources WHERE ownerId = ?`).get(userId).c || 0;
  const loans = db.prepare(`SELECT count(*) as c FROM Transactions WHERE borrowerId = ? AND status = 'active'`).get(userId).c || 0;

  res.json({
    stats: { partners, groups, resources, loans }
  });
});

module.exports = router;
