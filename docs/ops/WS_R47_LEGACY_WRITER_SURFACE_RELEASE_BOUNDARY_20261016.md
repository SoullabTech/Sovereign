# R47 — Canonical Writer legacy-write boundary

**October 16, 2026. Read-only engineering qualification. Beta release HOLD.**

## Scope and evidence

In a separate clean descendant of accepted R44 f2254331d31491eb8b9a8efb4a101b852d889bf3, the scanner found **12 bounded content-writing or delegated editorial API routes** plus **two adjacent member-metadata/export custody surfaces**. These existing pathways are distinct from held-only encrypted R36/R37/R42/R44 services. Current code-path coexistence is not live encrypted Source-to-Apply authority.

This is a source-only inventory, not an exhaustive dependency graph, deployment probe, member-data census, plaintext archive remediation or KMS approval. Its static markers can also appear in disabled code branches. An independent deployment and transitive call review is still needed.

## Known API surfaces and required migration

| Writer act | Existing active-tree route | Evidence in source |
| --- | --- | --- |
| Create manuscript | app/api/sovereign/manuscripts/route.ts | SQL INSERT manuscript_sections, plus Cabin path |
| Import Source | app/api/sovereign/manuscripts/ingest/route.ts | recordArtifactArrival carries extracted text |
| Begin blank Work | app/api/sovereign/manuscripts/blank/route.ts | SQL INSERT manuscript_working_drafts |
| Draft save | app/api/sovereign/manuscripts/[id]/draft/route.ts | UPDATE manuscript_working_drafts |
| Checkpoint | app/api/sovereign/manuscripts/[id]/draft/checkpoint/route.ts | INSERT working_draft_revisions |
| Revision and restore | app/api/sovereign/manuscripts/[id]/draft/revisions/route.ts | INSERT working_draft_revisions |
| Save passage | app/api/sovereign/manuscripts/[id]/sections/[sectionId]/route.ts | saveSection delegated transaction |
| Create Keep | app/api/sovereign/manuscripts/[id]/keeps/route.ts | INSERT manuscript_keeps, verbatim_text |
| Adopt structure | app/api/sovereign/manuscripts/[id]/structure/proposals/[proposalId]/adopt/route.ts | authorStructureFromProposal |
| Adopt editorial version | app/api/writers-studio/editorial/adoption/route.ts | adoptVersion |
| Editorial Undo | app/api/writers-studio/editorial/undo/route.ts | undoApplication |
| Editorial turn | app/api/writers-studio/editorial/turn/route.ts | persistMemberEditorialAct |

Two related surfaces are tracked separately, not misclassified as permanent Source-body writers. Collections writes member-authored names and Keeps placement through app/api/sovereign/manuscripts/[id]/collections/route.ts. PDF/EPUB rendering in app/api/sovereign/manuscripts/[id]/render/route.ts creates temporary output from member prose, records provenance metadata, and requires separate deletion/export custody review.

## Reproducible checks

- Inventory: node scripts/ops/wsBetaR47LegacyWriteInventory.mjs --audit
  Expected exit 0 when the observed legacy baseline matches, reporting LEGACY_WRITERS_PRESENT_HOLD.
- Release stop: node scripts/ops/wsBetaR47LegacyWriteInventory.mjs --release-gate
  Expected exit 2. A missing route, changed marker or newly discovered writer candidate returns exit 3, not success.
- Fixture tests: node --test scripts/ops/__tests__/wsBetaR47LegacyWriteInventory.test.mjs
  Initial run: 6/6 PASS; known 14/14 inventory surfaces present; 12 writing/delegating, 2 separate custody surfaces; no unknown candidates in selected route tree, no held-only composer mounted by matching import names.

The read-only scanner inspects only source-code files; it opens no member writing or database, accesses no network, creates no production artifacts and changes no routes. Results include only code paths, marker lines and source SHA256.

## Required release sequence

1. Review all transitive service writes, background jobs, old Writer source, editable drafts, revisions, Keeps and editorial acts. This bounded scan is explicitly incomplete.
2. Fence all protected beta Work from legacy plaintext writers through one server-owned member/session/current-consent/Work authority; preserve historical authors and existing Work.
3. Connect immutable Source → separately encrypted Draft → section Apply/Undo to real server-derived, single-use author approval, independent key and monotonic deletion/commit authority. Neither an invented UI gesture nor an isolated PostgreSQL row lock is sufficient.
4. Reconcile historical plaintext including SQL, WAL, offsite backups, old readers, private filenames, orphan ciphertext and safe member erasure. New encryption does not retroactively protect old copies.
5. Prove exact old/new reader and rollback compatibility, author-owned export, physical macOS and iPhone Safari Studio/Portal/MAIA journeys, production build and independent Class A custody review.
6. Require separate founder image/cutover approval and per-person account verification; initial two authorized testers before any other individually approved person. Never automate wider enrollment.

**Disposition: source audit passed; production release STOP. R45/R46 concurrent uncommitted worktrees were not changed. No member content, KMS, production SQL or live route was touched.**
