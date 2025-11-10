# EzLift Secure Web App - Full-Stack Architecture

**Document Version**: 1.0  
**Created**: 2025-01-10  
**Architect**: Winston  
**Status**: Architecture Design - MVP Phase 1

---

## Executive Summary

This document defines the complete architecture for the **EzLift Secure Web App** - a dashboard-first companion to the iOS/Android mobile apps. The architecture is designed in two phases:

**Phase 1 (MVP)**: Direct REST API integration for rapid delivery  
**Phase 2 (Post-MVP)**: WatermelonDB sync integration for perfect mobile/web synchronization

### Key Architectural Decisions

**MVP Approach** ✅:
- Direct backend REST API calls (GET/POST/PATCH/DELETE)
- Client-side state management (React Query or SWR)
- Client-side data aggregation for stats/analytics
- CSV import parsed client-side
- No offline support (online-required)

**Phase 2 Evolution** 🔮:
- WatermelonDB (IndexedDB) for local-first data
- Sync via `/api/sync/push-changes` and `/pull-changes`
- Perfect synchronization with mobile apps
- Offline-first capabilities
- Documented migration path from Phase 1

### Core Principles

1. **Desktop-First Thinking**: Optimize for large screens, planning workflows, and analytics
2. **Reuse Existing Infrastructure**: Leverage public website components, auth flow, and backend APIs
3. **No Backend Changes for MVP**: All missing functionality computed client-side
4. **Future-Proof Design**: Architecture decisions enable smooth Phase 2 migration
5. **Performance First**: LCP < 2.0s, INP < 200ms, seamless UX

---

## Table of Contents

