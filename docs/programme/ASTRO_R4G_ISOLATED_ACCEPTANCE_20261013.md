# ASTRO–R4G — Isolated Consent, Browser and Derived-Memory Correction

**Date:** October 13, 2026
**Standing:** ENGINEERING CANDIDATE · independent Class A HOLD · combined beta HOLD
**Source:** `/Volumes/T7 Shield/ProjectCache/soullab-r4g-consent-review-20261013/`
**Parent:** exact frozen R4F 120-file candidate, applied to `c220476355a34b16f6fa90a8e9f32c22878bd139`.

## Governing decision

Private calculation/display of one's chart does not authorize ordinary MAIA disclosure. A reviewed Send grants only that conversation, never automatic recall later. No external model transport or production deployment of chart-to-MAIA Send is permitted in R4G.

## What changed in this candidate

1. **Old Send bypass closed.** `ProAstrologyExperience.tsx` retains chart inquiry and private draft preparation but no longer mounts `OracleConversation` or offers the old unreceipted Send. The R4F issuance endpoint remains hard-disabled. This disables transfer entirely until a separately reviewed, server-consumed grant is integrated.
2. **Authenticated browser continuity.** The ordinary MAIA interface no longer reads legacy `maia_conversation_<session>` localStorage as authority. Only server-verified owner- and ordinary-scope history is admitted; revalidation occurs on focus/pageshow/visibility with stale-response cancellation. Newly written local cache keys are per member, and former local content is neither automatically replayed nor silently deleted. Inbound seeds wait for verified account admission.
3. **Member and session boundaries.** The generic history API refuses legacy Astrology and all R4F-protected session IDs; replies identify the verified member and ordinary scope. Both MAIA HTTP routes and `getMaiaResponse` refuse protected sessions before processing. The two HTTP routes reject an authenticated member ID conflicting with the body member claim. Main Between route scopes its session-history read to the effective authenticated member.
4. **Derived-memory custody.** Normal MAIA direct writers and the shared memory service refuse protected sessions. Proposed additive `source_exchange_id`, `source_session_id` and `origin_scope` ancestry for developmental, semantic-vector and breakthrough objects survive loss of the source turn. Ordinary-memory retrieval excludes known protected lineage. Historical NULL ancestry remains unknown, not recast as ordinary.
5. **R20 custody preserved.** Neither candidate migration, an erasure operation nor a backup job was applied to any real DB or vault; key or signer custody was not altered.

## Recorded verification

- **48/48 focused Jest tests, 11 suites: PASS.** They include inherited R4e/R4f checks, old Send refusal, browser owner separation, protected/ordinary session guard, fictional authenticated history API, known derivative exclusion, and source boundary assertions.
- **Scoped TypeScript check:** `tsc -p tsconfig.r4f-core.json` exit 0, zero output. This is NOT full-project TypeScript acceptance. A broader custom browser scope reported existing CSS-module/SpeechRecognition typing gaps and is not presented as passed.
- **Isolated Next.js 16.3.8 production build:** PASS. `BUILD_ID 4kO1ZtcWc5tNmsBzqA7Qq`; nonexistent fictional DB, preview/transport flags off, external API/provider keys unset. This does not evidence actual authenticated production traffic.
- **Networkless disposable PostgreSQL 16:** PASS. Fictional migration replay and protected-source ancestry filtering proved ordinary rows remain and protected derived rows stay suppressed even after fictional source turns and grant rows are removed. The container was destroyed. This is *not* deletion-safe restore certification under R20.

## Still-open safety work (blocking Class A and beta)

1. A final single server-authoritative R4F Send acceptor must bind authenticated subject, one-use grant, exact current-turn text/HMAC, actual server conversation and exchange ID, revocation/race recovery, persistent protected provenance, and client UI. **This has not been enabled.**
2. Historical untagged and NULL-ancestry records, other semantic memory/atoms/Member Web/voice/Writer Studio/Cabin channels, browser/account swap timing and older browser-restored material require complete human source inventory and authenticated two-account, two-tab and mobile Safari adversarial acceptance. New source filtering alone does not prove historical protection.
3. An alternate internal session reader (`lib/learning/enhanced-maia-service.ts`) still calls `getConversationHistory` without a member ID; the new session-history filter's member argument is optional. A different entry point could still require identity hardening. Do not certify universal cross-account safety.
4. Migrations require schema parity/rollback review and fail-closed behavior with feature gating. R20 separately requires independent deletion-key/ledger custody, complete historical SQL + Source vault recovery with no resurrection, and treatment of the new origin records.
5. DOCX parser and 12 dependency findings, full-project TypeScript, professional astronomy precision/licensing review, independent Class A privacy/security assessment and founder hash-bound restricted-cohort GO/NO-GO remain open.

**Disposition:** R4G bounded technical qualification PASS; independent acceptance HOLD; MAIA chart transfer HOLD; combined beta deployment HOLD. No canonical merge, production change, real member data, external model call, beta invitation or R20 installation.
