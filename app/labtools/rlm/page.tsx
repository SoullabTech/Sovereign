'use client';

/**
 * RLM Navigator UI
 *
 * Two modes:
 * - Navigate: Fast file recommendations (bloodhound)
 * - Ask: Agentic Q&A with Ollama (full proof objects + trace)
 */

import { useMemo, useRef, useState } from 'react';
import { RlmFileViewer } from '@/components/rlm/RlmFileViewer';
import type { RLMResult, RLMSourceRef, RLMUsage } from '@/lib/rlm/types';

type RLMMode = 'navigate' | 'ask';

type RLMFileHit = {
  file: string;
  score: number;
  why: string[];
  snippet?: string;
};

type RLMNavigateResponse = {
  success: true;
  query: string;
  nextFiles: RLMFileHit[];
  grepQueries: string[];
  confidence: number;
  stats: { indexedFiles: number; searchedFiles: number; ms: number };
  sourceRefs?: RLMSourceRef[];
  usage?: RLMUsage;
  warnings?: string[];
};

type RLMErrorResponse = { success: false; error: string };

export default function RLMPage() {
  // Mode and query
  const [mode, setMode] = useState<RLMMode>('navigate');
  const [query, setQuery] = useState('');
  const [includeTrace, setIncludeTrace] = useState(false);

  // Results (separate state for each mode)
  const [navigateRes, setNavigateRes] = useState<RLMNavigateResponse | RLMErrorResponse | null>(null);
  const [askRes, setAskRes] = useState<(RLMResult & { success: true }) | RLMErrorResponse | null>(null);

  // Loading and error
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingTime, setLoadingTime] = useState(0);
  const loadingTimerRef = useRef<NodeJS.Timeout | null>(null);

  // AbortController for cancellation
  const abortRef = useRef<AbortController | null>(null);

  // File viewer state
  const [openPath, setOpenPath] = useState<string | null>(null);
  const [openContent, setOpenContent] = useState<string | null>(null);
  const [openTruncated, setOpenTruncated] = useState(false);
  const [openErr, setOpenErr] = useState<string | null>(null);
  const [openLoading, setOpenLoading] = useState(false);

  // Persistent focus state (survives across manual searches)
  type RLMFocus = { path: string; content: string };
  const [lastFocus, setLastFocus] = useState<RLMFocus | null>(null);

  const canRun = useMemo(() => query.trim().length >= 2, [query]);

  async function run(opts?: { focus?: { path: string; content: string } }) {
    if (!canRun) return;

    // Reset UI
    setError(null);
    setLoading(true);
    setLoadingTime(0);

    // Cancel any in-flight request
    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;

    // Clear the "other mode" result
    if (mode === 'navigate') setAskRes(null);
    if (mode === 'ask') setNavigateRes(null);

    // Start loading timer
    loadingTimerRef.current = setInterval(() => {
      setLoadingTime((t) => t + 1);
    }, 1000);

    const endpoint = mode === 'ask' ? '/api/rlm/ask' : '/api/rlm/navigate';

    try {
      let payload: Record<string, unknown>;

      if (mode === 'ask') {
        payload = { query: query.trim(), includeTrace, maxIterations: 8 };
      } else {
        payload = { query: query.trim(), limit: 5, includeSnippets: true };
        // Use explicit focus if provided, else fall back to lastFocus
        const focusToUse = opts?.focus ?? lastFocus ?? undefined;
        if (focusToUse?.path && focusToUse?.content) {
          payload.focus = { path: focusToUse.path, content: focusToUse.content };
        }
      }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: ac.signal,
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        const detail = data?.detail || data?.error || `HTTP_${res.status}`;
        throw new Error(detail);
      }

      if (mode === 'navigate') {
        setNavigateRes(data as RLMNavigateResponse);
      } else {
        setAskRes({ ...data, success: true } as RLMResult & { success: true });
      }
    } catch (e: unknown) {
      if (e instanceof Error && e.name === 'AbortError') {
        setError('Cancelled.');
      } else {
        const msg = e instanceof Error ? e.message : 'Request failed';
        if (mode === 'navigate') {
          setNavigateRes({ success: false, error: msg });
        } else {
          setAskRes({ success: false, error: msg });
        }
        setError(msg);
      }
    } finally {
      setLoading(false);
      if (loadingTimerRef.current) {
        clearInterval(loadingTimerRef.current);
        loadingTimerRef.current = null;
      }
    }
  }

  function cancel() {
    abortRef.current?.abort();
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey) && canRun && !loading) {
      run();
    }
  }

  async function openFile(p: string) {
    setOpenErr(null);
    setOpenPath(p);
    setOpenContent(null);
    setOpenTruncated(false);
    setOpenLoading(true);

    try {
      const r = await fetch('/api/rlm/open', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: p }),
      });

      const data = await r.json();
      if (!data?.success) throw new Error(data?.error || 'Open failed');

      setOpenContent(data.content ?? '');
      setOpenTruncated(Boolean(data.truncated));
    } catch (e: unknown) {
      setOpenErr(e instanceof Error ? e.message : 'Open failed');
    } finally {
      setOpenLoading(false);
    }
  }

  function closeViewer() {
    setOpenPath(null);
    setOpenContent(null);
    setOpenErr(null);
  }

  // Get current result based on mode
  const currentNavigateRes = mode === 'navigate' && navigateRes?.success ? navigateRes : null;
  const currentAskRes = mode === 'ask' && askRes?.success ? askRes : null;
  const currentError = mode === 'navigate'
    ? (navigateRes && !navigateRes.success ? navigateRes.error : null)
    : (askRes && !askRes.success ? askRes.error : null);

  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-black/95 to-black px-4 py-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold text-white">RLM Navigator</h1>
          <p className="text-sm text-white/60">
            {mode === 'navigate'
              ? 'Ask "where is X implemented?" and get the next files to open.'
              : 'Ask questions about the codebase. Requires Ollama running locally.'}
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-3">
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              mode === 'navigate'
                ? 'e.g. Where is synastry saved to timeline? or How does explorerId become a UUID?'
                : 'e.g. Explain how the postgres client handles connections.'
            }
            className="w-full min-h-[120px] rounded-xl border border-white/10 bg-black/40 p-3 text-white/90 placeholder:text-white/30 outline-none resize-none"
          />

          {/* Mode toggle + controls */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Mode switch */}
            <div className="inline-flex rounded-lg border border-white/10 bg-white/5 p-1">
              <button
                type="button"
                onClick={() => setMode('navigate')}
                className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                  mode === 'navigate' ? 'bg-white/10 text-white' : 'text-white/60 hover:bg-white/5'
                }`}
              >
                Navigate
              </button>
              <button
                type="button"
                onClick={() => setMode('ask')}
                className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                  mode === 'ask' ? 'bg-white/10 text-white' : 'text-white/60 hover:bg-white/5'
                }`}
              >
                Ask
              </button>
            </div>

            {/* Ask-only: includeTrace */}
            <label
              className={`flex items-center gap-2 text-sm ${
                mode !== 'ask' ? 'opacity-40 cursor-not-allowed' : 'text-white/80'
              }`}
            >
              <input
                type="checkbox"
                checked={includeTrace}
                onChange={(e) => setIncludeTrace(e.target.checked)}
                disabled={mode !== 'ask'}
                className="rounded border-white/20"
              />
              includeTrace
            </label>

            {/* Run / Cancel */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => run()}
                disabled={!canRun || loading}
                className="rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 px-4 py-2 text-sm text-white disabled:opacity-50"
              >
                {loading ? `Running… ${loadingTime}s` : mode === 'navigate' ? 'Navigate' : 'Ask'}
              </button>

              <button
                type="button"
                onClick={cancel}
                disabled={!loading}
                className="rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-2 text-sm text-white/70 disabled:opacity-30"
              >
                Cancel
              </button>
            </div>

            <span className="text-xs text-white/40">⌘+Enter to run</span>
          </div>

          {/* Stats line */}
          {currentNavigateRes && (
            <div className="text-xs text-white/50">
              confidence {(currentNavigateRes.confidence * 100).toFixed(0)}% · indexed{' '}
              {currentNavigateRes.stats.indexedFiles} · {currentNavigateRes.stats.ms}ms
            </div>
          )}
          {currentAskRes && (
            <div className="text-xs text-white/50">
              confidence {(currentAskRes.confidence * 100).toFixed(0)}% · iterations{' '}
              {currentAskRes.iterations} · ~{currentAskRes.totalTokensEst} tokens
            </div>
          )}
        </div>

        {/* Loading hint for Ask mode */}
        {loading && mode === 'ask' && loadingTime >= 8 && (
          <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-3 text-sm text-amber-200/80">
            Taking a while? Make sure Ollama is running locally.
          </div>
        )}

        {/* Error display */}
        {(error || currentError) && (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-200">
            Error: {error || currentError}
            {mode === 'ask' && (
              <div className="mt-1 text-white/60">
                Tip: Ask requires Ollama running locally. Navigate does not.
              </div>
            )}
          </div>
        )}

        {/* Persistent focus indicator */}
        {lastFocus && mode === 'navigate' && (
          <div className="flex items-center justify-between rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-3 py-2">
            <div className="text-xs text-emerald-200/80 font-mono truncate">
              Focus: {lastFocus.path}
            </div>
            <button
              onClick={() => setLastFocus(null)}
              className="text-xs rounded-lg border border-emerald-500/30 bg-black/30 px-2 py-1 text-emerald-200/90 hover:bg-black/40"
            >
              Clear focus
            </button>
          </div>
        )}

        {/* Warnings display */}
        {(currentNavigateRes?.warnings?.length || currentAskRes?.warnings?.length) ? (
          <div className="flex flex-wrap gap-2">
            {(currentNavigateRes?.warnings || currentAskRes?.warnings || []).map((w) => (
              <span
                key={w}
                className="text-xs px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-white/60"
              >
                {w}
              </span>
            ))}
          </div>
        ) : null}

        {/* Navigate Results */}
        {currentNavigateRes && (
          <div className="grid gap-4 lg:grid-cols-2">
            <section className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-3">
              <h2 className="text-sm font-semibold text-white/80">Next files to open</h2>
              <div className="space-y-3">
                {currentNavigateRes.nextFiles.length === 0 && (
                  <div className="text-sm text-white/50">
                    No strong matches. Try different keywords.
                  </div>
                )}
                {currentNavigateRes.nextFiles.map((h) => (
                  <div
                    key={h.file}
                    className="rounded-xl border border-white/10 bg-black/30 p-3 space-y-2"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-sm text-white font-mono truncate">{h.file}</div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => openFile(h.file)}
                          className="text-xs rounded-lg border border-amber-500/30 bg-amber-500/10 px-2 py-1 text-amber-200/90 hover:bg-amber-500/20"
                        >
                          Open
                        </button>
                        <button
                          onClick={() => navigator.clipboard.writeText(h.file)}
                          className="text-xs rounded-lg border border-white/15 bg-white/5 px-2 py-1 text-white/70 hover:bg-white/10"
                        >
                          Copy
                        </button>
                      </div>
                    </div>
                    <div className="text-xs text-white/50">
                      score {h.score} · {h.why.join(' · ')}
                    </div>
                    {h.snippet && (
                      <pre className="text-xs text-white/70 overflow-auto rounded-lg border border-white/10 bg-black/40 p-2 whitespace-pre max-h-48">
                        {h.snippet}
                      </pre>
                    )}
                  </div>
                ))}
              </div>
            </section>

            <div className="space-y-4">
              <section className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-3">
                <h2 className="text-sm font-semibold text-white/80">Suggested grep queries</h2>
                <div className="space-y-2">
                  {currentNavigateRes.grepQueries.map((q, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-black/30 p-3"
                    >
                      <code className="text-xs text-white/80 overflow-auto">{q}</code>
                      <button
                        onClick={() => navigator.clipboard.writeText(q)}
                        className="text-xs rounded-lg border border-white/15 bg-white/5 px-2 py-1 text-white/70 hover:bg-white/10 shrink-0"
                      >
                        Copy
                      </button>
                    </div>
                  ))}
                </div>
              </section>

              {/* Proof anchors */}
              <section className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-3">
                <h2 className="text-sm font-semibold text-white/80">Proof anchors</h2>
                {currentNavigateRes.sourceRefs?.length ? (
                  <ul className="space-y-1 text-xs font-mono text-white/70">
                    {currentNavigateRes.sourceRefs.map((s, i) => (
                      <li key={`${s.path}-${i}`}>
                        {s.path}:{s.startLine}-{s.endLine}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-xs text-white/50">No sourceRefs.</div>
                )}
              </section>
            </div>
          </div>
        )}

        {/* Ask Results */}
        {currentAskRes && (
          <div className="space-y-4">
            {/* Answer */}
            <section className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-3">
              <h2 className="text-sm font-semibold text-white/80">Answer</h2>
              <div className="text-sm whitespace-pre-wrap text-white/90">{currentAskRes.answer}</div>
            </section>

            <div className="grid gap-4 lg:grid-cols-2">
              {/* Proof */}
              <section className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-3">
                <h2 className="text-sm font-semibold text-white/80">Proof</h2>
                {currentAskRes.sourceRefs?.length ? (
                  <ul className="space-y-1 text-xs font-mono text-white/70">
                    {currentAskRes.sourceRefs.map((s, i) => (
                      <li key={`${s.path}-${i}`} className="flex items-center justify-between gap-2">
                        <span>
                          {s.path}:{s.startLine}-{s.endLine}
                        </span>
                        <button
                          onClick={() => openFile(s.path)}
                          className="text-xs rounded border border-amber-500/30 bg-amber-500/10 px-1.5 py-0.5 text-amber-200/90 hover:bg-amber-500/20"
                        >
                          Open
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-xs text-white/50">No sourceRefs.</div>
                )}
              </section>

              {/* Sources (legacy) */}
              <section className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-3">
                <h2 className="text-sm font-semibold text-white/80">Files read</h2>
                {currentAskRes.sources?.length ? (
                  <ul className="space-y-1 text-xs font-mono text-white/70">
                    {currentAskRes.sources.map((src, i) => (
                      <li key={`${src}-${i}`} className="flex items-center justify-between gap-2">
                        <span className="truncate">{src}</span>
                        <button
                          onClick={() => openFile(src)}
                          className="text-xs rounded border border-amber-500/30 bg-amber-500/10 px-1.5 py-0.5 text-amber-200/90 hover:bg-amber-500/20"
                        >
                          Open
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-xs text-white/50">No files read.</div>
                )}
              </section>
            </div>

            {/* Trace (if requested) */}
            {includeTrace && currentAskRes.trace?.length ? (
              <section className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-3">
                <h2 className="text-sm font-semibold text-white/80">Trace</h2>
                <pre className="text-xs whitespace-pre-wrap text-white/70 overflow-auto max-h-96">
                  {JSON.stringify(currentAskRes.trace, null, 2)}
                </pre>
              </section>
            ) : null}

            {/* Usage */}
            {currentAskRes.usage && (
              <section className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-3">
                <h2 className="text-sm font-semibold text-white/80">Usage</h2>
                <div className="text-xs text-white/70 font-mono">
                  search: {currentAskRes.usage.used.search}/{currentAskRes.usage.budgets.search} ·{' '}
                  read: {currentAskRes.usage.used.read}/{currentAskRes.usage.budgets.read} ·{' '}
                  list: {currentAskRes.usage.used.list}/{currentAskRes.usage.budgets.list}
                </div>
              </section>
            )}
          </div>
        )}

        {/* File Viewer with Context Actions */}
        {openErr && (
          <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-200">
            {openErr}
          </div>
        )}

        {openPath && (
          <div className="flex items-center justify-between rounded-xl border border-white/10 bg-black/30 px-3 py-2">
            <div className="text-xs text-white/60 font-mono truncate">{openPath}</div>

            <div className="flex items-center gap-2">
              {mode === 'navigate' && (
                <button
                  disabled={!openContent || openLoading || loading}
                  onClick={() => {
                    if (!openPath || !openContent) return;
                    const nextFocus = { path: openPath, content: openContent };
                    setLastFocus(nextFocus);
                    run({ focus: nextFocus });
                  }}
                  className="text-xs rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2 py-1 text-emerald-200/90 hover:bg-emerald-500/20 disabled:opacity-50"
                >
                  Use as context
                </button>
              )}

              <button
                onClick={closeViewer}
                className="text-xs rounded-lg border border-white/15 bg-white/5 px-2 py-1 text-white/70 hover:bg-white/10"
              >
                Close
              </button>
            </div>
          </div>
        )}

        <RlmFileViewer
          filePath={openPath}
          content={openLoading ? null : openContent}
          truncated={openTruncated}
          onClose={closeViewer}
        />
      </div>
    </main>
  );
}
