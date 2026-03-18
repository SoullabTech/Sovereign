# Voice Seam Extraction — Sketch

## Goal

Separate **voice transport layer** (lifecycle, state machine, telemetry) from **session orchestration layer** (conversation flow, practitioner setup, depth routing). This enables:
- Independent evolution of voice and practitioner features
- Clean merge of quizzical-cray without repeated conflicts
- Easier testing: transport engineers fix voice, session engineers don't touch it

## Three Layers

### Layer 1: Transport (VoiceSessionState interface)
Public contract exposing only what orchestration needs. Hidden: state machine internals, authority guards, SR setup details.

### Layer 2: Transport Hook (useVoiceSession)
Adapts existing ContinuousConversation logic into clean public interface. Internal refs, state machine, telemetry remain in component—but hook provides the stable boundary.

### Layer 3: Orchestration (OracleConversation consumption)
OracleConversation calls useVoiceSession() and treats voice as a service, not a state machine to manage.

---

## Sketch: Three Files to Create/Modify

### File 1: `lib/voice/VoiceSessionState.ts` (NEW)

```typescript
// =============================================================================
// VoiceSessionState — Public contract between voice transport and orchestration
// =============================================================================

export type VoicePhase =
  | 'idle'           // Ready for user tap or auto-start
  | 'arming'         // Permissions/setup in progress
  | 'listening'      // Mic active, waiting for speech
  | 'capturing'      // User speaking, accumulating transcript
  | 'submitting'     // Transcript sent to server
  | 'processing'     // MAIA processing, mic suppressed
  | 'speaking'       // MAIA speaking, mic paused
  | 'interrupted'    // iOS audio interruption
  | 'error';         // Recoverable error

export interface VoiceSessionState {
  // Observables (read-only state)
  phase: VoicePhase;
  transcript: string;           // Current accumulated speech
  error: Error | null;          // Recoverable error (e.g., no permission)
  isRecording: boolean;         // Mic actually capturing audio
  platform: 'web' | 'ios' | 'android';

  // Capabilities (what can orchestration do right now?)
  canStartListening: boolean;   // Allowed to tap mic?
  canInterrupt: boolean;        // Allowed to interrupt MAIA?

  // Metadata
  lastSpeechAt: number;         // Timestamp of last user speech
  startedAt: number;            // Session start time
  conversationAlive: boolean;   // Is this conversation still active?
}

export interface VoiceSessionMethods {
  // Actions
  startListening(reason: string): Promise<void>;
  stopListening(): void;
  interrupt(): void;
  clearError(): void;

  // Lifecycle
  cleanup(): void;
}

export interface UseVoiceSessionResult {
  state: VoiceSessionState;
  methods: VoiceSessionMethods;

  // Orchestration signals (events to react to)
  onTranscript(handler: (text: string) => void): () => void;
  onPhaseChange(handler: (phase: VoicePhase) => void): () => void;
  onError(handler: (err: Error) => void): () => void;
}
```

**Design principle**: This is read-only from orchestration's perspective. Orchestration calls `methods.startListening()` and reacts to phase changes via callbacks, never directly manipulating voice state.

---

### File 2: `hooks/useVoiceSession.ts` (NEW)

```typescript
// =============================================================================
// useVoiceSession — Stable hook wrapping ContinuousConversation logic
// =============================================================================
import { useCallback, useRef, useEffect, useState } from 'react';
import type { VoiceSessionState, VoiceSessionMethods, UseVoiceSessionResult } from '@/lib/voice/VoiceSessionState';
import { ContinuousConversation, type MicState, type ContinuousConversationRef } from '@/components/voice/ContinuousConversation';

/**
 * Wrap ContinuousConversation ref in a clean public interface.
 *
 * This hook bridges the internal voice state machine with the session
 * orchestration layer. All transport-specific logic stays in CC.
 * Session code only sees the VoiceSessionState interface.
 */
export function useVoiceSession(
  continuousConvRef: React.RefObject<ContinuousConversationRef>,
  isSpeaking: boolean,
  isProcessing: boolean
): UseVoiceSessionResult {

  // Session state mirroring (read-only exposure)
  const [phase, setPhase] = useState<VoicePhase>('idle');
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<Error | null>(null);
  const [isRecording, setIsRecording] = useState(false);

  // Callbacks registry
  const onTranscriptCallbacks = useRef<Set<(text: string) => void>>(new Set());
  const onPhaseChangeCallbacks = useRef<Set<(phase: VoicePhase) => void>>(new Set());
  const onErrorCallbacks = useRef<Set<(err: Error) => void>>(new Set());

  // Methods exposed to orchestration
  const methods: VoiceSessionMethods = {
    async startListening(reason: string) {
      const ref = continuousConvRef.current;
      if (ref?.startListening) {
        await ref.startListening(reason);
      }
    },

    stopListening() {
      const ref = continuousConvRef.current;
      if (ref?.stopListening) {
        ref.stopListening();
      }
    },

    interrupt() {
      const ref = continuousConvRef.current;
      if (ref?.interrupt) {
        ref.interrupt();
      }
    },

    clearError() {
      setError(null);
    },

    cleanup() {
      const ref = continuousConvRef.current;
      if (ref?.cleanup) {
        ref.cleanup();
      }
    }
  };

  // Register/unregister event listeners
  const onTranscript = useCallback((handler: (text: string) => void) => {
    onTranscriptCallbacks.current.add(handler);
    return () => onTranscriptCallbacks.current.delete(handler);
  }, []);

  const onPhaseChange = useCallback((handler: (phase: VoicePhase) => void) => {
    onPhaseChangeCallbacks.current.add(handler);
    return () => onPhaseChangeCallbacks.current.delete(handler);
  }, []);

  const onError = useCallback((handler: (err: Error) => void) => {
    onErrorCallbacks.current.add(handler);
    return () => onErrorCallbacks.current.delete(handler);
  }, []);

  // Expose state
  const state: VoiceSessionState = {
    phase,
    transcript,
    error,
    isRecording,
    platform: isIOS() ? 'ios' : isAndroid() ? 'android' : 'web',
    canStartListening: phase === 'idle' && !error,
    canInterrupt: phase === 'capturing' || phase === 'submitting',
    lastSpeechAt: continuousConvRef.current?.getLastSpeechTime?.() ?? 0,
    startedAt: continuousConvRef.current?.getStartedAt?.() ?? Date.now(),
    conversationAlive: continuousConvRef.current?.isConversationAlive?.() ?? false
  };

  return { state, methods, onTranscript, onPhaseChange, onError };
}

function isIOS(): boolean {
  return /iPhone|iPad|iPod/.test(navigator.userAgent);
}

function isAndroid(): boolean {
  return /Android/.test(navigator.userAgent);
}
```

