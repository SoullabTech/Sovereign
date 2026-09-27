# House-Wide Crossing Census + Missing-Journey Design

**Programme:** SOULLAB-LIVING-ORIENTATION / FACET-FLOW-02  
**Date:** 2026-09-27  
**Scope:** census and design only — no runtime mutation, route mutation, schema change, or new crossing authority.

## 1. Purpose

The House is not a set of destinations. It is one life encountered through distinct facets.

FACET-FLOW-02 asks which movements between facets are genuinely meaningful, which are only navigation, which MAIA may suggest, which require an explicit member act, and which must never happen automatically.

The governing rule remains:

> **Relationship may be carried. Meaning may not be silently promoted.**

A crossing is not admitted merely because two subsystems can technically read one another.

## 2. Crossing classes

| Class | Meaning | Authority |
| --- | --- | --- |
| **Navigation** | The member moves rooms; no semantic object crosses. | member explicit navigation |
| **Explicit carry** | A named source object accompanies the member into a receiving facet. | member explicit |
| **Explicit persistence** | The member completes the receiving facet's own authorship act and a durable relation is written. | member explicit |
| **Standing contextual consent** | A bounded source may recur in MAIA context until consent is withdrawn. | member standing consent |
| **Read-only projection** | Living Field shows relations already created elsewhere; it creates none. | read-only system projection |
| **Suggested doorway** | MAIA may name an available next room or gesture, but cannot execute it. | suggestion only |
| **Forbidden automatic promotion** | The system would infer, classify, decide, remember, or persist meaning on the member's behalf. | never automatic |

## 3. Current House census

The current member-facing architecture contains two overlapping registries that are not fully identical:

- lib/house/catalog.ts — semantic facet vocabulary;
- lib/navigation/houseDestinations.ts — actual House navigation policy.

That difference is now part of the design problem rather than something to smooth over.

### 3.1 Admitted semantic facets

Current semantic facets are:

Writing, Relationships, Practices, Community, Studio, Decisions, Astrology, Journal, Reflections, Ideas, Changes, Wisdom, Library, Divination, Living Field, Co-lab, and Daily Anchor.

MAIA is intentionally not another peer facet. MAIA is the host / relational intelligence that may accompany a member inside or between facets under explicit context rules.

### 3.2 Navigation-only or differently named House places

The navigation registry additionally contains or distinguishes MAIA, Pro Studio, Writer's Studio, Keeps, Circles, Vision Studio, Book Studio, and Settings.

Conversely, the semantic catalog contains Practices, Community, Decisions, Library, and Divination in forms that do not map one-to-one onto the current House destination registry.

**Design consequence:** FACET-FLOW-02 does not normalize these registries. Ontology and navigation must be adjudicated before a missing door is treated as a missing crossing.

## 4. Existing governed crossings

Already governed in lib/house/livingOrientation.ts:

| Source | Gesture / relation | Target | Standing |
| --- | --- | --- | --- |
| Journal | Reflect with MAIA | MAIA | live |
| MAIA | Write from here | Journal | live |
| Reflections | Discuss with MAIA | MAIA | live |
| Daily Anchor | MAIA may remember this with me | MAIA | live |
| Divination | Consult with MAIA | MAIA | live |
| Divination | Save Reading | Reflections | live |
| Wisdom | Reflect with MAIA | MAIA | live |
| Ideas | Ask MAIA | MAIA-in-Idea thread | live |
| Journal | Keep as a reflection | Reflections | live |
| Journal | Name this as a change | Changes | live |
| Reflections | Name a change | Changes | live |
| Journal | Consider a decision | Decisions | live |
| Reflections | Consider a decision | Decisions | live |
| Idea Shift | Name this shift as a change | Changes | live |
| Idea Decision | Take this decision forward | Decisions | live |
| Writer's Studio | Discuss with MAIA | MAIA-in-Studio | partial |
| Astrology | Discuss with MAIA | MAIA | partial |

Living Field may project the durable relations above but may not invent additional edges.

## 5. Census finding: real crossings not yet represented canonically

### Relationships → MAIA

The Relationship Space already supports explicit in-place MAIA gestures: **Talk with MAIA here**, **Write with MAIA**, and relationship check-ins that explicitly request MAIA reflection.

