/**
 * R1-D: client identity only updates after a real verified server receipt.
 * The synthetic window/storage/HTTP transports have no member credentials.
 */
import {describe,it,expect,beforeEach,afterEach,jest} from '@jest/globals';
const mockFetch=jest.fn<(...args:any[])=>Promise<any>>();
jest.mock('@/lib/http/apiBase',()=>({
 apiFetch:(...args:any[])=>mockFetch(...args),
}));
import {
 startVerifiedNewMaiaConversation,
 subscribeMaiaSessionIdentityChanged,
 getOrCreateMaiaSessionId,
} from '../conversationIdentity';

const INITIAL='session_11111111-1111-4111-8111-111111111111';
const FRESH='session_22222222-2222-4222-8222-222222222222';
let data:Map<string,string>;
const handlers=new Map<string,Set<(event:any)=>void>>();
class FakeCustomEvent{
  type:string;
  detail:any;
  constructor(type:string,options?:{detail?:unknown}){
    this.type=type;this.detail=options?.detail;
  }
}
const store={
 getItem:(key:string)=>data.get(key)??null,
 setItem:(key:string,value:string)=>{data.set(key,value)},
 removeItem:(key:string)=>{data.delete(key)},
};
beforeEach(()=>{
 data=new Map([
  ['maia_session_id',INITIAL],
  ['maia_session_date',new Date().toDateString()],
  ['maia_conversation_'+INITIAL,'FICTIONAL_PRIOR_TEXT'],
 ]);
 handlers.clear();
 (globalThis as any).localStorage=store;
 (globalThis as any).CustomEvent=FakeCustomEvent;
 (globalThis as any).window={
  addEventListener:(name:string,fn:any)=>{
   if(!handlers.has(name))handlers.set(name,new Set());
   handlers.get(name)!.add(fn);
  },
  removeEventListener:(name:string,fn:any)=>handlers.get(name)?.delete(fn),
  dispatchEvent:(ev:any)=>{
   for(const fn of handlers.get(ev.type)??[])fn(ev);
   return true;
  },
 };
 mockFetch.mockReset();
 mockFetch.mockImplementation(async()=>({
  ok:true,json:async()=>({
   ok:true,sessionId:FRESH,privacyChoice:null,remembranceAuthorized:false,
  }),
 }));
});
afterEach(()=>{
 delete (globalThis as any).window;
 delete (globalThis as any).localStorage;
 delete (globalThis as any).CustomEvent;
});
describe('RF01 authenticated new-conversation identity',()=>{
 it('only a server-confirmed new session changes the canonical identity',async()=>{
  const observed:any[]=[];
  const unsub=subscribeMaiaSessionIdentityChanged(x=>observed.push(x));
  const result=await startVerifiedNewMaiaConversation();
  expect(result).toEqual({sessionId:FRESH,isNew:true});
  expect(store.getItem('maia_session_id')).toBe(FRESH);
  expect(store.getItem('maia_conversation_'+INITIAL)).toBe('FICTIONAL_PRIOR_TEXT');
  expect(observed).toEqual([{sessionId:FRESH,isNew:true}]);
  expect(mockFetch.mock.calls[0][0]).toBe('/api/sovereign/privacy/new-conversation');
  expect(mockFetch.mock.calls[0][1]).toMatchObject({method:'POST',body:'{}'});
  unsub();
 });
 it('network refusal leaves prior identity, date and writing unchanged',async()=>{
  mockFetch.mockImplementation(async()=>({ok:false}));
  await expect(startVerifiedNewMaiaConversation()).rejects.toThrow();
  expect(store.getItem('maia_session_id')).toBe(INITIAL);
  expect(store.getItem('maia_conversation_'+INITIAL)).toBe('FICTIONAL_PRIOR_TEXT');
 });
 it('a fabricated memory-grant receipt cannot reset privacy',async()=>{
  mockFetch.mockImplementation(async()=>({
   ok:true,json:async()=>({
     ok:true,sessionId:FRESH,privacyChoice:'continuity',remembranceAuthorized:true,
   }),
  }));
  await expect(startVerifiedNewMaiaConversation()).rejects.toThrow();
  expect(store.getItem('maia_session_id')).toBe(INITIAL);
 });
 it('a duplicated session ID cannot masquerade as a fresh encounter',async()=>{
  mockFetch.mockImplementation(async()=>({
   ok:true,json:async()=>({
     ok:true,sessionId:INITIAL,privacyChoice:null,remembranceAuthorized:false,
   }),
  }));
  await expect(startVerifiedNewMaiaConversation()).rejects.toThrow();
  expect(store.getItem('maia_session_id')).toBe(INITIAL);
 });
 it('invalid and failed receipt shapes leave prior writing untouched',async()=>{
  for(const response of [
   {ok:true,sessionId:'guess',privacyChoice:null,remembranceAuthorized:false},
   {ok:true,sessionId:FRESH,privacyChoice:'sanctuary',remembranceAuthorized:false},
   {ok:false,sessionId:FRESH,privacyChoice:null,remembranceAuthorized:false},
   null,
  ]){
   mockFetch.mockImplementation(async()=>({ok:true,json:async()=>response}));
   await expect(startVerifiedNewMaiaConversation()).rejects.toThrow();
  }
  expect(store.getItem('maia_session_id')).toBe(INITIAL);
  expect(store.getItem('maia_conversation_'+INITIAL)).toBe('FICTIONAL_PRIOR_TEXT');
 });
 it('forged event without matching canonical local identity is ignored by hosts',()=>{
  const result:any[]=[];
  const unsub=subscribeMaiaSessionIdentityChanged(x=>result.push(x));
  (globalThis as any).window.dispatchEvent(
    new FakeCustomEvent('maia-session-identity-changed',{detail:{sessionId:FRESH}}),
  );
  expect(result).toEqual([]);
  unsub();
  expect(handlers.get('maia-session-identity-changed')?.size).toBe(0);
 });
 it('legacy read/get-or-create returns the new stored canonical identity, never a second fork',async()=>{
  await startVerifiedNewMaiaConversation();
  expect(getOrCreateMaiaSessionId()).toEqual({sessionId:FRESH,isNew:false});
 });
});
