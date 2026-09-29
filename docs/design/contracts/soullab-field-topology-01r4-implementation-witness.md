# SOULLAB-FIELD-TOPOLOGY-01R4 — LivingConstellationPanel Replacement Implementation Witness

**Class:** presentation-only implementation
**Frozen visual law:** R3B / R3C
**Base:** `ebc0602de2053f071862ea0e9bbbea3ca0ac8d05`
**Implementation target:** `components/maia/living-constellation/LivingConstellationPanel.tsx`

## What changed

The existing three-peer-card constellation presentation was replaced with the accepted perspectival field grammar:

> presence → constellation → horizon → possible movement

The component remains shared by Living Field, Vision Studio, and Practice Field through the existing `focus="living" | "vision" | "practice"` contract.

## Living Field

Living Field is now the encompassing presentation surface rather than a card inside itself.

The quiet state shows:

- humane orientation copy;
- **You are here**;
- up to three admitted Living Field nodes;
- **Develop something**;
- **Meet others through your work**;
- one **See the wider field** control.

The widened state is local presentation state only.

It reveals all admitted Living Field nodes and expands the background horizon without changing projection data, source standing, or persistence.

## Vision Studio and Practice Field

Vision Studio foregrounds:

> **Develop what wants to become more real.**

Practice Field foregrounds:

> **Tend how your work meets other people.**

Each perspective:

- shows only its own admitted projection nodes as foreground material;
- retains one optional adjacent Vision ↔ Practice pathway only when the adjacent domain already has admitted material;
- offers **Widen to Living Field** as context / return;
- offers **Return to where you were**;
- draws no semantic edge between domains or nodes.

Adjacency is therefore navigational possibility, not inferred relationship.

## Provenance and accessibility

Every visible node retains textual standing rather than relying on color alone.

The member-facing standing line preserves:

- authorship class;
- explicit practitioner sharing where present;
- projected standing.

Examples include:

- `authored · active`;
- `confirmed · shared with practitioner · carried`;
- `suggested possibility · candidate`;
- `practitioner authored · private · contained`.

The projection object itself is unchanged.

## Collision-safe presentation

Runtime placement is deterministic and collision-safe.

Desktop uses normal-flow responsive grids with bounded visual staggering rather than absolute coordinates.

Because transforms are deliberately small relative to row gaps, spatial variation cannot collapse text rectangles into neighboring rows.

Mobile removes horizontal competition entirely through a single-column flow while preserving the horizon behind the material.

No node is positioned through semantic similarity or inferred relation.

## Existing constitutional invariants preserved

R4 does not change:

- `LivingConstellationProjection`;
- projection source adapters;
- API route or fetch path;
- authenticated member scoping;
- node admission;
- authorship values;
- privacy values;
- standing values;
- `member:center = orientation_only`;
- persistence;
- schema;
- consent;
- sharing;
- source provenance.

The existing read-only projection contract remains the source of truth.

The client still performs GET-only projection retrieval and introduces no POST / PUT / PATCH / DELETE behavior.

## Visual witness

The actual React component was rendered through a temporary local-only witness page using synthetic projection fixtures and browser interception.

No production or member data was loaded.

Eight screenshots were captured:

- Living Field collapsed — desktop / mobile;
- Living Field widened — desktop / mobile;
- Vision Studio — desktop / mobile;
- Practice Field — desktop / mobile.

The temporary witness route and capture script were removed after capture and are not part of the candidate.

One screenshot contains a pre-existing global **Audio enabled** toast emitted by the surrounding app shell. It is outside `LivingConstellationPanel` and was intentionally not repaired in this presentation lane.

## Mechanical witness

Existing LC-02 projection contract:

- 8 / 8 tests PASS;
- shared component remains mounted in all three rooms;
- read-only fetch remains GET-only;
- semantic-edge refusal language remains present.

Boundary audit before candidate freeze requires:

- only `LivingConstellationPanel.tsx` plus design witness / screenshots may differ;
- zero API / projection / source-adapter / schema / database / consent mutations;
- `git diff --check` PASS.

## Stop law

R4 stops at an implementation candidate and visual witness.

**No merge. No deployment.**

## Typecheck control

Repository typehealth was run on the R4 candidate after the temporary witness route was removed.

R4 result:

- program files: 4536;
- errors: 223;
- one reported new diagnostic: `app/dev/writers-studio-full-redesign-review/FullRedesignReviewClient.tsx:78 — Cannot find name 'LARGER'`.

The identical no-regression gate was run on untouched frozen R3B.

R3B control result:

- program files: 4535;
- errors: 223;
- the exact same sole diagnostic at the exact same file / line.

Therefore R4 introduces zero additional TypeScript diagnostics. The remaining gate failure is pre-existing and outside this lane.
