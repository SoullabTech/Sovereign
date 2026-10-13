import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { NextRequest } from 'next/server';
const mockIdentity = jest.fn<(...args: unknown[]) => Promise<any>>();
const mockTeam = jest.fn<(...args: unknown[]) => Promise<boolean>>();
const mockQuery = jest.fn<(...args: unknown[]) => Promise<any>>();
jest.mock('@/lib/auth/getCurrentPractitioner', () => ({
  getCurrentPractitioner: (...args: unknown[]) => mockIdentity(...args),
}));
jest.mock('@/lib/auth/teamPermissions', () => ({
  hasTeamRole: (...args: unknown[]) => mockTeam(...args),
}));
jest.mock('@/lib/db/postgres', () => ({
  __esModule: true, default: { query: (...args: unknown[]) => mockQuery(...args) },
}));
import { GET as getAttention, POST as postAttention } from '../attention/route';
import { POST as postNote } from '../notes/route';
const member='11111111-1111-4111-8111-111111111111';
const practitioner='22222222-2222-4222-8222-222222222222';
const team='33333333-3333-4333-8333-333333333333';
const post=(url:string,body:unknown)=>new NextRequest('https://soullab.life'+url,{
  method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(body),
});
const get=(url:string)=>new NextRequest('https://soullab.life'+url);
beforeEach(()=>{
  mockIdentity.mockReset();mockTeam.mockReset();mockQuery.mockReset();
  mockIdentity.mockResolvedValue({memberId:member,practitionerId:practitioner});
  mockTeam.mockResolvedValue(false);
  mockQuery.mockImplementation(async (sql)=>{
    const str=String(sql);
    if(str.includes('MIN(position)'))return {rows:[{pos:0}]};
    if(str.includes('INSERT INTO'))return {rows:[{id:'fixture-row',field:'important',kind:'note',
      section:'alive',body:'personal',label:'personal',position:0,created_at:'2026-10-12T00:00:00Z'}]};
    return {rows:[]};
  });
});
describe('G1: personal and collective Field scope are distinct',()=>{
  it('denies foreign team attention GET before DB read',async()=>{
    const r=await getAttention(get('/api/studio/field/attention?teamId='+team));
    expect(r.status).toBe(403);
    expect(mockTeam).toHaveBeenCalledWith(member,team,'viewer');
    expect(mockQuery).not.toHaveBeenCalled();
  });
  it('denies foreign team attention writes before persistence',async()=>{
    const r=await postAttention(post('/api/studio/field/attention',
      {field:'important',kind:'note',label:'My note',teamId:team}));
    expect(r.status).toBe(403);
    expect(mockTeam).toHaveBeenCalledWith(member,team,'member');
    expect(mockQuery).not.toHaveBeenCalled();
  });
  it('denies foreign team notes before persistence',async()=>{
    const r=await postNote(post('/api/studio/field/notes',
      {section:'alive',body:'My note',teamId:team}));
    expect(r.status).toBe(403);
    expect(mockTeam).toHaveBeenCalledWith(member,team,'member');
    expect(mockQuery).not.toHaveBeenCalled();
  });
  it('does not let team viewer write a member-level note',async()=>{
    mockTeam.mockImplementation(async (_m,_t,role)=>role==='viewer');
    const r=await postNote(post('/api/studio/field/notes',
      {section:'alive',body:'My note',teamId:team}));
    expect(r.status).toBe(403);
    expect(mockQuery).not.toHaveBeenCalled();
  });
  it('allows a team member to author own team-scoped note',async()=>{
    mockTeam.mockResolvedValue(true);
    const r=await postNote(post('/api/studio/field/notes',
      {section:'alive',body:'My note',teamId:team}));
    expect(r.status).toBe(201);
    expect(mockTeam).toHaveBeenCalledWith(member,team,'member');
    expect(mockQuery.mock.calls.some(c=>String(c[0]).includes('INSERT INTO field_notes'))).toBe(true);
  });
  it('preserves individual-only note authorship without a team',async()=>{
    const r=await postNote(post('/api/studio/field/notes',{section:'alive',body:'Personal only'}));
    expect(r.status).toBe(201);
    expect(mockTeam).not.toHaveBeenCalled();
    expect(mockQuery.mock.calls[0][1]).toEqual([practitioner,null,'alive','Personal only']);
  });
  it('rejects malformed teams rather than silently converting to personal',async()=>{
    const r=await postNote(post('/api/studio/field/notes',{section:'alive',body:'Personal?',teamId:{id:team}}));
    expect(r.status).toBe(400);
    expect(mockQuery).not.toHaveBeenCalled();
  });
  it('keeps a no-team personal attention write available',async()=>{
    const r=await postAttention(post('/api/studio/field/attention',{field:'important',kind:'note',label:'Own attention'}));
    expect(r.status).toBe(201);
    expect(mockTeam).not.toHaveBeenCalled();
  });
});
