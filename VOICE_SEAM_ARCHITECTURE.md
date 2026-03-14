# Voice Seam Architecture — Final Reference

## Status: Seam Complete & Protected

**Commits**:
- a4a74ed5: Voice seam extraction (base types + hook)
- 4d3146e5: Migration guide + session summary
- f4c1aaf3: Separate status from capabilities
- 299906ee: Seam protection rules

---

## The Four Layers

```
┌─────────────────────────────────────────────────────────────────────┐
│ OracleConversation (Session Orchestration)                          │
│ • Routes to depth tier, counsel framework, practitioner setup      │
│ • Renders UI from phase (what icon? what spinner?)                 │
│ • Enables actions from capabilities (which buttons live?)          │
└──────────────────────────┬──────────────────────────────────────────┘
                           │ uses useVoiceSession()
┌──────────────────────────▼──────────────────────────────────────────┐
│ useVoiceSession (Adapter Hook)                                      │
│ • Maps MicState → VoicePhase                                       │
│ • Derives VoiceCapabilities from phase + mode + context            │
│ • Provides event subscriptions (onPhaseChange, onTranscript, etc.) │
│ • Exposes methods (startListening, stopListening, interrupt, etc.) │
└──────────────────────────┬──────────────────────────────────────────┘
                           │ wraps ref
┌──────────────────────────▼──────────────────────────────────────────┐
│ VoiceSessionState (Public Contract)                                 │
│ ├─ phase: VoicePhase (idle → arming → listening → ... → error)    │
│ ├─ capabilities: VoiceCapabilities (what's legal?)                 │
│ ├─ transcript, interimTranscript, error                           │
│ ├─ isRecording, platform, isRecovering                            │
│ └─ (reserved: mode: VoiceInteractionMode — for future)            │
└──────────────────────────┬──────────────────────────────────────────┘
                           │ boundary line
┌──────────────────────────▼──────────────────────────────────────────┐
│ ContinuousConversation (Transport Engine)                           │
│ • Owns state machine (ARMING → LISTENING → CAPTURING → ...)       │
│ • Manages authority guards, restart policy, platform-specific code │
│ • Handles telemetry (arming_recovery_summary, etc.)               │
│ • Exposes ref for adapter to wrap                                 │
└─────────────────────────────────────────────────────────────────────┘
```

---

## What Each Layer Owns

### ContinuousConversation (Transport)
✓ Must own:
- State machine truth (MicState)
- Recovery logic (arming recovery, backoff schedules)
- Authority guards (restart eligibility)
- Platform-specific behavior (iOS native SR vs web API)
- Telemetry (detailed timing, status snapshots)

✗ Must NOT leak:
- Internal state names (ARMING, LISTENING, CAPTURING, etc.)
- Ref methods that expose recovery details
- Recovery counters, timing buffers, platform flags
- Authority guard reasoning to shell

### useVoiceSession (Translator)
✓ Must own:
- MicState → VoicePhase mapping
- Capability derivation
- Event subscriptions
- Ref method forwarding

