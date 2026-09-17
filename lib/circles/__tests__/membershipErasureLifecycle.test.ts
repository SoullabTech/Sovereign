import { leaveCircleWithClient } from '../membershipService';

describe('F5 P5-D Circle account-erasure lifecycle', () => {
  it('revokes shared representation, then tombstones response payload, then ends membership', async () => {
    const statements: string[] = [];
    const tx = {
      query: jest.fn(async (sql: string) => {
        statements.push(sql.replace(/\s+/g, ' ').trim());
        return { rows: [], rowCount: 1 };
      }),
    } as any;

    await leaveCircleWithClient(tx, 'circle-1', 'member-1');

    const shared = statements.findIndex((sql) => /UPDATE shared_artifacts/.test(sql));
    const response = statements.findIndex((sql) => /UPDATE circle_inquiry_responses/.test(sql));
    const membership = statements.findIndex((sql) => /UPDATE circle_memberships/.test(sql));
    expect(shared).toBeGreaterThanOrEqual(0);
    expect(response).toBeGreaterThan(shared);
    expect(membership).toBeGreaterThan(response);
    expect(statements[response]).toMatch(/response_text = NULL/);
    expect(statements[membership]).toMatch(/status = 'left'/);
  });
});
