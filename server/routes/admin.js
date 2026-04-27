// routes/admin.js — Admin Dashboard, Users, Resources, Reports (UC 31–34)
const express = require('express');
const db = require('../db');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

const router = express.Router();
router.use(authMiddleware);
router.use(adminMiddleware);

// this is the main stats engine for the admin panel — counts everything in one big query burst
// UC 31 — Admin Dashboard Stats
router.get('/dashboard', (req, res) => {
  const totalUsers = db.prepare('SELECT COUNT(*) as cnt FROM Users WHERE role = ?').get('student').cnt;
  const activeUsers = db.prepare("SELECT COUNT(*) as cnt FROM Users WHERE role = 'student' AND status = 'active'").get().cnt;
  const blockedUsers = db.prepare("SELECT COUNT(*) as cnt FROM Users WHERE status = 'blocked'").get().cnt;
  const totalGroups = db.prepare('SELECT COUNT(*) as cnt FROM StudyGroups').get().cnt;
  const totalResources = db.prepare('SELECT COUNT(*) as cnt FROM Resources').get().cnt;
  const activeLoans = db.prepare("SELECT COUNT(*) as cnt FROM Transactions WHERE status = 'active'").get().cnt;
  const overdueLoans = db.prepare("SELECT COUNT(*) as cnt FROM Transactions WHERE status = 'overdue'").get().cnt;
  const pendingReports = db.prepare("SELECT COUNT(*) as cnt FROM Reports WHERE status = 'pending'").get().cnt;
  const lostItems = db.prepare("SELECT COUNT(*) as cnt FROM LostFound WHERE type = 'Lost' AND status = 'open'").get().cnt;

  res.json({
    totalUsers, activeUsers, blockedUsers,
    totalGroups, totalResources,
    activeLoans, overdueLoans,
    pendingReports, lostItems,
  });
});

// UC 32 — List all users
router.get('/users', (req, res) => {
  const { q } = req.query;
  let query = `SELECT id, name, email, department, semester, role, status, avgRating, isVerified, createdAt FROM Users WHERE 1=1`;
  const params = [];

  if (q) {
    query += ` AND (name LIKE ? OR email LIKE ?)`;
    params.push(`%${q}%`, `%${q}%`);
  }
  query += ` ORDER BY createdAt DESC`;
  res.json(db.prepare(query).all(...params));
});

// UC 32 — Block/Unblock User
router.put('/users/:id/block', (req, res) => {
  const user = db.prepare('SELECT status FROM Users WHERE id = ?').get(req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });

  const newStatus = user.status === 'blocked' ? 'active' : 'blocked';
  db.prepare('UPDATE Users SET status = ? WHERE id = ?').run(newStatus, req.params.id);
  res.json({ message: `User ${newStatus}`, status: newStatus });
});

// UC 33 — List flagged resources
router.get('/resources', (req, res) => {
  const resources = db.prepare(`
    SELECT r.*, u.name as ownerName,
           (SELECT COUNT(*) FROM Reports WHERE reportedId = r.ownerId AND type = 'Resource') as reportCount
    FROM Resources r
    JOIN Users u ON u.id = r.ownerId
    ORDER BY reportCount DESC, r.createdAt DESC
  `).all();
  res.json(resources);
});

// UC 33 — Remove a resource (admin)
router.delete('/resources/:id', (req, res) => {
  const resourceId = req.params.id;
  
  // Start a transaction to ensure atomic deletion
  const deleteTx = db.transaction(() => {
    // Delete dependent records first to satisfy foreign key constraints
    db.prepare('DELETE FROM BorrowRequests WHERE resourceId = ?').run(resourceId);
    db.prepare('DELETE FROM Transactions WHERE resourceId = ?').run(resourceId);
    db.prepare('DELETE FROM Resources WHERE id = ?').run(resourceId);
  });

  try {
    deleteTx();
    res.json({ message: 'Resource and all related records removed' });
  } catch (err) {
    console.error('Failed to delete resource:', err);
    res.status(500).json({ error: 'Failed to delete resource' });
  }
});

// UC 34 — List platform reports
router.get('/reports', (req, res) => {
  const reports = db.prepare(`
    SELECT r.*,
           reported.name as reportedName,
           reporter.name as reporterName
    FROM Reports r
    JOIN Users reported ON reported.id = r.reportedId
    JOIN Users reporter ON reporter.id = r.reporterId
    ORDER BY r.createdAt DESC
  `).all();
  res.json(reports);
});

// UC 34 — Update report status
router.put('/reports/:id', (req, res) => {
  const { status } = req.body; // 'investigating', 'resolved', 'escalated'
  if (!['investigating', 'resolved', 'escalated'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }
  db.prepare('UPDATE Reports SET status = ? WHERE id = ?').run(status, req.params.id);
  res.json({ message: `Report marked as ${status}` });
});

module.exports = router;
