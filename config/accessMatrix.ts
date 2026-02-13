/**
 * Access Matrix - Single Source of Truth
 *
 * Generated from: practitioner-os/docs/OFFERINGS_INVENTORY.md
 * All route access rules are defined here and enforced by middleware.
 *
 * DO NOT add per-route auth checks. Use this config instead.
 */

export type Tier = 'free' | 'personal' | 'pro';
export type Role = 'admin' | 'steward' | 'curator' | 'practitioner' | 'partner' | 'member';

export interface AccessRule {
  /** Match route by prefix (checked first, faster) */
  prefix?: string;
  /** Match route by regex (checked if no prefix match) */
  regex?: RegExp;
  /** Exact route match */
  exact?: string;

  /** If true, no auth required */
  public?: boolean;
  /** Minimum tier required (free < personal < pro) */
  minTier?: Tier;
  /** User must have at least one of these roles */
  rolesAnyOf?: Role[];

  /** Human-readable note for documentation */
  notes?: string;
}

// =============================================================================
// ACCESS RULES - Generated from Offerings Inventory
// =============================================================================

export const ACCESS_RULES: AccessRule[] = [
  // -------------------------------------------------------------------------
  // 1) PUBLIC BY DESIGN - No auth required
  // -------------------------------------------------------------------------

  // Landing & Marketing
  { exact: '/', public: true, notes: 'Studio landing page' },
  { exact: '/enter', public: true, notes: 'Smart routing entry point (MAIA/onboarding)' },
  { exact: '/faq', public: true, notes: 'Public FAQ' },
  { exact: '/downloads', public: true, notes: 'Downloads page' },
  { exact: '/patrons', public: true, notes: 'Patrons page' },
  { exact: '/portals', public: true, notes: 'Portals listing' },
  { exact: '/public-demo', public: true, notes: 'Public demo' },
  { exact: '/library', public: true, notes: 'Public library browse' },

  // Trust & Stewardship (public - builds trust during consideration)
  { exact: '/maia/stewardship', public: true, notes: 'Stewardship & sustainability' },
  { exact: '/maia/privacy', public: true, notes: 'Privacy & sovereignty' },
  { exact: '/dashboard/export', public: true, notes: 'Export preview (auth-gated action, public explanation)' },

  // Auth flows
  { exact: '/signin', public: true, notes: 'Sign in' },
  { exact: '/signup', public: true, notes: 'Sign up' },
  { exact: '/reset-password', public: true, notes: 'Password reset' },
  { exact: '/magic-link-success', public: true, notes: 'Magic link confirmation' },
  { exact: '/oauth-success', public: true, notes: 'OAuth completion' },

  // Onboarding (pre-auth)
  { exact: '/begin', public: true, notes: 'Begin journey entry' },
  { exact: '/intro', public: true, notes: 'Introduction' },
  { exact: '/welcome', public: true, notes: 'Welcome page' },
  { exact: '/welcome-back', public: true, notes: 'Welcome returning user' },
  { exact: '/welcome-flow', public: true, notes: 'Welcome flow' },
  { prefix: '/onboarding', public: true, notes: 'Onboarding flows' },

  // Beta access (invite-gated but public routes)
  { exact: '/beta-welcome', public: true, notes: 'Beta welcome' },
  { exact: '/beta-onboarding', public: true, notes: 'Beta onboarding' },
  { exact: '/beta-access', public: true, notes: 'Beta access' },

  // Practitioner public portals - CLIENT-FACING
  { prefix: '/portal/', public: true, notes: 'All practitioner portals are public by design' },

  // Partner portals
  { prefix: '/partner/', public: true, notes: 'Partner portals' },
  { exact: '/partner-welcome', public: true, notes: 'Partner welcome' },

  // Community browse (public, no contribution)
  { exact: '/maia/community', public: true, notes: 'Community hub browse' },
  { exact: '/maia/community/library', public: true, notes: 'Library browse' },
  { exact: '/maia/community/wisdom-sources', public: true, notes: 'Wisdom sources browse' },
  { exact: '/maia/community/faq', public: true, notes: 'Community FAQ' },
  { exact: '/maia/community/events', public: true, notes: 'Events browse' },
  { exact: '/maia/community/commons', public: true, notes: 'Commons home browse' },
  { prefix: '/maia/community/content/', public: true, notes: 'Content pages browse' },
  { prefix: '/maia/community/category/', public: true, notes: 'Category browse' },
  { prefix: '/maia/community/territory/', public: true, notes: 'Territory browse' },
  { exact: '/maia/community/commons/orientation', public: true, notes: 'Safety orientation (pre-contribute)' },

  // Oracle browse (limited at free tier)
  { exact: '/oracle', public: true, notes: 'Oracle home - limited queries for free' },
  { exact: '/oracle/library', public: true, notes: 'Oracle library browse' },

  // Patterns (symbolic lenses)
  { exact: '/patterns', public: true, notes: 'Patterns landing - symbolic systems & cycles' },
  { exact: '/astrology', public: true, notes: 'Cycle lens module (nested under Patterns)' },

  // Practitioner pricing (public for discovery)
  { regex: /^\/api\/practitioner\/[^/]+\/pricing$/, public: true, notes: 'Practitioner pricing is public' },

  // -------------------------------------------------------------------------
  // 2) FREE TIER - Auth required but no paid subscription
  // -------------------------------------------------------------------------

  // Account management
  { exact: '/account/settings', minTier: 'free', notes: 'Account settings' },
  { exact: '/account/security', minTier: 'free', notes: 'Account security' },
  { exact: '/settings', minTier: 'free', notes: 'General settings' },

  // -------------------------------------------------------------------------
  // 3) PERSONAL TIER ($12/mo) - Core MAIA membership
  // -------------------------------------------------------------------------

  // Dashboard - Base accessible to all authenticated users (no rule needed, falls through as auth-only)
  // /dashboard, /dashboard/settings, /dashboard/export - accessible if logged in

  // Dashboard - Personal tier experiences
  { prefix: '/dashboard/mentor', minTier: 'personal', notes: 'Mentor experiences' },
  { prefix: '/dashboard/insights', minTier: 'personal', notes: 'Pattern insights' },
  { prefix: '/dashboard/patterns', minTier: 'personal', notes: 'Pattern tracking' },

  // MAIA Interface (core)
  { exact: '/maia', minTier: 'free', notes: 'MAIA main interface - open to all authenticated users' },
  { exact: '/maia/compact', minTier: 'personal', notes: 'MAIA compact' },
  { exact: '/maia/mandala', minTier: 'personal', notes: 'Mandala interface' },
  { exact: '/maia/field-dashboard', minTier: 'personal', notes: 'Field dashboard' },
  { exact: '/maia/soul-consciousness', minTier: 'personal', notes: 'Soul consciousness' },
  { exact: '/maia/consciousness-computing', minTier: 'personal', notes: 'Consciousness computing' },
  { exact: '/maia/interfaces', minTier: 'personal', notes: 'Interface selection' },
  { exact: '/maia/membership', minTier: 'free', notes: 'Membership management (accessible to all authed users)' },
  { exact: '/maia/training', minTier: 'personal', notes: 'Training interface' },
  { exact: '/ask-maia', minTier: 'personal', notes: 'Ask MAIA' },

  // Community contribution (not browse)
  { exact: '/maia/community/contribute', minTier: 'personal', notes: 'Contribute to commons' },
  { exact: '/maia/community/commons/my-offerings', minTier: 'personal', notes: 'My offerings' },
  { exact: '/maia/community/share', minTier: 'personal', notes: 'Share content' },
  { exact: '/maia/community/new-post', minTier: 'personal', notes: 'Create post' },
  { exact: '/maia/community/chat', minTier: 'personal', notes: 'Community chat' },
  { exact: '/maia/community/reality-check', minTier: 'personal', notes: 'Reality check' },

  // Circles Commons (Phase 1)
  { prefix: '/commons/circles', minTier: 'free', notes: 'Circles commons - all authenticated members' },
  { exact: '/commons/join', minTier: 'free', notes: 'Join circle via invite' },

  // Elemental Alchemy
  { prefix: '/maia/community/elemental-alchemy', minTier: 'personal', notes: 'Elemental alchemy system' },

  // Oracle tools (beyond browse)
  { exact: '/oracle/iching', minTier: 'personal', notes: 'I-Ching readings' },
  { exact: '/oracle/tarot', minTier: 'personal', notes: 'Tarot readings' },
  { exact: '/oracle/runes', minTier: 'personal', notes: 'Rune readings' },
  { exact: '/oracle/yijing', minTier: 'personal', notes: 'Yi Jing readings' },
  { exact: '/oracle/consciousness', minTier: 'personal', notes: 'Consciousness oracle' },
  { exact: '/oracle/interactive', minTier: 'personal', notes: 'Interactive oracle' },

  // Astrology tools (beyond browse)
  { exact: '/chart', minTier: 'personal', notes: 'Chart generator' },
  { exact: '/astrology/chinese', minTier: 'personal', notes: 'Chinese astrology' },
  { exact: '/astrology/mayan', minTier: 'personal', notes: 'Mayan astrology' },
  { exact: '/astrology/vedic', minTier: 'personal', notes: 'Vedic astrology' },
  { prefix: '/astrology/aspects/', minTier: 'personal', notes: 'Aspect details' },
  { prefix: '/astrology/pathways/', minTier: 'personal', notes: 'Pathways' },
  { exact: '/astrology/synastry', minTier: 'personal', notes: 'Synastry' },
  { exact: '/astrology/synastry/saved', minTier: 'personal', notes: 'Saved synastry' },
  { prefix: '/astrology/synastry/', minTier: 'personal', notes: 'Synastry analysis' },

  // Consciousness features
  { exact: '/consciousness/dashboard', minTier: 'personal', notes: 'Consciousness dashboard' },
  { exact: '/consciousness/meditation', minTier: 'personal', notes: 'Meditation guide' },
  { exact: '/consciousness/omnidimensional-test', minTier: 'personal', notes: 'Omnidimensional test' },
  { exact: '/consciousness/portals', minTier: 'personal', notes: 'Consciousness portals' },
  { exact: '/consciousness-computing', minTier: 'personal', notes: 'Consciousness computing' },
  { exact: '/consciousness-computing/feedback', minTier: 'personal', notes: 'Computing feedback' },
  { exact: '/consciousness-computing/pwa', minTier: 'personal', notes: 'Computing PWA' },
  { exact: '/consciousness-insights', minTier: 'personal', notes: 'Consciousness insights' },

  // Book companion
  { exact: '/book/companion', minTier: 'personal', notes: 'Book companion' },
  { exact: '/book/ask', minTier: 'personal', notes: 'Book companion ask' },
  { exact: '/book-companion/ain', minTier: 'personal', notes: 'Book companion AIN' },

  // Journey & evolution
  { exact: '/journey', minTier: 'personal', notes: 'Journey view' },
  { exact: '/evolution', minTier: 'personal', notes: 'Evolution tracking' },
  { exact: '/soul-gateway', minTier: 'personal', notes: 'Soul gateway' },
  { exact: '/capture', minTier: 'personal', notes: 'Capture interface' },

  // AIN features
  { exact: '/ain-demo', minTier: 'personal', notes: 'AIN demo' },
  { exact: '/ain-evolution', minTier: 'personal', notes: 'AIN evolution' },

  // -------------------------------------------------------------------------
  // 4) PRO TIER ($35/mo) - Practitioners + advanced features
  // -------------------------------------------------------------------------

  // Dashboard Pro features
  { exact: '/dashboard/diamond', minTier: 'pro', notes: 'Diamond tier features' },
  { exact: '/dashboard/beta', minTier: 'pro', notes: 'Beta analytics' },
  { exact: '/dashboard/beta-analytics', minTier: 'pro', notes: 'Beta analytics detailed' },
  { exact: '/dashboard/ops', minTier: 'pro', notes: 'Operations dashboard' },

  // Dashboard catch-all - requires auth but no tier gate (settings, export, base dashboard)
  // Must come AFTER specific dashboard/* rules since matchRule returns first prefix match
  { prefix: '/dashboard', minTier: 'free', notes: 'Dashboard base requires auth' },

  // MAIA Pro features
  { exact: '/maia/realtime-monitor', minTier: 'pro', notes: 'Real-time monitoring' },
  { exact: '/maia/labtools', minTier: 'pro', notes: 'MAIA lab tools' },
  { exact: '/maia/invites', minTier: 'pro', notes: 'Invite management' },

  // Commons curation (role-gated)
  { exact: '/maia/community/commons/review', minTier: 'pro', rolesAnyOf: ['curator', 'steward', 'admin'], notes: 'Review queue' },

  // ─────────────────────────────────────────────────────────────────
  // Lab Tools - Tiered Access
  // Personal tier: core self-work, identity, daily loop
  // Pro tier: analytics, compute, audio, power tools
  // Order matters: specific rules BEFORE the broad prefix fallback
  // ─────────────────────────────────────────────────────────────────

  // Lab Tools - Personal tier (core daily use)
  { exact: '/labtools', minTier: 'personal', notes: 'Lab tools index' },
  { exact: '/labtools/profile', minTier: 'personal', notes: 'Profile settings' },
  { exact: '/labtools/settings', minTier: 'personal', notes: 'App settings' },
  { exact: '/labtools/language', minTier: 'personal', notes: 'Language preferences' },
  { exact: '/labtools/journal', minTier: 'personal', notes: 'Daily journaling' },
  { exact: '/labtools/reflections', minTier: 'personal', notes: 'Reflection feed' },
  { prefix: '/labtools/reflections/', minTier: 'personal', notes: 'Individual reflections' },
  { exact: '/labtools/favorites', minTier: 'personal', notes: 'Saved items' },
  { exact: '/labtools/downloads', minTier: 'personal', notes: 'Downloads (content-gated separately)' },
  { exact: '/labtools/books', minTier: 'personal', notes: 'Book access (content-gated separately)' },
  { exact: '/labtools/sovereignty', minTier: 'personal', notes: 'Data sovereignty - rights not perks' },
  { exact: '/labtools/gifts', minTier: 'personal', rolesAnyOf: ['admin'], notes: 'Admin gift creator' },
  { exact: '/labtools/beads', minTier: 'personal', notes: 'Member bead sharing' },
  { exact: '/labtools/beta-testing', minTier: 'personal', notes: 'Pioneer circle' },
  { exact: '/labtools/voice', minTier: 'personal', notes: 'Voice settings' },
  { exact: '/labtools/field-analytics', minTier: 'personal', notes: 'Field analytics' },

  // Lab Tools - Admin only (before Pro fallback)
  { prefix: '/labtools/admin', minTier: 'personal', rolesAnyOf: ['admin'], notes: 'Admin tools - role-gated' },

  // Lab Tools - Pro tier (everything else)
  { prefix: '/labtools', minTier: 'pro', notes: 'All other lab tools require Pro' },

  // ─────────────────────────────────────────────────────────────────
  // Legacy Redirects
  // These routes exist only for backwards compatibility with old links.
  // Each redirects to a canonical location; auth is enforced here to
  // avoid double-redirect (legacy → signin → canonical).
  // ─────────────────────────────────────────────────────────────────
  // public: only redirects to public page, avoids auth wall on old links
  { exact: '/birth-chart', public: true, minTier: 'free', notes: '→ /patterns' },
  // personal: these now match Personal tier labtools
  { exact: '/journal', minTier: 'personal', notes: '→ /labtools/journal' },
  { exact: '/language', minTier: 'personal', notes: '→ /labtools/language' },
  // personal: voice settings
  { exact: '/voice', minTier: 'personal', notes: '→ /labtools/voice' },

  // Consciousness Pro features
  { exact: '/consciousness/portals/admin', minTier: 'pro', rolesAnyOf: ['admin', 'steward'], notes: 'Portal admin' },
  { exact: '/consciousness/portals/analytics', minTier: 'pro', rolesAnyOf: ['admin', 'steward'], notes: 'Portal analytics' },
  { exact: '/consciousness-lab', minTier: 'pro', notes: 'Consciousness lab' },
  { exact: '/consciousness-monitor', minTier: 'pro', notes: 'Consciousness monitoring' },
  { exact: '/pfi-monitor', minTier: 'pro', notes: 'PFI monitoring' },

  // Stellium (Practice Management)
  // TODO: Restore after testing: minTier: 'pro', rolesAnyOf: ['practitioner']
  { prefix: '/stellium', minTier: 'free', notes: 'Stellium - temporarily open for testing' },

  // Caseload (Clinical Notes)
  { prefix: '/caseload', minTier: 'pro', rolesAnyOf: ['practitioner'], notes: 'Caseload requires Pro + practitioner role' },

  // Practitioner portal admin (owner-gated at API level)
  // Note: Page-level code handles auth; API routes enforce practitioner role
  { exact: '/practitioner/dashboard', minTier: 'free', notes: 'Practitioner dashboard - page handles auth' },
  { prefix: '/practitioner/', minTier: 'free', notes: 'Practitioner routes - API enforces access' },
  { prefix: '/practitioners/', minTier: 'pro', notes: 'Practitioner onboarding/signup' },

  // Partner program
  { prefix: '/partners/', minTier: 'pro', rolesAnyOf: ['partner'], notes: 'Partner onboarding' },

  // Supervision
  { exact: '/supervision', minTier: 'pro', rolesAnyOf: ['practitioner'], notes: 'Supervision' },

  // -------------------------------------------------------------------------
  // 5) ADMIN / STEWARD - Role-gated (not tier)
  // -------------------------------------------------------------------------

  { prefix: '/admin', minTier: 'pro', rolesAnyOf: ['admin'], notes: 'Admin panel - admin only' },
  { prefix: '/steward', minTier: 'pro', rolesAnyOf: ['steward', 'admin'], notes: 'Steward tools' },

  // -------------------------------------------------------------------------
  // 6) API ROUTES
  // -------------------------------------------------------------------------

  // Public API
  { exact: '/api/ask', public: true, notes: 'Landing page Ask Kelly/MAIA' },
  { exact: '/api/members/check', public: true, notes: 'Check member exists' },
  { exact: '/api/members/register', public: true, notes: 'Register member' },
  { exact: '/api/members/signin', public: true, notes: 'Sign in' },
  { exact: '/api/auth/refresh-and-redirect', public: true, notes: 'Refresh session cookies and redirect' },
  { exact: '/api/practitioners/check', public: true, notes: 'Check practitioner status' },
  { exact: '/api/commons/contributions', public: true, notes: 'GET public contributions' },
  { exact: '/api/commons/contributions/orientation', public: true, notes: 'Orientation content' },

  // Member API
  { regex: /^\/api\/commons\/contributions\/[^/]+$/, minTier: 'personal', notes: 'Contribution detail' },
  { exact: '/api/commons/contributions/my-offerings', minTier: 'personal', notes: 'User offerings' },
  { exact: '/api/stripe/membership/checkout', minTier: 'free', notes: 'Create checkout' },

  // Circles API (Phase 1)
  { prefix: '/api/circles', minTier: 'free', notes: 'Circles API - all authenticated members' },

  // Pro API
  { exact: '/api/practitioners/create', minTier: 'pro', notes: 'Create practitioner' },
  { prefix: '/api/practitioner/practices', minTier: 'pro', rolesAnyOf: ['practitioner', 'admin'], notes: 'Practice management' },
  { prefix: '/api/practitioner/sessions', minTier: 'pro', rolesAnyOf: ['practitioner', 'admin'], notes: 'Session management' },
  { prefix: '/api/practitioner/containers', minTier: 'pro', rolesAnyOf: ['practitioner', 'admin'], notes: 'Container management' },
  { prefix: '/api/stellium', minTier: 'pro', rolesAnyOf: ['practitioner', 'admin'], notes: 'Stellium API' },
  { prefix: '/api/notifications', minTier: 'pro', rolesAnyOf: ['practitioner', 'admin'], notes: 'Notification APIs (SMS/Email)' },
  { exact: '/api/commons/contributions/review-queue', minTier: 'pro', rolesAnyOf: ['curator', 'steward', 'admin'], notes: 'Review queue' },
  { regex: /^\/api\/commons\/contributions\/[^/]+\/review$/, minTier: 'pro', rolesAnyOf: ['curator', 'steward', 'admin'], notes: 'Review action' },

  // Sovereign API - all open to authenticated users (tier check temporarily disabled)
  { prefix: '/api/sovereign', minTier: 'free', notes: 'Sovereign features' },

  // Stripe webhooks (system routes, validated by signature)
  { prefix: '/api/stripe/webhook', public: true, notes: 'Stripe webhooks - validated by signature' },
];

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Find the most specific matching rule for a pathname
 */
