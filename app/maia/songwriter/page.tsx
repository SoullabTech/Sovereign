'use client';

import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { SeedInput } from '@/components/songwriter/SeedInput';
import { SongCanvas } from '@/components/songwriter/SongCanvas';
import type { SongSeed } from '@/lib/songwriter/types';

type State =
  | { phase: 'input' }
  | { phase: 'loading' }
  | { phase: 'canvas'; seed: SongSeed; inputEcho: string }
  | { phase: 'error'; message: string };

export default function SongwriterPage() {
  const [state, setState] = useState<State>({ phase: 'input' });

  async function handleSeed(content: string) {
    setState({ phase: 'loading' });

    try {
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
      setState({ phase: 'canvas', seed: data.seed, inputEcho: data.inputEcho });
    } catch (err) {
      setState({
        phase: 'error',
        message: err instanceof Error ? err.message : 'Something went wrong.',
      });
    }
  }

  function reset() {
    setState({ phase: 'input' });
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0D0F12] via-[#1A1D26] to-[#0D0F12]">
      <AnimatePresence mode="wait">
        {state.phase === 'input' && (
          <SeedInput key="input" onSeed={handleSeed} isLoading={false} />
        )}
        {state.phase === 'loading' && (
          <SeedInput key="loading" onSeed={handleSeed} isLoading={true} />
        )}
        {state.phase === 'canvas' && (
          <SongCanvas
            key="canvas"
            seed={state.seed}
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
    </div>
  );
}
