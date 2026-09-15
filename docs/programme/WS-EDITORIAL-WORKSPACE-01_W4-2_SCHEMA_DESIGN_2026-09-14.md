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

⚠️⚠️ **THE LOCK CLAIM THAT WAS HERE WAS WRONG, AND IS CORRECTED IN §8.** It
said *"split, the scan runs under a weaker lock"*, which is true **across
transactions** and false **across mere statements** — PostgreSQL holds a table
lock until the transaction that took it ends. The two statements as written
above are a single phase and buy nothing. See **W4-2.1 · §8**, which replaces
this shape with two migration files.

⭐ What remains true: the `VALIDATE` is **not optional**. A constraint left
`NOT VALID` is enforced for new rows and **silently unenforced as an invariant
over the existing ones** — the shape of a guarantee that reads true and is not.

⚠️ **CLAIM NARROWED BY W4-2.1 (founder, 2026-09-14).** This paragraph first
said *"every existing row already satisfies it… so VALIDATE is expected to
pass"*, reasoning from the absence of a backfill. ⛔ **No backfill does not prove
no row.** The probe in §3b falsified the stronger inference within the hour, on
the first database it was pointed at. The durable statement is:

> No production runtime currently writes `proposal_chain_id`, so **no
> runtime-created violating row is known**. Existing protected rows remain
> **unproved until preflight**. Validation is the authority and may refuse.

⛔ **If it refuses, that is a finding, not an obstacle**: a row carrying both
subjects means something wrote one, and the migration must stop rather than
repair it.

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
record claims.

⚠️ **CORRECTED BY W4-2.2a §23**: that sentence is true of THIS probe and **not**
of the lock probes in §8/§11, two of whose statements ran under psql autocommit
and **did** persist — leaving `anchor` nullable on the witness database. The
distinction is recorded rather than smoothed. *A design that asserts constraint behaviour without checking it is
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

# W4-2.1 — MIGRATION PHASING SEAL

**Authorized by** founder act, 2026-09-14, on source inspection of `f210df118`.
Same branch. ⛔ **Record / design only. No executable SQL.**

> The database design is right; the way we acquire that database state on a live
> table is not yet fully designed.

---

## 8. The lock claim, corrected — with evidence

⚠️ **§1.1 was wrong.** PostgreSQL retains a table lock acquired earlier in a
transaction until that transaction ends, so `NOT VALID` followed by `VALIDATE`
**in the same transaction** never reaches the weaker-lock window.

Measured on the disposable witness database (`pg_locks`, rolled back):

```
same transaction · DROP NOT NULL → ADD … NOT VALID → look at the locks
    AccessExclusiveLock   granted        ← still held; VALIDATE gains nothing

separate transaction · VALIDATE alone
    ShareUpdateExclusiveLock granted     ← the intended window
```

⭐ **This is not a subtlety about SQL style. It is the whole reason the phasing
must be two migration *files*, not two statements.**

## 9. The two runners, read rather than assumed

| runner | shape | consequence |
|---|---|---|
| `scripts/run-sql-migrations.sh:79` | `psql -c "BEGIN;" -f "$f" -c "COMMIT;"` | **force-wraps the whole file in one transaction** |
| `scripts/apply-migrations.sh:~110` | `\i '<file>'` inside one advisory-locked psql script | executes the file **as written**; transactions are whatever the file declares |

Existing migrations (`20260901000001`, `20260914000005`) each open with their own
`BEGIN;`, which under the first runner nests inside the wrapper and is a no-op
warning. ⭐ **So a single file cannot deliver two lock phases under both runners
without depending on that nesting** — and the dependency is worse than it looks:
under `run-sql-migrations.sh` an in-file `COMMIT;` would end the *runner's* wrapper
transaction, so the file would be committing a transaction it did not open.

⛔ **And a single file has a second, decisive failure mode**: `schema_migrations`
records a **filename**, once, after the whole file succeeds. If phase 2 refused,
phase 1 would already be committed and **nothing would be ledgered** — a live
table left altered with no record that it was, and a retry re-running phase 1
against its own result. *That is the un-ledgered half-file, and it is the reason
the phasing is files rather than statements.*

## 10. The lawful shape — two migration files

```
W4-S1 · subject preparation                        ← short ACCESS EXCLUSIVE
    ALTER COLUMN anchor DROP NOT NULL
    ADD CONSTRAINT ask_threads_one_subject            … NOT VALID
    ADD CONSTRAINT ask_threads_editorial_has_no_reading … NOT VALID
    COMMIT                                          ← the lock is released HERE
                                                      and ledgered HERE

W4-S2 · validation + binding substrate             ← a NEW transaction
    VALIDATE CONSTRAINT ask_threads_one_subject
    VALIDATE CONSTRAINT ask_threads_editorial_has_no_reading
    the four supporting UNIQUE targets (§11)
    editorial_turn_bindings + trigger + partial unique indexes
```

