# API Contracts - Web App MVP

**Version**: 1.0  
**Last Updated**: 2025-01-10  
**Architect**: Winston

---

## Base URLs

**Production**:
```
https://ezlift-server-production.fly.dev
```

**Development** (if running backend locally):
```
http://localhost:8080
```

**Environment Variable**:
```env
NEXT_PUBLIC_BACKEND_API=https://ezlift-server-production.fly.dev
```

---

## Authentication

**All authenticated requests require Firebase JWT token**:

```http
Headers:
  x-jwt-token: <Firebase ID Token>
  Content-Type: application/json
```

**Getting Token** (client-side):
```typescript
import { auth } from '@/lib/firebase/client';

const token = await auth.currentUser?.getIdToken();
```

**Token Refresh**:
- Firebase SDK automatically refreshes tokens
- Tokens valid for 1 hour
- Refresh happens automatically before expiration

---

## Endpoint Specifications

### **User & Profile Endpoints**

#### GET /api/user

**Purpose**: Fetch current user's profile and settings

**Headers**: `x-jwt-token` (required)

**Response** (200 OK):
```json
{
  "id": "user-uuid-string",
  "email": "user@example.com",
  "name": "John Doe",
  "yearsOfTraining": 2,
  "dateOfBirth": "1995-05-15T00:00:00.000Z",
  "settings": {
    "id": 123,
    "weightUnit": "kg",
    "distanceUnit": "km",
    "heightUnit": "cm",
    "theme": "light",
    "startOfWeek": "monday",
    "defaultRestTimer": "90",
    "timerSound": "beep",
    "timerSoundVolume": 0.5,
    "keepWakeDuringWorkout": true,
    "rpeTracking": false,
    "inlineTimer": false,
    "previousWorkoutValues": "last"
  }
}
```

**Errors**:
- `401 Unauthorized`: Invalid or missing JWT token
- `404 Not Found`: User not found in database

---

#### PATCH /api/user

**Purpose**: Update user profile or settings

**Headers**: `x-jwt-token` (required)

**Request Body**:
```json
{
  "name": "Updated Name",  // Optional
  "settings": {            // Optional, partial updates supported
    "weightUnit": "lbs",
    "bodyweight": 80
  }
}
```

**Response** (200 OK):
```json
{
  "id": "user-uuid",
  "email": "user@example.com",
  "name": "Updated Name",
  "settings": { /* updated settings */ }
}
```

**Errors**:
- `401 Unauthorized`: Invalid JWT
- `400 Bad Request`: Invalid data (e.g., weightUnit not "kg" or "lbs")
- `404 Not Found`: User not found

---

### **Routine (Program) Endpoints**

#### GET /api/routine

**Purpose**: List user's routines/programs

**Headers**: `x-jwt-token` (required)

**Query Params**: None

**Response** (200 OK):
```json
[
  {
    "id": "routine-uuid",
    "title": "Push/Pull/Legs",
    "description": "Intermediate program for muscle building",
    "order": 1,
    "defaultRoutine": false,
    "userId": "user-uuid",
    "workouts": [
      {
        "id": "workout-uuid",
        "title": "Push Day",
        "notes": "Focus on chest and shoulders",
        "order": 1,
        "estimatedDuration": 60
      }
      // ... more workouts
    ]
  }
  // ... more routines
]
```

**Errors**:
- `401 Unauthorized`: Invalid JWT

---

#### GET /api/routine/:id

**Purpose**: Get specific routine with full workout details

**Headers**: `x-jwt-token` (required)

**URL Params**: `id` (routine UUID)

**Response** (200 OK):
```json
{
  "id": "routine-uuid",
  "title": "Push/Pull/Legs",
  "description": "Intermediate program",
  "order": 1,
  "defaultRoutine": false,
  "userId": "user-uuid",
  "workouts": [
    {
      "id": "workout-uuid",
      "title": "Push Day",
      "notes": "Focus on chest and shoulders",
      "order": 1,
      "estimatedDuration": 60,
      "workoutExercises": [
        {
          "id": "workout-exercise-uuid",
          "exerciseId": "exercise-id",
          "name": "Barbell Bench Press",
          "primaryMuscleGroup": "Chest",
          "exerciseType": "weight_reps",
          "notes": "",
          "order": 0,
          "restTime": 90,
          "sets": [
            {
              "id": "set-uuid",
              "reps": 8,
              "weight": 80,
              "restTime": 90
            }
          ]
        }
      ]
    }
  ]
}
```

**Errors**:
- `401 Unauthorized`: Invalid JWT
- `404 Not Found`: Routine not found or not owned by user

---

#### POST /api/routine

**Purpose**: Create new routine/program

**Headers**: `x-jwt-token` (required)

**Request Body**:
```json
{
  "title": "My New Program",
  "description": "Custom training program",
  "workouts": ["workout-uuid-1", "workout-uuid-2"]  // Optional: Link existing workouts
}
```

