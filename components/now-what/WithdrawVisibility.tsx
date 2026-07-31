'use client';

/**
 * Now What? — withdraw practitioner visibility from one kept thread.
 *
 * Lane V invariant (ruled 2026-07-30):
 *   The environment must not disclose practitioner visibility without also
 *   making the member's authority over that visibility available and
 *   intelligible.
 *
 * So this component is deliberately inseparable from the disclosure it sits
 * beside. Wherever "· shared with your practitioner" is rendered, this renders
 * with it. Removing the control is not a valid way to satisfy the invariant —
 * that would remove legibility while leaving practitioner access intact, which
 * is the inverse failure.
 *
 * WHY THERE IS A CONFIRM STEP
 * Withdrawal is currently one-directional: no route restores practitioner
 * visibility on a kept thread, and sharing is otherwise decided only once, at
 * keep-time, inside a session. An accidental click cannot be walked back, so
 * the consequence is stated before the act — including the part we cannot yet
 * offer. Claim discipline: the copy says what is true today, not what is
 * planned.
 *
 * The withdrawal changes only who may see the thread. It does not release,
 * archive, reorder, or otherwise touch the member's own relationship to it.
 */

import { useState } from 'react';
import { apiFetch } from '@/lib/http/apiBase';

type Phase = 'idle' | 'confirming' | 'pending' | 'withdrawn' | 'error';

export function WithdrawVisibility({
  threadId,
  onWithdrawn,
}: {
  threadId: string;
  /** Lets the parent drop the row's shared-state locally without a refetch. */
  onWithdrawn?: (threadId: string) => void;
}) {
  const [phase, setPhase] = useState<Phase>('idle');
  const [error, setError] = useState<string | null>(null);

  async function withdraw() {
    setPhase('pending');
    setError(null);
    try {
      const res = await apiFetch(`/api/now-what/field-note/${encodeURIComponent(threadId)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'withdraw_practitioner_visibility' }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.error || 'Could not complete that just now.');
      setPhase('withdrawn');
      onWithdrawn?.(threadId);
    } catch (e: any) {
      setError(e.message);
      setPhase('error');
    }
  }

  if (phase === 'withdrawn') {
    return (
      <span className="ml-2 text-slate-500" role="status">
        · withdrawn — your practitioner can no longer see this
      </span>
    );
  }

  if (phase === 'confirming' || phase === 'pending' || phase === 'error') {
    return (
      <span className="mt-2 block rounded-lg border border-slate-600/50 bg-white/[0.03] p-3 text-xs font-light leading-relaxed text-slate-400">
        <span className="block text-slate-300">Withdraw this from your practitioner?</span>
        <span className="mt-1 block">
          They will no longer see it. It stays in your field, in your words, unchanged.
        </span>
        <span className="mt-1 block text-slate-500">
          This cannot be undone here — there is no way to share a kept thread again yet.
        </span>
        {error && (
          <span role="alert" className="mt-2 block text-red-400">
            {error}
          </span>
        )}
        <span className="mt-3 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={withdraw}
            disabled={phase === 'pending'}
            className="rounded-full border border-slate-500/60 px-4 py-1.5 text-slate-200 transition-colors hover:border-slate-400 disabled:opacity-50"
          >
            {phase === 'pending' ? 'Withdrawing…' : 'Withdraw'}
          </button>
          <button
            type="button"
            onClick={() => {
              setPhase('idle');
              setError(null);
            }}
            disabled={phase === 'pending'}
            className="text-slate-500 underline underline-offset-4 transition-colors hover:text-slate-300 disabled:opacity-50"
          >
            Keep sharing
          </button>
        </span>
      </span>
    );
  }

  return (
    <>
      <span className="ml-2 text-slate-500">· shared with your practitioner</span>
      <button
        type="button"
        onClick={() => setPhase('confirming')}
        className="ml-2 text-slate-500 underline underline-offset-4 transition-colors hover:text-slate-300"
      >
        Withdraw
      </button>
    </>
  );
}
