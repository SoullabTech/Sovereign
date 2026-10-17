/**
 * RF01 R1-F: HTTP LAN is not a secure context: randomUUID is missing while
 * WebCrypto getRandomValues is present. Never substitute Math.random().
 * No real account, login, external model, or network calls.
 */
import { describe,it,expect,beforeEach,afterEach,jest } from '@jest/globals';
import { webcrypto } from 'node:crypto';
import { getOrCreateVisitorId } from '../apiBase';
const originalCrypto=Object.getOwnPropertyDescriptor(globalThis,'crypto');
const originalWindow=Object.getOwnPropertyDescriptor(globalThis,'window');
const originalStorage=Object.getOwnPropertyDescriptor(globalThis,'localStorage');
const data=new Map<string,string>();
beforeEach(()=>{
 data.clear();
 Object.defineProperty(globalThis,'window',{configurable:true,value:{}});
 Object.defineProperty(globalThis,'localStorage',{
  configurable:true,value:{
   getItem:(k:string)=>data.get(k)??null,
   setItem:(k:string,v:string)=>{data.set(k,v);},
  },
 });
 Object.defineProperty(globalThis,'crypto',{
  configurable:true,value:{
   getRandomValues:(buf:Uint8Array)=>webcrypto.getRandomValues(buf),
   randomUUID:undefined,
  },
 });
});
afterEach(()=>{
 for(const [key,descriptor] of [
  ['crypto',originalCrypto],['window',originalWindow],
  ['localStorage',originalStorage],
 ] as [string,PropertyDescriptor|undefined][]){
  if(descriptor)Object.defineProperty(globalThis,key,descriptor);
  else delete (globalThis as Record<string,unknown>)[key];
 }
 jest.restoreAllMocks();
});
describe('RF01 browser visitor identifier over HTTP LAN',()=>{
 it('uses real secure random bytes without crypto.randomUUID',()=>{
  const id=getOrCreateVisitorId();
  expect(id).toMatch(/^anon_[0-9a-f]{16}$/);
  expect(data.get('maia_visitor_id')).toBe(id);
 });
 it('reuses an established visitor ID across calls',()=>{
  const id=getOrCreateVisitorId();
  expect(getOrCreateVisitorId()).toBe(id);
 });
 it('new visitor IDs have independent 64-bit browser entropy',()=>{
  const first=getOrCreateVisitorId();
  data.clear();
  const second=getOrCreateVisitorId();
  expect(second).toMatch(/^anon_[0-9a-f]{16}$/);
  expect(second).not.toBe(first);
 });
 it('when localStorage is unavailable it still uses secure random bytes',()=>{
  Object.defineProperty(globalThis,'localStorage',{
   configurable:true,value:{
    getItem:()=>{throw new Error('SIMULATED_LOCAL_STORAGE_DENIED')},
    setItem:()=>{throw new Error('SIMULATED_LOCAL_STORAGE_DENIED')},
   },
  });
  expect(getOrCreateVisitorId()).toMatch(/^anon_session_[0-9a-f]{16}$/);
 });
 it('refuses to invent an insecure visitor ID when cryptographic entropy is absent',()=>{
  Object.defineProperty(globalThis,'crypto',{configurable:true,value:{}});
  expect(()=>getOrCreateVisitorId()).toThrow('SECURE_VISITOR_ENTROPY_UNAVAILABLE');
 });
 it('server-side rendering still uses its existing placeholder',()=>{
  delete (globalThis as Record<string,unknown>).window;
  expect(getOrCreateVisitorId()).toBe('server_render');
 });
});
