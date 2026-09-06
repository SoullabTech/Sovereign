# Writer's Studio — Programme Board

> **The one live cockpit. Live operational state only — not a constitution, not a roadmap.**
>
> ```text
> NORMATIVE AUTHORITY   docs/programme/WRITERS_STUDIO_MASTER_BRIEF.md
> CAPABILITY SPEC       docs/programme/DEVELOPMENTAL_EDITOR_CAPABILITY.md
> ROADMAP (direction)   docs/programme/WRITERS_STUDIO_ROADMAP_STAGE_6_TO_15.md
> ACTIVE LANE           docs/programme/JARVIS-WS2-07-DEVELOPMENTAL-INTELLIGENCE-01.md
> UNIT DEFINITION       docs/programme/WS-01_SOURCE_CUSTODY_UNIT_DEFINITION.md
>                       (historical — WS-01 CLOSED / OVERTAKEN 2026-09-03; the
>                       active unit is defined inside the ACTIVE LANE document)
> LAUNCH LANE (parked)  docs/programme/WRITERS-STUDIO-PRODUCTION-LAUNCH-01.md
> LIVE STATE (here)     docs/programme/WRITERS_STUDIO_PROGRAMME_BOARD.md
> HISTORICAL EVIDENCE   docs/design/author-studio/WRITERS_STUDIO_MEMBER_UPGRADE_PROGRAMME_LEDGER.md
> ```
>
> The **Master Brief** governs meaning, architecture, invariants and unit identity. This board
> records **current execution state only**. Where they conflict, the Master Brief and duly
> ratified unit/specification artifacts govern.
>
> There is **exactly one live cockpit**. The former `WRITERS_STUDIO_BUILD_GRAPH.md` was folded
> into this file and removed — two cockpits diverge, and the divergence is invisible until it
> costs a decision. The 2026-08-14 member-upgrade ledger is frozen historical predecessor
> evidence within this same lineage, not a competing live-state source.
>
> ⛔ **Node states are evidence, not intention.** A state is set by reading canonical — file
> presence, importer count, live route — never by what a document says should be true. Update it
> in the same commit as the work that changes it.

