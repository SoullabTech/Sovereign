import { restoreMaiaBrowserSessionFromServer } from '../restoreMaiaBrowserSession';

const good = {
  authenticated: true,
  member: {
    id: 'fiction-only-member',
    username: 'fiction-user',
    name: 'Fiction Member',
    preferredName: 'Fiction Preferred',
    onboarded: true,
    tier: 'professional',
    roles: ['practitioner'],
    sessionToken: 'must-never-store',
  },
};
function store(initial: Record<string, string> = {}) {
  const map = new Map(Object.entries(initial));
  const storage = {
    getItem: (key: string) => map.get(key) ?? null,
    setItem: (key: string, value: string) => { map.set(key, value); },
    removeItem: (key: string) => { map.delete(key); },
  };
  return { map, storage };
}
function payload(response: unknown, status = 200) {
  return async () => ({
    ok: status >= 200 && status < 300,
    json: async () => response,
  }) as Response;
}
const check = (storage: ReturnType<typeof store>['storage'],
  fetchSession: () => Promise<Response>) =>
  restoreMaiaBrowserSessionFromServer({fetchSession, storage, version: 2});

describe('Server-verified MAIA client cache recovery — Class A candidate', () => {
  it('recovers only display identity from an onboarded verified cookie', async () => {
    const {map, storage} = store();
    expect(await check(storage, payload(good))).toBe(true);
    expect([...map.entries()]).toEqual([
      ['explorerId', 'fiction-only-member'],
      ['explorerName', 'Fiction Preferred'],
      ['explorerPreferredName', 'Fiction Preferred'],
      ['beta_user', '{"id":"fiction-only-member","name":"Fiction Preferred"}'],
      ['maia_session_version', '2'],
    ]);
    expect(JSON.stringify([...map])).not.toContain('must-never-store');
    expect(JSON.stringify([...map])).not.toContain('professional');
    expect(JSON.stringify([...map])).not.toContain('practitioner');
  });
  it('does not even check the cookie after explicit sign-out', async () => {
    const {map,storage} = store({maia_signed_out: '1'});
    const fetchSession=jest.fn(payload(good));
    expect(await check(storage,fetchSession)).toBe(false);
    expect(fetchSession).not.toHaveBeenCalled();
    expect([...map.entries()]).toEqual([['maia_signed_out','1']]);
  });
  it.each([401,403,500,503])('refuses server HTTP %d without any storage mutations',async status=>{
    const {map,storage}=store();
    expect(await check(storage,payload(good,status))).toBe(false);
    expect(map.size).toBe(0);
  });
  it.each([
    {authenticated:false, member:good.member},
    {authenticated:'true', member:good.member},
    {authenticated:true, member:{...good.member, onboarded:false}},
    {authenticated:true, member:{...good.member, onboarded:null}},
    {authenticated:true, member:null},
    null,
    {},
  ])('refuses unverified or incomplete session payload %#',async body=>{
    const {map,storage}=store();
    expect(await check(storage,payload(body))).toBe(false);
    expect(map.size).toBe(0);
  });
  it.each(['','guest','guest_any','anonymous','local_fake','   ','x'.repeat(129)])(
    'refuses invalid member identity %s', async id=>{
      const {map,storage}=store();
      expect(await check(storage,payload({...good, member:{...good.member,id}}))).toBe(false);
      expect(map.size).toBe(0);
    }
  );
  it('refuses network and JSON failures without introducing a cached identity',async ()=>{
    const {map,storage}=store();
    expect(await check(storage,async()=>{throw Error('fictional network loss')})).toBe(false);
    expect(await check(storage,async()=>({ok:true,json:async()=>{throw Error('bad json')}}) as unknown as Response)).toBe(false);
    expect(map.size).toBe(0);
  });
  it('uses safe fallback display name, never inventing a role or consent',async()=>{
    const {map,storage}=store();
    const member={id:'fiction-only-member',onboarded:true,name:'guest'};
    expect(await check(storage,payload({authenticated:true,member}))).toBe(true);
    expect(map.get('explorerName')).toBe('Friend');
    expect(map.has('practitioner')).toBe(false);
    expect(map.has('consent')).toBe(false);
  });
  it('fails closed if local storage is unavailable',async()=>{
    const storage={getItem:()=>null,setItem:()=>{throw Error('QuotaExceededError')},removeItem:()=>{}};
    expect(await check(storage,payload(good))).toBe(false);
  });
});

