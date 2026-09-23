# SOULLAB WRITER'S STUDIO
# Durable Place + Observation Address Canon v1

Status: FLAGSHIP PRODUCT / DATA-SEMANTICS AUTHORITY  
Purpose: define what “place in the Work” means to the member before any persistence/schema implementation decides it implicitly.

This canon is additive to:
- Flagship Experience Canon
- First Arrival + Onboarding Canon
- Intent-First Entry + First Ten Minutes
- Beta Readiness + Participant Data Ruling
- existing observation / provenance / coverage / authorship law

It does not authorize schema changes, migrations, implementation, merge, or deployment.

---

# 1. North Star

> **A place in Writer's Studio is not merely a coordinate in a document. It is a recoverable relationship to authored material.**

The product promise is:

> **You can leave, return, revise, explore, and still know what this observation was attached to.**

---

# 2. The Product Problem

A naïve address can be:

```text
chapter 6
paragraph 12
character 341–418
```

That is not sufficient by itself.

The Work changes.

Paragraphs move.
Sections split.
Sentences are revised.
A reading may belong to an older version.
A member observation may still matter after the wording changes.
A Review finding may need to show exactly what MAIA read then and where the current version now is.

Therefore Writer's Studio needs **durable place semantics**, not only offsets.

---

# 3. Place Has Four Distinct Meanings

## A. Current authored place

Where this material exists in the **current Work**.

Example:
> Chapter 6 · The Current Changes · paragraph beginning “The river had…”

Used for:
- navigation;
- writing;
- current Review;
- current member marks.

---

## B. Historical authored place

Where the relevant material existed in an **earlier Work version**.

Used for:
- stale MAIA reading;
- History;
- old revision;
- changed passage disclosure.

This must not be silently rewritten to the current passage.

---

## C. Reading evidence place

The exact text/span MAIA read when an observation was made.

Used for:
- evidence;
- provenance;
- freshness;
- doesNotEstablish;
- auditability.

The evidence place belongs to the reading/version that produced it.

---

## D. Member relationship place

The place the member intended to mark, ask about, or return to.

Used for:
- member-authored observation;
- question;
- possibility;
- note;
- bookmark-like return.

This relationship should survive ordinary editing where possible.

---

# 4. Do Not Collapse the Four

These may coincide today and diverge tomorrow.

Example:

```text
VERSION N
Chapter 6 · paragraph 12
"The current carried her..."

MAIA reading R17
Observation O44
Evidence = exact N text

MEMBER later edits paragraph

VERSION N+1
Chapter 6 · paragraph 13
"The river carried her..."
```

Correct behavior:

- O44 still knows the exact evidence MAIA used at N.
- current navigation may offer the likely corresponding place at N+1 if confidently resolved.
- the UI discloses that the Work changed.
- the old evidence is not silently replaced.
- the member can choose whether MAIA should read again.

---

# 5. Address Identity Must Be Stable Enough to Survive Ordinary Editing

The member should not lose every mark because they inserted a paragraph above it.

Therefore durable address should conceptually combine:

```text
Work identity
version identity
structural place
local authored-content identity
span / range
optional current-resolution status
```

The implementation may choose exact technical forms later.

The product law is:

> **Do not make raw character offset the only identity of a meaningful place.**

---

# 6. Place Resolution States

A durable address may resolve as:

## EXACT
The current Work still contains the exact authored locus.

## MOVED
The same authored material can be confidently located elsewhere.

## CHANGED
The locus still exists, but wording materially changed.

## SPLIT
The original locus became more than one current place.

## MERGED
Several old loci became one current place.

## MISSING
The original authored material no longer exists in the current Work.

## AMBIGUOUS
More than one plausible current match exists.

## HISTORICAL_ONLY
The evidence remains valid historically but no current locus can be truthfully asserted.

These states should not be hidden from the product layer.

---

# 7. User-Facing Resolution Language

Avoid technical anchoring terminology by default.

### EXACT
> **This passage is unchanged.**

### MOVED
> **This passage moved.**

### CHANGED
> **This passage has changed since this observation was made.**

### SPLIT
> **This passage now appears in two places.**

### MISSING
> **This wording is no longer in the current draft.**

### AMBIGUOUS
> **Writer's Studio found more than one possible current location.**

Actions may include:
- Show original
- Show current
- Choose current passage
- Keep as historical note
- Read again with MAIA

---

# 8. Member Observation

A member-authored observation must retain:

- owner/member identity;
- Work identity;
- durable observation id;
- exact address at creation;
- Work version at creation;
- member wording;
- kind:
  - Something I noticed
  - A question
  - A possibility
- creation time;
- optional edited time;
- current resolution state;
- edit/delete semantics.

If surfaced elsewhere, provenance remains:

> **YOU NOTICED THIS**

or equivalent member-owned language.

Never relabel as:
> MAIA noticed this.

---

# 9. MAIA Observation

A MAIA observation must retain:

- observation id;
- reading id;
- Work id;
- Work version/read version;
- exact evidence address(es);
- evidence text / frozen evidence reference where lawful;
- provenance:
  - MAIA NOTICED THIS
