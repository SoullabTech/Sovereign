/** Nostr adapter: fake relay only; no network or key operations. */
import type {Filter} from 'nostr-tools';
const mockSubscribe=jest.fn();
const mockPublish=jest.fn();
const mockQuery=jest.fn();
const mockClose=jest.fn();
jest.mock('nostr-tools',()=>({
 SimplePool:jest.fn().mockImplementation(()=>({
  subscribeMany:mockSubscribe,publish:mockPublish,querySync:mockQuery,close:mockClose,
 })),
 nip19:{noteEncode:jest.fn((s:string)=>s)},
}));
import {subscribeToEvents,closePool} from '@/lib/nostr/client';

beforeEach(()=>jest.clearAllMocks());
afterEach(()=>closePool());

describe('Nostr v2.25 subscriptions (mocked)',()=>{
 it('does not open a subscription when no filters are supplied',()=>{
  const stop=subscribeToEvents([],jest.fn());
  stop();
  expect(mockSubscribe).not.toHaveBeenCalled();
 });
 it('passes one exact filter and releases the subscription',()=>{
  const close=jest.fn(); let eose=()=>{};
  mockSubscribe.mockImplementation((_urls:string[],_filter:Filter,cb:{oneose:()=>void})=>{
   eose=cb.oneose;return {close};
  });
  const filter:Filter={kinds:[9]},done=jest.fn();
  const stop=subscribeToEvents([filter],jest.fn(),done);
  expect(mockSubscribe).toHaveBeenCalledWith(
   ['wss://nostr.soullab.life'],filter,expect.objectContaining({oneose:expect.any(Function)}),
  );
  eose();expect(done).toHaveBeenCalledTimes(1);
  stop();expect(close).toHaveBeenCalledTimes(1);
 });
 it('preserves multiple filters and calls EOSE only after both finish',()=>{
  const callbacks:Array<()=>void>=[];
  const closers:Array<jest.Mock>=[];
  mockSubscribe.mockImplementation((_urls:string[],_filter:Filter,cb:{oneose:()=>void})=>{
   callbacks.push(cb.oneose);const close=jest.fn();closers.push(close);return {close};
  });
  const done=jest.fn(),stop=subscribeToEvents([{kinds:[9]},{kinds:[1059]}],jest.fn(),done);
  expect(mockSubscribe).toHaveBeenCalledTimes(2);
  callbacks[1]();expect(done).not.toHaveBeenCalled();
  callbacks[0]();expect(done).toHaveBeenCalledTimes(1);
  stop();closers.forEach(close=>expect(close).toHaveBeenCalledTimes(1));
  expect(mockPublish).not.toHaveBeenCalled();
  expect(mockQuery).not.toHaveBeenCalled();
 });
});
