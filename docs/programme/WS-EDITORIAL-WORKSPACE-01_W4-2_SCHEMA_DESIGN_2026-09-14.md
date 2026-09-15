# W4-2 — SCHEMA DESIGN

**Programme** `WS-EDITORIAL-WORKSPACE-01`
**Date** 2026-09-14
**Authorized by** founder act, 2026-09-14
**Base** `a79163ff6` (W4-1.2)
**Branch** `claude/w4-2-schema-design`
**Class** ⛔ **RECORD / DESIGN ONLY. No migration file is written by this act.**

> **The design bar.** A binding must not merely preserve a claimed
> relationship; the database must make the **wrong turn, wrong chain, wrong act
> and wrong author unrepresentable.**

---

## 0. What the database can already prove, and what it cannot

| fact | today |
|---|---|
| a thread belongs to a member and a Work | ✅ FK |
| a chain-bound thread's chain belongs to the same member **and Work** | ✅ W5-3 composite FK, `MATCH SIMPLE` |
| the thread's editorial parent is frozen at open | ✅ `ask_threads_freeze()` (W5-3) |
| turns are append-only, one per `(thread_id, turn_index)` | ✅ PK + trigger |
| a version's predecessor is in the same chain | ✅ composite FK `(chain_id, supersedes)` |
| a Direction's reference is in the same chain | ✅ composite FK `(proposal_chain_id, refers_to_version_id)` |
| **a thread has exactly one subject** | ❌ `anchor NOT NULL` + nullable chain admits both |
| **an editorial thread is not also frozen against a reading** | ❌ nothing |
| **which turn performed which authored act** | ❌ no object at all |

---

## 1. Thread-subject refinement

### 1.1 The XOR

```sql
ALTER TABLE ask_threads ALTER COLUMN anchor DROP NOT NULL;

ALTER TABLE ask_threads
  ADD CONSTRAINT ask_threads_one_subject
  CHECK (num_nonnulls(anchor, proposal_chain_id) = 1) NOT VALID;
-- then, in its own statement, taking only SHARE UPDATE EXCLUSIVE:
ALTER TABLE ask_threads VALIDATE CONSTRAINT ask_threads_one_subject;
```

⭐ **`NOT VALID` then `VALIDATE` is deliberate.** `ask_threads` is a live
production table; a plain `ADD CONSTRAINT` takes `ACCESS EXCLUSIVE` for the
length of a full scan. Split, the scan runs under a weaker lock. ⛔ And the
`VALIDATE` is not optional: a constraint left `NOT VALID` is enforced for new
rows and **silently unenforced as an invariant over the existing ones**, which
is the shape of a guarantee that reads true and is not.

⭐ **Every existing row already satisfies it** — `anchor NOT NULL` held until
now and `proposal_chain_id` has no backfill — so `VALIDATE` is expected to pass
on the first attempt. ⛔ **If it does not, that is a finding, not an obstacle**:
a row carrying both subjects would mean something wrote one, and the migration
must stop rather than repair it.

⛔ **No backfill invents a subject.** A historical thread's absent
`proposal_chain_id` is the evidence that it predates the editorial object — the
same sentence W5-3 already wrote about that column.

### 1.2 An editorial thread is not frozen against a reading — **RULED: yes**

```sql
ALTER TABLE ask_threads
  ADD CONSTRAINT ask_threads_editorial_has_no_reading
  CHECK (proposal_chain_id IS NULL OR reading_identity IS NULL) NOT VALID;
```

A chain-bound editorial thread is **not** simultaneously frozen against an Ask
reading. `reading_identity` exists so a proposal-dependent anchor can be checked
against the `StructureInterpretation` or `DevelopmentalReading` it points into
(`checkAnchor`); an editorial thread has no anchor and points into neither. A
thread carrying both would assert it was about a frozen reading it never
addressed.