```text
PROGRAMME          WRITER'S STUDIO R2
MODE               STAGE 7 BUILD
BUILD MODE         OPEN — BUILD-07F Developmental Decisions; census + adjudication
                   CANONICAL, DESIGN ACCEPTED, IMPLEMENTATION NOT AUTHORISED.
                   07G–H unauthorized
BOUND CANONICAL    b98676de3 (clean-main-no-secrets, 2026-09-05)
CURRENT UNIT       BUILD-07F Developmental Decisions — design accepted, awaiting review.
                   census:       WS2-07-BUILD-07F_STANDING_CENSUS_2026-09-05.md (canonical)
                   adjudication: WS2-07-BUILD-07F_ADJUDICATION_2026-09-05.md    (canonical)
                   design:       WS2-07-BUILD-07F_DESIGN_2026-09-05.md
                   SHAPE append-only standing events, current DERIVED as the unique greatest
                   event_index per (memberId, readingId, observationKey). No current row, no
                   is_current, no mutable standing. D3 and D7 stop being two invariants that
                   must agree and become one representation.
                   VALUES keep | dismiss | unresolved — three, mutually exclusive.
                   `investigate` is a DIFFERENT AXIS and is NOT a standing (Q4); it has no
                   07F persistence ruling and must not be reintroduced into the enum.
                   UNSET = zero events, never writable, never returnable-to. The recorded
                   ACT is permanent; its CURRENT EFFECT is not — an accidental standing is
                   changed by taking a later one, and the earlier event is not erased
                   (design §2).
                   CONCURRENCY the unique constraint catches SIMULTANEITY; the CAS token
                   catches STALENESS. They are not redundant — deleting either leaves a hole.
                   The expected-current test runs BEFORE the same-value no-op. No auto-retry.
                   DELETION (founder ruling) history is immutable while the Work exists;
                   deleting the Work cascades the standing stream away. That is not a D3
                   violation: D3 forbids rewriting, auto-reversion, clearing, housekeeping
                   and replacement — not a member's sovereign deletion of the whole record.
                   No standalone event delete, no "clear my standing".
                   D5/D6 are ONE boundary in two directions, both module-graph assertions:
                   standing ─X─► MAIA cognition; MAIA/system ─X─► the standing writer.
                   D6 rests on the module graph, NOT on the absent actor column — an absent
                   column makes a system write unsayable, not unwritable.
                   KIN docs/canon/CLAIM_STATE_AUTHORITY.md is analogous in direction and is
                   NOT governing authority over member standing.
PRIOR UNIT         BUILD-07E Developmental Dialogue — CLOSED / ACCEPTED (founder,
                   2026-09-05); walk W1–W9 passed at 6ff0beafc
                   record: WS2-07-BUILD-07E_DIALOGUE_CLOSURE_2026-09-05.md
RETAINED ARTIFACTS two production rows kept deliberately, named in the closure record §3:
                   the W6b seed (reading B / o1 → 2 threads; no product path creates this)
                   and the W7 thread 04c0a3c9-d897-4146-98a7-75b4cb1d36d1 (reading A / o2;
                   turn 0 written keyless, turn 1 keyed). Do not clean these up.
EVIDENCE CLASSES   local gates = the branch program · PR CI = the MERGE program GitHub
                   builds · production walk = the deployed runtime. NONE substitutes for
                   the next; a local typecheck pass is not integration evidence
                   (closure record §4 — this cost a CI cycle on ad8bc9b7e).
CLOSED FOLLOW-UP   WS2-07-F1 Developmental Semantic Boundary Repair — RATIFIED IN CANONICAL
                   (founder act 2026-09-04, determination C). The eight phenomena carry
                   is/isNot definitions in lib/manuscript/developmentalReading/contract.ts
                   (PHENOMENON_DEFINITION); positional-asymmetry was DEFINED, not retired;
                   the family is still eight. Reading contract v2 makes `phenomenon`
                   optional — `unclassifiable` is a REFUSAL CONDITION, never a ninth
                   phenomenon.
                   records: WS2-07-F1_SEMANTIC_BOUNDARY_REPAIR_2026-09-04.md
                            WS2-07-F1_LENS_AND_PHENOMENON_DEFINITIONS_DRAFT_2026-09-04.md
CLOSED FOLLOW-UP   WS2-07C-F1 Phenomenon Classification Coverage — CLOSED 2026-09-04,
                   determination C (not A; B rejected for v1). The failing claim is
                   mechanically re-derivable regularity, one epistemic layer below a
                   developmental observation; the reader should not emit it.
                   record: WS2-07C-F1_PHENOMENON_CLASSIFICATION_COVERAGE_2026-09-04.md
PRIOR UNIT         BUILD-07D Develop Surface — CLOSED / ACCEPTED (founder, 2026-09-05);
                   bound runtime 5c57e27f0; six-item production smoke PASS on the live
                   member path; F1 regression PASS; Co-Lab 33/0/0; provenance PASS.
                   Stage 7.1 (BUILD-07A–07D) complete on the bound runtime.
                   record: WS2-07-BUILD-07D_CLOSURE_2026-09-05.md
                   witness: WS2-07-BUILD-07D_DEVELOP_WITNESS_2026-09-04.md (NOT back-edited;
                            its NOT CLOSED was true of the runtime it witnessed)
PRIOR UNIT         BUILD-07C Developmental Reading — CLOSED / ACCEPTED (founder,
                   2026-09-04); canonical @ 376daae06; candidate 8a26a8971;
                   Gate A 27/0 · Gate B 13/0 (claude-opus-5)
                   record: WS2-07-BUILD-07C_READING_WITNESS_2026-09-04.md §4
PRIOR UNIT         BUILD-07B Developmental Reader — CLOSED / ACCEPTED (founder,
                   2026-09-04); canonical @ b20f2742e; Gate A 36/0 · Gate B 10/0
                   record: WS2-07-BUILD-07B_READER_WITNESS_2026-09-04.md §4
                   census:   WS2-07-BUILD-07B_READER_BOUNDARY_CENSUS_2026-09-04.md (canonical)
                   contract: WS2-07-BUILD-07B_READER_CONTRACT_2026-09-04.md (canonical;
                             F1–F20 · O1–O6; binding as merged)
PRIOR UNIT         BUILD-07A Developmental Evidence — CLOSED / ACCEPTED (founder,
                   2026-09-04); canonical @ 27ec9f895
                   record: WS2-07-BUILD-07A_EVIDENCE_WITNESS_2026-09-03.md §9
NEXT EXECUTABLE    WS2-08 HIERARCHICAL MANUSCRIPT STRUCTURE — opened by founder message
                   2026-09-06, sequenced AFTER #1228 (untouched). BUILD-08A (preserve
                   explicit heading depth at ingest) ACCEPTED AS CANDIDATE CUT, frozen
                   for an isolated PR → merge → migration → witness F1–F3+F6 cycle
                   (PR #1230, opened 2026-09-06).
                   NOT CLOSED. 08B code HOLD until 08A closes; revision/digest binding
                   must precede 08C; 08B–08E each require a separate founder act.
                   record: WS2-08_HIERARCHICAL_MANUSCRIPT_STRUCTURE_DECIDE_2026-09-06.md
                   BUILD-07F implementation still requires a separate founder act.
                   07G–H remain unopened.
                   ⛔ Acceptance of the design is not implementation authority.
WS-01              CLOSED — OVERTAKEN / SUPERSEDED (not accepted; see
                   Reconciliation record below)
CANVAS FREEZE      RETIRED FROM LIVE STATE (never released by an act; see
                   Reconciliation record below)
LAST UPDATED       2026-09-06 (WS2-08 lane opened; BUILD-08A accepted as candidate and
                   frozen for isolated witness; 08B HOLD; #1228 sequencing unchanged)
```

