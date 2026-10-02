const q = jest.fn();

jest.mock('@/lib/db/postgres', () => ({
  query: (...args: unknown[]) => q(...args),
}));

import { mayPractitionerViewMemberField } from '../fieldAccess';

describe('practitioner field relationship boundary', () => {
  beforeEach(() => q.mockReset());

  it('permits only when the authenticated practitioner owns a live relationship to the target member', async () => {
    q.mockResolvedValue({ rows: [{ '?column?': 1 }], rowCount: 1 });

    await expect(mayPractitionerViewMemberField('practitioner-member', 'client-member')).resolves.toBe(true);

    const [sql, params] = q.mock.calls[0];
    expect(sql).toContain('JOIN practitioners p ON p.id = pc.practitioner_id');
    expect(sql).toContain('p.member_id = $1');
    expect(sql).toContain('pc.member_id = $2');
    expect(sql).toContain("pc.relationship_status IN ('active', 'paused')");
    expect(sql).toContain("p.status = 'active'");
    expect(params).toEqual(['practitioner-member', 'client-member']);
  });

  it('fails closed when no relationship row matches', async () => {
    q.mockResolvedValue({ rows: [], rowCount: 0 });
    await expect(mayPractitionerViewMemberField('practitioner-member', 'unrelated-member')).resolves.toBe(false);
  });

  it('fails closed on missing identity inputs without querying', async () => {
    await expect(mayPractitionerViewMemberField('', 'client-member')).resolves.toBe(false);
    await expect(mayPractitionerViewMemberField('practitioner-member', '')).resolves.toBe(false);
    expect(q).not.toHaveBeenCalled();
  });

  it('the page authorizes the relationship before reading target-member data', () => {
    const { readFileSync } = require('fs');
    const { join } = require('path');
    const src = readFileSync(
      join(process.cwd(), 'app/studio/fields/[memberId]/page.tsx'),
      'utf8',
    );

    const auth = src.indexOf('mayPractitionerViewMemberField(session.memberId, params.memberId)');
    const fieldRead = src.indexOf('getFieldEvidence(params.memberId)');
    const memberRead = src.indexOf('getMember(params.memberId)');

    expect(auth).toBeGreaterThan(-1);
    expect(fieldRead).toBeGreaterThan(auth);
    expect(memberRead).toBeGreaterThan(auth);
    expect(src).not.toContain("SELECT id FROM practitioners WHERE member_id = $1 AND status = 'active'");
  });
});