### Part 1: MVP Architecture (Phase 1)
1. [MVP Overview](#mvp-overview-phase-1)
2. [Technology Stack](#technology-stack-mvp)
3. [System Architecture](#system-architecture-mvp)
4. [Data Architecture](#data-architecture-mvp)
5. [API Integration](#api-integration-mvp)
6. [Component Architecture](#component-architecture)
7. [Feature Specifications](#feature-specifications)
8. [State Management](#state-management)
9. [Analytics Integration](#analytics-integration)
10. [Import Flow Architecture](#import-flow-architecture)
11. [Performance Strategy](#performance-strategy)
12. [Security & Authentication](#security--authentication)
13. [Testing Strategy](#testing-strategy)

### Part 2: Phase 2 Evolution (WatermelonDB)
14. [Phase 2 Overview](#phase-2-overview-watermelondb)
15. [WatermelonDB Integration](#watermelondb-integration)
16. [Migration Path](#migration-path-from-phase-1-to-phase-2)
17. [Sync Architecture](#sync-architecture-phase-2)

### Part 3: Implementation Guidance
18. [Development Roadmap](#development-roadmap)
19. [Deployment Strategy](#deployment-strategy)
20. [Backend Improvement Opportunities](#backend-improvement-opportunities)

---

## MVP Overview (Phase 1)

### Critical MVP Constraint 🔴

**User Data State Determines Feature Access**:

**New Users** (No existing workouts/programs):
- ✅ Full Program Builder access (create, edit, delete programs)
- ✅ Programs created via REST API (not sync endpoints)
- ✅ On first mobile login → Mobile pulls programs via sync → **IN SYNC**
- ✅ Dashboard, history, import all available (but likely empty)

**Existing Users** (Have workouts from mobile app):
- ❌ Program Builder **READ-ONLY** (view programs, cannot edit)
- ✅ Dashboard with full analytics (computed from mobile data)
- ✅ History view (see mobile-tracked workouts)
- ✅ Import (bring in Hevy/Strong historical data)
- ✅ Profile management
- 💬 Message: "Program editing available on mobile app"

**Why This Works**:
- New users: Web creates programs → Mobile syncs down → Perfectly in sync
- Existing users: Can't edit on web → No sync conflicts
- MVP delivered without backend changes
- Phase 2 removes this constraint (WatermelonDB enables full editing for all users)

**Detection Logic**:
```typescript
// On web app login/dashboard load
const user = await getUser();
const hasExistingData = await checkUserHasData(user.id);

if (hasExistingData) {
  // Existing user: Read-only mode for programs
  showProgramViewerOnly();
} else {
  // New user: Full program builder access
  showFullProgramBuilder();
}

async function checkUserHasData(userId: string): Promise<boolean> {
  const [workouts, sessions] = await Promise.all([
    api.get(`/api/workout?limit=1`),
    api.get(`/api/logs?limit=1`)
  ]);
  
  return workouts.length > 0 || sessions.length > 0;
}
```

### MVP Sync Flow Diagrams

**New User Flow** (Web-First, Then Mobile):
```
┌─────────────────────────────────────────────────────────────┐
│ DAY 1: Sign up on Web                                        │
├─────────────────────────────────────────────────────────────┤
│ 1. Create account (Firebase)                                │
│ 2. Complete onboarding (Steps 1-9)                          │
│ 3. Use Program Builder → Create "Push/Pull/Legs" program    │
│    ├─ POST /api/routine (creates routine in PostgreSQL)     │
│    ├─ POST /api/workout (creates 3 workouts)                │
│    └─ Backend writes to routines, workouts tables           │
│ 4. View dashboard (empty, no sessions yet)                  │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│ DAY 2: First mobile login                                    │
├─────────────────────────────────────────────────────────────┤
│ 1. Install iOS/Android app                                  │
│ 2. Log in with same account                                 │
│ 3. Mobile calls GET /api/sync/pull-changes?lastPulledAt=0   │
│    ├─ Backend checks Changes table for user                 │
│    ├─ Returns initial state (routines, workouts)            │
│    └─ Mobile WatermelonDB stores programs locally           │
│ 4. ✅ MOBILE NOW HAS WEB-CREATED PROGRAMS                   │
│ 5. User can track workouts using synced programs            │
└─────────────────────────────────────────────────────────────┘
```

**Existing User Flow** (Mobile-First, Read-Only Web):
```
┌─────────────────────────────────────────────────────────────┐
│ ALREADY USING: Mobile app with data                         │
├─────────────────────────────────────────────────────────────┤
│ - Has tracked 50+ workouts on mobile                        │
│ - Has created programs on mobile                            │
│ - All data in backend (via sync endpoints)                  │
│ - Changes table tracks all mobile modifications             │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│ NEW: First web login                                         │
├─────────────────────────────────────────────────────────────┤
│ 1. Log in to web with existing account                      │
│ 2. Web checks: GET /api/workout (finds data) → "existing"   │
│ 3. Onboarding Steps 1-6 only (skip program setup)           │
│ 4. Dashboard shows:                                         │
│    ✅ Training Volume (computed from mobile workouts)       │
│    ✅ Personal Records (from mobile sessions)               │
│    ✅ Recent Workouts (tracked on mobile)                   │
│    ✅ Progress Charts (mobile data)                         │
│    ✅ Active Program (from mobile)                          │
│ 5. Can view programs (read-only)                            │
│ 6. ❌ Cannot edit programs (shows "Use mobile app" message) │
│ 7. ✅ Can import Hevy/Strong history (adds sessions)        │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│ IF USER TRIES TO EDIT PROGRAM:                              │
├─────────────────────────────────────────────────────────────┤
│ Show Alert:                                                  │
│ ┌───────────────────────────────────────────────────────┐   │
│ │ ℹ️  Program Editing Coming Soon                       │   │
│ │                                                        │   │
│ │ Full program editing on web will be available in our  │   │
│ │ next update. For now, please use the mobile app to    │   │
│ │ create or edit programs.                              │   │
│ │                                                        │   │
│ │ Why? This ensures your data stays perfectly synced    │   │
│ │ between web and mobile.                               │   │
│ │                                                        │   │
│ │ [View Programs]  [Download Mobile App]                │   │
│ └───────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

**Why This Works (No Sync Issues)**:

**New User**:
```
Web creates program (REST API)
  → Backend writes to: routines table, workouts table
  → ⚠️ CRITICAL ASSUMPTION: Backend's REST endpoints (POST /api/routine, 
     POST /api/workout) MUST also write to Changes table for new users
  → Otherwise: Mobile's initial sync won't see web-created programs
  
VERIFIED APPROACH:
  → Mobile first login: pull-changes (lastPulledAt=0)
  → Backend queries Changes table for user
  → Returns all routines/workouts that were written to Changes table
  → Mobile gets all web-created programs
  → ✅ IN SYNC (if Changes table populated correctly)
```

**✅ CONFIRMED: Backend Changes Table Integration**

Backend's REST endpoints write to Changes table (confirmed via existing migration):

```typescript
// Backend: POST /api/routine (WORKING via migration)
server.post('/api/routine', async (req, reply) => {
  const routineRepo = server.orm["typeorm"].getRepository(Routine);
  const changesRepo = server.orm["typeorm"].getRepository(Changes);
  
  // Create routine
  const routine = routineRepo.create({...req.body});
  await routineRepo.save(routine);
  
  // ✅ CONFIRMED WORKING: Write to Changes table
  const routineChange = changesRepo.create({
    userId: req.headers.uid,
    changeType: "created",
    recordId: routine.id,
    timestamp: Date.now(),
    tableName: "routines",
    changes: {
      id: routine.id,
      title: routine.title,
      description: routine.description,
      default_routine: routine.defaultRoutine,
      order: routine.order
    }
  });
  await changesRepo.save(routineChange);
  
  return reply.code(201).send(routine);
});
```

**Status**: Migration currently handles this for new users. Full REST endpoint modifications (Option A) will be implemented to formalize this pattern.

**Endpoints confirmed/to be updated**:
- ✅ POST /api/routine (working via migration)
- ✅ POST /api/workout (working via migration)
- 🔄 PATCH /api/routine/:id (to be formalized)
- 🔄 PATCH /api/workout/:id (to be formalized)
- 🔄 DELETE /api/routine/:id (to be formalized)
- 🔄 DELETE /api/workout/:id (to be formalized)

**Impact**: 
- ✅ New users can create unlimited programs on web
- ✅ Mobile syncs down all web-created programs
- ✅ Full-featured Program Builder in MVP

**Existing User**:
```
Mobile has existing data
  → Changes table tracks all mobile operations
  → Web can READ data (GET /api/workout, GET /api/logs)
  → Web CANNOT WRITE (Program Builder blocked)
  → No risk of out-of-sync issues
  → ✅ SAFE
```

---

### What We're Building

A **dashboard-first secure web application** that provides:

**Core Features**:
1. **Dashboard** with 5 priority cards:
   - Training Volume (weekly/monthly trends)
   - Top PRs / Personal Bests (recent achievements)
   - Recent Workouts (last 3-5 sessions with quick links)
   - Progress Over Time (exercise-specific charts, est 1RM)
   - Active Program Summary (current routine, next workout)

2. **Workout History**: Paginated list with date filtering

3. **Import Flow**: CSV upload for Hevy/Strong workout history

4. **Profile Management**: View/edit display name, units (kg/lbs), bodyweight

5. **Onboarding**: 9-step flow to collect user preferences and set up initial program

6. **Program Builder**: Visual, desktop-optimized routine creation tool

7. **Analytics Integration**: Google Analytics + Amplitude for user behavior tracking

### What Makes This Different from Mobile

**Mobile App** (iOS/Android):
- Primary use case: **Live workout tracking in gym**
- Offline-first with WatermelonDB (SQLite)
- Optimized for quick set logging (< 1 second per set)
- Small screen, touch-first UI
- Camera access for paper log scanning

**Web App** (This Architecture):
- Primary use case: **Planning, analytics, and data management**
- Online-first for MVP (Phase 2 adds offline)
- Optimized for dashboard viewing and routine building
- Large screen, keyboard + mouse interactions
- Desktop advantages: charts, multi-column layouts, detailed data tables

**Complementary, Not Redundant**:
- Mobile: Track workouts while lifting
- Web: Plan programs, analyze progress, import historical data
- Shared: Same user account, same backend, synchronized data

---

## Technology Stack (MVP)

### Frontend Core (Inherits from Public Website)

- **Next.js**: 15.1.2 (App Router)
- **React**: 18.2.0
- **TypeScript**: 5.2.2
- **Tailwind CSS**: 3.3.3
- **shadcn/ui + Radix**: Component primitives

### New Dependencies for Web App

**State Management**:
- **@tanstack/react-query**: ^5.x (recommended) OR **SWR**: ^2.x
  - Server state synchronization
  - Cache management
  - Optimistic updates
  - Background refetching

**CSV Parsing**:
- **papaparse**: ^5.4.1 (same as mobile app uses)
  - Client-side CSV parsing
  - Type-safe row parsing
  - Error handling

**Analytics**:
- **@amplitude/analytics-browser**: ^2.x
  - User behavior tracking
  - Event batching
  - Session replay capabilities
- **Google Analytics** (already integrated, extend to web app)

**Charts & Data Visualization**:
- **Recharts**: 2.12.7 (already installed)
  - Bar charts (training volume)
  - Line charts (progress over time)
  - Responsive charts
  - Customizable styling

**Search & Fuzzy Matching** (for CSV import):
- **minisearch**: ^7.x (same library as mobile app)
  - Fuzzy exercise name matching
  - Exercise library integration
  - Handles typos and variations

**Date Handling**:
- **date-fns**: 3.6.0 (already installed)
  - Date parsing for CSV imports
  - Date formatting for UI
  - Relative dates ("2 days ago")

---

## System Architecture (MVP)

### High-Level Data Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                     React Components                             │
│   Dashboard | History | Profile | Import | ProgramBuilder       │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                  React Query / SWR Layer                         │
│   - Query caching (5-minute default)                            │
│   - Background refetch on window focus                          │
│   - Optimistic updates for mutations                            │
│   - Error retry logic                                           │
└──────────────────────────┬──────────────────────────────────────┘
                           │
        ┌──────────────────┼──────────────────┬──────────────────┐
        ▼                  ▼                  ▼                  ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│   Backend    │  │  PostgreSQL  │  │  Contentful  │  │   AWS S3     │
│     API      │  │  (Exercises) │  │   (Blog)     │  │  (Media)     │
│   Workouts   │  │  Read-only   │  │  Read-only   │  │  Signed URLs │
│   Sessions   │  │  Direct      │  │              │  │              │
│   Routines   │  │  Connection  │  │              │  │              │
│   Profile    │  │              │  │              │  │              │
└──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘
```

### Key Architectural Patterns

**1. Server Components for Initial Data** (Next.js 15):
```typescript
// app/dashboard/page.tsx (Server Component)
export default async function DashboardPage() {
  // Fetch initial data server-side (SSR)
  const user = await getUser();  // From cookies
  const recentWorkouts = await fetchRecentWorkouts(user.id);
  
  // Pass to client component
  return <DashboardClient initialData={{ user, recentWorkouts }} />;
}
```

**2. Client Components for Interactivity**:
```typescript
// components/dashboard/DashboardClient.tsx (Client Component)
'use client';

export function DashboardClient({ initialData }) {
  // Use React Query with initial data
  const { data: workouts } = useQuery({
    queryKey: ['workouts', 'recent'],
    queryFn: fetchRecentWorkouts,
    initialData: initialData.recentWorkouts,
    staleTime: 5 * 60 * 1000  // 5 minutes
  });
  
  return <WorkoutCards workouts={workouts} />;
}
```

**3. API Routes as Backend Proxy**:
```typescript
// app/api/workouts/route.ts
export async function GET(request: Request) {
  const user = await requireUser();  // From session cookies
  const response = await fetch(
    `${BACKEND_API}/api/workout`,
    {
      headers: { 'x-jwt-token': user.token }
    }
  );
  return Response.json(await response.json());
}
```

---

## Data Architecture (MVP)

### Data Flow Patterns

**Read Pattern** (Fetching Data):
```
User opens Dashboard
  ↓
Server Component: SSR initial data fetch
  ↓
Client Component: Hydrate with initial data
  ↓
React Query: Cache data, set up refetch
  ↓
Background: Refetch on window focus (when user returns to tab)
  ↓
Update UI reactively (no page reload)
```

**Write Pattern** (Mutations):
```
User creates/updates data (e.g., "Save Program")
  ↓
Optimistic Update: Update UI immediately (instant feedback)
  ↓
Mutation: POST/PATCH to backend API
  ↓
Success: Invalidate React Query cache → Refetch latest data
  ↓
Failure: Rollback optimistic update, show error toast
```

### Client-Side Data Storage

**For MVP (No IndexedDB/LocalStorage for persistence)**:
- React Query cache (in-memory only)
- Session storage for temporary UI state (filter selections, pagination)
- No offline data persistence

**For Phase 2**:
- WatermelonDB (IndexedDB) for persistent local storage
- Offline-first with sync

### Data Aggregation Strategy (Client-Side)

**Problem**: Backend doesn't provide pre-aggregated stats for dashboard cards

**MVP Solution**: Compute on client after fetching raw data

**Example - Training Volume Card**:
```typescript
// Fetch raw workout sessions
const { data: sessions } = useQuery({
  queryKey: ['sessions', 'last30days'],
  queryFn: () => fetchWorkoutSessions({ 
    startDate: thirtyDaysAgo, 
    endDate: today 
  })
});

// Client-side aggregation
const weeklyVolume = useMemo(() => {
  if (!sessions) return [];
  
  return groupByWeek(sessions).map(week => ({
    weekStart: week.start,
    totalSets: week.sessions.reduce((sum, s) => sum + s.totalSets, 0),
    totalVolume: week.sessions.reduce((sum, s) => sum + s.totalVolume, 0)
  }));
}, [sessions]);

// Render chart
return <BarChart data={weeklyVolume} />;
```

**Aggregations Computed Client-Side**:
1. **Weekly/Monthly Volume**: Group sessions by week/month, sum sets/volume
2. **Personal Records**: Find max weight per exercise across all sessions
3. **Progress Trends**: Calculate estimated 1RM from session sets
4. **Workout Frequency**: Count sessions per week over time period
5. **Muscle Group Distribution**: Aggregate exercises by muscle group

**Performance Consideration**:
- Fetch limited date ranges (last 30 days, 90 days, etc.)
- Cache aggregated results in React Query
- Lazy load older data on demand ("Load More" or date range selector)

---

## API Integration (MVP)

### Backend API Endpoints (Available)

**Base URL**: `https://ezlift-server-production.fly.dev`

**Authentication**:
- Header: `x-jwt-token: {firebaseIdToken}`
- Token refresh: Client handles via Firebase SDK
- Session cookies: Managed by Next.js API routes (proxy pattern)

#### User & Profile Endpoints

```
GET    /api/user              Get user profile
PATCH  /api/user              Update profile (display name, units, bodyweight)
DELETE /api/user/delete       Delete account
```

**Response Example** (GET /api/user):
```json
{
  "id": "user-uuid",
  "email": "user@example.com",
  "name": "John Doe",
  "settings": {
    "weightUnit": "kg",
    "distanceUnit": "km",
    "heightUnit": "cm",
    "theme": "light",
    "startOfWeek": "monday"
  }
}
```

#### Routine (Program) Endpoints

```
GET    /api/routine           List user's routines
GET    /api/routine/:id       Get specific routine with workouts
POST   /api/routine           Create new routine
PATCH  /api/routine/:id       Update routine
DELETE /api/routine/:id       Delete routine
POST   /api/routine/move-workout   Move workout between routines
```

**Routine Schema**:
```typescript
interface Routine {
  id: string;  // UUID
  title: string;
  description?: string;
  order?: number;
  defaultRoutine: boolean;
  workouts: Workout[];  // Array of workout templates
}
```

#### Workout Template Endpoints

```
GET    /api/workout           List user's workout templates
GET    /api/workout/:id       Get workout with exercises
POST   /api/workout           Create workout template
PATCH  /api/workout/:id       Update workout
DELETE /api/workout/:id       Delete workout
POST   /api/workout/:id/exercise    Add exercise to workout
PATCH  /api/workout/:id/exercise/:exerciseId   Update exercise
DELETE /api/workout/:id/exercise/:exerciseId   Remove exercise
```

**Workout Schema**:
```typescript
interface Workout {
  id: string;  // UUID
  title: string;
  notes?: string;
  order?: number;
  estimatedDuration?: number;  // minutes
  workoutExercises: WorkoutExercise[];
}

interface WorkoutExercise {
  id: string;  // UUID
  exerciseId: string;  // References exercise library
  name: string;
  primaryMuscleGroup: string;
  exerciseType?: string;
  notes?: string;
  order: number;
  restTime?: number;  // seconds
  sets: Set[];  // JSONB array
}

interface Set {
  id?: string;
  reps?: number;
  weight?: number;
  duration?: number;
  distance?: number;
  notes?: string;
  restTime?: number;
  rpe?: number;
}
```

#### Workout Session (Log) Endpoints

```
GET    /api/logs              List workout sessions (history)
GET    /api/logs/:id          Get session details
POST   /api/logs              Create workout session
PATCH  /api/logs/:id          Update session
DELETE /api/logs/:id          Delete session
```

**Session Schema**:
```typescript
interface WorkoutSession {
  id: string;  // UUID
  userId: string;
  workoutTitle?: string;
  duration?: string;  // "01:15:30" format
  notes?: string;
  sessionDate: string;  // ISO timestamp
  isImported: boolean;
  importedAt?: string;
  logs?: LogExercise[];  // Exercise instances
}

interface LogExercise {
  id: string;
  sessionId: string;
  exerciseId: string;
  name: string;
  primaryMuscleGroup: string;
  order: number;
  notes?: string;
  sets: LogSet[];  // Nested JSON
}

interface LogSet {
  id: string;
  reps?: number;
  weight?: number;
  duration?: number;
  distance?: number;
  rpe?: number;
  index: number;
}
```

### API Client Architecture

**Service Layer**: `lib/api/` (to be created)

```typescript
// lib/api/client.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_API || 
                     'https://ezlift-server-production.fly.dev';

export async function apiRequest<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const token = await getFirebaseToken();  // From Firebase SDK
  
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'x-jwt-token': token,
      ...options?.headers
    }
  });
  
  if (!response.ok) {
    throw new APIError(response.status, await response.json());
  }
  
  return response.json();
}

// lib/api/workouts.ts
export const workoutsAPI = {
  list: () => apiRequest<Workout[]>('/api/workout'),
  get: (id: string) => apiRequest<Workout>(`/api/workout/${id}`),
  create: (workout: CreateWorkoutDTO) => 
    apiRequest<Workout>('/api/workout', {
      method: 'POST',
      body: JSON.stringify(workout)
    }),
  update: (id: string, updates: UpdateWorkoutDTO) =>
    apiRequest<Workout>(`/api/workout/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates)
    }),
  delete: (id: string) =>
    apiRequest<void>(`/api/workout/${id}`, { method: 'DELETE' })
};
```

**React Query Hooks**: `hooks/api/` (to be created)

```typescript
// hooks/api/useWorkouts.ts
export function useWorkouts() {
  return useQuery({
    queryKey: ['workouts'],
    queryFn: workoutsAPI.list,
    staleTime: 5 * 60 * 1000  // 5 minutes
  });
}

export function useCreateWorkout() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: workoutsAPI.create,
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['workouts'] });
    },
    onError: (error) => {
      toast.error('Failed to create workout');
    }
  });
}
```

### Error Handling Strategy

**API Errors**:
```typescript
class APIError extends Error {
  constructor(
    public status: number,
    public data: any
  ) {
    super(`API Error: ${status}`);
  }
}

// In components:
const { data, error, isLoading } = useWorkouts();

if (error) {
  if (error.status === 401) {
    // Session expired, redirect to login
    router.push('/login');
  } else if (error.status === 403) {
    // Unauthorized
    toast.error('You don't have permission');
  } else if (error.status >= 500) {
    // Server error
    toast.error('Server error. Please try again.');
  }
}
```

**Network Errors**:
- Retry logic (React Query default: 3 retries with exponential backoff)
- Offline detection (show offline banner)
- Toast notifications for user feedback

---

## Import Flow Architecture

### CSV Import Process (Client-Side Parsing)

Based on mobile app implementation at `/Users/belalgouda/Development_Projects/Active_Projects/ezlift-rn-app/src/common/utils/parseCsvToWorkoutLogs.ts`

**Hevy CSV Structure** (Confirmed from sample):
```csv
title, start_time, end_time, description, exercise_title, superset_id,
exercise_notes, set_index, set_type, weight_kg, reps, distance_km,
duration_seconds, rpe
```

**Example Rows**:
```csv
"Full Body B","18 Dec 2024, 21:13","18 Dec 2024, 21:58","","Leg Press (Machine)",,"",0,"normal",250,15,,,
"Full Body B","18 Dec 2024, 21:13","18 Dec 2024, 21:58","","Leg Press (Machine)",,"",1,"normal",250,14,,,
```

### Import Implementation

**Step 1: Upload & Parse**

```typescript
// components/import/CsvImportFlow.tsx
import { parse } from 'papaparse';

async function handleFileUpload(file: File) {
  const text = await file.text();
  
  const { data, errors } = parse<HevyRow>(text, {
    header: true,
    skipEmptyLines: true,
    transform: (value) => value.trim()
  });
  
  if (errors.length > 0) {
    toast.error(`CSV parsing error: ${errors[0].message}`);
    return;
  }
  
  // Process rows
  setImportState({ status: 'parsing', rows: data });
}
```

**Step 2: Group by Workout**

```typescript
// lib/import/parser.ts
function groupByWorkout(rows: HevyRow[]) {
  const workouts: Map<string, HevyRow[]> = new Map();
  
  rows.forEach(row => {
    const key = `${row.title}-${row.start_time}-${row.end_time}`;
    if (!workouts.has(key)) {
      workouts.set(key, []);
    }
    workouts.get(key)!.push(row);
  });
  
  return workouts;
}
```

**Step 3: Fuzzy Match Exercises**

```typescript
import MiniSearch from 'minisearch';

// Initialize search index with exercise library
const miniSearch = new MiniSearch({
  fields: ['name', 'aliases'],
  storeFields: ['id', 'name', 'primaryMuscleGroup', 'exerciseType'],
  searchOptions: { fuzzy: 0.2 }
});

// Add all exercises from library
miniSearch.addAll(exerciseLibrary);

// Match Hevy exercise names
function matchExercise(hevyExerciseName: string) {
  const results = miniSearch.search(hevyExerciseName, { fuzzy: 0.2 });
  return results[0] || null;  // Best match or null
}
```

**Step 4: Create Session Records**

```typescript
interface ParsedImport {
  sessions: WorkoutSession[];
  unmappedExercises: string[];  // For user review
  mappedExercises: { oldName: string; newName: string }[];
  totalWorkouts: number;
  totalSets: number;
}

function parseHevyCsv(
  rows: HevyRow[],
  exerciseLibrary: Exercise[]
): ParsedImport {
  const sessions: WorkoutSession[] = [];
  const unmappedExercises: Set<string> = new Set();
  const mappedExercises: { oldName: string; newName: string }[] = [];
  
  const workoutGroups = groupByWorkout(rows);
  
  workoutGroups.forEach(([key, rows]) => {
    const [title, startTime, endTime] = key.split('-');
    const startDate = parse(startTime, 'dd MMM yyyy, HH:mm', new Date());
    const endDate = parse(endTime, 'dd MMM yyyy, HH:mm', new Date());
    
    const session: WorkoutSession = {
      id: generateUUID(),
      workoutTitle: normalizeTitle(title),
      sessionDate: startDate.toISOString(),
      duration: formatDuration(differenceInSeconds(endDate, startDate)),
      notes: '',
      isImported: true,
      importedAt: new Date().toISOString(),
      logs: []
    };
    
    // Group exercises by title (multiple sets per exercise)
    const exerciseGroups = groupBy(rows, r => r.exercise_title);
    
    Object.entries(exerciseGroups).forEach(([exerciseTitle, sets], index) => {
      const match = matchExercise(exerciseTitle);
      
      if (!match) {
        unmappedExercises.add(exerciseTitle);
      } else {
        mappedExercises.push({ 
          oldName: exerciseTitle, 
          newName: match.name 
        });
      }
      
      const logExercise: LogExercise = {
        id: generateUUID(),
        sessionId: session.id,
        exerciseId: match?.id || '-1',
        name: match?.name || exerciseTitle,
        primaryMuscleGroup: match?.primaryMuscleGroup || 'unknown',
        exerciseType: match?.exerciseType,
        order: index,
        notes: sets[0].exercise_notes || '',
        sets: sets.map((set, setIndex) => ({
          id: generateUUID(),
          index: setIndex,
          reps: set.reps ? Number(set.reps) : undefined,
          weight: set.weight_kg ? Number(set.weight_kg) : undefined,
          duration: set.duration_seconds ? Number(set.duration_seconds) : undefined,
          distance: set.distance_km ? Number(set.distance_km) : undefined,
          rpe: set.rpe ? Number(set.rpe) : undefined
        }))
      };
      
      session.logs!.push(logExercise);
    });
    
    sessions.push(session);
  });
  
  return {
    sessions,
    unmappedExercises: Array.from(unmappedExercises),
    mappedExercises,
    totalWorkouts: sessions.length,
    totalSets: sessions.reduce((sum, s) => 
      sum + s.logs!.reduce((sum2, e) => sum2 + e.sets.length, 0), 0)
  };
}
```

**Step 5: Review & Confirm**

```typescript
// Show import summary to user
function ImportSummary({ parsed }: { parsed: ParsedImport }) {
  return (
    <Card>
      <h3>Import Summary</h3>
      <Stats>
        <Stat label="Workouts" value={parsed.totalWorkouts} />
        <Stat label="Exercises" value={parsed.sessions.reduce(...)} />
        <Stat label="Total Sets" value={parsed.totalSets} />
      </Stats>
      
      {parsed.unmappedExercises.length > 0 && (
        <Alert variant="warning">
          <p>{parsed.unmappedExercises.length} exercises couldn't be matched:</p>
          <ul>
            {parsed.unmappedExercises.map(name => <li>{name}</li>)}
          </ul>
          <p>These will be imported as custom exercises.</p>
        </Alert>
      )}
      
      <Button onClick={handleConfirmImport}>
        Import {parsed.totalWorkouts} Workouts
      </Button>
    </Card>
  );
}
```

**Step 6: Bulk Create Sessions**

```typescript
// For MVP: POST sessions one-by-one or bulk endpoint if available
async function importSessions(sessions: WorkoutSession[]) {
  const { mutateAsync } = useCreateSession();
  
  // Show progress
  setProgress({ current: 0, total: sessions.length });
  
  for (let i = 0; i < sessions.length; i++) {
    try {
      await mutateAsync(sessions[i]);
      setProgress({ current: i + 1, total: sessions.length });
    } catch (error) {
      // Log failed session, continue with others
      console.error(`Failed to import session ${i}:`, error);
    }
  }
  
  // Invalidate queries to refresh dashboard
  queryClient.invalidateQueries({ queryKey: ['sessions'] });
  
  toast.success(`Imported ${sessions.length} workouts successfully!`);
}
```

### Import Flow UX

**Screen 1: Select Source**
- Upload Hevy CSV
- Upload Strong CSV (future)
- Upload Google Sheets (future)

**Screen 2: Processing**
- Parse CSV (client-side)
- Match exercises with fuzzy search
- Show progress bar

**Screen 3: Review**
- Display import summary
- Show unmapped exercises
- Allow user to manually map or skip
- Confirm button

**Screen 4: Importing**
- Progress bar (X of Y workouts)
- Show current workout being imported
- Cancel button (abort remaining)

**Screen 5: Success**
- Summary: "127 workouts, 23 exercises, 2,341 sets imported"
- CTA: "View Dashboard" or "View History"
- Option: "Import More"

---

## Analytics Integration

### Event Tracking Strategy

**Two Providers**:
1. **Google Analytics 4** (GA4) - General web analytics, traffic sources
2. **Amplitude** - Detailed user behavior, product analytics, funnels

**Unified Interface**:

```typescript
// lib/analytics/tracker.ts
interface EventProperties {
  [key: string]: string | number | boolean | undefined;
}

class AnalyticsTracker {
  track(eventName: string, properties?: EventProperties) {
    // Send to GA4
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', eventName, properties);
    }
    
    // Send to Amplitude
    if (amplitude.isInitialized()) {
      amplitude.track(eventName, properties);
    }
  }
  
  identify(userId: string, traits?: Record<string, any>) {
    amplitude.setUserId(userId);
    if (traits) {
      amplitude.setUserProperties(traits);
    }
  }
  
  page(pageName: string, properties?: EventProperties) {
    // GA handles page views automatically
    // Amplitude needs explicit page tracking
    this.track('Page Viewed', { page: pageName, ...properties });
  }
}

export const analytics = new AnalyticsTracker();
```

### Event Taxonomy

**Authentication Events**:
```
User Signed Up
  - method: 'email' | 'google' | 'apple'
  - source: 'web'

User Logged In
  - method: 'email' | 'google' | 'apple'

User Logged Out
```

**Onboarding Events**:
```
Onboarding Started

Onboarding Step Completed
  - step: 1-9
  - stepName: 'Personal Info' | 'Training Frequency' | ...

Onboarding Question Answered
  - step: number
  - question: 'gender' | 'frequency' | 'goals' | ...
  - answer: string | string[]  // Multi-select = array

Onboarding Skipped
  - lastStep: number

Onboarding Completed (NEW USERS ONLY)
  - userState: 'new'
  - completedSteps: 9
  - programSetup: 'selected' | 'created' | 'skipped'
```

**Dashboard Events**:
```
Dashboard Viewed
  - hasData: boolean
  - cardsDisplayed: string[]  // ['volume', 'prs', 'recent', ...]

Dashboard Card Viewed
  - cardType: 'volume' | 'prs' | 'recent' | 'progress' | 'program'
  - hasData: boolean

Dashboard Card Clicked
  - cardType: string
  - action: 'view_detail' | 'drill_down'

Dashboard Filter Changed
  - filterType: 'dateRange'
  - value: '7days' | '30days' | '90days' | 'all'

Dashboard Card CTA Clicked
  - cardType: string
  - ctaAction: 'import' | 'create_program' | 'log_workout'
```

**Program Builder Events**:
```
Program Builder Opened
  - source: 'onboarding' | 'dashboard' | 'programs_page'

Program Exercise Added
  - exerciseId: string
  - exerciseName: string
  - workoutIndex: number

Program Exercise Removed
  - exerciseId: string

Program Set Added
  - exerciseId: string
  - setConfig: { reps, weight, etc. }

Program Saved
  - workoutCount: number
  - exerciseCount: number
  - totalSets: number
  - timeToBuild: number  // seconds

Program Builder Abandoned
  - progress: number  // 0-100%
  - abandonReason: 'back_button' | 'timeout' | 'error'
```

**Import Events**:
```
Import Started
  - source: 'hevy' | 'strong'

Import CSV Uploaded
  - fileSize: number
  - rowCount: number

Import Parsed
  - workoutsFound: number
  - exercisesFound: number
  - setsFound: number
  - unmappedExercises: number

Import Confirmed
  - workoutsToImport: number

Import Progress
  - current: number
  - total: number

Import Completed
  - workoutsImported: number
  - timeToComplete: number  // seconds
  - errors: number

Import Failed
  - error: string
  - stage: 'upload' | 'parse' | 'match' | 'create'
```

**History Events**:
```
History Viewed
  - workoutCount: number

History Filtered
  - filterType: 'date' | 'exercise' | 'muscleGroup'
  - value: string

History Paginated
  - page: number

Workout Detail Viewed
  - workoutId: string
  - sessionDate: string
```

**Profile Events**:
```
Profile Viewed

Profile Updated
  - fields: string[]  // ['weightUnit', 'bodyweight']

Settings Changed
  - setting: string
  - oldValue: any
  - newValue: any
```

### Analytics Initialization

```typescript
// lib/analytics/init.ts
import * as amplitude from '@amplitude/analytics-browser';

export function initializeAnalytics() {
  // Initialize Amplitude
  amplitude.init(process.env.NEXT_PUBLIC_AMPLITUDE_API_KEY!, {
    defaultTracking: {
      sessions: true,
      pageViews: false,  // We'll track manually
      formInteractions: false,
      fileDownloads: false
    }
  });
  
  // GA4 already initialized in layout.tsx
}

// Call in root layout after user authentication
useEffect(() => {
  if (user) {
    initializeAnalytics();
    analytics.identify(user.id, {
      email: user.email,
      name: user.name
    });
  }
}, [user]);
```

### Privacy & Consent

**Cookie Consent Integration**:
```typescript
// Only track if user accepted cookies
if (cookieConsent.analytics) {
  analytics.track('Dashboard Viewed');
}
```

**PII Protection**:
- ❌ Never send: Email, full name, IP address
- ✅ OK to send: User ID (hashed), anonymous usage patterns
- ✅ Anonymize: Exercise names (send IDs not names), workout titles

---

## Component Architecture

### Page Structure

```
app/
├── app/                         # Secure web app area
│   ├── layout.tsx              # Authenticated layout (sidebar/nav)
│   ├── page.tsx                # Dashboard (main landing after login)
│   ├── history/
│   │   └── page.tsx            # Workout history list
│   ├── programs/
│   │   ├── page.tsx            # Program list
│   │   ├── [id]/
│   │   │   └── page.tsx        # Program detail
│   │   └── create/
│   │       └── page.tsx        # Program builder
│   ├── import/
│   │   └── page.tsx            # Import flow
│   ├── profile/
│   │   └── page.tsx            # Profile management
│   └── onboarding/
│       ├── [step]/
│       │   └── page.tsx        # Onboarding steps (1-9)
│       └── layout.tsx          # Onboarding layout (progress bar)
```

### Reused Components (From Public Website)

**UI Primitives** (all from `components/ui/`):
- ✅ `button.tsx`, `card.tsx`, `input.tsx`, `select.tsx`
- ✅ `dialog.tsx`, `toast.tsx`, `skeleton.tsx`, `table.tsx`
- ✅ `tabs.tsx`, `pagination.tsx`, `progress.tsx`
- ✅ 30+ other Radix-based primitives

**Feature Components**:
- ✅ `exercise/ExerciseCard.tsx` - **Reuse in Program Builder**
- ✅ `exercise/DebouncedSearchInput.tsx` - **Reuse for exercise search**
- ✅ `exercise/ExerciseFilters.tsx` - **Reuse for muscle group filtering**
- ✅ `auth/*` - Login, signup, logout components

**Utilities**:
- ✅ `animations/FadeIn.tsx` - Page transitions
- ✅ `animations/ScrollAnimation.tsx` - Scroll effects

### New Components (Web App Specific)

#### Dashboard Components

```
components/
├── dashboard/
│   ├── DashboardShell.tsx          # Main dashboard layout (grid/stack)
│   ├── DashboardCard.tsx           # Base card component
│   ├── TrainingVolumeCard.tsx      # Bar chart of weekly/monthly volume
│   ├── PersonalRecordsCard.tsx     # List of recent PRs
│   ├── RecentWorkoutsCard.tsx      # Last 3-5 sessions preview
│   ├── ProgressChartCard.tsx       # Line chart for exercise progress
│   ├── ActiveProgramCard.tsx       # Current program summary
│   ├── DateRangeFilter.tsx         # Global date range selector
│   └── EmptyDashboard.tsx          # Empty state with CTAs
```

**Dashboard Card Pattern**:
```typescript
// components/dashboard/DashboardCard.tsx
interface DashboardCardProps {
  title: string;
  icon?: React.ReactNode;
  isLoading?: boolean;
  isEmpty?: boolean;
  emptyState?: React.ReactNode;
  children: React.ReactNode;
  onCardClick?: () => void;
}

export function DashboardCard({ 
  title, 
  icon, 
  isLoading, 
  isEmpty, 
  emptyState,
  children,
  onCardClick 
}: DashboardCardProps) {
  // Fire analytics on mount
  useEffect(() => {
    analytics.track('Dashboard Card Viewed', {
      cardType: title.toLowerCase().replace(/\s/g, '_'),
      hasData: !isEmpty
    });
  }, []);
  
  if (isLoading) {
    return <Skeleton className="h-[300px]" />;
  }
  
  if (isEmpty && emptyState) {
    return (
      <Card className="h-[300px] flex items-center justify-center">
        {emptyState}
      </Card>
    );
  }
  
  return (
    <Card 
      className="cursor-pointer hover:shadow-lg transition"
      onClick={() => {
        if (onCardClick) {
          analytics.track('Dashboard Card Clicked', { cardType: title });
          onCardClick();
        }
      }}
    >
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
```

#### Program Builder Components

**⚠️ MVP Constraint**: Program Builder only accessible to **new users** (no existing data). Existing users see read-only view.

```
components/
├── programs/
│   ├── ProgramBuilder/
│   │   ├── ProgramBuilderShell.tsx     # Main builder layout (NEW USERS ONLY)
│   │   ├── WorkoutEditor.tsx           # Edit single workout
│   │   ├── ExerciseSelector.tsx        # Visual exercise grid (reuses ExerciseCard)
│   │   ├── ExerciseSearchPanel.tsx     # Search + filters (reuses existing)
│   │   ├── SetConfigurator.tsx         # Configure sets for exercise
│   │   ├── MetricsPanel.tsx            # Real-time metrics (muscles, duration)
│   │   ├── WorkoutFlowNav.tsx          # Workout 1 → 2 → 3 → Overview
│   │   └── ProgramOverview.tsx         # Final preview before save
│   ├── ProgramBuilderGate.tsx          # Data state check + read-only message
│   ├── ProgramCard.tsx                 # Program list item
│   ├── ProgramDetailView.tsx           # View program structure (ALL USERS)
│   └── ReadOnlyProgramView.tsx         # View-only for existing users
```

**Program Builder Gate Logic**:
```typescript
// components/programs/ProgramBuilderGate.tsx
export function ProgramBuilderGate({ children }: { children: React.ReactNode }) {
  const { data: userState, isLoading } = useUserDataState();
  
  if (isLoading) {
    return <ProgramBuilderSkeleton />;
  }
  
  // Existing user → Block access
  if (userState?.state === 'existing') {
    return <ReadOnlyProgramMessage />;
  }
  
  // Unknown state (error) → Block access (safe default)
  if (userState?.state === 'unknown') {
    return <ReadOnlyProgramMessage />;
  }
  
  // New user → Full access
  return <>{children}</>;
}

// Usage
export default function ProgramBuilderPage() {
  return (
    <ProgramBuilderGate>
      <ProgramBuilder />  {/* Only renders for new users */}
    </ProgramBuilderGate>
  );
}
```

#### History Components

```
components/
├── history/
│   ├── WorkoutHistoryList.tsx      # Paginated list
│   ├── WorkoutHistoryItem.tsx      # Single session row
│   ├── WorkoutDetailModal.tsx      # Session detail view
│   ├── HistoryFilters.tsx          # Date range, exercise filters
│   └── HistoryEmptyState.tsx       # No workouts yet CTA
```

#### Import Components

```
components/
├── import/
│   ├── ImportFlow.tsx              # Multi-step import wizard
│   ├── CsvUploader.tsx             # File upload component
│   ├── ImportSummary.tsx           # Review before import
│   ├── ImportProgress.tsx          # Progress bar during import
│   ├── ExerciseMappingReview.tsx   # Show unmapped exercises
│   └── ImportSuccess.tsx           # Success screen with stats
```

#### Onboarding Components

**⚠️ MVP Constraint**: **Existing users skip ALL onboarding**. Onboarding (all 9 steps) only shown to new users.

```
components/
├── onboarding/
│   ├── OnboardingShell.tsx         # Layout with progress bar (NEW USERS ONLY)
│   ├── OnboardingProgress.tsx      # Step indicator (1 of 9) (NEW USERS ONLY)
│   ├── QuestionCard.tsx            # Question screen template (NEW USERS ONLY)
│   ├── PersonalInfoStep.tsx        # Step 1: Gender, age (NEW USERS ONLY)
│   ├── TrainingFrequencyStep.tsx   # Step 2: Frequency (NEW USERS ONLY)
│   ├── TrainingDurationStep.tsx    # Step 3: Duration (NEW USERS ONLY)
│   ├── ExperienceLevelStep.tsx     # Step 4: Experience (NEW USERS ONLY)
│   ├── GoalsStep.tsx               # Step 5: Multi-select goals (NEW USERS ONLY)
│   ├── EquipmentStep.tsx           # Step 6: Equipment available (NEW USERS ONLY)
│   ├── ProgramSetupStep.tsx        # Step 7: Do you have a program? (NEW USERS ONLY)
│   ├── DescribeProgramStep.tsx     # Step 8a: Text/voice input (NEW USERS ONLY)
│   └── SelectProgramStep.tsx       # Step 8b: Choose from recommendations (NEW USERS ONLY)
```

**Routing Logic** (Simplified):
```typescript
// After login/signup success (BEFORE showing any onboarding)
async function handlePostAuth(userId: string) {
  const userState = await checkUserDataState(userId);
  
  if (userState.state === 'existing') {
    // Existing user: NO onboarding at all
    analytics.track('User Data State Detected', {
      state: 'existing',
      hasWorkouts: userState.hasWorkouts,
      hasSessions: userState.hasSessions,
      redirectTo: 'dashboard_direct'
    });
    
    router.push('/app');  // Direct to dashboard (no stops)
    
  } else {
    // New user: Start full onboarding
    analytics.track('User Data State Detected', {
      state: 'new',
      redirectTo: 'onboarding'
    });
    
    analytics.track('Onboarding Started', {
      totalSteps: 9
    });
    
    router.push('/onboarding/profile');  // Step 1
  }
}

// No need to check user state DURING onboarding
// Only new users ever see onboarding screens
```

### Component Composition Strategy

**Atomic Design Principles**:

**Atoms** (primitives from shadcn/ui):
- Button, Input, Select, Card, Skeleton, etc.

**Molecules** (composed primitives):
- `DashboardCard` (Card + CardHeader + CardContent + analytics)
- `WorkoutHistoryItem` (Card + stats + action buttons)
- `ExerciseSelector` (SearchInput + Filters + ExerciseGrid)

**Organisms** (feature components):
- `TrainingVolumeCard` (DashboardCard + Recharts BarChart + data aggregation)
- `ProgramBuilder` (ExerciseSelector + WorkoutEditor + MetricsPanel)
- `ImportFlow` (Multi-step wizard with state machine)

**Templates** (page layouts):
- `DashboardShell` (Grid of dashboard cards)
- `OnboardingShell` (Centered content + progress bar)
- `ProgramBuilderShell` (Sidebar + main content + metrics panel)

---

## Feature Specifications

### Dashboard Feature

**Layout** (Desktop):
```
┌─────────────────────────────────────────────────────────────┐
│ [Logo]  Dashboard  History  Programs  Profile  [Avatar ▾]   │ ← Nav
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  [Date Range Filter: Last 30 Days ▾]              [Refresh]  │
│                                                               │
│  ┌──────────────────────┐  ┌──────────────────────┐        │
│  │  Training Volume     │  │  Personal Records    │        │
│  │  📊 Bar chart        │  │  🏆 PR list          │        │
│  │  45 sets this week   │  │  Bench: 100kg x 5    │        │
│  └──────────────────────┘  └──────────────────────┘        │
│                                                               │
│  ┌──────────────────────┐  ┌──────────────────────┐        │
│  │  Recent Workouts     │  │  Progress Over Time  │        │
│  │  📋 Last 5 sessions  │  │  📈 Line chart        │        │
│  │  "Full Body A"       │  │  Squat: +15kg/12wk   │        │
│  └──────────────────────┘  └──────────────────────┘        │
│                                                               │
│  ┌────────────────────────────────────────────────┐         │
│  │  Active Program: Push/Pull/Legs - Week 5 of 12 │         │
│  │  Next workout: Pull Day - Tomorrow (Thu)        │         │
│  │  [View Program]  [Start Workout on Mobile]      │         │
│  └────────────────────────────────────────────────┘         │
└─────────────────────────────────────────────────────────────┘
```

**Layout** (Mobile - Stacked):
```
┌──────────────────┐
│ ☰  Dashboard  🔔 │
├──────────────────┤
│ [Date: 30 days▾] │
│                  │
│ ┌──────────────┐ │
│ │ Training Vol │ │
│ │ 📊 Chart     │ │
│ └──────────────┘ │
│                  │
│ ┌──────────────┐ │
│ │ Recent PRs   │ │
│ │ 🏆 List      │ │
│ └──────────────┘ │
│                  │
│ ┌──────────────┐ │
│ │ Recent WOs   │ │
│ │ 📋 List      │ │
│ └──────────────┘ │
│                  │
│ ... (stacked)    │
└──────────────────┘
```

**Card Specifications**:

**1. Training Volume Card**:
- **Data Source**: `GET /api/logs?startDate={date}&endDate={date}`
- **Client-Side Computation**:
  ```typescript
  const weeklyData = sessions.reduce((acc, session) => {
    const week = startOfWeek(new Date(session.sessionDate));
    const weekKey = format(week, 'yyyy-MM-dd');
    
    if (!acc[weekKey]) {
      acc[weekKey] = { totalSets: 0, totalVolume: 0, sessions: 0 };
    }
    
    session.logs?.forEach(exercise => {
      const setsCount = exercise.sets.length;
      const volume = exercise.sets.reduce((sum, set) => 
        sum + ((set.weight || 0) * (set.reps || 0)), 0);
      
      acc[weekKey].totalSets += setsCount;
      acc[weekKey].totalVolume += volume;
    });
    
    acc[weekKey].sessions += 1;
    return acc;
  }, {});
  ```
- **Visualization**: Recharts BarChart
- **Empty State**: "Track your first workout to see progress"

**2. Personal Records Card**:
- **Data Source**: `GET /api/logs` (recent sessions)
- **Client-Side Computation**:
  ```typescript
  const prs = sessions.flatMap(s => s.logs || [])
    .flatMap(ex => ex.sets.map(set => ({
      exerciseId: ex.exerciseId,
      exerciseName: ex.name,
      weight: set.weight,
      reps: set.reps,
      date: s.sessionDate,
      volume: (set.weight || 0) * (set.reps || 0)
    })))
    .sort((a, b) => b.volume - a.volume)  // Sort by volume
    .slice(0, 5);  // Top 5
  ```
- **Display**: List of exercises with weight x reps
- **Empty State**: "Your personal records will appear here"

**3. Recent Workouts Card**:
- **Data Source**: `GET /api/logs?limit=5&sort=desc`
- **Display**: Session date, title, duration, exercise count
- **Action**: Click → Open workout detail modal
- **Empty State**: "No workouts yet. Download mobile app to track."

**4. Progress Over Time Card**:
- **Data Source**: `GET /api/logs?exerciseId={selected}&startDate={date}`
- **Client-Side Computation**: Calculate est 1RM from sets
  ```typescript
  const estimated1RM = (weight, reps) => {
    if (reps === 1) return weight;
    // Epley formula: weight * (1 + reps/30)
    return weight * (1 + reps / 30);
  };
  
  const progressData = sessions
    .flatMap(s => s.logs || [])
    .filter(ex => ex.exerciseId === selectedExercise)
    .map(ex => {
      const maxSet = ex.sets.reduce((max, set) => {
        const est = estimated1RM(set.weight || 0, set.reps || 1);
        return est > max.est ? { est, set } : max;
      }, { est: 0, set: null });
      
      return {
        date: s.sessionDate,
        estimated1RM: maxSet.est,
        actualWeight: maxSet.set.weight,
        reps: maxSet.set.reps
      };
    });
  ```
- **Visualization**: Recharts LineChart
- **Controls**: Exercise selector dropdown, time range toggle
- **Empty State**: "Select an exercise to track progress"

**5. Active Program Card**:
- **Data Source**: `GET /api/routine?defaultRoutine=true` or last used
- **Display**: Program name, week progress, next workout
- **Actions**: "View Program", "Edit Program", "Change Program"
- **Empty State**: "Create your first program to get started"

### User Data State Detection (Critical for MVP)

**Purpose**: Determine if user is "new" (no data) or "existing" (has mobile data) to control feature access

**Implementation**: `lib/user/dataState.ts`

```typescript
export type UserDataState = 'new' | 'existing' | 'unknown';

export interface UserDataCheck {
  hasWorkouts: boolean;
  hasSessions: boolean;
  hasRoutines: boolean;
  state: UserDataState;
}

/**
 * Check if user has any existing data (workouts, sessions, or routines)
 * This determines whether they can use Program Builder or only view programs
 */
export async function checkUserDataState(userId: string): Promise<UserDataCheck> {
  try {
    const [workouts, sessions, routines] = await Promise.all([
      api.get<Workout[]>('/api/workout?limit=1'),
      api.get<WorkoutSession[]>('/api/logs?limit=1'),
      api.get<Routine[]>('/api/routine?limit=1')
    ]);
    
    const hasWorkouts = workouts.length > 0;
    const hasSessions = sessions.length > 0;
    const hasRoutines = routines.length > 0;
    
    const hasAnyData = hasWorkouts || hasSessions || hasRoutines;
    
    return {
      hasWorkouts,
      hasSessions,
      hasRoutines,
      state: hasAnyData ? 'existing' : 'new'
    };
  } catch (error) {
    console.error('Failed to check user data state:', error);
    return {
      hasWorkouts: false,
      hasSessions: false,
      hasRoutines: false,
      state: 'unknown'  // Fail-safe: treat as existing user (read-only)
    };
  }
}
```

**React Hook**:
```typescript
// hooks/useUserDataState.ts
export function useUserDataState() {
  return useQuery({
    queryKey: ['user', 'dataState'],
    queryFn: async () => {
      const user = await getCurrentUser();
      return checkUserDataState(user.id);
    },
    staleTime: 10 * 60 * 1000,  // 10 minutes (state rarely changes)
    retry: 1  // Don't retry too much on errors
  });
}
```

**Usage in Components**:
```typescript
// app/programs/create/page.tsx
export default function ProgramBuilderPage() {
  const { data: userState, isLoading } = useUserDataState();
  
  if (isLoading) {
    return <LoadingState />;
  }
  
  if (userState?.state === 'existing') {
    // Existing user: Show read-only message
    return (
      <Card className="max-w-2xl mx-auto mt-12">
        <CardHeader>
          <CardTitle>Program Builder</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>Coming Soon: Full Program Editing</AlertTitle>
            <AlertDescription>
              Program creation and editing is currently available for new accounts only.
              For existing users, full editing capabilities will be available in our next update.
              <br /><br />
              <strong>For now, you can:</strong>
              <ul className="list-disc list-inside mt-2">
                <li>View your existing programs (created on mobile)</li>
                <li>Use the mobile app to edit or create programs</li>
                <li>Import workout history from Hevy or Strong</li>
              </ul>
            </AlertDescription>
          </Alert>
          
          <div className="mt-6 flex gap-4">
            <Button onClick={() => router.push('/app/programs')}>
              View My Programs
            </Button>
            <Button variant="outline" onClick={() => router.push('/app/import')}>
              Import History
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // New user: Show full program builder
  return <ProgramBuilder />;
}
```

**Feature Access Matrix**:

| Feature | New User | Existing User | Phase 2 (All Users) |
|---------|----------|---------------|---------------------|
| **Dashboard** | ✅ (mostly empty) | ✅ (populated) | ✅ (populated) |
| **History View** | ✅ (empty) | ✅ (mobile data) | ✅ (synced) |
| **Import CSV** | ✅ | ✅ | ✅ |
| **Profile Edit** | ✅ | ✅ | ✅ |
| **Program Builder** | ✅ **FULL** | ❌ **READ-ONLY** | ✅ **FULL** |
| **Program Edit** | ✅ | ❌ | ✅ |
| **Program Delete** | ✅ | ❌ | ✅ |

**Onboarding Access Control** (Branching at Login):
```typescript
// After login/signup success (BEFORE showing any onboarding)
async function handlePostAuth(userId: string) {
  const userState = await checkUserDataState(userId);
  
  if (userState.state === 'existing') {
    // Existing user: NO onboarding at all
    analytics.track('User Data State Detected', {
      state: 'existing',
      hasWorkouts: userState.hasWorkouts,
      hasSessions: userState.hasSessions,
      redirectTo: 'dashboard_direct'
    });
    
    router.push('/app');  // Direct to dashboard
  } else {
    // New user: Start full 9-step onboarding
    analytics.track('User Data State Detected', {
      state: 'new',
      redirectTo: 'onboarding'
    });
    
    analytics.track('Onboarding Started', {
      totalSteps: 9
    });
    
    router.push('/onboarding/profile');  // Step 1
  }
}

// No need to check user state DURING onboarding
// Only new users ever reach onboarding screens
```

---

### Global Date Range Filter

**Component**: `components/dashboard/DateRangeFilter.tsx`

```typescript
type DateRange = '7days' | '30days' | '90days' | 'all';

export function DateRangeFilter({ 
  value, 
  onChange 
}: { 
  value: DateRange; 
  onChange: (range: DateRange) => void 
}) {
  return (
    <Select 
      value={value} 
      onValueChange={(val) => {
        onChange(val as DateRange);
        analytics.track('Dashboard Filter Changed', {
          filterType: 'dateRange',
          value: val
        });
      }}
    >
      <SelectTrigger>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="7days">Last 7 Days</SelectItem>
        <SelectItem value="30days">Last 30 Days</SelectItem>
        <SelectItem value="90days">Last 90 Days</SelectItem>
        <SelectItem value="all">All Time</SelectItem>
      </SelectContent>
    </Select>
  );
}
```

**State Management**:
- Stored in URL query param: `?range=30days`
- Persists across page reloads
- Affects all dashboard cards simultaneously

---

## State Management

### React Query Configuration

```typescript
// lib/react-query/client.ts
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,  // 5 minutes
      gcTime: 10 * 60 * 1000,    // 10 minutes (formerly cacheTime)
      retry: 3,
      refetchOnWindowFocus: true,
      refetchOnReconnect: true
    },
    mutations: {
      retry: 1
    }
  }
});
```

**Provider Setup**:
```typescript
// app/app/layout.tsx
'use client';
import { QueryClientProvider } from '@tanstack/react-query';

export default function AppLayout({ children }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
```

### Query Keys Strategy

**Hierarchical Keys**:
```typescript
// Query key patterns
const queryKeys = {
  // User
  user: ['user'] as const,
  userProfile: ['user', 'profile'] as const,
  
  // Workouts
  workouts: ['workouts'] as const,
  workout: (id: string) => ['workouts', id] as const,
  
  // Routines
  routines: ['routines'] as const,
  routine: (id: string) => ['routines', id] as const,
  
  // Sessions
  sessions: ['sessions'] as const,
  sessionsByDate: (start: string, end: string) => 
    ['sessions', 'by-date', start, end] as const,
  session: (id: string) => ['sessions', id] as const,
  
  // Aggregated data (computed client-side)
  weeklyVolume: (dateRange: string) => ['stats', 'volume', dateRange] as const,
  personalRecords: ['stats', 'prs'] as const,
  progressChart: (exerciseId: string, dateRange: string) => 
    ['stats', 'progress', exerciseId, dateRange] as const
};
```

**Invalidation Strategy**:
```typescript
// After creating a workout
queryClient.invalidateQueries({ queryKey: queryKeys.workouts });

// After importing sessions
queryClient.invalidateQueries({ queryKey: queryKeys.sessions });
queryClient.invalidateQueries({ queryKey: ['stats'] });  // All stats

// After updating profile
queryClient.invalidateQueries({ queryKey: queryKeys.user });
```

### Optimistic Updates

**Example - Update Profile**:
```typescript
export function useUpdateProfile() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (updates: Partial<UserProfile>) => 
      api.patch('/api/user', updates),
    
    // Optimistic update
    onMutate: async (updates) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.userProfile });
      
      // Snapshot current value
      const previous = queryClient.getQueryData(queryKeys.userProfile);
      
      // Optimistically update
      queryClient.setQueryData(queryKeys.userProfile, (old: UserProfile) => ({
        ...old,
        ...updates
      }));
      
      // Return rollback context
      return { previous };
    },
    
    // Rollback on error
    onError: (err, variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.userProfile, context.previous);
      }
      toast.error('Failed to update profile');
    },
    
    // Refetch on success
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.userProfile });
      toast.success('Profile updated!');
    }
  });
}
```

---

## Phase 2 Overview (WatermelonDB)

### Why Phase 2 Exists

**The Problem with MVP Approach**:
```
Mobile App Changes → Backend (via sync) → Changes table updated ✅
Web App Changes → Backend (via REST) → Only data tables updated ❌
                                     → Changes table NOT updated ❌
                                     → Mobile doesn't pull changes ❌
                                     → OUT OF SYNC 🔴
