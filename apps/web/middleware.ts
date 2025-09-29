import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Geçici olarak middleware'i kapat - test için
  return NextResponse.next();
  
  // Auth sayfası ve public sayfalar için koruma yok
  if (pathname.startsWith('/auth') || pathname === '/' || pathname.startsWith('/_next') || pathname.startsWith('/api')) {
    return NextResponse.next();
  }
  
  // Dashboard ve diğer korumalı sayfalar için auth kontrolü
  if (pathname.startsWith('/dashboard') || pathname.startsWith('/settings')) {
    // Token kontrolü
    const token = request.cookies.get('auth_token')?.value || 
                  request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      // Token yoksa auth sayfasına yönlendir
      return NextResponse.redirect(new URL('/auth', request.url));
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
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
