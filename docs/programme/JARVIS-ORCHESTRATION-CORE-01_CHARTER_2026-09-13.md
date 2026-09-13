# JARVIS-ORCHESTRATION-CORE-01 — CHARTER

**Opened**: 2026-09-13, founder act.
**Branch**: `claude/wonderful-edison-29hwdg`
**Status**: OPEN · specification stage only.

---

## 1. Why this lane exists

Writer's Studio has accumulated real substrate — manuscript sections, structure units,
revisions, evidence binding, developmental reading — without a systems layer governing
*how any capability is permitted to operate on a member's Work*.

Today a capability reaches Work state by importing a module and querying the database.
Sovereignty at that boundary is **behavioural** (the code is written correctly) rather
than **structural** (the code cannot do otherwise). That is the defect this lane exists
to close.

The governing law of the lane:

> **No capability may operate on a member's Work except through the Jarvis execution
> boundary.**

Jarvis is not a second conversational intelligence. It is the execution boundary itself.

```
HUMAN
  ↕
MAIA              relational intelligence
  │
JARVIS            orchestration — coordinates operations over authorized knowledge
  │
CAPABILITIES      cognitive instruments
  │
WORK STATE        persistent understanding
  │
MATERIAL          human-created source
```

**JARVIS DOES NOT OWN KNOWLEDGE. JARVIS COORDINATES OPERATIONS OVER AUTHORIZED KNOWLEDGE.**

---

## 2. What this lane produces, in order

1. **Specification v0.1** (this deliverable's sibling file) — freezes ten contracts as
   CANDIDATE, not ratified.
2. **Census** — the current Writer's Studio architecture read against the specification:
   what already exists, what is partial, and **where current code would permit the
   architecture to be bypassed**. Read-only. No repair during the census.
3. **Founder docket** — the questions the census cannot answer from code.

Nothing beyond (1) is authorized by this charter.

## 3. What this lane may NOT do

- ⛔ No migration authored. No schema change. No `works` or `corpus` table.
- ⛔ No deploy.
- ⛔ No orchestration service built. The specification is not an implementation warrant.
- ⛔ No ratification. Every contract in the spec is CANDIDATE until a founder act.
- ⛔ No repair of findings discovered during the census.

**Schema hold has a specific reason beyond ordinary caution.** The open finding of
2026-09-07 is that merging a migration to `clean-main-no-secrets` is, in effect,
authorization for the next unrelated deploy to apply it, and that branch currently
accepts pushes with required status checks bypassed. A lane whose whole purpose is
structural enforcement must not be the lane that walks a migration through an
unenforced gate. **BRANCH GATE closes before this lane emits schema.**

## 4. Relationship to adjacent lanes

- **WS2 (Writer's Studio builds)** — this lane is the systems layer *beneath* WS2, not a
  replacement. WS2-07A evidence binding and WS2-08 structure are inputs, not subjects.
  WS2 founder-act gating is untouched.
- **CMT-01 (Canonical MAIA Turn)** — the producer registry and participation
  adjudication are the direct precedent for the Flow Registry. This lane generalizes
  that contract to the Work layer; it does not redeclare it.
- **JARVIS-CIRCLES-01** — supplies the naming-collision discipline (FR-02 lineage) and
  the coverage law (FR-14): *the named set is the law; a total is descriptive.*

## 5. Falsifier discipline inherited

Per FR-14: a gate PASSES only when zero obligations fail **and** every required
obligation is still present **and** discharged by PASS. WARN, SKIP and MISSING never
discharge. *An instrument can satisfy all of its remaining questions by forgetting to
ask the difficult ones.*

## 6. Standing

**SPEC v0.1 DRAFTED · CENSUS NOT STARTED · NOTHING RATIFIED · NO SCHEMA · NO DEPLOY.**
