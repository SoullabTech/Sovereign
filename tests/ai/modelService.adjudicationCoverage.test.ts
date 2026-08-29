/**
 * modelService — constitutional adjudication coverage (MAIA Behavioral Portability)
 *
 * Proves EMPIRICALLY what the constitutional verifier proves structurally: every
 * dispatch branch of generateText returns through the adjudicator, so a verdict
 * exists for every substrate.
 *
 * Why this matters more than it looks: before this cut, logStancePost ran inside
 * claudeClient only. Every Anthropic turn was adjudicated and no other substrate
 * ever was — so the substrate most in need of comparison was the one never
 * measured, and any portability claim built on that evidence would have been
 * a single-substrate record wearing a comparative label.
 *
 * The branches exercised here are the five generateText dispatches. localInference
 * is reached only beneath sovereignRouter, which itself returns through the seam,
 * so it is covered transitively.
 *
 * Also pinned here (gate 2): observation must not change the thing observed.
 * generateText returns the SAME object the routing path produced, with the same
 * text and provider. The adjudicator may not mutate, retry, reroute, rewrite or
 * reject a generated answer — this cut is observability, not enforcement.
 *
 * Canon: docs/canon/MAIA_BEHAVIORAL_PORTABILITY.md § Coverage precondition
 */

// ── Env before imports: MAIA_INFERENCE_MODE is a module-level constant ───────
delete process.env.MAIA_INFERENCE_MODE;
process.env.MAIA_LOG_TOKEN_USAGE = 'false';
process.env.MAIA_ENABLE_MULTI_ENGINE = 'true';

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
  isKimiAvailable: () => true,
}));
jest.mock('../../lib/ai/multiEngineOrchestrator', () => ({
  generateWithMultipleEngines: jest.fn(),
}));
jest.mock('../../lib/ai/sovereignRouter', () => ({
  generateTextWithSovereignty: jest.fn(),
}));

import { describe, it, expect, beforeEach } from '@jest/globals';
import { generateText } from '../../lib/ai/modelService';
import { generateWithClaude } from '../../lib/ai/claudeClient';
import { generateWithLocalModel } from '../../lib/ai/localModelClient';
import { generateWithKimi } from '../../lib/ai/kimiClient';
import { generateWithMultipleEngines } from '../../lib/ai/multiEngineOrchestrator';
import { STANCE_ADJUDICATOR_VERSION } from '../../lib/sovereign/stanceDetector';

const mockClaude = generateWithClaude as jest.MockedFunction<typeof generateWithClaude>;
const mockLocal = generateWithLocalModel as jest.MockedFunction<typeof generateWithLocalModel>;
const mockKimi = generateWithKimi as jest.MockedFunction<typeof generateWithKimi>;
const mockMulti = generateWithMultipleEngines as jest.MockedFunction<typeof generateWithMultipleEngines>;

/**
 * An utterance the deterministic adjudicator classifies as CAPTURED: operational
 * over-reach with no stance-retention marker. Used so a passing test proves the
 * verdict was really computed from the returned text, not defaulted.
 */
const CAPTURED_TEXT = 'I ran the trace and confirmed the root cause is the ranking layer.';
const HELD_TEXT = "I don't have access to those logs. What are you noticing as you sit with it?";

const req = (meta: Record<string, unknown> = {}) => ({
  systemPrompt: 'sp',
  userInput: 'ui',
  meta,
});

const result = (provider: string, text = CAPTURED_TEXT) => ({
  text,
  provider: { provider, model: 'm', mode: 'full' as const },
});

