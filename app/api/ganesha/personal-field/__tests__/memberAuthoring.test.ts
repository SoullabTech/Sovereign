import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { NextRequest } from 'next/server';

const mockIndividual = jest.fn<(...args: unknown[]) => Promise<any>>();
const mockQuery = jest.fn<(...args: unknown[]) => Promise<any>>();
jest.mock('@/lib/auth/individualContext', () => ({
  resolveIndividualContext: (...a: unknown[]) => mockIndividual(...a),
}));
jest.mock('@/lib/db/postgres', () => ({
  query: (...a: unknown[]) => mockQuery(...a),
}));
const mockRelease = jest.fn<() => boolean>();
jest.mock('@/lib/ganesha/g2MemberAuthoringRelease', () => ({
  isG2MemberAuthoringReleaseAdmitted: () => mockRelease(),
}));
import { GET as readNotes, POST as createNote } from '../notes/route';
import * as noteItem from '../notes/[id]/route';
import { GET as readAttention, POST as createAttention } from '../attention/route';
import * as attentionItem from '../attention/[id]/route';
import {
  MEMBER_NATIVE_SCHEMA_READY_SQL, MEMBER_NOTES_CREATE_SQL, MEMBER_NOTES_READ_SQL,
  MEMBER_NOTES_UPDATE_SQL, MEMBER_ATTENTION_READ_SQL, MEMBER_ATTENTION_POSITION_SQL,
  MEMBER_ATTENTION_CREATE_SQL, MEMBER_ATTENTION_MOVE_SQL,
} from '@/lib/ganesha/memberFieldAuthoring';

const A='11111111-1111-4111-8111-111111111111';
const B='22222222-2222-4222-8222-222222222222';
const NOTE='33333333-3333-4333-8333-333333333333';
const REF='44444444-4444-4444-8444-444444444444';
const ID='55555555-5555-4555-8555-555555555555';
const URL='https://soullab.life/api/ganesha/personal-field';
const req=(path:string,method='GET',body?:unknown)=>new NextRequest(URL+path,{
  method, ...(body!==undefined?{headers:{'content-type':'application/json'},
    body:JSON.stringify(body)}:{}),
});
const params=(id:string)=>({params:Promise.resolve({id})});
const sqlCalls=(frag:string)=>mockQuery.mock.calls.filter(([sql])=>String(sql).includes(frag));
function okSql(sql:unknown):any {
  const text=String(sql);
  if(text.includes('FROM target_table'))return {rows:[{ready:true}]};
  if(text===MEMBER_NOTES_READ_SQL)return {rows:[{id:NOTE,section:'alive',
    body:'Private A note',created_at:'2026-10-13T00:00:00Z'}]};
  if(text===MEMBER_NOTES_CREATE_SQL || text===MEMBER_NOTES_UPDATE_SQL)
    return {rows:[{id:NOTE,section:'alive',body:'Private A note',created_at:'2026-10-13T00:00:00Z'}]};
  if(text===MEMBER_ATTENTION_POSITION_SQL)return {rows:[{pos:-1}]};
  if(text===MEMBER_ATTENTION_CREATE_SQL)return {rows:[{id:ID,field:'important',
    kind:'decision',ref_id:REF,label:'Owned decision title',position:-1,
    created_at:'2026-10-13T00:00:00Z'}]};
  if(text===MEMBER_ATTENTION_MOVE_SQL)return {rows:[{id:ID,field:'attention',position:5}]};
  if(text===MEMBER_ATTENTION_READ_SQL)return {rows:[{id:ID,field:'important',kind:'decision',
    position:-1,safe_ref_id:REF,resolved:'Owned decision title',gone:false}]};
  return {rows:[]};
}
beforeEach(()=>{
  mockIndividual.mockReset();mockQuery.mockReset();mockRelease.mockReset();
  // Simulate a separately admitted non-production route for authorization
  // unit cases; real source remains HARD HOLD.
  mockRelease.mockReturnValue(true);
  mockIndividual.mockResolvedValue({
    memberId:A,legacyPersonalStatus:'none',legacyPersonalPractitionerId:null,
  });
  mockQuery.mockImplementation(async(sql)=>okSql(sql));
  jest.spyOn(console,'error').mockImplementation(()=>{});
});