```

**Phase 2 Solution**:
```
Web App → WatermelonDB (IndexedDB) → Sync Adapter → /push-changes
                                                   → Changes table ✅
                                                   → Data tables ✅
Mobile App → pull-changes → Gets web changes ✅
Web App → pull-changes → Gets mobile changes ✅
                → PERFECT SYNC 🟢
```

### Migration Trigger

**When to Migrate from Phase 1 to Phase 2**:
1. **Existing users demand program editing on web** (currently read-only)
2. User reports data not syncing between web and mobile (edge cases)
3. Backend team prioritizes sync endpoints for web
4. Offline support becomes a priority feature
5. User data volume makes client-side aggregation slow

### Benefits of Phase 2 Migration

**Removes MVP Constraints**:
- ✅ **All users can edit programs on web** (not just new users)
- ✅ **Perfect mobile/web sync** (Changes table updated)
- ✅ **Offline support** (IndexedDB persistence)
- ✅ **Faster dashboard** (local queries vs network)
- ✅ **Consistent architecture** (same as mobile)

**Current Constraint (MVP)**:
- ⚠️ Existing users can only **view** programs on web, not edit
- ⚠️ New users can edit (safe because mobile syncs down on first login)

**After Phase 2**:
- ✅ All users have full editing capabilities
- ✅ Instant bidirectional sync (web ↔ mobile)

---

## WatermelonDB Integration

### WatermelonDB on Web

**Installation** (https://watermelondb.dev/docs/Installation):
```bash
npm install @nozbe/watermelondb
npm install --save-dev @babel/plugin-proposal-decorators
npm install --save-dev @babel/plugin-proposal-class-properties
npm install --save-dev @babel/plugin-transform-runtime
```

**Next.js Configuration**:
```javascript
// next.config.js
module.exports = {
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      'react-native-sqlite-storage': false,
    };
    return config;
  },
  experimental: {
    esmExternals: 'loose',
  }
};
```

**Babel Config** (`.babelrc`):
```json
{
  "presets": ["next/babel"],
  "plugins": [
    ["@babel/plugin-proposal-decorators", { "legacy": true }],
    ["@babel/plugin-proposal-class-properties", { "loose": true }],
    [
      "@babel/plugin-transform-runtime",
      {
        "helpers": true,
        "regenerator": true
      }
    ]
  ]
}
```

### Schema Definition (Matching Mobile v83)

**File**: `lib/db/schema.ts`

```typescript
import { appSchema, tableSchema } from '@nozbe/watermelondb';

