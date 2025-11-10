# Backend Sync Architecture - Critical Understanding

**Document Purpose**: Foundation for Web App Architecture Design  
**Created**: 2025-01-10  
**Author**: Winston (Architect)  
**Status**: Backend Analysis Complete

---

## Executive Summary

The EzLift backend implements a **Changes Table-based sync architecture** that is critical for maintaining consistency between mobile apps and any future web app. **The web app MUST use this same sync mechanism** to avoid out-of-sync issues.

### Critical Constraint 🔴

**ALL data modifications must go through the sync endpoints:**
- `POST /api/sync/push-changes` - Write changes + update Changes table
- `GET /api/sync/pull-changes` - Read changes since last sync

**Using direct REST endpoints (POST /workouts, PUT /exercises) will break mobile sync** because they don't update the Changes table.

---

## Changes Table Schema

**Location**: `/Users/belalgouda/Development_Projects/Active_Projects/ezlift_server/src/database/entity/changes.entity.ts`

```typescript
@Entity("changes")
export class Changes {
    @PrimaryGeneratedColumn()
    id: number;
    
    @Column({ type: "varchar", length: 255 })
    tableName: string;  // e.g., "workout", "routine", "user_settings"
    
    @Column({ type: "varchar", length: 255 })
    recordId: string;  // UUID of the affected record
    
    @Column({ type: "varchar", length: 255 })
    changeType: string;  // "created", "updated", or "deleted"
    
    @Column({ type: "jsonb", nullable: true })
    changes: Record<string, any>;  // The actual data or changes
    
    @Column({ type: "varchar", length: 255, nullable: true })
    userId: string;  // Who made the change
    
    @ManyToOne(() => UserProfile, user => user.id)
    user: UserProfile;
    
    @Column({ type: "bigint" })
    timestamp: number;  // Unix timestamp in milliseconds
}
```

### Key Characteristics

- **Append-only log**: Never delete or modify existing change records
- **Timestamp-based ordering**: All changes ordered by timestamp
- **User-scoped**: Each user only sees their own changes
- **Change types**:
  - `created`: New record created
  - `updated`: Existing record modified
  - `deleted`: Record removed (soft or hard delete)

---

## Sync Endpoints Deep Dive

### Push Changes Endpoint

**URL**: `POST /api/sync/push-changes`  
**Auth**: Required (Firebase JWT via `x-jwt-token` header)  
**Purpose**: Receive changes from clients and persist them atomically

**Request Body Structure**:
```typescript
{
  lastPulledAt: number,  // Last sync timestamp (for conflict detection)
  changes: {
    // User settings
    user_settings: {
      updated: IRemoteUserSettingsType[]
    },
    
    // Routines (Programs)
    routines: {
      created: IRemoteRoutineType[],
      updated: IRemoteRoutineType[],
      deleted: string[]  // Array of UUIDs
    },
    
    // Workouts (Templates)
    workouts: {
      created: IRemoteWorkoutType[],
      updated: IRemoteWorkoutType[],
      deleted: string[]
    },
    
    // Workout Exercises (Template exercises)
    workout_exercise: {
      created: IRemoteWorkoutExerciseType[],
      updated: IRemoteWorkoutExerciseType[],
      deleted: string[]
    },
    
    // Workout Exercise Sets (Template sets)
    workout_exercise_sets: {
      created: IRemoteWorkoutExerciseSetType[],
      updated: IRemoteWorkoutExerciseSetType[],
      deleted: string[]
    },
    
    // Workout Sessions (Completed workouts)
    logs: {
      created: IRemoteLogType[],
      updated: IRemoteLogType[],
      deleted: string[]
    },
    
    // Exercise instances within sessions
    log_exercise: {
      updated: IRemoteLogExerciseType[],
      deleted: string[]
    },
    
    // Sets within exercise instances
    log_exercise_sets: {
      updated: IRemoteLogExerciseSetType[]
    }
  }
}
```

**Processing Flow**:
1. **Authentication**: Verify Firebase JWT
2. **Start Transaction**: Create QueryRunner with transaction
3. **Initialize Services**:
   - `ChangeTrackingService` - Records all changes to Changes table
   - `ExerciseSyncService` - Handles exercise/set CRUD
   - `SessionSyncService` - Handles workout sessions
   - `UserSettingsSyncService` - Handles user preferences
   - `WorkoutSyncService` - Handles workout templates and exercises
   - `RoutineSyncService` - Handles routine/program management
4. **Process Changes in Order**:
   - User settings updates
   - Routines (create → update → delete)
   - Workouts (create → update → delete)
   - Workout exercises (create → update → delete)
   - Workout exercise sets (create → update → delete)
   - Workout sessions/logs (create → update → delete)
   - Exercise instances within sessions
   - Sets within exercises
