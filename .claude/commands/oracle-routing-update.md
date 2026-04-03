---
description: "Update symbolic routing in conductor or oracle route"
argument-hint: "route-or-cue-description"
allowed-tools: "Read,Grep,Glob,Write,Edit"
---

# Oracle Routing Update

You are adding or modifying symbolic routing for: **$1**

## Architecture context

Routing in MAIA works through two layers:

1. **Conductor** (`lib/voice/conductor.ts`):
   - Converts oracle state → voice state
   - Enforces element hysteresis (no element switch unless seen 2+ turns or high intensity)
   - Determines `Element`, `VoiceArchetype`, `phase`
   - This is the sole authority for voice/element routing

2. **Oracle route** (`app/api/oracle/conversation/route.ts`):
   - Detects higher-level cues (therapeutic framework, participatory themes, repair signals)
   - Assembles system prompt from multiple layers
   - Delegates to LLM with composed prompt

## Before making changes

1. Read `lib/voice/conductor.ts` fully — understand hysteresis, normalization, and the state machine
2. Read `app/api/oracle/conversation/route.ts` — understand cue detection points and prompt assembly
3. Read `lib/consciousness/participatoryRealityHelper.ts` — understand the theme detection pattern (conservative scoring with fire-and-forget storage)
4. Grep for existing routing patterns: `grep -r "detectCue\|routeScore\|cueDetect\|symbolic" lib/ app/api/oracle/`

## Routing update spec

### 1. What triggers this route
- Exact cues (keywords, semantic patterns, structural signals)
- Detection logic (scoring, threshold, boolean)
- False-positive protections (what should NOT trigger this)

### 2. Where the detection lives
- Conductor (if it's element/voice/phase routing)
- Oracle route (if it's framework/theme/repair routing)
- New helper (if detection logic exceeds ~30 lines)

### 3. What happens when triggered
- Which agent or prompt block is activated
- How it composes with existing layers (additive, not replacing)
- Priority relative to existing routes

### 4. Score adjustments (if applicable)
- Weight relative to other signals
- Decay or boost from memory context
- Conflict resolution (what wins if two routes score equally)

### 5. Tests
- Positive case: input that should trigger
- Negative case: input that looks similar but should not trigger
- Edge case: ambiguous input — what's the correct default?
- Hysteresis case (conductor only): does it respect the 2-turn buffer?

## Constraints

- Routing changes must be conservative — false negatives are better than false positives
- Do not modify conductor hysteresis logic unless the task explicitly requires it
- New cue detection should follow the participatoryRealityHelper pattern: detect → score → threshold → fire-and-forget store
- Memory writes from routing should be fire-and-forget (never block the oracle response)
- Test both the trigger and the non-trigger paths
