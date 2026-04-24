// db.js — SQLite database connection and table setup
const Database = require('better-sqlite3');
const path = require('path');

// spins up the SQLite database connection — this is the single source of truth for all UniConnect data
const db = new Database(path.join(__dirname, 'uniconnect.db'));

// Enable WAL mode for better performance
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Create all tables
db.exec(`
  CREATE TABLE IF NOT EXISTS Users (
    id            TEXT PRIMARY KEY,
    name          TEXT NOT NULL,
    email         TEXT UNIQUE NOT NULL,
    passwordHash  TEXT NOT NULL,
    department    TEXT,
    semester      INTEGER,
    bio           TEXT,
    studentId     TEXT UNIQUE,
    role          TEXT DEFAULT 'student',
    status        TEXT DEFAULT 'active',
    isVerified    INTEGER DEFAULT 0,
    avgRating     REAL DEFAULT 0,
    showEmail     INTEGER DEFAULT 0,
    showDept      INTEGER DEFAULT 1,
    showSemester  INTEGER DEFAULT 1,
    showRating    INTEGER DEFAULT 1,
    allowRequests INTEGER DEFAULT 1,
    visibility    TEXT DEFAULT 'public',
    createdAt     TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS PartnerRequests (
    id        TEXT PRIMARY KEY,
    fromId    TEXT REFERENCES Users(id),
    toId      TEXT REFERENCES Users(id),
    status    TEXT DEFAULT 'pending',
    createdAt TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS StudyGroups (
    id          TEXT PRIMARY KEY,
    name        TEXT NOT NULL,
    description TEXT,
    courseCode   TEXT,
    maxMembers  INTEGER DEFAULT 8,
    visibility  TEXT DEFAULT 'public',
    creatorId   TEXT REFERENCES Users(id),
    createdAt   TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS GroupMembers (
    id      TEXT PRIMARY KEY,
    userId  TEXT REFERENCES Users(id),
    groupId TEXT REFERENCES StudyGroups(id),
    role    TEXT DEFAULT 'member',
    UNIQUE(userId, groupId)
  );

  CREATE TABLE IF NOT EXISTS GroupAnnouncements (
    id        TEXT PRIMARY KEY,
    groupId   TEXT REFERENCES StudyGroups(id),
    authorId  TEXT REFERENCES Users(id),
    content   TEXT,
    createdAt TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS Resources (
    id          TEXT PRIMARY KEY,
    title       TEXT NOT NULL,
    category    TEXT,
    condition   TEXT,
    description TEXT,
    maxDays     INTEGER DEFAULT 7,
    status      TEXT DEFAULT 'available',
    ownerId     TEXT REFERENCES Users(id),
    createdAt   TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS BorrowRequests (
    id           TEXT PRIMARY KEY,
    resourceId   TEXT REFERENCES Resources(id),
    requesterId  TEXT REFERENCES Users(id),
    duration     INTEGER,
    status       TEXT DEFAULT 'pending',
    handoverLoc  TEXT,
    handoverDate TEXT,
    createdAt    TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS Transactions (
    id         TEXT PRIMARY KEY,
    resourceId TEXT REFERENCES Resources(id),
    borrowerId TEXT REFERENCES Users(id),
    startDate  TEXT DEFAULT (datetime('now')),
    dueDate    TEXT,
    returnDate TEXT,
    status     TEXT DEFAULT 'active',
    rating     INTEGER,
    review     TEXT
  );

  CREATE TABLE IF NOT EXISTS Conversations (
    id      TEXT PRIMARY KEY,
    user1Id TEXT REFERENCES Users(id),
    user2Id TEXT REFERENCES Users(id),
    UNIQUE(user1Id, user2Id)
  );

  CREATE TABLE IF NOT EXISTS Messages (
    id       TEXT PRIMARY KEY,
    convId   TEXT REFERENCES Conversations(id),
    senderId TEXT REFERENCES Users(id),
    text     TEXT,
    sentAt   TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS Notifications (
    id      TEXT PRIMARY KEY,
    userId  TEXT REFERENCES Users(id),
    content TEXT,
    type    TEXT,
    isRead  INTEGER DEFAULT 0,
    sentAt  TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS LostFound (
    id          TEXT PRIMARY KEY,
    type        TEXT,
    description TEXT,
    location    TEXT,
    status      TEXT DEFAULT 'open',
    reporterId  TEXT REFERENCES Users(id),
    createdAt   TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS Reports (
    id          TEXT PRIMARY KEY,
    type        TEXT,
    description TEXT,
    reportedId  TEXT REFERENCES Users(id),
    reporterId  TEXT REFERENCES Users(id),
    status      TEXT DEFAULT 'pending',
    createdAt   TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS News (
    id        TEXT PRIMARY KEY,
    title     TEXT NOT NULL,
    content   TEXT,
    imageUrl  TEXT,
    authorId  TEXT REFERENCES Users(id),
    createdAt TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS UserTodos (
    id        TEXT PRIMARY KEY,
    userId    TEXT REFERENCES Users(id),
    text      TEXT NOT NULL,
    isDone    INTEGER DEFAULT 0,
    createdAt TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS UserEvents (
    id        TEXT PRIMARY KEY,
    userId    TEXT REFERENCES Users(id),
    title     TEXT NOT NULL,
    details   TEXT,
    eventDate TEXT,
    createdAt TEXT DEFAULT (datetime('now'))
  );
`);

// Safely add isRead column to Messages if it doesn't exist yet
try {
  db.prepare("SELECT isRead FROM Messages LIMIT 1").get();
} catch {
  db.exec("ALTER TABLE Messages ADD COLUMN isRead INTEGER DEFAULT 0");
}

console.log('Database ready (uniconnect.db)');

module.exports = db;
