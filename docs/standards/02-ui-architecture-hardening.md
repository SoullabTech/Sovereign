# Standard 2: UI Architecture Hardening

> Move from "working shell" to "canonical architecture" with no duplicate ownership, no hidden inconsistencies, and minimal prop complexity.

## Purpose

The spatial shell works. Now it must become the single source of truth for MAIA's UI, with clear component boundaries, no duplicated logic, and predictable state flow.

## Non-Negotiable Rules

### R1. Single ownership per concern
Every piece of UI logic must have exactly one owner. No sheet, modal, or navigation action may be triggered from two different code paths unless one is explicitly a fallback for the other.

### R2. No inline UI blocks > 50 lines
Any inline JSX block exceeding 50 lines in `page.tsx` should be extracted to a named component. Page.tsx is a composition root, not a rendering engine.

### R3. Feature flag safety
Both code paths (flag on / flag off) must be independently testable. No shared mutable state between paths. The legacy path must remain byte-for-byte identical to its pre-spatial-shell state.

### R4. Props over events for parent-child
Use props for direct parent-child communication. Reserve window CustomEvents only for cross-tree communication (voice bridge). Never use events where props would work.

### R5. No orphaned imports
Every import must be used. Every component must be rendered in at least one active code path. Dead code must be removed, not commented out.

## Current Gaps

| Gap | Severity | Location | Fix |
|-----|----------|----------|-----|
| page.tsx still manages 20+ sheet state variables | MEDIUM | `app/maia/page.tsx` | Lift sheet state to a `MaiaSheetContext` in Phase 8. Not blocking for default-on. |
| Voice presence state derivation is coarse | LOW | `app/maia/page.tsx` line ~680 | Maps `hasActiveSession` to `'listening'`. Acceptable for now. Finer mapping needs ContinuousConversation event wiring. |
| Amplitude hardcoded to 0 | LOW | `app/maia/page.tsx` line ~681 | Center field particles won't respond to actual voice volume until wired. Not blocking. |
| MaiaShell mock insight timer uses setTimeout chain | LOW | `components/maia/MaiaShell.tsx` | Works but should use setInterval or be extracted to a hook when real signals replace mocks. |
| Legacy path in page.tsx is ~1200 lines | LOW | `app/maia/page.tsx` legacy branch | Expected. Will be removed when flag defaults on. |

## Component Ownership Matrix

| Concern | Owner | Location |
|---------|-------|----------|
| Layout composition | MaiaShell | `components/maia/MaiaShell.tsx` |
| Top utility bar | MaiaTopBar | `components/maia/MaiaTopBar.tsx` |
| World navigation | MaiaLeftRail | `components/maia/MaiaLeftRail.tsx` |
| Contextual panels | MaiaRightPanelHost | `components/maia/MaiaRightPanelHost.tsx` |
| Center field atmosphere | MaiaCenterField | `components/maia/MaiaCenterField.tsx` |
| Conversation engine | OracleConversation | `components/OracleConversation.tsx` (untouched) |
| All modals/sheets | MaiaModalManager | `components/maia/MaiaModalManager.tsx` |
| Account menu | AccountDropdown | `components/maia/AccountDropdown.tsx` |
| Voice state broadcast | VoiceStateProvider | `lib/maia/voiceStateContext.tsx` |
| Voice nav dispatch | voiceNavigationBridge | `lib/maia/voiceNavigationBridge.ts` |
| Navigation config | maiaNav | `lib/navigation/maiaNav.ts` |
| Feature flags | feature-flags | `lib/utils/feature-flags.ts` |

## Acceptance Criteria

- [ ] No UI concern has two owners
- [ ] page.tsx spatial path contains only composition logic (no inline rendering > 50 lines)
- [ ] Feature flag toggle produces no visual glitch, state leak, or console error
- [ ] All spatial shell components are individually importable and typed
- [ ] Zero orphaned imports in spatial shell files

## Recommended Sequence

1. Remove console.log from MaiaModalManager (immediate)
2. Annotate mock signals with removal timeline
3. Extract sheet state context (Phase 8, post-standards)
4. Wire finer voice presence state from ContinuousConversation (Phase 8)
5. Wire amplitude from audio level callbacks (Phase 8)
6. Remove legacy path when flag defaults on (Phase 9)
