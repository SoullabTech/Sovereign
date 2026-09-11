# D9 · Shared focus — highlight as the core Write interaction

**Founder ruling · 2026-09-09 · ⭐ STATUS: CANDIDATE INTERACTION DIRECTION — an INPUT to D9, not D9**
⛔ **NOT IMPLEMENTED · NOT AUTHORIZED TO BUILD · NOT DOCTRINE.**
D9 is the rewrite of the Develop Experience Contract (`…_D9_CHARTER_2026-09-09.md`), **not another
architecture round and not an implementation lane.** This document is carried into it as a candidate.

> ⭐ **Highlighting text creates a TEMPORARY SHARED FOCUS between the writer and MAIA.**
> ⛔ Not a new document object. ⛔ Not a "selection state" the writer manages.
> **Just: *this is the passage we are looking at together right now.***

---

## 1 · The gesture — deliberately almost absurdly simple

```text
highlight passage  →  "Ask MAIA"  →  conversation opens, already scoped
```

⛔ **NOT a popup menu of twelve AI commands.** ⛔ **NOT `Rewrite / Shorten / Expand / Change Tone /
Explain`.** ⭐ **That would recreate the technical-button problem the witness just identified** — the
apparatus climbing back into the middle of the room.

**Natural language does the rest.** The writer types what they actually mean:

```text
Why does this feel flat?
What am I actually trying to say here?
Does this contradict what I established earlier?
Where have I said this before?
Help me make this more embodied.
Give me three ways to solve the transition without changing my voice.
I think this paragraph is over-explaining. Work through it with me.
```

## 2 · What MAIA holds — and what the writer sees

```text
PRIMARY FOCUS      the highlighted passage
LOCAL CONTEXT      the surrounding section
WHOLE-WORK         available when genuinely relevant
AUTHORIAL INTENT   what the writer has already established matters

VISIBLE            the passage · the conversation
UNDERNEATH         all of the machinery
```

### 1.1 ⚠️ PRECISION REQUIRED — "available when relevant" must not become Work-blind judgment

⛔ **Law 1 says judgment MUST be Work-aware. It does not say Work-aware when convenient.**

```text
CORRECT     whole-Work always INFORMS the judgment;
            it SURFACES only when relevant to the writer
⛔ WRONG    whole-Work is consulted only when MAIA judges it relevant
            -> that is Work-blind judgment with an extra step
```

⭐ **Availability is a display rule, not an authority rule.** The distinction is load-bearing:
**Chapter 4 failed exactly here** — a chapter judged well on its own terms, and wrongly against
the book.

## 3 · Editing happens in the same field

```text
"Okay, show me what you mean."

YOUR TEXT             [existing paragraph]
MAIA'S POSSIBILITY    [suggested revision]

Keep mine · Use this · Keep working
```

⭐ **Or simply keep talking — this is the part that matters most:**

```text
Too polished.
Keep my first sentence.
I don't use that word.
The image needs to stay mysterious.
Try again, but don't explain the meaning.
```

> ⭐ **That is COLLABORATIVE REVISION, not "generate → accept/reject."**

### ⭐⭐ THE AUTHORSHIP BOUNDARY

> **MAIA may propose language. Only the writer changes the Work.**

⭐ **The substrate already enforces this and should be recognized rather than rebuilt.**
`structure/proposals/[proposalId]/adopt` carries **no content**; `saveSection()` is the only write
path; and the standing `prose_in_payload: 422` refusal exists precisely to stop a proposal from
becoming text by arriving as text. **Write does not need a new mechanism — it needs to EXPRESS the
boundary the API already holds.**

## 4 · The highlight stays visible

**While the conversation runs, the selected passage remains subtly illuminated.**

> ⭐ **The felt result: *we are sitting here, with this passage.***

If MAIA needs to refer elsewhere, she brings that material into view **without losing the original
focus.** Scale moves without leaving Write:

```text
THIS SENTENCE → THIS PASSAGE → THIS SECTION → THE WHOLE WORK
```

> ⭐⭐ **The manuscript remains the place. MAIA joins the writer's attention wherever they place it.**

## 5 · Consequences and open questions — flagged, not decided

### 5.1 ⚠️ F-REACTIVE HAZARD — the affordance is an interruption vector

**Writers highlight text constantly for ordinary reasons: copying, moving, re-reading, keeping their
place.** ⛔ **If "Ask MAIA" appears on every selection, MAIA becomes ambiently present during
composition** — precisely the permanent editorial field Law 6 forbids, and the first of the six
F-REACTIVE thoughts (*"What will MAIA think of this?"*) arrives by furniture rather than by speech.

⭐ **The affordance must be reachable without being announced.** ⛔ Not designed here. **Whatever
form it takes, it is subject to F-REACTIVE, and the falsifier applies to the gesture itself.**

### 5.2 ⚠️ NO MENU MEANS INTENT MUST BE INFERRED — and inference can be wrong

**A menu made misclassification impossible; natural language does not.** MAIA must distinguish
reflection · developmental analysis · line editing · alternatives · structural context · recall ·
generative exploration — **from a sentence.**

⭐ **The mitigation is already lawful and cheap: when the ask is ambiguous, ASK.** Law 5's speech
discipline governs — **name what you understood the request to be rather than silently choosing.**
⛔ **A silent wrong classification is a small Law 4 violation**: the writer gets an intervention they
did not request and must reverse-engineer what MAIA thought they wanted.

### 5.3 ⚠️ OPEN — provenance of an ITERATED proposal

**The "just keep talking" loop produces a chain**: propose → *"too polished"* → propose → *"keep my
first sentence"* → propose → adopt.

```text
OPEN   what is the content ancestry of the adopted text?
       `proposal_modified` — but modified from WHICH proposal?
OPEN   are the refused proposals part of the record, or deliberately not?
```

⛔ **Not decided.** ⚠️ **Both answers have costs.** Recording the chain makes the writer's rejections
durable — *a record of everything they turned down*, which is a surveillance shape. **Discarding it
loses the reasoning that produced the adopted line.** ⭐ **Law 4 step 7 requires provenance; Law 6
step 8 requires that nothing remain silently active. This is the first place those two pull against
each other, and it needs a founder ruling before build.**

⛔ **NOT AUTHORIZED: no implementation · no schema change · no Write-room code · no affordance
built.**
