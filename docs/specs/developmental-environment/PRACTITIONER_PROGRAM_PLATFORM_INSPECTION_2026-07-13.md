# Practitioner Program Platform — Prompt 0 Inspection Report

**Date:** 2026-07-13 · **Status:** INSPECTION REPORT — read-only pass, no code changes, UNCOMMITTED pending review
**Product name discipline:** **Now What?** (ratified by Kelly in-session 2026-07-12; the inverted form survives only in internal/API identifiers and one public OG string — see D.4)
**Scope:** what already exists for a reusable Practitioner Program Platform with Now What? as the first configured instance.

Every claim below is labeled: **[CONFIRMED]** = verified on disk this session (branch `fix/map-svg-pointer-events` + origin) · **[INFERRED]** = likely but not directly verified · **[RECOMMENDED]** = proposed new work.

---

## A. Relevant existing architecture

### A.1 Program layer — larger than expected [CONFIRMED]
- `field_programs` + `field_program_positions` (migration `20260712000001_field_programs_and_positions.sql`): practitioner-authored program catalog per practice field (`kind`: coaching/training/workshop/course/retreat; ordered `focal_points` JSONB; cohort `current_focal_point`) + member-declared position (focal_point, `stated_by`, `member_confirmed_at`, UNIQUE per field+program+member).
- Service `lib/practiceField/programPositionService.ts`; route `app/api/now-what/program-position/route.ts` (GET/confirm/own-words/depart, exactly-one gesture, 422 widening); UI `app/now-what/position/page.tsx`.
- **Already composed into MAIA prompts**: `composeProgramPositionBlock` wired in `lib/maia/roomComposition.ts` ("context, not instruction — downstream of field block").
- Deployed to production 2026-07-12 (PR #595); both tables at **0 rows** — Larry doors not seeded (Kelly/Larry decision pending); Gate 1 prod probes P7a–d not yet witnessed.
- Constitutional settlement already made: **enrollment is declared by arrival, not administered by roster** — walking through a program door and confirming position IS enrollment; departure hard-deletes (no churn graveyard); declined confirmation writes nothing; **no practitioner read of positions, ever** (service header forbids adding a practitioner-keyed query — absence-of-query as enforcement, re-identification defense for cohorts of ~8).

### A.2 Practitioner environment [CONFIRMED]
- `practice_fields` (+ `practice_field_snapshots`, immutable per-relationship formation records; `field_slug` addressing) — `lib/practiceField/practiceFieldService.ts`; `maia_guidance` Layer-4 narrow-only guidance.
- Mature practitioner tables: `practitioners`, `practitioner_clients` (invited/active/paused/archived), `practitioner_files` (vault: 100MB cap, MIME map, disk storage `FILE_STORAGE_PATH`, team/client/encounter scoping), themes/domains/settings/directory, Studio UI at `app/studio/*`.
- **Versioning spine**: `practice_field_revisions` (append-only, DB trigger forbids UPDATE/DELETE, `saved_by` provenance, `promoted_from_draft` reserved) — built on PR #586, **awaiting Kelly merge** — this is the plan's `practitioner_guidance_version`, already designed.
- Role model exists: `config/accessMatrix.ts` (`admin|steward|curator|practitioner|partner|member`), enforced by `middleware.ts`.

### A.3 Content/materials substrate [CONFIRMED]
- `library_sources`/`library_chunks`/`library_distillates` (migration `20260130000001`): type (book/transcript/article/manual/teaching), file_path, SHA256 checksum, ingestion_status, **consent_granted/consent_required flags**. Live ingestion path = `lib/library/LibraryService.ts` (Postgres pgvector + local nomic embeddings). **Larry's library: 0 rows** (verified against prod 07-13 by another lane).
- `corpus_documents` (migration `20260112000001`): `version INT`, content_hash — a second versioned-document model.
- `workbench_uploads` (Book Studio): lifecycle `extracting → draft → reviewed`; **only `reviewed` text enters the FTS index** — the closest existing analog to "ratification before AI availability."
- Media Studio (projects/assets/transcripts/jobs/exports; chunked upload; disk storage; transcribe route; local Whisper service).
- Quote provenance grammar: `lib/analysis/extractQuotes.ts` — two-class member-verbatim vs model-attributed; first importer live (PR #608, `POST /api/sovereign/quotes/candidates`).
- ⚠️ `lib/services/FileIngestionService.ts` is legacy: `@ts-nocheck`, **Supabase client + OpenAI embeddings + Bull/Redis** — violates project invariants; remove, do not consolidate.

### A.4 Consent, privacy, sharing [CONFIRMED]
- Member consent columns with allowlist-validated PATCH (`conversational_recall_enabled` etc., `/api/members/recall-preferences`); `return_preference` / `surface_preference` member-pulled defaults.
- **Append-only consent ledgers with revocation**: `session_consent_events` ("API MUST verify the ledger, not trust the flag"), `encounter_consent_events` (per-kind join/record/share, `text_snapshot` of exact consent language, **DB trigger** blocks a media stream without a matching record-consent — real DB-level enforcement).
- Per-thread practitioner visibility already exists in Now What?: field-note threads carry `can_be_shown_to_practitioner` **default FALSE** — sharing is per-thread, member-checked, nothing shared by default.
- Sanctuary mode enforced structurally at the write path (`app/api/oracle/conversation/route.ts`).
- Isolation model: `team_id`/scope columns + app-layer `WHERE member_id = $1`; **no RLS**; verified by the release gate `scripts/verify-constitution-colab.ts` (cross-team COUNT(*)=0 proofs).
- Three-layer practitioner-client privacy model on record (memory, from Jondi/Kelly 2026-07-01): member consent governs the connection; practitioner relationships siloed from each other; personal MAIA belongs only to the member.

### A.5 MAIA composition & guardrails [CONFIRMED]
- Room path: `lib/maia/roomComposition.ts` — **the plan's composition hierarchy already exists**: constitutional floor (`MAIA_RUNTIME_PROMPT`) → presence → field (practitioner) → position (program) → room hard-limits.
- Main path: `lib/sovereign/maiaVoice.ts:477` `appendAllContextAddenda` — 22 ordered addenda via `ADDENDA_SPECS`; a new block = one `MaiaContext` field + one spec entry. Standing disciplines appended unconditionally after all addenda (memory speech-act boundary, platform-knowledge boundary, interface humility).
- Prompt-injection defense: `lib/practiceField/fieldGuidance.ts` `WIDENING_PATTERNS` rejects override attempts at save AND compose; practitioner corpus framed "context, never instructions."
- Telemetry: `runtime_events.prompt_block_layers` (fixed boolean struct in `lib/maia/maiaRuntimeContext.ts` — a new layer needs an explicit key).
- Refusal registry R01–R14 with executable tests; eval harness `scripts/eval/now-what-probes.ts` (20 named probes, jurisdiction-card pattern, conduct-not-efficacy, production hard-refused).

### A.6 Participant-authored substrate [CONFIRMED]
- Marked Moments: `episodic_memories.marked_by_member` + byte-exact `verbatim_text` (integrity constraint marked ⟺ verbatim); only `app/api/sovereign/episodes/mark/route.ts` sets it; unmark hard-deletes. Room `/maia/moments` is **copy-guarded** (promises holding only — standing ruling forbids adding extraction there).
- Legacy full-LMS model exists unwired: `academy_domains/sequences/paths/path_items/enrollments/completions` (migration `20260116000002`) — a roster-based enrollment/completion model with ordering and progress. Reference only; essentially zero callers.

---

## B. Reusable components (plan entity → existing implementation)

| Proposed entity | Existing | Status |
|---|---|---|
| practitioner_environment | `practice_fields` + `practitioners` | CONFIRMED, live |
| content_asset | `library_sources` (+ `practitioner_files` vault for bytes) | CONFIRMED; needs ratification states |
| content_asset_version | `corpus_documents.version` pattern + workbench lifecycle | CONFIRMED patterns; not unified |
| program / program_version | `field_programs` (catalog) + `practice_field_revisions` (append-only versioning, PR #586) | CONFIRMED; versioning awaits merge |
| module / lesson | `focal_points` JSONB ordered sequence (flat) | PARTIAL — no 2-level hierarchy, no per-lesson attachments |
| resource_attachment | — (`library_sources` has no lesson join) | MISSING |
| practice | `practice_sessions`/`practice_insights` tables exist; no assigned-practice model | PARTIAL |
| reflection_prompt | room reflection gestures; no authored-prompt table | MISSING as entity |
| enrollment / participant_program_state | `field_program_positions` (enrollment-by-arrival) | CONFIRMED — **and constitutionally settled differently than the plan proposes** (see D.2) |
| lesson_activity (xAPI-like) | append-only event pattern (`runtime_events`, `living_encounter_events`, field-note ledger) | CONFIRMED pattern; no instance |
| participant_reflection_reference | field-note threads (member-authored, private default) | CONFIRMED |
| participant_share | per-thread `can_be_shown_to_practitioner` + consent-ledger pattern w/ revocation | CONFIRMED pattern; extend, don't invent |
| practitioner_guidance_version | `practice_field_revisions` (PR #586) | CONFIRMED, awaiting merge |
| program_context_snapshot | `practice_field_snapshots` | CONFIRMED |
| MAIA program awareness | `composeProgramPositionBlock` + roomComposition hierarchy | CONFIRMED, live (room path) |
| Session preparation/integration | — (room has bring/take-back gestures; no session-bridge workflow) | MISSING as workflow |
| Eval probes | now-what-probes harness + refusal registry | CONFIRMED, extendable |
| Export | — (no program/materials export serializer) | MISSING |

**Estimate: roughly 70% of the plan's data spine exists or has a settled pattern.** The genuinely new work is the authoring path, the materials ratification lifecycle, lesson-level attachments, the session bridge, and export.

## C. Missing components

1. **Program authoring write-path** — `field_programs` has read-only service functions; no practitioner CRUD anywhere (rows must be seeded by script). This is the single largest gap.
2. **Unified Materials Library surface** — three upload systems (vault / media / workbench), no shared ratification state machine (`uploaded → processed → reviewed → ratified → archived`), no "where is this used" reverse index.
3. **Lesson layer** — focal points are strings; no per-lesson materials/practice/reflection attachment.
4. **Field Charter runtime** — `docs/fields/FIELD_CHARTER_TEMPLATE.md` exists (five questions incl. Question V boundary-and-referral) but has **no table, no code** — charters live only as docs.
5. **Session Bridge** (prep/integration flows) — gestures exist in the room; the structured before/after-session workflow does not.
6. **Prompt/charter/program version provenance** in `runtime_events` — behavioral provenance exists (`RoomFieldProvenance`), version stamps do not.
7. **Export/portability serializers** for programs and materials.
8. **Witness ledger** — named by the Developmental OS exploration (2026-07-13) as the most load-bearing missing primitive before any two-party surface.
9. **DB-level row security** — isolation is app-layer + release-gate-verified, not RLS.

## D. Conflicts and risks

1. **Larry IP gate (standing, 2026-07-13):** the system has **no custody of Larry's actual works and no rights instrument**, while MAIA's voice in his rooms is already composed from a ~64k distillation. Counsel on record: the IP one-pager (`docs/fields/larry/LARRY_MATERIALS_AGREEMENT_ONE_PAGE_2026-07-13.md`, v1.1 rendered) is **agenda item 1 of the charter sitting and GATES field activation** — no client enters, no book ingests, until signed. Prompt 3's upload pipeline may be *built*, but no real Larry material may be *ingested* before that instrument exists. The plan's demo-content-only discipline is aligned; keep it absolute.
2. **Enrollment-model conflict — the plan vs settled constitution.** The plan proposes roster enrollments pinned to published program versions, practitioner-visible enrollment lists, and (policy-permitting) practitioner sight of current lesson/completions. The house has already ruled the opposite for this surface: enrollment-by-arrival (no roster), departure hard-deletes, declined confirmation writes nothing, and **no practitioner read of member positions ever** — the absence is the feature Larry buys (informed purchase, not discovered limitation). Prompt 8's own instruction ("if there is no ratified authority, keep visibility narrower and return a decision memo") resolves this: **the ratified authority exists and it says no.** Any "factual enrollments" surface for the practitioner must come from a *member share act*, not from position rows.
3. **Program-position spec-hold reconciliation (open):** the layer is BUILT and deployed while the spec header still reads "PREPARED, NOT AUTHORIZED" (hold was lifted verbally 07-12; header never updated). Reconcile at the sitting before "My Position" is claimed anywhere outward.
4. **Naming:** "Now What?" is ratified; member-facing UI is uniform (30 hits). "What Now?" survives in 3 internal/API files, the eval-spec title, and — publicly — `lib/og/ogCard.tsx:189` (deployed OG eyebrow/title). The ogCard sweep is its own PR + deploy, awaiting explicit go.
5. **Practitioner Field Admin spec is not on disk** — `PRACTITIONER_FIELD_ADMIN_SPEC_2026-07-10.md` remains uncommitted in another lane; its versioning spine (PR #586) is open. The platform build should treat PR #586 as a dependency and the Studio spec's sequencing rule as binding: **distillation session with the existing simple editor precedes any Studio build** — Larry's corrections are the Studio's requirements document.
6. **Reference-implementation sequencing (Kelly, 2026-07-09):** conversion order is (1) Larry's field proven by a real Encounter → (2) authoring surface mature for self-serve → (3) demo. A platform build that inverts this (build everything, then find a practitioner) contradicts the standing order.
7. **Legacy collisions:** `FileIngestionService` (Supabase/OpenAI — must be removed per invariants); `academy_*` tables (parallel roster-LMS — decide archive-or-reuse explicitly, never a third model); duplicate versioned-document models (`library_sources` vs `corpus_documents`) need one canonical choice.
8. **Practices gap:** the eighth surface (Practices & Commitments) has substrate tables but no assigned/member-created-practice model, and `docs/specs/PRACTICE_FIELD_SPEC.md` is cited by migration `20260701000001` but absent at that path — locate or re-author before Prompt 4's practice attachments.
9. **Co-Lab release gate:** materials, files, memory-adjacent and onboarding surfaces trigger the 31/31 boundary gate (`scripts/verify-constitution-colab.ts`) — any new scoped tables must be added to it, and it must pass in production before tester exposure.
10. **Interoperability influence, not vocabulary:** xAPI/Caliper-style events fit the existing append-only pattern, but analytics language is constitutionally barred from member-facing surfaces (`docs/ANTI_FEATURES.md`), and no events ever transmit externally.

## E. Recommended minimal vertical slice

The Prompt 0 question was: two-week surface over existing infrastructure, or hidden schema work? **Answer: closer to the two-week surface than the plan assumes — the schema spine mostly exists.** The slice:

1. **Merge PR #586** (revisions spine) — dependency for all authoring. *(Kelly action, not build.)*
2. **Program catalog authoring path** — practitioner CRUD for `field_programs` (own field only, revisioned via the #586 pattern, draft→publish as revision promotion). Reuses accessMatrix `practitioner` role. No new tables.
3. **Materials ratification lifecycle on `library_sources`** — add status states (uploaded/processed/reviewed/ratified/archived) borrowing the workbench reviewed-gate; bytes stay in the practitioner vault; only `ratified` becomes composable; uploaded text is untrusted (WIDENING_PATTERNS applied at compose). One small migration.
4. **Lesson enrichment** — one thin table joining a focal point to ratified materials + a practice + an optional reflection prompt (this is the plan's module/lesson/resource_attachment collapsed to what Now What? actually needs).
5. **MAIA lesson context** — extend `composeProgramPositionBlock` with the current focal point's ratified materials; add a `program` key to `prompt_block_layers`; record program revision id on the event (starts version provenance).
6. **Session Bridge v0** — prep/integration flows composed from existing field-note threads + the existing per-thread share flag (the privacy mechanics already exist; the workflow UI is new).
7. **Probes** — extend the P-series: authorship boundary, no-invented-Larry-facts, injection-in-uploaded-material, share-boundary, absent/stale-program safety.

Defer from the slice: cohort/practitioner pacing, export round-trip, module hierarchy, practitioner view beyond existing Studio pages, any Studio build ahead of Larry's distillation walk.

## F. Proposed file/route map [RECOMMENDED — follows existing conventions]

- `app/api/practitioner/practice-field/programs/route.ts` (+ `[programSlug]/route.ts`) — catalog CRUD (practitioner-scoped)
- `app/api/practitioner/materials/route.ts` (+ `[id]/{route,ratify,text}.ts`) — library over `library_sources` + vault
- `app/api/now-what/session-bridge/route.ts` — prep/integration (member-scoped)
- `lib/practiceField/programAuthoringService.ts` · `lib/library/materialsRatification.ts`
- `app/studio/programs/page.tsx` · `app/studio/materials/page.tsx` (extend Studio, no fork; unconditional dark classes per standing rule)
- `scripts/eval/now-what-probes.ts` — new probe block

## G. Proposed database additions [RECOMMENDED]

- `library_sources`: `review_status` CHECK column + `ratified_at`/`ratified_by` (idempotent ADD COLUMN)
- `field_program_lessons` (field_slug, program_slug, focal_point, ordered material refs → library_sources, practice ref, reflection_prompt text, authored provenance) — UUID PK, created/updated/archived_at per convention
- `runtime_events`: `program_revision_id` (nullable) — version provenance start
- Program revisions ride the #586 `practice_field_revisions` pattern (either reuse with a `kind` column or a sibling `field_program_revisions` append-only table)
- **No enrollment table** (settled), **no analytics tables**, no publishing/quotes migration needed for this slice.

## H. Migration risk

Low: all additive, idempotent per house convention (`IF NOT EXISTS`). Requires the **full deploy path** (`deploy-production.sh`, migrations + rollback tags), deploy-lane lock respected. Prod `field_programs` is empty, so schema evolution has no data-migration exposure. The one ordering risk: if PR #586 lands with its own migration, sequence the program-revisions migration after it.

## I. Test strategy

- Extend `scripts/eval/now-what-probes.ts` (named probes, PENDING-until-witnessed induction rule; deterministic runners where no prompt witness is needed).
- Add new scoped tables to `verify-constitution-colab.ts` cross-scope COUNT(*)=0 checks; 31/31 (current count) must pass in prod before any tester wave.
- Adversarial practitioner-read tests: assert **no route returns member positions/reflections to a practitioner identity** (absence-of-query doctrine made executable).
- Injection corpus: uploaded materials containing override instructions must neutralize at save AND compose (WIDENING_PATTERNS coverage extended to ratified materials).
- Refusal-registry additions for the new surfaces (R-numbered, jurisdiction cards).

## J. What must not be built yet

1. Anything ingesting **real Larry material** — gated by the signed IP instrument (standing counsel; near-miss already on record).
2. **Practitioner visibility into positions, progress, completions, or reflections** — ruled out; only member share-acts cross the boundary.
3. **Cohort management / rosters / drip pacing** — contradicts enrollment-by-arrival; schema-ready language in the plan should not become tables.
4. **Larry's Studio beyond the existing simple editor** — his distillation walk produces the requirements first (Kelly's sequencing rule).
5. **Scores, stages, developmental ratings, engagement metrics, streaks, analytics dashboards** — barred by ANTI_FEATURES + freeze doctrine; completion facts only, never development claims.
6. **Two-party/witnessed surfaces** — blocked on the witness-ledger primitive.
7. **External event transmission / xAPI endpoints** — influence the internal event shape only.
8. **RLS migration** — worthwhile hardening, but a separate track; do not couple it to this slice.

---

*Sources: five parallel read-only repo inventories (this session) + standing decision records (Larry IP gap · program-position spec · practitioner field admin spec · practitioner-client privacy model · reference-implementation reframe · naming ratification · experience-map reconciliation). Point-in-time: branch `fix/map-svg-pointer-events` @ merge of origin, 2026-07-13.*
