import {beforeEach,describe,expect,it,jest} from '@jest/globals';
import {NextRequest} from 'next/server';

const mockIndividual=jest.fn<(...args:unknown[])=>Promise<any>>();
const mockCatalog=jest.fn<(...args:unknown[])=>Promise<boolean>>();
const mockRelease=jest.fn<()=>boolean>();
const mockOverview=jest.fn<(...args:unknown[])=>Promise<any>>();
jest.mock('@/lib/auth/individualContext',()=>({
  resolveIndividualContext:(...args:unknown[])=>mockIndividual(...args),
}));
jest.mock('@/lib/ganesha/memberFieldAuthoring',()=>({
  memberNativeSchemaReady:(...args:unknown[])=>mockCatalog(...args),
}));
jest.mock('@/lib/ganesha/g2MemberAuthoringRelease',()=>({
  isG2MemberAuthoringReleaseAdmitted:()=>mockRelease(),
}));
jest.mock('@/lib/ganesha/personalFieldIntegration',()=>({
  readVerifiedPersonalField:(...args:unknown[])=>mockOverview(...args),
}));
import {GET} from '../route';

const A='11111111-1111-4111-8111-111111111111';
const B='22222222-2222-4222-8222-222222222222';
const context={memberId:A,legacyPersonalStatus:'none',legacyPersonalPractitionerId:null};
const req=(query='')=>new NextRequest(
  'https://soullab.life/api/ganesha/personal-field/overview'+query,
  {headers:{'x-member-id':B}},
);
beforeEach(()=>{
  mockIndividual.mockReset();mockCatalog.mockReset();mockRelease.mockReset();
  mockOverview.mockReset();
  mockIndividual.mockResolvedValue(context);
  mockCatalog.mockResolvedValue(true);
  mockRelease.mockReturnValue(false); // production-authentic default
  mockOverview.mockResolvedValue({
    owner:'member',access:'source_held_read_only',coverage:'bounded_verified_sources_only',
    notes:[],people:[],events:[],attention:{memberNative:[],historical:[]},
    completeHistory:false,authoringEnabled:false,
  });
  jest.spyOn(console,'error').mockImplementation(()=>{});
});

describe('G2-3D overview has independent source-held and member identity gates',()=>{
  it('rejects an unauthenticated visitor before schema or content',async()=>{
    mockIndividual.mockResolvedValue(null);
    const r=await GET(req());
    expect(r.status).toBe(401);
    expect(mockCatalog).not.toHaveBeenCalled();
    expect(mockOverview).not.toHaveBeenCalled();
  });
  it('a schema migration or cookie does not override the existing hard HOLD',async()=>{
    const r=await GET(req('?memberId='+B+'&tier=pro'));
    expect(r.status).toBe(503);
    expect((await r.json()).state).toBe('authorization_held');
    expect(mockOverview).not.toHaveBeenCalled();
    expect(mockCatalog).not.toHaveBeenCalled();
    expect(r.headers.get('Cache-Control')).toContain('no-store');
  });
  it('synthetically admitted route requires even the G2-3C Notes/Attention schema',async()=>{
    mockRelease.mockReturnValue(true);
    mockCatalog.mockResolvedValue(false);
    const r=await GET(req());
    expect(r.status).toBe(503);
    expect((await r.json()).state).toBe('migration_held');
    expect(mockOverview).not.toHaveBeenCalled();
  });
  it('forwards only independently resolved member context to the overview',async()=>{
    mockRelease.mockReturnValue(true);
    const r=await GET(req('?memberId='+B+'&practitionerId='+B+'&teamId='+B));
    expect(r.status).toBe(200);
    expect(mockOverview).toHaveBeenCalledWith(context);
    expect(mockOverview).toHaveBeenCalledTimes(1);
    const body=await r.json();
    expect(body).toMatchObject({access:'source_held_read_only',authoringEnabled:false});
    expect(r.headers.get('Cache-Control')).toContain('no-store');
  });
  it('failure never becomes a false successful empty history',async()=>{
    mockRelease.mockReturnValue(true);
    mockOverview.mockRejectedValue(new Error('private-record@example.invalid'));
    const r=await GET(req());
    expect(r.status).toBe(503);
    const body=JSON.stringify(await r.json());
    expect(body).not.toContain('private-record');
    expect(body).not.toContain('notes');
    expect(r.headers.get('Cache-Control')).toContain('no-store');
  });
  it('never creates a practitioner compatibility account when the release is held',async()=>{
    await GET(req());
    expect(mockOverview).not.toHaveBeenCalled();
    expect(mockCatalog).not.toHaveBeenCalled();
  });
});
