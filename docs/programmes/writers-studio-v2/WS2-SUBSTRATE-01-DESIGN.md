# WS2-SUBSTRATE-01 — READ-ONLY DESIGN

**CHANGE: NONE.** No migration, no code, no schema write. Censused from the
migrations and their callers on 2026-08-28.

**Headline: the substrate is further along than the packet assumed — twice.**
The Work relation was already built (D-022). The disposition *semantics* are
also already built, on findings, with a seven-state model better reasoned than
the four-state one the architecture definition proposed.

---

## INVARIANT — Work↔Manuscript · **VERDICT: PRESERVED**

### Schema

```sql
living_work_expressions
  id               UUID PK
  living_work_id   UUID NOT NULL REFERENCES living_works(id) ON DELETE CASCADE
  expression_type  TEXT NOT NULL          -- open by design
  expression_id    UUID NOT NULL
  declared_by      UUID NOT NULL REFERENCES members(id) ON DELETE RESTRICT
  declared_at      TIMESTAMPTZ NOT NULL DEFAULT now()
  UNIQUE (living_work_id, expression_type, expression_id)

INDEX living_work_expressions_work_idx   (living_work_id, declared_at DESC)
INDEX living_work_expressions_lookup_idx (expression_type, expression_id)
```

`COMMENT ON TABLE`: *"A member's declaration that an expression belongs to a
Living Work. The row is the declaration; declared_by cannot be null. **Nothing
attaches automatically.**"*

### Cardinality — ruled, in the schema

One declaration per (work, type, expression). **Deliberately NOT unique on
`(expression_type, expression_id)`**: an expression may belong to several Works,
because *"the ontology has not ruled exclusivity… preservation of optionality,
not an omission. A relational constraint here would decide a constitutional
question by accident."* Narrowing is a future founder ruling via an additive
UNIQUE index — no destructive migration.

`expression_type` is open TEXT by design; the route admits only `'manuscript'`,
the one instrument that exists.

### Writers — exactly one, and it is a member act

`POST /api/sovereign/living-works/[id]/expressions` — the only `INSERT` site in
the repository. Verified by grep across `app/`, `lib/`, `scripts/`.

- ownership checked **on both ends**; a foreign id is a 404, *"not a hint that
  the row exists"*
- `ON CONFLICT DO NOTHING` — re-declaring is not an error, and the response says
  which happened
- refuses classification, "seems related", bulk adopt

`DELETE` withdraws the declaration, member-scoped **through the owning work in
the predicate**: *"removing 'this belongs to that' removes a statement, not the
thing stated about."*

### No automatic placement path — verified negatively

```text
manuscripts/ingest   writes nothing to living_work_expressions
manuscripts/blank    "No attachment. Nothing is written to
                      living_work_expressions. The member began writing; they
                      did not declare that this expression belongs to that
                      work. Attachment is its own act and its own slice."
                      Guarded by a test asserting the table is NOT written.
```

### Consumers and the three behaviours

`GET /api/sovereign/living-works` reads expressions per work.
`app/writers-studio/canvas/page.tsx` — the **unite rule** (ruled 2026-08-05):

```text
0 declaring works   manuscript valid; no Work context claimed
1 declaring work    Work and table unite
2+ declaring works  ambiguous; the room does not guess between them
```

`shellIdentity.ts` mirrors it with a `neutral` state for two-or-more or a failed
read, refusing both forbidden fallbacks by name: *"may not answer it by silently
picking one, and it may not answer it by falling back to the manuscript
either."* A failed read lands in `neutral`, not in `manuscript` — absence of
knowledge is not absence of works.

### Stale source comments found

| File | Line | Says | Truth |
|---|---|---|---|
| `app/writers-studio/shellIdentity.ts` | 49 | "Nothing writes living_work_expressions, so no containment may be drawn" | The expressions route writes it and calls itself the first writer |

**Behaviour is correct; only the comment is stale.** RECORD/PARK — not opened
under a read-only lease.

**No `work_id` column is proposed. The declaration model is stronger.**

---

## REPAIR 1 — Provenance

### Existing substrate, by object

