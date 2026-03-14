# Voice Seam Extraction — Complete

**Date**: 2026-03-14
**Status**: Ready for Pass 2 (OracleConversation conversion)
**Commits**: a4a74ed5 through 9b49f665

---

## What Shipped

### 1. Type Contract (`lib/voice/VoiceSessionState.ts`)
- **VoicePhase**: 8 descriptive states (idle → arming → listening → capturing → submitting → processing → speaking → error)
- **VoiceCapabilities**: 5 permission flags (canStartListening, canStopListening, canInterrupt, canSubmit, canClearError)
- **VoiceSessionState**: Single public interface combining state, context, capabilities, metadata
- Protected by seam rules: "Use capabilities for action enablement, phase for rendering"

### 2. Adapter Hook (`hooks/useVoiceSession.ts`)
- Maps internal `MicState` → public `VoicePhase`
- Derives `VoiceCapabilities` from phase + isSpeaking + isProcessing
- Exposes methods: `startListening()`, `stopListening()`, `interrupt()`, `clearError()`, `cleanup()`
- Provides event subscriptions: `onPhaseChange()`, `onTranscript()`, `onError()`
- Zero behavior changes—pure translation

### 3. Documentation
- **VOICE_SEAM_MIGRATION_GUIDE.md**: 7 conversion patterns with before/after examples (31 sites identified)
- **VOICE_SEAM_ARCHITECTURE.md**: Complete reference including layer ownership, anti-patterns, and success criteria
- **SESSION_SUMMARY_2026_03_14.md**: What shipped, what's ready, why this unblocks quizzical-cray

---

## The Seam Structure

```
OracleConversation (Session Layer)
         ↓ calls useVoiceSession()
         ↓
useVoiceSession (Translator Layer)
         ├─ Maps MicState → VoicePhase
         ├─ Derives Capabilities
         └─ Forwards Methods
         ↓ wraps ContinuousConversationRef
         ↓
VoiceSessionState (Public Contract)
         ├─ phase: VoicePhase
         ├─ capabilities: VoiceCapabilities
         └─ (other observables)
         ↓ boundary
         ↓
ContinuousConversation (Transport Layer)
         ├─ Owns MicState machine
         ├─ Owns Authority guards
         └─ Owns Recovery logic
```

**Key property**: Each layer can change independently without touching others.

---

## Why This Fixes quizzical-cray Merge Conflicts

**Before**:
```
OracleConversation + practitioner routing
    ↳ references voiceMicRef.current.micState
    ↳ references voiceMicRef.current.isListening
    ↳ calls voiceMicRef.current.startListening()
    ↳ ContinuousConversation state machine

When practitioner branch modifies OracleConversation → conflict on voice ref access
```

**After**:
```
OracleConversation + practitioner routing
    ↳ calls voiceSession.methods.startListening()
    ↳ reads voiceSession.state.phase === 'listening'
    ↳ checks voiceSession.state.capabilities.canInterrupt
    ↳ ContinuousConversation state machine (unchanged)

When practitioner branch modifies routing → no voice ref conflict
```

The boundary is explicit. Practitioner work stays on the session side. Voice work stays on the transport side.

---

## Pass 2: OracleConversation Conversion

**Effort**: ~2-3 hours of methodical work
**Scope**: 31 conversion sites in OracleConversation.tsx
**Pattern**: All replacements follow 7 patterns documented in VOICE_SEAM_MIGRATION_GUIDE.md

### What Pass 2 Accomplishes

1. **Converts direct ref access to seam API**:
   - `voiceMicRef.current?.startListening()` → `voiceSession.methods.startListening()`
   - `voiceMicRef.current?.micState` → `voiceSession.state.phase`
   - `voiceMicRef.current?.isListening` → `voiceSession.state.phase === 'listening'`

2. **Enforces phase/capability split**:
   - All rendering uses phase (what icon? spinner? badge?)
   - All action enablement uses capabilities (which buttons disabled?)
   - No re-derivation of permissions in OracleConversation

3. **Protects the seam**:
   - Mechanical conversion (not architectural changes)
   - Behavioral preservation (zero UX changes)
   - Anti-pattern enforcement (no phase-as-authority drift)

### Pass 2 Checkpoints

| Checkpoint | Check |
|-----------|-------|
| After 5 conversions | `npm run typecheck`, `npm run smoke`, no new anti-patterns |
| After 10 conversions | grep for re-derivations, verify event-based not polling |
| After 20 conversions | grep for phase-based permission logic, verify none |
| After 31 conversions (complete) | Full smoke test, mic scenarios, `arming_recovery_summary` telemetry |

