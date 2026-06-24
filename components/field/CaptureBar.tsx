'use client';

/**
 * Capture bar — the member-visible vertical of Natural Language Capture.
 *
 * type → parse (/api/field/capture/parse) → show the interpretation →
 * the member confirms (and may edit) → on yes, create a real calendar event
 * via the existing writer (/api/studio/calendar/events).
 *
 * Constitutional contract, visible in the flow:
 *  - Nothing is written until the member explicitly confirms.
 *  - `accompaniment` is routed AWAY from structuring — it is received, never filed.
 *  - The inferred travel/reminder note is shown as editable text, never applied silently.
 */
import { useState } from 'react';
import { apiFetch } from '@/lib/http/apiBase';
import type { CaptureCandidate, ParseCaptureResult } from '@/lib/studio/intent/parseCapture';
import { buildCalendarEventPayload } from '@/lib/studio/intent/commitCandidate';

type Phase = 'idle' | 'parsing' | 'confirm' | 'committing' | 'done' | 'received' | 'unsupported' | 'error';

interface CalForm {
  title: string;
  date: string;
  time: string;
  location: string;
  person: string;
  note: string;
}

const card = 'rounded-xl border border-black/10 dark:border-white/15 bg-black/[0.03] dark:bg-white/5 p-4';
const field =
  'w-full rounded-md border border-black/15 dark:border-white/20 bg-transparent px-3 py-2 text-sm outline-none focus:border-black/40 dark:focus:border-white/40';
const label = 'text-xs uppercase tracking-wide opacity-60';

