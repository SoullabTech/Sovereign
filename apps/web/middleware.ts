import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Middleware for admin route protection
 * Only allows admin users (kelly@soullab.life) to access /admin routes
 */

const ADMIN_EMAILS = ['kelly@soullab.life', 'soullab1@gmail.com'];

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Check if accessing admin routes
  if (pathname.startsWith('/admin')) {
    let response = NextResponse.next({
      request: {
        headers: request.headers,
      },
    });

    try {
      // Get Supabase config from environment
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      // If Supabase not configured, allow access (development mode)
      if (!supabaseUrl || !supabaseKey) {
        console.warn('[Admin Middleware] Supabase not configured - allowing access');
        return response;
      }

      // Create Supabase client for server-side auth check
      const supabase = createServerClient(
        supabaseUrl,
        supabaseKey,
        {
          cookies: {
            get(name: string) {
              return request.cookies.get(name)?.value;
            },
            set(name: string, value: string, options: CookieOptions) {
              request.cookies.set({
                name,
                value,
                ...options,
              });
              response = NextResponse.next({
                request: {
                  headers: request.headers,
                },
              });
              response.cookies.set({
                name,
                value,
                ...options,
              });
            },
            remove(name: string, options: CookieOptions) {
              request.cookies.set({
                name,
                value: '',
                ...options,
              });
              response = NextResponse.next({
                request: {
                  headers: request.headers,
                },
              });
              response.cookies.set({
                name,
                value: '',
                ...options,
              });
            },
          },
        }
      );

      // Get authenticated user
      const { data: { user } } = await supabase.auth.getUser();

      // Check if user is authenticated and is admin
      if (!user || !user.email || !ADMIN_EMAILS.includes(user.email.toLowerCase())) {
        // Redirect to sign in page
        const url = request.nextUrl.clone();
        url.pathname = '/auth/signin';
        url.searchParams.set('redirect', pathname);
        url.searchParams.set('error', 'Admin access required');
        return NextResponse.redirect(url);
      }

      return response;
    } catch (error) {
      console.error('[Admin Middleware] Auth check failed:', error);
      // On error, redirect to sign in
      const url = request.nextUrl.clone();
      url.pathname = '/auth/signin';
      url.searchParams.set('redirect', pathname);
      return NextResponse.redirect(url);
    }
  }

  // Allow request to continue
  return NextResponse.next();
}

// Configure which routes this middleware applies to
export const config = {
  matcher: [
    '/admin/:path*',
  ],
};
