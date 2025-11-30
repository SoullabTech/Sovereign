import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Enhanced Middleware for Enterprise Security
 * - Rate limiting for API protection
 * - Admin route protection with Supabase auth
 * - Suspicious request detection and blocking
 */

// Admin configuration
const ADMIN_EMAILS = ['kelly@soullab.life', 'soullab1@gmail.com'];

// Rate limiting configuration
interface RateLimit {
  maxRequests: number;
  windowMs: number;
}

interface ClientEntry {
  requests: number[];
  suspicious: boolean;
  lastSeen: number;
}

// In-memory rate limiting store
const rateLimitStore = new Map<string, ClientEntry>();

// Rate limiting rules by endpoint
const rateLimitRules: Record<string, RateLimit> = {
  '/api/maia': { maxRequests: 30, windowMs: 60000 }, // 30 requests per minute
  '/api/auth': { maxRequests: 5, windowMs: 900000 }, // 5 requests per 15 minutes
  '/api/voice': { maxRequests: 20, windowMs: 60000 }, // 20 requests per minute
  '/api/backend': { maxRequests: 50, windowMs: 60000 }, // 50 requests per minute
  default: { maxRequests: 100, windowMs: 60000 } // Default: 100 requests per minute
};

// Suspicious patterns for attack detection
const suspiciousPatterns = [
  /\/api\/.*\.(php|asp|jsp)$/i,
  /\/wp-admin/i,
  /\/admin/i,
  /\.\./,
  /<script>/i,
  /union.*select/i,
  /\.env/i,
  /passwd/i
];

function getClientId(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0] : request.ip || 'unknown';
  const userAgent = request.headers.get('user-agent') || 'unknown';
  return `${ip}-${userAgent.substring(0, 50)}`;
}

function isSuspiciousRequest(request: NextRequest): boolean {
  const url = request.url;
  const userAgent = request.headers.get('user-agent') || '';

  // Check for suspicious patterns in URL
  if (suspiciousPatterns.some(pattern => pattern.test(url))) {
    return true;
  }

  // Check for suspicious user agents
  if (userAgent.length < 10 || /bot|crawler|spider/i.test(userAgent)) {
    return true;
  }

  return false;
}

function getRateLimit(pathname: string): RateLimit {
  for (const [path, limit] of Object.entries(rateLimitRules)) {
    if (path !== 'default' && pathname.startsWith(path)) {
      return limit;
    }
  }
  return rateLimitRules.default;
}

function cleanupOldEntries(): void {
  const now = Date.now();
  const oldestAllowed = now - 3600000; // 1 hour

  for (const [clientId, entry] of rateLimitStore.entries()) {
    if (entry.lastSeen < oldestAllowed) {
      rateLimitStore.delete(clientId);
    }
  }
}

function checkRateLimit(clientId: string, rateLimit: RateLimit, isSuspicious: boolean): {
  limited: boolean;
  remaining: number;
  resetTime: number;
  headers: Record<string, string>;
} {
  const now = Date.now();
  const windowStart = now - rateLimit.windowMs;

  let clientEntry = rateLimitStore.get(clientId);

  if (!clientEntry) {
    clientEntry = {
      requests: [],
      suspicious: isSuspicious,
      lastSeen: now
    };
    rateLimitStore.set(clientId, clientEntry);
  }

  // Update suspicious status
  if (isSuspicious) {
    clientEntry.suspicious = true;
  }

  // Remove old requests outside the window
  clientEntry.requests = clientEntry.requests.filter(time => time > windowStart);
  clientEntry.lastSeen = now;

  // Reduce limit for suspicious clients
  const maxRequests = clientEntry.suspicious ? Math.floor(rateLimit.maxRequests * 0.3) : rateLimit.maxRequests;
  const requestCount = clientEntry.requests.length;

  const headers = {
    'X-RateLimit-Limit': maxRequests.toString(),
    'X-RateLimit-Remaining': Math.max(0, maxRequests - requestCount - 1).toString(),
    'X-RateLimit-Reset': Math.ceil((now + rateLimit.windowMs) / 1000).toString(),
  };

  if (requestCount >= maxRequests) {
    return {
      limited: true,
      remaining: 0,
      resetTime: Math.ceil((clientEntry.requests[0] + rateLimit.windowMs) / 1000),
      headers: {
        ...headers,
        'Retry-After': Math.ceil((clientEntry.requests[0] + rateLimit.windowMs - now) / 1000).toString()
      }
    };
  }

  // Add current request
  clientEntry.requests.push(now);

  return {
    limited: false,
    remaining: maxRequests - requestCount - 1,
    resetTime: Math.ceil((now + rateLimit.windowMs) / 1000),
    headers
  };
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Skip middleware for static assets and internal Next.js routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname.includes('.') ||
    pathname === '/manifest.json'
  ) {
    return NextResponse.next();
  }

  // Apply rate limiting to API routes
  if (pathname.startsWith('/api')) {
    const clientId = getClientId(request);
    const suspicious = isSuspiciousRequest(request);

    // Block suspicious requests immediately
    if (suspicious) {
      console.warn(`[Security] Blocked suspicious request from ${clientId}: ${pathname}`);
      return new NextResponse(
        JSON.stringify({
          error: 'Forbidden',
          message: 'Request blocked by security policy',
        }),
        {
          status: 403,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Periodic cleanup (1% chance on each request)
    if (Math.random() < 0.01) {
      cleanupOldEntries();
    }

    // Check rate limit
    const rateLimit = getRateLimit(pathname);
    const { limited, headers } = checkRateLimit(clientId, rateLimit, suspicious);

    if (limited) {
      console.warn(`[Rate Limit] Blocked request from ${clientId}: ${pathname}`);
      return new NextResponse(
        JSON.stringify({
          error: 'Rate limit exceeded',
          message: 'Too many requests. Please try again later.',
        }),
        {
          status: 429,
          headers: {
            ...headers,
            'Content-Type': 'application/json',
          }
        }
      );
    }

    // Add rate limit headers to successful API responses
    const response = NextResponse.next();
    Object.entries(headers).forEach(([key, value]) => {
      response.headers.set(key, value);
    });

    return response;
  }

  // Admin route protection (existing logic)
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
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - Any file extension (handled by the function logic)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
