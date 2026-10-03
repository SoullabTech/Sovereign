import * as R from './reference.mjs';
const mutate=(fn)=>({evaluate:(w)=>fn(structuredClone(w))});
export const CANDIDATES=Object.freeze([
{id:'DC-F1',kills:'R6-F1',decision:mutate(w=>R.evaluate({...w,readiness:'READY'}))},
{id:'DC-F2',kills:'R6-F2',decision:mutate(w=>R.evaluate({...w,grant:'ACTIVE'}))},
{id:'DC-F3',kills:'R6-F3',decision:mutate(w=>R.evaluate({...w,session:'ADMITTED'}))},
{id:'DC-F4',kills:'R6-F4',decision:mutate(w=>R.evaluate({...w,lifecycle:'ROUTED'}))},
{id:'DC-F5',kills:'R6-F5',decision:mutate(w=>R.evaluate({...w,route_fresh:true}))},
{id:'DC-F6',kills:'R6-F6',decision:mutate(w=>R.evaluate({...w,authorized_core_fresh:true}))},
{id:'DC-F7',kills:'R6-F7',decision:{evaluate:w=>({...R.evaluate(w),dispatch_authorized:true})}},
{id:'DC-F8',kills:'R6-F8',decision:{evaluate:w=>({...R.evaluate(w),nonce:Math.random()})}},
]);
