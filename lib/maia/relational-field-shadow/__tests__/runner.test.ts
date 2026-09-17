jest.mock('../fieldAssembler', () => {
  const actual = jest.requireActual('../fieldAssembler');
  return { ...actual, loadPriorMemberTurns: jest.fn() };
});
jest.mock('../ollamaProvider', () => {
  const actual = jest.requireActual('../ollamaProvider');
  return { ...actual, generateRelationalFieldPlan: jest.fn() };
});
jest.mock('../evidenceStore', () => ({ persistRelationalFieldShadowEvidence: jest.fn() }));

import { loadPriorMemberTurns } from '../fieldAssembler';
import { generateRelationalFieldPlan } from '../ollamaProvider';
import { persistRelationalFieldShadowEvidence } from '../evidenceStore';
import { launchRelationalFieldShadow, runRelationalFieldShadow } from '../runner';

const load = loadPriorMemberTurns as jest.Mock;
const generate = generateRelationalFieldPlan as jest.Mock;
const persist = persistRelationalFieldShadowEvidence as jest.Mock;
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
    load.mockResolvedValue([]);
    persist.mockResolvedValue(undefined);
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
  });
});
