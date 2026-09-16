# Writer's Studio — Andrea / Brave Acceptance

**Date:** 2026-09-16
**Hallmark base:** `e8be6cb4435e60874a25b81c88af9d61014c7566`
**Repair lane:** `fix/ws-blank-page-writeable-20260916`
**Browser:** Brave `148.1.90.128`

## Why this witness exists

Andrea Fagan reported that a first-time writer with no uploaded writing could not begin a Work in Brave. A second requirement was to admit handwritten pages and other source material without confusing those sources with manuscript text.

The witness used no production member or production database. It ran the merged Hallmark code against an ephemeral pgvector/PostgreSQL 16 database, bootstrapped with the repository's canonical baseline and migration runner: **658 public tables / 540 recorded migrations**. Authentication used a real row in `auth_sessions`; no member-id bypass was used.

## Finding that changed the repair

PR #1313 made the Home threshold real, but the first Brave walk exposed a second wall: the blank route created a continuous draft while canonical Hallmark Write admits only section-addressable drafts. The browser reached `/writers-studio/rebuild?m=…` but the room could not open the blank page.

The repair therefore belongs at blank-page birth, not in the rebuilt room: a new blank draft is born with one empty provenance-free draft section. It creates no `manuscript_sections`, no chapter, no heading, and no Source assertion. `source_section_id = NULL` is the truthful state.
## Brave desktop — first Work

From an empty Studio:

1. `Begin a new work` was visible and activated in one click.
2. A Living Work, blank manuscript, expression relation, and one empty draft section were created.
3. Hallmark Write opened on the new manuscript and rendered `SECTION · STRUCTURE NOT YET CONFIRMED` rather than inventing book structure.
4. The empty authored body became an editable textarea.
5. The writer entered `The first line begins here.` and blurred the editor.
6. Persistence advanced the draft from **v1 → v2**. Whole-draft content and section text were byte-identical. The section retained `source_section_id = NULL`.

A separate live-database duplicate-guard witness, with an already-bound manuscript present, returned **201 then 200** for the same newly-created unbound blank. That blank was section-addressable at v1, held one empty draft section, had zero Work expressions, and revision 1 froze the section identity as `{start:0,end:0}`.

## Source intake — desktop

The writer uploaded a PNG notebook-page specimen. Local OCR produced a draft transcription. The preserved original streamed from the member-scoped source route as HTTP 200 `image/png` and decoded in Brave at **1800×1100**, rendered beside the editable transcription at **479×293**.

The writer corrected the transcription, accepted it, and explicitly brought the source to the Work with the relationship sentence `Notebook page for the opening.`. Returning to Hallmark Write showed the source and the writer's relationship in Materials while manuscript text remained exactly `The first line begins here.`
## Source intake — mobile

At a **390×844** mobile viewport in Brave:

- the Source Intake room had no horizontal overflow;
- original page and transcription were both visible during review;
- the review state had no horizontal overflow;
- correction, acceptance, and `Bring this to the Work` succeeded;
- the source and relationship sentence appeared in the mobile Write outline;
- the rebuilt Write room had no horizontal overflow.

The only browser console errors in these local walks were Next.js development HMR WebSocket failures (`/_next/webpack-hmr`). They are local dev-server transport noise and did not affect source or writing requests.

## Test evidence and known baseline debt

The repair's focused regression population is **16 suites / 169 tests / 0 failures**. This includes blank creation, checkpointing, first-work arrival, source intake, material relationships, rebuilt-model, render route, and book-render tests.

The blank-route mutation matrix was rerun after the new reuse law. All seven mutants were killed: removing the advisory lock or disabling reuse caused 3 failures each; removing version, title, provenance, section-addressability, or the unbound-to-Work predicate caused 1 failure each.

Two older mock suites are already red on untouched Hallmark `e8be6cb44` and are not changed in this lane:

- `manuscripts/[id]/draft/__tests__/route.test.ts` — **11 pre-existing failures**;
- `manuscripts/[id]/draft/revisions/__tests__/route.test.ts` — **3 pre-existing failures**.

Both were rerun against the Hallmark base and reproduced unchanged. They are recorded as baseline test debt rather than repaired inside this lane.
## Acceptance boundary

**Accepted:** first-work threshold reachability, blank-page writability and persistence, source custody, side-by-side review, writer correction, explicit Work belonging, desktop Brave behavior, and mobile responsive behavior.

**Still owed:** handwriting-recognition quality on an actual human handwritten page. Every OCR execution witness in this lane used rendered text in an image/PDF specimen. Passing those witnesses proves the sovereign OCR path executes; it does not prove that Andrea's handwriting will be transcribed accurately.

No production deployment is authorized by this record. The disposable browser/database stack is test evidence only.