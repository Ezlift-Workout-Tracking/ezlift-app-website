/**
 * One-Rep Max (1RM) utilities using the Epley formula
 */

import type { NormalizedSession } from '@/lib/services/sessions';

export interface ProgressDataPoint {
  date: Date;
  estimatedOneRepMax: number;
  sessionId: string;
}

export interface ProgressStats {
  start: number;
  startDate: Date;
  current: number;
  changeAbs: number;
  changePct: number; // percentage (e.g., 11.5)
}

export function calculateEstimated1RM(weight: number, reps: number): number {
  if (!weight || weight <= 0 || !reps || reps <= 0) return 0;
  if (reps === 1) return weight;
  if (reps > 30) return weight; // outside reliable range; return weight as conservative
  return weight * (1 + reps / 30);
}

export function extractProgressData(
  sessions: NormalizedSession[] = [],
  exerciseId: string,
  startDate?: Date,
  endDate?: Date
): ProgressDataPoint[] {
  if (!exerciseId) return [];

  const points: ProgressDataPoint[] = [];

  sessions.forEach((session) => {
    const d = new Date(session.sessionDate);
    if (startDate && d < startDate) return;
    if (endDate && d > endDate) return;

    const logs = session.logs || [];
    let best = 0;
    logs.forEach((log) => {
      if (log.exerciseId !== exerciseId) return;
      (log.sets || []).forEach((set) => {
        const oneRM = calculateEstimated1RM(set.weight || 0, set.reps || 0);
        if (oneRM > best) best = oneRM;
      });
    });

    if (best > 0) {
      points.push({ date: d, estimatedOneRepMax: best, sessionId: session.id });
    }
  });

  return points.sort((a, b) => a.date.getTime() - b.date.getTime());
}

export function summarizeProgress(points: ProgressDataPoint[]): ProgressStats | null {
  if (!points || points.length === 0) return null;
  const start = points[0].estimatedOneRepMax;
  const current = points[points.length - 1].estimatedOneRepMax;
  const changeAbs = current - start;
  const changePct = start === 0 ? 0 : (changeAbs / start) * 100;
  return { start, startDate: points[0].date, current, changeAbs, changePct };
}

