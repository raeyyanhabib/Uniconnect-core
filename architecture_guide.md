# UniConnect Architecture & Workflow Guide

By understanding how the UniConnect codebase is structured and linked, you can effectively divide development tasks among your team. Below is a comprehensive overview of the file linkages, the data pipeline, and actionable suggestions on how to distribute work.

## 1. Project Directory Structure
The application is split into two distinct parts: a **React Frontend (Vite)** and an **Express.js Backend (Node.js + SQLite)**.

```text
d:\AG Projects\sda-uniconnect\
├── src/                        # FRONTEND (React)
│   ├── main.tsx                # Mounts the React app
│   ├── App.tsx                 # Core App Logic, Routing, Shell Setup
│   ├── components/             # Reusable UI elements (Buttons, Layouts, Modals)
│   ├── pages/                  # Full-page views (Dashboard, Messages, etc.)
│   ├── services/               # API helpers to talk to the backend
│   └── types/                  # Typescript interfaces
├── server/                     # BACKEND (Express + SQLite)
│   ├── index.js                # Server entry point, express setup
│   ├── db.js                   # SQLite database connection module
│   ├── routes/                 # Individual endpoints for each feature
│   ├── middleware/             # Auth/Error interception logic
│   └── seed.js                 # Initial test data seeder
└── public/, docs/, etc.        # Static assets and project docs
```

---

## 2. File Linkages & The Application Pipeline

### A. Frontend Flow (How a user sees a page)
- **Entry (`main.tsx`)**: The app boots up here.
- **Router / Manager (`App.tsx`)**:
  - Acts as the central state manager holding `currentUser`, `currentPage`, and notification counts.
  - Controls navigation via the `navigate(pageName)` function instead of standard React Router.
  - Determines if the user sees public pages (`LoginPage`) or authenticated ones (wrapped in `AppShell`).
- **Layout Shell (`AppShell` in `App.tsx`)**: Wraps around authenticated pages, rendering the `Sidebar` (navigation) and `TopBar` (header/profile).
- **Views (`src/pages/*`)**: Based on `currentPage`, `App.tsx` renders a specific active file, e.g., `<ResourcesPage />`.
- **Components (`src/components/*`)**: Pages compose their UI using reusable pieces (e.g., `StatCard`, `Modal`).

### B. Pages and Component Usage Mapping
Understanding how pages utilize reusable components helps you maintain UI consistency. Here is a breakdown of all main pages, what components they render, and where they link to:

| Page (`src/pages/*`) | Rendered Components (`src/components/*`) | Page Purpose & Links To |
|---|---|---|
| **LoginPage** | `FormField` | Authentication entry for students. Links to: `RegisterPage`, `ResetPasswordPage`, `DashboardPage` (on success). |
| **RegisterPage** | `FormField` | New student sign-up. Links to: `LoginPage`. |
| **VerifyStudentPage** | `FormField` | OTP / Email verification. Links to: `LoginPage`. | 
| **ResetPasswordPage** | `FormField` | Password recovery. Links to: `LoginPage`. |
| **DashboardPage** | `StatCard`, `BookOpen`, `Plus`, `Trash2`, `Edit2`, `Check`, `X` | Main portal view with live synced News, Todos, Events, and Lost & Found widgets. |
| **StudyPartnersPage** | `Badge`, `Avatar`, `StarRating`, `SectionHeader`, `Tabs`, `EmptyState`, `StudentCard` | Finding connections. Links to: `MessagesPage` (when messaging a partner). |
| **StudyGroupsPage** | `Badge`, `Avatar`, `StatusBadge`, `SectionHeader`, `Tabs`, `EmptyState`, `FormField` | Creating/joining groups. |
| **ResourcesPage** | `Badge`, `Avatar`, `StatusBadge`, `StarRating`, `SectionHeader`, `Tabs`, `FormField`, `Modal`, `ResourceCard` | Campus market. Links to: `MessagesPage` (to negotiate resource items). |
| **MessagesPage** | `Avatar` | Real-time chat interface. |
| **LostFoundPage** | `Badge`, `StatusBadge`, `SectionHeader`, `FormField`, `Modal` | Track lost & found items. |
| **NotificationsPage** | `SectionHeader` | Aggregated user alerts. |
| **ProfilePage** | `Avatar`, `StarRating`, `Tabs`, `FormField` | Editing personal info & viewing reviews. |
| **AdminLoginPage** | `FormField` | Authentication entry for admins. Links to: `AdminDashboardPage` (on success). |
| **AdminDashboardPage**| `StatCard` | Admin portal view. Links to: `AdminUsersPage`, `AdminResourcesPage`, `AdminReportsPage`. |
| **AdminUsersPage** | `SectionHeader`, `Avatar`, `StatusBadge` | Moderating all active users. |
| **AdminResourcesPage**| `SectionHeader`, `StatusBadge` | Moderating resource listings. |
| **AdminReportsPage** | `SectionHeader`, `Badge`, `StatusBadge` | Handling flagged content. |

