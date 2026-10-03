const base=()=>({readiness:'READY',grant:'ACTIVE',session:'ADMITTED',lifecycle:'ROUTED',route_fresh:true,authorized_core_fresh:true});
const expectHeld=(d,w,code)=>{const r=d.evaluate(w);return r.disposition==='HELD'&&r.reasons.includes(code)?[]:[code+' not held'];};
export const FALSIFIERS=Object.freeze([
{id:'R6-F1',law:'R5A readiness is necessary but insufficient',run:d=>expectHeld(d,{...base(),readiness:'BLOCKED'},'R5A_NOT_READY')},
{id:'R6-F2',law:'active E1 grant is independently required',run:d=>expectHeld(d,{...base(),grant:'NONE'},'E1_GRANT_NOT_ACTIVE')},
{id:'R6-F3',law:'live session admission is independently required',run:d=>expectHeld(d,{...base(),session:'REFUSED'},'SESSION_NOT_ADMITTED')},
{id:'R6-F4',law:'own lifecycle must still be ROUTED before dispatch',run:d=>expectHeld(d,{...base(),lifecycle:'EXECUTING'},'LIFECYCLE_NOT_ROUTED')},
{id:'R6-F5',law:'route freshness is rechecked at admission',run:d=>expectHeld(d,{...base(),route_fresh:false},'ROUTE_NOT_FRESH')},
{id:'R6-F6',law:'authorized core freshness is rechecked at admission',run:d=>expectHeld(d,{...base(),authorized_core_fresh:false},'AUTHORIZED_CORE_NOT_FRESH')},
{id:'R6-F7',law:'R6 decision itself carries no effect',run:d=>{const r=d.evaluate(base());return r.disposition==='ADMISSIBLE'&&!r.dispatch_authorized&&!r.session_opened&&!r.grant_claimed&&!r.lifecycle_transitioned?[]:['R6 produced effect'];}},
{id:'R6-F8',law:'same evidence gives same decision',run:d=>JSON.stringify(d.evaluate(base()))===JSON.stringify(d.evaluate(base()))?[]:['nondeterministic']},
]);