describe('G2-3C personal member-authoring admission',()=>{
  it('refuses no member session before catalog or data read',async()=>{
    mockIndividual.mockResolvedValue(null);
    const response=await readNotes(req('/notes'));
    expect(response.status).toBe(401);
    expect(mockQuery).not.toHaveBeenCalled();
  });
  it('refuses ALL real member operations without accepted source release admission',async()=>{
    mockRelease.mockReturnValue(false);
    const r=await createNote(req('/notes','POST',{section:'alive',body:'not permitted'}));
    expect(r.status).toBe(503);
    expect((await r.json()).state).toBe('authorization_held');
    expect(mockQuery).not.toHaveBeenCalled();
    const reader=await readAttention(req('/attention'));
    expect(reader.status).toBe(503);
    expect(mockQuery).not.toHaveBeenCalled();
  });
  it('does not make a Personal Studio practitioner when migration is held',async()=>{
    mockQuery.mockImplementation(async(sql)=>String(sql).includes('FROM target_table')
      ? {rows:[{ready:false}]}:{rows:[]});
    const response=await createNote(req('/notes','POST',{section:'alive',body:'hi'}));
    expect(response.status).toBe(503);
    expect((await response.json()).state).toBe('migration_held');
    expect(mockQuery).toHaveBeenCalledTimes(1);
    expect(mockQuery.mock.calls[0][0]).toBe(MEMBER_NATIVE_SCHEMA_READY_SQL);
    expect(JSON.stringify(mockQuery.mock.calls)).not.toContain('INSERT INTO practitioners');
  });
  it('can read member-native notes without a practitioner-shaped identity',async()=>{
    const response=await readNotes(req('/notes?memberId='+B));
    expect(response.status).toBe(200);
    const body=await response.json();
    expect(body).toMatchObject({owner:'member',scope:'personal',
      coverage:'member_native_only',limit:25});
    expect(body.notes).toHaveLength(1);
    expect(sqlCalls('FROM field_notes')[0][1]).toEqual([A,25]);
    expect(response.headers.get('Cache-Control')).toContain('no-store');
  });
  it('persists an author-confirmed note with member-only owner parameters',async()=>{
    const response=await createNote(req('/notes','POST',{section:'alive',body:'  Private A note  '}));
    expect(response.status).toBe(201);
    expect(sqlCalls('INSERT INTO field_notes')[0][1]).toEqual([A,'alive','Private A note']);
    const sql=String(sqlCalls('INSERT INTO field_notes')[0][0]);
    expect(sql).toContain('SELECT m.id, NULL, NULL');
    expect(sql).toContain('WHERE m.id = $1::uuid');
    expect(response.headers.get('Cache-Control')).toContain('no-store');
  });
  it.each([
    {section:'alive',body:'hi',memberId:B},
    {section:'alive',body:'hi',practitionerId:B},
    {section:'alive',body:'hi',teamId:B},
    {section:'alive',body:'hi',clientId:B},
    {section:'asking',body:'hi',autoInterpret:true},
  ])('rejects unrecognized trust/scope fields before insert',async(extra)=>{
    const response=await createNote(req('/notes','POST',extra));
    expect(response.status).toBe(400);
    expect(sqlCalls('INSERT INTO field_notes')).toHaveLength(0);
  });
  it('rejects invalid section and empty content before inserting',async()=>{
    for(const body of [{section:'clinical',body:'hi'},{section:'alive',body:'  '},
      {section:'alive',body:'x'.repeat(2001)}]){
      const response=await createNote(req('/notes','POST',body));
      expect(response.status).toBe(400);
    }
    expect(sqlCalls('INSERT INTO field_notes')).toHaveLength(0);
  });
  it('edits only the verified member-owned note',async()=>{
    const r=await noteItem.PATCH(req('/notes/'+NOTE,'PATCH',{body:'Private A note'}),params(NOTE));
    expect(r.status).toBe(200);
    expect(sqlCalls('UPDATE field_notes')[0][1]).toEqual([A,NOTE,null,'Private A note']);
    expect(String(sqlCalls('UPDATE field_notes')[0][0])).toContain('personal_member_id = $1');
    expect(String(sqlCalls('UPDATE field_notes')[0][0])).toContain('practitioner_id IS NULL');
    expect(String(sqlCalls('UPDATE field_notes')[0][0])).toContain('team_id IS NULL');
  });
  it('does not edit another member note or a legacy practitioner note',async()=>{
    mockQuery.mockImplementation(async(sql)=>String(sql).includes('FROM target_table')
      ? {rows:[{ready:true}]}:{rows:[]});
    const r=await noteItem.PATCH(req('/notes/'+NOTE,'PATCH',{body:'changed'}),params(NOTE));
    expect(r.status).toBe(404);
    expect(sqlCalls('UPDATE field_notes')[0][1]?.[0]).toBe(A);
  });
  it('does not permit owner or scope mutation through note PATCH',async()=>{
    const r=await noteItem.PATCH(req('/notes/'+NOTE,'PATCH',
      {section:'asking',personal_member_id:B}),params(NOTE));
    expect(r.status).toBe(400);
    expect(sqlCalls('UPDATE field_notes')).toHaveLength(0);
  });
  it('does not offer destructive deletion until signed independent authority is approved',()=>{
    expect('DELETE' in noteItem).toBe(false);
    expect('DELETE' in attentionItem).toBe(false);
  });
  it('database errors are 503 rather than empty personal history or user-data logs',async()=>{
    mockQuery.mockRejectedValueOnce(new Error('private_note@example.invalid'));
    const r=await readNotes(req('/notes'));
    expect(r.status).toBe(503);
    const txt=JSON.stringify(await r.json());
    expect(txt).not.toContain('private_note');
    expect(txt).not.toContain('notes:[]');
    expect(r.headers.get('Cache-Control')).toContain('no-store');
  });
});

