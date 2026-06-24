'use client';

import { useRef, useState } from 'react';
import { Sparkles, ArrowUp, X, Plus, Loader2 } from 'lucide-react';
import { apiFetch } from '@/lib/http/apiBase';

/**
 * Ask MAIA — a reusable, field-agnostic assist surface for Studio.
 *
 * Drop it onto any field page. It sends the field's current context + the
 * practitioner's question to /api/studio/assist/ask and renders MAIA's reply.
 *
 * Sovereignty invariant: MAIA proposes, the human commits. This component never
 * writes anything. When MAIA returns a proposal, the field decides what "accept"
 * means via `onAcceptProposal` — typically opening that field's own confirm UI.
 * A field that passes no `onAcceptProposal` simply shows reflections (read-only).
 */

export interface AskMaiaProposal {
  id: string;
  /** Field-specific kind, e.g. 'event' | 'task'. */
  kind: string;
  title: string;
  /** Human-readable one-liner describing the draft. */
  summary?: string;
  /** Raw fields handed to the field's accept handler. */
  data: Record<string, unknown>;
}

export interface AskMaiaProps {
  /** Which field profile to use server-side: 'calendar' | 'tasks' | … */
  surface: string;
  /** Returns the read-only context payload for this field, fresh at ask time. */
  buildContext: () => Record<string, unknown>;
  /** Called when the practitioner accepts a proposal — the field owns the commit. */
  onAcceptProposal?: (proposal: AskMaiaProposal) => void;
  title?: string;
  placeholder?: string;
  /** Example prompts shown in the empty state. */
  suggestions?: string[];
  /** Label on a proposal's accept button. Default: "Review & add". */
  acceptLabel?: string;
  className?: string;
}

type Message =
  | { role: 'user'; text: string }
  | { role: 'maia'; text: string; proposals: AskMaiaProposal[] };

export function AskMaia({
  surface,
  buildContext,
  onAcceptProposal,
  title = 'Ask MAIA',
  placeholder = 'Ask about this page…',
  suggestions = [],
  acceptLabel = 'Review & add',
  className = '',
}: AskMaiaProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  const ask = async (raw: string) => {
    const message = raw.trim();
    if (!message || loading) return;

    setError('');
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: message }]);
    setLoading(true);

    try {
      const res = await apiFetch('/api/studio/assist/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ surface, message, context: buildContext() }),
      });
      const data = await res.json();
      const reply = typeof data.reply === 'string' ? data.reply : 'I didn’t catch that.';
      const proposals: AskMaiaProposal[] = Array.isArray(data.proposals) ? data.proposals : [];
      setMessages(prev => [...prev, { role: 'maia', text: reply, proposals }]);
    } catch {
      setError('Couldn’t reach MAIA. Try again in a moment.');
    } finally {
      setLoading(false);
      // Scroll the thread to the latest exchange.
      requestAnimationFrame(() => {
        scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
      });
    }
  };

  const dismissProposal = (msgIndex: number, proposalId: string) => {
    setMessages(prev =>
      prev.map((m, i) =>
        i === msgIndex && m.role === 'maia'
          ? { ...m, proposals: m.proposals.filter(p => p.id !== proposalId) }
          : m,
      ),
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      ask(input);
    }
  };

  const hasThread = messages.length > 0;

  return (
    <div
      className={`bg-[#16162a] rounded-xl border border-slate-800/50 overflow-hidden flex flex-col ${className}`}
    >
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-800/50">
        <Sparkles className="w-4 h-4 text-amber-400" />
        <span className="text-sm font-medium text-white">{title}</span>
        <span className="ml-auto text-[10px] uppercase tracking-wider text-slate-600">
          proposes · you decide
        </span>
      </div>

      {/* Thread */}
      <div ref={scrollRef} className="px-3 py-3 space-y-3 max-h-[360px] overflow-y-auto">
        {!hasThread && (
          <div className="space-y-3">
            <p className="text-xs text-slate-500 px-1">
              Here to help, only if needed. Ask about this page — I’ll reflect or draft something
              for you to confirm. I never change anything on my own.
            </p>
            {suggestions.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {suggestions.map(s => (
                  <button
                    key={s}
                    onClick={() => ask(s)}
                    className="text-left text-xs text-slate-400 bg-slate-800/40 hover:bg-slate-700/50 hover:text-slate-200 rounded-lg px-2.5 py-1.5 transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {messages.map((m, i) =>
          m.role === 'user' ? (
            <div key={i} className="flex justify-end">
              <div className="max-w-[85%] bg-amber-500/15 text-amber-100 rounded-2xl rounded-br-sm px-3 py-2 text-sm">
                {m.text}
              </div>
            </div>
          ) : (
            <div key={i} className="space-y-2">
              <div className="max-w-[90%] bg-slate-800/50 text-slate-200 rounded-2xl rounded-bl-sm px-3 py-2 text-sm whitespace-pre-wrap leading-relaxed">
                {m.text}
              </div>
              {m.proposals.map(p => (
                <div
                  key={p.id}
                  className="ml-1 rounded-lg border border-amber-500/20 bg-amber-500/[0.06] px-3 py-2.5"
                >
                  <div className="text-sm font-medium text-amber-200">{p.title}</div>
                  {p.summary && p.summary !== p.title && (
                    <div className="text-xs text-slate-400 mt-0.5">{p.summary}</div>
                  )}
                  <div className="flex items-center gap-2 mt-2">
                    {onAcceptProposal && (
                      <button
                        onClick={() => onAcceptProposal(p)}
                        className="flex items-center gap-1 text-xs font-medium text-amber-300 bg-amber-500/15 hover:bg-amber-500/25 rounded-md px-2.5 py-1.5 transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                        {acceptLabel}
                      </button>
                    )}
                    <button
                      onClick={() => dismissProposal(i, p.id)}
                      className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-300 transition-colors px-1.5 py-1.5"
                    >
                      <X className="w-3 h-3" />
                      Dismiss
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ),
        )}

        {loading && (
          <div className="flex items-center gap-2 text-xs text-slate-500 px-1">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            MAIA is considering…
          </div>
        )}

        {error && (
          <div className="text-xs text-red-400 bg-red-500/10 rounded-lg px-3 py-2">{error}</div>
        )}
      </div>

      {/* Composer */}
      <div className="border-t border-slate-800/50 p-2.5">
        <div className="flex items-end gap-2">
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            placeholder={placeholder}
            className="flex-1 resize-none bg-[#1a1a2e] border border-slate-700/50 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500/40 max-h-24"
          />
          <button
            onClick={() => ask(input)}
            disabled={loading || !input.trim()}
            className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 transition-colors disabled:opacity-40"
            title="Ask MAIA"
          >
            <ArrowUp className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