| Object | Provenance carried | Axis |
|---|---|---|
| **Manuscript** | `provenance IN ('member_uploaded','member_written')`, *"never inferred; set once at creation by the gesture the member actually performed"* | **entry method** |
| **Manuscript** | `manuscript_source_arrivals` — `source_kind IN ('artifact_extraction','member_supplied_text')`, `artifact_ref/hash/size`, `original_filename`, `mime_type`, `source_text`, `source_text_hash`, nullable `manuscript_id` for unclaimed arrivals | **source**, strongly |
| **Material** | `studio_materials` — `artifact_ref/hash/size`, `original_filename`, `mime_type`, `source_url`, `extraction_method`, `extracted_chars`, `arrived_at`; four CHECKs make partial custody claims impossible | **source**, strongly |
| **Work↔Material** | `living_work_materials` — `declared_by`, `declared_at`, `relationship_sentence` | **originator of the relation** |
| **Work↔Manuscript** | `living_work_expressions` — `declared_by`, `declared_at` | **originator of the relation** |
| **MAIA exchange** | `studio_companion_turns` — `role IN ('writer','maia')`, `room_state` | **originator**, per turn |
| **Finding** | `developmental_findings` — `observation`, `why` (*"Both are hers"*), `confidence`, `reach`, `reach_basis` | **originator** implicit (MAIA authored) |

### Genuinely missing

```text
entry method     BUILT for manuscripts. Absent for materials — studio_materials
                 records HOW BYTES ARRIVED, not how the material entered the
                 Work. That is living_work_materials' declaration, so entry is
                 split across two tables with no single answer.

originator       BUILT per-object by table identity (a finding is MAIA's, a
                 manuscript is the member's). NOT expressible for a future
                 object whose originator varies — e.g. manuscript text the
                 writer accepted from a MAIA proposal.

kind             IMPLICIT in table identity only. There is no column anywhere
                 saying "this is an observation / proposal / decision."

source reference NO cross-object reference type exists. A finding cannot say
                 "this came from material X"; evidence is
                 manuscript_passage | material, which is close but is
                 EVIDENCE FOR, not ORIGIN OF.

authority        BUILT for findings (see REPAIR 2). Absent for materials
                 and for manuscript text.
```

### Proposed minimum model

**Do not add a provenance JSON.** It would hold everything and distinguish
nothing, and Protocol §9's "provenance persists, salience does not" becomes
unenforceable in a blob.

The smallest normalized design that preserves the distinctions:

1. **Keep every existing field.** `member_manuscripts.provenance` keeps meaning
   entry method and nothing more. `manuscript_source_arrivals` and
   `studio_materials` keep carrying source. **Nothing is replaced.**
2. **One new reference type**, not a column per pair: a narrow `origin_ref`
   shape (`kind` + `id`) reused wherever an object must name where it came from,
   mirroring `developmental_finding_evidence.kind`'s existing vocabulary rather
   than inventing a second one.
3. **`originator` + `kind` only where they can vary.** Not on tables whose
   identity already fixes them. On present evidence that is **zero tables
   today** — it becomes necessary the moment MAIA-proposed text can enter a
   manuscript, which no route currently permits.

**Consequence, stated plainly: REPAIR 1 may be smaller than the packet assumes,
and part of it may be premature.** The axes that are missing are missing for
objects that do not yet exist. Adding columns for them now would be modelling a
future the routes cannot reach — the opposite of designing from the real system
(Protocol §2).

### Alternatives rejected

- **JSONB provenance column** — precedent exists (`with_me_atoms.provenance`,
  `s5_provenance_substrate`), and it is exactly the shape that lets salience
  creep in unnoticed.
- **Widening `member_manuscripts.provenance` again** — overloads a truthful
  entry-method field with four other axes. Explicitly refused by the packet.

### Affected readers/writers

`manuscripts/route.ts` · `blank/route.ts` · `ingest/route.ts` ·
`lib/manuscript/source/arrivals.ts` · `studio/materials/*` ·
`scripts/verify-ws01-source-custody.ts`. The 2026-08-02 migration notes the
provenance column *"has no readers in application code today"* — worth
re-verifying before any change, as that claim is now 26 days old.

---

## REPAIR 2 — Adoption / disposition

### The finding that reframes this repair

**Disposition is already built**, on `developmental_findings`, with **seven**
states and `disposition_at`:

```sql
disposition TEXT NOT NULL DEFAULT 'new'
  CHECK (disposition IN ('new','discussed','recognized','adopted',
                         'rejected','unresolved','resolved'))
disposition_at TIMESTAMPTZ
```

