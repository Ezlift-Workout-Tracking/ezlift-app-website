import { NextRequest, NextResponse } from 'next/server';
import { getSessionToken } from '@/lib/auth/session';

export const runtime = 'nodejs';

const BACKEND_BASE_URL = process.env.BACKEND_BASE_URL || 'https://ezlift-server-production.fly.dev';

/**
 * GET /api/exercise/:id
 * Proxies single exercise lookup to backend API
 * Requires authentication
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const sessionToken = await getSessionToken();
    if (!sessionToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const backendUrl = `${BACKEND_BASE_URL}/api/exercise/${encodeURIComponent(id)}`;

    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-jwt-token': sessionToken,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: error.message || 'Failed to fetch exercise' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Exercise API proxy error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