export function matchRule(pathname: string): AccessRule | null {
  // First pass: exact matches (most specific)
  for (const rule of ACCESS_RULES) {
    if (rule.exact && pathname === rule.exact) return rule;
  }

  // Second pass: prefix matches (ordered by specificity in array)
  for (const rule of ACCESS_RULES) {
    if (rule.prefix && pathname.startsWith(rule.prefix)) return rule;
  }

  // Third pass: regex matches
  for (const rule of ACCESS_RULES) {
    if (rule.regex && rule.regex.test(pathname)) return rule;
  }

  return null;
}

/**
 * Tier hierarchy for comparison
 */
export const TIER_RANK: Record<Tier, number> = {
  free: 0,
  personal: 1,
  pro: 2,
};

/**
 * Check if user's tier meets minimum requirement
 */
export function tierSatisfies(userTier: Tier, minTier?: Tier): boolean {
  if (!minTier) return true;
  return TIER_RANK[userTier] >= TIER_RANK[minTier];
}

/**
 * Check if user has any of the required roles
 */
export function hasRequiredRole(userRoles: Role[], requiredRoles?: Role[]): boolean {
  if (!requiredRoles || requiredRoles.length === 0) return true;
  return userRoles.some((role) => requiredRoles.includes(role));
}

/**
 * Access control mode
 *
 * MODE_A (permissive): Unmapped routes pass through (safe during migration)
 * MODE_B (strict): Unmapped routes are denied (production-ready)
 *
 * Set via environment variable: ACCESS_CONTROL_MODE=strict
 */