⭐ **`canonical_at_open` stays, and stays its own fact.** It is the BEFORE of the
conversation's own before/after assertion. ⛔ **It does not become
`proposal_chains.base_version`** — those are two different moments (when the
chain opened against the Work; when this conversation opened) and collapsing
them would make the thread's baseline a copy of a fact it does not own.

### 1.3 The FK target the binding needs

```sql
ALTER TABLE ask_threads
  ADD CONSTRAINT ask_threads_id_chain_key UNIQUE (id, proposal_chain_id);
```

Trivially satisfied (`id` is the PK), and it exists **only** to be an FK target.
⭐ Its power is what it lets a referencing row prove in one constraint: *this
thread, and this thread's chain* — see B1–B3.

### 1.4 Freeze

⭐ **No change.** W5-3 already added `proposal_chain_id` to `ask_threads_freeze()`.
`anchor` is already frozen, so a thread cannot acquire an anchor later and break
the XOR by mutation. ⛔ The rollback footer must still restore the **W5-3**
freeze body, not the pre-W5 one.

---

## 2. Turn ↔ authored-act binding

### 2.1 One relation, not two

Founder-favoured, and the reason is W4 v1's cross-kind law: **one turn may carry
at most one semantic adjunct.** Two tables cannot express that law at all — it
would become an application convention across them. One relation expresses it as
a primary key.

```sql
CREATE TABLE editorial_turn_bindings (
  -- ⭐ B6, as the PRIMARY KEY: one turn, at most one adjunct. Not a CHECK
  -- across two tables; not a convention. There is nowhere to put a second row.
  thread_id         uuid    NOT NULL,
  turn_index        integer NOT NULL,

  -- ⭐ Denormalised so the composite FKs below can prove B2/B3/B9. See §2.3.
  turn_speaker      text    NOT NULL CHECK (turn_speaker IN ('author', 'maia')),
  proposal_chain_id uuid    NOT NULL,
  act_author        text    NOT NULL CHECK (act_author IN ('maia', 'member')),

  direction_id      uuid,
  version_id        uuid,

  PRIMARY KEY (thread_id, turn_index),

  -- B6 · exactly one adjunct, and never zero.
  CONSTRAINT etb_one_adjunct CHECK (num_nonnulls(direction_id, version_id) = 1),

  -- ⭐⭐ B9 · THE VOCABULARY BRIDGE. `ask_turns.speaker` says author|maia;
  -- authored acts say member|maia. No FK can express a MAPPING — but a row
  -- carrying both columns can, and the FKs below prove each column against its
  -- own source row, so the pair cannot be a lie.
  CONSTRAINT etb_speaker_matches_author CHECK (
    (turn_speaker = 'author' AND act_author = 'member')
    OR (turn_speaker = 'maia' AND act_author = 'maia')
  ),

  -- B1 + B2 + B3 in ONE constraint. The thread exists, its editorial parent is
  -- this chain, and — because this row's proposal_chain_id is NOT NULL while an
  -- anchored thread's is NULL — the thread cannot be an anchored Ask thread.
  CONSTRAINT etb_thread_is_editorial
    FOREIGN KEY (thread_id, proposal_chain_id)
    REFERENCES ask_threads (id, proposal_chain_id)
    ON UPDATE RESTRICT ON DELETE CASCADE,

  -- B9(turn half) · the turn exists in that thread AND really has this speaker.
  CONSTRAINT etb_turn
    FOREIGN KEY (thread_id, turn_index, turn_speaker)
    REFERENCES ask_turns (thread_id, turn_index, speaker)
    ON UPDATE RESTRICT ON DELETE CASCADE,

  -- B4 + B9(act half). MATCH SIMPLE: unchecked when direction_id is NULL.
  CONSTRAINT etb_direction
    FOREIGN KEY (proposal_chain_id, direction_id, act_author)
    REFERENCES proposal_chain_directions (proposal_chain_id, id, author)
    MATCH SIMPLE ON UPDATE RESTRICT ON DELETE RESTRICT,

  -- B5 + B9(act half).
  CONSTRAINT etb_version
    FOREIGN KEY (proposal_chain_id, version_id, act_author)
    REFERENCES proposal_versions (chain_id, id, author)
    MATCH SIMPLE ON UPDATE RESTRICT ON DELETE RESTRICT
);

-- B7 · one Direction is claimed by at most one turn.
CREATE UNIQUE INDEX etb_one_turn_per_direction
  ON editorial_turn_bindings (direction_id) WHERE direction_id IS NOT NULL;

-- B8 · one Version is claimed by at most one turn.
CREATE UNIQUE INDEX etb_one_turn_per_version
  ON editorial_turn_bindings (version_id) WHERE version_id IS NOT NULL;
```

