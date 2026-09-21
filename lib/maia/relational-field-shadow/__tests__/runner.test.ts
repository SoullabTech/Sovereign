jest.mock('../fieldAssembler', () => {
  const actual = jest.requireActual('../fieldAssembler');
  return { ...actual, loadPriorMemberTurns: jest.fn() };
});
jest.mock('../ollamaProvider', () => {
  const actual = jest.requireActual('../ollamaProvider');
  return { ...actual, generateRelationalFieldPlan: jest.fn() };
});
jest.mock('../evidenceStore', () => ({ persistRelationalFieldShadowEvidence: jest.fn() }));
jest.mock('../epistemicTelemetryStore', () => ({ persistEpistemicJoinShadowTelemetry: jest.fn() }));

import { loadPriorMemberTurns } from '../fieldAssembler';
import { generateRelationalFieldPlan } from '../ollamaProvider';
import { persistRelationalFieldShadowEvidence } from '../evidenceStore';
import { persistEpistemicJoinShadowTelemetry } from '../epistemicTelemetryStore';
import { launchRelationalFieldShadow, runRelationalFieldShadow } from '../runner';

const load = loadPriorMemberTurns as jest.Mock;
const generate = generateRelationalFieldPlan as jest.Mock;
const persist = persistRelationalFieldShadowEvidence as jest.Mock;
const persistTelemetry = persistEpistemicJoinShadowTelemetry as jest.Mock;
const base = {
  turnId: 77,
  exchangeId: 'ex-77',
  sessionId: 's-77',
  userInput: 'current member turn',
  primaryResponse: 'primary MAIA response',
  processingProfile: 'CORE' as const,
  originRoute: '/api/sovereign/app/maia/list',
  memberId: 'member-1',
};

