import {
  countMemberMemoryAtomStates,
  loadMemberMemoryAtomsForPrompt,
} from '../memoryAtomsLoader';

jest.mock('@/lib/db/postgres', () => ({ query: jest.fn() }));
const { query } = jest.requireMock('@/lib/db/postgres');

beforeEach(() => jest.clearAllMocks());

describe('ambient return requires explicit member authority', () => {
  it('loader SQL requires preference AND member_explicit authority', async () => {
    query.mockResolvedValue({ rows: [{
      id: 'a1', title: 'held', body: 'held', primary_register: null, registers: [],
      elemental_lenses: [], status: 'active', kept_at: new Date('2026-09-17T00:00:00Z'),
      return_preference: 'contextual_doorway', return_authority: 'member_explicit',
      source_type: 'spontaneous', is_breakthrough: false, marked_breakthrough_at: null,
      epistemological_status: null, facilitator_id: null,
    }] });

    const rows = await loadMemberMemoryAtomsForPrompt('member-1');
    const sql = String(query.mock.calls[0][0]);
    expect(sql).toContain("return_preference IN ('contextual_doorway', 'ritual_review_opt_in')");
    expect(sql).toContain("return_authority = 'member_explicit'");
    expect(rows[0].returnAuthority).toBe('member_explicit');
  });

  it('eligibility observability uses the same authority gate', async () => {
    query.mockResolvedValue({ rows: [{ stored: '5', eligible: '1' }] });
    await countMemberMemoryAtomStates('member-1');
    const sql = String(query.mock.calls[0][0]);
    expect(sql).toContain("return_authority = 'member_explicit'");
  });
});