### 2.2 ⭐ FOUR UNIQUE KEYS MUST BE ADDED FIRST — one of them is a real gap

A composite FK requires its target columns to carry a unique constraint. Three
of the four are trivial re-statements of existing keys; **the third is a genuine
absence**.

```sql
-- B1/B2/B3 target (§1.3)
ALTER TABLE ask_threads
  ADD CONSTRAINT ask_threads_id_chain_key UNIQUE (id, proposal_chain_id);

-- B9 turn half. PK is (thread_id, turn_index); the triple is a new target.
ALTER TABLE ask_turns
  ADD CONSTRAINT ask_turns_thread_index_speaker_key
  UNIQUE (thread_id, turn_index, speaker);

-- ⭐ B4 · THE REAL GAP. `proposal_versions` carries UNIQUE (chain_id, id);
-- `proposal_chain_directions` carries NOTHING equivalent, so there is today no
-- way for any constraint to say "this Direction is in this chain".
ALTER TABLE proposal_chain_directions
  ADD CONSTRAINT proposal_chain_directions_chain_id_id_author_key
  UNIQUE (proposal_chain_id, id, author);

-- B5 · the author column added to the existing pair. ⛔ The existing
-- UNIQUE (chain_id, id) STAYS — `proposal_versions_predecessor_same_chain`
-- targets it, and dropping it would break succession.
ALTER TABLE proposal_versions
  ADD CONSTRAINT proposal_versions_chain_id_id_author_key
  UNIQUE (chain_id, id, author);
```

### 2.3 ⚠️ Why three denormalised columns are admissible here

`turn_speaker`, `proposal_chain_id` and `act_author` are copies of facts that
live elsewhere, and this programme treats duplicated facts as drift waiting to
happen. Three properties make these safe, and **all three are required** — if
any one failed, the design would be wrong:

1. **Each copy is FK-verified against its source row at write time.** A binding
   asserting `turn_speaker = 'maia'` for an author turn does not insert.
2. **The sources cannot change.** `ask_turns` refuses UPDATE
   (`ask_turns_append_only`); `proposal_chain_directions` and `proposal_versions`
   refuse UPDATE (`authored_editorial_record_immutable`); `ask_threads` freezes
   `proposal_chain_id`. There is no later edit for the copy to fall out of step
   with.
3. **The binding itself refuses UPDATE** (§2.4), so the copy cannot be changed
   after the FK proved it.

⭐ So these are not a cache. They are **the only way ordinary constraints can
express a mapping between two vocabularies**, and the founder's instruction was
to design the smallest real enforcement rather than weaken the claim.

⭐⭐ **And the result is stronger than a constraint trigger would have been:**
B9 becomes *unrepresentable* rather than *rejected*. No trigger is needed, and
none should be added.

### 2.4 Immutability, and why it is NOT the W5-3 trigger

```sql
CREATE OR REPLACE FUNCTION editorial_turn_binding_immutable()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION
    'editorial turn binding %/% is immutable: a correction is a new binding, never a revision of one already recorded',
    OLD.thread_id, OLD.turn_index;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER editorial_turn_bindings_no_update
  BEFORE UPDATE ON editorial_turn_bindings
  FOR EACH ROW EXECUTE FUNCTION editorial_turn_binding_immutable();
```

