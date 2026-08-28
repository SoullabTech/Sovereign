# WS2-SUBSTRATE-01 — make the object model able to express the grammar

**Authorized as a unit 2026-08-28 (D-021). NOT YET IMPLEMENTED.**
A bounded migration / object-model repair standing between WS2-00 and WS2-02.

> ### Writer's Studio Design Authority
>
> **DESIGN-CONTRACT.md** — form · **CAPABILITY-COVENANT.md** — required
> possibility · **DESIGN-DEVELOPMENT-PROTOCOL.md** — method.
> None may be satisfied by violating another.

---

## Why this unit exists

The reference pack is **ahead of the substrate**. It draws provenance, drawn
adoption controls, and a Work that owns its manuscripts. The tables underneath
express none of those. Implementation must **bring the substrate up to the
design — never simplify the design down to today's tables** (D-018).

WS2-02/03 are entitled to a substrate that already tells the truth. If the
repairs happen inside them, presentation and object-model work entangle, and it
later becomes impossible to distinguish *"the UI chose this"* from *"the data
model forced this."* (D-021.)

## Scope — exactly four repairs

### 1 · Work ↔ Manuscript as a real persisted relation — **load-bearing**

Today `member_manuscripts` references `member_id` and nothing else. A manuscript
belongs to a member, never to a Work. Work↔Material already exists
(`living_work_materials`, already a declared writer act); Work↔Manuscript does
not exist at all.

**Without this, "persistent work context" is semantically false**: the system
can know whose manuscript it is, but not which Work it belongs to.

The relation is **explicit and persisted**, not inferred through member
ownership.

### 2 · A real provenance model, replacing the one-value placeholder

```sql
-- today
provenance text NOT NULL DEFAULT 'member_uploaded'
  CHECK (provenance = 'member_uploaded')
```

One permitted value: a constant wearing the name of a model. It must become the
**minimum provenance required by the reference grammar**, including
**imported-source identity** — `05` renders "Imported from: Zoom Recording"
behind a `Provenance` tab.

The five questions the model must be able to answer (WS2-ARCHITECTURE-DEFINITION
§3): who originated this · what kind of thing it is · where it came from · what
authority it has · how it entered the Work.

**Provenance persists. Salience does not** (Protocol §9). Do not add a stored
relevance or importance field.

### 3 · Persisted adoption / disposition state

Enough to represent, without pretending these are merely UI states:

```text
material → work      Belongs · Maybe · Not now          (drawn in 05)
MAIA companion       Discuss · Keep · Unresolved · Dismiss  (drawn in 08)
```

Adoption is a **writer act with a record** (D-019). There is no MAIA
self-adoption, and no accumulation of suggestions that becomes adoption by
repetition.

### 4 · Referential integrity on `studio_companion_turns.manuscript_id`

`living_work_id` has a foreign key; `manuscript_id` is a bare `UUID` with none.
An exchange can name a manuscript that does not exist — the identity-custody
class D-010 governs. Repaired while this seam is open.

## Legacy Work-association transition rule

**Founder, 2026-08-28.** Operational, not interpretive. It constrains the
migration directly.

```text
LEGACY MANUSCRIPT TRANSITION

Existing manuscripts with no Work relation remain valid manuscripts.

Their Work association is explicitly UNASSIGNED until a legitimate
association occurs.

PERMITTED
  · remain readable
  · remain owned by their member
  · Work relation remains NULL / unassigned
  · member associates manuscript with an existing Work
  · member deliberately creates a Work and associates the manuscript
  · an explicit future migration rule ONLY if that rule records provenance
    and does not pretend inference is member authorship

FORBIDDEN
  · newest Work
  · oldest Work
  · only Work owned by the member
  · matching title
  · current route/browser context
  · import chronology
  · recent activity
  · MAIA inference
  · silently creating a Work
  · any other heuristic presented as known relationship

CONSTRAINT
  The first Work↔Manuscript migration MUST permit the truthful unassigned
  state. It must not begin by imposing blanket NOT NULL work membership.

WS2-03 CONSEQUENCE
  An unassigned legacy manuscript may be opened as that manuscript,
  but the shell must not claim a persistent Work context that does not exist.
  It must request/offer explicit association or represent the context as
  unassigned.
```

> **NULL here is not missing data to clean up. It is truthful data about an
> unresolved relationship.**

That distinction is the whole rule. A migration that treats the NULLs as a
cleanup task will reach for a heuristic, and every heuristic in the FORBIDDEN
list produces the same failure: a relationship the member never asserted,
presented to them as one they did. This is D-008 and D-010 applied to
persistence — absence, loss and invalidity must never collapse into "open
something else," and the data layer is where that collapse would become
permanent.

It also means the acceptance criterion "no Work invented on a member's behalf"
is checkable rather than aspirational: after the migration, every
Work↔Manuscript row is either NULL or traceable to a member act.

## Out of scope — explicitly

- **The full future schema.** This unit creates *exactly enough* substrate for
  the already-settled architecture to be representable without loss.
- Any UI, component, route or design-system work. That is WS2-02/03.
- Provenance *presentation* — remains WS2-06 (D-018).
- Rich-text storage format — remains WS2-04, still BLOCKED.
- Structure, findings, versions or goals modelling beyond what repairs 1–4
  require.

## Constraints

- **PostgreSQL, self-hosted.** Never Supabase.
- Migrations are **idempotent** and carry a ROLLBACK line, per repository
  convention.
- **Existing data survives.** Members have manuscripts today with no Work; the
  migration may not orphan or silently invent a Work for them. How existing
  manuscripts acquire a Work is a member act or an explicit, recorded default —
  not an inference presented as fact (D-008/D-010 in the data layer).
- Protocol §5: additive preservation. Prefer adding the truthful relation over
  rewriting what works.

## Acceptance

- [ ] Migration applies idempotently; rollback stated
- [ ] Work↔Manuscript persisted and queryable in both directions
- [ ] Provenance answers all five questions for Manuscript and Material
- [ ] Adoption/disposition persists for both drawn control sets
- [ ] `studio_companion_turns.manuscript_id` has referential integrity
- [ ] No existing manuscript orphaned; no Work invented on a member's behalf
- [ ] The unassigned state is representable — no blanket NOT NULL on the first
      Work↔Manuscript migration
- [ ] Every Work↔Manuscript row is NULL or traceable to a member act
- [ ] `npm run typecheck` — no regression against baseline
- [ ] `npm run check:no-supabase` — PASS
- [ ] Co-Lab boundary gate — `scripts/pre-deploy-gate.sh colab`, 0 failed,
      0 warned, exit 0. **This unit touches memory-atom-adjacent and
      member-scoped tables, so the gate is triggered, not optional.**
- [ ] Deploy verified TWO WAYS (D-007): env var AND artifact

## What this unit does not settle

Whether WS2-02 begins immediately on completion. WS2-02/03 remain held behind
**substrate truth** — this unit's completion is what lifts that specific hold,
and the A–D binding review is separate.

---

STATUS       DEFINED, NOT STARTED · 2026-08-28
