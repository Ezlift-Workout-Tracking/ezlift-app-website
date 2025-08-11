import React from 'react';
import { Metadata } from 'next';
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { FadeIn } from "@/components/animations/FadeIn";
import { EmptyState } from "@/components/ui/empty-state";
import { Dumbbell } from "lucide-react";

import exerciseDataService from '../../lib/services/exercise-data';
import ExerciseLibraryClient from '../../components/exercise/ExerciseLibraryClient';
import { Button } from '../../components/ui/button';
import { ExerciseFilters as Filters, FilterOptions } from '../../types/exercise';
import { EXERCISE_LIBRARY_PAGE_SIZE } from '../../lib/constants/pagination';

// Static metadata is now replaced by dynamic generateMetadata function below

// Generate SEO pagination metadata
function generatePaginationMetadata(page: number, totalPages: number, filters: Filters): Metadata {
  const baseUrl = 'https://ezlift.app/exercise-library';
  const params = new URLSearchParams();
  
  // Add filter params
  if (filters.search) params.set('search', filters.search);
  if (filters.exerciseType) params.set('type', filters.exerciseType);
  if (filters.primaryMuscleGroup) params.set('muscle', filters.primaryMuscleGroup);
  if (filters.force) params.set('movement', filters.force);
  if (filters.level) params.set('difficulty', filters.level);
  
  const queryString = params.toString();
  const baseUrlWithQuery = queryString ? `${baseUrl}?${queryString}` : baseUrl;
  
  const links: { rel: string; href: string }[] = [];
  
  // Canonical link
  if (page > 1) {
    params.set('page', page.toString());
    links.push({ rel: 'canonical', href: `${baseUrl}?${params.toString()}` });
  } else {
    links.push({ rel: 'canonical', href: baseUrlWithQuery });
  }
  
  // Previous page link
  if (page > 1) {
    const prevParams = new URLSearchParams(params);
    if (page === 2) {
      prevParams.delete('page'); // First page doesn't need page param
    } else {
      prevParams.set('page', (page - 1).toString());
    }
    const prevUrl = prevParams.toString() ? `${baseUrl}?${prevParams.toString()}` : baseUrl;
    links.push({ rel: 'prev', href: prevUrl });
  }
  
  // Next page link
  if (page < totalPages) {
    const nextParams = new URLSearchParams(params);
    nextParams.set('page', (page + 1).toString());
    links.push({ rel: 'next', href: `${baseUrl}?${nextParams.toString()}` });
  }
  
  return {
    other: {
      'link': links.map(link => `<${link.href}>; rel="${link.rel}"`).join(', ')
    }
  };
}

// Force dynamic rendering due to searchParams usage
export const dynamic = 'force-dynamic';

interface ExerciseLibraryPageProps {
  searchParams: Promise<{
    search?: string;
    type?: string;
    muscle?: string;
    movement?: string;
    difficulty?: string;
    page?: string;
  }>;
}

// Generate structured data for rich search results
function generateStructuredData(exercises: any[], filters: Filters, page: number, totalPages: number, total: number) {
  const baseUrl = 'https://ezlift.app/exercise-library';
  
  // ItemList schema for the exercise listing page
  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": filters.primaryMuscleGroup ? `${filters.primaryMuscleGroup} Exercises` : 
            filters.exerciseType ? `${filters.exerciseType} Exercises` :
            filters.search ? `"${filters.search}" Exercise Search Results` :
            "Exercise Library",
    "description": filters.primaryMuscleGroup ? `Complete list of ${filters.primaryMuscleGroup.toLowerCase()} exercises with proper form instructions and videos.` :
                   filters.exerciseType ? `Browse ${filters.exerciseType.toLowerCase()} exercises with detailed instructions.` :
                   filters.search ? `Search results for "${filters.search}" in our comprehensive exercise database.` :
                   "Comprehensive exercise library with detailed instructions, images, and videos for proper form.",
    "numberOfItems": total,
    "url": baseUrl,
    "itemListElement": exercises.map((exercise, index) => ({
      "@type": "ListItem",
      "position": (page - 1) * 15 + index + 1,
      "url": `${baseUrl}/${exercise.content?.slug || exercise.id}`,
      "item": {
        "@type": "Exercise",
        "name": exercise.content?.title || exercise.name,
        "exerciseType": exercise.exerciseType || "Strength",
        "muscleWorked": [
          exercise.primaryMuscleGroup,
          ...(exercise.otherMuscleGroups || [])
        ].filter(Boolean),
        "equipment": exercise.equipment || "Body Weight",
        "difficulty": exercise.level || "Beginner",
        "instructions": exercise.content?.description ? 
          exercise.content.description.substring(0, 200) + "..." : 
          `Learn proper form and technique for ${exercise.name}. Target your ${exercise.primaryMuscleGroup} with this effective exercise.`,
        "image": exercise.media?.imageUrl ? 
          `https://ezlift.app${exercise.media.imageUrl}` : 
          "https://ezlift.app/images/exercise-placeholder.svg",
        "url": `${baseUrl}/${exercise.content?.slug || exercise.id}`
      }
    }))
  };

  // WebSite schema for search functionality
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "EZLift Exercise Library",
    "url": "https://ezlift.app",
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": "https://ezlift.app/exercise-library?search={search_term_string}"
      },
      "query-input": "required name=search_term_string"
    }
  };

  return {
    itemList: itemListSchema,
    website: websiteSchema
  };
}

