# Pro Studio Reflect → MAIA R3 Security Amendment
Date: 2026-10-13
Standing: **LOCAL CANDIDATE — independent Class A security approval and beta deployment HOLD**

## Exact predecessor and technical audit
- Source predecessor: `829c328374c7f5fc717f1b30f4da3bf2ae89f921`, itself based on protected `clean-main-no-secrets@2e836abc32853bf01bf8256062b561c2b7406378`.
- The predecessor is unchanged and remains a local, unmerged commit.
- Read-only, repeatable negative test of predecessor revealed:
  1. Version-current local browser cache B could prevent reconciliation with server session A.
  2. A failed `localStorage` write after earlier writes left multiple conflicting identities despite a `false` return.
- This is a **technical finding**, not evidence that protected server-side member data was disclosed. The human security approval was not independently obtained.

## Security amendments (three existing source/test paths)
1. A direct `/maia/encounter` entry always invokes the same-origin, cookie-backed `GET /api/members/session` revalidation, even when a cached browser version looks current. No new entitlement, identity-header override or membership grant is introduced. The legacy public `/maia` threshold remains unchanged.
2. Refuse a server-member/browser-member mismatch, including both `explorerId` and the `beta_user.id/memberId` aliases; do not copy an older member's private browser preferences into another account.
3. Snapshot all target `localStorage` keys and attempt complete rollback on interrupted writes; never return success on any failure. Storage cannot provide true multi-key transactions, so browser errors and residual caches require separate review and a deny-first UX.
4. Preserve existing same-member `beta_user` metadata (including user preferences) rather than overwriting it with a minimal record; do not treat that client metadata as authorization.
5. Honor explicit member sign-out, revoked/expired/unverified and non-onboarded server identity as before.

## Evidence collected in isolation
- Focused Jest: **31/31 PASS** (predecessor scenarios plus cross-account and interrupted-storage adversaries).
- Strict targeted TypeScript and ESLint: PASS for amended helper/tests.
- Full Next.js 16.3.8 **development** app + disposable PostgreSQL16 + Playwright WebKit mobile/desktop using fictional UUID-shaped members: normal and cookie-only same-account Reflect → `/maia/encounter` PASS; valid A cookie with B browser local identity → `/signin` PASS; uninvited, revoked and signed-out Reflect admission DENY; zero protected Practice API reads from Reflect.
- Earlier mismatched browser test using non-UUID fiction strings was **not a valid security witness** because legacy auth validation cleared those IDs. Subsequent harness required actual navigation away from Reflect and used distinct fictional UUID identities.
- The disposable service/DB was stopped; no client or member production data, paid-provider models, external mail, billing or production configuration were accessed.

## Remaining release gates
- An **independent human security reviewer** must adjudicate this exact amended commit. Kelly Nezat is assigned as founder human product/release reviewer, **not an independent author/operator security reviewer**.
- Full authenticated MAIA *conversation* and member memory/consent controls have not been proven; synthetic fixture omits unrelated MAIA service tables and produced expected 500/503.
- Fail-closed UI during asynchronous session reconciliation, true cross-account local preference isolation, old client versions, iOS Safari physical device and no-cache/CDN ingress still require adversarial acceptance.
- Full-project `tsc` was previously red for broad baseline issues; targeted checks do not supersede the whole-project gate.
- The actual deployed image digest/SHA and rollback on real ingress are unverified. Beta cohort identities/consent are not selected here.
- **No merge, release, beta flag, production writes or public invitation is authorized by this document.**

Release tracker: https://github.com/SoullabTech/Sovereign/issues/1816
