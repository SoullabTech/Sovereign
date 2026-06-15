'use client';

import { useCallback, useEffect, useState } from 'react';
import SovereignLobby, { type LobbyRetention } from '@/components/session/SovereignLobby';

interface AgreementData {
  version: string;
  maiaRetention: string | null;
  providerNotice: string | null;
  provider: string | null;
}

interface JoinData {
  ok: boolean;
  agreement: AgreementData;
  retention: LobbyRetention | null;
  state: 'pending' | 'accepted' | 'refused';
  canDecide: boolean;
  decideReason: string | null;
  videoLink: string | null;
  linkBlockedReason: string | null;
}

type View = 'loading' | 'invalid' | 'version_changed' | 'pending' | 'accepted' | 'refused';

export default function JoinClient({ token }: { token: string }) {
  const [data, setData] = useState<JoinData | null>(null);
  const [view, setView] = useState<View>('loading');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [videoLink, setVideoLink] = useState<string | null>(null);

  const load = useCallback(async () => {
    setView('loading');
    setError(null);
    try {
      const res = await fetch(`/api/session/join/${encodeURIComponent(token)}`, { cache: 'no-store' });
      if (res.status === 401) {
        setView('invalid');
        return;
      }
      const d: JoinData = await res.json();
      if (!d?.ok) {
        setView('invalid');
        return;
      }
      setData(d);
      setVideoLink(d.videoLink);
      if (d.state === 'refused') setView('refused');
      else if (d.state === 'accepted') setView('accepted');
      else if (d.canDecide) setView('pending');
      else if (d.decideReason === 'stale_version') setView('version_changed');
      else setView('invalid');
    } catch {
      setView('invalid');
    }
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  const decide = useCallback(
    async (decision: 'accept' | 'refuse') => {
      setBusy(true);
      setError(null);
      try {
        const res = await fetch(`/api/session/join/${encodeURIComponent(token)}/${decision}`, { method: 'POST' });
        const d = await res.json().catch(() => ({}));
        if (!res.ok) {
          setError('We could not record your choice. The link may have changed — reloading.');
          await load();
          return;
        }
        if (decision === 'accept') {
          setVideoLink(d.videoLink ?? null);
          setView('accepted');
        } else {
          setView('refused');
        }
      } catch {
        setError('Something went wrong. Please try again.');
      } finally {
        setBusy(false);
      }
    },
    [token, load]
  );

  if (view === 'accepted' && data) {
    return <SovereignLobby agreement={data.agreement} retention={data.retention} videoLink={videoLink} />;
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-stone-50 px-4 py-10">
      <div className="w-full max-w-md rounded-2xl border border-stone-200 bg-white p-7 shadow-sm">
        {view === 'loading' && <p className="text-center text-stone-500">Loading…</p>}

        {view === 'invalid' && (
          <div className="text-center">
            <h1 className="text-lg font-medium text-stone-800">This session link is no longer valid</h1>
            <p className="mt-2 text-sm text-stone-500">Please ask your practitioner for a new link.</p>
          </div>
        )}

        {view === 'version_changed' && (
          <div className="text-center">
            <h1 className="text-lg font-medium text-stone-800">The agreement has changed</h1>
            <p className="mt-2 text-sm text-stone-500">
              This link was for a previous version. Please ask your practitioner for a new link to review and accept the
              current agreement.
            </p>
          </div>
        )}

        {view === 'refused' && (
          <div className="text-center">
            <h1 className="text-lg font-medium text-stone-800">You declined this agreement</h1>
            <p className="mt-2 text-sm text-stone-500">
              The session link was not opened. If this was a mistake, your practitioner can send a new invitation.
            </p>
          </div>
        )}

        {view === 'pending' && data && (
          <div>
            <h1 className="text-lg font-medium text-stone-800">Before you join</h1>
            <p className="mt-1 text-sm text-stone-500">Please review how this session will be handled.</p>

            <div className="mt-5 rounded-xl border border-stone-200 bg-stone-50 p-4">
              <p className="text-sm leading-relaxed text-stone-700">{data.agreement.maiaRetention}</p>
            </div>

            {data.agreement.providerNotice && (
              <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-amber-700">About the video</p>
                <p className="mt-1 text-sm leading-relaxed text-amber-900">{data.agreement.providerNotice}</p>
              </div>
            )}

            {error && <p className="mt-4 text-sm text-rose-600">{error}</p>}

            <div className="mt-6 flex flex-col gap-2">
              <button
                onClick={() => decide('accept')}
                disabled={busy}
                className="w-full rounded-xl bg-emerald-600 px-5 py-3 font-medium text-white hover:bg-emerald-500 disabled:opacity-60"
              >
                Accept and continue
              </button>
              <button
                onClick={() => decide('refuse')}
                disabled={busy}
                className="w-full rounded-xl border border-stone-300 px-5 py-3 font-medium text-stone-600 hover:bg-stone-50 disabled:opacity-60"
              >
                Decline
              </button>
            </div>

            <p className="mt-4 text-center text-xs text-stone-400">The video link appears only after you accept.</p>
          </div>
        )}
      </div>
    </main>
  );
}
