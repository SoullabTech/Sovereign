'use client';

import { useState } from 'react';
import { Copy, Check, RefreshCw, Sparkles, Loader2 } from 'lucide-react';
import type { LyricSection, SongSeed, ChordSuggestion } from '@/lib/songwriter/types';

type SectionKey = 'verse1' | 'chorus' | 'bridge';

interface LyricBlockProps {
  label: string;
  sectionKey: SectionKey;
  section: LyricSection;
  seed: SongSeed;
  currentLyrics: LyricsPanelProps['lyrics'];
  currentChords: ChordSuggestion;
  seedPrompt: string;
  onChange: (id: string, text: string) => void;
  onReplace: (sectionKey: SectionKey, lyric: LyricSection) => void;
}

function LyricBlock({
  label, sectionKey, section, seed, currentLyrics, currentChords, seedPrompt, onChange, onReplace,
}: LyricBlockProps) {
  const [copied, setCopied] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [refining, setRefining] = useState(false);

  function copyText() {
    navigator.clipboard.writeText(section.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  async function callRefine(action: 'regenerate' | 'refine') {
    const setter = action === 'regenerate' ? setRegenerating : setRefining;
    setter(true);
    try {
      const res = await fetch('/api/songwriter/refine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          section: sectionKey,
          seed,
          currentLyrics,
          currentChords,
          seedPrompt,
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (data.lyric) onReplace(sectionKey, data.lyric);
    } catch (err) {
      console.error('[LyricBlock] refine failed:', err);
    } finally {
      setter(false);
    }
  }

  const busy = regenerating || refining;

  return (
    <div className="group">
      <div className="flex items-center justify-between mb-2">
        <span
          className="text-xs uppercase tracking-widest text-amber-400/50 font-light"
          style={{ fontFamily: 'Spectral, Georgia, serif' }}
        >
          {label}
        </span>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => callRefine('regenerate')}
            disabled={busy}
            className="flex items-center gap-1 px-2 py-0.5 rounded text-xs text-white/30 hover:text-amber-400/60 transition-colors disabled:opacity-40"
            style={{ fontFamily: 'Spectral, Georgia, serif' }}
            title="Regenerate"
          >
            {regenerating
              ? <Loader2 size={10} className="animate-spin" />
              : <RefreshCw size={10} />
            }
            <span>Regenerate</span>
          </button>
          <button
            onClick={() => callRefine('refine')}
            disabled={busy}
            className="flex items-center gap-1 px-2 py-0.5 rounded text-xs text-white/30 hover:text-amber-400/60 transition-colors disabled:opacity-40"
            style={{ fontFamily: 'Spectral, Georgia, serif' }}
            title="Make it more me"
          >
            {refining
              ? <Loader2 size={10} className="animate-spin" />
              : <Sparkles size={10} />
            }
            <span>More like me</span>
          </button>
          <button
            onClick={copyText}
            className="text-white/30 hover:text-amber-400/60 p-1 transition-colors"
            title="Copy"
          >
            {copied ? <Check size={12} /> : <Copy size={12} />}
          </button>
        </div>
      </div>
      <textarea
        value={section.text}
        onChange={e => onChange(section.id, e.target.value)}
        rows={4}
        className="w-full bg-white/[0.02] border border-white/[0.06] hover:border-white/10
                   focus:border-amber-400/20 rounded-lg px-4 py-3
                   text-white/75 resize-none transition-all duration-200
                   focus:outline-none focus:bg-white/[0.04] text-sm leading-relaxed"
        style={{ fontFamily: 'Spectral, Georgia, serif' }}
      />
    </div>
  );
}

interface LyricsPanelProps {
  lyrics: {
    verse1: LyricSection;
    chorus: LyricSection;
    bridge: LyricSection | null;
  };
  seed: SongSeed;
  currentChords: ChordSuggestion;
  seedPrompt: string;
  onChange: (id: string, text: string) => void;
  onLyricReplace: (section: SectionKey, lyric: LyricSection) => void;
}

export function LyricsPanel({ lyrics, seed, currentChords, seedPrompt, onChange, onLyricReplace }: LyricsPanelProps) {
  function copyAll() {
    const parts = [
      `Verse 1\n${lyrics.verse1.text}`,
      `\nChorus\n${lyrics.chorus.text}`,
      lyrics.bridge ? `\nBridge\n${lyrics.bridge.text}` : '',
    ].filter(Boolean);
    navigator.clipboard.writeText(parts.join('\n'));
  }

  const sharedProps = { seed, currentLyrics: lyrics, currentChords, seedPrompt, onChange, onReplace: onLyricReplace };

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2
          className="text-sm font-light tracking-widest text-white/40 uppercase"
          style={{ fontFamily: 'Spectral, Georgia, serif' }}
        >
          Lyrics
        </h2>
        <button
          onClick={copyAll}
          className="text-xs text-white/25 hover:text-amber-400/50 transition-colors"
          style={{ fontFamily: 'Spectral, Georgia, serif' }}
        >
          Copy all
        </button>
      </div>

      <div className="space-y-5">
        <LyricBlock label="Verse 1" sectionKey="verse1" section={lyrics.verse1} {...sharedProps} />
        <LyricBlock label="Chorus" sectionKey="chorus" section={lyrics.chorus} {...sharedProps} />
        {lyrics.bridge && (
          <LyricBlock label="Bridge" sectionKey="bridge" section={lyrics.bridge} {...sharedProps} />
        )}
      </div>
    </section>
  );
}
