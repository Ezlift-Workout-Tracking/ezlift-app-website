# Data Architecture (MVP)

## Data Flow Patterns

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

## Client-Side Data Storage

**For MVP (No IndexedDB/LocalStorage for persistence)**:
- React Query cache (in-memory only)
- Session storage for temporary UI state (filter selections, pagination)
- No offline data persistence

**For Phase 2**:
- WatermelonDB (IndexedDB) for persistent local storage
- Offline-first with sync

## Data Aggregation Strategy (Client-Side)

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
