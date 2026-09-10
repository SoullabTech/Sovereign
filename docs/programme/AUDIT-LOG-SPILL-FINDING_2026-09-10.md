# Finding · acceptance apparatus writes into repository-tracked evidence

```text
FOUND       2026-09-10, while freezing the Focus witness candidate
CLASS       repository-governance finding
OWNER       ⛔ NOT this lane — the lane that owns the develop-refusal ledger
STATUS      RECORDED · NOT REPAIRED
BLOCKS      nothing · the frozen candidate cbbb53dc6 is clean
```

---

## What happened

`git add -A` on the reconciliation branch committed
`audit-logs/develop-refusals/refusals-2026-09-09.jsonl` — four rows, dated
`2026-09-09T11:xx`, **tracked on no other ref**: not `clean-main-no-secrets`, not
the candidate `4abc86d3d`, not `2de1b421`, not `claude/s3-implementation`.

It was untracked runtime output sitting in the working tree, which carried across
a branch checkout and was committed **by breadth, not by intent**. Removed in
`6aeafcb73`; the rows remain recoverable from `14f705d08`.

---

## The mechanism

```text
witness / runtime executes
        ↓
appends refusal rows to audit-logs/develop-refusals/…
        ↓
that path is an ordinary, UNIGNORED repository path
        ↓
git add -A
        ↓
runtime evidence becomes authored repository history
```

⚠️ And the rows carry the **witness's own fixture manuscript id**, so the ledger
cannot distinguish a refusal that happened to a member from one manufactured by
an acceptance run.

---

## ⭐⭐ Why this is not a tidiness problem

It is the second instrument in two days to take authority over governed evidence,
**and it is the opposite direction of the first**:

```text
migration witness · focus assembler gate
    tried to DELETE governed receipt evidence, to leave tables tidy
    → refused by context_disclosure_receipt_governed_delete()

this
    MANUFACTURES evidence into the repository record, simply by running
    → refused by nothing
```

> **Acceptance apparatus must not gain authority to delete governed evidence for
> tidiness, nor gain authority to promote runtime-generated evidence into
> authored source, merely because a witness produced it.**

⭐ The deletion direction has a guard. The promotion direction has none.

---

## ⛔ What was deliberately NOT done

```text
.gitignore                  NOT edited
the ledger path             NOT relocated
refusal logging             NOT redesigned
```

Where those rows lawfully live — and whether that path may be repository-tracked
at all — belongs to the subsystem that owns the evidence, not to the Focus
witness lane that happened to trip over it.

---

## Standing

```text
FINDING            RECORDED
REPAIR             NOT AUTHORIZED · separate lane
CANDIDATE          cbbb53dc6 · clean · unaffected
FORENSIC PROVENANCE 14f705d08 — the accidental inclusion
                   ⛔ never a candidate
```
