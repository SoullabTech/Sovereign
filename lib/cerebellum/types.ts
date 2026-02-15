/**
 * Cerebellum Types — The reflex spine of MAIA's nervous system.
 *
 * The cerebellum is not intelligence. It's the layer that ensures:
 * - Sanctuary is impossible to violate (not just unlikely)
 * - Emissions are idempotent (retries are harmless)
 * - Writes never block response (fire-and-forget with gates)
 * - Stages are explicit (route is a thin orchestrator, not a God function)
 *
 * Named after the part of the brain that handles coordination and timing
 * without conscious thought. MAIA's cerebellum does the same:
 * consent checks, idempotency, emission gating, stage timing.
 */

export type ConsentScope = 'private' | 'circle' | 'commons';

export type CerebellumStage =
  | 'INGEST'    // Auth, parse, context creation
  | 'LOAD'      // Read-only: spiral state, voice prefs, trajectory
  | 'CORTEX'    // Element/phase/motion, relational stance, safety gates
  | 'SPEAK'     // LLM call / stream
  | 'COMMIT'    // Core continuity writes (Bridge D) — sanctuary-gated
  | 'EMIT'      // Fire-and-forget signals — sanctuary-gated, idempotent
  | 'RESPOND'   // Return payload
  | 'DONE';     // Turn complete (for timing closure)

/** Per-stage timing entry */
export interface StageTiming {
  stage: CerebellumStage;
  enteredAtMs: number;
  durationMs?: number;         // Filled when stage exits
}

export interface TurnContext {
  requestId: string;
  turnId: string;              // Deterministic per client turn if possible
  memberId: string;
  sessionId?: string;

  isSanctuary: boolean;        // HARD GATE for ALL writes
  defaultConsentScope: ConsentScope; // Usually 'private'

  startedAtMs: number;
  budgetMs: number;            // Time budget for optional emissions
  stage: CerebellumStage;

  // Per-stage timing for observability ("where did latency come from?")
  stageTimings: StageTiming[];

  // Deterministic seed used for idempotency key derivation
  idemSeed: string;
}

export interface EmitSpec {
  name: string;                // e.g., "field_signal.emit"
  scope: ConsentScope;         // Required: what scope this emission targets
  subtype?: string;            // e.g., signal_type, metric name
  payloadHash?: string;        // Optional: stable hash of payload (no raw text)
}
