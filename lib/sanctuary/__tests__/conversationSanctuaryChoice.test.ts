/** @jest-environment jsdom */
import { publishConversationSanctuaryChoice } from '../conversationSanctuaryChoice';
function makeStore(raw: string | null) {
  const store = new Map<string,string>();
  if (raw !== null) store.set('maia_settings',raw);
  return {getItem: (k:string)=>store.get(k)??null,setItem:jest.fn((k:string,v:string)=>{store.set(k,v);})};
}
test('entering Sanctuary publishes the common event while preserving other settings',()=>{
 const store=makeStore(JSON.stringify({voice:{pace:1.2},sanctuary:false}));
 const events = {dispatchEvent:jest.fn(()=>true)};
 expect(publishConversationSanctuaryChoice(true,store,events as any)).toBe(true);
 expect(JSON.parse(store.getItem('maia_settings')!)).toEqual({voice:{pace:1.2},sanctuary:true});
 expect(events.dispatchEvent).toHaveBeenCalledTimes(1);
 expect((events.dispatchEvent.mock.calls[0][0] as CustomEvent).detail.sanctuary).toBe(true);
});
test('returning to ordinary mode emits intent without claiming permission to persist',()=>{
 const store=makeStore('{"sanctuary":true}');
 const events = {dispatchEvent:jest.fn(()=>true)};
 expect(publishConversationSanctuaryChoice(false,store,events as any)).toBe(true);
 expect((events.dispatchEvent.mock.calls[0][0] as CustomEvent).detail.sanctuary).toBe(false);
});
test('unavailable storage neither dispatches nor grants anything',()=>{
 const events={dispatchEvent:jest.fn(()=>true)};
 expect(publishConversationSanctuaryChoice(true,null,events as any)).toBe(false);
 expect(events.dispatchEvent).not.toHaveBeenCalled();
});
test('malformed stored JSON fails without publishing an unverified setting',()=>{
 const store=makeStore('{broken');const events={dispatchEvent:jest.fn(()=>true)};
 expect(publishConversationSanctuaryChoice(true,store,events as any)).toBe(false);
 expect(events.dispatchEvent).not.toHaveBeenCalled();
});

test('an inaccessible storage object fails without broadcasting privacy state',()=>{
 const store={getItem:()=>{throw new Error('storage blocked')},setItem:jest.fn()};
 const events={dispatchEvent:jest.fn(()=>true)};
 expect(publishConversationSanctuaryChoice(true,store,events as any)).toBe(false);
 expect(store.setItem).not.toHaveBeenCalled();
 expect(events.dispatchEvent).not.toHaveBeenCalled();
});
