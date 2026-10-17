# Writer’s Studio — Auth sign-in audit actions and whole-app shipping compiler

**October 16, 2026 · Founder Mac Studio · isolated code candidate · No production/member action**

## Why this matters for beta

The accepted integrated Writer’s Studio local source `01bc5cc62ba02a7c045bd2f8f759e3bcc7854aed` has scoped strict TypeScript and fictional protected Source→Draft→Apply→Undo acceptance, but not a clean enforced `tsconfig.ship.json` production TypeScript check. We must not waive the latter by using `ignoreBuildErrors`, disabling strictness, excluding application files, modifying package dependencies without review, or declaring a scoped project equivalent to an actual shipping build.

A real sign-in dependency of the Writer beta was independently confirmed broken at the type boundary: `lib/security/authAudit.ts` permitted established canonical `signin_success` / `signin_failed`, but the existing Member password login and Now What login/registration routes *already* passed `password_signin`, `now_what_signin` and `now_what_register` to the logger. That yielded six TS2322 errors across three live-route files. The database audit migration `20260828000001_audit_logs.sql` has an unconstrained TEXT `action_type` and cannot demand an enum remapping; the actual existing event identities must be preserved.

## Exact bounded code change

Isolated branch: `fix/ws-beta-shipping-auth-action-types-20261016-chatgpt`, parent `01bc5cc62ba02a7c045bd2f8f759e3bcc7854aed`.

- Added **exactly three already-issued literal types** to `AuthAction`, with no runtime auth, session, cookie, rate-limit, database, audit INSERT, error policy, logger or member-data change.
- Added existing audit-log test cases that execute each exact action and assert it is persisted **unmodified** with the account recorded only as `resource_id`, with `user_id=NULL` absent independently verified actor, and `consent_verified=NULL` without an actual consent check.
- Added `tsconfig.ws-beta-shipping-auth-actions.json`, extending the existing accepted strict scope and including the actual Member/Now What sign-in/register routes and audit logger. No shared config, build gate or full-shipping exclusion changed.

## Precommit source evidence

Whole-app `tsc -p tsconfig.ship.json --noEmit --incremental false --pretty false` on exact original parent produced **191 diagnostics over 94 files**, exit 2. On this source candidate with only the type/test/config change, the same command produced **185 diagnostics over 91 files**, exit 2. The multiset of diagnostic file/line/column/code/message records showed:

- Exactly **six** removed TS2322 diagnostics (three `app/api/members/signin/route.ts`, two `app/api/now-what/signin/route.ts`, one `app/api/now-what/register/route.ts`).
- **Zero added** or changed diagnostics; no author write/custody code, sessions or login control changed.
- Exact locally saved baseline and new compiler logs:
  `/Volumes/T7 Shield/ws-beta-r56-shipping-audit-01bc5cc6-20261016/EXACT_SHIP_TSC_BASELINE.txt`
  `/Volumes/T7 Shield/ws-beta-shipping-auth-type-evidence-20261016/FULL_SHIP_AUTH_ACTIONS_CANDIDATE.log`.
- Strict scoped compiler including actual routes **PASS**; existing extended auth audit Jest **23/23 PASS**, with unchanged durability/consent/actor/privacy failure behavior.

No broad TS repair was attempted. The remaining **185 diagnostics in 91 files** include 60 possibly-null values, 48 missing-property errors, 25 assignment mismatches, 20 missing-required-property errors, 10 missing-module errors and other lower-volume categories. Several belong to older Studio, Labtools, and I Ching areas. The native-biometry missing-module cases require an authorized dependency/runtime review; do not fabricate modules. If another current authentication owner is repairing session issuance or cookies, that owner’s runtime security changes must remain on its own reviewed branch and not be mixed with this *type-only* correction.

## Release status and next engineering focus

**Whole-app shipping compiler STILL FAILS.** This candidate removes a known type mismatch without normalizing/erasing real errors. The release and Writer protected writing HOLD remains unchanged, as do the unresolved operational independent Work-key issuer/delete/freshness/commit fence, encrypted Source/Draft/proposal migrations and legacy fallback, actual PC3→authenticated R53/R54 protected Save/Apply/Undo, offsite restore, real Safari/physical iPhone, and independent Class A/founder approved small cohort.

Avoid fixing 94 unrelated application files inside Writer’s Studio source convergence; split the shipping remediation by owning product area, preserve runtime compatibility and demand an independently qualified clean `tsconfig.ship.json` and signed production image. Nothing here constitutes deployment or beta admission.
