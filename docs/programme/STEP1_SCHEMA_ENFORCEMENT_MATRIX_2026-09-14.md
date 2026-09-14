# Step 1 · schema lane — the enforcement matrix

**Lane** `claude/proposal-succession-schema`, based on `caace37cd`.
**Status** MATRIX. ⛔ Written before the first `CREATE TABLE`, as ruled.

> **This lane persists authored proposal succession. It does not connect
> succession to generation, conversation, authorization, or execution. Passing
> the lane proves that staged formulations can survive durably with truthful
> authorship and succession. Nothing more.**

---

## The decision, per invariant

| # | invariant | contract | enforcement | why this layer |
|---|---|---|---|---|
| 1 | version has explicit author | ✓ | **CHECK + NOT NULL** | A closed two-value vocabulary is exactly what a `CHECK` is for. |
| 2 | predecessor is in the same chain | ✓ | **composite FK** | `FK (chain_id, supersedes) → (chain_id, id)` makes a cross-chain predecessor *unrepresentable*, not merely refused. |
| 3 | no self-predecessor | ✓ | **CHECK** | `supersedes <> id`, declarative and total. |
| 4 | no branch | ✓ | **partial UNIQUE index** | `(chain_id, supersedes) WHERE supersedes IS NOT NULL` — one successor per predecessor. |
| 5 | single root | ✓ | **partial UNIQUE index** | `(chain_id) WHERE supersedes IS NULL` — exactly one version supersedes nothing. |
| 6 | **no cycle** | ✓ | ⭐⭐ **falls out of #2** | see below |
| 7 | an authored version is immutable | ✓ | **trigger** | No declarative form exists; the project's append-only trigger pattern already does this on `editorial_decision_events`. |
| 8 | head is derived | ✓ | **absence** | There is no `is_head` column to fall out of step. |
| 9 | `superseded_by` is derived | ✓ | ⛔ **MUST NOT STORE** | Absence is the enforcement. |
| 10 | a version carries no locus | ✓ | **absence** | No target, expected text or base version column exists on the version. |
| 11 | a chain cannot acquire a second locus | ✓ | **trigger** | Locus columns are immutable after insert. |
| 12 | a ruling is not wording or authority | ✓ | **absence + no cascade** | The chain holds a bare reference; no path exists from a ruling into a version. |

## ⭐⭐ #6 · the cycle check needs no trigger, and that is worth saying plainly

The founder's instruction was *"determine the right enforcement layer rather
than prejudge it"*, and warned against manufacturing heroic SQL to make the
matrix green. A recursive cycle-detection trigger is the obvious move and it is
**unnecessary**:

```
the self-referencing FK (#2) is NOT DEFERRABLE
      ↓
a row may not name a predecessor that does not yet exist
      ↓
the first member of any cycle can never be inserted
```

For `v3 → v4` and `v4 → v3`: inserting `v3` requires `v4` to exist; inserting
`v4` requires `v3` to exist. Neither can go first. The same argument holds for a
cycle of any length. ⛔ **So the enforcement is "do not make that FK
deferrable"** — and the witness must prove the property rather than trusting
this reasoning.

⚠️ A `DEFERRABLE INITIALLY DEFERRED` FK would silently reopen this. Recorded as
the thing not to "improve" later.

## ⚠️ Deliberately NOT enforced in SQL

```
contiguity of a version index      there is no index; succession is by predecessor
consecutive-same-author refusal    NOT AN INVARIANT — two formulations from one
                                   author are two formulations, not an overwrite
head must be the authorized one    a writer may authorize v3 after abandoning v4;
                                   that is step 2's object, not this lane's
```

## ⚠️ No foreign keys on the locus, and this follows precedent

`manuscript_revision_proposals` carries `work_id`, `draft_id` and
`target_section_id` as bare `uuid NOT NULL` with **no** `REFERENCES`. That is
deliberate upstream: draft sections are created and destroyed by structure
operations, so an FK there would make authored history hostage to a topology
change. ⛔ This lane follows that precedent exactly rather than inventing a
stricter one that would delete a writer's formulations when a section is split.

## The acceptance bar (founder, verbatim)

```
 1  MAIA v1 → Kelly v2 → MAIA v3 → Kelly v4 persists, losing no formulation or author
 2  two consecutive MAIA, or two consecutive member, versions are legal
 3  a predecessor from another chain refuses
 4  a self-reference refuses
 5  a branch refuses
 6  a cycle refuses
 7  an existing version cannot have author/formulation/predecessor rewritten
 8  the head is derivable with no stored head flag
 9  a chain cannot silently acquire a second locus
10  altering or deleting a governing ruling cannot turn it into wording or authority
11  nothing here makes a proposal capable of changing manuscript state
```

⭐ And, carried from `caace37cd`: **the fixtures include non-alternating
authorship**, so a broken implementation cannot infer author from sequence
position and still look correct.

---

## Standing

```
matrix          COMPLETE
migration       NOT AUTHORED
witness         NOT RUN
integration     OUT OF SCOPE — no route, UI, generation path or manuscript write
production      UNTOUCHED
```
