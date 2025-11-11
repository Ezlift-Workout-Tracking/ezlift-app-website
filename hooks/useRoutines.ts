/**
 * React Query hook for fetching user routines (programs)
 * Story 1.8: Active Program Card
 */

import { useQuery } from '@tanstack/react-query';
import type { Routine, RoutinesResponse } from '@/types/routine';

/**
 * Fetch all routines for the authenticated user
 */
async function fetchRoutines(): Promise<Routine[]> {
  const response = await fetch('/api/workout', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Unauthorized - please log in');
    }
    throw new Error('Failed to fetch routines');
  }

  const data = await response.json();
  // API returns array directly, not wrapped in an object
  return Array.isArray(data) ? data : [];
}

/**
 * Hook to fetch all user routines
 */
export function useRoutines() {
  return useQuery({
    queryKey: ['routines'],
    queryFn: fetchRoutines,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}


