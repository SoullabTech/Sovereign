import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
const mockProfessional = jest.fn<(...args: unknown[]) => Promise<any>>();
const mockClientGet = jest.fn<(...args: unknown[]) => Promise<any>>();
const mockClientCreate = jest.fn<(...args: unknown[]) => Promise<any>>();
const mockClientStats = jest.fn<(...args: unknown[]) => Promise<any>>();
const mockSessionsGet = jest.fn<(...args: unknown[]) => Promise<any>>();
const mockSessionsCreate = jest.fn<(...args: unknown[]) => Promise<any>>();
const mockSessionStats = jest.fn<(...args: unknown[]) => Promise<any>>();
const mockUpcoming = jest.fn<(...args: unknown[]) => Promise<any>>();
const mockFollowups = jest.fn<(...args: unknown[]) => Promise<any>>();
jest.mock('@/lib/auth/requireProfessionalContext',()=>({
  requireProfessionalContext:(...a:unknown[])=>mockProfessional(...a),
}));
jest.mock('@/lib/stellium/clients',()=>({
  getClients:(...a:unknown[])=>mockClientGet(...a),
  createClient:(...a:unknown[])=>mockClientCreate(...a),
  getClientStats:(...a:unknown[])=>mockClientStats(...a),
  resolveClientDisplayName:jest.fn(()=> 'Synthetic'),
}));
jest.mock('@/lib/stellium/sessions',()=>({
  getSessions:(...a:unknown[])=>mockSessionsGet(...a),
  createSession:(...a:unknown[])=>mockSessionsCreate(...a),
  getSessionStats:(...a:unknown[])=>mockSessionStats(...a),
  getUpcomingSessions:(...a:unknown[])=>mockUpcoming(...a),
  getSessionsNeedingFollowUp:(...a:unknown[])=>mockFollowups(...a),
}));
jest.mock('@/lib/stellium/personas',()=>({
  getPersona:jest.fn(async()=>null),
  generatePersonaPrompt:jest.fn(async()=>null),
}));
jest.mock('@/lib/practitioner/tierPricing',()=>({
  getTierPricing:jest.fn(async()=>[]),
}));
jest.mock('@/lib/db/postgres',()=>({
  query:jest.fn(async()=>({rows:[]})),
}));
import { GET as dashboardGET } from '../dashboard/route';
import { GET as clientsGET, POST as clientsPOST } from '../clients/list/route';
import { GET as sessionsGET, POST as sessionsPOST } from '../sessions/list/route';
const PRACTITIONER='11111111-1111-4111-8111-111111111111';
const VICTIM='22222222-2222-4222-8222-222222222222';
const denied={ok:false,response:NextResponse.json({error:'Practitioner not found'},{status:404})};
const allowed={ok:true,context:{practitionerId:PRACTITIONER,
  memberId:'33333333-3333-4333-8333-333333333333',portalType:'generalist'}};
const req=(path:string,method='GET',body?:Record<string,unknown>)=>
  new NextRequest('https://soullab.life/api/stellium/'+path,{
    method, ...(body?{headers:{'content-type':'application/json'},body:JSON.stringify(body)}:{}),
  });
beforeEach(()=>{
  for(const m of [mockProfessional,mockClientGet,mockClientCreate,mockClientStats,
    mockSessionsGet,mockSessionsCreate,mockSessionStats,mockUpcoming,mockFollowups])m.mockReset();
  mockProfessional.mockResolvedValue(denied);
  mockClientGet.mockResolvedValue({clients:[],total:0});
  mockClientStats.mockResolvedValue({total:0,active:0});
  mockSessionsGet.mockResolvedValue({sessions:[],total:0});
  mockSessionsCreate.mockResolvedValue({id:'synthetic-session'});
});
describe('G1 legacy Stellium route refuses foreign practitioner',()=>{
  it('dashboard GET blocks before any client/stats lookup',async()=>{
    const r=await dashboardGET(req('dashboard?practitionerId='+VICTIM));
    expect(r.status).toBe(404);
    expect(mockProfessional).toHaveBeenCalledWith(expect.anything(),VICTIM);
    expect(mockClientStats).not.toHaveBeenCalled();
    expect(mockSessionsGet).not.toHaveBeenCalled();
  });
  it('client GET blocks before list',async()=>{
    const r=await clientsGET(req('clients/list?practitionerId='+VICTIM));
    expect(r.status).toBe(404);
    expect(mockClientGet).not.toHaveBeenCalled();
  });
  it('client POST blocks before create',async()=>{
    const r=await clientsPOST(req('clients/list','POST',{practitionerId:VICTIM,name:'Cross-tenant'}));
    expect(r.status).toBe(404);
    expect(mockClientCreate).not.toHaveBeenCalled();
  });
  it('session GET blocks before list/stats',async()=>{
    const r=await sessionsGET(req('sessions/list?practitionerId='+VICTIM+'&stats=true'));
    expect(r.status).toBe(404);
    expect(mockSessionStats).not.toHaveBeenCalled();
    expect(mockSessionsGet).not.toHaveBeenCalled();
  });
  it('session POST blocks before create',async()=>{
    const r=await sessionsPOST(req('sessions/list','POST',{
      practitionerId:VICTIM,client_id:'synthetic-client',session_type:'synthetic',
    }));
    expect(r.status).toBe(404);
    expect(mockSessionsCreate).not.toHaveBeenCalled();
  });
  it('matching verified owner still loads clients under server-owned ID',async()=>{
    mockProfessional.mockResolvedValue(allowed);
    const r=await clientsGET(req('clients/list?practitionerId='+PRACTITIONER));
    expect(r.status).toBe(200);
    expect(mockClientGet.mock.calls[0][0]).toBe(PRACTITIONER);
  });
});
