# EZLift Brownfield Enhancement PRD

## Intro Project Analysis and Context

### Existing Project Overview

#### Analysis Source
- IDE-based fresh analysis
- Referenced:
  - `docs/PROJECT_DOCUMENTATION.md`
  - `docs/brief.md`
  - `docs/EzLift Website + Web App — Full PRD.md`
  - `package.json`
  - `README.md`

#### Current Project State
- Framework: Next.js 15 (App Router), React 18, TypeScript, Tailwind CSS, shadcn/ui (Radix)
- Areas:
  - Public site: landing, about, blog, exercise library, android waitlist, legal pages
  - Secure web app: protected `/app` entrypoint; auth pages (`/login`, `/signup`, `/forgot-password`); dashboard planned
- Data sources: PostgreSQL (exercise DB), Contentful (blog + exercise rich content), AWS S3 (media)
- Auth: Firebase client auth → server session via `POST /api/auth/session`; HttpOnly cookies; `middleware.ts` route protection
- Hosting/Deployment: Netlify with official Next.js plugin; optional CI via GitHub Actions
- SEO/Analytics: dynamic metadata, sitemap/robots; Google Analytics integrated
- Key files/paths:
  - App Router: `app/`
  - Middleware: `middleware.ts`
  - Exercise API: `app/api/exercises/route.ts`
  - Session API: `app/api/auth/session/route.ts`
  - Auth helpers: `lib/auth/guards.ts`, `lib/auth/session.ts`
  - Data services: `lib/services/*`
  - Contentful client: `lib/contentful.ts`
  - Env/config: `lib/config/environment.ts`

### Available Documentation Analysis
- Using existing project analysis; key docs:
  - `docs/PROJECT_DOCUMENTATION.md`
  - `docs/brief.md`
  - `docs/EzLift Website + Web App — Full PRD.md`

- Available Documentation (snapshot)
  - [x] Tech Stack Documentation
  - [x] Source Tree/Architecture
  - [~] Coding Standards (partial within documentation)
  - [x] API Documentation (partial; endpoints outlined in PRD; final swagger TBD)
  - [x] External API Documentation (Firebase/Contentful/S3 overview present)
  - [~] UX/UI Guidelines (implicit via Tailwind + shadcn/ui; no formal guide)
  - [x] Technical Debt/Risks (captured in brief/PRD risk sections)

> Note: If a deeper brownfield architecture output is desired, consider running a dedicated "document-project" pass to generate a focused architecture document.

## Enhancement Scope Definition

### Enhancement Type
- [x] New Feature Addition
- [ ] Major Feature Modification
- [ ] Integration with New Systems
- [ ] Performance/Scalability Improvements
- [x] UI/UX Overhaul
- [ ] Technology Stack Upgrade
- [ ] Bug Fix and Stability Improvements
- [ ] Other: _{specify}_

### Enhancement Description
Build the secure web app MVP from the current post-login placeholder into a meaningful dashboard-first experience. The web app will stand on its own (not mirroring mobile), reuse existing backend APIs, and serve as the primary surface to trial new features. Public-facing website revamp is explicitly out of scope for this PRD iteration and will be handled separately.

### Impact Assessment
- [ ] Minimal Impact (isolated additions)
- [ ] Moderate Impact (some existing code changes)
- [x] Significant Impact (substantial existing code changes)
- [ ] Major Impact (architectural changes required)

## Goals and Background Context

### Product Goals
- Deliver secure web app MVP dashboard and history without regressing existing site flows
- Establish import entry (Hevy/Strong CSV early access) to validate portability demand
- Enable new users to create programs on web with full desktop advantages
- Provide existing users with powerful analytics and data visualization
- Maintain Core Web Vitals targets (LCP < 2.5s p75, INP < 200ms p75)
- Instrument comprehensive analytics to inform product decisions

### Background
Public site + secure companion app; reuse backend + Firebase auth with server sessions; content via Contentful; exercise data via Postgres and S3 media. This enhancement builds incrementally atop existing architecture while preserving current behavior.

**Desktop Advantages**: Large screens enable sophisticated program building, data visualization, and multi-column layouts that mobile can't provide. Web app complements mobile (planning/analytics) rather than duplicating it (live tracking).

## Change Log
| Change | Date | Version | Description | Author |
| --- | --- | --- | --- | --- |
| Initial draft | 2025-10-07 | 0.1 | Created Intro/Docs Analysis; scaffolded scope sections | John (PM) |
| Major refinement | 2025-01-10 | 0.2 | Incorporated UX design, architecture decisions, user data state constraints, expanded requirements and epic stories | John (PM) |

## User Data State & Feature Access (MVP Constraint)

### User Classification

The web app MVP classifies users into two states to ensure mobile/web data synchronization:

**New Users** (No existing data):
- **Definition**: User has zero workouts, zero programs, zero sessions
- **Detection**: Query backend on login for existing data (`GET /api/workout?limit=1` + `GET /api/logs?limit=1`)
- **Feature Access**: Full program creation and editing capabilities

**Existing Users** (Have mobile app data):
- **Definition**: User has workouts/programs/sessions from mobile app
- **Detection**: API returns results for `GET /api/workout` or `GET /api/logs`
- **Feature Access**: Read-only program viewing, full dashboard/history/import

### Feature Access Matrix

| Feature | New User | Existing User | Phase 2 (All Users) |
|---------|----------|---------------|---------------------|
| Dashboard | ✅ Full (likely empty) | ✅ Full (populated) | ✅ Full |
| History View | ✅ (empty state) | ✅ (mobile data) | ✅ (synced) |
| CSV Import | ✅ Full access | ✅ Full access | ✅ Full access |
| Profile Edit | ✅ Full access | ✅ Full access | ✅ Full access |
| Program Builder | ✅ **Create/Edit/Delete** | ❌ **View Only** | ✅ **Create/Edit/Delete** |
| Program View | ✅ | ✅ | ✅ |

### Rationale

**Why This Constraint**:
- Mobile app uses WatermelonDB sync (`push-changes`/`pull-changes` endpoints)
- Web app MVP uses direct REST APIs (`POST /api/routine`, etc.)
- Backend REST endpoints write to Changes table (Option A confirmed working)
- Existing users' mobile data tracked via Changes table
- Preventing existing users from editing on web avoids any potential sync edge cases