export const webAppSchema = appSchema({
  version: 83,  // Match mobile app schema version
  tables: [
    // Routines (Programs)
    tableSchema({
      name: 'routines',
      columns: [
        { name: 'title', type: 'string' },
        { name: 'description', type: 'string', isOptional: true },
        { name: 'default_routine', type: 'boolean' },
        { name: 'is_migrated', type: 'boolean', isOptional: true },
        { name: 'migrated_at', type: 'number', isOptional: true },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' }
      ]
    }),
    
    // Workout Templates
    tableSchema({
      name: 'active_workouts',
      columns: [
        { name: 'is_saved', type: 'boolean', isOptional: true },
        { name: 'is_finished', type: 'boolean', isOptional: true },
        { name: 'is_active', type: 'boolean', isOptional: true },
        { name: 'title', type: 'string' },
        { name: 'notes', type: 'string', isOptional: true },
        { name: 'routine_id', type: 'string', isOptional: true },
        { name: 'modified', type: 'boolean', isOptional: true },
        { name: 'is_template', type: 'boolean', isOptional: true },
        { name: 'is_migrated', type: 'boolean', isOptional: true },
        { name: 'migrated_at', type: 'number', isOptional: true },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' }
      ]
    }),
    
    // Workout Exercises (Template Exercises)
    tableSchema({
      name: 'active_workout_exercises',
      columns: [
        { name: 'workout_id', type: 'string', isIndexed: true },
        { name: 'exercise_id', type: 'string' },
        { name: 'name', type: 'string' },
        { name: 'primary_muscle_group', type: 'string' },
        { name: 'exercise_type', type: 'string', isOptional: true },
        { name: 'notes', type: 'string', isOptional: true },
        { name: 'order', type: 'number' },
        { name: 'rest_time', type: 'number', isOptional: true },
        { name: 'modified', type: 'boolean', isOptional: true },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
        { name: 'is_migrated', type: 'boolean', isOptional: true },
        { name: 'migrated_at', type: 'number', isOptional: true },
        { name: 'is_primary_superset', type: 'boolean', isOptional: true },
        { name: 'superset_id', type: 'string', isOptional: true },
        { name: 'is_template', type: 'boolean', isOptional: true }
      ]
    }),
    
    // Workout Exercise Sets
    tableSchema({
      name: 'active_workout_exercise_sets',
      columns: [
        { name: 'workout_exercise_id', type: 'string', isIndexed: true },
        { name: 'reps', type: 'number', isOptional: true },
        { name: 'weight', type: 'number', isOptional: true },
        { name: 'weight_pounds', type: 'number', isOptional: true },
        { name: 'duration', type: 'number', isOptional: true },
        { name: 'distance', type: 'number', isOptional: true },
        { name: 'previous_reps', type: 'number', isOptional: true },
        { name: 'previous_weight', type: 'number', isOptional: true },
        { name: 'previous_duration', type: 'number', isOptional: true },
        { name: 'previous_distance', type: 'number', isOptional: true },
        { name: 'rpe', type: 'number', isOptional: true },
        { name: 'rest_time', type: 'number', isOptional: true },
        { name: 'order', type: 'number', isOptional: true },
        { name: 'modified', type: 'boolean', isOptional: true },
        { name: 'is_active', type: 'boolean', isOptional: true },
        { name: 'is_template', type: 'boolean', isOptional: true },
        { name: 'is_migrated', type: 'boolean', isOptional: true },
        { name: 'migrated_at', type: 'number', isOptional: true },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' }
      ]
    }),
    
    // Workout Sessions (Completed Workouts - "logs")
    tableSchema({
      name: 'logs',
      columns: [
        { name: 'session_id', type: 'string' },
        { name: 'workout_id', type: 'string', isOptional: true },
        { name: 'workout_title', type: 'string', isOptional: true },
        { name: 'session_date', type: 'string' },
        { name: 'duration', type: 'string', isOptional: true },
        { name: 'notes', type: 'string', isOptional: true },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
        { name: 'is_imported', type: 'boolean', isOptional: true },
        { name: 'imported_at', type: 'string', isOptional: true }
      ]
    }),
    
    // Exercise Instances in Sessions
    tableSchema({
      name: 'log_exercise',
      columns: [
        { name: 'session_id', type: 'string', isIndexed: true },
        { name: 'session_date', type: 'string' },
        { name: 'workout_id', type: 'string' },
        { name: 'exercise_id', type: 'string' },
        { name: 'name', type: 'string' },
        { name: 'primary_muscle_group', type: 'string' },
        { name: 'exercise_type', type: 'string', isOptional: true },
        { name: 'notes', type: 'string', isOptional: true },
        { name: 'order', type: 'number' },
        { name: 'rest_time', type: 'number', isOptional: true },
        { name: 'modified', type: 'boolean', isOptional: true },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
        { name: 'is_primary_superset', type: 'boolean', isOptional: true },
        { name: 'superset_id', type: 'string', isOptional: true },
        { name: 'is_imported', type: 'boolean', isOptional: true },
        { name: 'imported_at', type: 'string', isOptional: true }
      ]
    }),
    
    // Sets within Exercise Instances
    tableSchema({
      name: 'log_exercise_sets',
      columns: [
        { name: 'log_exercise_id', type: 'string', isIndexed: true },
        { name: 'session_id', type: 'string', isIndexed: true },
        { name: 'session_date', type: 'string' },
        { name: 'exercise_id', type: 'string' },
        { name: 'reps', type: 'number', isOptional: true },
        { name: 'weight', type: 'number', isOptional: true },
        { name: 'weight_pounds', type: 'number', isOptional: true },
        { name: 'duration', type: 'number', isOptional: true },
        { name: 'distance', type: 'number', isOptional: true },
        { name: 'rpe', type: 'number', isOptional: true },
        { name: 'rest_time', type: 'number', isOptional: true },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
        { name: 'index', type: 'number' },
        { name: 'is_imported', type: 'boolean', isOptional: true },
        { name: 'imported_at', type: 'string', isOptional: true }
      ]
    }),
    
    // User Settings
    tableSchema({
      name: 'user_settings',
      columns: [
        { name: 'start_of_week', type: 'string' },
        { name: 'weight_unit', type: 'string', isOptional: true },
        { name: 'distance_unit', type: 'string', isOptional: true },
        { name: 'height_unit', type: 'string', isOptional: true },
        { name: 'timer_sound', type: 'string', isOptional: true },
        { name: 'theme', type: 'string', isOptional: true },
        { name: 'timer_sound_volume', type: 'number', isOptional: true },
        { name: 'default_rest_timer', type: 'string', isOptional: true },
        { name: 'keep_wake_during_workout', type: 'boolean', isOptional: true },
        { name: 'rpe_tracking', type: 'boolean', isOptional: true },
        { name: 'inline_timer', type: 'boolean', isOptional: true },
        { name: 'previous_workout_values', type: 'string', isOptional: true }
      ]
    })
    
    // Note: 14 more tables in mobile schema (session overrides, drafts, etc.)
    // Will need to replicate full schema for Phase 2
  ]
});
```

### Model Definitions

**File**: `lib/db/models.ts`

```typescript
import { Model, Q } from '@nozbe/watermelondb';
import { field, text, relation, children, date, readonly } from '@nozbe/watermelondb/decorators';

