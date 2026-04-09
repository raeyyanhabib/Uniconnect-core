# UniConnect Development Gameplan

## 1. Executive Summary
The **UniConnect** project is designed to be the definitive campus collaboration platform. Built with React (Vite) and TailwindCSS, the application will provide a highly scalable, modular structure prioritizing responsive UI, robust state management, and seamless integrations. This document serves as the master blueprint for completing the platform.

## 2. Project Goals
1. **Modularity**: Transition from a single-file monolith (`App.tsx`) to highly decoupled UI components and specialized page routes.
2. **Robust Authentication**: Implement secure JWT flows and precise role-based access for students and administrators.
3. **Dynamic Interactivity**: Foster student engagement with rich animations, micro-interactions, and real-time state updates via WebSockets.
4. **Maintainability**: Utilize TypeScript strict mode and modular services for clean, predictable codebases.

## 3. Core Use Cases (UCs)

### UC1: Student Registration
- **Actor**: Prospective Student
- **Flow**: User enters name, university email, and password -> system verifies university email domain -> User inputs Dept/Semester -> System sends email verification.

### UC2: Verification Flow
- **Actor**: Unverified Student
- **Flow**: Student receives 6-digit OTP -> enters OTP on verification page -> Account state changes to 'Verified'.

### UC3: Secure Login
- **Actor**: Verified Student
- **Flow**: User inputs credentials -> System validates and returns JWT -> User is routed to Main Dashboard.

### UC4: Admin Portal Access
- **Actor**: University Administrator
- **Flow**: Admin logs into a dedicated portal using distinct credentials -> directed to Admin Dashboard to monitor user reports, flagged resources, and general analytics.

### UC5: Resource Management
- **Actor**: Student
- **Flow**: User navigates to the 'Resources' page -> Posts a new resource (Book/Notes) -> Tracks borrow requests and due dates. Modules include flagging damaged items.

### UC6: Study Groups & Collaboration
- **Actor**: Student
- **Flow**: User joins a private/public study group -> Uses group messaging and file sharing to collaborate on mutual courses.

## 4. Implementation Phases

**Phase 1: Project Scaffolding & Setup (COMPLETED)**
- Initialized Vite + React + TS environment.
- Installed `tailwindcss`, `lucide-react`.
- Prepared base directory architecture (`components/`, `pages/`, `services/`).

**Phase 2: UI Foundation & Theming**
- Implement design tokens in `services/theme.ts`.
- Flesh out base shared components: `Avatar`, `Badge`, `Modal`, `Tabs`, `StatCard`, etc.
- Integrate global CSS from legacy design to the new `index.css`.

**Phase 3: Auth Module Refactoring**
- Code `LoginPage`, `RegisterPage`, `VerifyStudentPage`, and `AdminLoginPage`.
- Establish secure `.env` usage and `api.ts` interceptors for JWT.

**Phase 4: Core Features Assembly**
- Assemble main layout shell (Sidebar, Header).
- Implement `DashboardPage` and `ResourcesPage`.
- Implement `StudyPartnersPage` with intelligent matching based on mutual courses.

**Phase 5: Refinement & QA**
- End-to-End testing of critical flows.
- Performance profiling for React rendering bottlenecks.
- Final visual polish and responsive testing across mobile devices.

---
*Document Version: 1.0.0*
*Last Updated: 2026-04*
