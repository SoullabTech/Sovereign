# WORK-ACT-LINEAGE-01 — SCHEMA DESIGN R2

```
STATUS        REVISION 2 · answers the six required amendments
SUPERSEDES    WORK-ACT-LINEAGE-01_SCHEMA_DESIGN_2026-09-08.md (§ noted inline)
MIGRATION     NOT AUTHORIZED
BUILD         NOT AUTHORIZED
MERGE/DEPLOY  HOLD
```

Under **RW-B1..B4 · RW-C1..C6** and the six amendments of 2026-09-08.

> **A content-bearing column enters schema v1 only when a ratified act kind has
> a present need to populate it.**

**Accepted correction to R1:** `UNION ALL` was not the defect. Projection over
**mutable present rows** was. Multiple immutable sources could be lawful; one
ledger is chosen because ordered act history, erasure reach and act-time
provenance belong to one ontology. R1 §2 is corrected in that reading.

---

## A1 — Snapshot columns: three removed, contradiction resolved

R1 both permitted `member_note` on `material_declared` and said it was
populated by no kind. Resolved by removal, not by choosing a side.

```
work_name_at_act          KEPT — required by work_named / work_renamed /
                                 work_removed / expression_declared
manuscript_name_at_act    ⛔ REMOVED — no ratified kind needs it
heading_at_act            ⛔ REMOVED — no ratified kind needs it
member_note               ⛔ REMOVED — see below
```

`member_note` was reserved for `material_declared`'s
`relationship_sentence`. Removed on the minimum-context law: the act
*"a material was declared to this Work at T"* is intelligible without the
member's sentence about why it belongs. The sentence is **content**, not
act-time identifying context. ⛔ Copying it into the ledger is precisely the
shadow-vault the law forbids.

⭐ **Consequence, and a new finding, not solved here.** `living_work_materials`
CASCADEs on Work removal, so `relationship_sentence` — explicitly
member-authored, `NEVER_AUTHORED_BY_THE_SYSTEM`, *"the member's voice at the
crossing"* — is **destroyed by Remove Work**. That is member prose lost to an
act that promises to keep writing. It is the same shape as Finding B and it is
**out of this lane's scope**; recorded as **Finding D** for founder disposition.
⛔ It must not be repaired by copying the sentence into the ledger.

**Result: exactly one content-bearing column in v1, `work_name_at_act`.**

---

## A2 — Retained-lineage predicate, and which kinds count

R1's *"last expression ever carried"* is withdrawn: after a lawful erasure the
system is no longer authorized to remember that expression, so it cannot
truthfully answer what a Work "ever" carried — nor should it.

**Ratified principle:** *Work-scoped acts may be erased only when no other
retained lineage-bearing expression still requires them.*

### Enumeration — grounded in what survives, not preference

```
EXPRESSION KIND   SURVIVES WORK REMOVAL?   LINEAGE-BEARING?
manuscript        YES — member_manuscripts has no FK to a Work        YES
material          NO  — living_work_materials CASCADEs                NO
consideration     NO  — CASCADEs                                      NO
visual            NO  — CASCADEs                                      NO
```

⭐ **Only manuscripts are lineage-bearing, and that is a fact about the
schema, not a judgement.** Nothing that dies with the Work can later require
the Work's history. So:

```
erase work-scoped acts for W  ⟺  no RETAINED manuscript expression of W
                                  remains in the ledger
```

⛔ **This enumeration is conditional and must be re-opened if any expression
kind ever survives Work removal.** Recorded as a schema law, to be carried in
the migration's own comment so a future cascade change cannot silently
invalidate the predicate.

### The polymorphic-identity problem — dissolved, not solved

R1 was right that `material_declared` had no material identifier. But
`living_work_materials.material_id` is **TEXT, polymorphic** (and
`living_work_material_considerations` mirrors it *exactly*, deliberately, to
avoid two addressing schemes). Carrying that pair into the ledger would either
force `expression_ref` to TEXT — losing UUID typing for B — or create the third
addressing scheme the existing tables refuse.

⭐ **Not needed.** Materials are not lineage-bearing, so the erasure predicate
never asks about them. And with `member_note` removed, `material_declared`
carries **no member content and no identifier** — only that a material was
declared to W at T. Nothing in it is erasable, because nothing in it is
content.

⚠️ This matches the existing surface, which already says *"Placed something in
X"* — `studioHistory.ts` never named the material.

---

## A3 — Capability boundary: scope is not authority

R1's `SET LOCAL` answers *what may be erased*, never *who may declare it*. If
the application role can both set the GUC and DELETE, any future SQL path
manufactures its own erasure authority.

