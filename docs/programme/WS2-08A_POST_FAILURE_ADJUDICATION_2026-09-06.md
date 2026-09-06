# WS2-08A — post-failure adjudication · F6b FAIL and the successor criterion

> **Docs-only. Authorized by founder act 2026-09-06 (Path B). No runtime, schema, migration or
> implementation change. `F6b = FAIL · R5` is permanent and is NOT reclassified by this record.
> BUILD-08B remains HOLD · UNOPENED until 08A is lawfully closed.**
>
> **The criterion in §4 is written in frozen form — fixed before any F1–F3 evidence exists — but it
> becomes binding only on founder acceptance of this record. F1–F3 do not resume before that.**

```text
UNIT        WS2-08A  HIERARCHICAL MANUSCRIPT STRUCTURE (substrate cut)
CANONICAL   50302f5d97dc4d0abb85955aedbb8f796ae6835e
DECIDE      docs/programme/WS2-08_HIERARCHICAL_MANUSCRIPT_STRUCTURE_DECIDE_2026-09-06.md
STATE       08A CANNOT CLOSE under the frozen contract · SC-1 DRAFT, NOT FROZEN
AMENDED     2026-09-06 — SC-1 anchor corrected after founder review (§4.2)
```

---

## 1 · The result that stands

```text
F6b   FAIL · R5      permanent historical result · not reclassified, not superseded
```

Self-sealed by the instrument at `/home/soullab/ws2-08a-witness/f6b-20260906T141001Z`
(`manifest.json` carries the verdict, both counter sets, the reprojection digest, the script's own
sha256, host, snapshot id and the runtime `GIT_COMMIT` at comparison time).

```text
R1 missing baseline ids        0        R2 old field differences   0
R3 new columns not null        0        R4 rows after baseline     0
R6 ledger rows missing         0        migration present          2 (both 20260906000001_*)
reprojection sha256            fc98b19a…d884d == baseline
R5 write boundary              ins 812→824 · del 2→14 · upd 0→0 · hot 0→0 · stats_reset unchanged
```

**No decomposition of this record turns F6b green.** The scoring was fixed before the run and is not
adjusted after seeing the result. That is the single most important fact this document preserves.

---

## 2 · What the surviving evidence establishes

```text
all 810 baseline ids present now
baseline projected fields (id · position · heading · body digest) byte-identical now
heading_depth and heading_signal NULL on every baseline row
no surviving post-baseline rows
n_tup_upd 0→0 and n_tup_hot_upd 0→0 across the whole interval
n_tup_ins +12 and n_tup_del +12
stats_reset epoch unchanged
migration ledger intact; the WS2-08A migration recorded at 2026-09-06 13:36:01.629937+00
migration source is additive DDL: no INSERT, UPDATE or DELETE in its body
the only application path that deletes these rows is a member-scoped Work delete,
  cascading manuscript_sections from member_manuscripts
```

## 3 · What it does NOT establish — and what is permanently unrecoverable

```text
NOT ESTABLISHED
  that no baseline row was transiently deleted and reinserted with the same id and values
  that no intervening mutation occurred
  what caused the twelve inserts and twelve deletes (causal attribution)
  that no direct SQL write occurred outside the application

PERMANENTLY UNRECOVERABLE
  the pre-migration interval itself. F6 required a baseline captured BEFORE the migration and a
  comparison AFTER it. The migration has run. No later baseline recreates that interval; it can
  only support a different claim about a different window.
```

The application-path observation in §2 narrows the space of explanations. It is **explanatory
evidence, not acceptance evidence**, and it sits outside F6b's verdict.

---

## 4 · SC-1 — the successor criterion (DRAFT, frozen in form)

### 4.1 The narrower claim, stated separately from the failed one

```text
FAILED, permanently:  no detected intervening mutation of manuscript_sections across the
                      migration interval                                        [F6b · R5]

SC-1 claims ONLY:     the WS2-08A migration did not mutate any pre-existing
                      manuscript_sections row
```

These are different claims. SC-1 is narrower in two ways that must not blur: it is about **the
migration**, not the interval; and about **row mutation**, not about whether anything else happened.
SC-1 passing does not make F6b pass, does not establish the interval was quiet, and may never be
described as "F6 by another route".

### 4.2 The instrument — tuple lineage, not end-state equality

F6b's blind spot was precise: end-state equality cannot distinguish a row that was never touched
from one deleted and reinserted with identical values. PostgreSQL carries the missing witness in
each tuple's system column `xmin` — the transaction that created **that row version**. An UPDATE
writes a new tuple with a new `xmin`; a delete-and-reinsert likewise. A row untouched since before
the migration retains an `xmin` older than the migration's transaction.

#### The anchor — and a false proxy this record rejected

An earlier draft of SC-1 anchored on the `schema_migrations` row for the migration, asserting it was
written inside the migration's transaction. **It is not.** `scripts/run-sql-migrations.sh` applies
the file in one `psql` invocation and then records the ledger row in a **separate** `psql`
invocation — a different transaction, necessarily later. Observed on production (PostgreSQL 16.13):

```text
catalog objects created by the migration      xmin 324271
schema_migrations row for the migration       xmin 324272
```

The failure direction is what makes this disqualifying rather than merely imprecise: a row rewritten
*by the migration itself* carries 324271, which is older than the ledger row at 324272, so the proxy
would have returned **PASS for the exact event SC-1 exists to detect.** The ledger row is therefore
named here as explicitly NOT the anchor.

#### MIG_XID — the migration transaction, identified by what it created

