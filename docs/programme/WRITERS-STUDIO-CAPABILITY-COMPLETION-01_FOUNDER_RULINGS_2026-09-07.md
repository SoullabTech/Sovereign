# WRITER'S STUDIO — CAPABILITY COMPLETION · 01
## FOUNDER ADJUDICATION OF THE DISCOVER CENSUS

> # ⛔ WITHDRAWN BY THE FOUNDER, 2026-09-07, SAME DAY
>
> **The product rulings in this document are withdrawn.** They were inferences
> from implementation state, not decisions grounded in the founder's vision for
> Writer's Studio.
>
> **What was withdrawn:**
>
> ```text
> WITHDRAWN AS FOUNDER RULINGS
>
> - retire Discover
> - retire Insights
> - retire Suggestions
> - build Goals next
> - hold Notes
> - remove Timeline
> - remove Threads
> - build Find
> - any sequencing based only on the source census
> ```
>
> **The reason, in the founder's words:** *a repository census was treated as
> if it were a product census.* A source census can say what code exists, what
> routes are live, what data models are present, and where contradictions are.
> **It cannot say what Notes, Goals, Discover, Insights, Suggestions, Timeline,
> Word Web or Threads should MEAN in Writer's Studio.** That is the founder's
> to answer, and the census inverted the direction.
>
> **What survives from this document:** only §2, the FR-C / FR-D record
> correction — which is a governance-status correction, not a product ruling.
>
> This document is kept in full rather than deleted. A withdrawn ruling that is
> erased cannot be distinguished from one that was never made.

---

**Ruled** 2026-09-07, founder, on the census
`WRITERS-STUDIO-CAPABILITY-COMPLETION-01_CENSUS_2026-09-07.md`
**Lane** `flows/WRITERS-STUDIO-CAPABILITY-COMPLETION-01.flow.md`
**Custody** branch `claude/writers-studio-capability-clxw8d`

---

## THE GOVERNING FINDING

> **The unfinished Studio is not thirteen grey buttons. It is disagreement
> about what the Studio already is, what MAIA is allowed to become, and which
> proposed rooms deserve to exist at all.**

The correction the census forced: **"unbuilt Studio" is not one problem.**
Some things are already built but misdeclared. Some are constitutionally
premature. Some should disappear.

---

## 1 · THE ADJUDICATION ⛔ WITHDRAWN

*Kept as the record of what was ruled and withdrawn. Not operative.*

| Item | Ruling | Meaning |
|---|---|---|
| **Materials** | **LIVE / RECONCILE** | Member-authored surface already exists. The rail must tell the truth. No new capability. |
| **Structure** | **LIVE / RECONCILE** | Same. Existing panel, not future roadmap. |
| **Versions** | **LIVE / RECONCILE** | Same. Member-owned revision territory already exists. |
| **Goals** | **BUILD NEXT — Packet A** | Legitimate member-authored capability. Work-scoped, durable Studio state; not manuscript content. MAIA may quantify progress against a goal the writer declared, but may not invent the goal. |
| **Notes** | **HOLD** | First resolve whether Notes and Keeps are genuinely different objects. Do not build duplicate persistence because the rail has a noun for it. |
| **Discover** | **RETIRE / REMOVE FROM ROADMAP** | Do not build a second MAIA authority beside Develop. |
| **Insights** | **RETIRE / REMOVE FROM ROADMAP** | Same. If a future distinct purpose emerges, it must be constituted anew. |
| **Suggestions** | **RETIRE / REMOVE FROM ROADMAP** | Same. Develop already owns constituted MAIA-derived material. |
| **Statistics** | **RECONCILE NOW** | Already live. The rail saying "unavailable" while the same room renders it is a truth defect. |
| **Find** | **BUILDABLE** | Mechanical / read-only. Can be separated from Replace. |
| **Replace** | **HOLD** | Mutating. Needs preview, explicit scope, confirmation and reversible/revision semantics before build. |
| **Timeline** | **DEFER / REMOVE FOR NOW** | The Studio has order, not a general time model. Do not invent time because the rail has the word Timeline. |
| **Word Web** | **HOLD / CLASSIFY** | Lexical → Packet C. Semantic / meaning-making → Packet B. No build until that distinction is proven. |
| **Threads** | **REMOVE AS ORPHAN DECLARATION** | No map, doctrine or ruling. Do not let an accidental lower-band declaration create product authority. |

---

## 2 · FR-C / FR-D — CORRECTION OF RECORD ✅ SURVIVES

