'use client';

/**
 * MirrorFieldAssist — mirror-field affordances beneath a Practice Field textarea.
 *
 * Constitutional shape (mirror, not portrait):
 *   - The textarea stays primary; this is a subtle, optional help beneath it.
 *   - "Talk it out" → MAIA asks one spacious question; the practitioner speaks; MAIA
 *     drafts a CANDIDATE from only what they shared (POST practice-field/draft).
 *   - The candidate is editable and NEVER auto-saved — the practitioner authors the
 *     final value by choosing "Save as my expression".
 *   - No confidence, no "MAIA understands you as", no portrait of who they are.
 */

import { useState } from 'react';
import { apiFetch } from '@/lib/http/apiBase';

// MAIA asks one spacious question — not a form, not an interview.
const OPENERS: Record<string, string> = {
  welcome_message:
    'A new client just arrived. If you had one moment to make them feel welcome, what would you want them to feel?',
  about_practice:
    'How would you describe your work to someone who asked — in your own everyday words?',
  how_we_work_together:
    'Between sessions — what do you hope clients bring here, and how do you like to be reached?',
  how_maia_supports:
    'What do you want MAIA to be for your clients between sessions — and where should they come to you instead?',
  professional_practice:
    'What should a client understand about your professional role before they begin?',
};

const EXAMPLES: Record<string, string> = {
  welcome_message:
    "Welcome. I'm really glad you're here. This is a space for the work we're doing together — take whatever time you need.",
  about_practice:
    'I work with EFT to help people release the patterns that keep them stuck, at a pace that feels safe.',
  how_we_work_together:
    "I read what you leave here before each session, so it helps to note what's been alive for you. Messages reach me between sessions — I usually reply within a day. What you bring here is yours.",
  how_maia_supports:
    'MAIA is here to help you reflect between our meetings and remember what matters to you, with your consent. For anything urgent, please reach me directly rather than MAIA.',
  professional_practice:
    "I'm a certified EFT practitioner. This work isn't a substitute for therapy; if you're in crisis, please contact [crisis resource].",
};

type Mode = 'idle' | 'talking' | 'candidate' | 'examples';

export function MirrorFieldAssist({
  fieldKey,
  currentValue,
  onAccept,
}: {
  fieldKey: string;
  currentValue: string;
  onAccept: (value: string) => void;
}) {
  const [mode, setMode] = useState<Mode>('idle');
  const [conversation, setConversation] = useState('');
  const [candidate, setCandidate] = useState('');
  const [rationale, setRationale] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const opener = OPENERS[fieldKey];
  const example = EXAMPLES[fieldKey];
  if (!opener) return null; // only offered on supported fields

  async function draft() {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch('/api/practitioner/practice-field/draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fieldKey, conversation, currentValue }),
      });
      const json = await res.json();
      if (json.candidate_expression) {
        setCandidate(json.candidate_expression);
        setRationale(json.rationale ?? '');
        setMode('candidate');
      } else {
        setError(json.rationale ?? 'Share a little more, and MAIA can offer a possible draft.');
      }
    } catch {
      setError('Could not draft right now. Your writing is unaffected.');
    } finally {
      setLoading(false);
    }
  }

  const linkCls = 'text-stone-500 hover:text-stone-300 transition-colors underline underline-offset-4';

  // — Idle: subtle invitations beneath the field —
  if (mode === 'idle') {
    return (
      <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-xs font-light">
        <button type="button" onClick={() => { setConversation(''); setError(null); setMode('talking'); }} className={linkCls}>
          {currentValue ? 'Refine this with MAIA' : 'Talk it out with MAIA'}
        </button>
        {example && (
          <button type="button" onClick={() => setMode('examples')} className={linkCls}>
            See an example
          </button>
        )}
      </div>
    );
  }

  // — Examples: inspiration, never inserted automatically —
  if (mode === 'examples') {
    return (
      <div className="mt-3 border-l-2 border-stone-800 pl-4 space-y-2">
        <p className="text-stone-400 text-sm font-light italic leading-relaxed">{example}</p>
        <p className="text-stone-600 text-xs">An example for inspiration — your words are yours to write.</p>
        <button type="button" onClick={() => setMode('idle')} className={`${linkCls} text-xs`}>Close</button>
      </div>
    );
  }

  // — Talking: MAIA asks; practitioner speaks; MAIA drafts from only that —
  if (mode === 'talking') {
    return (
      <div className="mt-3 border-l-2 border-stone-700 pl-4 space-y-3">
        <p className="text-stone-300 text-sm font-light leading-relaxed">{opener}</p>
        <textarea
          className="w-full bg-stone-900 border border-stone-700 text-stone-200 px-3 py-2 text-sm font-light rounded focus:outline-none focus:border-stone-500 resize-none"
          rows={4}
          value={conversation}
          onChange={e => setConversation(e.target.value)}
          placeholder="Say it however it comes — MAIA will draft from only what you share here."
        />
        {error && <p className="text-amber-400/80 text-xs">{error}</p>}
        <div className="flex gap-4 text-xs font-light">
          <button
            type="button"
            onClick={draft}
            disabled={loading || !conversation.trim()}
            className={`${linkCls} disabled:opacity-30 disabled:no-underline`}
          >
            {loading ? 'Drafting…' : 'Draft from what I shared'}
          </button>
          <button type="button" onClick={() => setMode('idle')} className={`${linkCls} text-stone-600`}>Cancel</button>
        </div>
      </div>
    );
  }

  // — Candidate: editable draft; authored only on Save —
  return (
    <div className="mt-3 border-l-2 border-stone-600 pl-4 space-y-3">
      <p className="text-stone-500 text-xs uppercase tracking-widest">Possible draft</p>
      <textarea
        className="w-full bg-stone-900 border border-stone-700 text-stone-200 px-3 py-2 text-sm font-light rounded focus:outline-none focus:border-stone-500 resize-none leading-relaxed"
        rows={Math.min(10, Math.max(4, Math.ceil(candidate.length / 60)))}
        value={candidate}
        onChange={e => setCandidate(e.target.value)}
      />
      {rationale && <p className="text-stone-600 text-xs font-light leading-relaxed">{rationale}</p>}
      <p className="text-stone-500 text-xs font-light italic">Does this still feel true enough to hold?</p>
      <div className="flex flex-wrap gap-4 text-xs font-light">
        <button
          type="button"
          onClick={() => { onAccept(candidate); setMode('idle'); }}
          disabled={!candidate.trim()}
          className={`${linkCls} text-stone-300 disabled:opacity-30`}
        >
          Save as my expression
        </button>
        <button type="button" onClick={() => setMode('talking')} className={linkCls}>Say more</button>
        <button type="button" onClick={() => setMode('idle')} className={`${linkCls} text-stone-600`}>Discard draft</button>
      </div>
    </div>
  );
}
