import { NextRequest, NextResponse } from 'next/server';
import { getSessionToken } from '@/lib/auth/session';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const BACKEND_BASE_URL = process.env.BACKEND_BASE_URL || 'https://ezlift-server-production.fly.dev';

/**
 * GET /api/workout
 * Proxies workout/routine requests to backend
 * Requires authentication
 */
export async function GET(request: NextRequest) {
  try {
    // Get session token from cookies
    const sessionToken = await getSessionToken();
    
    if (!sessionToken) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Extract query parameters
    const { searchParams } = request.nextUrl;
    const limit = searchParams.get('limit') || '50';
    const sort = searchParams.get('sort') || '-createdAt';
    const filter = searchParams.get('filter') || '';

    // Build backend URL with query params
    const backendUrl = new URL(`${BACKEND_BASE_URL}/api/routine`);
    backendUrl.searchParams.set('limit', limit);
    backendUrl.searchParams.set('sort', sort);
    if (filter) {
      backendUrl.searchParams.set('filter', filter);
    }

    // Proxy request to backend with auth header
    const response = await fetch(backendUrl.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-jwt-token': sessionToken,
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      // Normalize certain backend failures to 401 to trigger re-auth on client
      if (response.status === 500 && /unauthor/i.test(error?.message || '')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      return NextResponse.json(
        { error: error.message || 'Failed to fetch workouts' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error: any) {
    console.error('Workout API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}


