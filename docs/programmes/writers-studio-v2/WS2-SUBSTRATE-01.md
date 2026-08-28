# WS2-SUBSTRATE-01 — make the object model able to express the grammar

**Authorized 2026-08-28 (D-021), scope corrected by census (D-022). NOT STARTED.**
A bounded migration / object-model repair unit. **It no longer gates WS2-02** —
that unit is RELEASED and proceeds in parallel.

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

## The invariant this unit may not break

**Work↔Manuscript already exists** as `living_work_expressions` — a member
declaration carrying `declared_by` and `declared_at`, with no automatic
placement, deliberate many-to-many optionality, and consumer-side ambiguity
refusal (the Canvas unite rule). **It is not a repair and needs no migration**
(D-022).

It is listed here because this unit touches the seam around it. Nothing in the
three repairs below may weaken it, and the acceptance walk verifies it survives.

> A `work_id` column would make belonging a property of the manuscript, and a
> property can be backfilled by inference. A declaration row cannot be written
> without an actor and a date. **The system does not discover that an expression
> belongs somewhere; a person declares it, and the architecture remembers who
> and when.** Do not "simplify" toward the column.

## Scope — exactly three repairs

### 1 · The missing provenance dimensions

```sql
-- today, and it is TRUTHFUL as far as it goes
CHECK (provenance IN ('member_uploaded', 'member_written'))
```

**Do not replace this field.** It answers *how did this manuscript enter the
Studio?* and answers it well — set once at creation by the gesture the member
actually performed, never inferred.

The repair is to **stop it being overloaded** and to add the dimensions that have
nowhere to live. Entry method is one of five axes
(WS2-ARCHITECTURE-DEFINITION §3):

```text
originator        writer · MAIA · imported source
kind              manuscript text · material · observation · proposal · decision
source            transcript X · chapter Y · MAIA exchange Z
entry method      EXISTS — member_uploaded · member_written
authority         unreviewed · recognized · adopted · rejected
```

`05` renders a `Provenance` tab and an "Imported from: Zoom Recording" record, so
the target grammar is drawn. **Provenance persists; salience does not** (Protocol
§9) — add no stored relevance, importance or quality field.

### 2 · Persisted adoption / disposition

Enough to represent, without pretending these are merely UI states:

```text
material → work      Belongs · Maybe · Not now              (drawn in 05)
MAIA companion       Discuss · Keep · Unresolved · Dismiss  (drawn in 08)
```

⚠ **Do not assume these are one enum.** They may be different acts at different
layers. The read-only design must **prove the semantic model before sharing
storage**.

⚠ **And do not assume nothing is persisted today.** The repository already has
member-declared relationship acts of exactly this family —
`living_work_expressions` and `living_work_materials`, both with
`declared_by`/`declared_at`, and `living_work_materials` additionally carrying a
`relationship_sentence`. The accurate question is:

> **Which parts of the drawn disposition semantics already have durable member
> acts, and which states are genuinely missing?**

`Belongs` may already map to the *existence* of a declared relationship. `Maybe`
and `Not now` probably require new durable semantics — a *considered and not yet
resolved* state is not the same as no row.

Every writer-authoritative transition needs **actor · timestamp · previous/new
state where useful**. There is no MAIA self-adoption, and no accumulation of
suggestions that becomes adoption by repetition (D-019).

### 3 · Referential integrity on `studio_companion_turns.manuscript_id`

`living_work_id` has a foreign key; `manuscript_id` is a bare `UUID` with none.
An exchange can name a manuscript that does not exist — the identity-custody
class D-010 governs. Repaired while this seam is open, together with its
relationship to the existing homeless-turn CHECK.

## Legacy Work-association transition rule

**Founder, 2026-08-28.** Operational, not interpretive. It constrains the
migration directly.

```text
LEGACY MANUSCRIPT TRANSITION

Existing manuscripts with no Work relation remain valid manuscripts.

Their Work association is explicitly UNASSIGNED until a legitimate
association occurs.

UNASSIGNED = NO living_work_expressions DECLARATION ROW EXISTS.
             It is NOT a NULL in a membership row. A declaration row cannot
             itself be "unassigned" — its living_work_id, expression_id,
             declared_by and declared_at are all real assertions.

PERMITTED
  · remain readable
  · remain owned by their member
  · no declaration row exists
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
  Already satisfied by the existing design, and it must stay that way: the
  unassigned state is the ABSENCE of a declaration row, so there is no
  backfill to perform and no NOT NULL that could be imposed. Any future
  narrowing (e.g. an additive UNIQUE index) is a founder ruling, never a
  convenience.

WS2-03 CONSEQUENCE
  An unassigned legacy manuscript may be opened as that manuscript,
  but the shell must not claim a persistent Work context that does not exist.
  It must request/offer explicit association or represent the context as
  unassigned.
```

> **The absence of a declaration is not missing data to clean up. It is truthful
> data about an unresolved relationship.**

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
- [ ] Work↔Manuscript declaration survives unweakened — `declared_by` /
      `declared_at` intact, no automatic placement introduced, many-to-many
      optionality preserved, unite rule still refuses ambiguity
- [ ] Provenance answers all five questions for Manuscript and Material
- [ ] Adoption/disposition persists for both drawn control sets
- [ ] `studio_companion_turns.manuscript_id` has referential integrity
- [ ] No existing manuscript orphaned; no Work invented on a member's behalf
- [ ] The unassigned state remains representable as the absence of a row
- [ ] Every Work↔Manuscript declaration is traceable to a member act
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
