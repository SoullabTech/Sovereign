# W5-LANDING-02 · GATE B — THE NARROW CARRIER, PROVEN ON A DISPOSABLE DATABASE

**Date** 2026-09-15 · **Branch** `claude/w5-landing-carrier` · **Base**
`1a5554300e855d3581085849301a39cbb10ab385` (tip of `origin/clean-main-no-secrets`)
**Authorized** founder, 2026-09-15.

⛔ **NO PRODUCTION EXECUTION. NO CANONICAL MERGE. NO DEPLOY. PRODUCTION UNTOUCHED.**
Every database this act touched was disposable, named `*witness*`, on a local
cluster reachable only over a unix socket.

---

## 1 · What Gate B is for

Gate A established **what the runner would attempt**. Gate B establishes **what
happens when it does** — on a real database, from the real base schema, through
the repository's own bootstrap and migration runner, not a reimplementation.

**Result: `88 passed · 0 failed`.** Cluster PostgreSQL 16.13, `server_encoding
UTF8` — the same major version as production, and UTF-8 because a byte-counting
cluster has already cost this programme one witness (WS2-07A).

---

## 2 · The carrier

Built from the pinned base, with the five **materialized out of the object store
by hash** — `git cat-file blob <pin>` then re-hashed to prove the roundtrip.
⛔ Not copied from another branch, and the record does not say "copied."

```
base                     1a5554300  ·  480 .sql migrations  ·  none of the five present
carrier                  base + exactly five files
ledger at base state     531 rows  =  504 manifest + 27 post-baseline
of those, ledger-only    51        ⭐ the BASELINE-SUBSUMED class, independently
                                      reproduced here from the repository side
```

⭐ That 51 is the same 51 the founder counted against production. Two
independent derivations, from different directions, agreeing.

---

## 3 · The six obligations, as ruled

| | obligation | evidence |
|---|---|---|
| **B1** | exactly five migration files added, nothing else in that directory | `git diff --name-status`, 5 `A`, 0 other |
| **B2** | all five blob hashes exact | asserted against the founder's pins |
| **B3** | fresh/base schema → the five execute in order | ⭐ **two databases** — see below |
| **B4** | postconditions after each | 48 object-level assertions, positive **and negative** |
| **B5** | census reads `LANDED 5 · DRIFT 0 · PARTIAL 0` | the W5-LANDING-01 census, unmodified, read from its own lane by blob |
| **B6** | ⭐⭐ the existing Ask thread stays an ordinary Ask thread | see §5 |

### ⭐ B3 · why two databases

In the sequential database **I** choose the order, so it cannot prove the
runner's. So the five are also applied **all at once** to a second base-state
database and the runner decides. Then:

- the ledger's `applied_at` order **is** filename order, and
- `pg_dump --schema-only` of the two databases is **byte-identical**.

⛔ If one-at-a-time and all-at-once produced different schemas, the package
would not be a package — and neither database alone could tell you.

### B4 · the negative half

After each migration the witness asserts not only what must now exist but **what
must still be absent**. After `000001`, `manuscript_revision_offers` must not
exist; after `000003`, `ask_threads.proposal_chain_id` must not exist. ⛔ A
migration that quietly did a later one's work would pass a positive-only check.

Structural properties are read as properties, never as names: `uq_mra_one_unspent_permission`
is asserted **`indisunique`**, `proposal_chains_member_id_id_key` is asserted
**`contype = 'u'`**, the composite FK is asserted **`confmatchtype = 's'`** and
**`confdeltype = 'r'`**. *A constraint named unique is not a unique constraint.*

---

## 4 · B5 · the census

Read from `origin/claude/w4-2-schema-design` by blob `092630b64197ca84…`,
**unmodified** — the evidence lane's instrument, not a copy the carrier could
have edited to agree with itself.

```
LANDED 5 · DRIFT 0 · PARTIAL 0 · PENDING 0
```

---

## 5 · ⭐⭐ B6 — the Ask thread

An ordinary Ask thread is opened **before any of the five exists**, on the base
schema. After all five land:

- `proposal_chain_id IS NULL` — ⛔ **no backfill**
- `proposal_chains` empty, and no version, insight or direction — ⛔ **nothing invented**
- every column the thread had **before** is unchanged
- ⭐ a **new** ordinary Ask thread still opens unbound — the FK is `MATCH SIMPLE`,
  so an unbound thread is admitted without consulting `proposal_chains` at all
