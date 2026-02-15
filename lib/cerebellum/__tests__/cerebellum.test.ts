/**
 * Cerebellum Proof Tests
 *
 * These tests prove the two crown-jewel invariants:
 *
 * 1. SANCTUARY = ZERO PERSISTENCE
 *    When isSanctuary is true, no commits, no emissions, no trajectory reads.
 *    This is the trust posture of MAIA.
 *
 * 2. NON-BLOCKING NEVER BREAKS RESPOND
 *    When the sink throws (DB down, network error), the emission is swallowed
 *    and the caller continues uninterrupted. No unhandled rejections.
 *
 * These are NOT integration tests. They test the cerebellum layer in isolation,
 * without database, without oracle route, without LLM.
 */

import { createTurnContext, setStage, getStageTimings, shouldSkipOptional } from '../turnPipeline';
import { canCommit, canEmit, assertNoWritesInSanctuary } from '../consentGate';
import { emitNonBlocking, fieldSignalSpec } from '../emitter';
import { buildIdempotencyKey } from '../idempotency';
import type { TurnContext } from '../types';

// ═══════════════════════════════════════════════════════════════
// Helpers
// ═══════════════════════════════════════════════════════════════

function makeTurnCtx(overrides: Partial<Parameters<typeof createTurnContext>[0]> = {}): TurnContext {
  return createTurnContext({
    memberId: 'test-member-uuid',
    sessionId: 'test-session-id',
    turnId: 'test-turn-id',
    isSanctuary: false,
    ...overrides,
  });
}

function makeSanctuaryCtx(): TurnContext {
  return makeTurnCtx({ isSanctuary: true });
}

// ═══════════════════════════════════════════════════════════════
// TEST SUITE 1: Sanctuary = Zero Persistence
// ═══════════════════════════════════════════════════════════════

