# Writer’s Studio R61 — verified mobile-to-web destination and nullable Next.js routes

**October 17, 2026 | Isolated Mac Studio | Beta and production HOLD**

## Exact inherited source and scope

R61 starts from accepted clean R60 local commit:
9540724171d06cec40b4cdbdc754539b828b817f.

The original Writer’s Studio R59/R60 histories, auth audits, Studio protected Source→Draft→Apply/Undo custody, 12 legacy mutation fences and production instances remain unchanged.

The full shipping TypeScript checker identified **three** remaining Next.js 16 nullability diagnostics in two mobile web-hatch pages:

- app/open-in-web/page.tsx (2 TS18047): useSearchParams() can be null.
- app/open-web/page.tsx (1 TS18047): same nullable query.

These are also real member navigation boundaries. The old open-web code stored a web destination in React state but did **not** reset it when the current query disappeared or became invalid; a stale route could remain in the browser button. Both pages accepted unchecked incoming paths and could suggest more route certainty than they had.

## Bounded code changes

- New pure lib/mobile/resolvedWebHandoffR61.ts produces a same-origin https://soullab.life destination ONLY from an explicit canonical single-slash root-relative path. It rejects cross-origin, protocol-relative, malformed percent encoding, encoded slash/backslash, dot traversal, raw controls/bidi formatting, fragments, common credential-bearing query keys and excessively long paths. Missing or rejected paths produce a clearly identified homepage choice. This does not authenticate or entitle the member.
- app/open-in-web/page.tsx now uses safe optional query lookup, the single helper and a bounded label. If the route cannot be confirmed, the heading reads **Continue on Soullab** and the link names the homepage, not a guessed Studio destination.
- app/open-web/page.tsx derives its browser target fresh from CURRENT search parameters on every render, instead of persisting a previous target in React state. The click uses exactly the verified destination with _blank and noopener,noreferrer. An unresolved query offers the homepage.
- Existing native MobileRouteGuard, route allowlists, signup/login credentials, Studio role gates and protected Writer services remain unchanged. No new API route, key, consent, model provider or member data access.

A missing destination is NOT authority to open a previous protected Studio route or to redirect to an external origin. The homepage handoff is a deliberate member choice, never an automatic redirect.

## Precommit qualification

- **40/40** focused Jest tests: valid Studio and Writer paths, null/unsafe URLs, traversal and encoding, token query keys, bounded labels, consecutive changed/missing query renders, and the click/href source contract.
- **97/97** combined inherited Writer/source/consent/security/native/auth suites, **1,065/1,065** tests passed.
- Strict scoped TypeScript for both actual TSX pages, helper and tests passed.
- The unchanged full tsconfig.ship.json compiler on R60 baseline had **184 inherited diagnostics**. The R61 candidate has **181 diagnostics**: exactly three removed TS18047 diagnostics in the target pages, **zero new diagnostics**. Full production build remains FAIL.
- A real Next.js/WebKit 390px mobile rehearsal of both actual pages passed **13/13** checks on a localhost-only dev server. It inspected exact anchor URLs and intercepted click-time window.open targets without opening any external site. Missing/untrusted paths selected only the explicit homepage, while valid deep links retained their exact route. Zero external browser requests and zero member/API requests were made.
- The browser screenshots show actual mobile web-hatch layout. The open-web screenshot additionally contains an unrelated global **Audio enabled** toast. That is a separate UI observation for a later mobile review, not evidence that R61 owns audio behavior.

The change is also governed by the actual, experiential Soullab Web Handoff contract:
 docs/design/contracts/mobile-web-handoff.md
with independently captured and locally inspected desktop/mobile WebKit screenshots
under docs/design/contracts/screenshots/mobile-web-handoff-r61-*.
The separate design-witness-v2 run passed 15/15 checks and explicitly verified
no horizontal desktop overflow. A prior 13-check design-witness run was held
because its new desktop checks had not yet been inserted; that receipt remains
preserved, not treated as an accepted result.

Evidence root:
 /Volumes/T7 Shield/ws-beta-r61-safe-web-hatch-evidence-20261017/

The isolated test harness at scripts/ops/wsBetaR61WebHatchWebKit.cjs requires an exact fictional-only marker, loopback dev server and disposable nonmember HOME. It blocks external browser requests, writes append-only receipts/screenshots, checks browser/server cleanup and cannot claim a physical iPhone or real member. Exact source requalification must set R61_EXACT_SOURCE_SHA after commit.

## Nonwaivable beta release stops

R61 is a bounded navigation/type correction, NOT protected writing activation. Independent operational Work/Proposal keys, current member consent within a real signed author Apply/Undo HTTP transaction, durable private MAIA proposals, historical Source/Draft/Keep/plaintext SQL/WAL/log/backup migration, offsite restore, Class A review and real Mac/physical-iPhone Safari are not complete.

The entire enforced production shipping TypeScript check still fails. A scoped compiler pass or local WebKit rehearsal is not an image admission gate. Both the R52 legacy writer gate and full beta-corridor release gate must stay HOLD pending separate founder authorization.

**Disposition: R61 local candidate only. Five-tester production beta HOLD. No production deploy, real-member writing, operational KMS, invitations, provider call, protected-branch merge, PR or GitHub push.**