## Reconciliation record — 2026-09-03 (founder adjudication of programme history)

This board carried two generations of state at once. Its header still read `WS-01 ACCEPTANCE ·
BUILD MODE CLOSED · Canvas / Phase 1 freeze BINDING` while its stage block, set from canonical,
recorded Stage 6 closed and Stage 7 building. Both were on the same page for at least a day.

**What canonical shows.** The WS-01 substance — `lib/manuscript/source/{arrivals,custody,omission}.ts`,
migration `20260824000001_manuscript_source_custody.sql`, the `manuscript_source_arrivals` table —
reached canonical at `cc1f1ea10` (2026-08-27) inside an unrelated merge, not through the WS-01
acceptance walk. Stage 6A's `AuthorStructureCommand` reached canonical at `27729b31e` / PR #1169
(2026-09-02). Section-addressable drafts followed at `0fa4158e7` / `9411ddc41`. No P0-D walk, no
Founder Acceptance artifact, and no freeze-release act exist anywhere in the programme record.

**Founder ruling (2026-09-03).**

> WS-01 is **CLOSED — OVERTAKEN / SUPERSEDED**, not ACCEPTED. The WS-01 acceptance path and the
> Canvas / Phase-1 freeze attached to it were rendered obsolete by the later canonical Writer's
> Studio architecture and the Stage 6 / 6A progression. Do not invent a WS-01 acceptance walk, an
> acceptance date, or a recorded freeze-release event that did not occur. This is a present
> adjudication of the programme history: canonical advanced while the live board continued
> carrying an earlier freeze state. The board is now reconciled to the architecture that actually
> became canonical. Historical records remain historical and are not rewritten.

Consequences applied in this commit, each from the evidence above and none from intention:
the header now derives from the Stage 7 lane; the WS-01 and freeze-dependent rows below are reset
to what canonical carries; the two verdicts this board held for **Work-centered Home** (`ABSENT` in
Core Authoring, `PARTIAL` in the A4 census) collapse to the one the census already evidences.
`WS-01_SOURCE_CUSTODY_UNIT_DEFINITION.md`, the frozen acceptance specification, and the Master
Brief's §7 remain as written; they describe a gate the programme walked past, and that is the
truthful record of it.

Stage state, set from canonical evidence — the prerequisite's merge at `0fa4158e7` and its Unicode
repair at `9411ddc41`, not from intention:

