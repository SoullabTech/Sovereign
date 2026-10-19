# Soullab P0 — One Ecosystem, Many Doors | Public Discovery Release Review

**Date:** October 18, 2026
**Exact base:** clean-main-no-secrets at 81ae1edfe592fedac43e458245944e4dd33e9a41
**Release posture:** LOCAL PUBLIC-ONLY CANDIDATE. NO MERGE, DEPLOY, NEW ENROLLMENT OR PRIVATE MEMBER BETA AUTHORIZED.

## Why this is the smallest responsible launch update

Soullab.life/Home is already open, and the founder wants to prepare a final
integrated beta—not announce an empty new website. Soullab's distinctive
go-to-market strategy is **One Ecosystem, Many Doors**: Writer's Studio,
Pro Studio, Astrology Pro and other Studios earn attention independently;
MAIA has its own relational-intelligence entry; AIN OS has a separately
governed research/builder path. Each may eventually lead voluntarily to
the shared Soullab Home, not a forced funnel.

The source-aligned P0 change adds a public explanation and invitation
layer without shipping another member feature. It does not alter Soullab's
ratified identity canon:
**Soullab is the place. AIN OS is the architecture. MAIA is the relational
intelligence that meets you there.** Public Enter Soullab still goes to
/home, and the private MAIA encounter remains a deliberate authenticated
action.

## Changed surface

- Public /explore index: 7 independently described, clickable cards
  with concrete audiences, distinct value, release status and limits.
- Public /explore/[slug]: 7 allowlisted read-only introductions
  with purpose, possible applications, actual availability warning,
  private-data disclaimer and return to Home.
- Explicit exact-only auth/access rules for /explore and seven allowed
  slugs. No wildcard or API scope is exposed.
- Add a secondary, non-forcing Explore link on the signed-out Home
  threshold and existing public Platform section. Existing Join Soullab,
  Sign in, and Enter Soullab CTAs remain primary.
- New preview landing routes are noindex until separately founder-authorized
  SEO publication. No forms, file uploads, provider calls, account reads,
  analytics, new subscription gates, credentials or migrations.
- No change to existing protected member or Studio routes.

## Availability is part of the product promise

| Door | Public message | Working feature gate |
|---|---|---|
| Writer's Studio | Development preview | Real manuscript custody/restore remains HOLD |
| Pro Studio | Development preview | Clinical privacy, practitioner beta and file sharing remain HOLD |
| Astrology Pro | Development preview | Professional chart Send/consent and Safari remain HOLD |
| MAIA | Existing public introduction | Private encounter requires verified member session |
| AIN OS | Research and architecture | No qualified licensed open-source distribution |
| Sound Resonance | Experience in development | No public player or therapeutic claim |
| Elemental Academy | Curriculum in development | No public course enrollment or certificates |

These statements concern independent discovery pages, not authorization
to use private areas. No public claim that an unreviewed function has
launched is introduced.

## Source and isolated technical acceptance

- Canonical HEAD resolved again directly from GitHub and matched the
  isolated worktree's exact parent SHA before implementation.
- 23 focused Jest security/source tests PASS on the bounded source,
  including signed-out exact public rules, invalid discovery path
  nonauthorization, and unchanged protected Studio/MAIA/API admission.
- Bounded TypeScript PASS.
- ESLint zero new errors; only existing HomeThreshold img-optimization
  warning preserved outside source scope.
- Actual Next.js 16.3 Webpack *development* app on 127.0.0.1 with
  empty/non-production environment and fictional, unreachable
  PostgreSQL URL: 16 read-only HTTP/negative-origin checks PASS.
  All seven public leaves 200 with Home/limits/noindex; unlisted slug
  404; restricted Writer, Studio and MAIA encounter redirect to sign-in;
  anonymous Studio API stays 401.
- WebKit headless desktop (1440px) and mobile viewport (390px)
  on isolated server: 7 card links, no horizontal overflow,
  click-through to Writer's Studio privacy statement and return to
  Soullab Home all PASS.
- These are synthetic source and browser proofs: NOT a physical
  iPhone Safari witness, actual deployed image, real auth/member
  journey or production acceptance.

## Review to obtain before any P0 public deploy

1. Resolve exact canonical freshness and independently review diff
   against **deployed** immutable image, not just local branch base.
2. Independently review product copy and status truth, especially
   clinical privacy, AI OS licensing and restricted writing features.
3. Check physical Safari desktop/iPhone, actual https origin,
   accessibility, navigation/focus, phone zoom, accurate images and
   no hidden provider network use.
4. Perform exact-commit full production-mode build and CI,
   preserve immutable code/image digest and rollback procedure.
5. Founder visual and exact-image GO, independent release-operator
   deployment, and immediate post-deploy witness.
6. If any gate fails, keep the current live Soullab site unchanged.

### Explicit non-goals

Do NOT merge the 1,052-file R94h Studio candidate into this public update.
Do NOT unlock Writer's Studio private author writes, chart transfers,
practitioner records, unconsented voice-note AI processing, new file
sharing, paid membership or open-source developer downloads. Independent
PostgreSQL/vault/key restoration and old-backup deletion/non-resurrection
remain prerequisites to real-private-content beta.

**Founder-governed release disposition: HOLD.**