export class Routine extends Model {
  static table = 'routines';
  
  @text('title') title!: string;
  @text('description') description?: string;
  @field('default_routine') defaultRoutine!: boolean;
  @field('is_migrated') isMigrated?: boolean;
  @field('migrated_at') migratedAt?: number;
  @readonly @date('created_at') createdAt!: Date;
  @readonly @date('updated_at') updatedAt!: Date;
  
  @children('active_workouts') workouts!: Query<ActiveWorkout>;
}

export class ActiveWorkout extends Model {
  static table = 'active_workouts';
  
  @field('is_saved') isSaved?: boolean;
  @field('is_finished') isFinished?: boolean;
  @text('title') title!: string;
  @text('notes') notes?: string;
  @field('routine_id') routineId?: string;
  @field('is_template') isTemplate?: boolean;
  @readonly @date('created_at') createdAt!: Date;
  @readonly @date('updated_at') updatedAt!: Date;
  
  @children('active_workout_exercises') exercises!: Query<ActiveWorkoutExercise>;
}

// ... 15+ more models matching mobile schema
```

### Sync Adapter Implementation

**File**: `lib/db/sync.ts`

```typescript
import { synchronize } from '@nozbe/watermelondb/sync';
import { database } from './WatermelonDB';
import { getFirebaseToken } from '@/lib/auth/firebase';

