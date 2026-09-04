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
  // Public marketing landings (2026-07-10) — the outward faces of gated
  // surfaces, so a share card or deck CTA never points at a login wall.
  // Copy governed by docs/canon/MARKETING_CLAIM_DISCIPLINE.md; cards by
  // docs/ops/SHARE_CARDS.md (PUBLIC-SECTION class). The working surfaces
  // stay gated: /maia/vision-studio, /studio, /book-studio, /now-what/room.
  { exact: '/vision-studio', public: true, notes: 'Vision Studio public landing — member room stays gated at /maia/vision-studio' },
  { exact: '/soullab-studio', public: true, notes: 'Soullab Studio public landing — practitioner app stays gated at /studio' },
  { exact: '/press', public: true, notes: 'Soullab Press public landing — editorial workspace stays founder-gated at /book-studio' },
  // ── Author Studio — ONE governed path, two routes ─────────────────────
  //
  // R1 AUDIENCE RULING (2026-07-30): Author Studio is MEMBER-FACING. It is a
  // member environment for working with one's book, not a founder or
  // practitioner instrument. No Steward/founder tier gate: that would make
  // commercial tier or internal role stand in for the actual audience
  // distinction, without evidence that authorship belongs only to those groups.
  // See docs/canon/AUTHOR_STUDIO_THREE_LAYER_RULING.md §3.
  //
  // /press/studio (Layer 2, the environment) and /press/manuscript (Layer 3,
  // the Manuscript Room) are ONE governed Author Studio path. A member
  // permitted into the Studio must be able to move from its home into the
  // Room, so the two carry the SAME policy — deliberately, not incidentally.
  //
  // `minTier: 'free'` is the MECHANISM that states member-facing: auth is
  // required before the door, and every authenticated member qualifies
  // regardless of tier (same shape as /now-what/room). It is deliberately NOT
  // `public: true` — that short-circuits middleware before any auth check, so
  // the route would be public no matter what the surrounding prose claimed.
  //
  // Both entries carried `public: true` until 2026-07-31. A two-identity
  // runtime check found the contradiction before activation: an unauthenticated
  // visitor received 200 on BOTH routes, while control routes (/studio, /maia)
  // correctly redirected to /signin. No data was exposed — the pages self-gate
  // and render "sign in to enter" once loaded — but ROUTE authorization was
  // absent, and route authorization is the thing that answers who may ENTER.
  // API authorization answers which data operations are allowed; it does not
  // substitute. A page that hides its own contents is not an access boundary.
  //
  // Both routes are mapped explicitly so neither relies on the permissive
  // unmapped default (#717) — which is what had left middleware permitting
  // entry while this matrix stayed silent, i.e. two competing declarations of
  // who may enter.
  { exact: '/press/studio', minTier: 'free', notes: 'Author Studio Home (Layer 2) — member-facing: authenticated members of any tier; unauthenticated visitors are redirected to sign-in before the door' },
  { exact: '/press/manuscript', minTier: 'free', notes: 'Manuscript Room (Layer 3) — same member-facing policy as /press/studio; one governed Author Studio path' },
  // RULED 2026-08-05 (Kelly): the Writer's Studio home moved out from under
  // /press to its own address; /press/studio now only redirects there. The
  // AUDIENCE is unchanged — this entry carries the exact policy already ruled
  // for /press/studio (member-facing, any tier, auth before the door). Found
  // in production minutes after the route deployed unmapped: the permissive
  // unmapped default served the landing shell at 200 instead of the Studio —
  // the precise failure the explicit-mapping doctrine above exists to prevent.
  { exact: '/writers-studio', minTier: 'free', notes: "Writer's Studio Home (Layer 2) — same member-facing policy as /press/studio, whose address it inherited; unauthenticated visitors are redirected to sign-in before the door" },
  { exact: '/now-what/welcome', public: true, notes: 'What Now? public landing — additive; /now-what room-as-entry redirect unchanged' },
  // Now What? (Larry Closs program) — room as entry (2026-07-08). /now-what
  // redirects at the edge (next.config redirects(), which run BEFORE middleware)
  // straight into the live room; the pitch slideshow was demoted to
  // /now-what/pitch (public/now-what/index.html via rewrite) for prospects.
  // The room requires auth BEFORE the door, so member identity + memory exist
  // for the first turn and there is no 401-after-Send: an unauthenticated hit
  // on /now-what/room redirects to /signin?next=/now-what/room (middleware
  // 'unauthenticated' handling), then returns into the room signed in.
  { exact: '/now-what', public: true, notes: 'Now What? entry — edge-redirects to /now-what/room before middleware; rule kept public so no double-gate if redirect ordering ever changes' },
  { exact: '/now-what/pitch', public: true, notes: 'Now What? pitch deck (Larry Closs) — public static slideshow for prospects, out of the practice entry path' },
  { prefix: '/now-what/room', minTier: 'free', notes: 'Now What? live room — auth required before the door; unauthenticated now-what traffic redirects to /now-what/arrive (the environment’s own door, Kelly ruling 2026-07-16), not generic /signin' },
  { exact: '/now-what/arrive', public: true, notes: 'Now What? independent arrival — signup/signin in the environment’s register; the invitation is the gate (/begin stays AIN’s universal door)' },
  { exact: '/nowwhat-demo', public: true, notes: 'Now What? public demo — the three surfaces (arrival · conversation · Keep) with SCRIPTED replies and invented content. Reaches no member data, no MAIA, no interview API. Named without the /now-what prefix on purpose: middleware redirects that prefix to /now-what/arrive for unauthenticated visitors, which would defeat a public link.' },
  { exact: '/now-what/conversation', minTier: 'free', notes: 'Now What? simple conversation (Lane B) — the whole visible product for a field whose members want to talk, not navigate. Auth is the door; it renders only the member’s own turns. Reached via an invitation carrying fieldContext and `next`. NOTE: that fieldContext is transitional routing context, NOT practitioner-membership authority — durable membership belongs to the later practice_field_members seam. Declared explicitly rather than inheriting the Mode A unmapped-route default.' },
  { exact: '/now-what/home', minTier: 'free', notes: 'Now What? Client Home — the member’s own place between conversations. Auth required: it renders the member’s carried threads and their per-item sharing state, so it must never be reachable unauthenticated. Declared explicitly rather than inheriting the Mode A unmapped-route default.' },
  { exact: '/now-what/practice', minTier: 'free', notes: 'Now What? Practice Workspace — the field holder’s own room. Auth is the door; the field-holder check is enforced separately by GET /api/practitioner/programs (403 “belongs to the field holder”), so a signed-in non-holder reaches the shell and no practice data. Declared explicitly rather than relying on the Mode A unmapped-route default, which would leave a practitioner surface open by omission.' },
  { exact: '/api/now-what/register', public: true, notes: 'Now What? independent signup API — creates member + session; email-uniqueness prevents account forking' },
  { exact: '/library', public: true, notes: 'Public library browse' },
  { exact: '/book-studio', public: true, notes: 'Book Studio — editorial workspace index' },
  { exact: '/book-studio/read', public: true, notes: 'Book Studio — manuscript reader' },
  { exact: '/book-studio/passages', public: true, notes: 'Book Studio — passage blocks index' },
  { exact: '/book-studio/illustrations', public: true, notes: 'Book Studio — illustration list' },
  { exact: '/book-studio/design-system', public: true, notes: 'Book Studio — design system v1' },
  { exact: '/book-studio-canvas.html', public: true, notes: 'Book Studio — canvas standalone HTML asset (founder gate enforced on /book-studio/canvas wrapper)' },
  // Founder-gated below — auth required at minTier:free, founder check happens in route layout via requireFounder()
  { exact: '/book-studio/render', minTier: 'free', notes: 'Book Studio — render trigger (founder-gated in layout)' },
  { exact: '/book-studio/canvas', minTier: 'free', notes: 'Book Studio — visual canvas, founder-gated in layout' },
  { prefix: '/book-studio/drafts/', minTier: 'free', notes: 'Book Studio — imported drafts (founder-gated in layout)' },
  { prefix: '/api/book-studio/', minTier: 'free', notes: 'Book Studio — drafts API (auth required)' },

  // Internal diagnostics — founder-gated in layout via requireFounder().
  // Mapped explicitly so the route never depends on the permissive
  // unmapped-route default (ACCESS_CONTROL_MODE, #717). It was publicly served
  // in production until 2026-07-24 for exactly that reason.
  { exact: '/voice-controller-test', minTier: 'free', notes: 'VoiceController Phase 1 smoke-test harness — founder-gated in layout; mapped so it never relies on the permissive unmapped default (#717)' },

  // Trust & Stewardship (public - builds trust during consideration)
  { exact: '/maia/stewardship', public: true, notes: 'Stewardship & sustainability' },
  { exact: '/maia/membership', public: true, notes: 'Membership tiers & pricing — public browse; checkout action auth-gates client-side' },
  { exact: '/membership', public: true, notes: 'Alias → /maia/membership (client redirect)' },
  { exact: '/maia/privacy', public: true, notes: 'Privacy & sovereignty' },
  { exact: '/dashboard/export', public: true, notes: 'Export preview (auth-gated action, public explanation)' },

  // Auth flows
  { exact: '/signin', public: true, notes: 'Sign in' },
  { exact: '/signup', public: true, notes: 'Sign up' },
  { exact: '/reset-password', public: true, notes: 'Password reset' },
  { exact: '/magic-link', public: true, notes: 'Magic link landing page — button-click redeems token (scanner-safe)' },
  { exact: '/magic-link-success', public: true, notes: 'Magic link confirmation' },
  // magic-link-error removed — expired/invalid links redirect to /signin?link=reason
  { exact: '/oauth-success', public: true, notes: 'OAuth completion' },

  // Onboarding (pre-auth)
  { exact: '/begin', public: true, notes: 'Legacy route — redirects to /signin (deprecated 2026-05-16)' },
  { exact: '/resume', public: true, notes: 'Universal onboarding recovery — computes next step from server state' },
  { exact: '/continue', public: true, notes: 'Alias for /resume' },
  { exact: '/test-elemental', public: true, notes: 'Passkey / invite code entry path' },
  { exact: '/intro-maia', public: true, notes: 'MAIA intro step' },
  { exact: '/intro-daimon', public: true, notes: 'Daimon intro step' },
  { exact: '/intro', public: true, notes: 'Introduction' },
  { exact: '/welcome', public: true, notes: 'Welcome page' },
  { exact: '/welcome-back', public: true, notes: 'Welcome returning user' },
  { exact: '/welcome-flow', public: true, notes: 'Welcome flow' },
  { prefix: '/onboarding', public: true, notes: 'Onboarding flows' },

  // Field (iOS native app shell) — entry is always public; content routes are auth-gated
  // Capacitor bypass in middleware handles unauthenticated WKWebView page loads
  { exact: '/field/enter', public: true, notes: 'Field canonical iOS entry router' },
  { prefix: '/field', minTier: 'free', notes: 'Field mobile shell — all authenticated users' },

  // Guided Experiences — personalized orientation encounters (no auth, no friction).
  // Delivery is by private link (e.g. /the-beginning/mark); noindex is set in the route.
  { prefix: '/the-beginning', public: true, notes: 'The Beginning — guided orientation experience (private link, zero-friction)' },

  // Beta access (invite-gated but public routes)
  { exact: '/beta-welcome', public: true, notes: 'Beta welcome' },
  { exact: '/beta-onboarding', public: true, notes: 'Beta onboarding' },
  { exact: '/beta-access', public: true, notes: 'Beta access' },

  // Beta Tester learning field — auth required (NOT public). Invite-only cohort
  // (members.tester) is enforced server-side in requireCohort + the field layout,
  // since cohort is not expressible in the tier/role model here.
  { prefix: '/beta-testers', minTier: 'free', notes: 'Beta tester learning field — cohort-gated (members.tester) in layout + API' },

  // Master Fields - public by design (invitation pages, field homes)
  { prefix: '/fields/', public: true, notes: 'Master field sites are public — no auth required' },

  // Practitioner public portals - CLIENT-FACING
  { prefix: '/portal/', public: true, notes: 'All practitioner portals are public by design' },

  // Partner portals
  { prefix: '/partner/', public: true, notes: 'Partner portals' },
  { exact: '/partner-welcome', public: true, notes: 'Partner welcome' },

  // Community browse (public, no contribution)
  { exact: '/maia/community', public: true, notes: 'Community hub browse' },
  { exact: '/maia/community/library', public: true, notes: 'Library browse' },
  { exact: '/maia/community/wisdom-sources', public: true, notes: 'Wisdom sources browse' },
  { prefix: '/wisdom-keepers', public: true, notes: 'Wisdom keepers pages' },
  { exact: '/api/wisdom-keepers/submit', public: true, notes: 'Wisdom source submission (honeypot-protected)' },
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
  // 3) SANCTUARY TIER — Depth features open to all authenticated members
  //
  // Sanctuary Economy doctrine (docs/canon/MAIA_SANCTUARY_ECONOMY.md):
  // Depth is universal. Scale is elastic. Contribution expands capacity.
  // Route access = depth (open). Rate limits = capacity (enforced elsewhere).
  // -------------------------------------------------------------------------

  // Dashboard — depth features open, capacity-governed by LimitsEnforcer
  { prefix: '/dashboard/mentor', minTier: 'free', notes: 'Mentor experiences — depth, open to all' },
  { prefix: '/dashboard/insights', minTier: 'free', notes: 'Pattern insights — depth, open to all' },
  { prefix: '/dashboard/patterns', minTier: 'free', notes: 'Pattern tracking — depth, open to all' },

  // Field routes — iOS/Capacitor voice-first entry
  { exact: '/field/enter', minTier: 'free', notes: 'Field entry router — smart session routing' },
  { exact: '/field/talk', minTier: 'free', notes: 'Field voice session — voice-first MAIA on iOS' },
  { prefix: '/field', minTier: 'free', notes: 'Field routes — all authenticated members' },

  // MAIA Interface (core) — all depth, open to all
  { exact: '/maia', minTier: 'free', notes: 'MAIA main interface' },
  { exact: '/maia/reflection', minTier: 'free', notes: 'Developmental reflection — member-only (beta v0)' },
  { exact: '/maia/compact', minTier: 'free', notes: 'MAIA compact' },
  { exact: '/maia/mandala', minTier: 'free', notes: 'Mandala interface' },
  { exact: '/maia/field-dashboard', minTier: 'free', notes: 'Field dashboard' },
  { exact: '/maia/soul-consciousness', minTier: 'free', notes: 'Soul consciousness' },
  { exact: '/maia/consciousness-computing', minTier: 'free', notes: 'Consciousness computing' },
  { exact: '/maia/interfaces', minTier: 'free', notes: 'Interface selection' },
  { exact: '/maia/membership', minTier: 'free', notes: 'Membership management' },
  { exact: '/maia/training', minTier: 'free', notes: 'Training interface' },
  { exact: '/maia/ideas', minTier: 'free', notes: 'Ideas world — early-stage emergence' },
  { prefix: '/relationships', minTier: 'free', notes: 'Relational Field — outer/inner/transpersonal, CRUD. Moved out of /dashboard/* 2026-04-08 so it no longer inherits the Jade Neural Command shell.' },
  { exact: '/ask-maia', minTier: 'free', notes: 'Ask MAIA — depth, capacity-governed' },

  // Community — contribution is participation, not a perk
  { exact: '/maia/community/contribute', minTier: 'free', notes: 'Contribute to commons — participation is open' },
  { exact: '/maia/community/commons/my-offerings', minTier: 'free', notes: 'My offerings' },
  { exact: '/maia/community/share', minTier: 'free', notes: 'Share content' },
  { exact: '/maia/community/new-post', minTier: 'free', notes: 'Create post' },
  { exact: '/maia/community/chat', minTier: 'free', notes: 'Community chat' },
  { exact: '/maia/community/reality-check', minTier: 'free', notes: 'Reality check' },

  // Circles Commons (Phase 1)
  { prefix: '/commons/circles', minTier: 'free', notes: 'Circles commons - all authenticated members' },
  { exact: '/commons/join', public: true, notes: 'Join circle via invite — public landing, auth required at submit' },

  // Elemental Alchemy — depth
  { prefix: '/maia/community/elemental-alchemy', minTier: 'free', notes: 'Elemental alchemy — depth, open to all' },

  // Oracle tools — depth, capacity-governed by LimitsEnforcer
  { exact: '/oracle/iching', minTier: 'free', notes: 'I-Ching readings — depth, rate-limited' },
  { exact: '/oracle/tarot', minTier: 'free', notes: 'Tarot readings — depth, rate-limited' },
  { exact: '/oracle/runes', minTier: 'free', notes: 'Rune readings — depth, rate-limited' },
  { exact: '/oracle/yijing', minTier: 'free', notes: 'Yi Jing readings — depth, rate-limited' },
  { exact: '/oracle/consciousness', minTier: 'free', notes: 'Consciousness oracle — depth, rate-limited' },
  { exact: '/oracle/interactive', minTier: 'free', notes: 'Interactive oracle — depth, rate-limited' },

  // Astrology tools — depth, open to all
  { exact: '/chart', minTier: 'free', notes: 'Chart generator — depth' },
  { exact: '/astrology/chinese', minTier: 'free', notes: 'Chinese astrology — depth' },
  { exact: '/astrology/mayan', minTier: 'free', notes: 'Mayan astrology — depth' },
  { exact: '/astrology/vedic', minTier: 'free', notes: 'Vedic astrology — depth' },
  { prefix: '/astrology/aspects/', public: true, notes: 'Aspect detail pages — public' },
  { prefix: '/astrology/pathways/', minTier: 'free', notes: 'Pathways — depth' },
  { exact: '/astrology/synastry', minTier: 'free', notes: 'Synastry — depth' },
  { exact: '/astrology/synastry/saved', minTier: 'free', notes: 'Saved synastry — depth' },
  { prefix: '/astrology/synastry/', minTier: 'free', notes: 'Synastry analysis — depth' },

  // Consciousness features — depth, open to all
  { exact: '/consciousness/dashboard', minTier: 'free', notes: 'Consciousness dashboard — depth' },
  { exact: '/consciousness/meditation', minTier: 'free', notes: 'Meditation guide — depth' },
  { exact: '/consciousness/omnidimensional-test', minTier: 'free', notes: 'Omnidimensional test — depth' },
  { exact: '/consciousness/portals', minTier: 'free', notes: 'Consciousness portals — depth' },
  { exact: '/consciousness-computing', minTier: 'free', notes: 'Consciousness computing — depth' },
  { exact: '/consciousness-computing/feedback', minTier: 'free', notes: 'Computing feedback — depth' },
  { exact: '/consciousness-computing/pwa', minTier: 'free', notes: 'Computing PWA — depth' },
  { exact: '/consciousness-insights', minTier: 'free', notes: 'Consciousness insights — depth' },

  // Book companion — depth
  { exact: '/book/companion', minTier: 'free', notes: 'Book companion — depth' },
  { exact: '/book/ask', minTier: 'free', notes: 'Book companion ask — depth' },
  { exact: '/book-companion/ain', minTier: 'free', notes: 'Book companion AIN — depth' },

  // Worlds (experiential spaces entered via MAIA doorways)
  { prefix: '/worlds', minTier: 'free', notes: 'World portals — entry always free' },

  // Journey & evolution — depth (seeing your own development is not a perk)
  { exact: '/journey', minTier: 'free', notes: 'Journey view — depth' },
  { exact: '/evolution', minTier: 'free', notes: 'Evolution tracking — depth' },
  { exact: '/soul-gateway', minTier: 'free', notes: 'Soul gateway — depth' },
  { exact: '/capture', minTier: 'free', notes: 'Capture interface — depth' },

  // AIN features — depth
  { exact: '/ain-demo', minTier: 'free', notes: 'AIN demo — depth' },
  { exact: '/ain-evolution', minTier: 'free', notes: 'AIN evolution — depth' },

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

  // Journal — the member's Journal room. A real member route (2026-07-28), no
  // longer a redirect into founder-gated /labtools/journal.
  { exact: '/journal', minTier: 'free', notes: 'Member Journal — depth (journals always saved)' },

  // ─────────────────────────────────────────────────────────────────
  // Lab Tools — Sanctuary Economy
  // Self-work tools are depth (open to all).
  // Professional/practitioner tools remain Pro.
  // Order matters: specific rules BEFORE the broad prefix fallback.
  // ─────────────────────────────────────────────────────────────────

  // ── Lab Tools ────────────────────────────────────────────────────────────
  //
  // ⚠️ UNRECONCILED, RECORDED 2026-09-04 — read before trusting the entries
  // below. These rules were generated from the Offerings Inventory when
  // /labtools was member-facing "depth". It is not any more:
  // app/labtools/layout.tsx now calls requireFounder(), which refuses every
  // member id outside the FOUNDER_MEMBER_IDS allowlist. So for the whole
  // /labtools tree, the DECLARED policy below (minTier 'free' — any
  // authenticated member) and the ENFORCED policy (founder only) disagree.
  //
  // Reflections used to be the loudest instance and is now simply GONE from
  // this tree — founder ruling 2026-09-04 moved it out of Lab Tools entirely
  // rather than reconciling a second address (see /reflections above). The
  // remaining `free` entries below are NOT ratified as intent — nobody has ruled whether the layout gate or
  // the declaration is the mistake, and quietly restricting a dozen routes to
  // match a gate that may itself be the accident would be a policy change
  // wearing a cleanup's clothes. They are named here so the disagreement is a
  // recorded open question rather than an invitation to "fix" requireFounder()
  // because the matrix appears to say otherwise. ⛔ Do not read a `free` entry
  // under /labtools as evidence that the founder gate is wrong.
  { exact: '/labtools', minTier: 'free', notes: 'Lab tools index — DECLARED free; ENFORCED founder-only by app/labtools/layout.tsx. Unreconciled, see block note.' },
  { exact: '/labtools/profile', minTier: 'free', notes: 'Profile settings — depth' },
  { exact: '/labtools/settings', minTier: 'free', notes: 'App settings — depth' },
  { exact: '/labtools/language', minTier: 'free', notes: 'Language preferences — depth' },
  { exact: '/labtools/journal', minTier: 'free', notes: 'Daily journaling — depth (journals always saved)' },
  // Reflections — member-owned Keeps. The member's home is /reflections; the
  // /labtools addresses below are the founder/lab surface and are additionally
  // gated by requireFounder() in app/labtools/layout.tsx (founder ruling
  // 2026-09-04, Journal precedent). Mapped explicitly so strict mode does not
  // deny a member their own reflections as an unmapped route.
  { exact: '/reflections', minTier: 'free', notes: 'Member reflections feed' },
  { prefix: '/reflections/', minTier: 'free', notes: 'A single member reflection' },
  // ⛔ NO /labtools/reflections RULE — deliberately. Founder ruling 2026-09-04
  // took Reflections OUT of Lab Tools; app/labtools/reflections/ is deleted.
  // The declaration contradiction that stood here (declared 'free', enforced
  // founder-only) is not reconciled but DISSOLVED: there is no second address
  // to declare. Do not re-add a rule for it — a rule here would resurrect a
  // route that no longer exists, and the matrix would once again describe a
  // product that isn't there.
  { exact: '/labtools/favorites', minTier: 'free', notes: 'Saved items — depth' },
  { exact: '/labtools/downloads', minTier: 'free', notes: 'Downloads (content-gated separately)' },
  { exact: '/labtools/books', minTier: 'free', notes: 'Book access (content-gated separately)' },
  { exact: '/labtools/sovereignty', minTier: 'free', notes: 'Data sovereignty — rights not perks' },
  { exact: '/labtools/gifts', minTier: 'free', rolesAnyOf: ['admin'], notes: 'Admin gift creator' },
  { exact: '/labtools/beads', minTier: 'free', notes: 'Member bead sharing — depth' },
  { exact: '/labtools/beta-testing', minTier: 'free', notes: 'Pioneer circle' },
  { exact: '/labtools/voice', minTier: 'free', notes: 'Voice settings — depth (voice minutes capacity-governed)' },
  { exact: '/labtools/field-analytics', minTier: 'free', notes: 'Field analytics — depth' },

  // [Relational Layer — Phase 4 activation]
  // Relational labtools — scaffolds, zero AI cost, free by design.
  // See: lib/relationships/relationshipResources.ts (lineage grounding).
  // These exact entries are required because without them, the prefix
  // catch-all at the bottom (`{ prefix: '/labtools', minTier: 'pro' }`)
  // gates them to Pro — which is wrong for scaffold tools.
  { exact: '/labtools/repair-script', minTier: 'free', notes: 'Repair Script — scaffold, no AI' },
  { exact: '/labtools/relational-field', minTier: 'free', notes: 'Relational Field — scaffold, no AI' },
  { exact: '/labtools/dynamics-map', minTier: 'free', notes: 'Dynamics Map — scaffold, no AI' },
  { exact: '/labtools/repair-path', minTier: 'free', notes: 'Repair Path — scaffold, no AI' },

  // Lab Tools - Admin only (before Pro fallback)
  { prefix: '/labtools/admin', minTier: 'free', rolesAnyOf: ['admin'], notes: 'Admin tools - role-gated' },

  // Lab Tools - Pro tier (practitioner infrastructure only)
  { prefix: '/labtools', minTier: 'pro', notes: 'Remaining lab tools = practitioner infrastructure' },

  // ─────────────────────────────────────────────────────────────────
  // Legacy Redirects
  // Backwards compatibility with old links.
  // ─────────────────────────────────────────────────────────────────
  { exact: '/birth-chart', public: true, minTier: 'free', notes: '→ /patterns' },
  { exact: '/language', minTier: 'free', notes: '→ /labtools/language' },
  { exact: '/voice', minTier: 'free', notes: '→ /labtools/voice' },

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

  // Studio (session room + supporting pages)
  { prefix: '/studio', minTier: 'free', notes: 'Studio - open to all authenticated users' },

  // SoulComms — team messaging
  { prefix: '/team/invite/', public: true, notes: 'Team invite accept pages — must be accessible before auth' },
  { prefix: '/api/team/invite/', public: true, notes: 'Team invite API — lookup, accept, register — public for email link flow' },
  { prefix: '/team', minTier: 'free', notes: 'SoulComms team messaging - all authenticated users' },
  { prefix: '/api/team', minTier: 'free', notes: 'SoulComms API - all authenticated users' },

  // -------------------------------------------------------------------------
  // 5) ADMIN / STEWARD - Role-gated (not tier)
  // -------------------------------------------------------------------------

  { prefix: '/admin', minTier: 'pro', rolesAnyOf: ['admin'], notes: 'Admin panel - admin only' },
  { prefix: '/founder', minTier: 'free', rolesAnyOf: ['admin'], notes: 'Founder ops console - admin only' },
  { prefix: '/api/founder', minTier: 'free', rolesAnyOf: ['admin'], notes: 'Founder ops API - admin only' },
  { prefix: '/steward', minTier: 'pro', rolesAnyOf: ['steward', 'admin'], notes: 'Steward tools' },

  // -------------------------------------------------------------------------
  // 6) API ROUTES
  // -------------------------------------------------------------------------

  // Telemetry API (POST = free, GET = admin-gated in route handler)
  { prefix: '/api/telemetry', minTier: 'free', notes: 'World telemetry events' },
  // Client diagnostic telemetry MUST be reachable when auth is broken or incomplete —
  // that is the failure state it was built to observe (redirect loops, voice failures
  // from the signin page). Endpoint validates events via strict allowlist + truncates
  // metadata; no PII beyond a 120-char UA. Anon by design.
  { exact: '/api/telemetry/client', public: true, notes: 'Client diagnostic telemetry — reachable in unauthenticated/broken states (signin breaker + voice events). See PR #328.' },

  // Public API
  { exact: '/api/ask', public: true, notes: 'Landing page Ask Kelly/MAIA' },
  { exact: '/api/members/check', public: true, notes: 'Check member exists' },
  { exact: '/api/members/register', public: true, notes: 'Register member' },
  { exact: '/api/members/register-email', public: true, notes: 'Register via magic link (no passkey)' },
  { exact: '/api/members/signin', public: true, notes: 'Sign in' },
  { exact: '/api/auth/refresh-and-redirect', public: true, notes: 'Refresh session cookies and redirect' },
  { exact: '/api/practitioners/check', public: true, notes: 'Check practitioner status' },
  { exact: '/api/commons/contributions', public: true, notes: 'GET public contributions' },
  { exact: '/api/commons/contributions/orientation', public: true, notes: 'Orientation content' },

  // Member API — contribution is participation, open to all
  { regex: /^\/api\/commons\/contributions\/[^/]+$/, minTier: 'free', notes: 'Contribution detail — depth' },
  { exact: '/api/commons/contributions/my-offerings', minTier: 'free', notes: 'User offerings — depth' },
  { exact: '/api/stripe/membership/checkout', minTier: 'free', notes: 'Create checkout' },

  // Circles API (Phase 1)
  { prefix: '/api/circles', minTier: 'free', notes: 'Circles API - all authenticated members' },

  // Pro API
  { exact: '/api/practitioners/create', minTier: 'pro', notes: 'Create practitioner' },
  { prefix: '/api/practitioner/practices', minTier: 'pro', rolesAnyOf: ['practitioner', 'admin'], notes: 'Practice management' },
  { prefix: '/api/practitioner/sessions', minTier: 'pro', rolesAnyOf: ['practitioner', 'admin'], notes: 'Session management' },
  { prefix: '/api/practitioner/containers', minTier: 'pro', rolesAnyOf: ['practitioner', 'admin'], notes: 'Container management' },
  { prefix: '/api/stellium', minTier: 'pro', rolesAnyOf: ['practitioner', 'admin'], notes: 'Stellium API' },
  // Public exception (exact match is checked before the prefix below): Twilio
  // POSTs SMS delivery status here with no MAIA session; authenticated instead
  // by the X-Twilio-Signature header inside the route.
  { exact: '/api/notifications/sms/status', public: true, notes: 'Twilio SMS StatusCallback webhook — public, validated by X-Twilio-Signature' },
  { prefix: '/api/notifications', minTier: 'pro', rolesAnyOf: ['practitioner', 'admin'], notes: 'Notification APIs (SMS/Email)' },
  { exact: '/api/commons/contributions/review-queue', minTier: 'pro', rolesAnyOf: ['curator', 'steward', 'admin'], notes: 'Review queue' },
  { regex: /^\/api\/commons\/contributions\/[^/]+\/review$/, minTier: 'pro', rolesAnyOf: ['curator', 'steward', 'admin'], notes: 'Review action' },

  // Sovereign API - all open to authenticated users (tier check temporarily disabled)
  { prefix: '/api/sovereign', minTier: 'free', notes: 'Sovereign features' },

  // MAIA trajectory substrate - AUTH-01-D4B edge containment.
  // These five handlers take member identity from caller-supplied `?memberId=` /
  // `body.memberId` and carried NO accessMatrix rule, so permissive mode admitted
  // ANONYMOUS callers to member-scoped reads and member-attributed writes.
  // This rule closes the EDGE only. It deliberately does NOT decide whether
  // `memberId` is authenticated member identity or an authorized service-selected
  // subject - that question needs its own evidence (no in-repo caller exists).
  // The trailing slash is deliberate: matchRule uses raw `startsWith`, so a bare
  // '/api/maia/trajectory' would also capture a future sibling like
  // '/api/maia/trajectoryX'.
  { prefix: '/api/maia/trajectory/', minTier: 'free', notes: 'MAIA trajectory substrate - authenticated members only (AUTH-01-D4B)' },

  // Studio API - session room, bookings, scribe markers, live prompts
  { prefix: '/api/studio', minTier: 'free', notes: 'Studio API' },

  // Supervision API - session lifecycle, transcript, insights SSE stream
  { prefix: '/api/supervision', minTier: 'free', notes: 'Supervision API' },

  // Scribe API - session review, summaries
  { prefix: '/api/scribe', minTier: 'free', notes: 'Scribe API' },

  // Beta Tester field API — admin routes need the admin role; cohort routes are
  // auth-gated here and cohort-gated server-side via requireCohort (members.tester).
  // Admin prefix MUST precede the cohort prefix (more specific first).
  { prefix: '/api/admin/beta-testers', minTier: 'free', rolesAnyOf: ['admin'], notes: 'Beta tester field admin API — admin role (also enforced in requireAdmin)' },
  { prefix: '/api/beta-testers', minTier: 'free', notes: 'Beta tester field API — cohort-gated server-side (members.tester via requireCohort)' },

  // Stripe webhooks (system routes, validated by signature)
  { prefix: '/api/stripe/webhook', public: true, notes: 'Stripe webhooks - validated by signature' },

  // -------------------------------------------------------------------------
  // Soul Portrait — Path B, Gate 1 (see docs/architecture/SOUL_PORTRAIT_PATH_B_SPEC.md §2)
  // -------------------------------------------------------------------------
  // Gate 4 delivery surface (2026-07-16): generated portraits SENT by a
  // practitioner render here for non-members. Public at the middleware layer
  // ONLY — the real gates live in the route: published_at IS NOT NULL AND
  // ledger consent-liveness (isPortraitConsentLive), else 404. The un-guessable
  // slug is defense-in-depth, never the gate. noindex; no Mentor/MAIA/memory.
  { prefix: '/soul-portrait/view/', public: true, notes: 'Delivered Soul Portraits (Gate 4) — consent-gated in-route; middleware passes, ledger decides' },
  // Augusten = the single family-held exception: public-unlisted (loads without
  // auth, noindex). These EXACT rules win over the prefix below — the matcher
  // runs the exact pass before the prefix pass — so the exception is explicit
  // and visible, not an accident of permissive middleware.
  { exact: '/soul-portrait/augusten', public: true, notes: "Augusten — author's own minor child; family-held consent; unlisted exception only" },
  { exact: '/api/soul-portrait/augusten/mentor', public: true, notes: 'Augusten Mentor — family-held exception; rate-limited; no retention' },
  // Katie — SECOND hand-delivered Gift exception (Kelly 2026-06-20): a private,
  // unlisted, noindex gift link to his adult niece. SAME honest posture as
  // Augusten (public-unlisted, hand-delivered, Mentor/MAIA/memory OFF) — NOT a
  // public opening and NOT Path B. Reception link = /soul-portrait/katie/welcome.
  { exact: '/soul-portrait/katie/welcome', public: true, notes: 'Katie Gift threshold (reception page) — hand-delivered unlisted exception; noindex' },
  { exact: '/soul-portrait/katie', public: true, notes: 'Katie Gift Portrait (renderer) — hand-delivered unlisted exception (adult niece); Mentor off; noindex' },
  { exact: '/api/soul-portrait/katie/mentor', public: true, notes: 'Katie Mentor — DISABLED (mentorEnabled off → 404); public rule only so it returns 404 not 401, mirroring Augusten' },
  // Sophie — THIRD hand-delivered Gift exception (Kelly 2026-06-20): the author's
  // own minor daughter (17, senior year), a Father's Day gift. SAME honest posture
  // as Katie (public-unlisted, hand-delivered, noindex, Mentor/MAIA/memory OFF).
  // No mentor rule — Mentor is off, so the endpoint stays unreachable (401, not public).
  { exact: '/soul-portrait/sophie/welcome', public: true, notes: 'Sophie Gift threshold (reception page) — hand-delivered unlisted exception; noindex' },
  { exact: '/soul-portrait/sophie', public: true, notes: "Sophie Gift Portrait (renderer) — hand-delivered unlisted exception (author's minor daughter, 17); Mentor off; noindex" },
  // Andrea — FOURTH hand-delivered Gift exception (Kelly 2026-06-20): a gift to
  // his wife (adult). SAME posture: public-unlisted, hand-delivered, noindex,
  // Mentor/MAIA/memory OFF. Reception link = /soul-portrait/andrea/welcome.
  { exact: '/soul-portrait/andrea/welcome', public: true, notes: 'Andrea Gift threshold (reception page) — hand-delivered unlisted exception; noindex' },
  { exact: '/soul-portrait/andrea', public: true, notes: "Andrea Gift Portrait (renderer) — hand-delivered unlisted exception (author's wife); Mentor off; noindex" },
  // Andrea Fagan — FIFTH hand-delivered Gift exception (Kelly 2026-07-08): a gift
  // to an adult friend. SAME posture: public-unlisted, hand-delivered, noindex,
  // Mentor/MAIA/memory OFF. No /welcome rule yet — the giver's threshold note is
  // Kelly's to add before delivery.
  { exact: '/soul-portrait/andrea-fagan/welcome', public: true, notes: 'Andrea Fagan Gift threshold (reception page) — hand-delivered unlisted exception; noindex' },
  { exact: '/soul-portrait/andrea-fagan', public: true, notes: 'Andrea Fagan Gift Portrait (renderer) — hand-delivered unlisted exception (adult); Mentor off; noindex; includes computed Year Ahead' },
  // Catherine — SIXTH hand-delivered Gift exception (Kelly 2026-07-09): adult
  // gift, public-unlisted, noindex, Mentor/MAIA/memory OFF. Part II pending report.
  { exact: '/soul-portrait/catherine/welcome', public: true, notes: 'Catherine Gift threshold (reception page) — hand-delivered unlisted exception; noindex' },
  { exact: '/soul-portrait/catherine', public: true, notes: 'Catherine Gift Portrait (renderer) — hand-delivered unlisted exception (adult); Mentor off; noindex' },
  // Kelly — the author's own SELF-portrait (Kelly 2026-06-22): mode 'self', no
  // giver/threshold, no Return-to-Soullab coda. SAME posture: public-unlisted,
  // noindex, Mentor/MAIA/memory OFF. No /welcome rule (self-portrait has no threshold).
  { exact: '/soul-portrait/kelly', public: true, notes: "Kelly self-portrait (renderer) — author's own; unlisted exception; Mentor off; noindex" },
  // Nathan — a gift portrait Kelly offers to his business partner (Kelly 2026-06-22):
  // mode 'gift', offeredBy Kelly. SAME posture: public-unlisted, noindex,
  // Mentor/MAIA/memory OFF. Hand-delivered by link; Kelly's editorial approval first.
  { exact: '/soul-portrait/nathan', public: true, notes: "Nathan Gift Portrait (renderer) — hand-delivered unlisted exception (author's business partner); Mentor off; noindex" },
  // Jondi — a gift portrait Kelly offers to a Soullab teammate / beta tester (Kelly
  // 2026-06-22): mode 'gift', offeredBy Kelly. SAME posture: public-unlisted, noindex,
  // Mentor/MAIA/memory OFF. Hand-delivered by link; Kelly's editorial approval first.
  { exact: '/soul-portrait/jondi', public: true, notes: "Jondi Gift Portrait (renderer) — hand-delivered unlisted exception (Soullab teammate/beta tester); Mentor off; noindex" },
  // Heather — a gift portrait Kelly offers to Soullab's new marketing director (Kelly
  // 2026-06-23): mode 'gift', offeredBy Kelly. SAME posture: public-unlisted, noindex,
  // Mentor/MAIA/memory OFF. Hand-delivered by link; Kelly's editorial approval first.
  { exact: '/soul-portrait/heather', public: true, notes: "Heather Gift Portrait (renderer) — hand-delivered unlisted exception (Soullab marketing director); Mentor off; noindex" },

  // Larry — a gift portrait Kelly offers to Larry Closs (Kelly-approved 2026-06-26):
  // mode 'gift', offeredBy Kelly. SAME posture: public-unlisted, noindex, Mentor/MAIA/
  // memory OFF. Hand-delivered by link. "A portrait may be given; a relationship must
  // be chosen" — portrait + welcome public; doorways out (MAIA/return/mentor) stay gated.
  { exact: '/soul-portrait/larry/welcome', public: true, notes: 'Larry Gift threshold (reception page) — hand-delivered unlisted exception; noindex' },
  { exact: '/soul-portrait/larry', public: true, notes: "Larry Closs Gift Portrait (renderer) — hand-delivered unlisted exception (founder→positive-psych coach); Mentor off; noindex" },

  // Every OTHER portrait requires an authenticated member. Per-member binding +
  // the consent/reception gate are enforced in the route handler (the matrix is
  // the coarse auth gate only; Path B Gate 3 adds the fine consent gate).
  { prefix: '/soul-portrait/', minTier: 'free', notes: 'Path B: non-exception portraits require login + per-member consent gate (route-enforced)' },
  { prefix: '/api/soul-portrait/', minTier: 'free', notes: 'Path B: portrait API requires login + per-member consent gate (route-enforced)' },
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