---

## What Passes 3 & 4 Will Look Like (Optional)

### Pass 3: Isolate Telemetry
Move recovery telemetry from OracleConversation into voice layer:
- `onPhaseChange()` callback handles telemetry hooks
- Session code no longer needs to know about `arming_recovery_summary`
- Transport owns complete diagnostic output

### Pass 4: Rebase quizzical-cray
- Rebase practitioner branch on top of merged seam
- Expected conflict count: <20 (vs current ~200+)
- All conflicts are logic-level, not API-level
- Practitioner code uses `voiceSession` interface throughout

---

## Files & Commits

```
lib/voice/VoiceSessionState.ts        a4a74ed5 ← Type definitions
hooks/useVoiceSession.ts              a4a74ed5 ← Adapter hook
VOICE_SEAM_SKETCH.md                  4d3146e5 ← Architecture blueprint
VOICE_SEAM_MIGRATION_GUIDE.md         4d3146e5 ← Conversion patterns (7 + checklist)
SESSION_SUMMARY_2026_03_14.md         4d3146e5 ← Session summary
VOICE_SEAM_ARCHITECTURE.md            9b49f665 ← Reference & anti-patterns
SEAM_COMPLETE.md                      (this file)
```

All committed to main. No blocker work remaining.

---

## Pre-Pass-2 Checklist

Before starting OracleConversation conversion, verify:

- [ ] Understand the phase/capability split (read VOICE_SEAM_ARCHITECTURE.md)
- [ ] Know the 7 conversion patterns (read VOICE_SEAM_MIGRATION_GUIDE.md)
- [ ] Identify the 31 sites (use provided grep commands)
- [ ] Understand anti-patterns to avoid (read VOICE_SEAM_ARCHITECTURE.md section)
- [ ] Have ContinuousConversation.tsx available for reference
- [ ] Can run `npm run typecheck` and `npm run smoke`

---

## Success Criteria

**Seam works when**:
1. ✓ OracleConversation reads `voiceSession.state` (never `voiceMicRef`)
2. ✓ OracleConversation calls `voiceSession.methods` (never direct ref)
3. ✓ All action enablement uses `capabilities` (not phase inference)
4. ✓ All phase reads are for UI (not permission logic)
5. ✓ Transport internals are completely hidden

**quizzical-cray merges when**:
1. ✓ Rebase conflict count drops to <20
2. ✓ All remaining conflicts are logic-level (practitioner routing vs depth tiers)
3. ✓ No API conflicts (voice ref access is gone)
4. ✓ Practitioner code only touches orchestration layer

---

## Notes for Next Session

1. **The seam is complete**: All type definitions, adapter, and documentation are in place.
2. **No dependencies**: Pass 2 is not blocked on anything external.
3. **Zero behavior changes so far**: Voice behaves identically—this is purely API reshuffling.
4. **Anti-patterns documented**: Two specific patterns that break seams are called out with examples.
5. **Pass 2 is mechanical**: Follow the 7 patterns + checklist, apply to 31 sites.
6. **quizzical-cray will merge easily**: Once seam is live in OracleConversation, practitioner branch rebases cleanly.

---

## How to Start Pass 2

1. Read `VOICE_SEAM_MIGRATION_GUIDE.md` (understand patterns)
2. Read `VOICE_SEAM_ARCHITECTURE.md` (understand anti-patterns)
3. Run grep commands to locate 31 sites
4. Convert sites in small batches (5-10 at a time)
5. Run `npm run typecheck` + `npm run smoke` after each batch
6. Enforce phase/capability split mechanically
7. Merge when all 31 sites converted + validation passes

Expected output: OracleConversation.tsx with all voice ref access replaced by seam API calls.

---

## Summary

You now have:
- ✓ Type contract (VoiceSessionState)
- ✓ Adapter hook (useVoiceSession)
- ✓ Migration guide (7 patterns)
- ✓ Anti-pattern protection (2 rules + enforcement)
- ✓ Reference architecture (4 layers + what each owns)
- ✓ Success criteria (5 for seam, 4 for quizzical-cray)

The seam extracts the architectural bottleneck preventing quizzical-cray from merging.

Pass 2 carries that boundary cleanly through OracleConversation.

Passes 3-4 are optional polish (telemetry isolation, actual practitioner rebase).

**The seam is solid and ready to hold.**