```text
Stage 6   6A UNIT      CLOSED · mechanically + experientially verified
          MEMBER REACH COMPLETE · canonical @ 9411ddc41
                       new drafts are section-addressable from birth, and
                       POST { convert: true } converts an existing one
Stage 7   ACTIVE
          FIND        CLOSED · canonical @ cc9788e4f
          UNDERSTAND  CLOSED · canonical @ 5670163e6
          DECIDE      CLOSED · canonical @ 838eabfd8
          BUILD       ACTIVE
          BUILD-07A   CLOSED / ACCEPTED · founder act 2026-09-04
                      CHECK 1 production UTF8 · CHECK 2 founder-visible
                      witness 50 / 0 on clean 623d3e766 (fresh UTF8 scratch
                      DB, baseline + chain). INV-7b DEMONSTRATED · F1–F10
                      PASS · O1–O6 PASS. Code @ bfeb1a9; canonical @ 27ec9f895
          BUILD-07B   IMPLEMENTATION OPEN · founder act 2026-09-04
                      census canonical @ 543f43708; contract canonical @ 40532a5a5
                      (A1–A7: claim drafts · one lens required · 60,000 code-point
                      body ceiling, no section ceiling · no read-request · no
                      heading channel · one-way seam · eight closed non-conclusions;
                      F1–F20 / O1–O6). Closure: Gate A structural → STRUCTURALLY
                      PROVED; Gate B live reader witness on an invented fixture →
                      CLOSED / ACCEPTED 2026-09-04 · canonical @ b20f2742e
                      (Gate A 36/0 · Gate B 10/0, claude-opus-5)
          BUILD-07C   CLOSED / ACCEPTED · founder act 2026-09-04 · observation-
                      only v1 · phenomenon = UNDERSTAND §4 family · one bounded
                      classification call · two-gate closure. Candidate 8a26a8971:
                      Gate A PASS (27/0) · Gate B PASS (13/0, founder-run,
                      claude-opus-5). Canonical @ 376daae06 (PR #1191).
          BUILD-07D   IMPLEMENTATION OPEN · founder act 2026-09-04 · the writer
                      encounters an already frozen reading (list · observations by
                      durable key · lens + phenomenon · evidence via frozen readState ·
                      limits · CURRENT / SUPERSEDED / UNMEASURED · request a NEW
                      reading). No interpretation, dialogue, decisions, mutation,
                      re-anchoring, automatic refresh. Closure: tests + founder
                      witness.
          PREREQ      SECTION-ADDRESSABLE DRAFT LIVENESS · CLOSED
                      canonical @ 0fa4158e7 (PR #1174)
                      + Unicode repair @ 9411ddc41 (PR #1175)
          BUILD-07E CLOSED / ACCEPTED (founder act 2026-09-05) · BUILD-07F–H unauthorized
          (07F opens only by its own act)
Stage 8   BLOCKED ON STAGE 7 CLOSURE
```

**Why this correction has two commits and not one.** `0fa4158e7` was witnessed 41/41 and merged. A
founder review of the handoff into BUILD-07A then found a real defect in the section↔revision
locator: the migration recorded its offsets as UTF-16 code units, but its own trigger validates
against PostgreSQL `length(text)`, which counts Unicode CODE POINTS. `'A😀B'` is 4 to JavaScript and
3 to PostgreSQL — so an author writing an emoji had ordinary draft creation fail. `9411ddc41`
repairs it and records the correction forward.

⛔ **The lesson is about the witness, not the bug.** The 41/41 walk proved the FIXTURE, not the
claim: its prose was entirely BMP, so it passed under either unit. A green witness over
unrepresentative material is not evidence for the general case, and the board was — accidentally —
right to stay `PARTIAL` while that was true. The witness now carries astral prose and asserts that
the two units genuinely differ on it BEFORE relying on that, so an all-BMP fixture can never again
pass for a proof. 47 checks, 0 failures, from an empty database on canonical.

⛔ **MEMBER REACH COMPLETE is about reachability, not use.** It says a member can now cross the
structure threshold through the ordinary product path. It does not claim any member has. The Press
manuscript page is readable rather than writable on a section-addressable draft — ratified
2026-09-02 as convergence, with the Author Studio ⇄ Book Studio publishing boundary left open.

⛔ **The prerequisite closing does not close BUILD-07A.** It removes the blocker under it. `INV-7b`
stays binding and the ten falsifiers still have to run; the unit stands at 0 of 6 outcomes
demonstrated, not 4 of 6.

Writer's Studio mode reflects **this programme only**. Unrelated Jarvis incidents may sit ahead of
it in the global work queue without becoming Writer's Studio state.

