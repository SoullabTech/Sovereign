'use client';

import { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { SeedInput } from '@/components/songwriter/SeedInput';
import { SongCanvas } from '@/components/songwriter/SongCanvas';
import { PoemCanvas } from '@/components/songwriter/PoemCanvas';
import { getValidMemberId } from '@/lib/http/apiBase';
import type { SongSeed, PoemSeed } from '@/lib/songwriter/types';
import type { CreationSummary } from '@/app/api/songwriter/list/route';

type CreativeMode = 'song' | 'poem';

type State =
  | { phase: 'input' }
  | { phase: 'loading' }
  | { phase: 'song'; seed: SongSeed; inputEcho: string }
  | { phase: 'poem'; poem: PoemSeed; inputEcho: string }
  | { phase: 'error'; message: string };

function formatRelative(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 2) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function SongwriterPage() {
  const [mode, setMode] = useState<CreativeMode>('song');
  const [state, setState] = useState<State>({ phase: 'input' });
  const [saved, setSaved] = useState<CreationSummary[]>([]);

  // Load saved creations once on mount
  useEffect(() => {
    const memberId = getValidMemberId();
    if (!memberId) return;

    fetch(`/api/songwriter/list?memberId=${encodeURIComponent(memberId)}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.creations) setSaved(data.creations);
      })
      .catch(() => {});
  }, []);

  async function handleSeed(content: string) {
    setState({ phase: 'loading' });

    try {
      if (mode === 'song') {
        const res = await fetch('/api/songwriter/seed', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content }),
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error ?? `HTTP ${res.status}`);
        }

        const data = await res.json();
        setState({ phase: 'song', seed: data.seed, inputEcho: data.inputEcho });
      } else {
        const res = await fetch('/api/songwriter/poem', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content }),
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error ?? `HTTP ${res.status}`);
        }

        const data = await res.json();
        setState({ phase: 'poem', poem: data.poem, inputEcho: data.inputEcho });
      }
    } catch (err) {
      setState({
        phase: 'error',
        message: err instanceof Error ? err.message : 'Something went wrong.',
      });
    }
  }

  function reset() {
    setState({ phase: 'input' });
    // Refresh saved list on reset
    const memberId = getValidMemberId();
    if (!memberId) return;
    fetch(`/api/songwriter/list?memberId=${encodeURIComponent(memberId)}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data?.creations) setSaved(data.creations); })
      .catch(() => {});
  }

  const isInput = state.phase === 'input' || state.phase === 'loading' || state.phase === 'error';

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0D0F12] via-[#1A1D26] to-[#0D0F12]">
      {/* Creative Studio breadcrumb */}
      <div className="flex justify-start px-6 pt-5">
        <Link
          href="/fields/create"
          className="text-xs text-white/20 hover:text-white/40 transition-colors tracking-wide"
          style={{ fontFamily: 'Spectral, Georgia, serif' }}
        >
          ← Creative Studio
        </Link>
      </div>

      {/* Mode toggle — only visible at input phase */}
      {isInput && (
        <div className="flex justify-center pt-4">
          <div className="flex items-center gap-1 bg-white/[0.03] border border-white/[0.08] rounded-full p-1">
            {(['song', 'poem'] as CreativeMode[]).map(m => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`px-5 py-1.5 rounded-full text-sm transition-all duration-200 capitalize
                  ${mode === m
                    ? 'bg-amber-500/20 border border-amber-500/30 text-amber-400'
                    : 'text-white/30 hover:text-white/50'
                  }`}
                style={{ fontFamily: 'Spectral, Georgia, serif' }}
              >
                {m}
              </button>
            ))}
          </div>
        </div>
      )}

      <AnimatePresence mode="wait">
        {state.phase === 'input' && (
          <SeedInput key="input" onSeed={handleSeed} isLoading={false} />
        )}
        {state.phase === 'loading' && (
          <SeedInput key="loading" onSeed={handleSeed} isLoading={true} />
        )}
        {state.phase === 'song' && (
          <SongCanvas
            key="canvas"
            seed={state.seed}
            inputEcho={state.inputEcho}
            onReset={reset}
          />
        )}
        {state.phase === 'poem' && (
          <PoemCanvas
            key="poem"
            poem={state.poem}
            inputEcho={state.inputEcho}
            onReset={reset}
          />
        )}
        {state.phase === 'error' && (
          <div key="error" className="max-w-2xl mx-auto px-4 pt-32 text-center">
            <p
              className="text-white/40 text-base mb-6"
              style={{ fontFamily: 'Spectral, Georgia, serif' }}
            >
              {state.message}
            </p>
            <button
              onClick={reset}
              className="px-6 py-3 bg-amber-500/20 text-amber-400 rounded-full border border-amber-500/30
                         hover:bg-amber-500/30 transition-all text-sm"
              style={{ fontFamily: 'Spectral, Georgia, serif' }}
            >
              Try again
            </button>
          </div>
        )}
      </AnimatePresence>

      {/* Saved creations — visible only at input phase */}
      {isInput && saved.length > 0 && (
        <div className="max-w-2xl mx-auto px-4 pb-16">
          <div className="border-t border-white/[0.06] pt-8">
            <p
              className="text-xs uppercase tracking-widest text-white/20 mb-4"
              style={{ fontFamily: 'Spectral, Georgia, serif' }}
            >
              Your work
            </p>
            <div className="space-y-2">
              {saved.map(creation => (
                <div
                  key={creation.id}
                  className="flex items-start justify-between gap-4 px-4 py-3
                             bg-white/[0.02] border border-white/[0.05] rounded-xl
                             hover:border-white/10 transition-colors group"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className="text-white/50 text-sm"
                        style={{ fontFamily: 'Spectral, Georgia, serif' }}
                      >
                        {creation.title}
                      </span>
                      <span
                        className="text-xs text-white/15 capitalize"
                        style={{ fontFamily: 'Spectral, Georgia, serif' }}
                      >
                        {creation.type}
                      </span>
                    </div>
                    {creation.draft && (
                      <p
                        className="text-white/20 text-xs leading-relaxed truncate"
                        style={{ fontFamily: 'Spectral, Georgia, serif' }}
                      >
                        {creation.draft.split('\n')[0]}
                      </p>
                    )}
                  </div>
                  <span
                    className="shrink-0 text-xs text-white/15 pt-0.5"
                    style={{ fontFamily: 'Spectral, Georgia, serif' }}
                  >
                    {formatRelative(creation.updatedAt)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