```
ROLE                       UPDATE ledger   DELETE ledger
ordinary application role  ⛔ DENIED (grant)  ⛔ DENIED (grant)
erasure capability         ⛔ DENIED          ✅ permitted, in scope only
```

Two independent gates, both required:

1. **Grant boundary** — the app role holds `SELECT, INSERT` only. `DELETE` and
   `UPDATE` are not granted. This is the *authority* gate and it is not
   bypassable from application SQL.
2. **Trigger boundary** — the erasure capability declares
   `SET LOCAL app.erasure_expression = '<uuid>'`; the trigger refuses any
   DELETE without a declared scope, or of a row outside it. This is the
   *scope* gate.

Implementable as a narrowly granted `SECURITY DEFINER` function owned by a role
that holds DELETE. ⛔ The function must take the manuscript id as its argument
and compute the lawful row set itself — it must never accept a caller-supplied
row list, which would move scope determination back outside the boundary.

⛔ UPDATE is refused unconditionally at both gates. There is no lawful update
to a recorded act.

⚠️ **Ordering obligation (carried from R1 §6):** ledger deletion executes in
the **same transaction** as the manuscript erasure that authorizes it.

---

## A4 — B reads the removal-time name

R1's derivation returned `expression_declared.work_name_at_act`, which fails
this lawful chronology:

```
work_named "First Name" → expression M declared → work_renamed "Final Name"
→ work_removed
```

The member removed a Work they knew as **Final Name**. R1 would have shown
*From "First Name"*.

**Amended derivation:**

```
relationship        expression_declared(expression_ref = M, kind='manuscript')
cessation           work_removed(W)
recognition name    work_removed(W).work_name_at_act
                    ( = the latest lawful naming act at or before removal,
                      snapshotted at the moment of removal )
```

```
b-rule 1  not consulted when member_manuscripts.title IS NOT NULL      (RW-B4)
b-rule 2  not consulted while the manuscript is in a current Work
b-rule 3  no work_removed act, or a NULL name → NO lineage · never invented (b5)
b-rule 4  surface marks it as prior context, never as the title        (RW-B3)
b-rule 5  writes nothing to member_manuscripts                         (RW-B1)
```

⭐ **The falsifier the founder named, adopted as b7 — it is the one test that
proves B and C share a ledger without collapsing:**

```
declare under X · rename to Y · remove
  B shows                              From "Y"
  the expression_declared act retains  X
```

⛔ A future "simplification" that reads one name for both fails b7.

---

## A5 — `recording_basis`

```
recording_basis  TEXT NOT NULL   -- 'at_act' | 'cutover_reconstruction'
```

Inert, not content. `recorded_at` says *when* the row entered the ledger;
`recording_basis` says *why we are entitled to assert it*. An act written
synchronously and one reconstructed from surviving evidence have different
epistemic provenance even when both are true.

⛔ No surface may present a `cutover_reconstruction` act as carrying act-time
context it does not have. Under A6, such rows have `work_name_at_act IS NULL`
by construction, so *"Began a Work"* is the honest rendering — a truthful loss
of ungrounded decoration, not the disappearance of an act.

---

## A6 — Cutover: epistemics (ratified) and activation (answered)

### Grounded partial reconstruction

```
pre-ledger work_begun          work_ref ✅ · occurred_at ✅ (living_works.created_at)
                               work_name_at_act ⛔ NULL — current title is not
                                                 evidence of title-at-act
pre-ledger expression_declared work_ref ✅ · expression_ref ✅
                               occurred_at ✅ (declared_at) · name ⛔ NULL
pre-ledger material_declared   work_ref ✅ · occurred_at ✅ (declared_at)
pre-ledger work_removed        ⛔ UNRECONSTRUCTABLE — no evidence survives
```

⛔ **Already-removed Works are permanently unrecoverable**, and with them B's
lineage for any writing whose Work is already gone — including the witness
manuscript. b6 stands: B's acceptance subject must be removed *after* activation.

### ⭐ Zero-gap activation — writer first, reconstruct behind a watermark

**The guarantee: the native writer is live BEFORE the reconstruction runs, and
the reconstruction is bounded strictly below the writer's activation
timestamp.** No eligible act can escape both, because the two windows abut with
no gap and no overlap:

```
RELEASE 1   migration (table, grants, trigger) + native writer, live at D
              → every eligible act from D onward is written natively
RELEASE 2   reconstruction, authorized separately, bounded to legacy rows
              with source timestamp < D, recording_basis='cutover_reconstruction'

acts at t < D   reconstructed (their legacy row exists and is < D)
acts at t ≥ D   written natively
boundary        strict: reconstruction uses < D, writer covers ≥ D
```