⛔ **`authored_editorial_record_immutable()` must NOT be reused.** It refuses
UPDATE **and DELETE**, which is right for an authored act and wrong for a
binding: withdrawal has to be able to remove one. Reusing it because the name
fits would make the withdrawal law unenforceable at the exact seam that exists
to carry it.

### 2.5 Lifecycle — the impossible FK, avoided

```
DELETE a thread
  → ask_turns          CASCADE  (existing)
  → bindings           CASCADE  (etb_thread_is_editorial, etb_turn)

  → Direction          UNTOUCHED
  → ProposalVersion    UNTOUCHED
```

⭐ The direction of the FK is the whole design. The binding **references** the
authored act; the act references nothing. So the act never carries a mutable
`turn_id`, and the three impossible options the contract named —

```
RESTRICT   the writer cannot withdraw their own conversation
CASCADE    withdrawing conversation ERASES an authored act
SET NULL   an immutable record is rewritten
```

— never arise, because no FK points from the durable act at the withdrawable
thread. `ON DELETE RESTRICT` on the act side is the belt: it refuses to let an
authored act be deleted while a binding still names it.

### 2.6 ⛔ No chronology columns

No `created_order`, `event_index`, `editorial_sequence`, `authored_at` — and **no
surrogate `id`**. `(thread_id, turn_index)` is the identity, and `turn_index`
already answers *where in discourse the act occurred*. ⛔ It creates no global
ordering across Insight, Direction, Version and conversation, and a surrogate id
would be exactly the column a future reader sorts by.

---

## 3. The obligations, and what proves each

| # | claim | proved by |
|---|---|---|
| **B1** | the bound turn belongs to the named thread | `etb_turn` (thread_id in the FK) |
| **B2** | the thread is EDITORIAL, not an anchored Ask thread | `etb_thread_is_editorial` — the binding's `proposal_chain_id` is `NOT NULL`, an anchored thread's is `NULL`, so the pair cannot match |
| **B3** | `thread.proposal_chain_id = binding.proposal_chain_id` | the same FK, same constraint |
| **B4** | the Direction belongs to that exact chain | `etb_direction`, on the **new** `UNIQUE (proposal_chain_id, id, author)` |
| **B5** | the Version belongs to that exact chain | `etb_version`, on the new `UNIQUE (chain_id, id, author)` |
| **B6** | one turn cannot bind both | `etb_one_adjunct` + PK `(thread_id, turn_index)` |
| **B7** | one Direction cannot be claimed by two turns | `etb_one_turn_per_direction` |
| **B8** | one Version cannot be claimed by two turns | `etb_one_turn_per_version` |
| **B9** | the turn's speaker agrees with the act's author | `etb_speaker_matches_author` **bridging two FK-verified columns** — not a trigger, not a convention |

⭐ **Every one is a constraint, and none is an application check.**

### The two B9 cases named explicitly

```
member Direction bound to a MAIA turn
    turn_speaker must be 'maia' (etb_turn), act_author must be 'member'
    (etb_direction) → etb_speaker_matches_author refuses the pair

MAIA Version bound to an author turn
    turn_speaker 'author' + act_author 'maia' → refused identically
```

⛔ Neither is representable. A caller cannot lie in one column without the FK
catching it, and cannot lie in both without the CHECK catching the pair.

---

## 3b. ⭐ The design was PROBED, not merely written

⛔ **No migration file exists and nothing was migrated.** The DDL above was
applied inside a **transaction that rolled back**, on the **disposable
`w5_witness` database**, purely to establish that the constraints behave as this
record claims. *A design that asserts constraint behaviour without checking it is
a claim, not a design.* Evidence class: **BEHAVIOURAL, ephemeral, rolled back.**

