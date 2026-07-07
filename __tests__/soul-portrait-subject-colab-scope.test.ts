/**
 * Soul Portrait — subject linkage is Co-Lab-scoped (write-time refusal).
 *
 * Proves subjectIsInColab(), the gate the generate route enforces before creating a
 * draft: a practitioner may only link a subject (subject_person_id → studio_people) that
 * lives in their own active Co-Lab. Without it, a raw id could link — and later name-leak
 * via the Studio index's LEFT JOIN — a person from another practitioner's Co-Lab.
 *
 * How it falsifies: if a future edit drops `team_id = $N` from the lookup, the
 * structural test below fails; if it stops failing-closed on a null team, that test fails.
 *
 * Run: npx jest __tests__/soul-portrait-subject-colab-scope.test.ts
 */

const mockQueryOne = jest.fn();

jest.mock('@/lib/db/postgres', () => ({
  queryOne: (...args: any[]) => (mockQueryOne as any)(...args),
}));

import { subjectIsInColab } from '@/lib/soulPortrait/subjectScope';

beforeEach(() => jest.clearAllMocks());

describe('Soul Portrait — subject linkage is Co-Lab-scoped (refusal)', () => {
  it('REFUSES a subject that is not in the caller’s Co-Lab (fail closed)', async () => {
    mockQueryOne.mockResolvedValue(null);
    expect(await subjectIsInColab('foreign-person', 'team-larry')).toBe(false);
  });

  it('REFUSES when there is no active Co-Lab — null team → false, no query issued', async () => {
    expect(await subjectIsInColab('any-person', null)).toBe(false);
    expect(mockQueryOne).not.toHaveBeenCalled();
  });

  it('ALLOWS a subject that IS in the caller’s Co-Lab', async () => {
    mockQueryOne.mockResolvedValue({ one: 1 });
    expect(await subjectIsInColab('my-client', 'team-larry')).toBe(true);
  });

  it('scopes the lookup by studio_people.team_id (structural)', async () => {
    mockQueryOne.mockResolvedValue(null);
    await subjectIsInColab('person-1', 'team-larry');
    expect(mockQueryOne).toHaveBeenCalledTimes(1);
    const [sql, params] = mockQueryOne.mock.calls[0];
    expect(/from\s+studio_people/i.test(String(sql))).toBe(true);
    expect(/team_id\s*=\s*\$\d+/i.test(String(sql))).toBe(true);
    expect(params).toEqual(['person-1', 'team-larry']);
  });
});
