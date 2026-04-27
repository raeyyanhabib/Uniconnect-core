// routes/resources.js — Resource Sharing & Lending (UC 15–27)
const express = require('express');
const crypto = require('crypto');
const db = require('../db');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();
router.use(authMiddleware);

function uuid() { return crypto.randomUUID(); }

// UC 15 — Post Resource for Lending
router.post('/', async (req, res) => {
  const { title, category, condition, description, maxDays } = req.body;
  if (!title) return res.status(400).json({ error: 'Title is required' });

  const id = uuid();
  await db.prepare(`
    INSERT INTO Resources (id, title, category, condition, description, maxDays, ownerId)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(id, title, category || 'Other', condition || 'Good', description || null, maxDays || 7, req.user.id);
  res.status(201).json({ message: 'Resource posted', resourceId: id });
});

// UC 16 — Edit Resource Listing
router.put('/:id', async (req, res) => {
  const { title, category, condition, description, maxDays } = req.body;
  const resource = await db.prepare('SELECT * FROM Resources WHERE id = ? AND ownerId = ?').get(req.params.id, req.user.id);
  if (!resource) return res.status(404).json({ error: 'Resource not found or not owned by you' });

  await db.prepare(`
    UPDATE Resources SET title = COALESCE(?, title), category = COALESCE(?, category),
    condition = COALESCE(?, condition), description = COALESCE(?, description), maxDays = COALESCE(?, maxDays)
    WHERE id = ?
  `).run(title, category, condition, description, maxDays, req.params.id);
  res.json({ message: 'Resource updated' });
});

// UC 16 — Delete Resource Listing
router.delete('/:id', async (req, res) => {
  await db.prepare('DELETE FROM Resources WHERE id = ? AND ownerId = ?').run(req.params.id, req.user.id);
  res.json({ message: 'Resource deleted' });
});

// UC 17 — Toggle Resource Status (available/paused)
router.patch('/:id/toggle', async (req, res) => {
  const resource = await db.prepare('SELECT status FROM Resources WHERE id = ? AND ownerId = ?').get(req.params.id, req.user.id);
  if (!resource) return res.status(404).json({ error: 'Resource not found' });

  const newStatus = resource.status === 'available' ? 'paused' : 'available';
  await db.prepare('UPDATE Resources SET status = ? WHERE id = ?').run(newStatus, req.params.id);
  res.json({ message: `Resource ${newStatus}`, status: newStatus });
});

// UC 18, 19 — Browse/Search Resources
router.get('/', async (req, res) => {
  const { q, category } = req.query;
  let query = `SELECT r.*, u.name as ownerName FROM Resources r JOIN Users u ON u.id = r.ownerId WHERE r.status != 'paused'`;
  const params = [];

  if (q) {
    query += ` AND (r.title LIKE ? OR r.description LIKE ?)`;
    params.push(`%${q}%`, `%${q}%`);
  }
  if (category && category !== 'All') {
    query += ` AND r.category = ?`;
    params.push(category);
  }

  query += ` ORDER BY r.createdAt DESC`;
  res.json(await db.prepare(query).all(...params));
});

// Get my listings
router.get('/mine', async (req, res) => {
  const resources = await db.prepare(`SELECT * FROM Resources WHERE ownerId = ? ORDER BY createdAt DESC`).all(req.user.id);
  res.json(resources);
});

// UC 20 — Send Borrow Request
router.post('/:id/borrow', async (req, res) => {
  const { duration } = req.body;
  const resource = await db.prepare('SELECT * FROM Resources WHERE id = ?').get(req.params.id);
  if (!resource) return res.status(404).json({ error: 'Resource not found' });
  if (resource.status !== 'available') return res.status(400).json({ error: 'Resource not available' });
  if (resource.ownerId === req.user.id) return res.status(400).json({ error: 'Cannot borrow your own resource' });

  const id = uuid();
  await db.prepare('INSERT INTO BorrowRequests (id, resourceId, requesterId, duration) VALUES (?, ?, ?, ?)').run(id, req.params.id, req.user.id, duration || resource.maxDays);
  res.status(201).json({ message: 'Borrow request sent', requestId: id });
});

// UC 21 — Get borrow requests for my resources
router.get('/borrow-requests', async (req, res) => {
  const requests = await db.prepare(`
    SELECT br.*, r.title as resourceTitle, r.category,
           u.name as requesterName, u.department as requesterDept
    FROM BorrowRequests br
    JOIN Resources r ON r.id = br.resourceId
    JOIN Users u ON u.id = br.requesterId
    WHERE r.ownerId = ?
    ORDER BY br.createdAt DESC
  `).all(req.user.id);
  res.json(requests);
});

// UC 21 — Approve/Reject Borrow Request
router.put('/borrow-requests/:id', async (req, res) => {
  const { action } = req.body; // 'approve' or 'reject'
  if (!['approve', 'reject'].includes(action)) {
    return res.status(400).json({ error: 'action must be approve or reject' });
  }

  const request = await db.prepare(`
    SELECT br.*, r.ownerId FROM BorrowRequests br
    JOIN Resources r ON r.id = br.resourceId
    WHERE br.id = ?
  `).get(req.params.id);
  if (!request || request.ownerId !== req.user.id) return res.status(404).json({ error: 'Request not found' });

  const newStatus = action === 'approve' ? 'approved' : 'rejected';
  await db.prepare('UPDATE BorrowRequests SET status = ? WHERE id = ?').run(newStatus, req.params.id);

  // If approved, create a transaction and mark resource as borrowed
  if (action === 'approve') {
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + request.duration);
    await db.prepare(`
      INSERT INTO Transactions (id, resourceId, borrowerId, dueDate) VALUES (?, ?, ?, ?)
    `).run(uuid(), request.resourceId, request.requesterId, dueDate.toISOString());
    await db.prepare('UPDATE Resources SET status = ? WHERE id = ?').run('borrowed', request.resourceId);
  }

  res.json({ message: `Request ${newStatus}` });
});

// UC 22 — Schedule Handover
router.put('/borrow-requests/:id/handover', async (req, res) => {
  const { location, date } = req.body;
  await db.prepare('UPDATE BorrowRequests SET handoverLoc = ?, handoverDate = ? WHERE id = ?').run(location, date, req.params.id);
  res.json({ message: 'Handover scheduled' });
});

// UC 23 — Confirm Receipt
router.put('/transactions/:txId/receipt', async (req, res) => {
  await db.prepare("UPDATE Transactions SET status = 'active' WHERE id = ?").run(req.params.txId);
  res.json({ message: 'Receipt confirmed' });
});

// UC 24 — Confirm Return
router.put('/transactions/:txId/return', async (req, res) => {
  await db.prepare("UPDATE Transactions SET status = 'returned', returnDate = datetime('now') WHERE id = ?").run(req.params.txId);
  // Also mark the resource as available again
  const tx = await db.prepare('SELECT resourceId FROM Transactions WHERE id = ?').get(req.params.txId);
  if (tx) await db.prepare("UPDATE Resources SET status = 'available' WHERE id = ?").run(tx.resourceId);
  res.json({ message: 'Return confirmed' });
});

// UC 25 — Report Dispute
router.post('/transactions/:txId/dispute', async (req, res) => {
  const { type, description } = req.body;
  const tx = await db.prepare('SELECT borrowerId FROM Transactions WHERE id = ?').get(req.params.txId);
  if (!tx) return res.status(404).json({ error: 'Transaction not found' });

  const id = uuid();
  await db.prepare('INSERT INTO Reports (id, type, description, reportedId, reporterId) VALUES (?, ?, ?, ?, ?)').run(id, type || 'Resource', description, tx.borrowerId, req.user.id);
  res.status(201).json({ message: 'Dispute reported', reportId: id });
});

// UC 26 — Lending History
router.get('/history', async (req, res) => {
  const history = await db.prepare(`
    SELECT t.*, r.title as resourceTitle, r.category, r.ownerId,
           u.name as borrowerName, owner.name as ownerName
    FROM Transactions t
    JOIN Resources r ON r.id = t.resourceId
    JOIN Users u ON u.id = t.borrowerId
    JOIN Users owner ON owner.id = r.ownerId
    WHERE r.ownerId = ? OR t.borrowerId = ?
    ORDER BY t.startDate DESC
  `).all(req.user.id, req.user.id);
  res.json(history);
});

// UC 27 — Rate/Review
router.post('/transactions/:txId/review', async (req, res) => {
  const { rating, review } = req.body;
  if (!rating || rating < 1 || rating > 5) return res.status(400).json({ error: 'Rating must be 1-5' });

  await db.prepare('UPDATE Transactions SET rating = ?, review = ? WHERE id = ?').run(rating, review || null, req.params.txId);

  // Update user's average rating
  const tx = await db.prepare('SELECT borrowerId FROM Transactions WHERE id = ?').get(req.params.txId);
  if (tx) {
    const avg = await db.prepare('SELECT AVG(rating) as avg FROM Transactions WHERE borrowerId = ? AND rating IS NOT NULL').get(tx.borrowerId);
    if (avg && avg.avg) {
      await db.prepare('UPDATE Users SET avgRating = ? WHERE id = ?').run(Math.round(avg.avg * 10) / 10, tx.borrowerId);
    }
  }

  res.json({ message: 'Review submitted' });
});

module.exports = router;
