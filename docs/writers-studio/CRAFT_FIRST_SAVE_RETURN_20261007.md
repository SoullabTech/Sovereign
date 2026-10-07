# Craftsman's Table — Writer-first Save and Return

Date: 7 October 2026
Candidate: feature/writers-studio-craftsmans-table-r1-20261006
Base: 52f905052b
Issue: MAIA-SOVEREIGN-lww

## Gate result

A writer-created working version can now be saved without an existing MAIA proposal or conversation. A saved version is not a manuscript application.

The existing selection constructor is reused on a caller-owned transaction. The new scoped version route creates the initial chain, thread, and member-authored version atomically, or appends to an explicitly named existing thread with the exact stated predecessor. No ask_turn or model response is manufactured.

The server checks verified ownership, explicit Ordinary posture, current draft revision, exact selected source, closed request shape, and lawful version succession. Empty replacement wording is allowed. Foreign author/chain assertions are rejected. No provider, credentials, billing, fallback, automatic retry, migration, or Apply policy was changed.

The client reports Save success only after reading the owned thread back and checking the returned version ID, member authorship, exact wording, original locus, and predecessor. Failed or uncertain saves retain local wording. A changed focus is not overwritten by a late result.

## Working with it

- Write here -> shape the passage -> Use this as my working copy -> Save my version.
- Receipt: Your working version is saved. Not applied to the manuscript.
- Move away and return within the existing workbench.
- For a later visit: Choose passage -> Saved working versions -> Open saved version.
- Saved versions are offered individually; the system does not silently choose the newest thread or overwrite unfinished local wording.
- Apply my version remains the separate manuscript-changing action.

## Live browser and database witness

Used a disposable, explicitly named TEST ONLY manuscript, not Elemental Alchemy. The fixture was created through the authenticated manuscript API and seeded normally.

1. Selected its first section, opened Write here, and wrote new text without any MAIA proposal.
2. Saved through the actual button. Stored result: one member-authored root version, zero conversation turns, no application. Unicode, paragraph breaks, and trailing spaces survived exactly.
3. Used Next passage, then Return here. The same saved text returned to the table and the controller supplying MAIA's current copy.
4. Removed only the test Work's local recovery data and reopened a generic Studio URL without editorialThread.
5. Opened Choose passage -> Saved working versions -> Open saved version. The server supplied the same exact version. No model or manuscript-write request was made during return.
6. Live stale-predecessor request returned 409; Sanctuary returned 409; forged author field returned 400. Stored history was identical before and after those negative checks.
7. The test manuscript remained at revision 1 with its original source sections unchanged throughout. It and its test editorial thread were subsequently erased through the normal manuscript deletion API and verified absent.

Elemental Alchemy stayed at canonical revision 2. Its section bodies and existing editorial thread records matched the pre-test baseline. Both open writer workspaces retained their wording. The previously settled 'become' marker was restored after a development hot reload, using the existing Keep operation only after confirming the working text still matched the baseline; no text or manuscript application changed.

## Verification

378 tests across 35 targeted suites passed. Includes actual mounted table tests, exact save/readback, closed route inputs, transaction rollback, ownership predicates, empty wording, stale predecessor, recovery, focus, markup, and existing succession tests.

Writer's Studio flagship typecheck passed. Diff check passed.

An expanded source-entry typecheck was also attempted. It reports three errors in unchanged modules: ollamaStructuredAdapter.ts tool-choice narrowing and craftRereadR1.ts unit/range scope narrowing. That broader check is NOT recorded as a pass. Tracked as MAIA-SOVEREIGN-bym.

## Boundaries deliberately still open

- Full real-session Apply -> Undo verification is not part of this gate. No application was performed, even on the test manuscript.
- Saved wording is durable; per-word 'kept for this pass' annotations are still session state, not durable version metadata. Cross-session settlement/HMR recovery is tracked as MAIA-SOVEREIGN-0vv.
- Unsaved drafts must not be described as durably saved. Existing page-local draft carriage remains distinct.
- Automatic adoption of a saved version, general unrestricted conversational editing, and production deployment are not claimed.

Diagnostic evidence on the Mac: /tmp/ws-first-save-20261007.
