import { NextResponse } from 'next/server';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '@/../convex/_generated/api';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { signJWT } from '@/services/auth';

const convexUrl = process.env.CONVEX_URL || process.env.NEXT_PUBLIC_CONVEX_URL || process.env['NEXT_PUBLIC_CONVEX_URL'];
const convex = convexUrl ? new ConvexHttpClient(convexUrl) : null;

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ success: false, error: 'Email and password are required' }, { status: 400 });
    }

    let authenticatedUser: { id: string; tenantId: string; email: string } | null = null;

    if (convex) {
      // Authenticate via Convex
      const result = await convex.query(api.users.verifyUser, { email, password });
      if (result) {
        authenticatedUser = {
          id: result.id,
          tenantId: result.tenantId,
          email: result.email
        };
      }
    } else {
      // Authenticate via local PostgreSQL (fallback)
      const userList = await db
        .select()
        .from(users)
        .where(and(eq(users.email, email), eq(users.password, password)));

      if (userList.length > 0) {
        const u = userList[0];
        authenticatedUser = {
          id: u.id,
          tenantId: u.tenantId,
          email: u.email
        };
      }
    }

    if (!authenticatedUser) {
      return NextResponse.json({ success: false, error: 'Invalid email or password' }, { status: 401 });
    }

    // Sign the session JWT
    const token = await signJWT(authenticatedUser);

    // Set cookie
    const response = NextResponse.json({ success: true, user: authenticatedUser });
    response.cookies.set('session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60, // 1 day
      path: '/'
    });

    return response;
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
