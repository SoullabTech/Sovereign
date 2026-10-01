import {
  CABIN_CONTEXT_PACKAGE_SCHEMA,
  buildCabinContextPackage,
  parseCabinContextPackage,
  serializeCabinContextPackage,
} from '../contextPackage';
import { projectMemoryForCabin } from '../memoryProjection';
import { projectRelationshipForCabin } from '../relationshipProjection';
import { projectWorkForCabin } from '../workProjection';
import type { ActiveRelationalContext } from '@/lib/relationships/types';
import type { CabinMemoryCandidate } from '../memoryProjection';
import type { CabinWorkProjection } from '../workProjection';

function workProjection(): CabinWorkProjection {
  return projectWorkForCabin(
    {
      id: 'work-1',
      memberId: 'member-1',
      title: 'Elemental Alchemy',
      purpose: 'Write the book',
      form: 'book',
      stage: 'writing',
      manuscriptState: 'existing-manuscript',
      createdAt: '2026-09-01T00:00:00.000Z',
      updatedAt: '2026-09-30T12:00:00.000Z',
      expressions: [
        {
          id: 'expr-1',
          livingWorkId: 'work-1',
          expressionType: 'manuscript',
          expressionId: 'manuscript-1',
          declaredBy: 'member-1',
          declaredAt: '2026-09-01T00:00:00.000Z',
        },
      ],
    },
    'member-1',
  )!;
}

function relationshipProjection() {
  const context: ActiveRelationalContext = {
    relationshipId: 'relationship-1',
    relationshipLabel: 'My relationship',
    realm: 'outer',
    bondType: 'friend',
    mode: 'interpersonal',
    salientThemes: ['repair'],
    currentTensions: ['distance'],
    continuitySignals: ['checkin'],
  };

  return projectRelationshipForCabin(context, {
    relationshipId: 'relationship-1',
    authority: 'member_explicit',
  })!;
}

function memoryProjection() {
  const candidate: CabinMemoryCandidate = {
    id: 'atom-1',
    memberId: 'member-1',
    memoryScope: 'personal',
    sourceType: 'spontaneous',
    sourceId: null,
    title: 'A kept recognition',
    body: 'I recognized something important.',
    primaryRegister: 'threshold',
    registers: ['threshold'],
    elementalLenses: ['water'],
    threadIds: [],
    status: 'active',
    returnPreference: 'contextual_doorway',
    lastSurfacedAt: null,
    surfaceCount: 0,
    memberResponseStatus: null,
    memberResponseAt: null,
    keptAt: '2026-09-30T12:00:00.000Z',
    lastTouchedAt: '2026-09-30T12:00:00.000Z',
    createdAt: '2026-09-30T12:00:00.000Z',
    updatedAt: '2026-09-30T12:00:00.000Z',
    reverberationGuard: {
      interpretationStatus: 'uninterpreted',
      voiceEligibility: 'invitable',
      crossingAllowed: false,
    },
  };

  return projectMemoryForCabin(candidate)!;
}

