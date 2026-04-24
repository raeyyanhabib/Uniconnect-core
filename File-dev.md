# UniConnect 

This document tracks the current state of the UniConnect project as of April 24, 2026.

## Current Scenario
The project has transitioned from a static UI prototype to a fully functional full-stack application with a modular frontend and a persistent SQLite backend.

### Project Initialization
- Run `npx create-vite@latest sda-uniconnect --template react-ts` in `d:\AG Projects`.
- Install the basic base dependencies found in your current project: `lucide-react`, `tailwindcss`, `postcss`, `autoprefixer`, etc.
- Configure `tailwind.config.js` or `index.css` with basic setup.

### File Names & Structure
Instead of having everything in a massive `App.tsx`, we made this new project in an early, modular stage just by creating the directory structure and the file names. The files will contain basic skeleton code (just boilerplate functions).

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

**Server Root (in `server/`)**:
- '.env'
- '.env.example'
- 'db.js'
- 'index.js'
- 'package-lock.json'
- 'package.json'
- 'seed.js'
- 'uniconnect.db'
- 'uniconnect.db-shm'
- 'uniconnect.db-wal'

### Frontend (`/src`)

**Root Files (in `src/`)**:
- 'App.css'
- 'App.tsx'
- 'index.css'
- 'main.tsx'
- `pages/`: Modular page components (Dashboard, Partners, Groups, etc.).
- 
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
- 
- `components/`: Reusable UI components 
- 
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

- **Types (in `src/types/`)**:
- 'index.ts'
  
- `services/`: API (`api.ts`) and Design Tokens (`theme.ts`).

## Next Steps
- Implement real-time WebSockets for instant messaging (replacing polling).
- Add image upload support for Lost & Found and Resources.
- Enhance the Admin Portal with more moderation tools.

