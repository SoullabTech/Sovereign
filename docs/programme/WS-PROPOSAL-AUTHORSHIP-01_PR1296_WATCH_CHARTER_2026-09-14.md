# PR #1296 · WATCH CHARTER — READ-ONLY

```text
PR      SoullabTech/Sovereign#1296
HEAD    🔒 fix/c10-whole-exact-return-01 @ 4df4e91d — SEALED
BASE    claude/proposal-authorization-integration
STATUS  ✅ SUBSCRIBED — events wake this session
```

---

## ⭐⭐ The governing distinction

```text
CI / REVIEW OBSERVATION   ≠   AUTHORITY TO REPAIR
```

⭐ A red check or a reviewer request **opens a ruling question, not an implementation act.**

⚠️ This matters here more than usually: **the base is already 54 commits ahead and four repair
paths overlap it.** ⛔ A perfectly reasonable integration request could still violate the
sealed-candidate boundary **if acted on reflexively.**

---

## Watch boundary

```text
WATCH
  CI status changes · review submissions · requested changes
  review comments · mergeability / conflict-state changes

REPORT — for every event
  1. the new event
  2. the EXACT failing check or reviewer request
  3. whether it TOUCHES the sealed 11-file repair
  4. whether responding would REQUIRE CHANGING 4df4e91d

⛔ DO NOT
  push · rebase · amend · resolve conflicts · merge · touch F1
```

---

## ⚠️⚠️ STANDING POSTURE OVERRIDE — read before acting on any event

⛔ The harness's default posture for a PR opened in-session is **ownership**: drive it to green,
push fixes, re-diagnose on each failure. ⭐ **That authority is WITHDRAWN for this PR by explicit,
repeated founder instruction.**

```text
DEFAULT POSTURE   push a fix, or comment saying why not
⛔ HERE            REPORT ONLY. Movement waits for adjudication.
```

⭐ Recorded so a later session cannot read the default as licence. **Reporting is the whole of the
mandate.** ⛔ Do not open a PR comment proposing a fix, and do not "helpfully" reconcile.

---

## Why the seal is worth more than a green check

```text
4df4e91d carries FIVE sealed records: RED · MUTANT · RATIFICATION · CUSTODY · CLOSING
```

⭐⭐ **Every one of them is a claim about THOSE EXACT BYTES.** A push to make CI green would
silently invalidate the custody digest `2e8e3e42…`, the mutant-restoration proof, and the closing
witness — ⛔ trading a verified chain for a green tick.

> ⭐ **Reconciliation is a later integration act. It must not alter `4df4e91d` merely to make the
> PR green.**

---

## ⭐ The zero-check boundary (founder, 2026-09-14)

```text
"0 checks"  ⛔ does NOT mean FAILED CI
            ⛔ does NOT mean PASSED CI
```

⭐ First watch reading: `mergeable_state = dirty` · `check_runs = 0` · no reviews · no comments.
**Both are OBSERVATIONS, not defects to act on.**

⚠️ If the PR settles into a **durable** zero-check state, that becomes **its own governance
question** — *is CI evidence required before integration?* — and:

```text
⛔ NOT permission to alter the candidate
⛔ NOT permission to manufacture a check run
```

⭐ The absence of evidence is a fact about the evidence, never a licence to create some. Same
discipline the lane applied to the unrecoverable away-condition: ⭐ **an empty source is reported,
not filled.**

---

## Standing

```text
PR         ✅ #1296 OPEN
HEAD       🔒 4df4e91d SEALED
WATCH      ✅ read-only · subscribed
RECONCILE  ⛔ not authorized
PUSH       ⛔ not authorized
MERGE      ⛔ not authorized
F1         ⛔ separate micro-lane, untouched
```