⭐ **The safe intermediate state is the point.** If S2 refuses — an old
two-subject row, or anything else — the database rests at:

```
anchor                    nullable
both CHECKs               present and ENFORCED ON NEW ROWS
the violating row         still visible, unrepaired, findable
runtime                   still creates no editorial threads
S1                        recorded in schema_migrations
S2                        not recorded — retryable once the row is ruled on
```

⛔ Nothing has been destroyed and nothing is un-ledgered. That is strictly
better than a half-applied file, and it is why the phases are split even though
S1 alone buys no new guarantee.

⚠️ **S1 must be written idempotently anyway** (`DROP NOT NULL` already is;
the two `ADD CONSTRAINT`s need an `IF NOT EXISTS`-equivalent guard, since
PostgreSQL has none for `ADD CONSTRAINT`), because a runner that fails *after*
the file succeeds but *before* the ledger write would re-run it.

## 11. The four supporting UNIQUE targets — lock strategy is an OPEN RULING

Measured: `ALTER TABLE … ADD CONSTRAINT … UNIQUE` takes **`AccessExclusiveLock`
+ `ShareLock`** and builds the index under them. Two of the four targets are on
live tables — `ask_threads` and `ask_turns`, the latter growing with every turn
anyone has ever spoken.

**Option A — ordinary unique build**, accepted **only after** protected preflight
proves the tables are small enough that the build is a blip.

**Option B — `CREATE UNIQUE INDEX CONCURRENTLY`**, then attach it via
`ADD CONSTRAINT … USING INDEX`.

⛔⛔ **Option B is not merely unprecedented here; it is structurally
incompatible with one of the two runners.** Measured:

```
BEGIN; CREATE UNIQUE INDEX CONCURRENTLY … ;
  → ERROR: CREATE INDEX CONCURRENTLY cannot run inside a transaction block
```

and `run-sql-migrations.sh` **force-wraps every file** in `BEGIN;`/`COMMIT;`.
So B would require either abandoning that runner for this migration, or a file
that deliberately commits a transaction it did not open. ⭐ Both are **custody
decisions, not implementation details**, and neither is taken here.

⭐ Also: `grep -rl CONCURRENTLY database/migrations/` returns **nothing** — this
repository has no concurrent-index precedent at all, and a failed CIC leaves an
`INVALID` index requiring its own recovery path.

⛔ **This design does not choose.** The protected-database size census decides
whether B's machinery is warranted, and that census has not been run.

## 12. Protected preflight — owed, and unread

Before S1 is authorized, read on the protected database:

```
1  SELECT count(*) FROM ask_threads;
2  SELECT count(*) FROM ask_turns;
3  SELECT count(*) FROM ask_threads
    WHERE anchor IS NOT NULL AND proposal_chain_id IS NOT NULL;   ← must be 0
4  SELECT count(*) FROM ask_threads
    WHERE proposal_chain_id IS NOT NULL AND reading_identity IS NOT NULL;
5  SELECT count(*) FROM ask_threads WHERE proposal_chain_id IS NOT NULL;
```

⛔ **Every one of these is UNREAD.** (3) is the XOR question and (5) is the
rollback question — a non-zero (5) means rollback is already a decision about a
member's record, not a schema operation (§4). (1) and (2) decide §11.

⚠️ And they must be read on the **protected** database. The probe in §3b read
a witness database and found a violating row **there**; that says nothing about
production either way, and must not be reported as if it did.

## 13. The W5-3 witness fixture — successor treatment, not laundering

When W4 schema lands in the witness database, the W5-3 schema witness's
chain-bound fixture becomes `anchor = NULL, proposal_chain_id = C`, **and the
inverse obligation is added in the same act**:

```
anchor IS NOT NULL AND proposal_chain_id IS NOT NULL   → REFUSED
```

⭐ That is a **successor-schema adaptation**, not retroactive evidence
laundering: git preserves the original W5-3 witness at `303212ae7`, and the new
obligation is strictly stronger than the one it replaces. ⛔ **Do not repair it
before the migration exists** — a witness edited in advance of the schema it
describes is a witness describing a schema nobody has.

## 14. Left open by founder ruling

