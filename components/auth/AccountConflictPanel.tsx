'use client';

import {useState} from 'react';
import Link from 'next/link';
import {useRouter} from 'next/navigation';
import {ACCOUNT_CHANNEL} from '@/lib/auth/accountScopedStorage';

/**
 * Neutral conflict state. No member name, stored browser text, plan or
 * credentials are rendered; old browser information is not moved or deleted.
 */
export function AccountConflictPanel() {
  const router = useRouter();
  const [busy,setBusy] = useState(false);
  const [error,setError] = useState('');

  async function signOutCurrentSession() {
    if (busy) return;
    setBusy(true);setError('');
    try {
      const response = await fetch('/api/members/signout', {
        method:'POST',credentials:'same-origin',cache:'no-store',
      });
      if (!response.ok) throw new Error('signout_refused');
      // The only browser change is an explicit sign-out latch. Preserve
      // all prior member browser files and settings for governed recovery.
      localStorage.setItem('maia_signed_out','1');
      if (typeof BroadcastChannel !== 'undefined') {
        const channel=new BroadcastChannel(ACCOUNT_CHANNEL);
        channel.postMessage({kind:'account-session-ended'});
        channel.close();
      }
      router.replace('/signin?next=%2Fhome');
    } catch {
      setError('Sign-out could not be confirmed. Your session and local information have not been deliberately changed. Please retry.');
      setBusy(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f5f2ea] px-6 py-16 text-[#2d3432]">
      <section className="mx-auto max-w-xl">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-stone-600">Soullab · Account boundary</p>
        <h1 className="mt-6 text-4xl font-light leading-tight">This browser remembers another account.</h1>
        <p className="mt-7 text-lg leading-relaxed text-stone-700">
          The signed-in session and the information already on this browser do not match.
          We have stopped before opening member-specific spaces.
        </p>
        <p className="mt-5 leading-relaxed text-stone-700">
          Nothing will be merged, transferred, or erased automatically. You may sign out
          of the current session and then deliberately choose which account to use.
          Your existing browser information will stay on this device during this step.
        </p>
        <div className="mt-10 flex flex-col gap-4">
          <button type="button" disabled={busy} onClick={signOutCurrentSession}
            className="min-h-12 rounded-xl bg-[#263e3a] px-6 py-3 font-medium text-white disabled:opacity-60">
            {busy?'Confirming sign-out…':'Sign out of the current session'}
          </button>
          <Link href="/" className="min-h-12 rounded-xl border border-stone-400 px-6 py-3 text-center text-stone-700">
            Return to public Soullab
          </Link>
        </div>
        {error && <p role="alert" className="mt-6 text-sm text-red-800">{error}</p>}
        <p className="mt-8 text-sm text-stone-600">
          Switching accounts may need a separate review of information saved on this browser.
          We will not move that information into another account without permission.
        </p>
      </section>
    </main>
  );
}
