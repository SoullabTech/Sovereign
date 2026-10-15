'use client';

import { useCallback, useEffect, useState } from 'react';
import { apiFetch } from '@/lib/http/apiBase';

type NoticeResponse = {
  status: 'notice_pending' | 'awaiting_member_decision' | 'accepted';
  canAccept?: boolean;
  notice?: string;
  version?: string;
  sha256?: string;
  accepted?: boolean;
};

export default function WriterStudioBetaConsent() {
  const [record, setRecord] = useState<NoticeResponse | null>(null);
  const [problem, setProblem] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setProblem(null);
    try {
      const res = await apiFetch('/api/beta/consent', { cache:'no-store' });
      if (res.status === 401) { window.location.assign('/signin'); return; }
      if (res.status === 503) {
        setRecord({ status:'notice_pending', canAccept:false });
        return;
      }
      if (!res.ok) throw new Error('This invitation is not available.');
      const body = await res.json() as NoticeResponse;
      if (!body.notice || !body.version || !body.sha256 || body.canAccept !== true) {
        throw new Error('The consent notice is not available.');
      }
      setRecord(body);
    } catch {
      setRecord(null);
      setProblem('Unable to verify your invitation. Please try again later.');
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const decide = async (decision: 'accept'|'revoke') => {
    if (busy || !record?.canAccept || !record.notice) return;
    setBusy(true);setProblem(null);
    try {
      const res = await apiFetch('/api/beta/consent', {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify(decision === 'accept'
          ? { decision, policyVersion: record.version, policySHA256: record.sha256 }
          : { decision }),
      });
      if (!res.ok) throw new Error('Consent could not be recorded.');
      await load();
    } catch {
      setProblem('Your choice was not confirmed. Please try again.');
    } finally { setBusy(false); }
  };

  return (
    <main className="min-h-screen bg-[#f5f2ea] text-[#292c30] px-6 py-14">
      <section className="mx-auto max-w-2xl rounded-2xl border border-[#dad6cc] bg-[#fffefb] px-7 py-9 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#647178]">
          Soullab · Writer’s Studio
        </p>
        <h1 className="mt-4 font-serif text-3xl">Your beta invitation</h1>
        <p className="mt-4 text-base leading-7">
          You are signed in. Your writing room stays private until you choose whether to participate.
        </p>
        {!record && !problem && <p role="status" className="mt-6">Checking your invitation…</p>}
        {record?.status === 'notice_pending' && (
          <p role="status" className="mt-6 rounded-lg bg-[#f1eee5] p-5 leading-7">
            The participation notice is not yet approved. No agreement is being requested
            and your Studio access remains closed.
          </p>
        )}
        {record?.notice && (
          <>
            <h2 className="mt-8 font-serif text-xl">Participation terms</h2>
            <p className="mt-1 text-xs text-[#647178]">Version {record.version}</p>
            <div className="mt-4 whitespace-pre-wrap rounded-lg border border-[#dad6cc] bg-[#faf9f6] p-5 leading-7">
              {record.notice}
            </div>
            {record.accepted ? (
              <div className="mt-7 flex flex-wrap items-center gap-4">
                <a href="/writers-studio?mode=home" className="rounded-lg bg-[#263b44] px-5 py-3 text-white">
                  Enter Writer’s Studio
                </a>
                <button disabled={busy} type="button"
                  onClick={() => void decide('revoke')}
                  className="rounded-lg border border-[#b9b5aa] px-5 py-3 disabled:opacity-50">
                  Withdraw consent
                </button>
              </div>
            ) : (
              <div className="mt-7">
                <button disabled={busy} type="button" onClick={() => void decide('accept')}
                  className="rounded-lg bg-[#263b44] px-5 py-3 text-white disabled:opacity-50">
                  I agree to participate
                </button>
                <p className="mt-3 text-sm leading-6 text-[#64625d]">
                  No acceptance is recorded until you choose this button.
                </p>
              </div>
            )}
          </>
        )}
        {problem && <p role="alert" className="mt-6 text-[#8b3d32]">{problem}</p>}
        <div className="mt-10 border-t border-[#dad6cc] pt-5">
          <a href="/beta/custody" className="text-sm underline underline-offset-4">
            Download or delete my own writing
          </a>
          <p className="mt-4 text-sm leading-6 text-[#626568]">
            Withdrawing consent stops further Studio participation. Your existing writing
            must remain eligible for member-controlled export and deletion; those controls
            are under separate beta qualification.
          </p>
        </div>
      </section>
    </main>
  );
}
