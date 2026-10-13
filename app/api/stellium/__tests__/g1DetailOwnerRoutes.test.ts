import { beforeEach,describe,expect,it,jest } from '@jest/globals';
import { NextRequest,NextResponse } from 'next/server';
const mockProfessional=jest.fn<(...a:unknown[])=>Promise<any>>();
const mockReadClient=jest.fn<(...a:unknown[])=>Promise<any>>();
const mockUpdateClient=jest.fn<(...a:unknown[])=>Promise<any>>();
const mockDeleteClient=jest.fn<(...a:unknown[])=>Promise<any>>();
const mockArchiveClient=jest.fn<(...a:unknown[])=>Promise<any>>();
const mockClientTimeline=jest.fn<(...a:unknown[])=>Promise<any>>();
const mockBirth=jest.fn<(...a:unknown[])=>Promise<any>>();
const mockGetSession=jest.fn<(...a:unknown[])=>Promise<any>>();
const mockUpdateSession=jest.fn<(...a:unknown[])=>Promise<any>>();
const mockCancelSession=jest.fn<(...a:unknown[])=>Promise<any>>();
const mockPrep=jest.fn<(...a:unknown[])=>Promise<any>>();
const mockContext=jest.fn<(...a:unknown[])=>Promise<any>>();
const mockFollowup=jest.fn<(...a:unknown[])=>Promise<any>>();
const mockJourney=jest.fn<(...a:unknown[])=>Promise<any>>();
jest.mock('@/lib/auth/requireProfessionalContext',()=>({
  requireProfessionalContext:(...a:unknown[])=>mockProfessional(...a),
}));
jest.mock('@/lib/stellium/clients',()=>({
  getClient:(...a:unknown[])=>mockReadClient(...a),
  updateClient:(...a:unknown[])=>mockUpdateClient(...a),
  archiveClient:(...a:unknown[])=>mockArchiveClient(...a),
  deleteClient:(...a:unknown[])=>mockDeleteClient(...a),
  getClientTimeline:(...a:unknown[])=>mockClientTimeline(...a),
  updateClientBirthData:(...a:unknown[])=>mockBirth(...a),
}));
jest.mock('@/lib/stellium/sessions',()=>({
  getSession:(...a:unknown[])=>mockGetSession(...a),
  updateSession:(...a:unknown[])=>mockUpdateSession(...a),
  cancelSession:(...a:unknown[])=>mockCancelSession(...a),
  storeMaiaPrep:(...a:unknown[])=>mockPrep(...a),
  getSessionContext:(...a:unknown[])=>mockContext(...a),
  markFollowUpSent:(...a:unknown[])=>mockFollowup(...a),
  getClientJourney:(...a:unknown[])=>mockJourney(...a),
}));
import { GET as getClient, PUT as putClient, DELETE as deleteClient } from '../clients/[id]/route';
import { GET as getSession, PUT as putSession, DELETE as deleteSession } from '../sessions/[id]/route';
const OWNER='11111111-1111-4111-8111-111111111111';
const FOREIGN='22222222-2222-4222-8222-222222222222';
const PARAMS={params:Promise.resolve({id:'33333333-3333-4333-8333-333333333333'})};
const req=(type:'clients'|'sessions',method:string,body?:Record<string,unknown>)=>
new NextRequest('https://soullab.life/api/stellium/'+type+'/33333333-3333-4333-8333-333333333333?practitionerId='+FOREIGN,{
  method,...(body?{headers:{'content-type':'application/json'},body:JSON.stringify(body)}:{}),
});
const allBackends=[mockReadClient,mockUpdateClient,mockDeleteClient,mockArchiveClient,mockClientTimeline,
  mockBirth,mockGetSession,mockUpdateSession,mockCancelSession,mockPrep,mockContext,mockFollowup,mockJourney];
beforeEach(()=>{
 mockProfessional.mockReset();
 mockProfessional.mockResolvedValue({ok:false,response:NextResponse.json({error:'Practitioner not found'},{status:404})});
 allBackends.forEach(m=>m.mockReset());
});
describe('G1 individual-client and session-detail tenant isolation',()=>{
 for(const item of [
  ['client GET',()=>getClient(req('clients','GET'),PARAMS)],
  ['client PUT',()=>putClient(req('clients','PUT',{practitionerId:FOREIGN,name:'Forged'}),PARAMS)],
  ['client DELETE',()=>deleteClient(req('clients','DELETE'),PARAMS)],
  ['session GET',()=>getSession(req('sessions','GET'),PARAMS)],
  ['session PUT',()=>putSession(req('sessions','PUT',{practitionerId:FOREIGN,maiaPrep:{}}),PARAMS)],
  ['session DELETE',()=>deleteSession(req('sessions','DELETE'),PARAMS)],
 ] as const) {
  it(item[0]+' refuses foreign practice before any data operation',async()=>{
    const r=await item[1]();
    expect(r.status).toBe(404);
    expect(mockProfessional).toHaveBeenCalled();
    for(const m of allBackends)expect(m).not.toHaveBeenCalled();
  });
 }
 it('legitimate own client calls server-owned practitioner ID',async()=>{
    mockProfessional.mockResolvedValue({ok:true,context:{memberId:'member',
      practitionerId:OWNER,portalType:'generalist'}});
    mockReadClient.mockResolvedValue({id:'client-stub',name:'Synthetic'});
    const r=await getClient(req('clients','GET'),PARAMS);
    expect(r.status).toBe(200);
    expect(mockReadClient.mock.calls[0][0]).toBe(OWNER);
 });
});
