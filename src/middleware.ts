import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyJWT } from './services/auth';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionToken = request.cookies.get('session')?.value;

  // Verify the JWT token
  const session = sessionToken ? await verifyJWT(sessionToken) : null;

  // Route protection: If unauthenticated user tries to access /dashboard directly, redirect to home page with login modal prompt
  if (pathname.startsWith('/dashboard') && !session) {
    const homeUrl = new URL('/?login=true', request.url);
    return NextResponse.redirect(homeUrl);
  }

  // Pass user and tenant context to downstream headers if authenticated
  const response = NextResponse.next();
  if (session) {
    response.headers.set('x-tenant-id', session.tenantId);
    response.headers.set('x-user-email', session.email);
  }

  return response;
}

export const config = {
  matcher: ['/dashboard/:path*'],
};
