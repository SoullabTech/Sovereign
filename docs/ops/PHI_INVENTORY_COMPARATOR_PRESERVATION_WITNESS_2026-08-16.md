# PHI Inventory Comparator — Preservation Witness

**Date:** 2026-08-16
**Instrument type:** preservation record (evidence custody), **not** a design and **not** an adoption
**Governing:** founder rulings 2026-08-16 — canonical PHI ruling
[`FOUNDER_RULING_PHI_INVENTORY_GATE_2026-08-16.md`](../governance/FOUNDER_RULING_PHI_INVENTORY_GATE_2026-08-16.md);
comparator disposition ruling, same date.

> ⛔ **This document adopts nothing.** The comparator described below has **no runtime authority**,
> is **not wired** to any gate, and is `AWAITING_LANE_CUSTODY`. Reading this is not being told to
> act. ⛔ It is not authorization to wire, rewrite, or ship the mechanism.

---

## §1 Standing (founder-ruled, verbatim)

```text
PHI comparator
class: PROVISIONAL
direct-policy proof: PASS for tested discrepancy class
real commit-path proof: FAIL
gate wiring: ABSENT / restored to HEAD
runtime authority: NONE
custody: AWAITING_LANE_CUSTODY
```

> **The failed real-path test is not a reason to discard the comparator; it is evidence about the
> comparator.**

---

## §2 ⚠️ What could and could not be preserved — read this before trusting §3

The preserve-before-repair rule requires capturing the failed implementation **before** modifying
it. **That sequence was not followed.** The `GIT_DIR` repair was applied immediately after the
real-path failure, before the preservation ruling existed.

Consequence, stated exactly:

| Artifact | Status |
|---|---|
| **Repaired candidate** | **REAL BYTES**, on disk, hashed below |
| **Failed candidate** | ⚠️ **RECONSTRUCTED, never captured.** Not recovered from storage |
| **Failure witness** | **REAL** — emitted by an actual `git commit`, quoted verbatim in §4 |

The reconstruction is exact *as an inverse of one known edit hunk* (§5), not as a retrieved
artifact. ⛔ **Do not cite its hash as a preserved baseline.** It is a derived object. If the
custodial lane needs a true baseline, the honest baseline is the **repaired candidate** plus the
**real failure witness** — those two are genuine.

---

## §3 Hashes

```text
REPAIRED CANDIDATE      (real bytes, on disk, unwired, untracked at time of writing)
  path    scripts/check-phi-inventory-ratchet.sh
  sha256  dbcd1b5759310b8c9a00a7db2ba031c76b0e7e035999dd5043a8b8050166204b
  bytes   7688

FAILED CANDIDATE        (RECONSTRUCTED — derived, not retrieved)
  sha256  f741d6cf4a6ae0bb851fde9eb57adde40029be3e70dc29b96f1ceed6480d3a44
  bytes   6888
```

---

## §4 Failure witness — real, emitted under an actual `git commit`

The commit was attempted; the hook ran; the commit was refused and **no commit object was created.**

```text
⛔ BLOCKED — safe no-regression mechanism not established for PHI inventory.
   Reason: could not create a worktree at HEAD

   Per founder ruling: the gate is NOT weakened and is NOT relocated to CI.
   Either repair the historical PHI debt so the full-repo gate is green,
   or design a trustworthy comparator under separate bounded work.
```

**Cause.** `git commit` exports `GIT_DIR` / `GIT_WORK_TREE` into the hook environment.
`git worktree add` inherits them and fails. The comparator **failed closed**, as ruled.

⭐ **The epistemic finding this episode exists to preserve:**

```text
DIRECT POLICY TEST PASSED
        ≠
PRE-COMMIT INTEGRATION PASSED
```

The direct test established behavior under **one aperture**. It did not establish behavior under
the hook environment. Acceptance for any successor **must include the actual `git commit`
invocation path**, not merely `bash .githooks/pre-commit`.

### 4.1 A second, earlier defect in the same instrument

Before the above, the comparator called `blocked()` from inside a **pipeline**. `exit` there
terminates only the subshell, so when neither tree emitted a parsable set the script continued with
two **empty** sets, computed `new = {}`, and reported **PASS** — a fail-**open** result from an
instrument built to enforce a fail-closed ruling. Caught by exercising the bootstrap case.

⭐ Standing lesson: **unmeasurable is not clean.** An empty result set and an unknown result set are
not the same value.

---

## §5 The single edit separating the two candidates

Repaired adds, immediately after `git write-tree` and before `commit-tree`:

```bash
unset GIT_DIR GIT_WORK_TREE GIT_INDEX_FILE GIT_PREFIX \
      GIT_OBJECT_DIRECTORY GIT_ALTERNATE_OBJECT_DIRECTORIES
```

Ordering is load-bearing: `write-tree` runs **with** the inherited environment (a hook may export
`GIT_INDEX_FILE`, and that is the index actually being committed); the unset happens **after**, so
only the worktree operations get a clean environment.

⚠️ The repaired candidate's `PASS` under a real commit is **NOT established.** It was restored out
of the live hook before any commit exercised it. Its real-path status is **UNTESTED**, which is a
different class from the failed candidate's **FAIL**.

---

## §6 What a custodial lane inherits

| Item | Class |
|---|---|
| Whole-state set-difference semantics (new / resolved / carried) | ruled — canonical record §2 |
| Feasibility: all checker inputs are tracked files | established |
| Stable identity across **all** emitted discrepancy classes | ⚠️ **PROVISIONAL** — verified only for `No accessor configured…` |
| Repaired candidate behavior under real `git commit` | **UNTESTED** |
| `practitioner_client_notes` accessor repair | `DISCOVERED / UNOWNED` |

The successor must be demonstrably a successor to the failed candidate — repair as a successor
state, never by erasing the state that taught us something.

---

## §7 Shared-checkout constraint (active)

The dispatcher execs `$top/.githooks/<hook>` from the **working tree**, so **an uncommitted hook
edit in a shared checkout is effectively live policy for every lane, without any commit.** During
this episode a concurrent lane was writing into this same checkout.

`.githooks/pre-commit` has been restored to `HEAD`; the PHI ratchet is **not wired**.

⛔ **Until lane ownership is isolated, no lane may make a working-tree gate change in this
checkout.**
