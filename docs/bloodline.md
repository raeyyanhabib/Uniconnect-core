# 📖 The UniConnect Bloodline

Every great piece of software has a story, and UniConnect is no different. What started as a simple idea to combat the disorganization of campus life evolved into a fully fledged collaboration hub, designed built by students, for students. This document serves as the historical record—the bloodline—of the project's inception, structural architecture, and the minds that forged it.

---

## 🏛 The Genesis

Campus life is messy. Between managing study groups, trying to find individuals who actually focus during revisions, looking for lost items, and deciphering which resources are useful, students needed a central hub to connect the dots. The vision was to create a platform that felt intuitive, snappy, and powerful—a digital wingman.

We built UniConnect using a robust Javascript/Typescript architecture:
- **The Core Architecture:** A modular monolith that cleanly separates a React-Vite frontend from a Node/Express backend.
- **The Database:** A highly optimized SQLite framework handling complex relationships between users, resources, and instantaneous messaging. 

As the pieces fell into place, the workload grew, requiring an organized division of labor.

---

## Team Responsibilities

- **Raeyyan Habib (24L-0690):** Spearheaded the core authentication systems, focusing entirely on secure user access. This involved engineering the student registration pipeline, verification flows, login mechanics, and the password reset features.
  - **Frontend Files:** `LoginPage.tsx`, `RegisterPage.tsx`, `VerifyStudentPage.tsx`, `ResetPasswordPage.tsx`
  - **Backend Routes:** `auth.js`

- **Abdulrehman Ahmad (24L-0555):** Directed the development of the primary administrative interfaces and ecosystem tools. His responsibilities included designing and structuring the remainder of the core admin console features to ensure smooth platform oversight.
  - **Frontend Files:** `AdminDashboardPage.tsx`, `AdminReportsPage.tsx`, `AdminResourcesPage.tsx`, `AdminUsersPage.tsx`
  - **Backend Routes:** `admin.js`, `users.js`

- **Muaz Afzal Khan (24L-0740):** Led the implementation of essential user engagement and connectivity panels. He successfully architected the main interactive dashboard alongside the comprehensive study groups and study partners modules.
  - **Frontend Files:** `DashboardPage.tsx`, `StudyPartnersPage.tsx`, `StudyGroupsPage.tsx`, `AddNewsPage.tsx`
  - **Backend Routes:** `partners.js`, `groups.js`

- **Hassaan Faisal (24L-0884):** Championed the creation of peer-to-peer interactive utilities and marketplace hubs. This covered the development of the direct messaging system, the shared resources platform, and the lost-and-found sections.
  - **Frontend Files:** `ResourcesPage.tsx`, `MessagesPage.tsx`, `LostFoundPage.tsx`
  - **Backend Routes:** `resources.js`, `messages.js`, `lostfound.js`

- **Hassan Rizwan (24L-0891):** Managed critical administrative onboarding and real-time user feedback systems. He was primarily responsible for building the real-time notification engine, profile management systems, and the admin login gateway.
  - **Frontend Files:** `NotificationsPage.tsx`, `ProfilePage.tsx`, `AdminLoginPage.tsx`
  - **Backend Routes:** `notifications.js`
