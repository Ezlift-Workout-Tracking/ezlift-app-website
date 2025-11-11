import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define protected routes that require authentication
const protectedRoutes = [
  '/app',
  '/dashboard',
  '/profile',
  '/settings',
  '/workouts',
  '/progress',
];

// Define auth routes that should redirect if user is already authenticated
const authRoutes = [
  '/login',
  '/signup',
  '/forgot-password',
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Check if the path is protected
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  );
  
  // Check if the path is an auth route
  const isAuthRoute = authRoutes.some(route => 
    pathname.startsWith(route)
  );

  // Get session token from cookies
  const sessionToken = request.cookies.get('session-token')?.value;
  const userInfo = request.cookies.get('user-info')?.value;

  // Check if user is authenticated
  const isAuthenticated = sessionToken && userInfo;

  // Handle protected routes
  if (isProtectedRoute && !isAuthenticated) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Handle auth routes when user is already authenticated
  if (isAuthRoute && isAuthenticated) {
    // Redirect to dashboard or home page
    const redirectUrl = new URL('/app', request.url);
    return NextResponse.redirect(redirectUrl);
  }

  // Continue with the request
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}; 