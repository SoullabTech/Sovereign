# Conversational Keep — Integration Plan (1.5B)

**Status**: Draft spec. No code written against this yet. Plan visible before code.

**Governed by**: [docs/canon/THE_CLEARING.md](../canon/THE_CLEARING.md), [docs/canon/SPIRAL_CONTINUITY_ENGINE.md](../canon/SPIRAL_CONTINUITY_ENGINE.md), [docs/specs/PSYCHE_ENGAGEMENT_LAYER_SPEC.md](./PSYCHE_ENGAGEMENT_LAYER_SPEC.md).

**Already built (Phase 1.5A + 1.5D)**:
- `lib/psyche/conversational-keep.ts` — pure recognition + scoring
- `lib/psyche/keep-governor.ts` — persisted preferences
- `database/migrations/20260521000003_member_keep_preferences.sql`

This document specifies how those modules wire into the live conversation surface.

---

## 1. Architecture decision — sidecar, not woven

The keep-offer renders as a **small attached affordance** beneath MAIA's message bubble. NOT as prose woven into MAIA's reply.

**Consequence:** The conductor (`lib/voice/conductor.ts`, 353 lines) is **NOT touched**. The conductor produces MAIA's voice/text. The keep layer runs **parallel** to that — same request, separate concern, separate payload field.

This is the load-bearing architectural choice. It keeps blast radius minimal in the largest file (OracleConversation.tsx at 9329 lines) and avoids any change to the live voice path.

## 2. Files touched

Verified paths only. No speculative paths.

### Server-side (recognition + state)
| File | Change | Risk |
|---|---|---|
| `app/api/oracle/conversation/route.ts` | Add keep-detection pipeline after member utterance is parsed; include `keepIntent` in response payload. Insert ~30 lines, no behavior change to existing reply path. | Medium — large file (2780 lines), but additive |
| `app/api/psyche/conversational-keep/respond/route.ts` | **New file.** POST handler for member's response to a keep offer (accept / decline / pause / resume). Routes to governor + portfolio. | Low — new file |

### Client-side (rendering + state)
| File | Change | Risk |
|---|---|---|
| `components/OracleConversation.tsx` | Add runtime state for `sessionOfferCount` / `lastOfferTurn` / `pendingKeepOffer` / `pendingFilingConfirmation`. Render `<KeepAffordance />` beneath message when `keepIntent` is present in response. | Medium — large file (9329 lines); insertion isolated to message-render path |
| `components/psyche/KeepAffordance.tsx` | **New file.** The small attached UI: `Keep this for me? [Keep] [Not now] [Stop asking]`. Calls `/api/psyche/conversational-keep/respond`. | Low — new file |

### Modules already in place (no changes needed)
- `lib/psyche/conversational-keep.ts`
- `lib/psyche/keep-governor.ts`
- `lib/psyche/portfolio.ts`

### Files NOT touched
- `lib/voice/conductor.ts` — sidecar architecture preserves the conductor
- All existing API routes besides oracle/conversation
- All Capacitor / iOS pipeline scripts

## 3. Flow

```
member utterance arrives
   │
   ├─ check detectPauseRequest(utterance)
   │     └─ 'pause'   → pauseOffers(memberId);   no offer this turn
   │     └─ 'unpause' → resumeOffers(memberId);  no offer this turn
   │
   ├─ check parseFilingInstruction(utterance)
   │     └─ confidence='high' → applyConversationalKeepResult; payload.keepIntent = { kind: 'filed', atom }
   │     └─ confidence='low'  → payload.keepIntent = { kind: 'filing_confirmation', instruction }
   │
   ├─ check parseGestureInstruction(utterance)
   │     └─ confidence='high' → applyConversationalKeepResult (requires targetAtomId)
   │     └─ confidence='low'  → payload.keepIntent = { kind: 'gesture_confirmation', instruction }
   │
   └─ else: canOfferKeep(memberId, runtime) → evaluateKeepOffer({ ...state, utterance })
         └─ offer returned → recordOffer(memberId); payload.keepIntent = { kind: 'offer', offer }
         └─ null           → payload.keepIntent = null

MAIA's normal reply is generated in parallel and returned regardless.
The client renders both:
   - MAIA's bubble (always)
   - KeepAffordance beneath it (only if keepIntent present)
```

## 4. Don't block MAIA's response

This is invariant. If the keep pipeline throws or returns malformed data, MAIA's reply is still rendered. The route handler wraps the keep section in try/catch:

```ts
let keepIntent: KeepIntent | null = null;
try {
  if (CONVERSATIONAL_KEEP_ENABLED) {
    keepIntent = await runConversationalKeep(memberId, utterance, runtime);
  }
} catch (err) {
  console.error('[conversational-keep] non-fatal', err);
  // keepIntent stays null; MAIA replies normally.
}
```

**The keep layer is never load-bearing on the conversation itself.**

## 5. Runtime state

### Conversation-local (client component state in OracleConversation.tsx)
```ts
interface KeepRuntimeState {
  sessionOfferCount: number;       // resets per session
  lastOfferTurn?: number;           // resets per session
  pendingKeepOffer: KeepOffer | null;
  pendingFilingConfirmation: FilingInstruction | null;
  pendingGestureConfirmation: GestureInstruction | null;
}
```