```
B9a  member Direction bound to a MAIA turn   → etb_speaker_matches_author  REFUSED
B9b  MAIA Version bound to an author turn    → etb_speaker_matches_author  REFUSED
B2   binding onto an ANCHORED thread         → etb_thread_is_editorial     REFUSED
B6   both adjuncts on one turn               → etb_one_adjunct             REFUSED
     lawful member Direction on author turn  → INSERT 0 1
     lawful MAIA Version on maia turn        → INSERT 0 1
B7   same Direction claimed by a 2nd turn    → etb_one_dir                 REFUSED

lifecycle · DELETE the thread
     bindings_left 0 · directions_left 1 · versions_left 1
```

⭐⭐ **The last line is the whole lifecycle law, observed rather than argued**:
the conversation went, the bindings went with it, and both authored acts are
still standing.

⭐ `num_nonnulls(NULL,'x')=1`, `(NULL,NULL)=0`, `('a','b')=2` — confirmed, and it
is PostgreSQL 9.6+, so the XOR needs no version gate.

### ⚠️ And the probe found something the design did not predict

`VALIDATE CONSTRAINT ask_threads_one_subject` **failed on the first attempt**:
the `w5_witness` database held a thread carrying **both** an anchor and a
`proposal_chain_id`.

It is not corruption. It is the **W5-3 schema witness's own fixture**: that
witness proves the composite chain FK by inserting a chain-bound thread, and
`anchor` was still `NOT NULL` when it was written, so it had to supply one.

Two consequences, both real:

1. ⭐ **A thread with two subjects is writable today.** The probe is a live
   demonstration that this constraint is not theoretical — it forbids a row the
   current schema accepts.
2. ⛔ **The W5-3 schema witness will go RED when the migration lands**, and that
   is correct: its fixture becomes unlawful. The repair is to write its
   chain-bound thread with `anchor = NULL`, and it is **owed by the migration
   act, not by this design** — a design that quietly edited a neighbouring
   witness to make its own future run green would be arranging its own evidence.

⭐ Re-run on a freshly rebuilt database: every statement applied, `DDL ALL
APPLIED`, rolled back.

---

## 4. Rollback

```sql
BEGIN;
  DROP TRIGGER IF EXISTS editorial_turn_bindings_no_update ON editorial_turn_bindings;
  DROP TABLE IF EXISTS editorial_turn_bindings;
  DROP FUNCTION IF EXISTS editorial_turn_binding_immutable();

  ALTER TABLE proposal_versions
    DROP CONSTRAINT IF EXISTS proposal_versions_chain_id_id_author_key;
  ALTER TABLE proposal_chain_directions
    DROP CONSTRAINT IF EXISTS proposal_chain_directions_chain_id_id_author_key;
  ALTER TABLE ask_turns
    DROP CONSTRAINT IF EXISTS ask_turns_thread_index_speaker_key;
  ALTER TABLE ask_threads
    DROP CONSTRAINT IF EXISTS ask_threads_id_chain_key;

  ALTER TABLE ask_threads
    DROP CONSTRAINT IF EXISTS ask_threads_editorial_has_no_reading;
  ALTER TABLE ask_threads
    DROP CONSTRAINT IF EXISTS ask_threads_one_subject;

  -- ⭐⭐ THE ONE STEP THAT CAN FAIL, AND IT MUST BE ALLOWED TO.
  ALTER TABLE ask_threads ALTER COLUMN anchor SET NOT NULL;
COMMIT;
```

⭐⭐ **`SET NOT NULL` fails if any editorial thread exists**, because an
editorial thread's anchor is `NULL`. That is correct and it is the design's most
important rollback property:

> Rollback is clean while the refinement has been applied and **not yet used**.
> Once a writer has held one editorial conversation, rolling back is no longer a
> schema operation — it is a decision about their record.

