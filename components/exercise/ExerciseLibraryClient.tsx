'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Dumbbell } from 'lucide-react';
import { FadeIn } from '@/components/animations/FadeIn';
import { EmptyState } from '@/components/ui/empty-state';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import ExerciseFilters from './ExerciseFilters';
import ExerciseCard from './ExerciseCard';
import PaginationClient from './PaginationClient';
import { ExerciseFilters as Filters, FilterOptions, ExerciseListResponse } from '@/types/exercise';

interface ExerciseLibraryClientProps {
  initialData: ExerciseListResponse;
  initialFilters: Filters;
  filterOptions: FilterOptions;
  currentPage: number;
}

const ExerciseLibraryClient: React.FC<ExerciseLibraryClientProps> = ({
  initialData,
  initialFilters,
  filterOptions,
  currentPage,
}) => {
  const [exercises, setExercises] = useState(initialData.exercises);
  const [total, setTotal] = useState(initialData.total);
  const [filters, setFilters] = useState<Filters>(initialFilters);
  const [page, setPage] = useState(currentPage);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [isUsingClientSearch, setIsUsingClientSearch] = useState(false);
  const [previousFilters, setPreviousFilters] = useState<Filters>(initialFilters);

  const router = useRouter();
  const searchParams = useSearchParams();

  // Check if filters have changed
  const filtersChanged = useCallback((oldFilters: Filters, newFilters: Filters) => {
    return (
      oldFilters.search !== newFilters.search ||
      oldFilters.exerciseType !== newFilters.exerciseType ||
      oldFilters.primaryMuscleGroup !== newFilters.primaryMuscleGroup ||
      oldFilters.force !== newFilters.force ||
      oldFilters.level !== newFilters.level
    );
  }, []);

  // Update URL when filters change (but only for non-search changes)
  const updateURL = useCallback((newFilters: Filters, newPage: number) => {
    const params = new URLSearchParams(searchParams);
    
    // Update filter parameters
    if (newFilters.search) {
      params.set('search', newFilters.search);
    } else {
      params.delete('search');
    }
    
    if (newFilters.exerciseType) {
      params.set('type', newFilters.exerciseType);
    } else {
      params.delete('type');
    }
    
    if (newFilters.primaryMuscleGroup) {
      params.set('muscle', newFilters.primaryMuscleGroup);
    } else {
      params.delete('muscle');
    }
    
    if (newFilters.force) {
      params.set('movement', newFilters.force);
    } else {
      params.delete('movement');
    }
    
    if (newFilters.level) {
      params.set('difficulty', newFilters.level);
    } else {
      params.delete('difficulty');
    }
    
    // Handle pagination
    if (newPage > 1) {
      params.set('page', newPage.toString());
    } else {
      params.delete('page');
    }
    
    const newURL = `/exercise-library?${params.toString()}`;
    router.push(newURL, { scroll: false });
  }, [searchParams, router]);

  // Handle search results from debounced search
  const handleSearchResults = useCallback((results: ExerciseListResponse) => {
    setExercises(results.exercises);
    setTotal(results.total);
    setPage(1); // Reset to page 1 for search results
    setIsUsingClientSearch(true);
    
    // Update URL for search - make sure to use current filters state
    const currentFilters = { ...filters };
    updateURL(currentFilters, 1);
  }, [filters, updateURL]);

  // Handle search status changes
  const handleSearchStatusChange = useCallback((
    status: 'idle' | 'loading' | 'success' | 'error', 
    error?: string | null
  ) => {
    setIsSearching(status === 'loading');
    setSearchError(error || null);
  }, []);

  // Fetch filtered data from API
  const fetchFilteredData = useCallback(async (newFilters: Filters, pageNum: number = 1) => {
    try {
      setIsSearching(true);
      setSearchError(null);

      const params = new URLSearchParams();
      
      if (newFilters.search) {
        params.set('search', newFilters.search);
      }
      
      if (newFilters.exerciseType) {
        params.set('type', newFilters.exerciseType);
      }
      
      if (newFilters.primaryMuscleGroup) {
        params.set('muscle', newFilters.primaryMuscleGroup);
      }
      
      if (newFilters.force) {
        params.set('movement', newFilters.force);
      }
      
      if (newFilters.level) {
        params.set('difficulty', newFilters.level);
      }
      
      params.set('page', pageNum.toString());
      params.set('limit', '15');

      const response = await fetch(`/api/exercises?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch exercises');
      }

      const data = await response.json();
      
      setExercises(data.exercises);
      setTotal(data.total);
      setPage(pageNum);
      setIsUsingClientSearch(true);
      setIsSearching(false);

      // Update URL without page reload
      updateURL(newFilters, pageNum);
      
    } catch (error) {
      console.error('Error fetching filtered exercises:', error);
      setSearchError('Failed to load exercises. Please try again.');
      setIsSearching(false);
    }
  }, [updateURL]);

  // Handle filter changes
  const handleFiltersChange = useCallback((newFilters: Filters) => {
    const hasFiltersChanged = filtersChanged(filters, newFilters);
    
    setFilters(newFilters);
    
    // If it's a search change, let the debounced search handle it
    if (newFilters.search !== filters.search) {
      // If search was cleared, we need to trigger the search immediately
      if (!newFilters.search || newFilters.search.trim().length === 0) {
        // This will be handled by the DebouncedSearchInput component
      }
      return;
    }
    
    // For non-search filter changes, fetch data via API
    if (hasFiltersChanged) {
      fetchFilteredData(newFilters, 1);
    }
  }, [filters, filtersChanged, fetchFilteredData]);

  // Handle clear filters
  const handleClearFilters = useCallback(() => {
    const clearedFilters: Filters = {};
    fetchFilteredData(clearedFilters, 1);
  }, [fetchFilteredData]);

  // Calculate total pages
  const totalPages = Math.ceil(total / 15);

  return (
    <>
      {/* Filters */}
      <div className="mb-12">
        <ExerciseFilters 
          filters={filters}
          filterOptions={filterOptions}
          onFiltersChange={handleFiltersChange}
          onClearFilters={handleClearFilters}
          onSearchResults={handleSearchResults}
          onSearchStatusChange={handleSearchStatusChange}
          isLoading={isSearching}
        />
      </div>

      {/* Search Error */}
      {searchError && (
        <div className="mb-8">
          <Alert variant="destructive">
            <AlertDescription>
              {searchError}
            </AlertDescription>
          </Alert>
        </div>
      )}

      {/* Results Summary */}
      <div className="mb-8">
        <p className="text-sm text-gray-600 text-center">
          {isSearching ? (
            'Searching...'
          ) : (
            <>
              Showing {exercises.length} of {total} exercises
              {page > 1 && ` (Page ${page} of ${totalPages})`}
              {isUsingClientSearch && filters.search && (
                <span className="ml-2 text-blue-600">• Live search results</span>
              )}
            </>
          )}
        </p>
      </div>

      {/* Exercise Grid */}
      {exercises.length > 0 ? (
        <div className="container max-w-7xl mx-auto mb-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 justify-center">
            {exercises.map((exercise, index) => (
              <FadeIn key={exercise.id} delay={Math.min(index * 25, 200)}>
                <ExerciseCard exercise={exercise} />
              </FadeIn>
            ))}
          </div>
        </div>
      ) : (
        <div className="max-w-4xl mx-auto mb-12">
          <EmptyState
            icon={<Dumbbell className="w-12 h-12 text-gray-400" />}
            title={isSearching ? "Searching..." : "No Exercises Found"}
            description={
              isSearching 
                ? "Please wait while we search for exercises..."
                : "Try adjusting your filters or search terms to find exercises that match your criteria."
            }
            action={
              !isSearching ? (
                <Button 
                  variant="outline" 
                  onClick={handleClearFilters}
                  className="mt-4"
                >
                  Clear all filters
                </Button>
              ) : undefined
            }
          />
        </div>
      )}

      {/* Pagination - only show if not using client search or if search has multiple pages */}
      {totalPages > 1 && (!isUsingClientSearch || !filters.search) && (
        <div className="flex justify-center">
          <PaginationClient
            currentPage={page}
            totalPages={totalPages}
            filters={filters}
          />
        </div>
      )}
    </>
  );
};

export default ExerciseLibraryClient;
