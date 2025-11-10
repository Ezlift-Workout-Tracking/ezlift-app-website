# MVP Overview (Phase 1)

## Critical MVP Constraint 🔴

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

## MVP Sync Flow Diagrams

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

## What We're Building

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

## What Makes This Different from Mobile

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