`PATCH /api/sovereign/studio/review/finding/[id]` — *"the only route that moves
a disposition, and it moves it only on a member gesture. **Nothing in the review
pipeline may write here: MAIA observes, the writer answers, and those are
different acts by different parties.**"*

And the line that answers the founder's question directly:

> **`adopted`** — the writer decided to act on it. **The manuscript has NOT
> changed — that is a third, separate thing.**

So the layering is already ruled: **observation ≠ disposition ≠ manuscript
change.** Three acts, three records.

Related, and already correct: `reach` was renamed from `priority` because
*"priority was a lie by vocabulary"*, and the migration states that importance,
when it arrives, *"will be a separate, member-set column — never this one."*
D-003 implemented in the schema.

### The semantic matrix

| Control | Existing durable act | Missing state | Meaning |
|---|---|---|---|
| **Belongs** | ✅ `living_work_materials` row exists | — | writer declares relationship |
| **Maybe** | ❌ | ✅ **MISSING** | considered but unresolved |
| **Not now** | ❌ | ✅ **MISSING** | considered and declined/deferred |
| **Discuss** | ✅ `disposition='discussed'` | — | relational posture |
| **Keep** | ⚠️ partial | ⚠️ **AMBIGUOUS** | see below |
| **Unresolved** | ✅ `disposition='unresolved'` | — | explicitly still open |
| **Dismiss** | ✅ `disposition='rejected'` | ⚠️ | writer rejects/removes from attention |

### Are these the same object, different relationships, or different acts?

**Different acts on different objects. Do not unify them.**

```text
Belongs/Maybe/Not now   act on a RELATIONSHIP (material ↔ work)
                        subject: an edge, not a thing

Discuss/Keep/Unresolved/Dismiss
                        act on an OBJECT (a finding MAIA authored)
                        subject: a thing, not an edge
```

The tell is `Maybe`. On the finding side the equivalent is `unresolved` — *the
writer is holding it open on purpose* — and that state presumes the finding
exists and is being weighed. On the material side, `Maybe` must be expressible
**when no declaration row exists**, because the declaration *is* Belongs. A
shared enum would force `Maybe` to be a row that asserts belonging while
meaning "not yet", which is precisely the collapse D-018 forbids.

**Two further ambiguities the design must resolve before storage:**

- **`Keep` is overloaded.** `manuscript_keeps` already exists — a *keep* of
  verbatim text in a section, from find/replace. That is a third meaning,
  unrelated to both control sets. Do not let a new `keep` state collide with it.
- **`Dismiss` vs `rejected`.** `rejected` means *the writer disagrees*.
  `Dismiss` in `08` may mean *remove from my attention without judging it*.
  Those are different, and the seven-state model has no home for the second.

### Proposed minimum model

```text
FINDINGS          nothing. Already built, better than proposed. PRESERVE.

MATERIAL ↔ WORK   the genuinely missing piece. A considered-relationship
                  state that can exist WITHOUT asserting belonging:
                    · declaration row absent + no consideration  = untouched
                    · considered, unresolved                     = Maybe
                    · considered, declined/deferred              = Not now
                    · declaration row present                    = Belongs
                  Must carry actor + timestamp, matching the declared_by /
                  declared_at grammar the sibling tables already use.
                  ⚠ NOT a nullable column on living_work_materials — that
                  table's row IS the assertion of belonging (D-022's lesson).

MAIA TURNS        OPEN QUESTION, not yet answerable. 08 draws the disposition
                  row inline in MAIA, but whether that dispositions the TURN,
                  the INSIGHT, or a finding derived from it is undecided —
                  and studio_companion_turns has no insight/finding link.
                  Recommend: do not model this in WS2-SUBSTRATE-01.
```

Also unresolved and out of scope: `05`'s six-value **RELATIONSHIP TO WORK**
(`Core Material · Supporting · Background · Reference · Peripheral · Exclude`)
is a *second, distinct* control from Belongs/Maybe/Not now. Today the nearest
substrate is `living_work_materials.relationship_sentence`, free text. Whether
the six values are an enum or remain prose is a **product** decision, not a
schema one, and is not taken here.

### Affected readers/writers

`studio/materials/*` · `living-works/[id]/materials/route.ts` ·
`studio/review/finding/[id]/route.ts` (read-only for this repair) ·
`studio/review/route.ts`.

---

## REPAIR 3 — Companion FK

