# WS2-08A — post-failure adjudication · F6b FAIL and the successor criterion

> **Docs-only. Authorized by founder act 2026-09-06 (Path B). No runtime, schema, migration or
> implementation change. `F6b = FAIL · R5` is permanent and is NOT reclassified by this record.
> BUILD-08B remains closed until 08A is lawfully closed.**
>
> **The criterion in §4 is written in frozen form — fixed before any F1–F3 evidence exists — but it
> becomes binding only on founder acceptance of this record. F1–F3 do not resume before that.**

```text
UNIT        WS2-08A  HIERARCHICAL MANUSCRIPT STRUCTURE (substrate cut)
CANONICAL   50302f5d97dc4d0abb85955aedbb8f796ae6835e
DECIDE      docs/programme/WS2-08_HIERARCHICAL_MANUSCRIPT_STRUCTURE_DECIDE_2026-09-06.md
STATE       08A CANNOT CLOSE under the frozen contract · successor criterion DRAFT
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
the migration retains an `xmin` older than the migration's own transaction.

The migration's transaction is itself addressable: its `schema_migrations` row was written inside
it, so that row's `xmin` bounds it.

```text
SC-1 PASSES when, for every one of the 810 baseline ids:

  age(s.xmin) > age(m.xmin)

    where m is the schema_migrations row for
      20260906000001_manuscript_section_heading_depth.sql

  i.e. every baseline row version is OLDER than the migration's transaction.

SC-1 FAILS on any row whose version is not older, and on any of the preconditions below.
```

`age()` is used rather than raw xid comparison so wraparound cannot invert the ordering.

### 4.3 Preconditions — checked BEFORE the reading is admissible

```text
P1  no baseline row's xmin is frozen (xmin <> 2), and none reads as frozen under
    age() — VACUUM FREEZE erases the distinction SC-1 depends on, and a frozen row
    can no longer testify about its own age
P2  the schema_migrations row for the migration is present and its xmin readable
P3  the 810 baseline ids are still all present and still byte-identical in projection
    (re-established at reading time, not carried from the F6b run)
P4  the reading is taken in ONE snapshot (REPEATABLE READ, READ ONLY)
```

**If P1 fails, SC-1 is unavailable and cannot be replaced by a weaker reading.** A frozen tuple has
lost the evidence; that is a stop, not a reason to substitute end-state equality again.

### 4.4 What SC-1 cannot claim, written into the criterion itself

```text
SC-1 says nothing about the twelve inserts and twelve deletes
SC-1 says nothing about non-baseline rows
SC-1 is not lineage across the whole interval — only relative to the migration's transaction
SC-1 is retrospective evidence about tuples that exist NOW; it is not a re-run of F6
a SC-1 PASS never licenses the sentence "the migration did not rewrite rows AND nothing else did"
```

### 4.5 Feasibility, unverified

SC-1 has **not** been probed against production. Two read-only checks decide whether it is available
at all, and they must be run before this criterion is frozen — if P1 already fails, SC-1 is
stillborn and the choice returns to Path A:

```sql
-- (i) is the migration's transaction still addressable, and how old are baseline tuples?
SELECT age(xmin) FROM schema_migrations
 WHERE filename = '20260906000001_manuscript_section_heading_depth.sql';
-- (ii) is any manuscript_sections tuple frozen?
SELECT count(*) FILTER (WHERE xmin::text::bigint = 2) AS frozen,
       count(*) AS total FROM manuscript_sections;
```

A stronger variant exists if `track_commit_timestamp` is enabled — `pg_xact_commit_timestamp(xmin)`
would date each row version directly against the 12:20:35Z baseline capture. It is **off** by default
in PostgreSQL and enabling it requires a restart and applies only to transactions after it, so it
cannot help retrospectively here. It is named only so it is not mistaken for an available option.

---

## 5 · A defect this failure exposed, outside 08A's scope

`scripts/run-sql-migrations.sh` adds a `checksum` column to `schema_migrations` but records only the
filename — the checksum is never populated. So the ledger proves *a file with that name* was applied,
not *which bytes*. With two migrations sharing the `20260906000001` prefix now in production, that is
a second-order ambiguity worth closing. **Not authorized here, not repaired here** — recorded so the
finding is not lost with this document.

---

## 6 · Sequence, and what remains unauthorized

```text
1  founder review of THIS record
2  run §4.5's two feasibility probes
3  founder FREEZES SC-1 (or returns to Path A if P1 fails)
4  only then F1, F2, F3 — the frozen wording, unchanged
5  SC-1 reading, if frozen
6  founder adjudication of 08A closure
7  a SEPARATE founder act opens 08B
```

```text
F6b                 FAIL · R5 · permanent
SC-1                DRAFT · not frozen · not probed
F1–F3               NOT RUN
08A                 CANNOT CLOSE
08B                 CLOSED
no runtime · no schema · no migration · no implementation change in this act
```