The substrate is real and member-triggered. The Living Orientation registry simply does not yet name it.

**Classification:** existing-runtime / registry-debt.  
**Proposed authority:** member explicit.  
**Carrier:** exact relationship identity plus bounded relationship-space context selected by the existing surface.  
**Never carry automatically:** inferred bond meaning, diagnosis, motive, attachment label, or a claim about the other person's interiority.

This is a documentation/registry reconciliation candidate, not a new experience invention.

### Dream

Dream substrate exists (/api/dreams, Dream interfaces, older archive/lab surfaces), but Dream is not presently an admitted House facet in either canonical House registry.

The existing dashboard surface also contains simulated/example metrics and interpretive classifications, so it cannot be treated as canonical member substrate merely because files exist.

**Classification:** ontology adjudication required before crossing design.  
**Do not yet authorize:** Dream → MAIA, Dream → Journal, Dream → Reflection, Dream → Astrology, or Dream → Divination.

If Dream becomes a House facet, the likely first law is:

> the remembered dream is the member-authored primary object; symbols, astrology, divination, and MAIA may enter as optional lenses, never as authoritative explanations of what the dream means.

### Practices

A real /practices member room and practice APIs exist, and catalog.ts names Practices as a semantic facet. The current House destination registry does not expose a corresponding destination.

**Classification:** navigation / ontology reconciliation required before cross-facet implementation.

A practice should not be automatically prescribed from a Change, Decision, Relationship, dream, astrology reading, or MAIA interpretation.

Potential future crossing: **Choose a practice for this** — member explicit, with the originating object retained as provenance and the practice still chosen by the member.

### Decisions

Personal Decisions has real receiving substrate and is already reached from Journal and Reflections, while older House navigation commentary contains a superseded/practitioner-only distinction.

**Classification:** substrate is real; navigation naming and audience history require care.  
FACET-FLOW-02 treats Personal Decisions as a receiving facet where already proven, not as authority to expose or merge practitioner decision systems.

## 6. Missing journeys worth designing

These are candidate journeys, not implementation authority.

| Human movement | Candidate gesture | Classification | Why |
| --- | --- | --- | --- |
| Change → Daily Anchor | **Carry this into today** | explicit carry | lets a long change become one chosen daily thread |
| Decision → Daily Anchor | **Hold this choice today** | explicit carry | supports fidelity after choosing without turning Anchor into task management |
| Change → Practices | **Choose a practice for this** | explicit carry | lets embodiment support transition without automatic prescription |
| Relationship → Journal | **Write from this relationship** | explicit navigation/carry | preserves the relationship as context while leaving the page blank |
| Relationship → Change | **Something is changing here** | explicit persistence | member names the change; relationship is provenance only |
| Relationship → Decision | **There is a choice here** | explicit persistence | member authors the choice; MAIA cannot infer it |
| Idea → Writing | **Develop this in Writer's Studio** | explicit carry | lets an idea become material without declaring it a manuscript |
| Wisdom / Library → Writing | **Bring this source into the work** | explicit source carry | source citation/provenance travels; source text does not become authorship |
| Astrology → Journal | **Write with this in view** | explicit contextual carry | calculated/symbolic context may accompany a blank page |
| Astrology → Daily Anchor | **Keep this timing in view today** | explicit carry | only member-selected transit/cycle context; never a prescription |
| Divination → Journal | **Write from this question** | explicit contextual carry | symbolic reading remains source; journal remains member-authored |
| Reflection → Daily Anchor | **Carry this with me today** | explicit carry | allows a kept recognition to become today's chosen thread |
| MAIA → facet doorway | **Go there / open that room** | suggested doorway | MAIA may suggest a relevant room but never create its object |
| Any durable crossing → Living Field | none | read-only projection | Field reveals established relation, never authors one |

## 7. Crossings that should usually remain navigation only

Ordinary room-to-room movement is not evidence of psychological relationship.

Examples include House → Astrology, House → Relationships, House → Journal, House → Writer's Studio, Journal → House, Relationships → House, and Settings → House.

No provenance edge should be created simply because the member visited one room after another.

## 8. What MAIA may suggest

MAIA may say that a doorway exists when the conversation itself makes that doorway relevant, for example:

- “Would you like to write from here?”
- “You could name this as a change.”
- “There may be a decision here if you want to explore it.”
- “Would you like to carry this into today's Anchor?”
- “A practice might help you stay with this.”

A suggestion is **not** a crossing.

MAIA may not pre-create the receiving object, prefill its meaning-bearing fields, silently attach provenance, or treat refusal/non-response as consent.

A suggested doorway should disappear back into ordinary conversation if the member does not take it.

## 9. Crossings MAIA must never perform automatically

The following are constitutionally disallowed without a future explicit adjudication:

1. Journal → MAIA memory merely because something was written.
2. Journal / Reflection / Relationship → Change because MAIA detects “transition.”
3. Any source → Decision because MAIA detects a choice.
4. Change / Decision → Practice because MAIA decides what the member “needs.”
5. Relationship material → diagnosis, attachment classification, motive, compatibility verdict, or claim about another person's interior state.
6. Astrology / Dream / Divination → factual verdict about identity, destiny, diagnosis, relationship outcome, or required action.
7. Symbolic material → durable member memory merely because it appears significant.
8. Any room → Living Field edge inferred only from semantic similarity.
9. MAIA conversation → Journal, Reflection, Idea, Change, Decision, or Anchor without an explicit keep/carry/authorship gesture.
10. Private-life material → Co-lab, Community, Pro Studio, or other shared/professional space merely because the same member has access to both.

These prohibitions protect differentiation, consent, and the member's authorship of meaning.

## 10. Objects that must remain deliberately separate

### Journal and Reflection
Journal is lived writing. Reflection is something deliberately kept. Neither is a hidden alias of the other.

### Relationship and Journal
The relationship is not the note written about it. Journal may carry relationship provenance without becoming the relationship record.

### Change and Decision
A change is something being lived through. A decision is something being chosen. One may contain the other, but neither implies the other.

### Daily Anchor and task / goal
Anchor is a thread of return inside an actual day, not a productivity commitment.

### Dream and symbolic interpretations
The dream report is primary. Astrology, divination, archetypal language, and MAIA reflection are secondary lenses.

### Astrology and identity
Calculated chart facts are distinct from symbolic tradition, synthesis, possible expression, present activation, and lived meaning.

### Wisdom / Library and member meaning
A source remains a source. Quotation, commentary, and the member's own response remain distinguishable.

### MAIA and every facet
MAIA accompanies; MAIA does not absorb the object model of the House.

## 11. Proposed sequencing after adjudication

The next implementation programme should not be “connect everything.”

1. **Registry reconciliation:** name the already-existing Relationships → MAIA crossing without changing behavior.
2. **Ontology adjudication:** settle Practices and Dream as House facets before crossing work.
3. **Daily continuity:** prototype Change / Decision / Reflection → Daily Anchor because the receiving act can remain extremely small and member-authored.
4. **Relational continuity:** design Relationship → Journal / Change / Decision with strict provenance and no inferred relational meaning.
5. **Creative continuity:** Idea → Writer's Studio, then only separately Idea → Change / Decision where the member has authored an explicit shift/decision block.
6. **Symbolic continuity:** Astrology / Divination / future Dream → Journal or Anchor only after the distinction between source fact, symbol, synthesis, and lived meaning is visible in the receiving surface.
7. **Living Field:** project only relations made durable elsewhere.

Each implementation act must stop again before expansion to the next family.

## 12. Acceptance criteria for FACET-FLOW-02

This design act is complete when:

- every currently admitted facet is accounted for;
- navigation is distinguished from semantic crossing;
- known live crossings are separated from candidates;
- MAIA suggestion authority is explicitly weaker than member crossing authority;
- forbidden automatic promotions are named;
- Dream and Practices ontology debt is visible rather than silently resolved;
- Relationship → MAIA registry debt is identified;
- candidate journeys specify receiving authorship and source preservation;
- no runtime, schema, route, or persistence behavior has been changed.

## 13. Exact stop

> **FACET-FLOW-02 is a map, not permission to build the map's edges.**

The next act requires founder adjudication of this census, especially:

1. whether **Dream** becomes a first-class House facet;
2. whether **Practices** returns to / enters the current House navigation grammar;
3. whether the already-live **Relationships → MAIA** handoff should be canonically registered;
4. which missing-journey family should be implemented first.

Until that adjudication: **no new crossing implementation.**
