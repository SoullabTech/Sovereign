/** R77: owner, transcript, privacy and consent must precede report material. */
const mockOwned=jest.fn(),mockTurns=jest.fn(),mockQuery=jest.fn();
jest.mock('@/lib/scribe/scribeAuth',()=>({
 verifySessionOwnership:(...a:unknown[])=>mockOwned(...a),
 isValidUUID:(id:string)=>/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id),
}));
jest.mock('@/lib/scribe/sessionReviewMode',()=>({
 loadReviewTurns:(...a:unknown[])=>mockTurns(...a),
}));
jest.mock('@/lib/db/postgres',()=>({
 query:(...a:unknown[])=>mockQuery(...a),
}));
import {loadOwnedScribeReportR77} from '../ownedReportDataR77';

const ID='11111111-1111-4111-8111-111111111111';
const OWNER='22222222-2222-4222-8222-222222222222';
const start=new Date('2026-10-17T13:00:00.000Z');
const session={
 id:ID,member_id:OWNER,container:'practitioner',started_at:start,
 ended_at:new Date('2026-10-17T13:37:00.000Z'),is_active:false,
 consent_status:'confirmed',transcript_enabled:true,memory_policy:'learning',
};
beforeEach(()=>{
 mockOwned.mockReset();mockTurns.mockReset();mockQuery.mockReset();
 mockOwned.mockResolvedValue(session);
 mockTurns.mockResolvedValue({
  session:{id:ID},
  turns:[{speaker:'Practitioner',text:'An invented therapeutic conversation.',
   startMs:1200},{speaker:'Client',text:'A different fictional answer.',startMs:2200}],
 });
 mockQuery.mockResolvedValue({rows:[{
  marker_type:'turning_point',note:'Invented marker',
  marked_at:new Date('2026-10-17T13:02:00.000Z'),
 }]});
});

describe('R77 owned clinician export input',()=>{
 it('rejects malformed sessions without probing existence',async()=>{
  expect(await loadOwnedScribeReportR77('not-a-uuid',OWNER)).toMatchObject({
   ok:false,status:404,
  });
  expect(mockOwned).not.toHaveBeenCalled();
  expect(mockQuery).not.toHaveBeenCalled();
 });
 it('denies other members before any transcript is loaded',async()=>{
  mockOwned.mockResolvedValue(null);
  expect(await loadOwnedScribeReportR77(ID,OWNER)).toMatchObject({
   ok:false,status:404,
  });
  expect(mockTurns).not.toHaveBeenCalled();
  expect(mockQuery).not.toHaveBeenCalled();
 });
 it.each(['pending','declined'])(
  'refuses %s consent before transcript reading',async consent=>{
   mockOwned.mockResolvedValue({...session,consent_status:consent});
   expect(await loadOwnedScribeReportR77(ID,OWNER)).toMatchObject({
    ok:false,status:403,reason:'consent_required',
   });
   expect(mockTurns).not.toHaveBeenCalled();
  }
 );
 it('refuses transcription-disabled sessions even if an old row survived',async()=>{
  mockOwned.mockResolvedValue({...session,transcript_enabled:false});
  expect(await loadOwnedScribeReportR77(ID,OWNER)).toMatchObject({
   ok:false,status:403,reason:'transcript_not_enabled',
  });
  expect(mockTurns).not.toHaveBeenCalled();
 });
 it('refuses sealed sessions because local-provider force permits cloud fallback',async()=>{
  mockOwned.mockResolvedValue({...session,memory_policy:'sealed'});
  expect(await loadOwnedScribeReportR77(ID,OWNER)).toMatchObject({
   ok:false,status:403,reason:'sealed_session_external_model_unavailable',
  });
  expect(mockTurns).not.toHaveBeenCalled();
 });
 it('loads the real transcript and individually owned marker rows',async()=>{
  const result=await loadOwnedScribeReportR77(ID,OWNER);
  expect(result.ok).toBe(true);
  if(!result.ok)throw Error('R77_EXPECTED_OWNED_INPUT');
  expect(result.data).toMatchObject({
   sessionId:ID,container:'practitioner',
   duration:37,sessionClosed:true,segmentCount:2,
  });
  expect(result.data.transcript[0]).toMatchObject({
   speaker:'Practitioner',startMs:1200,
  });
  expect(result.data.markers[0]).toMatchObject({
   markerType:'turning_point',note:'Invented marker',
   tsMs:new Date('2026-10-17T13:02:00.000Z').getTime(),
  });
  expect(mockOwned).toHaveBeenCalledTimes(2);
  expect(mockTurns).toHaveBeenCalledWith(ID);
  const sql=String(mockQuery.mock.calls[0][0]);
  expect(sql).toContain('s.member_id=$2');
  expect(sql).toContain("s.consent_status='confirmed'");
  expect(mockQuery.mock.calls[0][1]).toEqual([ID,OWNER]);
 });
 it('refuses if the session is revoked before any report generation',async()=>{
  mockOwned.mockResolvedValueOnce(session).mockResolvedValueOnce({
   ...session,consent_status:'declined',
  });
  expect(await loadOwnedScribeReportR77(ID,OWNER)).toMatchObject({
   ok:false,status:403,reason:'consent_or_session_changed',
  });
 });
 it('refuses if policy moves to sealed while reading transcript',async()=>{
  mockOwned.mockResolvedValueOnce(session).mockResolvedValueOnce({
   ...session,memory_policy:'sealed',
  });
  expect(await loadOwnedScribeReportR77(ID,OWNER)).toMatchObject({
   ok:false,status:403,
  });
 });
 it('never synthesizes an empty session as if there were transcript evidence',async()=>{
  mockTurns.mockResolvedValueOnce({session:{id:ID},turns:[]});
  expect(await loadOwnedScribeReportR77(ID,OWNER)).toMatchObject({
   ok:false,status:422,reason:'no_transcript_material',
  });
 });
 it('refuses mismatched returned session identity',async()=>{
  mockTurns.mockResolvedValueOnce({
   session:{id:'33333333-3333-4333-8333-333333333333'},turns:[],
  });
  expect(await loadOwnedScribeReportR77(ID,OWNER)).toMatchObject({
   ok:false,status:404,
  });
 });
});
