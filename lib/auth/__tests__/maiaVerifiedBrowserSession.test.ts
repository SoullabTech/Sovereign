import { restoreMaiaBrowserIdentity } from '../maiaVerifiedBrowserSession';
const MEMBER = '11111111-1111-4111-8111-111111111111';
function storage(initial: Record<string, string> = {}) {
  const values = new Map(Object.entries(initial));
  return { getItem: (k: string) => values.get(k) ?? null, setItem: jest.fn((k: string, v: string) => values.set(k,v)) };
}
const verified = () => jest.fn(async () => ({ok: true, json: async () => ({success: true, member: {id: MEMBER, username: 'qa-fixture', name: 'Local Fixture', onboarded: true}})}));
test('restores missing browser state only after successful server session verification', async () => {
  const s=storage(), get=verified();
  expect(await restoreMaiaBrowserIdentity(s,get as any)).toBe('restored');
  expect(get).toHaveBeenCalledWith('/api/members/me', {method:'GET',cache:'no-store',credentials:'include'});
  expect(s.getItem('explorerId')).toBe(MEMBER);
  expect(s.getItem('maia_session_version')).toBe('2');
  expect(JSON.parse(s.getItem('beta_user')!).id).toBe(MEMBER);
  expect(s.getItem('maia_session_token')).toBeNull();
});
test('an explicit prior sign-out is not overridden by a surviving cookie', async () => {
  const s=storage({maia_signed_out:'1'}), get=verified();
  expect(await restoreMaiaBrowserIdentity(s,get as any)).toBe('signed_out');
  expect(get).not.toHaveBeenCalled();
});
test('a different client identity is not silently overwritten', async () => {
  const s=storage({explorerId:'22222222-2222-4222-8222-222222222222'});
  expect(await restoreMaiaBrowserIdentity(s,verified() as any)).toBe('identity_conflict');
  expect(s.setItem).not.toHaveBeenCalled();
});
test('failed or forged server response never establishes local identity', async () => {
  const s=storage();
  const invalid=jest.fn(async()=>({ok:true,json:async()=>({success:true,member:{id:'invented'}})}));
  expect(await restoreMaiaBrowserIdentity(s,invalid as any)).toBe('unavailable');
  expect(s.setItem).not.toHaveBeenCalled();
  const unavailable=jest.fn(async()=>({ok:false}));
  expect(await restoreMaiaBrowserIdentity(s,unavailable as any)).toBe('unavailable');
});
test('complete existing session state is not rewritten',async()=>{
  const s=storage({beta_user:'{}',explorerId:MEMBER,maia_session_version:'2'}),get=verified();
  expect(await restoreMaiaBrowserIdentity(s,get as any)).toBe('already_present');
  expect(get).not.toHaveBeenCalled();
});
