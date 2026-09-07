# FR-D · HELP FORM — evidence for ruling

```text
LANE      JARVIS-WRITER-ONBOARDING-PRODUCTIZATION-01
STATE     EVIDENCE ASSEMBLED · AWAITING RULING · BUILD NOT AUTHORIZED
DEPENDS   FR-C RULED (fc695fdc) — state must be said, not merely implied
```

## The question

> **What is the minimum help architecture that lets a writer understand an
> unfamiliar act before committing to it, without making explanation compete
> with writing?**

Not *whether* help is needed — W-05b and the unaided hover gesture settle that.

⛔ **This document deliberately drafts no tooltip copy.** Drafting strings per
control would answer FR-D with "tooltips everywhere" before it is ruled.

---

## ⭐ Two findings that constrain the ruling

### 1 · The sentence already existed, in the right room, and did not land

During the walk, the MAIA column rendered (`canvas/MaiaColumn.tsx:79`):

> *"MAIA can speak with you about a declared Work. Declare one in "This work"
> and Conversations opens."*

That is a complete answer to *why would I press it*. It was on screen in the
post-reload render at §3a — **immediately before** the block was reported at §3b,
on the same page. The writer read the adjacent *"the work isn't declared"* state,
and remained blocked through four help-seeking moves.

```text
⛔ CONSTRAINT ON THE RULING
A help architecture that only ADDS SENTENCES ELSEWHERE ON THE PAGE has
already been tested by this walk. It failed.
```

Why it failed is **not established** and is not resolved here. Candidates, none
selected: the sentence sits in the far-right column, distant from the control it
names; it uses *declare*, the exact word the writer answered *"I don't know"* to;
it names the control by quoted label rather than pointing at it.

### 2 · The inline-descriptor form is already in the schema and is dead

```text
StudioDestination.note?: string      studioMap.ts:86
populated                            2 of 16 destinations
  manuscript  "The room where your work develops."
  export      "Take your writing out."
rendered by                          NOTHING — StudioRail.tsx never reads `note`
```

One candidate form is already specified, mostly unpopulated, and unrendered.
Whatever FR-D rules, this slot either becomes the vehicle or should be removed.

### And a note on precedent

No explanatory hover layer exists anywhere in `app/writers-studio/`. `title=`
appears for truncated card names and one StructureReview span; `aria-label` for
accessible naming. **The hover form has no precedent here — it would be new.**

---

## Evidence class 1 · WALK — where meaning was sought before acting

```text
 #  moment                          what was sought              received
 1  "This work"                     meaning of the required act  nothing   W-05b
 2  hover "IN RELATION TO"       ⭐ the object to explain itself  nothing
 3  left rail, instructions         orientation                  nothing
 4  left rail, MAIA for guidance    a guide                      nothing
 5  asked MAIA how to use Studio    orientation                  fabricated Help
 6  clicked "Keeps"                 an act                       a collection
 7  Develop rail dimness            what these are               ambiguity  FR-C
 8  "INTERIM" badge, the House      what this qualifies          nothing
 9  "fields" vs WORLDS / ROOMS      the shared word              mismatch
```

⭐ **#2 is the interaction-grammar datum.** The writer did not go looking for
documentation. **They asked the object itself to explain itself.** That is
evidence about expected form, not merely about missing content — and it is the
single strongest signal in this class.

⚠️ #5 is Lane B's, not FR-D's. But it bears on form: the one place a stranded
writer *did* seek a guide was MAIA, and she answered by inventing a Help area.
A dedicated help surface, if ruled, must be one MAIA can name truthfully.

---

## Evidence class 2 · EXISTING LANGUAGE — what already answers a threshold question

```text
                                          answers            rendered where
LENS_MEANING (7 lenses, one line each)    what is this       Develop, always
NON_CONCLUSION_MEANING (8 limits)         what this is not   per observation
INVOCATION_SENTENCE                       what happens if    Develop, always
  "…Nothing changes unless you change it."
preparationCopy()                         what this enables  non-ready states only
refusalSentence()                         what did NOT happen  AFTER failure only
MaiaColumn "Declare one in This work…"    why press it       present — did not land
standingRowSentence()                     what I decided     standing surface (dark)
sectionNavigationCopy()                   why navigation differs  section states
StudioDestination.note (2 of 16)          what is this       NOWHERE — unrendered
```

⭐ **The pattern, confirmed by the walk from the other side:** the language that
already exists is overwhelmingly reachable **at failure or inside Develop**. The
Canvas — where the block happened — carries almost none of it, and the one
sentence it does carry did not land.

This is the Journey Truth §6 finding, now with a correction: **promotion of
existing copy is necessary but demonstrably not sufficient.** Placement alone did
not fix it, because the sentence was already placed.

---

## Evidence class 3 · FORM OPTIONS — smallest first

```text
A  HOVER / KEYBOARD-FOCUS HELP
   the object explains itself, on demand, where it is
   ✓ matches the observed gesture (#2) exactly
   ✓ no persistent cost to the writing field
   ⚠ no precedent in this codebase — new surface
   ⚠ touch and keyboard parity must be designed, not assumed

B  SHORT INLINE DESCRIPTOR
   a line under the label, always visible
   ✓ the slot already exists (`note`), unrendered, 2 of 16 filled
   ✓ satisfies FR-C's "said, not implied" for unavailable destinations
   ⚠ always-on text competes with the writing field
   ⚠ this is closest to what already failed — a sentence placed nearby

C  CONTEXTUAL "?" AFFORDANCE
   explanation on request, adjacent to the act
   ✓ zero resting cost; explicit
   ⚠ adds a control to explain a control

D  FIRST-USE GUIDANCE
   shown once, at the threshold, then gone
   ✓ answers "before committing to it" precisely
   ⚠ unrepeatable; invisible to a returning writer who forgot

E  DEDICATED HELP SURFACE
   ⛔ only if A–D cannot carry it. It is also the thing MAIA hallucinated;
      if it exists it must be nameable truthfully (Lane B / R-2).
```

---

## The compact table

| Threshold question | Where it arose | Existing answer present? | Candidate form |
|---|---|---|---|
| **What is this?** | first encounter with a control or mode | `note` (2/16, unrendered) · `LENS_MEANING` (rendered) | A hover/focus · B inline descriptor |
| **Why would I press it?** | choosing between destinations or acts | MaiaColumn sentence — **present, did not land** | A · C |
| **What does this enable?** | disabled/unbuilt, or a consequential act | FR-C state language (ruled, unbuilt) · `preparationCopy` | B state + consequence |
| **What happens if I do?** | acts with a meaningful transition | `INVOCATION_SENTENCE` · refusal copy (after the fact) | C · D, only where needed |

---

## What the ruling must decide

```text
1  Which form(s) carry the four threshold questions — and where each stops.
2  Whether `StudioDestination.note` becomes the vehicle or is removed.
   It cannot honestly stay declared, 2/16 filled, and unrendered.
3  Whether a dedicated help surface exists at all. If yes, Lane B must be
   able to name it truthfully — otherwise R-2 inherits a second fabrication.
4  What is explicitly NOT explained, so explanation does not compete with
   writing. A help architecture with no stated ceiling becomes a manual.
```

⛔ No form recommended in this artifact. The ruling is the founder's.
