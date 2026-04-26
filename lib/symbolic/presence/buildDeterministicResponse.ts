/**
 * Deterministic Response Builder — Astrologer field route short-circuits.
 *
 * Single source of truth for the response shape used by all four short-circuit
 * branches (activation REQUESTED, activation ACTIVE, exit, cross-system refusal).
 * Contract documented in docs/canon/MAIA_THE_ASTROLOGER_WIRING_NOTE.md.
 *
 * Responses constructed here:
 *   - did NOT pass through the LLM (verbatim canon-mandated text only)
 *   - are NOT degraded (`degraded === false`; canonical-by-construction)
 *   - carry top-level `deterministicResponse` so test runners skip canon scoring
 *   - carry `astrologerField` hints for the UI label
 */

import { NextResponse } from 'next/server';
import type { AstrologerFieldState } from '@/lib/symbolic/presence/astrologicalMaia';

export type DeterministicResponseKind =
  | 'astrologer_activation_requested'
  | 'astrologer_activation_active'
  | 'astrologer_exit'
  | 'astrologer_cross_system_refusal';

export interface DeterministicResponseInput {
  /** The verbatim text MAIA returns. Must come from the presence module's exported constants. */
  text: string;
  /** Discriminator for telemetry + test-runner scoring decisions. */
  kind: DeterministicResponseKind;
  /** The field state AFTER this turn. Drives the UI label hint. */
  state: AstrologerFieldState;
  /** Echoed for trace alignment with the rest of the route. */
  requestId: string;
  sessionId?: string;
  userId?: string;
}

export interface DeterministicResponseBody {
  success: true;
  response: string;
  /** Always false — these are canonical, not fallbacks. */
  degraded: false;
  deterministicResponse: {
    kind: DeterministicResponseKind;
    source: 'route_short_circuit';
  };
  spiralogic: null;
  panconsciousField: null;
  opusAxioms: null;
  context: {
    providerUsed: 'deterministic';
    modelUsed: 'astrologer_field_directive';
    usedProviderFallback: false;
    generationTimeMs: 0;
    architecture: 'MAIA-SOVEREIGN field-presence directive';
    status: 'deterministic_short_circuit';
  };
  astrologerField: {
    state: AstrologerFieldState;
    uiLabel: 'MAIA' | 'MAIA — The Astrologer';
  };
  responseId: string;
  timestamp: string;
}

/**
 * Pure-function body builder. Testable without `NextResponse`.
 * Output is deterministic for fixed inputs except for `timestamp` and
 * `responseId` (which are produced from the supplied requestId + Date.now()).
 */
export function buildDeterministicResponseBody(
  input: DeterministicResponseInput,
): DeterministicResponseBody {
  const { text, kind, state, requestId } = input;
  return {
    success: true,
    response: text,
    degraded: false,
    deterministicResponse: { kind, source: 'route_short_circuit' },
    spiralogic: null,
    panconsciousField: null,
    opusAxioms: null,
    context: {
      providerUsed: 'deterministic',
      modelUsed: 'astrologer_field_directive',
      usedProviderFallback: false,
      generationTimeMs: 0,
      architecture: 'MAIA-SOVEREIGN field-presence directive',
      status: 'deterministic_short_circuit',
    },
    astrologerField: {
      state,
      uiLabel: state === 'inactive' ? 'MAIA' : 'MAIA — The Astrologer',
    },
    responseId: `maia_deterministic_${requestId}`,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Build a `NextResponse.json(...)` for the route layer to return directly.
 */
export function buildDeterministicResponse(
  input: DeterministicResponseInput,
): NextResponse<DeterministicResponseBody> {
  return NextResponse.json(buildDeterministicResponseBody(input));
}
