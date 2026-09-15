# `RELATIONAL-DISCOURSE-MEMORY-01` — PREPARED CHARTER

**Date** 2026-09-15 · ⛔⛔ **PREPARED, NOT OPENED.** ⛔ Research lane, ⛔ **not an implementation
lane** · no design · no schema · no graph · no repair authority.
**Opening requires an explicit founder act.**

⭐ **Supersedes `RELATIONAL-MEMORY-01`** (prepared, never opened, kept verbatim as superseded).

---

## 1 · THE SHIFT

> ⭐⭐ **Stop treating memory mainly as stored content, and study how DISCOURSE creates RELATIONS
> among remembered things.**

**Question:**

> **Which relational distinctions from discourse, pragmatics and applied linguistics are
> necessary for persistent conversational memory, and which of those relations does AIN already
> preserve?**

**Flow:** existing AIN relation census → applied-linguistics prior art → relation taxonomy →
map overlaps/gaps → counterexamples from **real continuity failures** → minimum candidate
grammar → founder adjudication → **STOP.** ⛔ No implementation step.

**Required reads:** Centering Theory · discourse deixis & anaphora · **bridging** · Discourse
Representation Theory · common ground / grounding · discourse relations · conversational repair ·
information structure.

⭐ **The emerging claim:** *MAIA may already have substantial memory content and substantial
governance, while lacking the discourse-relational layer that tells remembered things how they
belong together.*

⭐ And the connection to the geometry direction: **the memory objects are the nodes; applied
linguistics has spent decades studying the typed relations among them.** ⭐ That is prior art to
inherit **before** inventing a relational grammar of our own.

---

## 2 · ⭐⭐ BRIDGING — and what it says about the mechanism we just closed

Coreference recovers by **identity**: *"Kelly saw a cedar. **It** was beautiful."*
Bridging recovers by **relation**: *"Kelly entered a house. **The kitchen** was dark."* — the
kitchen was never mentioned, and is understood through `house → has-part → kitchen`.

⭐⭐ **`C1-BRIDGE` is named for the one thing it does not do.** It matches tokens — recovery by
**identity**. The P1 result is the proof: it reached the marker **only because the member
restated it**, which is coreference, ⛔ not bridging. ⭐ *The name promised the mechanism the
lane then discovered to be missing.*

⭐⭐⭐ **And this reframes the first-ask case precisely.** A member who asks once and never
restates the object leaves **no identity to match** — so `FIRST-ASK-OPAQUE-MEMORY-01` is, in
linguistic terms, **a bridging problem**. ⭐ That moves it from *an unsolved MAIA problem* to *an
instance of a studied problem with its own literature and benchmarks* — ⛔ which is orientation,
⛔ **not a solution, and not evidence any of it works.**

⭐ Generalized for AIN — ⛔ candidate vocabulary only, ⛔ nothing ratified:

```text
session → contains → episode          correction → revises → interpretation
episode → contains → phrase           symbol → recurs_in → episode
phrase → spoken_by → member           decision → arose_from → conversation
theme → elaborated_by → later insight statement → contrasts_with → earlier statement
```

> ⭐⭐ **association = a discourse relation that makes one thing accessible from another** —
> ⛔ not semantic proximity.

---

## 3 · OBLIGATIONS CARRIED FORWARD FROM THE SUPERSEDED CHARTER

⛔ **All three survive the merge unchanged in force.**

### 3.1 ⚠️ THE LANE COLLISION IS NOW RESOLVED ONE WAY AND STILL OPEN THE OTHER

⭐ `RELATIONAL-MEMORY-01` is **merged into this lane** — that collision is closed. ⚠️
`ANTECEDENT-IDENTITY-01` remains prepared, and its question is **one edge of this grammar**
(`REFERS_TO`). ⛔ **Still undecided, and still to be decided before either opens:**

```text
(a) this lane is the PARENT; ANTECEDENT-IDENTITY-01 opens inside it as REFERS_TO
(b) ANTECEDENT-IDENTITY-01 stays NARROW and opens FIRST; this census DEFERS
    REFERS_TO to it and does not re-adjudicate it
```

### 3.2 ⚠️ CITATIONS — and ⭐ a pattern worth noticing

