# Epic 1: Secure Web App MVP

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
- Onboarding (9 steps for new users only; existing skip all)
- Analytics (Amplitude + GA4, 50+ events)

**Phase 2 Scope** (Post-MVP, 4 weeks):
- WatermelonDB integration (IndexedDB on web)
- Sync via `push-changes`/`pull-changes` (like mobile)
- Remove new user constraint (all users can edit)
- Offline support
- Perfect mobile/web synchronization

---

## Story 1.1: Foundation - Auth Layout & Navigation

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

## Story 1.2: User Data State Detection

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

## Story 1.3: Dashboard Shell & Date Range Filter

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

## Story 1.4: Training Volume Card (Client-Side Aggregation)

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

## Story 1.5: Personal Records Card

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

## Story 1.6: Recent Workouts Card

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

## Story 1.7: Progress Over Time Card

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

## Story 1.8: Active Program Card

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

## Story 1.9: Workout History Page

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

## Story 1.10: CSV Import Flow

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

## Story 1.11: Program Builder (New Users Only)

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

## Story 1.12: Profile Management

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

## Story 1.13: Onboarding Flow with User State Branching

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

