// routes/auth.js — Registration, Login, Verify, Reset Password (UC 1–3, 5)
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const db = require('../db');
const { SECRET } = require('../middleware/auth');

const router = express.Router();

// Helper: generate a UUID
function uuid() {
  return crypto.randomUUID();
}

// UC 1 — Register Account
router.post('/register', (req, res) => {
  const { name, email, password, department, semester, studentId } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required' });
  }

  // Check if email already exists
  const existing = db.prepare('SELECT id FROM Users WHERE email = ?').get(email);
  if (existing) {
    return res.status(409).json({ error: 'Email already registered' });
  }

  const id = uuid();
  const passwordHash = bcrypt.hashSync(password, 10);

  db.prepare(`
    INSERT INTO Users (id, name, email, passwordHash, department, semester, studentId)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(id, name, email, passwordHash, department || null, semester || null, studentId || null);

  res.status(201).json({ message: 'Account created. Please verify your student status.', userId: id });
});

// UC 2 — Verify Student Status
router.post('/verify', (req, res) => {
  const { userId, code } = req.body;

  // In a real app, you'd check the code against one sent via email
  // For now, any 6-digit code works
  if (!code || code.length !== 6) {
    return res.status(400).json({ error: 'Invalid verification code' });
  }

  db.prepare('UPDATE Users SET isVerified = 1 WHERE id = ?').run(userId);
  res.json({ message: 'Student status verified' });
});

// UC 3 — Login
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const user = db.prepare('SELECT * FROM Users WHERE email = ?').get(email);
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  if (!bcrypt.compareSync(password, user.passwordHash)) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  if (user.status === 'blocked') {
    return res.status(403).json({ error: 'Account has been blocked' });
  }

  const token = jwt.sign({ id: user.id, role: user.role }, SECRET, { expiresIn: '7d' });

  res.json({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      department: user.department,
      semester: user.semester,
      bio: user.bio,
      role: user.role,
      status: user.status,
      avgRating: user.avgRating,
      isVerified: user.isVerified,
    },
  });
});

// UC 5 — Reset Password
router.post('/reset-password', (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  const user = db.prepare('SELECT id FROM Users WHERE email = ?').get(email);
  if (!user) {
    // Don't reveal whether the email exists
    return res.json({ message: 'If that email exists, a reset link has been sent.' });
  }

  // In a real app, you'd send an email with a reset token
  // For now, just acknowledge
  res.json({ message: 'If that email exists, a reset link has been sent.' });
});

module.exports = router;