### Current definition

```sql
studio_companion_turns
  member_id       UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE
  living_work_id  UUID          REFERENCES living_works(id) ON DELETE CASCADE
  manuscript_id   UUID          -- NO FOREIGN KEY
  role            TEXT NOT NULL CHECK (role IN ('writer','maia'))
  content         TEXT NOT NULL
  room_state      TEXT
  CONSTRAINT studio_companion_turns_has_room
    CHECK (living_work_id IS NOT NULL OR manuscript_id IS NOT NULL)
INDEX (member_id, living_work_id, manuscript_id, created_at)
```

### Writers, readers, invalid-row risk

One writer: the `INSERT` in `studio/companion/route.ts`, which selects the
manuscript `WHERE manuscript_id = $1 AND member_id = $2` before writing — so
**ids are validated at the application layer today**. Reads use `IS NOT
DISTINCT FROM` on both room columns, which correctly treats NULL as a room
value rather than an unknown.

**Invalid references are structurally possible but unlikely in practice**: the
route validates on write, but nothing prevents a manuscript being deleted
afterwards, at which point the turn points at nothing. `member_manuscripts` has
no dependent that would block it — `ON DELETE CASCADE` from
`manuscript_working_drafts`, `manuscript_sections`, `manuscript_keeps` and
`manuscript_source_arrivals` all delete quietly.

**A census of existing invalid rows requires production data and cannot be run
from this container.** It must precede the constraint.

### Proposed constraint and delete behaviour

```sql
ALTER TABLE studio_companion_turns
  ADD CONSTRAINT studio_companion_turns_manuscript_fk
  FOREIGN KEY (manuscript_id) REFERENCES member_manuscripts(id)
  ON DELETE SET NULL          -- NOT CASCADE
  NOT VALID;                  -- then VALIDATE separately
```

**`ON DELETE SET NULL`, not `CASCADE`, and this is the load-bearing choice.**
A conversation is relational evidence. Deleting a manuscript should not erase
the record that the exchange happened — that would let removing an expression
silently destroy history the member may still be entitled to.

⚠ **But `SET NULL` collides with the has-room CHECK**: a turn whose only room
was that manuscript becomes homeless and the CHECK fails at delete time.
Three options, none free, and **this is the decision to adjudicate**:

```text
A  ON DELETE SET NULL + relax the CHECK to allow an orphaned turn
     → keeps the record; weakens the "no homeless turn" guarantee
B  ON DELETE SET NULL only where living_work_id IS NOT NULL,
   RESTRICT otherwise
     → not expressible as a single FK; needs a trigger
C  ON DELETE CASCADE
     → simplest, and destroys relational evidence. Refused unless ruled.
```

`NOT VALID` then `VALIDATE CONSTRAINT` avoids a long table lock and lets any
pre-existing invalid rows be found and adjudicated rather than blocking the
migration.

---

## PROPOSED MIGRATION FOOTPRINT

Deliberately smaller than the packet anticipated:

```text
REPAIR 1   possibly NOTHING. The missing axes belong to objects no route
           can currently produce. Recommend deferring until MAIA-proposed
           text can enter a manuscript.

REPAIR 2   ONE new table — material↔work consideration state, carrying
           actor + timestamp, separate from living_work_materials.
           NOT a column on the declaration table.
           Findings: no change. MAIA turns: out of scope.

REPAIR 3   ONE constraint on studio_companion_turns, plus whichever
           has-room CHECK resolution is ruled.

FILES      database/migrations/<ts>_ws2_substrate_01.sql   (one file)
```

## DATA MOVEMENT

**None.** No backfill is required or permitted:

- Work↔Manuscript — nothing to move; unassigned is the absence of a row
- Material consideration — untouched is the correct initial state for every
  existing material; a member act creates the first row
- Companion FK — additive constraint only; any invalid rows are adjudicated,
  never silently repaired

## ROLLBACK

```text
DROP TABLE IF EXISTS <material consideration table>;
ALTER TABLE studio_companion_turns
  DROP CONSTRAINT IF EXISTS studio_companion_turns_manuscript_fk;
-- plus restoration of the original has-room CHECK if it is altered
```

## RISKS

1. **The has-room CHECK interaction is a real fork**, not a detail. Choosing
   CASCADE to avoid it destroys relational evidence.
2. **The invalid-row census needs production.** The constraint must not be
   written before it runs.
