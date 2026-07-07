'use client';

import { useState } from 'react';

/**
 * Practitioner review instrumentation (Stage 1 pilot).
 *
 * Structured capture for a review session: Keep / Change / Remove / Missing, six
 * workflow scores, and the one prioritization question. The practitioner's evaluation
 * of the WORKFLOW — never client data. POSTs to /api/soul-portrait/review-feedback,
 * reviewer-scoped. Held on a review branch; nothing here is client-facing.
 */

const HEADINGS = [
  { key: 'keep', label: 'Keep', hint: 'What works and should stay.' },
  { key: 'change', label: 'Change', hint: 'What should be different.' },
  { key: 'remove', label: 'Remove', hint: 'What gets in the way.' },
  { key: 'missing', label: 'Missing', hint: 'What isn’t here yet.' },
] as const;

const SCORES = [
  { key: 'clarity', label: 'Clarity' },
  { key: 'professionalFit', label: 'Professional fit' },
  { key: 'trust', label: 'Trust' },
  { key: 'recognitionQuality', label: 'Recognition quality' },
  { key: 'stewardshipValue', label: 'Stewardship value' },
  { key: 'likelihoodOfUse', label: 'Likelihood of regular use' },
] as const;

type TextKey = (typeof HEADINGS)[number]['key'];
type ScoreKey = (typeof SCORES)[number]['key'];

export function PractitionerReviewPanel({ portraitId }: { portraitId?: string }) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState<Record<TextKey, string>>({ keep: '', change: '', remove: '', missing: '' });
  const [scores, setScores] = useState<Record<ScoreKey, number | ''>>({
    clarity: '', professionalFit: '', trust: '', recognitionQuality: '', stewardshipValue: '', likelihoodOfUse: '',
  });
  const [topPriority, setTopPriority] = useState('');
  const [saving, setSaving] = useState(false);
  // Demo-safe: capture always confirms. Persistence is best-effort — if the record
  // table isn't present (a bare demo environment), the feedback is still captured for
  // the review rather than breaking the walkthrough with an error.
  const [result, setResult] = useState<{ persisted: boolean } | null>(null);

  async function submit() {
    setSaving(true);
    const cleanScores: Record<string, number> = {};
    for (const s of SCORES) { const v = scores[s.key]; if (typeof v === 'number') cleanScores[s.key] = v; }
    let persisted = false;
    try {
      const res = await fetch('/api/soul-portrait/review-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ ...text, scores: cleanScores, topPriority: topPriority.trim() || undefined, portraitId }),
      });
      persisted = res.ok;
    } catch {
      persisted = false;
    }
    setResult({ persisted });
    setSaving(false);
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="text-stone-500 hover:text-stone-300 text-xs uppercase tracking-widest underline underline-offset-4 transition-colors"
      >
        Record review feedback
      </button>
    );
  }

  if (result) {
    return (
      <p className="text-stone-400 text-sm font-light border-l-2 border-stone-700 pl-4">
        {result.persisted
          ? 'Feedback recorded. Thank you — this guides the next iteration.'
          : 'Feedback captured for this review. Thank you — this guides the next iteration.'}
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-widest text-stone-500">Review feedback</p>
        <p className="text-stone-500 text-xs font-light mt-1">Your read on the workflow. Nothing here is shared with clients.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {HEADINGS.map((h) => (
          <label key={h.key} className="block space-y-1">
            <span className="text-stone-300 text-sm font-light">{h.label}</span>
            <span className="block text-stone-600 text-xs font-light">{h.hint}</span>
            <textarea
              rows={3}
              value={text[h.key]}
              onChange={(e) => setText((p) => ({ ...p, [h.key]: e.target.value }))}
              className="w-full mt-1 bg-transparent border border-stone-800 rounded px-3 py-2 text-stone-200 text-sm font-light focus:outline-none focus:border-stone-600 resize-none"
            />
          </label>
        ))}
      </div>

      <div className="space-y-2">
        <p className="text-stone-500 text-xs uppercase tracking-widest">Scores (1&ndash;5)</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {SCORES.map((s) => (
            <label key={s.key} className="flex items-center justify-between gap-3 border-l-2 border-stone-800 pl-3 py-1">
              <span className="text-stone-300 text-sm font-light">{s.label}</span>
              <select
                value={scores[s.key]}
                onChange={(e) => setScores((p) => ({ ...p, [s.key]: e.target.value ? Number(e.target.value) : '' }))}
                className="bg-transparent border border-stone-800 rounded px-2 py-1 text-stone-200 text-sm focus:outline-none focus:border-stone-600"
              >
                <option value="">—</option>
                {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
            </label>
          ))}
        </div>
      </div>

      <label className="block space-y-1">
        <span className="text-stone-300 text-sm font-light">
          If we changed only one thing before the next session, what would make the biggest difference?
        </span>
        <textarea
          rows={2}
          value={topPriority}
          onChange={(e) => setTopPriority(e.target.value)}
          className="w-full mt-1 bg-transparent border border-stone-800 rounded px-3 py-2 text-stone-200 text-sm font-light focus:outline-none focus:border-stone-600 resize-none"
        />
      </label>


      <div className="flex gap-4">
        <button
          onClick={submit}
          disabled={saving}
          className="text-stone-100 hover:text-white text-sm underline underline-offset-4 transition-colors disabled:opacity-40"
        >
          {saving ? 'Saving…' : 'Save feedback'}
        </button>
        <button
          onClick={() => setOpen(false)}
          className="text-stone-600 hover:text-stone-400 text-sm underline underline-offset-4 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
