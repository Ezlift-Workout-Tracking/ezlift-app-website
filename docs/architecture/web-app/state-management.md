# State Management

## React Query Configuration

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

## Query Keys Strategy

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

## Optimistic Updates

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