describe('Sanctuary = Zero Persistence', () => {
  describe('canCommit()', () => {
    it('returns true for non-sanctuary sessions', () => {
      const ctx = makeTurnCtx({ isSanctuary: false });
      expect(canCommit(ctx)).toBe(true);
    });

    it('returns false for sanctuary sessions', () => {
      const ctx = makeSanctuaryCtx();
      expect(canCommit(ctx)).toBe(false);
    });
  });

  describe('assertNoWritesInSanctuary()', () => {
    it('does not throw for non-sanctuary sessions', () => {
      const ctx = makeTurnCtx({ isSanctuary: false });
      expect(() => assertNoWritesInSanctuary(ctx)).not.toThrow();
    });

    it('throws SANCTUARY_HARD_STOP for sanctuary sessions', () => {
      const ctx = makeSanctuaryCtx();
      expect(() => assertNoWritesInSanctuary(ctx)).toThrow('SANCTUARY_HARD_STOP');
    });
  });

  describe('canEmit()', () => {
    it('allows private emissions for non-sanctuary', () => {
      const ctx = makeTurnCtx({ isSanctuary: false });
      expect(canEmit(ctx, 'private')).toBe(true);
    });

    it('blocks ALL emissions for sanctuary — private', () => {
      const ctx = makeSanctuaryCtx();
      expect(canEmit(ctx, 'private')).toBe(false);
    });

    it('blocks ALL emissions for sanctuary — circle', () => {
      const ctx = makeSanctuaryCtx();
      expect(canEmit(ctx, 'circle', { memberCircleOptIn: true })).toBe(false);
    });

    it('blocks ALL emissions for sanctuary — commons', () => {
      const ctx = makeSanctuaryCtx();
      expect(canEmit(ctx, 'commons', { memberCommonsOptIn: true })).toBe(false);
    });

    it('blocks commons without opt-in even for non-sanctuary', () => {
      const ctx = makeTurnCtx({ isSanctuary: false });
      expect(canEmit(ctx, 'commons')).toBe(false);
    });

    it('allows commons with explicit opt-in for non-sanctuary', () => {
      const ctx = makeTurnCtx({ isSanctuary: false });
      expect(canEmit(ctx, 'commons', { memberCommonsOptIn: true })).toBe(true);
    });

    it('blocks circle without opt-in even for non-sanctuary', () => {
      const ctx = makeTurnCtx({ isSanctuary: false });
      expect(canEmit(ctx, 'circle')).toBe(false);
    });

    it('allows circle with explicit opt-in for non-sanctuary', () => {
      const ctx = makeTurnCtx({ isSanctuary: false });
      expect(canEmit(ctx, 'circle', { memberCircleOptIn: true })).toBe(true);
    });
  });

  describe('emitNonBlocking() sanctuary gate', () => {
    it('never calls sink for sanctuary sessions', (done) => {
      const ctx = makeSanctuaryCtx();
      const spec = fieldSignalSpec({
        scope: 'private',
        signalType: 'breakthrough',
        element: 'fire',
        phase: 1,
        intensity: 0.8,
        coherenceDelta: 0.5,
      });

      const sinkCalled = jest.fn();

      emitNonBlocking({
        ctx,
        spec,
        sink: async () => { sinkCalled(); },
      });

      // Wait for microtask queue to drain
      setTimeout(() => {
        expect(sinkCalled).not.toHaveBeenCalled();
        done();
      }, 50);
    });

    it('calls sink for non-sanctuary sessions', (done) => {
      const ctx = makeTurnCtx({ isSanctuary: false });
      const spec = fieldSignalSpec({
        scope: 'private',
        signalType: 'breakthrough',
        element: 'fire',
        phase: 1,
        intensity: 0.8,
        coherenceDelta: 0.5,
      });

      const sinkCalled = jest.fn();

      emitNonBlocking({
        ctx,
        spec,
        sink: async ({ idempotencyKey }) => {
          sinkCalled(idempotencyKey);
        },
      });

      // Wait for microtask queue to drain
      setTimeout(() => {
        expect(sinkCalled).toHaveBeenCalledTimes(1);
        // Verify idempotency key is a 32-char hex string
        const key = sinkCalled.mock.calls[0][0];
        expect(key).toMatch(/^[0-9a-f]{32}$/);
        done();
      }, 50);
    });
  });
});

// ═══════════════════════════════════════════════════════════════
// TEST SUITE 2: Non-Blocking Never Breaks Respond
// ═══════════════════════════════════════════════════════════════

describe('Non-Blocking Never Breaks Respond', () => {
  it('swallows sink errors without throwing', (done) => {
    const ctx = makeTurnCtx({ isSanctuary: false });
    const spec = fieldSignalSpec({
      scope: 'private',
      signalType: 'collapse',
      element: 'water',
      phase: 7,
      intensity: 0.3,
      coherenceDelta: -0.4,
    });

    // Suppress console.warn for this test
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

    // This should NOT throw even though the sink explodes
    expect(() => {
      emitNonBlocking({
        ctx,
        spec,
        sink: async () => {
          throw new Error('DB connection refused');
        },
      });
    }).not.toThrow();

    // Wait for the microtask + error handler to run
    setTimeout(() => {
      // The error was logged, not thrown
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('field_signal.emit'),
        expect.stringContaining('DB connection refused')
      );
      warnSpy.mockRestore();
      done();
    }, 50);
  });

  it('calls custom onError handler instead of console.warn', (done) => {
    const ctx = makeTurnCtx({ isSanctuary: false });
    const spec = fieldSignalSpec({
      scope: 'private',
      signalType: 'integration',
      element: 'earth',
      phase: 3,
      intensity: 0.6,
      coherenceDelta: 0.4,
    });

    const errorHandler = jest.fn();

    emitNonBlocking({
      ctx,
      spec,
      sink: async () => {
        throw new Error('Network timeout');
      },
      onError: errorHandler,
    });

    setTimeout(() => {
      expect(errorHandler).toHaveBeenCalledTimes(1);
      expect(errorHandler.mock.calls[0][0]).toBeInstanceOf(Error);
      expect((errorHandler.mock.calls[0][0] as Error).message).toBe('Network timeout');
      done();
    }, 50);
  });

  it('returns void synchronously regardless of sink behavior', () => {
    const ctx = makeTurnCtx({ isSanctuary: false });
    const spec = fieldSignalSpec({
      scope: 'private',
      signalType: 'breakthrough',
      element: 'fire',
      phase: 1,
      intensity: 0.8,
      coherenceDelta: 0.5,
    });

    // The return value must be undefined (void), not a Promise
    const result = emitNonBlocking({
      ctx,
      spec,
      sink: async () => {
        // Simulate slow write
        await new Promise(resolve => setTimeout(resolve, 1000));
      },
    });

    expect(result).toBeUndefined();
  });
});

