# Now What? — Design Principles (canonical Larry-facing artifact)

**Date:** 2026-08-03 · **Status:** RECORDED. Seven principles + three screen questions + the Larry
Test, founder-authored. **Not ratified. No build authority. Nothing implemented.**

This is the third artifact in this lane today and is the one to work from going forward. Its two
predecessors become its working record, not competing sources:

- [Pattern study](NOW_WHAT_INTERACTION_PATTERN_STUDY_2026-08-03.md) — how each pattern was checked
- [Design direction](NOW_WHAT_DESIGN_DIRECTION_LARRY_2026-08-03.md) — candidate Rules 1–3, still open

⚠️ **Claim discipline.** Nothing here is Live. Per `docs/canon/MARKETING_CLAIM_DISCIPLINE.md`, this
is **Vision** — and Larry is a real pilot practitioner, so this document is outward-facing in
practice even if it was written as internal design. If any of it is said to him, it is said as
*"what we are building"*, never as *"what it does."* Slice 0 is not built.

---

## 0. The reframe, which is correct

> *"What are the timeless human problems these products solve, and how do we solve the equivalent
> problem in a relationship-centered developmental environment?"*

This is the right question and it is a genuine advance on the previous pass. The seven principles
below hold. Four checks follow — three sharpen a principle, one adds a missing question.

**What is settled and needs no further work:** Principle 3 (people are not records — *"help me honor
the relationship with this person"*), Principle 5 (shared relationship, personal meaning),
Principle 6 (Home is a doorway, not a dashboard), Principle 7 (*"continue the work **you chose**"* —
"you chose" is the authorship anchor and is exactly right), and the Larry Test.

---

## 1. ⛔ Principle 4 — the four origins are not four peers

> *"Larry offered this · The client chose this · MAIA noticed this · The system recorded this."*

Listing four origins is right. Flattening them into one list is the problem — they carry different
constitutional weight, and a bullet list asserts they are equivalent.

| Origin | Class | Status |
|---|---|---|
| Larry offered this | human act, authored | ✅ admissible |
| The client chose this | human act, authored | ✅ admissible |
| **The system recorded this** | **fact with a timestamp** | ✅ admissible — and a genuinely useful new category |
| **MAIA noticed this** | **claim about meaning** | ⛔ **unruled — held under freeze** |

**Recorded ≠ noticed.** *"A session occurred on August 14"* and *"an invitation was accepted"* are
facts the system observed itself performing; they have provenance and no interpretive content.
*"This theme has appeared several times"* is a claim about what the member's material means — the
system performing Reflection → Recognition on their behalf. Under the Constitutional Direction of
Authority, authority moves upward only through authored experience; that claim manufactures a layer
the member did not author.

Isolating "the system recorded this" as its own origin is a real contribution — it gives the
platform an honest voice for facts without borrowing the authority of an interpretive one. Keep it.

**Recommendation unchanged:** ratify three origins now; rule the fourth separately. The third voice
should not enter through a principles document.

## 2. ⛔ Principle 2 — "what is relevant right now" is an unattributed selection act

> *"The system asks: what is relevant to this relationship right now?"*

Principle 4 guarantees every *item* carries its author. But if the system decides which items appear,
**the selection itself has no author** — and selection is where framing actually happens. Attribution
survives filtering; the filter does not attribute itself.

E-2 already ruled the member-side answer: **kept, not last** — *the member's gesture determines
presence; time may describe, but not determine, prominence.* Relevance scoring is the same move as
recency ordering, with a more sophisticated ordering function.

**The generalization this principle needs:** *presence on a screen is determined by an authored act
— something was shared, placed, kept, or scheduled — never by a computed relevance score.*

Principle 2's real content survives intact: **layering** is admissible (fewer objects at the surface,
depth reachable). What is not admissible is the system choosing which objects those are.

## 3. ⚠️ Principles 1 + 2 — "the intelligence stays underneath" has one exception

Stated twice now, so worth restating the limit: **complexity is disclosable; authorship is not.**
Fewer *objects* at the surface, never fewer *attributions*. An unattributed claim is not a simplified
claim, it is a different claim — and progressive disclosure is the most natural place for an author
line to become a detail you can go look up.

## 4. ⭐ The three screen questions need a fourth — or Q2 needs splitting

The three questions are good. They do not catch §1 or §2 above, and the reason is precise:

> **Q2 asks *whose voice is in this item*. Nothing asks *whose act put this item on the screen*.**

Content and presence are separately authored. A perfectly attributed item can appear because a
relevance model surfaced it, because a slot renders whether or not it is filled, or because MAIA
noticed something. In each case Q2 passes and the constitution is violated.

