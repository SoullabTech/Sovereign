import fs from 'fs';
import path from 'path';
import {
  buildSoulServiceAbstentionProposal,
  parseSoulServiceFrameProposal,
  validateSoulServiceFrameProposal,
} from '../frameDetection';

describe('Soul-Service runtime frame detection', () => {
  test('accepts a bounded situational frame pair', () => {
    const parsed = parseSoulServiceFrameProposal(JSON.stringify({
      possibleFrame: 'continue or release',
      possibleRationale: 'The question is currently organized around a two-way decision.',
      alternativeFrame: 'what would make it ready enough',
      alternativeRationale: 'This view foregrounds conditions and timing rather than a binary choice.',
    }));

    expect(parsed).not.toBeNull();
    expect(validateSoulServiceFrameProposal(parsed!)).toEqual({
      ok: true,
      proposal: parsed,
    });
  });

  test('rejects identity and diagnostic language', () => {
    const validation = validateSoulServiceFrameProposal({
      possibleFrame: 'your perfectionism pattern',
      possibleRationale: 'You tend to avoid release because this is fear-based.',
      alternativeFrame: 'healthier frame',
      alternativeRationale: 'You should adopt the deeper perspective.',
    });

    expect(validation.ok).toBe(false);
    if (!validation.ok) {
      expect(validation.reasons.join(' ')).toMatch(/identity|motive|ranked|prescription/);
    }
  });

  test('rejects duplicate perspectives', () => {
    const validation = validateSoulServiceFrameProposal({
      possibleFrame: 'release decision',
      possibleRationale: 'This foregrounds the release decision.',
      alternativeFrame: 'release decision',
      alternativeRationale: 'This foregrounds the same decision.',
    });

    expect(validation).toEqual({
      ok: false,
      reasons: ['frames:not-materially-distinct'],
    });
  });

  test('abstention is itself valid', () => {
    const abstention = buildSoulServiceAbstentionProposal();
    expect(validateSoulServiceFrameProposal(abstention).ok).toBe(true);
  });

  test('pilot route has no session, memory, database, or persistence imports', () => {
    const route = fs.readFileSync(
      path.resolve(process.cwd(), 'app/api/maia/soul-service-frame-pilot/route.ts'),
      'utf8',
    );

    const forbidden = [
      'sessionManager',
      'TurnsStore',
      'MemoryOrchestrator',
      'memory/stores',
      'db/postgres',
      'getMaiaResponse',
      'resolveMemberIdentity',
      'addConversationExchange',
      'incrementTurnCount',
    ];

    for (const token of forbidden) {
      expect(route).not.toContain(token);
    }

    expect(route).toContain("generateText");
    expect(route).toContain("SOUL_SERVICE_RUNTIME_PILOT");
    expect(route).toContain("persistence: 'none'");
    expect(route).toContain("currentTurnOnly: true");
  });
});
