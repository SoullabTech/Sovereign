/**
 * The taste of Pro — decision and storage rules (founder rulings 2026-11-13).
 */
const query = jest.fn();
jest.mock('@/lib/db/postgres', () => ({ query: (...a: unknown[]) => query(...a) }));
const holds = jest.fn();
jest.mock('@/lib/auth/entitlements', () => ({ holdsWholeWork: (...a: unknown[]) => holds(...a) }));

import { claimTaste, decideTaste, proTasteEnabled, tasteStanding, wholeWorkForManuscript } from '../proTaste';

const saved = process.env.WS_PRO_TASTE_ENABLED;
beforeEach(() => { query.mockReset(); holds.mockReset(); process.env.WS_PRO_TASTE_ENABLED = 'true'; });
afterAll(() => { if (saved === undefined) delete process.env.WS_PRO_TASTE_ENABLED; else process.env.WS_PRO_TASTE_ENABLED = saved; });

const d = (row: any, hadBetaGrant = false, manuscriptId: string | null = 'm1') => decideTaste({ enabled: true, row, hadBetaGrant, manuscriptId });

describe('decision', () => {
  it('switch off → none, and nothing is read', async () => {
    delete process.env.WS_PRO_TASTE_ENABLED;
    expect(proTasteEnabled()).toBe(false);
    expect(await tasteStanding('me', 'm1')).toBe('none');
    expect(query).not.toHaveBeenCalled();
  });
  it('never claimed → available; given back → available again', () => {
    expect(d(null)).toBe('available');
    expect(d({ manuscript_id: 'm1', completed_at: null, returned_at: new Date() })).toBe('available');
  });
  it('⭐ claimed for this manuscript and open → claimed_here; for another → none; spent → none', () => {
    expect(d({ manuscript_id: 'm1', completed_at: null, returned_at: null })).toBe('claimed_here');
    expect(d({ manuscript_id: 'm2', completed_at: null, returned_at: null })).toBe('none');
    expect(d({ manuscript_id: 'm1', completed_at: new Date(), returned_at: null })).toBe('none');
  });
  it('⭐ a former beta tester receives no taste (ruling 2026-11-13)', () => {
    expect(d(null, true)).toBe('none');
  });
});

describe('storage', () => {
  it('claim upserts only over a given-back row, so a spent or open taste cannot be re-claimed', async () => {
    query.mockImplementation(async (sql: string) => {
      if (sql.includes('FROM writers_studio_pro_tastes')) return { rows: [] };
      if (sql.includes('FROM writers_studio_beta_grant_events')) return { rows: [] };
      return { rows: [{ member_id: 'me' }] };
    });
    expect(await claimTaste('me', 'm1')).toBe(true);
    const upsert = query.mock.calls.find(([sql]) => String(sql).includes('INSERT INTO writers_studio_pro_tastes'));
    expect(String(upsert![0])).toContain('WHERE writers_studio_pro_tastes.returned_at IS NOT NULL');
  });
  it('the whole-book pass for a manuscript: Pro, or the taste claimed for that manuscript only', async () => {
    holds.mockResolvedValue(true);
    expect(await wholeWorkForManuscript('me', 'm1')).toBe(true);
    holds.mockResolvedValue(false);
    query.mockImplementation(async (sql: string) =>
      sql.includes('FROM writers_studio_pro_tastes') ? { rows: [{ manuscript_id: 'm1', completed_at: null, returned_at: null }] } : { rows: [] });
    expect(await wholeWorkForManuscript('me', 'm1')).toBe(true);
    expect(await wholeWorkForManuscript('me', 'm2')).toBe(false);
  });
});
