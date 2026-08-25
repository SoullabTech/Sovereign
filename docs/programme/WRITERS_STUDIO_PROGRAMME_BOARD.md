# Writer's Studio — Programme Board

> **The one live cockpit. Live operational state only — not a constitution, not a roadmap.**
>
> ```text
> NORMATIVE AUTHORITY   docs/programme/WRITERS_STUDIO_MASTER_BRIEF.md
> CAPABILITY SPEC       docs/programme/DEVELOPMENTAL_EDITOR_CAPABILITY.md
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
BOUND CANONICAL    8fa03f48a
CURRENT UNIT       WS-01 Source Custody + Freeze Release
CURRENT CANDIDATE  e92f532396705daaf6cd346445276a08a5957904
                   feature/ws-01-source-custody-v2  ·  PINNED, untouched
NEXT EXECUTABLE    P0-D
LAST UPDATED       2026-08-25
```

Writer's Studio mode reflects **this programme only**. Unrelated Jarvis incidents may sit ahead of
it in the global work queue without becoming Writer's Studio state.

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
