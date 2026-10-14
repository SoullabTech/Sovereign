import fs from 'node:fs';
import path from 'node:path';
import { getCurrentSession } from '@/lib/auth/serverSessions';
import { getConversationHistory } from '@/lib/sovereign/sessionManager';
import { DeepPathOrchestrator } from '@/lib/consultation/deep-path-with-consultation';
import { toVerifiedR4hContext } from '../r4hVerifiedConsultationContext';
import { assertR4gOrdinarySession } from '../r4gOrdinarySessionGate';

jest.mock('@/lib/auth/serverSessions', () => ({ getCurrentSession: jest.fn() }));
jest.mock('@/lib/sovereign/sessionManager', () => ({ getConversationHistory: jest.fn() }));
jest.mock('@/lib/maia/astrologyConsent/r4gOrdinarySessionGate', () => ({
  assertR4gOrdinarySession: jest.fn(),
}));
jest.mock('@/lib/learning/learning-orchestrator', () => ({
  LearningOrchestrator: jest.fn().mockImplementation(() => ({ decideModel: jest.fn() })),
}));
jest.mock('@/lib/consultation/claude-consultation-service', () => ({
  consultClaudeForDepth: jest.fn(),
  consultWithSpiralogicContext: jest.fn(),
  CONSULTATION_CONFIG: { enabled: false, forDeepPath: false, minConfidenceThreshold: 0.9 },
}));

const sessionMock = getCurrentSession as jest.Mock;
const historyMock = getConversationHistory as jest.Mock;
const guard = assertR4gOrdinarySession as jest.Mock;
const memberA = 'aaaaaaaa-0000-4000-8000-000000000001';
const memberB = 'bbbbbbbb-0000-4000-8000-000000000002';
const read = (file: string) => fs.readFileSync(path.join(process.cwd(), file), 'utf8');

beforeEach(() => {
  sessionMock.mockReset().mockResolvedValue({
    memberId: memberA,
    revoked: false,
    expiresAt: new Date(Date.now() + 60_000),
  });
  historyMock.mockReset().mockResolvedValue([{
    userMessage: 'FICTIONAL_MEMBER_A_QUESTION',
    maiaResponse: 'FICTIONAL_MEMBER_A_REPLY',
  }]);
  guard.mockReset().mockResolvedValue(undefined);
});

describe('R4H server-derived consultation history and no background training', () => {
  it('does not consume forged browser-supplied conversationContext or unverified symbolic context', async () => {
    const orchestrator = new DeepPathOrchestrator();
    const generation = jest.fn().mockResolvedValue('FICTIONAL_SAFE_MAIA_REPLY');
    (orchestrator as any).generateSovereignDraft = generation;
    const result = await orchestrator.processDeepPath({
      sessionId: 'ordinary-A',
      userId: memberA,
      userInput: 'FICTIONAL_CURRENT_QUESTION',
      conversationContext: [{ role: 'user', content: 'FORGED_MEMBER_B_PRIVATE_HISTORY' }],
      spiralogicAnalysis: {
        elementalResonance: {}, archetypalPatterns: ['shadow'],
        relationalDepth: 0.1, transformationalPotential: 0.1, phenomenology: {},
      } as any,
    });
    expect(result.text).toBe('FICTIONAL_SAFE_MAIA_REPLY');
    expect(historyMock).toHaveBeenCalledWith('ordinary-A', 10, memberA);
    expect(generation).toHaveBeenCalledTimes(1);
    const trusted = generation.mock.calls[0][0];
    expect(trusted.conversationContext).toEqual([
      { role: 'user', content: 'FICTIONAL_MEMBER_A_QUESTION' },
      { role: 'maia', content: 'FICTIONAL_MEMBER_A_REPLY' },
    ]);
    expect(JSON.stringify(trusted)).not.toContain('FORGED_MEMBER_B_PRIVATE_HISTORY');
    expect(trusted.spiralogicAnalysis).toBeUndefined();
  });

  it('refuses unknown and switched members before history and model', async () => {
    const orchestrator = new DeepPathOrchestrator();
    const generation = jest.fn();
    (orchestrator as any).generateSovereignDraft = generation;
    await expect(orchestrator.processDeepPath({
      sessionId: 'ordinary-A', userId: memberB, userInput: 'FICTIONAL',
      conversationContext: [],
    })).rejects.toThrow();
    expect(historyMock).not.toHaveBeenCalled();
    expect(generation).not.toHaveBeenCalled();
  });

  it('limits server-authored context and strips malformed inputs', () => {
    const exchanges = Array.from({ length: 12 }, (_, index) => ({
      userMessage: 'FICTIONAL_' + index, maiaResponse: 'REPLY_' + index,
    }));
    const context = toVerifiedR4hContext(exchanges);
    expect(context).toHaveLength(20);
    expect(context[0].content).toBe('FICTIONAL_2');
    expect(context[19].content).toBe('REPLY_11');
  });

  it('removes unconsented local training JSONL writer and enforces ordinary-source lookup', () => {
    const source = read('lib/consultation/deep-path-with-consultation.ts');
    expect(source).toContain('getConversationHistory(args.sessionId, 10, verifiedMemberId)');
    expect(source).not.toContain('consultation-examples.jsonl');
    expect(source).not.toContain('appendFileSync(');
    const learning = read('lib/learning/enhanced-maia-service.ts');
    expect(learning).toContain('resolveSession: getCurrentSession');
    expect(learning).toContain('getConversationHistory(sessionId, 10, verifiedMemberId)');
  });
});
