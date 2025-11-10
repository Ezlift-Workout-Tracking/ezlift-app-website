/**
 * @jest-environment jsdom
 */

import { detectUserDataState, detectUserDataStateWithMetadata } from '@/lib/services/user-data-state';

// Mock fetch
global.fetch = jest.fn();

describe('detectUserDataState', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should return "new" when user has no workouts and no sessions', async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [], // API returns array directly, not { routines: [] }
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ sessions: [], total: 0 }),
      });

    const result = await detectUserDataState();

    expect(result).toBe('new');
    expect(global.fetch).toHaveBeenCalledTimes(2);
    expect(global.fetch).toHaveBeenCalledWith(
      '/api/workout?limit=1',
      expect.any(Object)
    );
    expect(global.fetch).toHaveBeenCalledWith(
      '/api/workout-log',
      expect.any(Object)
    );
  });

  it('should return "existing" when user has workouts', async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [
          // API returns array directly with user-created workout (not defaultRoutine)
          { id: '1', name: 'Test Workout', defaultRoutine: false }
        ],
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ sessions: [], total: 0 }),
      });

    const result = await detectUserDataState();

    expect(result).toBe('existing');
  });

  it('should return "existing" when user has sessions', async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [], // No workouts (array directly)
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          sessions: [{ id: '1', date: '2025-01-12' }],
          total: 1
        }),
      });

    const result = await detectUserDataState();

    expect(result).toBe('existing');
  });

  it('should return "existing" when user has both workouts and sessions', async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [
          // User-created workout (not defaultRoutine)
          { id: '1', name: 'Test Workout', defaultRoutine: false }
        ],
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          sessions: [{ id: '1', date: '2025-01-12' }],
          total: 1
        }),
      });

    const result = await detectUserDataState();

    expect(result).toBe('existing');
  });

  it('should default to "existing" when API returns error (fail-safe)', async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ error: 'Server error' }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ sessions: [], total: 0 }),
      });

    const result = await detectUserDataState();

    expect(result).toBe('existing');
  });

  it('should default to "existing" when fetch throws error', async () => {
    (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

    const result = await detectUserDataState();
    
    expect(result).toBe('existing');
  });

  it('should execute queries in parallel for performance', async () => {
    const fetchMock = global.fetch as jest.Mock;
    
    // Track when each fetch is called
    const callTimes: number[] = [];
    let callCount = 0;
    fetchMock.mockImplementation(() => {
      callTimes.push(Date.now());
      callCount++;
      return Promise.resolve({
        ok: true,
        // First call (workouts) returns array, second call (logs) returns object
        json: async () => callCount === 1 ? [] : { sessions: [] },
      });
    });

    await detectUserDataState();

    expect(fetchMock).toHaveBeenCalledTimes(2);
    
    // Both fetches should be called at nearly the same time (parallel)
    const timeDiff = Math.abs(callTimes[1] - callTimes[0]);
    expect(timeDiff).toBeLessThan(10); // Called within 10ms of each other
  });
});

describe('detectUserDataStateWithMetadata', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return metadata with state and flags', async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [], // Workouts API returns array directly
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          sessions: [{ id: '1' }],
          total: 1
        }),
      });

    const result = await detectUserDataStateWithMetadata();

    expect(result).toEqual({
      state: 'existing',
      hasWorkouts: false,
      hasSessions: true,
      duration: expect.any(Number),
    });
    expect(result.duration).toBeGreaterThan(0);
  });

  it('should measure detection duration', async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [], // Workouts API returns array directly
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ sessions: [], total: 0 }),
      });

    const result = await detectUserDataStateWithMetadata();

    expect(result.duration).toBeGreaterThanOrEqual(0);
    expect(typeof result.duration).toBe('number');
  });

  it('should return fail-safe metadata on error', async () => {
    (global.fetch as jest.Mock).mockRejectedValue(new Error('API error'));

    const result = await detectUserDataStateWithMetadata();
    
    expect(result).toEqual({
      state: 'existing',
      hasWorkouts: false,
      hasSessions: false,
      duration: expect.any(Number),
    });
  });
});