3. **Repair 1 risks modelling a future the routes cannot reach.** The strongest
   version of this design defers most of it.
4. **`Keep` collides with `manuscript_keeps`.** A naming collision here would be
   the exact vocabulary lie the `priority`→`reach` rename was made to avoid.
5. **A 26-day-old claim** that `member_manuscripts.provenance` has no
   application readers should be re-verified, not inherited.

---

## CHANGE

**NONE.** Read-only. Awaiting adjudication before any migration is written.

---

LAST UPDATED 2026-08-28

---

# ADJUDICATION — founder, 2026-08-28

All three open questions ruled. **The unit is now tiny.**

```text
INVARIANT   Work↔Manuscript      PRESERVED · no change
REPAIR 1    provenance           CENSUS COMPLETE · NO MIGRATION NOW
REPAIR 2    material↔Work        ONE new table · Maybe / Not now only
FINDINGS    seven-state          PRESERVE · Keep/Dismiss → WS2-08
REPAIR 3    companion FK         OPTION B RULED · census required
```

No backfill. No provenance framework. No findings migration. No Work↔Manuscript
migration. **And none of this gates WS2-02.**

## Ruling 1 — Repair 3 takes option B

Both invariants are preserved rather than traded:

```text
conversation history is relational evidence
AND
a companion turn must still have a room
```

`CASCADE` is out — deleting a manuscript may not erase a conversation that
happened. **Relaxing the has-room CHECK globally is also out**: it converts a
deliberately structural guarantee into "usually true."

```text
FK manuscript_id → member_manuscripts(id) ON DELETE SET NULL

BEFORE DELETE on member_manuscripts
  if any studio_companion_turn has
      manuscript_id = the deleted manuscript
      AND living_work_id IS NULL
  → RESTRICT · refuse the deletion
  otherwise
  → deletion proceeds; the FK nulls manuscript_id;
    living_work_id keeps the turn situated
```

**Do not auto-attach a Living Work to save the delete.** If the turn is
manuscript-only, the truthful answer is that the manuscript cannot currently be
deleted without also resolving what happens to its relational history. Inventing
a Work to make a delete succeed is the same act D-022 was written against.

## Ruling 2 — Repair 1 defers; the generic layer is not built

The census changed this materially. Reachable objects already carry substantial
truthful provenance: manuscript entry method · manuscript source arrivals ·
material artifact/source custody · member-authored Work relationships · MAIA
turn authorship · finding authorship and disposition.

```text
REPAIR 1 — PROVENANCE

STATUS
  CENSUSED · NO MIGRATION REQUIRED NOW

PRESERVE
  member_manuscripts.provenance as ENTRY METHOD
  manuscript_source_arrivals
  studio_materials source custody
  declaration provenance (declared_by / declared_at)
  finding / MAIA authorship

REOPEN TRIGGER — the first reachable product path where
  · originator can vary for the same object kind
  · MAIA/source language can be adopted into manuscript
  · one object must durably name another as its origin
  · authority cannot be represented by the object's existing domain model
```

The path that triggers it is `MAIA proposes text → writer adopts it → that
language enters Manuscript`. **No such route exists today.**

> This is not postponing provenance. The provenance the product needs today is
> already mostly modelled, and this refuses to invent tomorrow's object model
> early.

No provenance JSONB catch-all, now or at reopen.

## Ruling 3 — no eighth finding disposition

The seven-state model stands unaltered. It already separates MAIA observation,
writer disposition, and actual manuscript change. **Do not distort it because a
reference screen says "Dismiss."**

`Dismiss` has at least two possible meanings on **different axes**:

```text
REJECT    "I disagree with this finding."          → authority / disposition
DISMISS   "I don't want this in my attention now."  → attentional / presentation
```

```text
FINDING DISPOSITION   PRESERVE the seven states · NO schema change here
KEEP                  overloaded (manuscript_keeps already means something
                      else) · WS2-08 product ruling required
DISMISS               do NOT map automatically to rejected
                      do NOT add an eighth state
                      WS2-08 resolves: authority act vs attentional act
```

If it is attentional, it does not belong in `disposition` at all — it belongs in
a separate surfacing model, persisted if "don't show me this again" is intended,
session-local if it merely closes a panel. **Authority and attention may not
collapse into one column.**

---

# CANDIDATE SQL — PREPARED, NOT EXECUTED

