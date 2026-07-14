# ADR — Practitioner Program Platform (Now What? as first instance)

**Date:** 2026-07-14 · **Status:** PROPOSED — design record, no build authorized by this document
**Basis:** `PRACTITIONER_PROGRAM_PLATFORM_INSPECTION_2026-07-13.md` (Prompt 0) · Kelly's directive: *"a simple format where Larry can upload his media to share, and a field for him to develop his courses, workshops, trainings, workbooks."*
**Governing constraint (Kelly, 2026-07-14):** the remaining work follows Larry's actual reach in the walk, not this document's ordering. This ADR fixes the *shape* so any slice can build without rework; it does not fix the *sequence*.

---

## A. Product ontology

One sentence: **a practitioner organizes authored materials into programs so participants can learn, reflect, and continue between human encounters — while the participant's interior stays their own.**

```
Practitioner (practitioners + accessMatrix role)
  └─ Practitioner Environment        = practice_fields            [EXISTS]
       ├─ Materials Library          = library_sources + vault    [EXISTS, needs surface + ratification states]
       ├─ Programs                   = field_programs             [EXISTS, needs authoring path]
       │    └─ Focal points (flat sequence today; "modules/lessons" = one
       │       thin enrichment table attaching materials/practice/reflection
       │       to a focal point)                                  [NEW: field_program_lessons]
       ├─ Guidance (Layer 4)         = maia_guidance + revisions  [EXISTS, versioned]
       └─ Formation snapshots        = practice_field_snapshots   [EXISTS]

Participant
  ├─ Position (enrollment-by-arrival) = field_program_positions   [EXISTS — constitutional]
  ├─ Kept material                    = member_field_note_threads [EXISTS]
  ├─ Marked moments                   = episodic_memories(marked) [EXISTS]
  └─ Explicit shares                  = per-thread flag today; ledger pattern to extend
```

**Naming discipline:** generic tables stay generic (`field_programs`, not `larry_*`). "Now What?" is configuration: one `practice_fields` row + its programs + its materials. The second practitioner is a second row, not a second build.

## B. Entity relationships (deltas only — everything else exists)

1. **`library_sources` gains a ratification lifecycle** (see D). Bytes live in the practitioner vault (`practitioner_files`, disk-backed, 100MB/MIME-validated); extracted text lives in `library_sources`/`library_chunks` (checksummed, consent-flagged, pgvector via local nomic). One `vault_file_id` column joins them.
2. **`field_program_lessons`** (the only genuinely new table): `(field_slug, program_slug, focal_point)` → ordered refs to ratified `library_sources` + optional practice text + optional reflection prompt, with authorship provenance. This gives "modules/lessons/workbooks" without disturbing the deployed position mechanics.
3. **Program revisions** ride the PR #586 append-only pattern (a `kind` discriminator on `practice_field_revisions` or a sibling table — decide at migration time; same trigger, same provenance).
4. **No enrollment table.** Enrollment-by-arrival is settled constitution (spec §5/§8): confirming a position IS enrolling; departure hard-deletes; declined confirmation writes nothing.

## C. Versioning strategy

- **Practitioner-authored content** (guidance, programs, lessons, materials metadata): append-only revisions, PR #586 pattern — DB trigger forbids UPDATE/DELETE on history; every save carries `saved_by`; no-op saves dedupe. Draft→publish = revision promotion (`promoted_from_draft`, already reserved).
- **Materials files**: originals immutable in the vault; extracted/corrected text is versioned rows, never overwrites.
- **Participants reference the published revision current at arrival** via position rows + `focal_point_set_at` footing — version-pinning without a roster.
- **Prompt provenance**: `runtime_events` gains `program_revision_id` (nullable) so any MAIA reply can be traced to the program revision that composed it.

## D. State transitions

**Material:** `uploaded → processed → reviewed → ratified → archived` (borrowed from the workbench `extracting→draft→reviewed` gate, extended one notch). **Only `ratified` is composable into MAIA context.** AI-suggested metadata/summaries are labeled proposals and cannot advance state; only the practitioner's gesture ratifies. Archive is reversible; originals never deleted by state change.

