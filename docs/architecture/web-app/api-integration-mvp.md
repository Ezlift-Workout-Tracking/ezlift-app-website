# API Integration (MVP)

## Backend API Endpoints (Available)

**Base URL**: `https://ezlift-server-production.fly.dev`

**Authentication**:
- Header: `x-jwt-token: {firebaseIdToken}`
- Token refresh: Client handles via Firebase SDK
- Session cookies: Managed by Next.js API routes (proxy pattern)

### User & Profile Endpoints

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

### Routine (Program) Endpoints

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

### Workout Template Endpoints

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

### Workout Session (Log) Endpoints

```
GET    /workout-log           List ALL workout sessions (history) - no filtering supported
GET    /workout-log/:id       Get session details
POST   /workout-log           Create workout session
PATCH  /workout-log/:id       Update session
DELETE /workout-log/:id       Delete session
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

## API Client Architecture

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

## Error Handling Strategy

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