**No migration file has been created.** This is the design, held here until the
production census returns.

## Candidate A — material↔Work consideration

`Belongs` is **not** a state in this enum. Belonging is represented by the
existence of a `living_work_materials` declaration row. Putting `maybe` on that
row would mean *"this belongs, but maybe"*, which is nonsense.

```sql
-- ROLLBACK: DROP TABLE IF EXISTS living_work_material_considerations;

-- A member CONSIDERED a material for a Work and did not declare belonging.
-- Sibling of living_work_materials, deliberately separate: that table's row IS
-- the declaration of belonging, so an unresolved state cannot live on it.
--
-- Absence of a row here AND in living_work_materials = never considered.
-- That is the truthful default for every existing material; nothing is
-- backfilled.
CREATE TABLE IF NOT EXISTS living_work_material_considerations (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  living_work_id   UUID NOT NULL REFERENCES living_works(id) ON DELETE CASCADE,

  -- Mirrors living_work_materials' polymorphic pair exactly, including its
  -- TEXT material_id. Diverging here would create two addressing schemes for
  -- the same material.
  material_type    TEXT NOT NULL,
  material_id      TEXT NOT NULL,

  -- Two states, and neither asserts belonging.
  --   maybe    considered; the member has not resolved it
  --   not_now  considered and declined or deferred — a real answer,
  --            not an absence
  state            TEXT NOT NULL CHECK (state IN ('maybe', 'not_now')),

  -- The row is a member act. It cannot be written without saying who and when
  -- — the same grammar as living_work_expressions, whose declared_by carries a
  -- real FK. (living_work_materials.declared_by does NOT; the stronger form is
  -- followed here deliberately.)
  acted_by         UUID NOT NULL REFERENCES members(id) ON DELETE RESTRICT,
  acted_at         TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE (living_work_id, material_type, material_id)
);

CREATE INDEX IF NOT EXISTS living_work_material_considerations_work_idx
  ON living_work_material_considerations (living_work_id, acted_at DESC);
```

**Open for the migration candidate, not decided here:** whether a declaration
and a consideration may coexist for the same pair (declaring belonging probably
clears the consideration), and whether `state` transitions keep history. Both
are member-semantics questions.

## Candidate B — companion FK + delete guard

```sql
-- ROLLBACK:
--   DROP TRIGGER IF EXISTS member_manuscripts_companion_guard ON member_manuscripts;
--   DROP FUNCTION IF EXISTS refuse_delete_orphaning_companion_turn();
--   ALTER TABLE studio_companion_turns
--     DROP CONSTRAINT IF EXISTS studio_companion_turns_manuscript_fk;

-- NOT VALID first: no long lock, and any pre-existing invalid rows are
-- adjudicated rather than silently blocking or being repaired.
ALTER TABLE studio_companion_turns
  ADD CONSTRAINT studio_companion_turns_manuscript_fk
  FOREIGN KEY (manuscript_id) REFERENCES member_manuscripts(id)
  ON DELETE SET NULL
  NOT VALID;

-- Run only after the census resolves any non-resolving rows:
-- ALTER TABLE studio_companion_turns
--   VALIDATE CONSTRAINT studio_companion_turns_manuscript_fk;

-- Option B's second half. The FK alone would null manuscript_id and leave a
-- manuscript-only turn homeless, breaking studio_companion_turns_has_room at
-- delete time. This refuses the delete instead of weakening the CHECK.
--
-- BEFORE DELETE on the referenced table fires ahead of the FK's RI action.
CREATE OR REPLACE FUNCTION refuse_delete_orphaning_companion_turn()
RETURNS TRIGGER AS $$
DECLARE
  homeless_count INTEGER;
BEGIN
  SELECT count(*) INTO homeless_count
    FROM studio_companion_turns
   WHERE manuscript_id = OLD.id
     AND living_work_id IS NULL;

  IF homeless_count > 0 THEN
    RAISE EXCEPTION
      'Cannot delete manuscript %: % companion turn(s) belong to it and to no '
      'Living Work. Deleting it would leave that conversation with no room. '
      'Declare the work these turns belong to, or resolve the conversation '
      'history first.',
      OLD.id, homeless_count
      USING ERRCODE = 'foreign_key_violation';
  END IF;

  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS member_manuscripts_companion_guard ON member_manuscripts;
CREATE TRIGGER member_manuscripts_companion_guard
  BEFORE DELETE ON member_manuscripts
  FOR EACH ROW
  EXECUTE FUNCTION refuse_delete_orphaning_companion_turn();
```

