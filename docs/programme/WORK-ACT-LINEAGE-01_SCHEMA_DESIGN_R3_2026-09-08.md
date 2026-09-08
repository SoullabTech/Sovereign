# WORK-ACT-LINEAGE-01 — SCHEMA DESIGN R3

```
STATUS        REVISION 3 · cutover · candidate for migration-schema ratification
CARRIES       A1–A5 + A6 writer-first principle, RATIFIED at R2
REPLACES      R2 §A6 cutover mechanics (NOT RATIFIED)
MIGRATION     NOT AUTHORIZED
BUILD         NOT AUTHORIZED
MERGE/DEPLOY  HOLD
```

> **The system may become more truthful in stages; the member's history may not
> disappear between them.**

> **A repair to historical monotonicity may not itself temporarily violate
> historical monotonicity.**

---

## 0. Finding D — disposition recorded

```
Finding D
OBSERVED        Remove Work destroys living_work_materials.relationship_sentence
MEMBER CONTENT  YES
BREACH          ⛔ NOT ESTABLISHED
REPAIR          NOT AUTHORIZED
LEDGER COPY     ⛔ FORBIDDEN
NEXT            separate constitutional classification
```

The open question is *whether the sentence is part of the writing that survives
the Work, or part of the Work-specific arrangement Remove Work is authorized to
dissolve.* The confirmation copy already says removal ends *"how it was
arranged."* R2 overstated this by calling it "the same shape as Finding B"; it
is the same *observation*, not the same established claim. Corrected here.

---

## 1. The activation watermark `D` (R3-1, R3-4)

⛔ Not in `member_studio_acts` — it is not a member act.

```sql
studio_ledger_cutover
  singleton     BOOLEAN PRIMARY KEY DEFAULT TRUE CHECK (singleton)
  activated_at  TIMESTAMPTZ NOT NULL        -- this IS D
  completed_at  TIMESTAMPTZ                 -- set when reconstruction is complete
```

⭐ **Activation is the INSERT of this row.** That single committed fact is `D`,
and it is what makes the writer live — not the deploy.

```
Release 1 deploy   code ships DORMANT: no row → no native write, no drain,
                   no transitional read. System behaves exactly as today.
ACTIVATION         one INSERT. D = activated_at.
after D            native writer active · drain guard active ·
                   transitional projection bounded by this exact value
```

**Why this closes the coupling question rather than restating it:** if the row
were inserted *before* the code was live, acts in between would be captured by
neither side. Deploying dormant makes that impossible — and acts between deploy
and activation are pre-D, so their legacy rows fall inside reconstruction's
`< D` window. **No gap exists at either boundary.**

⛔ Fail-closed: with no row, the writer does not write. Before activation the
system is unchanged, which is the correct behaviour, not a degraded one.

⛔ One row, enforced structurally. `D` is read, never recomputed; nothing may
derive it from a deploy timestamp, an image label, or `now()`.

---

## 2. Drain-before-delete (R3-2)

⛔ **Without this, Release 1 creates a period in which the act being repaired
destroys the evidence needed for the repair.** Not an optimisation.

```
Remove Work X, after D
BEGIN
  -- drain: every grounded legacy act for X whose SOURCE time < D
  --        and which is not already in the ledger
  INSERT work_begun          from living_works            (created_at  < D)
  INSERT expression_declared from living_work_expressions (declared_at < D)
  INSERT material_declared   from living_work_materials   (declared_at < D)
      recording_basis = 'cutover_reconstruction'
      reconstruction_key = <source table>:<source row id>     -- §3
      work_name_at_act = NULL                                 -- RW-C6
  ON CONFLICT (reconstruction_key) DO NOTHING

  -- native
  INSERT work_removed  recording_basis='at_act'
                       work_name_at_act = X's title now       -- B reads this
  DELETE living_work X                                        -- cascades
COMMIT
```

⭐ **The bound is per-row, not per-Work.** A pre-D Work may have a *post-D*
expression declaration, already captured natively; draining it would duplicate
the act. Each source row is drained on its own `< D` test.

