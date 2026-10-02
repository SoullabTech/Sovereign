---
room: Living Field — Member-Chosen Lens
human_activity: choosing a perspective through which to explore a path I explicitly made between parts of my life, while keeping evidence, interpretation, and lived meaning distinct
surfaces:
  - components/maia/living-field/LifeFacetFlowPanel.tsx
change_class: experiential
principles:
  - SOULLAB_LIVING_ORIENTATION_SYSTEM — lenses sit over explicit evidence and never replace or outrank it
  - MAIA_OATH — the member sees and can edit exactly what crosses into conversation; no hidden interpretation is sent
  - INHABITABLE_ARCHITECTURE_STANDARD — the lens is a chosen doorway into reflection, not another dashboard classification
reference_surfaces:
  - docs/canon/SOULLAB_LIVING_ORIENTATION_SYSTEM.md
  - docs/design/contracts/life-facet-flow-projection.md
  - components/reflections/DiscussWithMaia.tsx — canonical visible/editable in-place MAIA handoff
shared_with_house: explicit member gesture, visible provenance, reversible entry into MAIA, and no silent propagation
distinct_to_room: the Living Field does not decide which lens applies. It lets the member choose one perspective over a real path already made, previews the exact evidence and epistemic restraint that will travel, then opens the canonical MAIA relationship in place.
screenshot_desktop: docs/design/contracts/screenshots/facet-flow-lens-desktop.png
screenshot_mobile: docs/design/contracts/screenshots/facet-flow-lens-mobile.png
experience_verification: >
  2026-09-27 authenticated local witness on localhost:3597 using one temporary Change created
  from the pre-existing Journal test entry explicitly labelled Safe to delete. The flow rendered under Threads
  across your life. Explore this thread exposed six lens choices: Elemental, Spiralogic, Developmental,
  Relational, Temporal, Symbolic. Choosing Elemental fetched the member-owned source and target evidence only
  after the click, rendered an editable What MAIA will receive preview, and left MAIA closed. Switching to
  Spiralogic replaced the preview with Spiralogic-specific provisional language, did not persist the prior
  lens, and again left MAIA closed. The final Explore with MAIA gesture was deliberately not invoked during
  the witness; canonical presence wiring is pinned in tests. Desktop and narrow-window screenshots contain
  only the safe test source and temporary target. The temporary Change and crossing were removed after capture;
  both residue counts verified zero.
---

# Living Field — Member-Chosen Lens

## Purpose

LOF-02 gives the member a way to explore one explicit facet crossing through a chosen perspective without turning that perspective into a classification.

> **A lens is a perspective over evidence, not authority over the person.**

## Sequence

1. The member sees a real source → target path they previously made.
2. The member chooses **Explore this thread**.
3. Six cross-cutting lenses become available: Elemental, Spiralogic, Developmental, Relational, Temporal, Symbolic.
4. Nothing is fetched or interpreted merely because the panel exists.
5. Choosing one lens fetches only the member-owned source and target evidence for that exact flow.
6. The member sees **What MAIA will receive** as an editable textarea.
7. Only **Explore with MAIA** performs the conversation handoff.

## Evidence law

The preview contains the source and target as they already exist in their own facets. It does not add a semantic edge between them.

Source and target ownership are rechecked server-side when evidence is fetched.

## Lens law

Each lens must preserve its own uncertainty:

- **Elemental** may invite attention to Fire, Water, Earth, Air, and the Fifth; it may not assign elemental identity.
- **Spiralogic** may invite attention to movement, differentiation, integration, return, and threshold; it may not assign a fixed stage.
- **Developmental** may invite consideration of trajectory, tension, threshold, or capacity; it may not rank or diagnose.
- **Relational** may ask what exists between the two moments; it may not erase either one.
- **Temporal** may examine sequence and lived time; sequence is not causation.
- **Symbolic** may open possibilities of meaning; symbol is not fact or prediction.

## Conversation crossing

The final handoff uses the canonical `MaiaPresence.openMaiaWith()` surface when the room can host MAIA in place.

The generated prompt explicitly asks MAIA to distinguish direct evidence from lens-based suggestion and to ask the member about lived meaning rather than deciding it.

The member may edit or clear the prompt before sending.

## Persistence

Choosing, switching, or closing a lens writes nothing.

LOF-02 creates no durable interpretation record, no lens preference, no new graph relation, no score, and no inferred developmental state.

If a future member chooses to keep a lens interpretation, that is a different crossing and requires separate custody and consent law.

## Forbidden

- automatically choosing a lens;
- applying all lenses at once;
- precomputing an elemental or Spiralogic classification;
- silently sending source/target content to MAIA;
- persisting the selected lens without a separate member act;
- writing MAIA's interpretation back onto the crossing;
- treating the lens as evidence that the source caused the target;
- turning the Living Field into a diagnostic dashboard.

## Product test

> **Can I deliberately look at a real path in my life from another angle while remaining able to see what is evidence, what is interpretation, and what is mine to decide?**
