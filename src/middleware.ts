import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect the dashboard and API routes (except login and auth API)
  if (
    pathname === '/' || 
    (pathname.startsWith('/api/') && !pathname.startsWith('/api/auth'))
  ) {
    const session = request.cookies.get('stream_session')?.value;
    const apiKey = request.headers.get('x-api-key') || request.nextUrl.searchParams.get('api_key');
    const validApiKey = process.env.API_KEY;

    const isApiAuthorized = validApiKey && apiKey === validApiKey;
    const isSessionAuthorized = session === 'authenticated';

    if (!isSessionAuthorized && !isApiAuthorized) {
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
