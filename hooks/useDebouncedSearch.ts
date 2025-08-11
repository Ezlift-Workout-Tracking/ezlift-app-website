'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
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
  setTerm: (term: string) => void;
  results: ExerciseListResponse | null;
  status: SearchStatus;
  error: string | null;
  runSearch: (query: string, filters: ExerciseFilters, force?: boolean) => Promise<void>;
  clearCache: () => void;
  isComposing: boolean;
}

// Mobile detection utility
const isMobile = (): boolean => {
  if (typeof window === 'undefined') return false;
  return /(iPhone|Android)/i.test(navigator.userAgent);
};

// Build URL for API request
const buildUrl = (query: string, filters: ExerciseFilters, options: { page: number; limit: number }): string => {
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

export function useDebouncedSearch(options: UseDebouncedSearchOptions = {}): UseDebouncedSearchReturn {
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

  const controllerRef = useRef<AbortController | null>(null);
  const cacheRef = useRef(new LRUCache<string, SearchResult>(cacheSize));
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const delay = isMobile() ? delayMobile : delayDesktop;

  const runSearch = useCallback(async (query: string, filters: ExerciseFilters, force = false) => {
    const trimmedQuery = query.trim();
    
    // Handle empty query - always search to show all results
    if (trimmedQuery.length === 0) {
      // Continue with search to fetch all results
    } else if (!force && trimmedQuery.length < minLength) {
      // Don't search if below minimum length and not forced (and not empty)
      setStatus('idle');
      setError(null);
      return;
    }

    // Create cache key
    const cacheKey = JSON.stringify({ query: trimmedQuery, filters });
    
    // Check cache first
    const cached = cacheRef.current.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < cacheTTL) {
      // Use cached data immediately
      setResults(cached.data);
      setStatus('success');
      setError(null);
      
      // Still revalidate in background if not forced (Enter key press)
      if (!force) {
        // Continue to make background request for revalidation
      } else {
        return;
      }
    }

    // Cancel previous request
    if (controllerRef.current) {
      controllerRef.current.abort();
    }
    controllerRef.current = new AbortController();

    setStatus('loading');
    setError(null);

    try {
      const url = buildUrl(trimmedQuery, filters, { page: 1, limit: 15 });
      const response = await fetch(url, {
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

      setResults(data);
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
  }, [minLength, cacheTTL]);

  const clearCache = useCallback(() => {
    cacheRef.current.clear();
  }, []);

  // Handle IME composition events
  useEffect(() => {
    const handleCompositionStart = () => setIsComposing(true);
    const handleCompositionEnd = () => setIsComposing(false);

    if (typeof window !== 'undefined') {
      window.addEventListener('compositionstart', handleCompositionStart);
      window.addEventListener('compositionend', handleCompositionEnd);

      return () => {
        window.removeEventListener('compositionstart', handleCompositionStart);
        window.removeEventListener('compositionend', handleCompositionEnd);
      };
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (controllerRef.current) {
        controllerRef.current.abort();
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    term,
    setTerm,
    results,
    status,
    error,
    runSearch,
    clearCache,
    isComposing,
  };
}
