# EDITORIAL-DECISION-01 — minimal design and predeclared falsifiers

**Status** DESIGN ONLY · no code · no migration file · nothing applied
**Census** `EDITORIAL-DECISION-01_DOOR_CENSUS_2026-09-13.md`
**Rulings** founder, 2026-09-13 — D1 parallel chain · D2 small non-executable body

> **Standing records what you decide about an observation.**
> **Editorial decisions record what you decide about the Work.**

⛔ The DDL below is deliberately **not** in `database/migrations/`. A design is
not a migration, and a file in that directory is one deploy away from being
applied.

---

## 1. Why a sibling chain, not a wider standing table

An editorial decision can govern **several observations, which need not share
sections**. It therefore cannot belong to one observation's event spine.

```text
D1  "The campfire is phenomenological first. Each recurrence must advance."
    governs  o1 · o4 · o21
```

`developmental_observation_standing_events` stays **exactly** what it is. The new
chain mirrors its Authority × Time semantics rather than absorbing it.

### ⭐⭐ THE COUPLING LAW

```text
Record decision   ≠   mark observation keep / dismiss / unresolved
```

⛔ Recording a decision **must not** write a standing, and a standing must not
imply a decision. If one gesture ever offers both, both consequences are shown
to the member and recorded as **two distinct records**. Neither is ever inferred
from the other. `ED-7` and mutation `M2` bind this.

## 2. The schema

```sql
CREATE TABLE IF NOT EXISTS editorial_decision_events (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- The DECISION's identity. Stable across every revision of it.
  decision_chain_id     uuid NOT NULL,
  -- ⭐ Successor-carried time. current = MAX(event_index). No superseded_by.
  event_index           integer NOT NULL CHECK (event_index >= 0),

  member_id             uuid NOT NULL REFERENCES members(id) ON DELETE RESTRICT,
  work_id               uuid NOT NULL,

  -- ⭐ D2 · the body. Statement required; the other two are the writer's to give.
  statement             text NOT NULL CHECK (length(btrim(statement)) > 0),
  intent                text,
  principle             text,

  -- What state of the Work the ruling was made against. Provenance, not a snapshot.
  working_draft_id      uuid,
  working_draft_version integer,

  -- ⛔ Authority is MEMBER in both cases. MAIA may draft the wording; nothing
  -- exists as a decision until the member chooses `Record decision`.
  authorship            text NOT NULL CHECK (
                          authorship IN ('member_authored',
                                         'member_confirmed_maia_proposal')),

  recorded_at           timestamptz NOT NULL DEFAULT now(),

  UNIQUE (decision_chain_id, event_index),
  CONSTRAINT edm_draft_pair CHECK (
    (working_draft_id IS NULL) = (working_draft_version IS NULL))
);

CREATE INDEX IF NOT EXISTS idx_ede_current
  ON editorial_decision_events (decision_chain_id, event_index DESC);
CREATE INDEX IF NOT EXISTS idx_ede_work
  ON editorial_decision_events (member_id, work_id);

-- ⭐ Append-only ENFORCED, exactly as `dose_no_update` does for standings.
-- A convention is not a guarantee.
CREATE OR REPLACE FUNCTION ede_no_update() RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'editorial_decision_events is append-only: a changed ruling is a successor event, not an edit';
END; $$ LANGUAGE plpgsql;

CREATE TRIGGER ede_no_update_trg
  BEFORE UPDATE OR DELETE ON editorial_decision_events
  FOR EACH ROW EXECUTE FUNCTION ede_no_update();
```

### The `governs` relation — part of the event, not a table with its own life

```sql
CREATE TABLE IF NOT EXISTS editorial_decision_event_observations (
  decision_chain_id uuid NOT NULL,
  event_index       integer NOT NULL,
  reading_id        uuid NOT NULL REFERENCES developmental_readings(id) ON DELETE CASCADE,
  observation_key   text NOT NULL CHECK (length(observation_key) > 0),
  relation          text NOT NULL DEFAULT 'governs' CHECK (relation = 'governs'),

  PRIMARY KEY (decision_chain_id, event_index, reading_id, observation_key),
  FOREIGN KEY (decision_chain_id, event_index)
    REFERENCES editorial_decision_events (decision_chain_id, event_index) ON DELETE CASCADE
);
```

⭐ **The governed set belongs to the EVENT and is immutable with it**, committed
in the same transaction — the same shape as `focus_crossing_act_members`.
Widening scope from `{o1}` to `{o1, o4}` is a **successor event**, so scope
inherits supersession for free and no edge-deletion semantics has to be invented.

⛔ `relation` is `CHECK (relation = 'governs')` on purpose. `refines`,
`depends_on` and the rest are **not** invented now; they are added from evidence
when real manuscript work demonstrates the need. A one-value CHECK is a door
that has to be opened deliberately.

