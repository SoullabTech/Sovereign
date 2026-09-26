jest.mock('@/lib/http/apiBase',()=>({apiFetch:jest.fn()}));
import { apiFetch } from '@/lib/http/apiBase';
import { readEligibleCarrySources } from '../relationshipOrchestration';
const fetchMock=apiFetch as jest.MockedFunction<typeof apiFetch>;
const response=(status:number,body:unknown)=>({ok:status>=200&&status<300,status,json:async()=>body}) as Response;
beforeEach(()=>fetchMock.mockReset());
const valid={relationshipId:'rel-1',receiverThreadId:'th-1',sources:[{kind:'prior_maia_editorial_turn',sourceEpisodeSequence:2,sourceScope:'section',admittedAt:'2026-09-26T12:00:00.000Z',excerpt:'Earlier MAIA',excerptTruncated:false}]};

describe('A2-14 strict carry source client',()=>{
  it('reads the exact identity-bound endpoint',async()=>{
    fetchMock.mockResolvedValue(response(200,valid));
    await expect(readEligibleCarrySources('rel-1','th-1')).resolves.toEqual({ok:true,sources:valid.sources});
    expect(fetchMock).toHaveBeenCalledWith('/api/writers-studio/relationships/rel-1/carry-sources?receiverThreadId=th-1',{method:'GET'});
  });
  it('rejects extra source identity fields rather than tolerating them',async()=>{
    fetchMock.mockResolvedValue(response(200,{...valid,sources:[{...valid.sources[0],sourceThreadId:'hidden'}]}));
    await expect(readEligibleCarrySources('rel-1','th-1')).resolves.toEqual({ok:false,reason:'unreadable'});
  });
  it('rejects relationship/thread mismatch',async()=>{
    fetchMock.mockResolvedValue(response(200,{...valid,receiverThreadId:'other'}));
    await expect(readEligibleCarrySources('rel-1','th-1')).resolves.toEqual({ok:false,reason:'unreadable'});
  });
  it('rejects excerpts over the 320-code-point contract',async()=>{
    fetchMock.mockResolvedValue(response(200,{...valid,sources:[{...valid.sources[0],excerpt:'x'.repeat(321),excerptTruncated:true}]}));
    await expect(readEligibleCarrySources('rel-1','th-1')).resolves.toEqual({ok:false,reason:'unreadable'});
  });
});
