# W4-SCHEMA-IMPLEMENTATION

**Date** 2026-09-15 · **Branch** `claude/w4-schema-implementation` · **Base** canonical
`348b9e54d` · **Authorized** founder, 2026-09-15.

```
w4-schema-witness       40 passed · 0 failed   BEHAVIOURAL, real database
w5-3-schema-witness     38 passed · 0 failed   (36 + the two inverse obligations)
mutants                 4 · 4 kills, each by its named obligation
```

⛔ **NO RUNTIME. NO PRODUCERS. NO ROUTES. NO CANVAS. NO ADOPTION.** Schema and
witnesses only. ⛔ No protected execution, no merge, production untouched.

---

## 1 · What landed

### S1 · `20260915000001_ask_threads_subject_preparation.sql`

`anchor` → nullable · `ask_threads_one_subject` **NOT VALID** ·
`ask_threads_editorial_has_no_reading` **NOT VALID**.

### S2 · `20260915000002_editorial_turn_bindings.sql`

`VALIDATE` both · the four supporting UNIQUE targets (**Option A**) ·
`editorial_turn_bindings` + two partial unique indexes + the immutability trigger.

⭐ **Two files, not two transactions in one file.** PostgreSQL holds a table lock
until the **transaction** that took it ends, so `ADD … NOT VALID` and `VALIDATE`
in one file buy nothing — the ACCESS EXCLUSIVE is still held while the scan runs.
Split across two *files*, the runner commits between them, and S2's scan takes
only `SHARE UPDATE EXCLUSIVE`. This is the founder's own correction to the design
(§8), and it is why the safe intermediate state exists:

```
S2 refuses → anchor nullable · both CHECKs enforced ON NEW ROWS ·
             the violating row still visible and findable ·
             S1 LEDGERED · S2 not ledgered and retryable
```

⛔ Nothing destroyed, nothing un-ledgered. **One file cannot produce that state:
one file is one ledger row.**

⛔ **Option A earned, not assumed** — the 2026-09-14 protected preflight read
`ask_threads` 8 kB / `ask_turns` 24 kB / 1 thread. Option B (`CREATE UNIQUE INDEX
CONCURRENTLY`) remains structurally incompatible with `run-sql-migrations.sh`,
which force-wraps every file in `BEGIN`/`COMMIT`.

---

## 2 · ⚠️⚠️ A PRIOR, UNAUTHORIZED W4 IMPLEMENTATION EXISTS — AND IT IS ONE FILE

Found while locating the W5-3 witness, **not** reported by anything:

```
branch   origin/chore/w4-2-migration-20260915   (tip 5bd2c0426, 2026-09-15 00:16Z)
         f7543db3f  feat(w4-2): thread subject XOR and the turn ↔ act binding
         ca355b983  test(w5-3): repair the schema witness under the W4-2 XOR
         5bd2c0426  test(w4-2): schema witness, and the rollback ordering law
file     database/migrations/20260915000001_editorial_turn_bindings.sql  (251 lines)
⛔ NOT on canonical · 314 commits ahead of it · 13 migrations, not two
```

**Its structure is `BEGIN … COMMIT;` then a second `BEGIN … VALIDATE … COMMIT;`
inside ONE FILE.** Two consequences, and the second is the serious one:

1. ⛔ `run-sql-migrations.sh` force-wraps every file in `BEGIN`/`COMMIT`, so that
   file's inner `COMMIT` **commits the runner's transaction**, and its second
   `BEGIN` opens one the runner never closes properly. The design named this
   exactly — *"a file that deliberately commits a transaction it did not open"* —
   and called it **a custody decision, not an implementation detail**, and did
   not take it.
2. ⭐⭐ **It cannot produce the phased safe state at all.** One file is one ledger
   row: if `VALIDATE` refuses, the first transaction has already committed the
   schema changes while the ledger records **nothing**. That is precisely the
   half-applied file §10 splits to avoid.

⭐ I did not build on it, and I did not delete or rewrite it. Its anchor = NULL
fixture work **is** reused below, with its commit named. ⛔ **Which implementation
stands is the founder's ruling, not mine** — I report the divergence and note
that today's authorization is explicitly two-phase.

⚠️ **And a filename hazard**: its `20260915000001_editorial_turn_bindings.sql`
shares a prefix with this act's `20260915000001_ask_threads_subject_preparation.sql`
while differing in name and content. If both ever reached canonical both would
run, and the second would fail on constraints the first created. ⛔ Not resolved
here.

---

## 3 · The witness — `40 passed · 0 failed`

Real inserts against a real database built by the repository's **own** bootstrap
and migration runner. ⭐ Every refusal is checked **by the constraint's own
name** — never by "it errored".

**Subject (S1)** — anchor nullable · anchored thread admitted · editorial thread
admitted · ⛔ **both** subjects refused · ⛔ **neither** refused · an editorial
thread carrying `reading_identity` refused · and both constraints asserted
`convalidated`, not merely present.

**The four UNIQUE targets** — each asserted `contype = 'u'`, and ⛔ the existing
`proposal_versions_chain_id_id_key` asserted still present, because succession
targets it.

**B1–B9, each as a refusal:** a turn that isn't in the thread (`etb_turn`) · an
**anchored** thread (`etb_thread_is_editorial`) · a foreign chain (same) · a
Direction from another chain (`etb_direction`) · a Version from another chain
(`etb_version`) · both adjuncts, neither adjunct (`etb_one_adjunct`) · a second
adjunct for a bound turn (`editorial_turn_bindings_pkey`) · one Direction claimed
twice · one Version claimed twice · ⭐⭐ **B9 in all three shapes** — a member
Direction on a MAIA turn, a MAIA Version on an author turn, and *lying in one
column only*, which the FK catches before the CHECK is reached.