describe('Security amendment — adversarial identity and storage integrity', () => {
  const fresh = () => ({
    authenticated: true,
    member: {id:'fiction-member-A',name:'Member A',onboarded:true},
  });

  it('denies valid cookie A against current-version browser identity B without changing B', async()=>{
    const previous={explorerId:'fiction-member-B',explorerName:'Member B',
      beta_user:JSON.stringify({id:'fiction-member-B',name:'Member B'}),
      maia_session_version:'2'};
    const {map,storage}=store(previous);
    expect(await check(storage,payload(fresh()))).toBe(false);
    expect(Object.fromEntries(map)).toEqual(previous);
  });

  it('rejects a beta_user from B even if explorerId matches A',async()=>{
    const previous={explorerId:'fiction-member-A',
      beta_user:JSON.stringify({id:'fiction-member-B',name:'Member B'})};
    const {map,storage}=store(previous);
    expect(await check(storage,payload(fresh()))).toBe(false);
    expect(Object.fromEntries(map)).toEqual(previous);
  });

  it('rejects conflicting beta_user memberId even when id matches A',async()=>{
    const previous={explorerId:'fiction-member-A',
      beta_user:JSON.stringify({id:'fiction-member-A',memberId:'fiction-member-B'})};
    const {map,storage}=store(previous);
    expect(await check(storage,payload(fresh()))).toBe(false);
    expect(Object.fromEntries(map)).toEqual(previous);
  });

  it('preserves same-member settled beta_user metadata byte for byte',async()=>{
    const beta=JSON.stringify({
      id:'fiction-member-A',name:'Old A',
      memberStyleProfile:{focus:'gentle'},
      birthData:{date:'example-only'},
    });
    const {map,storage}=store({explorerId:'fiction-member-A',beta_user:beta,maia_session_version:'2'});
    expect(await check(storage,payload(fresh()))).toBe(true);
    expect(map.get('beta_user')).toBe(beta);
    expect(map.get('explorerId')).toBe('fiction-member-A');
    expect(map.get('explorerName')).toBe('Member A');
  });

  it('rewinds interrupted multi-key updates to the entire previous snapshot',async()=>{
    const initial={explorerName:'Old Name',maia_session_version:'1'};
    const {map}=store(initial);
    let threw=false;
    const storage={
      getItem:(key:string)=>map.get(key)??null,
      setItem:(key:string,value:string)=>{
        if(key==='beta_user' && !threw){threw=true;throw Error('Simulated storage quota')}
        map.set(key,value);
      },
      removeItem:(key:string)=>{map.delete(key)},
    };
    expect(await check(storage,payload(fresh()))).toBe(false);
    expect(Object.fromEntries(map)).toEqual(initial);
  });

  it('restores previous same-member display on an interrupted version write',async()=>{
    const initial={explorerId:'fiction-member-A',
      explorerName:'Old A',
      beta_user:JSON.stringify({id:'fiction-member-A',style:'settled'}),
      maia_session_version:'1'};
    const {map}=store(initial);
    let threw=false;
    const storage={
      getItem:(key:string)=>map.get(key)??null,
      setItem:(key:string,value:string)=>{
        if(key==='maia_session_version' && !threw){threw=true;throw Error('Simulated interrupted write')}
        map.set(key,value);
      },
      removeItem:(key:string)=>{map.delete(key)},
    };
    expect(await check(storage,payload(fresh()))).toBe(false);
    expect(Object.fromEntries(map)).toEqual(initial);
  });

  it('denies a member B assertion even when a valid A cookie exists',async()=>{
    const {map,storage}=store({explorerId:'fiction-member-B',maia_session_version:'2'});
    const fetchSession=jest.fn(payload(fresh()));
    expect(await check(storage,fetchSession)).toBe(false);
    expect(fetchSession).toHaveBeenCalledTimes(1);
    expect(map.get('explorerId')).toBe('fiction-member-B');
  });

  it('the direct MAIA encounter verifies even when browser version is current',()=>{
    const fs=require('node:fs');
    const page=fs.readFileSync(require('node:path').resolve(process.cwd(),'app/maia/page.tsx'),'utf8');
    expect(page).toContain("window.location.pathname === '/maia/encounter'");
    expect(page).toContain('if (sessionCheck || verifyAtEncounter)');
  });
});
