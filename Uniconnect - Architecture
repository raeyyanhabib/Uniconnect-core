# UniConnect - Implementation Architecture

This document maps the project's technical implementation to its core features.

## 🛠 Tech Stack
- **Frontend**: React + Vite + TypeScript
- **Backend**: Node.js + Express
- **Database**: SQLite (`better-sqlite3`)
- **Icons**: Lucide-React
- **Styling**: Vanilla CSS + Tailwind

## 📂 Modular Structure

### Frontend (`/src`)
- **Pages**: `/pages/*.tsx` (UC-specific views)
- **Components**: `/components/*.tsx` (Reusable UI modules)
- **Services**: `api.ts` (Network), `theme.ts` (Styles)
- **Shell**: `App.tsx` (Routing & Global State)

### Backend (`/server`)
- **Routes**: `/routes/*.js` (REST endpoints)
- **Database**: `db.js` (Schema & Persistence)
- **Auth**: `/middleware/auth.js` (Security)

## 🔄 Feature Implementation Map

| Feature | Frontend Page | Backend Route | Database Table |
| :--- | :--- | :--- | :--- |
| **Auth** | `RegisterPage`, `LoginPage` | `auth.js` | `Users` |
| **Dashboard** | `DashboardPage` | `news.js`, `todos.js`, `events.js` | `News`, `UserTodos`, `UserEvents` |
| **Partners** | `StudyPartnersPage` | `partners.js` | `PartnerRequests` |
| **Groups** | `StudyGroupsPage` | `groups.js` | `StudyGroups`, `GroupMembers` |
| **Market** | `ResourcesPage` | `resources.js` | `Resources`, `Transactions` |
| **Chat** | `MessagesPage` | `messages.js` | `Messages` |
| **Admin** | `AdminDashboardPage` | `admin.js` | All Tables |

## 🚀 Recent Execution (April 24, 2026)
- **Dashboard Sync**: Connected News, To-Dos, and Events to the database.
- **Notifications**: Dynamic unread message count logic.
- **Developer Clarity**: Conversational comments added across all files.