⛔ The literature arrived from **external research passes** (`utm_source=chatgpt.com`); ⛔ **none
verified in-session.** But the corroboration divides cleanly:

```text
⭐ corroborable from training knowledge — the CANONICAL, load-bearing prior art
     Centering Theory (Grosz · Joshi · Weinstein, Computational Linguistics 1995)
     Discourse Representation Theory (SEP) · bridging-resolution survey (COLING 2020)
     CODI-CRAC shared task on anaphora / bridging / discourse deixis · Apple ReALM
⚠️ NOT corroborable — every one is a 2025/2026 venue
     GUMBridge (LREC 2026) · common-ground survey (2025) · Associa · MemORAI ·
     EventRelBench · the TACL relational-memory work
```

⭐⭐ **The pattern is itself reassuring: the foundations this lane rests on are the old,
checkable ones. The unverifiable citations are all recent and none is load-bearing.** ⛔ They
must still be verified against their venues or dropped — ⛔ an unverified citation never
licenses a design decision.

### 3.3 ⭐⭐ THE GRAMMAR IS NOT OPEN DESIGN SPACE

Governed already: `WAS_INFERRED_BY` (derived stays visibly derived · `N1` origin) ·
`WAS_CORRECTED_BY` (**R7b**) · `SUPERSEDES` (succession carried by the successor;
`superseded_by` **derived, never stored**) · `REFERS_TO` (`CONTINUITY-REMAINDER-01`).

⛔⛔ And **`IS_WITHHELD_FROM` is REFUSED** — a stored confident negative, already adjudicated by
the disclosure-receipts lane: *no `withheld` state; it would assert a negative the database
cannot prove.* ⭐ *A relation is not available merely because it is nameable.*

---

## 3A · THE SHARPENED HYPOTHESIS, THE SIX LAYERS, AND THE CENSUS FORMAT

> ⭐⭐ **MAIA may not primarily have a memory-storage problem. It may have a
> DISCOURSE-ORGANIZATION problem: remembered objects exist, but too many of the relations that
> make them intelligible, accessible and associative have to be RECONSTRUCTED at retrieval
> time.**
>
> ⭐ Shorter: **MAIA remembers things better than it remembers how things relate.**

⭐ Three lines converge — **linguistics** (meaning across discourse depends on typed relations) ·
**AIN** (governance repeatedly required typed relational distinctions) · **current AI memory**
(multi-relational / event graphs outperforming flat retrieval). ⛔ Convergence justifies
research; ⛔ it is not itself a finding.

**Three quantities the lane must never conflate:**

```text
semantic similarity  ≠  conversational accessibility  ≠  antecedent identity
```

**Six candidate layers** — ⛔ *not claimed final*: **Referential** (`REFERS_TO · COREFERS_WITH ·
BRIDGES_TO · POINTS_TO_EVENT`) · **Attentional** (`SALIENT · CURRENT_TOPIC · FOREGROUNDED ·
ACCESSIBLE · COMPETING_REFERENT`) · **Discourse/coherence** (`ELABORATES · EXPLAINS · CAUSES ·
CONTRASTS · FOLLOWS_FROM · CONDITION_FOR`) · **Temporal/episodic** (`BEFORE · AFTER ·
SAME_EPISODE · RECURS_IN · CONTINUES · SUPERSEDES`) · **Epistemic/relational** (`STATED_BY ·
INFERRED_BY · JOINTLY_ESTABLISHED · CORRECTED_BY · WITHDRAWN_BY · AUTHORIZED_BY`) ·
**Developmental** (`THEME_RECURS · INTERPRETATION_DEVELOPS · RUPTURE · REPAIR · DIFFERENTIATES ·
INTEGRATES`) — ⛔ the last layer **must be earned experimentally**, never assumed.

**Prior-art order:** Centering → Accessibility/Givenness → anaphora/coreference → discourse
deixis → bridging → DRT/SDRT → discourse coherence → common ground → conversational repair →
current graph-memory systems.

**Census row format:**

```text
linguistic relation → what it means → evidence it matters → existing AIN carrier
                    → explicit / implicit / absent → failure case → research standing
```

⛔ No schema · no graph implementation · no new memory engine.

---

## 3B · ⚠️ FOUR GUARDS THE CENSUS NEEDS BEFORE IT OPENS