> **Amendment 4 — Core Capability Mandate (2026-08-24)** is binding programme scope. Every capability
> it mandates is censused below under **CAPABILITY MANDATE CENSUS**, and stays there until delivered.
> ⛔ **A4.21:** success may not be declared while the gather, memory, structural, developmental,
> expression and authorship rows read ABSENT — a shipped manuscript editor is not fruition.

## Release signal — read mechanically, never inferred

Build authorization is per unit, through the active lane's own trigger. Product release is governed
by **Amendment 5 — Release is not fruition** (Master Brief, 2026-09-03), and a release milestone
exists only when its trigger appears here, on canonical:

```text
DEVELOPMENTAL PRIVATE BETA   Stage 7 DONE / PROVED  +  Stage 8 CLOSED / ACCEPTED
PUBLIC WRITER'S STUDIO 1.0   Stages 7–10 CLOSED / ACCEPTED  +  this census attached
                             to the release record  +  release acceptance
PROGRAMME FRUITION           Stage 15 CLOSED  +  the A4 mandate census demonstrates
                             the mandated capability set delivered and accepted
```

Today, on canonical: none of the three. Stage 7 is building; Stage 8 is blocked on Stage 7.

A green suite is not a release signal. Session narration is not a release signal. If an accepted
state requires a canonical merge, the foundation is not available for subsequent implementation
until that accepted state is on canonical.

## Programme invariant — the authority chain

```text
SOURCE / MATERIAL → MAIA MAY NOTICE → WRITER MAY RECOGNIZE
                  → WRITER MAY DECIDE → WORK MAY CHANGE
```

⛔ **No automatic arrow. Every arrow may stop.** This governs every capability below.

## Node states

```text
LIVE            reachable by a member in production
PARTIAL         reachable but incomplete against its capability definition
ZERO-CALLERS    merged code that nothing imports — built, unwired, invisible
IN ACCEPTANCE   under a frozen walk; not yet accepted
BLOCKED         cannot start; blocker named
DESIGNED        specified, not built
ABSENT          no design, no code
UNVERIFIED      not yet censused against canonical — NOT a claim of absence
```

`ZERO-CALLERS` is the state this board exists for: how excellent work becomes invisible and is
later rebuilt beside itself. `UNVERIFIED` is the state that keeps the board honest — a roadmap
concept is not a repo fact, and inference must never render as evidence.

**Capability sequencing is not unit numbering.** These rows exist so no capability is quietly left
unbuilt while the unit list reads complete. They create no WS-08+.

## FOUNDATION

| Node | State | Evidence / next |
|---|---|---|
| WS-01 Source Custody | **CLOSED — OVERTAKEN** | substance on canonical since `cc1f1ea10` (2026-08-27): `lib/manuscript/source/**` (4 files), migration `20260824000001`, `manuscript_source_arrivals`. Acceptance walk (P0-D, A–H, Founder Acceptance) **never performed**; ingest HTTP path unwitnessed. See Reconciliation record |
| Restore floor | **PARTIAL** | append-only `working_draft_revisions` + keep-a-version in `app/press/manuscript/workingDraftClient.ts` on canonical; no member restore / compare surface (same evidence as SAFETY below). A1.6 floor, not versioning |
| Work Structure | **LIVE** | `AuthorStructureCommand` at `27729b31e` / PR #1169; section-addressable drafts at `0fa4158e7` + `9411ddc41`; MEMBER REACH COMPLETE per stage block. Member-declared, no chapter schema. Use by a member: **UNVERIFIED** |
| #995 Harvest | **BLOCKED** | freeze retired, but no unit authorizes it: PR #995 open since 2026-08-06 against stale base `ced4ab513`; canvas cluster still 0 importers; WS-02 never opened |

## CANVAS SUBSTRATE — the zero-caller cluster

| Node | State | Evidence |
|---|---|---|
| `components/canvas/CanvasShell.tsx` | **ZERO-CALLERS** | merged on canonical; **0 importers** |
| `components/canvas/registry.ts` | **ZERO-CALLERS** | merged on canonical; **0 importers** |
| `app/writers-studio/canvas/WritingSurface.tsx` — easel, four papers | **ZERO-CALLERS** | merged on canonical; **0 importers** |
| Wiring (`canvas/page.tsx` as the writing deployment) | **DESIGNED** | PR #995, open since 2026-08-06; carries a regex-authority defect to remove first |
| Live canvas page | **PARTIAL** | imports `Worktable`, `WorkDrawer`, `MaterialsDrawer` — the superseded generation |

