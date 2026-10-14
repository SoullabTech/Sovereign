/** R4e — generic MAIA identity continuity must not query birth data or chart. */
const mockQuery = jest.fn();
jest.mock('@/lib/db/postgres', () => ({ query: (...args:unknown[]) => mockQuery(...args) }));
jest.mock('@/lib/stellium/clients', () => ({
  resolveMemberDisplayName: () => 'Fictional Steward',
}));
import { buildMaiaContext } from '../buildMaiaContext';

describe('ASTRO-R4e — identity continuity is not chart transfer authority', () => {
  beforeEach(() => mockQuery.mockReset());

  it('does not query any birth or astrology field for an ordinary MAIA turn', async () => {
    mockQuery.mockResolvedValue({ rows: [{
      id:'fictional-id', username:'fictional', preferred_name:'Fictional Steward',
      pronouns:'they/them',
    }]});
    const result = await buildMaiaContext('fictional-id');
    expect(result.userId).toBe('fictional-id');
    expect(result.userName).toBe('Fictional Steward');
    expect(result.pronouns).toBe('they/them');
    expect(result.astrologyAddendum).toBeUndefined();
    expect(result.hasBirthData).toBe(false);
    expect(mockQuery).toHaveBeenCalledTimes(1);
    const sql=String(mockQuery.mock.calls[0][0]);
    expect(sql).not.toMatch(/astrology|birth_date|birth_time|birth_location|natal_chart/i);
  });

  it('does not query on missing identity or unresolvable fictional member', async () => {
    expect(await buildMaiaContext('')).toEqual({userId:'',hasBirthData:false});
    expect(mockQuery).not.toHaveBeenCalled();
    mockQuery.mockResolvedValue({rows:[]});
    const result=await buildMaiaContext('fictional-missing');
    expect(result.astrologyAddendum).toBeUndefined();
    expect(result.hasBirthData).toBe(false);
  });
});
