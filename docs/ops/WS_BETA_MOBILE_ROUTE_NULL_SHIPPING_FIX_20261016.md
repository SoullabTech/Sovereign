# Writer's Studio beta — Native mobile route identity and shipping TypeScript correction

**October 16, 2026 | Founder Mac Studio | Local isolated candidate | Real five-person beta HOLD**

## Source and concrete defect

Based on the clean, committed Writer beta + sign-in audit shipping correction `98d64d7ab7590def90d4669ca3091beedab7bdb1`. New separate branch `fix/ws-beta-shipping-mobile-route-null-20261016-chatgpt`, worktree `/Volumes/T7 Shield/ws-beta-shipping-mobile-route-null-chatgpt-20261016`. Parallel R57/R58 protected author/private custody and Draft-test worktrees were not modified.

The accepted enforced `tsconfig.ship.json` compiler on the parent returned **185 diagnostics across 91 files**, exit 2. Three came from `components/mobile/MobileRouteGuard.tsx`: two TS2345 string|null values passed to the native route allowlist and one TS2322 nullable pathname passed into `OpenInWebScreen`. Next.js 16 `usePathname()` allows `null` while route identity is unresolved.

The existing native route guard is a member-facing access boundary. Treating `null` as an unknown/web-only route could construct an invalid browser handoff or reuse an old `allow` result during navigation. Making TypeScript happy with `pathname ?? '/maia'`, the previous pathname, a type assertion, or widening the allowlist would have authorized or implied a route not actually established.

## Bounded source correction

- `lib/mobile/resolvedMobileRoutePath.ts` introduces a **pure type guard** requiring a single-slash absolute pathname; `null`, empty, relative, external URL or protocol-relative `//host` are not a resolved native route.
- `MobileRouteGuard` keeps its immediate **non-native web pass-through**, then checks the known-path precondition before calling `isMobileRoute`, `isStudioMobileRoute` or asynchronous entitlement helpers. Native unresolved routes set the gate to `checking` and do not fetch entitlements or synthesize a web-only location.
- The **render-time** check precedes the inherited `checking`, `web-only` and `allow` states. An unresolved native pathname renders neither the protected child content nor a misleading Open in Web Studio URL, even before `useEffect` runs. Web routing with an unresolved path still renders children.
- Existing route allowlists, permission/role classification, beta/session tokens, cookies, rate limiting, external URL target base, native/non-native detection, conditional Studio entitlement behavior and mobile navigation are unchanged for an already valid pathname. No production runtime route flag or test-only bypass is added.
- `components/mobile/__tests__/MobileRouteGuard.pathname.test.ts` checks concrete true/false paths and server-side React renders with mocked native/web platform. The test conforms to the existing Jest .test.ts-only discovery configuration without changing Jest or shipping settings. `tsconfig.ws-beta-shipping-mobile-null.json` checks the actual TSX guard, helper and tests strictly.

## Precommit acceptance and shipping evidence

- **14/14** focused mobile route tests PASS, including native unresolved-route refusal and web-only hydration pass-through.
- Strict scoped TypeScript covering real MobileRouteGuard TSX, helper and tests PASS.
- The identical full `tsconfig.ship.json --noEmit --incremental false --pretty false` command, with compiler settings unchanged, returned **182 errors over 90 files**, exit 2.
- An exact multiset comparison against the parent `185 errors/91 files` showed **three** removed diagnostics, all in the expected `MobileRouteGuard.tsx`: TS2345 at lines 189 and 197 and TS2322 at line 232. **Zero new or changed diagnostics.**
- Parent full compiler: `/Volumes/T7 Shield/ws-beta-shipping-auth-type-exact-98d64d7a-20261016/EXACT_SHIP_COMPILER.log`.
- Candidate full compiler: `/Volumes/T7 Shield/ws-beta-shipping-mobile-null-evidence-20261016/FULL_SHIP_MOBILE_ROUTE_CANDIDATE.log`.
- Strict route tests and the broader protected Writer regression should also pass against the exact committed source; do not copy precommit evidence to a final SHA without rerun.

## Release and interaction boundary

This is a correction to the **iOS native shell route-identity gate**, not proof of the Writer's Studio full web/physical-iPhone release. A physical Safari iPhone beta test remains required independently, as does protection of any legacy/beta membership route and the actual PC3 encrypted author-service transport.

**Real beta HOLD remains.** A full production TypeScript pass still has **182 errors** and no signed-shipping-image verification. Real independent Work KMS/deletion/freshness/revocation authority is not provisioned; no actual PC3 author click is linked through governed encrypted Save/Apply/Undo. R52 legacy interceptors remain default OFF and historical plaintext/SQL/WAL/backup/reader migration and offsite restoration remain unresolved.

No actual member data, production account, deployed route, operational encryption key, cloud service, paid provider, email invitation, PR, external push or live Writer beta admission was used. This branch changes only one route component, one pure helper, their tests/config and this report.
