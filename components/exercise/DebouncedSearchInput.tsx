'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { Input } from '../ui/input';
import { ExerciseFilters } from '@/types/exercise';
import { useDebouncedSearch } from '@/hooks/useDebouncedSearch';

interface DebouncedSearchInputProps {
  initialValue?: string;
  filters: ExerciseFilters;
  onSearchResults: (results: any) => void;
  onSearchStatusChange: (status: 'idle' | 'loading' | 'success' | 'error', error?: string | null) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

const DebouncedSearchInput: React.FC<DebouncedSearchInputProps> = ({
  initialValue = '',
  filters,
  onSearchResults,
  onSearchStatusChange,
  placeholder = 'Search exercises...',
  className = '',
  disabled = false,
}) => {
  const [inputValue, setInputValue] = useState(initialValue);
  const [isComposing, setIsComposing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const {
    term,
    setTerm,
    results,
    status,
    error,
    runSearch,
    isComposing: hookIsComposing,
  } = useDebouncedSearch({
    delayDesktop: 350,
    delayMobile: 500,
    minLength: 2,
  });

  // Detect mobile for delay timing
  const isMobile = useCallback(() => {
    if (typeof window === 'undefined') return false;
    return /(iPhone|Android)/i.test(navigator.userAgent);
  }, []);

  const delay = isMobile() ? 500 : 350;

  // Handle input change with debouncing
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    
    // Don't trigger search during IME composition
    if (isComposing || hookIsComposing) {
      return;
    }

    // Clear previous timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    // If input is cleared (empty), search immediately to show all results
    if (value.trim().length === 0) {
      setTerm(value);
      runSearch(value, filters);
      return;
    }

    // For non-empty values, use debouncing
    debounceTimeoutRef.current = setTimeout(() => {
      setTerm(value);
      if (value.trim().length >= 2) {
        runSearch(value, filters);
      }
    }, delay);
  }, [isComposing, hookIsComposing, filters, runSearch, setTerm, delay]);

  // Handle Enter key press - immediate search
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      
      // Clear debounce timeout
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
        debounceTimeoutRef.current = null;
      }
      
      // Run search immediately
      const value = inputValue.trim();
      setTerm(value);
      runSearch(value, filters, true); // force = true
    }
  }, [inputValue, filters, runSearch, setTerm]);

  // Handle IME composition events
  const handleCompositionStart = useCallback(() => {
    setIsComposing(true);
  }, []);

  const handleCompositionEnd = useCallback((e: React.CompositionEvent<HTMLInputElement>) => {
    setIsComposing(false);
    // Trigger change after composition ends
    const value = (e.target as HTMLInputElement).value;
    setInputValue(value);
    
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    
    // If input is cleared (empty), search immediately to show all results
    if (value.trim().length === 0) {
      setTerm(value);
      runSearch(value, filters);
      return;
    }

    // For non-empty values, use debouncing
    debounceTimeoutRef.current = setTimeout(() => {
      setTerm(value);
      if (value.trim().length >= 2) {
        runSearch(value, filters);
      }
    }, delay);
  }, [filters, runSearch, setTerm, delay]);

  // Effect to handle search results
  useEffect(() => {
    if (results) {
      onSearchResults(results);
    }
  }, [results, onSearchResults]);

  // Effect to handle status changes
  useEffect(() => {
    onSearchStatusChange(status, error);
  }, [status, error, onSearchStatusChange]);

  // Update parent with search term changes
  useEffect(() => {
    // Only update parent if the term actually changed and has meaningful content
    if (term !== initialValue && (term.length >= 2 || term.length === 0)) {
      // This will trigger the parent's filter change handler
      // But we need to be careful not to create infinite loops
    }
  }, [term, initialValue]);

  // Effect to trigger search when filters change
  useEffect(() => {
    if (term && term.trim().length >= 2) {
      // Clear existing timeout
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
      
      // Run search with new filters (with debounce)
      debounceTimeoutRef.current = setTimeout(() => {
        runSearch(term, filters);
      }, delay);
    } else if (term.trim().length === 0) {
      // If search is empty, run search immediately with new filters to show all results
      runSearch(term, filters);
    }
  }, [filters, term, runSearch, delay]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  // Helper text logic
  const getHelperText = useCallback(() => {
    const trimmedValue = inputValue.trim();
    
    if (trimmedValue.length === 0) {
      return null;
    }
    
    if (trimmedValue.length < 2) {
      return 'Keep typing to search...';
    }
    
    return null;
  }, [inputValue]);

  const helperText = getHelperText();

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onCompositionStart={handleCompositionStart}
          onCompositionEnd={handleCompositionEnd}
          className={`pl-10 pr-10 bg-white border-gray-300 focus:border-gray-400 focus:ring-gray-400 text-gray-900 placeholder:text-gray-500 ${className}`}
          disabled={disabled}
          role="searchbox"
          aria-label="Search exercises"
          aria-describedby={helperText ? 'search-helper' : undefined}
        />
        
        {/* Loading spinner */}
        {status === 'loading' && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <Loader2 className="h-4 w-4 animate-spin text-gray-400" aria-live="polite" />
          </div>
        )}
      </div>
      
      {/* Helper text */}
      {helperText && (
        <p id="search-helper" className="text-xs text-gray-500 mt-1 ml-1">
          {helperText}
        </p>
      )}
    </div>
  );
};

export default DebouncedSearchInput;