const BACKEND_API = process.env.NEXT_PUBLIC_BACKEND_API || 
                   'https://ezlift-server-production.fly.dev';

export async function syncDatabase() {
  const token = await getFirebaseToken();
  
  await synchronize({
    database,
    pullChanges: async ({ lastPulledAt, schemaVersion }) => {
      const response = await fetch(
        `${BACKEND_API}/api/sync/pull-changes?` +
        `lastPulledAt=${lastPulledAt}&schemaVersion=${schemaVersion}`,
        {
          headers: { 'x-jwt-token': token }
        }
      );
      
      if (!response.ok) {
        throw new Error(`Pull failed: ${response.status}`);
      }
      
      const { changes, timestamp } = await response.json();
      return { changes, timestamp };
    },
    
    pushChanges: async ({ changes, lastPulledAt }) => {
      const response = await fetch(
        `${BACKEND_API}/api/sync/push-changes`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-jwt-token': token
          },
          body: JSON.stringify({ changes, lastPulledAt })
        }
      );
      
      if (!response.ok) {
        throw new Error(`Push failed: ${response.status}`);
      }
    },
    
    // Log sync process for debugging
    onDidPullChanges: ({ timestamp }) => {
      console.log(`Synced successfully at ${timestamp}`);
    }
  });
}
```

### React Hooks for WatermelonDB

**File**: `hooks/db/useWorkouts.ts`

```typescript
import { useDatabase } from '@nozbe/watermelondb/hooks';
import { Q } from '@nozbe/watermelondb';
import { ActiveWorkout } from '@/lib/db/models';

