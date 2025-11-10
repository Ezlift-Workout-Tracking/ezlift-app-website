/**
 * React Query hook for fetching workout logs (training history)
 * Story 1.8: Active Program Card
 */

import { useQuery } from '@tanstack/react-query';

export interface WorkoutSession {
  id: string;
  userId: string;
  workoutTitle: string;
  duration?: string;
  notes?: string;
  sessionDate: string;
  isImported: boolean;
  logs?: any[];
}

interface WorkoutLogsResponse {
  sessions: WorkoutSession[];
}

/**
 * Fetch workout logs (all sessions for the user)
 * API returns all sessions sorted by sessionDate desc
 * Response can be either array directly OR { sessions: [...] }
 */
async function fetchWorkoutLogs(): Promise<WorkoutSession[]> {
  const response = await fetch('/api/workout-log', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Unauthorized - please log in');
    }
    throw new Error('Failed to fetch workout logs');
  }

  const data = await response.json();
  
  // Handle both response formats: array directly OR { sessions: [...] }
  const sessions: WorkoutSession[] = Array.isArray(data) 
    ? data 
    : Array.isArray(data?.sessions) 
      ? data.sessions 
      : [];
  
  return sessions;
}

/**
 * Hook to fetch workout logs
 * Returns recent sessions (last 50) for performance
 */
export function useWorkoutLogs(limit: number = 50) {
  return useQuery({
    queryKey: ['workout-logs', limit],
    queryFn: async () => {
      const sessions = await fetchWorkoutLogs();
      // Return only recent sessions for performance
      return sessions.slice(0, limit);
    },
    staleTime: 2 * 60 * 1000, // 2 minutes (logs change frequently)
  });
}

