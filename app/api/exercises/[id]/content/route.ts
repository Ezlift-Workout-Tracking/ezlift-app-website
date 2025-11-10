import { NextRequest, NextResponse } from 'next/server';

// Dynamic import of Contentful to handle cases where it's not configured
async function getContentfulData(exerciseId: string) {
  try {
    const contentful = await import('@/lib/contentful');
    if (contentful.getExerciseContentByExerciseId) {
      const content = await contentful.getExerciseContentByExerciseId(exerciseId);
      if (content) {
        return {
          title: content.title,
          slug: content.slug,
          seo_description: content.seo_description,
        };
      }
    }
  } catch (error) {
    console.error('Error fetching Contentful data:', error);
  }
  return null;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const contentfulData = await getContentfulData(id);
    
    if (!contentfulData) {
      return NextResponse.json(null, { status: 404 });
    }
    
    return NextResponse.json(contentfulData);
  } catch (error) {
    console.error('API Error fetching exercise content:', error);
    return NextResponse.json(
      { error: 'Failed to fetch exercise content' },
      { status: 500 }
    );
  }
}

