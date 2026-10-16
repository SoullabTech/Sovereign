# Writer’s Studio R17 — main-host, real-session HELD preflight

**Date:** October 16, 2026. **Classification:** isolated source candidate only.
**Parent:** R16 `1c601c793451c208e5b6a45f56ce63c037a25403`.

## Why this slice

The five-person beta is intended to live on `soullab.life`, rather than asking members to sign into a separate fictional beta hostname. The R16 encrypted-pair adapter accepted a structurally asserted `server_verified_member_session` identity supplied by a caller, but nothing in R16 derived that value from a verified live session.

## What was added

`lib/writersStudio/recovery/heldWriterSessionReviewR17.ts` adds an **inactive, read-only authorization preflight** for a prospective held-only encrypted writing service. It reuses the actual `getMemberIdFromRequest` auth_sessions-backed verifier and existing `writersStudioBetaAccess` server authority (active beta-tester contact, exact protected member allowlist, latest accepted notice). It requires:

- Two explicit opt-in runtime flags; missing flags return 404.
- Exact HTTPS `soullab.life` URL and matching Host, no alternate origin/tunnel/host aliases.
- Exact proposed service path; no arbitrary query identity.
- GET or POST only, with matching Origin required for POST.
- Verified member session, and **active_beta_tester** basis. A founder/CTO witness role alone is insufficient for private writer writes.
- Fail-closed refusal on missing, revoked/expired, non-admitted or unavailable session/consent authority.

It returns a typed **held-only preflight subject** after those conditions. It does **not** create an API endpoint, process data, mint keys, or call the existing R16 storage adapter. Compile-time `R17_REAL_WRITER_SERVICE_ENABLED = false` stays in effect. No sensitive data or test credentials in source.

## Verification

- R17 focused identity/origin tests: 11/11 pass.
- Carried-forward R9–R16+R17 selected regression: **33 suites, 410 tests PASS** on the Mac Studio.
- `tsc -p tsconfig.r17-session-review.json --pretty false`: PASS.
- Tests ran against mocks, not actual `soullab.life` authenticated member accounts. No production, real database, custody key, SMTP, provider or real manuscripts touched.
- Full production Next build, actual integrated browser journey, PG16 release-equivalent backup and rollback **NOT run**. An existing unrelated duplicate-package Jest haste warning remains.

## Explicitly still HOLD

A review preflight is not an unforgeable signer or release entitlement: the R16 storage subject remains structural, and the verifier is not wired into an active route. App-level consent must be founder-approved, scoped to the specific member and current version; original Source + ordinary SQL drafts/revisions still need comprehensive encrypted-custody migration, independent trusted antirollback/key destruction, release-equivalent PG16 verification and old-image rollback. Main-host Caddy switch and existing Soullab auth database remain untouched. Build host free disk space remains below the 60 GiB release gate; do not prune backups, source volumes or protected previous image. Approved mail transport and real Safari member acceptance are separately required.

**Decision:** isolated R17 source/test PASS; real-member admission and deployed production = HOLD. No claim of exact-source founder release GO or image publication.
