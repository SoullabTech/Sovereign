# ASTRO-R4H — MAIA Secondary Memory, Historical Origin and Voice Boundaries

**Date:** October 13, 2026
**Status:** Isolated source-candidate engineering validation; Class A and beta HOLD
**Parent:** R4G exact frozen 137-file source patch on local Mac Studio; no production merge.

## Ruling retained

Private chart calculation never grants conversation transfer. An authorized one-time Send would grant only the exact authenticated conversation and must not confer automatic later recall. R4F's grant issuance and MAIA chart Send remain **hard OFF**. Ordinary MAIA dialogue with unrelated, provably authorized memories should remain usable.

## Source corrections

1. **Secondary MAIA learning authority.** `getEnhancedMaiaResponse` now requires a validated, non-expired, non-revoked cookie-backed member session before turn count, memory history, providers or durable writing. Caller-supplied IDs are rejected when they disagree. The real member is passed to `getConversationHistory(sessionId, 10, verifiedMemberId)`. Without validated request context the service refuses instead of treating a session ID as a member identity.
2. **DEEP consultation isolation.** `DeepPathOrchestrator` checks the authenticated member and protected-origin guard before routing to Claude/local models. Its conversation context is rebuilt solely from server-filtered authorized turns; client-supplied history and unverified symbolic analysis are discarded. Its direct JSONL learning writer was removed.
3. **No automatic training transfer.** Learning orchestrator training writes, teacher-feedback requests, legacy training-example reads, and corpus-stat loads are governed by a hard OFF constant. Default `collectTrainingData` changed to false. An internal caller opting in cannot bypass the hard hold. Ordinary model generation can continue where otherwise authorized; no claim of vendor/provider transport consent is inferred.
4. **Voice persistence.** Authenticated voice transcript writes refuse the actual cookie/session and stale client-claimed chart session ID before session creation, turn writing, and content persistence. Ordinary authorized voice turns remain permitted.
5. **Historical unknown ancestry.** Developmental, vector and breakthrough memories must have durable `origin_scope='ordinary'` and `source_session_id`. Historical unknown and missing-lineage rows are withheld from those prompt recall channels but not deleted or reclassified. Direct ordinary conversation-turn retrieval remains. A separate add-only source schema and admission policy allows future review/recovery.
6. **Member theme signals.** Additive `origin_scope` migration preserves old rows as `unknown`; new forward signals are marked ordinary only in the reviewed ordinary conversation write path and fail closed on known protected/legacy source IDs. Primary theme readers exclude unknown and known protected sessions.

## Risk limits that remain

- These changes are not a certified complete graph closure. **Historical old chart passages may exist** in sessions whose origin was never identified, local caches, Member Web, semantic atoms, Writer Studio, voice-derived summaries, Cabinet/offline, embeddings and backups. Regex-based retroclassification is not accepted as proof.
- The conservative historical hold can reduce visible old developmental/theme continuity until independently governed lineage classification and member-facing disclosure. It **does not delete stored material**. A human reviewer should judge this product and privacy consequence.
- A proper R4F server-consuming one-time grant, authenticated same-session continuation, durable derived provenance end-to-end, and revocation/race/crash behaviors remain unintegrated. Do not reconnect chart Send.
- Actual authenticated physical device tests (Chrome/Safari iPhone, two accounts/tabs, stale browser promises, model-provider negative traces), complete selected-schema migration replay, R20 independent deleted-work non-resurrection, and human Class A review remain release holds.
- Twelve dependency advisories, DOCX parser isolation, the full-project TypeScript baseline, professional astronomy precision/licensing and final exact-artifact founder restricted beta authorization remain open.

## Testing and custody

The evidence packet must carry actual logs, exact source hashes, and build/PG16 receipts. Until verified these are not claimed complete. All runtime tests use fictional data, disposable networkless PostgreSQL and no model keys. Do not install migrations or run cleanup on any production SQL, Source vault, NAS, Mac Studio archive, Lacie or Lexar backups.

**Disposition: R4H implementation source in isolated candidate, independently approved deployment NOT AUTHORIZED.**
