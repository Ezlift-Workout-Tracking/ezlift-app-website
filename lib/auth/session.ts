import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export interface SessionData {
  token: string;
  user: {
    id: string;
    email: string;
    name?: string;
  };
  exp: number; // epoch seconds
}

export interface BackendVerifyResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name?: string;
  };
  exp: number;
}

const BACKEND_BASE_URL = process.env.BACKEND_BASE_URL || 'https://ezlift-server-production.fly.dev';
const AUTH_DEV_MODE = process.env.AUTH_DEV_MODE === 'true' || process.env.AUTH_DEV_MODE === '1';

// Decode a JWT without verifying the signature (DEV ONLY)
function decodeJwt<T = any>(jwt: string): T | null {
  try {
    const parts = jwt.split('.');
    if (parts.length !== 3) return null;
    const payload = parts[1];
    const padded = payload.replace(/-/g, '+').replace(/_/g, '/');
    const json = Buffer.from(padded, 'base64').toString('utf8');
    return JSON.parse(json);
  } catch {
    return null;
  }
}

function normalizeSessionData(raw: any, idToken?: string): SessionData {
  const now = Math.floor(Date.now() / 1000);

  // Token
  const token: string | undefined = raw?.token || raw?.jwt || raw?.accessToken || raw?.sessionToken || idToken;

  // User
  const rawUser = raw?.user || {};
  const userId = rawUser.id || raw.userId || raw.uid || raw.sub || rawUser.userId;
  const userEmail = rawUser.email || raw.email;
  const userName = rawUser.name || raw.name;

  // Exp
  const exp: number = raw?.exp || raw?.expiresAt || raw?.expiry || (now + 60 * 60);

  // If user info missing, try to decode id token
  let finalUserId = userId;
  let finalEmail = userEmail;
  let finalName = userName;
  if ((!finalUserId || !finalEmail) && idToken) {
    const payload = decodeJwt<any>(idToken) || {};
    finalUserId = finalUserId || payload.user_id || payload.uid || payload.sub;
    finalEmail = finalEmail || payload.email || '';
    finalName = finalName || payload.name;
  }

  if (!token) {
    throw new Error('Missing session token in backend response');
  }
  if (!finalUserId) {
    throw new Error('Missing user id in backend response');
  }

  return {
    token,
    user: {
      id: String(finalUserId),
      email: String(finalEmail || ''),
      name: finalName ? String(finalName) : undefined,
    },
    exp: Number(exp) || now + 60 * 60,
  };
}

export const verifyWithBackend = async (idToken: string): Promise<BackendVerifyResponse> => {
  try {
    const response = await fetch(`${BACKEND_BASE_URL}/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: idToken }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Failed to verify token with backend');
    }

    const raw = await response.json();
    return normalizeSessionData(raw, idToken);
  } catch (error) {
    if (AUTH_DEV_MODE) {
      const payload = decodeJwt<any>(idToken);
      if (!payload) {
        throw new Error('Failed to decode ID token in dev mode');
      }
      return normalizeSessionData({
        token: idToken,
        user: { id: payload.user_id || payload.uid || payload.sub, email: payload.email, name: payload.name },
        exp: payload.exp,
      }, idToken);
    }

    throw error;
  }
};

export const setSessionCookies = (sessionData: SessionData, response: NextResponse) => {
  const cookieStore = response.cookies;
  const now = Math.floor(Date.now() / 1000);
  const maxAge = Math.max(0, (sessionData.exp || now + 3600) - now);
  
  // Main session token cookie
  cookieStore.set('session-token', sessionData.token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge,
  });

  // User info cookie (non-sensitive)
  cookieStore.set('user-info', JSON.stringify({
    id: sessionData.user?.id,
    email: sessionData.user?.email,
    name: sessionData.user?.name,
  }), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge,
  });

  return response;
};

export const clearSessionCookies = (response: NextResponse) => {
  const cookieStore = response.cookies;
  cookieStore.delete('session-token');
  cookieStore.delete('user-info');
  return response;
};

export const getSessionToken = async (): Promise<string | null> => {
  const cookieStore = await cookies();
  return cookieStore.get('session-token')?.value || null;
};

export const getUserInfo = async () => {
  const cookieStore = await cookies();
  const userInfoCookie = cookieStore.get('user-info')?.value;
  if (!userInfoCookie) return null;
  try {
    return JSON.parse(userInfoCookie);
  } catch {
    return null;
  }
};

export const isSessionValid = async (): Promise<boolean> => {
  const token = await getSessionToken();
  if (!token) return false;
  const userInfo = await getUserInfo();
  if (!userInfo) return false;
  return true;
};

export const getSessionData = async (): Promise<SessionData | null> => {
  const token = await getSessionToken();
  const userInfo = await getUserInfo();
  if (!token || !userInfo) return null;
  return { token, user: userInfo, exp: 0 };
}; 