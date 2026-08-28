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
express **some of them**. Work↔Manuscript is already expressed, and expressed
well — as a member declaration (D-022). Provenance and adoption are the thin
ones: the pack draws a Provenance tab and adoption controls the tables cannot
carry. Implementation must **bring those up to the design — never simplify the
design down to today's tables** (D-018), and never simplify what is already
right down to something more convenient.

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

## Scope — adjudicated 2026-08-28, and now tiny

```text
REPAIR 1  provenance      CENSUSED · NO MIGRATION NOW · reopen on trigger
REPAIR 2  material↔Work   ONE new table · Maybe / Not now only
REPAIR 3  companion FK    OPTION B RULED · production census required
FINDINGS  seven-state     PRESERVE · Keep/Dismiss deferred to WS2-08
```

Design and candidate SQL: `WS2-SUBSTRATE-01-DESIGN.md`.
**No backfill. No provenance framework. No findings migration. No
Work↔Manuscript migration. This unit does not gate WS2-02.**

### REPAIR 1 · Provenance — no migration now

The census found provenance already modelled for every object a route can
currently produce: manuscript entry method, source arrivals, material artifact
custody, declaration provenance, MAIA turn authorship, finding authorship.

**Preserve all of it. Add nothing.** The missing generic axes — variable
`originator`, semantic `kind`, cross-object `origin_ref`, authority on
manuscript text — belong to objects no route can produce today.

**Reopen trigger:** the first reachable path where originator can vary for the
same object kind · MAIA/source language can be adopted into manuscript · one
object must durably name another as its origin · authority cannot be
represented by the object's existing domain model. In practice: *MAIA proposes
text → writer adopts → that language enters the Manuscript.*

No provenance JSONB catch-all, now or at reopen.

### REPAIR 2 · Material↔Work consideration

```text
no row anywhere                        untouched / never considered
consideration row, state = maybe       considered, unresolved
consideration row, state = not_now     considered, declined or deferred
living_work_materials row exists       BELONGS
```

**`Belongs` is not a state in the enum.** Belonging is the existence of the
declaration row. Putting `maybe` on that row would mean *"this belongs, but
maybe"* — nonsense, and the collapse D-022 taught.

Separate table, carrying actor and timestamp in the same grammar the sibling
declaration tables use.

⚠ Out of scope: `05`'s six-value **RELATIONSHIP TO WORK** (`Core Material ·
Supporting · Background · Reference · Peripheral · Exclude`) is a *second,
distinct* control. Nearest substrate today is
`living_work_materials.relationship_sentence`, free text. Enum-or-prose is a
product decision, not taken here.

### REPAIR 3 · Companion FK — option B

```text
FK manuscript_id → member_manuscripts(id) ON DELETE SET NULL
+ BEFORE DELETE guard on member_manuscripts:
    refuse when a turn has that manuscript AND living_work_id IS NULL
```

Both invariants preserved rather than traded: **conversation history is
relational evidence** AND **a turn must still have a room**. CASCADE is refused
— deleting a manuscript may not erase a conversation that happened. Globally
relaxing the has-room CHECK is refused — it turns a structural guarantee into
"usually true."

**Do not auto-attach a Living Work to save a delete.** If the turn is
manuscript-only, the truthful answer is that the manuscript cannot be deleted
until its relational history is resolved.

⚠ The refusal must reach the member as words, not a 500 (D-014).

**HELD** on the production invalid-row census — it needs a database and cannot
run from a remote container.

### FINDINGS · No eighth disposition

The seven states stand unaltered: `new · discussed · recognized · adopted ·
rejected · unresolved · resolved`. They already separate MAIA observation,
writer disposition, and manuscript change.

`Dismiss` is **not** mapped to `rejected`. *"I disagree"* is authority; *"not in
my attention now"* is attentional, and they are different axes. `Keep` collides
with `manuscript_keeps`. Both resolve in **WS2-08** as product semantics.
**Authority and attention may not collapse into one column.**

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
existing declaration row is traceable to a member act, and unassigned means no
declaration row exists. **No membership row can be NULL** — a declaration row's
fields are all real assertions.

## Out of scope — explicitly

- **The full future schema.** This unit creates *exactly enough* substrate for
  the already-settled architecture to be representable without loss.
- Any UI, component, route or design-system work. That is WS2-02/03.
- Provenance *presentation* — remains WS2-06 (D-018).
- Rich-text storage format — remains WS2-04, still BLOCKED.
- Structure, findings, versions or goals modelling beyond what repairs 1–3
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

**Nothing about WS2-02's start.** Since D-022, WS2-02 is **RELEASED** and runs
as its own bounded lane; this unit does not gate it. WS2-03 is **per-portion
gated** — the Work-context work may begin, and only the parts needing richer
provenance or durable adoption wait on repairs 1 and 2.

---

STATUS       DEFINED, NOT STARTED · 2026-08-28
