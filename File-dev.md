# UniConnect - Development Status & Scenario

This document tracks the current state of the UniConnect project as of April 24, 2026.

## Current Scenario

The project has transitioned from a static UI prototype to a fully functional full-stack application with a modular frontend and a persistent SQLite backend.

### 1. Synchronized Dashboard
The Dashboard is now live and synced with the backend database. 
- **University News**: Articles are fetched from the database. Users can add new articles via the Add News page.
- **To-Do List**: Full CRUD persistence. Students can add, edit, toggle (done/undone), and delete tasks directly from the dashboard.
- **Upcoming Events**: Students can manage their own events (Add/Edit/Delete) with database persistence.
- **Lost & Found**: Real-time syncing of recent reports on the dashboard.

### 2. Messaging & Notifications
- **Dynamic Badge**: The red notification badge in the sidebar now reflects real-time unread message counts fetched from the server.
- **Auto-Read**: Opening a conversation automatically marks messages as read, clearing the notification badge instantly.
- **Live Updates**: Polling mechanisms ensure that messages and notifications stay fresh without manual refreshes.

### 3. Backend Architecture
- **SQLite Integration**: Using `better-sqlite3` for a robust, local relational database.
- **Modular Routes**: API is organized into feature-based route files (auth, users, partners, groups, resources, messages, news, todos, events, etc.).
- **Auth Middleware**: JWT-based authentication protects all sensitive endpoints.

### 4. Code Documentation
- **Conversational Comments**: Minimal, conversational comments have been added to every frontend page and key backend files to facilitate peer review and future development without cluttering the UI code.

## File Structure

### Backend (`/server`)
- `index.js`: Main entry point and route registration.
- `db.js`: Database schema and connection.
- `routes/`: Feature-specific API endpoints (including the newly added `news.js`, `todos.js`, and `events.js`).

### Frontend (`/src`)
- `App.tsx`: Main routing and global state (auth, notifications).
- `pages/`: Modular page components (Dashboard, Partners, Groups, etc.).
- `components/`: Reusable UI components (StatCard, Badge, Avatar, etc.).
- `services/`: API (`api.ts`) and Design Tokens (`theme.ts`).

## Next Steps
- Implement real-time WebSockets for instant messaging (replacing polling).
- Add image upload support for Lost & Found and Resources.
- Enhance the Admin Portal with more moderation tools.

---
*Author: Raeyyan Habib*