> The shell, the easel and the papers are **finished and unreachable**. WS-02 connects them.
> ⛔ We do not build a second Worktable beside them.

## CORE AUTHORING

| Node | State | Evidence / next |
|---|---|---|
| Work-centered Home | **PARTIAL** | `app/writers-studio/{page,HomeView,homeState,useLivingWorks}.tsx/ts` + 5 test files, route live — the same evidence as A4 row 1 below; the six A4.1 questions remain **UNVERIFIED**. (Reconciled 2026-09-03: this row read `ABSENT` while the census read `PARTIAL`) |
| Worktable (serious long-form) | **PARTIAL** | a textarea; the researched surface is the zero-caller easel |
| Structure · Outline · Read · Compare | **ABSENT** | — |

## MATERIAL

| Node | State | Evidence / next |
|---|---|---|
| Gather / Materials | **PARTIAL** | belonging gesture exists (`MaterialsDrawer`, `living_work_materials`) |
| Transcript intake · Research · Fragments | **ABSENT** | — |

## MAIA

| Node | State | Evidence / next |
|---|---|---|
| Creative Companion (Reflect · Question · Notice · Connect · Shape · Develop · Critique) | **ABSENT** | the Window renders one honest sentence |
| **Developmental Editor** | **DESIGNED** | `DEVELOPMENTAL_EDITOR_CAPABILITY.md`. Spans seed → mature manuscript; **Work Structure is a dependency of the structure-aware lenses only**, not of the whole capability. Mature-manuscript fixture: `ELEMENTAL_ALCHEMY_MANUSCRIPT.md` Ch10 `L3492–3817`, 5 pre-registered findings |
| Whole-Work Intelligence | **ABSENT** | — |
| Memory / Provenance (source → notice → recognition → decision → Work) | **DESIGNED** | programme invariant §A1.3 |

## SAFETY / CONTINUITY

| Node | State | Evidence / next |
|---|---|---|
| Restore floor | **PARTIAL** | append-only `working_draft_revisions` + keep-a-version on canonical; no member restore / compare surface. WS-01's acceptance walk never ran (see Reconciliation record) |
| Version history · Compare · Named snapshots | **ABSENT** | kept revisions exist; no compare, no restore UX — Stage 8 |

## FIELD · EXPRESSION

| Node | State | Evidence / next |
|---|---|---|
| Field View (spatial/relational — ⛔ not "Canvas") | **ABSENT** | C2 — Field View, not a fourth Canvas |
| Essay · Lecture · Course · Audio · Publishing | **ABSENT** | — |

## UNVERIFIED — to census when relevant

Not claims of absence. Nobody has censused these against canonical, and they must not be read as
established until someone does.

| Node | State | Next |
|---|---|---|
| Manuscript referent — which Chapter 10 is the Work | **UNVERIFIED** | founder decision; four drafts disagree (see capability spec) |
| Book Mode / manuscript-scale surfaces beyond Worktable | **UNVERIFIED** | capability census |
| Press Editor handoff surface (WS-07) | **UNVERIFIED** | capability census |
| Member-facing convergence inherited from the 2026-08-14 lane | **UNVERIFIED** | reconcile against predecessor ledger |

## CAPABILITY MANDATE CENSUS (Amendment 4)

Required by **A4.16**. Every mandated capability appears here **until it is delivered**. States are
artifact-derived — read from canonical `bd87d497f` on 2026-08-24, never from a specification.

⛔ **A4.21 — the prohibition on partial success.** Jarvis may not declare Writer's Studio successful
while these rows read ABSENT. A shipped manuscript editor is not fruition.