## 3. The API

```ts
type DecisionAuthorship = 'member_authored' | 'member_confirmed_maia_proposal';

interface RecordDecisionInput {
  memberId: string; workId: string;
  /** Absent = open a new chain. Present = revise THAT ruling. */
  decisionChainId?: string;
  /** ⭐ Optimistic concurrency, exactly as standings do it. */
  expectedCurrentEventId: string | null;
  statement: string; intent?: string; principle?: string;
  governs: readonly { readingId: string; observationKey: string }[];
  authorship: DecisionAuthorship;
  workingDraftId: string | null; workingDraftVersion: number | null;
}

type RecordDecisionOutcome =
  | { ok: true; outcome: 'appended' | 'unchanged'; decision: DecisionWire }
  | { ok: false; refusal: DecisionRefusal };
```

⛔ **`unchanged` is a real outcome, not an optimisation.** Re-recording an
identical ruling is not a new decision, and the writer is told so.

⛔ **A 409 is returned to the writer, never retried.** Inherited verbatim from
the standing lane: *retrying would make machine scheduling the ordering
authority over two member acts.*

```ts
type DecisionLookup =
  | { state: 'loading'; workId: string }
  | { state: 'unavailable'; workId: string }
  | { state: 'available'; workId: string; decisions: readonly DecisionWire[] };
```

⭐ **UNKNOWN ≠ UNSET**, inherited verbatim. *A failed lookup rendered as "no
decisions" would tell a writer they have never ruled on something they may have
ruled on, and then let them overwrite that ruling from a state they never saw.*

## 4. ⛔ What the body may never carry

```text
rewritten manuscript prose      exact replacement text      diff hunks
character offsets for mutation  write instructions          "apply this"
generated edit operations
```

A decision is **not** a proto-`RevisionProposal`. `ED-8` asserts the type has no
field any of these could travel in, and mutation `M3` reintroduces one.

## 5. Predeclared falsifiers

```text
ED-1   statement required and non-blank; whitespace-only refused
ED-2   intent and principle optional; a decision with neither is lawful
ED-3   append-only ENFORCED — UPDATE and DELETE raise, not merely "shouldn't"
ED-4   current = MAX(event_index); no superseded_by is stored anywhere
ED-5   expected-current-event mismatch → conflict; NO automatic retry
ED-6   UNKNOWN ≠ UNSET — a failed lookup never renders as "no decisions"
ED-7   ⭐⭐ recording a decision writes NO standing row · the coupling law
ED-8   ⛔ the body has no field for prose, offsets, diffs or operations
ED-9   `governs` is explicit — never derived from shared sections
ED-10  ⭐ a decision may govern observations sharing NO sections (o1, o22)
ED-11  authorship is one of two values; authority is MEMBER in both
ED-12  ⛔ no path writes a decision without a member act — MAIA cannot ratify
ED-13  widening scope is a SUCCESSOR event; the prior event is unchanged
ED-14  the structural digest machinery is untouched by any of this
ED-15  a decision records the draft version it was made against
ED-16  a revised ruling does not erase the prior one — history is readable
```

### Mutations that must go RED

```text
M1  `governs` inferred from shared sections        → ED-9, ED-10
M2  recording a decision also writes a standing     → ED-7
M3  a `proposedText` field added to the body        → ED-8
M4  UPDATE permitted on the event table             → ED-3
M5  a stored `superseded_by` column                 → ED-4
M6  conflict auto-retried instead of returned       → ED-5
M7  a failed lookup rendered as UNSET               → ED-6
M8  MAIA's proposal recorded without member act     → ED-12
```

⭐ **M1 and M2 are the load-bearing ones.** They are the two ways this becomes a
system that decides things on the member's behalf while appearing to record
their decisions.

## 6. First specimen — o1, not o26

o26 needs no editorial decision; it is a deletion of something that is not the
book. The real candidate already exists, from work actually done:

```text
D1  STATEMENT   Keep the campfire recurrence. Each return must advance rather
                than merely repeat.
    INTENT      The lived campfire experience remains phenomenological first.
    PRINCIPLE   lived scene → interpretation → presence → sustaining → embers
    GOVERNS     o1
    AUTHORSHIP  member_confirmed_maia_proposal
    AGAINST     working draft v34
```

⛔ `D1 governs o4` is **not** part of this. If that principle turns out to govern
o4 as well, that edge is **authored then**, as a successor event — never
inferred because both observations mention Fire.

## 7. Standing

```text
AUTHORIZED   this design · falsifiers predeclared
NOT BUILT    no schema applied · no code · no migration file
HELD         RevisionProposal · staged diff · manuscript mutation · write authority
MANUSCRIPT   v34 · untouched          PRODUCTION   untouched
```
