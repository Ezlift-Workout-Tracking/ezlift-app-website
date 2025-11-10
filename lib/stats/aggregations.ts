/**
 * Client-Side Aggregation Functions
 * 
 * Aggregates workout session data for dashboard analytics.
 * All calculations done in browser for MVP (minimizes backend changes).
 */

import { startOfWeek, format, isWithinInterval } from 'date-fns';

interface WorkoutSession {
  id: string;
  sessionDate: string; // ISO timestamp
  duration?: string;
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

interface WeeklyData {
  weekStart: Date;
  weekLabel: string;
  totalSets: number;
  totalVolume: number; // weight × reps summed
  sessionCount: number;
  isCurrentWeek: boolean;
}

/**
 * Aggregate sessions by week
 * 
 * Groups workout sessions by week and calculates:
 * - Total sets per week
 * - Total volume (weight × reps) per week
 * - Session count per week
 * 
 * @param sessions - Array of workout sessions
 * @param startDate - Start of date range
 * @param endDate - End of date range
 * @returns Array of weekly aggregations
 */
export function aggregateByWeek(
  sessions: WorkoutSession[],
  startDate: Date,
  endDate: Date
): WeeklyData[] {
  if (!sessions || sessions.length === 0) {
    return [];
  }

  // Group sessions by week
  const weekMap = new Map<string, WeeklyData>();
  const currentWeekStart = startOfWeek(new Date(), { weekStartsOn: 1 }); // Monday

  sessions.forEach((session) => {
    const sessionDate = new Date(session.sessionDate);
    
    // Skip sessions outside date range
    if (!isWithinInterval(sessionDate, { start: startDate, end: endDate })) {
      return;
    }

    const weekStart = startOfWeek(sessionDate, { weekStartsOn: 1 }); // Monday
    const weekKey = weekStart.toISOString();

    if (!weekMap.has(weekKey)) {
      weekMap.set(weekKey, {
        weekStart,
        weekLabel: format(weekStart, 'MMM d'), // "Jan 1"
        totalSets: 0,
        totalVolume: 0,
        sessionCount: 0,
        isCurrentWeek: weekStart.getTime() === currentWeekStart.getTime(),
      });
    }

    const weekData = weekMap.get(weekKey)!;
    weekData.sessionCount++;

    // Aggregate sets and volume from logs
    if (session.logs) {
      session.logs.forEach((log) => {
        if (log.sets) {
          log.sets.forEach((set) => {
            weekData.totalSets++;
            
            // Volume = weight × reps
            if (set.weight && set.reps) {
              weekData.totalVolume += set.weight * set.reps;
            }
          });
        }
      });
    }
  });

  // Convert map to array and sort by week
  return Array.from(weekMap.values()).sort(
    (a, b) => a.weekStart.getTime() - b.weekStart.getTime()
  );
}

/**
 * Calculate percentage change between two values
 * 
 * @param current - Current value
 * @param previous - Previous value
 * @returns Percentage change (e.g., 15 for 15% increase)
 */
export function calculatePercentageChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

/**
 * Format volume with unit (kg or lbs)
 * 
 * @param volume - Total volume
 * @param unit - Weight unit
 * @returns Formatted string (e.g., "12,500 kg")
 */
export function formatVolume(volume: number, unit: 'kg' | 'lbs' = 'kg'): string {
  return `${volume.toLocaleString()} ${unit}`;
}