export function useWorkouts() {
  const database = useDatabase();
  
  // Observe query (reactive - updates automatically)
  const workouts = database.get<ActiveWorkout>('active_workouts')
    .query()
    .observe();
  
  return useObservable(workouts, []);
}

export function useCreateWorkout() {
  const database = useDatabase();
  
  return async (workout: CreateWorkoutDTO) => {
    await database.write(async () => {
      await database.get<ActiveWorkout>('active_workouts').create(w => {
        w.title = workout.title;
        w.notes = workout.notes;
        w.isTemplate = true;
        // WatermelonDB auto-assigns id, created_at, updated_at
      });
    });
    
    // Trigger sync automatically
    await syncDatabase();
  };
}
```

---

## Migration Path (From Phase 1 to Phase 2)

### Migration Strategy

**Goal**: Migrate from React Query → WatermelonDB without breaking existing features

**Approach**: Feature flag + gradual cutover

### Step 1: Install WatermelonDB (No Breaking Changes)

```bash
npm install @nozbe/watermelondb
# Configure Babel (see above)
```

**Feature Flag**:
```typescript
// lib/features/flags.ts
export const features = {
  useWatermelonDB: process.env.NEXT_PUBLIC_USE_WATERMELON === 'true'
};
```

### Step 2: Initial Sync (Populate Local Database)

```typescript
// On first run with WatermelonDB enabled
async function initialSetup() {
  const database = getDatabase();
  
  // Check if database is empty
  const workoutCount = await database.get('active_workouts')
    .query()
    .fetchCount();
  
  if (workoutCount === 0) {
    // Trigger initial sync from backend
    console.log('First-time setup: syncing from backend...');
    await syncDatabase();  // lastPulledAt = 0 → full sync
    console.log('Initial sync complete!');
  }
}
```

### Step 3: Parallel Data Layer (Feature Flag)

```typescript
// hooks/api/useWorkouts.ts
export function useWorkouts() {
  if (features.useWatermelonDB) {
    // Phase 2: Use WatermelonDB
    return useWorkoutsFromWatermelon();
  } else {
    // Phase 1: Use React Query
    return useWorkoutsFromAPI();
  }
}
```

### Step 4: Component Updates

**Dashboard Cards** (no changes needed):
```typescript
// components/dashboard/TrainingVolumeCard.tsx
export function TrainingVolumeCard() {
  const { data: sessions } = useSessions();  // Abstraction hides Phase 1 vs 2
  
  // Same client-side aggregation logic works for both phases
  const weeklyData = aggregateByWeek(sessions);
  
  return <BarChart data={weeklyData} />;
}
```

### Step 5: Sync on User Actions

**Program Saved**:
```typescript
async function handleSaveProgram(program: Program) {
  if (features.useWatermelonDB) {
    // Create in local DB
    await createWorkout(program);
    // Sync to backend immediately
    await syncDatabase();
  } else {
    // Phase 1: Direct API call
    await api.post('/api/workout', program);
  }
  
  analytics.track('Program Saved');
}
```

### Step 6: Background Sync (Phase 2 Only)

```typescript
// lib/db/background-sync.ts
export function useBackgroundSync() {
  useEffect(() => {
    if (!features.useWatermelonDB) return;
    
    // Sync on certain user actions
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        syncDatabase();  // Sync when user returns to tab
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Periodic sync every 60 seconds
    const interval = setInterval(() => {
      syncDatabase();
    }, 60 * 1000);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearInterval(interval);
    };
  }, []);
}
```

### Migration Complete

**Criteria**:
- ✅ All features work with WatermelonDB
- ✅ Mobile and web perfectly synchronized
- ✅ No data loss during migration
- ✅ Performance acceptable (IndexedDB queries fast enough)
- ✅ Can remove React Query dependencies
- ✅ Feature flag removed, WatermelonDB is default

---

## Performance Strategy

### Performance Budgets

**Page Load**:
- Dashboard LCP: < 2.0s (p75)
- History List LCP: < 2.5s (p75)
- Program Builder LCP: < 3.0s (p75) - More complex UI acceptable

**Interactivity**:
- Dashboard card interactions: < 100ms
- Filter changes: < 200ms to update UI
- Form inputs: < 50ms response (optimistic updates)

**Data Fetching**:
- Initial dashboard render: < 1.5s (with SSR)
- Background refetch: < 500ms
- Chart rendering: < 200ms after data available

### Optimization Techniques

**1. Code Splitting**:
```typescript
// Lazy load heavy components
const ProgramBuilder = dynamic(
  () => import('@/components/programs/ProgramBuilder'),
  { 
    loading: () => <Skeleton className="h-screen" />,
    ssr: false  // Client-only for builder
  }
);

const ImportFlow = dynamic(
  () => import('@/components/import/ImportFlow'),
  { ssr: false }
);
```

**2. Chart Lazy Loading**:
```typescript
const RechartsBarChart = dynamic(
  () => import('recharts').then(mod => mod.BarChart),
  { ssr: false }
);
```

**3. Data Pagination**:
- Workout history: 20 sessions per page
- Infinite scroll for charts (load more data on scroll)
- Virtual scrolling for large lists (react-window if needed)

**4. Image Optimization**:
- Exercise images: Already optimized via S3 + Contentful
- Dashboard: No heavy images, chart SVGs only
- Use Next.js `<Image>` for any new images

**5. Bundle Size Management**:
```bash
# Check bundle size
npm run build
# Analyze: Look for large dependencies

