# Writer's Studio — Programme Board

> **Live operational state only. This is a cockpit, not a constitution.**
>
> ```text
> NORMATIVE AUTHORITY   docs/programme/WRITERS_STUDIO_MASTER_BRIEF.md
> LIVE STATE (here)     docs/programme/WRITERS_STUDIO_PROGRAMME_BOARD.md
> HISTORICAL EVIDENCE   docs/design/author-studio/WRITERS_STUDIO_MEMBER_UPGRADE_PROGRAMME_LEDGER.md
> ```
>
> The **Master Brief** governs meaning, architecture, invariants and unit identity. This board
> records **current execution state only**. Where they conflict, the Master Brief and duly
> ratified unit/specification artifacts govern.
>
> The 2026-08-14 member-upgrade ledger is **historical predecessor evidence within this same
> programme lineage** — not a competing live-state source. It is frozen and not updated.
>
> No essays here. No archaeology. No duplicated specification. If a row needs argument, the
> argument belongs in the Brief or a unit definition, and the row carries the outcome.

```text
PROGRAMME          WRITER'S STUDIO R2
MODE               FORENSIC          (iOS memory incident — MODEL USE probe outstanding)
BOUND CANONICAL    8fa03f48a
CURRENT UNIT       WS-01 Source Custody + Freeze Release
CURRENT CANDIDATE  e92f532396705daaf6cd346445276a08a5957904
                   feature/ws-01-source-custody-v2  ·  PINNED
FREEZES            CANVAS / PHASE 1 FREEZE — REMAINS, BINDING
NEXT EXECUTABLE    P0-D  (the only next executable WS-01 proof)
LAST UPDATED       2026-08-25
```

## Release signal — read mechanically, never inferred

Writer's Studio BUILD MODE is **closed** until all three appear here:

```text
WS-01             ACCEPTED
CANVAS FREEZE     RELEASED
NEXT BUILD UNIT   AUTHORIZED
```

Until then the freeze holds. A green test suite is not a release signal. Session narration is
not a release signal. If an accepted state requires a canonical merge, the foundation is not
available for subsequent implementation until that accepted state is **on canonical**.

## Programme invariant — the authority chain

```text
SOURCE / MATERIAL → MAIA MAY NOTICE → WRITER MAY RECOGNIZE
                  → WRITER MAY DECIDE → WORK MAY CHANGE
```

⛔ **No automatic arrow. Every arrow may stop.** This governs every capability below.

## Capability graph

Capability sequencing is **not** unit numbering. These rows exist so no capability is quietly
left unbuilt while the unit list reads complete. They do not create WS-08+.

Legend — `STATE`: Built · Partial · Designed · Planned · Frozen · Future

### FOUNDATION

| Capability | State | Dependencies | Current slice | Real-Work acceptance | Blocker / next |
|---|---|---|---|---|---|
| Source custody | In acceptance | — | WS-01 | real ingest | **P0-D** |
| Work structure | Designed | WS-01 | — | Elemental Alchemy | WS-01 release |
| #995 convergence | Frozen | WS-01 release | WS-02 harvest | — | Canvas freeze |

### CORE WORK

| Capability | State | Dependencies | Current slice | Real-Work acceptance | Blocker / next |
|---|---|---|---|---|---|
| Work-centered Home | Designed | Work structure | — | — | WS-01 release |
| Living manuscript | Designed | Work structure | — | Elemental Alchemy | WS-01 release |
| Worktable | Partial | #995 harvest | existing components | edit real chapter | Canvas freeze |
| Structure / navigation | Partial | Work structure | chapter navigation | navigate full book | WS-01 release |
| Outline · Read · Compare | Planned | Work structure | — | — | WS-01 release |

### MATERIALS

| Capability | State | Dependencies | Current slice | Real-Work acceptance | Blocker / next |
|---|---|---|---|---|---|
| Gather · Fragments | Planned | Source custody | — | — | WS-01 |
| Transcript intake | Partial | Source custody | intake | real interview transcript | — |
| Research | Planned | Source custody | — | — | — |
| Source provenance | Partial | Source custody | authorship chain | — | — |

