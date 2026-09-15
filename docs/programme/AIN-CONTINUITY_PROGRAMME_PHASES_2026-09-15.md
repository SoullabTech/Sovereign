# AIN CONTINUITY PROGRAMME — PHASES AND SEQUENCING

**Status**: ⛔ **PROGRAMME SHAPE, RECORDED. NOT AN OPEN LANE. NO ACT AUTHORIZED BY THIS DOCUMENT.**
**Date**: 2026-09-15 · **Source**: founder act following the closure of `AIN-CONTEXT-01` at `84c66e8`
**Authority marking**: **[F]** founder-authored · **[J]** Jarvis-added

⚠️ This document exists because `AIN-CONTEXT-01` closed with its laws recorded and its serving
behaviour unresolved. It records **what must happen next and in what order**. ⛔ Per **R8**, nothing
here opens by reference: each step needs its own explicit opening act.

---

## THE THREE PHASES **[F]**

```
PHASE I — TRUTHFUL APERTURE
MAIA knows where she is and what she currently does not have.

PHASE II — RECOVERABLE CONTINUITY
MAIA can retrieve relevant earlier material from the live relationship
without relying on the member to reconstruct it.

PHASE III — DEVELOPMENTAL CONTINUITY
MAIA can recognize processes through time:
"We have been here before, but not quite like this."
```

### ⛔ THE SEQUENCING PROHIBITION **[F]**

> *"The critical thing is not to jump straight to Phase III because that is where the exciting
> Spiralogic work is. **If the recovery and standing layers beneath it are weak, Spiralogic will
> simply give sophisticated language to distorted continuity.**"*

⭐ **[J] That sentence is the programme's load-bearing constraint** and it is falsifiable rather
than cautionary: Phase III's output is a *claim about the member's development*. Built on a Phase II
that resurfaces stale or rejected material, its effect is not a weaker product — it is **a confident
developmental narrative assembled from material the member already corrected.** ⚠️ Phase III makes
Phase II's defects *more* costly, not less visible.

> ⛔ **And not by raising the cap** **[F]**: *"do not solve this by raising the 100-message cap
> again… the lane has already demonstrated that it only moves the wall."* See `AIN-CONTEXT-01`
> lane-state §10.2 — the cap was already raised 30 → 100 for this exact reason.

---

## THE FIVE STEPS **[F]**

| # | Step | Phase | Depends on |
|---|---|---|---|
| **1** | **Witness C4 first.** Test long-session restore directly; establish whether reload really returns the oldest 100 rather than the most recent. ⛔ **Do not repair it in the witness act.** | pre-I | — |
| **2** | **Continuity-depth repair.** Truthful self-location: actual conversation depth · how much current-session history is presently in cognition · how much is known to exist outside that aperture. ⭐ The smallest operational repair — *improves epistemic honesty without yet adding memory or retrieval.* | **I** | 1 |
| **3** | **Current-session recovery.** A server-side read path back into cognition for earlier turns of the same live conversation, **by relevance and significance — not merely `last N`.** *"The durable transcript already exists; what is missing is selection back from it."* | **II** | 2 |
| **4** | **Standing travels with retrieved material.** Corrections, refinements, supersessions, member annotations, provenance and constitutional guards bound to the representation they govern. ⚠️ *"Otherwise better retrieval simply makes stale or rejected interpretations easier to resurrect."* | **II** | 3, in parallel |
| **5** | **Genuine spiral continuity.** Persist process identity: concurrent spirals · temporal moments within each · recurrence-with-difference · movement · thresholds · transformations. ⭐ **Keep the utterance-level Elemental sensor; replace the member-identity carrier.** Summary architecture comes **later**, once primary evidence, descent, standing and spiral membership are secure. | **III** | 4 |

### ⚠️ STEP 4 IS NOT OPTIONAL AND IS NOT LAST **[J]**

Step 3 makes retrieval *powerful*; step 4 makes it *safe*. The ordering matters in one direction
only: **a step 3 shipped without step 4 is strictly worse than no step 3**, because the material it
newly reaches includes interpretations the member rejected (ACT 1 **C6**), and the retrieval that
finds them will be *better* at finding them than the member is at re-correcting them.

This is **LC-22** at programme scale — *standing must travel with the thing whose standing it
governs* — and it is why step 4 is listed as parallel to step 3 rather than after it.

---

## HOW THE PHASES MAP TO THE CLOSED LANE

