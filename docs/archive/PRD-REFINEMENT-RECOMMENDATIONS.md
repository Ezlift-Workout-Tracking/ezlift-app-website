# PRD Refinement Recommendations from Architecture

**Date**: 2025-01-10  
**From**: Winston (Architect)  
**To**: PM Agent  
**Re**: EzLift Web App MVP - PRD Updates Based on Architecture

---

## Executive Summary

After completing comprehensive architecture design for the EzLift web app, I've identified **critical updates** needed in the PRD to align requirements with technical reality and MVP scope. This document provides specific recommendations for PRD sections that need refinement.

**Status**: Option A confirmed (backend will modify REST endpoints to write to Changes table)

---

## 🔴 CRITICAL PRD Updates Required

### 1. **New Section Needed: User Data State & Feature Access**

**Why**: MVP has a critical constraint that determines which users can create/edit programs

**Add to PRD** (new section before or after Requirements):

```markdown
## User Data State & Feature Access (MVP Constraint)

### User Classification

The web app MVP classifies users into two states to ensure mobile/web data synchronization:

**New Users** (No existing data):
- Definition: User has zero workouts, zero programs, zero sessions
- Detection: Query backend on login for existing data
- Feature Access: Full program creation and editing capabilities

**Existing Users** (Have mobile app data):
- Definition: User has workouts/programs/sessions from mobile app
- Detection: API returns results for GET /api/workout or GET /api/logs
- Feature Access: Read-only program viewing, full dashboard/history/import

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
- Mobile app uses WatermelonDB sync (push-changes/pull-changes endpoints)
- Web app MVP uses direct REST APIs (POST /api/routine, etc.)
- Backend REST endpoints write to Changes table (confirmed working for new users)
- Existing users' mobile data tracked via Changes table
- Preventing existing users from editing on web avoids any potential sync edge cases

**User Experience**:
- **New users**: Create programs on web → Mobile syncs down on first login → Perfectly in sync
- **Existing users**: See message: "Full program editing coming soon. Use mobile app to edit programs."

**Phase 2 Removes This Constraint**: 
When web app migrates to WatermelonDB (Phase 2), all users will have full editing capabilities on both web and mobile with perfect synchronization.
```

---

### 2. **Update FR1 (Dashboard) - Add Data State Awareness**

**Current**:
> FR1: Post-login lands on Dashboard with P0 cards: Training Volume, Top PRs, Recent Workouts, Progress over time, Active Program Summary.

**Recommended Change**:
```markdown
FR1: Post-login lands on Dashboard with P0 cards: Training Volume (per week), Top PRs/Personal Bests, Recent Workouts, Progress over time (estimated 1RM), Active Program/Routine Summary.

**Data Source**: All cards query backend REST APIs (GET /api/logs, GET /api/routine)

**Aggregation**: Stats computed client-side (weekly volume, max weights, est 1RM calculations)

**User State Handling**:
- New users: Dashboard renders with empty states and CTAs ("Create Program", "Import History")
- Existing users: Dashboard populated with mobile-tracked data (sessions synced via backend)
- Global date range filter affects all cards simultaneously (7 days, 30 days, 90 days, all time)

**Performance**: Dashboard must load with LCP < 2.0s (p75) even with client-side aggregations
```

---

### 3. **Update FR4 (Import) - Add Technical Implementation Details**

**Current**:
> FR4: Import entry accepts Hevy/Strong CSV and shows confirmation that a job started (backend processing may be asynchronous).

**Recommended Change**:
```markdown
FR4: Import flow accepts Hevy/Strong CSV with client-side parsing and batch session creation

**Implementation**:
- CSV file uploaded in browser (no server upload)
- PapaParse library parses CSV client-side
- MiniSearch fuzzy matches exercise names against exercise library
- Display import summary (X workouts, Y exercises, Z sets found, N unmapped)
- User confirms import → Batch create sessions via POST /api/logs (one-by-one or bulk if available)
- Progress bar shows "Importing X of Y workouts"
- Success screen shows summary and redirects to dashboard or history

**Supported Formats**:
- Hevy CSV (18 columns: title, start_time, end_time, exercise_title, set_index, weight_kg, reps, etc.)
- Strong CSV (future, similar format)

**Error Handling**:
- Invalid CSV format → Show error, allow retry
- Unmapped exercises (no fuzzy match) → Import as custom exercises or skip
- Partial import failures → Show success count + failed count

**Post-Import**:
- Imported sessions flagged with isImported: true, importedAt: timestamp
- Dashboard cards automatically refresh (React Query cache invalidation)
- Analytics event: "Import Completed" with metrics
```

