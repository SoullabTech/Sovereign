# AIN-INDRAS-WEB-02 — Facet↔Center Permeability + Context Disclosure

**Date:** 2026-09-27
**Parent:** AIN-INDRAS-WEB-01
**Base contract:** `920e53203c223d75fc0b8ededd054d1ca1fefd18`
**Standing:** contract only; no runtime authority

## Governing question

How does MAIA know which jewels of the web may enter the center for this act, which of those may influence synthesis, and which may be spoken back to the member?

## Foundational sovereignty law

This contract inherits existing Soullab canon:

**Holding a thing is not permission to retrieve it.  
Permission to retrieve is not permission to speak it.**

Indra's Web adds one further distinction:

**Permission to speak is not permission to persist the resulting interpretation.**
## 1. Four-stage permeability

Every source considered by the center occupies one stage:

### A. Available
The source exists within Soullab under a valid ownership/consent boundary.

Availability alone grants no retrieval.

### B. Admitted
The source is permitted into the current inquiry by an accepted permeability basis.

Admission means MAIA may use it in this act.

### C. Speakable
The source or a relation grounded in it may be surfaced in the conversation.

A source may be admitted for internal orientation yet not speakable verbatim or specifically.

### D. Disclosed
The member can tell that this source/facet is participating in the current field.

Disclosure concerns intelligibility of context use, not only legal consent.
## 2. Admission bases

A source may be admitted by one of these declared bases:

- **current_conversation** — authored or introduced in the present exchange;
- **explicit_selection** — member chose the exact object/source;
- **explicit_facet_open** — member invited a named facet into the current inquiry;
- **standing_continuity_permission** — existing consent permits this source class to surface contextually;
- **system_required_boundary_context** — minimal context required for truthful/safe operation, never an interpretive expansion;
- **unavailable** — no valid basis exists for this act.

These bases are not equivalent.

Exact selection has narrower scope and clearer intentionality than general continuity permission.

A wider-field synthesis should prefer the narrowest sufficient basis.
## 3. Facet-open semantics

Opening a facet is not the same as selecting every object within it.

Example:

> “Bring Astrology into this.”

may authorize the Astrology facet as a lens for the inquiry, but does not automatically authorize every historical astrology conversation, annotation, or derived interpretation.

A facet-open act therefore needs a bounded resolver that later implementation must specify.

Until that resolver is admitted, facet-open means:
- use only the canonical facet context already lawfully available for that member;
- preserve source distinctions within the facet;
- do not treat facet-open as blanket historical retrieval authority.

## 4. Selected-field semantics

When the member explicitly selects exact sources, MAIA's synthesis should remain inside that selected field unless the member separately opens wider context.

The selected field is therefore a first-class aperture, not merely a UI convenience.
## 5. Wider-field semantics

A wider Soullab field may be opened explicitly.

A future member-facing act could express this as:

- “Stay with what I selected.”
- “Bring in Astrology too.”
- “Look across my wider Soullab field.”
- “Use only this conversation.”
- “Don't bring in Dreams here.”

The exact wording is UI work and is **not** authorized by this contract.

The semantic requirement is that wider-field participation be distinguishable from selected-field participation.

MAIA must not present context introduced through continuity permission as though the member selected it in this moment.
## 6. Context disclosure

When a materially relevant source from outside the immediate facet influences MAIA's response, the active field should be intelligible to the member.

Disclosure can be lightweight and relational.

Examples of acceptable disclosure posture:

> “I'm holding this Becoming journey alongside the Astrology lens you've opened.”

> “I'm also drawing on something you previously chose to keep in Journal.”

> “Staying only with what you've selected here…”

The disclosure should name the **source class or facet and its role**, not expose hidden technical plumbing.

The member should be able to ask:
- What are you drawing on?
- Why did you bring that in?
- Leave that facet out.
- Stay only with this.
## 7. Source-use standing

For every source participating in a center synthesis, the conceptual trace must be able to answer:

```text
source_ref
facet
admission_basis
retrieved = yes/no
relied_upon = yes/no
speakable = yes/no
disclosed = yes/no
standing
epistemic_kind
temporal_relation
boundaries
```

This is a contract shape, not a persistence requirement.

It may remain ephemeral.

Its purpose is to make relational knowing accountable: MAIA should be able to distinguish what was merely present from what materially shaped the synthesis.
## 8. Reference versus reliance

The existing AIN epistemic-join distinction is inherited directly.

**Reference** — a source is named, displayed, cited, or used illustratively.

**Reliance** — the synthesis materially depends on the source.

A source that is referenced but not relied upon does not become evidence for the relation.

A relation that relies on multiple sources must preserve each relied-upon source's standing and boundary.

The center cannot manufacture stronger standing by accumulating many weak or symbolic sources.
## 9. Speakability

Speakability is constrained by:
- the source's consent posture;
- Sanctuary;
- third-party/privacy boundaries;
- epistemic kind;
- current inquiry;
- whether direct quotation/detail is needed;
- whether a higher-level relation can be described without exposing protected source content.

MAIA may sometimes say:

> “There is something in your wider relational history that appears relevant, but I should not bring its details into this inquiry unless you open that context.”

That is preferable to silently using protected detail or pretending the context does not exist.

## 10. Sanctuary

Sanctuary is prior to relational richness.

Sanctuary-originated material that is not lawfully retained cannot participate in later Indra's Web synthesis.

A current Sanctuary act must suppress cross-session retrieval according to existing Sanctuary law.

Indra's Web creates no Sanctuary exception.
## 11. Closing and revocation

The member may narrow the aperture during the conversation.

Examples:

- “Don't use Astrology for this.”
- “Stay only with what I said today.”
- “Leave my relationship history out.”
- “Don't connect this to my dreams.”

Once narrowed:
- newly excluded sources stop influencing subsequent synthesis;
- relations dependent on excluded material lose that support for the current act;
- MAIA should not continue repeating conclusions whose basis the member has just withdrawn.

Closing an aperture is not deletion of the underlying source.
It is withdrawal of permission for this inquiry.
## 12. Center invitation and disclosure

Movement toward the center does not imply wider retrieval.

MAIA may invite:

> “Would it help to look at this from the wider field?”

The member's acceptance must still resolve **which facets or source classes** enter.

“Come to the center” is a contemplative invitation, not a blanket data-permission gesture.

The Buddha-center experience is therefore phenomenologically expansive while remaining informationally governed.

## 13. No-build boundary

This contract authorizes no:
- retrieval implementation;
- permission database;
- context ledger;
- prompt injection;
- UI control;
- facet switch;
- memory write;
- migration;
- automatic context broadening;
- production behavior.

It defines the exact semantic obligations future runtime work must satisfy.
