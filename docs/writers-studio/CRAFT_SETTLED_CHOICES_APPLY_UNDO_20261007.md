# Craft saved decisions and Apply / Undo — verification

Date: 7 October 2026. Candidate: `feature/writers-studio-craftsmans-table-r1-20261006`, local port 3741. Base: `a2e466484f`.

## Delivered behavior

Explicit Save stores the writer's exact working wording and settled-choice metadata together. A kept decision can be saved without a prose change. Reopening a decision is an unsaved metadata change until the writer explicitly saves again.

The additive `writer_craft_version_choices` table binds metadata to a member-authored version. Source-relative code-point spans are validated against the owned original passage and saved formulation; malformed, overlapping, contradictory and extra fields are refused. No historical decisions are inferred or backfilled. The migration `20261007000001_craft_version_choices.sql` was applied to the local candidate using the repository's migration runner and checksum/advisory-lock protocol.

Owned thread reads recover saved metadata. Saved-version return restores the wording and kept spans, and the active table's restored choices are supplied to MAIA's editing context. No model call is needed for Save, return, Apply or Undo.

Apply retargets the visible focus to the actual applied wording while retaining the immutable editorial baseline. The table shows an applied receipt and a reachable Undo button. Undo restores the original manuscript text and working view while retaining the saved draft and its decisions.

## Resumption discipline

Read the uploaded `craft_settled_choices_apply_undo_checkpoint_20261007.md` and inspected the existing working tree, browser state and stored versions before repeating any action. The second Save had completed before the disconnection; it was not repeated.

Elemental Alchemy was not the mutation fixture. Its canonical manuscript remained revision 2 with all draft-section bodies unchanged. Its live working wording, current kept-choice state and stored conversation were verified against a new read-only resumption baseline. The older checkpoint's Water thread had four additional author/MAIA turns; those were retained rather than overwritten from stale recovery data. No Save, Apply, Undo or model request was sent to that manuscript by this verification.

## Live cycle one — recorded before interruption, checked again on resumption

Disposable manuscript: `ccbe04e9-3006-4c20-ac2b-d01f7c62b488`.
Title: `TEST ONLY — Settled decisions and Apply Undo — 2026-10-07`.

Original: `We become present as the light returns. We listen carefully.`
Saved: `We become present as the light returns. We listen with care.`
Kept span: `become`, code points 3–9.

Save → move → fresh reopen without its thread link or local recovery → Open saved version restored both text and decision. Apply changed only that passage. Undo restored all draft-section text exactly. The immutable source and neighboring paragraphs/section were unchanged. The first UI attempt hid Undo after Apply; the combined repair fixed this and the visible Undo completed the operation.

Thread: `162a6813-fc01-4dd5-a7bc-867b0a4e34d5`.
Version: `4c81b06c-598d-4702-9b15-d8137321a412`.
Authorization: `22ec7623-f242-454b-b517-f70ef848eebd`.
Revisions: 1 → 2 → 3. Undo restores text; it does not rewind revision history.

## Live cycle two — different-length edit, completed after reconnection

Section: `cf35dbfa-c238-4d23-9760-171305292424`.
Original: `This next section is unchanged throughout the test.` (51 code points).
Saved: `This next section has a temporary, isolated test revision.` (58 code points).
Kept span: `next`, code points 5–9.

Verified the existing saved version, clicked Preview and Apply once, checked the resulting source/body diff, then clicked the visible Undo once. Apply updated focus length to 58; Undo returned it to 51. The saved formulation and decision remained stored. All original draft-section bodies and immutable source matched their baseline after Undo. The first section was unchanged throughout this second cycle. Neither test thread contains any model-authored turns.

Thread: `c1ad8a11-ffbe-4dba-9798-da33f81200cf`.
Version: `6af384ee-84bd-4357-a157-84c5961106e1`.
Authorization: `888f981a-3b43-4933-a890-8021ccb2da3f`.
Revisions: 3 → 4 → 5.

## Final checks

393 tests passed across the complete 36-suite targeted Craft/save/selection/lineage regression set. Configured `typecheck:ws-flagship` and `git diff --check` passed.

Expanded UI typecheck still reports three pre-existing diagnostics in unchanged modules: `ollamaStructuredAdapter.ts:76` and `craftRereadR1.ts:31–32`. They are tracked as `MAIA-SOVEREIGN-bym`; the expanded check is not described as passing.

## Cleanup and limits — not rounded into success

The application DELETE removed the disposable manuscript and its source/draft sections; manuscript and both thread endpoints return 404. No test manuscript remains in the Studio. The test tab is no longer present.

A direct post-deletion audit found TWO retained proposal versions and TWO choice-metadata rows belonging to the deleted fixture. Their proposal chains and authorization lineage are guarded by existing immutable triggers/RESTRICT foreign keys. The existing manuscript erasure function does not include this lineage. No trigger, constraint or protection was disabled. Total history erasure is NOT complete. This defect and the exact residual IDs are recorded in `MAIA-SOVEREIGN-y4v` for authorized cleanup through a repaired erasure path.

A live development-refresh experiment also still lost an UNSAVED unfinished editor through a remount. The exploratory same-focus/work/load guards did not pass that witness and were removed. Explicitly saved text and decisions are durable; unsaved refresh survival is not claimed. Follow-up: `MAIA-SOVEREIGN-omu`.

Only explicit Save persists the decisions. No autosave was added. Save does not Apply. No production merge or deployment is authorized or claimed.

## Records

Diagnostic evidence: `/tmp/ws-settled-apply-20261007` (second-before/applied/undone JSON records, final regression/typecheck logs, cleanup counts, original-writer comparison).
Implementation issues: `MAIA-SOVEREIGN-0vv` (saved-decision portion; unsaved-refresh follow-up split to `omu`) and `MAIA-SOVEREIGN-iyk` (both live Apply/Undo cycles verified).
