# LISTEN-08 — authenticated Next.js + disposable PostgreSQL acceptance

**October 24, 2026 · source-owner review only · PRODUCTION / MEMBER RELEASE HOLD**

## Purpose and containment

Move Listening Room beyond mock authentication and a file-origin React harness. Exercise **the actual `app/listen/page.tsx` server route and the original shared `lib/auth/session.ts`** in a genuine Next runtime with PostgreSQL session reads, without access to Soullab member data, production services, cookies, secrets or the protected application checkout.

- Host: founder's Mac Studio. Disposable folder on the external T7 Shield, `soullab-content/LISTEN08-FICTIONAL-NEXT-PG-20261024`; ~417 MB at final check. **No files from that folder were merged into the protected main checkout.**
- Next.js **16.3.8** (matches Soullab package dependency), React **19.2.0**, PostgreSQL **14.19**.
- Bound Next exclusively to **127.0.0.1:43277**. PostgreSQL ran in a **disposable data directory with Unix-domain socket only** (no TCP network listener) on port identifier 43319.
- The minimal test shell had the genuine `/listen` route, genuine ListenRoom/LocalAudioDesk/PrivateBackupDesk and rights/portability modules, genuine shared session resolver, **test-only `lib/db/postgres.ts` adapter** restricted to `SELECT member_id FROM auth_sessions`. An isolated real PostgreSQL table held **five entirely fictional sessions** (two same-member tokens, one second member, a revoked credential, an expired credential).
- No real Soullab app layout, central `proxy.ts`/access matrix, mobile guard, profiles, entitlement, source vault, encrypted cloud storage, recovery, licensed commercial music or real member sessions.
- Original review source pinned before this work: **`028b50210a2c61fc212b90146835a93cd2280161`**. Protected `lib/auth/session.ts` SHA256 `6e37552f56410dd1e045d570d93b0421aa29a62bf79024b947fc4ac7ee7a20d4`. Original Listening Room `page.tsx` SHA256 `a7f3fef62cdffdd0aa449faad37a5e9c7149935cb65d58f5f3d7ed58c61e70b0`.

## Original shared authentication: real HTTP release-blocking behavior

With the shared source **unmodified**, enabling the Listening Room review flag produced:

| Fictional request | Actual HTTP response | Required |
|---|---|---|
| Valid cookie A | 200 room | Admit |
| Valid header B | 200 room | Admit |
| Cookie A plus valid header token belonging to A | 200 room | Admit |
| Cookie A plus valid header B from another member | **200 room** | **Deny** |
| Revoked cookie plus valid header B | **200 room** | **Deny** |
| Cookie A plus revoked header | **200 room** | **Deny** |
| Anonymous, expired-only | 500 | Non-500, non-content refusal |

