/**
 * R91 Studio files fail-closed privacy contract.
 * All identities, workspaces and database rows are fictional.
 * No filesystem, original files, Postgres, or real authentication are touched.
 */
import {NextRequest} from 'next/server';

const MEMBER='11111111-1111-4111-8111-111111111111';
const PRACTITIONER='22222222-2222-4222-8222-222222222222';
const TEAM='33333333-3333-4333-8333-333333333333';
const FILE='44444444-4444-4444-8444-444444444444';
const mockMember=jest.fn();
const mockPractitioner=jest.fn();
const mockCanActInTeam=jest.fn();
const mockQuery=jest.fn();

jest.mock('@/lib/auth/getMemberFromRequest',()=>({
 getMemberIdFromRequest:(...args:unknown[])=>mockMember(...args),
}));
jest.mock('@/lib/studio/getPractitionerIdForMember',()=>({
 getPractitionerIdForMember:(...args:unknown[])=>mockPractitioner(...args),
}));
jest.mock('@/lib/team/colabTeams',()=>({
 COLAB_TEAM_COOKIE:'soullab_colab_team',
 resolveCurrentTeamId:jest.fn(async()=>TEAM),
 canActInTeam:(...args:unknown[])=>mockCanActInTeam(...args),
}));
jest.mock('next/headers',()=>({
 cookies:jest.fn(async()=>({get:()=>undefined})),
}));
jest.mock('@/lib/db/postgres',()=>({
 __esModule:true,
 default:{query:(...args:unknown[])=>mockQuery(...args)},
}));
import {DELETE} from '@/app/api/studio/files/route';
import {PATCH} from '@/app/api/studio/files/[fileId]/route';

const req=(method:string,query='',body?:unknown)=>{
 const target='http://127.0.0.1/api/studio/files'+query;
 return new NextRequest(target,{
  method,
  ...(body===undefined?{}:{
   headers:{'content-type':'application/json'},
   body:JSON.stringify(body),
  }),
 });
};
const file=()=>({
 id:FILE, practitioner_id:PRACTITIONER,
 name:'fictional.txt',original_name:'fictional.txt',
 mime_type:'text/plain',size_bytes:'23',folder_path:[],
 file_type:'document',file_scope:'personal',team_id:null,
 description:null,tags:[],encrypted:false,status:'active',
 updated_at:'2026-10-17',created_at:'2026-10-17',
});
const edit=(body:unknown)=>PATCH(req('PATCH','',body),{
 params:Promise.resolve({fileId:FILE}),
});
beforeEach(()=>{
 jest.resetAllMocks();
 mockMember.mockResolvedValue(MEMBER);
 mockPractitioner.mockResolvedValue(PRACTITIONER);
 mockCanActInTeam.mockResolvedValue(false);
 mockQuery.mockResolvedValue({rows:[file()]});
});

