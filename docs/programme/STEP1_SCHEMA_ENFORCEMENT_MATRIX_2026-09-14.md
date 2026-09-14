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
| 11 | a chain cannot acquire a second locus | ✓ | **trigger** | ⚠️ **SUPERSEDED BY ADDENDUM 1** — this row scoped the trigger to the locus columns, and that scoping was the merge blocker. The whole chain row is immutable. |
| 12 | a ruling is not wording or authority | ✓ | **absence + no cascade** | The chain holds a bare reference; no path exists from a ruling into a version. ⚠️ See addendum 1 — the essential fact is *no cascade or ownership path*, not *no foreign key*. |
| 13 | a rationale is ABSENT or AUTHORED | ✓ | **CHECK** | Added by addendum 1. Without it, `''` is a third durable state the contract has no word for. |

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

## Addendum 1 — founder review, 2026-09-14 (merge blocker)

⛔ **The review held the merge on one defect: `proposal_chains` was mutable.**
The trigger froze the five locus columns and left two rewrites open:

```
UPDATE proposal_chains SET member_id         = <someone else>
UPDATE proposal_chains SET decision_chain_id = <another ruling, or NULL>
```

⭐⭐ **The first is severe.** `proposal_versions.author = 'member'` does not name
an individual — the person is `proposal_chains.member_id`. So Kelly could author
v2 and the chain could afterwards be rewritten to belong to someone else, with
the durable record reading as though it always had. That is the exact provenance
property Step 1 exists to establish, defeated one level above the versions the
witness was busy proving.

⚠️ **And the witness did not catch it — it asserted the second rewrite AS A
FEATURE** (`9b · but a ruling may come to govern a chain`). That sentence was
invented ontology: it appears in neither the contract nor the census, both of
which say *the chain does not evolve; only its versions do.* **The instrument
was pinning the defect.** The assertion is deleted, not weakened.

⭐ **The repair is one word wider, not one object bigger.** The chain trigger
now refuses `BEFORE UPDATE OR DELETE` for the whole row, following the
append-only pattern of `editorial_decision_events`. `proposal_versions.chain_id`
also moves `CASCADE → RESTRICT`, so if that trigger is ever dropped the delete
still cannot take authored formulations with it.

### The four corrections

```
1  the chain is immutable after INSERT — every column, plus DELETE
2  `rationale` is nonblank-or-NULL (CHECK), so '' is not a third durable state
3  `created_at` → `authored_at`, carrying the contract's `authoredAt` name
4  fact 10 softened: the essential property is NO CASCADE OR OWNERSHIP PATH
```

**On (3) — `authoredAt` ⇄ `authored_at`.** They are the same fact, and the
column carries the contract's name rather than being mapped to one.
`DEFAULT now()` is correct because a version is persisted *at* the authoring
act: there is no draft-then-save step for a formulation, so persistence time
and authorship time coincide by construction. ⛔ **It is provenance, never
ordering authority** — `supersedes` owns order, and the pure tests prove a chain
whose timestamps disagree with its succession is still ordered by its
succession.

**On (4).** The earlier text claimed "no FK on `decision_chain_id`" *was*
acceptance fact 10. A `RESTRICT` / `NO ACTION` foreign key does not let a
ruling's deletion reach into a writer's wording; it only prevents the
referenced row from disappearing. A bare `uuid` is chosen here solely because
the decision substrate has no single-row chain identity to reference — ⛔ not
because foreign keys are dangerous. The witness now asserts the property (no
cascading delete rule into the column, no ruling reference on any version)
rather than today's implementation of it.

---

## The run of record — 2026-09-14, disposable cluster

```
witness      scripts/witness/step1-succession-schema-witness.sh
             23 passed · 0 failed

falsifiers   scripts/witness/step1-succession-schema-mutations.sh
             9 killed · 0 survived

pure         __tests__/proposalSuccession.test.ts
             31 passed · 0 failed
```

⭐ **`M8 · chain immutability reverts to locus-only` — the merge blocker itself,
run as a mutation — is killed by `9b`, `9c`, `9d`, `9e` and `9f`, and by none of
the locus tests.** That asymmetry is the evidence the new obligations test the
new property rather than restating the old one.

⛔ **`M9`** (the rationale CHECK removed) is killed by `12a` and `12b`.

⚠️ The falsification harness reports a **no-op mutation** as a survivor, not a
kill. Three no-op mutations were written in this programme before anyone
noticed; a mutation that changes no behaviour is a green light with nothing
behind it.

---

## Standing

```
matrix          COMPLETE (+ addendum 1)
migration       AUTHORED — database/migrations/20260914000001_proposal_succession.sql
witness         RUN — 23 passed · 0 failed, disposable cluster
falsifiers      RUN — 9 killed · 0 survived
merge           ⛔ HELD — founder act
integration     OUT OF SCOPE — no route, UI, generation path or manuscript write
production      UNTOUCHED — ⛔ this migration has NOT been applied anywhere real
```
