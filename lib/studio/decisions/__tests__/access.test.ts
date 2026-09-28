import { chooseDecisionScope, decisionOwnerWhere } from '../access';

describe('HOUSE-DECISIONS-01 scope law', () => {
  const memberOnly = { memberId: 'member-a', practitionerId: null };
  const practitioner = { memberId: 'member-b', practitionerId: 'practitioner-b' };

  test('ordinary members default to personal Decisions', () => {
    expect(chooseDecisionScope(undefined, memberOnly)).toBe('personal');
    expect(chooseDecisionScope('personal', memberOnly)).toBe('personal');
  });

  test('practice scope requires an active practitioner identity', () => {
    expect(chooseDecisionScope('practice', memberOnly)).toBeNull();
    expect(chooseDecisionScope('practice', practitioner)).toBe('practice');
  });

  test('a practitioner may still explicitly enter the personal membrane', () => {
    expect(chooseDecisionScope('personal', practitioner)).toBe('personal');
  });

  test('owner predicate keeps personal and practice identities disjoint', () => {
    const sql = decisionOwnerWhere('d', '$2', '$3');
    expect(sql).toContain("d.decision_scope = 'personal' AND d.personal_member_id = $2");
    expect(sql).toContain("d.decision_scope = 'practice' AND d.practitioner_id = $3");
  });
});
