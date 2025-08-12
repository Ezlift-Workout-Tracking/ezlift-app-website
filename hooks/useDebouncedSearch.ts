'use client';

import { useState, useRef, useCallback, useEffect, useMemo, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import debounce from 'lodash.debounce';
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
    delayDesktop = 350,
    delayMobile = 500,
    minLength = 2,
    cacheSize = 10,
    cacheTTL = 5 * 60 * 1000, // 5 minutes
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
    
    // Handle empty query with debounce to avoid thrashing
    if (trimmedQuery.length === 0) {
      if (clearTimeoutRef.current) {
        clearTimeout(clearTimeoutRef.current);
      }
      
      clearTimeoutRef.current = setTimeout(() => {
        // Show default list after 200ms to avoid thrashing during rapid backspaces
        runSearchInternal('', searchFilters);
      }, 200);
      return;
    }
    
    // Clear the clear timeout if we have a real query
    if (clearTimeoutRef.current) {
      clearTimeout(clearTimeoutRef.current);
      clearTimeoutRef.current = null;
    }
    
    // Don't search if below minimum length
    if (trimmedQuery.length < minLength) {
      startTransition(() => {
        setResults(null);
      });
      setStatus('idle');
      setError(null);
      return;
    }

    await runSearchInternal(trimmedQuery, searchFilters);
  }, [minLength]);

  const runSearchInternal = useCallback(async (query: string, searchFilters: ExerciseFilters) => {
    // Create cache key
    const cacheKey = JSON.stringify({ query, filters: searchFilters });
    
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
        throw new Error(`Search failed: ${response.status}`);
      }

      const data: ExerciseListResponse = await response.json();
      
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
      setError('Search failed. Please try again.');
      
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
