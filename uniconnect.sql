-- UniConnect MSSQL Database Schema


USE UniConnect;
GO
CREATE TABLE Users (
    id            VARCHAR(36) PRIMARY KEY,
    name          VARCHAR(100) NOT NULL,
    email         VARCHAR(100) UNIQUE NOT NULL,
    passwordHash  VARCHAR(255) NOT NULL,
    department    VARCHAR(100),
    semester      INT,
    bio           VARCHAR(500),
    studentId     VARCHAR(50) UNIQUE,
    role          VARCHAR(20) DEFAULT 'student',
    status        VARCHAR(20) DEFAULT 'active',
    isVerified    BIT DEFAULT 0,
    avgRating     DECIMAL(3, 2) DEFAULT 0.00,
    showEmail     BIT DEFAULT 0,
    showDept      BIT DEFAULT 1,
    showSemester  BIT DEFAULT 1,
    showRating    BIT DEFAULT 1,
    allowRequests BIT DEFAULT 1,
    visibility    VARCHAR(20) DEFAULT 'public',
    createdAt     DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE PartnerRequests (
    id        VARCHAR(36) PRIMARY KEY,
    fromId    VARCHAR(36) FOREIGN KEY REFERENCES Users(id),
    toId      VARCHAR(36) FOREIGN KEY REFERENCES Users(id),
    status    VARCHAR(20) DEFAULT 'pending',
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE StudyGroups (
    id          VARCHAR(36) PRIMARY KEY,
    name        VARCHAR(100) NOT NULL,
    description VARCHAR(500),
    courseCode  VARCHAR(20),
    maxMembers  INT DEFAULT 8,
    visibility  VARCHAR(20) DEFAULT 'public',
    creatorId   VARCHAR(36) FOREIGN KEY REFERENCES Users(id),
    createdAt   DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE GroupMembers (
    id      VARCHAR(36) PRIMARY KEY,
    userId  VARCHAR(36) FOREIGN KEY REFERENCES Users(id),
    groupId VARCHAR(36) FOREIGN KEY REFERENCES StudyGroups(id),
    role    VARCHAR(20) DEFAULT 'member',
    CONSTRAINT UQ_GroupMembers UNIQUE(userId, groupId)
);

CREATE TABLE GroupAnnouncements (
    id        VARCHAR(36) PRIMARY KEY,
    groupId   VARCHAR(36) FOREIGN KEY REFERENCES StudyGroups(id),
    authorId  VARCHAR(36) FOREIGN KEY REFERENCES Users(id),
    content   VARCHAR(MAX),
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Resources (
    id          VARCHAR(36) PRIMARY KEY,
    title       VARCHAR(100) NOT NULL,
    category    VARCHAR(50),
    condition   VARCHAR(50),
    description VARCHAR(500),
    maxDays     INT DEFAULT 7,
    status      VARCHAR(20) DEFAULT 'available',
    ownerId     VARCHAR(36) FOREIGN KEY REFERENCES Users(id),
    createdAt   DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE BorrowRequests (
    id           VARCHAR(36) PRIMARY KEY,
    resourceId   VARCHAR(36) FOREIGN KEY REFERENCES Resources(id),
    requesterId  VARCHAR(36) FOREIGN KEY REFERENCES Users(id),
    duration     INT,
    status       VARCHAR(20) DEFAULT 'pending',
    handoverLoc  VARCHAR(100),
    handoverDate DATETIME,
    createdAt    DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Transactions (
    id         VARCHAR(36) PRIMARY KEY,
    resourceId VARCHAR(36) FOREIGN KEY REFERENCES Resources(id),
    borrowerId VARCHAR(36) FOREIGN KEY REFERENCES Users(id),
    startDate  DATETIME DEFAULT CURRENT_TIMESTAMP,
    dueDate    DATETIME,
    returnDate DATETIME,
    status     VARCHAR(20) DEFAULT 'active',
    rating     INT,
    review     VARCHAR(500)
);

CREATE TABLE Conversations (
    id      VARCHAR(36) PRIMARY KEY,
    user1Id VARCHAR(36) FOREIGN KEY REFERENCES Users(id),
    user2Id VARCHAR(36) FOREIGN KEY REFERENCES Users(id),
    CONSTRAINT UQ_Conversations UNIQUE(user1Id, user2Id)
);

CREATE TABLE Messages (
    id       VARCHAR(36) PRIMARY KEY,
    convId   VARCHAR(36) FOREIGN KEY REFERENCES Conversations(id),
    senderId VARCHAR(36) FOREIGN KEY REFERENCES Users(id),
    text     VARCHAR(MAX),
    sentAt   DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Notifications (
    id      VARCHAR(36) PRIMARY KEY,
    userId  VARCHAR(36) FOREIGN KEY REFERENCES Users(id),
    content VARCHAR(255),
    type    VARCHAR(50),
    isRead  BIT DEFAULT 0,
    sentAt  DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE LostFound (
    id          VARCHAR(36) PRIMARY KEY,
    type        VARCHAR(20),
    description VARCHAR(500),
    location    VARCHAR(100),
    status      VARCHAR(20) DEFAULT 'open',
    reporterId  VARCHAR(36) FOREIGN KEY REFERENCES Users(id),
    createdAt   DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Reports (
    id          VARCHAR(36) PRIMARY KEY,
    type        VARCHAR(50),
    description VARCHAR(500),
    reportedId  VARCHAR(36) FOREIGN KEY REFERENCES Users(id),
    reporterId  VARCHAR(36) FOREIGN KEY REFERENCES Users(id),
    status      VARCHAR(20) DEFAULT 'pending',
    createdAt   DATETIME DEFAULT CURRENT_TIMESTAMP
);