export type AccessMode = 'permissive' | 'strict';

export function getAccessMode(): AccessMode {
  return process.env.ACCESS_CONTROL_MODE === 'strict' ? 'strict' : 'permissive';
}

/**
 * Track unmapped routes for discovery (dev/staging only)
 */
const unmappedRoutes = new Set<string>();

export function getUnmappedRoutes(): string[] {
  return Array.from(unmappedRoutes);
}

export function clearUnmappedRoutes(): void {
  unmappedRoutes.clear();
}

/**
 * Full access check - returns detailed result
 */
export function checkAccess(
  pathname: string,
  userTier: Tier,
  userRoles: Role[],
  isAuthenticated: boolean
): { allowed: boolean; reason?: string; rule?: AccessRule; unmapped?: boolean } {
  const rule = matchRule(pathname);
  const mode = getAccessMode();

  // No rule found - behavior depends on mode
  if (!rule) {
    // Track unmapped routes for discovery
    if (process.env.NODE_ENV !== 'production') {
      unmappedRoutes.add(pathname);
      console.warn(`[AccessMatrix] Unmapped route: ${pathname}`);
    }

    if (mode === 'strict') {
      // MODE B: Deny unmapped routes
      return { allowed: false, reason: 'no-rule-match', unmapped: true };
    } else {
      // MODE A: Allow but flag as unmapped
      return { allowed: true, reason: 'no-rule-match', unmapped: true };
    }
  }

  // Public routes always allowed
  if (rule.public) {
    return { allowed: true, rule };
  }

  // Non-public requires auth
  if (!isAuthenticated) {
    return { allowed: false, reason: 'unauthenticated', rule };
  }

  // Check tier
  if (!tierSatisfies(userTier, rule.minTier)) {
    return { allowed: false, reason: 'insufficient-tier', rule };
  }

  // Check roles
  if (!hasRequiredRole(userRoles, rule.rolesAnyOf)) {
    return { allowed: false, reason: 'missing-role', rule };
  }

  return { allowed: true, rule };
}
