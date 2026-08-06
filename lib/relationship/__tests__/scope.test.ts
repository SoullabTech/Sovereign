/**
 * The scope rule, the crossing rule, the verb rule, and the practice→wisdom
 * transformation — as executable specification.
 *
 * Founder direction, 2026-08-06: "The scope rule is probably the first thing I would
 * actually build. Not UI. Tests. Every future feature can be validated against them."
 *
 * Spec: docs/design/now-what/THREE_FIELDS_AND_THE_RELATIONSHIP_2026-08-06.md
 */

import {
  resolveReadScope,
  canRead,
  requiresCommitmentContext,
  admitsToCommitment,
  practitionerMay,
  offersDoNothing,
  optionsForOwnObject,
  isOfferable,
  developIntoWisdom,
  removeIdentifiers,
  wisdomMayCiteMemberMaterial,
  maySystemDraw,
  mayaSurfaceAwareness,
  ScopeViolation,
  Unruled,
  type MemberObject,
  type ScopedQuery,
  type ReadScope,
  type Role,
  type PracticeReflection,
} from '../scope';

const ALL_SCOPES: ReadScope[] = [
  'member_field',
  'commitment',
  'practitioner_practice',
  'practitioner_wisdom',
];

const reflection = (): PracticeReflection => ({
  scope: 'practitioner_practice',
  id: 'refl-1',
  commitmentId: 'commitment-maya-larry',
  body: 'I wonder whether she confuses generosity with self-erasure.',
});

const gesture = { kind: 'develop_into_wisdom', by: 'practitioner' } as const;

describe('the scope rule — four questions, four scopes', () => {
  it('answers "what have I been carrying?" only from the member field', () => {
    expect(resolveReadScope('member_carrying', 'member')).toBe('member_field');
  });

  it('answers "what has become alive since our last conversation?" only from the commitment', () => {
    expect(resolveReadScope('commitment_alive', 'practitioner')).toBe('commitment');
  });

  it('answers "what have I been wondering?" only from the practitioner\'s own practice', () => {
    expect(resolveReadScope('practice_wondering', 'practitioner')).toBe('practitioner_practice');
  });

  it('answers "how is my understanding evolving?" only from practitioner wisdom', () => {
    expect(resolveReadScope('wisdom_evolving', 'practitioner')).toBe('practitioner_wisdom');
  });

  it('binds each query to exactly one scope — no query reads two', () => {
    const queries: ScopedQuery[] = [
      'member_carrying',
      'commitment_alive',
      'practice_wondering',
      'wisdom_evolving',
    ];
    const scopes = queries.map((q) =>
      resolveReadScope(q, q === 'member_carrying' ? 'member' : 'practitioner'),
    );
    expect(new Set(scopes).size).toBe(4);
  });

  it('refuses a practitioner asking a member-field question', () => {
    expect(() => resolveReadScope('member_carrying', 'practitioner')).toThrow(ScopeViolation);
  });

  it('refuses a member asking a practitioner-practice question', () => {
    expect(() => resolveReadScope('practice_wondering', 'member')).toThrow(ScopeViolation);
  });

  it('refuses a member asking a practitioner-wisdom question', () => {
    expect(() => resolveReadScope('wisdom_evolving', 'member')).toThrow(ScopeViolation);
  });

  it('refuses an undeclared query — a feature that cannot name its scope cannot read', () => {
    expect(() => resolveReadScope('whatever' as ScopedQuery, 'member')).toThrow(ScopeViolation);
  });
});

describe('scope readability is asymmetric by design', () => {
  it('lets the member read their own field', () => {
    expect(canRead('member', 'member_field')).toBe(true);
  });

  it('lets both parties read the shared commitment', () => {
    expect(canRead('member', 'commitment')).toBe(true);
    expect(canRead('practitioner', 'commitment')).toBe(true);
  });

  it('NEVER lets a practitioner read the member field', () => {
    expect(canRead('practitioner', 'member_field')).toBe(false);
  });

  it('NEVER lets a member read either practitioner scope', () => {
    expect(canRead('member', 'practitioner_practice')).toBe(false);
    expect(canRead('member', 'practitioner_wisdom')).toBe(false);
  });

  it('grants no role read access to all four scopes', () => {
    const roles: Role[] = ['member', 'practitioner'];
    for (const role of roles) {
      expect(ALL_SCOPES.every((s) => canRead(role, s))).toBe(false);
    }
  });
});

