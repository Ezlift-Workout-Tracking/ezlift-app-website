/**
 * Program/Routine utility functions
 * Story 1.8: Active Program Card
 * 
 * CRITICAL: Active routine is determined by workout logs (actual training history),
 * not by a field on the routine object. "defaultRoutine" is just a starter routine.
 */

import { format } from 'date-fns';
import type { Routine, Workout } from '@/types/routine';

export interface NextWorkoutInfo {
  workout: Workout;
  dayLabel: string;
  fullDate: string;
}

export interface WorkoutSession {
  id: string;
  workoutTitle: string;
  sessionDate: string;
  logs?: any[];
}

/**
 * Find the active routine based on actual training history
 * The "active" routine is the one the user has been training with recently
 * 
 * @param routines - All user routines
 * @param recentSessions - Recent workout sessions from /api/workout-log
 * @returns The routine the user is currently training with
 */
export function findActiveRoutine(
  routines: Routine[], 
  recentSessions?: WorkoutSession[]
): Routine | null {
  if (!routines || routines.length === 0) return null;
  
  // If no training history, fall back to default routine or first routine
  if (!recentSessions || recentSessions.length === 0) {
    return routines.find(r => r.defaultRoutine) || routines[0];
  }
  
  // Get the most recent session (API returns sorted by sessionDate desc)
  const mostRecentSession = recentSessions[0];
  const lastWorkoutTitle = mostRecentSession?.workoutTitle;
  
  if (!lastWorkoutTitle) {
    return routines.find(r => r.defaultRoutine) || routines[0];
  }
  
  // Find which routine contains a workout with this title
  const activeRoutine = routines.find(routine => 
    routine.workouts?.some(workout => workout.title === lastWorkoutTitle)
  );
  
  // If no match found, fall back to default or first routine
  return activeRoutine || routines.find(r => r.defaultRoutine) || routines[0];
}

/**
 * Get the next workout in a routine based on training history
 * Looks at the pattern of completed workouts to determine what's next
 * 
 * @param routine - The active routine
 * @param recentSessions - Recent workout sessions
 * @returns Next workout with display info, or null
 */
export function getNextWorkout(
  routine: Routine,
  recentSessions?: WorkoutSession[]
): NextWorkoutInfo | null {
  if (!routine || !routine.workouts || routine.workouts.length === 0) {
    return null;
  }
  
  // If no training history, suggest first workout in routine
  if (!recentSessions || recentSessions.length === 0) {
    return {
      workout: routine.workouts[0],
      dayLabel: 'Start',
      fullDate: format(new Date(), 'MMM d'),
    };
  }
  
  // Get workout titles from this routine
  const routineWorkoutTitles = routine.workouts.map(w => w.title);
  
  // Filter sessions to only those from this routine
  const routineSessions = recentSessions
    .filter(s => s.workoutTitle && routineWorkoutTitles.includes(s.workoutTitle))
    .sort((a, b) => new Date(b.sessionDate).getTime() - new Date(a.sessionDate).getTime());
  
  if (routineSessions.length === 0) {
    // No history for this routine, start with first workout
    return {
      workout: routine.workouts[0],
      dayLabel: 'Start',
      fullDate: format(new Date(), 'MMM d'),
    };
  }
  
  // Find the last completed workout
  const lastCompletedWorkoutTitle = routineSessions[0].workoutTitle;
  const lastWorkoutIndex = routine.workouts.findIndex(w => w.title === lastCompletedWorkoutTitle);
  
  if (lastWorkoutIndex === -1) {
    // Workout not found in routine (shouldn't happen), start from beginning
    return {
      workout: routine.workouts[0],
      dayLabel: 'Next',
      fullDate: format(new Date(), 'MMM d'),
    };
  }
  
  // Next workout is the one after the last completed (cycle back to start if at end)
  const nextWorkoutIndex = (lastWorkoutIndex + 1) % routine.workouts.length;
  const nextWorkout = routine.workouts[nextWorkoutIndex];
  
  return {
    workout: nextWorkout,
    dayLabel: 'Next',
    fullDate: format(new Date(), 'MMM d'),
  };
}

/**
 * Calculate current week in program (placeholder for future feature)
 */
export function getCurrentWeek(routine: Routine, sessions?: WorkoutSession[]): { current: number; total: number } | null {
  // Week-based progression not implemented in MVP
  return null;
}

/**
 * Get mobile app deep link for starting a workout
 */
export function getMobileAppLink(): string {
  if (typeof window === 'undefined') return '#';
  
  const userAgent = navigator.userAgent;
  const isIOS = /iPhone|iPad|iPod/.test(userAgent);
  const isAndroid = /Android/.test(userAgent);
  
  if (isIOS) {
    return 'https://apps.apple.com/app/ezlift';
  } else if (isAndroid) {
    return 'https://play.google.com/store/apps/details?id=com.ezlift';
  }
  
  return '#';
}