**Response** (201 Created):
```json
{
  "id": "new-routine-uuid",
  "title": "My New Program",
  "description": "Custom training program",
  "order": 2,  // Auto-assigned
  "defaultRoutine": false,
  "userId": "user-uuid",
  "workouts": []
}
```

**Errors**:
- `401 Unauthorized`: Invalid JWT
- `400 Bad Request`: Invalid data (e.g., title missing)
- `404 Not Found`: Referenced workouts don't exist

**⚠️ MVP Note**: Backend writes to Changes table for mobile sync (confirmed working via migration)

---

#### PATCH /api/routine/:id

**Purpose**: Update existing routine

**Headers**: `x-jwt-token` (required)

**URL Params**: `id` (routine UUID)

**Request Body** (partial updates supported):
```json
{
  "title": "Updated Program Name",
  "description": "Updated description",
  "workouts": ["workout-uuid-1", "workout-uuid-2", "workout-uuid-3"]
}
```

**Response** (200 OK): Updated routine object

**Errors**:
- `401 Unauthorized`
- `404 Not Found`: Routine not found or can't edit (e.g., default routine)
- `400 Bad Request`: Invalid data

---

#### DELETE /api/routine/:id

**Purpose**: Delete routine

**Headers**: `x-jwt-token` (required)

**URL Params**: `id` (routine UUID)

**Response** (200 OK):
```json
{
  "message": "Routine deleted successfully"
}
```

