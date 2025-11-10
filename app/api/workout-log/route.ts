import { NextRequest, NextResponse } from 'next/server';
import { getSessionToken } from '@/lib/auth/session';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const BACKEND_BASE_URL = process.env.BACKEND_BASE_URL || 'https://ezlift-server-production.fly.dev';

export async function GET(_request: NextRequest) {
  try {
    const sessionToken = await getSessionToken();
    if (!sessionToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Dev mock toggle
    const useMockData = process.env.NODE_ENV === 'development' && process.env.MOCK_API_DATA === 'true';
    if (useMockData) {
      return NextResponse.json([]);
    }

    const doFetch = (url: string) =>
      fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-jwt-token': sessionToken,
        },
        cache: 'no-store',
      });

    // Primary endpoint
    let response = await doFetch(`${BACKEND_BASE_URL}/api/workout-log`);

    // Fallbacks for differing deployments
    if (!response.ok && (response.status === 404 || response.status === 405)) {
      let fallback = await doFetch(`${BACKEND_BASE_URL}/workout-log`);
      if (!fallback.ok && (fallback.status === 404 || fallback.status === 405)) {
        fallback = await doFetch(`${BACKEND_BASE_URL}/api/logs`);
      }
      response = fallback;
    }

    if (!response.ok) {
      let message = 'Failed to fetch workout logs';
      try {
        const err = await response.json();
        message = err?.message || message;
      } catch {}
      // Normalize certain backend failures to 401 to trigger re-auth on client
      if (response.status === 500 && /unauthor/i.test(message)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      return NextResponse.json({ error: message }, { status: response.status });
    }

    try {
      const data = await response.json();
      return NextResponse.json(data);
    } catch {
      // Non-JSON response; return empty array to avoid client crash
      return NextResponse.json([]);
    }
  } catch (error) {
    console.error('Workout Log API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Respond to preflight/HEAD gracefully if issued by tooling
export async function HEAD() {
  return new NextResponse(null, { status: 200 });
}

export async function OPTIONS() {
  const res = new NextResponse(null, { status: 200 });
  res.headers.set('Allow', 'GET,HEAD,OPTIONS');
  return res;
}
