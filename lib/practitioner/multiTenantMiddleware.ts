/**
 * Multi-Tenant Middleware Utilities
 *
 * Logic for resolving practitioner portals from domains and subdomains.
 * Used by Next.js middleware to route requests to the correct tenant.
 */

export interface TenantInfo {
  practitionerId: string;
  slug: string;
  domain: string;
  isCustomDomain: boolean;
  isSubdomain: boolean;
}

// Domains that should not be treated as practitioner subdomains
const RESERVED_SUBDOMAINS = new Set([
  'www',
  'app',
  'api',
  'admin',
  'dashboard',
  'portal',
  'auth',
  'staging',
  'dev',
  'test',
  'beta',
  'maia',
]);

// The main Soullab domains
const SOULLAB_DOMAINS = [
  'soullab.life',
  'soullab.dev',
  'localhost',
];

/**
 * Parse the host header to extract tenant information.
 * Returns null if this is a main Soullab domain (not a practitioner portal).
 */
export function parseTenantFromHost(host: string): { subdomain: string | null; customDomain: string | null } {
  // Remove port if present
  const domain = host.split(':')[0].toLowerCase();

  // Check if this is a Soullab subdomain
  for (const soullabDomain of SOULLAB_DOMAINS) {
    if (domain === soullabDomain) {
      // Main domain, not a practitioner portal
      return { subdomain: null, customDomain: null };
    }

    if (domain.endsWith(`.${soullabDomain}`)) {
      // Extract subdomain
      const subdomain = domain.replace(`.${soullabDomain}`, '');

      // Check if reserved
      if (RESERVED_SUBDOMAINS.has(subdomain)) {
        return { subdomain: null, customDomain: null };
      }

      return { subdomain, customDomain: null };
    }
  }

  // Not a Soullab domain - treat as custom domain
  return { subdomain: null, customDomain: domain };
}

/**
 * Build the URL to rewrite to for a practitioner portal.
 * The portal pages are at /portal/[slug]/...
 */
export function buildPortalRewriteUrl(
  slug: string,
  pathname: string,
  searchParams: URLSearchParams
): string {
  // Remove leading slash from pathname
  const cleanPath = pathname.startsWith('/') ? pathname.slice(1) : pathname;

  // Build the portal URL
  let url = `/portal/${slug}`;
  if (cleanPath) {
    url += `/${cleanPath}`;
  }

  // Add search params
  const search = searchParams.toString();
  if (search) {
    url += `?${search}`;
  }

  return url;
}

/**
 * Routes that should be handled by the practitioner portal.
 * Other routes (like /api, /_next, etc.) pass through normally.
 */
export function shouldHandleAsPortal(pathname: string): boolean {
  // API routes - don't rewrite
  if (pathname.startsWith('/api/')) {
    return false;
  }

  // Next.js internals - don't rewrite
  if (pathname.startsWith('/_next/')) {
    return false;
  }

  // Static files - don't rewrite
  if (pathname.startsWith('/static/')) {
    return false;
  }

  // Favicon and common static files
  if (pathname === '/favicon.ico' || pathname.endsWith('.png') || pathname.endsWith('.jpg') || pathname.endsWith('.svg')) {
    return false;
  }

  // Everything else should be handled by the portal
  return true;
}

/**
 * Build headers to inject into the request for downstream components.
 * These headers let components know which practitioner context they're in.
 */
export function buildTenantHeaders(
  slug: string,
  isCustomDomain: boolean,
  originalHost: string
): Record<string, string> {
  return {
    'x-practitioner-slug': slug,
    'x-practitioner-domain': originalHost,
    'x-practitioner-custom-domain': isCustomDomain ? 'true' : 'false',
  };
}

/**
 * Check if a domain is allowed to access the portal.
 * Used to prevent unauthorized domains from accessing portals.
 */
export function isDomainAllowed(
  domain: string,
  allowedSubdomain: string,
  allowedCustomDomain?: string
): boolean {
  const parsed = parseTenantFromHost(domain);

  if (parsed.subdomain) {
    return parsed.subdomain === allowedSubdomain;
  }

  if (parsed.customDomain && allowedCustomDomain) {
    return parsed.customDomain === allowedCustomDomain;
  }

  return false;
}

/**
 * Generate the DNS records needed for a custom domain.
 */
export function generateDnsRecords(customDomain: string): {
  type: 'CNAME' | 'A' | 'TXT';
  name: string;
  value: string;
}[] {
  return [
    {
      type: 'CNAME',
      name: customDomain.startsWith('www.') ? customDomain : `www.${customDomain}`,
      value: 'portal.soullab.life',
    },
    {
      type: 'CNAME',
      name: customDomain.replace(/^www\./, ''),
      value: 'portal.soullab.life',
    },
    {
      type: 'TXT',
      name: `_soullab-verify.${customDomain.replace(/^www\./, '')}`,
      value: `soullab-domain-verify=${Date.now()}`,
    },
  ];
}
