import { NextRequest, NextResponse } from 'next/server';
import { getSessionToken } from '@/lib/auth/session';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const BACKEND_BASE_URL = process.env.BACKEND_BASE_URL || 'https://ezlift-server-production.fly.dev';

/**
 * GET /api/workout/:id
 * Proxies workout detail lookup to backend API.
 */
export async function GET(_request: NextRequest, context: { params: { id: string } }) {
  try {
    const sessionToken = await getSessionToken();
    if (!sessionToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = context.params;
    const url = `${BACKEND_BASE_URL}/api/workout/${encodeURIComponent(id)}`;

    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-jwt-token': sessionToken,
      },
      cache: 'no-store',
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      if (res.status === 500 && /unauthor/i.test(error?.message || '')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      return NextResponse.json({ error: error.message || 'Failed to fetch workout' }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    console.error('Workout detail proxy error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
