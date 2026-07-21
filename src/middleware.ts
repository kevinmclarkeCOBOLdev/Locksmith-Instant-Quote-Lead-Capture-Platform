import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyJWT } from './services/auth';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionToken = request.cookies.get('session')?.value;

  // Verify the JWT token
  const session = sessionToken ? await verifyJWT(sessionToken) : null;

  // Route protection
  const isDashboardPath = pathname.startsWith('/dashboard');
  const isLoginPath = pathname === '/login';

  if (isDashboardPath && !session) {
    // Redirect to login if trying to access dashboard while unauthenticated
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  if (isLoginPath && session) {
    // Redirect to dashboard if trying to access login while already authenticated
    const dashboardUrl = new URL('/dashboard', request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  // Pass user and tenant context to downstream headers if authenticated
  const response = NextResponse.next();
  if (session) {
    response.headers.set('x-tenant-id', session.tenantId);
    response.headers.set('x-user-email', session.email);
  }

  return response;
}

// Match only dashboard routes and the login route
export const config = {
  matcher: ['/dashboard/:path*', '/login'],
};
