import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { NextRequest } from 'next/server';

const mockIdentity = jest.fn<(...args: unknown[]) => Promise<any>>();
const mockTeamRole = jest.fn<(...args: unknown[]) => Promise<boolean>>();
const mockQuery = jest.fn<(...args: unknown[]) => Promise<any>>();
jest.mock('@/lib/auth/getCurrentPractitioner', () => ({
  getCurrentPractitioner: (...a: unknown[]) => mockIdentity(...a),
}));
jest.mock('@/lib/auth/teamPermissions', () => ({
  hasTeamRole: (...a: unknown[]) => mockTeamRole(...a),
}));
jest.mock('@/lib/db/postgres', () => ({
  __esModule: true, default: { query: (...a: unknown[]) => mockQuery(...a) },
}));
import { GET, POST } from '../attention/route';
import { GET as GETOptions } from '../attention/options/route';
import {
  attentionReadSql, ATTENTION_CREATE_SQL,
} from '@/lib/studio/field/attentionOwnerPredicates';

const MEMBER = '11111111-1111-4111-8111-111111111111';
const PRACTITIONER = '22222222-2222-4222-8222-222222222222';
const FOREIGN = '33333333-3333-4333-8333-333333333333';
const TEAM = '44444444-4444-4444-8444-444444444444';
const URL = 'https://soullab.life/api/studio/field/attention';
const get = (query = '') => new NextRequest(URL + query);
const post = (body: Record<string, unknown>) => new NextRequest(URL, {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify(body),
});
const sourceRef = (kind: 'change'|'decision', extra: Record<string,unknown> = {}) => ({
  kind, field: 'important', refId: FOREIGN, label: 'Spoofed source name', ...extra,
});
const inserts = () => mockQuery.mock.calls.filter(([sql]) => String(sql).includes('INSERT INTO field_attention'));

beforeEach(() => {
  mockIdentity.mockReset(); mockTeamRole.mockReset(); mockQuery.mockReset();
  mockIdentity.mockResolvedValue({ memberId: MEMBER, practitionerId: PRACTITIONER });
  mockTeamRole.mockResolvedValue(false);
  mockQuery.mockImplementation(async sql => String(sql).includes('MIN(position)')
    ? { rows: [{ pos: -1 }] } : { rows: [] });
});

