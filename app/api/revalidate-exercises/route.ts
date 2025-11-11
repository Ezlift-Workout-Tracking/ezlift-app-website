import { revalidateTag } from 'next/cache';
import { NextResponse } from 'next/server';

/**
 * API route to manually revalidate exercise cache
 * 
 * Usage:
 * POST /api/revalidate-exercises
 * Body: { "secret": "your-secret", "tag": "exercises" }
 * 
 * This allows you to clear the cache on-demand when exercises are updated
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { secret, tag } = body;
    
    // Verify secret to prevent unauthorized revalidation
    const revalidateSecret = process.env.REVALIDATE_SECRET;
    
    if (!revalidateSecret) {
      return NextResponse.json(
        { error: 'Revalidation not configured' }, 
        { status: 500 }
      );
    }
    
    if (secret !== revalidateSecret) {
      return NextResponse.json(
        { error: 'Invalid secret' }, 
        { status: 401 }
      );
    }
    
    // Revalidate specific tag or all exercises
    const tagToRevalidate = tag || 'exercises';
    revalidateTag(tagToRevalidate);
    
    return NextResponse.json({ 
      revalidated: true, 
      tag: tagToRevalidate,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Revalidation error:', error);
    return NextResponse.json(
      { error: 'Revalidation failed' }, 
      { status: 500 }
    );
  }
}

// Also support GET for health check
export async function GET() {
  return NextResponse.json({ 
    status: 'ok',
    endpoint: '/api/revalidate-exercises',
    method: 'POST',
    requiredBody: {
      secret: 'your-revalidate-secret',
      tag: 'exercises (optional)'
    }
  });
}

