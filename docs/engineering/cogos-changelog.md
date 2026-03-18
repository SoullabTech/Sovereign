# Cognitive OS — Engineering Changelog

## Build date
2026-03-11

---

## What was built

### Database migrations (applied: local + production-ready)

| File | Creates |
|------|---------|
| `database/migrations/20260311000001_cogos_types.sql` | Enum types: `cogos_observation_type`, `cogos_hypothesis_status`, `cogos_gate_verdict`. Shared by all Cognitive OS tables. |
| `database/migrations/20260311000002_cogos_tables.sql` | Tables: `cogos_observations` (raw extracted signals), `cogos_hypotheses` (gate-disciplined interpretations), `cogos_evidence_events` (insert-only evidence log), `cogos_interpretive_ledger` (member-facing durable interpretations). |

---

### New modules

| File | Lines | Role | Key exports |
|------|-------|------|-------------|
| `lib/consciousness/cogos/types.ts` | ~120 | Canonical type definitions for the Cognitive OS | `CogosObservation`, `CogosHypothesis`, `CogosEvidenceEvent`, `CogosLedgerEntry`, `CogosGateResult`, `CogosObservationType`, `CogosHypothesisStatus` |
| `lib/consciousness/cogos/observationExtractor.ts` | ~180 | OS-native signal extraction from oracle turns (no LLM calls) | `extractObservations(turn, memberId, sessionId)` |
| `lib/consciousness/cogos/hypothesisBuffer.ts` | ~220 | In-memory buffer keyed by memberId; manages hypothesis lifecycle | `getHypothesisBuffer(memberId)`, `createHypothesis(obs)`, `updateHypothesisEvidence(id, event)`, `shouldExpire(hypothesis)`, `getDefaultFalsifiabilityAnchors(type)` |
| `lib/consciousness/cogos/gateEvaluator.ts` | ~160 | Gate logic: decides hold vs promote vs expire per hypothesis | `evaluateGate(hypothesis, buffer)`, `computeComposite(hypothesis)` |
| `lib/consciousness/cogos/interpretiveLedger.ts` | ~200 | PostgreSQL persistence for promoted hypotheses and evidence | `loadLedger(memberId)`, `promoteLedgerEntry(hypothesis, memberId)`, `appendEvidenceEvent(event)`, `applyDecay(memberId)` |

---

### Oracle route wiring

File: `app/api/oracle/conversation/route.ts`

**New imports added:**
```typescript
import { extractObservations } from '@/lib/consciousness/cogos/observationExtractor';
import { createHypothesis, getHypothesisBuffer, shouldExpire } from '@/lib/consciousness/cogos/hypothesisBuffer';
import { evaluateGate } from '@/lib/consciousness/cogos/gateEvaluator';
import { loadLedger, promoteLedgerEntry, appendEvidenceEvent } from '@/lib/consciousness/cogos/interpretiveLedger';
```

**Ledger loading added to Promise.all startup block** (alongside `loadSpiralState`):
```typescript
const [spiralState, ledger] = await Promise.all([
  loadSpiralState(userId),
  loadLedger(userId),
]);
```
This keeps startup latency flat — ledger load runs concurrently with spiral state load.

**Post-turn Cognitive OS pipeline block** (fire-and-forget, after oracle response streams):

1. **Extract observations** — `extractObservations(turnText, userId, sessionId)` runs synchronously against oracle turn output. Deterministic signal detection (recurrence markers, cross-context bridges, intensity language). Returns `CogosObservation[]`.

2. **Feed hypothesis buffer** — for each observation, `createHypothesis(obs)` or `updateHypothesisEvidence(existing, obs)` updates the in-memory buffer. No DB writes at this stage.

3. **Run gate evaluator** — `evaluateGate(hypothesis, buffer)` per active hypothesis. Returns `{ verdict: 'hold' | 'promote' | 'expire', composite: number, pending: string[] }`. Composite score must reach threshold AND all required gate criteria must pass before promotion.

4. **Promote to ledger** — hypotheses with `verdict === 'promote'` are written to `cogos_interpretive_ledger` and `cogos_evidence_events` via `promoteLedgerEntry`. Fire-and-forget (`.catch` swallows errors, never blocks response).

5. **Expire stale hypotheses** — `shouldExpire(hypothesis)` removes aged-out hypotheses from the buffer. Prevents accumulation of observations that never recur.

**Sanctuary guard:** The entire Cognitive OS pipeline block is wrapped in:
```typescript
if (!isSanctuarySession) {
  // Cognitive OS pipeline — 5 steps above
}
```
Sanctuary sessions produce zero observations, zero hypotheses, zero ledger entries. Invariant holds unconditionally.

---

### Bugs fixed during smoke test

**1. `shouldExpire` premature expiry for new hypotheses**

Bug: `shouldExpire` compared `Date.now() - hypothesis.createdAt` against a fixed TTL in milliseconds. New hypotheses (created in the same turn) had `createdAt` set before the turn clock advanced, causing `shouldExpire` to return `true` immediately in some test conditions where the system clock was coarse.

Fix: Added a minimum age guard — hypotheses under 60 seconds old are never expired, regardless of TTL calculation. TTL check only runs after `minAgeMs` has elapsed.

```typescript
const minAgeMs = 60_000;
const age = Date.now() - hypothesis.createdAt.getTime();
if (age < minAgeMs) return false;
```

**2. `createHypothesis` empty falsifiability anchors**

Bug: `createHypothesis` set `falsifiability_anchors: []` for observation types that had no custom anchors provided. This caused the gate evaluator to skip the falsifiability gate entirely (no anchors = nothing to fail = inflated composite scores, risking premature promotion).

Fix: Introduced `getDefaultFalsifiabilityAnchors(type: CogosObservationType): string[]` helper. Returns type-appropriate default anchors (e.g., for `identity_arc`: `['recurrence', 'cross_context', 'member_confirmation']`). `createHypothesis` calls this helper when no anchors are provided at construction time.

```typescript
export function getDefaultFalsifiabilityAnchors(type: CogosObservationType): string[] {
  const defaults: Record<CogosObservationType, string[]> = {
    identity_arc: ['recurrence', 'cross_context', 'member_confirmation'],
    relational_pattern: ['recurrence', 'cross_context'],
    emotional_signature: ['recurrence', 'intensity_threshold'],
    avoidance_marker: ['recurrence', 'cross_context', 'direct_acknowledgment'],
    growth_edge: ['recurrence', 'member_confirmation'],
  };
  return defaults[type] ?? ['recurrence'];
}
```

---

### Smoke test result

```
cogos smoke test — 2026-03-11

observations: 1
  type: identity_arc
  signal: 0.75

hypotheses created: 1
  id: hyp_01jq...
  status: active
  falsifiability_anchors: [recurrence, cross_context, member_confirmation]

gate result: hold
  composite: 0.45
  pending: [recurrence, cross_context]

composite in range [0,1]: ✓

hypotheses in buffer: 1
ledger entries: 0 (hold — not yet promoted)
evidence events in DB: 1
```

---

## What's next

1. `/api/members/ledger` — member-facing inspection endpoint (sovereignty invariant proof: member sees what the OS holds before any UI exists)
2. Decay sweeper — extend `scripts/sweep-stale-sessions.ts` to call `applyDecay()` on idle members
3. Member-facing annotation UI — `clear_influence`, `add_context` actions (read + write, not just read)
4. Consent surfacing flow — how and when MAIA offers interpretations to the member (requires design pass against sovereignty invariants)
