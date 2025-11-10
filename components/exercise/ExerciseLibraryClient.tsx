'use client';

import React, { useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Dumbbell } from 'lucide-react';
import { FadeIn } from '@/components/animations/FadeIn';
import { EmptyState } from '@/components/ui/empty-state';
import { Button } from '@/components/ui/button';
import ExerciseFilters from './ExerciseFilters';
import ExerciseCard from './ExerciseCard';
import PaginationClient from './PaginationClient';
import { ExerciseFilters as Filters, FilterOptions, ExerciseListResponse, Exercise } from '@/types/exercise';

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
  const [exercises] = useState<Exercise[]>(initialData.exercises);
  const [total] = useState(initialData.total);
  const [filters, setFilters] = useState<Filters>(initialFilters);
  const [filterOptions] = useState<FilterOptions>(initialFilterOptions);
  const [page, setPage] = useState(currentPage);

  const router = useRouter();
  const searchParams = useSearchParams();

  // REMOVED: Automatic full cache loading on mount
  // In production (serverless), loading 1000 exercises causes 504 timeouts
  // Instead, we rely on SSR for initial load and server-side search/pagination
  // This provides excellent performance without serverless timeout issues
  
  // Future optimization: Implement progressive caching as user browses
  // For now, SSR + server-side operations work great!

  // Search uses server-side operations (SSR + API)
  // This works perfectly in serverless environments without timeout issues

  // Update URL when filters or page change and trigger server-side refetch
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
    
    // Push new URL and refresh to trigger server-side data fetch
    router.push(newURL);
    router.refresh(); // Critical: triggers server component to re-fetch with new params
  }, [searchParams, router]);

  // Handle filter changes - triggers server-side refetch via URL update
  const handleFiltersChange = useCallback((newFilters: Filters) => {
    setFilters(newFilters);
    
    // Reset to page 1 when filters change
    const newPage = 1;
    setPage(newPage);
    
    // Update URL (triggers server-side refetch)
    updateURL(newFilters, newPage);
  }, [updateURL]);

  // Handle pagination changes - triggers server-side refetch via URL update
  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
    updateURL(filters, newPage);
    
    // Scroll to top of exercise grid
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [filters, updateURL]);

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
          isLoading={false}
        />
      </div>

      {/* SSR-based operations - no error states needed */}

      {/* Results Summary */}
      <div className="mb-8">
        <p className="text-sm text-grayscale-500 text-center">
          Showing {exercises.length} of {total} exercises
          {page > 1 && ` (Page ${page} of ${totalPages})`}
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
            title="No Exercises Found"
            description="Try adjusting your filters or search terms to find exercises that match your criteria."
            action={
              <Button 
                variant="outline" 
                onClick={handleClearFilters}
                className="mt-4"
              >
                Clear all filters
              </Button>
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
