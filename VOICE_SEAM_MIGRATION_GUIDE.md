# Voice Seam Migration — Pass 2 Guide

## Status: Seam Extracted ✓

**Commit**: a4a74ed5
**Files**:
- `lib/voice/VoiceSessionState.ts` — Type definitions (VoicePhase, VoiceSessionState)
- `hooks/useVoiceSession.ts` — Adapter hook wrapping ContinuousConversation ref
- `VOICE_SEAM_SKETCH.md` — Architecture blueprint

**What this means**: Voice layer is now importable as a clean interface. OracleConversation can now start consuming it.

---

## Pass 2: Convert OracleConversation

Goal: Replace all `voiceMicRef.current.startListening()` and state reads with `voiceSession.methods` and `voiceSession.state` calls.

### Step 1: Add Hook Import & Call

```typescript
// components/OracleConversation.tsx

import { useVoiceSession } from '@/hooks/useVoiceSession';

export function OracleConversation() {
  const voiceMicRef = useRef<ContinuousConversationRef>(null);

  // 🔥 NEW: Initialize the seam
  const voiceSession = useVoiceSession(voiceMicRef, isSpeaking, isProcessing);

  // Everything else stays the same for now...
}
```

### Step 2: Pattern Replacements

#### Pattern A: Starting the mic

**Before**:
```typescript
if (voiceMicRef.current?.startListening) {
  voiceMicRef.current.startListening({ forceOverride: true });
}
```

**After**:
```typescript
if (voiceSession.state.canStartListening) {
  try {
    await voiceSession.methods.startListening('user_tap');
  } catch (err) {
    console.error('[Oracle] Failed to start listening', err);
  }
}
```

#### Pattern B: Stopping the mic

**Before**:
```typescript
if (voiceMicRef.current?.stopListening) {
  voiceMicRef.current.stopListening({ userExitMode: true });
}
```

**After**:
```typescript
voiceSession.methods.stopListening();
```

#### Pattern C: Checking if listening

**Before**:
```typescript
if (voiceMicRef.current?.isListening) {
  // ...
}
```

**After**:
```typescript
if (voiceSession.state.phase === 'listening') {
  // ...
}
```

#### Pattern D: Reacting to listening state changes

**Before**:
```typescript
// Directly check ref state in effect
useEffect(() => {
  if (voiceMicRef.current?.isRecording) {
    // mic is hot
  }
}, [voiceMicRef.current?.isRecording]); // ❌ Not stable
```

**After**:
```typescript
// Register to phase change events
useEffect(() => {
  const unsubscribe = voiceSession.onPhaseChange((phase) => {
    if (phase === 'listening') {
      // mic is hot
    }
  });
  return unsubscribe;
}, [voiceSession]);
```

#### Pattern E: Checking mic state (UI feedback)

**Before**:
```typescript
const isMicArming = voiceMicRef.current?.micState === 'ARMING';
const isMicCapturing = voiceMicRef.current?.micState === 'CAPTURING';
```

**After** (for UI rendering/feedback):
```typescript
const isMicArming = voiceSession.state.phase === 'arming';
const isMicCapturing = voiceSession.state.phase === 'capturing';
```

**Key rule**: Phase is fine for UI feedback (what icon to show, what spinner to render). Use `capabilities` for action enablement.

#### Pattern F: Checking recording status

**Before**:
```typescript
if (voiceMicRef.current?.isRecording) {
  showMicIndicator = true;
}
```

**After**:
```typescript
if (voiceSession.state.isRecording) {
  showMicIndicator = true;
}
```

#### Pattern G: Enabling/disabling UI actions (NEW — use capabilities)

**The key rule**: Phase is for rendering, capabilities is for permissions.

**Render (phase)**:
```typescript
// Show spinner while arming
{voiceSession.state.phase === 'arming' && <Spinner />}

// Show listening indicator
{voiceSession.state.phase === 'listening' && <OrangeDot />}

// Show error badge
{voiceSession.state.phase === 'error' && <ErrorBadge />}
```

**Enable actions (capabilities)**:
```typescript
// Button should be enabled/disabled based on capability, not phase
<button
  onClick={() => voiceSession.methods.startListening('user_tap')}
  disabled={!voiceSession.state.capabilities.canStartListening}  // ✓ Correct
>
  Start
</button>

// NOT like this (will break with new modes):
<button
  disabled={voiceSession.state.phase !== 'idle'}  // ✗ Wrong
>
  Start
</button>
```

Why this matters: When you add wake-word or continuous modes, "listening" will have different permission rules. Capabilities let you change those rules without breaking all the phase comparisons in UI.

---

## Conversion Checklist

Run these grep commands to find all locations needing conversion:

```bash
# Find all startListening calls (24 occurrences)
grep -n "startListening" components/OracleConversation.tsx

# Find all stopListening calls (4 occurrences)
grep -n "stopListening" components/OracleConversation.tsx

# Find all micState reads (1 occurrence)
grep -n "\.micState" components/OracleConversation.tsx

# Find all isListening reads (1 occurrence)
grep -n "\.isListening" components/OracleConversation.tsx

# Find all isRecording reads (1 occurrence)
grep -n "\.isRecording" components/OracleConversation.tsx
```

Expected total: ~31 conversion sites in OracleConversation.tsx

---

## Expected Behavior After Migration

**Zero UX changes.**

- Mic starts/stops at the same moments
- Voice HUD shows the same states
- Recovery logic works identically
- Telemetry output unchanged

The refactor is purely internal API reshuffling:
- `voiceMicRef.current.startListening()` → `voiceSession.methods.startListening()`
- `voiceMicRef.current?.isListening` → `voiceSession.state.phase === 'listening'`
- Direct state reads → Event subscriptions via `onPhaseChange()`

---

## Validation

After each batch of ~5 conversions:
1. Run `npm run typecheck` — should have zero new errors
2. Run `npm run smoke` — should have zero new failures
3. Test manually: tap mic, speak, verify output

Full conversion expected: ~2-3 hours of methodical work

---

## Why This Matters

Once Pass 2 is complete:
- **quizzical-cray rebase becomes low-conflict** — practitioner code uses seam, not voice internals
- **Transport independence** — voice engineer can refactor authority guards, timers, recovery without touching session code
- **Clear accountability** — phase changes are now events, not state machine inspection

---

## Next: Pass 3 (Optional for Initial Merge)

After Pass 2 is shipping:
- Isolate telemetry callbacks to voice layer
- Hook ContinuousConversation's `arming_recovery_summary` into `onPhaseChange()`
- Remove telemetry concerns from OracleConversation
- Session code no longer needs to know about voice internals like `armingRecoveryAttemptsRef`

---

## Files Changed in This Pass

- `components/OracleConversation.tsx` — 31 conversion sites, ~1000 LOC refactored
- **No other files touched** — ContinuousConversation stays exactly as-is
- **No new migrations or DB changes**
- **All tests should pass unchanged**
