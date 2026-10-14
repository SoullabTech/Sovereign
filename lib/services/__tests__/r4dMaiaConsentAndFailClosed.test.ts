/**
 * R4d fictional-account privacy/availability witness for MAIA's implicit
 * astronomy loader. This test never connects to a real database or model.
 */
const mockQuery = jest.fn();
jest.mock('@/lib/db/postgres', () => ({ query:(...args:unknown[])=>mockQuery(...args) }));
import * as Astro from '@/lib/astrology/ephemerisCalculator';
import {
  getAstrologyContextForUser, getCurrentTransitPositions,
} from '../maiaAstrologyContextService';

describe('ASTRO-PRO-R4d: standing Astrology consent and source refusal',()=>{
  beforeEach(()=>{mockQuery.mockReset(); jest.restoreAllMocks();});

  it.each(['declined','unknown',null,undefined])(
    'does not read stored birth data or MAIA context when consent=%s',
    async consent=>{
      mockQuery.mockResolvedValue({rows:[{astrology_consent:consent}]});
      const context=await getAstrologyContextForUser('fictional-r4d-member');
      expect(context).toBeNull();
      expect(mockQuery).toHaveBeenCalledTimes(1);
      expect(mockQuery.mock.calls[0][0]).toContain('SELECT astrology_consent');
      expect(mockQuery.mock.calls[0][0]).not.toContain('birth_date');
      expect(mockQuery.mock.calls[0][1]).toEqual(['fictional-r4d-member']);
    },
  );

  it('gates member birth-row access behind an explicit opted-in receipt',async()=>{
    mockQuery.mockResolvedValueOnce({rows:[{astrology_consent:'opted_in'}]});
    mockQuery.mockResolvedValueOnce({rows:[]}); // synthetic missing birth row
    const context=await getAstrologyContextForUser('fictional-r4d-member');
    expect(context).toBeNull();
    expect(mockQuery).toHaveBeenCalledTimes(2);
    expect(mockQuery.mock.calls[1][0]).toContain('birth_date');
    expect(mockQuery.mock.calls[1][1]).toEqual(['fictional-r4d-member']);
  });

  it('refuses to return assembled MAIA astrology after consent is withdrawn mid-calculation',async()=>{
    mockQuery.mockResolvedValueOnce({rows:[{astrology_consent:'opted_in'}]});
    mockQuery.mockResolvedValueOnce({rows:[{
      birth_date:null,birth_time:null,birth_location_lat:null,
      birth_location_lng:null,birth_timezone:null,
    }]});
    mockQuery.mockResolvedValueOnce({rows:[]}); // no stored report
    mockQuery.mockResolvedValueOnce({rows:[{astrology_consent:'declined'}]});
    const context=await getAstrologyContextForUser('fictional-r4d-revoked');
    expect(context).toBeNull();
    expect(mockQuery.mock.calls.map(x=>x[0]).filter(x=>x.includes('SELECT astrology_consent'))).toHaveLength(2);
    expect(mockQuery.mock.calls.length).toBe(4);
  });

  it('keeps member-invited natal facts distinct from optional symbolic meaning',async()=>{
    mockQuery.mockResolvedValueOnce({rows:[{astrology_consent:'opted_in'}]});
    mockQuery.mockResolvedValueOnce({rows:[{
      birth_date:'2001-05-29',birth_time:'16:11',
      birth_location_lat:'51.5074',birth_location_lng:'-0.1278',
      birth_timezone:'Europe/London',birth_location_name:'fictional London',
    }]});
    mockQuery.mockResolvedValueOnce({rows:[]}); // no stored report
    mockQuery.mockResolvedValueOnce({rows:[{astrology_consent:'opted_in'}]});
    const ctx=await getAstrologyContextForUser('fictional-r4d-invited');
    expect(ctx).not.toBeNull();
    if(!ctx) return;
    expect(ctx.contextHeader).toContain('standing consent confirmed');
    expect(ctx.contextHeader).toContain('Their own words govern personal meaning');
    expect(ctx.contextHeader).toContain('Do not introduce astrology without invitation');
    expect(ctx.contextDetail).toContain('Calculated Natal Positions');
    expect(ctx.contextDetail).toContain('Optional Symbolic Tradition');
    expect(ctx.contextDetail).not.toContain('## Natal Identity');
    expect(ctx.payload?.guardrails).toEqual(expect.arrayContaining([expect.stringContaining('member_meaning_is_authoritative')]));
    expect(ctx.currentTransits).toHaveLength(10);
    expect(ctx.currentTransits.every(p=>p.motionStatus!==undefined)).toBe(true);
    expect(ctx.birthChart?.uranus.motionStatus).toBe('stationary-uncertain');
    expect(ctx.formattedContext).not.toContain('2001-05-29');
    expect(ctx.formattedContext).not.toContain('16:11');
    expect(ctx.formattedContext).not.toContain('51.5074');
  });

  it('returns no invented sky facts if the ephemeris calculation fails',async()=>{
    jest.spyOn(Astro,'calculateTransits').mockRejectedValueOnce(new Error('private detail should not leak'));
    const warn=jest.spyOn(console,'warn').mockImplementation(()=>undefined);
    try {
      const sky=await getCurrentTransitPositions(new Date('2026-02-26T06:38:00Z'));
      expect(sky).toEqual([]);
      expect(JSON.stringify(warn.mock.calls)).not.toContain('private detail should not leak');
    } finally {warn.mockRestore();}
  });
});
