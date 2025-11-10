# Feature Specifications

## Dashboard Feature

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
- **Data Source**: `GET /workout-log` (all sessions, client-side date filtering)
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
- **Data Source**: `GET /workout-log` (all sessions, client-side filtering for recent)
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
- **Data Source**: `GET /workout-log` (all sessions, client-side filtering for limit=5)
- **Display**: Session date, title, duration, exercise count
- **Action**: Click → Open workout detail modal
- **Empty State**: "No workouts yet. Download mobile app to track."

**4. Progress Over Time Card**:
- **Data Source**: `GET /workout-log` (all sessions, client-side filtering by exercise and date)
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

## User Data State Detection (Critical for MVP)

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
      api.get<WorkoutSession[]>('/workout-log'), // All sessions, client-side filtering
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

## Global Date Range Filter

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
