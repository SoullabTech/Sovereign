# W4-SCHEMA-LAND · LANDING PREPARATION

**Date** 2026-09-15 · **Branch** `claude/w4-schema-implementation` · **Base** canonical
`348b9e54d` · **Authorized** founder, 2026-09-15 — **record-only acts**.

⛔ **NO CANONICAL ACQUISITION. NO PROTECTED EXECUTION. NO DEPLOY. PRODUCTION UNTOUCHED.**

---

## 1 · ⛔ FOUNDER DISPOSITION — the prior one-file implementation is SUPERSEDED

**Recorded here so that branch can never later look merely *alternative*.**

```
origin/chore/w4-2-migration-20260915 @ 5bd2c0426

⛔ SUPERSEDED
⛔ DO NOT MERGE
⛔ DO NOT CHERRY-PICK  database/migrations/20260915000001_editorial_turn_bindings.sql
✅ HISTORICAL EVIDENCE ONLY
```

**Founder ruling, 2026-09-15.** The decisive reason:

> ***One file cannot represent the safe `S1-landed / S2-refused` state in the
> migration ledger.***

Its two internal transactions do not repair that — **one file is one ledger
row**. If `VALIDATE` refuses, the first transaction has already committed the
schema changes while the ledger records nothing: the half-applied file the
phasing seal exists to prevent. Under `run-sql-migrations.sh` those internal
transactions additionally **cross the runner-owned transaction boundary**, which
the design named as *a custody decision, not an implementation detail*, and
declined to take.

⭐ **Nothing is deleted or rewritten.** `5bd2c0426` stands as evidence, and its
anchor = NULL fixture work is reused under `W4-SCHEMA-IMPLEMENTATION` §4 with its
commit named.

### The filename collision is disposed

```
AUTHORIZED   20260915000001_ask_threads_subject_preparation.sql
AUTHORIZED   20260915000002_editorial_turn_bindings.sql

RETIRED      20260915000001_editorial_turn_bindings.sql   (from 5bd2c0426)
```

⛔ The retired name must not reach canonical under any route. Both files carry
the `20260915000001` prefix with different names and different content; landing
both would run both, and the second would fail on constraints the first created.

---

## 2 · The disclosure, cherry-picked alone

⭐ **The single commit, never its branch.** Merging
`chore/w5-witness-integrity-findings-20260915` would have carried **437 files,
+77,757 lines and twelve migrations** — the five W5 files plus the seven
branch-only ones Gate A confirmed do not enter any carrier. By the 2026-09-07
mechanism all twelve would become deployable by whoever deployed next.

```
cherry-pick  b67eb15e5  →  0d8a8be0a   (-x, provenance recorded in the message)
file         docs/programme/W5_WITNESS_INTEGRITY_FINDINGS_2026-09-15.md
blob         d28e0fe4912f17151cfe86d97d8636e3f2747fe8   ⭐ matches the founder's pin
carried      that file and nothing else
```

⛔ **Asserted, not assumed** — the blob was verified at `b67eb15e5` *before* the
pick and re-verified on the candidate *after* it.

### ⭐ The migration delta, reasserted after the pick

```
A  database/migrations/20260915000001_ask_threads_subject_preparation.sql
A  database/migrations/20260915000002_editorial_turn_bindings.sql
```

**Exactly two. Nothing modified, nothing deleted.** Full candidate scope vs
canonical — seven files, all additions: the two migrations, two records, and
three witnesses (`w4-schema-witness.sh`, the adapted `w5-3-schema-witness.sh`,
`w5-rebuild-db.sh`).

⛔ The two `b67eb15e5` findings remain exactly what they were — **S6 vacuity:
disclosed, unrepaired · runtime stub custody: disclosed, unrepaired.** Carrying
the disclosure to canonical is not repairing what it discloses, and neither is
absorbed into W4.

---

## 3 · The protected preflight — built, predeclared, ⛔ NOT RUN

`scripts/witness/w4-schema-land-preflight.sh`, read-only.

⛔ **It cannot be discharged in advance, by construction.** Its whole content is
that it is read **immediately before landing**; a reading taken now is yesterday's
clean state treated as permanent, which is the thing it exists to forbid.

```
bash scripts/witness/w4-schema-land-preflight.sh HEAD
```

**Predeclared, so the run is falsifiable rather than confirmatory:**

```
§1  db maia_consciousness · role soullab · read_only on
§2  live GIT_COMMIT 348b9e54d
§3a latent pending in the running image        0
§3b candidate pending set, in order:
      1  20260915000001_ask_threads_subject_preparation.sql
      2  20260915000002_editorial_turn_bindings.sql
      nothing else
§4a both anchor AND chain                      0
§4b chain AND reading_identity                 0
§5  ask_threads ~8 kB · ask_turns ~24 kB       (Option A unchanged)
```

⛔ **Any deviation is the finding, not a defect in the expectation.**

### ⭐ Two of the four subject counts are reported as NOT MEASURABLE, deliberately

The ruling names four `ask_threads` counts. **Only two of them are evidence.**

| count | before S1 lands | why |
|---|---|---|
| both anchor **and** chain | ⭐ **measurable** | decides `ask_threads_one_subject`'s VALIDATE |
| chain **and** `reading_identity` | ⭐ **measurable** | decides `editorial_has_no_reading`'s VALIDATE |
| **neither** anchor nor chain | ⛔ **NOT MEASURABLE** | `anchor` is still `NOT NULL` |
| editorial threads (`anchor IS NULL`) | ⛔ **NOT MEASURABLE** | same |

⛔ Both are **structurally** zero: no row could have made them non-zero. The
instrument prints them and refuses to count them as passing checks — *a zero that
nothing could have disturbed proves nothing*, the same law as **an absent schema
is not zero violations**. It switches to counting them only if it finds `anchor`
already nullable, which would itself mean S1 had landed before and is flagged.

### §5 reports; it does not rule

Option A was earned on 2026-09-14 from a dated reading (`ask_threads` 8 kB ·
`ask_turns` 24 kB). §5 re-reads both. ⛔ If either has grown materially, **Option
A is re-decided by the founder, not assumed by the instrument**, and `reltuples`
is named as an estimate that sizes a build and answers no integrity question.

---

## 4 · Standing

```
W5 substrate                      ✅ LANDED · canonical + production · 348b9e54d
W4-SCHEMA-IMPLEMENTATION          ✅ CLOSED · dfa521ef0 · 40/0 · 38/0 · 4 mutants
prior one-file implementation     🛑 SUPERSEDED · DO NOT MERGE · recorded §1
b67eb15e disclosure               ✅ cherry-picked alone · blob pin asserted
migration delta                   ✅ exactly two, reasserted after the pick

W4 protected preflight            🟢 BUILT · predeclared · ⛔ NOT RUN
W4 canonical acquisition          ⛔ until preflight, then a founder ruling
S1/S2 protected execution         ⛔ same controlled window, as with W5
production mutation               ⛔ NONE

20260903000001                    ⚠️ parked in its own lane
S6 vacuity · stub custody         ⚠️ disclosed · unrepaired · not absorbed

editorial runtime                 ⏭ immediately after W4 lands
```

> ***The disclosure travels alone, the delta is still two files, and the two
> counts that could not have been anything but zero are reported as exactly
> that — reported, never counted.***