// ═══════════════════════════════════════════════════════════════
// TEST SUITE 3: Idempotency Key Properties
// ═══════════════════════════════════════════════════════════════

describe('Idempotency Key', () => {
  it('produces a 32-char lowercase hex string', () => {
    const ctx = makeTurnCtx();
    const spec = fieldSignalSpec({
      scope: 'private',
      signalType: 'breakthrough',
      element: 'fire',
      phase: 1,
      intensity: 0.8,
      coherenceDelta: 0.5,
    });

    const key = buildIdempotencyKey(ctx, spec);
    expect(key).toMatch(/^[0-9a-f]{32}$/);
  });

  it('is deterministic — same inputs produce same key', () => {
    const ctx1 = makeTurnCtx();
    const ctx2 = makeTurnCtx();
    const spec = fieldSignalSpec({
      scope: 'private',
      signalType: 'breakthrough',
      element: 'fire',
      phase: 1,
      intensity: 0.8,
      coherenceDelta: 0.5,
    });

    expect(buildIdempotencyKey(ctx1, spec)).toBe(buildIdempotencyKey(ctx2, spec));
  });

  it('varies with turn identity', () => {
    const ctx1 = makeTurnCtx({ turnId: 'turn-A' });
    const ctx2 = makeTurnCtx({ turnId: 'turn-B' });
    const spec = fieldSignalSpec({
      scope: 'private',
      signalType: 'breakthrough',
      element: 'fire',
      phase: 1,
      intensity: 0.8,
      coherenceDelta: 0.5,
    });

    expect(buildIdempotencyKey(ctx1, spec)).not.toBe(buildIdempotencyKey(ctx2, spec));
  });

  it('varies with emission spec', () => {
    const ctx = makeTurnCtx();
    const spec1 = fieldSignalSpec({
      scope: 'private',
      signalType: 'breakthrough',
      element: 'fire',
      phase: 1,
      intensity: 0.8,
      coherenceDelta: 0.5,
    });
    const spec2 = fieldSignalSpec({
      scope: 'private',
      signalType: 'collapse',
      element: 'fire',
      phase: 1,
      intensity: 0.8,
      coherenceDelta: -0.5,
    });

    expect(buildIdempotencyKey(ctx, spec1)).not.toBe(buildIdempotencyKey(ctx, spec2));
  });

  it('is stable despite whitespace in inputs', () => {
    const ctx1 = makeTurnCtx({ memberId: 'abc', turnId: 'xyz' });
    const ctx2 = makeTurnCtx({ memberId: ' abc ', turnId: ' xyz ' });
    const spec = fieldSignalSpec({
      scope: 'private',
      signalType: 'breakthrough',
      element: 'fire',
      phase: 1,
      intensity: 0.8,
      coherenceDelta: 0.5,
    });

    // After trim() normalization, these should produce the same key
    expect(buildIdempotencyKey(ctx1, spec)).toBe(buildIdempotencyKey(ctx2, spec));
  });
});

// ═══════════════════════════════════════════════════════════════
// TEST SUITE 4: Consent-Before-Budget Gate Ordering
// ═══════════════════════════════════════════════════════════════

