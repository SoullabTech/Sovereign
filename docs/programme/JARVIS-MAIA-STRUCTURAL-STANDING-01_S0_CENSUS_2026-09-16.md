# JARVIS-MAIA-STRUCTURAL-STANDING-01 — S0 Standing Census

**Date:** 2026-09-16
**Mode:** read-only source census
**Production authority:** NONE

## Finding 1 — CanonicalTurn already knows standing

`lib/maia/canonical-turn/producerRegistry.ts` classifies every registered producer on separate axes:

- `authoredBy`
- `participationClass`
- `authority`
- provenance chain
- consent basis
- room eligibility

`CandidateBlock` contains only producer identity + text. `adjudicateParticipation()` joins the closed registry and creates `Participant`, which carries the three standing axes beside the text. `TurnParticipationManifest` preserves the axes for audit.

## Finding 2 — the cognition renderer drops those axes

`renderTurnForCognition()` sorts admitted participants and renders `participants.map(p => p.text)`.

Therefore CanonicalTurn standing is **present in the structural object and absent from the ordinary model-facing participant representation**.

This is not yet a universal serving claim:

- `/list` constructs CanonicalTurn in shadow.
- Writer's Studio has a live CanonicalTurn path through `maiaService`.

So the standing-loss seam is live in at least the Studio path and shadowed elsewhere.

## Finding 3 — stronger precedents already exist elsewhere

### Editorial discourse
Authorship and authored relationships are structural. Member and MAIA records are different types; lineage (`refersTo`, `supersedes`) survives rather than being reconstructed from timing. The system may carry authored acts; it may not manufacture them.

### Writer observation standing
`UNKNOWN` is explicitly not `UNSET`. If standing cannot be reached, the member cannot act from an invented null state.

### Relationship rupture containment
A technical provenance label is explicitly ruled insufficient to establish member authorship. Because the current schema cannot positively prove member declaration, strong rupture assertions fail closed.

### Session Review
Interpretive claims are already conceptually separated as Said / Observed / Tentative, but the distinction is model-instructed rather than structurally enforced.

## S0 architectural consequence

The repo does not lack a provenance vocabulary. It lacks a composition boundary that keeps that vocabulary authoritative while allowing generative freedom.

A renderer that merely prepends `[member]`, `[system]`, `[infer]` would expose standing but would still delegate compliance to the same model that can ignore or reinterpret those labels. S1 therefore tests a stronger shape: the model chooses **references and synthesis**, while a deterministic envelope owns **standing and rendering class**.

## Standing

```text
S0 standing census        ✅ COMPLETE
production changes        ⛔ NONE
renderer repair           ⛔ NOT AUTHORIZED
S1 Standing Envelope      AUTHORIZED OFFLINE
```