⛔ **The rollback must NOT delete editorial threads to make itself succeed.** If
`SET NOT NULL` fails, the correct outcome is that the rollback **stops** and the
founder rules on those rows. A rollback that quietly destroys a member's
conversation to restore a column constraint is the more destructive error — the
same reasoning as the 2026-09-07 *reconcile forward* ruling.

⛔ And the W5-3 rollback footer must be read together with this one: it restores
the **pre-W5** `ask_threads_freeze()`. Running W4-2's rollback alone leaves the
**W5-3** freeze in place, which is correct — ⛔ but the two footers must not be
run out of order.

---

## 5. Custody — the September-7 rule is controlling

```
design accepted      ≠ migration authorized
migration written    ≠ merge authorized
merge                ≠ protected execution authorized
```

⛔ **No migration file is written by this act.** When one is authorized it
inherits `20260914000005`'s custody through this branch's ancestry:
development / disposable DB ✅ · push ✅ · **canonical merge ⛔ · deployment ⛔ ·
protected migration execution ⛔.**

⚠️ And the branch-gate defect remains controlling: *merging a migration to the
production branch is, in effect, authorizing it to be applied by whoever deploys
next.* This refinement **alters `ask_threads`, a live production table**, which
makes that coupling sharper here than in any W5 act — `20260914000005` only
added a nullable column and new tables; this one relaxes a `NOT NULL` on a table
production writes to today.

---

## 6. Open, and named

- **Whether an editorial thread may carry `initiated_by = 'maia'`.** Nothing in
  this design constrains it, and it is probably right that MAIA opening with an
  Insight is recorded as her initiating — but no act has ruled it, and this
  design does not decide it silently.
- **Many threads per chain stays lawful** (W5-3 declined a unique index on
  `proposal_chain_id`). B7/B8 are chain-wide rather than thread-wide, so a
  Direction bound in one thread cannot be re-bound in a second thread on the same
  chain. That is the intended reading of *"one Direction → at most one producing
  turn"* and is stated here so a later act does not weaken it to per-thread.
- **No index is proposed for the reverse lookup** *"which turn produced this
  act"* beyond the two partial uniques, which already serve it. ⛔ An index added
  before a query exists is a guess.
- **The W5-3 schema witness fixture** (§3b) must be rewritten to `anchor = NULL`
  by the migration act, not by this one.
- **The W5-4 `Z4` label** still overstates its coverage; the repair is owed the
  next time that witness is touched.

---

## 7. Standing

⚠️ **SUPERSEDED by §8** (founder ruling, 2026-09-14). Kept verbatim as the
standing at the time this record was authored — ⛔ never edited to read as if
it had always said otherwise.

```
W4-1.2                          ✅ CLOSED · a79163ff6
W4-2 schema design              ✅ THIS RECORD

W4 schema implementation        ⛔ HELD — no migration file written
W4 producer registration        ⛔ HELD
W4 canonical service seam       ⛔ HELD
W4 route / runtime · Canvas     ⛔

canonical / schema landing      ⛔
protected migration             ⛔
production                      UNTOUCHED
maia_focus_witness              FROZEN
```

---

## 8. ⭐ FOUNDER RULING — CLOSURE AT THE DESIGN BOUNDARY

**Recorded 2026-09-14, after `f210df118` was committed**, by an authorized
**record-only** act on a branch descending from `f210df118` unchanged.

⛔ This section adds no design. It writes down an adjudication that was made in
session and would otherwise have survived only in a transcript — which in this
project is the same as not having been recorded at all. ⛔ No migration file, no
fixture edit, no `lib/`, no `database/`, no merge, no execution.

### 8.1 W4-2 schema design is ACCEPTED AND CLOSED AT THE DESIGN BOUNDARY

⛔ **Acceptance of the design authorizes nothing else.** It does not authorize a
migration act, a merge, protected execution, or any implementation act. §5's
custody chain is unchanged and still controlling:
*design accepted ≠ migration authorized ≠ merge ≠ protected execution.*

