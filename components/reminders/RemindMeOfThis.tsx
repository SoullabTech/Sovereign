'use client';

/**
 * "Remind me of this" — the member gesture for SELF-ADDRESSED-RETURN-01 Tier 1.
 *
 * The member writes themselves a note and chooses when it arrives. MAIA carries
 * the envelope; it does not compose, suggest, warm, or embellish the words.
 *
 * WHAT THIS COMPONENT MUST NEVER DO:
 *   - generate or suggest text on the member's behalf
 *   - appear in response to detected distress (it follows an AUTHORING act)
 *   - promise arrival at an exact instant (email cannot guarantee that)
 *   - imply the system will notice whether they came back
 *
 * The member sees, before committing: the exact text that will be sent, the
 * date and time, the timezone it is anchored to, and the channel.
 */

import { useState } from 'react';
import { apiFetch } from '@/lib/http/apiBase';

interface Props {
  sourceType: 'memory_atom' | 'daily_anchor' | 'member_note';
  sourceId?: string;
  /** Pre-fills the text when the member is scheduling something they kept. */
  initialText?: string;
  onScheduled?: (scheduledFor: string) => void;
}

const MAX = 2000;

export function RemindMeOfThis({ sourceType, sourceId, initialText = '', onScheduled }: Props) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState(initialText);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('09:00');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scheduledFor, setScheduledFor] = useState<string | null>(null);

  // The member's own zone, resolved in their browser and sent explicitly so the
  // server stores what they authored in rather than inferring it.
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  async function schedule() {
    setBusy(true);
    setError(null);
    try {
      // Local wall-clock → absolute instant, resolved ONCE here at authoring.
      const deliveryAt = new Date(`${date}T${time}`);
      if (Number.isNaN(deliveryAt.getTime()) || deliveryAt.getTime() <= Date.now()) {
        setError('Choose a date and time in the future.');
        return;
      }

      const res = await apiFetch('/api/reminders', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          sourceType,
          sourceId,
          deliveryAt: deliveryAt.toISOString(),
          timezone,
          deliveryText: text.trim(),
        }),
      });

      const body = await res.json();
      if (!res.ok) {
        setError(body?.error ?? 'That could not be scheduled.');
        return;
      }
      setScheduledFor(body.scheduledFor);
      onScheduled?.(body.scheduledFor);
    } catch {
      setError('That could not be scheduled.');
    } finally {
      setBusy(false);
    }
  }

  if (scheduledFor) {
    return (
      <div className="rounded-lg border border-amber-200/60 bg-amber-50/40 p-4 text-sm">
        <p className="text-neutral-800">Scheduled for {scheduledFor}</p>
        <p className="mt-1 text-neutral-500">You can cancel it anytime before sending.</p>
      </div>
    );
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-sm text-neutral-600 underline underline-offset-4 hover:text-neutral-900"
      >
        Remind me of this
      </button>
    );
  }

  const valid = text.trim().length > 0 && text.length <= MAX && date !== '';

  return (
    <div className="rounded-lg border border-neutral-200 p-4 text-sm">
      <label className="block text-neutral-700" htmlFor="reminder-text">
        What we&rsquo;ll send you — exactly these words:
      </label>
      <textarea
        id="reminder-text"
        value={text}
        maxLength={MAX}
        rows={4}
        onChange={(e) => setText(e.target.value)}
        className="mt-2 w-full rounded border border-neutral-300 p-2 font-normal"
        placeholder="Write it to yourself."
      />
      <p className="mt-1 text-xs text-neutral-500">
        {text.length}/{MAX} · we send this unchanged
      </p>

      <div className="mt-3 flex flex-wrap gap-3">
        <label className="text-neutral-700">
          Date
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="ml-2 rounded border border-neutral-300 p-1"
          />
        </label>
        <label className="text-neutral-700">
          Time
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="ml-2 rounded border border-neutral-300 p-1"
          />
        </label>
      </div>

      <p className="mt-2 text-xs text-neutral-500">
        Timezone: {timezone} · by email · sent shortly after the time you chose
      </p>

      {error && <p className="mt-2 text-xs text-red-700">{error}</p>}

      <div className="mt-4 flex gap-3">
        <button
          type="button"
          disabled={!valid || busy}
          onClick={schedule}
          className="rounded border border-amber-300 px-3 py-1.5 disabled:opacity-40"
        >
          {busy ? 'Scheduling…' : 'Schedule reminder'}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="text-neutral-500">
          Cancel
        </button>
      </div>
    </div>
  );
}