export default function CaptureBar() {
  const [input, setInput] = useState('');
  const [phase, setPhase] = useState<Phase>('idle');
  const [candidate, setCandidate] = useState<CaptureCandidate | null>(null);
  const [form, setForm] = useState<CalForm | null>(null);
  const [message, setMessage] = useState('');

  const tz =
    typeof Intl !== 'undefined' ? Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC' : 'UTC';

  function reset() {
    setPhase('idle');
    setCandidate(null);
    setForm(null);
    setMessage('');
    setInput('');
  }

  async function handleParse() {
    const text = input.trim();
    if (!text) return;
    setPhase('parsing');
    setMessage('');
    try {
      const res = await apiFetch('/api/field/capture/parse', {
        method: 'POST',
        body: JSON.stringify({ input: text, timezone: tz }),
      });
      if (!res.ok) {
        setPhase('error');
        setMessage(res.status === 401 ? 'Please sign in to use capture.' : 'I could not read that just now.');
        return;
      }
      const data: ParseCaptureResult = await res.json();
      const top = data.candidates[0];
      if (!top) {
        setPhase('received');
        setMessage('I heard you. Nothing here is asking to be filed.');
        return;
      }
      setCandidate(top);

      if (top.kind === 'accompaniment') {
        setPhase('received');
        setMessage(
          top.possibleInterpretations?.length
            ? `This sounds like something to stay with — ${top.possibleInterpretations.join('; ')}.`
            : 'This sounds like something to be with, not something to file.',
        );
        return;
      }

      if (top.kind !== 'calendar_event') {
        setPhase('unsupported');
        setMessage(
          `I hear a ${top.kind.replace(/_/g, ' ')}. For now I can only turn this into a calendar event — more is coming.`,
        );
        return;
      }

      const f = top.fields;
      const locParts = [f.location, f.city].filter((x): x is string => typeof x === 'string' && x.trim().length > 0);
      setForm({
        title: typeof top.title === 'string' ? top.title : 'Meeting',
        date: typeof f.date === 'string' ? f.date : '',
        time: typeof f.startTime === 'string' ? f.startTime : '',
        location: locParts.join(', '),
        person: typeof f.person === 'string' ? f.person : '',
        note: typeof f.travelNote === 'string' ? f.travelNote : '',
      });
      setPhase('confirm');
    } catch {
      setPhase('error');
      setMessage('Something went wrong reading that.');
    }
  }

  async function handleCommit() {
    if (!form) return;
    const edited: CaptureCandidate = {
      kind: 'calendar_event',
      confidence: 'high',
      title: form.title,
      fields: {
        date: form.date,
        startTime: form.time,
        location: form.location,
        person: form.person,
        travelNote: form.note,
      },
    };
    const payload = buildCalendarEventPayload(edited, { timezone: tz });
    if (!payload) {
      setMessage('I need at least a date and a time to add this.');
      return;
    }
    setPhase('committing');
    try {
      const res = await apiFetch('/api/studio/calendar/events', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        setPhase('error');
        setMessage('I could not create the event.');
        return;
      }
      setPhase('done');
      setMessage(`Added "${payload.title}" to your calendar.`);
    } catch {
      setPhase('error');
      setMessage('Something went wrong creating the event.');
    }
  }

  function setField<K extends keyof CalForm>(key: K, value: string) {
    setForm((prev) => (prev ? { ...prev, [key]: value } : prev));
  }

  return (
    <div className="flex flex-col gap-3" data-testid="capture-bar">
      {(phase === 'idle' || phase === 'parsing') && (
        <div className="flex flex-col gap-2">
          <textarea
            data-testid="capture-input"
            className={field}
            rows={2}
            placeholder="Say it however it comes — “10am meeting today with Nathan at Common Ground Coffee in Branford, MA”"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleParse();
            }}
          />
          <button
            data-testid="capture-submit"
            className="self-end rounded-md border border-black/20 dark:border-white/25 px-4 py-2 text-sm disabled:opacity-40"
            disabled={phase === 'parsing' || !input.trim()}
            onClick={handleParse}
          >
            {phase === 'parsing' ? 'Reading…' : 'Capture'}
          </button>
        </div>
      )}

      {phase === 'confirm' && form && (
        <div className={card} data-testid="confirm-card">
          {candidate?.clarifyingQuestion && (
            <p className="mb-3 text-sm opacity-80">{candidate.clarifyingQuestion}</p>
          )}
          <p className="mb-3 text-sm opacity-70">I heard a calendar event. Edit anything, then confirm.</p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <div className={label}>Title</div>
              <input className={field} value={form.title} onChange={(e) => setField('title', e.target.value)} />
            </div>
            <div>
              <div className={label}>Date</div>
              <input className={field} type="date" value={form.date} onChange={(e) => setField('date', e.target.value)} />
            </div>
            <div>
              <div className={label}>Time</div>
              <input className={field} type="time" value={form.time} onChange={(e) => setField('time', e.target.value)} />
            </div>
            <div className="sm:col-span-2">
              <div className={label}>Location</div>
              <input className={field} value={form.location} onChange={(e) => setField('location', e.target.value)} />
            </div>
            <div>
              <div className={label}>With</div>
              <input className={field} value={form.person} onChange={(e) => setField('person', e.target.value)} />
            </div>
            <div>
              <div className={label}>Note (e.g. travel)</div>
              <input className={field} value={form.note} onChange={(e) => setField('note', e.target.value)} />
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <button
              data-testid="confirm-add"
              className="rounded-md border border-black/30 dark:border-white/35 px-4 py-2 text-sm font-medium"
              onClick={handleCommit}
            >
              Add to calendar
            </button>
            <button className="rounded-md px-4 py-2 text-sm opacity-70" onClick={reset}>
              Not now
            </button>
          </div>
        </div>
      )}

      {phase === 'committing' && <p className="text-sm opacity-70">Adding…</p>}

      {(phase === 'done' || phase === 'received' || phase === 'unsupported' || phase === 'error') && (
        <div className={card}>
          <p data-testid="result-message" className="text-sm">
            {message}
          </p>
          <button className="mt-3 rounded-md px-3 py-1.5 text-sm opacity-70" onClick={reset}>
            Capture something else
          </button>
        </div>
      )}
    </div>
  );
}
