# Monolith to Modular: Porting UniConnect

I have successfully decompiled and systematically modularized your 2,400+ line `App.tsx` monolith into a professional, scalable React directory structure in the new `sda-uniconnect` project. 

The original aesthetic, routing behavior, and feature-rich design have been perfectly ported into manageable, easily maintainable modules.

## Architecture

The new architecture decouples UI, business logic, semantic themes, and page routers:

### 1. Types Module
- `src/types/index.ts`: Strongly typed interfaces like `User`, `Resource`, `Announcement`, `StudyGroup`, and `AuthPageProps`. Reused everywhere to keep data reliable.

### 2. Services Module
- `src/services/api.ts`: Setup Axios/Fetch handlers, environment URLs, intercepts, and JWT auth persistence.
- `src/services/theme.ts`: Extracted design tokens object (`C` object for Colors) and global inline utility styles (like `cardStyle()`, `btnP`, `btnS`, `inp`) so changes only need to be tuned in one place.

### 3. Micro-Components
Separated complex interactive atoms from `App.tsx` into standalone reusable assets that use `theme.ts`:
- **Identity:** `Avatar`, `Badge`, `StatusBadge`
- **UI Structure:** `Tabs`, `SectionHeader`, `Modal`, `EmptyState`
- **Dash Widgets:** `StatCard`, `StudentCard`, `ResourceCard`, `StarRating`, `FormField`

### 4. Pages Structure
Every primary View was decoupled out of `App.tsx` into `/pages`. These modules govern their own state and lifecycle calls:

**Authentication:** 
`LoginPage.tsx`, `AdminLoginPage.tsx`, `RegisterPage.tsx`, `VerifyStudentPage.tsx`, `ResetPasswordPage.tsx`

**Core App (Student):** 
`DashboardPage.tsx`, `ProfilePage.tsx`, `StudyPartnersPage.tsx`, `StudyGroupsPage.tsx`, `ResourcesPage.tsx`, `MessagesPage.tsx`, `NotificationsPage.tsx`, `LostFoundPage.tsx`

**Admin App:** 
`AdminDashboardPage.tsx`, `AdminUsersPage.tsx`, `AdminResourcesPage.tsx`, `AdminReportsPage.tsx`

### 5. Application Shell 
The new `src/App.tsx` has been heavily sanitized. It now only controls:
- State for `currentUser`, `isAdmin`, and `currentPage` navigation.
- The `AppShell` HOC (Higher Code Order), which manages `Sidebar` and `TopBar` rendering based on active identity.

> [!TIP]
> The new clean `App.tsx` serves as a master layout router, delegating all internal logics out to `/pages` and `/components`. This allows for highly productive component-level scaling moving forward.
