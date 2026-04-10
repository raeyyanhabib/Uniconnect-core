// seed.js — Creates a default admin + test student account
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const db = require('./db');

function uuid() {
  return crypto.randomUUID();
}

// Seed admin user
const adminExists = db.prepare('SELECT id FROM Users WHERE email = ?').get('admin@university.edu');
if (!adminExists) {
  db.prepare(`
    INSERT INTO Users (id, name, email, passwordHash, department, role, isVerified)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(uuid(), 'Admin', 'admin@university.edu', bcrypt.hashSync('admin123', 10), 'Administration', 'admin', 1);
  console.log('Admin account created: admin@university.edu / admin123');
}

// Seed test student
const studentExists = db.prepare('SELECT id FROM Users WHERE email = ?').get('alex.chen@university.edu');
if (!studentExists) {
  db.prepare(`
    INSERT INTO Users (id, name, email, passwordHash, department, semester, bio, isVerified, avgRating)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(uuid(), 'Alex Chen', 'alex.chen@university.edu', bcrypt.hashSync('password123', 10), 'Computer Science', 6, 'ML enthusiast & open-source contributor', 1, 4.8);
  console.log('Student account created: alex.chen@university.edu / password123');
}

// Seed a few more students for partner search
const moreStudents = [
  { name: 'Priya Sharma', email: 'priya.s@university.edu', dept: 'Computer Science', sem: 5, bio: 'Full-stack developer, loves React' },
  { name: 'Tomás Rivera', email: 'tomas.r@university.edu', dept: 'Data Science', sem: 7, bio: 'Data viz & statistics nerd' },
  { name: 'Leila Mansour', email: 'leila.m@university.edu', dept: 'Design', sem: 4, bio: 'UI/UX and digital art' },
  { name: 'Daniel Park', email: 'daniel.p@university.edu', dept: 'Mathematics', sem: 6, bio: 'Pure math & crypto research' },
  { name: 'Emma Wilson', email: 'emma.w@university.edu', dept: 'Computer Science', sem: 5, bio: 'Backend systems & databases' },
];

for (const s of moreStudents) {
  const exists = db.prepare('SELECT id FROM Users WHERE email = ?').get(s.email);
  if (!exists) {
    db.prepare(`
      INSERT INTO Users (id, name, email, passwordHash, department, semester, bio, isVerified, avgRating)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(uuid(), s.name, s.email, bcrypt.hashSync('password123', 10), s.dept, s.sem, s.bio, 1, (3.5 + Math.random() * 1.5).toFixed(1));
  }
}

console.log('Database seeded successfully!');