describe('practice is commitment-bound; wisdom is not', () => {
  // Boundary 1
  it('requires a commitment context for practitioner_practice', () => {
    expect(requiresCommitmentContext('practitioner_practice')).toBe(true);
    expect(reflection().commitmentId).toBeTruthy();
  });

  // Boundary 2
  it('does NOT require a commitment context for practitioner_wisdom', () => {
    expect(requiresCommitmentContext('practitioner_wisdom')).toBe(false);
  });

  it('would make wisdom just practice under another label if it were commitment-bound', () => {
    expect(requiresCommitmentContext('practitioner_wisdom')).not.toBe(
      requiresCommitmentContext('practitioner_practice'),
    );
  });
});

describe('the practice → wisdom transformation is an authorship act', () => {
  // Boundary 3
  it('never lets a relationship-bound reflection be offered directly', () => {
    expect(isOfferable(reflection())).toBe(false);
  });

  // Boundary 4 — the one most likely to be gotten wrong.
  it('does NOT convert practice into wisdom by removing identifiers', () => {
    const redacted = removeIdentifiers(reflection());
    expect(redacted.scope).toBe('practitioner_practice');
    expect(redacted.commitmentId).toBe(reflection().commitmentId);
    expect(isOfferable(redacted)).toBe(false);
  });

  // Boundary 5
  it('requires an explicit practitioner authorship gesture', () => {
    expect(() =>
      developIntoWisdom(reflection(), 'On generosity and rescuing.', undefined as never, 'w-1'),
    ).toThrow(ScopeViolation);
  });

  it('refuses re-authoring that merely copies the reflection', () => {
    expect(() => developIntoWisdom(reflection(), reflection().body, gesture, 'w-1')).toThrow(
      ScopeViolation,
    );
  });

  // Boundary 6
  it('creates a DISTINCT object and never mutates the source reflection', () => {
    const source = reflection();
    const before = { ...source };
    const wisdom = developIntoWisdom(
      source,
      'The difference between being generous and rescuing.',
      gesture,
      'w-1',
    );
    expect(wisdom.id).not.toBe(source.id);
    expect(wisdom.body).not.toBe(source.body);
    expect(source).toEqual(before);
    expect(source.scope).toBe('practitioner_practice');
  });

  it('keeps the source reflection non-offerable after transformation', () => {
    const source = reflection();
    developIntoWisdom(source, 'On generosity and rescuing.', gesture, 'w-1');
    expect(isOfferable(source)).toBe(false);
  });

  // Boundary 7
  it('makes wisdom eligible for offering only after the transformation', () => {
    const wisdom = developIntoWisdom(reflection(), 'On generosity and rescuing.', gesture, 'w-1');
    expect(isOfferable(wisdom)).toBe(true);
  });

  it('carries provenance back to the practitioner\'s own inquiry, not member material', () => {
    const wisdom = developIntoWisdom(reflection(), 'On generosity and rescuing.', gesture, 'w-1');
    expect(wisdom.authoredFromReflectionId).toBe('refl-1');
    // Behavioural pin, not a shape assertion on an object this test just constructed:
    // the produced object must live in a scope that is NOT commitment-bound.
    expect(requiresCommitmentContext(wisdom.scope)).toBe(false);
    expect(wisdom).not.toHaveProperty('commitmentId');
  });

  it('documents the re-authorship check as a MINIMUM GESTURE TEST, not proof', () => {
    // A one-character mutation passes. This is an honest floor, asserted so that no
    // future caller reads a pass as a system attestation of substantive re-authorship.
    const barelyChanged = developIntoWisdom(
      reflection(),
      `${reflection().body} `,
      gesture,
      'w-min',
    );
    expect(barelyChanged.scope).toBe('practitioner_wisdom');
    expect(isOfferable(barelyChanged)).toBe(true);
  });

  // Boundary 8
  it('does NOT let MAIA perform the transformation', () => {
    expect(() =>
      developIntoWisdom(
        reflection(),
        'On generosity and rescuing.',
        { kind: 'develop_into_wisdom', by: 'maia' },
        'w-1',
      ),
    ).toThrow(/only the practitioner may re-author/);
  });

  it('does NOT let the member perform the transformation either', () => {
    expect(() =>
      developIntoWisdom(
        reflection(),
        'On generosity and rescuing.',
        { kind: 'develop_into_wisdom', by: 'member' },
        'w-1',
      ),
    ).toThrow(ScopeViolation);
  });

  // "do nothing" survives on both sides of the transformation.
  it('keeps "do nothing" available before AND after transformation', () => {
    const source = reflection();
    expect(optionsForOwnObject(source)).toContain('do_nothing');
    const wisdom = developIntoWisdom(source, 'On generosity and rescuing.', gesture, 'w-1');
    expect(optionsForOwnObject(wisdom)).toContain('do_nothing');
  });

  it('never offers "offer" as an option on a practice reflection', () => {
    expect(optionsForOwnObject(reflection())).not.toContain('offer');
  });
});