describe('HOUSE-CABIN-CONTEXT-SPINE-01 · H2.4 Local Cabin context package', () => {
  it('composes the three governed projections without creating a second identity layer', () => {
    const packageValue = buildCabinContextPackage({
      works: [workProjection()],
      relationships: [relationshipProjection()],
      memories: [memoryProjection()],
    })!;

    expect(packageValue.schema).toBe(CABIN_CONTEXT_PACKAGE_SCHEMA);
    expect(packageValue.scope).toBe('member');
    expect(packageValue.works[0].work.id).toBe('work-1');
    expect(packageValue.relationships[0].relationship.id).toBe('relationship-1');
    expect(packageValue.memories[0].memory.id).toBe('atom-1');
  });

  it('F1 preserves each projection as the source authority', () => {
    const work = workProjection();
    const relationship = relationshipProjection();
    const memory = memoryProjection();

    const packageValue = buildCabinContextPackage({
      works: [work],
      relationships: [relationship],
      memories: [memory],
    })!;

    expect(packageValue.works[0]).toEqual(work);
    expect(packageValue.relationships[0]).toEqual(relationship);
    expect(packageValue.memories[0]).toEqual(memory);
  });

  it('F2 does not leak member/session/browser identity', () => {
    const packageValue = buildCabinContextPackage({
      works: [workProjection()],
      relationships: [relationshipProjection()],
      memories: [memoryProjection()],
    })!;

    const serialized = serializeCabinContextPackage(packageValue);

    for (const forbidden of [
      'memberId',
      'member-1',
      'sessionId',
      'localStorage',
      'facilitatorId',
    ]) {
      expect(serialized).not.toContain(forbidden);
    }
  });

  it('F3 preserves item-level permission and memory recall standing', () => {
    const packageValue = buildCabinContextPackage({
      works: [workProjection()],
      relationships: [relationshipProjection()],
      memories: [memoryProjection()],
    })!;

    expect(packageValue.works[0].permission).toEqual({
      scope: 'member',
      basis: 'member_owned',
    });
    expect(packageValue.relationships[0].permission).toEqual({
      scope: 'member',
      basis: 'explicit_handoff',
    });
    expect(packageValue.memories[0].permission).toEqual({
      scope: 'member',
      basis: 'member_kept',
    });
    expect(packageValue.memories[0].recall.standing).toBe('contextual_doorway');
  });

  it('F4 does not invent QuestionContext', () => {
    const packageValue = buildCabinContextPackage({
      works: [workProjection()],
      memories: [memoryProjection()],
    })!;

    const serialized = serializeCabinContextPackage(packageValue);

    expect(serialized).not.toContain('question');
    expect(serialized).not.toContain('QuestionContext');
    expect(packageValue).not.toHaveProperty('questions');
  });

  it('F5 does not invent TransitionContext', () => {
    const packageValue = buildCabinContextPackage({
      works: [workProjection()],
      memories: [memoryProjection()],
    })!;

    const serialized = serializeCabinContextPackage(packageValue);

    expect(serialized).not.toContain('transition');
    expect(serialized).not.toContain('TransitionContext');
    expect(packageValue).not.toHaveProperty('transitions');
  });

  it('F6 contains no generated graph edges or inferred semantic relationships', () => {
    const packageValue = buildCabinContextPackage({
      works: [workProjection()],
      relationships: [relationshipProjection()],
      memories: [memoryProjection()],
    })!;

    const serialized = serializeCabinContextPackage(packageValue);

    for (const forbidden of [
      'edges',
      'connections',
      'relatedTo',
      'causedBy',
      'semanticRelation',
      'relevance',
      'synthesis',
    ]) {
      expect(serialized).not.toContain(forbidden);
    }
  });

  it('F7 is deterministic and has no generated package identity or time', () => {
    const input = {
      works: [workProjection()],
      relationships: [relationshipProjection()],
      memories: [memoryProjection()],
    };

    const first = buildCabinContextPackage(input)!;
    const second = buildCabinContextPackage(input)!;

    expect(second).toEqual(first);
    expect(serializeCabinContextPackage(second)).toBe(
      serializeCabinContextPackage(first),
    );
    expect(first).not.toHaveProperty('packageId');
    expect(first).not.toHaveProperty('generatedAt');
  });

  it('F8 does not mutate supplied projections and package owns its copies', () => {
    const work = workProjection();
    const relationship = relationshipProjection();
    const memory = memoryProjection();
    const before = structuredClone({ work, relationship, memory });

    const packageValue = buildCabinContextPackage({
      works: [work],
      relationships: [relationship],
      memories: [memory],
    })!;

    expect({ work, relationship, memory }).toEqual(before);

    packageValue.works[0].work.title = 'Cabin copy changed';
    expect(work.work.title).toBe('Elemental Alchemy');
  });

  it('rejects a projection with a non-member permission scope instead of widening it', () => {
    const work = workProjection();
    const invalid = structuredClone(work) as typeof work & {
      permission: { scope: string; basis: 'member_owned' };
    };
    invalid.permission.scope = 'project';

    expect(
      buildCabinContextPackage({
        works: [invalid as unknown as CabinWorkProjection],
      }),
    ).toBeNull();

    const wrongSchema = structuredClone(work);
    wrongSchema.schema = 'not-a-cabin-work-schema' as typeof wrongSchema.schema;

    expect(
      buildCabinContextPackage({
        works: [wrongSchema],
      }),
    ).toBeNull();
  });

  it('accepts an empty package as a truthful state', () => {
    const packageValue = buildCabinContextPackage()!;

    expect(packageValue).toEqual({
      schema: CABIN_CONTEXT_PACKAGE_SCHEMA,
      scope: 'member',
      works: [],
      relationships: [],
      memories: [],
    });
  });

  it('H2.5 accepts a valid package through the strict offline custody parser', () => {
    const packageValue = buildCabinContextPackage({
      works: [workProjection()],
      relationships: [relationshipProjection()],
      memories: [memoryProjection()],
    })!;

    const serialized = serializeCabinContextPackage(packageValue);
    const restored = parseCabinContextPackage(serialized);

    expect(restored).toEqual(packageValue);
    expect(restored?.schema).toBe(CABIN_CONTEXT_PACKAGE_SCHEMA);
  });

  it('H2.5 rejects malformed JSON without throwing', () => {
    expect(parseCabinContextPackage('{not json')).toBeNull();
  });

  it('H2.5 rejects a wrong package schema', () => {
    const packageValue = buildCabinContextPackage()!;
    const parsed = JSON.parse(serializeCabinContextPackage(packageValue));
    parsed.schema = 'soullab.cabin.context-package.v999';

    expect(parseCabinContextPackage(JSON.stringify(parsed))).toBeNull();
  });

  it('H2.5 rejects unknown top-level fields', () => {
    const packageValue = buildCabinContextPackage()!;
    const parsed = JSON.parse(serializeCabinContextPackage(packageValue));
    parsed.debug = 'smuggled';

    expect(parseCabinContextPackage(JSON.stringify(parsed))).toBeNull();
  });

  it('H2.5 rejects unknown nested fields inside a Work projection', () => {
    const packageValue = buildCabinContextPackage({
      works: [workProjection()],
    })!;
    const parsed = JSON.parse(serializeCabinContextPackage(packageValue));
    parsed.works[0].work.hiddenContext = 'smuggled';

    expect(parseCabinContextPackage(JSON.stringify(parsed))).toBeNull();
  });

  it('H2.5 rejects Question and Transition fields even when the package schema is correct', () => {
    const packageValue = buildCabinContextPackage()!;
    const parsed = JSON.parse(serializeCabinContextPackage(packageValue));
    parsed.questions = [];
    parsed.transitions = [];

    expect(parseCabinContextPackage(JSON.stringify(parsed))).toBeNull();
  });

  it('H2.5 rejects identity and graph smuggling inside a Memory projection', () => {
    const packageValue = buildCabinContextPackage({
      memories: [memoryProjection()],
    })!;
    const parsed = JSON.parse(serializeCabinContextPackage(packageValue));
    parsed.memories[0].memory.relevance = 0.99;
    parsed.memories[0].memory.memberId = 'member-secret';

    expect(parseCabinContextPackage(JSON.stringify(parsed))).toBeNull();
  });

  it('H2.5 returns a fresh package object rather than reusing parsed mutable state', () => {
    const packageValue = buildCabinContextPackage({
      works: [workProjection()],
    })!;
    const serialized = serializeCabinContextPackage(packageValue);

    const restored = parseCabinContextPackage(serialized)!;
    restored.works[0].work.title = 'Imported copy';

    expect(packageValue.works[0].work.title).toBe('Elemental Alchemy');
  });

  it('round-trips through ordinary JSON without network/runtime state', () => {
    const packageValue = buildCabinContextPackage({
      works: [workProjection()],
      relationships: [relationshipProjection()],
      memories: [memoryProjection()],
    })!;

    const serialized = serializeCabinContextPackage(packageValue);
    const restored = parseCabinContextPackage(serialized);

    expect(restored).toEqual(packageValue);
    expect(Object.getPrototypeOf(restored)).toBe(Object.prototype);
  });
});
