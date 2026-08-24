# JARVIS memory — routing, not encyclopedia

Two tiers. The rule that separates them is the same one the `MEMORY.md` root doctrine
already established (founder-ruled 2026-08-05) and that the context audit generalized:

```
HOT.md          always resident · ~50-100 lines · WHERE things are, never what happened
<subdirs>/      pulled on demand · one file per subject · no size limit
```

**HOT.md answers "where do I look".** If a line in `HOT.md` describes an event, a status, or
a result, it belongs in a subdirectory. State is the thing that goes stale; routing is not.

The failure this prevents is measured: `CLAUDE.md`'s largest section is its most perishable —
4,431 tokens of session state, dated, carrying three inline corrections superseding its own
claims, loaded on every single session. Paying startup cost for a description the same file
then retracts.

## Promotion / demotion

```
needed in most sessions   ->  promote to HOT.md (as a pointer, not a summary)
rarely needed, or stale   ->  demote to a subdirectory file
superseded                ->  keep the file, mark it SUPERSEDED, never silently delete
```

The burden of proof sits on the line, never on the reviewer. A line earns HOT.md by being
needed to *route*, not by being important.

## Directories

| Dir | Holds |
|---|---|
| `glossary/` | terms that mean something specific here (Spiralogic, AIN, Co-Lab, atoms, lane, worktree) |
| `architecture/` | how a subsystem is put together — durable structure, not current status |
| `projects/` | per-project state, one file each; the volatile tier |
| `infrastructure/` | hosts, containers, networks, deploy lanes |
| `incidents/` | what broke, root cause, what changed structurally afterward |
| `decisions/` | rulings and their basis — including the ones that were reversed |
| `releases/` | what shipped, which SHA, verified how |
| `people/` | who does what, how they prefer to work |

## Boundary — read this before writing anything here

This is **JARVIS operating memory** (the development system's memory of its own work).
It is **not MAIA memory** and must never become a channel into it. MAIA's memory of a
member is governed by consent, Sanctuary Mode, and the sovereignty invariants; nothing in
this directory participates in that architecture, and no member content belongs here.
