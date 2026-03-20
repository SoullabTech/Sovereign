'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface InviteAcceptClientProps {
  token: string;
  email: string;
  inviterName: string;
  message: string | null;
  currentMemberId: string | null;
}

export function InviteAcceptClient({
  token,
  email,
  inviterName,
  message,
  currentMemberId,
}: InviteAcceptClientProps) {
  const router = useRouter();
  const [status, setStatus] = useState<'idle' | 'accepting' | 'done' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const accept = async () => {
    setStatus('accepting');
    try {
      const res = await fetch(`/api/team/invite/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      if (res.ok) {
        setStatus('done');
        setTimeout(() => router.push('/team'), 1500);
      } else {
        const d = await res.json().catch(() => ({}));
        setErrorMsg(d.error ?? 'Failed to accept invite');
        setStatus('error');
      }
    } catch {
      setErrorMsg('Network error — please try again');
      setStatus('error');
    }
  };

  if (status === 'done') {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto">
            <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-xl font-semibold text-white/90">Welcome to Soullab</h1>
          <p className="text-white/40 text-sm">Taking you to the team workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-6">
        {/* Holoflower wordmark */}
        <div className="text-center">
          <p className="text-xs font-semibold tracking-[0.18em] text-white/30 uppercase">Soullab</p>
        </div>

        <div className="bg-zinc-900 border border-white/10 rounded-2xl p-8 space-y-5">
          <div className="text-center space-y-2">
            <h1 className="text-xl font-semibold text-white/90">You've been invited</h1>
            <p className="text-white/50 text-sm">
              <span className="text-amber-400/80">{inviterName}</span> has invited you to join the Soullab team workspace.
            </p>
          </div>

          {message && (
            <div className="bg-zinc-800/60 border border-white/8 rounded-xl px-4 py-3">
              <p className="text-white/50 text-sm italic">"{message}"</p>
              <p className="text-white/25 text-xs mt-1">— {inviterName}</p>
            </div>
          )}

          <div className="bg-zinc-800/40 rounded-lg px-3 py-2.5 text-xs text-white/30">
            Invite sent to <span className="text-white/50">{email}</span>
          </div>

          {status === 'error' && (
            <p className="text-red-400/80 text-sm text-center">{errorMsg}</p>
          )}

          {currentMemberId ? (
            <button
              onClick={accept}
              disabled={status === 'accepting'}
              className="w-full py-3 rounded-xl bg-amber-500 text-black text-sm font-semibold hover:bg-amber-400 transition-colors disabled:opacity-50"
            >
              {status === 'accepting' ? 'Accepting...' : 'Accept & join workspace'}
            </button>
          ) : (
            <div className="space-y-3">
              <a
                href={`/signin?next=/team/invite/${token}`}
                className="block w-full py-3 rounded-xl bg-amber-500 text-black text-sm font-semibold hover:bg-amber-400 transition-colors text-center"
              >
                Sign in to accept
              </a>
              <a
                href={`/begin?next=/team/invite/${token}`}
                className="block w-full py-3 rounded-xl bg-zinc-800 border border-white/10 text-white/60 text-sm font-medium hover:text-white/80 hover:bg-zinc-700 transition-colors text-center"
              >
                New to Soullab? Create account
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