5. **Commit Transaction** or **Rollback on Error**
6. **Return Success**

**Critical Pattern**: Each service calls `changeTrackingService.trackChanges()` after successfully modifying data.

---

### Pull Changes Endpoint

**URL**: `GET /api/sync/pull-changes?lastPulledAt={timestamp}&schemaVersion={version}`  
**Auth**: Required (Firebase JWT)  
**Purpose**: Return all changes since last sync

**Query Parameters**:
- `lastPulledAt`: Unix timestamp of last successful pull (0 or "null" for initial sync)
- `schemaVersion`: Client schema version (for migration support)

**Response Structure**:
```typescript
{
  changes: Changes[],  // Array of change records
  timestamp: number    // Server timestamp for next pull
}
```

**Initial Sync (lastPulledAt = 0 or "null")**:
- Returns **consolidated state** of all user's data
- Groups changes by `tableName-recordId`
- For each record, returns only the **latest state** as "created"
- Merges multiple updates into single "created" record
- Includes static settings options (units, themes, etc.)

**Incremental Sync (lastPulledAt > 0)**:
- Returns all changes where `changes.timestamp > lastPulledAt`
- Ordered by timestamp (ASC)
- Client applies changes sequentially

---

## Data Models

### Core Entities

#### 1. UserProfile
- **Primary Key**: `id` (UUID)
- **Contains**: User authentication and basic profile data
- **Relationships**: One-to-Many with all user-scoped entities

#### 2. Routine (Program)
- **Primary Key**: `id` (UUID)
- **Fields**:
  - `title`: string
  - `description`: string (nullable)
  - `userId`: string
  - `order`: number (nullable)
  - `defaultRoutine`: boolean
- **Relationships**: Many-to-Many with Workout (via join table `routine_workout`)

#### 3. Workout (Template)
- **Primary Key**: `id` (UUID)
- **Fields**:
  - `title`: string
  - `userId`: string
  - `notes`: string (nullable)
  - `order`: number (nullable)
  - `estimatedDuration`: number (nullable)
- **Relationships**:
  - One-to-Many with WorkoutExercise
  - One-to-Many with WorkoutSession
  - Many-to-Many with Routine

#### 4. WorkoutExercise (Template Exercise)
- **Primary Key**: `id` (UUID)
- **Fields**:
  - `isSaved`: boolean (default true)
  - `restTime`: number (nullable)
  - `sets`: JSONB array of set configurations
  - `order`: number (nullable)
  - `notes`: string (nullable)
- **Relationships**:
  - Many-to-One with Workout
  - Many-to-One with Exercise (from exercise library)
- **Sets Structure** (JSONB):
  ```typescript
  Array<{
    id?: string;
    reps?: number;
    weight?: number;
    duration?: number;
    distance?: number;
    notes?: string;
    restTime?: number;
    rpe?: number;
  }>
  ```

#### 5. WorkoutSession (Completed Workout)
- **Primary Key**: `id` (UUID)
- **Fields**:
  - `userId`: string
  - `duration`: string (nullable)
  - `workoutTitle`: string (nullable)
  - `notes`: string (nullable)
  - `isImported`: boolean (default false)
  - `importedAt`: Date (nullable)
  - `sessionDate`: timestamp (auto-generated)
- **Relationships**:
  - Many-to-One with UserProfile
  - One-to-Many with Log (exercise instances)

#### 6. Log (Exercise Instance within Session)
- **Primary Key**: `id` (UUID)
- **Fields**: (Not shown in excerpt, but contains exercise execution data)
- **Relationships**:
  - Many-to-One with WorkoutSession
  - Contains sets as nested JSON

#### 7. Exercise (Library)
- **Primary Key**: `id` (number)
- **Contains**: Exercise definitions (name, muscle groups, instructions, etc.)
- **Source**: PostgreSQL database, also accessed by public website
- **Sync**: NOT synced via Changes table (read-only reference data)

---

## Sync Services Architecture

### Service Pattern

Each sync service:
1. **Constructor**: Receives `QueryRunner` and `ChangeTrackingService`
2. **Methods**: Handle create/update/delete for specific entity types
3. **Transaction**: All operations within same transaction via QueryRunner
4. **Change Tracking**: Calls `trackChanges()` after successful DB operation

### Service Hierarchy

```
SyncController
  ├─ ChangeTrackingService (writes to Changes table)
  ├─ UserSettingsSyncService
  │    └─ Handles user_settings updates
  ├─ RoutineSyncService
  │    └─ Handles routine CRUD
  ├─ WorkoutSyncService
  │    ├─ Handles workout CRUD
  │    ├─ Handles workout_exercise CRUD
  │    └─ Handles workout_exercise_sets CRUD
  ├─ SessionSyncService
  │    ├─ Uses ExerciseSyncService for nested operations
  │    └─ Handles workout session (log) CRUD
  └─ ExerciseSyncService
       └─ Handles exercise instances and sets within sessions
```