- ⭐⭐ **a later attempt to BIND the historical thread is REFUSED by the freeze**,
  by name: *"a thread cannot be re-pointed at a reading or a proposal it was not
  about."*

⛔ That last one is why the others are worth anything. *Absence of backfill is
weak evidence; impossibility of backfill is strong.* The witness inserts a real
chain and tries to attach the historical thread to it — and the database refuses.

---

## 6 · Falsification — three mutants, three kills

⛔ The carrier is a **committed** artifact, so each mutant commits, runs, and is
reset. A working-tree mutation would now be refused outright.

| | mutation | outcome |
|---|---|---|
| **M1** | the freeze stops guarding `proposal_chain_id` | ⭐ KILLED — `⛔⛔ THE HISTORICAL THREAD WAS SUCCESSFULLY BACKFILLED` |
| **M2** | `000005` backfills historical threads | ⭐ KILLED — `B6 ⛔ NO BACKFILL` |
| **M3** | the composite FK becomes `MATCH FULL` | ⭐ KILLED, **more strictly than predicted** |

**M3 is the interesting one, and its result is reported as it happened rather
than as predicted.** The predicted obligation (`B4.5 … MATCH SIMPLE`) was
**never evaluated**: under `MATCH FULL` the migration **cannot be applied at
all** against a database containing one ordinary unbound Ask thread, so it died
earlier — at `B3 step 5 … FAILED TO APPLY`, with `B2` red beside it because the
pin caught the edited blob.

⭐⭐ That is a substantive finding, not merely a mutant result. `000005`'s own
prose says `MATCH FULL` *"would make every existing unbound thread
unrepresentable"* — and the database demonstrates it. **It is the B6 fixture
that makes this observable**: against an empty `ask_threads`, `MATCH FULL` would
apply silently and break only later, in production, on real conversations.

---

## 7 · ⛔ A DEFECT A MUTANT FOUND IN THIS WITNESS

M1's first run killed the mutant — and revealed that **B2 verified the committed
blob while the staging loop applied the working tree.** On a clean tree they
agree. With an uncommitted edit, the witness would have **applied mutated SQL
while reporting the pins as exact**.

⛔ **That is Gate A's §0 defect again, one level down**: *what was verified and
what was used must be the same bytes.* Repaired at `81c41e91f` — the five are
staged from `HEAD`'s blobs, and a dirty `database/migrations/` is refused
outright. Recorded here rather than quietly fixed, because the instrument that
found it was a mutant, not a review.

**Four further defects were found by the first full run and repaired**, each of
a kind this programme has seen before:

1. the thread digest hashed `t.*::text`, which **necessarily** changes when a
   column is added — it could never have distinguished *the thread was altered*
   from *the table gained a column*;
2. the backfill probe **guessed** `proposal_chains`' columns; the witness
   correctly reported *failed for the WRONG reason* rather than passing;
3. `pg_dump` emits `\restrict <random token>` meta-commands, so an unstripped
   diff reported a schema difference that did not exist — stripped by the same
   rule, and for the same reason, as `capture-baseline.sh`;
4. `grep -c DRIFT` over the census output matched the census's **own legend** —
   *"DRIFT and it is NOT resolved here"* — and reported drift in a database that
   had none. **The C21 class, sixth occurrence.** Now row-scoped, with an
   anti-vacuity assertion that five derived-state rows were actually extracted.

---

## 8 · Standing

```
W5-LANDING-01                      ✅ CLOSED
W5-LANDING-02 Gate A               ✅ CLOSED · durable rerun reproduced · exit 3
W5-LANDING-02A instrument seal     ✅ 66 passed · 0 failed
W5-LANDING-02 Gate B               ✅ 88 passed · 0 failed · 3 mutants, 3 kills

20260903000001 applied-outside-carrier   ⚠️ INDEPENDENT CUSTODY FINDING
                                            ⛔ NOT smuggled into the five-file
                                            carrier · reconcile before the
                                            canonical merge ruling, not before this

production execution               ⛔ HELD
canonical merge                    ⛔ HELD
deployment                         ⛔ HELD
production mutation                ⛔ NONE
```

> ***The carrier is exactly five files, the five apply in the runner's own order
> from the real base schema, and a conversation spoken before the editorial
> object exists cannot be given a subject it was never about.***