**User Experience**:
- **New users**: Create programs on web → Mobile syncs down on first login → Perfectly in sync
- **Existing users**: See message: "Full program editing coming soon. Use mobile app to edit programs."

**Phase 2 Removes This Constraint**: 
When web app migrates to WatermelonDB (Phase 2), all users will have full editing capabilities on both web and mobile with perfect synchronization.

## Requirements

### Functional (FR)

**FR1: Dashboard with P0 Cards and Data State Awareness**

Post-login lands on Dashboard with P0 cards: Training Volume (per week), Top PRs/Personal Bests, Recent Workouts, Progress over time (estimated 1RM), Active Program/Routine Summary.

- **Data Source**: All cards query backend REST APIs (`GET /api/logs`, `GET /api/routine`)
- **Aggregation**: Stats computed client-side (weekly volume, max weights, est 1RM calculations)
- **User State Handling**:
  - New users: Dashboard renders with empty states and CTAs ("Create Program", "Import History")
  - Existing users: Dashboard populated with mobile-tracked data (sessions synced via backend)
  - Global date range filter affects all cards simultaneously (7 days, 30 days, 90 days, all time)
- **Performance**: Dashboard must load with LCP < 2.0s (p75) even with client-side aggregations

**FR2: History Page with Pagination and Filtering**

History page lists past workouts with pagination and date filter.

- Paginated list (20 sessions per page)
- Date range filter (7 days, 30 days, 90 days, all time)
- SSR-safe query param handling
- Click workout → Detail modal

**FR3: Profile Management**

Profile basics are editable (units, bodyweight) and persist via PATCH; reflect on reload.

- View/edit: Weight unit (kg/lbs), distance unit (km/mi), height unit (cm/in), bodyweight
- Display name shown (read-only)
- Optimistic updates with rollback on error

**FR4: CSV Import with Client-Side Parsing**

Import flow accepts Hevy/Strong CSV with client-side parsing and batch session creation.

- **Implementation**:
  - CSV file uploaded in browser (no server upload)
  - PapaParse library parses CSV client-side
  - MiniSearch fuzzy matches exercise names against exercise library (0.2 fuzzy threshold)
  - Display import summary (X workouts, Y exercises, Z sets found, N unmapped)
  - User confirms import → Batch create sessions via `POST /api/logs` (one-by-one or bulk if available)
  - Progress bar shows "Importing X of Y workouts"
  - Success screen shows summary and redirects to dashboard or history
- **Supported Formats**:
  - Hevy CSV (18 columns: title, start_time, end_time, exercise_title, set_index, weight_kg, reps, etc.)
  - Strong CSV (future, similar format)
- **Error Handling**:
  - Invalid CSV format → Show error, allow retry
  - Unmapped exercises (no fuzzy match) → Import as custom exercises or skip
  - Partial import failures → Show success count + failed count
- **Post-Import**:
  - Imported sessions flagged with `isImported: true`, `importedAt: timestamp`
  - Dashboard cards automatically refresh (React Query cache invalidation)
  - Analytics event: "Import Completed" with metrics

**FR5: Authentication & Session Management**

Auth/session model remains unchanged; middleware continues to guard protected routes and redirect appropriately.

**FR6: Dual Analytics Integration (Amplitude + GA4)**

Dual analytics integration (Google Analytics 4 + Amplitude) with comprehensive event taxonomy.

- **Providers**:
  - **Google Analytics 4** (GA4): General web analytics, traffic sources, page views
  - **Amplitude**: Detailed user behavior tracking, product analytics, conversion funnels
- **Implementation**:
  - Unified analytics interface (single function calls both providers)
  - Cookie consent governs analytics activation
  - No PII in events (user IDs hashed, no emails/names)
- **Event Categories** (50+ total events):
  1. Authentication: Signup, login, logout (with method tracking)
  2. Onboarding: Each step completion, question answers, skip actions
  3. Dashboard: Page views, card views, card clicks, filter changes
  4. Program Builder: Exercise added/removed, sets configured, program saved
  5. Import: CSV uploaded, parsed, imported, errors
  6. History: Page viewed, filtered, paginated, workout detail viewed
  7. Profile: Viewed, updated (track which fields changed)
- **Analytics Library**: `@amplitude/analytics-browser` (v2.x)
- **Loading Strategy**: Defer script loading (async, after page interactive), batch events
- **Privacy**: IP anonymization, cookie consent required, GDPR-compliant

**FR7: Provider-Agnostic Analytics Interface**

Analytics provider abstraction supports optional Amplitude alongside GA without duplicating instrumentation code (shared event names/props).

**FR8: A/B Testing & Feature Flags**

A/B testing readiness via feature flags; key UI surfaces (dashboard cards, layouts, copy) are gateable and can be toggled by an external A/B testing tool without code changes.

**FR9: Global Date Range Filter**

Global date range filter at the top of the dashboard that coherently scopes all cards (sticky per session; analytics events fire on changes).

**FR10: User Data State Detection**

User data state detection determines feature access for program creation/editing.

- **Implementation**:
  - On web app login, query backend: `GET /api/workout?limit=1` + `GET /api/logs?limit=1`
  - If any results returned → User state: "existing"
  - If no results → User state: "new"
  - Cache state for session (recheck every 10 minutes or on specific actions)
- **Feature Gating**:
  - New users: Show Program Builder with full create/edit/delete capabilities
  - Existing users: Show Program Viewer (read-only) with message:
    - "Full program editing on web coming soon"
    - "For now, create and edit programs on the mobile app"
    - CTAs: "View My Programs", "Download Mobile App"
- **Fail-Safe**: If data state check errors → Default to "existing" (read-only mode) to prevent sync conflicts
- **Analytics**: Track user state on dashboard load: "User Data State Detected" (state: 'new' | 'existing')

**FR11: Onboarding Flow Branching**

Onboarding flow adapts based on user data state (new vs existing).

- **Onboarding Steps for New Users** (9 total):
  1. Personal Info (gender, age range)
  2. Training Frequency (1-2, 3-4, 5-6, 7+ days/week)
  3. Training Duration (30min or less, 30-45, 45-60, 60+)
  4. Experience Level (beginner, intermediate, advanced, expert)
  5. Goals (multi-select: muscle, strength, weight loss, endurance, etc.)
  6. Equipment Available (multi-select: free weights, machines, bands, bodyweight, etc.)
  7. Program Setup (Do you have a program? Yes/No/Skip)
  8-9. Program Configuration (varies by Step 7 choice)
