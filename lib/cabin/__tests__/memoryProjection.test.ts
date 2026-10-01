import {
  CABIN_MEMORY_PROJECTION_SCHEMA,
  projectMemoryForCabin,
  serializeCabinMemoryProjection,
} from '../memoryProjection';
import type { CabinMemoryCandidate } from '../memoryProjection';

function memory(
  overrides: Partial<CabinMemoryCandidate> = {},
): CabinMemoryCandidate {
  return {
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
    threadIds: ['thread-1'],
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
    ...overrides,
  };
}

describe('HOUSE-CABIN-CONTEXT-SPINE-01 · H2.3 Memory eligibility projection', () => {
  it('projects a personal member-kept memory with explicit provenance and recall standing', () => {
    const projected = projectMemoryForCabin(memory());

    expect(projected).toEqual({
      schema: CABIN_MEMORY_PROJECTION_SCHEMA,
      source: {
        kind: 'member_memory_atoms',
        id: 'atom-1',
        sourceType: 'spontaneous',
        sourceId: null,
        keptAt: '2026-09-30T12:00:00.000Z',
      },
      permission: {
        scope: 'member',
        basis: 'member_kept',
      },
      memory: {
        id: 'atom-1',
        title: 'A kept recognition',
        body: 'I recognized something important.',
        sourceType: 'spontaneous',
        sourceId: null,
        primaryRegister: 'threshold',
        registers: ['threshold'],
        elementalLenses: ['water'],
        status: 'active',
        returnPreference: 'contextual_doorway',
        keptAt: '2026-09-30T12:00:00.000Z',
      },
      recall: {
        standing: 'contextual_doorway',
        basis: 'return_preference',
      },
    });
  });

  it('F1 defeats scope leakage from colab/client/encounter memory', () => {
    for (const memoryScope of ['colab', 'client', 'encounter'] as const) {
      expect(projectMemoryForCabin(memory({ memoryScope }))).toBeNull();
    }
  });

  it('F2 defeats a member-rejected practitioner observation', () => {
    expect(
      projectMemoryForCabin(
        memory({
          sourceType: 'practitioner_observation',
          sourceId: 'observation-1',
          body: 'A practitioner claim.',
          memberResponseStatus: 'rejected',
        }),
      ),
    ).toBeNull();
  });

  it('F3 defeats an unconfirmed practitioner observation', () => {
    expect(
      projectMemoryForCabin(
        memory({
          sourceType: 'practitioner_observation',
          sourceId: 'observation-1',
          body: 'A practitioner claim.',
          memberResponseStatus: null,
        }),
      ),
    ).toBeNull();
  });

  it('permits a confirmed practitioner observation only after member confirmation and keeps its body out of the projection', () => {
    const projected = projectMemoryForCabin(
      memory({
        sourceType: 'practitioner_observation',
        sourceId: 'observation-1',
        body: 'A practitioner claim.',
        memberResponseStatus: 'confirmed',
      }),
    )!;

    expect(projected.permission.basis).toBe('member_confirmed_observation');
    expect(projected.memory.body).toBeNull();
    expect(projected.source.sourceId).toBe('observation-1');
  });

  it('F4 preserves member_pulled as non-ambient standing', () => {
    const projected = projectMemoryForCabin(
      memory({ returnPreference: 'member_pulled' }),
    )!;

    expect(projected.recall).toEqual({
      standing: 'member_pulled',
      basis: 'return_preference',
    });
    expect(projected.recall.standing).not.toBe('contextual_doorway');
  });

  it('preserves ritual-review opt-in without converting it to contextual recall', () => {
    const projected = projectMemoryForCabin(
      memory({ returnPreference: 'ritual_review_opt_in' }),
    )!;

    expect(projected.recall).toEqual({
      standing: 'ritual_review_opt_in',
      basis: 'return_preference',
    });
  });

  it('F5 blocks protected, archived, and set-aside material from recall while preserving member-owned record continuity', () => {
    for (const status of ['protected', 'archived', 'set_aside'] as const) {
      const projected = projectMemoryForCabin(memory({ status }))!;

      expect(projected.permission.basis).toBe('member_kept');
      expect(projected.recall).toEqual({
        standing: 'blocked',
        basis: 'status',
      });
    }
  });

  it('sacred-protected material cannot become ambient recall even if its return preference says otherwise', () => {
    const projected = projectMemoryForCabin(
      memory({
        status: 'protected',
        registers: ['sacred_protected'],
        returnPreference: 'contextual_doorway',
      }),
    )!;

    expect(projected.recall).toEqual({
      standing: 'blocked',
      basis: 'status',
    });
  });

  it('F6 defeats identity leakage', () => {
    const projected = projectMemoryForCabin(
      memory({
        memberId: 'member-secret',
      }),
    )!;

    const serialized = serializeCabinMemoryProjection(projected);

    expect(serialized).not.toContain('member-secret');
    expect(serialized).not.toContain('memberId');
    expect(serialized).not.toContain('sessionId');
    expect(serialized).not.toContain('localStorage');
    expect(serialized).not.toContain('facilitatorId');
  });

  it('F7 does not manufacture relevance, ranking, or synthesis', () => {
    const projected = projectMemoryForCabin(memory())!;
    const serialized = serializeCabinMemoryProjection(projected);

    for (const forbidden of [
      'relevance',
      'score',
      'rank',
      'meaning',
      'synthesis',
      'currentMemory',
      'memorySummary',
    ]) {
      expect(serialized).not.toContain(forbidden);
    }
  });

  it('F8 preserves source identity and permission basis', () => {
    const projected = projectMemoryForCabin(
      memory({
        sourceType: 'journal',
        sourceId: 'journal-1',
        body: null,
      }),
    )!;

    expect(projected.source).toEqual({
      kind: 'member_memory_atoms',
      id: 'atom-1',
      sourceType: 'journal',
      sourceId: 'journal-1',
      keptAt: '2026-09-30T12:00:00.000Z',
    });
    expect(projected.permission).toEqual({
      scope: 'member',
      basis: 'member_kept',
    });
    expect(projected.memory.body).toBeNull();
  });

  it('F9 does not mutate the source and F10 is deterministic', () => {
    const source = memory({
      registers: ['threshold', 'developmental'],
      elementalLenses: ['water', 'earth'],
    });
    const before = structuredClone(source);

    const first = projectMemoryForCabin(source)!;
    const second = projectMemoryForCabin(source)!;

    expect(source).toEqual(before);
    expect(second).toEqual(first);
    expect(serializeCabinMemoryProjection(second)).toBe(
      serializeCabinMemoryProjection(first),
    );
    expect(first).not.toHaveProperty('generatedAt');
  });

  it('round-trips through ordinary JSON without runtime objects', () => {
    const projected = projectMemoryForCabin(memory())!;
    const restored = JSON.parse(serializeCabinMemoryProjection(projected));

    expect(restored).toEqual(projected);
    expect(Object.getPrototypeOf(restored)).toBe(Object.prototype);
  });
});