- coverage;
- timestamp/freshness;
- return address;
- doesNotEstablish.

Current navigation may resolve forward.
Evidence remains anchored backward to the reading that created it.

---

# 10. Member-Declared Structure

A member-declared map element must retain:

- declaration id;
- Work id;
- owner;
- declaration type;
- label;
- member ordering;
- related sections/chapters;
- declaration timestamp;
- current resolution.

If the member selected a Soullab template:

> **YOU CHOSE THE SPIRAL TEMPLATE**

This is distinct from:

> **YOU NAMED THIS**

The address substrate must preserve that distinction.

---

# 11. Revision Proposal

Every revision proposal needs:

- proposal id;
- Work id;
- source version;
- exact source locus;
- proposed replacement;
- proposal scope;
- MAIA/member provenance;
- created timestamp;
- status:
  - proposed
  - viewed in context
  - applied
  - declined
  - superseded

Apply must bind to the exact intended source state.

If the Work changed before Apply:

> **This passage changed since the proposal was made. Read it in context again before applying.**

Never blindly apply to stale offsets.

---

# 12. Applied Revision / History

Applied revision must retain:

- mutation id;
- Work id;
- pre-apply version;
- post-apply version;
- exact pre-image;
- exact post-image;
- locus;
- timestamp;
- actor;
- proposal id where relevant;
- undo/revert relationship.

History is not only a UI list.

It is a truthful lineage of authored change.

---

# 13. Returning Writer

Quiet re-entry may use only evidence actually persisted.

Allowed when known:

> **Welcome back to The River Between.**

> **You last worked in Chapter 6.**

> **You left this question attached to this passage.**

> **This chapter changed after MAIA last read it.**

Not allowed without durable evidence:

> **You were working on voice last time.**

> **You were stuck here.**

> **You were trying to solve this transition.**

unless the system actually persisted and can support that statement.

Returning-state memory must be factual, not inferred narrative.

---

# 14. Last Place

The product may preserve a last place such as:

```text
Work
mode
chapter/section
passage/locus when meaningful
scroll/selection only where useful
timestamp
```

But “last place” must not become surveillance-like replay.

The purpose is:
> help the member resume.

Not:
> reconstruct everything they did.

Store only what the product genuinely needs.

---

# 15. Review Trails

When a member opens a Review finding:

```text
Review observation O44
        ↓
current/historical locus
        ↓
MAIA conversation at O44
        ↓
Back to Review
```

The trail must preserve:

- observation id;
- origin surface;
- current selected finding;
- exact passage;
- return state.

The member should not have to reconstruct how they got there.

---

# 16. Related Passages

A Related Passage relationship must retain:

- source observation / member intent;
- source locus;
- related locus;
- relation evidence;
- coverage/read identity if MAIA-generated;
- provenance.

Do not persist only:

> Ch. 8 — "The cost of truth"

without evidence for both the relation and the gloss.

---

# 17. Work Versioning

The exact versioning system is an implementation decision.

The product requires enough version identity to answer truthfully:

- What version did MAIA read?
- Has this passage changed?
- What version was this observation attached to?
- What version did this proposal target?
- What changed after Apply?
- Can Undo restore the prior authored state?

A timestamp alone may be insufficient if multiple mutations occur within one time window.

---

# 18. Freshness

Freshness belongs to reading identity, not merely the screen.

A reading may be:

## CURRENT
Evidence matches current Work version/locus.

## PARTIALLY_STALE
Some evidence locations changed.

## STALE
The Work materially changed after the reading.

## UNKNOWN
The system cannot establish freshness.

User-facing language must distinguish them honestly.

---

# 19. Coverage + Address

Coverage says:
> what MAIA read.

Address says:
> where the evidence/finding belongs.

Both are required for cross-Work observations.

Example:

> **MAIA read Chapters 1–6.**
>
> **This observation uses passages in Chapters 2 and 6.**

If Chapter 8 was not read:
- do not attach interpretive claims to Chapter 8;
- do not generate glosses for Chapter 8;
- do not imply whole-Work certainty.

---

# 20. Address Failure Is a Trust State, Not an Exception to Hide

If the system cannot resolve a historical/member observation to a current locus:

Do not drop it.

Do not guess.

Show:

> **Writer's Studio can't confidently place this observation in the current draft.**

Then:
- Show original
- Choose current passage
- Keep historical
- Remove observation

The member decides when ambiguity affects authorship.

---

# 21. Deletion Semantics

Deletion must be defined per object.

## Member observation
Member may remove it.

## MAIA observation
May be dismissed from view without falsifying historical reading record where governance requires custody.

## Applied revision
Do not “delete history” merely because it was undone.

## Reading
Retention/deletion follows actual product/privacy policy.

The UI must not promise deletion behavior the storage layer cannot honor.

---

# 22. Privacy / Data Minimization

Durable place can become sensitive because it reveals:
- what the member worked on;
- when;
- which passages mattered;
- what they asked;
- what they revised.

Therefore:

