// routes/auth.js — Registration, Login, Verify, Reset Password, Change Password (UC 1–3, 5)
// This is the gateway file for all authentication-related operations.
// Everything from signing up to changing your password lives here.

const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const db = require('../db');
const { SECRET, authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Quick UUID generator for creating new user IDs
function uuid() {
  return crypto.randomUUID();
}


// UC 1 — Register a brand new account.
// Takes the student's basic info, hashes their password, and stores everything in the DB.
// After this, they still need to verify their student status before full access.
router.post('/register', async (req, res) => {
  const { name, email, password, department, semester, studentId } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required' });
  }

  // Enforce FAST-NU email format on the server side too — the frontend checks
  // this but anyone with curl can skip it, so we validate here as well
  const emailRegex = /^[a-zA-Z]\d{2}\d{4}@(lhr|isb|fsd|khi|pwr)\.nu\.edu\.pk$/i;
  if (!emailRegex.test(email.trim())) {
    return res.status(400).json({ error: 'Only FAST-NU university emails are allowed (e.g. l240690@lhr.nu.edu.pk)' });
  }

  // Make sure nobody else has already registered with this email
  const existing = await db.get('SELECT id FROM Users WHERE email = ?', [email]);
  if (existing) {
    return res.status(409).json({ error: 'Email already registered' });
  }

  const id = uuid();
  const passwordHash = bcrypt.hashSync(password, 10);

  await db.run(`
    INSERT INTO Users (id, name, email, passwordHash, department, semester, studentId)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `, [id, name, email, passwordHash, department || null, semester || null, studentId || null]);

  res.status(201).json({ message: 'Account created. Please verify your student status.', userId: id });
});


// UC 2 — Verify a student's enrollment status using a 6-digit code.
// In production this would check against an emailed OTP, but right now any 6-digit code works.
router.post('/verify', async (req, res) => {
  const { userId, code } = req.body;

  if (!code || code.length !== 6) {
    return res.status(400).json({ error: 'Invalid verification code' });
  }

  await db.run('UPDATE Users SET isVerified = 1 WHERE id = ?', [userId]);
  res.json({ message: 'Student status verified' });
});


// UC 3 — Log in with email and password.
// Validates credentials, checks if the account is blocked, then issues a JWT token
// that lasts 7 days so the student stays logged in.
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const user = await db.get('SELECT * FROM Users WHERE email = ?', [email]);
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  if (!bcrypt.compareSync(password, user.passwordHash)) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  if (user.status === 'blocked') {
    return res.status(403).json({ error: 'Account has been blocked' });
  }

  // Don't let unverified students into the platform — they need to complete
  // the verification step first (admins skip this check)
  if (!user.isVerified && user.role !== 'admin') {
    return res.status(403).json({ error: 'Please verify your student status before logging in', needsVerification: true, userId: user.id });
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


// UC 5 — Request a password reset link.
// In a real deployment this would fire off an email with a secure token, but
// for now it just acknowledges the request without revealing if the email exists.
router.post('/reset-password', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  const user = await db.get('SELECT id FROM Users WHERE email = ?', [email]);
  if (!user) {
    // Intentionally vague — don't leak whether the email is in our system
    return res.json({ message: 'If that email exists, a reset link has been sent.' });
  }

  res.json({ message: 'If that email exists, a reset link has been sent.' });
});


// Change password — lets a logged-in user update their password.
// Requires the current password for verification, then hashes and stores the new one.
// This is the real deal — it actually updates the password in the database.
router.put('/change-password', authMiddleware, async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Both current and new password are required' });
  }

  if (newPassword.length < 8) {
    return res.status(400).json({ error: 'New password must be at least 8 characters' });
  }

  // Grab the user's current hash from the database
  const user = await db.get('SELECT passwordHash FROM Users WHERE id = ?', [req.user.id]);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  // Verify the current password matches what's stored
  if (!bcrypt.compareSync(currentPassword, user.passwordHash)) {
    return res.status(401).json({ error: 'Current password is incorrect' });
  }

  // Hash the new password and save it
  const newHash = bcrypt.hashSync(newPassword, 10);
  await db.run('UPDATE Users SET passwordHash = ? WHERE id = ?', [newHash, req.user.id]);

  res.json({ message: 'Password updated successfully' });
});


module.exports = router;
