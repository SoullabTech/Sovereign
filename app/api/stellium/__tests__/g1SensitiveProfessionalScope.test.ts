import { beforeEach,describe,expect,it,jest } from '@jest/globals';
import { NextRequest,NextResponse } from 'next/server';
const mockProfessional=jest.fn<(...a:unknown[])=>Promise<any>>();
const mockClient=jest.fn<(...a:unknown[])=>Promise<any>>();
const mockSessionContext=jest.fn<(...a:unknown[])=>Promise<any>>();
const mockPersona=jest.fn<(...a:unknown[])=>Promise<any>>();
const mockStore=jest.fn<(...a:unknown[])=>Promise<any>>();
const mockModel=jest.fn<(...a:unknown[])=>Promise<any>>();
jest.mock('@/lib/auth/requireProfessionalContext',()=>({
 requireProfessionalContext:(...a:unknown[])=>mockProfessional(...a),
}));
jest.mock('@/lib/stellium/clients',()=>({
 getClient:(...a:unknown[])=>mockClient(...a),
 resolveClientDisplayName:jest.fn(()=> 'Synthetic Client'),
}));
jest.mock('@/lib/stellium/sessions',()=>({
 getSessionContext:(...a:unknown[])=>mockSessionContext(...a),
 storeMaiaPrep:(...a:unknown[])=>mockStore(...a),
}));
jest.mock('@/lib/stellium/personas',()=>({
 getPersonaContext:(...a:unknown[])=>mockPersona(...a),
 generatePersonaPrompt:jest.fn(()=>''),
}));
jest.mock('@/lib/consciousness/LLMProvider',()=>({
 getLLMProvider:()=>({generateSimple:(...a:unknown[])=>mockModel(...a)}),
}));
jest.mock('@/lib/astrology/ephemerisCalculator',()=>({
 calculateBirthChart:jest.fn(async()=>({})),
}));
jest.mock('@/lib/astrology/transitCalculator',()=>({
 calculateCurrentTransits:jest.fn(async()=>({})), findTransitAspects:jest.fn(()=>[]),
}));
import { GET as chart } from '../chart/[clientId]/route';
import { POST as prepare } from '../maia/prepare/route';
const actor='11111111-1111-4111-8111-111111111111';
const victim='22222222-2222-4222-8222-222222222222';
const params={params:Promise.resolve({clientId:'33333333-3333-4333-8333-333333333333'})};
beforeEach(()=>{
 for(const m of [mockProfessional,mockClient,mockSessionContext,mockPersona,mockStore,mockModel])m.mockReset();
 mockProfessional.mockResolvedValue({ok:false,response:NextResponse.json({error:'Practitioner not found'},{status:404})});
 mockClient.mockResolvedValue({id:'client',birth_date:null});
});
describe('G1 sensitive charts and MAIA prep refuse foreign practitioner IDs',()=>{
 it('refuses client natal/transit chart before birth-data lookup',async()=>{
  const req=new NextRequest('https://soullab.life/api/stellium/chart/id?practitionerId='+victim+'&includeTransits=true');
  const r=await chart(req,params);
  expect(r.status).toBe(404);
  expect(mockClient).not.toHaveBeenCalled();
  expect(mockProfessional).toHaveBeenCalledWith(req,victim);
 });
 it('refuses client session prep before any client-history or LLM call',async()=>{
  const req=new NextRequest('https://soullab.life/api/stellium/maia/prepare',{
    method:'POST',headers:{'content-type':'application/json'},
    body:JSON.stringify({practitionerId:victim,sessionId:'fixture-session'}),
  });
  const r=await prepare(req);
  expect(r.status).toBe(404);
  for(const m of [mockSessionContext,mockPersona,mockStore,mockModel])
    expect(m).not.toHaveBeenCalled();
 });
 it('allows client chart only after owner context is verified',async()=>{
  mockProfessional.mockResolvedValue({ok:true,context:{practitionerId:actor,memberId:'fixture-member',portalType:'generalist'}});
  const req=new NextRequest('https://soullab.life/api/stellium/chart/id?practitionerId='+actor);
  const r=await chart(req,params);
  expect(r.status).toBe(200);
  expect(mockClient).toHaveBeenCalledWith(actor,'33333333-3333-4333-8333-333333333333');
 });
});
