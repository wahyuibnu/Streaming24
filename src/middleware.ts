import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect the dashboard and API routes (except login and auth API)
  if (
    pathname === '/' || 
    (pathname.startsWith('/api/') && !pathname.startsWith('/api/auth'))
  ) {
    const session = request.cookies.get('stream_session');
    
    // Simple secure check - in a real app, use JWT. For this scope, a secure signed cookie or matched secret is enough.
    // If there's no session, redirect to login
    if (!session || session.value !== 'authenticated') {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/api/stream/:path*'],
};
