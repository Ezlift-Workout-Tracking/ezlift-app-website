# Development Roadmap

## Phase 1A: Foundation (Weeks 1-2)

**Authentication & Navigation**:
- [x] Auth pages already exist (login/signup)
- [ ] Create authenticated layout (`app/app/layout.tsx`)
- [ ] Add navigation (sidebar or top nav)
- [ ] Implement logout functionality
- [ ] Test route protection (middleware)

**Dashboard Shell**:
- [ ] Create `DashboardShell.tsx` with grid layout
- [ ] Create `DashboardCard.tsx` base component
- [ ] Add date range filter component
- [ ] Add empty state components
- [ ] Wire up React Query provider

**API Client**:
- [ ] Create API client utility (`lib/api/client.ts`)
- [ ] Add error handling and retry logic
- [ ] Create API service modules (workouts, routines, sessions, user)
- [ ] Create React Query hooks for each endpoint

## Phase 1B: Dashboard Cards (Weeks 3-4)

**Data Fetching**:
- [ ] Implement `useSessions()` hook
- [ ] Implement `useRoutines()` hook
- [ ] Test API integration with backend

**Card Implementation**:
- [ ] Training Volume Card (bar chart, client-side aggregation)
- [ ] Personal Records Card (list, client-side sorting)
- [ ] Recent Workouts Card (list with details)
- [ ] Progress Over Time Card (line chart, est 1RM calculation)
- [ ] Active Program Card (routine summary)

**Dashboard Integration**:
- [ ] Wire all cards into dashboard grid
- [ ] Implement global date range filter logic
- [ ] Add skeleton loading states
- [ ] Test responsive layout (desktop/mobile)

## Phase 1C: History & Profile (Week 5)

**History Page**:
- [ ] Create history list component
- [ ] Add pagination (20 per page)
- [ ] Add date range filter
- [ ] Create workout detail modal
- [ ] Test with large data sets (100+ sessions)

**Profile Page**:
- [ ] Display user info (name, email)
- [ ] Editable units (kg/lbs, cm/in, km/mi)
- [ ] Editable bodyweight
- [ ] Save button with optimistic update
- [ ] Success/error toasts

## Phase 1D: Import Flow (Week 6)

**CSV Import**:
- [ ] Install papaparse and minisearch
- [ ] Create CSV upload component
- [ ] Implement Hevy CSV parser (match mobile implementation)
- [ ] Fuzzy match exercises with library
- [ ] Create import summary screen
- [ ] Implement progress bar during import
- [ ] Test with sample Hevy CSV file
- [ ] Handle errors (invalid CSV, unmapped exercises)

## Phase 1E: Program Builder (Weeks 7-8)

**Exercise Selection**:
- [ ] Reuse `ExerciseCard` component from public site
- [ ] Reuse `DebouncedSearchInput` for exercise search
- [ ] Create 4-column grid layout
- [ ] Add muscle group filters
- [ ] Exercise detail modal

**Workout Editor**:
- [ ] Create workout editor component
- [ ] Add exercises to workout (drag or click)
- [ ] Configure sets per exercise
- [ ] Reorder exercises (drag-and-drop)
- [ ] Set rest times

**Flow Navigation**:
- [ ] Workout 1 → Workout 2 → Workout 3 flow
- [ ] Smart suggestions between workouts
- [ ] Real-time metrics panel (muscles, duration, variety)
- [ ] Program overview screen
- [ ] Save program to backend

## Phase 1F: Onboarding (Weeks 9-10)

**Onboarding Steps**:
- [ ] Create onboarding layout with progress bar
- [ ] Implement all 9 steps (personal info → program setup)
- [ ] Question answer tracking (Amplitude events)
- [ ] Skip functionality
- [ ] Onboarding state persistence (in case of refresh)
- [ ] Redirect to dashboard on completion

**Program Setup Options**:
- [ ] "Describe Program" with text/voice input (future: AI parsing)
- [ ] "Use Program Builder" (redirect to builder)
- [ ] "Select Recommended Program" (show 3-4 suggestions)

## Phase 1G: Analytics & Polish (Week 11)

**Analytics**:
- [ ] Install Amplitude SDK
- [ ] Create analytics wrapper (GA + Amplitude)
- [ ] Implement event taxonomy (all events from spec)
- [ ] Test event delivery (check Amplitude dashboard)
- [ ] Cookie consent integration

**Polish**:
- [ ] Loading states for all async operations
- [ ] Error boundaries for each major component
- [ ] Toast notifications for all user actions
- [ ] Responsive design testing (mobile/tablet/desktop)
- [ ] Accessibility audit (keyboard nav, screen readers)

## Phase 2: WatermelonDB Migration (Post-MVP)

**Timeline**: 2-4 weeks after Phase 1 complete

**Steps**:
1. Install and configure WatermelonDB (Week 1)
2. Define complete schema matching mobile v83 (Week 1)
3. Implement sync adapter (Week 2)
4. Create React hooks for WatermelonDB queries (Week 2)
5. Feature flag parallel implementation (Week 3)
6. Test synchronization with mobile apps (Week 3)
7. Gradual rollout to users (Week 4)
8. Remove Phase 1 code after validation (Week 4)

---
