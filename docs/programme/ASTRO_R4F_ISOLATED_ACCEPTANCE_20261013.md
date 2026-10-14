# ASTRO-R4F — Cross-conversation chart passage privacy

**Date:** October 13, 2026
**Artifact:** isolated source candidate, never merged or deployed
**Founder governing distinction:** permission to Send an exact chart passage once does NOT authorize later recall in another conversation.

## What the source now contains

- A proposed PostgreSQL `astro_maia_transfer_grants` origin table, storing only member/session ID, token hash, keyed passage HMAC, one-use status, expiry and revocation. **No natal record or member-authored passage is stored by the grant table.**
- Cryptographically random one-time token and conversation ID; exact-text, member identity, current `astrology_consent`, expiry and one-use verification.
- A separately configured, 32-byte-minimum `ASTRO_R4F_PASSAGE_HMAC_KEY` is required. There is **no** weak default or unkeyed digest fallback. Custody/rotation remain unapproved.
- A server-only protected `TurnsStore.addR4fProtectedTurn` writer which checks the consumed grant and present consent in the same SQL statement and marks provenance `conversation_only`. The ordinary writers refuse protected-session origins.
- Basic cross-session exclusion in `memoryLoaders`, `MemoryBundle`, `TurnsStore.getRecentTurns`, `relational-field-shadow`, and the generic conversation-turns GET route. Generic conversation-turns POST rejects protected sessions, rather than taking a client authority flag.
- Entire protected grant capability is intentionally **inert**: `R4F_MAIA_SEND_ACTIVATION_APPROVED = false`. The new issuance endpoint refuses requests, and no member-visible Astro Pro Send or MAIA processing route consumes it.

## Checks run in this source lane

- Jest: **27/27** across 5 suites (R4F pure policy, mocked server grant custody, non-bypass source assertions, existing relational-field assembler, R4e boundary).
- TypeScript: `tsc -p tsconfig.r4f-core.json` **exit 0**, zero diagnostics. This is scoped and not a full-project TypeScript PASS.
- Disposable PostgreSQL 16 fixture, network disabled, no storage mounts or real data: created three fictional accounts, granted/revoked fictional passages, proved ordinary recall remains available (2 original rows) while protected/revoked passages were suppressed (3 protected rows). Wrong token/member/text, replay and one-use transitions refused. The fixture container was stopped and removed.
- No real database migration, model request, API-key call, billing, tester email, production patch, or member-data read.
- Frozen R4e source remains a separate candidate.

## Release-critical gaps — ALL MUST remain HOLD

1. **Wiring and origin binding.** No approved MAIA accepting-route integration yet. Actual Send must consume server grant *before* prompt/model/persistence, mint a fresh conversation identity, and govern all subsequent turns. One client Boolean or session ID alone is insufficient.
2. **Browser and session continuity.** Astro Pro currently uses a stable per-member session ID and generic `OracleConversation` restores localStorage/PostgreSQL history. New code does not close/reconcile that UI, cookie/session behavior, cross-tab account swaps or browser history. Do not claim later visits are safely isolated.
3. **Derivative memory and other readers.** The enumerated direct SQL readers are not the full memory graph: developmental and semantic memories, summaries/atoms/embeddings, voice, Writer's Studio, Member Web, Cabin/offline and historical untagged data require an independently enumerated deny-before-prompt/deny-before-provider policy. Unknown ancestry must fail closed in affected scopes, without suppressing unrelated continuity by default.
4. **Retention and erasure.** The grant registry is currently in ordinary PostgreSQL and has a RESTRICT member FK. Independent R20 review must settle completed deletion, backup restore, origin retention, member erasure, and off-host independent authorities; do not install this migration in production now.
5. **Security and privacy controls.** Key custody/rotation, replay races and crash recovery, rate controls, complete authorization trace, no sensitive content in logs and model transport, real Chrome/Safari/iOS authenticated tests, and independent human Class A source review remain open.
6. **Broader beta.** DOCX and 12 dependency findings, professional astronomy, full-project typecheck, HTTP not-found status and final staging/rollback/allowlist authorization remain independent release holds.

## Release disposition

**R4F isolated authorization/storage/retrieval foundations: bounded engineering PASS.**
**R4F complete end-to-end sharing/recall acceptance: HOLD.**
**Soullab combined restricted beta: HOLD.**

No code in this document authorizes enabling the R4F route, loading protected text into MAIA, running a migration on an existing database, or merging into the canonical branch. Exact source patch and hashes are maintained separately in the review packet.
