---
title: "Stage Q + PR1870 — source-pinned Class A / Caddy / Next16 / WebKit / PostgreSQL witness"
date: "2026-10-19"
status: "isolated full-edge simulated-member PASS; production HOLD"
authority: "executable security CI evidence, not release authorization"
---

# Stage Q × PR #1870 — Caddy / Next16 / WebKit integration acceptance

## Exact source and scope

- **Tested commit:** `eae5c6fc2d8cb879833e9579b967fdf9d2ebe0c2`
- **GitHub Actions:** `Stage Q Class A Caddy/Next16/WebKit (NO DEPLOY)`, run `39293113645`, job `118198968165`. Dedicated job **completed SUCCESS**.
- **Draft review PR:** [#1882](https://github.com/SoullabTech/Sovereign/pull/1882), based only on the already-isolated combined Class A browser-UI review PR #1881, **not** protected canonical.
- **Compiled disposable Next16 fixture build ID:** `qFTWL5zezAtJjtXGJYaxx`. The job copied nine real source files into the ephemeral reduced application; no production runtime code was changed.
- **Caddy configuration source blob:** `9cffaa85d5b42a05cd1de7eb0726d8435b3e5b69`. The fixture derived the real apex Caddy site and emergency-deny snippet with only documented fictional-host, loopback upstream, temporary TLS, log-sink and ACME differences.

**Source-matched security modules:**

| Source | Exact Git blob |
| --- | --- |
| `lib/auth/verifiedAccess.ts` (PR #1870 dual-credential authority) | `6a0821fedf2e921d2d7e7091cdb73da11d197296` |
| `app/api/members/signin/route.ts` (PR #1870 source; fixture does **not** exercise this handler) | `4ea14beb385e83320cf6e586f990784fe47aacd8` |
| `app/api/members/signout/route.ts` (Stage Q) | `5ef39a974759dc5d4f60bf5bf2eea375c7e7451e` |
| `config/accessMatrix.ts` (Class A with exact Stage Q signout rule) | `a93c5d3d382037a68828ee5a7423106a03adad2f` |
| `lib/auth/webSignOut.ts` (client source, tested separately) | `1fe1f1dda2d78216415d0c24b5e4f81963bedaca` |
| `proxy.ts` | `0c9f42abc46bd55e67b1857d4864e0a42574d2e6` |
| `Caddyfile` | `9cffaa85d5b42a05cd1de7eb0726d8435b3e5b69` |

**Test and runner artifacts:**
- Next16 reduced fixture builder: `334bb71b861d1f3fbb29cfcdcc47cf2fdd435f41`
- Pinned Caddy source derivation: `4f9cbffdb9b8c3d5815541c5f8fcb8d95a414653`
- Nine-case browser/SQL suite: `927e4cc112f3e6d5aac4807266c662500b0e03f0`
- This review's no-deploy workflow: `66ed5d11ed21b41d66014488c8515c9c7b7d65b7`

## Verified CI results on this one SHA

| Gate | Result | Notes |
| --- | --- | --- |
| MAIA/Studio client helper and source wiring | **15/15 PASS** | Executes actual TypeScript client helper; UI markup/wiring source checks, **not rendered UI acceptance** |
| Class A/Stage Q dual-credential simulated contracts | **9/9 PASS** | In-memory session and cookie dependencies |
| **Actual Caddy → Next16 strict proxy → Linux WebKit HTTPS → PostgreSQL 14** | **9/9 PASS** | Genuine compiled Next.js and browser/SQL, test-only sign-in |
| Governed whole-repository `npm run typecheck` | **PASS** | 4,722 program files; 222 diagnostics against existing baseline 239; baseline unchanged |
| Reduced Next.js 16 build | **PASS** | Fixture BUILD_ID `qFTWL5zezAtJjtXGJYaxx` |
| Post-job owned fixture cleanup | **PASS** | Labeled Caddy, ephemeral Next and PostgreSQL services/fixtures disposed |

**Total source/integration cases:** **33 tests, 33 passed, 0 failed.** Test logs were inspected, not inferred from a green workflow badge.

Nine browser tests actually checked the following boundaries:

1. Caddy's original emergency-disabled route remains HTTP 403 and an unmapped strict-access member route remains inaccessible.
2. Secure/HttpOnly session cookie survives genuine WebKit browser handling and expires after SQL-backed signout; old bearer replay is denied.
3. `Origin:null` CORS preflight does **not** authorize actual signout; missing/null/foreign Origin and forged forwarded host are refused.
4. Two different same-member sessions may be revoked via separate cookie/header requests; conflicting signout credentials return 409.
5. An injected SQL revocation failure yields HTTP 503 plus true local cookie expiration without falsely claiming durable revocation, followed by recovered successful revocation.
6. **New PR #1870 credential resolver:** stale/revoked cookie with a separate valid same-member header still grants the correct SQL-backed member identity, then cookie/no-op and header revocations complete separately; replay is denied.
7. Two valid **different-member** credentials in cookie/header fail closed before the protected Next page, and a simultaneous signout refuses with 409 and no revocation.
8. Two valid **same-member** credentials can authorize the protected page, but the signout endpoint still refuses simultaneous differing tokens and requires separate revocation.
9. Exact repo hashes of PR #1870 and Stage Q source modules and Caddy/proxy were independently checked by the test, refusing drift.

## What this does **not** prove

- **Not a full Soullab deployed application.** The compiled Next16 app is an intentionally **reduced fictional fixture** and its sign-in endpoint is **not PR #1870's actual sign-in handler**. Full `UnifiedAuth`, MAIA, Studio and Reflect rendered browser behavior, login issuance compensation and accessibility remain to be exercised independently. The 15 client tests prove source-level wiring and typed failure handling, not completed end-user workflows.
- **Not Apple Safari or native iOS/Android.** The browser is Playwright Linux WebKit using an ephemeral self-signed certificate with an explicit local test trust exception. Mac Safari and WKWebView permission/transport tests are not completed.
- **Not the real deployed Caddy, certificate chain or staging.** The CI uses a source-derived Caddy 2.10.2 site with fictional domain and localhost upstream, not current production routing, hosting/CDN, or a public TLS certificate.
- **Staging configuration is currently unsuitable.** Repository `Caddyfile.staging` is HTTP-only port 8090 and `docker-compose.staging.yml` describes shared production PostgreSQL infrastructure. It must **not** be used for destructive authentication fault injection.
- **No full Docker image/runtime attestation or comprehensive privacy/deletion recovery certification.** Prior genuine PostgreSQL process SIGKILL/restart acceptance used Stage Q's older resolver; the new combined-resolver process-crash and encrypted-backup/recovery gates remain independently scoping questions.
- **No Class A release approval.** The canonical Mentor Covenant permits express Founder-Steward sole approval during the limited single-steward beta phase, but this evidence **does not constitute that approval**, independent runtime attestation, or permission to merge/promote.

## Final disposition

**Isolated combined Class A/Caddy/Next16/WebKit/SQL integration: PASS 9/9.**
**Same-SHA UI/helper, Class A fictional tests and whole-source TypeScript: PASS.**

**Protected canonical merge, staging promotion, native release, real member cohort and production: HOLD.** Do not mistake source-pinned fixture evidence for a production-shaped, founder-authorized release.
