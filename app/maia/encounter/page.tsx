'use client';

import {useEffect,useRef,useState} from 'react';
import {MaiaEncounterPage} from '../page';
import {assessBrowserAccount} from '@/lib/auth/accountConflictBoundary';
import {restoreMaiaBrowserSessionFromServer} from '@/lib/auth/restoreMaiaBrowserSession';
import {ACCOUNT_CHANNEL,IDENTITY_CACHE_KEYS,accountScopeAgrees} from '@/lib/auth/accountScopedStorage';

/**
 * R5a: No MAIA component or conversation memory is mounted until the
 * HttpOnly server session and the browser identity are revalidated.
 * A mounted encounter is concealed while a tab regains focus or its
 * session may have changed. Browser storage is never an auth authority.
 *
 * Never delete, migrate or transfer previous member-local conversations.
 */
export default function GuardedMaiaEncounterPage() {
  const [admitted,setAdmitted]=useState(false);
  const [failure,setFailure]=useState(false);
  const firstMember=useRef<string|null>(null);

  useEffect(()=>{
    let live=true;
    let seq=0;
    let inflight:AbortController|null=null;

    async function validate(){
      if(!live) return;
      const ticket=++seq;
      inflight?.abort();
      const controller=new AbortController();
      inflight=controller;
      setAdmitted(false);setFailure(false);
      try{
        const response=await fetch('/api/members/session',{
          credentials:'same-origin',cache:'no-store',signal:controller.signal,
        });
        if(!response.ok) throw Error('SESSION_UNAVAILABLE');
        const payload=await response.json() as {
          authenticated?:boolean;member?:{id?:string;onboarded?:boolean};
        };
        const id=payload.member?.id;
        if(payload.authenticated!==true || payload.member?.onboarded!==true || !id){
          throw Error('SESSION_NOT_VERIFIED');
        }
        // A cookie-only switch can occur without any localStorage event.
        // Never carry a mounted A conversation into a B session.
        if(firstMember.current && firstMember.current!==id){
          if(live && ticket===seq) window.location.replace('/account/conflict');
          return;
        }
        if(assessBrowserAccount(localStorage,id)==='conflict' ||
            assessBrowserAccount(localStorage,id)==='unverifiable' ||
            !accountScopeAgrees(localStorage,id)){
          if(live && ticket===seq) window.location.replace('/account/conflict');
          return;
        }
        const hydrated=await restoreMaiaBrowserSessionFromServer({
          fetchSession:async()=>new Response(JSON.stringify(payload),{status:200}),
          storage:localStorage,version:2,
        });
        if(!hydrated) throw Error('DISPLAY_CACHE_UNAVAILABLE');

        // Defensive check after any awaited cache work; server identity is
        // still the authority, never explorerId/beta_user assertions.
        const finalResponse=await fetch('/api/members/session',{
          credentials:'same-origin',cache:'no-store',signal:controller.signal,
        });
        if(!finalResponse.ok) throw Error('SESSION_RECHECK_UNAVAILABLE');
        const final=await finalResponse.json() as {
          authenticated?:boolean;member?:{id?:string};
        };
        if(final.authenticated!==true || final.member?.id!==id ||
            assessBrowserAccount(localStorage,id)!=='aligned' ||
            !accountScopeAgrees(localStorage,id)){
          if(live && ticket===seq) window.location.replace('/account/conflict');
          return;
        }
        if(!live || controller.signal.aborted || ticket!==seq) return;
        firstMember.current=id;
        setAdmitted(true);
      }catch{
        if(live && ticket===seq && !controller.signal.aborted){
          setAdmitted(false);setFailure(true);
        }
      }
    }

    const onResume=()=>{void validate();};
    const onVisibility=()=>{
      if(document.visibilityState!=='visible'){
        // Unmount old conversation immediately while the page is hidden;
        // returning must recheck the actual HttpOnly session.
        ++seq;inflight?.abort();setAdmitted(false);
      } else onResume();
    };
    const onStorage=(event:StorageEvent)=>{
      if(event.storageArea===localStorage && (!event.key ||
          IDENTITY_CACHE_KEYS.has(event.key) ||
          event.key.startsWith('soullab:accounts:v1:'))) onResume();
    };
    const channel=typeof BroadcastChannel!=='undefined' ?
      new BroadcastChannel(ACCOUNT_CHANNEL):null;
    const onBroadcast=()=>onResume();
    const onPageHide=()=>{++seq;inflight?.abort();setAdmitted(false);};
    window.addEventListener('storage',onStorage);
    window.addEventListener('focus',onResume);
    window.addEventListener('pageshow',onResume);
    window.addEventListener('pagehide',onPageHide);
    document.addEventListener('visibilitychange',onVisibility);
    channel?.addEventListener('message',onBroadcast);
    void validate();
    return()=>{
      live=false;++seq;inflight?.abort();
      window.removeEventListener('storage',onStorage);
      window.removeEventListener('focus',onResume);
      window.removeEventListener('pageshow',onResume);
      window.removeEventListener('pagehide',onPageHide);
      document.removeEventListener('visibilitychange',onVisibility);
      channel?.removeEventListener('message',onBroadcast);
      channel?.close();
    };
  },[]);

  if(admitted) return <MaiaEncounterPage />;
  return <main className="min-h-screen bg-[#071426] px-6 py-20 text-white">
    <div className="mx-auto max-w-lg">
      <p className="text-xs uppercase tracking-[0.22em] text-white/60">Soullab · MAIA</p>
      <h1 className="mt-6 text-3xl font-light">
        {failure?'We could not verify this encounter.':'Confirming your account…'}
      </h1>
      {failure && <a href="/signin?next=%2Fmaia%2Fencounter" className="mt-7 inline-block underline">
        Return to sign-in
      </a>}
    </div>
  </main>;
}
