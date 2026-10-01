import {
  CABIN_WORK_PROJECTION_SCHEMA,
  projectWorkForCabin,
  serializeCabinWorkProjection,
} from '../workProjection';
import type { CabinWork } from '../localStore';

function work(overrides: Partial<CabinWork> = {}): CabinWork {
  return {
    id: 'work-1',
    memberId: 'member-1',
    title: 'Elemental Alchemy',
    purpose: 'Write the book',
    form: 'book',
    stage: 'writing',
    manuscriptState: 'existing-manuscript',
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-30T12:00:00.000Z',
    expressions: [],
    ...overrides,
  };
}

function manuscriptExpression(
  id: string,
  expressionId: string,
  declaredAt: string,
) {
  return {
    id,
    livingWorkId: 'work-1',
    expressionType: 'manuscript',
    expressionId,
    declaredBy: 'member-1',
    declaredAt,
  };
}

describe('HOUSE-CABIN-CONTEXT-SPINE-01 · H2.1 Work projection', () => {
  it('projects only the bounded Work reference and ownership basis', () => {
    const projected = projectWorkForCabin(work(), 'member-1');

    expect(projected).toEqual({
      schema: CABIN_WORK_PROJECTION_SCHEMA,
      source: {
        kind: 'living_work',
        id: 'work-1',
        updatedAt: '2026-09-30T12:00:00.000Z',
      },
      permission: {
        scope: 'member',
        basis: 'member_owned',
      },
      work: {
        id: 'work-1',
        title: 'Elemental Alchemy',
        purpose: 'Write the book',
        form: 'book',
        stage: 'writing',
        manuscriptState: 'existing-manuscript',
        expressions: [],
      },
    });
  });

  it('F1 defeats cross-member projection', () => {
    expect(projectWorkForCabin(work({ memberId: 'member-2' }), 'member-1')).toBeNull();
  });

  it('F2 defeats the first-expression candidate: every declaration survives', () => {
    const source = work({
      expressions: [
        manuscriptExpression('expr-b', 'manuscript-b', '2026-09-02T00:00:00.000Z'),
        manuscriptExpression('expr-a', 'manuscript-a', '2026-09-01T00:00:00.000Z'),
      ],
    });

    const defeatedFirstPick = source.expressions[0].expressionId;
    expect(defeatedFirstPick).toBe('manuscript-b');

    const projected = projectWorkForCabin(source, 'member-1')!;
    expect(projected.work.expressions.map((e) => e.expressionId)).toEqual([
      'manuscript-a',
      'manuscript-b',
    ]);
    expect(projected.work.expressions).toHaveLength(2);
  });

  it('preserves non-manuscript expressions as references without interpreting them', () => {
    const source = work({
      expressions: [
        {
          id: 'expr-course',
          livingWorkId: 'work-1',
          expressionType: 'course',
          expressionId: 'course-1',
          declaredBy: 'member-1',
          declaredAt: '2026-09-03T00:00:00.000Z',
        },
        manuscriptExpression(
          'expr-manuscript',
          'manuscript-1',
          '2026-09-02T00:00:00.000Z',
        ),
      ],
    });

    const projected = projectWorkForCabin(source, 'member-1')!;

    expect(projected.work.expressions.map((e) => e.expressionType)).toEqual([
      'manuscript',
      'course',
    ]);
    expect(projected.work.expressions[1]).toMatchObject({
      expressionType: 'course',
      expressionId: 'course-1',
    });
  });

  it('F3 defeats identity leakage: member and browser/session fields are absent', () => {
    const projected = projectWorkForCabin(
      work({
        memberId: 'member-secret',
        purpose: 'A bounded purpose',
      }),
      'member-secret',
    )!;

    const serialized = serializeCabinWorkProjection(projected);

    expect(serialized).not.toContain('member-secret');
    expect(serialized).not.toContain('memberId');
    expect(serialized).not.toContain('sessionId');
    expect(serialized).not.toContain('localStorage');
    expect(serialized).not.toContain('currentWork');
    expect(serialized).not.toContain('lastWork');
  });

  it('F4 defeats meaning inflation: no manuscript body, section, memory, question, or MAIA material crosses', () => {
    const source = work({
      expressions: [manuscriptExpression('expr-1', 'manuscript-1', '2026-09-01T00:00:00.000Z')],
    });

    const projected = projectWorkForCabin(source, 'member-1')!;
    const serialized = serializeCabinWorkProjection(projected);

    for (const forbidden of [
      'body',
      'sections',
      'memory',
      'question',
      'relationship',
      'MAIA',
      'interpretation',
    ]) {
      expect(serialized.toLowerCase()).not.toContain(forbidden.toLowerCase());
    }
  });

  it('F5 carries no hidden current Work or manuscript selection', () => {
    const projected = projectWorkForCabin(
      work({
        expressions: [
          manuscriptExpression('expr-a', 'manuscript-a', '2026-09-01T00:00:00.000Z'),
          manuscriptExpression('expr-b', 'manuscript-b', '2026-09-02T00:00:00.000Z'),
        ],
      }),
      'member-1',
    )!;

    expect(projected).not.toHaveProperty('currentWork');
    expect(projected).not.toHaveProperty('lastWork');
    expect(projected.work).not.toHaveProperty('currentManuscript');
    expect(projected.work.expressions).toHaveLength(2);
  });

  it('F6 carries provenance and permission basis for the projection', () => {
    const projected = projectWorkForCabin(work(), 'member-1')!;

    expect(projected.source).toEqual({
      kind: 'living_work',
      id: 'work-1',
      updatedAt: '2026-09-30T12:00:00.000Z',
    });
    expect(projected.permission).toEqual({
      scope: 'member',
      basis: 'member_owned',
    });
  });

  it('F7 does not mutate the source and is deterministic', () => {
    const source = work({
      expressions: [
        manuscriptExpression('expr-b', 'manuscript-b', '2026-09-02T00:00:00.000Z'),
        manuscriptExpression('expr-a', 'manuscript-a', '2026-09-01T00:00:00.000Z'),
      ],
    });
    const before = structuredClone(source);

    const first = projectWorkForCabin(source, 'member-1')!;
    const second = projectWorkForCabin(source, 'member-1')!;

    expect(source).toEqual(before);
    expect(second).toEqual(first);
    expect(serializeCabinWorkProjection(second)).toBe(
      serializeCabinWorkProjection(first),
    );
    expect(first).not.toHaveProperty('generatedAt');
  });

  it('serializes as ordinary portable JSON and restores without runtime objects', () => {
    const projected = projectWorkForCabin(work(), 'member-1')!;
    const restored = JSON.parse(serializeCabinWorkProjection(projected));

    expect(restored).toEqual(projected);
    expect(Object.getPrototypeOf(restored)).toBe(Object.prototype);
  });
});