### 8.2 ⭐ MIGRATION-BASE LOCK

**⚠️ NARROWED 2026-09-15**, by the founder act that opened the migration lane.
The lock below is operative; what it replaced is recorded beneath it.

> Any migration act must begin from **`911efbbb`**, or from a descendant
> carrying **this custody ruling in full** — ⛔ not from bare `f210df118`.

⭐ **`f210df118` is where the design authority originates; `911efbbb` is where
the terms of its custody become durable.** A migration branched from bare
`f210df118` would carry the design and **not** §8 — so it would arrive with the
obligations of §8.4 stated (§6 already names them) but with **no** §8.3, and the
W5-3 break would read as unfinished work to whoever met it first. ⛔ That is the
whole reason this section exists, and the original wording did not exclude it.

⛔ **Superseded wording, kept verbatim** — ⛔ never edited to read as if it had
always said otherwise:

> *Any eventual migration act must begin from `f210df118`, or from a descendant
> carrying this design record.*

⚠️ **The most likely future consumer has no first-read path to this lock.**
`JARVIS-WRITERS-STUDIO-EDITORIAL-01` names *locus-scoped authored proposal
succession* as its next engineering priority — the work this design serves — and
a session picking it up would naturally branch from the editorial tip, which
carries neither the design nor this ruling. ⭐ **Therefore the handoff is ONE
custody act, never three chores**: narrow this section · branch from `911efbbb`
or a descendant · carry the design and this ruling into the migration lane.
⛔ Doing any one without the others relocates the ambiguity rather than closing
it.

⛔ **`claude/ecstatic-sagan-ohakll` @ `1a555430` is explicitly disqualified as a
migration base**, because `f210df118` is not in its lineage.

⭐ **This is a lineage ruling, not a judgment about the content of `1a555430`.**
The disqualification would hold equally if that head were perfect: a migration
authored from a base that does not carry its own design record has no stated
origin for the obligations in §8.4, and the W5-3 break in §8.3 would arrive
unexplained.

### 8.3 ⭐⭐ W5-3 FIXTURE CUSTODY — WHY THE BREAK IS LEFT STANDING

The W5-3 schema-witness fixture (§3b) remains **untouched** by the design act.

> ⭐⭐ **The fixture break is evidence of the migration's semantic effect, not
> preparatory work for the migration.**

That sentence is the reason a later maintainer must not *helpfully* repair the
witness before the migration exists. §3b records that the break was **found**;
§6 records that its repair is owed elsewhere; ⭐ **neither states why leaving it
is discipline rather than oversight**, and an untouched failing witness reads as
unfinished work to anyone who arrives without this ruling.

Therefore:

- ⛔ **do not pre-edit the fixture**;
- ✅ **allow the migration act to produce the RED** — the RED is the
  demonstration that the new CHECK forbids a row the current schema accepts;
- ✅ **repair the fixture inside the same authorized migration act** that makes
  the old fixture invalid.

### 8.4 MIGRATION OBLIGATIONS REMAIN OWED, NOT PERFORMED

- **`ask_threads` two-subject repair** — `NOT VALID`, then **`VALIDATE` as a
  separate statement**. ⛔ A constraint left `NOT VALID` is enforced for new rows
  and silently unenforced as an invariant over the old ones.
- **W5-3 fixture repair** — after the witnessed break, per §8.3.
- **`UNIQUE (proposal_chain_id, id)` on `proposal_chain_directions`** — the real
  gap of §2.2. ⛔ Until it exists, B4's composite FK has no target.

### 8.5 Standing after this ruling

```
W4-2 SCHEMA DESIGN     ✅ CLOSED · f210df118
migration              ⛔ NOT AUTHORIZED
migration base         🔒 f210df118 or descendant carrying this record
W5-3 fixture repair    ⏸ owed inside the migration act
merge                  ⛔ not implied
protected execution    ⛔ not implied
production             UNTOUCHED
```
