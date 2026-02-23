/**
 * Phase 1 Sovereign Router — Unit Tests
 *
 * Tests routing decisions for all three inference modes:
 *   sovereign / local_only — local first, degraded on failure, NO vendor switch
 *   primary               — Anthropic first, local fallback, degraded if both fail
 *
 * Run: npm test -- tests/ai/sovereignRouter.test.ts
 */

// ── Env must be set before any module load ────────────────────────────────────
process.env.LOCAL_INFERENCE_BASE_URL = 'http://test-local:8080';
process.env.LOCAL_INFERENCE_TIMEOUT_MS = '5000';
process.env.MAIA_LOG_TOKEN_USAGE = 'false';

// ── Mocks ─────────────────────────────────────────────────────────────────────
jest.mock('../../lib/ai/claudeClient', () => ({
  generateWithClaude: jest.fn(),
}));

import { describe, it, expect, beforeEach } from '@jest/globals';
import { generateTextWithSovereignty } from '../../lib/ai/sovereignRouter';
import { resetCircuitBreaker } from '../../lib/ai/localInferenceClient';
import { generateWithClaude } from '../../lib/ai/claudeClient';

const mockClaude = generateWithClaude as jest.MockedFunction<typeof generateWithClaude>;

// ── Fixtures ──────────────────────────────────────────────────────────────────
const BASE_REQ = { systemPrompt: 'You are MAIA.', userInput: 'Hello' };
const DEGRADED_SNIPPET = "MAIA is here. I've saved your message.";

const LOCAL_RESPONSE = {
  ok: true,
  json: () => Promise.resolve({ text: 'local response text', model: 'deepseek-r1' }),
} as unknown as Response;

const HEALTH_OK = { ok: true } as Response;

// ── Fetch helpers ─────────────────────────────────────────────────────────────
function setupFetch(...responses: Array<Response | Error>) {
  let call = 0;
  (global.fetch as jest.Mock).mockImplementation(() => {
    const r = responses[call++];
    if (r instanceof Error) return Promise.reject(r);
    return Promise.resolve(r);
  });
}