### 3B.1 ⭐⭐ THE CLASSIFICATION AXIS DOES NOT APPLY TO THE ATTENTIONAL LAYER

⛔ **`explicit / implicit / absent` is the wrong axis for Attentional relations**, because
attentional state is **about the present encounter** — `SALIENT`, `FOREGROUNDED`, `ACCESSIBLE`
and `COMPETING_REFERENT` **should** be computed at retrieval time. ⭐ Persisting them would store
a **stale confident claim** about an encounter that has ended.

⚠️ The hypothesis says *"too many relations have to be reconstructed at retrieval time"* — ⭐ but
**some must be**, and ⛔ *reconstructed* is not a synonym for *missing*. **The census therefore
needs a fourth category:**

```text
explicit · implicit · absent · ⭐ CORRECTLY RECONSTRUCTED — persisting it would be a DEFECT
```

⭐ Without it the census will score the whole Attentional layer *absent* and recommend
persisting exactly what should never be persisted. ⚠️ This also reinstates the distinction the
superseded charter drew and the six-layer list collapses: **durable typed relations** versus
**dynamic configuration**.

### 3B.2 ⭐⭐ `JOINTLY_ESTABLISHED` MUST NOT BE A PRIMITIVE

⛔ If `JOINTLY_ESTABLISHED` can **stand in place of** `STATED_BY` / `INFERRED_BY`, it becomes a
mechanism by which **MAIA's own inference acquires member authority** — the exact failure class
`N1`'s origin law exists to prevent, and *derived stays visibly derived* forbids.

⭐ **Admissible only as a COMPOSITE that PRESERVES both origins**, never as a primitive that
supersedes them. ⛔ *Joint establishment must never be able to erase which side originated what.*

### 3B.3 ⭐ `WITHDRAWN_BY` IS ADMISSIBLE — and the earlier refusal was narrower than it looked

⭐ `WITHDRAWN_BY` records a **positive act by a named party** and is already ratified law —
**FR-15**, *withdrawal is a tombstone*. ⛔ What was refused (`IS_WITHHELD_FROM`, §3.3) is a
**stored confident NEGATIVE**. ⭐ The six-layer list **correctly avoided it**; recording the
distinction so the census does not over-apply the refusal and drop a lawful edge.

### 3B.4 ⚠️ THE STRONGEST CLAIM RESTS ON THE LEAST VERIFIABLE SOURCE

⛔ The *"2026 discourse synthesis"* arguing for multilayer separation is **the single citation
carrying the most weight here, and the one I can least corroborate** — venue, authorship and
claims all unchecked.

⭐ **This is not a reason to reject the claim**: that discourse has multiple distinct relational
layers is **independently supported by PDTB, RST and SDRT being different frameworks with
different relation inventories**, all corroborable. ⛔ But the census must rest on **those**, and
must verify the 2026 synthesis against its venue **or drop it** — ⛔ the premise may not be
carried by an unverified source, however well it states the case.

---

## 4 · STANDING

```text
lane ............................. ⛔ PREPARED · NOT OPENED
supersedes ....................... RELATIONAL-MEMORY-01 (never opened, kept verbatim)
parent/child with ANT-IDENT-01 ... ⚠️ UNDECIDED — settle BEFORE either opens (§3.1)
citations ........................ ⚠️ canonical corroborable · recent UNVERIFIED (§3.2)
grammar .......................... ⛔ NOT OPEN DESIGN SPACE (§3.3) · IS_WITHHELD_FROM REFUSED
bridging reframe ................. ⭐ ORIENTATION ONLY — ⛔ not a solution
six candidate layers ............. ⭐ RECORDED (§3A) · ⛔ not final · developmental layer EARNED
census fourth category ........... ⭐ REQUIRED (§3B.1) — correctly reconstructed ≠ missing
JOINTLY_ESTABLISHED .............. ⛔ COMPOSITE ONLY · never a primitive (§3B.2)
WITHDRAWN_BY ..................... ✅ ADMISSIBLE — FR-15 tombstone (§3B.3)
2026 synthesis ................... ⚠️ LEAST VERIFIABLE · MOST LOAD-BEARING (§3B.4)
design · schema · graph .......... ⛔ NOT AUTHORIZED
production ....................... e57ca1baa · UNTOUCHED
```
