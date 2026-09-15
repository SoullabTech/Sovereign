# `AIN-CONTEXT-01` · A6 — ACCEPTANCE RULING

**Date:** 2026-09-15 · **Founder ruling** · **Candidate:** `3d55c04`

```text
A6 ACCEPTANCE HOLD               ✅ LIFTED
A6 semantics                     ✅ ACCEPTED
FAST delivery                    ✅ WITNESSED
CORE delivery                    ✅ WITNESSED
getMaiaResponse threading        ✅ WITNESSED
project type gate                ✅ 229 vs baseline 239 · no regressions

DEEP primary delivery            ⛔ NOT PRESENT
DEEP exclusion                   ✅ EXPLICIT / ROUTED OUT
A6 universal/all-path coverage   ⛔ NOT CLAIMED
```

---

## 1. The ruling, and why the DEEP finding did not hold it

> The DEEP finding is not a reason to keep A6 acceptance held, because **the acceptance
> question was reach, and the witness answered it: FAST reaches; DEEP does not.** What
> would be illegitimate is calling A6 "complete across MAIA." That we will not do.

⭐ A6 is **accepted for FAST + CORE**. ⛔ DEEP primary is measured as absent and excluded.

⭐⭐ The distinction that made the lift possible: *a witness that reports non-delivery has
discharged its question.* Holding acceptance on it would have confused **an unanswered
question** with **an answer nobody wanted** — and would have created a standing incentive
to leave the DEEP measurement unmade.

⛔ **What acceptance does NOT mean.** It does not mean A6 is live (it is not), that MAIA
is truthful about depth on every path (DEEP primary is not), or that the DEEP divergence
is resolved (it is untouched). **A6 is accepted for the reach it earned, and for no more.**

---

## 2. Coverage, stated so it cannot drift

| Path | A6 | Basis |
| --- | --- | --- |
| FAST | ✅ DELIVERED | F1c at the wire: `depth=200 · represented=3 · absent=197` |
| CORE | ✅ DELIVERED | F1b 59/59 at `CORE_PROMPT_HISTORY_APERTURE` |
| DEEP repair path | ✅ carrier set | shared addenda channel; not exercised by a witness |
| **DEEP primary** | ⛔ **NOT DELIVERED** | F1c: 10 wire calls, none carried the block |

⛔ **`sessionMetadata.turnCount` is not counted as delivery.** It is declared in
`claudeConsciousnessService` and never read. A6 replaced a false value with a true one in
a field nobody consults — a write site, not a delivered signal.

---

## 3. What is authorized, and what is not

```text
acceptance hold       ✅ LIFTED
open PR               ✅ AUTHORIZED
merge                 ⛔ NOT YET AUTHORIZED
deploy                ⛔ NOT YET AUTHORIZED
DEEP repair           ⛔ NOT AUTHORIZED
```

> Let the PR checks run against the actual merge surface first.

---

## 4. ⚠️ Production record, corrected in the open

A deploy ran from the Mac Studio at the time of this ruling and targeted **`f190f8992`** —
identified by the deploy gate as the merge of **PR #1297**, ⛔ **not this branch.** The
running container verified at that same SHA.

Confirmed three ways, and then a fourth on the host itself:

```text
git merge-base --is-ancestor 3d55c04 f190f89   →  NO
lib/maia/continuity/sessionContinuity.ts       →  ABSENT from the deployed tree
deployed maiaService.ts                        →  still carries effectiveHistory.length + 1  ×3
docker exec maia-sovereign ls …sessionContinuity.ts  →  No such file — "A6 NOT IN THIS BUILD"
```

⭐ **A6 remains undeployed, and the record says so.** The deploy itself was correct in
every respect — gate, build, provenance, swap — it simply carried a branch A6 was never
merged into. ⚠️ Worth keeping: **`printenv GIT_COMMIT` proves which build is live, never
what is in it.** Deploy-path provenance and change-content provenance are different
questions, and only the first was ever verified by that command.

---

## 5. Standing

```text
A6                     ACCEPTED (FAST + CORE) · candidate 3d55c04
DEEP primary           EXCLUDED · measured · routed out · NOT REPAIRED
PR                     AUTHORIZED TO OPEN
Merge · deploy         NOT AUTHORIZED
Production             UNTOUCHED BY A6 (running f190f8992)
```