- **Onboarding Steps for Existing Users** (6 only):
  - Steps 1-6: Same as above (collect preferences for future features)
  - Step 7: Skip to Dashboard (show transition: "Your programs from mobile are ready")
- **Branching Logic**: After Step 6, check user data state. If existing: show "Welcome back" → redirect to dashboard. If new: continue to Step 7.
- **Analytics**: Track each step completion with user state; "Onboarding Completed" (userState: 'new' | 'existing', completedSteps: 6 | 9)
- **Note**: Onboarding question answers (Steps 1-6) are NOT persisted to backend in MVP. They are tracked via Amplitude events only for product insights. Backend storage for these preferences will be added post-MVP.

**FR12: Program Builder with Access Control**

Visual, desktop-optimized program builder accessible to new users only; existing users see read-only view.

- **New Users**: Full create/edit/delete capabilities
  - 4-column exercise grid (reuses ExerciseCard from public site)
  - Debounced search (250ms desktop, 350ms mobile)
  - Muscle group filters
  - Drag-and-drop exercise reordering
  - Configure sets per exercise (reps, weight, rest time)
  - Real-time metrics panel (muscles covered, estimated duration, exercise variety)
  - Flow navigation: Workout 1 → Workout 2 → Workout 3 → Overview → Save
  - Save creates: `POST /api/routine` → `POST /api/workout` × N
  - Backend writes to Changes table for mobile sync
- **Existing Users**: Read-only program viewing
  - Can view all programs from mobile
  - Edit button shows: "Full program editing coming soon. Use mobile app to edit programs."
  - CTAs: "View My Programs", "Download Mobile App"
- **Analytics**: Full funnel (opened, exercise added/removed, program saved, time to complete, abandonment tracking)

**FR13: Client-Side Data Aggregation**

Dashboard statistics computed client-side from raw backend data.

- **Aggregations**:
  1. Weekly/monthly training volume (group sessions by week, sum sets/volume)
  2. Personal records (find max weight × reps per exercise)
  3. Progress trends (calculate estimated 1RM using Epley formula)
  4. Workout frequency (count sessions per week)
  5. Muscle group distribution (aggregate exercises by muscle group)
- **Performance**: All aggregations < 100ms for 30 days of data
- **Caching**: Aggregated results cached in React Query (5-minute stale time)
- **Data Limits**: Fetch limited date ranges (default 30 days, expandable to 90 days, 1 year)

**FR14: CSV Import with Fuzzy Exercise Matching**

CSV import uses client-side parsing with fuzzy exercise name matching.

- **Libraries**: PapaParse (CSV parsing), MiniSearch (fuzzy search, 0.2 threshold)
- **Process**:
  1. Parse CSV client-side
  2. Group rows by workout (title + start_time + end_time)
  3. Fuzzy match exercise names against exercise library
  4. Display unmapped exercises for user review
  5. Create session records via `POST /api/logs`
- **Error Handling**: Continue with remaining workouts if individual creates fail
- **Performance**: Import progress shown for large files (100+ workouts)

### Non-Functional (NFR)

**NFR1: Performance Budgets with Client-Side Computation**

Performance budgets maintained despite client-side aggregations and analytics overhead.

- **Targets**:
  - Dashboard LCP: < 2.0s (p75) - Includes SSR + client-side stat computations
  - Dashboard INP: < 200ms (p75) - Includes chart rendering
  - History LCP: < 2.5s (p75)
  - Program Builder LCP: < 3.0s (p75) - More complex UI acceptable
- **Client-Side Computation Performance**:
  - Weekly volume aggregation: < 100ms for 30 days of data
  - Personal records calculation: < 50ms for 100 sessions
  - Progress chart data prep: < 100ms per exercise
  - All aggregations cached in React Query (5-minute stale time)
- **Mitigation Strategies**:
  - Fetch limited date ranges (default: 30 days, user can expand)
  - Lazy load chart libraries (Recharts loaded on-demand)
  - Code split heavy components (Program Builder, Import Flow)
  - Defer analytics script loading (async, after page interactive)
  - Use useMemo for expensive aggregations
- **Performance Testing**: Test with realistic data volumes (100 sessions, 500 sets) on throttled CPU

**NFR2: Privacy & Compliance**

Privacy/compliance respected: cookie consent governs analytics; IP anonymization enabled where applicable; no PII sent in events.

**NFR3: A/B Testing Consistency**

A/B variants are sticky per user/session to avoid flicker; SSR/CSR maintain a consistent variant experience.

**NFR4: Provider-Agnostic Analytics**

Provider-agnostic analytics interface to enable swapping/augmenting tools with minimal code changes.

**NFR5: Analytics Instrumentation Coverage**

Instrumentation coverage for critical flows is validated (at least page views and core actions fire reliably).

**NFR6: Client-Side Aggregation Performance Limits**

Client-side aggregations remain performant within reasonable data volume limits.

- **Data Volume Assumptions**:
  - Typical user: 50-100 workout sessions per year
  - Active user: 200-300 sessions per year
  - Power user: 500+ sessions per year
- **Performance Thresholds**:
  - < 100 sessions: Client-side aggregation always acceptable (< 100ms)
  - 100-500 sessions: Acceptable with date range limits (< 200ms)
  - > 500 sessions: May need server-side aggregation (Phase 2 or backend optimization)
- **Mitigation for Large Datasets**:
  - Default date range: 30 days (limits query result size)
  - Lazy loading: "Load older data" button for historical analysis
  - Virtual scrolling: Use react-window for lists > 50 items
  - Pagination: 20 sessions per page in history view
- **Future Optimization** (Post-MVP): Backend aggregation endpoints, pre-computed stats tables, materialized views, caching layer (Redis)

**NFR7: Analytics Performance Impact**

Analytics integration must not degrade user experience.

- Defer/async script loading (after page interactive)
- Batch events to reduce network requests
- Event payload size limits (< 10KB per event)
- No blocking analytics calls on critical user paths
- Analytics failures must not impact app functionality

### Compatibility Requirements (CR)

**CR1: Public Website & Mobile Sync Compatibility**

Existing public website behavior remains unaffected in this PRD iteration; website A/B testing will be handled in a separate workstream.