`initiated_by = 'maia'` on an editorial thread stays **undecided and
unconstrained**. W4 v1 begins discourse with a member act, and the column's
broader existing vocabulary causes no false relationship by merely remaining
available. ⭐ It is decided at the route act, ⛔ not narrowed prematurely in
schema.

## 15. Standing after the phasing seal

```
W4-2 semantic schema design       ✅ PASS · f210df118
W4-2.1 migration phasing          ✅ SEALED — two files, lock strategy OPEN

protected preflight (§12)         ⛔ OWED — every query unread
unique-target lock ruling (§11)   ⛔ OPEN — decided by the size census
executable W4 migration           ⛔ HELD
producer registration             ⛔ HELD
canonical service seam            ⛔ HELD
route / Canvas                    ⛔

canonical landing                 ⛔
protected migration               ⛔
production                        UNTOUCHED
maia_focus_witness                FROZEN
```

---

# W4-2.2 — PROTECTED SCHEMA PREFLIGHT

**Authorized by** founder act, 2026-09-14. ⛔ **READ ONLY.**
**Instrument** `scripts/witness/w4-2-2-protected-preflight.sql`

---

## 16. ⛔ RESULT: **NOT RUN.** This session cannot reach the protected database.

That is the result, stated first, because it is the only honest thing this act
can report about production.

```
ssh                     absent — no ssh binary exists in this container
DATABASE_URL / PG*      unset
.env files present      .env.android.template · .env.docker.template · .env.example
                        (templates only; no DSN)
soullab.life:443        reachable — and it is the PUBLIC HTTPS SURFACE,
                        which serves no SQL
```

⛔ **And it will not be reached by another route.** Driving the preflight through
an application endpoint would be a runtime act against production wearing a
read's name, and no act authorizes it. `NOT RUN` is a first-class result — the
same standing as `NOT WITNESSED` in the S3 lane, and for the same reason: *a
preflight that did not run has measured nothing, and a number produced any other
way is not that number.*

⛔ **Every cell of the decision table below is therefore UNKNOWN**, not zero, not
"probably fine". The founder runs the instrument; this act delivers the
instrument and its falsification.

## 17. The decision table, unfilled

```
W5-3 protected substrate         UNKNOWN
ledger: 20260914000005           UNKNOWN
XOR violations                   UNKNOWN
editorial+reading collisions     UNKNOWN
existing editorial threads       UNKNOWN

ask_threads     size / est rows  UNKNOWN
ask_turns       size / est rows  UNKNOWN
directions      size / est rows  UNKNOWN
versions        size / est rows  UNKNOWN
required UNIQUE already present  UNKNOWN
INVALID indexes present          UNKNOWN

unique strategy
  A ordinary build               NOT EARNED
  B concurrent lane              NOT DETERMINED
```

## 18. The instrument, and why it is shaped this way

**Read-only is structural, not promised.** The whole run is inside
`BEGIN READ ONLY`, so a write added later by anyone is refused by the server.
Proved on the disposable database:

```
BEGIN READ ONLY; INSERT …   → ERROR: cannot execute INSERT in a read-only transaction
BEGIN READ ONLY; ALTER …    → ERROR: cannot execute ALTER TABLE in a read-only transaction
```

**Identity and ledger first, invariants only where the substrate exists.**
`20260914000005` is custody-held and may be genuinely unexecuted on the
protected database. A query against `proposal_chain_id` would then error — or,
under a careless reader, be reported as *"0 violations"*.

> ⛔ **An absent schema is `NOT MEASURABLE`. It is never zero.**

**The ledger is a claim; the catalogue is the fact.** §2 and §3 are read
separately and their disagreement is itself reported — the 2026-09-07 drift is
exactly a case where they diverged.

**Sizing and integrity use different instruments,** per the founder's
correction: `pg_total_relation_size` + `reltuples` + `last_analyze` decide the
lock strategy; exact `COUNT(*)` answers only the integrity questions. And
`reltuples = -1` is reported as **`NEVER ANALYZED`** rather than as an estimate:
unknown is not empty.

**Drift is checked, not assumed.** §6 lists every unique index on the four
targets, plus any `INVALID` index — the residue a failed `CONCURRENTLY` leaves.

## 19. Falsification — both branches, on real databases

| branch | database | result |
|---|---|---|
| substrate **PRESENT** | `w5_witness` (migrations through `…005`) | §4 measured: `xor 0 · collisions 0 · editorial 0 · total 0` |

