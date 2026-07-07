'use client';

import { useState } from 'react';

// Build #2A — Witness Surface.
// Completes the Observation Primitive's Layer 2 (human-authored observations).
// Founder-authored only. Writes exactly one observations row. No dashboard,
// no listing, no analytics, no inferred meaning. The witness makes the meaning.

const CONTEXT_TYPES = [
  'member',
  'offering',
  'encounter',
  'invitation',
  'relationship',
  'practitioner',
  'organization',
  'community_event',
] as const;

const HORIZONS = ['operational', 'developmental', 'ecological'] as const;

export default function WitnessPage() {
  const [witnessText, setWitnessText] = useState('');
  const [contextType, setContextType] = useState<string>('offering');
  const [contextId, setContextId] = useState('');
  const [horizon, setHorizon] = useState('');
  const [status, setStatus] = useState<
    { kind: 'idle' } | { kind: 'saving' } | { kind: 'saved'; id: string } | { kind: 'error'; message: string }
  >({ kind: 'idle' });

  async function submit() {
    if (!witnessText.trim()) return;
    setStatus({ kind: 'saving' });
    try {
      const res = await fetch('/api/observation/observations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          witness_text: witnessText,
          observation_context_type: contextType,
          observation_context_id: contextId.trim() || undefined,
          horizon: horizon || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setStatus({ kind: 'error', message: data.error || `HTTP ${res.status}` });
        return;
      }
      setStatus({ kind: 'saved', id: data.id });
      setWitnessText('');
      setContextId('');
      setHorizon('');
    } catch (err) {
      setStatus({ kind: 'error', message: err instanceof Error ? err.message : 'request failed' });
    }
  }

  const labelStyle = 'block text-sm text-[var(--sl-text-secondary)] mb-1';
  const fieldStyle =
    'w-full rounded-lg bg-[var(--sl-bg-elevated)] border border-[var(--sl-border-subtle)] px-3 py-2 text-[var(--sl-text-primary)] focus:outline-none focus:border-[var(--sl-accent-admin)]';

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <h1 className="text-xl text-[var(--sl-text-primary)] mb-1">Witness</h1>
      <p className="text-sm text-[var(--sl-text-muted)] mb-6">
        A place to record what you actually saw. Not what it means — what happened.
      </p>

      <div className="mb-5">
        <label htmlFor="witness" className={labelStyle}>
          What did you actually witness?
        </label>
        <textarea
          id="witness"
          value={witnessText}
          onChange={(e) => setWitnessText(e.target.value)}
          rows={6}
          className={fieldStyle}
          placeholder="The practitioner paused for nearly two minutes before choosing to write anything…"
        />
      </div>

      <div className="mb-5">
        <label htmlFor="context-type" className={labelStyle}>
          What were you witnessing?
        </label>
        <select
          id="context-type"
          value={contextType}
          onChange={(e) => setContextType(e.target.value)}
          className={fieldStyle}
        >
          {CONTEXT_TYPES.map((t) => (
            <option key={t} value={t}>
              {t.replace('_', ' ')}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-5">
        <label htmlFor="context-id" className={labelStyle}>
          Context link <span className="text-[var(--sl-text-muted)]">(optional)</span>
        </label>
        <input
          id="context-id"
          value={contextId}
          onChange={(e) => setContextId(e.target.value)}
          className={fieldStyle}
          placeholder="id of the specific offering / member / encounter, if any"
        />
      </div>

      <div className="mb-6">
        <label htmlFor="horizon" className={labelStyle}>
          Horizon <span className="text-[var(--sl-text-muted)]">(optional — leave blank if unclear)</span>
        </label>
        <select
          id="horizon"
          value={horizon}
          onChange={(e) => setHorizon(e.target.value)}
          className={fieldStyle}
        >
          <option value="">—</option>
          {HORIZONS.map((h) => (
            <option key={h} value={h}>
              {h}
            </option>
          ))}
        </select>
      </div>

      <button
        onClick={submit}
        disabled={status.kind === 'saving' || !witnessText.trim()}
        className="rounded-lg bg-[var(--sl-accent-admin)] text-white px-4 py-2 text-sm disabled:opacity-40"
      >
        {status.kind === 'saving' ? 'Recording…' : 'Record observation'}
      </button>

      {status.kind === 'saved' && (
        <p className="mt-4 text-sm text-[var(--sl-state-success)]">
          Recorded. Observation {status.id.slice(0, 8)}… held.
        </p>
      )}
      {status.kind === 'error' && (
        <p className="mt-4 text-sm text-[var(--sl-state-error)]">{status.message}</p>
      )}
    </div>
  );
}
