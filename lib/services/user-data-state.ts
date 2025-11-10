/**
 * User Data State Detection Service
 * 
 * Determines if a user is "new" (no data) or "existing" (has workout data)
 * to control feature access (program builder, onboarding, etc.)
 */

export type UserDataState = 'new' | 'existing' | 'unknown';

// API returns array directly for workouts
type WorkoutResponse = any[];

// API returns object with sessions array for logs
interface LogsResponse {
  sessions?: any[];
  total?: number;
}

/**
 * Detect whether user has existing workout data
 * 
 * Queries backend for workouts and session logs in parallel.
 * Returns 'new' if no data exists, 'existing' if any data exists.
 * 
 * FAIL-SAFE: Defaults to 'existing' on error (read-only mode)
 * 
 * @returns Promise<UserDataState>
 */
export async function detectUserDataState(): Promise<UserDataState> {
  const startTime = performance.now();
  
  try {
    // Parallel queries for performance (200ms vs 400ms sequential)
    const [workoutsResponse, logsResponse] = await Promise.all([
      fetch('/api/workout?limit=1', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
      }),
      fetch('/api/workout-log', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
      }),
    ]);

    // Check if both requests succeeded
    if (!workoutsResponse.ok || !logsResponse.ok) {
      console.warn('User data state detection: API error', {
        workoutsStatus: workoutsResponse.status,
        logsStatus: logsResponse.status,
      });
      
      // Fail-safe: Default to existing (read-only mode)
      return 'existing';
    }

    // Parse responses
    const workouts: WorkoutResponse = await workoutsResponse.json();
    const logs: LogsResponse | any[] = await logsResponse.json();

    // Check for data existence
    // Workouts API returns array directly
    // IMPORTANT: Exclude default routines - only count user-created routines
    const userRoutines = Array.isArray(workouts)
      ? workouts.filter(r => !r.defaultRoutine)
      : [];
    const hasWorkouts = userRoutines.length > 0;

    // Handle both response formats:
    // 1. { sessions: [...], total: number } (documented format)
    // 2. [...] (array format returned by backend)
    let hasSessions = false;
    let sessionsCount = 0;

    if (Array.isArray(logs)) {
      // Backend returns array directly
      hasSessions = logs.length > 0;
      sessionsCount = logs.length;
    } else {
      // Backend returns object with sessions property
      hasSessions = !!(logs?.sessions && logs.sessions.length > 0);
      sessionsCount = logs?.sessions?.length || 0;
    }
    
    console.log('[User Data State] Detection result:', {
      totalRoutines: Array.isArray(workouts) ? workouts.length : 0,
      defaultRoutines: Array.isArray(workouts) ? workouts.filter(r => r.defaultRoutine).length : 0,
      userRoutines: userRoutines.length,
      hasWorkouts,
      hasSessions,
      sessionsCount
    });

    const duration = performance.now() - startTime;
    
    // User has ANY data → Existing user
    if (hasWorkouts || hasSessions) {
      console.log('User data state detected: existing', {
        hasWorkouts,
        hasSessions,
        duration: `${duration.toFixed(0)}ms`,
      });
      return 'existing';
    }

    // No data at all → New user
    console.log('User data state detected: new', {
      hasWorkouts: false,
      hasSessions: false,
      duration: `${duration.toFixed(0)}ms`,
    });
    return 'new';

  } catch (error) {
    const duration = performance.now() - startTime;
    console.error('User data state detection failed:', error, {
      duration: `${duration.toFixed(0)}ms`,
    });
    
    // FAIL-SAFE: Default to existing (read-only mode)
    // Safer to restrict access than grant it incorrectly
    return 'existing';
  }
}

/**
 * Get detection metadata for analytics
 * Used internally by the hook to provide event properties
 */
export async function detectUserDataStateWithMetadata(): Promise<{
  state: UserDataState;
  hasWorkouts: boolean;
  hasSessions: boolean;
  duration: number;
}> {
  const startTime = performance.now();
  
  try {
    const [workoutsResponse, logsResponse] = await Promise.all([
      fetch('/api/workout?limit=1', { cache: 'no-store' }),
      fetch('/api/workout-log', { cache: 'no-store' }),
    ]);

    // Parse responses even if one failed (partial data is better than none)
    let hasWorkouts = false;
    let hasSessions = false;

    if (workoutsResponse.ok) {
      const workouts: WorkoutResponse = await workoutsResponse.json();
      // Workouts API returns array directly
      // IMPORTANT: Exclude default routines - only count user-created routines
      const userRoutines = Array.isArray(workouts) 
        ? workouts.filter(r => !r.defaultRoutine) 
        : [];
      hasWorkouts = userRoutines.length > 0;
      console.log('[User Data State] Workouts response:', { 
        totalCount: Array.isArray(workouts) ? workouts.length : 0,
        defaultRoutines: Array.isArray(workouts) ? workouts.filter(r => r.defaultRoutine).length : 0,
        userRoutines: userRoutines.length,
        hasData: hasWorkouts,
        sample: workouts[0] 
      });
    } else {
      console.warn('[User Data State] Workouts API failed:', workoutsResponse.status);
    }

    if (logsResponse.ok) {
      const logs: LogsResponse | any[] = await logsResponse.json();

      // Handle both response formats:
      // 1. { sessions: [...], total: number } (documented format)
      // 2. [...] (array format returned by backend)
      let sessionsArray: any[] = [];
      let total: number | undefined;

      if (Array.isArray(logs)) {
        // Backend returns array directly
        sessionsArray = logs;
        total = logs.length;
      } else {
        // Backend returns object with sessions property
        sessionsArray = logs.sessions || [];
        total = logs.total;
      }

      hasSessions = sessionsArray.length > 0;
      console.log('[User Data State] Logs response:', {
        count: sessionsArray.length,
        total: total,
        hasData: hasSessions
      });
    } else {
      console.warn('[User Data State] Logs API failed:', logsResponse.status);
      // Try to get error details
      try {
        const errorData = await logsResponse.json();
        console.warn('[User Data State] Logs API error details:', errorData);
      } catch (e) {
        console.warn('[User Data State] Could not parse error response');
      }
    }

    // If both failed, fail-safe to existing
    if (!workoutsResponse.ok && !logsResponse.ok) {
      return {
        state: 'existing',
        hasWorkouts: false,
        hasSessions: false,
        duration: performance.now() - startTime,
      };
    }

    const state: UserDataState = (hasWorkouts || hasSessions) ? 'existing' : 'new';

    return {
      state,
      hasWorkouts: hasWorkouts || false,
      hasSessions: hasSessions || false,
      duration: performance.now() - startTime,
    };

  } catch (error) {
    return {
      state: 'existing',
      hasWorkouts: false,
      hasSessions: false,
      duration: performance.now() - startTime,
    };
  }
}

