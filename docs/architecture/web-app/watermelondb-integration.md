# WatermelonDB Integration

## WatermelonDB on Web

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

## Schema Definition (Matching Mobile v83)

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

## Model Definitions

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

## Sync Adapter Implementation

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

## React Hooks for WatermelonDB

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
