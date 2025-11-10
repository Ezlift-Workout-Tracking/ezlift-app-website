import { NextResponse } from 'next/server';
import exerciseDataService from '@/lib/services/exercise-data';

export async function GET() {
  try {
    const filterOptions = await exerciseDataService.getFilterOptions();
    return NextResponse.json(filterOptions);
  } catch (error) {
    console.error('API Error fetching filter options:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch filter options',
        primaryMuscleGroups: [],
        exerciseTypes: [],
        levels: [],
        forces: [],
        categories: [],
        equipment: [],
        mechanics: [],
      },
      { status: 500 }
    );
  }
}