```text
MIG_XID = the single common normal xmin of the five catalog objects the migration
          writes inside its own transaction:

  pg_attribute     manuscript_sections.heading_depth
  pg_attribute     manuscript_sections.heading_signal
  pg_constraint    manuscript_sections_depth_requires_heading
  pg_description   comment on heading_depth
  pg_description   comment on heading_signal
```

Five independent objects converging on one xid is what makes the identification defensible: a single
object could be coincidental, five cannot. If they do not agree, MIG_XID is not established and SC-1
is unavailable — not approximated.

```text
SC-1 PASSES when, for every one of the 810 baseline ids:

        age(section.xmin) > age(MIG_XID)

    i.e. every baseline row version is OLDER than the migration's transaction.

SC-1 FAILS on any row same-age or newer than MIG_XID, and on any precondition below.
```

### 4.3 Preconditions — checked BEFORE the reading is admissible

```text
P1  every baseline tuple and every migration-reference tuple exposes a NORMAL
    transaction xid (>= 3). A special xid — notably FrozenTransactionId (2) —
    makes that tuple inadmissible, because its original xid is unavailable.

    Ordinary PostgreSQL 16 VACUUM freezing is NOT disqualifying: since 9.4 freezing
    sets an internal flag and PRESERVES the tuple's original xmin. xmin = 2 is the
    older representation and may still appear in databases upgraded from very old
    releases. An earlier draft of this criterion had the freeze semantics backwards
    and would have disqualified admissible evidence.

P2  all five catalog objects in 4.2 exist and their xmin values are IDENTICAL;
    that common value is MIG_XID. The schema_migrations row must exist but is
    NOT used as MIG_XID.

P3  the 810 baseline ids are all present and still byte-identical in projection,
    re-established at reading time and not carried from the F6b run

P4  the reading is taken in ONE snapshot (REPEATABLE READ, READ ONLY)

P5  every compared normal xid lies within the unambiguous half-range
    (< 2^31 transactions of distance). `age()` returns a distance over the
    wrapping 32-bit xid space and does not abolish wraparound; it is admissible
    only inside that bound. Observed production ages are under 61,000, so the
    bound holds with an enormous margin — but the criterion states the bound
    rather than relying on the margin.
```

**If P1 or P2 fails, SC-1 is unavailable and cannot be replaced by a weaker reading.** A frozen
tuple has lost the evidence and an unidentified migration transaction has no substitute; either is a
stop, not a reason to fall back to end-state equality.

### 4.4 What SC-1 cannot claim, written into the criterion itself

```text
SC-1 says nothing about the twelve inserts and twelve deletes
SC-1 says nothing about non-baseline rows
SC-1 is not lineage across the whole interval — only relative to MIG_XID
SC-1 is retrospective evidence about tuples that exist NOW; it is not a re-run of F6
a SC-1 PASS never licenses "the migration did not rewrite rows AND nothing else did"
```

### 4.5 Independent support from PostgreSQL semantics

`ADD COLUMN` without a rewriting default does not require a table rewrite, and `ADD CONSTRAINT`
scans existing rows without rewriting them. The migration body contains no `INSERT`, `UPDATE` or
`DELETE`. This is corroboration of the migration's *intended* posture; SC-1 exists because intent is
not observation.

---

## 5 · A defect this failure exposed, outside 08A's scope

`scripts/run-sql-migrations.sh` adds a `checksum` column to `schema_migrations` but records only the
filename — the checksum is never populated. The same script is also why the ledger row is not the
migration's transaction (§4.2): it commits the migration, then records the ledger row in a separate
`psql` invocation. So the ledger proves *a file with that name* was applied,
not *which bytes*. With two migrations sharing the `20260906000001` prefix now in production, that is
a second-order ambiguity worth closing. **Not authorized here, not repaired here** — recorded so the
finding is not lost with this document.

---

## 6 · Disclosure — a pre-freeze review observation, inadmissible for closure

While reviewing the repair above, the founder measured the **corrected** predicate against
production. That reading is disclosed here rather than omitted:

```text
baseline present               810 / 810
normalized projection diffs    0
new columns non-null           0
special xmin                   0
MIG_XID                        324271
baseline older than MIG_XID    810 / 810   ·  same xid 0  ·  newer xid 0
```

**This is pre-freeze review evidence and is INADMISSIBLE as SC-1 acceptance evidence.** It was taken
before the criterion was frozen, and a criterion is only prospective if no result under it exists
when it is fixed.

The mitigating fact, stated without leaning on it: the *semantic* rule — every baseline version
predates the migration transaction — was written before this read, and the repair replaced a false
proxy for "the migration transaction" with the transaction itself rather than changing what is
claimed. That is why the criterion is amendable rather than void. It does not make the reading
admissible.

**The acceptance witness must be taken fresh, after freezing.** If it disagrees with the reading
above, the fresh reading governs and the disagreement is itself a finding.

---

## 7 · Sequence, and what remains unauthorized

```text
1  founder review of THIS amended record
2  founder FREEZES SC-1 — or returns to Path A if any precondition is unmeetable
3  only then F1, F2, F3 — the frozen wording, unchanged
4  SC-1 acceptance reading, taken FRESH after the freeze (§6)
5  founder adjudication of 08A closure
6  a SEPARATE founder act opens 08B
```

```text
F6b                 FAIL · R5 · permanent
SC-1                DRAFT · NOT FROZEN · instrument repaired, anchor corrected
pre-freeze read     OBSERVED · INADMISSIBLE FOR CLOSURE
F1–F3               NOT RUN
08A                 CANNOT CLOSE
08B                 HOLD · UNOPENED
no runtime · no schema · no migration · no implementation change in this act
```
