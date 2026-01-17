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

export async function middleware(request: NextRequest) {
  const host = request.headers.get('host') || '';
  const { pathname } = request.nextUrl;

  // Parse tenant from host
  const { subdomain, customDomain } = parseTenantFromHost(host);

  // If no subdomain or custom domain, this is the main Soullab app
  if (!subdomain && !customDomain) {
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
