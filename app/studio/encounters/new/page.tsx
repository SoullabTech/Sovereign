'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, ArrowLeft } from 'lucide-react';
import { apiFetch } from '@/lib/http/apiBase';

/** Best-effort display name for the practitioner's own room presence. */
function defaultHostName(): string {
  try {
    const raw = localStorage.getItem('beta_user');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (typeof parsed?.name === 'string' && parsed.name.trim()) return parsed.name.trim();
    }
  } catch {
    // fall through
  }
  return '';
}

const ENCOUNTER_TYPES: { value: string; label: string }[] = [
  { value: 'therapy_session', label: 'Therapy Session' },
  { value: 'coaching_session', label: 'Coaching Session' },
  { value: 'maia_conversation', label: 'MAIA Conversation' },
  { value: 'journal', label: 'Journal' },
  { value: 'dream', label: 'Dream Reflection' },
  { value: 'meeting', label: 'Meeting' },
  { value: 'workshop', label: 'Workshop' },
  { value: 'teaching_session', label: 'Teaching Session' },
  { value: 'voice_memo', label: 'Voice Memo' },
  { value: 'nature_reflection', label: 'Nature Reflection' },
  { value: 'supervision', label: 'Supervision' },
  { value: 'group_session', label: 'Group Session' },
  { value: 'family_conversation', label: 'Family Conversation' },
  { value: 'other', label: 'Other' },
];

export default function NewEncounterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id') ?? undefined;
  const defaultType = searchParams.get('encounter_type') ?? 'therapy_session';

  const [title, setTitle] = useState('');
  const [encounterType, setEncounterType] = useState(defaultType);
  const [note, setNote] = useState('');
  const [invitee, setInvitee] = useState('');
  const [hostName, setHostName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { setHostName(defaultHostName()); }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setSubmitting(true);
    setError(null);
    // Naming someone creates a live Session Room: both people become participants,
    // each with their own threshold (consent authored per-person, never on their behalf).
    const participants = invitee.trim()
      ? [
          { display_name: hostName.trim() || 'Host', role: 'practitioner' },
          { display_name: invitee.trim(), role: 'client' },
        ]
      : undefined;
    try {
      const res = await apiFetch('/api/studio/encounters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          encounter_type: encounterType,
          session_id: sessionId ?? null,
          note: note.trim() || null,
          ...(participants ? { participants } : {}),
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? 'Something went wrong.');
        setSubmitting(false);
        return;
      }
      const data = await res.json();
      router.push(`/studio/encounters/${data.encounter.id}`);
    } catch {
      setError('Could not create encounter. Please try again.');
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 px-4 py-10">
      <div className="max-w-lg mx-auto">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-slate-400 hover:text-slate-200 mb-8 text-sm transition-colors"
        >
          <ArrowLeft size={16} />
          Back
        </button>

        <h1 className="text-2xl font-semibold text-slate-100 mb-1">New Encounter</h1>
        <p className="text-slate-400 text-sm mb-8">
          Begin by naming this encounter and choosing its type.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm text-slate-300 mb-2" htmlFor="title">
              Title
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Name this encounter..."
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-slate-500 transition-colors"
              autoFocus
              required
            />
          </div>

          <div>
            <label className="block text-sm text-slate-300 mb-2" htmlFor="encounter_type">
              What kind of encounter is this?
            </label>
            <select
              id="encounter_type"
              value={encounterType}
              onChange={e => setEncounterType(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-slate-100 focus:outline-none focus:border-slate-500 transition-colors"
            >
              {ENCOUNTER_TYPES.map(t => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm text-slate-300 mb-2" htmlFor="invitee">
              Who is joining? <span className="text-slate-500">(optional — opens a live Session Room)</span>
            </label>
            <input
              id="invitee"
              type="text"
              value={invitee}
              onChange={e => setInvitee(e.target.value)}
              placeholder="Their name, e.g. Jondi"
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-slate-500 transition-colors"
            />
            {invitee.trim() && (
              <div className="mt-3">
                <label className="block text-sm text-slate-300 mb-2" htmlFor="hostName">
                  Your name in the room
                </label>
                <input
                  id="hostName"
                  type="text"
                  value={hostName}
                  onChange={e => setHostName(e.target.value)}
                  placeholder="Your name"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-slate-500 transition-colors"
                />
                <p className="text-xs text-slate-500 mt-2">
                  You&apos;ll get an invite link to send them and an Enter Room button for yourself.
                  Each person consents on their own device before the room opens.
                </p>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm text-slate-300 mb-2" htmlFor="note">
              Opening note <span className="text-slate-500">(optional)</span>
            </label>
            <textarea
              id="note"
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="What was this conversation about?"
              rows={4}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-slate-500 transition-colors resize-none"
            />
          </div>

          {error && (
            <p className="text-red-400 text-sm">{error}</p>
          )}

          <button
            type="submit"
            disabled={submitting || !title.trim()}
            className="w-full bg-amber-500 hover:bg-amber-400 disabled:bg-slate-700 disabled:text-slate-500 text-slate-950 font-medium rounded-lg px-4 py-3 flex items-center justify-center gap-2 transition-colors"
          >
            {submitting ? <Loader2 size={16} className="animate-spin" /> : null}
            {submitting ? 'Creating...' : 'Begin Encounter'}
          </button>
        </form>
      </div>
    </div>
  );
}