⚠️⚠️ **AND ONE CELL OF THAT TABLE WAS MEANINGLESS — see W4-2.2a §23.** The
`anchor IS NOT NULL | true` line reported above was produced by a **reversed
expression** against a database my own lock probe had **left mutated**. Two
errors cancelled into a plausible-looking right answer. The row is kept and
corrected there rather than edited here.
| substrate **ABSENT** | `runtime_witness` (stops at `…004`) | §4 reported **NOT MEASURABLE** on all three, and still reported the measurable total |

⭐ The absent branch is the one that mattered, and it behaves correctly: it does
**not** print zeros.

### Two defects the falsification found in the instrument itself

1. ⚠️ **It died on an absent ledger.** `schema_migrations` does not exist on the
   disposable databases (they are built by applying files directly), and
   `ON_ERROR_STOP on` killed the run at §2 — *an instrument that dies on an
   absent thing has reported nothing about the database it was pointed at.*
   Gated, for the same reason §4 is gated.
2. ⚠️ **`n/a` for an absent column read like an error.** The step-2 stub
   `ask_threads` has no `anchor` column at all, and the instrument printed
   `n/a`. Now `COLUMN ABSENT` — the distinction between *nullable*, *not null*
   and *not there* has to survive into the output, or the reader supplies the
   missing one themselves.

### ⭐ And one W4-2 finding confirmed on a real database

§6 on `w5_witness` shows `proposal_chain_directions` carrying **only**
`proposal_chain_directions_pkey (id)` — no `(proposal_chain_id, id)` unique of
any kind, while `proposal_versions` carries `proposal_versions_chain_id_id_key`.
The B4 gap named in §2.2 is not a reading of the source; it is observable in a
built database.

## 20. How to run it

⚠️ **AN EARLIER USAGE LINE HERE WAS WRONG AND SENT THE RUN AT THE WRONG
MACHINE.** It read `psql "$PROTECTED_DATABASE_URL" -X -f …`, naming a variable
that **exists nowhere in this project**; unset, psql fell back to its defaults —
local socket, database `$USER` — and reported `database "soullab" does not
exist`. ⛔ Nothing was read, and that output is **not a preflight result of any
kind**. *A usage line naming an undefined variable is a usage line that points at
the wrong machine.*

⭐ The protected database is `maia-postgres`, in Docker, **on minisforum**, and
the Mac Studio has no socket or TCP route to it. Run from the Mac Studio:

```bash
git fetch origin claude/w4-2-schema-design
git show origin/claude/w4-2-schema-design:scripts/witness/w4-2-2-protected-preflight.sql \
  > /tmp/w4-preflight.sql
ssh soullab@minisforum \
  'docker exec -i maia-postgres psql -U soullab -d maia_consciousness -X' \
  < /tmp/w4-preflight.sql
```

⭐ Fetching the file from the branch means it works from any worktree — the
script lives only on `claude/w4-2-schema-design`, and the shell that produced the
error was in an unrelated one.

⭐ **Read §1 first.** It prints the database, host, port, role and read-only
state actually connected to. ⛔ If §1 does not name the protected database,
nothing below it is a protected reading, whatever it says. Verified: the
instrument runs identically when piped on stdin rather than read with `-f`.

⛔ Nothing in it writes, repairs, or creates. If it finds a violating row it
**reports** it — *a preflight that fixed what it found would destroy the evidence
it exists to gather.*

## 21. What a clean preflight would earn — and what it would not

```
protected read              ✅ this act
unique-lock strategy ruling ✅ earned by the result
right to DESIGN W4-S1/S2    ✅ earned by the result

migration implementation    ⛔
migration execution         ⛔
canonical merge             ⛔
deployment                  ⛔
data repair                 ⛔
```

⛔ The W5-3 witness fixture stays untouched until the successor migration
actually exists.

## 22. Standing

```
W4-2   semantic schema design    ✅ CLOSED · f210df118
W4-2.1 migration phasing         ✅ CLOSED · 46a44928e
W4-2.2 preflight INSTRUMENT      ✅ built · falsified on both branches
W4-2.2 preflight RESULT          ⛔ NOT RUN — this session cannot reach production

unique-target strategy           ⏸ undecided — waits on the result
executable W4 migrations         ⛔ HELD
producer registration            ⛔ HELD
canonical service seam           ⛔ HELD
route / Canvas                   ⛔

production mutation              ⛔
maia_focus_witness               FROZEN
```

---

# W4-2.2a — PREFLIGHT INSTRUMENT SEAL

**Authorized by** founder act, 2026-09-14, on source inspection of `21ebfc9ce`.
Same branch. Instrument + record only. ⛔ Still no protected read from this
session, still no migration.