- **Mobile Sync Compatibility**:
  - Backend REST endpoints (`POST /api/routine`, `POST /api/workout`, etc.) write to Changes table
  - Ensures mobile app receives web-created programs on first sync (`pull-changes` with `lastPulledAt=0`)
  - New users can create programs on web; mobile syncs down on first login
  - Existing users blocked from program editing on web (prevents sync conflicts until Phase 2)
  - Import flow (CSV) creates workout sessions via `POST /api/logs` (also writes to Changes table)
- **Backward Compatibility**:
  - Mobile apps continue using WatermelonDB sync pattern (no changes)
  - Backend maintains existing sync endpoints (`push-changes`, `pull-changes`)
  - Web app's REST API usage doesn't interfere with mobile sync

**CR2: No Breaking Changes**

No breaking changes to mobile clients or shared backend API contracts.

**CR3: Security Posture**

Security posture maintained: HttpOnly cookies, SameSite, and `Secure` in production; feature flags must not weaken route protection.

**CR4: Graceful Degradation**

Feature flag/A-B tooling must degrade gracefully if not configured (defaults to control) and be SSR-safe where needed.

**CR5: No Database Schema Changes**

No database schema changes required for MVP dashboard/history/import entry.

**CR6: Backend Changes Table Writes**

Backend REST endpoints write to Changes table for mobile sync compatibility.

- Endpoints that write to Changes table:
  - `POST /api/routine` - Create routine
  - `POST /api/workout` - Create workout template
  - `PATCH /api/routine/:id` - Update routine
  - `PATCH /api/workout/:id` - Update workout
  - `DELETE /api/routine/:id` - Delete routine
  - `DELETE /api/workout/:id` - Delete workout
  - `POST /api/logs` - Create workout session (for imports)
- Pattern matches existing `/verify` endpoint behavior
- Ensures new users' web-created programs sync to mobile on first login

## User Interface Enhancement Goals

### Integration with Existing UI
- Use Tailwind CSS and shadcn/ui (Radix) components consistently; respect existing design tokens, spacing, and motion guidelines.
- Ensure accessible semantics (labels, roles, focus order, keyboard navigation) and color contrast for dark/light themes.
- Prefer server-rendered shells with client components for interactions; avoid blocking scripts on first paint.
- Reuse `components/ui/*` primitives; add new primitives only when necessary and co-locate in appropriate folders.

### Modified/New Screens and Views
- Dashboard (post-login landing): grid of P0 cards — Training Volume, Top PRs, Recent Workouts, Progress over Time, Active Program/Routine Summary — with a global date range filter.
- History (list view for MVP; detail view optional in later phases).
- Profile (basics: units, bodyweight; display name).
- Import entry (modal/sheet or dedicated flow entry from dashboard card).
- Program Builder (visual, flow-based: Workout 1 → 2 → 3 → Overview → Save)
- Onboarding (9-step flow with progress indicator, branching logic for user state)