### Example Service Implementation

**ChangeTrackingService**:
```typescript
export class ChangeTrackingService {
    constructor(private queryRunner: QueryRunner) {}
    
    async trackChanges(
        changes: <various types>,
        userId: string,
        tableName: string,
        recordId: string,
        changeType: "created" | "updated" | "deleted",
        timestamp: number
    ): Promise<void> {
        const changesRepo = this.queryRunner.manager.getRepository(Changes);
        await changesRepo.save({
            userId,
            tableName,
            recordId,
            changeType,
            changes,
            timestamp
        });
    }
}
```

**Usage in WorkoutSyncService** (example):
```typescript
async handleCreateWorkouts(changes, userId, lastPulledAt) {
    const workoutsToCreate = changes.workouts?.created || [];
    
    for (const workout of workoutsToCreate) {
        // 1. Create workout in database
        const newWorkout = await workoutRepo.save({
            id: workout.id,
            title: workout.title,
            userId,
            notes: workout.notes,
            order: workout.order
        });
        
        // 2. Track the change
        await this.changeTrackingService.trackChanges(
            workout,           // The data
            userId,           // User who made change
            "workouts",       // Table name
            workout.id,       // Record ID
            "created",        // Change type
            lastPulledAt     // Timestamp
        );
    }
}
```

---

## WatermelonDB Integration (Mobile Apps)

### Current Mobile Architecture

**Mobile App** → **WatermelonDB (SQLite)** → **Sync Adapter** → **Backend Sync Endpoints**

**Flow**:
1. User makes changes in mobile app (create workout, log session, etc.)
2. WatermelonDB stores changes locally in SQLite
3. WatermelonDB's sync adapter:
   - Collects local changes since last sync
   - Calls `POST /push-changes` with batched changes
   - Receives response, calls `GET /pull-changes` with last timestamp
   - Applies remote changes to local database
4. UI reactively updates from WatermelonDB

**Key Benefits**:
- ✅ Offline-first (works without network)
- ✅ Optimistic updates (instant UI feedback)
- ✅ Automatic conflict resolution
- ✅ Batched network requests
- ✅ Change tracking built-in

---

## Implications for Web App Architecture

### Required Approach: WatermelonDB on Web

**Web App** → **WatermelonDB (IndexedDB)** → **Sync Adapter** → **Backend Sync Endpoints**

**Why This is Mandatory**:
1. **Mobile Compatibility**: Only way to keep mobile and web in sync
2. **Change Tracking**: WatermelonDB automatically formats changes for push-changes endpoint
3. **Consistency**: Same data model, same sync logic as mobile
4. **Offline Support**: Bonus feature for web users
5. **Simplified Development**: Reuse mobile app's WatermelonDB schema

### Alternative (NOT Recommended)

**Web App** → **Direct REST** → **Custom endpoint that updates Changes table**

**Why This is Problematic**:
- ❌ Requires building custom sync logic
- ❌ Must manually construct Changes table entries
- ❌ No offline support
- ❌ Different code path than mobile (more bugs)
- ❌ Must understand entire Changes table schema
- ❌ Risk of schema mismatches

---

## WatermelonDB Web Setup

