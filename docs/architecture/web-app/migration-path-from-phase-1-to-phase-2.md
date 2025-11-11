# Migration Path (From Phase 1 to Phase 2)

## Migration Strategy

**Goal**: Migrate from React Query → WatermelonDB without breaking existing features

**Approach**: Feature flag + gradual cutover

## Step 1: Install WatermelonDB (No Breaking Changes)

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

## Step 2: Initial Sync (Populate Local Database)

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

## Step 3: Parallel Data Layer (Feature Flag)

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

## Step 4: Component Updates

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

## Step 5: Sync on User Actions

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

## Step 6: Background Sync (Phase 2 Only)

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

## Migration Complete

**Criteria**:
- ✅ All features work with WatermelonDB
- ✅ Mobile and web perfectly synchronized
- ✅ No data loss during migration
- ✅ Performance acceptable (IndexedDB queries fast enough)
- ✅ Can remove React Query dependencies
- ✅ Feature flag removed, WatermelonDB is default

---