> [!NOTE]
> Navigation between these pages isn't handled via traditional URLs (like `/dashboard`). Instead, components invoke the `onNavigate('pageName')` function passed down from `App.tsx` as a prop.

### C. End-to-End Pipeline (How data moves)
When a user does something (like searching for a Study Partner), the pipeline triggers:

1. **User Action**: The user clicks a button in `src/pages/StudyPartnersPage.tsx`.
2. **API Call**: The page calls a helper function from `src/services/api.ts` (e.g., `api.get('/api/partners')`).
3. **Backend Routing**: The Express backend locally at `server/index.js` catches the request to `/api/partners` and routes it to `server/routes/partners.js`.
4. **Database Query**: `partners.js` queries the SQLite database configuration situated in `server/db.js`.
5. **Response**: The requested DB payload is grabbed, formatted, and shipped back as JSON down the chain until the React frontend captures it and updates its local state to display.

---

## 3. Recommended Work Division for Teammates

Depending on your team size and strengths, here are three highly recommended ways to split the workload efficiently.

### Option 1: Horizontal Division (Frontend vs. Backend)
*Best for teams where members specialize in either visual/UI or database/logic.*

*   **Teammate 1 (Frontend UI/UX):** Focuses solely on files inside `src/pages/` and `src/components/`. Tasks include styling components, responsive mobile design, updating the Sidebar, and adding new React hooks.
*   **Teammate 2 (Backend & Database):** Focuses on files in `server/`. Tasks include creating new SQL tables/queries in `db.js`, building new API endpoints inside `server/routes/`, and securing logic with `server/middleware/`.
*   **Teammate 3 (API Integration):** Connects the two. Stays in `src/pages/*` and `src/services/api.ts` fetching data, managing frontend loading states (`isLoading`), and updating UI via hooks based on API responses.

### Option 2: Vertical Division (Feature-Based)
*Best for autonomous full-stack developers so they don't block each other on tasks.*

*   **Teammate 1 (Authentication & Users):** Handles everything surrounding login, registration, and profiles. Touches `LoginPage.tsx`, `ProfilePage.tsx`, `server/routes/auth.js`, `server/routes/users.js`.
*   **Teammate 2 (Study Connections):** Focuses on social elements. Works end-to-end on `StudyPartnersPage.tsx`, `StudyGroupsPage.tsx`, `server/routes/partners.js`, and `server/routes/groups.js`.
*   **Teammate 3 (Campus Services):** Focuses solely on utility integrations like Market Resources and Lost/Found. Works on `ResourcesPage.tsx`, `LostFoundPage.tsx`, `server/routes/resources.js`, `server/routes/lostfound.js`.
*   **Teammate 4 (Admin Portal & Reports):** Oversees the admin suite. Touches `AdminDashboardPage.tsx`, `AdminUsersPage.tsx`, and `server/routes/admin.js`.

### Option 3: Component Library vs. Business Logic
*Best for a 2-person team on a tight deadline.*

*   **Teammate A:** Extracts & creates generic, reusable UI modules (e.g., styling a perfectly accessible custom Input, Button, Modal, or list template inside `src/components/`).
*   **Teammate B:** Plastering the business logic. Putting the pages together (`src/pages/*`), setting up routes in `App.tsx`, and hooking them up to the actual backend logic.

> [!TIP]
> **To avoid Git conflicts**, recommend that teammates work on different file locations. If using vertical slice distribution (Option 2), there is a much smaller chance of merge conflicts occurring on the exact same API route or frontend page.