describe('Studio Attention G2-3A: source-verified references', () => {
  it('rejects unsigned actor before any DB access', async () => {
    mockIdentity.mockResolvedValue(null);
    expect((await GET(get())).status).toBe(401);
    expect((await POST(post(sourceRef('change')))).status).toBe(401);
    expect(mockQuery).not.toHaveBeenCalled();
  });
  it('rejects foreign Change reference in the atomic insert without writing', async () => {
    const response = await POST(post(sourceRef('change')));
    expect(response.status).toBe(404);
    expect(inserts()).toHaveLength(1);
    expect(inserts()[0][0]).toBe(ATTENTION_CREATE_SQL);
    expect(inserts()[0][1]).toEqual([
      PRACTITIONER, null, 'important', 'change', FOREIGN,
      'Spoofed source name', -1, MEMBER,
    ]);
    expect(ATTENTION_CREATE_SQL).toContain('c.id = $5::uuid');
    expect(ATTENTION_CREATE_SQL).toContain('c.practitioner_id = $1::uuid');
    expect(ATTENTION_CREATE_SQL).toContain('c.team_id IS NOT DISTINCT FROM $2::uuid');
    expect(ATTENTION_CREATE_SQL).toContain('c.client_id IS NULL');
    expect(ATTENTION_CREATE_SQL).toContain('c.member_id IS NULL OR c.member_id = $8::uuid');
    expect(ATTENTION_CREATE_SQL).not.toContain('VALUES ($1');
  });
  it('rejects foreign Decision reference; no separate unscoped source query', async () => {
    const response = await POST(post(sourceRef('decision')));
    expect(response.status).toBe(404);
    expect(inserts()).toHaveLength(1);
    expect(ATTENTION_CREATE_SQL).toContain('d.id = $5::uuid');
    expect(ATTENTION_CREATE_SQL).toContain('d.personal_member_id = $8::uuid');
    expect(ATTENTION_CREATE_SQL).toContain("d.decision_scope IN ('practice','team')");
    expect(ATTENTION_CREATE_SQL).toContain('d.client_id IS NULL');
    expect(mockQuery.mock.calls).toHaveLength(2); // scoped min + atomic insert
  });
  it('ignores attacker label on valid referenced object, uses owned source title', async () => {
    mockQuery.mockImplementation(async sql => String(sql).includes('MIN(position)')
      ? { rows: [{ pos: -1 }] }
      : { rows: [{
        id: 'attention-fixture', field: 'important', kind: 'change', ref_id: FOREIGN,
        label: 'Verified owner title', position: -1,
        created_at: '2026-10-13T00:00:00Z',
      }] });
    const res = await POST(post(sourceRef('change')));
    expect(res.status).toBe(201);
    const data=await res.json();
    expect(data.label).toBe('Verified owner title');
    expect(data.label).not.toBe('Spoofed source name');
  });
  it('preserves authored free-note without requiring a referenced Change', async () => {
    mockQuery.mockImplementation(async sql => String(sql).includes('MIN(position)')
      ? { rows: [{ pos: -1 }] }
      : { rows: [{
        id: 'n1', field: 'important', kind: 'note', ref_id: null,
        label: 'My own words', position: -1,
      }] });
    const res=await POST(post({kind:'note',field:'important',label:'My own words'}));
    expect(res.status).toBe(201);
    expect(inserts()[0][1]).toEqual([
      PRACTITIONER,null,'important','note',null,'My own words',-1,MEMBER,
    ]);
  });
  it('does not leak stale cached labels or target UUIDs when join denies the source', async () => {
    mockQuery.mockResolvedValue({rows:[{
      id:'attention-fixture',kind:'decision',ref_id:FOREIGN,
      field:'important',label:'Cached B private label',
      resolved:'Spoofed result',gone:true,position:1,
    }]});
    const res=await GET(get());
    expect(res.status).toBe(200);
    const data=await res.json();
    expect(data.important[0].label).toBe('Reference unavailable');
    expect(data.important[0].refId).toBeNull();
    expect(data.important[0].href).toBeUndefined();
    const serialized=JSON.stringify(data);
    expect(serialized).not.toContain(FOREIGN);
    expect(serialized).not.toContain('Cached B private label');
    expect(serialized).not.toContain('Spoofed result');
  });
  it('reads only exact member-and-practitioner sources, no cached fallback', async () => {
    await GET(get());
    const [sql,params]=mockQuery.mock.calls[0];
    expect(sql).toBe(attentionReadSql('AND fa.team_id IS NULL'));
    expect(params).toEqual([PRACTITIONER,null,MEMBER]);
    expect(String(sql)).toContain('c.practitioner_id = fa.practitioner_id');
    expect(String(sql)).toContain('d.personal_member_id = $3::uuid');
    expect(String(sql)).toContain('c.team_id IS NOT DISTINCT FROM fa.team_id');
    expect(String(sql)).not.toMatch(/COALESCE\(c\.title.*fa\.label/);
  });
  it('rejects static scope SQL injection attempts at helper boundary', () => {
    expect(() => attentionReadSql('AND TRUE; DROP TABLE field_attention;')).toThrow(
      'Unrecognized attention scope');
  });
  it('denies guessed team ID even if the practitioner account is valid', async () => {
    const res=await GET(get('?teamId='+TEAM));
    expect(res.status).toBe(403);
    expect(mockQuery).not.toHaveBeenCalled();
    expect(mockTeamRole).toHaveBeenCalledWith(MEMBER,TEAM,'viewer');
  });
  it('accepts only authorized team ID for read and scopes to exact team', async () => {
    mockTeamRole.mockResolvedValue(true);
    const res=await GET(get('?teamId='+TEAM+'&includePersonal=false'));
    expect(res.status).toBe(200);
    expect(mockQuery.mock.calls[0][0]).toBe(attentionReadSql('AND fa.team_id = $2'));
    expect(mockQuery.mock.calls[0][1]).toEqual([PRACTITIONER, TEAM, MEMBER]);
  });
  it('prevents unauthorized team reference writes before any data query', async () => {
    const res=await POST(post(sourceRef('change',{teamId:TEAM})));
    expect(res.status).toBe(403);
    expect(mockQuery).not.toHaveBeenCalled();
    expect(mockTeamRole).toHaveBeenCalledWith(MEMBER,TEAM,'member');
  });
  it('attention options reject former/foreign teams before reading titles', async () => {
    const req=new NextRequest(URL+'/options?teamId='+TEAM);
    const res=await GETOptions(req);
    expect(res.status).toBe(403);
    expect(mockQuery).not.toHaveBeenCalled();
    expect(mockTeamRole).toHaveBeenCalledWith(MEMBER,TEAM,'viewer');
  });
  it('does not represent SQL failures as an empty personal Field', async () => {
    mockQuery.mockRejectedValueOnce(new Error('DB unavailable: private details'));
    const res=await GET(get());
    expect(res.status).toBe(503);
    const body=JSON.stringify(await res.json());
    expect(body).not.toContain('private details');
    expect(body).not.toContain('important');
    expect(res.headers.get('Cache-Control')).toContain('no-store');
  });
  it('does not represent options query failures as no decisions', async () => {
    mockQuery.mockRejectedValue(new Error('Private SQL error'));
    const res=await GETOptions(new NextRequest(URL+'/options'));
    expect(res.status).toBe(503);
    expect(JSON.stringify(await res.json())).not.toContain('Private SQL error');
    expect(res.headers.get('Cache-Control')).toContain('no-store');
  });

  it('attention options preserve non-team listing of own practitioner sources', async () => {
    mockQuery.mockResolvedValue({rows:[]});
    const req=new NextRequest(URL+'/options');
    const res=await GETOptions(req);
    expect(res.status).toBe(200);
    expect(mockTeamRole).not.toHaveBeenCalled();
    expect(mockQuery).toHaveBeenCalledTimes(2);
    expect(mockQuery.mock.calls[0][1]).toEqual([PRACTITIONER,null,MEMBER]);
    expect(mockQuery.mock.calls[1][1]).toEqual([PRACTITIONER,null,MEMBER]);
    expect(String(mockQuery.mock.calls[0][0])).toContain('client_id IS NULL');
    expect(String(mockQuery.mock.calls[0][0])).toContain('member_id = $3::uuid');
    expect(String(mockQuery.mock.calls[1][0])).toContain('client_id IS NULL');
  });
});