---

### 4. **Update FR6 (Analytics) - Add Amplitude Integration**

**Current**:
> FR6: Google Analytics instrumentation integrated across the web app

**Recommended Change**:
```markdown
FR6: Dual analytics integration (Google Analytics 4 + Amplitude) with comprehensive event taxonomy

**Providers**:
- **Google Analytics 4** (GA4): General web analytics, traffic sources, page views
- **Amplitude**: Detailed user behavior tracking, product analytics, conversion funnels

**Implementation**:
- Unified analytics interface (single function calls both providers)
- Cookie consent governs analytics activation
- No PII in events (user IDs hashed, no emails/names)

**Event Categories** (50+ total events):
1. Authentication: Signup, login, logout (with method tracking)
2. Onboarding: Each step completion, question answers, skip actions
3. Dashboard: Page views, card views, card clicks, filter changes
4. Program Builder: Exercise added/removed, sets configured, program saved
5. Import: CSV uploaded, parsed, imported, errors
6. History: Page viewed, filtered, paginated, workout detail viewed
7. Profile: Viewed, updated (track which fields changed)

**Analytics Library**:
- @amplitude/analytics-browser (v2.x)
- Defer script loading (async, after page interactive)
- Batch events (reduce network requests)
- Session tracking enabled

**Privacy**:
- IP anonymization where applicable
- Cookie consent required before tracking
- GDPR-compliant event data
```

---

### 5. **New FR: User Data State Detection**

**Add as FR10**:
```markdown
FR10: User data state detection determines feature access for program creation/editing

**Implementation**:
- On web app login, query backend: GET /api/workout?limit=1 + GET /api/logs?limit=1
- If any results returned → User state: "existing"
- If no results → User state: "new"
- Cache state for session (recheck every 10 minutes or on specific actions)

**Feature Gating**:
- New users: Show Program Builder with full create/edit/delete capabilities
- Existing users: Show Program Viewer (read-only) with message:
  - "Full program editing on web coming soon"
  - "For now, create and edit programs on the mobile app"
  - CTAs: "View My Programs", "Download Mobile App"

**Fail-Safe**:
- If data state check errors → Default to "existing" (read-only mode)
- Prevents potential sync conflicts

**Analytics**:
- Track user state on dashboard load: "User Data State Detected" (state: 'new' | 'existing')
- Track Program Builder access attempts by existing users: "Program Builder Blocked" (reason: 'existing_user')
```

---

### 6. **New FR: Onboarding Flow Branching**

**Add as FR11**:
```markdown
FR11: Onboarding flow adapts based on user data state (new vs existing)

**Onboarding Steps for New Users** (9 total):
1. Personal Info (gender, age range)
2. Training Frequency (1-2, 3-4, 5-6, 7+ days/week)
3. Training Duration (30min or less, 30-45, 45-60, 60+)
4. Experience Level (beginner, intermediate, advanced, expert)
5. Goals (multi-select: muscle, strength, weight loss, endurance, etc.)
6. Equipment Available (multi-select: free weights, machines, bands, bodyweight, etc.)
7. Program Setup (Do you have a program? Yes/No/Skip)
8-9. Program Configuration (varies by Step 7 choice)

**Onboarding Steps for Existing Users** (6 only):
1-6. Same as above (collect preferences for future features)
7. Skip to Dashboard (show transition: "Your programs from mobile are ready")

**Branching Logic**:
- After Step 6, check user data state
- If existing: Show "Welcome back" message → Redirect to dashboard
- If new: Continue to Step 7 (Program Setup)

**Analytics**:
- Track each step completion with user state
- Track onboarding completion differently for new vs existing
- Event: "Onboarding Completed" (userState: 'new' | 'existing', completedSteps: 6 | 9)

**Note**: Onboarding question answers (Steps 1-6) are NOT persisted to backend in MVP. They are tracked via Amplitude events only for product insights. Backend storage for these preferences will be added post-MVP.
```

