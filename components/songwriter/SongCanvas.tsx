'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { RotateCcw } from 'lucide-react';
import { LyricsPanel } from './LyricsPanel';
import { ChordsPanel } from './ChordsPanel';
import { StructurePanel } from './StructurePanel';
import type { SongSeed } from '@/lib/songwriter/types';

interface SongCanvasProps {
  seed: SongSeed;
  inputEcho: string;
  onReset: () => void;
}

export function SongCanvas({ seed, inputEcho, onReset }: SongCanvasProps) {
  // Local editable copy of lyrics
  const [lyrics, setLyrics] = useState(seed.lyrics);
  const [activeTitle, setActiveTitle] = useState(seed.titles[0] ?? 'Untitled');

  function handleLyricChange(id: string, text: string) {
    setLyrics(prev => ({
      ...prev,
      verse1: prev.verse1.id === id ? { ...prev.verse1, text } : prev.verse1,
      chorus: prev.chorus.id === id ? { ...prev.chorus, text } : prev.chorus,
      bridge: prev.bridge?.id === id ? { ...prev.bridge, text } : prev.bridge,
    }));
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="max-w-2xl mx-auto px-4 pt-12 pb-24"
    >
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between gap-4 mb-4">
          {/* Title selector */}
          <div className="flex-1">
            <div
              className="text-xs uppercase tracking-widest text-white/25 mb-2"
              style={{ fontFamily: 'Spectral, Georgia, serif' }}
            >
              Title
            </div>
            <div className="flex flex-wrap gap-2">
              {seed.titles.map(title => (
                <button
                  key={title}
                  onClick={() => setActiveTitle(title)}
                  className={`px-3 py-1.5 rounded-full text-sm transition-all duration-150 border
                    ${activeTitle === title
                      ? 'bg-amber-500/20 border-amber-500/40 text-amber-400'
                      : 'bg-white/[0.03] border-white/10 text-white/40 hover:text-white/60 hover:border-white/20'
                    }`}
                  style={{ fontFamily: 'Spectral, Georgia, serif' }}
                >
                  {title}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={onReset}
            className="shrink-0 flex items-center gap-1.5 text-xs text-white/20 hover:text-white/40
                       transition-colors pt-6"
            style={{ fontFamily: 'Spectral, Georgia, serif' }}
            title="Start over"
          >
            <RotateCcw size={12} />
            New seed
          </button>
        </div>

        {/* Interpretation summary */}
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl px-4 py-3 space-y-1">
          <div className="flex items-start gap-3 flex-wrap">
            <div>
              <span className="text-xs text-white/20 mr-2" style={{ fontFamily: 'Spectral, Georgia, serif' }}>
                Theme
              </span>
              <span className="text-white/60 text-xs" style={{ fontFamily: 'Spectral, Georgia, serif' }}>
                {seed.interpretation.theme}
              </span>
            </div>
            <div>
              <span className="text-xs text-white/20 mr-2" style={{ fontFamily: 'Spectral, Georgia, serif' }}>
                Feel
              </span>
              <span className="text-white/40 text-xs italic" style={{ fontFamily: 'Spectral, Georgia, serif' }}>
                {seed.interpretation.emotionalTone}
              </span>
            </div>
          </div>
          <p
            className="text-white/30 text-xs leading-relaxed"
            style={{ fontFamily: 'Spectral, Georgia, serif' }}
          >
            {seed.interpretation.narrativeDirection}
          </p>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-white/[0.06] mb-8" />

      {/* Main panels */}
      <div className="space-y-10">
        <LyricsPanel lyrics={lyrics} onChange={handleLyricChange} />
        <div className="border-t border-white/[0.06]" />
        <ChordsPanel chords={seed.chords} />
        <div className="border-t border-white/[0.06]" />
        <StructurePanel structure={seed.structure} coreStatement={seed.coreStatement} />
      </div>

      {/* Original input echo */}
      <div className="mt-10 pt-6 border-t border-white/[0.04]">
        <p
          className="text-white/15 text-xs italic leading-relaxed"
          style={{ fontFamily: 'Spectral, Georgia, serif' }}
        >
          &ldquo;{inputEcho}&rdquo;
        </p>
      </div>
    </motion.div>
  );
}
