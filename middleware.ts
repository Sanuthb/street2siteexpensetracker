import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { updateSession } from '@/lib/session';

export async function middleware(request: NextRequest) {
  const sessionValue = request.cookies.get("session")?.value;
  
  await updateSession(request);

  const isAuthRoute = request.nextUrl.pathname.startsWith('/login');
  const isDashboardRoute = request.nextUrl.pathname.startsWith('/dashboard') || 
                           request.nextUrl.pathname.startsWith('/projects') || 
                           request.nextUrl.pathname.startsWith('/clients') ||
                           request.nextUrl.pathname.startsWith('/reports') ||
                           request.nextUrl.pathname.startsWith('/settings') ||
                           request.nextUrl.pathname.startsWith('/payments') ||
                           request.nextUrl.pathname.startsWith('/expenses');

  if (!sessionValue && isDashboardRoute) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (sessionValue && isAuthRoute) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  
  if (request.nextUrl.pathname === '/') {
      if (sessionValue) {
          return NextResponse.redirect(new URL('/dashboard', request.url));
      } else {
          return NextResponse.redirect(new URL('/login', request.url));
      }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
};