✗ Must NOT own:
- Transport state machine logic
- UI permission inference
- Any conditional logic that makes decisions
- Timestamp tracking (wire from ref, don't compute)

### VoiceSessionState (Public Contract)
✓ Must expose:
- phase (for UI rendering)
- capabilities (for action enablement)
- transcript, error, platform
- isRecording, isRecovering (for feedback)

✗ Must NOT expose:
- Internal state names (ARMING_AUTHORITY_BLOCKED, etc.)
- Authority guard reasons
- Recovery counters (these are telemetry, not session state)
- Timing details (SR startup ms, backoff step, etc.)

### OracleConversation (Session)
✓ Must own:
- UI rendering logic (phase → visuals)
- Action enabling logic (capabilities → button states)
- Depth routing, counsel framework, settings
- Practitioner-specific behavior

✗ Must NOT own:
- Voice recovery decisions
- Mic state machine logic
- Platform detection (use state.platform)
- Timestamp computations (use state.lastSpeechAt, state.startedAt)

---

## The Two Anti-Patterns (What Breaks Seams)

### Anti-Pattern 1: Capability Re-derivation in Consumers

**Breaks the seam because**:
- Transport behavior changes → OracleConversation guesses wrong
- New modes make the derivation insufficient
- The boundary between "what transport says" and "what shell infers" becomes unclear

**BAD**:
```typescript
// OracleConversation re-deriving capability from phase
const canInterrupt = voiceSession.state.phase === 'capturing' || voiceSession.state.phase === 'submitting';
<button disabled={!canInterrupt}>Interrupt</button>
```

Why bad: If transport adds recovery-latched-listen mode (listening but no interrupt), the phase hasn't changed but capability did. OracleConversation now has stale logic.

**GOOD**:
```typescript
// OracleConversation trusting transport truth
const canInterrupt = voiceSession.state.capabilities.canInterrupt;
<button disabled={!canInterrupt}>Interrupt</button>
```

Why good: Transport owns capability logic. Shell just consumes and trusts.

---

### Anti-Pattern 2: Phase-as-Authority Drift

**Breaks the seam because**:
- UI logic starts inferring permissions from phase
- Those inferences become dependencies in the shell
- Transport can't change phase semantics without breaking shell

**BAD**:
```typescript
// Shell inferring that "speaking" means "no interrupt"
if (voiceSession.state.phase === 'speaking') {
  // Assume user can't interrupt
  disableAllButtons();
}
```

Why bad: What if duplex mode lets users interrupt while MAIA speaks? Phase hasn't changed, but permission did. Shell is now wrong.

**GOOD**:
```typescript
// Shell asking transport what's allowed
if (!voiceSession.state.capabilities.canInterrupt) {
  disableInterruptButton();
}
```

Why good: Transport is the sole source of truth. Shell just reflects it.

---

## The Pass 2 Conversion Discipline

When converting OracleConversation's 31 call sites, enforce this mechanically:

### Rule 1: Visual State → Phase
```typescript
// Rendering UI based on what's happening
{voiceSession.state.phase === 'arming' && <Spinner />}
{voiceSession.state.phase === 'listening' && <OrangeDot />}
{voiceSession.state.phase === 'error' && <ErrorBadge />}
{voiceSession.state.isRecovering && <RecoveryIndicator />}
```

### Rule 2: Button State → Capabilities
```typescript
// Enabling/disabling actions based on what's allowed
<button disabled={!voiceSession.state.capabilities.canStartListening}>
  Start
</button>

<button disabled={!voiceSession.state.capabilities.canInterrupt}>
  Interrupt
</button>
```

### Rule 3: Single Transcript Source
```typescript
// Display from one source only
<TranscriptPane text={voiceSession.state.transcript} />
// NOT:
<TranscriptPane text={localTranscript} /> // ✗ Wrong
```

### Rule 4: Events Over Polling
```typescript
// Listen to phase changes
useEffect(() => {
  return voiceSession.onPhaseChange((phase) => {
    if (phase === 'listening') {
      showUI();
    }
  });
}, [voiceSession]);

// NOT:
useEffect(() => {
  if (voiceSession.state.phase === 'listening') {  // ✗ Polling
    showUI();
  }
}, [voiceSession.state.phase]);
```

---

## Pass 2 Will Enforce These Rules

**During conversion**:
1. Every `voiceMicRef.current` → `voiceSession.methods.*` or `voiceSession.state.*`
2. Every phase check for rendering → stays as phase check
3. Every permission check → converted to capabilities check
4. Every direct ref state read → converted to state property access

**Validation**:
- No new permission derivations in OracleConversation
- No re-computation of capabilities
- No polling (`if (phase === 'X')` in effects with phase as dependency)
- Single transcript source

**Result**: 31 sites converted, zero seam leakage, clear pattern established for future.

---

## Why This Seam Holds

**Before**: OracleConversation reached into voice internals (micState, isListening, recovery refs).
- Changes to recovery → OracleConversation breaks
- Changes to state machine → conflicts across files
- quizzical-cray rebase collides on every merge

**After**: OracleConversation consumes stable interface (phase, capabilities).
- Changes to recovery → no OracleConversation impact (unless public capability changes)
- Changes to state machine → internal-only (hook absorbs them)
- quizzical-cray rebase only conflicts on actual logic disagreements

**The seam holds because**:
1. ✓ Status (phase) is descriptive, not authoritative
2. ✓ Permissions (capabilities) are exhaustive, not inferred
3. ✓ Methods are the only way to act (no direct state modification)
4. ✓ Events notify shell, shell doesn't poll internals

---

## Reserved Space for Future Features

### Wake-Word Mode
```typescript
// Phase won't change, but capabilities will
"listening" + mode: "wake_word" → canInterrupt: false, canSubmit: false
"listening" + mode: "tap_to_talk" → canInterrupt: true, canSubmit: true
```

### Continuous Mode
```typescript
// Same phase, different rules
"processing" + mode: "continuous" → canInterrupt: true
"processing" + mode: "tap_to_talk" → canInterrupt: false
```

### Passive Background Listening
```typescript
// New phase or new capability set
phase: "background" or
phase: "listening" + capabilities: { canInterrupt: false, canStop: false, canSubmit: false }
```

These will work because:
- Capabilities handle mode-specific rules
- Phase stays simple (not overloaded)
- OracleConversation just checks `capabilities.*`
- Transport owns the logic

---

## Files in the Seam

```
lib/voice/VoiceSessionState.ts    ← Type definitions (phase, capabilities)
hooks/useVoiceSession.ts          ← Adapter hook (translator)
VOICE_SEAM_MIGRATION_GUIDE.md     ← Pass 2 patterns (this is the playbook)
VOICE_SEAM_ARCHITECTURE.md        ← This document (reference + rules)
```

Once Pass 2 completes:
- components/OracleConversation.tsx ← Converted to use seam
- All voice logic flows through boundary

---

## Checkpoints for Pass 2

**After first 5 conversions**:
- `npm run typecheck` — zero new errors
- `npm run smoke` — zero new failures
- Verify: phase renders, capabilities enable

**After every 10 conversions**:
- Grep for re-derivations: `phase ===` in conditionals that enable buttons
- Grep for polling: `useEffect(..., [voiceSession.state.phase])`
- Verify: no new anti-patterns introduced

**After all 31 conversions**:
- Test mic scenarios: rapid tap, background, recovery
- Verify `arming_recovery_summary` still logs correctly
- Confirm no UX regression
- Ready to merge

---

## Success Criteria

**Seam is working when**:
1. OracleConversation reads only from `voiceSession.state` (never `voiceMicRef`)
2. OracleConversation calls only `voiceSession.methods` (never direct ref methods)
3. All action enables come from `capabilities` (no phase-based permission inference)
4. All phase reads are for UI (no permission logic)
5. Transport can change without touching OracleConversation

**quizzical-cray merges cleanly when**:
1. Rebase has <20 conflicts (vs current ~200+)
2. All conflicts are logic-level (not API-level)
3. Practitioner code uses `voiceSession` interface
4. Voice and practitioner concerns don't overlap in files