**Design principle**: Hooks are thin adapters. All complexity stays in ContinuousConversation. This just exposes a clean API.

---

### File 3: OracleConversation consumption pattern

```typescript
// In components/OracleConversation.tsx

import { useVoiceSession } from '@/hooks/useVoiceSession';
import { ContinuousConversation, ContinuousConversationRef } from '@/components/voice/ContinuousConversation';

export function OracleConversation() {
  const continuousConvRef = useRef<ContinuousConversationRef>(null);
  const voiceSession = useVoiceSession(continuousConvRef, isSpeaking, isProcessing);

  // Register to voice events (instead of reaching into state machine)
  useEffect(() => {
    return voiceSession.onPhaseChange((phase) => {
      console.log(`[Oracle] Voice phase: ${phase}`);
      // React to phase changes
      if (phase === 'listening') {
        // Mic started, maybe show listening UI
      }
      if (phase === 'capturing') {
        // User is speaking
      }
    });
  }, []);

  useEffect(() => {
    return voiceSession.onTranscript((text) => {
      console.log(`[Oracle] User said: ${text}`);
      // Process transcript
    });
  }, []);

  // Use methods cleanly
  const handleMicTap = async () => {
    if (voiceSession.state.canStartListening) {
      try {
        await voiceSession.methods.startListening('user_tap');
      } catch (err) {
        console.error('Failed to start listening', err);
      }
    }
  };

  // Depth routing, practitioner logic, etc. — no voice internals needed
  const depthTier = selectDepthTier(/* ... */);
  const lens = getCounselFramework(/* ... */);

  return (
    <>
      {/* Voice component still mounted, ref wired up */}
      <ContinuousConversation
        ref={continuousConvRef}
        isSpeaking={isSpeaking}
        isProcessing={isProcessing}
        onTranscript={handleTranscript}
      />

      {/* Oracle UI consumes clean voice session state, not internals */}
      <VoiceHUD phase={voiceSession.state.phase} error={voiceSession.state.error} />
      <EnhancedVoiceMicButton
        disabled={!voiceSession.state.canStartListening}
        onClick={handleMicTap}
      />
    </>
  );
}
```

**Design principle**: OracleConversation now treats voice as a dependency (like a service), not as a collection of refs to poke at.

---

## Implementation Phases

### Pass 1: Define Interface + Hook ✓
- Create `lib/voice/VoiceSessionState.ts` with types
- Create `hooks/useVoiceSession.ts` adapter
- No changes to ContinuousConversation yet

### Pass 2: Thin OracleConversation
- Replace all `continuousConvRef.current.someMethod()` calls with `voiceSession.methods.someMethod()`
- Replace all direct state reads with `voiceSession.state.*`
- Replace all event subscriptions with `voiceSession.onPhaseChange()` / `onTranscript()` / `onError()`
- Remove deep knowledge of voice internals

### Pass 3: Isolate Voice Telemetry
- Move ContinuousConversation telemetry logging into dedicated utilities
- Add telemetry hooks that wire into `onPhaseChange()` callback
- Session code no longer needs to know about `arming_recovery_summary`, etc.

### Pass 4: Rebase quizzical-cray
- Once the seam is stable, rebase practitioner branch on top
- Practitioner code also uses `voiceSession` interface, not voice internals
- Merge conflicts become "which layer is this property on?" — much clearer

---

## Validation (Acid Test)

**Before**: Changes to voice recovery logic (arming timeouts, authority guards) require touching OracleConversation.

**After**: A transport engineer can:
1. Modify ContinuousConversation state machine
2. Update VoiceSessionState interface only if it's a new observable (not internal detail)
3. Run tests
4. Rebase on main
5. OracleConversation needs zero changes (unless new interface property is exposed)

**And conversely**: A session engineer can:
1. Modify depth routing, practitioner setup, settings persistence
2. Call `voiceSession.methods` or react to `voiceSession.state`
3. Run tests
4. Rebase on main
5. ContinuousConversation needs zero changes (unless a new capability is needed from transport)

If either engineer has to touch the other's code → the seam is not stable yet.

---

## Notes on Implementation Order

1. **Sketch first** (this doc) ✓
2. **Define VoiceSessionState.ts** — just types, no logic
3. **Build useVoiceSession.ts** — thin adapter wrapping existing ref
4. **Convert OracleConversation** — replace all direct ref access incrementally
5. **Run full smoke test** (no UX changes allowed)
6. **Commit seam extraction** as single logical change
7. **Rebase quizzical-cray** on top of merged seam
8. **Deploy to production** (seam is now load-bearing)

The key insight: **useVoiceSession doesn't change how voice works. It just exposes an existing system through a different interface.** Zero behavior changes until Pass 2, when we refactor OracleConversation consumption.