### MAIA

| Capability | State | Dependencies | Current slice | Real-Work acceptance | Blocker / next |
|---|---|---|---|---|---|
| Creative Companion | Partial | Work structure | — | — | WS-01 release |
| **Developmental Editor** | **Designed / not yet executable** | authoritative Work Structure + WS-01 release | chapter-level developmental reading | **Elemental Alchemy — Chapter 10** | WS-01 release |
| Memory + provenance | Partial | Source provenance | decisions | remember Ch. 10 ruling | — |
| Recognition / decisions | Designed | authority chain | — | Ch. 10 decisions | WS-01 |
| Whole-Work intelligence | Future | Work structure | — | — | — |

### REVISION

| Capability | State | Dependencies | Current slice | Real-Work acceptance | Blocker / next |
|---|---|---|---|---|---|
| Restore floor | In acceptance | WS-01 | walk act H | restore real Work | **P0-D** |
| History · Versions · Compare | Partial | Restore floor | baseline exists | restore real Work | WS-01 release |

### FIELD

| Capability | State | Dependencies | Current slice | Real-Work acceptance | Blocker / next |
|---|---|---|---|---|---|
| Spatial / relational view | Frozen | #995 convergence | — | — | C2 — Field View, not a fourth Canvas |

### EXPRESSION

| Capability | State | Dependencies | Current slice | Real-Work acceptance | Blocker / next |
|---|---|---|---|---|---|
| Book · Essay · Lecture · Course · Audio | Future | Core Work | — | real book / lecture | — |
| Press / publication handoff | Designed | WS-07 | — | — | WS-01..WS-06 |

## Developmental Editor — first slice

```text
STATE             DESIGNED / NOT YET EXECUTABLE
DEPENDENCY        authoritative Work Structure + WS-01 release
FIRST SLICE       chapter-level developmental reading
REAL-WORK TEST    Elemental Alchemy — Chapter 10
FIXTURE PURPOSE   test editor behaviour, NOT settle or rewrite Chapter 10
```

**Chapter 10 editorial standard — Maya is the protagonist, not an illustration.**

Maya lives the process first; the reader recognizes the pattern through her; Spiralogic names
what is already happening only when useful. The chapter should move *Maya's life → elemental
movement → reflection → light naming → back to Maya*, never *principle → Maya as example*.

Her arc is the elemental sequence — Fire/If, Water/Why, Earth/How, Air/What, Aether — and then
**she spirals again**. Development does not end at Air. Recurrence, shadow and new calls are
what make it a living process rather than a five-step recipe.

The recognition to build: **subordination is not the same as presence.** She can appear
throughout and still be reduced if every appearance is positioned as illustration of a
principle already stated. Detectable signals:

- structural position — does explanation precede and frame her, or does she precede and the
  naming follow?
- continuity vs. reset — one advancing time-thread, or instances re-established per section?
- arc integrity — sequence present and in order, and **recurrence after Air**?
- distribution — where her narrative disappears, not merely how often she appears.

The Editor produces **evidence pointing at real passages**, e.g. *"three successive sections
state the governing principle before Maya encounters it; this may be positioning her as
illustration rather than protagonist."* Subordination remains an editorial judgment. The Editor
notices; the writer decides. No manuscript mutation without explicit adoption — the authority
chain above, applied.

## Board discipline

- Update this file **as part of the work it describes** — never afterwards, never elsewhere.
- A row's `STATE` must be bindable to an artifact. If it cannot be, it is not that state.
- Built ≠ wired ≠ surfacing ≠ verified. Declaration is not liveness.
- `MODE` is FORENSIC when something is broken, ambiguous, or identity/security-sensitive;
  BUILD otherwise. FORENSIC binds runtime and traces requests. BUILD proves through
  implementation: static · test · runtime · felt, sized to the unit.
- **Blast radius, not code size, sets classification.** Any destructive, bulk, cross-member,
  cross-project, production-data or hard-to-reconstruct mutation is never a routine decision.
