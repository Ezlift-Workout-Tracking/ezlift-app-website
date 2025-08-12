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
  const inputRef = useRef<HTMLInputElement>(null);
  
  const {
    term,
    onTermChange,
    onEnter,
    results,
    status,
    error,
    isPending,
    isComposing,
    setIsComposing,
  } = useDebouncedSearch(filters, {
    delayDesktop: 350,
    delayMobile: 500,
    minLength: 2,
  });

  // Handle input change - never blocks typing
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    // Immediately update local input state (never blocks)
    setInputValue(value);
    
    // Don't trigger search during IME composition
    if (isComposing) {
      return;
    }
    
    // Trigger debounced search via hook
    onTermChange(value);
  }, [isComposing, onTermChange]);

  // Handle Enter key press - immediate search, bypass debounce
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      // Trigger immediate search
      onEnter();
    }
  }, [onEnter]);

  // Handle IME composition events
  const handleCompositionStart = useCallback(() => {
    setIsComposing(true);
  }, [setIsComposing]);

  const handleCompositionEnd = useCallback((e: React.CompositionEvent<HTMLInputElement>) => {
    setIsComposing(false);
    
    // Trigger change after composition ends
    const value = (e.target as HTMLInputElement).value;
    setInputValue(value);
    
    // Start debounced search after composition
    onTermChange(value);
  }, [setIsComposing, onTermChange]);

  // Sync input value with hook term when needed
  useEffect(() => {
    if (term !== inputValue && !isComposing) {
      setInputValue(term);
    }
  }, [term, inputValue, isComposing]);

  // Effect to handle search results - non-blocking
  useEffect(() => {
    if (results) {
      onSearchResults(results);
    }
  }, [results, onSearchResults]);

  // Effect to handle status changes - non-blocking
  useEffect(() => {
    onSearchStatusChange(status, error);
  }, [status, error, onSearchStatusChange]);

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
  const showSpinner = status === 'loading' && !isPending; // Only show spinner for urgent loading

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
          disabled={disabled} // Never disable during search - input stays responsive
          role="searchbox"
          aria-label="Search exercises"
          aria-describedby={helperText ? 'search-helper' : undefined}
        />
        
        {/* Loading spinner - only show for urgent loading, not during transitions */}
        {showSpinner && (
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