---

### 7. **Update NFR1 (Performance) - Add Client-Side Computation Impact**

**Current**:
> NFR1: Performance budgets hold on dashboard (LCP < 2.0s p75, INP < 200ms p75) with analytics enabled

**Recommended Change**:
```markdown
NFR1: Performance budgets maintained despite client-side aggregations and analytics overhead

**Targets**:
- Dashboard LCP: < 2.0s (p75) - Includes SSR + client-side stat computations
- Dashboard INP: < 200ms (p75) - Includes chart rendering
- History LCP: < 2.5s (p75)
- Program Builder LCP: < 3.0s (p75) - More complex UI acceptable

**Client-Side Computation Performance**:
- Weekly volume aggregation: < 100ms for 30 days of data
- Personal records calculation: < 50ms for 100 sessions
- Progress chart data prep: < 100ms per exercise
- All aggregations cached in React Query (5-minute stale time)

**Mitigation Strategies**:
- Fetch limited date ranges (default: 30 days, user can expand)
- Lazy load chart libraries (Recharts loaded on-demand)
- Code split heavy components (Program Builder, Import Flow)
- Defer analytics script loading (async, after page interactive)
- Use useMemo for expensive aggregations

**Performance Testing**:
- Test with realistic data volumes (100 sessions, 500 sets)
- Test on low-end devices (throttled CPU in DevTools)
- Monitor Core Web Vitals in production (Netlify Analytics)
```

---

### 8. **New NFR: Client-Side Computation Limits**

**Add as NFR6**:
```markdown
NFR6: Client-side aggregations remain performant within reasonable data volume limits

**Data Volume Assumptions**:
- Typical user: 50-100 workout sessions per year
- Active user: 200-300 sessions per year
- Power user: 500+ sessions per year

**Performance Thresholds**:
- < 100 sessions: Client-side aggregation always acceptable (< 100ms)
- 100-500 sessions: Acceptable with date range limits (< 200ms)
- > 500 sessions: May need server-side aggregation (Phase 2 or backend optimization)

**Mitigation for Large Datasets**:
- Default date range: 30 days (limits query result size)
- Lazy loading: "Load older data" button for historical analysis
- Virtual scrolling: Use react-window for lists > 50 items
- Pagination: 20 sessions per page in history view

**Future Optimization** (Post-MVP):
- Backend can add aggregation endpoints (GET /api/stats/weekly-volume)
- Pre-computed stats tables in PostgreSQL
- Materialized views for complex queries
- Caching layer (Redis) for frequent aggregations
```

---

### 9. **Update CR1 (Compatibility) - Add Mobile Sync Detail**

**Current**:
> CR1: Existing public website behavior remains unaffected in this PRD iteration

**Recommended Addition** (append to CR1):
```markdown
CR1: Existing public website behavior remains unaffected in this PRD iteration; website A/B testing will be handled in a separate workstream.

**NEW - Mobile Sync Compatibility**:
- Backend REST endpoints (POST /api/routine, POST /api/workout, etc.) write to Changes table
- Ensures mobile app receives web-created programs on first sync (pull-changes with lastPulledAt=0)
- New users can create programs on web; mobile syncs down on first login
- Existing users blocked from program editing on web (prevents sync conflicts until Phase 2)
- Import flow (CSV) creates workout sessions via POST /api/logs (also writes to Changes table if endpoint modified)

**Backward Compatibility**:
- Mobile apps continue using WatermelonDB sync pattern (no changes)
- Backend maintains existing sync endpoints (push-changes, pull-changes)
- Web app's REST API usage doesn't interfere with mobile sync
```

---

### 10. **Update Epic 1: Secure Web App MVP - Add Stories**

**Recommended Epic Structure** (expand current Epic 1):