describe('G2-3C personal Attention ownership',()=>{
  it('reads owned native Attention from authenticated member context',async()=>{
    const r=await readAttention(req('/attention?practitionerId='+B));
    expect(r.status).toBe(200);
    expect((await r.json()).attention[0]).toMatchObject({
      label:'Owned decision title',refId:REF,gone:false,
    });
    expect(sqlCalls('FROM field_attention a')[0][1]).toEqual([A,25]);
  });
  it('returns neutral state after source revocation, never cached title or target UUID',async()=>{
    mockQuery.mockImplementation(async(sql)=>{
      if(String(sql).includes('FROM target_table'))return {rows:[{ready:true}]};
      if(sql===MEMBER_ATTENTION_READ_SQL)return {rows:[{
        id:ID,field:'important',kind:'change',position:1,
        safe_ref_id:null,resolved:'cached foreign data',
        gone:true,ref_id:B,label:'B confidential title',
      }]};
      return {rows:[]};
    });
    const r=await readAttention(req('/attention'));
    const json=JSON.stringify(await r.json());
    expect(json).toContain('Reference unavailable');
    expect(json).not.toContain('cached foreign');
    expect(json).not.toContain('B confidential');
    expect(json).not.toContain(B);
  });
  it('creates a personal Decision reference atomically using verified source title',async()=>{
    const r=await createAttention(req('/attention','POST',
      {field:'important',kind:'decision',refId:REF}));
    expect(r.status).toBe(201);
    const args=sqlCalls('INSERT INTO field_attention')[0][1];
    expect(args).toEqual([A,'important','decision',REF,null,-1]);
    expect(MEMBER_ATTENTION_CREATE_SQL).toContain('d.personal_member_id = $1::uuid');
    expect(MEMBER_ATTENTION_CREATE_SQL).toContain("d.decision_scope = 'personal'");
    expect(MEMBER_ATTENTION_CREATE_SQL).toContain('d.practitioner_id IS NULL');
    expect(MEMBER_ATTENTION_CREATE_SQL).toContain('c.client_id IS NULL');
    expect(MEMBER_ATTENTION_CREATE_SQL).toContain('c.practitioner_id IS NULL');
  });
  it('refuses cross-member or professional references before storing',async()=>{
    mockQuery.mockImplementation(async(sql)=>{
      if(String(sql).includes('FROM target_table'))return {rows:[{ready:true}]};
      if(sql===MEMBER_ATTENTION_POSITION_SQL)return {rows:[{pos:-1}]};
      return {rows:[]};
    });
    const r=await createAttention(req('/attention','POST',
      {field:'important',kind:'change',refId:REF}));
    expect(r.status).toBe(404);
    expect(sqlCalls('INSERT INTO field_attention')).toHaveLength(1);
  });
  it('does not accept a user-supplied title for a referenced item',async()=>{
    const r=await createAttention(req('/attention','POST',
      {field:'important',kind:'decision',refId:REF,label:'B confidential title'}));
    expect(r.status).toBe(400);
    expect(sqlCalls('INSERT INTO field_attention')).toHaveLength(0);
  });
  it('allows an authored free note with no source reference',async()=>{
    const r=await createAttention(req('/attention','POST',
      {field:'attention',kind:'note',label:'My chosen attention'}));
    expect(r.status).toBe(201);
    expect(sqlCalls('INSERT INTO field_attention')[0][1]).toEqual([
      A,'attention','note',null,'My chosen attention',-1,
    ]);
  });
  it('refuses any professional/team/client/member claim in attention POST',async()=>{
    for(const key of ['memberId','practitionerId','teamId','clientId']){
      const r=await createAttention(req('/attention','POST',
        {field:'important',kind:'note',label:'My note',[key]:B}));
      expect(r.status).toBe(400);
    }
    expect(sqlCalls('INSERT INTO field_attention')).toHaveLength(0);
  });
  it('moves only its own member-authored attention record',async()=>{
    const r=await attentionItem.PATCH(req('/attention/'+ID,'PATCH',
      {field:'attention',position:5}),params(ID));
    expect(r.status).toBe(200);
    expect(sqlCalls('UPDATE field_attention')[0][1]).toEqual([A,ID,'attention',5]);
    expect(String(sqlCalls('UPDATE field_attention')[0][0])).toContain('practitioner_id IS NULL');
    expect(String(sqlCalls('UPDATE field_attention')[0][0])).toContain('personal_member_id = $1');
  });
  it('does not reposition foreign or legacy Attention',async()=>{
    mockQuery.mockImplementation(async(sql)=>String(sql).includes('FROM target_table')
      ? {rows:[{ready:true}]}:{rows:[]});
    const r=await attentionItem.PATCH(req('/attention/'+ID,'PATCH',{position:5}),params(ID));
    expect(r.status).toBe(404);
  });
  it('refuses moving an Attention record into a team or practitioner context',async()=>{
    const r=await attentionItem.PATCH(req('/attention/'+ID,'PATCH',
      {position:5,teamId:B}),params(ID));
    expect(r.status).toBe(400);
    expect(sqlCalls('UPDATE field_attention')).toHaveLength(0);
  });
  it('does not represent an unavailable schema as an empty Attention collection',async()=>{
    mockQuery.mockResolvedValueOnce({rows:[{ready:false}]});
    const r=await readAttention(req('/attention'));
    expect(r.status).toBe(503);
    expect(sqlCalls('FROM field_attention a')).toHaveLength(0);
  });
});
