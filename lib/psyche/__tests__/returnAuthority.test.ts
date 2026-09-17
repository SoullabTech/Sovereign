import { readFileSync } from 'fs';
import { join } from 'path';
import { applyAtomGesture, keepSource } from '../portfolio';

jest.mock('@/lib/db/postgres', () => ({ query: jest.fn() }));
const { query } = jest.requireMock('@/lib/db/postgres');

const MEMBER = '11111111-1111-4111-8111-111111111111';

const atomRow = (over: Record<string, unknown> = {}) => ({
  rows: [{
    id: 'atom-1', member_id: MEMBER, source_type: 'spontaneous', source_id: null,
    title: 'exact words', body: 'exact words', primary_register: null, registers: [],
    elemental_lenses: [], thread_ids: [], status: 'active',
    return_preference: 'member_pulled', return_authority: 'default_private',
    last_surfaced_at: null, surface_count: 0, member_response_status: null,
    member_response_at: null, kept_at: new Date().toISOString(),
    last_touched_at: new Date().toISOString(), created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(), crossing_allowed: false, was_created: true,
    ...over,
  }],
});

beforeEach(() => jest.clearAllMocks());

describe('R10 KEEP does not grant REOPEN', () => {
  it('new keeps explicitly write private preference + default-private authority', async () => {
    query.mockResolvedValue(atomRow());
    const atom = await keepSource(MEMBER, {
      memberId: MEMBER, sourceType: 'spontaneous', sourceId: null,
      title: 'exact words', body: 'exact words',
    });
    const sql = String(query.mock.calls[0][0]);
    expect(sql).toContain('return_preference, return_authority');
    expect(sql).toContain("'active', 'member_pulled', 'default_private'");
    expect(atom.returnPreference).toBe('member_pulled');
    expect(atom.returnAuthority).toBe('default_private');
  });

  it('the return-preference gesture records member_explicit authority in the same UPDATE', async () => {
    query.mockResolvedValue(atomRow({
      return_preference: 'contextual_doorway', return_authority: 'member_explicit',
    }));
    const atom = await applyAtomGesture(MEMBER, 'atom-1', {
      kind: 'set_return_preference', preference: 'contextual_doorway',
    });
    const sql = String(query.mock.calls[0][0]);
    expect(sql).toContain('return_preference = $3');
    expect(sql).toContain("return_authority = 'member_explicit'");
    expect(atom.returnAuthority).toBe('member_explicit');
  });

  it('the migration marks legacy authority ambiguous and changes future defaults to private', () => {
    const migration = readFileSync(
      join(process.cwd(), 'database/migrations/20260917170000_memory_atom_return_authority.sql'),
      'utf8',
    );
    expect(migration).toContain("DEFAULT 'legacy_ambiguous'");
    expect(migration).toContain("ALTER COLUMN return_authority SET DEFAULT 'default_private'");
    expect(migration).toContain("ALTER COLUMN return_preference SET DEFAULT 'member_pulled'");
  });
});
