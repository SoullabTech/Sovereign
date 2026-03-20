'use client';

import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import type { LyricSection } from '@/lib/songwriter/types';

interface LyricBlockProps {
  label: string;
  section: LyricSection;
  onChange: (id: string, text: string) => void;
}

function LyricBlock({ label, section, onChange }: LyricBlockProps) {
  const [copied, setCopied] = useState(false);

  function copyText() {
    navigator.clipboard.writeText(section.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="group">
      <div className="flex items-center justify-between mb-2">
        <span
          className="text-xs uppercase tracking-widest text-amber-400/50 font-light"
          style={{ fontFamily: 'Spectral, Georgia, serif' }}
        >
          {label}
        </span>
        <button
          onClick={copyText}
          className="opacity-0 group-hover:opacity-100 transition-opacity text-white/30 hover:text-amber-400/60 p-1"
          title="Copy"
        >
          {copied ? <Check size={12} /> : <Copy size={12} />}
        </button>
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
  onChange: (id: string, text: string) => void;
}

export function LyricsPanel({ lyrics, onChange }: LyricsPanelProps) {
  function copyAll() {
    const parts = [
      `Verse 1\n${lyrics.verse1.text}`,
      `\nChorus\n${lyrics.chorus.text}`,
      lyrics.bridge ? `\nBridge\n${lyrics.bridge.text}` : '',
    ].filter(Boolean);
    navigator.clipboard.writeText(parts.join('\n'));
  }

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
        <LyricBlock label="Verse 1" section={lyrics.verse1} onChange={onChange} />
        <LyricBlock label="Chorus" section={lyrics.chorus} onChange={onChange} />
        {lyrics.bridge && (
          <LyricBlock label="Bridge" section={lyrics.bridge} onChange={onChange} />
        )}
      </div>
    </section>
  );
}
