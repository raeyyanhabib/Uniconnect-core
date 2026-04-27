-- Users table
CREATE TABLE IF NOT EXISTS Users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  passwordHash TEXT NOT NULL,
  department TEXT,
  semester INTEGER,
  bio TEXT,
  studentId TEXT UNIQUE,
  role TEXT DEFAULT 'student',
  status TEXT DEFAULT 'active',
  isVerified INTEGER DEFAULT 0,
  avgRating REAL DEFAULT 0,
  showEmail INTEGER DEFAULT 0,
  showDept INTEGER DEFAULT 1,
  showSemester INTEGER DEFAULT 1,
  showRating INTEGER DEFAULT 1,
  allowRequests INTEGER DEFAULT 1,
  visibility TEXT DEFAULT 'public',
  createdAt TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Partner Requests table
CREATE TABLE IF NOT EXISTS PartnerRequests (
  id TEXT PRIMARY KEY,
  fromId TEXT REFERENCES Users(id),
  toId TEXT REFERENCES Users(id),
  status TEXT DEFAULT 'pending',
  createdAt TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Study Groups table
CREATE TABLE IF NOT EXISTS StudyGroups (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  courseCode TEXT,
  maxMembers INTEGER DEFAULT 8,
  visibility TEXT DEFAULT 'public',
  creatorId TEXT REFERENCES Users(id),
  createdAt TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Group Members table
CREATE TABLE IF NOT EXISTS GroupMembers (
  id TEXT PRIMARY KEY,
  userId TEXT REFERENCES Users(id),
  groupId TEXT REFERENCES StudyGroups(id),
  role TEXT DEFAULT 'member',
  UNIQUE(userId, groupId)
);

-- Group Announcements table
CREATE TABLE IF NOT EXISTS GroupAnnouncements (
  id TEXT PRIMARY KEY,
  groupId TEXT REFERENCES StudyGroups(id),
  authorId TEXT REFERENCES Users(id),
  content TEXT,
  createdAt TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Resources table
CREATE TABLE IF NOT EXISTS Resources (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT,
  condition TEXT,
  description TEXT,
  maxDays INTEGER DEFAULT 7,
  status TEXT DEFAULT 'available',
  ownerId TEXT REFERENCES Users(id),
  createdAt TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Borrow Requests table
CREATE TABLE IF NOT EXISTS BorrowRequests (
  id TEXT PRIMARY KEY,
  resourceId TEXT REFERENCES Resources(id),
  requesterId TEXT REFERENCES Users(id),
  duration INTEGER,
  status TEXT DEFAULT 'pending',
  handoverLoc TEXT,
  handoverDate TEXT,
  createdAt TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Transactions table
CREATE TABLE IF NOT EXISTS Transactions (
  id TEXT PRIMARY KEY,
  resourceId TEXT REFERENCES Resources(id),
  borrowerId TEXT REFERENCES Users(id),
  startDate TEXT DEFAULT CURRENT_TIMESTAMP,
  dueDate TEXT,
  returnDate TEXT,
  status TEXT DEFAULT 'active',
  rating INTEGER,
  review TEXT
);

-- Conversations table
CREATE TABLE IF NOT EXISTS Conversations (
  id TEXT PRIMARY KEY,
  user1Id TEXT REFERENCES Users(id),
  user2Id TEXT REFERENCES Users(id),
  UNIQUE(user1Id, user2Id)
);

-- Messages table
CREATE TABLE IF NOT EXISTS Messages (
  id TEXT PRIMARY KEY,
  convId TEXT REFERENCES Conversations(id),
  senderId TEXT REFERENCES Users(id),
  text TEXT,
  isRead INTEGER DEFAULT 0,
  sentAt TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Notifications table
CREATE TABLE IF NOT EXISTS Notifications (
  id TEXT PRIMARY KEY,
  userId TEXT REFERENCES Users(id),
  content TEXT,
  type TEXT,
  isRead INTEGER DEFAULT 0,
  sentAt TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Lost Found table
CREATE TABLE IF NOT EXISTS LostFound (
  id TEXT PRIMARY KEY,
  type TEXT,
  description TEXT,
  location TEXT,
  status TEXT DEFAULT 'open',
  reporterId TEXT REFERENCES Users(id),
  createdAt TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Reports table
CREATE TABLE IF NOT EXISTS Reports (
  id TEXT PRIMARY KEY,
  type TEXT,
  description TEXT,
  reportedId TEXT REFERENCES Users(id),
  reporterId TEXT REFERENCES Users(id),
  status TEXT DEFAULT 'pending',
  createdAt TEXT DEFAULT CURRENT_TIMESTAMP
);

-- News table
CREATE TABLE IF NOT EXISTS News (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT,
  imageUrl TEXT,
  authorId TEXT REFERENCES Users(id),
  createdAt TEXT DEFAULT CURRENT_TIMESTAMP
);

-- User Todos table
CREATE TABLE IF NOT EXISTS UserTodos (
  id TEXT PRIMARY KEY,
  userId TEXT REFERENCES Users(id),
  text TEXT NOT NULL,
  isDone INTEGER DEFAULT 0,
  createdAt TEXT DEFAULT CURRENT_TIMESTAMP
);

-- User Events table
CREATE TABLE IF NOT EXISTS UserEvents (
  id TEXT PRIMARY KEY,
  userId TEXT REFERENCES Users(id),
  title TEXT NOT NULL,
  details TEXT,
  eventDate TEXT,
  createdAt TEXT DEFAULT CURRENT_TIMESTAMP
);