// Generate dynamic metadata for each page
export async function generateMetadata({ searchParams }: ExerciseLibraryPageProps): Promise<Metadata> {
  try {
    const resolvedSearchParams = await searchParams;
    const page = parseInt(resolvedSearchParams.page || '1');
    
    const filters: Filters = {
      search: resolvedSearchParams.search || undefined,
      exerciseType: resolvedSearchParams.type || undefined,
      primaryMuscleGroup: resolvedSearchParams.muscle || undefined,
      force: resolvedSearchParams.movement as any || undefined,
      level: resolvedSearchParams.difficulty as any || undefined,
    };

    // Get total count for pagination metadata
    const exerciseResponse = await exerciseDataService.getExercises(filters, page, EXERCISE_LIBRARY_PAGE_SIZE);
    const totalPages = Math.ceil((exerciseResponse?.total || 0) / EXERCISE_LIBRARY_PAGE_SIZE);

    // Generate dynamic title and description based on filters and page
    let title = 'Exercise Library | EZLift';
    let description = 'Browse our comprehensive exercise library with detailed instructions, images, and videos.';

    if (filters.primaryMuscleGroup) {
      title = `${filters.primaryMuscleGroup} Exercises | EZLift`;
      description = `Discover ${filters.primaryMuscleGroup.toLowerCase()} exercises with proper form instructions and videos.`;
    }
    
    if (filters.exerciseType) {
      title = `${filters.exerciseType} Exercises | EZLift`;
      description = `Browse ${filters.exerciseType.toLowerCase()} exercises with detailed instructions.`;
    }

    if (filters.search) {
      title = `"${filters.search}" Exercises | EZLift`;
      description = `Search results for "${filters.search}" in our exercise library.`;
    }

    if (page > 1) {
      title += ` - Page ${page}`;
      description += ` Page ${page} of ${totalPages}.`;
    }

    // Combine base metadata with pagination metadata and OpenGraph
    const baseMetadata: Metadata = {
      title,
      description,
      keywords: 'exercise library, workout exercises, fitness, strength training, EZLift',
      openGraph: {
        title,
        description,
        type: 'website',
        url: `https://ezlift.app/exercise-library${page > 1 ? `?page=${page}` : ''}${filters.search ? `${page > 1 ? '&' : '?'}search=${encodeURIComponent(filters.search)}` : ''}${filters.primaryMuscleGroup ? `${(page > 1 || filters.search) ? '&' : '?'}muscle=${encodeURIComponent(filters.primaryMuscleGroup)}` : ''}`,
        siteName: 'EZLift',
        images: [
          {
            url: 'https://ezlift.app/app-preview.webp',
            width: 1200,
            height: 630,
            alt: title,
          },
        ],
        locale: 'en_US',
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: ['https://ezlift.app/app-preview.webp'],
        creator: '@ezliftapp',
        site: '@ezliftapp',
      },
    };

    const paginationMetadata = generatePaginationMetadata(page, totalPages, filters);
    
    return {
      ...baseMetadata,
      ...paginationMetadata,
    };
  } catch (error) {
    console.error('Error generating exercise library metadata:', error);
    return {
      title: 'Exercise Library | EZLift',
      description: 'Browse our comprehensive exercise library with detailed instructions, images, and videos.',
      keywords: 'exercise library, workout exercises, fitness, strength training, EZLift',
    };
  }
}

const ExerciseLibraryPage: React.FC<ExerciseLibraryPageProps> = async ({
  searchParams,
}) => {
  try {
    // Await searchParams before accessing properties (Next.js 15 requirement)
    const resolvedSearchParams = await searchParams;

    // Parse search parameters
    const page = parseInt(resolvedSearchParams.page || '1');
    const limit = EXERCISE_LIBRARY_PAGE_SIZE; // 15 exercises per page for 3×5 grid layout

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

    // Handle out-of-range pages - redirect to last valid page if current page exceeds total pages
    if (page > totalPages && totalPages > 0) {
      const params = new URLSearchParams();
      
      // Preserve filters
      if (filters.search) params.set('search', filters.search);
      if (filters.exerciseType) params.set('type', filters.exerciseType);
      if (filters.primaryMuscleGroup) params.set('muscle', filters.primaryMuscleGroup);
      if (filters.force) params.set('movement', filters.force);
      if (filters.level) params.set('difficulty', filters.level);
      
      // Set to last valid page
      if (totalPages > 1) params.set('page', totalPages.toString());
      
      const redirectURL = `/exercise-library${params.toString() ? '?' + params.toString() : ''}`;
      
      // For server-side redirect in Next.js, we'll render a client-side redirect
      // since we can't use redirect() here directly in this context
      return (
        <>
          <Header hideMenu className="bg-gray-900 !bg-opacity-100 !backdrop-blur-none supports-[backdrop-filter]:bg-gray-900" />
          <div className="flex flex-col min-h-screen bg-gray-100 text-gray-900">
            <main className="flex-1 py-24">
              <div className="container px-4 mx-auto max-w-7xl">
                <div className="max-w-4xl mx-auto">
                  <EmptyState
                    icon={<Dumbbell className="w-12 h-12 text-gray-400" />}
                    title="Page Not Found"
                    description={`Page ${page} doesn't exist. There are only ${totalPages} page${totalPages === 1 ? '' : 's'} of results.`}
                    action={
                      <Button 
                        variant="outline" 
                        asChild
                        className="mt-4"
                      >
                        <a href={redirectURL}>Go to Last Page</a>
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

    // Generate structured data for this page
    const structuredData = generateStructuredData(exercises, filters, page, totalPages, total);

    return (
      <>
        <Header hideMenu className="bg-gray-900 !bg-opacity-100 !backdrop-blur-none supports-[backdrop-filter]:bg-gray-900" />
        
        {/* JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([structuredData.itemList, structuredData.website])
          }}
        />
        
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

              {/* Exercise Library Client Component */}
              <ExerciseLibraryClient
                initialData={{ exercises, total, page, limit }}
                initialFilters={filters}
                filterOptions={filterOptions}
                currentPage={page}
              />
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