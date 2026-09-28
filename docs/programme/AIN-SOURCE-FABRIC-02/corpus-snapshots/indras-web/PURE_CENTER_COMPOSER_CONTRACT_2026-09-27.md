# AIN-INDRAS-WEB-06 — Pure Center Composer Contract

**Date:** 2026-09-27
**Parent:** AIN-INDRAS-WEB-05
**Standing:** pure composition contract; no live model/runtime authority

## Purpose

Define the deterministic boundary around any future center composer.

The composer receives already-admitted source packets and already-declared candidate relations.

It does **not** retrieve.
It does **not** infer permission.
It does **not** persist.
It does **not** promote standing.
It does **not** decide what the member “really is.”

Its job is to preserve lawful distinctions while preparing a relational composition for MAIA.
## Input contract

```text
CENTER_COMPOSER_INPUT
  inquiry_ref
  active_facet
  center_invited
  sources[]
    source_ref
    facet
    admission_basis
    epistemic_kind
    temporal_relation
    authorship
    standing
    uncertainty
    boundaries[]
    mode = reference | reliance
    speakable
    disclosed
    status = active | excluded | unavailable
  candidate_relations[]
    relation_ref
    endpoint_refs[]
    relation_class
    ain_semantics[]
    standing
    uncertainty
    status
  member_corrections[]
  revoked_source_refs[]
```

Only already-admitted material may appear in this input.
## Output contract

```text
CENTER_COMPOSITION
  inquiry_ref
  active_facets[]
  relied_upon_source_refs[]
  reference_only_source_refs[]
  active_relation_refs[]
  preserved_contradictions[]
  preserved_absences[]
  source_disclosures[]
  gestalt_candidate
    synthesis_frame
    standing = CANDIDATE_UNESTABLISHED
    jurisdiction = maia_conversational_inquiry
    uncertainty
  excluded_claims[]
  no_persistence_authority = true
```

The output is a structured constraint around synthesis, not the final prose response.

Future MAIA wording may be fluid.
The composition boundary may not be.
## Composer invariants

**C01 — No hidden source.**  
Every relied-upon source appears in the receipt/disclosure structure.

**C02 — No excluded source.**  
A source with status excluded/unavailable may not influence active relations or gestalt.

**C03 — No hidden relation.**  
A gestalt proposition that materially links sources must correspond to an explicit relation candidate.

**C04 — No standing inflation.**  
Gestalt standing cannot exceed the strongest lawfully admitted relation standing merely because many sources agree.

**C05 — No symbolic inflation.**  
Symbolic correspondence never becomes causation, outcome, destiny, or empirical confirmation without a separate warrant.

**C06 — No authorship collapse.**  
Member words, computed facts, house text, practitioner interpretation, and MAIA hypothesis remain distinguishable.
**C07 — Contradiction survives.**  
Materially opposing sources must remain visible to the composition unless a later source explicitly supersedes them.

**C08 — Absence survives.**  
Unavailable, silent, or not-relied-upon sources cannot be represented as agreement.

**C09 — Correction changes the field.**  
Member correction can weaken/reject MAIA-proposed relations and dependent gestalt claims.

**C10 — Center does not grant permission.**  
Center invitation cannot change admission basis.

**C11 — Reference is not reliance.**  
Reference-only material cannot support a claim as evidence.

**C12 — No persistence authority.**  
The composer cannot authorize memory, relation storage, or a receiving-facet object.

**C13 — No third-party interiority.**  
Member relationship material cannot establish another person's motive, intention, diagnosis, or inner state.

**C14 — No person-totalizing gestalt.**  
A center synthesis is about this inquiry, not a final model of the member.
## Composition ordering

A future implementation should compose in this order:

1. remove excluded/unavailable sources;
2. apply member corrections/revocations;
3. resolve relation dependencies;
4. mark contradictions and absences;
5. separate reliance from reference;
6. cap relation/gestalt standing;
7. prepare disclosure/accountability trace;
8. permit MAIA to render a provisional gestalt.

This ordering matters.

If synthesis happens before correction or standing caps, the center can become rhetorically authoritative before governance catches up.

## Member authority

The member may:
- confirm one component;
- reject one relation;
- complicate the gestalt;
- leave it unresolved;
- adopt some meaning without adopting the whole synthesis.

Whole-response agreement must not automatically adopt every proposition embedded in the response.