Client sends `sessionOfferCount` and `lastOfferTurn` in each conversation request. Server uses these to feed `canOfferKeep`. Client increments them on confirmed offer.

### Persisted (member_keep_preferences via keep-governor.ts)
```ts
declineStreak
offersPaused
offersPausedUntil
totalAccepts
totalDeclines
lastOfferAt / lastDeclineAt / lastAcceptAt
```

Persistence lives only inside `lib/psyche/keep-governor.ts`. No other code touches the table.

## 6. The new endpoint — `/api/psyche/conversational-keep/respond`

**POST** body:
```ts
type ResponseBody =
  | { kind: 'accept_offer'; excerpt: string; suggestedGesture?: AppliedGesture; sessionId?: string }
  | { kind: 'decline_offer' }
  | { kind: 'pause_offers'; until?: string }   // ISO timestamp for snooze
  | { kind: 'resume_offers' }
  | { kind: 'confirm_filing'; instruction: FilingInstruction }
  | { kind: 'confirm_gesture'; instruction: GestureInstruction; targetAtomId: string };
```

Routes to:
- `accept_offer`  → `applyConversationalKeepResult({ kind: 'offer_accepted', ... })` + `recordAccept`
- `decline_offer` → `recordDecline`
- `pause_offers`  → `pauseOffers(memberId, until?)`
- `resume_offers` → `resumeOffers(memberId)`
- `confirm_filing` → `applyConversationalKeepResult({ kind: 'filing', ... })`
- `confirm_gesture` → `applyConversationalKeepResult({ kind: 'gesture', ... })`

## 7. Failure mode checks (acceptance criteria for 1.5B)

Each check MUST pass before 1.5B ships:

1. **No offer before turn 3** — `evaluateKeepOffer` returns null if `conversationTurn < 3`. Verified by unit test.
2. **No offer after pause** — `canOfferKeep` returns `offersPaused: true` after `pauseOffers`; scorer returns null. Verified by integration test.
3. **No offer if already pending** — Client suppresses new offers when `pendingKeepOffer !== null`. Verified by component test.
4. **No back-to-back offers** — Cooldown of 6 turns enforced by scorer policy. Verified by unit test.
5. **Direct command does not become interpretation** — `"Put this in Keep."` → filed; never asks "did you mean keep?" Verified by parser test.
6. **`"This was a turning point"` does not auto-file as threshold** — Threshold is canon vocabulary; member-natural language only triggers offer, never autonomous filing. Verified by parser test (asserts no FilingInstruction returned, and any KeepOffer carries `reason: 'threshold_language'` not a filing destination).
7. **iOS path does not break voice loop** — All keep operations must respect `x-member-id` header auth (already does, via `getMemberIdFromRequest`). Verified by Capacitor smoke test.
8. **No change to normal MAIA response if keep system errors** — try/catch wraps keep layer; reply path unaffected. Verified by chaos test (force throw in keep pipeline, verify reply still returns).

## 8. Rollback — feature flag

Both server and client gated:

```ts
// Server-side (server-only env var)
const CONVERSATIONAL_KEEP_ENABLED = process.env.CONVERSATIONAL_KEEP_ENABLED === 'true';

// Client-side (NEXT_PUBLIC_ for browser visibility)
const ENABLED = process.env.NEXT_PUBLIC_CONVERSATIONAL_KEEP_ENABLED === 'true';
```

**Default: off.** Enable per-member or per-environment when ready. Disabling the flag returns the system to pre-1.5B behavior with zero conversation-path change.

The flag also disables the `KeepAffordance` rendering, so even if the API route accidentally emits a `keepIntent`, the client doesn't render it.

## 9. Verification before 1.5B is written

Before writing code:

1. Confirm the file paths in §2 match the actual codebase (already done above — verified).
2. Confirm the failure mode checks in §7 are correct and complete.
3. Confirm the feature flag name and rollback approach.
4. Confirm the response payload shape (`keepIntent` field name + types).

After writing code:

5. Migrations applied (atoms + lens passes + keep preferences).
6. Each failure mode check has a passing test.
7. Flag is OFF in default config.
8. Chaos test confirms reply path is unaffected when keep layer throws.
9. Tuesday-level contact with a single test member to surface anything the spec missed.

## 10. What this plan does NOT do

- Does not touch the conductor.
- Does not modify any existing API routes' behavior when flag is OFF.
- Does not introduce any new voice / TTS behavior.
- Does not change the iOS / Capacitor build process.
- Does not add any synthesis, recall, or cross-atom logic (those are Phase 2+).

## 11. Open questions for you before 1.5B begins

1. **Affordance placement** — beneath MAIA's bubble (visually attached to her response), or as a separate row in the conversation thread (more visually distinct)? Spec assumes "beneath" for now.
2. **Accept-offer behavior** — when member taps `[Keep]`, does the affordance morph into a tiny confirmation ("Kept.") and persist in scrollback, or disappear entirely? Spec assumes morph-to-confirmation.
3. **Filing confirmation UX** — for low-confidence filing instructions, do we show a confirmation chip ("File this as an idea? [Yes] [No]") or just ask in MAIA's voice? Spec assumes chip.
4. **iOS testing scope** — do you want me to draft an additional Capacitor smoke test plan, or is the existing iOS test infrastructure sufficient?

These are the four decisions worth resolving before code touches the live nervous system.
