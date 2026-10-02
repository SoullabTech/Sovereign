---
room: Changes — Member-Ratified Meaning
human_activity: Asking MAIA for one tentative hypothesis about an observed recurrence, then deciding in the member's own words what—if anything—that recurrence means.
surfaces:
  - components/maia/changes/ChangeRoom.tsx
  - components/maia/changes/change-room.module.css
change_class: experiential
principles:
  - CHANGES-UX-01 — every abstraction returns to lived experience
  - CHANGES-UX-06 — recurrence is evidence, not explanation
  - RELATIONSHIPS-UX-01 — member evidence, observed structure, MAIA hypothesis, and member-ratified meaning remain distinct
  - MAIA_OATH — MAIA offers possibilities rather than authority
reference_surfaces:
  - docs/design/contracts/changes-temporal-pattern.md
  - docs/design/contracts/changes-maia-encounter.md
  - docs/architecture/RELATIONSHIPS-UX-01.md
shared_with_house: explicit epistemic layers, member-controlled context carriage, one canonical MAIA, and member authorship of durable meaning.
distinct_to_room: Changes lets the member move from temporal evidence into interpretation without collapsing those stages. MAIA's hypothesis remains conversational; only the member's own words may be kept back into the Change.
screenshot_desktop: docs/design/contracts/screenshots/changes-ux-07-member-meaning-desktop.png
screenshot_mobile: docs/design/contracts/screenshots/changes-ux-07-member-meaning-mobile.png
experience_verification: 2026-09-27 authenticated local witness on isolated port 3697 with a temporary Change containing three authored moments. Ask MAIA what she notices produced exactly one conversation POST containing the observable recurrence evidence (honesty ×2, silence ×2) and an explicit request for at most one tentative hypothesis. That MAIA act changed no studio_changes notes, mentor_reflection, follow_up_intention, or change_experiences rows. The member then wrote their own meaning in a separate field and Keep my meaning persisted exactly that authored text through the existing change_experiences route as type=reflection with HTTP 200. Desktop and mobile captures passed; all temporary witness data was removed with residue zero.
---

# CHANGES-UX-07 — Member-Ratified Meaning + MAIA Hypothesis Separation

## Purpose

Complete the first epistemic cycle of the Living Change Room without giving MAIA authority to write meaning into the Change.

The sequence is:

**member evidence**
→ **observable recurrence**
→ optional **MAIA hypothesis**
→ **member's own meaning**
→ optional durable keep

These stages must remain visibly and technically distinct.

## MAIA hypothesis

From the temporal pattern view the member may choose:

> **Ask MAIA what she notices →**

This is an explicit context handoff.

The message sent to the existing Living Change conversation contains:

- exact Change title;
- exact recurrence counts already visible to the member;
- exact kept moments;
- an instruction to offer at most one tentative hypothesis;
- an instruction to distinguish that hypothesis from the evidence;
- an instruction to ask the member what they make of it;
- an instruction not to treat the hypothesis as established meaning.

The hypothesis remains in conversation.

## No automatic durable interpretation

MAIA's response is not written to:

- `studio_changes.notes`;
- `mentor_reflection`;
- `follow_up_intention`;
- `change_experiences`;
- Pattern Ledger;
- the accumulating hypothesis buffer;
- any memory store.

The live witness verified those Change fields and experience count remained unchanged after the MAIA hypothesis gesture.

This is deliberate.

A hypothesis can influence the conversation without becoming a durable statement about the member.

## Why existing hypothesis stores are not used here

The repository already has two broader hypothesis systems:

### Accumulating Hypothesis Buffer

This is a Cognitive OS substrate with:

- required phase and element at creation;
- interpretation classes;
- confidence gates;
- cross-context accumulation;
- routing influence;
- eventual ledger promotion.

It has no Change identity and no member-facing ratification seam specific to one Living Change.

Using it here would silently widen the scope from:

> “one possible way of seeing this Change”

to:

> “a cross-context interpretive hypothesis about this member.”

That is not authorized by UX-07.

### Pattern Ledger

The Pattern Ledger is closer epistemically because it supports:

- emerging / offered / confirmed / partial / rejected;
- member response;
- evidence references.

But its current schema does not admit:

- `change_experience` as an evidence source type;
- `change` as a scope;
- an explicit `change_id` binding.

Coercing Change evidence into `capture`, `theme`, or another approximate type would lie about provenance.

UX-07 therefore does not reuse it by approximation.

## Member-ratified meaning

The pattern view separately offers:

> **Your meaning**

with the prompt:

> **What do you make of what has been recurring?**

This field is not pre-filled by MAIA.

It does not quote or import MAIA's hypothesis.

The member writes their own words.

Only then may they choose:

> **Keep my meaning**

## Persistence law

When the member keeps their own meaning, UX-07 uses the already-existing:

`POST /api/changes/[id]/experiences`

with:

`experienceType: reflection`

The exact authored text becomes a new member-owned reflection moment in the Change.

This means no new schema is required to distinguish the durable authority:

> if it is in the Change, it is the member's own authored reflection.

MAIA's hypothesis remains outside that durable layer unless a future explicitly governed substrate is designed.

## What “ratified” means in this act

Ratification does not mean:

- confirming MAIA as correct;
- copying MAIA's words;
- accepting a system label.

It means:

> **the member has made meaning in their own words and explicitly chosen to keep those words.**

They may:

- agree with MAIA;
- disagree;
- amend;
- deepen;
- contradict;
- ignore;
- leave the question unresolved.

The durable object records only what they themselves chose to say.

## Separation visible in the UI

The temporal pattern view now contains three distinct zones:

### Observable recurrence
> Words that reappear  
> Kinds of moments that recur

### MAIA hypothesis
> Ask MAIA what she notices

### Member meaning
> What do you make of what has been recurring?

The boundary remains explicit:

> MAIA's hypothesis is not your meaning.

## Witness result

The authenticated witness established:

- MAIA hypothesis gesture → exactly one conversation POST;
- request contained visible recurrence evidence;
- request explicitly constrained MAIA to one tentative hypothesis;
- MAIA gesture wrote no durable Change meaning;
- member-authored meaning → one existing experiences POST;
- saved row type → `reflection`;
- saved content → exact member-authored text;
- temporary data → residue zero.

## Explicitly unbound

UX-07 does not:

- parse MAIA's answer into a pattern object;
- promote MAIA's hypothesis into memory;
- score agreement;
- infer ratification from conversation;
- treat “confirmed” as truth;
- create Pattern Ledger rows;
- create accumulating hypotheses;
- copy MAIA language into the member's reflection;
- mark a Change complete;
- synthesize an overall developmental arc.

## Exact stop

CHANGES-UX-07 closes the first full epistemic loop:

> **Experience → recurrence → hypothesis → member meaning**

without collapsing the layers.

The next clean boundary is:

> **FOUNDER INTEGRATED WITNESS — CHANGES-UX-02 THROUGH UX-07**

Before opening any further architecture, the whole room should now be walked as one experience:

- Living Change;
- Notice;
- I Ching;
- MAIA;
- Temporal Pattern;
- Member Meaning;
- Return.

Only after that integrated witness should we decide whether Changes needs any additional state at all.
