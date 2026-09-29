# SOULLAB-FIELD-TOPOLOGY-01R3 — Perspectival Constellation Visual Composition Witness

**Class:** design prototype only
**Frozen R2:** `ca373ba6fe61722ee2233cf66b4d4066aefbf9dd`
**Target:** future replacement presentation for `LivingConstellationPanel`
**Implementation authority:** none

## What was prototyped

A standalone docs-only HTML composition demonstrates four states:

1. Living Field — collapsed / quiet
2. Living Field — expanded / wider field
3. Vision Studio — foreground with Living Field as wider context
4. Practice Field — foreground with Living Field as wider context

The prototype is not imported by the application and is not reachable from runtime routes.

## Visual law witnessed

The compositions successfully shift the topology from:

> three peer product cards around a center

to:

> one Living Field experienced from different perspectives.

Living Field is never shown as its own peer card inside the Living Field view.

Vision Studio and Practice Field foreground their own admitted material while Living Field appears only through context language and a quiet **Widen to Living Field** action.

Vision ↔ Practice appears as one optional adjacent direction, with explicit language that adjacency does not imply semantic relation.

## Desktop hierarchy

At 1440×1100:

- perspective title and member-facing purpose dominate;
- admitted local material carries the main visual weight;
- directional affordances remain secondary;
- wider-field context is visually quieter than foreground material;
- the field uses subtle spatial rings only as atmosphere, not as semantic edges;
- provenance / governance notes remain subordinate.

Living collapsed remains intentionally sparse.

Living expanded adds more field material without turning the display into a dashboard grid.

## Mobile hierarchy

At 390×844:

- title and orientation remain legible before any topology detail;
- local nodes stack first;
- adjacent direction follows the foreground rather than competing with it;
- widen / return controls follow after the possible adjacent movement;
- expanded Living Field reveals additional context vertically without hiding source standing.

An initial Vision / Practice composition duplicated adjacency and widening language.

The visual witness caught that repetition. The prototype was corrected so Vision and Practice now show exactly:

> foreground material → one adjacent direction → widen / return

This better satisfies the R2 quiet-state law.

## Evidence

Prototype:

`docs/design/prototypes/soullab-field-topology-01r3/index.html`

Captured at desktop 1440×1100 and mobile 390×844:

- `living-collapsed-desktop.png`
- `living-collapsed-mobile.png`
- `living-expanded-desktop.png`
- `living-expanded-mobile.png`
- `vision-desktop.png`
- `vision-mobile.png`
- `practice-desktop.png`
- `practice-mobile.png`

All screenshots use synthetic presentation content only.

No production or member data was loaded.

## R2 law preservation

The prototype preserves:

- Living Field as wider context rather than peer card;
- Vision and Practice as perspective-dependent foregrounds;
- adjacency as navigation, not inferred relation;
- member-center orientation only;
- quiet collapsed state;
- deliberate expanded state;
- member-facing verbs: widen, develop, meet others, return;
- authorship / confirmation / candidate / practitioner standing;
- privacy and provenance visibility;
- zero semantic-edge claims.

## Stop law

No `LivingConstellationPanel` code changed.

No runtime component, API, projection type, persistence model, privacy rule, source adapter, route, schema, or database surface changed.

**STOP before implementation.**
