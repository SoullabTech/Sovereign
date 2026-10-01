const member=jest.fn();
const list=jest.fn();
jest.mock('@/lib/auth/getMemberFromRequest',()=>({getMemberIdFromRequest:(...a:unknown[])=>member(...a)}));
jest.mock('@/lib/writers-studio/relationshipCarriage',()=>({listEligiblePriorMaiaEditorialCarrySources:(...a:unknown[])=>list(...a)}));
import { NextRequest } from 'next/server';
import { GET } from '../route';

beforeEach(()=>{process.env.WRITERS_STUDIO_EDITORIAL_ENABLED='1';jest.clearAllMocks();member.mockResolvedValue('m1');});
const ctx={params:Promise.resolve({id:'rel-1'})};

describe('A2-14 carry source route',()=>{
  it('requires receiverThreadId',async()=>{
    const res=await GET(new NextRequest('http://localhost/api/writers-studio/relationships/rel-1/carry-sources'),ctx);
    expect(res.status).toBe(400); expect(list).not.toHaveBeenCalled();
  });
  it('returns only the public list contract, never the internal ok wrapper',async()=>{
    list.mockResolvedValue({ok:true,relationshipId:'rel-1',receiverThreadId:'th-new',sources:[{kind:'prior_maia_editorial_turn',sourceEpisodeSequence:2,sourceScope:'passage',admittedAt:'2026-09-26T12:00:00.000Z',excerpt:'Earlier',excerptTruncated:false}]});
    const res=await GET(new NextRequest('http://localhost/api/writers-studio/relationships/rel-1/carry-sources?receiverThreadId=th-new'),ctx);
    expect(res.status).toBe(200);
    const body=await res.json();
    expect(body).toEqual({relationshipId:'rel-1',receiverThreadId:'th-new',sources:[{kind:'prior_maia_editorial_turn',sourceEpisodeSequence:2,sourceScope:'passage',admittedAt:'2026-09-26T12:00:00.000Z',excerpt:'Earlier',excerptTruncated:false}]});
    expect('ok' in body).toBe(false);
  });
  it('does not disclose missing relationship',async()=>{
    list.mockResolvedValue({ok:false,reason:'relationship_not_found'});
    const res=await GET(new NextRequest('http://localhost/api/writers-studio/relationships/rel-1/carry-sources?receiverThreadId=th-new'),ctx);
    expect(res.status).toBe(404); expect(await res.json()).toEqual({error:'not_found'});
  });
  it('maps receiver semantic refusal to 409',async()=>{
    list.mockResolvedValue({ok:false,reason:'receiver_scope_unmeasured'});
    const res=await GET(new NextRequest('http://localhost/api/writers-studio/relationships/rel-1/carry-sources?receiverThreadId=th-new'),ctx);
    expect(res.status).toBe(409);
  });
});