**Harness** `scripts/witness/w4-2-2a-instrument-seal.sh` — **26 passed · 0 failed**

> **The governing rule.** An instrument for discovering drift must itself survive
> drift without converting *"I cannot measure this state"* into either zero or
> failure.

---

## 23. ⚠️⚠️ The first defect invalidated a cell of my own falsification

`anchor` nullability was reported **backwards**. The expression was
`(NOT (is_nullable = 'NO'))`, so a genuinely `NOT NULL` column printed **`false`**
under a label reading *"anchor IS NOT NULL"*. Measured on a purpose-built table:

```
a  (NOT NULL)  → reported  false
b  (nullable)  → reported  true
```

⛔ **It reversed the exact column W4-S1 exists to change.**

⭐⭐ **And the reason it slipped past me is the finding.** My W4-2.2 record
reported `ask_threads.anchor IS NOT NULL | true` and presented it as the
instrument working. The `w5_witness` database at that moment actually had
`anchor` **nullable** — `is_nullable = YES` — because the §11 lock probe ran
`ALTER TABLE … DROP NOT NULL` through `psql -c`, **under autocommit**, while I
described the whole exercise as *"rolled back"*.

```
a reversed expression   ×   a database I had silently mutated
                        =   a plausible-looking correct answer
```

Two wrongs cancelled. ⛔ That is precisely the class this lane exists to refuse,
and it happened inside the instrument built to refuse it. Both halves are
corrected **in place** in §3b and §19 rather than edited away.

⚠️ **The operational lesson is narrower than "be careful":** a probe that mixes
transactional statements with `psql -c` autocommit statements has **two
different durabilities in one exercise**, and describing the exercise by its
safer half is how a mutated database gets read as a clean one.

## 24. Ledger: three states, because "present" was not enough

The gate proved only that `schema_migrations` **exists**, then immediately read
`s.filename`. But `run-sql-migrations.sh` carries migration logic for a **legacy
ledger with `version` and no `filename`** — so the table can exist while the
column does not, and the instrument dies one level deeper than the hole it had
just patched.

```
LEDGER ABSENT                       → reported ABSENT
LEDGER PRESENT · filename present   → exact rows, applied / ABSENT FROM LEDGER
LEDGER PRESENT · legacy, no filename → reported LEGACY · NOT MEASURABLE
```

⭐ *A ledger in a vocabulary this query cannot read is not an empty ledger.*

## 25. Substrate: PRESENT · PARTIAL · ABSENT

`w5_present` meant only *`proposal_chain_id` exists*, while the gated query
required `ask_threads`, `anchor`, `proposal_chain_id` **and** `reading_identity`.
⛔ Inferring the rest of a migration from one column is exactly the inference a
**drift detector** may not make — 2026-09-07 was a partially applied lane.

Now classified over six objects/columns, with `PARTIAL` first-class: it reports
**NOT MEASURABLE**, never an SQL error and never a zero. `ask_threads` being
absent entirely no longer kills the count either.

⭐ **`PARTIAL` had to be constructed, because no migration produces it** — which
is the whole argument for building the state rather than waiting to meet it.

## 26. Acceptance — every state the ruling named

```
ledger absent                      → ABSENT                    ✅
legacy ledger, no filename         → LEGACY / NOT MEASURABLE   ✅
modern ledger                      → exact rows                ✅

anchor NOT NULL                    → true                      ✅
anchor nullable                    → false                     ✅
anchor absent                      → COLUMN ABSENT             ✅

W5 absent                          → NOT MEASURABLE            ✅
W5 partial                         → NOT MEASURABLE            ✅
W5 complete                        → exact counts              ✅
ask_threads absent                 → NOT MEASURABLE            ✅

READ ONLY + INSERT                 → server refuses            ✅
READ ONLY + DDL                    → server refuses            ✅
```

Every case also asserts **the run COMPLETED** — reaching its final section —
because a died-early instrument reports nothing about the database it was
pointed at, and that was the shape of both earlier repairs.

## 27. Two more instrument defects, found by the harness itself

1. ⚠️ **The harness hung.** A stray `psql` with neither `-c` nor `-f` reads
   **stdin** and blocks forever; it ran to a 120-second timeout on the first
   attempt. One invocation, one `-c`.
2. ⚠️ **A C21-class ban, for the third time this session.** `W1`/`W2` banned the
   string `xor_violations` — which appears in the `⛔` **echo line that declares
   the count is not measurable**. A prohibition firing on the text that documents
   it. Re-asserted as the psql **result-table header**
   (`xor_violations | editorial_reading_collisions`), which can only appear when
   the query actually ran. ⭐ *"No measured value" is the obligation; "the word
   does not appear" never was.*