⛔ **This makes it two releases, not one.** The migration ships with the writer;
the reconstruction is its own founder-authorized act. A reconstruction that ran
first would leave exactly the gap the founder named.

**Two obligations that make the guarantee real:**

1. ⛔ **Same-transaction writes.** Each native act is written in the same
   transaction as the state change it records (`work_begun` with the
   `living_works` INSERT, `work_removed` with the DELETE). A separate write
   could fail after D and be covered by neither side — the gap, reintroduced.
2. ⛔ **Idempotent reconstruction.** A partial unique index over
   `(kind, work_ref, expression_ref, occurred_at) WHERE
   recording_basis = 'cutover_reconstruction'` so a re-run cannot double-write.
   It is scoped to reconstruction only — genuine repeated acts (two renames at
   the same instant) must remain recordable.

**Between R1 and R2, no permanent mutable-legacy union.** C reads the ledger
alone after Release 2. In the window between releases, C's three ledger-backed
kinds would show only post-D acts; ⚠️ **the release window is therefore a
period of visibly incomplete history**, which is honest but should be a
deliberate founder choice rather than a surprise.

---

## A7 — Table, as amended

```sql
member_studio_acts
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid()
  member_id        UUID NOT NULL REFERENCES members(id) ON DELETE RESTRICT
  kind             TEXT NOT NULL                    -- CHECK: closed vocabulary
  occurred_at      TIMESTAMPTZ NOT NULL             -- act time, supplied
  recorded_at      TIMESTAMPTZ NOT NULL DEFAULT now()
  recording_basis  TEXT NOT NULL                    -- CHECK: at_act |
                                                    --   cutover_reconstruction

  work_ref         UUID                             -- ⛔ NO FK (RW-C4)
  expression_ref   UUID                             -- manuscripts only
  expression_kind  TEXT                             -- inert vocabulary

  work_name_at_act TEXT                             -- ⚠️ THE ONLY MEMBER CONTENT
```

```
KIND                   REQUIRED                          work_name_at_act
work_begun             work_ref                          ⛔ must be NULL (D-16)
work_named             work_ref                          permitted
work_renamed           work_ref                          permitted
work_removed           work_ref                          permitted  ← B reads this
expression_declared    work_ref, expression_ref,          permitted
                       expression_kind
expression_withdrawn   work_ref, expression_ref,          permitted
                       expression_kind
material_declared      work_ref, expression_kind          ⛔ must be NULL
```

⛔ Every column not listed for a kind is NULL by CHECK. `work_begun` carries no
name because at creation there may be none — naming is a separate act (D-16).

---

## A8 — Acceptance contracts

```
B — RECOGNITION
b1  manuscript retained after Work removal is member-recognizable
b2  member_manuscripts.title UNCHANGED across removal (still NULL)
b3  surface marks the name as prior context, never as the title
b4  a member title act sets the title and it takes primacy thereafter
b5  no work_removed act or NULL name → no lineage, no invention
b6  subject is a Work removed AFTER activation (RW-C6)
b7  ⭐ declare under X · rename to Y · remove → B shows "Y",
       expression_declared still retains "X"

C — HISTORICAL INTEGRITY
c1  every act visible before removal is still visible after it
c2  each act's work title is the title AS AT the act, across a rename
c3  "removed the Work" appears as its own act
c4  no surface derives current existence from a historical act
c5  history is unchanged by a rename of anything
c6  a cutover_reconstruction act renders without fabricated act-time context

E — ERASURE (RW-C5)
e1  Delete Work and writing leaves NO ledger row naming that manuscript
e2  no content-bearing tombstone survives
e3  a Work with a second retained manuscript KEEPS its work-scoped acts
e4  UPDATE refused unconditionally, at grant AND trigger
e5  DELETE by the ordinary app role refused by grant, scope or not
e6  DELETE outside a declared scope refused by trigger
e7  erasure and ledger deletion are one transaction

X — CUTOVER
x1  an act occurring during the release window is written exactly once
x2  reconstruction re-run creates no duplicate row
x3  reconstruction writes no work_name_at_act
```

---

## A9 — Standing

```
AMENDMENTS 1-6            ANSWERED IN THIS REVISION
new: Finding D            material relationship_sentence destroyed by removal
                          — separate lane, do NOT repair via the ledger
new: two-release cutover  Release 1 writer+migration · Release 2 reconstruction
open for ruling           the release window is visibly incomplete history —
                          deliberate choice, not a surprise

MIGRATION · BUILD · MERGE · DEPLOY   NOT AUTHORIZED
Finding A                            SEPARATE
witness manuscript                   UNTOUCHED
copy correction                      HOLD
```
