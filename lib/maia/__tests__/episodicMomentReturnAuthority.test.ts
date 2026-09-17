import { readFileSync } from 'node:fs';
import { join } from 'node:path';

jest.mock('@/lib/db/postgres', () => ({ query: jest.fn() }));

import { loadRecentMarkedEpisodes } from '../memoryLoaders';
import { query } from '@/lib/db/postgres';

const queryMock = query as jest.Mock;

describe('episodic Moment return authority', () => {
  beforeEach(() => queryMock.mockReset());

  it('admits only per-Moment member-explicit contextual return', async () => {
    queryMock.mockResolvedValue({ rows: [] });
    await loadRecentMarkedEpisodes('member-1');

    const sql = String(queryMock.mock.calls[0][0]);
    expect(sql).toContain("marked_by_member = TRUE");
    expect(sql).toContain("return_preference = 'contextual_doorway'");
    expect(sql).toContain("return_authority = 'member_explicit'");
  });

  it('the formation seam is private by default and idempotent by exact source identity', () => {
    const route = readFileSync(
      join(process.cwd(), 'app/api/sovereign/episodes/mark/route.ts'),
      'utf8',
    );
    expect(route).toContain("'member_pulled', 'default_private'");
    expect(route).toContain('ON CONFLICT (user_id, source_session_id, source_turn_id)');
    expect(route).toContain('sourceTurnId is required');
  });

  it('explicit return writes member_explicit in the same governed update', () => {
    const route = readFileSync(
      join(process.cwd(), 'app/api/sovereign/episodes/mark/route.ts'),
      'utf8',
    );
    expect(route).toMatch(/SET return_preference = \$3,[\s\S]{0,120}return_authority = 'member_explicit'/);
  });

  it('legacy marked Moments fail closed under the migration', () => {
    const migration = readFileSync(
      join(process.cwd(), 'database/migrations/20260917220000_episodic_moment_return_authority.sql'),
      'utf8',
    );
    expect(migration).toContain("return_authority = 'legacy_ambiguous'");
    expect(migration).toContain("DEFAULT 'default_private'");
    expect(migration).toContain("DEFAULT 'member_pulled'");
    expect(migration).toContain('ux_episodic_member_marked_source');
  });
});
