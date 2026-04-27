# UniConnect 

This document tracks the current state of the UniConnect project as of April 27, 2026.

## Current Scenario
The project has evolved into a robust full-stack application. Most recently, it has transitioned from a pure SQLite setup to a dual-database abstraction layer (supporting both SQLite and PostgreSQL) to enable seamless deployment to **Vercel** with a managed PostgreSQL backend.

### Project Initialization
- Run `npx create-vite@latest sda-uniconnect --template react-ts` in `d:\AG Projects`.
- Install core dependencies: `lucide-react`, `tailwindcss`, `postcss`, `autoprefixer`, etc.
- Backend dependencies updated to include `pg` and `pg-pool` for PostgreSQL support.

### File Names & Structure
The project is modularized, with a clear separation between the React-TypeScript frontend and the Express-Node backend.

### Backend (`/server`)
**Middleware (in `server/middleware/`)**:
- 'auth.js'

**Routes (in `server/routes/`)**:
- 'admin.js'
- 'auth.js'
- 'events.js'
- 'groups.js'
- 'lostfound.js'
- 'messages.js'
- 'news.js'
- 'notifications.js'
- 'partners.js'
- 'resources.js'
- 'todos.js'
- 'users.js'

**Database Layer (Universal Support)**:
- 'db-connection.js' - Abstraction layer for SQLite/Postgres.
- 'db.js' - Legacy entry point (now uses abstraction).
- 'schema.sql' - Unified schema definition for both DB types.
- 'migrate-data.js' - Script to migrate data from SQLite to Postgres.
- 'rollback-migration.js' - Script to reset Postgres database.

**Server Root (in `server/`)**:
- '.env' (Local config)
- '.env.example'
- '.env.production' (Vercel production config)
- 'index.js'
- 'package.json'
- 'seed.js'
- 'uniconnect.db' (Local SQLite file)

### Frontend (`/src`)

**Root Files (in `src/`)**:
- 'App.css'
- 'App.tsx'
- 'index.css'
- 'main.tsx'

**Pages**
- 'AddNewsPage.tsx'
- 'AdminDashboardPage.tsx'
- 'AdminLoginPage.tsx'
- 'AdminReportsPage.tsx'
- 'AdminResourcesPage.tsx'
- 'AdminUsersPage.tsx'
- 'DashboardPage.tsx'
- 'LoginPage.tsx'
- 'LostFoundPage.tsx'
- 'MessagesPage.tsx'
- 'NotificationsPage.tsx'
- 'ProfilePage.tsx'
- 'RegisterPage.tsx'
- 'ResetPasswordPage.tsx'
- 'ResourcesPage.tsx'
- 'StudyGroupsPage.tsx'
- 'StudyPartnersPage.tsx'
- 'VerifyStudentPage.tsx'
  
**Components - Reusable UI components**
- 'Avatar.tsx'
- 'Badge.tsx'
- 'EmptyState.tsx'
- 'FormField.tsx'
- 'Modal.tsx'
- 'ResourceCard.tsx'
- 'SectionHeader.tsx'
- 'StarRating.tsx'
- 'StatCard.tsx'
- 'StatusBadge.tsx'
- 'StudentCard.tsx'
- 'Tabs.tsx'

**Types & Services**:
- 'src/types/index.ts' - Global type definitions.
- 'src/services/api.ts' - Axios-like wrapper for API calls.
- 'src/services/theme.ts' - Design tokens and theme configuration.

### Deployment & Tools
- **`vercel.json`** - Deployment configuration for Vercel (API routing).
- **`TECHNICAL_GUIDE.html`** - Comprehensive technical breakdown and stack overview.
- **`MIGRATION_GUIDE.md`** - Step-by-step instructions for DB migration.

## Next Steps
- Finalize Vercel environment variable setup.
- Implement real-time WebSockets for instant messaging.
- Add image upload support for Lost & Found and Resources.
- Enhance the Admin Portal with more moderation tools.

