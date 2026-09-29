import fs from 'fs';
import path from 'path';
import {
  buildPerspectiveAbstention,
  normalizeCurrentFrame,
  normalizePerspective,
  parseModelPerspectiveQuestion,
  validateModelPerspectiveQuestion,
} from '../perspectiveMobility';

describe('Soul-Service runtime perspective mobility', () => {
  test('accepts only the member-selected perspective and server-composes the grounding', () => {
    const parsed = parseModelPerspectiveQuestion(JSON.stringify({
      perspective: 'Evidence',
      question: 'What evidence would materially change the current judgment?',
    }));
    expect(parsed).not.toBeNull();

    const accepted = validateModelPerspectiveQuestion(
      parsed!,
      'Evidence',
      'Should this project keep being refined or finally be released?',
    );
    expect(accepted.ok).toBe(true);
    if (accepted.ok) {
      expect(accepted.response.foreground).toContain('separates the source statement');
      expect(accepted.response.boundary).toContain('does not establish readiness');
    }

    expect(
      validateModelPerspectiveQuestion(
        parsed!,
        'Scale',
        'Should this project keep being refined or finally be released?',
      ),
    ).toEqual({
      ok: false,
      reasons: ['perspective:changed-by-model'],
    });
  });

  test('rejects diagnosis, mind-reading, and prescription', () => {
    const result = validateModelPerspectiveQuestion(
      {
        perspective: 'Relation',
        question: 'What do they think about your perfectionism pattern?',
      },
      'Relation',
      'Should this project keep being refined or finally be released?',
    );
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reasons.join(' ')).toMatch(/mind|motive|authored|identity/);
  });

  test('rejects an unsupported role introduced by the model', () => {
    const result = validateModelPerspectiveQuestion(
      {
        perspective: 'Possibility',
        question: 'What resources does the team have for another release path?',
      },
      'Possibility',
      'Should this project keep being refined or finally be released?',
    );
    expect(result).toEqual({
      ok: false,
      reasons: [
        'question:unsupported-role:resources',
        'question:unsupported-role:team',
      ],
    });
  });

  test('rejects over-certainty in an evidence question', () => {
    const result = validateModelPerspectiveQuestion(
      {
        perspective: 'Evidence',
        question: 'What would definitively resolve this decision?',
      },
      'Evidence',
      'Should this project keep being refined or finally be released?',
    );
    expect(result).toEqual({
      ok: false,
      reasons: ['question:overcertainty'],
    });
  });

  test('perspective enum is closed', () => {
    expect(normalizePerspective('Evidence')).toBe('Evidence');
    expect(normalizePerspective('Wisdom')).toBeNull();
  });

  test('current frame must remain non-diagnostic', () => {
    expect(normalizeCurrentFrame('release readiness')).toBe('release readiness');
    expect(normalizeCurrentFrame('your perfectionism pattern')).toBeNull();
  });

  test('abstention is server-grounded', () => {
    const abstention = buildPerspectiveAbstention('Agency');
    expect(abstention.perspective).toBe('Agency');
    expect(abstention.foreground).toContain('possible influence');
    expect(abstention.boundary).toContain('does not establish');
  });

  test('pilot route has no session, memory, database, or persistence imports', () => {
    const source = fs.readFileSync(
      path.resolve(process.cwd(), 'app/api/maia/soul-service-perspective-pilot/route.ts'),
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
    for (const token of forbidden) expect(source).not.toContain(token);
    expect(source).toContain('generateText');
    expect(source).toContain('memberSelectedPerspective');
    expect(source).toContain("persistence: 'none'");
  });
});
