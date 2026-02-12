'use client';

import { useState, useEffect } from 'react';
import { MessageCircle, X } from 'lucide-react';

export function AskWidget() {
  const [open, setOpen] = useState(false);
  const [visible, setVisible] = useState(false);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Show the button after a short delay
  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 3000);
    return () => clearTimeout(timer);
  }, []);

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
      setError('Something went wrong.');
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

  if (!visible) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {!open ? (
        <button
          onClick={() => setOpen(true)}
          className="group flex items-center gap-2 rounded-full border border-white/10 bg-maia-navy-950/90 backdrop-blur-xl px-5 py-3 text-sm font-medium text-white/70 shadow-2xl shadow-black/40 hover:text-white hover:border-white/20 transition-all"
        >
          <MessageCircle className="w-4 h-4 text-maia-spice-400" />
          Ask Soullab
        </button>
      ) : (
        <div className="w-[360px] max-h-[500px] overflow-hidden rounded-2xl border border-white/10 bg-maia-navy-950/95 backdrop-blur-xl shadow-2xl shadow-black/50 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-3 shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-maia-spice-400 animate-pulse" />
              <span className="text-sm font-medium text-white">Ask Kelly / MAIA</span>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="text-white/40 hover:text-white/70 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body */}
          <div className="p-4 space-y-3 overflow-y-auto flex-1">
            <textarea
              value={question}
              onChange={e => setQuestion(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={2}
              placeholder="Ask about projects, AIN, MAIA..."
              className="w-full resize-none rounded-xl border border-white/10 bg-black/20 px-3 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-maia-spice-500/30 transition-all"
            />

            <div className="flex items-center gap-2">
              <button
                onClick={handleAsk}
                disabled={loading || !question.trim()}
                className="rounded-lg bg-maia-spice-500 hover:bg-maia-spice-400 px-4 py-2 text-sm font-semibold text-black transition-colors disabled:opacity-50"
              >
                {loading ? '...' : 'Ask'}
              </button>
              <a
                href="#contact"
                onClick={() => setOpen(false)}
                className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-white/60 hover:text-white/80 hover:bg-white/10 transition-colors"
              >
                Start Project
              </a>
            </div>

            {error && (
              <div className="rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-2 text-xs text-red-300/80">
                {error}
              </div>
            )}

            {answer ? (
              <>
                <div className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-3 text-sm text-white/75 leading-relaxed whitespace-pre-wrap" style={{ fontFamily: "'Source Sans Pro', sans-serif" }}>
                  {answer}
                </div>
                {/* CTA chips */}
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { label: 'Portfolio', href: '#portfolio' },
                    { label: 'Start Project', href: '#contact' },
                    { label: 'Book', href: 'mailto:hello@soullab.life?subject=Conversation%20with%20Soullab' },
                    { label: 'Enter MAIA', href: '/enter' },
                  ].map(cta => (
                    <a
                      key={cta.label}
                      href={cta.href}
                      onClick={() => { if (cta.href.startsWith('#')) setOpen(false); }}
                      className="inline-block rounded-md border border-white/10 bg-white/[0.04] px-2 py-1 text-[11px] font-medium text-white/45 hover:text-maia-spice-400 hover:border-maia-spice-500/30 transition-all"
                    >
                      {cta.label}
                    </a>
                  ))}
                </div>
              </>
            ) : !loading && (
              <p className="text-xs text-white/25 px-1">
                Try: &ldquo;What could you build for a local service business?&rdquo;
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