**Verdict: authentic Next + PostgreSQL reproduction of a Class A authorization defect.** The Listening Room must not silently replace first-valid credential semantics with its own local middleware. The shared authentication owner [#1877](https://github.com/SoullabTech/Sovereign/issues/1877) owns the correction.

## Bounded, disposable correction — NOT merged into shared source

In **test copy only**, the previously proposed shared function was inserted after verifying the exact original source hash. Whenever both Cookie and `x-session-token` are *present*, both must be nonempty, independently validate to current unrevoked/unexpired sessions and identify the **same member**; otherwise refuse. A single valid Cookie or single valid header remains supported. Database failure cannot admit.

- Disposable shared-auth candidate SHA256: **`ad8c18c8bea89823b72b53f8eef304b01a21bc97ebc3d44610881802abc20728`**. **This version is not in protected source or this Listening Room review branch.** It is a scoped integration proof for the existing platform owner.
- The independent Listening Room route was amended to catch only `AUTH_REQUIRED` and issue **HTTP 307** to `/signin?next=%2Flisten` (rather than returning 500 for ordinary unauthenticated visitors); all other errors are rethrown. Review branch `app/listen/page.tsx` now matches the tested file **byte-for-byte**, SHA256 **`b7d6661f2ce0ce2062218b50117bd641da3779542ab89cc83fbf59addabd703f`**.

## Executed acceptance on real local runtime

- **13/13 HTTP admission scenarios PASS** against Next + actual disposable PostgreSQL after the test-only shared auth correction: anonymous redirect, single cookie, single header, identical dual tokens, distinct valid same-member tokens, cross-member dual refusal, revoked/expired/empty credential refusal.
- **10/10 actual Chrome + Next UI checks PASS**, using separate fictional browser contexts for member A, member B, anonymous, and conflicting-member scenarios. Includes React hydration, playlist add, tracking-query stripping, journaling, cookie-only navigation, header-only navigation, anonymous redirect, conflict refusal, zero external requests and zero page errors. Using two Chrome tabs in one browser context shares cookies by design; separate profiles were necessary to prove *header-only* navigation.
- Real PostgreSQL revocation: revoke fictional B session → **307 deny** for B while unrelated A remains **200**; restoring fictional B later does not create hidden membership.
- Isolated database stopped during authenticated HTTP request → **500 but no Listening Room content**, i.e. **fail closed**. After restarting the disposable database, correctly authenticated A returns **200** again. HTTP 500 on infrastructure failure is not a complete user-facing error experience.
- After restarting the server with `SOULLAB_LISTEN_REVIEW_ENABLED=0`, **3/3 checks PASS**: anonymous, valid cookie and valid header all received **HTTP 404**, no Listening Room content.
- Regression in source review: corrected route mocked tests **4/4**, rights/encryption/portable playlist tests **35/35**, source and structure tests **25/25** PASS.
- Reproducible **read-only** gate script added: [`tests/listening/listen08_http_gate_witness.cjs`](../tests/listening/listen08_http_gate_witness.cjs), explicitly requires `LISTEN08_GATE_MODE=secured` or `disabled`, and hard-codes loopback URL only. That script itself was read back from GitHub and rerun: **13/13 secured and 3/3 disabled**.

## Corrected route source

The only behavior changed in the Listening Room review branch for this gate was **proper sign-in redirection for `AUTH_REQUIRED`**, preserving the existing disabled-by-default route, metadata `robots: noindex`, and server member requirement. The mock auth source tests now assert database exceptions are **not** transformed into authorization success or ordinary sign-in redirects.

## Nonwaivable remaining gates

1. Existing **shared platform source owner** independently reconciles, accepts and implements the cookie/header same-member correction, including real platform strict proxy, profile reads/writes, native header transport and Cabin trust separation. The test-only patch does not qualify as deployed security.
2. Join Listening Room inside the **full current Soullab Next application and actual schema**, not just this minimal fixture; verify `MobileRouteGuard` and real navigation, iPhone Safari, tab/member switching, accessibility/VoiceOver, audio-focus and multi-hour background listening.
3. Encrypted **member-owned account** storage must pass isolation, consent, deletion and independent restore anti-resurrection. Manual AES-GCM portable exports are not that service.
4. Independently verified music rights (master/composition/samples, territory, use and revocation), a secure media signer, licensed original long-form masters, meaningful output-quality testing, and separate commercial partner terms before provider streaming.
5. Independent privacy/security/recovery review, source-owner integration authorization and a **separate founder GO** for any actual tester or production exposure.

## Cleanup

Disposable Next servers and PostgreSQL were stopped after testing; local test port **43277 had no listener**, the isolated PostgreSQL socket was absent, and the protected Mac Studio application checkout remained unchanged (existing unrelated working-tree changes untouched). Source and fictional evidence remain inside the external-drive disposable folder for independent inspection. No PR or deploy, real account, live schema, media service, partner contract or licensing expenditure was touched.

**Disposition: isolated Next/real-PG admission corrected and witnessed; protected auth remediation not yet admitted; production/member activation HOLD.**
