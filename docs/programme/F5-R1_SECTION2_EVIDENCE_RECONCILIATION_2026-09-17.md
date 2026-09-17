# F5-R1 — §2 EVIDENCE RECONCILIATION

```
D9        CLOSED
F5 TRACE  COMPLETE
F5 RESULT FAIL / STOP        (unchanged by this act)
SPM       CLOSED
REPAIR    NOT AUTHORIZED

F5-R1     ACTIVE — narrow §2 evidence reconciliation
SPM-FC-01 NEXT
```

**Both subjects bound explicitly:**

| | |
|---|---|
| adjudication subject | `a5834c94656a461dd89ea2dec044e9418f355717` |
| F5-A/B/C subject | `7ee173db0d54f7340353316d11729b88480434a5` |

`git diff --name-only 7ee173db a5834c94 -- database app/api lib middleware.ts config`
returns **two files**, both `lib/corpus/` (admission source and its test). No
counted path differs. **Every figure below is computed once and holds at both
subjects.**

## Outcome

```
RECONCILED — same phenomenon, different denominators
```

**No qualitative F5 constitutional finding changes.** One is strengthened (§5).
Three of the adjudication's numeric values did not reproduce exactly and are
marked accordingly (§3); the contract must not depend on them.

---

## 1. Why the figures differed — the methodological distinction

Three instruments were in play. Each answers a different question, and none is
wrong.

| instrument | source | question it answers |
|---|---|---|
| **A — adjudication §2** | FK clauses declared in `database/migrations/*.sql` referencing `members(id)`, counted as distinct **(table, ON DELETE action)** pairs | *what does the migration source declare?* |
| **B — F5-C** | `database/baseline/0001_baseline_2026-09-01.sql`, where `pg_dump` emits FKs as `ALTER TABLE … ADD CONSTRAINT … FOREIGN KEY` | *what does the captured production schema hold?* |
| **C — F5-A** | `REFERENCES members` appearing **inside `CREATE TABLE` bodies only**, in migrations | a **narrower** form of A |

**The root cause of the divergence is FK statement form.** A foreign key can be
declared inline in a `CREATE TABLE` body or separately via `ALTER TABLE … ADD
CONSTRAINT`. `pg_dump` always emits the latter — 813 such statements in the
baseline. Instrument C read only the former, so it was structurally blind to
every separately-declared constraint.

This is not scope, directionality, duplicate counting, or migration visibility.
It is **statement form**, and it is the single distinction that explains the
whole seam.

---

## 2. Reproduction of the adjudication's figures

Instrument A, reproduced:

| §2 figure | adjudication | reproduced | verdict |
|---|---|---|---|
| tables governed by the route | **43** | **43** | ✅ exact |
| FK-linked tables | 242 | 243 | ⚠️ ±1 |
| CASCADE | **161** | **161** | ✅ exact |
| RESTRICT | **24** | **24** | ✅ exact |
| NO ACTION | 43 | 47 | ⚠️ +4 |
| SET NULL | 30 | 32 | ⚠️ +2 |

`CASCADE` and `RESTRICT` reproduce exactly, which identifies the methodology
beyond reasonable doubt: **distinct (table, ON DELETE action) pairs over
migration-declared FK clauses to `members(id)`**, counting inline and
`ALTER TABLE` forms together.

### 2.1 The "43 governed" figure — both denominators are correct

`GOVERNED_CONTENT` + `OPTIONAL_CLEANUP` contain **43 `{table, column}` entries**
over **42 distinct table names**.

The adjudication counted entries (43). F5-A and F5-C counted names (42).

**The single duplicated name is `developmental_memories`** — which is precisely
the contradictory-orchestration finding the adjudication records in §2. The two
denominators do not merely coexist; the gap between them *is* that finding. Each
instrument independently surfaced the same defect, one as a count and one as a
classification.

---

## 3. Numbers rejected as not reproduced

Per the acceptance condition — *reject any number that cannot be reproduced* —
three values are **not carried forward as exact**:

```
FK-linked tables   242   (reproduced as 243)
NO ACTION           43   (reproduced as 47)
SET NULL            30   (reproduced as 32)
```

The residuals are small and one-directional (my parse counts slightly more in
each case), consistent with my instrument admitting a few `ALTER TABLE … ADD
COLUMN … REFERENCES members(id)` forms inside conditional `DO` blocks that a
stricter parse would exclude. **I did not tune the parser to close the gap**, and
no averaging was performed.

**These three values must not be quoted as exact in SPM-FC-01.** The load-bearing
propositions they support survive without them: *the route governs far fewer
tables than the FK graph disposes*, and *RESTRICT and NO ACTION classes exist
that the route does not enumerate*. Both are carried by the exactly-reproduced
`161` and `24` and by §5.

---

## 4. Both baseline and migration figures preserved

Instrument B, on the production-captured baseline, gives a **different and also
valid** answer:

```
distinct tables with >=1 FK to members(id)   268
CASCADE 181 · NO ACTION 69 · SET NULL 41 · RESTRICT 16
```

Neither set supersedes the other. They answer different questions:

