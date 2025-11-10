'use client';

/**
 * User Data State Hook
 * 
 * Detects and caches whether a user is "new" (no data) or "existing" (has data).
 * Uses React Query for caching with 10-minute stale time.
 * 
 * FAIL-SAFE: Defaults to 'existing' (read-only) on errors
 */

import { useQuery } from '@tanstack/react-query';
import { detectUserDataStateWithMetadata, type UserDataState } from '@/lib/services/user-data-state';
import { useEffect } from 'react';

// Analytics will be imported when Story 1.1 analytics is implemented
// For now, we'll use a stub
const analytics = {
  track: (event: string, properties?: Record<string, any>) => {
    console.log('[Analytics]', event, properties);
  },
};

interface UserDataStateResult {
  state: UserDataState;
  hasWorkouts: boolean;
  hasSessions: boolean;
}

interface UseUserDataStateReturn {
  state: UserDataState;
  isLoading: boolean;
  error: Error | null;
  hasWorkouts: boolean;
  hasSessions: boolean;
}

/**
 * Hook to detect user data state
 * 
 * @returns {UseUserDataStateReturn} User state, loading flag, and metadata
 * 
 * @example
 * ```tsx
 * function ProgramBuilderGate({ children }) {
 *   const { state, isLoading } = useUserDataState();
 *   
 *   if (isLoading) return <Skeleton />;
 *   
 *   if (state === 'existing') {
 *     return <ReadOnlyMessage />;
 *   }
 *   
 *   return <>{children}</>; // New user → Full access
 * }
 * ```
 */
export function useUserDataState(): UseUserDataStateReturn {
  const { data, isLoading, error } = useQuery<UserDataStateResult>({
    queryKey: ['user', 'data-state'],
    queryFn: detectUserDataStateWithMetadata,
    staleTime: 10 * 60 * 1000,  // 10 minutes (longer than default)
    gcTime: 30 * 60 * 1000,      // 30 minutes
    retry: 3,                     // Retry 3 times on failure
    refetchOnWindowFocus: false,  // Don't refetch on window focus (state doesn't change often)
    refetchOnReconnect: false,    // Don't refetch on reconnect
  });

  // Fire analytics event when detection completes
  useEffect(() => {
    if (data && !isLoading) {
      analytics.track('User Data State Detected', {
        state: data.state,
        hasWorkouts: data.hasWorkouts,
        hasSessions: data.hasSessions,
        timestamp: new Date().toISOString(),
      });
    }
  }, [data, isLoading]);

  // Fire error analytics event
  useEffect(() => {
    if (error) {
      analytics.track('User Data State Detection Error', {
        error: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  }, [error]);

  // Return with fail-safe default
  return {
    state: data?.state || (error ? 'existing' : 'unknown'),
    isLoading,
    error: error as Error | null,
    hasWorkouts: data?.hasWorkouts || false,
    hasSessions: data?.hasSessions || false,
  };
}

/**
 * Invalidate user data state cache
 * Call this after:
 * - CSV import completion
 * - Program creation
 * - Workout logging
 */
export function invalidateUserDataState(queryClient: any) {
  queryClient.invalidateQueries({ queryKey: ['user', 'data-state'] });
}



