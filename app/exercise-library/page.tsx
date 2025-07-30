import React from 'react';
import { Metadata } from 'next';
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { FadeIn } from "@/components/animations/FadeIn";
import { EmptyState } from "@/components/ui/empty-state";
import { Dumbbell } from "lucide-react";

import exerciseDataService from '../../lib/services/exercise-data';
import ExerciseFiltersClient from '../../components/exercise/ExerciseFiltersClient';
import ExerciseCard from '../../components/exercise/ExerciseCard';
import { Button } from '../../components/ui/button';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { ExerciseFilters as Filters, FilterOptions } from '../../types/exercise';
import PaginationClient from '@/components/exercise/PaginationClient';

export const metadata: Metadata = {
  title: 'Exercise Library | EZLift',
  description: 'Browse our comprehensive exercise library with detailed instructions, images, and videos.',
  keywords: 'exercise library, workout exercises, fitness, strength training, EZLift',
};

interface ExerciseLibraryPageProps {
  searchParams: {
    search?: string;
    type?: string;
    muscle?: string;
    movement?: string;
    difficulty?: string;
    page?: string;
  };
}

const ExerciseLibraryPage: React.FC<ExerciseLibraryPageProps> = async ({
  searchParams,
}) => {
  try {
    // Await searchParams before accessing properties (Next.js 15 requirement)
    const resolvedSearchParams = await searchParams;

    // Parse search parameters
    const page = parseInt(resolvedSearchParams.page || '1');
    const limit = 24; // 24 exercises per page for nice grid layout

    const filters: Filters = {
      search: resolvedSearchParams.search || undefined,
      exerciseType: resolvedSearchParams.type || undefined,
      primaryMuscleGroup: resolvedSearchParams.muscle || undefined,
      force: resolvedSearchParams.movement as any || undefined,
      level: resolvedSearchParams.difficulty as any || undefined,
    };

    // Fetch exercises and filter options in parallel
    const [exerciseResponse, filterOptions] = await Promise.all([
      exerciseDataService.getExercises(filters, page, limit),
      exerciseDataService.getFilterOptions()
    ]);

    if (!exerciseResponse || !filterOptions) {
      throw new Error('Failed to fetch data');
    }

    const { exercises, total } = exerciseResponse;
    const totalPages = Math.ceil(total / limit);

    return (
      <>
        <Header hideMenu className="bg-gray-900 !bg-opacity-100 !backdrop-blur-none supports-[backdrop-filter]:bg-gray-900" />
        <div className="flex flex-col min-h-screen bg-gray-100 text-gray-900">
          <main className="flex-1 py-24">
            <div className="container px-4 mx-auto max-w-7xl">
              <FadeIn>
                <div className="max-w-3xl mx-auto text-center mb-16">
                  <h1 className="text-5xl font-bold mb-6 text-gray-900">Exercise Library</h1>
                  <p className="text-xl text-gray-600 leading-relaxed">
                    Discover our comprehensive collection of exercises with detailed instructions, 
                    high-quality images, and instructional videos to help you perfect your form.
                  </p>
                </div>
              </FadeIn>

              {/* Filters */}
              <div className="mb-12">
                <ExerciseFiltersClient 
                  initialFilters={filters}
                  filterOptions={filterOptions}
                />
              </div>

              {/* Results Summary */}
              <div className="mb-8">
                <p className="text-sm text-gray-600 text-center">
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
                        asChild
                        className="mt-4"
                      >
                        <a href="/exercise-library">Clear all filters</a>
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
                  />
                </div>
              )}
            </div>
          </main>
        </div>
        <Footer />
      </>
    );
  } catch (error) {
    console.error('Error loading exercise library:', error);
    
    return (
      <>
        <Header hideMenu className="bg-gray-900 !bg-opacity-100 !backdrop-blur-none supports-[backdrop-filter]:bg-gray-900" />
        <div className="flex flex-col min-h-screen bg-gray-100 text-gray-900">
          <main className="flex-1 py-24">
            <div className="container px-4 mx-auto max-w-7xl">
              <div className="max-w-4xl mx-auto">
                <EmptyState
                  icon={<Dumbbell className="w-12 h-12 text-gray-400" />}
                  title="Unable to Load Exercise Library"
                  description="We're having trouble loading the exercise library. Please check your connection and try again."
                  action={
                    <Button 
                      variant="outline" 
                      asChild
                      className="mt-4"
                    >
                      <a href="/exercise-library">Try Again</a>
                    </Button>
                  }
                />
              </div>
            </div>
          </main>
        </div>
        <Footer />
      </>
    );
  }
};

export default ExerciseLibraryPage; 