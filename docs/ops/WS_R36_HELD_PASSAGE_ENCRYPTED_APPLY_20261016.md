# Soullab Writer's Studio R36 — Passage-level author agency to encrypted history (HELD)

**Date:** October 16, 2026. **Source:** child of clean R35 `dd29dc543d5e640aede3eac0383deae569e02564`. **Scope:** five individually approved writers intended for `soullab.life`; no actual beta admission, deployment or real provider grant.

**Decision:** Isolated passage-selection and fictional author-Apply → encrypted R33 save/Undo source PASS. **Browser, real author authorization, multi-section and production release HOLD.**

## What was built

`lib/writersStudio/recovery/heldPassageApplyR36.ts` is a new source-only, non-routed, `R36_REAL_PASSAGE_APPLY_ENABLED=false` compatibility candidate. Its only test path requires exact `R36_PASSAGE_REVIEW_FIXTURE=fictional-only` and underlying R33/R23 fictional gates.

- Accepts a **section-owned, codepoint-offset** passage anchor, matching the existing Rebuild editor's `onSelectPassage(start,end,selectedText)` representation. Unlike UTF-16 textarea offsets, a codepoint position accounts for emoji/surrogate pairs. Section UUID, entire current section SHA-256, selected exact text, expected draft generation and SHA-256 are all checked, so stale or wrong text cannot be silently replaced.
- Accepts exactly **two to four** individually identified, nonempty alternative wordings (each distinctly `maia` or `member`). No auto-ranking, no automatic application, no external provider call or claim the proposed text is authentic MAIA output. A fictional chosen ID must exist. The returned review includes before/after text and deterministic word-and-whitespace LCS diff showing unchanged, removed and added fragments. Diff limits are bounded; longer selections use exact removed/added blocks rather than a guessed word diff.
- Synthesizes the **narrowest exact replacement** within the selected section, preserving every character outside the selected codepoint range. A second same-text no-op is refused. It is not allowed to infer another chapter or section boundary.
- Fictional `applyReviewedPassageR36` verifies a synthetic author-gesture match to section, selected alternative, expected generation, original draft hash and original selected passage hash, then **rereads the current encrypted R33 generation** before calling the previously qualified `applyAuthorApprovedR33`. An intervening edit refuses the operation. R33 persists an immutable AES-GCM file-vault version with PostgreSQL owner/version and prior cipher digest, preserving precise Undo.
- **Explicit limitation:** the gesture object and `fictionalSingleSectionWork=true` are caller-supplied fixture assertions, **not unforgeable user identity, real browser click proof or server-verified authorization**. A production route MUST mint author authority after actual R17/R29 session, invitation, accepted notice, version, chosen-member response and external key/commit fence validation. The bridge **refuses** multi-section Works rather than silently flattening them. R34's idempotency/checkpoint/frozen-section HTTP adapter remains `canWrite=false` and is NOT plugged into this fixture.

## Verification

- R36 focused source tests: **13/13 PASS**; includes exact selection, out-of-bounds, wrong selection/text hash, duplicate/too many/fewer than two alternatives, unknown ID, changed-word before/after roundtrip, emoji codepoint positions, forged gesture refusal, multi-section refusal, stale server draft refusal, chosen MAIA/member proposal distinction, and guarded R33 bridge composition.
- Inherited R35/R36 selected Writer's Studio security/session/consent/Source/original revision/Apply-Undo/Draft-route parity regression: **57 suites, 618/618 tests PASS**.
- Strict TypeScript `tsconfig.r36-passage-bridge.json` and physical `tsconfig.r36-physical.json`: PASS.
- Actual repository **PostgreSQL 16.13, immutable file vault, fictional key/signers**, synthetic writer and R33 history: `scripts/ops/wsBetaR36PG16PassageApply.ts` **29 physical checks and 13 negative-control classes PASS**. Selected passage applies as one R33 encrypted version; Undo appends a subsequent version and exact text reopens. Signed deletion-checkpoint and owner/refusal checks remain in R23. Concurrent save yields one winner, ciphertext tampering/direct SQL deletion refuse, and full synthetic PostgreSQL dump/vault blob lack author prose.
- After disposable PG16 SIGKILL/restart, a **fresh Node child process** rereads the exact Undo text from the historical file vault using fictional test keys supplied privately over local IPC. All PG16 containers/anonymous volumes and temporary vaults removed on success. The earlier R33 fresh-child code is reused unchanged.
- R36 additionally copies the earlier R33 PG16 runner into a **separate R36-named fixture and receipt**. It does **not** claim a live Next/Safari connection, a full multi-section editor or real MAIA inference.

## Production blockers retained

1. No production route is wired, and real R36 author-click proof cannot be represented by a client-supplied boolean/JSON structure. Browser UI location and consent/author intent still need independently minted server-scoped action context.
2. The true Writer's Studio is **multi-section**, sometimes containing whole-manuscript Source, frozen server-owned section UUIDs/partition, checkpoint counts, historical revisions and exact idempotency replay. R36 operates only on a synthetic single-section Work; it must not replace or flatten the real manuscript. R34's route-compatibility HOLD explicitly remains in force.
3. Existing Writer's Studio source/draft/history/revision/keeps/proposal/derived editorial JSON still has ordinary SQL writers and SQL/WAL/old-backup copies. R32 and R33 encrypted prototypes are **not active migrations**. Prior broad R31 source audit found 51 lower-bound legacy literal write candidates in 19 files. No fallback to plaintext is permissible in the eventual active route.
4. No independently provisioned key and deletion operator, no nonrollbackable external Work coordinator across real KMS latency and SQL/vault commit, no approved budget/admin/Region or current-key + database + vault offsite cold restore. An independently retained old raw key remains capable of opening old ciphertext.
5. No valid entire Browser-Safari/iPhone Studio+Personal Portal+MAIA Apply/Undo, changed-word UI and chosen alternatives end-to-end acceptance, no clean enforced shipping Next build, no original DOCX/PDF streaming/parse, no real author notice, approved non-Resend mail, exact-image rollback rehearsal or founder Class A GO.

**Release verdict:** R36 local source/PG16 passage bridge **PASS**, operational real-member writing and full five-testers `soullab.life` beta **HOLD**. Production not modified.
