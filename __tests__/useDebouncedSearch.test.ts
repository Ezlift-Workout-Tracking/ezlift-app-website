/**
 * @jest-environment jsdom
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { useDebouncedSearch } from '../hooks/useDebouncedSearch';

// Mock fetch
global.fetch = jest.fn();

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

  it('should debounce search with desktop timing', async () => {
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

    const { result } = renderHook(() => useDebouncedSearch({ delayDesktop: 350 }));

    // Simulate typing "deadlift" quickly
    act(() => {
      result.current.runSearch('d', {});
    });

    act(() => {
      result.current.runSearch('de', {});
    });

    act(() => {
      result.current.runSearch('dea', {});
    });

    act(() => {
      result.current.runSearch('deadlift', {});
    });

    // Should not have made any requests yet
    expect(global.fetch).not.toHaveBeenCalled();

    // Fast forward time by 350ms
    act(() => {
      jest.advanceTimersByTime(350);
    });

    // Should have made only one request with the final term
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

    const { result } = renderHook(() => useDebouncedSearch({ delayMobile: 500 }));

    act(() => {
      result.current.runSearch('test', {});
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

  it('should not search below minimum length', async () => {
    const { result } = renderHook(() => useDebouncedSearch({ minLength: 2 }));

    act(() => {
      result.current.runSearch('d', {});
    });

    act(() => {
      jest.advanceTimersByTime(350);
    });

    expect(global.fetch).not.toHaveBeenCalled();
    expect(result.current.status).toBe('idle');
  });

  it('should search immediately when input is cleared', async () => {
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

    const { result } = renderHook(() => useDebouncedSearch());

    // Search with empty string should trigger immediately
    act(() => {
      result.current.runSearch('', {});
    });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('page=1&limit=15'),
        expect.any(Object)
      );
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

    const { result } = renderHook(() => useDebouncedSearch());

    // Force search (simulating Enter key)
    act(() => {
      result.current.runSearch('deadl', {}, true);
    });

    // Should make request immediately without waiting for debounce
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    // Should not need to advance timers
    expect(jest.getTimerCount()).toBe(0);
  });

  it('should cancel previous requests when new search is made', async () => {
    const abortSpy = jest.fn();
    const mockAbortController = {
      abort: abortSpy,
      signal: { aborted: false },
    };

    global.AbortController = jest.fn(() => mockAbortController) as any;

    const { result } = renderHook(() => useDebouncedSearch());

    // First search
    act(() => {
      result.current.runSearch('first', {});
    });

    // Second search before first completes
    act(() => {
      result.current.runSearch('second', {});
    });

    // Should have called abort on the first request
    expect(abortSpy).toHaveBeenCalled();
  });

  it('should cache and reuse search results', async () => {
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

    const { result } = renderHook(() => useDebouncedSearch({ cacheTTL: 5 * 60 * 1000 }));

    // First search
    act(() => {
      result.current.runSearch('test', {}, true);
    });

    await waitFor(() => {
      expect(result.current.results).toEqual(mockResponse);
    });

    expect(global.fetch).toHaveBeenCalledTimes(1);

    // Second identical search should use cache
    act(() => {
      result.current.runSearch('test', {}, true);
    });

    // Should not make another fetch request
    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(result.current.results).toEqual(mockResponse);
  });
});
