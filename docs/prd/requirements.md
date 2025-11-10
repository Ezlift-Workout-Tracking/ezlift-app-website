# Requirements

## Functional (FR)

**FR1: Dashboard with P0 Cards and Data State Awareness**

Post-login lands on Dashboard with P0 cards: Training Volume (per week), Top PRs/Personal Bests, Recent Workouts, Progress over time (estimated 1RM), Active Program/Routine Summary.

- **Data Source**: All cards query backend REST APIs (`GET /workout-log` (all sessions, no filtering), `GET /api/routine`)
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
  - User confirms import → Batch create sessions via `POST /workout-log` (one-by-one)
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
  - On web app login, query backend: `GET /api/workout?limit=1` + `GET /workout-log` (all sessions)
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
- **Onboarding for Existing Users**:
  - **None** - Existing users skip ALL onboarding steps
  - After login → Direct to dashboard (no questions, no transition screens)
  - Rationale: Already onboarded on mobile app; repeating creates friction
- **Branching Logic**: After login/signup, check user data state. If existing: direct to dashboard. If new: start onboarding Step 1.
- **Analytics**: Track each step completion (new users only); "Onboarding Completed" (userState: 'new', completedSteps: 9); Existing users tracked via "User Data State Detected" (state: 'existing', redirectTo: 'dashboard_direct') only
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
  5. Create session records via `POST /workout-log` (one-by-one)
- **Error Handling**: Continue with remaining workouts if individual creates fail
- **Performance**: Import progress shown for large files (100+ workouts)

## Non-Functional (NFR)

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

## Compatibility Requirements (CR)

**CR1: Public Website & Mobile Sync Compatibility**

Existing public website behavior remains unaffected in this PRD iteration; website A/B testing will be handled in a separate workstream.

- **Mobile Sync Compatibility**:
  - Backend REST endpoints (`POST /api/routine`, `POST /api/workout`, etc.) write to Changes table
  - Ensures mobile app receives web-created programs on first sync (`pull-changes` with `lastPulledAt=0`)
  - New users can create programs on web; mobile syncs down on first login
  - Existing users blocked from program editing on web (prevents sync conflicts until Phase 2)
  - Import flow (CSV) creates workout sessions via `POST /workout-log` (one-by-one, also writes to Changes table)
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
  - `POST /workout-log` - Create workout session (for imports, one-by-one)
- Pattern matches existing `/verify` endpoint behavior
- Ensures new users' web-created programs sync to mobile on first login