**Program:** `draft → published(revision N) → draft(revision N+1) → …`, archive = soft (status), history immutable.

**Position:** exactly as deployed — confirm / own-words / depart(hard-delete); no new states.

## E. Privacy boundaries (all pre-existing constitution, restated as build constraints)

1. Participant conversations, reflections, kept threads, positions: **never practitioner-visible** except through an explicit member share act (per-thread `can_be_shown_to_practitioner`, default FALSE, or a future share-ledger act patterned on `session_consent_events` — verified against the ledger, never a denormalized flag).
2. **No practitioner-keyed query over member positions may exist** (absence-of-query doctrine, `programPositionService.ts` header). No dashboards, counts, or aggregates — a cohort of 8 re-identifies.
3. Practitioner relationships siloed from each other; personal MAIA belongs only to the member (three-layer model, 2026-07-01).
4. Uploaded material is **untrusted content**: `WIDENING_PATTERNS` neutralization at save AND compose; corpus framed "context, never instructions" (existing `practiceFieldService` pattern).
5. New scoped tables enter `verify-constitution-colab.ts` cross-scope proofs before any tester exposure.

## F. Visibility matrix

| Object | Participant | Practitioner | Steward |
|---|---|---|---|
| Ratified materials, published programs/lessons | read (enrolled context) | full authoring on own field | read |
| Draft materials/programs | — | own field | read |
| Position rows | own only | **never** | migration/ops only |
| Kept threads / reflections / conversations | own only | only per explicit share act | never (content) |
| Revision history | — | own field's | read |
| Factual invitation/administration (existing `practitioner_clients`) | own status | own roster (invited/active) | read |

## G. MAIA composition boundaries

Order (already implemented in `roomComposition.ts`, unchanged): **constitutional floor → presence → field (practitioner corpus, narrow-only) → position → lesson context (NEW, downstream of position) → room hard-limits.** Lower layers narrow, never override.

- Lesson block = current focal point's ratified materials + chosen practice, rendered "context, not instruction"; absent if no confirmed/stated position (ask-don't-assume footing already handled).
- MAIA refers to Larry as Larry, never impersonates (IP one-pager fence); "Larry's work suggests…" only over ratified material; outside it, defer to the practitioner.
- Main-path (`appendAllContextAddenda`) extension only when rooms prove the block: one `MaiaContext` field + one `ADDENDA_SPECS` entry + one `prompt_block_layers` key.

## H. Event model

Append-only facts, internal only (xAPI/Caliper as *influence*, not vocabulary): `lesson_opened`, `material_opened`, `practice_chosen` (exists as kept thread), `lesson_marked_complete` — member-scoped rows, member-visible, **no practitioner aggregates**, no external transmission, no "analytics" in any member surface. Completion facts never phrase as development claims.

## I. Export model

Practitioner export: full field — materials (originals + text), programs with revision history, guidance — one structured JSON + files bundle. This is the technical half of the IP one-pager's extraction-on-departure clause ("if Larry leaves, his work leaves with him"). Member export continues on existing member paths; shares export with the member's side, not the practitioner's.

## J. Future interoperability

Stable UUIDs + slugs everywhere; event rows convertible to xAPI statements later without schema change; content assets addressable by checksum. No LMS packaging (SCORM/LTI) contemplated.

## K. Explicit non-goals

Cohort pacing/rosters/drip · quizzes/certificates/scores/stages · engagement mechanics/streaks · practitioner position/progress dashboards (ever) · AI-generated curriculum published without ratification · real-IP ingestion before the signed agreement · witness-ledger surfaces (separate primitive) · RLS migration (separate hardening track).

## L. Migration sequence (each idempotent, additive, full-deploy lane)

1. `library_sources` ratification columns (+ `vault_file_id`).
2. `field_program_lessons`.
3. Program revisions (PR #586 pattern extension).
4. `runtime_events.program_revision_id`.
5. Event rows table (H) — only when a surface needs it.

Order of *surfaces* is deliberately unfixed — Larry's reach decides (materials-first vs program-first vs session-bridge-first, per the 2026-07-14 reach-signal ruling).

---

*Build gate: Kelly's word per slice. This ADR makes any of the five reach-directions buildable without redesign.*