```markdown
### Epic 1: Secure Web App MVP

**Epic Goal**: Replace post-login placeholder with dashboard-first MVP, analytics instrumentation, and program builder for new users.

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
- Sync via push-changes/pull-changes (like mobile)
- Remove new user constraint (all users can edit)
- Offline support
- Perfect mobile/web synchronization

#### Story 1.1: Foundation - Auth Layout & Navigation
As a logged-in user,
I want to land on an authenticated web app with navigation,
so that I have access to all web app features.

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
As the system,
I want to detect whether a user has existing data,
so that I can gate program editing features appropriately.

**Acceptance Criteria**:
1. On login/dashboard load, query: GET /api/workout?limit=1 + GET /api/logs?limit=1
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
As a user,
I want to see a dashboard shell with a global date range filter,
so that I can control the time period for all analytics cards.

**Acceptance Criteria**:
1. Dashboard grid layout (2x2 for top 4 cards, full-width for program card)
2. Mobile: Cards stack vertically
3. Date range filter at top: "Last 7 Days", "Last 30 Days", "Last 90 Days", "All Time"
4. Filter state stored in URL query param (?range=30days)
5. Filter change updates all cards simultaneously
6. Skeleton loaders while data fetches
7. Analytics: "Dashboard Viewed" (hasData: boolean), "Dashboard Filter Changed" (value: string)

**Integration Verification**:
- IV1: Responsive layout works on mobile/tablet/desktop
- IV2: URL state persists across page reloads
- IV3: Filter change doesn't cause layout shift (CLS = 0)

---

#### Story 1.4: Training Volume Card (Client-Side Aggregation)
As a user,
I want to see my weekly training volume as a bar chart,
so that I can track consistency and effort over time.

**Acceptance Criteria**:
1. Fetch sessions: GET /api/logs?startDate={date}&endDate={date}
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
As a user,
I want to see my top personal records,
so that I can celebrate achievements and track strength gains.

**Acceptance Criteria**:
1. Fetch recent sessions: GET /api/logs (last 30-90 days based on date filter)
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
As a user,
I want to see my last 3-5 workouts,
so that I can quickly recall recent training sessions.

**Acceptance Criteria**:
1. Fetch: GET /api/logs?limit=5&sort=desc
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
As a user,
I want to see progress for a specific exercise over time,
so that I can track strength improvements.

**Acceptance Criteria**:
1. Exercise selector dropdown (populated from user's exercise history)
2. Fetch sessions for selected exercise: GET /api/logs (filter client-side)
3. Client-side computation: Estimated 1RM per session (Epley formula: weight × (1 + reps/30))
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
As a user,
I want to see my active program summary,
so that I know what workout is next.

**Acceptance Criteria**:
1. Fetch: GET /api/routine (find default or most recently used)
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
As a user,
I want to browse my past workouts with pagination and filtering,
so that I can review training history.

**Acceptance Criteria**:
1. List view: GET /api/logs with pagination (20 per page)
2. Each item shows: Date, workout title, duration, exercises (count), sets (count)
3. Date range filter (last 7 days, 30 days, 90 days, all time)
4. Pagination controls (previous, next, page numbers)
5. Click workout → Open detail modal
6. Empty state: "No workouts yet" with CTAs "Import History" or "Download Mobile App"
7. Skeleton loading state while fetching
8. URL state: ?page=2&range=30days
9. Analytics: "History Viewed" (workoutCount: number), "History Filtered", "History Paginated"

**Integration Verification**:
- IV1: Pagination works correctly (total count, page calculations)
- IV2: Filters update URL without full page reload
- IV3: Works with large datasets (100+ sessions)

---

#### Story 1.10: CSV Import Flow
As a user with prior training history,
I want to import my workouts from Hevy or Strong,
so that I have complete historical data in EzLift.

**Acceptance Criteria**:
1. Upload CSV file (Hevy or Strong format)
2. Parse CSV client-side (PapaParse library)
3. Fuzzy match exercise names with exercise library (MiniSearch, 0.2 fuzzy threshold)
4. Show import summary:
   - X workouts found, Y exercises, Z total sets
   - N unmapped exercises (with names listed)
   - User can review and confirm
5. On confirm: Batch create sessions via POST /api/logs
6. Progress bar: "Importing X of Y workouts"
7. Handle errors gracefully (continue with remaining workouts if one fails)
8. Success screen: Summary with CTAs "View Dashboard" or "View History"
9. Imported sessions flagged: isImported: true, importedAt: timestamp
10. Analytics: Full import funnel (uploaded, parsed, confirmed, progress, completed/failed)

**Integration Verification**:
- IV1: Hevy CSV format parsed correctly (test with sample file)
- IV2: Exercise fuzzy matching >90% success rate
- IV3: Batch import handles failures gracefully
- IV4: Dashboard automatically refreshes after import (React Query invalidation)

---

#### Story 1.11: Program Builder (New Users Only)
As a new user,
I want to create workout programs using a visual builder,
so that I can plan my training routines on a large screen.

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
5. **Save**: POST /api/routine → POST /api/workout × N
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
As a user,
I want to view and edit my profile settings,
so that my units and measurements are correct.

**Acceptance Criteria**:
1. Display: Name, email (read-only), units, bodyweight
2. Editable fields: Weight unit (kg/lbs), distance unit (km/mi), height unit (cm/in), bodyweight
3. Save button: PATCH /api/user with optimistic update
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
As a new or existing user,
I want to complete an onboarding flow tailored to my data state,
so that I can set up my web app experience appropriately.

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

```

