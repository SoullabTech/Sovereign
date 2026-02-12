'use client';

import { useState } from 'react';
import { SectionReveal } from './SectionReveal';

const PLACEHOLDER_QUESTIONS = [
  'Can you build something like this for my business?',
  'What is AIN, in plain language?',
  'Do you work with contractors or local services?',
  'How does MAIA actually work?',
  'What does a project usually involve?',
];

export function AskSection() {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [placeholder] = useState(
    () => PLACEHOLDER_QUESTIONS[Math.floor(Math.random() * PLACEHOLDER_QUESTIONS.length)]
  );

  const handleAsk = async () => {
    const msg = question.trim();
    if (!msg || loading) return;

    setLoading(true);
    setError('');
    setAnswer('');

    try {
      const res = await fetch('/api/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg }),
      });
      const data = await res.json();
      if (data.answer) {
        setAnswer(data.answer);
      } else {
        setError('No response received.');
      }
    } catch {
      setError('Something went wrong. Try again or reach us at hello@soullab.life.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAsk();
    }
  };

  return (
    <section id="ask" className="relative py-24 sm:py-32 px-4 bg-maia-navy-950">
      <div className="max-w-3xl mx-auto">
        <SectionReveal>
          <h2
            className="text-3xl sm:text-4xl lg:text-5xl font-extralight tracking-wide text-white text-center mb-4"
            style={{ fontFamily: "'Crimson Pro', serif" }}
          >
            Ask Kelly / MAIA
          </h2>
          <p className="text-white/40 text-center text-sm tracking-widest uppercase mb-4">
            Live intelligence &middot; No email required
          </p>
          <p className="text-white/30 text-center text-sm max-w-xl mx-auto mb-12" style={{ fontFamily: "'Source Sans Pro', sans-serif" }}>
            Ask anything about Soullab, AIN, MAIA, or what we could build together.
          </p>
        </SectionReveal>

        <SectionReveal delay={0.1}>
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-sm p-6 sm:p-8">
            <textarea
              value={question}
              onChange={e => setQuestion(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              rows={3}
              className="w-full resize-none rounded-xl border border-white/10 bg-maia-navy-950/60 px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-maia-spice-500/30 transition-all"
            />

            <div className="flex flex-wrap items-center gap-3 mt-4">
              <button
                onClick={handleAsk}
                disabled={loading || !question.trim()}
                className="rounded-xl bg-maia-spice-500 hover:bg-maia-spice-400 px-6 py-2.5 text-sm font-semibold text-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Asking...' : 'Ask'}
              </button>

              {(answer || error) && (
                <button
                  onClick={() => { setQuestion(''); setAnswer(''); setError(''); }}
                  className="rounded-xl border border-white/10 px-4 py-2.5 text-sm text-white/50 hover:text-white/70 hover:border-white/20 transition-colors"
                >
                  Clear
                </button>
              )}

              <span className="ml-auto text-xs text-white/20">
                Shift+Enter for new line
              </span>
            </div>

            {error && (
              <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-300/80">
                {error}
              </div>
            )}

            {answer && (
              <>
                <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.03] px-5 py-4 text-sm text-white/75 leading-relaxed whitespace-pre-wrap" style={{ fontFamily: "'Source Sans Pro', sans-serif" }}>
                  {answer}
                </div>
                {/* CTA chips — convert the good answer into action */}
                <div className="mt-3 flex flex-wrap gap-2">
                  {[
                    { label: 'View Portfolio', href: '#portfolio' },
                    { label: 'Start a Project', href: '#contact' },
                    { label: 'Book a Conversation', href: 'mailto:hello@soullab.life?subject=Conversation%20with%20Soullab' },
                    { label: 'Enter MAIA', href: '/enter' },
                  ].map(cta => (
                    <a
                      key={cta.label}
                      href={cta.href}
                      className="inline-block rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-white/50 hover:text-maia-spice-400 hover:border-maia-spice-500/30 hover:bg-maia-spice-500/5 transition-all"
                    >
                      {cta.label}
                    </a>
                  ))}
                </div>
              </>
            )}
          </div>
        </SectionReveal>
      </div>
    </section>
  );
}
