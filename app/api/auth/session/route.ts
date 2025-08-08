import { NextRequest, NextResponse } from 'next/server';

// Ensure Node.js runtime if any Admin SDK is introduced here in future
export const runtime = 'nodejs';
import { verifyWithBackend, setSessionCookies, clearSessionCookies } from '@/lib/auth/session';

export async function POST(request: NextRequest) {
  try {
    const { idToken } = await request.json();

    if (!idToken) {
      return NextResponse.json(
        { error: 'ID token is required' },
        { status: 400 }
      );
    }

    // Verify the Firebase ID token with the backend
    const sessionData = await verifyWithBackend(idToken);

    // Create response with session data
    const response = NextResponse.json({
      success: true,
      user: sessionData.user,
    });

    // Set secure session cookies
    setSessionCookies(sessionData, response);

    return response;
  } catch (error: any) {
    console.error('Session creation error:', error);
    
    return NextResponse.json(
      { 
        error: 'Authentication failed',
        details: error.message 
      },
      { status: 401 }
    );
  }
}

export async function DELETE() {
  try {
    // Create response for logout
    const response = NextResponse.json({
      success: true,
      message: 'Logged out successfully',
    });

    // Clear session cookies
    clearSessionCookies(response);

    return response;
  } catch (error: any) {
    console.error('Logout error:', error);
    
    return NextResponse.json(
      { error: 'Logout failed' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // This endpoint can be used to check if the user is authenticated
    // by checking if the session cookies exist and are valid
    const { isSessionValid } = await import('@/lib/auth/session');
    const isValid = await isSessionValid();
    
    const response = NextResponse.json({
      authenticated: isValid,
      message: isValid ? 'Session is valid' : 'No valid session',
    });

    return response;
  } catch (error: any) {
    console.error('Session check error:', error);
    
    return NextResponse.json(
      { error: 'Session check failed' },
      { status: 500 }
    );
  }
} 