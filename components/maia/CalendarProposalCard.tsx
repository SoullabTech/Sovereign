'use client';

import { useState } from 'react';
import { CalendarPlus, Check, X } from 'lucide-react';
import { apiFetch, getValidMemberId } from '@/lib/http/apiBase';
import type { Proposal, CalendarEventPayload } from '@/lib/maia/proposals/types';

/**
 * Calendar proposal card — the consent surface for MAIA_CONSENT_GATES Art. 2.
 *
 * MAIA proposes; this card lets the member edit the payload (title, times, notes,
 * location) and confirm. Only Confirm writes — it POSTs to the consent-gated
 * route, the sole path to the executor. Dismiss writes nothing and weighs equal
 * to Confirm (Art. 7 — decline costs nothing).
 *
 * It is an EDIT surface, not a button: consent to an uneditable proposal is
 * rubber-stamping. The rationale (provenance) is shown so the member can judge
 * why MAIA proposed this — and catch e.g. a wrong timezone (the datetime fields
 * render in the member's LOCAL time) before anything is written.
 */

function toLocalInput(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function fromLocalInput(local: string): string {
  const d = new Date(local);
  return isNaN(d.getTime()) ? local : d.toISOString();
}

function formatConfirmed(startIso: string, title: string): string {
  const d = new Date(startIso);
  if (isNaN(d.getTime())) return title;
  return `${title} · ${d.toLocaleString([], {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })}`;
}

interface Props {
  proposal: Proposal<CalendarEventPayload>;
}

export function CalendarProposalCard({ proposal }: Props) {
  const p = proposal.payload;
  const [title, setTitle] = useState(p.title ?? '');
  const [start, setStart] = useState(toLocalInput(p.start));
  const [end, setEnd] = useState(toLocalInput(p.end));
  const [location, setLocation] = useState(p.location ?? '');
  const [description, setDescription] = useState(p.description ?? '');
  const [status, setStatus] = useState<'editing' | 'submitting' | 'confirmed' | 'dismissed'>('editing');
  const [error, setError] = useState<string | null>(null);
  const [confirmedLabel, setConfirmedLabel] = useState('');

  if (status === 'dismissed') return null;

  if (status === 'confirmed') {
    return (
      <div className="mt-2 flex items-center gap-2 px-3 py-2 text-xs rounded-lg bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
        <Check className="w-3.5 h-3.5 shrink-0" />
        <span>Added to your calendar — {confirmedLabel}</span>
      </div>
    );
  }

  const handleConfirm = async () => {
    setStatus('submitting');
    setError(null);
    const payload: CalendarEventPayload = {
      title: title.trim(),
      description: description.trim() || undefined,
      start: fromLocalInput(start),
      end: fromLocalInput(end),
      allDay: p.allDay ?? false,
      location: location.trim() || undefined,
    };
    try {
      const memberId = getValidMemberId();
      const res = await apiFetch('/api/sovereign/proposals/calendar/confirm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(memberId ? { 'x-member-id': memberId } : {}),
        },
        body: JSON.stringify({ payload }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.error || `Request failed (${res.status})`);
      }
      setConfirmedLabel(formatConfirmed(payload.start, payload.title));
      setStatus('confirmed');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not add the event.');
      setStatus('editing');
    }
  };

  const inputCls =
    'w-full bg-black/30 border border-white/10 rounded-md px-2.5 py-1.5 text-sm text-white/90 ' +
    'focus:outline-none focus:border-emerald-500/40 placeholder-white/30';

  return (
    <div className="mt-3 rounded-xl border border-emerald-500/20 bg-emerald-500/[0.04] p-3.5 max-w-md">
      <div className="flex items-center gap-2 mb-2 text-emerald-300">
        <CalendarPlus className="w-4 h-4" />
        <span className="text-xs font-medium tracking-wide uppercase">Proposed event</span>
      </div>

      {proposal.rationale && (
        <p className="text-[11px] leading-snug text-white/45 mb-3 italic">{proposal.rationale}</p>
      )}

      <div className="space-y-2">
        <input
          className={inputCls}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
        />
        <div className="grid grid-cols-2 gap-2">
          <label className="block">
            <span className="text-[10px] uppercase tracking-wide text-white/40">Starts</span>
            <input
              type="datetime-local"
              className={inputCls}
              value={start}
              onChange={(e) => setStart(e.target.value)}
            />
          </label>
          <label className="block">
            <span className="text-[10px] uppercase tracking-wide text-white/40">Ends</span>
            <input
              type="datetime-local"
              className={inputCls}
              value={end}
              onChange={(e) => setEnd(e.target.value)}
            />
          </label>
        </div>
        <input
          className={inputCls}
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Location (optional)"
        />
        <textarea
          className={inputCls}
          rows={2}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Notes (optional)"
        />
      </div>

      {error && <p className="text-[11px] text-rose-300 mt-2">{error}</p>}

      <div className="flex items-center gap-2 mt-3">
        <button
          onClick={handleConfirm}
          disabled={status === 'submitting' || !title.trim()}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/25 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Check className="w-3 h-3" />
          {status === 'submitting' ? 'Adding…' : 'Add to calendar'}
        </button>
        <button
          onClick={() => setStatus('dismissed')}
          disabled={status === 'submitting'}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-full text-white/50 border border-white/10 hover:bg-white/5 transition-colors"
        >
          <X className="w-3 h-3" />
          Dismiss
        </button>
      </div>
    </div>
  );
}
