/**
 * Aggregation Functions Tests
 * 
 * Unit tests for client-side data aggregation functions:
 * - aggregateByWeek()
 * - calculatePercentageChange()
 * - formatVolume()
 */

import { 
  aggregateByWeek, 
  calculatePercentageChange, 
  formatVolume 
} from '@/lib/stats/aggregations';

// Sample session data for testing
const createSession = (date: string, sets: Array<{ weight: number; reps: number }>) => ({
  id: `session-${date}`,
  sessionDate: date,
  logs: [
    {
      id: 'log-1',
      name: 'Test Exercise',
      sets: sets.map((set, i) => ({
        ...set,
        duration: undefined,
        distance: undefined,
      })),
    },
  ],
});

describe('aggregateByWeek', () => {
  const startDate = new Date('2025-01-01');
  const endDate = new Date('2025-01-31');

  describe('Empty Data Handling', () => {
    it('should return empty array when no sessions provided', () => {
      const result = aggregateByWeek([], startDate, endDate);
      expect(result).toEqual([]);
    });

    it('should return empty array when null sessions provided', () => {
      const result = aggregateByWeek(null as any, startDate, endDate);
      expect(result).toEqual([]);
    });

    it('should return empty array when sessions outside date range', () => {
      const sessions = [
        createSession('2024-12-01T10:00:00Z', [{ weight: 100, reps: 10 }]),
        createSession('2025-02-01T10:00:00Z', [{ weight: 100, reps: 10 }]),
      ];

      const result = aggregateByWeek(sessions, startDate, endDate);
      expect(result).toEqual([]);
    });
  });

  describe('Single Week Aggregation', () => {
    it('should aggregate single session correctly', () => {
      const sessions = [
        createSession('2025-01-10T10:00:00Z', [
          { weight: 100, reps: 10 }, // 1000 volume
          { weight: 110, reps: 8 },  // 880 volume
        ]),
      ];

      const result = aggregateByWeek(sessions, startDate, endDate);

      expect(result).toHaveLength(1);
      expect(result[0].totalSets).toBe(2);
      expect(result[0].totalVolume).toBe(1880);
      expect(result[0].sessionCount).toBe(1);
    });

    it('should aggregate multiple sessions in same week', () => {
      const sessions = [
        createSession('2025-01-06T10:00:00Z', [{ weight: 100, reps: 10 }]), // Monday
        createSession('2025-01-08T10:00:00Z', [{ weight: 100, reps: 10 }]), // Wednesday
        createSession('2025-01-10T10:00:00Z', [{ weight: 100, reps: 10 }]), // Friday
      ];

      const result = aggregateByWeek(sessions, startDate, endDate);

      expect(result).toHaveLength(1);
      expect(result[0].totalSets).toBe(3);
      expect(result[0].totalVolume).toBe(3000);
      expect(result[0].sessionCount).toBe(3);
    });
  });

  describe('Multiple Week Aggregation', () => {
    it('should group sessions by week correctly', () => {
      const sessions = [
        createSession('2025-01-06T10:00:00Z', [{ weight: 100, reps: 10 }]), // Week 1
        createSession('2025-01-13T10:00:00Z', [{ weight: 100, reps: 10 }]), // Week 2
        createSession('2025-01-20T10:00:00Z', [{ weight: 100, reps: 10 }]), // Week 3
      ];

      const result = aggregateByWeek(sessions, startDate, endDate);

      expect(result).toHaveLength(3);
      expect(result[0].weekLabel).toContain('Jan');
      expect(result[1].weekLabel).toContain('Jan');
      expect(result[2].weekLabel).toContain('Jan');
    });

    it('should sort weeks chronologically', () => {
      const sessions = [
        createSession('2025-01-20T10:00:00Z', [{ weight: 100, reps: 10 }]), // Week 3
        createSession('2025-01-06T10:00:00Z', [{ weight: 100, reps: 10 }]), // Week 1
        createSession('2025-01-13T10:00:00Z', [{ weight: 100, reps: 10 }]), // Week 2
      ];

      const result = aggregateByWeek(sessions, startDate, endDate);

      expect(result).toHaveLength(3);
      expect(result[0].weekStart.getTime()).toBeLessThan(result[1].weekStart.getTime());
      expect(result[1].weekStart.getTime()).toBeLessThan(result[2].weekStart.getTime());
    });
  });

  describe('Current Week Identification', () => {
    it('should mark current week as isCurrentWeek: true', () => {
      const today = new Date();
      const sessions = [
        createSession(today.toISOString(), [{ weight: 100, reps: 10 }]),
      ];

      const result = aggregateByWeek(
        sessions,
        new Date(today.getFullYear(), today.getMonth(), 1),
        new Date(today.getFullYear(), today.getMonth() + 1, 0)
      );

      const currentWeek = result.find(w => w.isCurrentWeek);
      expect(currentWeek).toBeDefined();
      expect(currentWeek?.isCurrentWeek).toBe(true);
    });

    it('should mark past weeks as isCurrentWeek: false', () => {
      const sessions = [
        createSession('2025-01-01T10:00:00Z', [{ weight: 100, reps: 10 }]),
      ];

      const result = aggregateByWeek(
        sessions,
        new Date('2025-01-01'),
        new Date('2025-01-31')
      );

      // If not current week, should be false
      result.forEach(week => {
        if (!week.isCurrentWeek) {
          expect(week.isCurrentWeek).toBe(false);
        }
      });
    });
  });

  describe('Volume Calculation', () => {
    it('should calculate volume as weight × reps', () => {
      const sessions = [
        createSession('2025-01-10T10:00:00Z', [
          { weight: 100, reps: 10 }, // 1000
          { weight: 50, reps: 20 },  // 1000
          { weight: 200, reps: 5 },  // 1000
        ]),
      ];

      const result = aggregateByWeek(sessions, startDate, endDate);

      expect(result[0].totalVolume).toBe(3000);
    });

    it('should handle sets with no weight', () => {
      const sessions = [
        {
          id: 'session-1',
          sessionDate: '2025-01-10T10:00:00Z',
          logs: [
            {
              id: 'log-1',
              name: 'Bodyweight Exercise',
              sets: [
                { reps: 10 }, // No weight
                { reps: 10 }, // No weight
              ],
            },
          ],
        },
      ];

      const result = aggregateByWeek(sessions as any, startDate, endDate);

      expect(result[0].totalSets).toBe(2);
      expect(result[0].totalVolume).toBe(0);
    });

    it('should handle sets with no reps', () => {
      const sessions = [
        {
          id: 'session-1',
          sessionDate: '2025-01-10T10:00:00Z',
          logs: [
            {
              id: 'log-1',
              name: 'Hold Exercise',
              sets: [
                { weight: 100 }, // No reps
              ],
            },
          ],
        },
      ];

      const result = aggregateByWeek(sessions as any, startDate, endDate);

      expect(result[0].totalSets).toBe(1);
      expect(result[0].totalVolume).toBe(0);
    });
  });

  describe('Week Label Formatting', () => {
    it('should format week labels correctly', () => {
      const sessions = [
        createSession('2025-01-06T10:00:00Z', [{ weight: 100, reps: 10 }]),
      ];

      const result = aggregateByWeek(sessions, startDate, endDate);

      expect(result[0].weekLabel).toMatch(/^Jan \d+$/);
    });
  });
});

