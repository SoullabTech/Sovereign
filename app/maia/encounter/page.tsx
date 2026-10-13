'use client';

import {useEffect,useState} from 'react';
import {MaiaEncounterPage} from '../page';
import {assessBrowserAccount} from '@/lib/auth/accountConflictBoundary';
import {restoreMaiaBrowserSessionFromServer} from '@/lib/auth/restoreMaiaBrowserSession';

/**
 * The MAIA client is not even mounted until the verified session agrees with
 * the browser's account. Otherwise legacy MAIA effects can read the previous
 * person's locally cached data before the redirect has completed.
 */
export default function GuardedMaiaEncounterPage() {
  const [admitted,setAdmitted] = useState(false);
  const [failure,setFailure] = useState(false);

  useEffect(()=>{
    const abort = new AbortController();
    let current = true;
    async function validate() {
      try {
        const response = await fetch('/api/members/session',{
          credentials:'same-origin',cache:'no-store',signal:abort.signal,
        });
        if (!response.ok) throw new Error('invalid_session');
        const payload = await response.json() as {
          authenticated?:boolean;
          member?:{id?:string;onboarded?:boolean};
        };
        const id = payload.member?.id;
        if(payload.authenticated !== true || payload.member?.onboarded !== true || !id) {
          throw new Error('invalid_session');
        }
        const assessment = assessBrowserAccount(localStorage,id);
        if(assessment === 'conflict' || assessment === 'unverifiable') {
          if(current) window.location.replace('/account/conflict');
          return;
        }
        const hydrated = await restoreMaiaBrowserSessionFromServer({
          fetchSession: async()=>new Response(JSON.stringify(payload),{status:200}),
          storage:localStorage,version:2,
        });
        if(!hydrated) throw new Error('restore_refused');
        if(current) setAdmitted(true);
      } catch {
        if(current) setFailure(true);
      }
    }
    void validate();
    return ()=>{current=false;abort.abort()};
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