⭐ **Unconditional and idempotent.** No branch on "is this a pre-D Work" — a
Work begun after D simply has no rows below `D`, so the drain is a no-op. One
rule, no classification to get wrong.

⛔ **The drain and the bulk pass MUST share one key-derivation function.** Two
implementations of "the same act" is precisely how the duplicate returns.

⛔ No invented name on drained rows. `work_name_at_act` is NULL: the current
title is not evidence of the title at that act (RW-C6).

---

## 3. `reconstruction_key` (R3-5)

R2's `UNIQUE(kind, work_ref, expression_ref, occurred_at)` is withdrawn. It
fails twice: NULLs compare distinct in Postgres, so `work_begun` and
`material_declared` re-duplicate on a re-run; and `NULLS NOT DISTINCT` would
then falsely collapse two lawful material declarations sharing a Work and an
instant. **Idempotency must not redefine what counts as the same act.**

```sql
reconstruction_key TEXT      -- inert. NOT NULL iff recording_basis =
                             -- 'cutover_reconstruction'; NULL otherwise (CHECK)
CREATE UNIQUE INDEX ... ON member_studio_acts (reconstruction_key)
  WHERE recording_basis = 'cutover_reconstruction';
```

⭐ **Every legacy source row already has a UUID primary key** — `living_works.id`,
`living_work_expressions.id`, `living_work_materials.id`. So the key is source
identity, deterministically:

```
'living_works:'             || w.id      → work_begun
'living_work_expressions:'  || e.id      → expression_declared
'living_work_materials:'    || mt.id     → material_declared
```

⭐ **This keys the declaration row, not the material** — so the polymorphic
`material_id TEXT` never enters the ledger and no third addressing scheme is
created. The A2 dissolution holds.

⛔ Native acts carry `reconstruction_key IS NULL` and are outside the index:
two lawful renames at the same instant remain recordable.

---

## 4. Transitional C projection, and the window R2 did not see (R3-1, R3-3)

**During transition** (`activated_at` set, `completed_at` NULL):

```
C  =  legacy established acts with SOURCE time < D
      ∪
      ledger acts
```

Strict `< D` on the legacy side is what prevents double-counting a post-D Work:
its `living_works.created_at ≥ D` excludes it from the legacy side, and it is
present natively. A drained act's legacy row is deleted in the *same
transaction* that inserts its ledger row — so there is no committed state in
which it appears twice, and none in which it appears zero times.

### ⭐ The remaining window — found in R3, not present in R2

A pre-D Work that is **never removed** is still visible on the legacy side.
When Release 2 reconstructs it, its ledger row appears **while its legacy rows
still exist** — the act now shows twice.

**Answer: the bulk reconstruction and the read-switch commit together.**

```
BEGIN
  reconstruct all remaining grounded acts with source time < D
  prove completeness (§5)
  UPDATE studio_ledger_cutover SET completed_at = now()
COMMIT
```

`completed_at` is the read switch: transitional union while NULL, ledger-only
once set. Because both happen in one transaction, **no committed state shows a
duplicate and none shows a hole.** That is the atomic retirement of the legacy
read the ruling requires.

⚠️ **Scale is a real constraint on this design, and must be measured before
the migration.** One transaction must hold the whole reconstruction. Current
production is small enough that this is very likely fine, but *likely* is not
evidence: **the migration must not be authorized until the row count over
`living_works` + `living_work_expressions` + `living_work_materials` has been
read.** ⛔ If it is ever too large, the fallback is NOT to split the
transaction — it is to deduplicate the transitional read by
`reconstruction_key`, which is more machinery and should be avoided if the
measurement permits.

---

## 5. Completeness, stated as a check rather than an intention

`completed_at` may only be set when, for every legacy source row with source
time `< D`, a ledger row with the corresponding `reconstruction_key` exists.
⛔ A count comparison is not sufficient — a missing row and an extra row cancel.
The check is a `NOT EXISTS` anti-join per source table, inside the same
transaction, refusing the switch if any row is unmatched.