describe('SH-F1/2/3/6/7 runner containment', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.MAIA_RELATIONAL_FIELD_SHADOW = '1';
    process.env.MAIA_RELATIONAL_FIELD_SHADOW_MEMBER_IDS = 'member-1';
    process.env.MAIA_RELATIONAL_FIELD_SHADOW_MODELS = 'qwen3:32b';
    delete process.env.MAIA_EPISTEMIC_JOIN_INTEGRATION_SHADOW;
    load.mockResolvedValue([]);
    persist.mockResolvedValue(undefined);
    persistTelemetry.mockResolvedValue(undefined);
  });



  test('launcher returns after scheduling and before any read or generation starts', () => {
    const original = global.setImmediate;
    const callbacks: Array<() => void> = [];
    (global as any).setImmediate = jest.fn((cb: () => void) => {
      callbacks.push(cb);
      return { ref() {}, unref() {} } as any;
    });
    try {
      const result = launchRelationalFieldShadow(base);
      expect(result).toBeUndefined();
      expect(callbacks).toHaveLength(1);
      expect(load).not.toHaveBeenCalled();
      expect(generate).not.toHaveBeenCalled();
      expect(persist).not.toHaveBeenCalled();
    } finally {
      global.setImmediate = original;
    }
  });
  test('turnId=0 (Sanctuary/non-learning) launches no generation and writes no shadow evidence', async () => {
    await runRelationalFieldShadow({ ...base, turnId: 0 }, ['qwen3:32b']);
    expect(load).not.toHaveBeenCalled();
    expect(generate).not.toHaveBeenCalled();
    expect(persist).not.toHaveBeenCalled();
  });



  test('member outside explicit research allowlist does nothing', async () => {
    await runRelationalFieldShadow({ ...base, memberId: 'member-2' }, ['qwen3:32b']);
    expect(load).not.toHaveBeenCalled();
    expect(generate).not.toHaveBeenCalled();
    expect(persist).not.toHaveBeenCalled();
  });
  test('borrowed first-person is persisted as refusal with no regeneration', async () => {
    generate.mockResolvedValueOnce({
      modelName: 'qwen3:32b', seed: 42, generationMs: 9,
      rawText: JSON.stringify({ synthesis: [{ text: 'as if to say, I see you', basisEvidenceIds: ['E1'] }], question: 'what opens?' }),
      rawPlan: { synthesis: [{ text: 'as if to say, I see you', basisEvidenceIds: ['E1'] }], question: 'what opens?' },
    });
    await runRelationalFieldShadow(base, ['qwen3:32b']);
    expect(generate).toHaveBeenCalledTimes(1);
    expect(persist).toHaveBeenCalledTimes(1);
    expect(persist.mock.calls[0][0]).toMatchObject({
      status: 'refused', refusalCode: 'borrowed_first_person',
    });
    expect(persist.mock.calls[0][0]).not.toHaveProperty('shadowResponseText');
  });

  test('lawful plan persists rendered shadow without writing back into primary input', async () => {
    const original = { ...base };
    generate.mockResolvedValueOnce({
      modelName: 'qwen3:32b', seed: 43, generationMs: 8,
      rawText: JSON.stringify({ synthesis: [{ text: 'a pattern may be taking shape', basisEvidenceIds: ['E1'] }], question: 'what feels open?' }),
      rawPlan: { synthesis: [{ text: 'a pattern may be taking shape', basisEvidenceIds: ['E1'] }], question: 'what feels open?' },
    });
    await runRelationalFieldShadow(base, ['qwen3:32b']);
    expect(base).toEqual(original);
    expect(persist.mock.calls[0][0]).toMatchObject({ status: 'rendered', modelName: 'qwen3:32b' });
    expect(persist.mock.calls[0][0].shadowResponseText).toContain('One possibility I see');
    expect(persistTelemetry).not.toHaveBeenCalled();
  });

  test('I4 telemetry is not attempted when ordinary shadow evidence failed to persist', async () => {
    process.env.MAIA_EPISTEMIC_JOIN_INTEGRATION_SHADOW = '1';
    load.mockResolvedValueOnce([{
      id: 'prior-1',
      exchangeId: 'ex-prior',
      content: 'Earlier I named the same concern.',
      createdAt: '2026-09-20T10:00:00.000Z',
      sourceKind: 'conversation_turn',
    }]);
    generate.mockResolvedValueOnce({
      modelName: 'qwen3:32b', seed: 45, generationMs: 7,
      rawText: JSON.stringify({ synthesis: [{ text: 'a pattern may be taking shape', basisEvidenceIds: ['E1', 'E2'] }] }),
      rawPlan: { synthesis: [{ text: 'a pattern may be taking shape', basisEvidenceIds: ['E1', 'E2'] }] },
    });
    persist.mockRejectedValueOnce(new Error('ordinary-shadow-store-down'));
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    try {
      await expect(runRelationalFieldShadow(base, ['qwen3:32b'])).resolves.toBeUndefined();
      expect(persist).toHaveBeenCalledTimes(1);
      expect(persistTelemetry).not.toHaveBeenCalled();
    } finally {
      warn.mockRestore();
    }
  });

  test('I4 telemetry failure cannot roll back or rewrite ordinary shadow evidence', async () => {
    process.env.MAIA_EPISTEMIC_JOIN_INTEGRATION_SHADOW = '1';
    load.mockResolvedValueOnce([{
      id: 'prior-1',
      exchangeId: 'ex-prior',
      content: 'Earlier I named the same concern.',
      createdAt: '2026-09-20T10:00:00.000Z',
      sourceKind: 'conversation_turn',
    }]);
    generate.mockResolvedValueOnce({
      modelName: 'qwen3:32b', seed: 46, generationMs: 7,
      rawText: JSON.stringify({ synthesis: [{ text: 'a pattern may be taking shape', basisEvidenceIds: ['E1', 'E2'] }] }),
      rawPlan: { synthesis: [{ text: 'a pattern may be taking shape', basisEvidenceIds: ['E1', 'E2'] }] },
    });
    persistTelemetry.mockRejectedValueOnce(new Error('i4-telemetry-store-down'));
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    try {
      await expect(runRelationalFieldShadow(base, ['qwen3:32b'])).resolves.toBeUndefined();
      expect(persist).toHaveBeenCalledTimes(1);
      expect(persistTelemetry).toHaveBeenCalledTimes(1);
      expect(persist.mock.invocationCallOrder[0]).toBeLessThan(persistTelemetry.mock.invocationCallOrder[0]);
    } finally {
      warn.mockRestore();
    }
  });

  test('I4 opt-in adds structural epistemic telemetry to shadow evidence only', async () => {
    process.env.MAIA_EPISTEMIC_JOIN_INTEGRATION_SHADOW = '1';
    const original = { ...base };
    load.mockResolvedValueOnce([{
      id: 'prior-1',
      exchangeId: 'ex-prior',
      content: 'Earlier I named the same concern.',
      createdAt: '2026-09-20T10:00:00.000Z',
      sourceKind: 'conversation_turn',
    }]);
    generate.mockResolvedValueOnce({
      modelName: 'qwen3:32b', seed: 44, generationMs: 7,
      rawText: JSON.stringify({ synthesis: [{ text: 'a pattern may be taking shape', basisEvidenceIds: ['E1', 'E2'] }], question: 'what feels open?' }),
      rawPlan: { synthesis: [{ text: 'a pattern may be taking shape', basisEvidenceIds: ['E1', 'E2'] }], question: 'what feels open?' },
    });

    await runRelationalFieldShadow(base, ['qwen3:32b']);

    expect(base).toEqual(original);
    expect(persist).toHaveBeenCalledTimes(1);
    expect(persist.mock.calls[0][0]).toMatchObject({
      status: 'rendered',
      primaryResponseText: 'primary MAIA response',
    });
    expect(persistTelemetry).toHaveBeenCalledTimes(1);
    const record = persistTelemetry.mock.calls[0][0];
    expect(record).toMatchObject({
      turnId: 77,
      modelName: 'qwen3:32b',
      telemetry: {
        status: 'evaluated',
        proposalCount: 1,
        evaluatedCount: 1,
        admittedStandingCounts: { CANDIDATE_UNESTABLISHED: 1 },
        refusalCodeCounts: {},
        representationClosed: true,
        errorCount: 0,
      },
    });
    const telemetry = JSON.stringify(record.telemetry);
    expect(telemetry).not.toContain('a pattern may be taking shape');
    expect(telemetry).not.toContain('current member turn');
    expect(telemetry).not.toContain('member-1');
    expect(telemetry).not.toContain('E1');
  });
});
