import {assessBrowserAccount} from '../accountConflictBoundary';
import {assessFreshSignInAdmission} from '../freshSigninReconciliation';

const A='11111111-1111-4111-8111-111111111111';
const B='22222222-2222-4222-8222-222222222222';
function fixture(items:Record<string,string>={}){
  const data=new Map(Object.entries(items));
  return {data,storage:{getItem:(key:string)=>data.get(key)??null}};
}
const verified=(id:string,ok=true) => async()=>({
  ok,
  json:async()=>({authenticated:true,member:{id}}),
}) as Response;
const decide=(store:ReturnType<typeof fixture>['storage'],id:string,
  fetchVerifiedSession:()=>Promise<Response>)=>
  assessFreshSignInAdmission({store,memberId:id,fetchVerifiedSession});

describe('R5a deliberate same-member credential return after explicit sign-out',()=>{
  it('permits NEW explicitly verified B session after B prior sign-out without erasing B',async()=>{
    const {data,storage}=fixture({memberId:B,explorerId:B,
      beta_user:JSON.stringify({id:B,name:'Former B',notes:'keep-me'}),
      'soullab:active-account:v1':B,maia_signed_out:'1'});
    const before=Object.fromEntries(data);
    expect(assessBrowserAccount(storage,B)).toBe('conflict'); // silent resume denied
    expect(await decide(storage,B,verified(B))).toBe('admit');
    expect(Object.fromEntries(data)).toEqual(before); // caller alone may finish explicit signin
    expect(data.get('maia_signed_out')).toBe('1');
  });
  it('rejects explicit A sign-in while preserved browser has B ownership',async()=>{
    const {data,storage}=fixture({explorerId:B,memberId:B,
      beta_user:JSON.stringify({id:B}),maia_signed_out:'1'});
    const f=jest.fn(verified(A));
    expect(await decide(storage,A,f)).toBe('conflict');
    expect(f).not.toHaveBeenCalled();
    expect(data.get('beta_user')).toBe(JSON.stringify({id:B}));
  });
  it('does not clear signout when verified cookie is still old A',async()=>{
    const {data,storage}=fixture({explorerId:B,memberId:B,maia_signed_out:'1'});
    expect(await decide(storage,B,verified(A))).toBe('verification-unavailable');
    expect(data.get('maia_signed_out')).toBe('1');
  });
  it('fails closed for revoked, missing, malformed or unavailable session',async()=>{
    const {storage}=fixture({explorerId:B,maia_signed_out:'1'});
    expect(await decide(storage,B,verified(B,false))).toBe('verification-unavailable');
    expect(await decide(storage,B,async()=>({ok:true,json:async()=>({authenticated:false,member:{id:B}})}) as Response)).toBe('verification-unavailable');
    expect(await decide(storage,B,async()=>{throw Error('fiction network loss')})).toBe('verification-unavailable');
    expect(await decide(storage,B,async()=>({ok:true,json:async()=>{throw Error('bad json')}}) as Response)).toBe('verification-unavailable');
  });
  it('does not weaken normal passive admission',async()=>{
    const {storage}=fixture({explorerId:B,maia_signed_out:'1'});
    expect(assessBrowserAccount(storage,B)).toBe('conflict');
  });
  it('refuses corrupt previous-account cache and a wrong active owner',async()=>{
    const broken=fixture({explorerId:B,beta_user:'{',maia_signed_out:'1'});
    expect(await decide(broken.storage,B,verified(B))).toBe('conflict');
    const wrong=fixture({explorerId:B,'soullab:active-account:v1':A,maia_signed_out:'1'});
    expect(await decide(wrong.storage,B,verified(B))).toBe('conflict');
  });
  it('allows a blank, newly authenticated first account only after verification',async()=>{
    const {storage}=fixture({maia_signed_out:'1'});
    expect(await decide(storage,A,verified(A))).toBe('admit');
  });
});