describe('wisdom is authored, never computed from members', () => {
  // Boundary 9
  it('refuses to let wisdom cite member material — no ruled provenance mechanism exists', () => {
    expect(() => wisdomMayCiteMemberMaterial()).toThrow(Unruled);
  });

  it('names the document that must rule it', () => {
    expect(() => wisdomMayCiteMemberMaterial()).toThrow(
      /THREE_FIELDS_AND_THE_RELATIONSHIP_2026-08-06/,
    );
  });

  // Boundary 10
  it('does NOT let the fourth scope bridge into the member field', () => {
    expect(maySystemDraw('practitioner_wisdom', 'member_field')).toBe(false);
  });

  it.each(ALL_SCOPES.filter((s) => s !== 'member_field'))(
    'does not let the system draw into %s from the member field',
    (scope) => {
      expect(maySystemDraw(scope, 'member_field')).toBe(false);
    },
  );

  it('lets wisdom draw only from the practitioner\'s own scopes', () => {
    expect(maySystemDraw('practitioner_wisdom', 'practitioner_practice')).toBe(true);
    expect(maySystemDraw('practitioner_wisdom', 'commitment')).toBe(false);
  });

  it('never lets relationship-bound practice flow straight into the commitment', () => {
    expect(maySystemDraw('commitment', 'practitioner_practice')).toBe(false);
    expect(maySystemDraw('commitment', 'practitioner_wisdom')).toBe(true);
  });
});

/**
 * ⭐⭐⭐ The two operations are different acts and are ALLOWED to return different
 * answers. What they may never do is disagree about the same act. These tests pin the
 * difference as intentional so a future reader cannot mistake it for the contradiction
 * that Finding 2 identified.
 */
describe('system draw ⊥ person-initiated crossing', () => {
  it('permits a person-initiated crossing where a system draw is forbidden', () => {
    // The system may never reach into the member's field...
    expect(maySystemDraw('commitment', 'member_field')).toBe(false);
    // ...but the member may carry their own material across by their own gesture.
    expect(
      admitsToCommitment({
        sourceScope: 'member_field',
        basis: 'declared',
        declaredBy: 'member',
      }),
    ).toBe(true);
  });

  it('does NOT let a person-initiated gesture erase source scope', () => {
    // A practitioner declaring their own private reflection is refused, even though the
    // gesture itself is legitimate and the declarer is entitled to act.
    expect(
      admitsToCommitment({
        sourceScope: 'practitioner_practice',
        basis: 'declared',
        declaredBy: 'practitioner',
      }),
    ).toBe(false);
  });

  it('has all three crossing-related functions agree about practitioner_practice', () => {
    const declared = {
      sourceScope: 'practitioner_practice',
      basis: 'declared',
      declaredBy: 'practitioner',
    } as const;
    expect(admitsToCommitment(declared)).toBe(false);
    expect(maySystemDraw('commitment', 'practitioner_practice')).toBe(false);
    expect(isOfferable(reflection())).toBe(false);
  });

  it('lets a person only carry across material that is already theirs', () => {
    // The practitioner may not declare the member's material into the commitment.
    expect(
      admitsToCommitment({
        sourceScope: 'member_field',
        basis: 'declared',
        declaredBy: 'practitioner',
      }),
    ).toBe(false);
    // The member may not declare the practitioner's wisdom into the commitment.
    expect(
      admitsToCommitment({
        sourceScope: 'practitioner_wisdom',
        basis: 'declared',
        declaredBy: 'member',
      }),
    ).toBe(false);
  });

  it('admits re-authored wisdom offered by the practitioner', () => {
    expect(
      admitsToCommitment({
        sourceScope: 'practitioner_wisdom',
        basis: 'declared',
        declaredBy: 'practitioner',
      }),
    ).toBe(true);
  });

  it('refuses a crossing whose source is already the commitment', () => {
    expect(
      admitsToCommitment({
        sourceScope: 'commitment',
        basis: 'declared',
        declaredBy: 'member',
      }),
    ).toBe(false);
  });
});