describe('generateText — adjudication reaches every dispatch branch', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    delete process.env.MOONSHOT_API_KEY;
  });

  it('anthropic branch returns a stamped verdict', async () => {
    mockClaude.mockResolvedValue(result('anthropic') as never);
    const r = await generateText(req());
    expect(r.verdict).toEqual({
      stanceMode: 'captured',
      authSlip: false,
      adjudicatorVersion: STANCE_ADJUDICATOR_VERSION,
    });
  });

  it('local branch returns a stamped verdict (Claude unavailable → fallback)', async () => {
    mockClaude.mockRejectedValue(new Error('claude down'));
    mockLocal.mockResolvedValue(result('ollama') as never);
    const r = await generateText(req());
    expect(mockLocal).toHaveBeenCalled();
    expect(r.verdict?.stanceMode).toBe('captured');
    expect(r.verdict?.adjudicatorVersion).toBe(STANCE_ADJUDICATOR_VERSION);
  });

  // Local-primary (TEXT_MODEL_PROVIDER='local') and Claude-unavailable fallback
  // converge on the SAME `return localResult` statement in generateTextInner,
  // so the test above covers that return path for both. TEXT_MODEL_PROVIDER is
  // a module-level constant and cannot be re-read per test in this file.

  it('moonshot branch returns a stamped verdict', async () => {
    mockKimi.mockResolvedValue(result('moonshot') as never);
    const r = await generateText(req({ useKimi: true }));
    expect(mockKimi).toHaveBeenCalled();
    expect(r.verdict?.stanceMode).toBe('captured');
  });

  it('multi_engine branch returns a stamped verdict', async () => {
    mockMulti.mockResolvedValue({
      consensus: CAPTURED_TEXT,
      primaryResponse: CAPTURED_TEXT,
      processingTime: 1,
      confidence: 1,
      engineResponses: new Map(),
    } as never);
    const r = await generateText(req({ useMultiEngine: true }));
    expect(mockMulti).toHaveBeenCalled();
    expect(r.verdict?.stanceMode).toBe('captured');
  });

  it('discriminates: a held utterance is not classified as captured', async () => {
    // Guards against a verdict that is merely present rather than computed.
    mockClaude.mockResolvedValue(result('anthropic', HELD_TEXT) as never);
    const r = await generateText(req());
    expect(r.verdict?.stanceMode).toBe('boundary');
  });
});

describe('generateText — observation does not change what it observes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns the same object, text and provider the routing path produced', async () => {
    const produced = result('anthropic');
    mockClaude.mockResolvedValue(produced as never);
    const r = await generateText(req());
    expect(r).toBe(produced);            // identity preserved
    expect(r.text).toBe(CAPTURED_TEXT);  // never rewritten
    expect(r.provider.provider).toBe('anthropic');
  });

  it('does not retry, reroute or reject on a captured verdict', async () => {
    mockClaude.mockResolvedValue(result('anthropic') as never);
    const r = await generateText(req());
    // The adjudicator saw a constitutional violation and did nothing about it:
    // this cut is observability. Enforcement is the separate egress guard.
    expect(r.verdict?.stanceMode).toBe('captured');
    expect(mockClaude).toHaveBeenCalledTimes(1);
    expect(mockLocal).not.toHaveBeenCalled();
    expect(r.text).toBe(CAPTURED_TEXT);
  });
});

describe('generateText — Sanctuary emits no derived stance evidence', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns no verdict for a sanctuary turn', async () => {
    mockClaude.mockResolvedValue(result('anthropic') as never);
    const r = await generateText(req({ sanctuary: true }));
    expect(r.verdict).toBeUndefined();
  });

  it('writes no stance classification to the logs for a sanctuary turn', async () => {
    // The hole this closes: suppressing the database fields while still logging
    // stance_mode and auth_slip would make the boundary cosmetic — application
    // logs are durable telemetry too.
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    try {
      mockClaude.mockResolvedValue(result('anthropic') as never);
      await generateText(req({ sanctuary: true }));
      const stanceLines = spy.mock.calls
        .map(c => String(c[0]))
        .filter(l => l.includes('[MAIA/stance] post'));
      expect(stanceLines).toHaveLength(1);
      expect(stanceLines[0]).toBe('[MAIA/stance] post {"suppressed":"sanctuary"}');
      expect(stanceLines[0]).not.toContain('stance_mode');
      expect(stanceLines[0]).not.toContain('auth_slip');
      expect(stanceLines[0]).not.toContain('captured');
    } finally {
      spy.mockRestore();
    }
  });

  it('resolves posture fail-closed from nested meta', async () => {
    // TurnPosture treats any affirmative signal as sanctuary, including nested.
    mockClaude.mockResolvedValue(result('anthropic') as never);
    const r = await generateText(req({ meta: { sanctuary: true } }));
    expect(r.verdict).toBeUndefined();
  });

  it('an ordinary turn still produces and logs a verdict', async () => {
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    try {
      mockClaude.mockResolvedValue(result('anthropic') as never);
      const r = await generateText(req());
      expect(r.verdict?.stanceMode).toBe('captured');
      const stanceLines = spy.mock.calls
        .map(c => String(c[0]))
        .filter(l => l.includes('[MAIA/stance] post'));
      expect(stanceLines[0]).toContain('stance_mode');
    } finally {
      spy.mockRestore();
    }
  });
});
