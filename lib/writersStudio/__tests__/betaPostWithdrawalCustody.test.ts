import {NextRequest} from 'next/server';
jest.mock('@/lib/auth/getMemberFromRequest',()=>({getMemberIdFromRequest:jest.fn()}));
jest.mock('@/lib/db/postgres',()=>({query:jest.fn()}));
import {getMemberIdFromRequest} from '@/lib/auth/getMemberFromRequest';
import {query} from '@/lib/db/postgres';
import {authenticatedPostWithdrawalMember,memberHasHistoricalBetaConsent} from '../betaPostWithdrawalCustody';
const verified = getMemberIdFromRequest as jest.Mock;
const q=query as jest.Mock;
const m='11111111-1111-4111-8111-111111111111';
const request=()=>new NextRequest('https://beta.soullab.life/api/beta/custody',{headers:{host:'beta.soullab.life'}});
const old={
 beta:process.env.WRITERS_STUDIO_RESTRICTED_BETA,
 custody:process.env.WRITERS_STUDIO_BETA_CUSTODY_SELF_SERVICE_ENABLED,
};
beforeEach(()=>{
 jest.resetAllMocks();
 process.env.WRITERS_STUDIO_RESTRICTED_BETA='true';
 process.env.WRITERS_STUDIO_BETA_CUSTODY_SELF_SERVICE_ENABLED='true';
 verified.mockResolvedValue(m);
 q.mockResolvedValue({rows:[{witnessed:true}]});
});
afterAll(()=>{
 for(const [k,v] of [
  ['WRITERS_STUDIO_RESTRICTED_BETA',old.beta],
  ['WRITERS_STUDIO_BETA_CUSTODY_SELF_SERVICE_ENABLED',old.custody],
 ] as const){ if(v===undefined)delete process.env[k];else process.env[k]=v; }
});
it('defaults OFF even for a historically consented member',async()=>{
 delete process.env.WRITERS_STUDIO_BETA_CUSTODY_SELF_SERVICE_ENABLED;
 expect(await authenticatedPostWithdrawalMember(request())).toEqual({kind:'refused',status:404});
 expect(verified).not.toHaveBeenCalled();
});
it('validates real session and exact beta host',async()=>{
 const other=new NextRequest('https://soullab.life/api/beta/custody',{headers:{host:'soullab.life'}});
 expect(await authenticatedPostWithdrawalMember(other)).toEqual({kind:'refused',status:403});
 verified.mockResolvedValue(null);
 expect(await authenticatedPostWithdrawalMember(request())).toEqual({kind:'refused',status:401});
 expect(q).not.toHaveBeenCalled();
});
it('permits historically accepted member regardless of current contact or consent',async()=>{
 expect(await authenticatedPostWithdrawalMember(request())).toEqual({kind:'allowed',memberId:m});
 expect(q.mock.calls[0][0]).toContain("decision='accept'");
 expect(q.mock.calls[0][1]).toEqual([m]);
});
it('refuses someone never consented, without exposing manuscript content',async()=>{
 q.mockResolvedValue({rows:[{witnessed:false}]});
 expect(await authenticatedPostWithdrawalMember(request())).toEqual({kind:'refused',status:403});
});
it('never treats database failure as permission to read data',async()=>{
 q.mockRejectedValue(new Error('fictional disconnected database'));
 await expect(authenticatedPostWithdrawalMember(request())).rejects.toThrow('fictional disconnected database');
});

it('resolves historical consent using only a previously verified server-side member ID',async()=>{
 expect(await memberHasHistoricalBetaConsent(m)).toBe(true);
 expect(q).toHaveBeenCalledTimes(1);
 expect(q.mock.calls[0][0]).toContain('actor_member_id=$1');
 expect(q.mock.calls[0][0]).toContain("decision='accept'");
 expect(q.mock.calls[0][1]).toEqual([m]);
 expect(verified).not.toHaveBeenCalled();
});
it('rejects non-UUID caller identities without querying any member table',async()=>{
 expect(await memberHasHistoricalBetaConsent('not-a-member')).toBe(false);
 expect(q).not.toHaveBeenCalled();
 expect(verified).not.toHaveBeenCalled();
});
it('never promotes absent historical consent or unavailable database authority',async()=>{
 q.mockResolvedValueOnce({rows:[{witnessed:false}]});
 expect(await memberHasHistoricalBetaConsent(m)).toBe(false);
 q.mockRejectedValueOnce(new Error('fixture DB unavailable'));
 await expect(memberHasHistoricalBetaConsent(m)).rejects.toThrow('fixture DB unavailable');
});
