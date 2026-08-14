# Relational Field governing documents — custody notice

## ⛔ PROPOSED — NOT YET BINDING

The documents landed alongside this notice carry **no binding authority**. They are
placed on the production lineage so that they have **repository custody** and can be
referenced, diffed, and read by a fresh clone. Custody is not ratification.

Governed set, landed by this notice:

| Ref | Document |
|---|---|
| A1 | `docs/design/relational-field/RELATIONAL_FIELD_R3_R6_DESIGN_2026-08-13.md` |
| A2 | `docs/design/relational-field/RF-R3_PROVENANCE_BOUNDARY_2026-08-13.md` |
| A4 | `docs/governance/RELATIONSHIP_ROOM_CONSTITUTION_RATIFICATION_BRIEF_2026-08-13.md` |
| A5 | `docs/canon/RELATIONSHIP_ROOM_CONSTITUTION.md` |

## Why this notice exists

**Founder ruling D-9, 2026-08-13:**

> No governing design document may bind implementation, ratification, or member
> experience while it exists only as an untracked working-tree artifact.
> **Existence is not custody.** A path seen by eleven agents is not repository
> history, and conversational ratification cannot make an uncustodied file
> reachable to a fresh clone.

Before this commit these four documents were **untracked** (`git status` → `??`) in a
single working tree. They were on no branch and in no commit. An eleven-invocation
design inquiry reasoned from them, and a set of founder rulings was issued against
them, while a fresh clone of this repository contained none of them.

## What this commit is, and is not

- ✅ **Is:** repository custody for four documents, rooted at production `22200f967`.
- ✅ **Is:** the exact content as authored, byte-reconstructed to its pre-ruling state
  so that the founder rulings apply as an auditable diff *against a committed
  referent*, per D-9 step 4 — not baked invisibly into the baseline.
- ⛔ **Is not:** ratification. Binding force begins only when a ratifying record points
  to repository-custodied content.
- ⛔ **Is not:** deployment authorization. **Building remains closed.** No runtime,
  schema, migration, or application code is touched by this lineage.
- ⛔ **Is not:** a merge of `feature/labtools-redesign`. Only the intended documents
  were brought onto the production lineage, from a clean worktree rooted at
  `22200f967`. No unrecorded lineage divergence is created.

## Lineage discipline

This branch is rooted at exactly `22200f967` — the deployed production SHA at the time
of writing, and the commit that introduced the rupture containment
(`fix(relational): contain inferred rupture state at write and at read`).

⛔ This branch carries **documentation only**. It must never be treated as a deploy
candidate, and landing it changes nothing about what is running.

## Reading order

1. This notice.
2. The four governing documents.
3. `inquiry/` — the design inquiry and its reconciliation, **non-authoritative
   evidence**, landed separately with its own provenance statement.
4. The ratification record, when one exists — it, and only it, confers binding force.
