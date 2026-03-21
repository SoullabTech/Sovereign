'use client';

import { motion } from 'framer-motion';
import { RotateCcw, Check, Loader2, AlertCircle, Download } from 'lucide-react';
import { LyricsPanel } from './LyricsPanel';
import { ChordsPanel } from './ChordsPanel';
import { StructurePanel } from './StructurePanel';
import type { SongSeed, LyricSection, ChordSuggestion } from '@/lib/songwriter/types';
import type { SaveState } from '@/lib/songwriter/useSongDraft';

type SectionKey = 'verse1' | 'chorus' | 'bridge';

interface SongCanvasProps {
  seed: SongSeed;
  inputEcho: string;
  // Controlled state from useSongDraft
  title: string;
  lyrics: {
    verse1: LyricSection;
    chorus: LyricSection;
    bridge: LyricSection | null;
  };
  chords: ChordSuggestion;
  saveState: SaveState;
  lastSavedAt: Date | null;
  onTitleChange: (title: string) => void;
  onLyricChange: (id: string, text: string) => void;
  onLyricReplace: (section: SectionKey, lyric: LyricSection) => void;
  onChordsReplace: (chords: ChordSuggestion) => void;
  onReset: () => void;
}

function SaveIndicator({ state, lastSavedAt }: { state: SaveState; lastSavedAt: Date | null }) {
  if (state === 'idle') return null;

  return (
    <div
      className="flex items-center gap-1.5 text-xs transition-all"
      style={{ fontFamily: 'Spectral, Georgia, serif' }}
    >
      {state === 'saving' && (
        <>
          <Loader2 size={10} className="animate-spin text-white/30" />
          <span className="text-white/25">Saving...</span>
        </>
      )}
      {state === 'saved' && (
        <>
          <Check size={10} className="text-amber-400/40" />
          <span className="text-white/25">
            Saved{lastSavedAt ? ` ${new Date(lastSavedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : ''}
          </span>
        </>
      )}
      {state === 'error' && (
        <>
          <AlertCircle size={10} className="text-red-400/50" />
          <span className="text-red-400/50">Save failed</span>
        </>
      )}
    </div>
  );
}

export function SongCanvas({
  seed,
  inputEcho,
  title,
  lyrics,
  chords,
  saveState,
  lastSavedAt,
  onTitleChange,
  onLyricChange,
  onLyricReplace,
  onChordsReplace,
  onReset,
}: SongCanvasProps) {

  function downloadTxt() {
    const lines = [
      title,
      '',
      `Based on: "${inputEcho}"`,
      '',
      '— Verse 1 —',
      lyrics.verse1.text,
      '',
      '— Chorus —',
      lyrics.chorus.text,
    ];
    if (lyrics.bridge) {
      lines.push('', '— Bridge —', lyrics.bridge.text);
    }
    lines.push(
      '',
      '— Chords —',
      `Key: ${chords.key}${chords.capo > 0 ? ` (Capo ${chords.capo})` : ''}`,
      `Verse: ${chords.verse.join(' - ')}`,
      `Chorus: ${chords.chorus.join(' - ')}`,
      chords.bridge?.length ? `Bridge: ${chords.bridge.join(' - ')}` : '',
    );

    const blob = new Blob([lines.filter(l => l !== undefined).join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.replace(/[^a-z0-9]/gi, '-').toLowerCase() || 'song'}.txt`;
    a.click();
    URL.revokeObjectURL(url);
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
          <div className="flex-1">
            <div
              className="text-xs uppercase tracking-widest text-white/25 mb-2"
              style={{ fontFamily: 'Spectral, Georgia, serif' }}
            >
              Title
            </div>
            {/* Editable title */}
            <input
              type="text"
              value={title}
              onChange={e => onTitleChange(e.target.value)}
              className="w-full bg-transparent text-amber-400/80 text-lg font-light
                         border-b border-white/10 focus:border-amber-400/30
                         focus:outline-none pb-1 transition-colors"
              style={{ fontFamily: 'Spectral, Georgia, serif' }}
              placeholder="Untitled Song"
            />
            {/* Title suggestions */}
            {seed.titles.length > 1 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {seed.titles.map(t => (
                  <button
                    key={t}
                    onClick={() => onTitleChange(t)}
                    className={`px-2.5 py-1 rounded-full text-xs transition-all border
                      ${title === t
                        ? 'bg-amber-500/15 border-amber-500/30 text-amber-400/70'
                        : 'bg-white/[0.02] border-white/[0.07] text-white/30 hover:text-white/50'
                      }`}
                    style={{ fontFamily: 'Spectral, Georgia, serif' }}
                  >
                    {t}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col items-end gap-2 pt-1">
            <button
              onClick={onReset}
              className="flex items-center gap-1.5 text-xs text-white/20 hover:text-white/40 transition-colors"
              style={{ fontFamily: 'Spectral, Georgia, serif' }}
            >
              <RotateCcw size={12} />
              New seed
            </button>
            <button
              onClick={downloadTxt}
              className="flex items-center gap-1.5 text-xs text-white/20 hover:text-amber-400/50 transition-colors"
              style={{ fontFamily: 'Spectral, Georgia, serif' }}
            >
              <Download size={12} />
              Download
            </button>
            <SaveIndicator state={saveState} lastSavedAt={lastSavedAt} />
          </div>
        </div>

        {/* Interpretation summary */}
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl px-4 py-3 space-y-1">
          <div className="flex items-start gap-3 flex-wrap">
            <div>
              <span className="text-xs text-white/20 mr-2" style={{ fontFamily: 'Spectral, Georgia, serif' }}>Theme</span>
              <span className="text-white/60 text-xs" style={{ fontFamily: 'Spectral, Georgia, serif' }}>
                {seed.interpretation.theme}
              </span>
            </div>
            <div>
              <span className="text-xs text-white/20 mr-2" style={{ fontFamily: 'Spectral, Georgia, serif' }}>Feel</span>
              <span className="text-white/40 text-xs italic" style={{ fontFamily: 'Spectral, Georgia, serif' }}>
                {seed.interpretation.emotionalTone}
              </span>
            </div>
          </div>
          <p className="text-white/30 text-xs leading-relaxed" style={{ fontFamily: 'Spectral, Georgia, serif' }}>
            {seed.interpretation.narrativeDirection}
          </p>
        </div>
      </div>

      <div className="border-t border-white/[0.06] mb-8" />

      <div className="space-y-10">
        <LyricsPanel
          lyrics={lyrics}
          seed={seed}
          currentChords={chords}
          seedPrompt={inputEcho}
          onChange={onLyricChange}
          onLyricReplace={onLyricReplace}
        />
        <div className="border-t border-white/[0.06]" />
        <ChordsPanel
          chords={chords}
          seed={seed}
          currentLyrics={lyrics}
          seedPrompt={inputEcho}
          onChordsReplace={onChordsReplace}
        />
        <div className="border-t border-white/[0.06]" />
        <StructurePanel structure={seed.structure} coreStatement={seed.coreStatement} />
      </div>

      <div className="mt-10 pt-6 border-t border-white/[0.04]">
        <p className="text-white/15 text-xs italic leading-relaxed" style={{ fontFamily: 'Spectral, Georgia, serif' }}>
          &ldquo;{inputEcho}&rdquo;
        </p>
      </div>
    </motion.div>
  );
}
