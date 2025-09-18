/**
 * @jest-environment jsdom
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { useDebouncedSearch } from '../hooks/useDebouncedSearch';

// Mock fetch
global.fetch = jest.fn();

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    replace: jest.fn(),
  }),
}));

// Mock lodash.debounce
jest.mock('lodash.debounce', () => {
  return jest.fn((fn, delay, options) => {
    const debouncedFn = (...args: any[]) => {
      // For testing, we'll simulate the debounce behavior
      if (options?.leading === false && options?.trailing === true) {
        // Trailing debounce - only call after delay
        setTimeout(() => fn(...args), delay);
      }
    };
    debouncedFn.cancel = jest.fn();
    return debouncedFn;
  });
});

// Mock user agent for mobile detection
const mockUserAgent = (userAgent: string) => {
  Object.defineProperty(window.navigator, 'userAgent', {
    writable: true,
    value: userAgent,
  });
};

describe('useDebouncedSearch', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    // Default to desktop
    mockUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64)');
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should use trailing debounce - fire after last keystroke', async () => {
    const mockResponse = {
      exercises: [],
      total: 0,
      page: 1,
      limit: 15,
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const { result } = renderHook(() => useDebouncedSearch({}, { delayDesktop: 350 }));

    // Simulate typing "deadlift" with keystrokes every 100ms
    act(() => {
      result.current.onTermChange('d');
    });

    act(() => {
      jest.advanceTimersByTime(100);
    });

    act(() => {
      result.current.onTermChange('de');
    });

    act(() => {
      jest.advanceTimersByTime(100);
    });

    act(() => {
      result.current.onTermChange('dea');
    });

    act(() => {
      jest.advanceTimersByTime(100);
    });

    act(() => {
      result.current.onTermChange('deadlift');
    });

    // Should not have made any requests yet (still within debounce window)
    expect(global.fetch).not.toHaveBeenCalled();

    // Fast forward time by 350ms from last keystroke
    act(() => {
      jest.advanceTimersByTime(350);
    });

    // Should have made only one request with the final term after debounce
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('search=deadlift'),
        expect.any(Object)
      );
    });
  });

  it('should use mobile delay timing', async () => {
    mockUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)');

    const mockResponse = {
      exercises: [],
      total: 0,
      page: 1,
      limit: 15,
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const { result } = renderHook(() => useDebouncedSearch({}, { delayMobile: 500 }));

    act(() => {
      result.current.onTermChange('test');
    });

    // Should not have made request after 350ms (desktop delay)
    act(() => {
      jest.advanceTimersByTime(350);
    });
    expect(global.fetch).not.toHaveBeenCalled();

    // Should make request after 500ms (mobile delay)
    act(() => {
      jest.advanceTimersByTime(150); // Total 500ms
    });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });
  });

  it('should bypass debounce on Enter press', async () => {
    const mockResponse = {
      exercises: [],
      total: 0,
      page: 1,
      limit: 15,
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const { result } = renderHook(() => useDebouncedSearch({}));

    // Set term first
    act(() => {
      result.current.onTermChange('deadl');
    });

    // Trigger Enter (immediate search, bypass debounce)
    act(() => {
      result.current.onEnter();
    });

    // Should make request immediately without waiting for debounce
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });
  });

  it('should not block typing during search execution', async () => {
    const { result } = renderHook(() => useDebouncedSearch({}));

    // Start typing
    act(() => {
      result.current.onTermChange('deadl');
    });

    // Term should update immediately (never blocks)
    expect(result.current.term).toBe('deadl');

    // Continue typing while search might be in flight
    act(() => {
      result.current.onTermChange('deadlift');
    });

    // Term should still update immediately
    expect(result.current.term).toBe('deadlift');
  });

  it('should handle rapid backspaces without thrashing', async () => {
    const mockResponse = {
      exercises: [],
      total: 0,
      page: 1,
      limit: 15,
    };

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    });

    const { result } = renderHook(() => useDebouncedSearch({}));

    // Simulate rapid backspaces to empty
    act(() => {
      result.current.onTermChange('test');
    });

    act(() => {
      result.current.onTermChange('tes');
    });

    act(() => {
      result.current.onTermChange('te');
    });

    act(() => {
      result.current.onTermChange('t');
    });

    act(() => {
      result.current.onTermChange('');
    });

    // Should use 200ms debounce for clear to avoid thrashing
    act(() => {
      jest.advanceTimersByTime(200);
    });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('page=1&limit=15'),
        expect.any(Object)
      );
    });
  });

  it('should cancel previous requests when new search is made', async () => {
    const abortSpy = jest.fn();
    const mockAbortController = {
      abort: abortSpy,
      signal: { aborted: false },
    };

    global.AbortController = jest.fn(() => mockAbortController) as any;

    const { result } = renderHook(() => useDebouncedSearch({}));

    // First search
    act(() => {
      result.current.onTermChange('first');
    });

    act(() => {
      jest.advanceTimersByTime(350);
    });

    // Second search before first completes
    act(() => {
      result.current.onTermChange('second');
    });

    act(() => {
      jest.advanceTimersByTime(350);
    });

    // Should have called abort on the first request
    expect(abortSpy).toHaveBeenCalled();
  });

  it('should cache and reuse search results with non-blocking updates', async () => {
    const mockResponse = {
      exercises: [{ id: '1', name: 'Test Exercise' }],
      total: 1,
      page: 1,
      limit: 15,
    };

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    });

    const { result } = renderHook(() => useDebouncedSearch({}, { cacheTTL: 5 * 60 * 1000 }));

    // First search
    act(() => {
      result.current.onTermChange('test');
    });

    act(() => {
      jest.advanceTimersByTime(350);
    });

    await waitFor(() => {
      expect(result.current.results).toEqual(mockResponse);
    });

    expect(global.fetch).toHaveBeenCalledTimes(1);

    // Second identical search should use cache
    act(() => {
      result.current.onTermChange('test');
    });

    act(() => {
      jest.advanceTimersByTime(350);
    });

    // Should not make another fetch request (cache hit)
    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(result.current.results).toEqual(mockResponse);
  });
});
