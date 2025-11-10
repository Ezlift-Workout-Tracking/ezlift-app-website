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
import { ExerciseFilters as Filters, FilterOptions, ExerciseListResponse, Exercise } from '@/types/exercise';
import { exerciseCache } from '@/lib/services/exercise-cache';
import { useExerciseStore } from '@/lib/stores/exerciseStore';

interface ExerciseLibraryClientProps {
  initialData: ExerciseListResponse;
  initialFilters: Filters;
  filterOptions: FilterOptions;
  currentPage: number;
}

const ExerciseLibraryClient: React.FC<ExerciseLibraryClientProps> = ({
  initialData,
  initialFilters,
  filterOptions: initialFilterOptions,
  currentPage,
}) => {
  const [exercises, setExercises] = useState<Exercise[]>(initialData.exercises);
  const [total, setTotal] = useState(initialData.total);
  const [filters, setFilters] = useState<Filters>(initialFilters);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>(initialFilterOptions);
  const [page, setPage] = useState(currentPage);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [cacheLoaded, setCacheLoaded] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Subscribe to exercise store
  const storeIsLoaded = useExerciseStore(state => state.isLoaded);
  const storeIsLoading = useExerciseStore(state => state.isLoading);
  const storeError = useExerciseStore(state => state.error);

  // Initialize cache on mount - NON-BLOCKING
  // Show SSR data immediately, load cache in background
  useEffect(() => {
    const initCache = async () => {
      try {
        // Load cache in background (non-blocking)
        await exerciseCache.loadAllExercises();
        
        // Update filter options from cache if available
        const cachedFilterOptions = exerciseCache.getFilterOptions();
        if (cachedFilterOptions) {
          setFilterOptions(cachedFilterOptions);
        }
        
        setCacheLoaded(true);
        
        // Only switch to cached data if user hasn't changed filters/page yet
        // This prevents jarring UI changes if they're already browsing
        if (page === currentPage && JSON.stringify(filters) === JSON.stringify(initialFilters)) {
          performClientSearch(filters, page);
        }
      } catch (error) {
        console.error('Failed to initialize cache:', error);
        // We have SSR data, so just log the error - no need to show to user
        console.warn('Cache initialization failed, but displaying server-side data');
        setCacheLoaded(false);
      }
    };

    // Start cache loading immediately but don't wait for it
    initCache();
  }, []); // Run once on mount

  // Perform client-side search using cache
  const performClientSearch = useCallback((searchFilters: Filters, pageNum: number) => {
    if (!exerciseCache.isReady()) {
      return;
    }

    const result = exerciseCache.searchExercises(
      searchFilters.search || '',
      searchFilters,
      pageNum,
      15 // items per page
    );

    setExercises(result.exercises);
    setTotal(result.total);
    setPage(pageNum);
  }, []);

  // Update URL when filters or page change
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

  // Handle filter changes
  const handleFiltersChange = useCallback((newFilters: Filters) => {
    setFilters(newFilters);
    
    // Reset to page 1 when filters change
    const newPage = 1;
    setPage(newPage);
    
    // Perform instant client-side search
    performClientSearch(newFilters, newPage);
    
    // Update URL
    updateURL(newFilters, newPage);
  }, [performClientSearch, updateURL]);

  // Handle pagination changes
  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
    performClientSearch(filters, newPage);
    updateURL(filters, newPage);
    
    // Scroll to top of exercise grid
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [filters, performClientSearch, updateURL]);

  // Handle clear filters
  const handleClearFilters = useCallback(() => {
    const clearedFilters: Filters = {};
    handleFiltersChange(clearedFilters);
  }, [handleFiltersChange]);

  // Calculate total pages
  const totalPages = Math.ceil(total / 15);

  // Show loading state while cache is initializing
  // Removed loading blocker - we now show SSR data immediately while cache loads in background

  return (
    <>
      {/* Filters */}
      <div className="mb-12">
        <ExerciseFilters 
          filters={filters}
          filterOptions={filterOptions}
          onFiltersChange={handleFiltersChange}
          onClearFilters={handleClearFilters}
          isLoading={isSearching}
        />
      </div>

      {/* Search Error */}
      {(searchError || storeError) && (
        <div className="mb-8">
          <Alert variant="destructive">
            <AlertDescription>
              {searchError || storeError}
            </AlertDescription>
          </Alert>
        </div>
      )}

      {/* Cache Status Indicator (dev only - will not appear in production) */}
      {process.env.NODE_ENV === 'development' && cacheLoaded && (
        <div className="mb-4 p-2 bg-green-50 border border-green-200 rounded text-xs text-green-700 font-mono">
          <span className="font-bold">[DEV]</span> Cache ready: {exerciseCache.getStats().exerciseCount} exercises • Instant search enabled
        </div>
      )}

      {/* Results Summary */}
      <div className="mb-8">
        <p className="text-sm text-grayscale-500 text-center">
          {isSearching ? (
            'Searching...'
          ) : (
            <>
              Showing {exercises.length} of {total} exercises
              {page > 1 && ` (Page ${page} of ${totalPages})`}
              {filters.search && (
                <span className="ml-2 text-brand-blue">• Instant search results</span>
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center">
          <PaginationClient
            currentPage={page}
            totalPages={totalPages}
            filters={filters}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </>
  );
};

export default ExerciseLibraryClient;
