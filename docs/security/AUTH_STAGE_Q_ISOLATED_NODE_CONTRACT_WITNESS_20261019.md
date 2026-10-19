---
title: "Stage Q — independent isolated Node contract witness"
date: "2026-10-19"
status: "partial acceptance — source-pinned fictional unit tests"
authority: "read-only external verification; no production authority"
release: "HOLD"
---

# Stage Q — independent isolated Node contract witness

## Exact source under test

The isolated execution environment was a network-disabled, ephemeral test container, **not** the founder's Mac Studio and **not** Soullab staging or production. All tested code and test files were copied from `security/auth-stage-q-client-signout-review-20261018` and checked by `git hash-object` against GitHub blob SHAs before execution:

| Path | Verified Git blob SHA |
| --- | --- |
| `lib/auth/webSignOut.ts` | `1fe1f1dda2d78216415d0c24b5e4f81963bedaca` |
| `docs/security/auth-stage-q-client-signout.test.cjs` | `869ef7a8dbb56ee1011c2662aa694b262847d78a` |
| `app/api/members/signin/route.ts` | `0521131dfd0e797cb5f64ae9a6ffed052b98da7f` |
| `app/api/members/signout/route.ts` | `5ef39a974759dc5d4f60bf5bf2eea375c7e7451e` |
| `docs/security/auth-signout-session-failure-contract.test.cjs` | `6a16909d5e782ba216d32281494589e6e89a71c7` |

Node.js `v22.16.0` and TypeScript `v5.8.3` transpiled the real TypeScript route/helper modules. The test suites substituted explicitly fictional in-memory cookie/SQL/session dependencies. There were no network calls, actual PostgreSQL connections, member identities, tokens, or production environment variables.

## Observed dynamic results

1. **Stage Q server contract:** `node --test docs/security/auth-signout-session-failure-contract.test.cjs` returned **12 PASS, 0 FAIL**, exit 0. The executed tests cover simulated sign-in session insertion/cookie issuance failure, compensation refusal, invalid/absent web origin, 503 under synthetic SQL failure, duplicate/stale revocation outcomes, cookie/header equality and mismatch, and missing-cookie header-only sign-out.
2. **Stage Q client contract:** `node --test docs/security/auth-stage-q-client-signout.test.cjs` returned **14 PASS, 1 FAIL**. The sole failure was `ENOENT` for `app/maia/page.tsx`: the isolated fixture deliberately included the source-pinned module and test file but not the three full UI files needed for the test `UI wiring never treats raw successful fetch resolution as sign-out proof`. No other client assertion failed. Do **not** report this as 15/15 or as a complete executable UI test.

These are actual isolated test executions, but they are **not** real SQL outage/recovery witnesses, live browser tests, or independent source approval for release.

## Separate read-only GitHub source inspection for omitted UI wiring test

Current branch source was fetched directly from GitHub and inspected without patching:

| Path | GitHub blob SHA | Observed |
| --- | --- | --- |
| `app/maia/page.tsx` | `7603c702188ee556afe22f6c9aee6f70a3049937` | Calls `await signOutCurrentBrowserSession()`; shows `SignOutIncompleteDialog`; uses server cookie-clearing evidence before offering local exit; no legacy direct sign-out fetch |
| `app/studio/account/page.tsx` | `73125382cd0733387cb14382347f5e0cc9855d3d` | Same shared helper/dialog; button text `Sign out of this device`; no legacy direct sign-out fetch |
| `components/auth/UnifiedAuth.tsx` | `c1d553bf5f3ec776c2adc5c464250e5d86ad2c45` | `signOutUnconfirmed` branch and visible `role="alert"` warning |

This is source inspection. It is **not** a successful run of the missing executable UI-wiring test or an accessibility/browser acceptance.

## Boundary and release status

- Protected canonical, production, founder/member data, native clients, and current Mac Studio worktrees were not modified. A previous Mac Studio terminal retry had been blocked by tool safety checks; no retry or bypass was attempted on that device.
- The web-only helper still requires testing across actual Safari/WebKit cookie persistence, edge origin/Host forwarding, Set-Cookie expiration, multi-session replay, and actual isolated PostgreSQL insert/revoke/failure/recovery.
- Native `Origin:null`/WKWebView and Android Capacitor authority remain separately blocked.
- Independent security reviewer approval, whole-app release build, governed type-health, and explicit founder promotion remain required.
- **RELEASE HOLD.** Source-pinned fictional unit execution provides stronger evidence than source-only review but is not staging readiness.

**Disposition:** server unit suite **PASS 12/12**; client source-pinned runtime assertions **PASS 14, UI fixture incomplete 1**; static UI markers witnessed; all broader release gates **HOLD**.