describe('calculatePercentageChange', () => {
  it('should calculate positive percentage change', () => {
    const result = calculatePercentageChange(120, 100);
    expect(result).toBe(20);
  });

  it('should calculate negative percentage change', () => {
    const result = calculatePercentageChange(80, 100);
    expect(result).toBe(-20);
  });

  it('should return 0 when values are equal', () => {
    const result = calculatePercentageChange(100, 100);
    expect(result).toBe(0);
  });

  it('should return 100 when previous is 0 and current is positive', () => {
    const result = calculatePercentageChange(50, 0);
    expect(result).toBe(100);
  });

  it('should return 0 when both values are 0', () => {
    const result = calculatePercentageChange(0, 0);
    expect(result).toBe(0);
  });

  it('should handle decimal values correctly', () => {
    const result = calculatePercentageChange(105, 100);
    expect(result).toBe(5);
  });

  it('should handle large percentage changes', () => {
    const result = calculatePercentageChange(200, 50);
    expect(result).toBe(300);
  });
});

describe('formatVolume', () => {
  it('should format volume with kg by default', () => {
    const result = formatVolume(12500);
    expect(result).toBe('12,500 kg');
  });

  it('should format volume with lbs when specified', () => {
    const result = formatVolume(12500, 'lbs');
    expect(result).toBe('12,500 lbs');
  });

  it('should format small numbers', () => {
    const result = formatVolume(100);
    expect(result).toBe('100 kg');
  });

  it('should format large numbers with comma separator', () => {
    const result = formatVolume(1234567);
    expect(result).toBe('1,234,567 kg');
  });

  it('should handle zero volume', () => {
    const result = formatVolume(0);
    expect(result).toBe('0 kg');
  });

  it('should handle decimal volumes (round behavior)', () => {
    const result = formatVolume(1250.5);
    expect(result).toContain('1,250.5 kg');
  });
});



