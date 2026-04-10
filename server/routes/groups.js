// routes/groups.js — Study Groups (UC 10–14)
const express = require('express');
const crypto = require('crypto');
const db = require('../db');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();
router.use(authMiddleware);

function uuid() { return crypto.randomUUID(); }

// UC 10 — Create Study Group
router.post('/', (req, res) => {
  const { name, description, courseCode, maxMembers, visibility } = req.body;
  if (!name) return res.status(400).json({ error: 'Group name is required' });

  const id = uuid();
  db.prepare(`
    INSERT INTO StudyGroups (id, name, description, courseCode, maxMembers, visibility, creatorId)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(id, name, description || null, courseCode || null, maxMembers || 8, visibility || 'public', req.user.id);

  // Add creator as a member with 'creator' role
  db.prepare('INSERT INTO GroupMembers (id, userId, groupId, role) VALUES (?, ?, ?, ?)').run(uuid(), req.user.id, id, 'creator');

  res.status(201).json({ message: 'Group created', groupId: id });
});

// UC 11 — Discover groups (browse public groups)
router.get('/discover', (req, res) => {
  const groups = db.prepare(`
    SELECT g.*, 
           (SELECT COUNT(*) FROM GroupMembers WHERE groupId = g.id) as memberCount,
           (SELECT COUNT(*) FROM GroupMembers WHERE groupId = g.id AND userId = ?) as isMember
    FROM StudyGroups g
    WHERE g.visibility = 'public'
    ORDER BY g.createdAt DESC
  `).all(req.user.id);
  res.json(groups);
});

// Get my groups
router.get('/mine', (req, res) => {
  const groups = db.prepare(`
    SELECT g.*,
           (SELECT COUNT(*) FROM GroupMembers WHERE groupId = g.id) as memberCount,
           (CASE WHEN g.creatorId = ? THEN 1 ELSE 0 END) as isCreator
    FROM StudyGroups g
    JOIN GroupMembers gm ON gm.groupId = g.id
    WHERE gm.userId = ?
    ORDER BY g.createdAt DESC
  `).all(req.user.id, req.user.id);
  res.json(groups);
});

// Get single group details
router.get('/:id', (req, res) => {
  const group = db.prepare(`
    SELECT g.*,
           (SELECT COUNT(*) FROM GroupMembers WHERE groupId = g.id) as memberCount,
           (CASE WHEN g.creatorId = ? THEN 1 ELSE 0 END) as isCreator
    FROM StudyGroups g WHERE g.id = ?
  `).get(req.user.id, req.params.id);
  if (!group) return res.status(404).json({ error: 'Group not found' });

  const members = db.prepare(`
    SELECT u.id, u.name, u.department, gm.role
    FROM GroupMembers gm JOIN Users u ON u.id = gm.userId
    WHERE gm.groupId = ?
  `).all(req.params.id);

  const announcements = db.prepare(`
    SELECT ga.*, u.name as authorName
    FROM GroupAnnouncements ga JOIN Users u ON u.id = ga.authorId
    WHERE ga.groupId = ?
    ORDER BY ga.createdAt DESC
  `).all(req.params.id);

  res.json({ ...group, members, announcements });
});

// UC 11 — Join Group
router.post('/:id/join', (req, res) => {
  const group = db.prepare('SELECT * FROM StudyGroups WHERE id = ?').get(req.params.id);
  if (!group) return res.status(404).json({ error: 'Group not found' });

  const memberCount = db.prepare('SELECT COUNT(*) as cnt FROM GroupMembers WHERE groupId = ?').get(req.params.id).cnt;
  if (memberCount >= group.maxMembers) return res.status(400).json({ error: 'Group is full' });

  const existing = db.prepare('SELECT id FROM GroupMembers WHERE userId = ? AND groupId = ?').get(req.user.id, req.params.id);
  if (existing) return res.status(409).json({ error: 'Already a member' });

  db.prepare('INSERT INTO GroupMembers (id, userId, groupId) VALUES (?, ?, ?)').run(uuid(), req.user.id, req.params.id);
  res.json({ message: 'Joined group' });
});

// UC 12 — Leave Group
router.delete('/:id/leave', (req, res) => {
  db.prepare('DELETE FROM GroupMembers WHERE userId = ? AND groupId = ?').run(req.user.id, req.params.id);
  res.json({ message: 'Left group' });
});

// UC 13 — Remove Member (creator only)
router.delete('/:id/members/:userId', (req, res) => {
  const group = db.prepare('SELECT creatorId FROM StudyGroups WHERE id = ?').get(req.params.id);
  if (!group || group.creatorId !== req.user.id) {
    return res.status(403).json({ error: 'Only the creator can remove members' });
  }
  db.prepare('DELETE FROM GroupMembers WHERE userId = ? AND groupId = ?').run(req.params.userId, req.params.id);
  res.json({ message: 'Member removed' });
});

// UC 14 — Post Announcement (creator only)
router.post('/:id/announcements', (req, res) => {
  const { content } = req.body;
  if (!content) return res.status(400).json({ error: 'Content is required' });

  const group = db.prepare('SELECT creatorId FROM StudyGroups WHERE id = ?').get(req.params.id);
  if (!group || group.creatorId !== req.user.id) {
    return res.status(403).json({ error: 'Only the creator can post announcements' });
  }

  const id = uuid();
  db.prepare('INSERT INTO GroupAnnouncements (id, groupId, authorId, content) VALUES (?, ?, ?, ?)').run(id, req.params.id, req.user.id, content);
  res.status(201).json({ message: 'Announcement posted', announcementId: id });
});

module.exports = router;
