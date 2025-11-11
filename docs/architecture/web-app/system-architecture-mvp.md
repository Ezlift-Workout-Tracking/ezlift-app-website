# System Architecture (MVP)

## High-Level Data Flow

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

## Key Architectural Patterns

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
