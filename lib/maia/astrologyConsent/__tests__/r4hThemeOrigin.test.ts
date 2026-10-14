import fs from 'node:fs';
import path from 'node:path';
import { query } from '@/lib/db/postgres';
import { loadRecentThemeSignals } from '@/lib/maia/memoryLoaders';

jest.mock('@/lib/db/postgres', () => ({ query: jest.fn() }));
const queryMock = query as jest.Mock;
const read = (p: string) => fs.readFileSync(path.join(process.cwd(), p), 'utf8');

beforeEach(() => queryMock.mockReset());

describe('R4H member-theme signal provenance', () => {
  it('reads only known ordinary scope and excludes R4F-protected sessions', async () => {
    queryMock.mockResolvedValue({ rows: [{
      theme: 'field_awareness', signal_type: 'active',
      resonance_strength: 0.7, element: 'earth', detected_at: new Date(),
    }] });
    const result = await loadRecentThemeSignals('fictional-member', 5);
    expect(result).toHaveLength(1);
    const sql = queryMock.mock.calls[0][0] as string;
    expect(sql).toContain("origin_scope = 'ordinary'");
    expect(sql).toContain('astro_maia_transfer_grants');
    expect(sql).toContain('session_id IS NOT NULL');
  });
  it('makes fire-and-forget write valid only for known ordinary session', () => {
    const writer = read('lib/consciousness/participatoryRealityHelper.ts');
    expect(writer).toContain("'ordinary'");
    expect(writer).toContain("NOT LIKE 'astrology-pro-preview-%'");
    expect(writer).toContain('NOT EXISTS (');
    expect(writer).toContain('astro_maia_transfer_grants');
    expect(writer).toContain("origin_scope = 'ordinary'");
  });
  it('contains additive-only migration and makes unknown history explicit', () => {
    const migration = read('database/migrations/20261013000003_r4h_theme_origin_scope.sql');
    expect(migration).toContain("DEFAULT 'unknown'");
    expect(migration).toContain('ADD COLUMN IF NOT EXISTS origin_scope');
    expect(migration).not.toContain('DELETE FROM member_theme_signals');
  });
});
