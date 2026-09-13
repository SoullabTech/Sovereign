# JOP-04 · RB-6A — Host-Boundary Closure · Real IPC Witness

**Run:** 2026-09-13, founder-executed, real JARVIS Electron renderer → preload →
`ipcMain('jarvis:submit-task')` → router → execution path, Mac Studio.

⭐ **RB-6A CLOSED AT THE HOST BOUNDARY.** 🔴 **RB-6B Condition B CONFIRMED by real-IPC witness.**

```text
SUBJECT               3f25932b578732ca3068af1dd594f9ebdb68efd6
JUDGE                 795a0270c81ddbb2792b7097a0f2d96fd9737841
FROZEN APPARATUS      commit 8b9b7d7f40a8d0cb99902e74bf132d539e733196
                      sha256 55a579ed8f5e3a128fd27fd8a21b64a3f4db87b79e97d5f8c3820f093ba51b59
HOST BUILD STAMP      3f25932b5
BOUND SUBSTRATE       /private/tmp/jop04-reconciled · HEAD 3f25932b5 · dirty=false
WITNESS JSON sha256   754a39cf13eb95c7f769fa262740a22dbc87d81f6c94daac13e90e3f64b5302d
```

⭐ **The apparatus was never edited** — same commit and hash as when it was frozen before the
pre-repair run. Before and after are measured by one instrument.

---

## 1 · CONTROL — RB-6A's negative arm at the real boundary ✅

```text
registered capability   git.rev_parse
routing declaration     ABSENT
→ execution_lane        null
→ status                refused_not_routable
→ executed              false
```

Host reason, in the subject's own words:

> *"Registration identifies an instrument; it does not grant routing."*

⭐ **`registered ∧ ¬routable` now exists in the running host**, not merely inside a test composition.

## 2 · ARM A — RB-6A positive arm ✅ **and** Condition B 🔴, in one result

```text
routing: { satisfied: true, basis: 'operator_submission' }

p1_route_was_legitimate              true
p2_no_independent_host_decision      true
p3_execution_nevertheless_occurred   true

execution_lane   C0
status           completed
stdout           3f25932b578732ca3068af1dd594f9ebdb68efd6
```

⭐ **The stdout is the subject SHA.** `git.rev_parse` returned the identity of the checkout it ran
against — **the result self-authenticates the subject.** A witness whose output *is* the thing being
witnessed cannot have been produced against the wrong tree.

**The production composition, now witnessed rather than inferred:**

```text
registered → legitimate routing eligibility → C0
  → NO independent host execution decision → runCapability → EXECUTES
```

## 3 · Both conclusions, host-witnessed

```text
RB-6A HOST-BOUNDARY ACCEPTANCE   ✅ GREEN · RE-CLOSED
    registered + no eligibility         → not routable
    registered + legitimate eligibility → routable

RB-6B CONDITION B                🔴 RED · CONFIRMED
    routable → still executable without separately
               constituted host execution authority
```

⭐ **RB-6A is no longer merely logically correct or instrument-correct. Its discriminating pair
exists in the actual running host.**

## 4 · Arms B and C stayed truthful

```text
ARM B — constituted host decision   UNINSTANTIATED
ARM C — caller counterfeit          UNINSTANTIATED
```

⛔ **Nothing was fabricated to make the witness look more complete.** That preserves the next design
problem honestly — and Arm C remains the concrete RB-F5 specimen-in-waiting.

## 5 · Host-side effects — and ⭐ a new finding

```text
events lines   93329 → 93329       runs count   82 → 82
sha256 before  3adcdc4ff785b7c1df41c4f6181c9fc8ce10dce48dbdc49796bdd2050f5932b4
sha256 after   3adcdc4ff785b7c1df41c4f6181c9fc8ce10dce48dbdc49796bdd2050f5932b4
```

Subject worktree clean before and after.

⭐⭐ **A capability EXECUTED and the host ledger is byte-identical.** This upgrades C1's eleven-question
finding: `RECEIPT` was recorded **PARTIAL** on the strength of `appendEvent` / `EVENTS_LOG` existing.
The host witness now shows those belong to the **work-unit lane** (`runWorkUnit`), not to
`jarvis:submit-task`.

> **The lane that executes is the lane that records nothing.**

⛔ Not a new defect and **not in RB-6B's scope** — recorded so `RECEIPT` is not later read as
partially satisfied on the executing path. It is closer to **ABSENT** there.

## 6 · Frozen state

```text
RB-6A
  logical boundary                  CLOSED
  identity-lineage reconciliation   CLOSED
  real IPC negative arm             GREEN
  real IPC positive arm             GREEN
  STATUS                            ⭐ CLOSED AT HOST BOUNDARY

RB-6 CONDITION A   registration → routing grant    DEFEATED
RB-6 CONDITION B   routing → execution grant       🔴 ACTIVE · REAL-IPC WITNESSED

RB-F3 · RB-F6 · CAL-3a · RB-F4     RED (reached preconditions)
ARM B · ARM C / concrete RB-F5     UNINSTANTIATED
RB-6 EMBARGO                       ACTIVE

RB-6B repair                       NOT BEGUN
execution-authority design         NOT BEGUN
```

> **A legitimate route reaches C0 in the real host, and C0 executes even though no independent host
> execution decision exists.**

That sentence is now runtime evidence, not inference — which is the evidence boundary the whole
apparatus was built to reach.