| Phase | Laws already specified in `AIN-CONTEXT-01` | Findings it answers |
|---|---|---|
| **I** | LC-9 graceful uncertainty · LC-13 recovery is observable · LC-23 no tier may carry less constitutional protection | C7 — the member is currently the recovery mechanism |
| **II** | LC-1 transcript sovereignty · LC-2 server-side authority · LC-3 recoverability · LC-4 source-bearing derivation · LC-11 erasure propagates · LC-12 no authority by retrieval · LC-22 unit travel | C1 · C2 · C4 · C6 |
| **III** | LC-5 correction standing · LC-6 protected significance · LC-16…LC-19 anti-typing, ratification, no direction-scoring, no layer collapse · LC-20 freedom · LC-21 accumulation ≠ authority | D1 · the missing layer-3 spiral substrate |

⭐ **Every phase already has its law written.** The programme is implementation against a
specification, ⛔ not further specification — which is what the closed lane bought.

**Acceptance instrument, all phases**: the four discriminators — **Correction · Descent ·
Recurrence · Freedom** (`AIN-CONTEXT-01` ACT 2 §C1.5). ⛔ A floor, never a proof.

---

## THE SELF-AMPLIFICATION FINDING AND THE REPAIR LAW

Added 2026-09-15 after `C4-WITNESS-01` and `C4b-WITNESS-01` both returned RED.

### ⭐⭐ THE SENTENCE THE PROGRAMME TURNS ON **[F]**

> **The continuity defect is self-amplifying: once the stale PostgreSQL slice wins by count, the
> client overwrites the more recent cache with that stale slice, removing the very fallback that
> could have corrected the next load.**
>
> *"That is the architectural defect we need to fix — not merely a bad `LIMIT 100`."*

The witnessed chain:

```
150-turn durable session
      ↓  server returns turns 1–100
      ↓  client already holds turns 101–150
      ↓  100 > 50
      ↓  client selects the stale PG set
      ↓  client rewrites the local cache
      ↓  cache becomes turns 51–100
turns 101–150 disappear from the client continuity carrier
```

⭐ **The client is not merely making a bad choice for one render. It is destroying the better
continuity state it already possessed** — and after one reload there is no recency-correct fallback
left to recover from.

### CR-1 · THE CARRIER RECONCILIATION LAW **[F]**

> **When multiple conversation carriers disagree, recency and source continuity may not be degraded
> merely because one carrier contains more rows. A less-recent carrier must never overwrite a
> more-recent valid carrier without an explicit reconciliation rule.**

And the older invariant continues to hold beneath it:

> **Conversation length may change representation; it may not make significant recent relational
> history irrecoverable.**

**[J]** CR-1 is recorded **here**, in the programme, ⛔ not appended to `AIN-CONTEXT-01`'s LC series
— that lane is closed and adding to it would reopen it. CR-1 extends **LC-3** (recoverability) and
**LC-22** (standing travels with what it governs) into the carrier-conflict case the witnesses
exposed; ⛔ it supersedes neither.

⭐ **Why the law rather than the conditional**: the shallow repair is `change > to <`. That would fix
neither defect properly — it would pick the smaller carrier by count instead of the larger one by
count, which is the same mistake with the inequality reversed. **Count is not the axis.**

### THE TWO DEFECTS ANY REPAIR MUST ADDRESS TOGETHER

```
D1 · SELECTION DEFECT              "more rows" beats "more recent rows"      :3124
D2 · DESTRUCTIVE PERSISTENCE       the stale winner overwrites the cache     :3129
```

⚠️ And the primitive already in the file is not a safe basis for a merge-based repair —
`truncateHistoryForAPI` orders by **source, not time**, and lets id-less messages bypass dedupe
(`C4b` result §7.3).

---

## STANDING

```
Phase I · II · III        ⛔ UNOPENED
step 1 (C4a witness)      ✅ SPENT · 🔴 RED · WITNESSED
step 1b (C4b witness)     ✅ SPENT · 🔴 RED · WITNESSED (D1 + D2)
C4c prompt payload        ⏳ ENTAILED, NOT WITNESSED · OWED / NOT OPEN
C4-REPAIR-01              ⛔ UNOPENED — authority NOT granted
steps 2–5                 ⛔ UNOPENED, UNSPECIFIED

production · schema · migrations · prompts · summary layer
Spiral carrier · Bridge D                                    untouched
```

⛔ **No act opens by reference to this document (R8).**
