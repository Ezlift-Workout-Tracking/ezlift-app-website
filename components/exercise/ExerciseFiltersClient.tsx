'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import ExerciseFilters from './ExerciseFilters';
import { ExerciseFilters as Filters, FilterOptions } from '../../types/exercise';

interface ExerciseFiltersClientProps {
  initialFilters: Filters;
  filterOptions: FilterOptions;
}

const ExerciseFiltersClient: React.FC<ExerciseFiltersClientProps> = ({
  initialFilters,
  filterOptions,
}) => {
  const [filters, setFilters] = useState<Filters>(initialFilters);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [previousFilters, setPreviousFilters] = useState<Filters>(initialFilters);
  const router = useRouter();
  const searchParams = useSearchParams();

  const filtersChanged = useCallback((oldFilters: Filters, newFilters: Filters) => {
    return (
      oldFilters.search !== newFilters.search ||
      oldFilters.exerciseType !== newFilters.exerciseType ||
      oldFilters.primaryMuscleGroup !== newFilters.primaryMuscleGroup ||
      oldFilters.force !== newFilters.force ||
      oldFilters.level !== newFilters.level
    );
  }, []);

  const updateURL = useCallback(() => {
    const params = new URLSearchParams(searchParams);
    
    // Update filter parameters
    if (filters.search) {
      params.set('search', filters.search);
    } else {
      params.delete('search');
    }
    
    if (filters.exerciseType) {
      params.set('type', filters.exerciseType);
    } else {
      params.delete('type');
    }
    
    if (filters.primaryMuscleGroup) {
      params.set('muscle', filters.primaryMuscleGroup);
    } else {
      params.delete('muscle');
    }
    
    if (filters.force) {
      params.set('movement', filters.force);
    } else {
      params.delete('movement');
    }
    
    if (filters.level) {
      params.set('difficulty', filters.level);
    } else {
      params.delete('difficulty');
    }
    
    // Only reset to page 1 when filters actually change
    if (filtersChanged(previousFilters, filters)) {
      params.delete('page');
      setPreviousFilters(filters);
    }
    
    const newURL = `/exercise-library?${params.toString()}`;
    router.push(newURL);
  }, [filters, searchParams, router, previousFilters, filtersChanged]);

  // Debounce filter changes (skip on initial load)
  useEffect(() => {
    if (isInitialLoad) {
      setIsInitialLoad(false);
      return;
    }

    const timeoutId = setTimeout(() => {
      updateURL();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [filters, isInitialLoad, updateURL]);

  const handleFiltersChange = (newFilters: Filters) => {
    setFilters(newFilters);
  };

  const handleClearFilters = () => {
    setFilters({});
  };

  return (
    <ExerciseFilters
      filters={filters}
      filterOptions={filterOptions}
      onFiltersChange={handleFiltersChange}
      onClearFilters={handleClearFilters}
      isLoading={isLoading}
    />
  );
};

export default ExerciseFiltersClient; 