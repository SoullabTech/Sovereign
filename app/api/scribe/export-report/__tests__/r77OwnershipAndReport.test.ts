/** R77 route must not deliver session text to a model before owner consent. */
import {NextRequest} from 'next/server';
const mockMember=jest.fn(),mockLoad=jest.fn(),mockGenerate=jest.fn();
jest.mock('@/lib/auth/getMemberFromRequest',()=>({
 getMemberIdFromRequest:(...a:unknown[])=>mockMember(...a),
}));
jest.mock('@/lib/scribe/ownedReportDataR77',()=>({
 loadOwnedScribeReportR77:(...a:unknown[])=>mockLoad(...a),
}));
jest.mock('@/lib/consciousness/LLMProvider',()=>({
 getLLMProvider:()=>({generateSimple:(...a:unknown[])=>mockGenerate(...a)}),
}));
import {POST} from '../route';

const member='11111111-1111-4111-8111-111111111111';
const session='22222222-2222-4222-8222-222222222222';
const request=(body:unknown)=>new NextRequest(
 'https://soullab.life/api/scribe/export-report',{
  method:'POST',headers:{'content-type':'application/json'},
  body:JSON.stringify(body),
 });
const owned={
 ok:true as const,
 data:{
  sessionId:session,
  startTime:new Date('2026-10-17T13:00:00Z'),
  endTime:new Date('2026-10-17T13:37:00Z'),
  duration:37,container:'practitioner',sessionClosed:true,
  segmentCount:2,
  transcript:[
   {speaker:'Practitioner',text:'We can explore the invented topic.',startMs:0,endMs:0},
   {speaker:'Client',text:'That sounds like a fictional next step.',startMs:1200,endMs:1200},
  ],
  markers:[{markerType:'turning_point',note:'Fictional sign',tsMs:
   new Date('2026-10-17T13:02:00Z').getTime()}],
 },
};
beforeEach(()=>{
 mockMember.mockReset();mockLoad.mockReset();mockGenerate.mockReset();
 mockMember.mockResolvedValue(member);
 mockLoad.mockResolvedValue(owned);
 mockGenerate.mockResolvedValue({
  text:'## Fictional session report',provider:'ollama',model:'qwen2.5:7b',
  metadata:{tokenCount:100},
 });
});
describe('R77 owned session report endpoint, zero real provider calls',()=>{
 it('does not load a report for a missing authenticated member',async()=>{
  mockMember.mockResolvedValue(null);
  const r=await POST(request({sessionId:session}));
  expect(r.status).toBe(401);
  expect(mockLoad).not.toHaveBeenCalled();
  expect(mockGenerate).not.toHaveBeenCalled();
 });
 it('does not deliver another member session to the model',async()=>{
  mockLoad.mockResolvedValue({ok:false,status:404,reason:'not_found'});
  const r=await POST(request({sessionId:session}));
  expect(r.status).toBe(404);
  expect(await r.json()).toMatchObject({error:'Not found'});
  expect(mockGenerate).not.toHaveBeenCalled();
 });
 it('blocks sealed or unconsented sessions before any model invocation',async()=>{
  mockLoad.mockResolvedValue({ok:false,status:403,reason:'sealed_session_external_model_unavailable'});
  const r=await POST(request({sessionId:session}));
  expect(r.status).toBe(403);
  expect(r.headers.get('cache-control')).toContain('no-store');
  expect(mockGenerate).not.toHaveBeenCalled();
 });
 it('does not fabricate a report with no transcript evidence',async()=>{
  mockLoad.mockResolvedValue({ok:false,status:422,reason:'no_transcript_material'});
  const r=await POST(request({sessionId:session}));
  expect(r.status).toBe(422);
  expect(mockGenerate).not.toHaveBeenCalled();
 });
 it('validates lens/format before touching session data',async()=>{
  for(const body of [
   {sessionId:session,lens:'unexpected'}, {sessionId:session,format:'pdf'},
   {sessionId:123},[],null,
  ]){
   const r=await POST(request(body));
   expect(r.status).toBe(400);
  }
  expect(mockLoad).not.toHaveBeenCalled();
  expect(mockGenerate).not.toHaveBeenCalled();
 });
 it('generates a private JSON report from the owned actual transcript and markers',async()=>{
  const r=await POST(request({sessionId:session,lens:'core',format:'json'}));
  expect(r.status).toBe(200);
  expect(r.headers.get('cache-control')).toContain('no-store');
  const body=await r.json();
  expect(body).toMatchObject({
   success:true,sessionId:session,
   report:'## Fictional session report',
   meta:{segmentCount:2,container:'practitioner',sessionClosed:true,markerCount:1},
  });
  expect(mockLoad).toHaveBeenCalledWith(session,member);
  expect(mockGenerate).toHaveBeenCalledTimes(1);
  const input=mockGenerate.mock.calls[0][0];
  expect(input.messages[0].content).toContain('Fictional sign');
  expect(input.messages[0].content).toContain('We can explore');
 });
 it('streams generated markdown privately without an accidental public cache',async()=>{
  const r=await POST(request({sessionId:session,lens:'full',format:'markdown'}));
  expect(r.status).toBe(200);
  expect(r.headers.get('content-type')).toContain('text/markdown');
  expect(r.headers.get('cache-control')).toContain('no-store');
  expect((await r.text())).toContain('## Fictional session report');
 });
 it('never returns provider exceptions or transcript text as a 500 response',async()=>{
  mockGenerate.mockRejectedValue(new Error('synthetic confidential transcript secret'));
  const r=await POST(request({sessionId:session}));
  expect(r.status).toBe(500);
  expect(r.headers.get('cache-control')).toContain('no-store');
  expect(JSON.stringify(await r.json())).not.toContain('secret');
 });
});