describe('R91 practitioner Studio original-file integrity (fictional)',()=>{
 it('denies permanent deletion before any SQL write or storage action',async()=>{
  const res=await DELETE(req('DELETE',`?id=${FILE}&permanent=true`));
  expect(res.status).toBe(503);
  expect(res.headers.get('cache-control')).toContain('no-store');
  expect(await res.json()).toEqual({
   success:false,error:'Permanent file erasure is not available',
  });
  expect(mockQuery).not.toHaveBeenCalled();
 });
 it('ordinary soft delete remains, with no false byte-erasure claim',async()=>{
  const res=await DELETE(req('DELETE',`?id=${FILE}`));
  expect(res.status).toBe(200);
  expect(await res.json()).toEqual({
   success:true,deletionMode:'soft',originalBytesDestroyed:false,
  });
  expect(mockQuery).toHaveBeenCalledTimes(1);
  const [sql,args]=mockQuery.mock.calls[0];
  expect(sql).toContain("status = 'deleted'");
  expect(sql).not.toContain('DELETE FROM');
  expect(args).toEqual([FILE,PRACTITIONER]);
 });
 it('unauthenticated DELETE refuses before practitioner or SQL lookup',async()=>{
  mockMember.mockResolvedValue(null);
  const res=await DELETE(req('DELETE',`?id=${FILE}&permanent=true`));
  expect(res.status).toBe(401);
  expect(mockPractitioner).not.toHaveBeenCalled();
  expect(mockQuery).not.toHaveBeenCalled();
 });
 it('foreign member without active practitioner refuses',async()=>{
  mockPractitioner.mockResolvedValue(null);
  const res=await DELETE(req('DELETE',`?id=${FILE}`));
  expect(res.status).toBe(404);
  expect(mockQuery).not.toHaveBeenCalled();
 });
 it('forged Co-Lab scope cannot change sharing visibility or execute SQL',async()=>{
  const res=await edit({fileScope:'colab',teamId:TEAM});
  expect(res.status).toBe(403);
  expect(mockCanActInTeam).toHaveBeenCalledWith(MEMBER,TEAM);
  expect(mockQuery).not.toHaveBeenCalled();
 });
 it('allowed Co-Lab membership scopes the exact team through verified role',async()=>{
  mockCanActInTeam.mockResolvedValue(true);
  const res=await edit({fileScope:'colab',teamId:TEAM,name:'harmless.txt'});
  expect(res.status).toBe(200);
  const [sql,args]=mockQuery.mock.calls[0];
  expect(sql).toContain("status <> 'deleted'");
  expect(sql).toContain('team_id = $');
  expect(sql).toContain('file_scope = $');
  expect(sql).toContain('client_id = NULL');
  expect(args).toEqual([FILE,PRACTITIONER,'harmless.txt','colab',TEAM]);
  expect(mockCanActInTeam).toHaveBeenCalledTimes(1);
 });
 it('a bare teamId cannot switch scope silently',async()=>{
  const res=await edit({name:'harmless.txt',teamId:TEAM});
  expect(res.status).toBe(400);
  expect(mockQuery).not.toHaveBeenCalled();
 });
 it('personal scope rejects a leftover forged team id',async()=>{
  const res=await edit({fileScope:'personal',teamId:TEAM});
  expect(res.status).toBe(400);
  expect(mockQuery).not.toHaveBeenCalled();
 });
 it('personal scope clears stale Co-Lab and client/encounter identifiers',async()=>{
  const res=await edit({fileScope:'personal'});
  expect(res.status).toBe(200);
  const [sql,args]=mockQuery.mock.calls[0];
  expect(sql).toContain('team_id = NULL');
  expect(sql).toContain('client_id = NULL');
  expect(sql).toContain('encounter_id = NULL');
  expect(args).toEqual([FILE,PRACTITIONER,'personal']);
 });
 it('client/encounter scope changes fail closed without separate ownership evidence',async()=>{
  for(const scope of ['client','encounter']){
   expect((await edit({fileScope:scope,teamId:TEAM})).status).toBe(400);
  }
  expect(mockCanActInTeam).not.toHaveBeenCalled();
  expect(mockQuery).not.toHaveBeenCalled();
 });
 it('metadata changes cannot write deleted status or revive a soft-deleted row',async()=>{
  expect((await edit({status:'deleted'})).status).toBe(400);
  expect(mockQuery).not.toHaveBeenCalled();
  mockQuery.mockResolvedValueOnce({rows:[]});
  expect((await edit({status:'active'})).status).toBe(404);
  expect(mockQuery.mock.calls[0][0]).toContain("status <> 'deleted'");
 });
 it('unrecognized status and malformed JSON are refused before SQL',async()=>{
  expect((await edit({status:'permanently-deleted'})).status).toBe(400);
  expect((await edit(null)).status).toBe(400);
  expect((await edit([])).status).toBe(400);
  expect(mockQuery).not.toHaveBeenCalled();
 });
 it('an unauthenticated PATCH cannot change scope',async()=>{
  mockMember.mockResolvedValue(null);
  expect((await edit({fileScope:'colab',teamId:TEAM})).status).toBe(401);
  expect(mockCanActInTeam).not.toHaveBeenCalled();
  expect(mockQuery).not.toHaveBeenCalled();
 });
 it('team role lookup failure cannot grant a scope change',async()=>{
  mockCanActInTeam.mockRejectedValueOnce(Error('fictional role lookup error'));
  expect((await edit({fileScope:'colab',teamId:TEAM})).status).toBe(500);
  expect(mockQuery).not.toHaveBeenCalled();
 });
});
