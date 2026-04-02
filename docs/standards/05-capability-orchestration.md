# Standard 5: Capability Orchestration Standards

> MAIA is the orchestrator. Capabilities are things MAIA invokes, guides, and contextualizes. Users speak — MAIA routes — UI supports.

## Purpose

Define how MAIA transitions from a navigation-driven feature system to a capability-invocation system where the AI orchestrates movement between worlds, sheets, and actions.

## Non-Negotiable Rules

### R1. MAIA routes, user overrides
MAIA may suggest or invoke capabilities. The user may always override, dismiss, or navigate manually. Manual navigation (left rail, direct URL) always works. Capability orchestration is additive, not replacement.

### R2. No silent execution
Every capability invocation must have a visible or audible acknowledgment. The user must know what happened. "Saved to journal" (brief voice acknowledgment) or a right-panel confirmation — never invisible side effects.

### R3. Capability scope must be explicit
Each capability has a defined scope: what it does, what world it opens, what modal it triggers. No capability may have unbounded effects. No capability may modify data without user-visible confirmation.

### R4. Suggestion before execution
For capabilities that create, save, or transition: MAIA must suggest first, then act on confirmation. Exception: voice commands with explicit intent (e.g., "MAIA, save this to journal") may execute directly with acknowledgment.

### R5. No capability sprawl
New capabilities require doctrine review. Each must map to an existing world or modal. No capability may create a new UI surface.

## Capability Lifecycle

```
available → suggested → confirmed → invoked → active → completed → dismissed
```

| State | Who triggers | What happens |
|-------|-------------|--------------|
| `available` | System (context detection) | Capability exists in registry, not yet relevant |
| `suggested` | MAIA (cognition signal) | Right panel shows offer, or MAIA speaks suggestion |
| `confirmed` | User (voice "yes" or tap) | System proceeds to invocation |
| `invoked` | System | World opens, modal triggers, or action fires |
| `active` | System | Capability is in progress (e.g., journal entry being written) |
| `completed` | System or user | Acknowledgment shown, state clears |
| `dismissed` | User ("no" or panel close) | Suggestion removed, no action taken |

## Capability Registry (current)

| ID | World | Modal | Voice Phrases | Status |
|----|-------|-------|---------------|--------|
| `journal.create` | journal | journal-sheet | "capture this thought", "start a journal entry" | Defined, not wired |
| `journal.save` | journal | journal-sheet | "save this" | Defined, not wired |
| `journal.dream` | journal | journal-sheet | "record a dream" | Defined, not wired |
| `astrology.reading` | patterns | — | "show me my chart" | Defined, not wired |
| `astrology.transit` | patterns | — | "current transits" | Defined, not wired |
| `pattern.detect` | patterns | — | "what pattern is this" | Defined, not wired |
| `pattern.show` | patterns | — | "show my patterns" | Defined, not wired |
| `wisdom.surface` | wisdom | — | "what wisdom applies here" | Defined, not wired |
| `wisdom.text` | wisdom | — | "show sacred text" | Defined, not wired |
| `relationship.reflect` | relationships | — | "reflect on this relationship" | Defined, not wired |
| `depth.explore` | depth | — | "go deeper" | Defined, not wired |
| `depth.shadow` | depth | shadow-work | "shadow work" | Defined, not wired |
| `studio.transition` | — | — | "move to studio" | Wired (voice routing) |
| `schedule.create` | — | — | "schedule a session" | Defined, not wired |

## Current Gaps

| Gap | Severity | Fix |
|-----|----------|-----|
| No capability is wired to voice invocation (except studio.transition via world-navigate) | MEDIUM | Wire first 3 capabilities in Phase 8: journal.create, journal.save, journal.dream |
| No suggestion → confirmation flow exists | MEDIUM | Build VoiceDoorway component for right panel offers |
| No capability logging | LOW | Add structured logging per Standard 4 |
| Capabilities have no lifecycle state tracking | LOW | Add state machine when more than 3 capabilities are active |

## Anti-Patterns

| Anti-pattern | Why it's wrong | What to do instead |
|-------------|----------------|-------------------|
| Auto-executing capabilities based on conversation content | Erodes trust, feels intrusive | Always suggest first, confirm, then execute |
| Adding capabilities without world mapping | Creates orphaned features | Every capability must belong to a world |
| Stacking multiple suggestions | Feels like a pushy assistant | Max 1 suggestion at a time |
| Capability invocation without acknowledgment | User doesn't know what happened | Always acknowledge via voice or visual |

## Acceptance Criteria

- [ ] First 3 capabilities wired to voice invocation (journal.create/save/dream)
- [ ] Suggestion → confirmation flow designed and implemented
- [ ] Max 1 active suggestion at a time
- [ ] Every invocation has visible/audible acknowledgment
- [ ] Manual navigation continues to work alongside capability routing
- [ ] No capability creates new UI surfaces

## Recommended Sequence

1. Wire `journal.create`, `journal.save`, `journal.dream` to voice commands
2. Build suggestion → confirmation pattern (VoiceDoorway or inline right panel offer)
3. Wire `depth.shadow` to voice commands (opens shadow work sheet)
4. Add capability logging
5. Wire remaining capabilities one at a time with doctrine review
