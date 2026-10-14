import {
  ACCOUNT_ACTIVE_KEY,accountScopeAgrees,activateAccountScope,
  readScopedAccountValue,writeScopedAccountValue,scopedAccountKey,
} from '../accountScopedStorage';
import {assessBrowserAccount} from '../accountConflictBoundary';

const A='11111111-1111-4111-8111-111111111111';
const B='22222222-2222-4222-8222-222222222222';
function fixture(initial:Record<string,string>={}){
  const entries=new Map(Object.entries(initial));
  const storage={
    getItem:(key:string)=>entries.get(key)??null,
    setItem:(key:string,value:string)=>{entries.set(key,value);},
    removeItem:(key:string)=>{entries.delete(key);},
  };
  return {entries,storage};
}

describe('R5 per-member scoped local data (never auth)',()=>{
  it('partitions new local fields by exact server member id',()=>{
    const {entries,storage}=fixture({explorerId:A,beta_user:JSON.stringify({id:A})});
    expect(activateAccountScope(storage,A)).toBe(true);
    expect(writeScopedAccountValue(storage,A,'home_last_room','home')).toBe(true);
    expect(readScopedAccountValue(storage,A,'home_last_room')).toBe('home');
    expect(readScopedAccountValue(storage,B,'home_last_room')).toBeNull();
    expect(entries.get(scopedAccountKey(A,'home_last_room'))).toBe('home');
    expect(entries.has(scopedAccountKey(B,'home_last_room'))).toBe(false);
  });
  it('refuses a B activation when A still owns the browser without destroying A',()=>{
    const {entries,storage}=fixture({explorerId:A,beta_user:JSON.stringify({id:A})});
    expect(activateAccountScope(storage,A)).toBe(true);
    const before=Object.fromEntries(entries);
    expect(accountScopeAgrees(storage,B)).toBe(false);
    expect(activateAccountScope(storage,B)).toBe(false);
    expect(writeScopedAccountValue(storage,B,'house_display_mode','quiet')).toBe(false);
    expect(Object.fromEntries(entries)).toEqual(before);
  });
  it('new scoped account marker is included in conflict assessment',()=>{
    const {storage}=fixture({
      [ACCOUNT_ACTIVE_KEY]:B,explorerId:A,beta_user:JSON.stringify({id:A}),
    });
    expect(assessBrowserAccount(storage,A)).toBe('conflict');
  });
  it('rejects invalid account ids and control-containing values',()=>{
    const {storage}=fixture();
    expect(activateAccountScope(storage,'local_guest')).toBe(false);
    expect(()=>scopedAccountKey('some-other-id','home_last_room')).toThrow();
    expect(writeScopedAccountValue(storage,A,'home_last_room','not\nvalid')).toBe(false);
  });
  it('fails closed on browser storage unavailable',()=>{
    const storage={getItem:()=>{throw Error('storage denied');},setItem:()=>{throw Error('storage denied');}};
    expect(accountScopeAgrees(storage,A)).toBe(false);
    expect(activateAccountScope(storage,A)).toBe(false);
    expect(readScopedAccountValue(storage,A,'home_last_room')).toBeNull();
  });
});
