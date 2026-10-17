/** R61 production denial and isolated fictional two-read boundary. */
import {NextRequest} from 'next/server';

const mockRead=jest.fn();
const mockRecheck=jest.fn();
jest.mock('@/lib/writersStudio/recovery/heldRealSessionWorkAdmissionR56',()=>({
  R56_REAL_PROTECTED_WRITER_ENABLED:false,
  readHeldRealSessionWorkR56:(...a:unknown[])=>mockRead(...a),
  recheckHeldRealSessionWorkR56:(...a:unknown[])=>mockRecheck(...a),
}));
import {inspectHeldFictionalAuthorPostR61,R61_REAL_AUTHOR_POST_ENABLED}
 from '../heldNextAuthorAdmissionR61';

const MANUSCRIPT='33333333-3333-4333-8333-333333333331';
const LIVING='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const TOKEN='fictional-opaque-cookie-never-disclose';
const shape={
  kind:'held_author_preflight',manuscriptId:MANUSCRIPT,
  selectedLivingWorkId:LIVING,
};
const affected=[
  'R61_HELD_AUTHOR_POST_FIXTURE','R56_REAL_SESSION_WORK_FIXTURE',
  'WRITERS_STUDIO_RESTRICTED_BETA','DATABASE_URL','FILE_STORAGE_PATH',
  'NODE_ENV',
] as const;
const original=Object.fromEntries(affected.map(k=>[k,process.env[k]]));
function fiction(){
  process.env.R61_HELD_AUTHOR_POST_FIXTURE='fictional-only';
  process.env.R56_REAL_SESSION_WORK_FIXTURE='fictional-only';
  process.env.WRITERS_STUDIO_RESTRICTED_BETA='true';
  process.env.DATABASE_URL='postgresql://fict@127.0.0.1:39211/r35_draft';
  process.env.FILE_STORAGE_PATH='/private/tmp/ws-r35-physical-r57-fixture/vault';
  Reflect.set(process.env,'NODE_ENV','test');
}
function makePost(body:unknown=shape,
  extra:Record<string,string>={}):NextRequest{
  const json=JSON.stringify(body);
  return new NextRequest(
    'https://soullab.life/api/writers-studio/held-author-admission',{
      method:'POST',
      headers:{
        host:'soullab.life',origin:'https://soullab.life',
        'sec-fetch-site':'same-origin','content-type':'application/json',
        'x-ws-author-intent':'review',cookie:'maia_session='+TOKEN,
        'content-length':String(Buffer.byteLength(json,'utf8')),
        ...extra,
      },
      body:json,
    });
}
const witness=Object.freeze({kind:'held_private_session_and_work_witness',
  memberId:'11111111-1111-4111-8111-111111111111',
  protectedDraftManuscriptId:MANUSCRIPT,declaredLivingWorkId:LIVING,
  currentDraftGeneration:1,consentSequence:1,
  noticeSHA256:'f'.repeat(64),intent:'review',
  writerAuthorized:false,releaseApproved:false,
});
async function inspect(request:NextRequest){
  const response=await inspectHeldFictionalAuthorPostR61(request);
  const text=await response.text();
  expect(response.status).toBe(423);
  expect(response.headers.get('cache-control')).toContain('no-store');
  expect(text).not.toContain(TOKEN);
  expect(text).not.toContain(MANUSCRIPT);
  expect(text).not.toContain(LIVING);
  expect(text).not.toContain(witness.memberId);
  const value=JSON.parse(text);
  expect(value).toEqual(expect.objectContaining({
    writerAuthorized:false,releaseApproved:false,
    canSave:false,canApply:false,canUndo:false,
  }));
  return value;
}
beforeEach(()=>{
  mockRead.mockReset();mockRecheck.mockReset();
  mockRead.mockResolvedValue(witness);
  mockRecheck.mockResolvedValue(witness);
});
afterEach(()=>{
  for(const k of affected){
    const v=original[k];if(v===undefined)Reflect.deleteProperty(process.env,k);
    else Reflect.set(process.env,k,v);
  }
});
describe('R61 HELD Next author POST',()=>{
  it('has a literal real-member action flag compiled OFF',()=>{
    expect(R61_REAL_AUTHOR_POST_ENABLED).toBe(false);
  });
  it('fails closed by default before reading session or private data',async()=>{
    const r=await inspect(makePost());
    expect(r.kind).toBe('unavailable');
    expect(mockRead).not.toHaveBeenCalled();
    expect(mockRecheck).not.toHaveBeenCalled();
  });
  it('fictionally rechecks exact session, consent, manuscript and Living Work',async()=>{
    fiction();
    const req=makePost();
    const r=await inspect(req);
    expect(r.kind).toBe('fictional_scope_rechecked_no_author_action');
    expect(mockRead).toHaveBeenCalledTimes(1);
    expect(mockRead).toHaveBeenCalledWith({
      request:req,manuscriptId:MANUSCRIPT,
      selectedLivingWorkId:LIVING,intent:'review',
    });
    expect(mockRecheck).toHaveBeenCalledTimes(1);
    expect(mockRecheck).toHaveBeenCalledWith(witness,req);
  });
  it('production rejects even if every fictional flag is present',async()=>{
    fiction();Reflect.set(process.env,'NODE_ENV','production');
    expect((await inspect(makePost())).kind).toBe('unavailable');
    expect(mockRead).not.toHaveBeenCalled();
  });
  it('refuses when one fixture condition is missing',async()=>{
    fiction();delete process.env.R56_REAL_SESSION_WORK_FIXTURE;
    expect((await inspect(makePost())).kind).toBe('unavailable');
    expect(mockRead).not.toHaveBeenCalled();
  });
  it('Apply and Undo never enter this read-only path',async()=>{
    fiction();
    for(const action of ['apply','undo','review-undo','save']){
      expect((await inspect(makePost(shape,{
        'x-ws-author-intent':action,
      }))).kind).toBe('unavailable');
    }
    expect(mockRead).not.toHaveBeenCalled();
  });
  it('refuses private content, claimant identities, wrong ID and bad length',async()=>{
    fiction();
    const candidates=[
      makePost({...shape,replacementProse:'malicious'}),
      makePost({...shape,memberId:witness.memberId}),
      makePost({...shape,manuscriptId:'bad'}),
      makePost(shape,{'content-length':'999'}),
      makePost(shape,{'content-length':'1'}),
      makePost({...shape,padding:'x'.repeat(600)}),
      makePost(shape,{'content-type':'text/plain'}),
    ];
    for(const req of candidates)
      expect((await inspect(req)).kind).toBe('unavailable');
    expect(mockRead).not.toHaveBeenCalled();
  });
  it('session failure and revoked second check both refuse',async()=>{
    fiction();
    mockRead.mockResolvedValueOnce({kind:'held_refused'});
    expect((await inspect(makePost())).kind).toBe('unavailable');
    expect(mockRecheck).not.toHaveBeenCalled();
    mockRecheck.mockResolvedValueOnce({kind:'held_refused'});
    expect((await inspect(makePost())).kind).toBe('unavailable');
    expect(mockRecheck).toHaveBeenCalledTimes(1);
  });
  it('all non-POST methods are held without method escalation',async()=>{
    fiction();
    for(const method of ['GET','PUT','PATCH','DELETE']){
      const req=new NextRequest(
        'https://soullab.life/api/writers-studio/held-author-admission',
        {method});
      const r=await inspectHeldFictionalAuthorPostR61(req);
      expect(r.status).toBe(423);
      expect((await r.json()).releaseApproved).toBe(false);
    }
    expect(mockRead).not.toHaveBeenCalled();
  });
});
