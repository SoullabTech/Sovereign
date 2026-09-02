# Writer's Studio — Programme Board

> **The one live cockpit. Live operational state only — not a constitution, not a roadmap.**
>
> ```text
> NORMATIVE AUTHORITY   docs/programme/WRITERS_STUDIO_MASTER_BRIEF.md
> CAPABILITY SPEC       docs/programme/DEVELOPMENTAL_EDITOR_CAPABILITY.md
> ROADMAP (direction)   docs/programme/WRITERS_STUDIO_ROADMAP_STAGE_6_TO_15.md
> ACTIVE LANE           docs/programme/JARVIS-WS2-07-DEVELOPMENTAL-INTELLIGENCE-01.md
> UNIT DEFINITION       docs/programme/WS-01_SOURCE_CUSTODY_UNIT_DEFINITION.md
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
MODE               WS-01 ACCEPTANCE
BUILD MODE         CLOSED — Canvas / Phase 1 freeze BINDING
BOUND CANONICAL    7f0dae9484a93a2146680e11a226111081bf4982
CURRENT UNIT       WS-01 Source Custody + Freeze Release
CURRENT CANDIDATE  4a551d3d13a27ec442252be7822865e0f2d31978
                   feature/ws-01-source-custody-v3  ·  PINNED / DEPLOYED
NEXT EXECUTABLE    P0-D
LAST UPDATED       2026-09-02
```

Stage state, set from canonical evidence — the prerequisite's merge at `0fa4158e7`, not from
intention:

```text
Stage 6   6A UNIT      CLOSED · mechanically + experientially verified
          MEMBER REACH COMPLETE · canonical @ 0fa4158e7
                       new drafts are section-addressable from birth, and
                       POST { convert: true } converts an existing one
Stage 7   ACTIVE
          FIND        CLOSED · canonical @ cc9788e4f
          UNDERSTAND  CLOSED · canonical @ 5670163e6
          DECIDE      CLOSED · canonical @ 838eabfd8
          BUILD       ACTIVE
          BUILD-07A   OPEN · RESUMED — prerequisite closed; INV-7b and the
                      original falsifiers still to prove
          PREREQ      SECTION-ADDRESSABLE DRAFT LIVENESS · CLOSED
                      canonical @ 0fa4158e7 · PR #1174
          BUILD-07B–H unauthorized
Stage 8   BLOCKED ON STAGE 7 CLOSURE
```

**Post-merge witness on canonical, 2026-09-02.** `scripts/ws2-07-liveness-witness.ts` — 41 checks,
0 failures, against a PostgreSQL 16 database built from ZERO by canonical's own migration chain, on
`0fa4158e7`. The route's private `composeDraftText` is absent from canonical; only the comment
recording its deletion remains. B1, B2 and B3 are closed as canonical facts, not branch facts.

⛔ **Stage 6 MEMBER REACH COMPLETE is about reachability, not about use.** It says a member can now
cross the structure threshold through the ordinary product path. It does not claim any member has.
The Press manuscript page is readable rather than writable on a section-addressable draft — ratified
2026-09-02 as convergence, with the Author Studio ⇄ Book Studio publishing boundary left open.

Writer's Studio mode reflects **this programme only**. Unrelated Jarvis incidents may sit ahead of
it in the global work queue without becoming Writer's Studio state.

> **Amendment 4 — Core Capability Mandate (2026-08-24)** is binding programme scope. Every capability
> it mandates is censused below under **CAPABILITY MANDATE CENSUS**, and stays there until delivered.
> ⛔ **A4.21:** success may not be declared while the gather, memory, structural, developmental,
> expression and authorship rows read ABSENT — a shipped manuscript editor is not fruition.

## Release signal — read mechanically, never inferred

BUILD MODE is closed until all three appear here, on canonical:

