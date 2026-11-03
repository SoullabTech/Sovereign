# BRANCH-POLICY AUTHORITY — FINDING

**Date** 2026-09-13 · **Status** VALID · UNRESOLVED · ⛔ **OUTSIDE S3**
**Opened by** founder ruling, 2026-09-13 · ⛔ **no lane opened, no repair authorized**

---

## The defect class

⛔ **It is not *"`claude/*` isn't on the list."*** It is:

> ⭐⭐ **A committed governance rule was present but not AUTHORITATIVE in every
> execution environment — so a commit can appear policy-compliant merely because
> the enforcement mechanism was absent.**

⚠️ Structurally the same family as the 2026-09-07 finding that the production
branch accepted writes reporting `Bypassed rule violations … 4 of 4 required
status checks are expected`. **A rule that is only sometimes enforced is a rule
whose compliance record means nothing.**

---

## The observed conflict

```text
COMMITTED POLICY     scripts/check-branch-allowed.sh admits
                     main | clean-main-no-secrets | phase4.6-reflective-agentics
                     | feature/* | fix/* | chore/*
                     ⛔ claude/* is NOT admitted

SESSION CONVENTION   remote sessions are routinely ASSIGNED claude/* branches
                     as their designated development branch

REMOTE CONTAINER     hooks absent (core.hooksPath unset; .githooks present on
                     disk but not wired) → a forbidden branch ACCEPTS commits

LOCAL MAC            hooks present → the SAME branch is REFUSED
```

⭐ Both gates read the same file precisely so they cannot drift from each other.
**They did not drift. The environment did.**

---

## Two questions, and they must not be collapsed

```text
Q1  SHOULD claude/* be admissible at all?
Q2  However Q1 is answered, how is the branch law made AUTHORITATIVE
    across every execution environment?
```

⛔⛔ **Do not solve Q2 by adding `claude/*` to the shell script.** That answers
Q1 by side effect, silently, in the course of fixing something else — and hides
the question it answered.

---

## ⭐ INTERIM RULE — in force until the governance lane rules

> **Absence of the branch hook is never evidence of branch-policy compliance.**

Practically: a session that cannot verify the hook ran treats the allowlist as
binding anyway, and commits on an admitted branch.

---

## What actually happened here

Four S3 records (`b88807bf` · `4e0edd70` · `bff7e0b1` · `833ec87f`) were
committed on `claude/sleepy-turing-uqkqto` from a container with no hooks
installed. ⛔ Not deliberate; the effect is identical to a bypass.

⭐ **History is NOT rewritten.** The commits stand, the finding is recorded, and
the witnessed SHA `833ec87f` remains exactly what the S3-F8 witness names — a
rewrite would have invalidated the lane's own evidence to tidy a governance
record. Subsequent acts moved to `chore/*` under the interim rule.

---

## Standing

```text
FINDING              VALID · OUTSIDE S3 · UNRESOLVED
Q1 claude/* admissible?          OPEN
Q2 cross-environment authority?  OPEN
INTERIM RULE         IN FORCE
HISTORY              PRESERVED · not rewritten
REPAIR               ⛔ NOT AUTHORIZED
```
