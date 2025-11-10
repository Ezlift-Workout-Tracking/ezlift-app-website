import { startOfWeek } from 'date-fns';
import type { NormalizedSession } from '@/lib/services/sessions';
import { calculateEstimated1RM } from './one-rep-max';

export interface WeeklyMetricsPoint {
  weekStart: Date;
  est1rm: number | null; // weekly max Epley 1RM
  maxWeight: number | null; // weekly max single-set weight
  totalWeight: number; // weekly sum weight*reps
}

/**
 * Aggregate sessions into weekly metrics for a given exercise.
 * - est1rm: weekly max Epley across all sets
 * - maxWeight: weekly max single-set weight
 * - totalWeight: weekly sum of weight*reps across all sets
 */
export function aggregateWeeklyMetrics(
  sessions: NormalizedSession[] = [],
  exerciseId: string,
  startDate?: Date,
  endDate?: Date,
  weekStartsOn: 0 | 1 | 2 | 3 | 4 | 5 | 6 = 1
): WeeklyMetricsPoint[] {
  if (!exerciseId) return [];
  const map = new Map<string, WeeklyMetricsPoint>();

  for (const session of sessions) {
    const d = new Date(session.sessionDate);
    if (startDate && d < startDate) continue;
    if (endDate && d > endDate) continue;

    // Only create a weekly point if we actually find logs for this exercise
    let created = false;
    let point: WeeklyMetricsPoint | null = null;

    const ensurePoint = () => {
      if (created) return point!;
      const w = startOfWeek(d, { weekStartsOn });
      const key = w.toISOString().slice(0, 10);
      if (!map.has(key)) {
        map.set(key, { weekStart: w, est1rm: null, maxWeight: null, totalWeight: 0 });
      }
      point = map.get(key)!;
      created = true;
      return point!;
    };

    for (const log of session.logs || []) {
      const id = log.exerciseId || log.id;
      if (id !== exerciseId) continue;
      const p = ensurePoint();
      for (const set of log.sets || []) {
        const weight = typeof set.weight === 'number' ? set.weight : 0;
        const reps = typeof set.reps === 'number' ? set.reps : 0;
        if (weight > 0 && reps > 0) {
          const e = calculateEstimated1RM(weight, reps);
          if (e > (p.est1rm ?? 0)) p.est1rm = e;
          p.totalWeight += weight * reps;
          if (weight > (p.maxWeight ?? 0)) p.maxWeight = weight;
        } else if (weight > 0) {
          if (weight > (p.maxWeight ?? 0)) p.maxWeight = weight;
        }
      }
    }
  }

  return Array.from(map.values()).sort((a, b) => a.weekStart.getTime() - b.weekStart.getTime());
}

export function summarizeSeries(values: Array<number | null>) {
  const seq = values.filter((v): v is number => typeof v === 'number' && Number.isFinite(v));
  if (seq.length === 0) return null;
  const start = seq[0];
  const current = seq[seq.length - 1];
  const changeAbs = current - start;
  const changePct = start === 0 ? 0 : (changeAbs / start) * 100;
  return { start, current, changeAbs, changePct };
}
