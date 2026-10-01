import {
  CABIN_RELATIONSHIP_PROJECTION_SCHEMA,
  projectRelationshipForCabin,
  serializeCabinRelationshipProjection,
} from '../relationshipProjection';
import type { ActiveRelationalContext } from '@/lib/relationships/types';

function context(
  overrides: Partial<ActiveRelationalContext> = {},
): ActiveRelationalContext {
  return {
    relationshipId: 'relationship-1',
    relationshipLabel: 'My relationship',
    realm: 'outer',
    bondType: 'friend',
    mode: 'interpersonal',
    salientThemes: ['repair'],
    currentTensions: ['distance'],
    continuitySignals: ['checkin'],
    ...overrides,
  };
}

describe('HOUSE-CABIN-CONTEXT-SPINE-01 · H2.2 Relationship projection', () => {
  it('projects the explicit relationship reference with provenance and permission', () => {
    const projected = projectRelationshipForCabin(context(), {
      relationshipId: 'relationship-1',
      authority: 'member_explicit',
    });

    expect(projected).toEqual({
      schema: CABIN_RELATIONSHIP_PROJECTION_SCHEMA,
      source: {
        kind: 'member_relationships',
        id: 'relationship-1',
      },
      permission: {
        scope: 'member',
        basis: 'explicit_handoff',
      },
      relationship: {
        id: 'relationship-1',
        label: 'My relationship',
        realm: 'outer',
        bondType: 'friend',
      },
    });
  });

  it('F1 defeats implicit or mismatched relationship authority', () => {
    expect(
      projectRelationshipForCabin(context(), {
        relationshipId: 'relationship-1',
        authority: 'member_explicit',
      }),
    ).not.toBeNull();

    expect(
      projectRelationshipForCabin(context(), {
        relationshipId: 'relationship-2',
        authority: 'member_explicit',
      }),
    ).toBeNull();
  });

  it('F2 defeats inferred-context leakage', () => {
    const projected = projectRelationshipForCabin(context(), {
      relationshipId: 'relationship-1',
      authority: 'member_explicit',
    })!;

    const serialized = serializeCabinRelationshipProjection(projected);

    for (const forbidden of [
      'mode',
      'salientThemes',
      'currentTensions',
      'continuitySignals',
    ]) {
      expect(serialized).not.toContain(forbidden);
    }
    expect(serialized).not.toContain('repair');
    expect(serialized).not.toContain('distance');
    expect(serialized).not.toContain('checkin');
  });

  it('F3 defeats private relationship payload leakage', () => {
    const source = context({
      relationshipLabel: 'A private relationship',
      salientThemes: ['private theme'],
      currentTensions: ['private tension'],
      continuitySignals: ['private signal'],
    });

    const projected = projectRelationshipForCabin(source, {
      relationshipId: 'relationship-1',
      authority: 'member_explicit',
    })!;

    const serialized = serializeCabinRelationshipProjection(projected);

    for (const forbidden of [
      'participants',
      'notes',
      'entries',
      'fieldState',
      'private theme',
      'private tension',
      'private signal',
    ]) {
      expect(serialized).not.toContain(forbidden);
    }
  });

  it('F4 defeats member/session/browser identity leakage', () => {
    const projected = projectRelationshipForCabin(context(), {
      relationshipId: 'relationship-1',
      authority: 'member_explicit',
    })!;

    const serialized = serializeCabinRelationshipProjection(projected);

    expect(serialized).not.toContain('memberId');
    expect(serialized).not.toContain('sessionId');
    expect(serialized).not.toContain('localStorage');
  });

  it('F5 preserves both provenance and permission basis', () => {
    const projected = projectRelationshipForCabin(context(), {
      relationshipId: 'relationship-1',
      authority: 'member_explicit',
    })!;

    expect(projected.source).toEqual({
      kind: 'member_relationships',
      id: 'relationship-1',
    });
    expect(projected.permission).toEqual({
      scope: 'member',
      basis: 'explicit_handoff',
    });
  });

  it('F6 is deterministic and serializes as ordinary JSON', () => {
    const handoff = {
      relationshipId: 'relationship-1',
      authority: 'member_explicit' as const,
    };

    const first = projectRelationshipForCabin(context(), handoff)!;
    const second = projectRelationshipForCabin(context(), handoff)!;

    expect(second).toEqual(first);
    expect(serializeCabinRelationshipProjection(second)).toBe(
      serializeCabinRelationshipProjection(first),
    );
    expect(first).not.toHaveProperty('generatedAt');

    const restored = JSON.parse(serializeCabinRelationshipProjection(first));
    expect(restored).toEqual(first);
  });

  it('does not manufacture participants when the canonical bridge does not provide them', () => {
    const projected = projectRelationshipForCabin(context(), {
      relationshipId: 'relationship-1',
      authority: 'member_explicit',
    })!;

    expect(projected.relationship).not.toHaveProperty('participants');
    expect(projected.relationship).not.toHaveProperty('meaningfulThreads');
  });
});
