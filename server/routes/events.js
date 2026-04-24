// routes/events.js — Personal Events calendar (dashboard widget)
// CRUD for user-specific events that appear in the Upcoming Events widget.
const express = require('express');
const crypto = require('crypto');
const db = require('../db');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();
router.use(authMiddleware);

function uuid() { return crypto.randomUUID(); }

// Get all events for the logged-in user
router.get('/', (req, res) => {
  const events = db.prepare('SELECT * FROM UserEvents WHERE userId = ? ORDER BY eventDate ASC').all(req.user.id);
  res.json(events);
});

// Create a new event
router.post('/', (req, res) => {
  const { title, details, eventDate } = req.body;
  if (!title) return res.status(400).json({ error: 'Title is required' });

  const id = uuid();
  db.prepare('INSERT INTO UserEvents (id, userId, title, details, eventDate) VALUES (?, ?, ?, ?, ?)')
    .run(id, req.user.id, title, details || null, eventDate || null);
  res.status(201).json({ message: 'Event added', eventId: id });
});

// Update an existing event — for inline editing on the dashboard
router.put('/:id', (req, res) => {
  const { title, details, eventDate } = req.body;
  db.prepare(`
    UPDATE UserEvents
    SET title = COALESCE(?, title), details = COALESCE(?, details), eventDate = COALESCE(?, eventDate)
    WHERE id = ? AND userId = ?
  `).run(title, details, eventDate, req.params.id, req.user.id);
  res.json({ message: 'Event updated' });
});

// Delete an event
router.delete('/:id', (req, res) => {
  db.prepare('DELETE FROM UserEvents WHERE id = ? AND userId = ?').run(req.params.id, req.user.id);
  res.json({ message: 'Event deleted' });
});

module.exports = router;
