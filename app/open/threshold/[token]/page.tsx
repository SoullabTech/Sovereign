'use client';
import {useCallback,useEffect,useState} from 'react';
import {useParams} from 'next/navigation';
type Purpose='join'|'record_audio';type Action='grant'|'refuse'|'revoke';
interface ThresholdContext{encounterId:string;displayName:string;role:string;agreementVersion:string;generation:number;
 joinConsentText:string;recordConsentText:string;joined:boolean;recordConsented:boolean;
 joinDecision:string;recordDecision:string;}
export default function ThresholdPage(){
 const params=useParams();const token=params?.token as string;
 const [ctx,setCtx]=useState<ThresholdContext|null>(null);
 const [state,setState]=useState<'loading'|'ready'|'saving'|'invalid'|'error'>('loading');
 const load=useCallback(async()=>{
  try{const r=await fetch(`/api/open/threshold/${token}`,{cache:'no-store'});
   if(r.status===404){setState('invalid');return;}if(!r.ok){setState('error');return;}
   setCtx(await r.json());setState('ready');
  }catch{setState('error');}
 },[token]);
 useEffect(()=>{
  if(!token)return;
  let cancelled=false;
  fetch(`/api/open/threshold/${token}`,{cache:'no-store'})
   .then(async r=>{
    if(cancelled)return;
    if(r.status===404){setState('invalid');return;}
    if(!r.ok){setState('error');return;}
    const data=await r.json();if(cancelled)return;
    setCtx(data);setState('ready');
   })
   .catch(()=>{if(!cancelled)setState('error');});
  return()=>{cancelled=true;};
 },[token]);
 const decide=useCallback(async(purpose:Purpose,action:Action)=>{
  setState('saving');
  try{const r=await fetch(`/api/open/threshold/${token}`,{method:'POST',headers:{'Content-Type':'application/json'},
    body:JSON.stringify({purpose,action})});if(!r.ok){setState('error');return;}await load();}
  catch{setState('error');}
 },[token,load]);
 return <div className="min-h-screen bg-neutral-950 text-neutral-100 flex items-center justify-center p-6">
  <div className="max-w-lg w-full space-y-6">
   {state==='loading'&&<p className="text-neutral-400 text-center">Opening the threshold…</p>}
   {state==='invalid'&&<div className="text-center space-y-2"><h1 className="text-lg font-semibold">This link is no longer valid</h1>
    <p className="text-sm text-neutral-400">It may have expired or been superseded by a new consent generation.</p></div>}
   {state==='error'&&<p className="text-sm text-red-300 text-center">The consent record could not be updated. Nothing new was authorized.</p>}
   {ctx&&state!=='invalid'&&<>
    <header className="text-center space-y-1"><h1 className="text-xl font-semibold">Encounter threshold</h1>
     <p className="text-sm text-neutral-400">{ctx.displayName} · agreement {ctx.agreementVersion} · generation {ctx.generation}</p></header>
    <section className="rounded-xl bg-neutral-900 border border-neutral-800 p-5 space-y-4">
     <h2 className="font-medium">1. Enter the human room</h2><p className="text-sm text-neutral-300">{ctx.joinConsentText}</p>
     <div className="flex gap-2 flex-wrap">
      <button disabled={state==='saving'} onClick={()=>void decide('join','grant')} className="px-4 py-2 rounded-lg bg-emerald-500/15 border border-emerald-500/40 text-emerald-300">Enter this room</button>
      <button disabled={state==='saving'} onClick={()=>void decide('join',ctx.joined?'revoke':'refuse')} className="px-4 py-2 rounded-lg border border-neutral-700 text-neutral-300">{ctx.joined?'Prevent future room entry':'Not now'}</button>
     </div><p className="text-xs text-neutral-500">Current decision: {ctx.joinDecision}</p>
    </section>
    <section className="rounded-xl bg-neutral-900 border border-neutral-800 p-5 space-y-4">
     <h2 className="font-medium">2. Recording is a separate choice</h2><p className="text-sm text-neutral-300">{ctx.recordConsentText}</p>
     <div className="flex gap-2 flex-wrap">
      <button disabled={state==='saving'} onClick={()=>void decide('record_audio','grant')} className="px-4 py-2 rounded-lg bg-amber-500/10 border border-amber-500/40 text-amber-200">Allow recording</button>
      <button disabled={state==='saving'} onClick={()=>void decide('record_audio',ctx.recordConsented?'revoke':'refuse')} className="px-4 py-2 rounded-lg border border-neutral-700 text-neutral-300">{ctx.recordConsented?'Prevent future recording':'Do not record'}</button>
     </div><p className="text-xs text-neutral-500">Current decision: {ctx.recordDecision}. This policy candidate does not start a recorder.</p>
    </section>
    {ctx.joined&&<a href={`/open/session-room/${ctx.encounterId}?role=${ctx.role==='practitioner'?'practitioner':'guest'}&threshold=${encodeURIComponent(token)}`}
      className="block w-full text-center px-4 py-3 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 font-medium">Enter the session room</a>}
    <p className="text-xs text-neutral-500 text-center">Entering grants no recording, captions, transcript, MAIA, memory, or sharing permission. These decisions close future admission immediately. Stopping an already-open room is a later held gate.</p>
   </>}
  </div>
 </div>;
}
