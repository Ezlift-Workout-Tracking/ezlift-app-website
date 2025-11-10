import { NextRequest, NextResponse } from 'next/server';

// Dynamic import of Contentful to handle cases where it's not configured
async function getMultipleContentfulData(exerciseIds: string[]) {
  try {
    const contentful = await import('@/lib/contentful');
    if (contentful.getMultipleExerciseContents) {
      const contentMap = await contentful.getMultipleExerciseContents(exerciseIds);
      
      // Convert Map to plain object with just title and slug
      const result: Record<string, { title?: string; slug?: string; seo_description?: string }> = {};
      contentMap.forEach((content, id) => {
        result[id] = {
          title: content.title,
          slug: content.slug,
          seo_description: content.seo_description,
        };
      });
      
      return result;
    }
  } catch (error) {
    console.error('Error fetching multiple Contentful data:', error);
  }
  return {};
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { exerciseIds } = body;
    
    if (!Array.isArray(exerciseIds) || exerciseIds.length === 0) {
      return NextResponse.json(
        { error: 'exerciseIds must be a non-empty array' },
        { status: 400 }
      );
    }
    
    const contentfulData = await getMultipleContentfulData(exerciseIds);
    
    return NextResponse.json(contentfulData);
  } catch (error) {
    console.error('API Error fetching batch exercise content:', error);
    return NextResponse.json(
      { error: 'Failed to fetch batch exercise content' },
      { status: 500 }
    );
  }
}