- **A (243 tables, RESTRICT 24)** — what the repository's migration source
  declares. This is the right instrument for *"can the governed erasure process
  account for what it will cause?"*, because the migration source is what a
  reviewer reads.
- **B (268 tables, RESTRICT 16)** — what the schema captured from production on
  2026-09-01 holds. This is the right instrument for *"what is actually there?"*

The RESTRICT direction is informative and is recorded rather than explained
away: the migration source declares **more** RESTRICT constraints (24) than the
2026-09-01 capture holds (16). Consistent with RESTRICT-bearing tables having
been declared after the capture — the Writer's Studio stores the adjudication
names are recent. **Not asserted as the cause; the capture date and the
declaration dates were not cross-indexed, and doing so was not authorized.**

---

## 5. The retest that mattered — F5-A's structural finding survives

F5-A §5 reported *39 of 40 governed content tables lack an FK to `members`*,
using instrument **C**, the weakest of the three. If that finding were an
instrument artifact, F5-C's custody graph and the adjudication's §2 would both
need amendment.

**Retested with instrument B — the ALTER-inclusive, production-captured
baseline, the instrument F5-A did not use:**

```
route table names inspected                          43
carrying an FK to members(id) in the baseline          1   (scribe_sessions)
carrying no FK to members(id)                         42
```

Independent corroboration from the same source: of those tables, **33 carry a
`text`-typed identity column** against `members.id uuid`, 1 uuid, 9 with no
resolvable column. A `text` column cannot bear a foreign key to a `uuid` primary
key, so for those 33 the absence is **not declarable**, not merely undeclared.

**The finding is reproduced by a stronger instrument and is not an artifact.**
F5-A's `1 of 40` becomes `1 of 43` under the correct denominator — the same
claim, more exactly stated.

### 5.1 One refinement the reconciliation forced — the sets are disjoint

The adjudication's §2 phrasing — *242 tables carry FKs while the route governs
only 43* — can be read as the 43 being a subset of the 242. **They are not.**

```
migration-declared FK-linked tables   243
route-governed table names             42
INTERSECTION                            1   (scribe_sessions)
```

The governed set and the FK graph are **effectively disjoint**. The route
enumerates 42 tables that are almost entirely outside the FK graph, while 243
FK-linked tables are disposed implicitly and are almost entirely outside the
route.

**This strengthens the §2 finding rather than qualifying it.** *The route is not
an authoritative map of the storage graph* is more true under the corrected
reading than under the nested one: the two mechanisms do not overlap at all,
so neither can serve as a check on the other, and the union — not either alone —
is the real disposition surface.

**No amendment to the ruling is required**, because the ruling's proposition is
unchanged and its force increases. The refinement is recorded here rather than
written back into §2, so the adjudication is not edited to read as though it had
always said this.

---

## 6. Effect on each F5 constitutional finding

| finding | effect of reconciliation |
|---|---|
| route is not an authoritative map of the storage graph | **strengthened** (§5.1) |
| RESTRICT/NO ACTION can turn deletion into opaque FK failure | unchanged; `24` reproduced exactly |
| Writer's Studio stores absent from `GOVERNED_CONTENT` | unchanged; consistent with §4's RESTRICT direction |
| CASCADE disposition unmanifested | unchanged; `161` reproduced exactly |
| SET NULL survival class ungoverned | proposition unchanged; the exact count `30` is rejected (§3) |
| `developmental_memories` contradictory orchestration | **independently corroborated** (§2.1) |
| orphaned authority state (D9-C) | untouched — not a counting question |
| member-visible truth stops at the API | untouched — not a counting question |
| `mem0` / embeddings with owning rows | consistent with F5-C's finding of 8 in-row embedding columns and no external vector store |

**No qualitative F5 ruling changes. `F5 ERASURE CONFORMANCE — FAIL / STOP`
stands, on evidence that is now single-sourced and reproducible.**

---

## 7. Standing

```
F5-R1            COMPLETE
Outcome          RECONCILED — same phenomenon, different denominators
Root cause       FK statement form (inline CREATE TABLE vs ALTER TABLE ADD CONSTRAINT)
Exactly reproduced        governed=43 · CASCADE=161 · RESTRICT=24
Rejected as not exact     tables=242 · NO ACTION=43 · SET NULL=30
Both instruments preserved — migration-declared (243) and baseline-held (268)
F5-A structural finding   SURVIVES a stronger instrument (1 of 43)
Refinement                governed set and FK graph are DISJOINT (intersection 1)
Constitutional findings   ALL SURVIVE; one strengthened
Averaging                 NONE PERFORMED
Ruling amendment          NOT REQUIRED

Mutation NONE · Repair NONE · Schema UNTOUCHED · Production UNTOUCHED
No new census authorized · NEXT: SPM-FC-01
```

> *The two instruments were never measuring different worlds. One read what the
> source declares and one read what the schema holds, and the seam between them
> was a single fact about where PostgreSQL writes a foreign key. The finding that
> depended on the weaker instrument was retested against the stronger one and got
> sharper, not softer.*