**Errors**:
- `401 Unauthorized`
- `404 Not Found`: Routine not found or is default routine (can't delete)

---

### **Workout Template Endpoints**

#### GET /api/workout

**Purpose**: List user's workout templates

**Headers**: `x-jwt-token` (required)

**Query Params**: None (returns all user's workouts)

**Response** (200 OK):
```json
[
  {
    "id": "workout-uuid",
    "title": "Push Day",
    "notes": "Chest, shoulders, triceps",
    "order": 1,
    "estimatedDuration": 60,
    "userId": "user-uuid",
    "workoutExercises": [/* exercise details */]
  }
]
```

---

#### POST /api/workout

**Purpose**: Create new workout template

**Headers**: `x-jwt-token` (required)

**Request Body**:
```json
{
  "title": "New Workout",
  "notes": "Optional notes",
  "estimatedDuration": 45  // Optional, in minutes
}
```

**Response** (201 Created): Created workout object

**Errors**:
- `401 Unauthorized`
- `400 Bad Request`: Title missing or invalid

---

### **Workout Session (Log) Endpoints**

**⚠️ CRITICAL**: Backend API uses `/api/workout-log` endpoint (not `/api/logs` as originally documented). All web app implementations must use `/api/workout-log` for session operations.

**⚠️ IMPORTANT LIMITATION**: The `/api/workout-log` endpoint does NOT support date filtering, limit parameters, or sort parameters. It returns ALL workout sessions for the user, sorted by session date (most recent first). Frontend must handle date filtering and pagination client-side.

#### GET /api/workout-log

**Purpose**: Fetch ALL workout sessions (history) for the authenticated user

**Headers**: `x-jwt-token` (required)

**Query Params**: None supported (endpoint returns all sessions for user)

**⚠️ Backend Limitation**: This endpoint does not support date filtering, pagination, or sorting. It returns ALL workout sessions for the user, sorted by session date (most recent first). Frontend applications must implement client-side filtering and pagination.

**Response** (200 OK):
```json
{
  "sessions": [
    {
      "id": "session-uuid",
      "userId": "user-uuid",
      "workoutTitle": "Push Day",
      "duration": "01:15:30",
      "notes": "Felt strong today",
      "sessionDate": "2025-01-10T09:30:00.000Z",
      "isImported": false,
      "importedAt": null,
      "logs": [
        {
          "id": "log-exercise-uuid",
          "sessionId": "session-uuid",
          "exerciseId": "exercise-id",
          "name": "Barbell Bench Press",
          "primaryMuscleGroup": "Chest",
          "order": 0,
          "notes": "",
          "sets": [
            {
              "id": "set-uuid",
              "reps": 8,
              "weight": 80,
              "index": 0
            }
          ]
        }
      ]
    }
  ]
}
```

**Errors**:
- `401 Unauthorized`
- `400 Bad Request`: Invalid date format

---

#### POST /api/workout-log

**Purpose**: Create workout session (used by CSV import)

**Headers**: `x-jwt-token` (required)

**Request Body**:
```json
{
  "workoutTitle": "Full Body A",
  "sessionDate": "2025-01-10T09:00:00.000Z",
  "duration": "01:20:00",
  "notes": "Great workout",
  "isImported": true,      // Flag for imported sessions
  "importedAt": "2025-01-10T14:00:00.000Z",
  "logs": [
    {
      "exerciseId": "exercise-id",
      "name": "Barbell Bench Press",
      "primaryMuscleGroup": "Chest",
      "order": 0,
      "notes": "",
      "sets": [
        {
          "reps": 8,
          "weight": 80,
          "index": 0
        }
      ]
    }
  ]
}
```

**Response** (201 Created): Created session object

**Errors**:
- `401 Unauthorized`
- `400 Bad Request`: Invalid session data

**⚠️ Import Note**: For bulk imports, call this endpoint multiple times with progress tracking

---

## Error Response Format

**Standard Error Response**:
```json
{
  "error": "Error message",
  "code": "ERROR_CODE",     // Optional
  "details": { /* optional additional info */ }
}
```

**Common HTTP Status Codes**:
- `200 OK`: Success (GET, PATCH, DELETE)
- `201 Created`: Resource created (POST)
- `400 Bad Request`: Invalid input data
- `401 Unauthorized`: Missing or invalid JWT token
- `403 Forbidden`: Valid token but insufficient permissions
- `404 Not Found`: Resource doesn't exist or not owned by user
- `500 Internal Server Error`: Server error (retry recommended)

---

## Rate Limiting

**MVP**: No rate limiting implemented

**Phase 2**: May add rate limiting for:
- Authentication endpoints (prevent brute force)
- CSV upload endpoints (prevent abuse)
- Mutation endpoints (prevent spam)

---

## Request/Response Examples

### **Example: Create Program**

```typescript
// 1. Create routine
const routine = await fetch(`${API_URL}/api/routine`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-jwt-token': await getToken()
  },
  body: JSON.stringify({
    title: 'Push/Pull/Legs',
    description: 'Intermediate program'
  })
});

const { id: routineId } = await routine.json();

// 2. Create workout templates
const workout1 = await fetch(`${API_URL}/api/workout`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-jwt-token': await getToken()
  },
  body: JSON.stringify({
    title: 'Push Day',
    estimatedDuration: 60
  })
});

const { id: workout1Id } = await workout1.json();

// 3. Link workouts to routine
await fetch(`${API_URL}/api/routine/${routineId}`, {
  method: 'PATCH',
  headers: {
    'Content-Type': 'application/json',
    'x-jwt-token': await getToken()
  },
  body: JSON.stringify({
    workouts: [workout1Id, /* ... more workout IDs */]
  })
});

// 4. Fetch workout sessions (corrected endpoint)
const sessions = await fetch(`${API_URL}/api/workout-log`, {
  headers: {
    'x-jwt-token': await getToken()
  }
});

const { sessions: workoutSessions } = await sessions.json();
```

---

## Authentication Flow

**First-Time User**:
```
1. User signs up on web (Firebase)
2. Client gets Firebase ID token
3. Client calls POST /api/auth/session { idToken }
4. Web server calls POST /verify { token }
5. Backend verifies token, creates user if not exists
6. Backend creates default UserSettings and Routine
7. Backend writes to Changes table (for mobile sync)
8. Web server sets HttpOnly cookies (session-token, user-info)
9. Client redirects to /app
```

**Returning User**:
```
1. User logs in (Firebase)
2. Client gets Firebase ID token
3. Client calls POST /api/auth/session { idToken }
4. Web server calls POST /verify { token }
5. Backend verifies token, returns user data
6. Web server sets HttpOnly cookies
7. Client redirects to /app
```

---

## Error Handling Patterns

### **Network Errors**:
```typescript
try {
  const response = await fetch(url, options);
  
  if (!response.ok) {
    const error = await response.json();
    throw new APIError(response.status, error);
  }
  
  return response.json();
} catch (error) {
  if (error.status === 401) {
    // Session expired - redirect to login
    router.push('/login');
  } else if (error.status >= 500) {
    // Server error - show retry option
    toast.error('Server error. Please try again.');
  } else {
    // Client error - show specific message
    toast.error(error.message);
  }
}
```

### **Retry Strategy** (via React Query):
```typescript
useQuery({
  queryKey: ['workouts'],
  queryFn: fetchWorkouts,
  retry: 3,  // Retry 3 times
  retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000)
  // Exponential backoff: 1s, 2s, 4s
});
```

---

## Performance Considerations

**Response Times** (expected):
- GET /api/user: < 100ms
- GET /api/workout-log (all sessions): < 500ms (⚠️ may be slower with large datasets)
- POST /api/routine: < 200ms
- GET /api/workout: < 150ms

**Optimization**:
- Use React Query caching (5-minute stale time)
- Batch requests where possible
- ⚠️ Frontend must implement client-side date filtering (backend returns all sessions)
- Consider pagination for large datasets (1000+ sessions) in Phase 2

---

## Swagger Documentation

**Backend API Docs**: https://ezlift-server-production.fly.dev/documentation

**Note**: Swagger docs may show additional endpoints not used by web app. This document specifies ONLY the endpoints used by web app MVP.

---

## Change Log

| Date | Version | Changes | Author |
|------|---------|---------|--------|
| 2025-01-10 | 1.0 | Initial API contracts for web app MVP | Winston (Architect) |



