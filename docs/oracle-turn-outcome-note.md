# Oracle Turn Outcome — Architecture Note

## The problem

`app/api/oracle/conversation/route.ts` currently owns both:
- Signal extraction (what happened this turn)
- Write fan-out (where that gets persisted)

These are different responsibilities. The route has accumulated multiple explicit
write sinks (logMaiaTurn, storeSessionPattern, storeConversationMemory,
saveRelationshipEssence, upsertSpiralState, persistTrace) coordinated by history
rather than design. Each new agent or memory capability adds another explicit call.

The fragility is not correctness — it is ordering assumptions and shared signal
extraction being reused implicitly across multiple sinks.

## The intended seam

### Step 1 — Extract interpretation

**`lib/consciousness/turnOutcome.ts`** — what happened this turn

```typescript
interface TurnOutcome {
  turnId: string;
  memberId: string;
  sessionId?: string;
  timestamp: string;

  turn: {
    user: string;
    maia: string;
  };

  observations: {
    insights: string[];
    markers: string[];           // 'shadow', 'breakthrough', etc.
    symbolPatterns: string[];
    breakthroughDetected: boolean;
    emotionalTone?: string;
    relationalSignals?: string[];
  };

  spiral?: {
    element: string;
    phase: number;
    motion?: string;
    intensity?: number;
  };

  depth: 'threshold' | 'core' | 'deep';

  metadata: {
    route: 'oracle';
    mode?: string;
    posture?: string;
  };
}
```

`buildTurnOutcome(...)` assembles this once from the turn's signals.
No writes. Interpretation only.

Helper normalizers (if needed) also live here:
- `extractRelationalSignals(...)`
- `normalizeSymbolPatterns(...)`

### Step 2 — Extract write fan-out

**`lib/oracle/executeTurnWrites.ts`** — what gets written

Takes a `TurnOutcome`, decides which sinks to call and in what order.

Returns a lightweight result:

```typescript
interface TurnWriteResult {
  turnId: string;
  completed: string[];
  skipped: string[];
  failed: Array<{ sink: string; reason: string }>;
}
```

Fire-and-forget for non-critical sinks (symbolic enrichment, pattern ledger,
relationship essence updates). Awaited for sinks critical to the session record.

## What belongs in TurnOutcome

- Detected signals (insights, markers, symbols, relational cues)
- Spiral state at end of turn
- Depth tier
- Turn content and identifiers

## What does not belong in TurnOutcome

- Write decisions
- Database calls
- Any side effects
- Response formatting

## Trigger

Extract when the next sink addition makes inline fan-out feel structurally wrong —
not on a schedule, not as a grand sprint.

## Future path

Once `executeTurnWrites` owns the fan-out, it can become:
- a synchronous orchestrator
- a queued dispatcher
- an event emitter with subscribers

without rewriting the route again.
