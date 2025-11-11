'use client';

import { useState, useRef, useCallback, useEffect, useMemo, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { debounce } from 'lodash';
import { ExerciseFilters, ExerciseListResponse } from '@/types/exercise';

interface SearchResult {
  data: ExerciseListResponse;
  timestamp: number;
}

type SearchStatus = 'idle' | 'loading' | 'success' | 'error';

interface UseDebouncedSearchOptions {
  delayDesktop?: number;
  delayMobile?: number;
  minLength?: number;
  cacheSize?: number;
  cacheTTL?: number; // in milliseconds
}

interface UseDebouncedSearchReturn {
  term: string;
  onTermChange: (term: string) => void;
  onEnter: () => void;
  results: ExerciseListResponse | null;
  status: SearchStatus;
  error: string | null;
  isPending: boolean;
  clearCache: () => void;
  isComposing: boolean;
  setIsComposing: (composing: boolean) => void;
}

// Mobile detection utility
const isMobile = (): boolean => {
  if (typeof window === 'undefined') return false;
  return /(iPhone|Android)/i.test(navigator.userAgent);
};

// Build URL for API request
const buildApiUrl = (query: string, filters: ExerciseFilters, options: { page: number; limit: number }): string => {
  const params = new URLSearchParams();
  
  if (query.trim()) {
    params.set('search', query.trim());
  }
  
  if (filters.exerciseType) {
    params.set('type', filters.exerciseType);
  }
  
  if (filters.primaryMuscleGroup) {
    params.set('muscle', filters.primaryMuscleGroup);
  }
  
  if (filters.force) {
    params.set('movement', filters.force);
  }
  
  if (filters.level) {
    params.set('difficulty', filters.level);
  }
  
  params.set('page', options.page.toString());
  params.set('limit', options.limit.toString());
  
  return `/api/exercises?${params.toString()}`;
};

// Build URL for page navigation
const buildPageUrl = (query: string, filters: ExerciseFilters, options: { page: number }): string => {
  const params = new URLSearchParams();
  
  if (query.trim()) {
    params.set('search', query.trim());
  }
  
  if (filters.exerciseType) {
    params.set('type', filters.exerciseType);
  }
  
  if (filters.primaryMuscleGroup) {
    params.set('muscle', filters.primaryMuscleGroup);
  }
  
  if (filters.force) {
    params.set('movement', filters.force);
  }
  
  if (filters.level) {
    params.set('difficulty', filters.level);
  }
  
  if (options.page > 1) {
    params.set('page', options.page.toString());
  }
  
  return `/exercise-library${params.toString() ? '?' + params.toString() : ''}`;
};

// LRU Cache implementation
class LRUCache<K, V> {
  private cache = new Map<K, V>();
  private maxSize: number;

  constructor(maxSize: number) {
    this.maxSize = maxSize;
  }

  get(key: K): V | undefined {
    if (this.cache.has(key)) {
      // Move to end (most recently used)
      const value = this.cache.get(key)!;
      this.cache.delete(key);
      this.cache.set(key, value);
      return value;
    }
    return undefined;
  }

  set(key: K, value: V): void {
    if (this.cache.has(key)) {
      // Update existing
      this.cache.delete(key);
    } else if (this.cache.size >= this.maxSize) {
      // Remove oldest (first entry)
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    this.cache.set(key, value);
  }

  clear(): void {
    this.cache.clear();
  }
}

export function useDebouncedSearch(
  filters: ExerciseFilters,
  options: UseDebouncedSearchOptions = {}
): UseDebouncedSearchReturn {
  const {
    delayDesktop = 250, // Reduced delay for better responsiveness
    delayMobile = 350,  // Reduced delay for mobile too
    minLength = 1,      // Search with 1 character for better UX
    cacheSize = 20,     // Increased cache size
    cacheTTL = 10 * 60 * 1000, // Increased cache time to 10 minutes
  } = options;

  const [term, setTerm] = useState('');
  const [results, setResults] = useState<ExerciseListResponse | null>(null);
  const [status, setStatus] = useState<SearchStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [isComposing, setIsComposing] = useState(false);
  const [isPending, startTransition] = useTransition();

  const router = useRouter();
  const controllerRef = useRef<AbortController | null>(null);
  const cacheRef = useRef(new LRUCache<string, SearchResult>(cacheSize));
  const clearTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const delay = isMobile() ? delayMobile : delayDesktop;

  const runSearch = useCallback(async (query: string, searchFilters: ExerciseFilters) => {
    const trimmedQuery = query.trim();
    
    // Handle empty query with immediate response to avoid delay
    if (trimmedQuery.length === 0) {
      if (clearTimeoutRef.current) {
        clearTimeout(clearTimeoutRef.current);
        clearTimeoutRef.current = null;
      }
      
      // Immediately show default list for empty query
      await runSearchInternal('', searchFilters);
      return;
    }
    
    // Clear the clear timeout if we have a real query
    if (clearTimeoutRef.current) {
      clearTimeout(clearTimeoutRef.current);
      clearTimeoutRef.current = null;
    }
    
    // Don't search if below minimum length, but don't clear results immediately
    if (trimmedQuery.length < minLength) {
      setStatus('idle');
      setError(null);
      // Keep previous results visible instead of clearing them
      return;
    }

    await runSearchInternal(trimmedQuery, searchFilters);
  }, [minLength]);

  const runSearchInternal = useCallback(async (query: string, searchFilters: ExerciseFilters) => {
    // Create more efficient cache key
    const cacheKey = `${query}|${searchFilters.exerciseType || ''}|${searchFilters.primaryMuscleGroup || ''}|${searchFilters.force || ''}|${searchFilters.level || ''}`;
    
    // Check cache first
    const cached = cacheRef.current.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < cacheTTL) {
      // Use cached data immediately with non-blocking update
      startTransition(() => {
        setResults(cached.data);
        // Update URL non-blocking
        const pageUrl = buildPageUrl(query, searchFilters, { page: 1 });
        router.replace(pageUrl, { scroll: false });
      });
      setStatus('success');
      setError(null);
      return;
    }

    // Cancel previous request
    if (controllerRef.current) {
      controllerRef.current.abort();
    }
    controllerRef.current = new AbortController();

    setStatus('loading');
    setError(null);

    try {
      const apiUrl = buildApiUrl(query, searchFilters, { page: 1, limit: 15 });
      const response = await fetch(apiUrl, {
        signal: controllerRef.current.signal,
        cache: 'no-store',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorMessage = response.status === 404 ? 'No exercises found' : 
                           response.status >= 500 ? 'Server error. Please try again.' :
                           `Search failed (${response.status})`;
        throw new Error(errorMessage);
      }

      const data: ExerciseListResponse = await response.json();
      
      // Validate response data
      if (!data || !Array.isArray(data.exercises)) {
        throw new Error('Invalid response format');
      }
      
      // Cache the result
      cacheRef.current.set(cacheKey, {
        data,
        timestamp: Date.now(),
      });

      // Non-blocking result and URL updates
      startTransition(() => {
        setResults(data);
        // Update URL non-blocking, don't await
        const pageUrl = buildPageUrl(query, searchFilters, { page: 1 });
        router.replace(pageUrl, { scroll: false });
      });
      
      setStatus('success');
      setError(null);
    } catch (err: any) {
      if (err.name === 'AbortError') {
        // Request was cancelled, don't update state
        return;
      }
      
      console.error('Search error:', err);
      setStatus('error');
      setError(err.message || 'Search failed. Please try again.');
      
      // Don't clear results on error, keep showing previous results
    }
  }, [cacheTTL, router]);

  // Trailing debounce - only fires after user stops typing
  const debouncedSearch = useMemo(
    () => debounce((query: string, searchFilters: ExerciseFilters) => {
      runSearch(query, searchFilters);
    }, delay, { 
      leading: false,  // Don't fire on the first call
      trailing: true   // Fire after the delay
    }),
    [delay, runSearch]
  );

  // Handle term changes (from input onChange)
  const onTermChange = useCallback((value: string) => {
    // Immediately update term state (never blocks typing)
    setTerm(value);
    
    // Don't debounce during IME composition
    if (isComposing) {
      return;
    }
    
    // Start/restart debounce timer
    debouncedSearch(value, filters);
  }, [isComposing, debouncedSearch, filters]);

  // Handle Enter key (immediate search, bypass debounce)
  const onEnter = useCallback(() => {
    // Cancel any pending debounced search
    debouncedSearch.cancel();
    
    // Run search immediately
    runSearch(term, filters);
  }, [debouncedSearch, term, filters, runSearch]);

  const clearCache = useCallback(() => {
    cacheRef.current.clear();
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (controllerRef.current) {
        controllerRef.current.abort();
      }
      if (clearTimeoutRef.current) {
        clearTimeout(clearTimeoutRef.current);
      }
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  return {
    term,
    onTermChange,
    onEnter,
    results,
    status,
    error,
    isPending,
    clearCache,
    isComposing,
    setIsComposing,
  };
}