⚠️ And a self-inflicted one worth recording: `pkill -9 -f "[p]sql"` matched **its
own command line** and killed the shell running it. `pkill -x psql` is the
correct instrument.

## 28. Standing

```
W4-2   semantic schema design    ✅ CLOSED · f210df118
W4-2.1 migration phasing         ✅ CLOSED · 46a44928e
W4-2.2 preflight RESULT          ⛔ NOT RUN — unchanged
W4-2.2a instrument seal          ✅ 26 passed · 0 failed

unique-lock strategy             ⏸ waits on the protected output
executable W4 migrations         ⛔ HELD
producer registration            ⛔ HELD
canonical service seam           ⛔ HELD
route / Canvas                   ⛔

production mutation              ⛔
maia_focus_witness               FROZEN
```

The protected preflight remains **unspent**:

```bash
psql "$PROTECTED_DATABASE_URL" -X \
  -f scripts/witness/w4-2-2-protected-preflight.sql
```

---

# W4-2.2 — PROTECTED PREFLIGHT · **RESULT**

**Run** 2026-09-15, founder, from the Mac Studio via
`ssh soullab@minisforum 'docker exec -i maia-postgres psql …'`
**Instrument at** `646b9508b`

```
db                  maia_consciousness
role                soullab
read_only           on
server              PostgreSQL 16.13 (Debian)
```

⭐ §1 names the protected database. **This is a protected reading**, and it
supersedes the `NOT RUN` standing recorded in §16.

---

## 29. ⭐⭐ THE FINDING: the entire succession lane is ABSENT from production

The preflight was asked *"is W5-3 present?"* and answered a larger question.

| migration | ledger | catalogue |
|---|---|---|
| `20260901000001_ask_threads.sql` | **applied** | `ask_threads` ✅ `ask_turns` ✅ |
| `20260914000001_proposal_succession.sql` | **ABSENT** | `proposal_chains` ❌ `proposal_versions` ❌ |
| `20260914000005_editorial_ontology.sql` | **ABSENT** | `proposal_chain_directions` ❌ `proposal_chain_insights` ❌ `ask_threads.proposal_chain_id` ❌ |

⭐ **Ledger and catalogue AGREE on every row.** After 2026-09-07 that is not
assumed, and it is worth stating plainly: there is **no drift** here. The record
and the database tell the same story.

⭐⭐ **The consequence relocates the whole W4 schema landing.** W4-S1/S2 declare
foreign keys into `proposal_chains`, `proposal_versions` and
`proposal_chain_directions` — **none of which exist on production.** The W4
migration is not one act away from the protected database; it is behind an
entire unlanded lane:

```
20260914000001  proposal_succession        ⛔ NOT APPLIED
20260914000002  revision_offers            ⚠️ NOT QUERIED
20260914000003  chains_member_identity     ⚠️ NOT QUERIED
20260914000004  revision_authorizations    ⚠️ NOT QUERIED
20260914000005  editorial_ontology         ⛔ NOT APPLIED
─────────────────────────────────────────────────────────
W4-S1 / W4-S2                              ⛔ depends on all of the above
```

⚠️ **`…000002`, `…000003` and `…000004` are NOT MEASURED.** My instrument named
only three filenames, and the catalogue checks it performs do not cover
`manuscript_revision_offers` or `manuscript_revision_authorizations`. Their
absence is *plausible* — they build on `proposal_chains`, which is absent — ⛔
but plausible is not measured, and this record does not report them as absent.
**That is an instrument gap**, and it is named rather than filled by inference.

## 30. The decision table, filled

```
W5-3 protected substrate         ABSENT  (ledger and catalogue agree)
ledger: 20260914000005           ABSENT FROM LEDGER
XOR violations                   NOT MEASURABLE   ⛔ never "0"
editorial+reading collisions     NOT MEASURABLE
existing editorial threads       NOT MEASURABLE

ask_threads     heap 8192 bytes · total 72 kB · NEVER ANALYZED
ask_turns       heap 24 kB      · total 72 kB · NEVER ANALYZED
directions      does not exist
versions        does not exist

total_threads                    1        ⭐ not zero — see §31
required UNIQUE already present  NO — only the two primary keys
INVALID indexes present          NONE
```

## 31. ⭐ One real Ask thread exists in production

`total_threads = 1`, and `ask_turns` carries 24 kB of heap. ⛔ Small is not
empty: somebody has held an Ask conversation on the protected database, and the
migration plan is operating on a table with a real member record in it.

