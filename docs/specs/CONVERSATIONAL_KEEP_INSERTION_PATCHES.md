# Conversational Keep — Insertion Patches (1.5B Part 2)

**Status**: Patch preview. **NO code applied yet.** For your review before any modification to `app/api/oracle/conversation/route.ts` or `components/OracleConversation.tsx`.

**Posture confirmed**:
- sidecar (no conductor changes)
- feature-flagged (default off)
- non-blocking (try/catch wraps keep pipeline)
- attached affordance
- persistent "Kept."
- chip confirmations
- separate iOS Capacitor smoke test (drafted separately)

**Files in scope**:
- `app/api/oracle/conversation/route.ts` (2780 lines) — smaller blast radius, contained logic
- `components/OracleConversation.tsx` (9329 lines) — larger, iOS-sensitive

**Rollback** (instant, no code revert needed):
```bash
# .env
CONVERSATIONAL_KEEP_ENABLED=false
NEXT_PUBLIC_CONVERSATIONAL_KEEP_ENABLED=false
```

---

## Patch 1 — `app/api/oracle/conversation/route.ts`

### 1A. Imports (insert after line 54)

**Existing context (lines 51–54)**:
```ts
import { query } from '@/lib/db/postgres';
import { getCurrentSession } from '@/lib/auth/serverSessions';
import { persistTrace } from '@/backend/src/services/traceService';
import type { ConsciousnessTrace } from '@/backend/src/types/consciousnessTrace';
```

**Insert after line 54**:
```ts
// ═══════════════════════════════════════════════════════════════════════
// Phase 1.5B — Conversational Keep (sidecar; feature-flagged)
// ═══════════════════════════════════════════════════════════════════════
import {
  parseFilingInstruction,
  parseGestureInstruction,
  evaluateKeepOffer,
  detectPauseRequest,
  applyConversationalKeepResult,
  type FilingInstruction,
  type KeepOffer,
} from '@/lib/psyche/conversational-keep';
import {
  canOfferKeep,
  pauseOffers,
  recordOffer,
  resumeOffers,
} from '@/lib/psyche/keep-governor';

const CONVERSATIONAL_KEEP_ENABLED =
  process.env.CONVERSATIONAL_KEEP_ENABLED === 'true';
```

**Lines added**: 16
**Delta**: additive imports + 1 constant. No existing code touched.

---

### 1B. Sidecar pipeline (insert before line 1649)

**Existing context (lines 1643–1649)**:
```ts
    // Merge tool suggestions into suggestedActions (tool surfacing layer)
    const mergedSuggestedActions = [
      ...maiaResponse.suggestedActions,
      ...toolSuggestions,
    ];

    const response = {
```

**Insert immediately before `const response = {` (line 1649)**:
```ts
    // ═══════════════════════════════════════════════════════════════════
    // Phase 1.5B — Conversational Keep sidecar
    // Runs in parallel to MAIA's reply. Never blocks the conductor.
    // On any failure, keepIntent stays null and reply path proceeds normally.
    // Disabled entirely when CONVERSATIONAL_KEEP_ENABLED !== 'true'.
    // ═══════════════════════════════════════════════════════════════════
    type KeepIntent =
      | { kind: 'filed'; atomTitle: string; destination: FilingInstruction['destination'] }
      | { kind: 'filing_confirmation'; instruction: FilingInstruction }
      | { kind: 'offer'; offer: KeepOffer };

    let keepIntent: KeepIntent | null = null;

    if (CONVERSATIONAL_KEEP_ENABLED) {
      try {
        // Client-supplied runtime state (optional; defaults safe if absent)
        const keepRuntime = (parsed as any).keepRuntimeState ?? {};
        const conversationTurn: number =
          typeof keepRuntime.conversationTurn === 'number' ? keepRuntime.conversationTurn : 1;
        const sessionOfferCount: number =
          typeof keepRuntime.sessionOfferCount === 'number' ? keepRuntime.sessionOfferCount : 0;
        const lastOfferTurnInSession: number | undefined =
          typeof keepRuntime.lastOfferTurnInSession === 'number'
            ? keepRuntime.lastOfferTurnInSession
            : undefined;

        // 1. Pause/resume command (highest priority — no offer this turn)
        const pauseSignal = detectPauseRequest(message);
        if (pauseSignal === 'pause') {
          await pauseOffers(userId);
        } else if (pauseSignal === 'unpause') {
          await resumeOffers(userId);
        }

        // 2. Direct filing instruction (high-confidence → execute)
        if (!pauseSignal) {
          const filing = parseFilingInstruction({ utterance: message });
          if (filing) {
            if (filing.confidence === 'high') {
              const atom = await applyConversationalKeepResult(userId, {
                kind: 'filing',
                instruction: filing,
                context: { sessionId },
              });
              keepIntent = {
                kind: 'filed',
                atomTitle: atom.title,
                destination: filing.destination,
              };
            } else {
              keepIntent = { kind: 'filing_confirmation', instruction: filing };
            }
          }
        }

        // 3. Gesture instruction — recognized but not actionable in 1.5B
        //    (requires conversation-atom context tracking; Phase 2+)
        if (!pauseSignal && !keepIntent) {
          const gesture = parseGestureInstruction({ utterance: message });
          if (gesture) {
            // Recognized for telemetry only; no inline action.
            // Member uses portfolio surface for gestures until context tracking ships.
            console.log('[conv-keep] gesture recognized (no inline action in 1.5B):', gesture.gesture);
          }
        }

        // 4. Salience-triggered keep offer (only if no direct command above)
        if (!pauseSignal && !keepIntent) {
          const state = await canOfferKeep(userId, {
            conversationTurn,
            sessionOfferCount,
            lastOfferTurnInSession,
          });
          const offer = evaluateKeepOffer({ ...state, utterance: message });
          if (offer) {
            await recordOffer(userId);
            keepIntent = { kind: 'offer', offer };
          }
        }
      } catch (err) {
        // Non-fatal. MAIA's reply path is never blocked by keep failures.
        console.error('[conv-keep] sidecar error (non-fatal):', err);
        keepIntent = null;
      }
    }

```

