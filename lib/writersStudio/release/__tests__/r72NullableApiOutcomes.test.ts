/**
 * R72: observed no-data cases and authorization must preserve the existing
 * fail-closed API behavior. No real database, member, provider or backup calls.
 */
import {NextRequest} from 'next/server';

const mockMember=jest.fn();
const mockQueryOne=jest.fn();
const mockQuery=jest.fn();
const mockPractitioner=jest.fn();
const mockAdmin=jest.fn();

jest.mock('@/lib/db/postgres',()=>({
 __esModule:true,
 default:{queryOne:(...args:unknown[])=>mockQueryOne(...args),
          query:(...args:unknown[])=>mockQuery(...args)},
 query:(...args:unknown[])=>mockQuery(...args),
}));
jest.mock('@/lib/auth/getMemberFromRequest',()=>({
 getMemberIdFromRequest:(...args:unknown[])=>mockMember(...args),
}));
jest.mock('@/lib/studio/getPractitionerIdForMember',()=>({
 getPractitionerIdForMember:(...args:unknown[])=>mockPractitioner(...args),
}));
jest.mock('@/lib/admin/requireAdmin',()=>({
 isAdminRequest:(...args:unknown[])=>mockAdmin(...args),
}));
jest.mock('@/lib/maia/thresholdContext',()=>({
 THRESHOLD_WEEK_META:{},THRESHOLD_WEEKS_ORDERED:[],
 getNextThresholdWeek:jest.fn(),
}));

import {GET as thresholdGET}
 from '@/app/api/studio/threshold/route';
import {GET as briefingGET}
 from '@/app/api/studio/sessions/[sessionId]/briefing/route';
import {POST as reportPOST}
 from '@/app/api/spiralogic-report/[reportId]/download/route';
import {GET as telemetryGET,POST as telemetryPOST}
 from '@/app/api/admin/command-center/field-engines/route';

const url=(name:string)=>new NextRequest('https://soullab.life/api/'+name);
beforeEach(()=>{
 mockMember.mockReset();mockQueryOne.mockReset();mockQuery.mockReset();
 mockPractitioner.mockReset();mockAdmin.mockReset();
 delete process.env.CAPACITOR_BUILD;
});

describe('R72 member-scoped optional observations',()=>{
 it('Threshold denies missing member before querying any passage',async()=>{
  mockMember.mockResolvedValue(null);
  const r=await thresholdGET(url('studio/threshold'));
  expect(r.status).toBe(401);
  expect(mockQueryOne).not.toHaveBeenCalled();
 });
 it('Threshold returns no passage without manufacturing a next Circle',async()=>{
  mockMember.mockResolvedValue('11111111-1111-4111-8111-111111111111');
  mockQueryOne.mockResolvedValueOnce(null);
  const r=await thresholdGET(url('studio/threshold'));
  expect(r.status).toBe(200);
  expect(await r.json()).toMatchObject({passage:null});
  expect(mockQueryOne).toHaveBeenCalledTimes(1);
 });
 it('Threshold includes the actual linked future Circle, not a null placeholder',async()=>{
  mockMember.mockResolvedValue('11111111-1111-4111-8111-111111111111');
  mockQueryOne
   .mockResolvedValueOnce({
     id:'22222222-2222-4222-8222-222222222222',
     current_week:'week_0',cohort_group_id:'33333333-3333-4333-8333-333333333333',
     reflections:{},accountability_statement:null,consent_given_at:null,
     completed_at:null,withdrew_at:null,started_at:null,
   })
   .mockResolvedValueOnce({
     id:'44444444-4444-4444-8444-444444444444',
     title:'Test Circle',scheduled_start:'2026-11-01T12:00:00Z',
     scheduled_end:'2026-11-01T13:00:00Z',location_type:'online',
     location_details:null,session_number:2,
   });
  const r=await thresholdGET(url('studio/threshold'));
  const body=await r.json();
  expect(r.status).toBe(200);
  expect(body.nextCircle).toMatchObject({
   title:'Test Circle',sessionNumber:2,locationType:'online',
  });
  expect(mockQueryOne).toHaveBeenCalledTimes(2);
 });
 it('Leadership briefing denies missing member before any session lookup',async()=>{
  mockMember.mockResolvedValue(null);
  const r=await briefingGET(url('studio/sessions/x/briefing'),{
   params:Promise.resolve({sessionId:'untrusted'}),
  });
  expect(r.status).toBe(401);
  expect(mockPractitioner).not.toHaveBeenCalled();
  expect(mockQuery).not.toHaveBeenCalled();
 });
 it('Spiralogic report refuses empty ownership-scoped lookup without generating PDF',async()=>{
  mockMember.mockResolvedValue('11111111-1111-4111-8111-111111111111');
  mockQuery.mockResolvedValueOnce({rows:[]});
  const r=await reportPOST(new NextRequest(
   'https://soullab.life/api/spiralogic-report/x/download',
   {method:'POST'}),
   {params:{reportId:'44444444-4444-4444-8444-444444444444'}});
  expect(r.status).toBe(404);
  expect(await r.json()).toMatchObject({error:'Report not found'});
  expect(mockQuery).toHaveBeenCalledTimes(1);
 });
 it('Both field telemetry methods refuse a nonadministrator before SQL',async()=>{
  mockAdmin.mockReturnValue(false);
  const g=await telemetryGET(url('admin/command-center/field-engines'));
  const p=await telemetryPOST(new NextRequest(
   'https://soullab.life/api/admin/command-center/field-engines',
   {method:'POST'}));
  expect(g.status).toBe(401);
  expect(p.status).toBe(401);
  expect(mockQuery).not.toHaveBeenCalled();
 });
});
