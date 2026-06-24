'use client';

import { useCallback, useEffect, useState } from 'react';
import { apiFetch } from '@/lib/http/apiBase';
import {
  OBSERVATION_PROMPTS,
  ELEMENT_META,
  ELEMENTS,
  observationOpening,
  FIELD_ACCENT,
  type ObservationPromptType,
} from '@/lib/beta-testers/constants';
import { Loading, Empty } from '../_components/states';

interface Observation {
  id: string;
  prompt_type: string;
  observation_text: string;
  elemental_lens: string | null;
  visibility: string;
  created_at: string;
}

const VIS_LABEL: Record<string, string> = {
  private: 'private',
  admin_review: 'in review',
  shared_approved: 'shared',
};

function formatDate(d: string): string {
  try {
    return new Date(d).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  } catch {
    return '';
  }
}

export default function ObservationStreamPage() {
  const [promptType, setPromptType] = useState<ObservationPromptType>(OBSERVATION_PROMPTS[0].type);
  const [text, setText] = useState('');
  const [lens, setLens] = useState<string | null>(null);
  const [keepPrivate, setKeepPrivate] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [justSaved, setJustSaved] = useState(false);
  const [mine, setMine] = useState<Observation[] | null>(null);

  const loadMine = useCallback(async () => {
    try {
      const res = await apiFetch('/api/beta-testers/observations');
      const data = await res.json().catch(() => ({}));
      setMine(Array.isArray(data.observations) ? data.observations : []);
    } catch {
      setMine([]);
    }
  }, []);

  useEffect(() => {
    loadMine();
  }, [loadMine]);

  const submit = async () => {
    if (!text.trim() || submitting) return;
    setSubmitting(true);
    setJustSaved(false);
    try {
      const res = await apiFetch('/api/beta-testers/observations', {
        method: 'POST',
        body: JSON.stringify({ promptType, observationText: text.trim(), elementalLens: lens, keepPrivate }),
      });
      if (res.ok) {
        setText('');
        setLens(null);
        setKeepPrivate(false);
        setJustSaved(true);
        await loadMine();
      }
    } finally {
      setSubmitting(false);
    }
  };

  const activePrompt = OBSERVATION_PROMPTS.find((p) => p.type === promptType)!;

  return (
    <div className="space-y-10">
      <header className="space-y-2">
        <h2 className="text-xl font-light text-zinc-100">Observations</h2>
        <p className="text-[15px] text-zinc-500">
          Notice, don’t evaluate. There are no right answers — and this is never added to MAIA’s memory.
        </p>
      </header>

      {/* Opening picker */}
      <div className="flex flex-wrap gap-2">
        {OBSERVATION_PROMPTS.map((p) => {
          const active = p.type === promptType;
          return (
            <button
              key={p.type}
              type="button"
              onClick={() => {
                setPromptType(p.type);
                setJustSaved(false);
              }}
              className="rounded-full px-3.5 py-1.5 text-sm transition-colors"
              style={
                active
                  ? { backgroundColor: FIELD_ACCENT, color: '#0c0c0f' }
                  : { border: '1px solid rgba(255,255,255,0.12)', color: '#a1a1aa' }
              }
            >
              {p.opening}
            </button>
          );
        })}
      </div>

      {/* Composer */}
      <div className="space-y-4 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
        <div>
          <p className="text-[15px] text-zinc-200">{activePrompt.opening}</p>
          <p className="mt-1 text-sm text-zinc-500">{activePrompt.hint}</p>
        </div>

        <textarea
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            setJustSaved(false);
          }}
          rows={6}
          placeholder="Write freely…"
          className="w-full resize-y rounded-xl border border-white/10 bg-black/30 p-4 text-[15px] leading-relaxed text-zinc-100 placeholder:text-zinc-600 focus:border-white/25 focus:outline-none"
        />

        {/* Optional lens */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs uppercase tracking-wide text-zinc-600">Lens (optional)</span>
          {ELEMENTS.map((el) => {
            const meta = ELEMENT_META[el];
            const active = lens === el;
            return (
              <button
                key={el}
                type="button"
                onClick={() => setLens(active ? null : el)}
                className="rounded-full px-3 py-1 text-xs transition-colors"
                style={
                  active
                    ? { backgroundColor: `${meta.accent}26`, color: meta.accent, border: `1px solid ${meta.accent}66` }
                    : { border: '1px solid rgba(255,255,255,0.1)', color: '#71717a' }
                }
              >
                {meta.glyph} {meta.label}
              </button>
            );
          })}
        </div>

        <label className="flex items-center gap-2 text-sm text-zinc-400">
          <input type="checkbox" checked={keepPrivate} onChange={(e) => setKeepPrivate(e.target.checked)} />
          Keep this private — only you can see it (not sent for review)
        </label>

        <div className="flex items-center gap-4 pt-1">
          <button
            type="button"
            onClick={submit}
            disabled={!text.trim() || submitting}
            className="rounded-full px-5 py-2 text-sm font-medium transition-opacity disabled:opacity-40"
            style={{ backgroundColor: FIELD_ACCENT, color: '#0c0c0f' }}
          >
            {submitting ? 'Saving…' : 'Leave this observation'}
          </button>
          {justSaved && <span className="text-sm text-zinc-500">Held. Thank you for noticing.</span>}
        </div>
      </div>

      {/* Return later — your own observations */}
      <section className="space-y-4">
        <h3 className="text-sm uppercase tracking-[0.2em] text-zinc-500">What you’ve noticed</h3>
        {mine === null ? (
          <Loading />
        ) : mine.length === 0 ? (
          <Empty text="Nothing yet. What you leave here, you can return to later." />
        ) : (
          <div className="space-y-3">
            {mine.map((o) => (
              <div key={o.id} className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm" style={{ color: FIELD_ACCENT }}>
                    {observationOpening(o.prompt_type)}
                  </span>
                  <span className="text-xs text-zinc-600">
                    {VIS_LABEL[o.visibility] ?? o.visibility} · {formatDate(o.created_at)}
                  </span>
                </div>
                <p className="mt-2 whitespace-pre-line text-[15px] leading-relaxed text-zinc-300">{o.observation_text}</p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
