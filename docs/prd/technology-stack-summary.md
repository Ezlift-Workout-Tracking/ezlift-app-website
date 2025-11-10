# Technology Stack Summary

## Frontend Core (Existing)
- **Next.js**: 15.1.2 (App Router, React Server Components)
- **React**: 18.2.0
- **TypeScript**: 5.2.2
- **Tailwind CSS**: 3.3.3
- **shadcn/ui + Radix**: Component primitives (40+ components)
- **Framer Motion**: 11.0.8 (animations)
- **Lucide React**: 0.446.0 (icons)

## New Dependencies (Phase 1 MVP)
- **@tanstack/react-query**: ^5.x (server state management, caching, optimistic updates)
- **papaparse**: ^5.4.1 (CSV parsing for imports)
- **minisearch**: ^7.x (fuzzy exercise name matching)
- **@amplitude/analytics-browser**: ^2.x (user behavior tracking)
- **recharts**: 2.12.7 (bar charts, line charts - already installed)
- **date-fns**: 3.6.0 (date utilities - already installed)
- **react-hook-form**: 7.53.0 (form handling - already installed)
- **zod**: 3.24.1 (schema validation - already installed)

## Phase 2 Additions (Future)
- **@nozbe/watermelondb**: Latest (local-first database, IndexedDB adapter)
- **@babel/plugin-proposal-decorators**: For WatermelonDB model decorators
- **react-window**: ^1.x (virtual scrolling for large lists - performance optimization)

## Backend Integration
- **Base URL**: https://ezlift-server-production.fly.dev
- **Auth**: Firebase ID tokens via `x-jwt-token` header
- **Endpoints**: REST APIs for routines, workouts, logs, user (Phase 1)
- **Sync**: `push-changes`/`pull-changes` endpoints (Phase 2)
- **Changes Table**: Backend writes for mobile sync compatibility (Option A confirmed)

## External Services
- **Firebase**: Authentication (Google, Apple, Email/Password)
- **PostgreSQL**: Exercise library (read-only, direct connection)
- **Contentful**: Blog and exercise instructional content (CMS, read-only)
- **AWS S3**: Exercise images and videos (signed URLs, 1-hour expiration)
- **Google Analytics**: GA4 for web analytics and traffic sources
- **Amplitude**: User behavior tracking, product analytics, conversion funnels
- **Netlify**: Hosting, SSR/ISR, CDN, deployment automation, environment variables

## Component Reuse (From Public Website)

**UI Primitives** (`components/ui/`):
- ✅ All 40+ shadcn/ui components (button, card, input, select, dialog, toast, skeleton, table, tabs, pagination, etc.)

**Feature Components**:
- ✅ `exercise/ExerciseCard.tsx` - **Critical for Program Builder**
- ✅ `exercise/DebouncedSearchInput.tsx` - **Reuse in Program Builder**
- ✅ `exercise/ExerciseFilters.tsx` - **Reuse for muscle group filtering**
- ✅ `auth/*` - Login, signup, logout components
- ✅ `animations/*` - FadeIn, ScrollAnimation
- ✅ `brand/Logo.tsx` - Branding consistency

**New Components** (Web App Specific):
- Dashboard cards (Training Volume, PRs, Recent Workouts, Progress, Active Program)
- Program Builder (shell, workout editor, metrics panel, flow navigation)
- Import flow (CSV uploader, summary, progress, success)
- Onboarding (9-step flow with progress indicator)
- History list and filters
- Profile management
- User data state gate components

