# Setup New sda-uniconnect Environment

This plan details the setup for the `sda-uniconnect` project, setting it up as an early-stage project that follows the same logical structure as the current `Uniconnect` project but separated into proper file structures, accompanied by a comprehensive gameplan document.

## User Review Required
Please review the proposed list of components and pages that will be created as empty shell files. Also, confirm if you would like me to use Vite with React + TypeScript (same as the current project).

## Proposed Changes

### Project Initialization
- Run `npx create-vite@latest sda-uniconnect --template react-ts` in `d:\AG Projects`.
- Install the same basic base dependencies found in your current project: `lucide-react`, `tailwindcss`, `postcss`, `autoprefixer`, etc.
- Configure `tailwind.config.js` or `index.css` with basic setup.

### Scaffolding File Names
Instead of having everything in a massive `App.tsx`, we will show this new project in an early, modular stage just by creating the directory structure and the file names. The files will contain basic skeleton code (just boilerplate functions).

**Components (in `src/components/`)**:
- `Avatar.tsx`
- `Badge.tsx`
- `StatusBadge.tsx`
- `StarRating.tsx`
- `SectionHeader.tsx`
- `Tabs.tsx`
- `StatCard.tsx`
- `Modal.tsx`
- `FormField.tsx`
- `EmptyState.tsx`
- `StudentCard.tsx`
- `ResourceCard.tsx`

**Pages (in `src/pages/`)**:
- `LoginPage.tsx`
- `AdminLoginPage.tsx`
- `RegisterPage.tsx`
- `VerifyStudentPage.tsx`
- `ResetPasswordPage.tsx`
- `DashboardPage.tsx`
- `StudyPartnersPage.tsx`
- `StudyGroupsPage.tsx`
- `ResourcesPage.tsx`

**Services/Utils**:
- `api.ts` (API configuration)
- `theme.ts` (Design tokens)

### Gameplan Document
- We will create a `gameplan.md` in the root of the new project `sda-uniconnect`. This document will be very detailed, highlighting the goals, use cases, completion stages, mapping out the features from development, to testing, to deployment. It will act as the master text doc to track progress.

## Open Questions
- Are there any specific use cases or non-functional requirements you want emphasized in the Gameplan document?
- Do you want Tailwind properly configured, or just the file dependencies installed?

## Verification Plan
1. The new project directory `sda-uniconnect` exists.
2. The `package.json` contains the requested minimal dependencies.
3. The directory structure is fully populated with correctly named files.
4. The Gameplan document is successfully created.