**Lines added**: ~78
**Delta**: additive sidecar block. No existing variable modified. No conductor path touched. The block reads `message`, `userId`, `sessionId`, `parsed` (all already in scope from line ~454 onward). Try/catch wraps everything.

---

### 1C. Response payload extension (modify response object around line 1649–1720)

**Existing context (lines 1649–1652)**:
```ts
    const response = {
      success: true,
      response: maiaResponse.coreMessage,
      spiralogic: {
```

**Modify to** (add `keepIntent` field — single new line at the END of the response object, just before closing `}`):

The cleanest minimal delta: find the existing closing `};` for the `response` object (somewhere around line 1840 based on grep), and insert one line before it.

Pattern (we'll locate the exact line during apply):
```diff
       // ... existing response fields ...
+      keepIntent,   // Phase 1.5B sidecar — null if disabled or no signal
     };
```

**Lines added**: 1
**Delta**: one optional field on the response object. Existing fields unchanged.

---

## Patch 2 — `components/OracleConversation.tsx`

This file is 9329 lines. The patch is split into three isolated regions so each can be reviewed independently.

### 2A. Imports (insert after line 13)

**Existing context (lines 13–14)**:
```ts
import { useStreamingVoice, type StreamingVoicePlaybackSignal } from '@/hooks/useStreamingVoice';
```

**Insert**:
```ts
// Phase 1.5B — Conversational Keep affordance (sidecar, feature-flagged)
import { KeepAffordance, type KeepIntent } from '@/components/psyche/KeepAffordance';

const CONVERSATIONAL_KEEP_ENABLED =
  process.env.NEXT_PUBLIC_CONVERSATIONAL_KEEP_ENABLED === 'true';
```

**Lines added**: 4

---

### 2B. Type extension (modify `ConversationMessage` interface around line 423)

**Existing context (lines 423–447)**:
```ts
interface ConversationMessage {
  id: string;
  role: 'user' | 'oracle' | 'assistant';
  text?: string;
  // ... existing fields ...
  integrity?: IntegrityResult;
  // ... more existing fields ...
}
```

**Modify** — add one optional field anywhere within the interface:
```diff
   integrity?: IntegrityResult;
+  // Phase 1.5B — attached keep affordance for this message (null if absent)
+  keepIntent?: KeepIntent | null;
 }
```

**Lines added**: 2
**Delta**: optional field. Does not affect existing message construction sites.

---

### 2C. Runtime state hooks (insert after existing state hooks, around line 720)

**Insert** (near the cluster of related state hooks):
```ts
  // Phase 1.5B — Conversational Keep runtime state (per-session, not persisted)
  const sessionOfferCountRef = useRef<number>(0);
  const lastOfferTurnRef = useRef<number | undefined>(undefined);
  const conversationTurnRef = useRef<number>(0);
```

**Lines added**: 4
**Delta**: refs only. No reactive re-renders triggered. State is per-mount; resets per session naturally.

---

### 2D. Wire runtime state into the conversation request

Wherever the existing code calls the oracle conversation API (need to locate during apply — likely inside `useStreamingVoice` hook config or its consumer; if direct fetch, in the relevant fetch call), augment the request body:

**Pattern**:
```diff
   body: JSON.stringify({
     message,
     userId,
     sessionId,
     askMode,
+    // Phase 1.5B keep runtime state
+    ...(CONVERSATIONAL_KEEP_ENABLED && {
+      keepRuntimeState: {
+        conversationTurn: ++conversationTurnRef.current,
+        sessionOfferCount: sessionOfferCountRef.current,
+        lastOfferTurnInSession: lastOfferTurnRef.current,
+      },
+    }),
   }),
```

**Lines added**: 7
**Delta**: spread-conditional. Server treats absence as defaults. Feature flag controls inclusion entirely.

---

### 2E. Capture `keepIntent` when oracle message is added (around lines 2329, 2352, etc.)

The oracle message construction sites (sample at line ~2346):
```ts
      const oracleMessage: ConversationMessage = {
        id: `msg-${Date.now()}`,
        role: 'oracle',
        text: fullResponse,
        timestamp: new Date(),
        source: 'stream',
        suggestedActions: relational?.suggestedActions,
      };
```

**Modify each construction site**:
```diff
      const oracleMessage: ConversationMessage = {
        id: `msg-${Date.now()}`,
        role: 'oracle',
        text: fullResponse,
        timestamp: new Date(),
        source: 'stream',
        suggestedActions: relational?.suggestedActions,
+       keepIntent: CONVERSATIONAL_KEEP_ENABLED ? (relational?.keepIntent ?? null) : null,
      };
```

The exact source of `keepIntent` depends on where the response payload lands (`relational` or a sibling property). Confirmed during apply.

**Sites identified**: 2 (lines 2323, 2346) plus possibly the historical-message load path (line 2763, 2865) which sets `keepIntent: null` only.

**Lines added**: ~5 (one per construction site)
**Delta**: optional field set from response. If absent, null.

**On accept**: when `KeepAffordance` calls `onResolved({ accepted: true })`, increment `sessionOfferCountRef.current` and set `lastOfferTurnRef.current = conversationTurnRef.current`. This happens in the resolver callback passed to the affordance (see 2F).

---

### 2F. Render the affordance beneath oracle message bubbles

Inside the message render loop (need to locate the exact JSX node during apply — the message render is inside the main JSX around line 6815+), wrap or extend the existing oracle message render:

**Pattern**:
```diff
   {messages.map((msg) => (
     <MessageBubble key={msg.id} message={msg}>
       {/* ... existing message content ... */}
+      {CONVERSATIONAL_KEEP_ENABLED && msg.role === 'oracle' && msg.keepIntent && (
+        <KeepAffordance
+          intent={msg.keepIntent}
+          sessionId={sessionId}
+          onResolved={({ accepted }) => {
+            if (accepted) {
+              sessionOfferCountRef.current += 1;
+              lastOfferTurnRef.current = conversationTurnRef.current;
+            }
+          }}
+        />
+      )}
     </MessageBubble>
   ))}
```

**Lines added**: ~12
**Delta**: conditional render guarded by feature flag + role + intent presence. Pure addition under existing message render. Zero change when flag off.

---

## Total deltas

| File | Lines added | Lines modified | Lines removed |
|---|---|---|---|
| `app/api/oracle/conversation/route.ts` | ~95 | 0 | 0 |
| `components/OracleConversation.tsx` | ~34 | 0 | 0 |

All changes are additive. No existing lines are removed or modified.

---

## Failure-mode coverage in the patch

| Failure mode | Covered by |
|---|---|
| No offer before turn 3 | Scorer policy (already enforced in `conversational-keep.ts`) |
| No offer after pause | Governor (already enforced via `canOfferKeep`) |
| No offer if already pending | Client-side: `pendingKeepIntent` ref tracking (TBD in apply — add ref + check in 2C) |
| No back-to-back offers | Scorer cooldown policy |
| Direct command does not become interpretation | Sidecar checks `parseFilingInstruction` first; bypasses scorer entirely |
| `"This was a turning point"` does not auto-file | Filing destinations are human-natural only; threshold-language only triggers offer |
| iOS path unaffected | Sidecar wraps in try/catch; conductor never touched; voice loop not modified |
| Normal MAIA response unaffected on keep error | try/catch sets `keepIntent = null`; existing response path proceeds |

---

## What the patch does NOT do

- Does not change the conductor.
- Does not change any voice TTS/STT path.
- Does not change iOS Capacitor build process.
- Does not modify any existing API response field.
- Does not add any synthesis, recall, cross-atom logic.
- Does not change message persistence (`/api/conversation/turns`).
- Does not affect Sanctuary Mode logic (keep is naturally suppressed when conversation isn't memorized).

---

## Before apply checklist

1. ✓ Patches reviewed by Kelly
2. ☐ Feature flag confirmed default-off in both `.env.example` files
3. ☐ iOS smoke test plan drafted (separate spec)
4. ☐ Migrations applied: `member_memory_atoms` + `member_lens_passes` + `member_keep_preferences`
5. ☐ Single test member set up for Tuesday-level contact

## After apply checklist

1. ☐ TypeScript clean (`npm run typecheck`)
2. ☐ Sovereign preflight clean (`npm run preflight`)
3. ☐ No-supabase check clean (`npm run check:no-supabase`)
4. ☐ Manual smoke: flag OFF — conversation behaves identically to pre-1.5B
5. ☐ Manual smoke: flag ON, no salience signals — no affordance appears
6. ☐ Manual smoke: flag ON, "Put this in Keep." → `Kept "..."` confirmation appears
7. ☐ Manual smoke: flag ON, "Stop offering to keep things." → governor pauses; no further offers
8. ☐ Manual smoke: flag ON, server-side keep throws → MAIA still replies normally (chaos test)
9. ☐ iOS smoke: voice loop intact under flag-on and flag-off