| A4 | Capability | State | Evidence on canonical | Dependency | Vertical slice | Real-Work acceptance | Blocker / next |
|---|---|---|---|---|---|---|---|
| 1 | Work-Centered Home | **PARTIAL** | `app/writers-studio/{page,HomeView,homeState,useLivingWorks}.tsx/ts` + 5 test files, route live | — | home answers A4.1's six questions | returning to a real Work | the six questions are **UNVERIFIED**; only presence is proven |
| 1 | Formless Work — no genre at creation | **PARTIAL** | `20260801000002_living_work_title_optional`, `20260805000001_living_work_form_stage` — `form` nullable, `stage ∈ capturing/developing/writing/refining/sharing` | — | create a Work with no declared form | A · Seed | substrate present; **surface still presents the manuscript as the anchor** |
| 2 | Living manuscripts — write / revise / continue | **PARTIAL** | `member_manuscripts` (14 files), `manuscript_sections` (9), `Worktable`/`WorkDrawer` live on the canvas route | — | — | Elemental Alchemy, 211pp | undo · recovery · manuscript-scale perf **UNVERIFIED** |
| 2 | Manuscript-wide find · safe find/replace | **ABSENT** | `findInDraft` → **0 files**; no find/replace symbol on canonical | living manuscripts | — | Ch10 misplaced-copy search | authored on an unmerged branch only — A4.0 says that is not presence |
| 2 | Return continuity beyond cursor position | **UNVERIFIED / TO CENSUS** | not censused | memory + provenance | — | return after a month | census before claiming either way |
| 3 | Transcript & material intake | **PARTIAL** | `mammoth` (5), `pdf-parse` (8), `fileVault` (2), `api/book-studio/workbench/uploads/**` | — | — | real transcripts | recordings · voice notes · images **UNVERIFIED** |
| 3 | Never silently transform an artifact into manuscript text | **PARTIAL** | `lib/manuscript/source/{arrivals,custody,omission}.ts` + migration `20260824000001` + `manuscript_source_arrivals` on canonical since `cc1f1ea10` | — | landed outside any unit (WS-01 overtaken) | real ingest over the HTTP path — **never witnessed** | substrate present; the P0-D proof that was to bind it never ran. Witness belongs to Stage 9 (Gather) |
| 4 | Materials distinguishable **at the data level** | **PARTIAL** | `living_work_materials`: `material_type`, `declared_by`, `relationship_sentence` — belonging is already a **declared writer act**, not a styling choice | source custody | — | C · Material field | full A4.4 vocabulary not enumerated against schema |
| 5 | MAIA as creative companion — nine stances | **UNVERIFIED / TO CENSUS** | no Studio-scoped stance surface identified; `developmental` matches 337 files, none Studio-scoped | Work + material | — | all four classes | census what, if anything, already serves Reflect/Question/Notice/Connect |
| 5 | `Edit` only on explicit request | **DESIGNED** | capability spec; no runtime | companion | — | D · Ch10 | ⛔ default must never be `analyze → generate replacement` |
| 6 | **Developmental Editor** | **DESIGNED** | `DEVELOPMENTAL_EDITOR_CAPABILITY.md` carries the full genesis `STARTER CONCEPT → … → MATURE MANUSCRIPT` (L71) and all five stances; `DevelopmentalEditor` → **0 files** | canonical L58: Work Structure is a dependency of the **structure-aware lenses only** | — | A–D | remains on this board until member-facing |
| 6 | Pre-structure stances — `DISCOVER · GATHER · SHAPE` | **DESIGNED** | canonical spec L79–L110: `DISCOVER · early GATHER` → *"no structure required"*, named **the first buildable slices**; no runtime | **none** — begins before structure | next after WS-01 | A · Seed, B · Scraps | where the A4.6 violation is *easiest*: no Work contradicts a premature declaration |
| 6 | Structure-aware lenses — continuity · sequencing · arc | **DESIGNED** | no runtime | authoritative Work Structure — **now on canonical** (`27729b31e`, Stage 6A) | — | D · Ch10 | dependency satisfied 2026-09-02; waits on BUILD-07B+ authorization, not on structure |
| 7 | Acceptance corpus A · Seed | **ABSENT** | not authored | — | — | — | author before claiming pre-structure capability |
| 7 | Acceptance corpus B · Scraps | **ABSENT** | not authored | — | — | — | author |
| 7 | Acceptance corpus C · Material field | **ABSENT** | not authored | — | — | — | author |
| 7 | Acceptance corpus D · Ch10 mature Work | **DESIGNED** | canonical spec L117 — fixture is **`MATURE MANUSCRIPT` stance only**; L124 — *"nothing here rules on the authoritative Work"* | — | #1085 proof substrate | — | `fixture_referent` ≠ authoritative Work; the latter stays **UNRESOLVED** |
| 8 | Memory with provenance — eight kinds of knowing | **UNVERIFIED / TO CENSUS** | schema vocabulary exists unevenly: `decision` 24 · `note` 18 · `transcript` 4 · `recognition` 3 · `observation` 1 | source custody | — | — | never censused as **one** provenance model |
| 9 | Structural perspective — member-defined units | **ABSENT** | no member-defined structural-unit surface on canonical | Work Structure | — | Elemental Alchemy | ⛔ no universal `Part → Chapter → Section` schema |
| 10 | Writer-controlled meaning — eight dispositions | **ABSENT** | no keep/discuss/recognize/decide/adopt/reject/unresolved surface | companion + memory | — | — | this is where interpretation silently becomes authority |
| 11 | Draft & revision continuity | **ABSENT** | `manuscript_versions` / `version_history` → **0 files** | source custody | — | real revision episodes | ⛔ *"a writer should not become conservative because the software makes experimentation dangerous"* |
| 12 | Creative distances — Close · Near · Middle · Far · Outward | **ZERO-CALLERS** | the Canvas cluster — see CANVAS SUBSTRATE above for per-module importer evidence; cluster is member-unreachable | — | WS-02 harvest | — | ⛔ never render as `Step 1 → 2 → 3` |
| 13 | Expression & publishing support | **PARTIAL** | expressions are a separate table; `expression_type` open `TEXT`; `api/book-studio/render/epub` | Work | — | lecture / course / audio | ⛔ a lecture is not a book in bullets — re-expression, not export |
| 14 | Finished-looking is not finished | **ABSENT** | the eight readiness states are not in schema | Work | — | — | ⛔ MAIA may notice; **release remains a writer act** |
| 15 | Human authorship made **visible** | **UNVERIFIED / TO CENSUS** | not censused | all of the above | — | founder experience test | boundaries must be visible, not hidden inside automation |

