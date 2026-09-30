# JARVIS-VISUAL-FIELD-01 · R1R6R2 — Pointer Hit Surface + Actionability Repair

**Reason opened:** Founder witness: opening physics improved, but cells/worlds were not actionable and cursor-over did not respond.
**Root cause:** global Soullab CSS rule `svg { pointer-events: none; }` inherited through the Living Field SVG.

## Repair

- restore pointer events only on the Living Field SVG;
- explicitly enable world membranes as hit targets;
- explicitly enable cell groups as hit targets;
- explicitly enable transparent relation inspection strokes;
- preserve decorative SVG layers as non-interactive;
- verify with real mouse movement/clicks, not synthetic dispatch only.

## Exit test

A real browser cursor must:
1. wake a nearby cell before exact hover;
2. trigger Glance → Attend → Dwell on the cell;
3. click a world membrane to enter it;
4. click a cell to deepen focus;
5. hover an active relation and reveal its rationale;
6. drag a cell and receive local field response.

No new ontology or intelligence is authorized in this repair.


## Root-cause evidence

Browser-computed styles on the sealed founder witness showed:

```text
Living Field SVG       pointer-events: none
Calling group          pointer-events: none
Calling painted circle pointer-events: none
Air membrane           pointer-events: none
```

The source was a global Soullab stylesheet rule:

```css
svg { pointer-events: none; }
```

The Living Field is an interactive SVG rather than decorative SVG artwork, so it requires an explicit scoped override.

## Repair evidence

Scoped repair:
- Living Field SVG: `pointer-events: auto`
- world membranes: explicit interactive hit targets
- node groups: interactive except when intentionally dimmed behind an active relation
- relation inspection corridors: pointer-events on stroke
- attention detection moved to field-level geometric pointer tracking for reliable SVG behavior
- relation inspection yields priority over nearby-cell attention while crossing an active edge

Real browser mouse witness:

```text
cursor approaches Calling
→ NEARBY
→ exact cell entry
→ GLANCE
→ ATTEND
→ DWELL
→ hover Calling → Stewardship relation
→ BRIDGE DETAIL
→ click Air membrane
→ Air world focus
→ click Calling
→ Air / Calling deep focus
→ Widen
→ drag Calling
→ related neighborhood responds
```

Result: **PASS**
Browser page errors: **0**

## Current standing

**R1R6R2 IMPLEMENTED CANDIDATE — READY FOR FOUNDER ACTIONABILITY WITNESS**
