const db = require('./db');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

function uuid() { return crypto.randomUUID(); }

// Delete old tables manually to prevent phantom duplicates upon re-seeding
db.pragma('foreign_keys = OFF');
db.prepare('DELETE FROM GroupMembers').run();
db.prepare('DELETE FROM StudyGroups').run();
db.prepare('DELETE FROM PartnerRequests').run();
db.prepare('DELETE FROM Messages').run();
db.prepare('DELETE FROM Conversations').run();
db.prepare('DELETE FROM Users').run();
db.pragma('foreign_keys = ON');

const pass = bcrypt.hashSync("12345678", 10);
const adminPass = bcrypt.hashSync("0690368Raeyyan@", 10);

const students = [
  { name: "Abdulrehman Ahmad", studentId: "24L-0555", email: "l240555@lhr.nu.edu.pk" },
  { name: "Muaz Afzal Khan", studentId: "24L-0740", email: "l240740@lhr.nu.edu.pk" },
  { name: "Hassan Rizwan", studentId: "24L-0891", email: "l240891@lhr.nu.edu.pk" },
  { name: "Hassaan Faisal", studentId: "24L-0884", email: "l240884@lhr.nu.edu.pk" },
  { name: "Raeyyan Habib", studentId: "24L-0690", email: "l240690@lhr.nu.edu.pk" },
  // Extra Lahori dummy students
  { name: "Ahmed Butt", studentId: "24L-0123", email: "l240123@lhr.nu.edu.pk" },
  { name: "Zainab Sheikh", studentId: "24L-0124", email: "l240124@lhr.nu.edu.pk" },
  { name: "Omar Qureshi", studentId: "24L-0125", email: "l240125@lhr.nu.edu.pk" },
  { name: "Fatima Ali", studentId: "24L-0126", email: "l240126@lhr.nu.edu.pk" }
];

const insertUser = db.prepare('INSERT OR IGNORE INTO Users (id, name, email, passwordHash, department, semester, role, studentId, isVerified) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)');

console.log("Seeding admin...");
const adminId = "raeyyanhabibbb";
insertUser.run(adminId, "Raeyyan Habib (Admin)", "raeyyanhabib12@gmail.com", adminPass, "Administration", 0, "admin", "admin-rhabib");

console.log("Seeding students...");
let raeyyanId = "stu_" + students[4].studentId;
insertUser.run(raeyyanId, students[4].name, students[4].email, pass, "Computer Science", 4, "student", students[4].studentId);

const insertPartner = db.prepare('INSERT OR IGNORE INTO PartnerRequests (id, fromId, toId, status) VALUES (?, ?, ?, ?)');

for (const s of students) {
  if (s.name !== "Raeyyan Habib") {
    let sId = "stu_" + s.studentId;
    insertUser.run(sId, s.name, s.email, pass, "Computer Science", 4, "student", s.studentId);
    // Request accepted from Raeyyan's side to others
    insertPartner.run(uuid(), raeyyanId, sId, "accepted");
  }
}

console.log("Database seeded successfully.");