```text
WS-01 ACCEPTED  +  CANVAS FREEZE RELEASED  +  NEXT BUILD UNIT AUTHORIZED
```

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
| WS-01 Source Custody | **IN ACCEPTANCE** | candidate `e92f53239`; P0-M PASS, P0-D owed. `lib/manuscript/source/**` is **not on canonical** — candidate only |
| Restore floor | **IN ACCEPTANCE** | required by frozen walk act **H**; rides with WS-01 |
| Work Structure | **BLOCKED** | by WS-01. Contract ruled (Phase 3A); member-declared, no chapter schema |
| #995 Harvest | **BLOCKED** | by Canvas freeze |

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
| Work-centered Home | **ABSENT** | — |
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
| Restore floor | **IN ACCEPTANCE** | WS-01 |
| Version history · Compare · Named snapshots | **ABSENT** | kept revisions exist; no compare, no restore UX |

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
| 3 | Never silently transform an artifact into manuscript text | **IN ACCEPTANCE** | WS-01 candidate `e92f53239`; `manuscript_source_arrivals` → **0 files on canonical** | — | WS-01 | P0-D | **P0-D is the only executable proof** |
| 4 | Materials distinguishable **at the data level** | **PARTIAL** | `living_work_materials`: `material_type`, `declared_by`, `relationship_sentence` — belonging is already a **declared writer act**, not a styling choice | source custody | — | C · Material field | full A4.4 vocabulary not enumerated against schema |
| 5 | MAIA as creative companion — nine stances | **UNVERIFIED / TO CENSUS** | no Studio-scoped stance surface identified; `developmental` matches 337 files, none Studio-scoped | Work + material | — | all four classes | census what, if anything, already serves Reflect/Question/Notice/Connect |
| 5 | `Edit` only on explicit request | **DESIGNED** | capability spec; no runtime | companion | — | D · Ch10 | ⛔ default must never be `analyze → generate replacement` |
| 6 | **Developmental Editor** | **DESIGNED** | `DEVELOPMENTAL_EDITOR_CAPABILITY.md` carries the full genesis `STARTER CONCEPT → … → MATURE MANUSCRIPT` (L71) and all five stances; `DevelopmentalEditor` → **0 files** | canonical L58: Work Structure is a dependency of the **structure-aware lenses only** | — | A–D | remains on this board until member-facing |
| 6 | Pre-structure stances — `DISCOVER · GATHER · SHAPE` | **DESIGNED** | canonical spec L79–L110: `DISCOVER · early GATHER` → *"no structure required"*, named **the first buildable slices**; no runtime | **none** — begins before structure | next after WS-01 | A · Seed, B · Scraps | where the A4.6 violation is *easiest*: no Work contradicts a premature declaration |
| 6 | Structure-aware lenses — continuity · sequencing · arc | **BLOCKED** | no runtime | **requires** authoritative Work Structure | — | D · Ch10 | blocked on Work Structure, not on the editor |
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

**Reading this table.** Eight ABSENT · four PARTIAL · four UNVERIFIED · five DESIGNED · one
ZERO-CALLERS · one BLOCKED · one IN ACCEPTANCE. The delivered mass sits in **manuscript editing and
intake**; the gather, memory, structural, developmental, expression and authorship capabilities are
**overwhelmingly not built**. That is precisely the imbalance A4.21 forbids declaring as success.

## Advancing now

```text
WS-01 · P0-D — deploy candidate e92f53239, prove deployed identity,
               exercise the real ingest HTTP path, record, stop.
```

Everything else is **CLOSED** until WS-01 is accepted and the freeze releases.

## Board discipline

- Update this file **as part of the work it describes** — never afterwards, never elsewhere.
- A node's state must be bindable to an artifact. If it cannot be, it is `UNVERIFIED`.
- Built ≠ wired ≠ surfacing ≠ verified. Declaration is not liveness.
- **Blast radius, not code size, sets classification.** Any destructive, bulk, cross-member,
  cross-project, production-data or hard-to-reconstruct mutation is never a routine decision.