**From WatermelonDB documentation** (https://watermelondb.dev/docs/Installation):

### Installation
```bash
yarn add @nozbe/watermelondb
```

### Babel Configuration
```json
{
  "plugins": [
    ["@babel/plugin-proposal-decorators", { "legacy": true }],
    ["@babel/plugin-proposal-class-properties", { "loose": true }],
    ["@babel/plugin-transform-runtime", {
      "helpers": true,
      "regenerator": true
    }]
  ]
}
```

### Storage
- **Mobile**: SQLite
- **Web**: IndexedDB (automatic, handled by WatermelonDB)

### Schema Definition
WatermelonDB requires defining schemas that match backend tables. Example:

```typescript
import { appSchema, tableSchema } from '@nozbe/watermelondb'

const schema = appSchema({
  version: 1,
  tables: [
    tableSchema({
      name: 'workouts',
      columns: [
        { name: 'title', type: 'string' },
        { name: 'notes', type: 'string', isOptional: true },
        { name: 'order', type: 'number', isOptional: true },
        { name: 'estimated_duration', type: 'number', isOptional: true },
        { name: 'user_id', type: 'string' },
        // WatermelonDB auto-adds: id, _status, _changed
      ]
    }),
    // ... other tables
  ]
})
```

### Sync Adapter
```typescript
import { synchronize } from '@nozbe/watermelondb/sync'

async function sync(database) {
  await synchronize({
    database,
    pullChanges: async ({ lastPulledAt }) => {
      const response = await fetch(
        `${API_URL}/pull-changes?lastPulledAt=${lastPulledAt}`,
        { headers: { 'x-jwt-token': token } }
      )
      const { changes, timestamp } = await response.json()
      return { changes, timestamp }
    },
    pushChanges: async ({ changes, lastPulledAt }) => {
      await fetch(`${API_URL}/push-changes`, {
        method: 'POST',
        headers: { 
          'x-jwt-token': token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ changes, lastPulledAt })
      })
    },
  })
}
```

---

## Database Schema Access

### Connection Details

The web app already has direct PostgreSQL access via:
- **File**: `lib/services/database.ts`
- **Connection**: Uses `pg.Pool` with `DATABASE_URL` env var
- **Current Use**: Exercise library queries (read-only)

### Changes Table Exploration

**Safe Read-Only Queries** (for understanding):
```sql
-- View table structure
\d changes

-- See recent changes for a user
SELECT * FROM changes 
WHERE "userId" = 'some-user-id'
ORDER BY timestamp DESC
LIMIT 10;

-- Count changes by table
SELECT "tableName", COUNT(*) as count
FROM changes
GROUP BY "tableName"
ORDER BY count DESC;

-- See change types distribution
SELECT "tableName", "changeType", COUNT(*) as count
FROM changes
GROUP BY "tableName", "changeType"
ORDER BY "tableName", "changeType";
```

**⚠️ CRITICAL**: Never `INSERT`, `UPDATE`, or `DELETE` from changes table directly. Only backend sync services should write to it.

---

## Next Steps for Web App Architecture

### Phase 1: Schema Design
1. Map backend entities to WatermelonDB schema
2. Define models with decorators
3. Define relationships
4. Version schema (start at v1)

### Phase 2: Sync Integration
1. Implement WatermelonDB sync adapter
2. Configure pull/push change handlers
3. Handle authentication (Firebase JWT)
4. Test initial sync and incremental sync

### Phase 3: Data Layer
1. Create React hooks for WatermelonDB queries
2. Implement optimistic updates
3. Handle offline scenarios
4. Add sync status indicators

### Phase 4: UI Integration
1. Connect dashboard cards to WatermelonDB
2. Implement workout history from local DB
3. Build program creation with local-first approach
4. Add import flow (CSV → backend → sync → local)

---

## Critical Design Decisions

### ✅ Confirmed Decisions

1. **Web app MUST use WatermelonDB** - No alternative approach viable
2. **All writes go through sync endpoints** - Never use direct REST for writes
3. **Schema must match mobile** - Ensure compatibility
4. **IndexedDB for web storage** - Handled automatically by WatermelonDB
5. **Offline-first architecture** - Works without network, syncs when available

### ❓ Open Questions

1. **Sync frequency**: How often should web app sync automatically?
   - Option A: On every user action (like mobile)
   - Option B: Periodic (every 30 seconds) + on action
   - Option C: Manual trigger + periodic background

2. **Initial load strategy**: How to handle first-time users?
   - Option A: Sync immediately after signup/onboarding
   - Option B: Lazy load data on demand
   - Option C: Sync in background during onboarding

3. **Import flow integration**: Where does CSV import fit?
   - Option A: Backend processes CSV → writes to tables + Changes table
   - Option B: Web parses CSV → creates records → pushes via sync
   - Option C: Hybrid (backend validates, web initiates sync)

4. **Program builder sync**: When to sync program creation?
   - Option A: Auto-save every change (instant sync)
   - Option B: Save draft locally, sync on "Save Program"
   - Option C: Sync on navigation away

5. **Analytics timing**: When to fire analytics events?
   - Option A: Before sync (optimistic, may fail)
   - Option B: After sync confirmation (accurate, delayed)
   - Option C: Separate analytics sync mechanism

---

## Summary

**The backend sync architecture is:**
- ✅ Well-documented and organized
- ✅ Battle-tested by mobile apps
- ✅ Transaction-safe and atomic
- ✅ User-scoped and secure
- ✅ Timestamp-based for ordering

**The web app must:**
- ✅ Use WatermelonDB for local storage
- ✅ Sync via push-changes / pull-changes endpoints only
- ✅ Match mobile app's schema definitions
- ✅ Handle offline scenarios gracefully
- ✅ Provide sync status feedback to users

**This architecture enables:**
- ✅ Seamless mobile ↔ web sync
- ✅ Offline-first web experience
- ✅ Consistent data model across platforms
- ✅ Simplified development (reuse mobile patterns)
- ✅ Future-proof for more platforms (desktop app, etc.)


