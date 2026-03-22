'use client';

import { useState } from 'react';
import { RefreshCw, Loader2 } from 'lucide-react';
import type { ChordSuggestion, SongSeed, LyricSection } from '@/lib/songwriter/types';

interface ChordsPanelProps {
  chords: ChordSuggestion;
  seed: SongSeed;
  currentLyrics: {
    verse1: LyricSection;
    chorus: LyricSection;
    bridge: LyricSection | null;
  };
  seedPrompt: string;
  onChordsReplace: (chords: ChordSuggestion) => void;
}

function ChordRow({ label, chords }: { label: string; chords: string[] }) {
  return (
    <div className="flex items-start gap-4">
      <span
        className="text-xs text-white/30 w-14 shrink-0 pt-0.5"
        style={{ fontFamily: 'Spectral, Georgia, serif' }}
      >
        {label}
      </span>
      <div className="flex flex-wrap gap-2">
        {chords.map((chord, i) => (
          <span
            key={i}
            className="px-2.5 py-1 bg-white/[0.04] border border-white/[0.08] rounded text-white/70 text-sm font-mono"
          >
            {chord}
          </span>
        ))}
      </div>
    </div>
  );
}

export function ChordsPanel({ chords, seed, currentLyrics, seedPrompt, onChordsReplace }: ChordsPanelProps) {
  const [regenerating, setRegenerating] = useState(false);

  async function regenerateChords() {
    setRegenerating(true);
    try {
      const res = await fetch('/api/songwriter/refine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'regenerate',
          section: 'chords',
          seed,
          currentLyrics,
          currentChords: chords,
          seedPrompt,
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (data.chords) onChordsReplace(data.chords);
    } catch (err) {
      console.error('[ChordsPanel] regenerate failed:', err);
    } finally {
      setRegenerating(false);
    }
  }

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2
          className="text-sm font-light tracking-widest text-white/40 uppercase"
          style={{ fontFamily: 'Spectral, Georgia, serif' }}
        >
          Chords
        </h2>
        <button
          onClick={regenerateChords}
          disabled={regenerating}
          className="flex items-center gap-1.5 text-xs text-white/25 hover:text-amber-400/50 transition-colors disabled:opacity-40"
          style={{ fontFamily: 'Spectral, Georgia, serif' }}
        >
          {regenerating
            ? <Loader2 size={10} className="animate-spin" />
            : <RefreshCw size={10} />
          }
          Regenerate
        </button>
      </div>

      <div className="space-y-4">
        {/* Key + Capo */}
        <div className="flex items-center gap-6 pb-3 border-b border-white/[0.06]">
          <div>
            <div className="text-xs text-white/25 mb-1" style={{ fontFamily: 'Spectral, Georgia, serif' }}>Key</div>
            <div className="text-white/80 text-sm font-mono">{chords.key}</div>
          </div>
          <div>
            <div className="text-xs text-white/25 mb-1" style={{ fontFamily: 'Spectral, Georgia, serif' }}>Capo</div>
            <div className="text-white/80 text-sm font-mono">
              {chords.capo === 0 ? 'None' : `Fret ${chords.capo}`}
            </div>
          </div>
        </div>

        {/* Progressions */}
        <div className="space-y-3">
          <ChordRow label="Verse" chords={chords.verse} />
          <ChordRow label="Chorus" chords={chords.chorus} />
          {chords.bridge && chords.bridge.length > 0 && (
            <ChordRow label="Bridge" chords={chords.bridge} />
          )}
        </div>

        {/* Feel notes */}
        <div className="pt-3 border-t border-white/[0.06] space-y-2">
          <p
            className="text-white/40 text-xs leading-relaxed"
            style={{ fontFamily: 'Spectral, Georgia, serif' }}
          >
            {chords.feel}
          </p>
          <p
            className="text-white/30 text-xs leading-relaxed italic"
            style={{ fontFamily: 'Spectral, Georgia, serif' }}
          >
            {chords.strummingFeel}
          </p>
        </div>
      </div>
    </section>
  );
}
