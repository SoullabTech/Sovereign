jest.mock('../fieldAssembler', () => {
  const actual = jest.requireActual('../fieldAssembler');
  return {
    ...actual,
    loadPriorMemberTurns: jest.fn(),
    loadH8CrossSessionMemberTurns: jest.fn(),
  };
});
jest.mock('../ollamaProvider', () => {
  const actual = jest.requireActual('../ollamaProvider');
  return { ...actual, generateRelationalFieldPlan: jest.fn() };
});
jest.mock('../evidenceStore', () => ({ persistRelationalFieldShadowEvidence: jest.fn() }));

import {
  loadH8CrossSessionMemberTurns,
  loadPriorMemberTurns,
} from '../fieldAssembler';
import { generateRelationalFieldPlan } from '../ollamaProvider';
import { persistRelationalFieldShadowEvidence } from '../evidenceStore';
import {
  H8_CURRENT_ACT_ARCHITECTURE_VERSION,
  H8_CURRENT_ACT_MODEL_NAME,
} from '../currentActProjection';
import { launchRelationalFieldShadow, runRelationalFieldShadow } from '../runner';

const load = loadPriorMemberTurns as jest.Mock;
const loadCross = loadH8CrossSessionMemberTurns as jest.Mock;
const generate = generateRelationalFieldPlan as jest.Mock;
const persist = persistRelationalFieldShadowEvidence as jest.Mock;
const base = {
  turnId: 88,
  exchangeId: 'ex-88',
  sessionId: 's-88',
  userInput: 'Can this be saved during Sanctuary?',
  primaryResponse: 'canonical MAIA response',
  processingProfile: 'CORE' as const,
  originRoute: '/api/sovereign/app/maia/list',
  memberId: 'member-1',
};

describe('H8 production shadow projection runner', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.MAIA_RELATIONAL_FIELD_SHADOW = '1';
    process.env.MAIA_RELATIONAL_FIELD_H8 = '1';
    process.env.MAIA_RELATIONAL_FIELD_H8_CROSS_SESSION = '0';
    process.env.MAIA_RELATIONAL_FIELD_SHADOW_MEMBER_IDS = 'member-1';
    process.env.MAIA_RELATIONAL_FIELD_SHADOW_MODELS = '';
    load.mockResolvedValue([
      {
        id: '11',
        exchangeId: 'ex-11',
        content: 'Do not save Sanctuary material.',
        createdAt: '2026-09-17T12:00:00Z',
        sourceKind: 'conversation_turn',
      },
      {
        id: '12',
        exchangeId: 'ex-12',
        content: 'During Sanctuary we need to fail closed before anything can persist.',
        createdAt: '2026-09-17T12:01:00Z',
        sourceKind: 'conversation_turn',
      },
    ]);
    loadCross.mockResolvedValue([]);
    persist.mockResolvedValue(undefined);
  });

  afterEach(() => {
    delete process.env.MAIA_RELATIONAL_FIELD_H8;
    delete process.env.MAIA_RELATIONAL_FIELD_H8_CROSS_SESSION;
  });

  test('runs deterministic H8 projection with zero generative shadow models', async () => {
    await runRelationalFieldShadow(base, []);
    expect(load).toHaveBeenCalledTimes(1);
    expect(loadCross).not.toHaveBeenCalled();
    expect(generate).not.toHaveBeenCalled();
    expect(persist).toHaveBeenCalledTimes(1);
    const row = persist.mock.calls[0][0];
    expect(row).toMatchObject({
      architectureVersion: H8_CURRENT_ACT_ARCHITECTURE_VERSION,
      modelName: H8_CURRENT_ACT_MODEL_NAME,
      deterministicSeed: 0,
      status: 'rendered',
    });
    expect(row).not.toHaveProperty('shadowResponseText');
    expect(row.rawPlan.researchLineage.evidenceScope).toBe('current_session');
    expect(row.rawPlan.anchorEvidenceId).toBe('E1');
    expect(row.basisEvidenceIds[0]).toBe('E1');
  });

  test('cross-session evidence is separately gated and enters H8 only', async () => {
    process.env.MAIA_RELATIONAL_FIELD_H8_CROSS_SESSION = '1';
    process.env.MAIA_RELATIONAL_FIELD_SHADOW_MODELS = 'qwen3:32b';
    loadCross.mockResolvedValue([
      {
        id: '9',
        exchangeId: 'old-ex',
        content: 'Do not save Sanctuary material across sessions.',
        createdAt: '2026-09-16T12:00:00Z',
        sourceKind: 'cross_session_turn',
      },
    ]);
    generate.mockRejectedValueOnce(new Error('bounded-test-stop'));

    await runRelationalFieldShadow(base, ['qwen3:32b']);

    expect(loadCross).toHaveBeenCalledWith('member-1', 's-88');
    expect(persist).toHaveBeenCalledTimes(2);

    const h8Row = persist.mock.calls[0][0];
    expect(h8Row.architectureVersion).toBe(H8_CURRENT_ACT_ARCHITECTURE_VERSION);
    expect(h8Row.rawPlan.researchLineage.evidenceScope).toBe('consented_cross_session');
    expect(h8Row.evidenceManifest.some((item: any) => item.sourceKind === 'cross_session_turn')).toBe(true);

    // The inherited generative Cut-1 packet must remain current-session-only.
    const generativePacket = generate.mock.calls[0][0].packet;
    expect(generativePacket.manifest.some((item: any) => item.sourceKind === 'cross_session_turn')).toBe(false);
  });

  test('launcher schedules H8 even when model list is empty', () => {
    const original = global.setImmediate;
    const callbacks: Array<() => void> = [];
    (global as any).setImmediate = jest.fn((cb: () => void) => {
      callbacks.push(cb);
      return { ref() {}, unref() {} } as any;
    });
    try {
      expect(launchRelationalFieldShadow(base)).toBeUndefined();
      expect(callbacks).toHaveLength(1);
      expect(load).not.toHaveBeenCalled();
      expect(persist).not.toHaveBeenCalled();
    } finally {
      global.setImmediate = original;
    }
  });

  test('H8 disabled plus no model list performs no shadow work', async () => {
    process.env.MAIA_RELATIONAL_FIELD_H8 = '0';
    await runRelationalFieldShadow(base, []);
    expect(load).not.toHaveBeenCalled();
    expect(loadCross).not.toHaveBeenCalled();
    expect(generate).not.toHaveBeenCalled();
    expect(persist).not.toHaveBeenCalled();
  });
});
