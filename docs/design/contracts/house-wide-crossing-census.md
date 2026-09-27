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
| Relationships | Talk / Write with MAIA here | MAIA-in-Relationship Space | live |
| Relationships | Something is changing here | Changes | live |
| Relationships | There is a choice here | Decisions | live |
| Relationships | Write about this | Journal | live |
| Idea Shift | Name this shift as a change | Changes | live |
| Idea Decision | Take this decision forward | Decisions | live |
| Change | Carry this into today | Daily Anchor | live |
| Personal Decision | Hold this choice today | Daily Anchor | live |
| Reflection | Carry this with me today | Daily Anchor | live |
| Writer's Studio | Discuss with MAIA | MAIA-in-Studio | partial |
| Astrology | Discuss with MAIA | MAIA | partial |

Living Field may project the durable relations above but may not invent additional edges.

## 5. Census findings and reconciliation status

### Relationships → MAIA

**Registry reconciliation is now complete.**

Relationship Space already supported explicit in-place MAIA gestures: **Talk with MAIA here** and **Write with MAIA**. The Living Orientation registry now names that existing runtime as `relationship-maia-in-place`; no new MAIA route, context loader, or UI behavior was introduced by the reconciliation.

**Classification:** live existing-runtime / registry reconciled.
**Authority:** member explicit.
**Carrier:** exact relationship identity plus bounded relationship-space context under the existing authorship/inference discipline.
**Never carry automatically:** inferred bond meaning, diagnosis, motive, attachment label, or a claim about the other person's interiority.

The current member report outranks stale or inferred context. MAIA remains inside Relationship Space rather than absorbing the relationship into a generic chat destination.

### Dream

**This census finding has been superseded by the DREAM-01 → DREAM-03 programme.**

Dream is now a first-class House facet with a canonical member-owned Dream room, real read/capture, and exact Journal ↔ Dream identity continuity. The remembered dream remains the primary object and is not duplicated merely to cross rooms.

Dream cognition remains separately governed and unopened at DREAM-03. The next Dream boundary is the Encounter conversation contract/runtime; this census does not authorize that cognitive act or any additional symbolic crossing.

Current governing law:

> the remembered dream is the member-authored primary object; symbols, astrology, divination, and MAIA may enter only through separately governed optional lenses, never as authoritative explanations of what the dream means.

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
| Change → Practices | **Choose a practice for this** | explicit carry | lets embodiment support transition without automatic prescription |
| Idea → Writing | **Develop this in Writer's Studio** | explicit carry | lets an idea become material without declaring it a manuscript |
| Wisdom / Library → Writing | **Bring this source into the work** | explicit source carry | source citation/provenance travels; source text does not become authorship |
| Astrology → Journal | **Write with this in view** | explicit contextual carry | calculated/symbolic context may accompany a blank page |
| Astrology → Daily Anchor | **Keep this timing in view today** | explicit carry | only member-selected transit/cycle context; never a prescription |
| Divination → Journal | **Write with this in Journal** | **live** | typed symbolic provenance accompanies a blank Journal page; member-authored keep atomically records an identity-only relation |
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

1. **Registry reconciliation:** Relationships → MAIA is now canonically registered without changing behavior.
2. **Ontology reconciliation:** Dream is now settled as a first-class House facet through DREAM-03; Practices still requires navigation/ontology adjudication before cross-facet implementation.
3. **Daily continuity:** Change / Personal Decision / Reflection → Daily Anchor is now live. Each source enters as read-only provenance; the Anchor remains blank until the member authors and keeps today's thread. Dream → Daily Anchor now extends the same law into symbolic continuity while carrying only the canonical remembered Dream, not interpretation.
4. **Relational continuity:** Relationship → Journal / Change / Decision is now live with strict provenance and no inferred relational meaning; any further relational crossings require a distinct human need and receiving substrate.
5. **Creative continuity:** Idea → Writer's Studio, then only separately Idea → Change / Decision where the member has authored an explicit shift/decision block.
6. **Symbolic continuity:** Dream → Daily Anchor is now live as a raw-source provenance crossing only. Astrology / Divination → Journal or Anchor remain unimplemented until source fact, symbol, synthesis, and lived meaning are visibly distinguishable in the receiving surface.
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

## 13. Current standing and next boundary

> **FACET-FLOW-02 MAP ACCEPTED · FIRST CROSSING FAMILIES IMPLEMENTED · MEMBER AUTHORSHIP LAW HOLDING**

Since the original census stop, Dream has become a first-class House facet, Relationships → MAIA has been registered, Journal / Reflection / Idea / Relationship crossings have been made durable, and Change / Personal Decision / Reflection → Daily Anchor has been witnessed. Dream → Daily Anchor now proves the first symbolic-continuity edge without importing interpretation.

FACET-FLOW-03 is now complete as an epistemic readiness contract. It found Dream ready, Divination partially ready, and Astrology not ready for Journal/Anchor carry. FACET-FLOW-04 then built and locally witnessed a typed Divination source packet plus a non-persisting Journal/Anchor receiver prototype.

FACET-FLOW-05 then promoted only the Journal side into one durable crossing. The real Saved Readings doorway, blank Journal arrival, atomic keep, durable typed provenance, exact return, and zero-residue cleanup all passed locally.

The current boundary is:

> **FOUNDER ADJUDICATION — FACET-FLOW-05 REAL JOURNAL EXPERIENCE**

Divination → Journal is locally proven. Divination → Daily Anchor remains closed until the real Journal experience is accepted as keeping symbolic context sufficiently secondary to member authorship. Astrology remains closed until its own typed chart-context packet exists. Practices remains a separate ontology/navigation decision.