⭐ It also means the **rollback property (§4) is currently clean** — but for a
structural reason rather than a measured one: `proposal_chain_id` does not
exist, so there are **no editorial threads to strand**, and
`ALTER COLUMN anchor SET NOT NULL` would succeed today. ⛔ That is a fact about
today, and it stops being true the moment the first editorial conversation is
held.

## 32. RULING EARNED: the unique-lock strategy — **Option A**

```
A · ordinary unique build        ✅ EARNED
B · concurrent lane              ⛔ NOT REQUIRED
```

The two live targets are **8 kB and 24 kB of heap**; the other two do not exist
yet and will be created empty. An `ACCESS EXCLUSIVE` index build over 72 kB of
total relation is a blip, and **Option B's machinery is not warranted** — no
`CONCURRENTLY` precedent in this repository, structural incompatibility with
`run-sql-migrations.sh`, and an `INVALID`-index recovery path to own, all to
avoid a lock measured in milliseconds.

⭐ `pg_total_relation_size` decided this, as designed — and it decided it
**despite** `reltuples` being `NEVER ANALYZED` on both tables. That is exactly
why sizing and integrity were separated: a `COUNT(*)`-only instrument would have
reported `1` and told us nothing about index-build cost.

⚠️ **This ruling is dated.** It rests on sizes read on 2026-09-15. If the
succession lane lands and data accumulates before W4-S1/S2 are authorized,
**re-run the preflight** — the ruling is earned by a measurement, not by the
shape of the tables.

## 33. What this result does and does not authorize

```
protected read                   ✅ SPENT — this
unique-lock strategy ruling      ✅ EARNED — Option A
right to DESIGN W4-S1/S2         ✅ EARNED

migration implementation         ⛔ HELD
migration execution              ⛔ HELD
canonical merge                  ⛔
deployment                       ⛔
data repair                      ⛔
```

⛔ **And a new prerequisite is now visible**: the succession lane
(`20260914000001` … `20260914000005`) is itself unlanded and custody-held. W4's
schema cannot reach production before it does, and **that sequencing is a founder
act this preflight does not touch.**

## 34. Standing

```
W4-2   semantic schema design    ✅ CLOSED · f210df118
W4-2.1 migration phasing         ✅ CLOSED · 46a44928e
W4-2.2a instrument seal          ✅ CLOSED · 26/0
W4-2.2 protected RESULT          ✅ RUN 2026-09-15 · W5 substrate ABSENT

unique-lock strategy             ✅ Option A earned (dated)
…000002/3/4 ledger state         ⚠️ NOT MEASURED — instrument gap, named
executable W4 migrations         ⛔ HELD
succession lane landing          ⛔ HELD — and now a visible prerequisite

production mutation              ⛔ NONE — the run was READ ONLY
maia_focus_witness               FROZEN
```

---

# W5-LANDING-01 — PROTECTED SUCCESSION-LANE CENSUS · INSTRUMENT

**Authorized by** founder act, 2026-09-15. ⛔ **READ ONLY.**
**Instrument** `scripts/witness/w5-landing-01-lane-census.sql`
**Seal** `scripts/witness/w5-landing-01-census-seal.sh` — **26 passed · 0 failed**
**Protected result** ⛔ **NOT RUN** — this session still cannot reach production.

> **The prohibition that shapes it.** `…000001 absent, therefore …000002–000004
> absent` is forbidden, even though the dependency graph makes it likely. Each
> migration is measured **on its own**, twice — ledger and catalogue — and the
> two answers are reported side by side rather than reconciled.

---

## 35. What it measures

All five migrations by exact filename, against **28 named objects** —
tables, indexes, constraints, a column, functions and triggers — each checked
individually:

```
000001  proposal_chains · proposal_versions · one_successor · one_root
        chain_id_id_key · predecessor_same_chain · 2 functions · 2 triggers
000002  manuscript_revision_offers · 2 functions · 2 triggers
000003  proposal_chains_member_id_id_key
000004  manuscript_revision_authorizations · uq_mra_one_unspent_permission
        · function · trigger
000005  member_work_id_key · ask_threads.proposal_chain_id · chain fkey
        · insights · directions · function · 2 triggers
```

Rolled up per migration as **PRESENT · PARTIAL · ABSENT**, then crossed with the
ledger into the derived state:

```
ledger applied  + catalogue PRESENT  → LANDED
ledger absent   + catalogue ABSENT   → PENDING          ⭐ the pending set
ledger applied  + catalogue ABSENT   → DRIFT (ledger claims it, database lacks it)
ledger absent   + catalogue PRESENT  → DRIFT (present but unledgered — 2026-09-07)
catalogue PARTIAL                    → PARTIAL, ruling owed   ⛔ never pending
```

## 36. Three defects the build found — two of them in my own design

1. ⚠️⚠️ **The read-only membrane refused my own instrument.** The object list
   was held in a `CREATE TEMP VIEW`, and the run died with
   `ERROR: cannot execute CREATE VIEW in a read-only transaction`. ⭐ The very
   property that makes this safe caught its author. The list now lives in an
   inline CTE — **twice**, because a read-only transaction admits no temp object
   and a psql variable cannot carry a quoted SQL literal list safely. ⛔ The
   duplication is **guarded, not trusted**: the seal asserts the two copies are
   byte-identical (28 objects), because copies that drifted would make the
   detail and the rollup describe **different databases**.

2. ⚠️⚠️ **A SQL-level gate is not a gate.** The ledger join was written as
   `CASE WHEN <ledger readable> THEN (SELECT … FROM schema_migrations) …`, and
   PostgreSQL **resolves the relation at parse time** — so on a database without
   the ledger the statement died before the CASE was ever evaluated. The join
   now sits behind a psql `\if`, which decides whether the statement is **sent
   at all**. ⭐ The distinction matters beyond this file: *a conditional that
   still names the missing object has not avoided it.*

3. ⚠️ A placeholder collision while assembling the file replaced the word
   `PRESENT` inside its own `'PRESENT'` string literals. Caught immediately by a
   syntax error; rebuilt with non-colliding tokens. Recorded because it is the
   same family as the C21 bans: **a textual substitution that cannot tell code
   from the text describing it.**

## 37. And two obligation defects in the seal itself

- ⚠️ **A whole-output ban where a per-row assertion was meant** — banning
  `PENDING` across the run fails whenever *another* migration is legitimately
  pending. In a run where `000001` is PARTIAL, `000002–000005` are correctly
  PENDING. Re-asserted **row-scoped**. *(The fourth time this session that a
  ban has been written wider than the property it defends.)*
- ⚠️ **An obligation that demanded a row which correctly does not exist.** The
  PARTIAL case had no ledger, so §5 prints nothing and the last matching line is
  §4's rollup. The derived state is now asserted in the case that *has* a
  ledger.

## 38. Falsification — 26 obligations, on constructed drift

| case | built | asserted |
|---|---|---|
| nothing applied | bare database | every migration ABSENT, nothing PRESENT |
| **PARTIAL** | `proposal_chains` + `proposal_versions` tables, no triggers/indexes | PARTIAL, and that row **never** PENDING |
| **DRIFT ↓** | ledger says all five applied, database empty | *ledger claims it, database lacks it* — never LANDED |
| **DRIFT ↑ / PARTIAL** | objects present, ledger silent | PARTIAL row keeps its own state; a genuinely absent+unledgered migration IS pending |
| **PENDING** | empty modern ledger, empty database | PENDING — the state we are here to measure |
| legacy ledger | `version`, no `filename` | LEGACY · **no pending set derived** |
| absent ledger | no `schema_migrations` | NOT MEASURABLE · no pending set |
| read-only | — | server refuses DDL; census declares its own state |

⭐ **PARTIAL had to be constructed** — no migration produces it, which is exactly
why waiting to meet it in production is not a plan.

## 39. How to run it

```bash
git fetch origin claude/w4-2-schema-design
git show origin/claude/w4-2-schema-design:scripts/witness/w5-landing-01-lane-census.sql \
  > /tmp/w5-lane-census.sql
ssh soullab@minisforum \
  'docker exec -i maia-postgres psql -U soullab -d maia_consciousness -X' \
  < /tmp/w5-lane-census.sql
```

⭐ **§1 first.** If it does not name the protected database, nothing below it is
a protected reading.

## 40. Standing

```
W4-2.2 protected preflight       ✅ RUN · 87c6dd1bb
unique-lock strategy             ✅ Option A · dated

W5-LANDING-01 instrument         ✅ sealed · 26/0
W5-LANDING-01 protected RESULT   ⛔ NOT RUN
exact pending predecessor set    ⏸ unknown until it runs

W5-LANDING-02 landing package    ⛔ not authorized
succession/W5 production landing ⛔ HELD
W4 executable migration landing  ⛔ HELD
producer registration            ⛔
canonical service seam           ⛔
route / Canvas                   ⛔

production mutation              ⛔ NONE
maia_focus_witness               FROZEN
```