---

### 11. **New Section: Technical Constraints**

**Add before "Deployment and Operations" section**:

```markdown
## Technical Constraints (MVP)

### Backend Dependencies

**Existing Endpoints** (No modifications required for most features):
- ✅ GET /api/user - User profile
- ✅ PATCH /api/user - Update profile
- ✅ GET /api/workout - List workouts
- ✅ GET /api/routine - List routines
- ✅ GET /api/logs - List sessions

**Required Backend Behavior** (Confirmed working):
- ✅ POST /api/routine writes to Changes table (via migration)
- ✅ POST /api/workout writes to Changes table (via migration)
- ✅ PATCH/DELETE endpoints write to Changes table (via migration or future updates)

**Backend Endpoints NOT Used in MVP**:
- ❌ POST /api/sync/push-changes (Phase 2 only)
- ❌ GET /api/sync/pull-changes (Phase 2 only)

### Client-Side Computation Requirements

**Dashboard Stats** (All computed client-side):
1. Weekly/monthly training volume (sum sets, sum weight × reps)
2. Personal records (max weight × reps per exercise)
3. Progress trends (estimated 1RM using Epley formula)
4. Workout frequency (sessions per week)
5. Muscle group distribution (exercise counts by muscle group)

**Performance Assumption**: < 500 sessions per user (client-side aggregation remains fast)

**Post-MVP**: Backend can add aggregation endpoints for optimization

### Mobile App Synchronization (Phase 1)

**New Users**:
- Create programs on web via REST API
- Backend writes to Changes table (via existing migration)
- Mobile first login: pull-changes → Receives web-created programs
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
```

---

### 12. **Update Requirements Summary**

**Add to PRD** (summary section):

```markdown
## MVP Requirements Summary (Phase 1)

### Functional Requirements (Updated)
- FR1-FR5: *(existing)*
- FR6: Dual analytics (Amplitude + GA4) with 50+ events
- FR7: *(existing)*
- FR8: *(existing)*
- FR9: *(existing)*
- **FR10: User data state detection** (new vs existing users)
- **FR11: Onboarding flow branching** (6 steps for existing, 9 for new)
- **FR12: Program Builder gating** (new users: full access, existing: read-only)
- **FR13: Client-side data aggregation** (weekly volume, PRs, progress)
- **FR14: CSV import with client-side parsing** (PapaParse + MiniSearch fuzzy matching)

### Non-Functional Requirements (Updated)
- NFR1: Performance budgets (updated with client-side computation impact)
- NFR2-NFR5: *(existing)*
- **NFR6: Client-side aggregation performance** (< 100ms for typical datasets)
- **NFR7: Analytics overhead** (defer loading, minimal performance impact)

### Compatibility Requirements (Updated)
- CR1: Public website unaffected + mobile sync compatibility
- CR2-CR5: *(existing)*
- **CR6: Backend Changes table writes** (REST endpoints write to Changes for sync)
```

---

## 🎯 PRD Sections to Update

