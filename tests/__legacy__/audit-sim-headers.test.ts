/**
 * Integration tests for memory pipeline simulation headers
 * Ensures the double-gate (NODE_ENV + MAIA_MEMORY_SIM_HEADERS) works correctly
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';

// Mock the request headers interface
const createMockReq = (headers: Record<string, string>) => ({
  headers: {
    get: (name: string) => headers[name.toLowerCase()] || null,
  },
});

// Extract the gate logic (mirrors route.ts implementation)
function evaluateSimHeaders(env: NodeJS.ProcessEnv, req: ReturnType<typeof createMockReq>) {
  const simHeadersEnabled =
    env.NODE_ENV !== 'production' &&
    env.MAIA_MEMORY_SIM_HEADERS === '1';

  return {
    simHeadersEnabled,
    simulatePipelineMissing:
      simHeadersEnabled &&
      req.headers.get('x-maia-simulate-pipeline-missing') === '1',
    simulateZeroSemantic:
      simHeadersEnabled &&
      req.headers.get('x-maia-simulate-zero-semantic') === '1',
    simulateBigBundle:
      simHeadersEnabled &&
      req.headers.get('x-maia-simulate-big-bundle') === '1',
    simulateLowThresholds:
      simHeadersEnabled &&
      req.headers.get('x-maia-simulate-low-thresholds') === '1',
  };
}

describe('Audit Simulation Headers Double-Gate', () => {
  const originalEnv = { ...process.env };

  afterAll(() => {
    process.env = originalEnv;
  });

  describe('when MAIA_MEMORY_SIM_HEADERS is NOT set', () => {
    it('should ignore all simulation headers', () => {
      const env = { NODE_ENV: 'development' } as NodeJS.ProcessEnv;
      const req = createMockReq({
        'x-maia-simulate-pipeline-missing': '1',
        'x-maia-simulate-zero-semantic': '1',
        'x-maia-simulate-big-bundle': '1',
        'x-maia-simulate-low-thresholds': '1',
      });

      const result = evaluateSimHeaders(env, req);

      expect(result.simHeadersEnabled).toBe(false);
      expect(result.simulatePipelineMissing).toBe(false);
      expect(result.simulateZeroSemantic).toBe(false);
      expect(result.simulateBigBundle).toBe(false);
      expect(result.simulateLowThresholds).toBe(false);
    });
  });

  describe('when MAIA_MEMORY_SIM_HEADERS=1 in development', () => {
    it('should enable simulation headers when present', () => {
      const env = {
        NODE_ENV: 'development',
        MAIA_MEMORY_SIM_HEADERS: '1',
      } as NodeJS.ProcessEnv;
      const req = createMockReq({
        'x-maia-simulate-pipeline-missing': '1',
        'x-maia-simulate-zero-semantic': '1',
        'x-maia-simulate-big-bundle': '1',
        'x-maia-simulate-low-thresholds': '1',
      });

      const result = evaluateSimHeaders(env, req);

      expect(result.simHeadersEnabled).toBe(true);
      expect(result.simulatePipelineMissing).toBe(true);
      expect(result.simulateZeroSemantic).toBe(true);
      expect(result.simulateBigBundle).toBe(true);
      expect(result.simulateLowThresholds).toBe(true);
    });

    it('should not enable simulation when headers are absent', () => {
      const env = {
        NODE_ENV: 'development',
        MAIA_MEMORY_SIM_HEADERS: '1',
      } as NodeJS.ProcessEnv;
      const req = createMockReq({});

      const result = evaluateSimHeaders(env, req);

      expect(result.simHeadersEnabled).toBe(true);
      expect(result.simulatePipelineMissing).toBe(false);
      expect(result.simulateZeroSemantic).toBe(false);
      expect(result.simulateBigBundle).toBe(false);
      expect(result.simulateLowThresholds).toBe(false);
    });
  });

  describe('when NODE_ENV=production', () => {
    it('should block all simulation headers even with MAIA_MEMORY_SIM_HEADERS=1', () => {
      const env = {
        NODE_ENV: 'production',
        MAIA_MEMORY_SIM_HEADERS: '1',
      } as NodeJS.ProcessEnv;
      const req = createMockReq({
        'x-maia-simulate-pipeline-missing': '1',
        'x-maia-simulate-zero-semantic': '1',
        'x-maia-simulate-big-bundle': '1',
        'x-maia-simulate-low-thresholds': '1',
      });

      const result = evaluateSimHeaders(env, req);

      expect(result.simHeadersEnabled).toBe(false);
      expect(result.simulatePipelineMissing).toBe(false);
      expect(result.simulateZeroSemantic).toBe(false);
      expect(result.simulateLowThresholds).toBe(false);
      expect(result.simulateBigBundle).toBe(false);
    });
  });
});
