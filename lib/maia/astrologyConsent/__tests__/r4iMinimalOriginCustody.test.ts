import fs from 'node:fs';
import path from 'node:path';
import { query } from '@/lib/db/postgres';
import { isR4fProtectedSessionById } from '../r4fGrantStore';

jest.mock('@/lib/db/postgres', () => ({
  query: jest.fn(), transaction: jest.fn(),
}));
const db = query as jest.Mock;
const source = (name: string) => fs.readFileSync(path.join(process.cwd(),name),'utf8');

beforeEach(() => { db.mockReset(); });

describe('R4I deleted-account protected-origin custody (source-only candidate)', () => {
  it('refuses ordinary MAIA reuse if active grant disappeared but durable origin survives', async () => {
    // Mimic a member deleted under a separate R20-governed erasure:
    // grant row no longer exists; protected origin is still recognized.
    db.mockResolvedValue({ rows: [{ exists: 1 }] });
    expect(await isR4fProtectedSessionById('fictional-previous-chart-session')).toBe(true);
    const [sql, params] = db.mock.calls[0];
    expect(sql).toContain('astro_maia_protected_origins');
    expect(sql).toContain('astro_maia_transfer_grants');
    expect(sql).toContain('UNION ALL');
    expect(params).toEqual(['fictional-previous-chart-session']);
  });

  it('returns false only when BOTH authoritative origin tables are empty', async () => {
    db.mockResolvedValue({ rows: [] });
    expect(await isR4fProtectedSessionById('fictional-ordinary-session')).toBe(false);
    expect(db).toHaveBeenCalledTimes(1);
  });

  it('fails closed if privacy origin registry is inaccessible', async () => {
    db.mockRejectedValue(new Error('fictional protected registry unavailable'));
    await expect(isR4fProtectedSessionById('fictional-protected-session'))
      .rejects.toThrow('fictional protected registry unavailable');
  });

  it('all primary ordinary-turn read AND write paths check both registries', () => {
    const targets = [
      'app/api/conversation/turns/route.ts',
      'lib/memory/MemoryBundle.ts',
      'lib/memory/stores/TurnsStore.ts',
      'lib/sovereign/sessionManager.ts',
      'lib/maia/memoryLoaders.ts',
      'lib/maia/relational-field-shadow/fieldAssembler.ts',
      'lib/consciousness/participatoryRealityHelper.ts',
      'lib/maia/astrologyConsent/r4gDerivedProvenance.ts',
    ];
    for (const name of targets) {
      const code = source(name);
      expect(code).toContain('astro_maia_protected_origins');
      expect(code).toContain('astro_maia_transfer_grants');
      expect(code).toContain('UNION ALL');
    }
    const endpoint = source('app/api/conversation/turns/route.ts');
    expect(endpoint).toContain("message.includes('astro_maia_protected_origins')");
    expect(endpoint).toContain('privacy_guard_unavailable');
  });

  it('migration separates personal bearer grant from immutable nonmember origin', () => {
    const sql = source('database/migrations/20261013000004_r4i_minimal_origin_custody.sql');
    expect(sql).toContain('CREATE TABLE astro_maia_protected_origins');
    expect(sql).toContain('INSERT INTO astro_maia_protected_origins');
    expect(sql).toContain('FROM astro_maia_transfer_grants');
    expect(sql).toContain('AFTER INSERT ON astro_maia_transfer_grants');
    expect(sql).toContain('BEFORE UPDATE OR DELETE ON astro_maia_protected_origins');
    expect(sql).toContain('BEFORE TRUNCATE ON astro_maia_protected_origins');
    expect(sql).toContain('FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE');
    expect(sql).toContain("prior_fk NOT LIKE '%ON DELETE RESTRICT%'");
    expect(sql).not.toContain('member_id UUID NOT NULL REFERENCES members(id) ON DELETE RESTRICT');
    expect(sql).not.toContain('text_hmac_sha256 char(64)');
  });

  it('existing member deletion route continues to HOLD while governed content exists', () => {
    const code = source('app/api/members/delete-account/route.ts');
    expect(code).toContain("table: 'astro_maia_transfer_grants'");
    expect(code).toContain("label: 'records of private chart sharing'");
    expect(code).toContain('const R20_ACCOUNT_ERASURE_NOT_QUALIFIED = true as const');
    expect(code).not.toContain('DELETE FROM members');
    expect(code).not.toContain('await transaction(');
    expect(code).toContain("error: 'deletion_incomplete_unavailable'");
    expect(code).toContain("accountChanged: false");
  });
});