### **Must Update** (Critical):
1. ✅ Add "User Data State & Feature Access" section (before Requirements)
2. ✅ Update FR1 (Dashboard) - Add data state awareness
3. ✅ Update FR4 (Import) - Add technical implementation
4. ✅ Update FR6 (Analytics) - Add Amplitude integration
5. ✅ Add FR10: User data state detection
6. ✅ Add FR11: Onboarding branching
7. ✅ Add FR12: Program Builder gating
8. ✅ Add FR13: Client-side aggregation
9. ✅ Add FR14: CSV import parsing
10. ✅ Update NFR1 (Performance) - Add computation impact
11. ✅ Add NFR6: Aggregation performance
12. ✅ Update CR1 (Compatibility) - Add mobile sync detail
13. ✅ Add Technical Constraints section
14. ✅ Update Epic 1 with detailed stories (13 stories minimum)

### **Should Update** (Important):
1. ✅ Add Phase 2 scope summary (WatermelonDB migration)
2. ✅ Add backend improvement opportunities section
3. ✅ Update success criteria with user state metrics
4. ✅ Add analytics section with event taxonomy

### **Nice to Have**:
1. Add architecture reference links
2. Add technical diagrams (sync flows)
3. Add component diagram
4. Add API endpoint appendix

---

## 📐 Architecture Decisions Impact on PRD

### **New Concepts to Add**:
1. **User Data State** - new vs existing classification
2. **Client-Side Aggregation** - dashboard stats computed in browser
3. **CSV Parsing** - client-side with fuzzy matching
4. **Feature Gating** - conditional access based on user state
5. **Phase 1 vs Phase 2** - clear MVP vs future distinction

### **Clarifications Needed**:
1. **Onboarding questions NOT persisted** - Amplitude tracking only
2. **Backend REST endpoints write to Changes table** - Critical assumption
3. **No offline support in Phase 1** - Online-required for MVP
4. **Program Builder new users only** - Technical constraint, not product decision

### **Success Metrics to Add**:
1. **User state distribution**: % new users vs existing users on web
2. **Program Builder adoption**: % of new users who complete program creation
3. **Existing user understanding**: % who try to edit and see read-only message
4. **Phase 2 migration success**: % of users successfully migrated to WatermelonDB

---

## 🔄 Recommended PRD Refinement Process

### Step 1: PM Reviews Architecture Documents
- Read: `docs/architecture/fullstack-web-app.md` (main document)
- Read: `docs/architecture/MVP-CRITICAL-DECISION-REQUIRED.md` (decision confirmation)
- Read: This document (PRD-REFINEMENT-RECOMMENDATIONS.md)

### Step 2: PM Updates PRD
Use PM agent with these commands:
```
*doc-out  # Output current PRD for review
# Manually update sections based on this recommendations document
# Or use PM agent to guide section-by-section updates
```

### Step 3: Architect Reviews Updated PRD
- Verify technical constraints captured correctly
- Confirm no missing requirements
- Validate feasibility of stated NFRs

### Step 4: Shard PRD
```
*shard-prd  # Creates docs/prd/ folder with organized sections
```

### Step 5: Shard Architecture (After PRD finalized)
```
# As Architect
*shard-prd architecture.md  # Shard fullstack-web-app.md
# Creates docs/architecture/web-app/ with sections
```

### Step 6: Story Creation
Scrum Master agent creates stories from refined, sharded PRD + Architecture

---

## 📝 Summary for PM

**Dear PM Agent**,

The Architect (Winston) has completed comprehensive web app architecture. Based on this technical design, please update the PRD with:

**Critical Additions**:
1. User Data State concept (new vs existing users)
2. Program Builder access control (new users only for MVP)
3. Client-side aggregation strategy for dashboard stats
4. CSV import technical implementation
5. Amplitude + GA4 analytics integration
6. Onboarding flow branching (6 vs 9 steps)
7. Phase 2 scope (WatermelonDB migration)

**Requirements to Add**:
- FR10: User data state detection
- FR11: Onboarding branching
- FR12: Program Builder gating
- FR13: Client-side aggregation
- FR14: CSV import parsing
- NFR6: Aggregation performance
- CR6: Backend Changes table writes

**Stories to Expand**:
- Epic 1 needs 13+ detailed stories (see this document)
- Each story references architecture sections
- Clear acceptance criteria and integration verification

**Reference**: 
- Architecture: `docs/architecture/fullstack-web-app.md`
- This document: `docs/architecture/PRD-REFINEMENT-RECOMMENDATIONS.md`

Please incorporate these recommendations and create an updated PRD v0.2 🚀

---

**End of Recommendations**

