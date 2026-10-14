import {NextRequest} from 'next/server';
import {getMemberIdFromRequest} from '@/lib/auth/getMemberFromRequest';
import {query} from '@/lib/db/postgres';
import {GET,PATCH} from '../route';

jest.mock('@/lib/auth/getMemberFromRequest',()=>({getMemberIdFromRequest:jest.fn()}));
jest.mock('@/lib/db/postgres',()=>({query:jest.fn()}));

const idA='11111111-1111-4111-8111-111111111111';
const idB='22222222-2222-4222-8222-222222222222';
const verified=getMemberIdFromRequest as jest.Mock;
const db=query as jest.Mock;

function get(claim:string=idB):NextRequest {
  return new NextRequest('http://localhost/api/members/recall-preferences?memberId='+claim);
}
function patch(claim:string=idB):NextRequest {
  return new NextRequest('http://localhost/api/members/recall-preferences?memberId='+claim,{
    method:'PATCH',headers:{'content-type':'application/json'},
    body:JSON.stringify({conversational_recall_enabled:false}),
  });
}
describe('R5g memory recall preferences — member-only authority',()=>{
  beforeEach(()=>{
    jest.resetAllMocks();
    db.mockResolvedValue({rows:[{conversational_recall_enabled:false,episodic_recall_enabled:false}]});
    verified.mockResolvedValue(null);
  });
  it('denies query memberId alone on GET before database lookup',async()=>{
    const res=await GET(get(idA));
    expect(res.status).toBe(401);
    expect(db).not.toHaveBeenCalled();
    expect(res.headers.get('cache-control')).toContain('no-store');
  });
  it('denies query memberId alone on PATCH before database update',async()=>{
    const res=await PATCH(patch(idA));
    expect(res.status).toBe(401);
    expect(db).not.toHaveBeenCalled();
  });
  it('A authenticated caller cannot read B by claiming B in URL',async()=>{
    verified.mockResolvedValue(idA);
    const res=await GET(get(idB));
    expect(res.status).toBe(200);
    expect(db.mock.calls[0][1]).toEqual([idA]);
    expect(res.headers.get('cache-control')).toContain('private');
  });
  it('A authenticated caller cannot change B by claiming B in URL',async()=>{
    verified.mockResolvedValue(idA);
    const res=await PATCH(patch(idB));
    expect(res.status).toBe(200);
    expect(db.mock.calls[0][1]).toEqual([idA,false]);
  });
  it('treats null and unknown persisted recall flags as not authorized',async()=>{
    verified.mockResolvedValue(idA);
    db.mockResolvedValue({rows:[{conversational_recall_enabled:null,episodic_recall_enabled:null}]});
    const res=await GET(get());
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({conversational_recall_enabled:false,episodic_recall_enabled:false});
  });
  it('session verification error never grants B from URL',async()=>{
    verified.mockRejectedValue(Error('fictional auth store unavailable'));
    const res=await PATCH(patch(idB));
    expect(res.status).toBe(500);
    expect(db).not.toHaveBeenCalled();
  });
});