**Proposed four questions:**

1. **Does this help the human orient?** — *Do I know where I am?*
2. **Do I know whose voice this is?** — content authorship
3. **Do I know whose act put this here?** — **presence authorship** *(new)*
4. **Does this strengthen the relationship between two humans?**

Q3 is the one that catches relevance ranking, the third voice, and the rendered empty slot — all
three of the open items in this lane — with a single question a designer can actually apply at a
whiteboard.

### 4a. Two further questions (transferred 2026-08-03; proposed, not ruled)

Q1–Q4 can all be answered honestly by an item that is nonetheless *inventory* rather than
orientation, and none of them interrogates **absence**. Two additions:

5. **Does this help the person accomplish the reason they arrived?** — **user purpose** *(new)*
6. **What would happen if it were absent?** — **the counterfactual** *(new)*

**Q5 is not a restatement of Q1.** Orienting (*do I know where I am?*) and accomplishing (*can I do
what I came to do?*) are different, and the gap between them is where this lane is most exposed. A
screen can satisfy every constitutional boundary and still serve the system's story rather than the
person's need.

| Item | Q5 |
|---|---|
| Calendar | ✅ they need to know when they meet |
| Program stage | ✅ it orients the shared journey |
| MAIA reflection | ✅ **iff the person chose reflection** |
| A beautiful explanation of the architecture | ❌ serves the system's story, not the person's need |

> ⭐ Without Q5, a team can preserve every boundary and still build **a philosophy museum.** Q5 is the
> bridge between hyper-functional on the surface and hyper-relational underneath — which is the
> outcome this design is for.

**Q6 changes the optimization function rather than tightening it.** Q1–Q5 can all operate inside a
conventional product frame (*is it useful, relevant, personalized, accurate, attributable*). Q6 asks
what *relationship* changes because the item exists. A system optimized only for helpfulness drifts
toward more context, more prediction, more visibility, more assistance; Q6 supplies the counter-force
— more restraint, more consent, more silence. **Not less capability: capability governed by
relationship.**

### 4b. Placement states (transferred 2026-08-03; proposed, not ruled)

Most software models availability as `visible / hidden / disabled`. A relational system needs
**presence conditions**:

| State | Meaning |
|---|---|
| **Present now** | the person needs it |
| **Available by invitation** | the capability exists but requires a relationship gesture |
| **Private by design** | the boundary is the feature |
| **⛔ Never appropriate** | the affordance itself creates the violation |

⭐⭐⭐ **`Never appropriate` is an architectural boundary, not a missing feature.** It exists to block
the standard product reflex — *"if users might want it, add a setting."* **Some things must not become
settings.** A private reflection may be meaningful without becoming a coaching signal; a person's
uncertainty may be valuable without becoming a profile attribute; a pattern may be observable without
becoming an identity claim.

⚠️ **Numbering hazard.** The working synthesis
([Active Surface Principles](NOW_WHAT_ACTIVE_SURFACE_PRINCIPLES_2026-08-03.md)) numbered the
counterfactual **Q6** in a six-question set that included presence authorship; here the counterfactual
is also Q6 but the set is ordered differently, and *user purpose* is Q5. **This document's numbering
is authoritative.** Cite questions by name — *presence authorship*, *user purpose*, *the
counterfactual* — not by number. (Same class of trap as the two four-part models in the Larry
materials: Stages vs. steps.)

---

## 5. Status of the open set

| Item | State |
|---|---|
| Rule 3 / Principle 7 — *"continue the work you chose"* | ✅ ready to ratify |
| Rule 2 / Principle 4 — authorship visible | ✅ ready to ratify for **three** origins; ⚠️ attribution is necessary, not sufficient |
| Rule 1 — *reveals, does not decide* | ◐ needs the provenance test to be operable |
| The third voice (*MAIA noticed*) | ⛔ separate ruling required |
| Presence authorship (§2, §4) | ⏳ new — proposed, not ruled |
| User purpose (§4a) — *did this help them do what they came to do?* | ⏳ new — proposed, not ruled |
| The counterfactual (§4a) — *what if it were absent?* | ⏳ new — proposed, not ruled |
| Placement states (§4b) — present / by invitation / private by design / **never appropriate** | ⏳ new — proposed, not ruled |
| Q-P1 viewer parameter · Q-P2 rendered absence · Q-P3 nav sized to what exists | ⏳ open |

**Unchanged:** Slice 0 remains the next build unit — a trust-boundary demonstration, services before
UI, no migration. These principles describe what the environment should feel like once the boundary
holds. They do not authorize building it.

> The technology is the invisible foundation. The relationship is the experience.