The census reported FR-C as *asserted PASS, observably FAIL*. The founder
correction is precise and load-bearing:

> **The rulings survive. The PASS status does not.**

FR-C remains the ruling:

> Visible but unavailable capability must **say its state**, not merely
> become dim.

The current `<span aria-disabled opacity=.55>` implementation
(`app/writers-studio/studio/StudioRail.tsx:83-115`) is therefore a
**regression against FR-C**, not evidence that FR-C was wrong.

FR-D's help architecture likewise remains ruled; this census does not
establish that its implementation is present on this subject.

**Record:**

```text
FR-C   RULING PRESERVED · CURRENT SUBJECT FAILS IMPLEMENTATION
FR-D   RULING PRESERVED · CURRENT SUBJECT NOT PROVEN ACCEPTED
```

This avoids the dangerous alternative: reopening settled product decisions
every time a later branch loses their implementation.

---

## 3 · PACKET B — THE DECISIVE RULING ⛔ WITHDRAWN

> **Discover, Insights and Suggestions are not waiting to be built. They are
> retired candidate labels unless a future inquiry establishes a capability
> genuinely distinct from Develop.**

Leaving them grey in the rail keeps making a roadmap promise. **FR-C does not
require preserving destinations we no longer believe should exist.**

Develop is the constituted MAIA-derived field. The direction is to **deepen
that coherent authority model**, not to recreate MAIA output as three
dashboard buckets.

---

## 4 · PACKET A — GOALS, BOUND ⛔ WITHDRAWN

Goals is the clean next genuinely new capability. It is bound as follows:

```text
GOAL
author          member
scope           Work
durability      durable Studio state
manuscript      not manuscript content
versions        not automatically versioned with prose
export          excluded by default
memory          no automatic MAIA memory standing

MAIA MAY
measure or reflect progress against the member-declared goal

MAIA MAY NOT
create, silently alter, infer, or promote a goal on the writer's behalf
```

This is consistent with the standing rule already executable in
`app/writers-studio/maiaOffering.ts`: *writer-declared goal progress MAY be
quantified; MAIA-generated evaluative judgement MUST NOT be.*

**Notes waits on one small inquiry:**

> **What can a Note do that a Keep cannot?**

If the answer is merely "another place to save text," Notes probably should
not exist.

---

## 5 · X-2 IS THE FIRST REPAIR ⛔ WITHDRAWN AS SEQUENCING

*The Statistics contradiction remains a TECHNICAL FINDING. That it should be repaired first was sequencing derived from the source census, and is withdrawn with the rest.*

**Statistics is reconciled before any new capability is built**, because it
establishes declaration truth:

> If the capability already exists, the Studio must not call it unavailable.

The three declaration sites are reconciled in that same bounded act —
**not by reflexively creating a fourth "master registry"**, but by
establishing which source actually owns member-visible capability state and
making the others projections of it where possible.

> **The architectural defect underneath X-2 and Threads is that
> `STUDIO_MAP`, `STUDIO_MODES` and `STRUCTURE_SURFACES` can independently
> invent product reality.**

---

## 6 · SEQUENCE ⛔ WITHDRAWN

```text
1  DECLARATION TRUTH
   reconcile FR-C regression + Statistics contradiction + orphan Threads

2  PACKET B CLEANUP
   retire Discover / Insights / Suggestions from member-facing roadmap

3  PACKET A
   build Goals

4  NOTES / KEEPS
   distinguish or collapse

5  PACKET C
   Find
   then adjudicate Replace
   Word Web classification
   Timeline remains deferred
```

**The first build is not a shiny new feature. It makes the Studio tell the
truth about what already exists.** Then Goals becomes the first new capability.

---

## 7 · STANDING AFTER THIS RULING

⛔ SUPERSEDED BY THE WITHDRAWAL ABOVE. The operative standing is in
`…_LANE_CORRECTION_2026-09-07.md`.

```text
DISCOVER                 COMPLETE · ACCEPTED
PACKET A                 Goals BUILD NEXT · Notes HOLD
PACKET B                 RETIRED (Discover · Insights · Suggestions)
PACKET C                 Find BUILDABLE · Replace HOLD
                         Word Web HOLD/CLASSIFY · Timeline DEFERRED
STEP 1                   DECLARATION TRUTH — authorized as first act
STEPS 2-5                sequenced, each still its own act
DEPLOY                   NOT AUTHORIZED
CEILING (Develop read)   OUT OF LANE — WS2-07
WORK-AMBIGUITY DEAD END  OUT OF LANE — WS2-03C/D (census Finding X-6)
```