⚠ **The refusal must reach the member as words, not a 500.** Any route that
deletes a manuscript will now receive a `foreign_key_violation` it does not
handle today. That handling is part of the migration candidate, per D-014 — a
refusal that leaves no record, or that reaches the member as a generic error, is
not instrumented.

---

# REQUIRED BEFORE THE MIGRATION IS WRITTEN

**Mac/runtime lane. Cannot be run from a remote container** — no database.

```sql
-- 1. Do any turns name a manuscript that no longer exists?
--    Non-zero blocks VALIDATE CONSTRAINT and needs adjudication, never a
--    silent repair.
SELECT count(*) AS non_resolving
  FROM studio_companion_turns t
  LEFT JOIN member_manuscripts m ON m.id = t.manuscript_id
 WHERE t.manuscript_id IS NOT NULL
   AND m.id IS NULL;

-- 2. How many manuscripts would become undeletable under option B?
SELECT count(DISTINCT t.manuscript_id) AS manuscripts_guarded,
       count(*)                        AS manuscript_only_turns
  FROM studio_companion_turns t
 WHERE t.manuscript_id IS NOT NULL
   AND t.living_work_id IS NULL;

-- 3. Shape check: how much companion history is manuscript-only at all?
SELECT living_work_id IS NULL AS no_work,
       manuscript_id  IS NULL AS no_manuscript,
       count(*)
  FROM studio_companion_turns
 GROUP BY 1, 2;
```

Run on minisforum inside the container:

```bash
ssh soullab@minisforum 'docker exec maia-postgres \
  psql -U soullab maia_consciousness -c "<query>"'
```

```text
RETURN   counts + the exact proposed migration
STATUS   REPAIR 3 migration HELD until (1) and (2) come back
         REPAIR 2 candidate A is not blocked by the census
```

**CHANGE: NONE.**


---

# EVIDENCE — R2 concurrency gate

**PASS.** Founder-run, 2026-08-28, Kelly's Mac Studio.

```text
candidate     ecdc2b61f
probe         scripts/verify-ws2-substrate-01-concurrency.ts
database      local dev maia_consciousness (PostgreSQL 17.7), candidate applied
result        PASS — 25 rounds, exactly one winner each time.
              Belongs and consideration never coexisted.
```

## Why this is a differential result, not an agreement

The same probe, against the same database, **failed 25 of 25 rounds** minutes
earlier with `Belongs AND consideration coexist (declarations=1,
considerations=1)`. Between the two runs nothing changed but the installed
guard: the malformed `4fb520f9c` migration had put the OLD unlocked function
into that database, and `ecdc2b61f` replaced it with the locked one.

So the probe is not a test that passes because the system passes. It is a test
that **distinguishes a locked guard from a raceable one**, and it has now been
observed doing both. A probe that has never failed against a known-bad artifact
has not been shown to be capable of failing.

## What was actually witnessed

```text
exactly one COMMIT and one refusal per round     25/25
the refusal carried 23001 + material_relationship_conflict:   25/25
no round left rows in both tables                25/25
no round lost both writes                        25/25
```

The precondition check also earned its place: on a schema-less `ws2_probe`
database it refused by name rather than failing on a generic missing relation,
and it would have named an installed-but-unlocked guard had one been present.

## What this does NOT establish

- **Not production.** Local dev PostgreSQL only. The candidate has not been
  applied to minisforum and must not be, ahead of a deploy ruling.
- **Not Co-Lab.** That gate was green (33 · 0 · 0) on an earlier head; per D-013
  acceptance is re-measured at the current referent, so it is re-run against
  whatever finally ships.
- **Not the routes under real concurrency.** The probe races the SQL directly,
  which is the invariant's home. The 409 path is proved by unit test, not by a
  live two-request race.

## Environment note, unrelated to R2

`pg_dump` on that machine is 14.19 against a 17.7 server, so the
disposable-database path (`pg_dump -s` into `ws2_probe`) aborts on version
mismatch and produces an empty schema. Both `postgresql@14` and `postgresql@17`
are installed under Homebrew; `@14` wins the PATH. Anything that snapshots
schema will hit this until the PATH prefers `@17`.
