/**
 * buildDeterministicResponse — body-shape contract tests.
 *
 * Tests `buildDeterministicResponseBody` (the pure-function core). The
 * `NextResponse.json(...)` wrapper is structural and trivially correct.
 *
 * Pins the contract documented in
 * docs/canon/MAIA_THE_ASTROLOGER_WIRING_NOTE.md § Deterministic response contract.
 */

import { buildDeterministicResponseBody } from '@/lib/symbolic/presence/buildDeterministicResponse';

describe('buildDeterministicResponseBody — contract', () => {
  test('REQUESTED activation: shape + uiLabel', () => {
    const body = buildDeterministicResponseBody({
      text: 'Chart field requested. A chart reading requires date, exact time, and place of birth.',
      kind: 'astrologer_activation_requested',
      state: 'requested',
      requestId: 'req-123',
    });
    expect(body.success).toBe(true);
    expect(body.degraded).toBe(false);
    expect(body.response).toContain('Chart field requested');
    expect(body.deterministicResponse).toEqual({
      kind: 'astrologer_activation_requested',
      source: 'route_short_circuit',
    });
    expect(body.astrologerField.state).toBe('requested');
    expect(body.astrologerField.uiLabel).toBe('MAIA — The Astrologer');
  });

  test('ACTIVE activation: uiLabel = "MAIA — The Astrologer"', () => {
    const body = buildDeterministicResponseBody({
      text: 'Entering the chart.',
      kind: 'astrologer_activation_active',
      state: 'active',
      requestId: 'req-456',
    });
    expect(body.astrologerField.uiLabel).toBe('MAIA — The Astrologer');
    expect(body.astrologerField.state).toBe('active');
  });

  test('EXIT: uiLabel returns to "MAIA"', () => {
    const body = buildDeterministicResponseBody({
      text: 'Leaving the chart.',
      kind: 'astrologer_exit',
      state: 'inactive',
      requestId: 'req-789',
    });
    expect(body.astrologerField.uiLabel).toBe('MAIA');
    expect(body.astrologerField.state).toBe('inactive');
  });

  test('CROSS_SYSTEM_REFUSAL: uiLabel stays Astrologer (still in field)', () => {
    const body = buildDeterministicResponseBody({
      text: 'I can work in one field at a time. Which field are we entering?',
      kind: 'astrologer_cross_system_refusal',
      state: 'active',
      requestId: 'req-xyz',
    });
    expect(body.astrologerField.uiLabel).toBe('MAIA — The Astrologer');
    expect(body.deterministicResponse.kind).toBe('astrologer_cross_system_refusal');
  });

  test('null spiralogic / panconsciousField / opusAxioms (LLM-path artifacts absent)', () => {
    const body = buildDeterministicResponseBody({
      text: 'Leaving the chart.',
      kind: 'astrologer_exit',
      state: 'inactive',
      requestId: 'req-1',
    });
    expect(body.spiralogic).toBeNull();
    expect(body.panconsciousField).toBeNull();
    expect(body.opusAxioms).toBeNull();
  });

  test('context fields signal deterministic provenance', () => {
    const body = buildDeterministicResponseBody({
      text: 'Leaving the chart.',
      kind: 'astrologer_exit',
      state: 'inactive',
      requestId: 'req-1',
    });
    expect(body.context.providerUsed).toBe('deterministic');
    expect(body.context.modelUsed).toBe('astrologer_field_directive');
    expect(body.context.usedProviderFallback).toBe(false);
    expect(body.context.generationTimeMs).toBe(0);
    expect(body.context.status).toBe('deterministic_short_circuit');
  });

  test('responseId carries the requestId (trace alignment)', () => {
    const body = buildDeterministicResponseBody({
      text: 'x',
      kind: 'astrologer_exit',
      state: 'inactive',
      requestId: 'req-trace-7',
    });
    expect(body.responseId).toContain('req-trace-7');
    expect(body.responseId.startsWith('maia_deterministic_')).toBe(true);
  });

  test('timestamp is a valid ISO string', () => {
    const body = buildDeterministicResponseBody({
      text: 'x',
      kind: 'astrologer_exit',
      state: 'inactive',
      requestId: 'r',
    });
    expect(() => new Date(body.timestamp).toISOString()).not.toThrow();
    expect(body.timestamp).toBe(new Date(body.timestamp).toISOString());
  });

  test('degraded === false on every kind (canonical, not fallback)', () => {
    const kinds = [
      'astrologer_activation_requested',
      'astrologer_activation_active',
      'astrologer_exit',
      'astrologer_cross_system_refusal',
    ] as const;
    for (const kind of kinds) {
      const body = buildDeterministicResponseBody({
        text: 'x',
        kind,
        state: 'inactive',
        requestId: 'r',
      });
      expect(body.degraded).toBe(false);
    }
  });
});
