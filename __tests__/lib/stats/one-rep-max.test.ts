import { calculateEstimated1RM, extractProgressData, summarizeProgress } from '@/lib/stats/one-rep-max';

describe('calculateEstimated1RM (Epley)', () => {
  it('returns weight for 1 rep', () => {
    expect(calculateEstimated1RM(120, 1)).toBe(120);
  });
  it('handles common inputs', () => {
    expect(calculateEstimated1RM(100, 5)).toBeCloseTo(116.7, 1);
    expect(calculateEstimated1RM(80, 10)).toBeCloseTo(106.7, 1);
    expect(calculateEstimated1RM(60, 15)).toBeCloseTo(90, 1);
  });
  it('returns weight for high reps > 30', () => {
    expect(calculateEstimated1RM(50, 35)).toBe(50);
  });
  it('returns 0 for invalid numbers', () => {
    expect(calculateEstimated1RM(0, 10)).toBe(0);
    expect(calculateEstimated1RM(100, 0)).toBe(0);
  });
});

const mkSession = (id: string, date: string, exerciseId: string, sets: Array<{ weight: number; reps: number }>) => ({
  id,
  sessionDate: date,
  logs: [
    {
      id: `${id}-log`,
      exerciseId,
      name: 'Test',
      sets: sets.map((s) => ({ weight: s.weight, reps: s.reps })),
    },
  ],
});

describe('extractProgressData', () => {
  it('filters sessions by exercise and sorts by date', () => {
    const sessions: any[] = [
      mkSession('a', '2025-01-02T00:00:00Z', 'bench', [{ weight: 100, reps: 5 }]),
      mkSession('b', '2025-01-01T00:00:00Z', 'bench', [{ weight: 90, reps: 5 }]),
      mkSession('c', '2025-01-03T00:00:00Z', 'squat', [{ weight: 140, reps: 5 }]),
    ];
    const data = extractProgressData(sessions as any, 'bench');
    expect(data).toHaveLength(2);
    expect(data[0].sessionId).toBe('b');
    expect(data[1].sessionId).toBe('a');
  });
});

describe('summarizeProgress', () => {
  it('calculates change stats', () => {
    const sessions: any[] = [
      mkSession('a', '2025-01-01T00:00:00Z', 'bench', [{ weight: 90, reps: 5 }]),
      mkSession('b', '2025-01-10T00:00:00Z', 'bench', [{ weight: 100, reps: 5 }]),
    ];
    const data = extractProgressData(sessions as any, 'bench');
    const stats = summarizeProgress(data)!;
    expect(stats.start).toBeGreaterThan(0);
    expect(stats.current).toBeGreaterThan(stats.start);
    expect(stats.changeAbs).toBeCloseTo(stats.current - stats.start, 3);
  });
});

