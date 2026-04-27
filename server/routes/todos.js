// routes/todos.js — Personal To-Do list (dashboard widget)
// Full CRUD so students can add, check off, edit, and remove their own tasks.
const express = require('express');
const crypto = require('crypto');
const db = require('../db');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();
router.use(authMiddleware);

function uuid() { return crypto.randomUUID(); }

// Get all todos for the logged-in user
router.get('/', async (req, res) => {
  const todos = await db.prepare('SELECT * FROM UserTodos WHERE userId = ? ORDER BY createdAt DESC').all(req.user.id);
  res.json(todos);
});

// Add a new todo item
router.post('/', async (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: 'Text is required' });

  const id = uuid();
  await db.prepare('INSERT INTO UserTodos (id, userId, text) VALUES (?, ?, ?)').run(id, req.user.id, text);
  res.status(201).json({ message: 'Todo added', todoId: id });
});

// Toggle done status or update text — the dashboard uses this for inline edits
router.put('/:id', async (req, res) => {
  const { text, isDone } = req.body;
  if (text !== undefined) {
    await db.prepare('UPDATE UserTodos SET text = ? WHERE id = ? AND userId = ?').run(text, req.params.id, req.user.id);
  }
  if (isDone !== undefined) {
    await db.prepare('UPDATE UserTodos SET isDone = ? WHERE id = ? AND userId = ?').run(isDone ? 1 : 0, req.params.id, req.user.id);
  }
  res.json({ message: 'Todo updated' });
});

// Delete a completed or unwanted todo
router.delete('/:id', async (req, res) => {
  await db.prepare('DELETE FROM UserTodos WHERE id = ? AND userId = ?').run(req.params.id, req.user.id);
  res.json({ message: 'Todo deleted' });
});

module.exports = router;