describe('Consent-Before-Budget Gate Ordering', () => {
  it('sanctuary blocks emission even when budget is available', (done) => {
    const ctx = makeSanctuaryCtx();
    // Budget is fresh — plenty of time
    expect(Date.now() - ctx.startedAtMs).toBeLessThan(ctx.budgetMs);

    const sinkCalled = jest.fn();
    const spec = fieldSignalSpec({
      scope: 'private',
      signalType: 'breakthrough',
      element: 'fire',
      phase: 1,
      intensity: 0.8,
      coherenceDelta: 0.5,
    });

    emitNonBlocking({
      ctx,
      spec,
      sink: async () => { sinkCalled(); },
    });

    setTimeout(() => {
      // Consent gate should have blocked before budget was even checked
      expect(sinkCalled).not.toHaveBeenCalled();
      done();
    }, 50);
  });

  it('budget exhaustion blocks optional emissions for non-sanctuary', (done) => {
    // Create a context with expired budget
    const ctx = makeTurnCtx({ isSanctuary: false, budgetMs: 0 });

    const sinkCalled = jest.fn();
    const spec = fieldSignalSpec({
      scope: 'private',
      signalType: 'breakthrough',
      element: 'fire',
      phase: 1,
      intensity: 0.8,
      coherenceDelta: 0.5,
    });

    emitNonBlocking({
      ctx,
      spec,
      budgetGated: true,
      sink: async () => { sinkCalled(); },
    });

    setTimeout(() => {
      expect(sinkCalled).not.toHaveBeenCalled();
      done();
    }, 50);
  });

  it('budgetGated=false bypasses budget check', (done) => {
    // Create a context with expired budget
    const ctx = makeTurnCtx({ isSanctuary: false, budgetMs: 0 });

    const sinkCalled = jest.fn();
    const spec = fieldSignalSpec({
      scope: 'private',
      signalType: 'breakthrough',
      element: 'fire',
      phase: 1,
      intensity: 0.8,
      coherenceDelta: 0.5,
    });

    emitNonBlocking({
      ctx,
      spec,
      budgetGated: false,
      sink: async () => { sinkCalled(); },
    });

    setTimeout(() => {
      expect(sinkCalled).toHaveBeenCalledTimes(1);
      done();
    }, 50);
  });
});

// ═══════════════════════════════════════════════════════════════
// TEST SUITE 5: Stage Pipeline & Timing
// ═══════════════════════════════════════════════════════════════

describe('Stage Pipeline & Timing', () => {
  it('creates context in INGEST stage', () => {
    const ctx = makeTurnCtx();
    expect(ctx.stage).toBe('INGEST');
  });

  it('advances stages correctly', () => {
    const ctx = makeTurnCtx();
    setStage(ctx, 'LOAD');
    expect(ctx.stage).toBe('LOAD');
    setStage(ctx, 'CORTEX');
    expect(ctx.stage).toBe('CORTEX');
  });

  it('records stage timings', () => {
    const ctx = makeTurnCtx();
    setStage(ctx, 'LOAD');
    setStage(ctx, 'CORTEX');
    setStage(ctx, 'DONE');

    const timings = getStageTimings(ctx);
    expect(timings).toHaveLength(3); // INGEST, LOAD, CORTEX (DONE has no duration yet)
    expect(timings[0].stage).toBe('INGEST');
    expect(timings[1].stage).toBe('LOAD');
    expect(timings[2].stage).toBe('CORTEX');
    // All durations should be >= 0
    timings.forEach(t => expect(t.durationMs).toBeGreaterThanOrEqual(0));
  });

  it('initializes with INGEST timing entry', () => {
    const ctx = makeTurnCtx();
    expect(ctx.stageTimings).toHaveLength(1);
    expect(ctx.stageTimings[0].stage).toBe('INGEST');
    expect(ctx.stageTimings[0].enteredAtMs).toBeGreaterThan(0);
  });
});
