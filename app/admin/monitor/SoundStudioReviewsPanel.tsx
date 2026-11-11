'use client';

// Sound Studio named beta — what reviewers confirmed, and themes across them on request.
// Reviewer-confirmed lines only; transcripts are never shown here. See the route header.

import { useCallback, useEffect, useMemo, useState } from 'react';
import { adminFetch } from '@/lib/admin/adminFetch';

type Line = { kind: 'observation' | 'experience' | 'suggestion'; text: string };
type Review = {
  id: string; workId: string; workTitle: string; reviewer: string; passageLabel: string | null;
  keptTranscript: boolean; createdAt: string; lines: Line[];
};
type Theme = { title: string; summary: string; refs: string[] };
type SourceLine = { ref: string; workTitle: string; kind: Line['kind']; text: string };

const KIND: Record<Line['kind'], string> = { observation: 'Heard', experience: 'Felt', suggestion: 'Change' };

export default function SoundStudioReviewsPanel() {
  const [reviews, setReviews] = useState<Review[] | null>(null);
  const [basis, setBasis] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [workFilter, setWorkFilter] = useState('all');
  const [themes, setThemes] = useState<Theme[] | null>(null);
  const [sources, setSources] = useState<SourceLine[]>([]);
  const [synthBusy, setSynthBusy] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    try {
      const res = await adminFetch('/api/admin/monitor/sound-studio-reviews');
      if (!res.ok) throw new Error(String(res.status));
      const data = await res.json() as { reviews: Review[]; basis: string };
      setReviews(data.reviews); setBasis(data.basis);
    } catch { setError('Could not load reviews.'); }
  }, []);
  useEffect(() => { void load(); }, [load]);

  const works = useMemo(() => {
    const map = new Map<string, string>();
    reviews?.forEach(r => map.set(r.workId, r.workTitle));
    return [...map.entries()];
  }, [reviews]);
  const shown = reviews?.filter(r => workFilter === 'all' || r.workId === workFilter) ?? [];

  const synthesize = async () => {
    setSynthBusy(true); setThemes(null);
    try {
      const res = await adminFetch('/api/admin/monitor/sound-studio-reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(workFilter === 'all' ? {} : { workId: workFilter }),
      });
      if (!res.ok) throw new Error(String(res.status));
      const data = await res.json() as { themes: Theme[]; lines: SourceLine[] };
      setThemes(data.themes); setSources(data.lines);
    } catch { setError('Synthesis is unavailable right now.'); }
    finally { setSynthBusy(false); }
  };
  const sourceByRef = useMemo(() => new Map(sources.map(s => [s.ref, s])), [sources]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="text-lg font-semibold text-maia-ink-100">Sound Studio reviews</h2>
        <select className="rounded border border-maia-ink-40/30 bg-maia-navy-900/60 px-2 py-1 text-sm text-maia-ink-100"
          value={workFilter} onChange={e => { setWorkFilter(e.target.value); setThemes(null); }}>
          <option value="all">All works</option>
          {works.map(([id, title]) => <option key={id} value={id}>{title}</option>)}
        </select>
        <button type="button" onClick={() => void load()} className="rounded border border-maia-ink-40/30 px-3 py-1 text-sm text-maia-ink-100">Refresh</button>
        <button type="button" onClick={() => void synthesize()} disabled={synthBusy || !shown.length}
          className="rounded border border-amber-300/40 px-3 py-1 text-sm text-amber-200 disabled:opacity-40">
          {synthBusy ? 'Reading…' : 'Find themes'}
        </button>
      </div>
      {basis && <p className="text-xs text-maia-ink-40">{basis}</p>}
      {error && <p className="text-sm text-rose-300" role="alert">{error}</p>}

      {themes && (
        <section className="space-y-3 rounded border border-amber-300/20 p-4">
          <h3 className="text-sm font-semibold text-amber-200">Themes (proposed, not stored; check each against its lines)</h3>
          {themes.length === 0 && <p className="text-sm text-maia-ink-40">No themes were found.</p>}
          {themes.map((t, i) => (
            <details key={i} className="text-sm text-maia-ink-100">
              <summary><strong>{t.title}</strong> · {t.refs.length} line{t.refs.length === 1 ? '' : 's'}</summary>
              <p className="mt-1 text-maia-ink-40">{t.summary}</p>
              <ul className="mt-2 list-disc pl-5">
                {t.refs.map(ref => {
                  const s = sourceByRef.get(ref);
                  return s ? <li key={ref}><span className="text-maia-ink-40">{s.workTitle} · {KIND[s.kind]}:</span> {s.text}</li> : null;
                })}
              </ul>
            </details>
          ))}
        </section>
      )}

      {reviews && shown.length === 0 && <p className="text-sm text-maia-ink-40">No reviews yet.</p>}
      <ul className="space-y-4">
        {shown.map(r => (
          <li key={r.id} className="rounded border border-maia-ink-40/20 p-4 text-sm text-maia-ink-100">
            <div className="text-xs text-maia-ink-40">
              {r.reviewer} · {r.workTitle}{r.passageLabel ? ` · ${r.passageLabel}` : ''} · {new Date(r.createdAt).toLocaleString()}
              {r.keptTranscript ? ' · conversation kept' : ''}
            </div>
            <ul className="mt-2 space-y-1">
              {r.lines.map((l, i) => <li key={i}><span className="text-maia-ink-40">{KIND[l.kind]}:</span> {l.text}</li>)}
            </ul>
          </li>
        ))}
      </ul>
    </div>
  );
}
