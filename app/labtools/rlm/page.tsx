'use client';

/**
 * RLM Navigator UI
 *
 * Ask "where is X implemented?" and get the next files to open.
 */

import { useMemo, useState } from 'react';
import { RlmFileViewer } from '@/components/rlm/RlmFileViewer';

type RLMFileHit = {
  file: string;
  score: number;
  why: string[];
  snippet?: string;
};

type RLMResponse =
  | {
      success: true;
      query: string;
      nextFiles: RLMFileHit[];
      grepQueries: string[];
      confidence: number;
      stats: { indexedFiles: number; searchedFiles: number; ms: number };
    }
  | { success: false; error: string };

export default function RLMPage() {
  const [query, setQuery] = useState('');
  const [res, setRes] = useState<RLMResponse | null>(null);
  const [loading, setLoading] = useState(false);

  // File viewer state
  const [openPath, setOpenPath] = useState<string | null>(null);
  const [openContent, setOpenContent] = useState<string | null>(null);
  const [openTruncated, setOpenTruncated] = useState(false);
  const [openErr, setOpenErr] = useState<string | null>(null);
  const [openLoading, setOpenLoading] = useState(false);

  const canRun = useMemo(() => query.trim().length >= 2, [query]);

  async function run(opts?: { focus?: { path: string; content: string } }) {
    setLoading(true);
    setRes(null);

    try {
      const payload: {
        query: string;
        limit: number;
        includeSnippets: boolean;
        focus?: { path: string; content: string };
      } = { query, limit: 5, includeSnippets: true };

      if (opts?.focus?.path && opts?.focus?.content) {
        payload.focus = {
          path: opts.focus.path,
          content: opts.focus.content,
        };
      }

      const r = await fetch('/api/rlm/navigate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = (await r.json()) as RLMResponse;
      setRes(data);
    } catch {
      setRes({ success: false, error: 'network_error' });
    } finally {
      setLoading(false);
    }
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

  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-black/95 to-black px-4 py-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold text-white">RLM Navigator</h1>
          <p className="text-sm text-white/60">
            Ask &quot;where is X implemented?&quot; and get the next files to
            open.
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-3">
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder='e.g. Where is synastry saved to timeline? or How does explorerId become a UUID?'
            className="w-full min-h-[120px] rounded-xl border border-white/10 bg-black/40 p-3 text-white/90 placeholder:text-white/30 outline-none resize-none"
          />
          <div className="flex items-center gap-3">
            <button
              onClick={() => run()}
              disabled={!canRun || loading}
              className="rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 px-4 py-2 text-sm text-white disabled:opacity-50"
            >
              {loading ? 'Running…' : 'Navigate'}
            </button>
            <span className="text-xs text-white/40">⌘+Enter to run</span>
            {res && res.success && (
              <div className="text-xs text-white/50">
                confidence {(res.confidence * 100).toFixed(0)}% · indexed{' '}
                {res.stats.indexedFiles} · {res.stats.ms}ms
              </div>
            )}
          </div>
        </div>

        {res && !res.success && (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-200">
            Error: {res.error}
          </div>
        )}

        {res && res.success && (
          <div className="grid gap-4 lg:grid-cols-2">
            <section className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-3">
              <h2 className="text-sm font-semibold text-white/80">
                Next files to open
              </h2>
              <div className="space-y-3">
                {res.nextFiles.length === 0 && (
                  <div className="text-sm text-white/50">
                    No strong matches. Try different keywords.
                  </div>
                )}
                {res.nextFiles.map((h) => (
                  <div
                    key={h.file}
                    className="rounded-xl border border-white/10 bg-black/30 p-3 space-y-2"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-sm text-white font-mono truncate">
                        {h.file}
                      </div>
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

            <section className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-3">
              <h2 className="text-sm font-semibold text-white/80">
                Suggested grep queries
              </h2>
              <div className="space-y-2">
                {res.grepQueries.map((q, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-black/30 p-3"
                  >
                    <code className="text-xs text-white/80 overflow-auto">
                      {q}
                    </code>
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
            <div className="text-xs text-white/60 font-mono truncate">
              {openPath}
            </div>

            <div className="flex items-center gap-2">
              <button
                disabled={!openContent || openLoading || loading}
                onClick={() => {
                  if (!openPath || !openContent) return;
                  run({ focus: { path: openPath, content: openContent } });
                }}
                className="text-xs rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2 py-1 text-emerald-200/90 hover:bg-emerald-500/20 disabled:opacity-50"
              >
                Use as context
              </button>

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
