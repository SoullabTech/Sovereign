# Standard 1: Product Doctrine Enforcement

> Every change must be evaluated against `docs/MAIA_DESIGN_DOCTRINE.md` before implementation.

## Purpose

Prevent drift from the spatial and talk-first architecture through binding rules, not suggestions. The doctrine is a constitution, not a style guide.

## Non-Negotiable Rules

### R1. Center sovereignty
The MAIA center field must remain the primary locus of visual attention. No component may compete with it for dominance. Any change that reduces center field area, introduces overlapping chrome, or adds attention-drawing elements outside the center requires explicit doctrine review.

### R2. No new surfaces
Do not create new navigation surfaces, panels, drawers, toolbars, or floating elements while the SacredLabDrawer (legacy) still exists in the codebase. Every new UI element must replace or absorb an existing one.

### R3. Worlds not tools
Every user-facing destination must be framed as a world (a mode of entering reality), not a tool or feature. Labels, descriptions, and interactions should reflect this. "Open Journal" not "Use Journal Tool."

### R4. Studio boundary
Studio must never appear inside the MAIA shell layout. It is always a separate route (`/studio`) with its own layout. No Studio UI components may be rendered within MaiaShell.

### R5. Voice primary
Any UI element that could be replaced by a voice interaction should be evaluated for removal. New UI is approved only if it orients, deepens, or supports action — never if it merely exposes architecture.

### R6. Progressive reveal only
Information should appear when relevant, not simultaneously. Right panel content should surface contextually. No panel should pre-load all possible content.

### R7. Calm over capability
When in doubt between showing more and showing less, show less. The system should default to quiet presence, not visible helpfulness.

## Current Gaps

| Gap | Severity | Location | Fix |
|-----|----------|----------|-----|
| SacredLabDrawer still exists alongside spatial shell | LOW (flag-gated) | `components/ui/SacredLabDrawer.tsx` | Not rendered in spatial path. Remove entirely when flag defaults on. |
| Mock cognition signals have no frequency governance | MEDIUM | `components/maia/MaiaShell.tsx` | Must be replaced by real signals or removed before default-on. See Standard 5 (cognition). |
| 3 console.log() in MaiaModalManager | LOW | `components/maia/MaiaModalManager.tsx` lines 137, 144, 150 | Replace with structured logging or remove. |
| Legacy account bottom sheet still in page.tsx (legacy path) | LOW | `app/maia/page.tsx` legacy branch | Acceptable — only rendered when flag is off. |

## Acceptance Criteria

Before `spatialMaiaShell` defaults to `true`:

- [ ] All components pass doctrine evaluation (no center competition, no new surfaces, no exposed architecture)
- [ ] SacredLabDrawer is not rendered in any active code path
- [ ] Mock cognition signals replaced with governed real signals or removed
- [ ] Console.log statements removed from modal manager
- [ ] No component introduces visible architecture that wasn't in the restructuring plan
- [ ] Talk-first evaluation passes: no element competes with voice relationship

## Recommended Sequence

1. Remove console.log from MaiaModalManager
2. Annotate mock signals as `// TEMPORARY: remove before default-on`
3. Run doctrine review on every component file
4. Gate default-on behind these criteria
