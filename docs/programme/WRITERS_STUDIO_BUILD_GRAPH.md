# Writer's Studio — Build Graph

> **Jarvis maintains this file.** It is the operational cockpit, not a roadmap. Every session must
> be able to say which nodes exist, which are partial, which are blocked, which have **zero
> callers**, and which one it is advancing now.
>
> ⛔ **Node states are evidence, not intention.** A state is set by reading canonical — file
> presence, importer count, live route — never by what a document says should be true. Update it in
> the same commit as the work that changes it.

**Verified against canonical `8fa03f48a`, 2026-08-24.**

## Authority hierarchy

```text
NORMATIVE AUTHORITY      WRITERS_STUDIO_MASTER_BRIEF.md
                         meaning · architecture · invariants · unit identities

LIVE OPERATIONAL STATE   WRITERS_STUDIO_BUILD_GRAPH.md   ← this file
                         the SINGLE cockpit. ⛔ There is no second board:
                         two cockpits recreate the ambiguity one is for.

CAPABILITY SPEC          DEVELOPMENTAL_EDITOR_CAPABILITY.md
                         subordinate to the brief; not programme authority

HISTORICAL / FROZEN      docs/design/author-studio/
                         WRITERS_STUDIO_MEMBER_UPGRADE_PROGRAMME_LEDGER.md
                         same Writer's Studio lineage, superseded as live
                         authority; preserved as custody evidence
```

## States

```text
LIVE          reachable by a member in production
PARTIAL       reachable but incomplete against its capability definition
ZERO-CALLERS  merged code that nothing imports — built, unwired, invisible
IN ACCEPTANCE under a frozen walk; not yet accepted
PROOF SUBSTRATE
              the material it must operate on exists and is verified,
              but the member capability is not built
BLOCKED       cannot start; blocker named
DESIGNED      specified, not built
ABSENT        no design, no code
```

`ZERO-CALLERS` is the state this graph exists for. It is how excellent work becomes invisible and
is later rebuilt beside itself.

---

## FOUNDATION

| Node | State | Evidence |
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

> The shell, the easel and the papers are **finished and unreachable**. WS-02 connects them. ⛔ We
> do not build a second Worktable beside them.

## CORE AUTHORING

| Node | State |
|---|---|
| Work-centered Home | **ABSENT** |
| Worktable (serious long-form) | **PARTIAL** — a textarea; the researched surface is the zero-caller easel |
| Structure · Outline · Read · Compare | **ABSENT** |

## MATERIAL

| Node | State |
|---|---|
| Gather / Materials | **PARTIAL** — belonging gesture exists (`MaterialsDrawer`, `living_work_materials`) |
| Formless Work (*"I don't know what this is yet"*) | **PARTIAL** — **substrate already allows it**: `living_works` needs only `member_id` + `title`, expressions are a separate table, `expression_type` is open TEXT. Unreachable in the interface, which presents the manuscript as the anchor. **No schema work needed** |
| Transcript intake · Research · Fragments | **ABSENT** |

## MAIA

| Node | State |
|---|---|
| Creative Companion (Reflect · Question · Notice · Connect · Shape · Develop · Critique) | **ABSENT** — the Window renders one honest sentence |
| **Developmental Editor** | see the node below — ⛔ **not a single state** |
| Whole-Work Intelligence | **ABSENT** |
| Memory / Provenance (source → notice → recognition → decision → Work) | **DESIGNED** — programme invariant §A1.3 |

### Node — Developmental Editor

⛔ **This node must never collapse to a single state.** Recorded in full because the collapse has a
name: *an excellent manuscript critic, shipped and called the Developmental Editor.* That is not
the product.

```text
DEVELOPMENTAL EDITOR

STATE
    DESIGNED  ·  PROOF SUBSTRATE EXISTS  ·  MEMBER CAPABILITY NOT BUILT

ENTRY CONDITIONS
    · starter concept
    · idea
    · scraps / fragments
    · piles of notes
    · transcripts / research / gathered materials
    · emerging Work
    · structured manuscript
    · mature manuscript

CORE STANCES
    DISCOVER   GATHER   SHAPE   DEVELOP   REVISE

DEPENDENCIES
    Base developmental conversation
        does NOT require Work Structure

    Structure-aware lenses
        REQUIRE authoritative member-declared Work Structure

    Manuscript continuity / reader-knowledge / sequencing
        REQUIRE Work Structure

    Safe adoption into Work
        REQUIRE provenance + writer decision boundary

    Revision
        REQUIRE recoverable history / version semantics
```

### Acceptance corpus

```text
A — SEED            starter concept / one living idea
                    proves: exploration without premature structure

B — SCRAPS          fragments, notes, partial passages
                    proves: noticing relationships without declaring belonging

C — MATERIAL FIELD  notes + transcripts + research + sources
                    proves: gathering / clustering / possible shapes
                            while preserving provenance

D — MATURE WORK     Elemental Alchemy Chapter 10
                    proves: continuity, development, arc, subordination,
                            recurrence, whole-Work awareness, author restraint
```

**A · B · C are ABSENT** — only D is authored.

### The common failure condition

> ⛔ **MAIA must not convert developmental possibility into canonical Work without writer
> recognition and decision.**

It applies with exactly equal force to

```text
"These seven scraps could form a chapter."     ← condition B
"Rewrite Chapter 10 this way."                 ← condition D
```

A build that honours it at D and breaks it at B has not passed.

### Fixture referent ≠ Work referent

```text
FIXTURE REFERENT          Elemental Alchemy Chapter 10, at the pinned range
                          ELEMENTAL_ALCHEMY_MANUSCRIPT.md  L3492–3817

AUTHORITATIVE WORK        UNRESOLVED / OUT OF SCOPE
REFERENT                  three Chapter 10s disagree; a fourth is in production

FIXTURE DOCTRINE          Maya is protagonist.
                          Her lived development carries the teaching.
                          Spiralogic names and orients the pattern.
```

⛔ **No manuscript custody decision is implied by any of this.** The doctrine governs how the
fixture is read for testing, not what the book becomes.

---

## SAFETY / CONTINUITY

| Node | State |
|---|---|
| Restore floor | **IN ACCEPTANCE** (WS-01) |
| Version history · Compare · Named snapshots | **ABSENT** — kept revisions exist; no compare, no restore UX |

## FIELD · EXPRESSION

| Node | State |
|---|---|
| Field View (spatial/relational — ⛔ not "Canvas") | **ABSENT** |
| Essay · Lecture · Course · Audio · Publishing | **ABSENT** |

---

## Advancing now

```text
WS-01 · P0-D — deploy candidate e92f53239, prove deployed identity,
               exercise the real ingest HTTP path, record, stop.
               Blocked on minisforum access.
```

Everything else is **CLOSED** until WS-01 is accepted and the freeze releases.
