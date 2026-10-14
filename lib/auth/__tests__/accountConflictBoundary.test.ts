import {assessBrowserAccount} from '../accountConflictBoundary';

const A='11111111-1111-4111-8111-111111111111';
const B='22222222-2222-4222-8222-222222222222';
function store(data:Record<string,string|undefined>={}){
  const map=new Map(Object.entries(data).filter((entry):entry is [string,string]=>entry[1]!==undefined));
  return {map, getItem:(k:string)=>map.get(k)??null};
}
describe('Cross-account browser boundary (fictional identity only)',()=>{
  test('agrees only when all cached aliases equal verified A',()=>{
    expect(assessBrowserAccount(store({memberId:A,explorerId:A,beta_user:JSON.stringify({id:A,memberId:A})}),A)).toBe('aligned');
  });
  test.each([
    {explorerId:B},
    {memberId:B},
    {beta_user:JSON.stringify({id:B})},
    {explorerId:A,beta_user:JSON.stringify({id:A,memberId:B})},
    {explorerId:B,maia_session_version:'2',beta_user:JSON.stringify({id:B})},
  ])('refuses server A with any B alias %#', data=>{
    const s=store(data);
    const before=[...s.map.entries()];
    expect(assessBrowserAccount(s,A)).toBe('conflict');
    expect([...s.map.entries()]).toEqual(before);
  });
  test('does not assume server auth just because browser cache is A',()=>{
    expect(assessBrowserAccount(store({explorerId:A}),null)).toBe('unverifiable');
    expect(assessBrowserAccount(store({explorerId:A}),'not-uuid')).toBe('unverifiable');
  });
  test.each([{beta_user:'{'},{explorerId:'local_guest'},{memberId:'guest'},{beta_user:'[1]'},{beta_user:JSON.stringify({id:33})}])(
    'ambiguous browser data holds, rather than silently clearing or transferring %#',data=>{
      const s=store(data);const before=[...s.map.entries()];
      expect(assessBrowserAccount(s,A)).toBe('unverifiable');
      expect([...s.map.entries()]).toEqual(before);
    },
  );
  test('explicit signed out latch refuses same A',()=>{
    expect(assessBrowserAccount(store({maia_signed_out:'1',explorerId:A}),A)).toBe('conflict');
  });
  test('blank browser requires no conflicting private legacy fragments',()=>{
    expect(assessBrowserAccount(store(),A)).toBe('empty');
    expect(assessBrowserAccount(store({maia_session_id:'previous-member-session'}),A)).toBe('unverifiable');
    expect(assessBrowserAccount(store({journal_entries:'older notes'}),A)).toBe('unverifiable');
    expect(assessBrowserAccount(store({beta_user:JSON.stringify({memberStyleProfile:{focus:'private'}})}),A)).toBe('unverifiable');
    const prior=store({'maia_conversation_old':'previous member note'});
    const enumerable={...prior, length:prior.map.size, key:(i:number)=>[...prior.map.keys()][i]??null};
    expect(assessBrowserAccount(enumerable,A)).toBe('unverifiable');
  });
  test('storage errors fail closed',()=>{
    expect(assessBrowserAccount({getItem:()=>{throw Error('fixture Storage exception')}},A)).toBe('unverifiable');
  });
});