### UI Consistency Requirements
- Responsive behavior: stacked on mobile; 2x2 grid on desktop for primary cards; program card full-width below.
- Loading: skeleton loaders for each card; Error: non-blocking toasts; Empty: clear CTAs (import/log workout/create program).
- Instrumentation hooks in UI components to fire analytics events for meaningful actions.
- Feature flag boundaries wrap visible UI variants to support A/B testing without visual flicker.
- **Light mode only**: Web app uses light theme (contrasting with public site's dark theme) for analytical clarity on desktop.

## Technical Constraints and Integration Requirements

### Existing Technology Stack
**Languages**: TypeScript, JavaScript
**Frameworks**: Next.js 15 (App Router), React 18, Tailwind, shadcn/ui
**Database**: None client-owned; reuse existing backend APIs (PostgreSQL on server side)
**Infrastructure**: Netlify + `@netlify/plugin-nextjs`; AWS S3 for media; Contentful for blog
**External Dependencies**: Firebase auth, GA4 (Google Analytics), Amplitude

### Integration Approach
**Database Integration Strategy**: Web app does not connect directly; all data via existing backend APIs.
**API Integration Strategy**: Reuse current endpoints for workouts/history/profile; no breaking changes to mobile contracts.
**Frontend Integration Strategy**: SSR page shells with client cards; auth via HttpOnly cookies; route protection via `middleware.ts` and server-side guards.
**Testing Integration Strategy**: Unit tests for hooks/components; targeted integration tests for dashboard flows and auth redirects; analytics event smoke checks.

### Code Organization and Standards
**File Structure Approach**: Pages under `app/` (e.g., `app/app/page.tsx`, `app/history/page.tsx`); UI primitives under `components/ui/*`; feature components under `components/sections/*` or `components/exercise/*` as appropriate.
**Naming Conventions**: PascalCase for components, camelCase for functions/variables, kebab-case routes.
**Coding Standards**: TypeScript strict types; avoid any; follow existing eslint and formatting; guard server/client boundaries.
**Documentation Standards**: Update PRD and tracking plan; inline code comments for non-obvious logic only.

## Technical Constraints (MVP)

### Backend Dependencies

**Existing Endpoints** (No modifications required for most features):
- ✅ `GET /api/user` - User profile
- ✅ `PATCH /api/user` - Update profile
- ✅ `GET /api/workout` - List workouts
- ✅ `GET /api/routine` - List routines
- ✅ `GET /api/logs` - List sessions

**Required Backend Behavior** (Option A - Confirmed working):
- ✅ `POST /api/routine` writes to Changes table (via migration)
- ✅ `POST /api/workout` writes to Changes table (via migration)
- ✅ `PATCH`/`DELETE` endpoints write to Changes table (to be formalized)

**Backend Endpoints NOT Used in MVP**:
- ❌ `POST /api/sync/push-changes` (Phase 2 only)
- ❌ `GET /api/sync/pull-changes` (Phase 2 only)

### Client-Side Computation Requirements

**Dashboard Stats** (All computed client-side):
1. Weekly/monthly training volume (sum sets, sum weight × reps)
2. Personal records (max weight × reps per exercise)
3. Progress trends (estimated 1RM using Epley formula: `weight × (1 + reps/30)`)
4. Workout frequency (sessions per week)
5. Muscle group distribution (exercise counts by muscle group)

**Performance Assumption**: < 500 sessions per user (client-side aggregation remains fast)

**Post-MVP**: Backend can add aggregation endpoints for optimization

### Mobile App Synchronization (Phase 1)

**New Users**:
- Create programs on web via REST API
- Backend writes to Changes table (via existing migration)
- Mobile first login: `pull-changes` → Receives web-created programs
- ✅ Perfectly in sync

**Existing Users**:
- Cannot edit programs on web (blocked by user data state check)
- Can view programs (read-only)
- No sync conflicts possible
- ✅ Safe

### Data Volume Limits (MVP)

**Assumptions**:
- Typical user: 50-100 sessions/year
- Active user: 200-300 sessions/year
- Maximum tested: 500 sessions

**Mitigation for Large Datasets**:
- Default date range: 30 days
- Pagination: 20 sessions per page
- Lazy loading: "Load more" for historical data
- Future: Backend aggregation endpoints

### Deployment and Operations
**Build Process Integration**: Preserve `npm run build` and Netlify plugin flow; analytics scripts loaded defer/async; env-driven configuration for GA/Amplitude keys.
**Deployment Strategy**: Incremental rollout; feature flags default to control; variants can be toggled without redeploy when integrated with external A/B tool.
**Monitoring and Logging**: GA performance reports; console error monitoring; optional Amplitude dashboards; verify event delivery.
**Configuration Management**: Use Netlify env vars (`GA_MEASUREMENT_ID`, `AMPLITUDE_API_KEY`, feature flag source id); safe defaults if unset.

### Risk Assessment and Mitigation
**Technical Risks**: Analytics overhead, flicker from late variant resolution, auth regressions, API latency affecting dashboard, client-side aggregation performance on large datasets.
**Integration Risks**: Backend endpoints missing specific fields; large CSV imports; cross-environment config drift; user data state detection failures.
**Deployment Risks**: Missing env vars causing analytics/flags to fail; misconfigured CSP blocking scripts.
**Mitigation Strategies**: Defer/async analytics, SSR-friendly flag gating with control default, incremental enablement, CSP allowlists, clear fallbacks, fail-safe defaults for user state detection.

## Monetization & Access Policy (MVP)
- Web MVP is free at launch (including stats dashboard, import/export, program builder) to maximize learning and traction.
- Long-term: web paywall aligns with existing mobile subscription; gating will be introduced later with feature hooks added in MVP for future enablement.
- Import from Hevy/Strong is initially free/early-access on web; mobile remains premium until strategy is unified.

## Rollout Strategy & Flags
- Incremental rollout to production; experimental features hidden behind flags and/or Netlify Experiments control.
- Shortlist: Netlify Experiments for variants; Amplitude + GA for measurement (verify plan limits).
- Rollback criteria: crashes post-deploy, LCP > 4s sustained, key-task failure signals in analytics; manual kill switch per feature flag.

## Backend Readiness & References
- Backend Swagger: https://ezlift-server-production.fly.dev/documentation
- Pass user token on every request via `x-jwt-token` header
- Client-side aggregation used for dashboard stats (no new backend endpoints required)
- Changes table integration confirmed working via existing migration (Option A)

## Epic and Story Structure

> Based on the current system and MVP focus, a single epic for the secure web app MVP is appropriate. It groups the dashboard, history, profile basics, import entry, program builder, onboarding, and analytics/flags into coherent, low‑risk increments.

**Epic Structure Decision**: Single epic with staged stories (foundation → dashboard → features), rationale: minimizes regression risk, enables incremental release behind flags, aligns with reuse of existing APIs.

### Epic 1: Secure Web App MVP

**Epic Goal**: Replace post-login placeholder with dashboard-first MVP, analytics instrumentation, program builder for new users, and core supporting views.

**Integration Requirements**: 
- Reuse existing backend endpoints (routine, workout, logs, user)
- Maintain session cookie authentication
- Client-side data aggregation for stats
- Analytics/flags must not impact auth flow or performance
- User data state detection must gate program editing

**MVP Scope Phase 1** (11 weeks):
- Dashboard with 5 cards (client-side aggregation)
- Workout history with pagination and filtering
- CSV import (Hevy format, client-side parsing)
- Profile management (units, bodyweight)
- Program builder (new users only, full CRUD)
- Program viewer (existing users, read-only)
- Onboarding (9 steps for new users, 6 for existing)
- Analytics (Amplitude + GA4, 50+ events)

**Phase 2 Scope** (Post-MVP, 4 weeks):
- WatermelonDB integration (IndexedDB on web)
- Sync via `push-changes`/`pull-changes` (like mobile)
- Remove new user constraint (all users can edit)
- Offline support
- Perfect mobile/web synchronization

---

#### Story 1.1: Foundation - Auth Layout & Navigation

**As a logged-in user,**  
**I want to land on an authenticated web app with navigation,**  
**So that I have access to all web app features.**

**Acceptance Criteria**:
1. Authenticated layout created with sidebar or top navigation
2. Navigation items: Dashboard, History, Programs, Import, Profile
3. Logout functionality works and clears session cookies
4. Mobile responsive (sidebar collapses to hamburger menu)
5. Active route highlighted in navigation
6. User avatar and name displayed
7. Middleware protection verified (redirects work correctly)

**Integration Verification**:
- IV1: Existing auth flow unchanged (Firebase → session cookies)
- IV2: Public website routes unaffected
- IV3: Route protection works for all new protected routes

---

#### Story 1.2: User Data State Detection

**As the system,**  
**I want to detect whether a user has existing data,**  
**So that I can gate program editing features appropriately.**

**Acceptance Criteria**:
1. On login/dashboard load, query: `GET /api/workout?limit=1` + `GET /api/logs?limit=1`
2. Classify user as "new" (no data) or "existing" (has data)
3. Cache user state in React Query (10-minute stale time)
4. Expose state via `useUserDataState()` hook
5. Default to "existing" (read-only) if detection fails (fail-safe)
6. Fire analytics event: "User Data State Detected" (state: 'new' | 'existing')

**Integration Verification**:
- IV1: Detection query doesn't impact page load performance (parallel fetch)
- IV2: State cached properly (doesn't re-query on every render)
- IV3: Fail-safe works (errors default to read-only mode)

---

#### Story 1.3: Dashboard Shell & Date Range Filter

**As a user,**  
**I want to see a dashboard shell with a global date range filter,**  
**So that I can control the time period for all analytics cards.**

**Acceptance Criteria**:
1. Dashboard grid layout (2x2 for top 4 cards, full-width for program card)
2. Mobile: Cards stack vertically
3. Date range filter at top: "Last 7 Days", "Last 30 Days", "Last 90 Days", "All Time"
4. Filter state stored in URL query param (`?range=30days`)
5. Filter change updates all cards simultaneously
6. Skeleton loaders while data fetches
7. Analytics: "Dashboard Viewed" (hasData: boolean), "Dashboard Filter Changed" (value: string)

**Integration Verification**:
- IV1: Responsive layout works on mobile/tablet/desktop
- IV2: URL state persists across page reloads
- IV3: Filter change doesn't cause layout shift (CLS = 0)

---

#### Story 1.4: Training Volume Card (Client-Side Aggregation)

**As a user,**  
**I want to see my weekly training volume as a bar chart,**  
**So that I can track consistency and effort over time.**

**Acceptance Criteria**:
1. Fetch sessions: `GET /api/logs?startDate={date}&endDate={date}`
2. Client-side aggregation: Group sessions by week (startOfWeek), sum sets and volume
3. Bar chart display (Recharts) with weeks on X-axis, sets/volume on Y-axis
4. Current week highlighted differently than past weeks
5. Stats below chart: "45 sets this week", "12,500 kg total", "↑ +15% vs last week"
6. Click card → Expand to detailed view (future story)
7. Empty state: "Track your first workout to see progress" with CTA "Download Mobile App"
8. Analytics: "Dashboard Card Viewed" (cardType: 'volume', hasData: boolean)

**Integration Verification**:
- IV1: Aggregation completes in < 100ms for 30 days of data
- IV2: Chart renders without blocking UI (< 200ms)
- IV3: Mobile responsive (chart scales down appropriately)

---

#### Story 1.5: Personal Records Card

**As a user,**  
**I want to see my top personal records,**  
**So that I can celebrate achievements and track strength gains.**

**Acceptance Criteria**:
1. Fetch recent sessions: `GET /api/logs` (last 30-90 days based on date filter)
2. Client-side computation: Find max weight × reps (volume) per exercise
3. Sort by volume descending
4. Display top 5 PRs: Exercise name, weight, reps, date ("2 days ago")
5. 🔥 Icon for very recent PRs (within 7 days)
6. Empty state: "Your personal records will appear here"
7. Analytics: "Dashboard Card Viewed" (cardType: 'prs', hasData: boolean)

**Integration Verification**:
- IV1: PR calculation correct (verified against sample data)
- IV2: Renders quickly even with 100+ sessions (< 50ms computation)

---

#### Story 1.6: Recent Workouts Card

**As a user,**  
**I want to see my last 3-5 workouts,**  
**So that I can quickly recall recent training sessions.**

**Acceptance Criteria**:
1. Fetch: `GET /api/logs?limit=5&sort=desc`
2. Display: Date, workout title, duration, exercise count
3. Relative dates: "Today", "Yesterday", "2 days ago", or date for older
4. Click workout → Open detail modal (future story: modal implementation)
5. Empty state: "No workouts yet. Download mobile app to track."
6. Analytics: "Dashboard Card Viewed" (cardType: 'recent'), "Dashboard Card Clicked" (action: 'view_detail')

**Integration Verification**:
- IV1: Sessions sorted correctly (most recent first)
- IV2: Relative dates update reactively (if dashboard left open)

---

#### Story 1.7: Progress Over Time Card

**As a user,**  
**I want to see progress for a specific exercise over time,**  
**So that I can track strength improvements.**

**Acceptance Criteria**:
1. Exercise selector dropdown (populated from user's exercise history)
2. Fetch sessions for selected exercise: `GET /api/logs` (filter client-side)
3. Client-side computation: Estimated 1RM per session (Epley formula: `weight × (1 + reps/30)`)
4. Line chart (Recharts): Date on X-axis, est 1RM on Y-axis
5. Data points clickable to show workout detail
6. Stats: Starting point, current, change ("+10 kg, +11.8%")
7. Time range selector: 4 weeks, 12 weeks, 6 months, 1 year
8. Empty state: "Select an exercise to track progress"
9. Analytics: "Dashboard Card Viewed" (cardType: 'progress'), Exercise selector change tracked

**Integration Verification**:
- IV1: 1RM calculation accurate (test with known data)
- IV2: Chart renders smoothly with 50+ data points
- IV3: Exercise selector populated correctly

---

#### Story 1.8: Active Program Card

**As a user,**  
**I want to see my active program summary,**  
**So that I know what workout is next.**

**Acceptance Criteria**:
1. Fetch: `GET /api/routine` (find default or most recently used)
2. Display: Program name, week progress (if tracked), next workout name
3. Actions:
   - "View Program" → Navigate to program detail page
   - "Edit Program" → New users: Open editor; Existing users: Show "Use mobile app" message
4. Empty state (new users): "Create your first program to get started" with CTA
5. Empty state (existing users): "Your programs from mobile will appear here"
6. Analytics: "Dashboard Card Viewed" (cardType: 'program')

**Integration Verification**:
- IV1: Correctly identifies default or active routine
- IV2: Edit button behavior respects user data state
- IV3: Empty state varies by user type

---

#### Story 1.9: Workout History Page

**As a user,**  
**I want to browse my past workouts with pagination and filtering,**  
**So that I can review training history.**

**Acceptance Criteria**:
1. List view: `GET /api/logs` with pagination (20 per page)
2. Each item shows: Date, workout title, duration, exercises (count), sets (count)
3. Date range filter (last 7 days, 30 days, 90 days, all time)
4. Pagination controls (previous, next, page numbers)
5. Click workout → Open detail modal
6. Empty state: "No workouts yet" with CTAs "Import History" or "Download Mobile App"
7. Skeleton loading state while fetching
8. URL state: `?page=2&range=30days`
9. Analytics: "History Viewed" (workoutCount: number), "History Filtered", "History Paginated"

**Integration Verification**:
- IV1: Pagination works correctly (total count, page calculations)
- IV2: Filters update URL without full page reload
- IV3: Works with large datasets (100+ sessions)

---

#### Story 1.10: CSV Import Flow

**As a user with prior training history,**  
**I want to import my workouts from Hevy or Strong,**  
**So that I have complete historical data in EzLift.**

**Acceptance Criteria**:
1. Upload CSV file (Hevy or Strong format)
2. Parse CSV client-side (PapaParse library)
3. Fuzzy match exercise names with exercise library (MiniSearch, 0.2 fuzzy threshold)
4. Show import summary:
   - X workouts found, Y exercises, Z total sets
   - N unmapped exercises (with names listed)
   - User can review and confirm
5. On confirm: Batch create sessions via `POST /api/logs`
6. Progress bar: "Importing X of Y workouts"
7. Handle errors gracefully (continue with remaining workouts if one fails)
8. Success screen: Summary with CTAs "View Dashboard" or "View History"
9. Imported sessions flagged: `isImported: true`, `importedAt: timestamp`
10. Analytics: Full import funnel (uploaded, parsed, confirmed, progress, completed/failed)

**Integration Verification**:
- IV1: Hevy CSV format parsed correctly (test with sample file)
- IV2: Exercise fuzzy matching >90% success rate
- IV3: Batch import handles failures gracefully
- IV4: Dashboard automatically refreshes after import (React Query invalidation)

---

#### Story 1.11: Program Builder (New Users Only)

**As a new user,**  
**I want to create workout programs using a visual builder,**  
**So that I can plan my training routines on a large screen.**

**Acceptance Criteria**:
1. **Access Control**: Only accessible if user data state = "new"
2. **Existing users**: Show read-only message with CTAs "View Programs" or "Download Mobile App"
3. **Builder Features**:
   - 4-column exercise grid (reuses ExerciseCard from public site)
   - Debounced search (reuses DebouncedSearchInput, 250ms desktop, 350ms mobile)
   - Muscle group filters (reuses ExerciseFilters)
   - Click exercise → Add to current workout
   - Configure sets per exercise (reps, weight, rest time)
   - Drag-and-drop reordering
   - Real-time metrics panel (muscles covered, estimated duration, exercise variety)
4. **Flow Navigation**: Workout 1 → Workout 2 → Workout 3 → Overview → Save
5. **Save**: `POST /api/routine` → `POST /api/workout` × N
6. **Backend writes to Changes table** (confirmed working via migration)
7. **Success**: Redirect to dashboard with program card populated
8. **Analytics**: Full funnel (opened, exercise added, program saved, time to complete)

**Integration Verification**:
- IV1: User data state check prevents existing users from accessing
- IV2: Programs created on web appear on mobile after first sync
- IV3: Exercise search/filter performance matches public library
- IV4: Drag-and-drop works on desktop, touch reorder on mobile

---

#### Story 1.12: Profile Management

**As a user,**  
**I want to view and edit my profile settings,**  
**So that my units and measurements are correct.**

**Acceptance Criteria**:
1. Display: Name, email (read-only), units, bodyweight
2. Editable fields: Weight unit (kg/lbs), distance unit (km/mi), height unit (cm/in), bodyweight
3. Save button: `PATCH /api/user` with optimistic update
4. Success toast: "Profile updated!"
5. Error handling: Rollback optimistic update, show error toast
6. Changes reflect immediately in dashboard (volume calculations use correct units)
7. Analytics: "Profile Viewed", "Profile Updated" (fields: string[])

**Integration Verification**:
- IV1: Optimistic update provides instant feedback
- IV2: Rollback works on error (UI reverts to previous values)
- IV3: Unit changes affect dashboard calculations correctly

---

#### Story 1.13: Onboarding Flow with User State Branching

**As a new or existing user,**  
**I want to complete an onboarding flow tailored to my data state,**  
**So that I can set up my web app experience appropriately.**

**Acceptance Criteria**:
1. **Steps 1-6** (All users):
   - Personal Info, Frequency, Duration, Experience, Goals, Equipment
   - Each answer tracked via Amplitude event
   - Progress bar shows "X of 9" (new users) or "X of 6" (existing users)
   - Skip button available on every step
2. **After Step 6**: Check user data state
3. **Existing users**:
   - Show transition: "Welcome back! Your programs from mobile are ready."
   - Redirect to dashboard
   - Analytics: "Onboarding Completed" (userState: 'existing', completedSteps: 6)
4. **New users**:
   - Continue to Step 7 (Program Setup)
   - Steps 7-9: Choose program path (describe, build, select recommended)
   - Analytics: "Onboarding Completed" (userState: 'new', completedSteps: 9, programSetup: string)
5. **Onboarding answers NOT persisted to backend** (Amplitude events only)

**Integration Verification**:
- IV1: User state branching works correctly (existing users skip to dashboard)
- IV2: All analytics events fire correctly
- IV3: Skip functionality works at any step

---

## Phase 2: WatermelonDB Migration (Post-MVP)

### Overview

**Timeline**: 4 weeks after Phase 1 MVP complete

**Goal**: Enable full program editing for all users with perfect mobile/web synchronization

### What Changes in Phase 2

**Removes MVP Constraints**:
- ✅ **All users can edit programs on web** (not just new users)
- ✅ **Perfect mobile/web sync** (Changes table updated from web)
- ✅ **Offline support** (IndexedDB persistence)
- ✅ **Faster dashboard** (local queries vs network)
- ✅ **Consistent architecture** (same as mobile)

**Technical Implementation**:
- **WatermelonDB** installed on web (IndexedDB adapter)
- **Schema** matches mobile app v83 (14+ tables)
- **Sync Adapter** uses existing backend endpoints:
  - `POST /api/sync/push-changes` - Web → Backend
  - `GET /api/sync/pull-changes` - Backend → Web
- **Migration Path**: Feature flag enables gradual cutover from React Query → WatermelonDB

### Migration Trigger

**When to Migrate**:
1. Existing users demand program editing on web
2. User data volume makes client-side aggregation slow (> 500 sessions)
3. Offline support becomes priority feature
4. Backend team prioritizes web sync integration

### Benefits of Phase 2

**For Users**:
- Edit programs on any device (web or mobile)
- Instant synchronization (changes appear immediately)
- Offline access to workout data
- Faster dashboard loading (local queries)

**For Product**:
- No feature access restrictions (all users equal)
- Simpler user messaging (no "use mobile to edit" messages)
- Competitive parity with Hevy (full web editing)
- Foundation for future web-first features

### Technical Stack Additions

**New Dependencies** (Phase 2):
- `@nozbe/watermelondb` - Local-first database
- `@babel/plugin-proposal-decorators` - For WatermelonDB models
- IndexedDB polyfills (if needed for older browsers)

**Architecture Changes**:
- Local database initialization on app load
- Background sync every 60 seconds + on visibility change
- Conflict resolution strategy (server wins for MVP)
- Database migration strategy (schema versioning)

### Success Criteria

**Phase 2 Complete When**:
- ✅ All users can create/edit/delete programs on web
- ✅ Web → Mobile sync works (programs created on web appear on mobile)
- ✅ Mobile → Web sync works (workouts tracked on mobile appear on web)
- ✅ No data loss during migration (existing React Query data migrated to WatermelonDB)
- ✅ Performance acceptable (dashboard LCP still < 2.0s)
- ✅ Offline mode works (can view data without internet)

---

## Technology Stack Summary

### Frontend Core (Existing)
- **Next.js**: 15.1.2 (App Router, React Server Components)
- **React**: 18.2.0
- **TypeScript**: 5.2.2
- **Tailwind CSS**: 3.3.3
- **shadcn/ui + Radix**: Component primitives (40+ components)
- **Framer Motion**: 11.0.8 (animations)
- **Lucide React**: 0.446.0 (icons)

### New Dependencies (Phase 1 MVP)
- **@tanstack/react-query**: ^5.x (server state management, caching, optimistic updates)
- **papaparse**: ^5.4.1 (CSV parsing for imports)
- **minisearch**: ^7.x (fuzzy exercise name matching)
- **@amplitude/analytics-browser**: ^2.x (user behavior tracking)
- **recharts**: 2.12.7 (bar charts, line charts - already installed)
- **date-fns**: 3.6.0 (date utilities - already installed)
- **react-hook-form**: 7.53.0 (form handling - already installed)
- **zod**: 3.24.1 (schema validation - already installed)

### Phase 2 Additions (Future)
- **@nozbe/watermelondb**: Latest (local-first database, IndexedDB adapter)
- **@babel/plugin-proposal-decorators**: For WatermelonDB model decorators
- **react-window**: ^1.x (virtual scrolling for large lists - performance optimization)

### Backend Integration
- **Base URL**: https://ezlift-server-production.fly.dev
- **Auth**: Firebase ID tokens via `x-jwt-token` header
- **Endpoints**: REST APIs for routines, workouts, logs, user (Phase 1)
- **Sync**: `push-changes`/`pull-changes` endpoints (Phase 2)
- **Changes Table**: Backend writes for mobile sync compatibility (Option A confirmed)

### External Services
- **Firebase**: Authentication (Google, Apple, Email/Password)
- **PostgreSQL**: Exercise library (read-only, direct connection)
- **Contentful**: Blog and exercise instructional content (CMS, read-only)
- **AWS S3**: Exercise images and videos (signed URLs, 1-hour expiration)
- **Google Analytics**: GA4 for web analytics and traffic sources
- **Amplitude**: User behavior tracking, product analytics, conversion funnels
- **Netlify**: Hosting, SSR/ISR, CDN, deployment automation, environment variables

### Component Reuse (From Public Website)

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

---

## Success Metrics

### User Activation (First Week)
- Complete at least one of: [import history, view 3+ workouts, configure profile, create program]
- Import completion rate for eligible users ≥ 60%
- Onboarding completion rate ≥ 70% (skippable steps)
- Program builder completion rate (new users) ≥ 50%

### Performance
- LCP < 2.0s (p75) on dashboard
- INP < 200ms (p75)
- Error rate < 1%
- Client-side aggregation < 100ms for typical datasets

### Conversion & Engagement
- Improve landing → signup conversion via A/B testing (+15-30% vs baseline)
- Dashboard weekly active users (WAU) growth
- Feature adoption: % of new users who create programs vs select recommended

### User State Distribution
- % new users vs existing users on web
- % of new users who complete program creation
- % of existing users who attempt editing (see read-only message)
- Understanding: User satisfaction with read-only explanation

### Analytics & Experimentation
- Event tracking reliability >95% (events fire successfully)
- A/B test variant distribution accuracy (50/50 splits maintained)
- Analytics overhead impact on performance (< 50ms added to LCP)

---

## Reference Documentation

**UX Design**:
- `docs/ux-design-brief.md` - Complete design brief with competitive analysis
- `docs/web-app-user-flows.md` - Detailed user flows (new vs existing users)
- `docs/wireframes.md` - Comprehensive wireframes (30+ screens)

**Architecture**:
- `docs/architecture/brownfield-public-website.md` - Existing public website architecture
- `docs/architecture/fullstack-web-app.md` - Complete MVP + Phase 2 architecture
- `docs/architecture/MVP-CRITICAL-DECISION-REQUIRED.md` - Option A decision confirmation

**Backend**:
- Backend API: https://ezlift-server-production.fly.dev/documentation
- Swagger docs available for all endpoints

---

## Open Questions & Next Steps

### Open Questions
- ✅ **RESOLVED**: Backend Changes table writes (Option A confirmed)
- ✅ **RESOLVED**: User data state approach (new vs existing)
- ✅ **RESOLVED**: Client-side vs server-side aggregation (client-side for MVP)
- ⏳ Voice-to-text API for program description (GPT API or alternative?)
- ⏳ Netlify Experiments vs other A/B tool selection
- ⏳ Amplitude pricing tier verification (event volume limits)

### Next Steps

**Immediate**:
1. ✅ PRD refinement complete (v0.2)
2. ⏭️ **Shard PRD** into `docs/prd/` folder for easier navigation
3. ⏭️ **Shard Architecture** into `docs/architecture/web-app/` folder
4. ⏭️ **Story Creation**: Scrum Master creates detailed story files from Epic 1

**Pre-Development**:
5. Backend team formalizes Changes table writes in REST endpoints
6. Install new dependencies (React Query, PapaParse, MiniSearch, Amplitude)
7. Set up Amplitude account and API keys

**Development** (11 weeks):
- Weeks 1-2: Foundation (layout, navigation, user data state detection)
- Weeks 3-4: Dashboard cards (all 5 cards with client-side aggregation)
- Week 5: History page and profile management
- Week 6: CSV import flow
- Weeks 7-8: Program builder (new users only)
- Weeks 9-10: Onboarding (9-step flow with branching)
- Week 11: Analytics integration and polish

**Post-MVP**:
- Phase 2: WatermelonDB migration (4 weeks)
- Backend optimization: Aggregation endpoints
- Feature enhancements based on user feedback and analytics

---

**PRD Status**: ✅ v0.2 Complete - Ready for Sharding & Story Creation
**Last Updated**: 2025-01-10
**Next Action**: Shard PRD for story development
