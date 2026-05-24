/**
 * Engine Comparison Service — Move 2 capture-integrity tests
 *
 * Modest scope: verify the structural invariants Move 2 of the Learning Spine
 * depends on. Not testing engine quality, not testing reviewer workflow, not
 * testing dreamtime metabolism. Just: does the capture produce the paired
 * row shape the evaluation surface needs?
 *
 * What this file does NOT test (held under doctrine):
 *  - Memory salience or "candidate memory signal" capture — that is a
 *    different artifact, gated behind Move 5's looked-at distribution.
 *  - End-to-end non-interference of the maiaService.ts seam — that test
 *    would require the full sovereign service mock surface and is out of
 *    scope for modest verification.
 *  - Production data integrity — schema FK + unique constraints enforce
 *    that at the DB layer; provenance is a runtime fact, not a unit-test
 *    fact.
 */

import { EngineComparisonService } from '../engineComparisonService';

// Mock the pool — we test the service contract, not the DB.
jest.mock('../../database/pool', () => ({
  pool: {
    query: jest.fn(),
  },
}));

import { pool } from '../../database/pool';
const mockQuery = pool.query as jest.Mock;

describe('EngineComparisonService.logEngineResponse — Move 2 capture invariants', () => {
  beforeEach(() => {
    mockQuery.mockReset();
    mockQuery.mockResolvedValue({ rows: [{ id: 42 }] });
  });

  test('capture integrity: primary row carries is_primary=true', async () => {
    await EngineComparisonService.logEngineResponse({
      turnId: 1001,
      engineName: 'claude',
      isPrimary: true,
      responseText: 'primary response text',
      responseTimeMs: 1234,
      processingProfile: 'CORE',
    });

    expect(mockQuery).toHaveBeenCalledTimes(1);
    const [sql, values] = mockQuery.mock.calls[0];
    expect(sql).toMatch(/INSERT INTO maia_engine_comparisons/);
    expect(values).toEqual([1001, 'claude', true, 'primary response text', 1234, 'CORE', null]);
  });

  test('capture integrity: shadow row carries is_primary=false', async () => {
    await EngineComparisonService.logEngineResponse({
      turnId: 1001,
      engineName: 'qwen2.5:7b',
      isPrimary: false,
      responseText: 'shadow response text',
      responseTimeMs: 850,
      processingProfile: 'CORE',
    });

    const [, values] = mockQuery.mock.calls[0];
    expect(values[2]).toBe(false);
    expect(values[1]).toBe('qwen2.5:7b');
  });

  test('paired-turn invariant: primary and shadow share the same turn_id', async () => {
    const sharedTurnId = 2002;

    await EngineComparisonService.logEngineResponse({
      turnId: sharedTurnId,
      engineName: 'claude',
      isPrimary: true,
      responseText: 'primary',
    });
    await EngineComparisonService.logEngineResponse({
      turnId: sharedTurnId,
      engineName: 'qwen2.5:7b',
      isPrimary: false,
      responseText: 'shadow',
    });

    expect(mockQuery).toHaveBeenCalledTimes(2);
    const primaryTurnId = mockQuery.mock.calls[0][1][0];
    const shadowTurnId = mockQuery.mock.calls[1][1][0];
    expect(primaryTurnId).toBe(shadowTurnId);
    expect(primaryTurnId).toBe(sharedTurnId);
  });

  test('required fields are always passed in stable column order', async () => {
    await EngineComparisonService.logEngineResponse({
      turnId: 3003,
      engineName: 'claude',
      isPrimary: true,
      responseText: 'text',
    });

    const [sql, values] = mockQuery.mock.calls[0];
    expect(sql).toMatch(/\(turn_id, engine_name, is_primary, response_text,\s*response_time_ms, processing_profile, confidence_score\)/);
    expect(values).toHaveLength(7);
    expect(values[0]).toBe(3003);
    expect(values[1]).toBe('claude');
    expect(values[2]).toBe(true);
    expect(values[3]).toBe('text');
    expect(values[4]).toBeNull();
    expect(values[5]).toBeNull();
    expect(values[6]).toBeNull();
  });

  test('non-interference: DB failure surfaces to caller (so .catch in seam can absorb it)', async () => {
    mockQuery.mockRejectedValueOnce(new Error('db down'));

    await expect(
      EngineComparisonService.logEngineResponse({
        turnId: 4004,
        engineName: 'claude',
        isPrimary: true,
        responseText: 'text',
      }),
    ).rejects.toThrow('Failed to log engine response for comparison');

    // The seam in maiaService.ts uses .catch() on this promise. Confirming the
    // error reaches that .catch() — rather than being silently swallowed inside
    // the service — is the non-interference invariant: failures stay observable
    // at the call site, even though the service itself rethrows a generic
    // message. The caller's .catch logs and does not block the user response.
  });
});