- store minimum necessary;
- do not persist every transient selection;
- do not turn last-place into behavioral surveillance;
- distinguish session UI state from durable authored/research state;
- disclose persistence where relevant;
- honor deletion policy.

---

# 23. Session-Only vs Durable

Every new object must declare one:

## EPHEMERAL
Lives only for current UI/session.

## DURABLE
Expected to survive sign-out/restart/session boundary.

## CUSTODIED_HISTORICAL
Retained as part of reading/revision provenance.

Do not let a UI surface imply DURABLE when object is EPHEMERAL.

This distinction must be testable.

---

# 24. Required Durable Objects — Product View

Likely durable:

- Work
- authored text/version
- member observations
- member-declared structure
- chosen template/provenance
- applied revisions
- revision history
- MAIA reading identity where product retains readings
- observation evidence/provenance
- stale/current relationships
- meaningful last place, if product chooses to provide resume

Likely ephemeral unless separately justified:

- hover
- temporary open tab
- transient drawer
- temporary selection
- unsent input
- momentary animation state

Exact implementation remains subject to substrate audit.

---

# 25. Seedable Beta Implications

A reproducible beta environment must be able to create:

- exact Work version N;
- MAIA reading R against N;
- observation O against N;
- Work version N+1;
- known resolution state from O → N+1;
- under-covered reading;
- not-read lens;
- read/nothing lens;
- member observation;
- revision + Undo lineage.

Hand-editing UI fixtures is not enough for persistence testing.

---

# 26. Acceptance Gates

## A1 — STABLE IDENTITY
Meaningful durable objects have stable ids.

## A2 — WORK BINDING
Every durable object belongs to exact Work.

## A3 — VERSION BINDING
Historical evidence/proposals know the version they target.

## A4 — LOCUS BINDING
Every observation/proposal has exact authored place.

## A5 — FORWARD RESOLUTION
System may resolve to current draft without overwriting historical truth.

## A6 — AMBIGUITY HONESTY
Ambiguous/missing places are disclosed, never guessed silently.

## A7 — MEMBER OWNERSHIP
Member observations remain member-authored.

## A8 — READING PROVENANCE
MAIA observations retain reading/evidence identity.

## A9 — STALE SAFETY
Stale proposal/reading cannot silently mutate current Work.

## A10 — RETURN TRAIL
Review/passages can return to origin state.

## A11 — PERSISTENCE TRUTH
UI distinguishes ephemeral vs durable behavior.

## A12 — PRIVACY MINIMIZATION
No unnecessary durable tracking.

## A13 — DELETE/UNDO SEMANTICS
Removal, undo, history, and custody are distinct.

## A14 — RETURNING WRITER HONESTY
Resume copy uses only durable facts.

## A15 — BETA REPRODUCIBILITY
Seedable environment can produce exact persistence/freshness states.

---

# 27. Defeat Candidates

### D-A1
Member observation persists only as `chapterIndex + charOffset`.

### D-A2
Editing paragraphs above an observation detaches it with no warning.

### D-A3
MAIA stale observation silently updates its quoted evidence to current wording.

### D-A4
Apply uses an old offset after the passage changed.

### D-A5
Returning screen claims "you last worked here" from session memory that did not persist.

### D-A6
Member observation is surfaced later as `MAIA NOTICED THIS`.

### D-A7
Historical finding disappears because current locus is missing.

### D-A8
Ambiguous current match is auto-selected without disclosure.

### D-A9
Undo deletes the fact that an applied revision occurred.

### D-A10
Every click/selection is persisted indefinitely as "last place."

### D-A11
Beta fixture fakes staleness only in UI while underlying reading/version identity is unchanged.

### D-A12
A session-only note looks durable and vanishes after sign-out.

---

# 28. Questions for `OBSERVATION-ADDRESS-01` Specification

Before implementation, CC should answer read-only:

1. What stable Work/version identities already exist?
2. What address object(s) already exist?
3. Are section ids stable across edits?
4. How are ranges represented today?
5. What objects currently persist?
6. Where are readings persisted?
7. Where are revisions/history persisted?
8. Is there already a content-hash or anchor mechanism?
9. How does current `placeInWork` behave under insertion/deletion?
10. What is already schema-backed vs in-memory?
11. What privacy/retention policy currently applies?
12. What migrations would be required for:
    - member observation;
    - reading evidence;
    - durable last place?
13. Can a minimal substrate unlock R5/R9/returning state without solving every future object?
14. What exact falsifiers prove durability across ordinary edits?
15. What is the smallest lawful implementation boundary?

---

# 29. Product Priority

The preferred implementation is not:

> build a generalized annotation platform.

It is:

> build the **minimum durable-place substrate** that truthfully unlocks the flagship experiences already designed.

Avoid speculative generality.

---

# 30. Spirit of Soullab

Durable place should produce a quiet experience:

> I left.
>
> I came back.
>
> My question is still where I put it.
>
> MAIA remembers what she actually read.
>
> If my writing changed, the Studio tells me.
>
> Nothing quietly moved beneath my feet.
>
> I can see the old and the new.
>
> I decide what still belongs.

**A deeper you. A more human world.**
