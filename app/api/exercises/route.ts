import { NextRequest, NextResponse } from 'next/server';
import exerciseDataService from '@/lib/services/exercise-data';
import { ExerciseFilters } from '@/types/exercise';
import { EXERCISE_LIBRARY_PAGE_SIZE } from '@/lib/constants/pagination';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse query parameters
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || EXERCISE_LIBRARY_PAGE_SIZE.toString());
    
    // Build filters from search params
    const filters: ExerciseFilters = {};
    
    const search = searchParams.get('search');
    if (search) {
      filters.search = search;
    }
    
    const type = searchParams.get('type');
    if (type) {
      filters.exerciseType = type;
    }
    
    const muscle = searchParams.get('muscle');
    if (muscle) {
      filters.primaryMuscleGroup = muscle;
    }
    
    const movement = searchParams.get('movement');
    if (movement) {
      filters.force = movement as 'Push' | 'Pull' | 'Static';
    }
    
    const difficulty = searchParams.get('difficulty');
    if (difficulty) {
      filters.level = difficulty as 'Beginner' | 'Intermediate' | 'Expert';
    }

    // Validate pagination parameters
    // Allow up to 2000 for cache loading, but recommend smaller pages for regular use
    if (page < 1 || limit < 1 || limit > 2000) {
      return NextResponse.json(
        { error: 'Invalid pagination parameters' },
        { status: 400 }
      );
    }

    // Fetch exercises
    const result = await exerciseDataService.getExercises(filters, page, limit);
    
    // Log Contentful data stats (server-side)
    const withContent = result.exercises.filter(ex => ex.content).length;
    const withSlugs = result.exercises.filter(ex => ex.content?.slug).length;
    const withTitles = result.exercises.filter(ex => ex.content?.title).length;
    console.log(`[API /exercises] Returning ${result.exercises.length} exercises: ${withContent} with content (${withSlugs} slugs, ${withTitles} titles)`);
    
    if (withContent > 0) {
      const sample = result.exercises.find(ex => ex.content?.slug);
      console.log(`[API /exercises] Sample:`, {
        id: sample?.id,
        name: sample?.name,
        contentTitle: sample?.content?.title,
        contentSlug: sample?.content?.slug,
      });
    }
    
    // Return the result
    return NextResponse.json(result);
    
  } catch (error) {
    console.error('API Error fetching exercises:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch exercises',
        exercises: [],
        total: 0,
        page: 1,
        limit: EXERCISE_LIBRARY_PAGE_SIZE
      },
      { status: 500 }
    );
  }
}