describe('the crossing rule — declarations only, never observations', () => {
  it('admits a member declaration into the commitment', () => {
    expect(
      admitsToCommitment({ sourceScope: 'member_field', basis: 'declared', declaredBy: 'member' }),
    ).toBe(true);
  });

  it('admits a practitioner declaration (an offering of wisdom) into the commitment', () => {
    expect(
      admitsToCommitment({
        sourceScope: 'practitioner_wisdom',
        basis: 'declared',
        declaredBy: 'practitioner',
      }),
    ).toBe(true);
  });

  it('refuses observation — "returned twice" is telemetry, not relationship', () => {
    expect(admitsToCommitment({ sourceScope: 'member_field', basis: 'observed' })).toBe(false);
  });

  it('refuses observation even when attributed to a person', () => {
    expect(
      admitsToCommitment({ sourceScope: 'member_field', basis: 'observed', declaredBy: 'member' }),
    ).toBe(false);
  });

  it('refuses a declaration with no declaring party', () => {
    expect(admitsToCommitment({ sourceScope: 'member_field', basis: 'declared' })).toBe(false);
  });

  // ⭐⭐⭐ The most important correction in the whole architecture.
  it('does NOT cross a Keep — carrying is not sharing', () => {
    expect(
      admitsToCommitment({
        sourceScope: 'member_field',
        basis: 'declared',
        declaredBy: 'member',
        isPrivateCarry: true,
      }),
    ).toBe(false);
  });

  it('crosses the same content once it is separately declared into the commitment', () => {
    const kept = {
      sourceScope: 'member_field',
      basis: 'declared',
      declaredBy: 'member',
      isPrivateCarry: true,
    } as const;
    expect(admitsToCommitment(kept)).toBe(false);
    // The second, separate consent event — the crossing IS the consent event.
    expect(admitsToCommitment({ ...kept, isPrivateCarry: false })).toBe(true);
  });
});

describe('the verb rule — contribution, never editing', () => {
  const objects: MemberObject[] = ['my_question', 'my_work', 'my_story', 'my_coaching'];

  it.each(objects)('never permits edit on %s', (object) => {
    expect(practitionerMay(object, 'edit')).toBe(false);
  });

  it.each(objects)('always offers "do nothing" on %s', (object) => {
    expect(offersDoNothing(object)).toBe(true);
  });

  it('lets the practitioner reflect on, but not rewrite, a question', () => {
    expect(practitionerMay('my_question', 'reflect')).toBe(true);
    expect(practitionerMay('my_question', 'edit')).toBe(false);
  });

  it('lets the practitioner encourage work without rewriting it', () => {
    expect(practitionerMay('my_work', 'offer_encouragement')).toBe(true);
    expect(practitionerMay('my_work', 'suggest_practice')).toBe(true);
    expect(practitionerMay('my_work', 'edit')).toBe(false);
  });

  it('holds My Story to observation and inquiry only — the story stays hers', () => {
    expect(practitionerMay('my_story', 'offer_observation')).toBe(true);
    expect(practitionerMay('my_story', 'private_reflection')).toBe(true);
    expect(practitionerMay('my_story', 'ask_about')).toBe(true);
    expect(practitionerMay('my_story', 'edit')).toBe(false);
    expect(practitionerMay('my_story', 'attach_resource')).toBe(false);
    expect(practitionerMay('my_story', 'place_program')).toBe(false);
  });

  it('treats My Coaching as the bridge room — scheduling and placement live there', () => {
    expect(practitionerMay('my_coaching', 'schedule')).toBe(true);
    expect(practitionerMay('my_coaching', 'place_program')).toBe(true);
    expect(practitionerMay('my_coaching', 'prepare')).toBe(true);
  });

  it('does not let program placement leak into the member\'s own rooms', () => {
    expect(practitionerMay('my_question', 'place_program')).toBe(false);
    expect(practitionerMay('my_work', 'place_program')).toBe(false);
  });
});

describe('MAIA relationship awareness — refuses on unruled ground', () => {
  it.each([
    'own_offering_state',
    'member_declared_uptake',
    'member_pattern_claim',
  ] as const)('throws Unruled for %s rather than guessing', (cls) => {
    expect(() => mayaSurfaceAwareness(cls)).toThrow(Unruled);
  });

  it('names the document that must rule it', () => {
    expect(() => mayaSurfaceAwareness('member_pattern_claim')).toThrow(
      /THREE_FIELDS_AND_THE_RELATIONSHIP_2026-08-06/,
    );
  });
});
