'use client';

/**
 * SoulPortraitMentor
 * ────────────────────────────────────────────────────────────────────────
 * A gentle MAIA companion at the foot of a Soul Portrait. The reader can ask
 * about their own portrait in their own words. It is a reflective space, not a
 * chat to be maximised: one exchange at a time, calm, and it hands meaning back
 * rather than holding it. Backed by /api/soul-portrait/[slug]/mentor, which
 * carries the design law and minor-safety guardrails server-side.
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, ArrowUp, Loader2 } from 'lucide-react';

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-80px' },
  transition: { duration: 0.6, ease: 'easeOut' },
} as const;

export function SoulPortraitMentor({
  slug,
  name,
  starters = [],
}: {
  slug: string;
  /** Display name, used only to soften the invitation. */
  name?: string;
  /** A few reflection questions to offer as gentle starting points. */
  starters?: string[];
}) {
  const [question, setQuestion] = useState('');
  const [asked, setAsked] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const firstName = name?.trim().split(/\s+/)[0];

  const ask = async (raw: string) => {
    const message = raw.trim();
    if (!message || loading) return;
    setLoading(true);
    setError('');
    setAnswer('');
    setAsked(message);
    setQuestion('');
    try {
      const res = await fetch(`/api/soul-portrait/${encodeURIComponent(slug)}/mentor`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      });
      const data = await res.json();
      if (data?.answer) setAnswer(data.answer);
      else setError('MAIA went quiet for a moment. Try asking again.');
    } catch {
      setError('MAIA went quiet for a moment. Try asking again.');
    } finally {
      setLoading(false);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      ask(question);
    }
  };

  return (
    <motion.section {...fadeUp} className="mx-auto w-full max-w-3xl px-6 py-12 sm:py-16">
      <div className="rounded-3xl border border-maia-gold/30 bg-maia-navy-850/40 p-8 shadow-maia-spice-glow">
        <div className="mb-4 flex items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-maia-navy-700 bg-maia-navy-850 text-maia-gold">
            <MessageCircle className="h-4 w-4" strokeWidth={1.5} />
          </span>
          <h2 className="font-cinzel text-xl text-maia-ink-100">Walk a little further with MAIA</h2>
        </div>

        <p className="font-cormorant text-[1.05rem] italic leading-relaxed text-maia-ink-80">
          This portrait is a letter, not a verdict{firstName ? `, ${firstName}` : ''}. If something here
          stirred a question, ask it in your own words and your own time. MAIA will reflect with you —
          the meaning stays yours to keep or set aside.
        </p>

        {/* Gentle starting points */}
        {!asked && starters.length > 0 && (
          <div className="mt-6 flex flex-col gap-2">
            {starters.slice(0, 3).map((s) => (
              <button
                key={s}
                onClick={() => ask(s)}
                className="rounded-xl border border-maia-navy-700 bg-maia-navy-850/40 px-4 py-3 text-left font-cormorant text-[1.0rem] leading-relaxed text-maia-ink-80 transition-colors hover:border-maia-gold/40 hover:text-maia-ink-100"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {/* The exchange */}
        {asked && (
          <div className="mt-7 space-y-4">
            <p className="font-raleway text-[0.8rem] uppercase tracking-[0.18em] text-maia-ink-50">You asked</p>
            <p className="font-cormorant text-[1.05rem] leading-relaxed text-maia-ink-100">{asked}</p>
            {loading ? (
              <div className="flex items-center gap-2 pt-1 font-cormorant text-[1.0rem] italic text-maia-ink-50">
                <Loader2 className="h-4 w-4 animate-spin" /> MAIA is reflecting…
              </div>
            ) : answer ? (
              <p className="whitespace-pre-line border-l-2 border-maia-gold/40 pl-5 font-cormorant text-[1.1rem] leading-relaxed text-maia-ink-80">
                {answer}
              </p>
            ) : null}
            {error && <p className="font-cormorant text-[1.0rem] italic text-maia-ink-50">{error}</p>}
          </div>
        )}

        {/* Composer */}
        <div className="mt-7 flex items-end gap-3">
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={onKeyDown}
            rows={2}
            placeholder={asked ? 'Ask another…' : 'Ask MAIA about your portrait…'}
            className="flex-1 resize-none rounded-xl border border-maia-navy-700 bg-maia-navy-950/60 px-4 py-3 font-cormorant text-[1.05rem] leading-relaxed text-maia-ink-100 placeholder:text-maia-ink-50/70 focus:border-maia-gold/40 focus:outline-none"
          />
          <button
            onClick={() => ask(question)}
            disabled={loading || !question.trim()}
            aria-label="Ask MAIA"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-maia-gold/40 text-maia-gold transition-colors hover:bg-maia-gold/10 disabled:opacity-40"
          >
            <ArrowUp className="h-5 w-5" strokeWidth={1.5} />
          </button>
        </div>

        <p className="mt-6 font-raleway text-[0.78rem] leading-relaxed text-maia-ink-50">
          A reflective space — nothing you ask here is kept. MAIA reflects; you remain the author of your own becoming.
        </p>
      </div>
    </motion.section>
  );
}

export default SoulPortraitMentor;
