/**
 * modelService — Sovereign Guard Tests
 *
 * Verifies that the MAIA_INFERENCE_MODE guard in generateText() delegates
 * to sovereignRouter when the env var is set, bypassing all existing provider
 * logic (Claude, Ollama, Kimi, multi-engine).
 *
 * NOTE: MAIA_INFERENCE_MODE is read as a module-level constant, so this file
 * sets the env var before ANY import.
 *
 * Run: npm test -- tests/ai/modelService.sovereign-fallback.test.ts
 */

// ── Set env BEFORE all imports ────────────────────────────────────────────────
process.env.MAIA_INFERENCE_MODE = 'primary';
process.env.MAIA_LOG_TOKEN_USAGE = 'false';

// ── Mocks (must precede the imports they affect) ──────────────────────────────
jest.mock('../../lib/ai/claudeClient', () => ({
  generateWithClaude: jest.fn(),
  checkClaudeHealth: jest.fn(),
}));
jest.mock('../../lib/ai/localModelClient', () => ({
  generateWithLocalModel: jest.fn(),
  checkLocalModelHealth: jest.fn(),
}));
jest.mock('../../lib/ai/kimiClient', () => ({
  generateWithKimi: jest.fn(),
  checkKimiHealth: jest.fn(),
  isKimiAvailable: () => false,
}));
jest.mock('../../lib/ai/multiEngineOrchestrator', () => ({
  generateWithMultipleEngines: jest.fn(),
}));
jest.mock('../../lib/ai/sovereignRouter', () => ({
  generateTextWithSovereignty: jest.fn(),
}));

import { describe, it, expect, beforeEach } from '@jest/globals';
import { generateText } from '../../lib/ai/modelService';
import { generateTextWithSovereignty } from '../../lib/ai/sovereignRouter';
import { generateWithClaude } from '../../lib/ai/claudeClient';
import { generateWithLocalModel } from '../../lib/ai/localModelClient';
import { STANCE_ADJUDICATOR_VERSION } from '../../lib/sovereign/stanceDetector';

const mockRouter = generateTextWithSovereignty as jest.MockedFunction<typeof generateTextWithSovereignty>;
const mockClaude = generateWithClaude as jest.MockedFunction<typeof generateWithClaude>;
const mockLocal = generateWithLocalModel as jest.MockedFunction<typeof generateWithLocalModel>;

const REQ = { systemPrompt: 'sys', userInput: 'hi' };
const SOVEREIGN_RESULT = {
  text: 'routed by sovereign',
  provider: { provider: 'local_inference' as const, model: 'local', mode: 'full' as const },
};

describe('modelService.generateText — sovereign guard (MAIA_INFERENCE_MODE=primary)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRouter.mockResolvedValue(SOVEREIGN_RESULT);
  });

  it('calls generateTextWithSovereignty — not any direct provider', async () => {
    const result = await generateText(REQ);

    expect(mockRouter).toHaveBeenCalledTimes(1);
    expect(result).toBe(SOVEREIGN_RESULT);
    expect(mockClaude).not.toHaveBeenCalled();
    expect(mockLocal).not.toHaveBeenCalled();
  });

  it('passes the request unchanged', async () => {
    await generateText(REQ);

    expect(mockRouter).toHaveBeenCalledWith(REQ, 'primary', expect.any(Number));
  });

  /**
   * Adjudication coverage for the sovereign-routing branch — the fifth and last
   * generateText dispatch, and the one that cannot be exercised from
   * modelService.adjudicationCoverage.test.ts because MAIA_INFERENCE_MODE is a
   * module-level constant read at import time.
   *
   * localInference sits beneath this router, so it is covered here transitively.
   * Canon: docs/canon/MAIA_BEHAVIORAL_PORTABILITY.md § Coverage precondition
   */
  it('the sovereign-routed result is adjudicated like every other branch', async () => {
    mockRouter.mockResolvedValue({
      ...SOVEREIGN_RESULT,
      text: 'I ran the trace and confirmed the root cause is the ranking layer.',
    });

    const result = await generateText(REQ);

    expect(result.verdict).toEqual({
      stanceMode: 'captured',
      authSlip: false,
      adjudicatorVersion: STANCE_ADJUDICATOR_VERSION,
    });
  });

  it('passes t0 as a current timestamp', async () => {
    const before = Date.now();
    await generateText(REQ);
    const after = Date.now();

    const t0: number = mockRouter.mock.calls[0][2];
    expect(t0).toBeGreaterThanOrEqual(before);
    expect(t0).toBeLessThanOrEqual(after);
  });

  it('propagates errors thrown by sovereignRouter unchanged', async () => {
    const billingErr = Object.assign(new Error('Billing'), { code: 'ANTHROPIC_BILLING_ERROR' });
    mockRouter.mockRejectedValueOnce(billingErr);

    await expect(generateText(REQ)).rejects.toMatchObject({ code: 'ANTHROPIC_BILLING_ERROR' });
  });
});
