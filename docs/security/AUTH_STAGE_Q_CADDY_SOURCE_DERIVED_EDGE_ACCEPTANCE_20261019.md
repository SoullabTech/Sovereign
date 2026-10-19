---
title: "Stage Q — source-derived Caddy edge, compiled Next16, WebKit and PostgreSQL acceptance"
date: "2026-10-19"
status: "isolated executable PASS — release HOLD"
authority: "bounded fictional security CI evidence"
release: "HOLD"
---

# Stage Q — Source-derived real Caddy acceptance

## Exact source and runner

- Review branch: `security/auth-stage-q-caddy-replay-20261019`; draft PR [#1876](https://github.com/SoullabTech/Sovereign/pull/1876).
- **Tested candidate commit:** `107038aab882db575da9dc138f120fa04f9e9480`.
- **GitHub Actions:** `Stage Q Caddy Edge Replay (NO DEPLOY)`, run `39276088531`, job `118141700351`: dedicated acceptance step **SUCCESS**, five tests, **5 PASSED, 0 FAILED**, plus verified owned-fixture cleanup.
- **Disposable Next16 build ID:** `ukwdnOka1FmNf5Gu6ZnT7`.
- **Actual Caddy binary:** Docker official `caddy:2.10.2-alpine`; image manifest digest from CI pull `sha256:4c6e91c6ed0e2fa03efd5b44747b625fec79bc9cd06ac5235a779726618e530d`; image ID `sha256:aac61abc4024c323602ccb9ee38bd68b147601f518626b2a055e06944e01c510`.
- **Reviewed Caddyfile Git blob:** `9cffaa85d5b42a05cd1de7eb0726d8435b3e5b69`, left unmodified.
- **Test-code blobs:** derivative builder `4f9cbffdb9b8c3d5815541c5f8fcb8d95a414653`; executable browser test `f99504fcdcd1192c9c8f071a7b2d677914913932`.
- **Other reviewed source blobs:** `proxy.ts` `0c9f42abc46bd55e67b1857d4864e0a42574d2e6`; sign-out route `5ef39a974759dc5d4f60bf5bf2eea375c7e7451e`.

## What ran, without production connections

The fixture extracted the **unchanged** `deny_disabled_routes` snippet and real `soullab.life` apex site block from the reviewed production-source Caddyfile, rather than replacing it with generic proxy rules. It required exactly five **active** reverse-proxy and `header_up Host {host}` directives plus one additional intentionally commented-out admin example. It retained the compensating disabled-route policy and both credentialed `Origin:null` CORS declarations.

Explicit, recorded substitutions were limited to the fictional domain `stageq-next16.invalid`, loopback-only port 443, five Next upstream addresses replaced with `127.0.0.1:3829`, an ephemeral local TLS certificate, disabling automatic redirects/ACME, and replacing the production access-log file destination with no fixture access-log sink. No canonical Caddyfile was rewritten.

The runner compiled the existing reduced Next.js 16 strict-proxy fixture with unchanged source modules, started a disposable PostgreSQL 14 database with only synthetic members and the canonical auth-sessions migration, generated an ephemeral self-signed certificate and launched **real Caddy** (Docker, loopback only) followed by **Playwright WebKit on Linux**. No real Soullab hostname, live account, secret, database, Apple Safari, production Caddy process or staging service was involved.

## Five browser/SQL edge acceptance results — PASS

1. **Source-derived Caddy routing:** browser reached the fictional apex and received the preserved `X-MAIA-Origin: caddy-sovereign` response marker. The emergency-disabled `/api/members/migrate-data` operation returned 403 from the edge. An unmapped member endpoint remained 404 under strict Next access rules.
2. **Exact Host/Origin/Secure cookie and replay:** a real WebKit browser received and protected Secure/HttpOnly `maia_session`, entered a server-authorized protected room, then received successful SQL-backed sign-out, actual cookie expiration, and denial of old-token replay through Caddy.
3. **Preflight versus actual authority:** Caddy's existing `Origin:null` OPTIONS preflight returned 204 with `Access-Control-Allow-Origin:null`; the actual Stage Q sign-out POST refused missing/null/foreign Origin and cross-site metadata with 403. An attacker-supplied forwarded Host did not create authority. Preflight acceptance was **not** counted as mutation authorization.
4. **Two independent session transports:** a simultaneous conflicting cookie/header request returned 409, leaving both SQL sessions active. Sequential cookie-only and header-only WebKit requests then revoked those two sessions independently.
5. **SQL partial-failure honesty:** a disposable SQL trigger blocked revocation, producing HTTP 503, `localCookiesCleared:true`, `serverSessionRevoked:false` and actual browser cookie expiration, while the bearer remained unrevoked. After removing the fixture trigger, a header-token retry completed durable revocation.

The job log recorded `# tests 5`, `# pass 5`, `# fail 0`. The labeled fixture Caddy container, TLS files, reduced Next app and disposable PostgreSQL service were removed at completion.

## Failed attempts and corrections — do not erase history

- The first try compiled Next but the Caddy derivative refused because it counted **six textual** reverse-proxy declarations rather than five **active** declarations; the sixth occurs in a deliberately commented-out administrator example. No Caddy browser test ran. The parser was corrected to preserve commented example bytes and count only active directives, refusing future source drift.
- The second try derived Caddy successfully but a truncated expected Git blob SHA in the browser test triggered a custody refusal before Caddy launch. The test's exact expected blob was corrected to the 40-character hash above; fail-closed comparison and safe mismatch diagnostics remain. Neither first nor second attempt supplies a security PASS.
- The third exact candidate `107038aab882db575da9dc138f120fa04f9e9480` produced the actual Caddy/WebKit/PostgreSQL 5/5 PASS. Production configuration was not modified as a workaround.

## Remaining boundaries

- **This is a source-derived Caddy site, not the deployed Caddy process.** It changes the site hostname, loopback/TLS material, upstream addresses and access-log target. Production current loaded configuration, public certificate chain, hosting/CDN forwarding and actual staging beta domains remain unverified.
- **Linux Playwright WebKit is not Apple Safari**; macOS/iOS Safari, native Capacitor, trusted real staging TLS and the full `UnifiedAuth`/MAIA/Studio UI flows remain separate gate requirements.
- The Next.js application was a compiled **reduced fictional fixture**, not the complete production Soullab application. The combined full-source TypeScript no-regression gate previously passed on candidate `0ff7e2b4765cdf3402324843f5074efb5977defa`, not an all-product build for this Caddy test.
- A real SQL-triggered write failure/recovery is not a real database server crash/restart or encrypted backup recovery.
- **Source-derived CORS caution:** `Origin:null` CORS support at the edge is broader than sign-out. Stage Q explicitly refuses the actual sign-out mutation; other API families require their own independent review. No new null-origin exceptions were added.
- No independent human security reviewer has accepted the combined changes. No founder promotion authorization, protected merge, staging deployment, or real member admission has occurred.

**Disposition: disposable real Caddy + strict Next16 + HTTPS WebKit + SQL PASS 5/5. Staging/live Apple Safari and independent release security gates OPEN. All production and member-beta changes HOLD.**