---

## 6. Table, final for this revision

```sql
member_studio_acts
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid()
  member_id          UUID NOT NULL REFERENCES members(id) ON DELETE RESTRICT
  kind               TEXT NOT NULL              -- CHECK: closed vocabulary
  occurred_at        TIMESTAMPTZ NOT NULL       -- act time, supplied
  recorded_at        TIMESTAMPTZ NOT NULL DEFAULT now()
  recording_basis    TEXT NOT NULL              -- CHECK: at_act |
                                                --   cutover_reconstruction
  reconstruction_key TEXT                       -- inert · NOT NULL iff
                                                --   cutover_reconstruction

  work_ref           UUID                       -- ⛔ NO FK (RW-C4)
  expression_ref     UUID                       -- manuscripts only
  expression_kind    TEXT                       -- inert vocabulary

  work_name_at_act   TEXT                       -- ⚠️ THE ONLY MEMBER CONTENT
```

Per-kind population, CHECK-enforced (unchanged from R2):

```
work_begun            work_ref                              name ⛔ NULL (D-16)
work_named            work_ref                              name permitted
work_renamed          work_ref                              name permitted
work_removed          work_ref                              name permitted ← B
expression_declared   work_ref, expression_ref, kind        name permitted
expression_withdrawn  work_ref, expression_ref, kind        name permitted
material_declared     work_ref, kind                        name ⛔ NULL
```

⛔ Drained rows always carry `work_name_at_act IS NULL` regardless of what the
kind permits — the permission is per-kind, the NULL is per-basis (RW-C6).

Grants and trigger unchanged from R2 §A3: app role `SELECT, INSERT` only;
`UPDATE` refused unconditionally; `DELETE` only through the scoped erasure
capability, which takes a manuscript id and computes its own row set.

---

## 7. Acceptance — cutover series

```
X — CUTOVER
x1  ⭐ THE HINGE (founder-specified):
      pre-D Work X carries manuscript M
      → activate at D
      → BEFORE bulk reconstruction, Remove Work X
      → M remains recognizable from the removal-time name
      → pre-D grounded acts for X remain in history
      → work_removed appears
      → after Release 2, NO duplicate acts
x2  an act occurring at any point in the release window is visible exactly once
x3  bulk reconstruction re-run creates no duplicate row
x4  no reconstructed act carries work_name_at_act
x5  a pre-D Work never removed shows its acts exactly once,
      before, during and after Release 2
x6  completed_at cannot be set while any < D source row is unmatched
x7  before activation, behaviour is byte-identical to today
x8  two lawful material declarations at the same instant both persist
```

B (b1–b7), C (c1–c6) and E (e1–e7) carry forward from R2 unchanged.
⛔ Each of B, C, E, X needs falsifiers capable of failing while the others pass.

---

## 8. Standing

```
A1–A5 · A6 writer-first        RATIFIED (R2)
R3-1 no incomplete window      ANSWERED — transitional union + atomic switch
R3-2 drain-before-delete       ANSWERED — per-row < D, unconditional, idempotent
R3-3 transitional projection   ANSWERED — legacy(<D) ∪ ledger
R3-4 durable watermark         ANSWERED — studio_ledger_cutover; activation
                                          IS the insert; deploy dormant first
R3-5 reconstruction_key        ANSWERED — source-row identity, partial unique
R3-6 atomic final switch       ANSWERED — reconstruction + completed_at in one
                                          transaction

⚠️ NEW · BLOCKS RATIFICATION
    single-transaction reconstruction scale UNMEASURED (§4).
    Read the three legacy row counts before authorizing the migration.

Finding A · Finding D          OPEN · separate lanes
MIGRATION · BUILD · MERGE · DEPLOY   NOT AUTHORIZED
witness manuscript             UNTOUCHED   ·   copy correction HOLD
```
