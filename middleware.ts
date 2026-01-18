/**
 * Next.js Middleware for Multi-Tenant Practitioner Portals
 *
 * This middleware handles routing requests from practitioner subdomains
 * (loralee.soullab.life) and custom domains (stelliumbyloralee.com)
 * to the appropriate portal pages.
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import {
  parseTenantFromHost,
  buildPortalRewriteUrl,
  shouldHandleAsPortal,
  buildTenantHeaders,
} from './lib/practitioner/multiTenantMiddleware';

// Known application routes that should NOT be treated as passkeys
const KNOWN_ROUTES = [
  '/maia',
  '/signin',
  '/test-elemental',
  '/begin',
  '/api',
  '/portal',
  '/practitioner',
  '/stellium',
  '/faq',
  '/onboarding',
  '/account',
  '/patrons',
  '/intro-maia',
  '/intro-daimon',
  '/_next',
];

// Check if a path looks like a passkey (SOULLAB-NAME, MAIA-NAME, etc.)
function isPasskeyPath(pathname: string): boolean {
  // First, check if this is a known application route (exact match or prefix)
  const lowerPath = pathname.toLowerCase();
  if (KNOWN_ROUTES.some(route => lowerPath === route || lowerPath.startsWith(route + '/'))) {
    return false;
  }

  const path = pathname.slice(1).toUpperCase(); // Remove leading slash
  // Match passkey patterns: SOULLAB-NAME, MAIA-NAME, PIONEER-NAME, FOUNDING-NAME
  // Also match universal keys like CONSCIOUSNESS2025, DAIMON, ORACLE, etc.
  const passkeyPatterns = [
    /^SOULLAB-[A-Z0-9-]+$/,
    /^MAIA-[A-Z0-9-]+$/,
    /^PIONEER-[A-Z0-9-]+$/,
    /^FOUNDING-[A-Z0-9-]+$/,
    /^SOUL-PIONEER-\d+$/,
    /^CONSCIOUSNESS\d+$/,
  ];
  // NOTE: 'MAIA' removed from universalKeys - it conflicts with the /maia route
  // If MAIA is needed as a passkey, use MAIA-UNIVERSAL or similar
  const universalKeys = ['DAIMON', 'ORACLE', 'SOULLAB'];

  return passkeyPatterns.some(pattern => pattern.test(path)) || universalKeys.includes(path);
}

export async function middleware(request: NextRequest) {
  const host = request.headers.get('host') || '';
  const { pathname } = request.nextUrl;

  // Parse tenant from host
  const { subdomain, customDomain } = parseTenantFromHost(host);

  // If no subdomain or custom domain, this is the main Soullab app
  if (!subdomain && !customDomain) {
    // Check if the path looks like a passkey and redirect to test-elemental
    if (pathname !== '/' && isPasskeyPath(pathname)) {
      const passkey = pathname.slice(1).toUpperCase();
      const url = request.nextUrl.clone();
      url.pathname = '/test-elemental';
      url.searchParams.set('passkey', passkey);
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  // Don't rewrite API routes, Next.js internals, or static files
  if (!shouldHandleAsPortal(pathname)) {
    return NextResponse.next();
  }

  // Determine the practitioner slug
  // For subdomains, the slug is the subdomain
  // For custom domains, we need to look it up (done in the page component)
  const slug = subdomain || 'custom';
  const isCustomDomain = !!customDomain;

  // Build the rewrite URL
  const rewriteUrl = buildPortalRewriteUrl(
    slug,
    pathname,
    request.nextUrl.searchParams
  );

  // Create the rewrite response
  const url = request.nextUrl.clone();
  url.pathname = rewriteUrl.split('?')[0];

  const response = NextResponse.rewrite(url);

  // Add tenant headers for downstream components
  const tenantHeaders = buildTenantHeaders(
    isCustomDomain ? customDomain! : subdomain!,
    isCustomDomain,
    host
  );

  for (const [key, value] of Object.entries(tenantHeaders)) {
    response.headers.set(key, value);
  }

  return response;
}

// Configure which paths the middleware runs on
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
};