**Lifecycle** — a binding cannot be revised, ⭐ **but can be deleted**, and the
turn can be re-bound afterwards · withdrawing the conversation removes its turns
and bindings · ⭐⭐ **and the authored acts remain.**

**Rollback** — with one editorial thread present, `ALTER COLUMN anchor SET NOT
NULL` **refuses**. That is the design's most important rollback property:
*rollback is clean while the refinement is applied and not yet used; once a
writer has held one editorial conversation, rolling back is no longer a schema
operation — it is a decision about their record.*

### ⭐⭐ A finding the witness produced, recorded rather than smoothed

`W8` first asserted that `etb_direction`'s `ON DELETE RESTRICT` would refuse
deleting a bound Direction. **It never gets the chance.**
`authored_editorial_record_immutable` refuses the DELETE earlier and by something
stronger — an authored editorial record cannot be deleted by anything, ever. ⛔
The FK's RESTRICT is belt-and-braces and **unreachable in practice**, and
asserting it would have claimed a protection that never fires. The obligation now
asserts the stronger refusal, with a second obligation proving the RESTRICT is
still *configured* (`confdeltype = 'r'`).

⭐ Same class as W5-3's `S6c` (*a chain cannot be deleted at all — append-only
fires before the FK*). The design's §2.5 calls RESTRICT "the belt"; **the belt is
real, and the trousers are welded on.**

---

## 4 · The W5-3 fixture adaptation, and its inverse

The anchor = NULL adaptation was **already authored** at `ca355b983` on that
unmerged branch. ⭐ It is **reused with its provenance named**, not rewritten and
not absorbed.

⭐⭐ **The inverse obligation is the half that was missing, and it is the
dangerous half.** `S3` and `S4` prove the wrong-Work and wrong-member
substitutions are refused **by the FK** — and they only prove that while their
rows carry no anchor. Had the fixture kept its anchors, those rows would now be
refused by `ask_threads_one_subject` instead: **the obligations would still read
PASS while proving something weaker and different.** *A witness that passes for a
new reason has stopped testing what it names.*

Added: `S8` (anchor **and** chain together → `ask_threads_one_subject`) and `S8b`
(neither → same). Verified in the run: `S3`/`S4` still refuse on
`ask_threads_proposal_chain_fkey`. **`38 passed · 0 failed`.**

### ⛔ Two disclosed W5 defects carried, NOT repaired

Both are held under `b67eb15e5`'s separate authorization, and repairing either
inside an unrelated schema act is how findings disappear.

- **`S6` is vacuous** — its seed names `asked_at`, which does not exist, so it
  passes on zero. ⭐ A marker is added **in place**: disclosure, not a fix, so no
  reader takes that PASS for a functioning assertion. `S6b`/`S6c` are unaffected.
- **The stub custody gap stands.** `w5-rebuild-db.sh` requires
  `/tmp/step2_runtime_stubs.sql`, which is in **no commit**. ⚠️ It happens to
  exist in this container (mtime 2026-09-14), which is *why the run above was
  possible* — ⛔ **that is an accident of this machine and closes nothing.** From
  a fresh clone the witness refuses, and `REFUSED · stubs not found` is a
  first-class result, never a skip. Only the migration-name list was corrected,
  to the two files.

---

## 5 · Falsification — 4 mutants, 4 kills

| | mutation | killed by |
|---|---|---|
| **MW1** | the B9 vocabulary bridge is deleted | `B9a` member Direction on a MAIA turn |
| **MW2** | the binding reuses `authored_editorial_record_immutable` | ⭐⭐ `W7` — the binding can no longer be **deleted**, so withdrawal is unenforceable at the exact seam that carries it |
| **MW3** | the XOR becomes `<= 1` | `W2d` a thread about nothing |
| **MW4** | the constraints are never `VALIDATE`d | `W4` `convalidated` |

⭐ **MW2 is the one that matters**: it is the precise confusion the design warns
against — reusing a function *because the name fits* — and the witness catches it
by the only symptom it has.

---

## 6 · Standing

```
W5 migrations landed             ✅ canonical + production · 348b9e54d
W4 S1 + S2 authored              ✅ two files, per the phasing seal
w4-schema-witness                ✅ 40 passed · 0 failed · 4 mutants, 4 kills
w5-3 fixture adapted + inverse   ✅ 38 passed · 0 failed

⚠️ prior one-file W4 implementation on chore/w4-2-migration-20260915
                                 ⛔ UNAUTHORIZED · founder ruling owed
⚠️ 20260915000001 filename hazard between the two implementations
⛔ S6 vacuity · stub custody gap  held under b67eb15e5
⏸ b67eb15e5 to canonical          owed by or with W4 schema landing, cherry-pick only
⚠️ 20260903000001                  parked in its own lane

protected execution              ⛔ NOT AUTHORIZED
canonical merge                  ⛔ NOT AUTHORIZED
runtime · producers · routes ·
Canvas · adoption                ⛔ NOT TOUCHED
```

> ***A thread has exactly one subject; a turn carries at most one authored act;
> and withdrawing a conversation can never erase what was authored in it. All
> three are constraints, and none is an application check.***
