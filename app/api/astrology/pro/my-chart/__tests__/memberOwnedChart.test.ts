import { GET, POST } from '../route';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { query } from '@/lib/db/postgres';
import { calculateBirthChart } from '@/lib/astrology/ephemerisCalculator';

jest.mock('@/lib/auth/getMemberFromRequest', () => ({
  getMemberIdFromRequest: jest.fn(),
}));
jest.mock('@/lib/db/postgres', () => ({ query: jest.fn() }));
jest.mock('@/lib/astrology/ephemerisCalculator', () => ({
  ...jest.requireActual('@/lib/astrology/ephemerisCalculator'),
  calculateBirthChart: jest.fn(),
}));
const auth = getMemberIdFromRequest as jest.Mock;
const db = query as jest.Mock;
const calc = calculateBirthChart as jest.Mock;
const ownRow = {
  birth_date: '2001-04-03', birth_time: '12:00:00',
  birth_location_lat: '40.600', birth_location_lng: '-73.800',
  birth_timezone: 'America/New_York', astrology_consent: 'opted_in', tester: true,
};
const ownChart = {
  sun:{sign:'Aries', degree:13.7, house:1, retrograde:false},
  moon:{sign:'Leo', degree:9,house:5,retrograde:false},
  houses:[0,32,61,90,120,149,180,212,241,270,300,329],
  aspects:[],
};
function request(method:'GET'|'POST', body?:unknown, headers?:Record<string,string>) {
  return {
    headers:new Headers(headers),
    json: jest.fn().mockResolvedValue(body ?? {}),
    url:'https://soullab.life/api/astrology/pro/my-chart',
  } as any;
}
const previousPreviewFlag = process.env.ASTRO_PRO_PREVIEW_ENABLED;
const previousAllowlist = process.env.ASTRO_PRO_PREVIEW_ALLOWED_MEMBERS;
const previousTesterCohort = process.env.ASTRO_PRO_BETA_TESTER_COHORT;
afterAll(() => {
  if (previousPreviewFlag === undefined) delete process.env.ASTRO_PRO_PREVIEW_ENABLED;
  else process.env.ASTRO_PRO_PREVIEW_ENABLED = previousPreviewFlag;
  if (previousAllowlist === undefined) delete process.env.ASTRO_PRO_PREVIEW_ALLOWED_MEMBERS;
  else process.env.ASTRO_PRO_PREVIEW_ALLOWED_MEMBERS = previousAllowlist;
  if (previousTesterCohort === undefined) delete process.env.ASTRO_PRO_BETA_TESTER_COHORT;
  else process.env.ASTRO_PRO_BETA_TESTER_COHORT = previousTesterCohort;
});
beforeEach(()=>{
  jest.resetAllMocks();
  process.env.ASTRO_PRO_PREVIEW_ENABLED = 'true';
  process.env.ASTRO_PRO_PREVIEW_ALLOWED_MEMBERS = 'synthetic-member-a';
  process.env.ASTRO_PRO_BETA_TESTER_COHORT = 'false';
  auth.mockResolvedValue('synthetic-member-a');
  db.mockResolvedValue({rows:[ownRow]});
  calc.mockResolvedValue(ownChart);
});
describe('ASTRO-PRO-04 — member-owned, strict-core natal chart',()=>{
  it('refuses unauthenticated request without reading data or calculating',async()=>{
    auth.mockResolvedValue(null);
    const r=await POST(request('POST'));
    expect(r.status).toBe(401);
    expect(db).not.toHaveBeenCalled();
    expect(calc).not.toHaveBeenCalled();
    expect(r.headers.get('cache-control')).toContain('no-store');
  });
  it('rejects cross-site requests before examining member data',async()=>{
    const r=await POST(request('POST',{}, {'sec-fetch-site':'cross-site'}));
    expect(r.status).toBe(403);
    expect(auth).not.toHaveBeenCalled();
    expect(db).not.toHaveBeenCalled();
  });
  it('allows only opted-in member charts; unknown or declined consent refuses',async()=>{
    for(const consent of [null,'declined','unknown']){
      db.mockResolvedValue({rows:[{...ownRow,astrology_consent:consent}]});
      const r=await POST(request('POST'));
      expect(r.status).toBe(403);
      expect((await r.json()).error).toBe('astrology_consent_required');
    }
    expect(calc).not.toHaveBeenCalled();
  });
  it('uses only authenticated member id to load their own stored birth record, never client-supplied fields',async()=>{
    const r=await POST(request('POST',{
      memberId:'synthetic-other-person',birth_date:'2099-01-01',
      location:{lat:0,lng:0,timezone:'UTC'},calculationProfile:'legacy',
    }));
    expect(r.status).toBe(200);
    expect(db).toHaveBeenCalledWith(expect.stringContaining('FROM members WHERE id = $1'),['synthetic-member-a']);
    expect(calc).toHaveBeenCalledWith(expect.objectContaining({
      date:'2001-04-03',time:'12:00',
      location:{lat:40.6,lng:-73.8,timezone:'America/New_York'},
      houseSystem:'porphyry',qualityMode:'strict-core',
    }));
    const body=await r.json();
    expect(body.memberId).toBe('synthetic-member-a');
    expect(body.data).toEqual(ownChart);
    expect(body.calculationQuality.independentlyCertified).toBe(false);
    expect(body.input).toBeUndefined();
    expect(body.birthData).toBeUndefined();
    expect(JSON.stringify(body)).not.toContain('2001-04-03');
    expect(JSON.stringify(body)).not.toContain('-73.8');
    expect(r.headers.get('cache-control')).toBe('private, no-store');
  });
  it('rechecks session after calculation and refuses if revoked or switched',async()=>{
    auth.mockResolvedValueOnce('synthetic-member-a').mockResolvedValueOnce(null);
    const r=await POST(request('POST'));
    expect(r.status).toBe(401);
    expect((await r.json()).error).toBe('session_changed');
  });
  it('does not leak DB error messages, submitted birth values or model output',async()=>{
    db.mockRejectedValue(new Error('DOB_SECRET_ON_EXCEPTION'));
    const errorSpy=jest.spyOn(console,'error').mockImplementation(()=>{});
    try{
      const r=await POST(request('POST'));
      expect(r.status).toBe(503);
      expect(JSON.stringify(await r.json())).not.toContain('DOB_SECRET_ON_EXCEPTION');
      expect(JSON.stringify(errorSpy.mock.calls)).not.toContain('DOB_SECRET_ON_EXCEPTION');
    }finally{errorSpy.mockRestore();}
  });
  it('rejects incomplete birth details before running calculator',async()=>{
    for(const row of [
      {...ownRow,birth_location_lat:null},
      {...ownRow,birth_timezone:null},
      {...ownRow,birth_time:'12:15:42'},
      {...ownRow,birth_date:'not-a-date'},
    ]){
      db.mockResolvedValueOnce({rows:[row]});
      const r=await POST(request('POST'));
      expect(r.status).toBe(422);
    }
    expect(calc).not.toHaveBeenCalled();
  });
  it('accepts stored 0/0 coordinates without mistaking them for absent',async()=>{
    db.mockResolvedValue({rows:[{...ownRow,birth_location_lat:'0',birth_location_lng:'0',birth_timezone:'UTC'}]});
    const r=await POST(request('POST'));
    expect(r.status).toBe(200);
    expect(calc).toHaveBeenCalledWith(expect.objectContaining({
      location:{lat:0,lng:0,timezone:'UTC'},
    }));
  });
  it('fails closed when preview flag is disabled', async () => {
    delete process.env.ASTRO_PRO_PREVIEW_ENABLED;
    const r = await POST(request('POST'));
    expect(r.status).toBe(404);
    expect(auth).not.toHaveBeenCalled();
    expect(db).not.toHaveBeenCalled();
  });
  it('requires separate server-owned member eligibility after authentication', async () => {
    process.env.ASTRO_PRO_PREVIEW_ALLOWED_MEMBERS = 'another-member';
    const r = await POST(request('POST'));
    expect(r.status).toBe(403);
    expect((await r.json()).error).toBe('preview_access_required');
    expect(db).not.toHaveBeenCalled();
    expect(calc).not.toHaveBeenCalled();
  });
  it('refuses a chart if astrology consent is revoked during calculation', async () => {
    db.mockResolvedValueOnce({ rows: [ownRow] }).mockResolvedValueOnce({
      rows: [{ astrology_consent: 'declined' }],
    });
    const r = await POST(request('POST'));
    expect(r.status).toBe(403);
    expect((await r.json()).error).toBe('astrology_consent_required');
    expect(calc).toHaveBeenCalledTimes(1);
  });
  it('GET clears the view when consent is withdrawn after the chart was opened', async () => {
    db.mockResolvedValueOnce({ rows: [{ astrology_consent: 'declined' }] });
    const r = await GET(request('GET'));
    expect(r.status).toBe(403);
    expect(calc).not.toHaveBeenCalled();
  });
  it('admits a consented tester only when the cohort flag is explicitly on', async () => {
    process.env.ASTRO_PRO_PREVIEW_ALLOWED_MEMBERS = '';
    process.env.ASTRO_PRO_BETA_TESTER_COHORT = 'true';
    const post = await POST(request('POST'));
    expect(post.status).toBe(200);
    const get = await GET(request('GET'));
    expect(get.status).toBe(200);
    expect(calc).toHaveBeenCalledTimes(1);
  });
  it('refuses a non-tester even when the cohort flag is on', async () => {
    process.env.ASTRO_PRO_PREVIEW_ALLOWED_MEMBERS = '';
    process.env.ASTRO_PRO_BETA_TESTER_COHORT = 'true';
    db.mockResolvedValue({ rows: [{ ...ownRow, tester: false }] });
    const post = await POST(request('POST'));
    const get = await GET(request('GET'));
    expect(post.status).toBe(403);
    expect(get.status).toBe(403);
    expect(calc).not.toHaveBeenCalled();
  });
  it('explicitly invited members do not require the general tester flag', async () => {
    process.env.ASTRO_PRO_BETA_TESTER_COHORT = 'false';
    db.mockResolvedValue({ rows: [{ ...ownRow, tester: false }] });
    const post = await POST(request('POST'));
    expect(post.status).toBe(200);
  });
  it('refuses a cohort member whose tester status is withdrawn mid-calculation', async () => {
    process.env.ASTRO_PRO_PREVIEW_ALLOWED_MEMBERS = '';
    process.env.ASTRO_PRO_BETA_TESTER_COHORT = 'true';
    db.mockResolvedValueOnce({ rows: [{ ...ownRow, tester: true }] })
      .mockResolvedValueOnce({ rows: [{ astrology_consent: 'opted_in', tester: false }] });
    const post = await POST(request('POST'));
    expect(post.status).toBe(403);
    expect((await post.json()).error).toBe('preview_access_required');
    expect(calc).toHaveBeenCalledTimes(1);
  });
  it('default-off cohort and no allowlist refuse before member-data lookup', async () => {
    process.env.ASTRO_PRO_PREVIEW_ALLOWED_MEMBERS = '';
    process.env.ASTRO_PRO_BETA_TESTER_COHORT = 'false';
    const post = await POST(request('POST'));
    const get = await GET(request('GET'));
    expect(post.status).toBe(403);
    expect(get.status).toBe(403);
    expect(db).not.toHaveBeenCalled();
    expect(calc).not.toHaveBeenCalled();
  });
  it('GET is also unavailable when the entire preview is disabled', async () => {
    process.env.ASTRO_PRO_PREVIEW_ENABLED = 'false';
    const get = await GET(request('GET'));
    expect(get.status).toBe(404);
    expect(db).not.toHaveBeenCalled();
  });
  it('admits a flagged tester only when the cohort feature is explicitly enabled', async () => {
    const old = process.env.ASTRO_PRO_BETA_TESTER_COHORT;
    try {
      process.env.ASTRO_PRO_PREVIEW_ALLOWED_MEMBERS = '';
      process.env.ASTRO_PRO_BETA_TESTER_COHORT = 'true';
      const allowed = await POST(request('POST'));
      expect(allowed.status).toBe(200);
      expect(calc).toHaveBeenCalledTimes(1);
      jest.clearAllMocks();
      auth.mockResolvedValue('synthetic-member-a');
      db.mockResolvedValue({ rows: [{ ...ownRow, tester: false }] });
      calc.mockResolvedValue(ownChart);
      const denied = await POST(request('POST'));
      expect(denied.status).toBe(403);
      expect(calc).not.toHaveBeenCalled();
    } finally {
      if (old === undefined) delete process.env.ASTRO_PRO_BETA_TESTER_COHORT;
      else process.env.ASTRO_PRO_BETA_TESTER_COHORT = old;
    }
  });
  it('refuses a chart when tester eligibility is withdrawn during calculation', async () => {
    const old = process.env.ASTRO_PRO_BETA_TESTER_COHORT;
    try {
      process.env.ASTRO_PRO_PREVIEW_ALLOWED_MEMBERS = '';
      process.env.ASTRO_PRO_BETA_TESTER_COHORT = 'true';
      db.mockResolvedValueOnce({ rows: [ownRow] }).mockResolvedValueOnce({
        rows: [{ astrology_consent: 'opted_in', tester: false }],
      });
      const response = await POST(request('POST'));
      expect(response.status).toBe(403);
      expect((await response.json()).error).toBe('preview_access_required');
      expect(calc).toHaveBeenCalledTimes(1);
    } finally {
      if (old === undefined) delete process.env.ASTRO_PRO_BETA_TESTER_COHORT;
      else process.env.ASTRO_PRO_BETA_TESTER_COHORT = old;
    }
  });
  it('GET performs session revalidation without querying personal birth data',async()=>{
    const r=await GET(request('GET'));
    expect(r.status).toBe(200);
    expect(await r.json()).toEqual({memberId:'synthetic-member-a',verified:true});
    expect(db).toHaveBeenCalledWith(
      expect.stringContaining('SELECT astrology_consent, tester FROM members'),
      ['synthetic-member-a'],
    );
    expect(calc).not.toHaveBeenCalled();
  });
});
