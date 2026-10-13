'use client';

import {useCallback,useEffect,useRef,useState} from 'react';
import {assessBrowserAccount} from '@/lib/auth/accountConflictBoundary';
import {restoreMaiaBrowserSessionFromServer} from '@/lib/auth/restoreMaiaBrowserSession';
import {ACCOUNT_ACTIVE_KEY,ACCOUNT_CHANNEL,IDENTITY_CACHE_KEYS,
  accountScopeAgrees,activateAccountScope} from '@/lib/auth/accountScopedStorage';
import {isHomeViewPayload,type HomeViewPayload} from '@/lib/auth/homeViewPayload';
import {ClientHouseExperience} from '@/app/house/ClientHouseExperience';

type GateStatus = 'checking'|'confirm'|'unavailable'|'open';

/**
 * R5: Never fetch or render member-owned House information on the server.
 * A client may hydrate the private view only after verifying the HttpOnly
 * session, checking previous browser ownership and (for blank browsers)
 * receiving an explicit human request to enter that account.
 *
 * This limits accidental shared-browser display. It is not a cryptographic
 * assertion about localStorage or a defense against hostile same-origin JS.
 */
export function HomeAccountGate({destination='home'}:{destination?:'home'|'house'}) {
  const [status,setStatus]=useState<GateStatus>('checking');
  const [view,setView]=useState<HomeViewPayload|null>(null);
  const [pending,setPending]=useState<string|null>(null);
  const verifiedRef=useRef<string|null>(null);
  const aliveRef=useRef(true);
  const sequence=useRef(0);
  const requestRef=useRef<AbortController|null>(null);
  const channelRef=useRef<BroadcastChannel|null>(null);

  const close=useCallback((conflict:boolean)=>{
    sequence.current += 1;
    requestRef.current?.abort();
    setView(null); setPending(null); verifiedRef.current=null;
    setStatus('unavailable');
    if(conflict) window.location.replace('/account/conflict');
  },[]);

  const checkCurrent=useCallback(()=>{
    const id=verifiedRef.current;
    if(!id) return;
    const state=assessBrowserAccount(localStorage,id);
    if(state!=='aligned' || !accountScopeAgrees(localStorage,id)) close(true);
  },[close]);

  const open=useCallback(async(id:string,allowEmpty:boolean)=>{
    const ticket=++sequence.current;
    requestRef.current?.abort();
    const controller=new AbortController();
    requestRef.current=controller;
    try {
      // Re-query server identity at the moment the member enters.
      const response=await fetch('/api/members/session',{
        credentials:'same-origin',cache:'no-store',signal:controller.signal,
      });
      if(!response.ok) throw Error('SESSION_UNAVAILABLE');
      const payload=await response.json() as {authenticated?:boolean;member?:{id?:string;onboarded?:boolean}};
      if(payload.authenticated!==true || payload.member?.onboarded!==true ||
          payload.member.id!==id) throw Error('SESSION_CHANGED');
      const state=assessBrowserAccount(localStorage,id);
      if(state==='conflict' || state==='unverifiable' || (state==='empty' && !allowEmpty)) {
        if(aliveRef.current) close(true);
        return;
      }
      if(!accountScopeAgrees(localStorage,id)) {if(aliveRef.current) close(true);return;}
      const hydrated=await restoreMaiaBrowserSessionFromServer({
        fetchSession:async()=>new Response(JSON.stringify(payload),{status:200}),
        storage:localStorage,version:2,
      });
      if(!hydrated || !activateAccountScope(localStorage,id)) throw Error('CACHE_RECONCILE_FAILED');
      if (typeof BroadcastChannel !== 'undefined') {
        const announcement=new BroadcastChannel(ACCOUNT_CHANNEL);
        announcement.postMessage({kind:'account-verified'});
        announcement.close();
      }
      if(!aliveRef.current || ticket!==sequence.current || controller.signal.aborted) return;
      const result=await fetch('/api/auth/home-view',{
        method:'POST',credentials:'same-origin',cache:'no-store',signal:controller.signal,
        headers:{'content-type':'application/json'},
        body:JSON.stringify({expectedMemberId:id,destination}),
      });
      if(!result.ok) throw Error('PRIVATE_VIEW_UNAVAILABLE');
      const data:unknown=await result.json();
      if(!isHomeViewPayload(data,id)) throw Error('PRIVATE_VIEW_INVALID');
      // Re-check AFTER the private fetch. An A->B switch in any tab must win.
      if(assessBrowserAccount(localStorage,id)!=='aligned' ||
          !accountScopeAgrees(localStorage,id)){
        if(aliveRef.current) close(true);
        return;
      }
      if(!aliveRef.current || ticket!==sequence.current || controller.signal.aborted) return;
      verifiedRef.current=id;
      setPending(null);setView(data);setStatus('open');
    }catch{
      if(aliveRef.current && ticket===sequence.current && !controller.signal.aborted){
        setView(null);setStatus('unavailable');
      }
    }
  },[close,destination]);

  useEffect(()=>{
    aliveRef.current=true;
    const controller=new AbortController();
    async function start(){
      try {
        const response=await fetch('/api/members/session',{
          credentials:'same-origin',cache:'no-store',signal:controller.signal,
        });
        if(!response.ok) throw Error('SESSION_UNAVAILABLE');
        const payload=await response.json() as {authenticated?:boolean;member?:{id?:string;onboarded?:boolean}};
        const id=payload.member?.id;
        if(payload.authenticated!==true || payload.member?.onboarded!==true || !id) throw Error('SESSION_UNVERIFIED');
        const state=assessBrowserAccount(localStorage,id);
        if(state==='conflict' || state==='unverifiable' || !accountScopeAgrees(localStorage,id)){
          if(aliveRef.current) close(true);
          return;
        }
        if(!aliveRef.current || controller.signal.aborted) return;
        if(state==='empty'){
          verifiedRef.current=id;
          setPending(id);
          setStatus('confirm');
          return;
        }
        void open(id,false);
      }catch {
        if(aliveRef.current && !controller.signal.aborted) setStatus('unavailable');
      }
    }

    const changed=(event:StorageEvent)=>{
      if(event.storageArea===localStorage && (!event.key || IDENTITY_CACHE_KEYS.has(event.key) ||
          event.key.startsWith('soullab:accounts:v1:'))){
        // The private view is unmounted synchronously on observable switches.
        checkCurrent();
      }
    };
    const onFocus=()=>checkCurrent();
    const onPageHide=()=>{setView(null);requestRef.current?.abort();};
    const onMessage=()=>checkCurrent();
    window.addEventListener('storage',changed);
    window.addEventListener('focus',onFocus);
    window.addEventListener('pageshow',onFocus);
    window.addEventListener('pagehide',onPageHide);
    document.addEventListener('visibilitychange',onFocus);
    if(typeof BroadcastChannel!=='undefined'){
      channelRef.current=new BroadcastChannel(ACCOUNT_CHANNEL);
      channelRef.current.addEventListener('message',onMessage);
    }
    void start();
    return()=>{
      aliveRef.current=false;controller.abort();
      requestRef.current?.abort();sequence.current+=1;
      window.removeEventListener('storage',changed);
      window.removeEventListener('focus',onFocus);
      window.removeEventListener('pageshow',onFocus);
      window.removeEventListener('pagehide',onPageHide);
      document.removeEventListener('visibilitychange',onFocus);
      channelRef.current?.removeEventListener('message',onMessage);
      channelRef.current?.close();channelRef.current=null;
    };
  },[checkCurrent,close,open]);

  // The private view is never mounted during SSR or until all checks pass.
  if(status==='open' && view) return <ClientHouseExperience current={destination} data={view}/>;
  return <main className="min-h-screen bg-[#f5f2ea] px-6 py-20 text-[#2d3432]">
    <div className="mx-auto max-w-xl">
      <p className="text-xs uppercase tracking-[0.22em] text-stone-600">Soullab · {destination==='home'?'Home':'House'}</p>
      <h1 className="mt-7 text-3xl font-light">
        {status==='checking'?'Checking your account…':
         status==='confirm'?'Continue with this signed-in account?':
         'This room is waiting for account verification.'}
      </h1>
      {status==='confirm' && pending && <>
        <p className="mt-5 text-stone-700">This browser has no previous account selection. Your local information will not be imported from another account.</p>
        <button type="button" className="mt-7 rounded-lg bg-[#263e3a] px-5 py-3 text-white"
          onClick={()=>{setStatus('checking');void open(pending,true);}}>Continue into Soullab</button>
      </>}
      {status==='unavailable' && <>
        <p className="mt-5 text-stone-700">We could not safely reconcile this browser with the signed-in account. Your previous browser information has not been moved or cleared.</p>
        <button type="button" className="mt-7 rounded-lg border border-stone-400 px-5 py-3"
          onClick={()=>window.location.reload()}>Try again</button>
      </>}
    </div>
  </main>;
}
