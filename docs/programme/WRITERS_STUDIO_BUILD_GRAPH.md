# Writer's Studio — Build Graph

> **Jarvis maintains this file.** It is the operational cockpit, not a roadmap. Every session must
> be able to say which nodes exist, which are partial, which are blocked, which have **zero
> callers**, and which one it is advancing now.
>
> ⛔ **Node states are evidence, not intention.** A state is set by reading canonical — file
> presence, importer count, live route — never by what a document says should be true. Update it in
> the same commit as the work that changes it.

**Verified against canonical `8fa03f48a`, 2026-08-24.**

## States

```text
LIVE          reachable by a member in production
PARTIAL       reachable but incomplete against its capability definition
ZERO-CALLERS  merged code that nothing imports — built, unwired, invisible
IN ACCEPTANCE under a frozen walk; not yet accepted
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
| Transcript intake · Research · Fragments | **ABSENT** |

## MAIA

| Node | State |
|---|---|
| Creative Companion (Reflect · Question · Notice · Connect · Shape · Develop · Critique) | **ABSENT** — the Window renders one honest sentence |
| **Developmental Editor** | **DESIGNED** — `DEVELOPMENTAL_EDITOR_CAPABILITY.md`; dependency **Work Structure**; acceptance `ELEMENTAL_ALCHEMY_MANUSCRIPT.md` Ch10 `L3492–3817`, 5 pre-registered findings |
| Whole-Work Intelligence | **ABSENT** |
| Memory / Provenance (source → notice → recognition → decision → Work) | **DESIGNED** — programme invariant §A1.3 |

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
