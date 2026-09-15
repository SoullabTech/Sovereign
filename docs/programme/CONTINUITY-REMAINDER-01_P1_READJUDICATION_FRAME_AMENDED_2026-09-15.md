# `CONTINUITY-REMAINDER-01` · P1 RE-ADJUDICATION — AMENDED FRAME

**Date** 2026-09-15 · **Founder amendment.** ⭐ Supersedes §3 of
`…_ACT2_CLOSURE_AND_P1_READJUDICATION_2026-09-15.md`, which is **marked in place and kept
verbatim**. ⛔ No behavioural code · no repair · P1 unaltered · production `e57ca1baa`
untouched.

---

## 1 · ⭐ WHY THE EARLIER FRAME WAS AMENDED

The two-branch frame assumed the two rules must either **agree** or **conflict**. They may do
neither, because **they govern different objects**:

| rule | proposition |
| --- | --- |
| **opacity rule** | retrieval vocabulary is **not** evidence of *what object* is being remembered |
| **`HOP 1`** | retrieval vocabulary **may** be evidence that the member is *reaching backward at all* |

⭐ **Both propositions can be true.** ⛔ So "one of them must be revised" was not entailed, and
the earlier frame rested on a false dichotomy.

⭐⭐ **What ACT 2 measured, stated sharply:**

> **Retrieval vocabulary discriminates retrospective INTENT. It does not discriminate the
> retrospective REFERENT.**

At both P1 and W1 it successfully found the class *retrospective asks*. It failed at the
different task of deciding **which prior turn the member meant**.

---

## 2 · THE REVISED QUESTION

> **What evidentiary role may retrieval vocabulary legitimately play at `HOP 1`?**

1. May it establish that the member is making a **retrospective / deictic request**?
2. May it establish **which prior turn or remembered object** that request refers to?
3. If those are **different evidentiary jobs**, did P1 obtain its green by using evidence valid
   for the **first** job as though it were valid for the **second**?

The measured evidence already bears differently on them:

```text
retrospective-intent detection ..... ✅ supported
object identification .............. ❌ not supported by retrieval token
antecedent selection ............... ❌ not supported by token overlap alone
```

---

## 3 · ⭐⭐ THE DIAGNOSIS, RESTATED

⛔ **Not:** *`remember` is a forbidden token.*
⭐ **But:** ***`remember` was carrying authority beyond what it evidentially supports.***

That is what explains the otherwise strange symmetry ACT 2 found:

```text
P1   `remember` in the probe    → admitted the NAMING retrospective ask
W1   `mentioned` in the probe   → `remember` survived as a CARRIER from other retrospective asks
BOTH the mechanism reliably recognized "this conversation is about looking backward"
⛔ NEITHER did that vocabulary tell it WHAT the member was looking backward toward
```

⭐ And the ACT 2 finding that becomes central:

> **The bridge never recovered the original telling. It recovered a later failed request in
> which the member named the marker again.**

⛔ So P1's apparent success was **not** evidence that `HOP 1` resolved the original referent. It
was evidence that **a later query happened to restate the referent while sharing retrospective
vocabulary with another query.**

---

## 4 · TWO ADJUDICATIONS, ONE ACT

| | |
| --- | --- |
| **A · EVIDENTIARY CONTENT** | Retrieval words may legitimately indicate **retrospective / deictic intent**. |
| **B · INSTRUMENTAL USE** | Lexical overlap among retrospective asks does **not**, on present evidence, legitimately identify the **intended antecedent**. |

⭐⭐ **The rules need not conflict at all. The defect can reside in the INSTRUMENT assigning one
signal two jobs.**

⛔ **This still does not authorize a repair.** It only makes the question that precedes repair
**correct**.

### 4.1 The sentence carried into the re-adjudication

> ⭐⭐ **ACT 2 shows that retrieval vocabulary is evidence of reaching back, but not evidence of
> what is being reached for. P1 treated the former as though it supplied the latter.**

---

## 5 · ⚠️ ONE CONSEQUENCE, OFFERED AS INPUT — ⛔ NOT AN ANSWER

If **A** is ratified, the caller has **already** established job 1 before `HOP 1` runs.
`recoverForTier` enters the bridge only inside
`if (isOpaqueRetrospectiveRequest(args.utterance, candidates))`, so by the time
`recoverViaBridge` executes, *"is the member reaching backward?"* is a **precondition, not a
discovery**.

⚠️ `HOP 1` is not therefore redundant — it asks job 1 at a **finer grain**: *is THIS PREFIX TURN
also a reaching-back gesture?* And the measurement says it answers that **well**: in both runs
it admitted **exactly the retrospective asks present in the prefix, and nothing else**.

⭐⭐ **Which locates the error exactly: `HOP 1` validly establishes CLASS MEMBERSHIP — "these
prefix turns are also retrospective asks" — and the mechanism treats class membership as
ANTECEDENT IDENTITY.** ⛔ Its entire contribution beyond its caller's is on the job the evidence
does not support.

⚠️ **And a place where the missing job is not merely under-supported but never asked.** Both
runs had **two** admitted retrospective asks. `recoverViaBridge` performs **no ranking between
hops** (ACT 1 §1) — every admitted hop's candidates are merged into one flat map and `HOP 2`
carrier counts decide. ⛔ So *"which antecedent did the member mean?"* is not answered badly at
the merge; **it is not posed there at all.**

⛔ Offered so the ruling can see where B would bite. ⛔ Nothing here is acted on, and ⛔ no
instrument is proposed.

---

## 6 · STANDING

```text
frame ............................ ⭐ AMENDED · earlier two-branch frame SUPERSEDED IN PLACE
revised question ................. ✅ FRAMED (§2)
adjudication A / B ............... ✅ SEPARATED (§4)
carried sentence ................. ✅ RECORDED (§4.1)
rules-in-conflict claim .......... ⛔ WITHDRAWN — not entailed
P1 re-adjudication ............... ⛔ NOT OPENED
behavioural repair ............... ⛔ NOT AUTHORIZED — follows the ruling, never precedes it
tie-break rule ................... ⛔ NOT INTRODUCED
ACT 3 falsifiers ................. ⛔ NOT AUTHORED
first-ask opaque memory .......... ⛔ UNOPENED · PRESERVED · separate lane
rollback primitive ............... ⛔ OUT OF SCOPE — DEPLOY-ROLLBACK-INTEGRITY-01
deployment ....................... ⛔ NOT AUTHORIZED
production ....................... e57ca1baa · UNTOUCHED
```