**Reading this table.** Eight ABSENT · seven PARTIAL · four UNVERIFIED · five DESIGNED · one
ZERO-CALLERS · zero BLOCKED · zero IN ACCEPTANCE — 25 rows. (Recounted 2026-09-03: the previous
line said four PARTIAL and one BLOCKED / one IN ACCEPTANCE; the table already held six PARTIAL
before this reconciliation.) The delivered mass sits in **manuscript editing, intake and now
authored structure**; the gather, memory, developmental, expression and authorship capabilities are
**overwhelmingly not built**. That is precisely the imbalance A4.21 forbids declaring as success,
and it is the census a release record must carry under Amendment 5.

## Advancing now

```text
BUILD-07B · Developmental Reader — IMPLEMENTATION OPEN (founder act
            2026-09-04) against the canonical contract @ 40532a5a5. Flow:
            CLOSED / ACCEPTED, canonical @ b20f2742e.
BUILD-07C · Developmental Reading — CLOSED / ACCEPTED 2026-09-04
            (candidate 8a26a8971 · Gate A 27/0 · Gate B 13/0). A frozen,
            durable DevelopmentalReading exists on canonical @ 376daae06:
            identity, observations, phenomenon, provenance, immutability,
            three-state supersession.
BUILD-07D · Develop Surface — IMPLEMENTATION OPEN (founder act 2026-09-04).
            The writer-visible threshold: encounter a frozen reading, by
            durable identity, with its evidence, limits and current state;
            request a new one. Nothing on the surface may reinterpret,
            rewrite, mutate, re-anchor or silently refresh a reading.
            Lane: JARVIS-WS2-07-DEVELOPMENTAL-INTELLIGENCE-01.
```

Everything else is **unauthorized**. BUILD-07E was opened and then CLOSED / ACCEPTED by founder
acts of 2026-09-05, bound to `6ff0beafc`. BUILD-07F opens only by its own act — 07E closing does
not open it.
Release milestones are defined by Amendment 5 and read from the Release signal above.

## Board discipline

- Update this file **as part of the work it describes** — never afterwards, never elsewhere.
- A node's state must be bindable to an artifact. If it cannot be, it is `UNVERIFIED`.
- Built ≠ wired ≠ surfacing ≠ verified. Declaration is not liveness.
- **Blast radius, not code size, sets classification.** Any destructive, bulk, cross-member,
  cross-project, production-data or hard-to-reconstruct mutation is never a routine decision.