# Potential optimizations:
# - Tree-shake Recharts (import only used components)
# - Defer analytics scripts (load after page interactive)
# - Lazy load PapaParse for import flow
```

---

## Security & Authentication

### Authentication Flow (Unchanged from Public Site)

**Reuses Existing**:
- Firebase client authentication
- Backend token verification
- HttpOnly session cookies
- Middleware route protection

**No Changes Needed**: Web app uses same auth infrastructure

### Data Access Security

**API Authorization**:
- All backend requests include `x-jwt-token` header
- Backend validates token and extracts user ID
- User can only access their own data (backend enforces)

**Client-Side Data Protection**:
- No sensitive data in localStorage
- React Query cache cleared on logout
- Phase 2: WatermelonDB cleared on logout

**HTTPS**:
- Netlify enforces HTTPS (automatic)
- Cookies have `Secure` flag in production

---

## Testing Strategy

### Unit Tests

**What to Test**:
- Client-side aggregation functions (volume, PRs, progress)
- CSV parsing logic (Hevy format → WorkoutSession objects)
- Exercise fuzzy matching (MiniSearch integration)
- Date formatting utilities
- Analytics event tracking (mock Amplitude/GA)

**Framework**: Jest (already configured in public website)

**Example**:
```typescript
// __tests__/aggregations/weeklyVolume.test.ts
import { aggregateByWeek } from '@/lib/stats/aggregations';

describe('aggregateByWeek', () => {
  it('groups sessions by week correctly', () => {
    const sessions = [
      { sessionDate: '2025-01-06', logs: [...] },
      { sessionDate: '2025-01-08', logs: [...] },
      { sessionDate: '2025-01-13', logs: [...] }  // Different week
    ];
    
    const result = aggregateByWeek(sessions);
    
    expect(result).toHaveLength(2);  // 2 weeks
    expect(result[0].totalSets).toBe(/* expected */);
  });
});
```

### Integration Tests

**What to Test**:
- Dashboard renders with real data
- Import flow end-to-end (upload CSV → create sessions)
- Program builder saves program correctly
- Profile updates persist

**Framework**: Testing Library + MSW (Mock Service Worker)

**Example**:
```typescript
// __tests__/integration/dashboard.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import { setupServer } from 'msw/node';
import { rest } from 'msw';

const server = setupServer(
  rest.get('/api/logs', (req, res, ctx) => {
    return res(ctx.json({ sessions: mockSessions }));
  })
);

test('dashboard loads and displays training volume', async () => {
  render(<DashboardPage />);
  
  await waitFor(() => {
    expect(screen.getByText('Training Volume')).toBeInTheDocument();
    expect(screen.getByText('45 sets this week')).toBeInTheDocument();
  });
});
```

### E2E Tests (Optional for MVP)

**Tool**: Playwright or Cypress

**Critical Flows**:
- Signup → Onboarding → Dashboard (happy path)
- Import CSV → View imported sessions in history
- Create program → See in programs list

---

## Backend Improvement Opportunities

### Post-MVP Backend Enhancements

**These are NOT required for MVP but will improve Phase 2:**

**1. Aggregation Endpoints** (Reduce client-side computation):
```
GET /api/stats/weekly-volume?startDate={date}&endDate={date}
  → Returns pre-computed weekly volume (faster than client-side)

GET /api/stats/personal-records?limit={n}
  → Returns top PRs (no need to fetch all sessions)

GET /api/stats/progress/:exerciseId?weeks={n}
  → Returns progression data for specific exercise
```

**2. Bulk Import Endpoint**:
```
POST /api/logs/bulk
  → Accept array of sessions (faster than one-by-one)
  → Return success count + failures
```

**3. Session Filtering**:
```
GET /api/logs?exerciseId={id}&startDate={date}&endDate={date}
  → Filter sessions by exercise (for progress charts)
```

**4. Dashboard Summary Endpoint**:
```
GET /api/dashboard/summary?range={days}
  → Returns all dashboard card data in one request
  → Reduces round trips (5 requests → 1 request)
```

### Backend vs Client-Side Tradeoffs

**Compute Client-Side When**:
- ✅ Flexible UI requirements (frequent changes)
- ✅ Low data volume (< 1000 records)
- ✅ Complex filtering (easier in JavaScript than SQL)
- ✅ MVP speed (no backend changes needed)

**Compute Server-Side When**:
- ✅ Large data volumes (> 10,000 records)
- ✅ Complex aggregations (multi-join queries)
- ✅ Performance critical (sub-100ms response)
- ✅ Shared across platforms (web + mobile + future)

---

## Development Roadmap

### Phase 1A: Foundation (Weeks 1-2)

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

### Phase 1B: Dashboard Cards (Weeks 3-4)

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

### Phase 1C: History & Profile (Week 5)

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

### Phase 1D: Import Flow (Week 6)

**CSV Import**:
- [ ] Install papaparse and minisearch
- [ ] Create CSV upload component
- [ ] Implement Hevy CSV parser (match mobile implementation)
- [ ] Fuzzy match exercises with library
- [ ] Create import summary screen
- [ ] Implement progress bar during import
- [ ] Test with sample Hevy CSV file
- [ ] Handle errors (invalid CSV, unmapped exercises)

### Phase 1E: Program Builder (Weeks 7-8)

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

### Phase 1F: Onboarding (Weeks 9-10)

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

### Phase 1G: Analytics & Polish (Week 11)

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

### Phase 2: WatermelonDB Migration (Post-MVP)

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

## Deployment Strategy

### Environment Variables (Netlify)

**New Variables for Web App**:
```env
# Analytics
NEXT_PUBLIC_AMPLITUDE_API_KEY=your_amplitude_key
# GA key already exists

# Backend API (optional override)
NEXT_PUBLIC_BACKEND_API=https://ezlift-server-production.fly.dev

# Feature Flags (Phase 2)
NEXT_PUBLIC_USE_WATERMELON=false  # true when migrating
```

### Build Configuration

**No Changes**: Same build process as public website
```bash
npm run generate-sitemap
npm run build
```

### Monitoring

**Metrics to Track**:
- Dashboard page load times (LCP, INP)
- API request failures (backend errors)
- CSV import success rate
- Analytics event delivery rate
- User session duration

**Tools**:
- Google Analytics (built-in)
- Amplitude (user behavior)
- Netlify Analytics (traffic, performance)
- Browser DevTools (Core Web Vitals)

---

## Summary & Next Steps

### What We've Designed

**Phase 1 (MVP)**:
- ✅ Dashboard-first web app with 5 priority cards
- ✅ Direct REST API integration (no backend changes)
- ✅ Client-side data aggregation for stats
- ✅ CSV import with client-side parsing
- ✅ Program builder with visual exercise selection
- ✅ 9-step onboarding flow
- ✅ Analytics integration (Amplitude + GA)
- ✅ Reuses public website components extensively

**Phase 2 (Post-MVP)**:
- ✅ WatermelonDB integration (IndexedDB)
- ✅ Perfect mobile/web synchronization via Changes table
- ✅ Offline-first capabilities
- ✅ Clear migration path from Phase 1

### Architecture Quality

**Strengths**:
- ✅ Pragmatic MVP scope (deliverable without backend changes)
- ✅ Reuses battle-tested components from public site
- ✅ Future-proof (Phase 2 path documented)
- ✅ Performance-first (SSR, code splitting, caching)
- ✅ Analytics-driven (comprehensive event tracking)

**MVP Constraints**:
- 🔴 **Program Builder NEW USERS ONLY** - Existing users cannot edit programs (read-only)
  - Rationale: Prevents mobile/web out-of-sync issues
  - Solution: User data state detection + conditional access
  - Removed in Phase 2 (WatermelonDB sync)
- ⚠️ Client-side aggregation may be slow with large datasets (mitigate with date range limits)
- ⚠️ No offline support in Phase 1 (acceptable for MVP)
- ⚠️ Multiple API calls for dashboard (can optimize post-MVP)

### Critical Implementation Notes

**For Developers**:

**🔴 MOST CRITICAL**:
1. **User Data State Detection** - MUST check if user has existing data before showing Program Builder
   - New users: Full builder access ✅
   - Existing users: Read-only view only ❌
   - Fail-safe: Default to read-only if detection fails
   - Prevents sync conflicts in MVP

**High Priority**:
2. **Reuse existing components** - Don't rebuild ExerciseCard, DebouncedSearchInput, etc.
3. **Match mobile CSV parsing** - Same fuzzy matching logic, same date formats
4. **Client-side aggregation** - Required for MVP, document backend endpoints for Phase 2
5. **Analytics everywhere** - Track all user actions, not just API calls
6. **Responsive design** - Desktop-first, but mobile web must work

**For Backend Team** (Post-MVP):
- Consider aggregation endpoints to reduce client-side computation
- Bulk import endpoint for faster CSV imports
- Dashboard summary endpoint (single request for all cards)

---

## Change Log

| Date | Version | Changes | Author |
|------|---------|---------|--------|
| 2025-01-10 | 1.0 | Initial full-stack architecture (Phase 1 MVP + Phase 2 WatermelonDB path) | Winston (Architect) |
| 2025-01-10 | 1.1 | **CRITICAL UPDATE**: Added user data state detection and new user vs existing user constraint. Program Builder only for new users in MVP. Identified backend requirement: REST endpoints must write to Changes table for mobile sync to work. | Winston (Architect) |
| 2025-01-10 | 1.2 | **ONBOARDING SIMPLIFICATION**: Updated based on UX feedback - existing users skip ALL onboarding (not just Steps 7-9). Branching at login, not after Step 6. Removed ExistingUserDashboardRedirect component. Simplified routing logic. Removed existing user onboarding analytics events. | Winston (Architect) |

---

## 🔴 CRITICAL OPEN QUESTION FOR BACKEND TEAM

**Issue**: For new users to create programs on web and have mobile sync them on first login, the backend's REST endpoints (POST /api/routine, POST /api/workout, etc.) **MUST write to Changes table**.

**Current State** (from code review):
- ✅ `/verify` endpoint writes to Changes table when creating default routine
- ❌ `POST /api/routine` does NOT write to Changes table (only writes to routines table)
- ❌ `POST /api/workout` likely does NOT write to Changes table

**Options for MVP**:

**Option A: Modify Backend REST Endpoints** (Recommended):
- Update POST/PATCH/DELETE for routines and workouts to also write to Changes table
- Ensures mobile's initial sync (pull-changes with lastPulledAt=0) retrieves web-created programs
- Estimated effort: 2-3 hours per endpoint × 6 endpoints = ~12-18 hours
- ✅ Enables full Program Builder for new users
- ✅ Perfect sync with mobile

**Option B: Limit Web Program Creation** (Simpler, No Backend Changes):
- New users can create ONE program during onboarding only
- Disable "Create New Program" for ALL users after onboarding
- Message: "Create additional programs on mobile app"
- ✅ Zero backend changes
- ⚠️ Very limited web functionality (less valuable MVP)

**Option C: Pure Read-Only for Everyone** (Safest):
- ALL users (new and existing) can only VIEW programs on web
- Program Builder available only in Phase 2 (WatermelonDB)
- ✅ Zero sync issues
- ✅ Zero backend changes
- ⚠️ Least valuable MVP (dashboard and history only)

**Recommendation**: **Option A** if backend team can commit ~18 hours to modify 6 endpoints. Otherwise **Option B** for zero-backend-change MVP.

---

**Document Status**: ✅ Architecture Complete - **Pending Backend Team Decision on Option A vs B vs C**  
**Next Steps**:
1. **URGENT**: Clarify with backend team (Option A, B, or C)
2. Update architecture based on decision
3. Refine PRD with Product team
4. Shard architecture documents
5. Begin story creation

