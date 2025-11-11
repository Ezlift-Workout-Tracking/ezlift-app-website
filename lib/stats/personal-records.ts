/**
 * Personal Records Calculation Functions
 * 
 * Calculates personal records (PRs) from workout session data.
 * A PR is defined as the maximum weight × reps for each unique exercise.
 */

import { format, isToday, isYesterday, differenceInCalendarDays } from 'date-fns';

interface WorkoutSession {
  id: string;
  sessionDate: string;
  logs?: LogExercise[];
}

interface LogExercise {
  id: string;
  name: string;
  sets: LogSet[];
}

interface LogSet {
  reps?: number;
  weight?: number;
  duration?: number;
  distance?: number;
}

export interface PersonalRecord {
  exerciseId: string;
  exerciseName: string;
  weight: number;
  reps: number;
  volume: number; // weight × reps
  date: Date;
  sessionId: string;
  isRecent: boolean; // within 7 days
}

/**
 * Calculate personal records from workout sessions within date range
 *
 * For each unique exercise, finds the maximum weight × reps (volume)
 * within the specified date range. Returns top 5 PRs sorted by volume descending.
 *
 * @param sessions - Array of workout sessions
 * @param startDate - Start of date range (optional, defaults to all time)
 * @param endDate - End of date range (optional, defaults to all time)
 * @returns Array of top 5 personal records
 */
export function calculatePersonalRecords(
  sessions: WorkoutSession[],
  startDate?: Date,
  endDate?: Date
): PersonalRecord[] {
  if (!sessions || sessions.length === 0) {
    return [];
  }

  const prMap = new Map<string, PersonalRecord>();
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  // Single pass through all sessions and sets
  sessions.forEach((session) => {
    const sessionDate = new Date(session.sessionDate);

    // Skip sessions outside date range
    if (startDate && sessionDate < startDate) return;
    if (endDate && sessionDate > endDate) return;

    session.logs?.forEach((log) => {
      log.sets?.forEach((set) => {
        const weight = set.weight || 0;
        const reps = set.reps || 0;
        const volume = weight * reps;

        // Skip bodyweight exercises or incomplete sets
        if (weight === 0 || reps === 0) {
          return;
        }

        const existing = prMap.get(log.id);

        // Update if no PR exists or this volume is higher
        if (!existing || volume > existing.volume) {
          prMap.set(log.id, {
            exerciseId: log.id,
            exerciseName: log.name,
            weight,
            reps,
            volume,
            date: sessionDate,
            sessionId: session.id,
            isRecent: sessionDate > sevenDaysAgo,
          });
        }
      });
    });
  });

  // Sort by volume descending, return top 5
  return Array.from(prMap.values())
    .sort((a, b) => b.volume - a.volume)
    .slice(0, 5);
}

/**
 * Format date as relative time or absolute date
 * 
 * Returns:
 * - "Today" for today
 * - "Yesterday" for yesterday
 * - "X days ago" for 2-6 days ago
 * - "MMM d" for dates 7+ days ago (e.g., "Jan 5")
 * 
 * @param date - Date to format
 * @returns Formatted date string
 */
export function formatRelativeDate(date: Date): string {
  // Use calendar-day comparisons to avoid time-zone and <24h edge cases
  if (isToday(date)) return 'Today';
  if (isYesterday(date)) return 'Yesterday';
  const days = differenceInCalendarDays(new Date(), date);
  if (days >= 2 && days < 7) return `${days} days ago`;
  return format(date, 'MMM d');
}

/**
 * Format weight with unit
 * 
 * @param weight - Weight value
 * @param unit - Weight unit (default: kg)
 * @returns Formatted string (e.g., "100 kg")
 */
export function formatWeight(weight: number, unit: 'kg' | 'lbs' = 'kg'): string {
  return `${weight} ${unit}`;
}