// ── Test suite ────────────────────────────────────────────────────────────────
describe('sovereignRouter — generateTextWithSovereignty', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetCircuitBreaker();
    global.fetch = jest.fn() as jest.MockedFunction<typeof fetch>;
  });

  // ── sovereign mode ──────────────────────────────────────────────────────────
  describe('sovereign mode', () => {
    it('returns local result when local is healthy', async () => {
      setupFetch(HEALTH_OK, LOCAL_RESPONSE);

      const result = await generateTextWithSovereignty(BASE_REQ, 'sovereign', Date.now());

      expect(result.text).toBe('local response text');
      expect(result.provider.provider).toBe('local_inference');
      expect(result.provider.mode).toBe('full');
      expect(mockClaude).not.toHaveBeenCalled();
    });

    it('returns degraded when health probe fails — no Anthropic switch', async () => {
      setupFetch(new Error('connection refused'));

      const result = await generateTextWithSovereignty(BASE_REQ, 'sovereign', Date.now());

      expect(result.text).toContain(DEGRADED_SNIPPET);
      expect(result.provider.provider).toBe('unknown');
      expect(result.provider.mode).toBe('fallback');
      expect(mockClaude).not.toHaveBeenCalled();
    });

    it('returns degraded when generate call fails — no Anthropic switch', async () => {
      setupFetch(HEALTH_OK, new Error('generate timeout'));

      const result = await generateTextWithSovereignty(BASE_REQ, 'sovereign', Date.now());

      expect(result.text).toContain(DEGRADED_SNIPPET);
      expect(result.provider.provider).toBe('unknown');
      expect(mockClaude).not.toHaveBeenCalled();
    });
  });

  // ── local_only mode ─────────────────────────────────────────────────────────
  describe('local_only mode', () => {
    it('behaves identically to sovereign — returns local result', async () => {
      setupFetch(HEALTH_OK, LOCAL_RESPONSE);

      const result = await generateTextWithSovereignty(BASE_REQ, 'local_only', Date.now());

      expect(result.text).toBe('local response text');
      expect(result.provider.provider).toBe('local_inference');
      expect(mockClaude).not.toHaveBeenCalled();
    });

    it('returns degraded when unhealthy — no Anthropic', async () => {
      setupFetch(new Error('refused'));

      const result = await generateTextWithSovereignty(BASE_REQ, 'local_only', Date.now());

      expect(result.text).toContain(DEGRADED_SNIPPET);
      expect(mockClaude).not.toHaveBeenCalled();
    });
  });

  // ── primary mode ────────────────────────────────────────────────────────────
  describe('primary mode', () => {
    it('returns Anthropic result when Anthropic succeeds — no local call', async () => {
      mockClaude.mockResolvedValueOnce({
        text: 'anthropic response',
        provider: { provider: 'anthropic', model: 'claude-opus-4-5', mode: 'full' },
      });

      const result = await generateTextWithSovereignty(BASE_REQ, 'primary', Date.now());

      expect(result.text).toBe('anthropic response');
      expect(result.provider.provider).toBe('anthropic');
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('falls back to local when Anthropic fails', async () => {
      mockClaude.mockRejectedValueOnce(new Error('Anthropic 503'));
      setupFetch(HEALTH_OK, LOCAL_RESPONSE);

      const result = await generateTextWithSovereignty(BASE_REQ, 'primary', Date.now());

      expect(result.text).toBe('local response text');
      expect(result.provider.provider).toBe('local_inference');
    });

    it('returns degraded when both Anthropic and local fail', async () => {
      mockClaude.mockRejectedValueOnce(new Error('Anthropic down'));
      setupFetch(new Error('local also down'));

      const result = await generateTextWithSovereignty(BASE_REQ, 'primary', Date.now());

      expect(result.text).toContain(DEGRADED_SNIPPET);
      expect(result.provider.provider).toBe('unknown');
    });

    it('re-throws ANTHROPIC_BILLING_ERROR without local fallback', async () => {
      const billingErr = Object.assign(new Error('Billing'), { code: 'ANTHROPIC_BILLING_ERROR' });
      mockClaude.mockRejectedValueOnce(billingErr);

      await expect(
        generateTextWithSovereignty(BASE_REQ, 'primary', Date.now()),
      ).rejects.toMatchObject({ code: 'ANTHROPIC_BILLING_ERROR' });

      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('re-throws noFallback errors without local attempt', async () => {
      const authErr = Object.assign(new Error('Auth fail'), { noFallback: true });
      mockClaude.mockRejectedValueOnce(authErr);

      await expect(
        generateTextWithSovereignty(BASE_REQ, 'primary', Date.now()),
      ).rejects.toMatchObject({ noFallback: true });

      expect(global.fetch).not.toHaveBeenCalled();
    });
  });

  // ── Circuit breaker ─────────────────────────────────────────────────────────
  describe('circuit breaker', () => {
    it('skips health probe after a failure trips the circuit', async () => {
      // First request — health probe fails, trips circuit
      setupFetch(new Error('refused'));
      await generateTextWithSovereignty(BASE_REQ, 'sovereign', Date.now());

      // Second request — circuit open, fetch must not be called at all
      jest.clearAllMocks();
      global.fetch = jest.fn() as jest.MockedFunction<typeof fetch>;

      const result = await generateTextWithSovereignty(BASE_REQ, 'sovereign', Date.now());

      expect(global.fetch).not.toHaveBeenCalled();
      expect(result.text).toContain(DEGRADED_SNIPPET);
    });

    it('recovers after resetCircuitBreaker is called', async () => {
      // Trip the circuit
      setupFetch(new Error('refused'));
      await generateTextWithSovereignty(BASE_REQ, 'sovereign', Date.now());

      // Reset and verify it works again
      resetCircuitBreaker();
      jest.clearAllMocks();
      global.fetch = jest.fn() as jest.MockedFunction<typeof fetch>;
      setupFetch(HEALTH_OK, LOCAL_RESPONSE);

      const result = await generateTextWithSovereignty(BASE_REQ, 'sovereign', Date.now());

      expect(result.text).toBe('local response text');
      expect(result.provider.provider).toBe('local_inference');
    });
  });
});
