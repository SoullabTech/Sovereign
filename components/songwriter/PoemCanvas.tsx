'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { RotateCcw } from 'lucide-react';
import { useAutosave } from '@/lib/songwriter/useAutosave';
import { getValidMemberId } from '@/lib/http/apiBase';
import type { PoemSeed } from '@/lib/songwriter/types';

interface PoemCanvasProps {
  poem: PoemSeed;
  inputEcho: string;
  onReset: () => void;
}

export function PoemCanvas({ poem, inputEcho, onReset }: PoemCanvasProps) {
  const [activeTitle, setActiveTitle] = useState(poem.titles[0] ?? 'Untitled');
  const [poemText, setPoemText] = useState(poem.poem);
  const [memberId] = useState<string | null>(() => getValidMemberId());

  const { saveStatus } = useAutosave({
    memberId,
    type: 'poem',
    title: activeTitle,
    inputEcho,
    seed: poem,
    draft: poemText,
  });

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
              {poem.titles.map(title => (
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

          <div className="shrink-0 flex flex-col items-end gap-2 pt-6">
            {/* Save status */}
            {saveStatus === 'saved' && (
              <span
                className="text-xs text-white/20"
                style={{ fontFamily: 'Spectral, Georgia, serif' }}
              >
                Saved
              </span>
            )}
            {saveStatus === 'saving' && (
              <span
                className="text-xs text-white/15"
                style={{ fontFamily: 'Spectral, Georgia, serif' }}
              >
                Saving...
              </span>
            )}
            <button
              onClick={onReset}
              className="flex items-center gap-1.5 text-xs text-white/20 hover:text-white/40 transition-colors"
              style={{ fontFamily: 'Spectral, Georgia, serif' }}
              title="Start over"
            >
              <RotateCcw size={12} />
              New seed
            </button>
          </div>
        </div>

        {/* Interpretation summary */}
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl px-4 py-3 space-y-1">
          <div className="flex items-start gap-3 flex-wrap">
            <div>
              <span className="text-xs text-white/20 mr-2" style={{ fontFamily: 'Spectral, Georgia, serif' }}>
                Theme
              </span>
              <span className="text-white/60 text-xs" style={{ fontFamily: 'Spectral, Georgia, serif' }}>
                {poem.theme}
              </span>
            </div>
            <div>
              <span className="text-xs text-white/20 mr-2" style={{ fontFamily: 'Spectral, Georgia, serif' }}>
                Form
              </span>
              <span className="text-white/40 text-xs italic" style={{ fontFamily: 'Spectral, Georgia, serif' }}>
                {poem.form}
              </span>
            </div>
            <div>
              <span className="text-xs text-white/20 mr-2" style={{ fontFamily: 'Spectral, Georgia, serif' }}>
                Voice
              </span>
              <span className="text-white/40 text-xs italic" style={{ fontFamily: 'Spectral, Georgia, serif' }}>
                {poem.voice}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-white/[0.06] mb-8" />

      {/* Poem — editable */}
      <div className="mb-8">
        <div
          className="text-xs uppercase tracking-widest text-white/25 mb-3"
          style={{ fontFamily: 'Spectral, Georgia, serif' }}
        >
          Draft
        </div>
        <textarea
          value={poemText}
          onChange={e => setPoemText(e.target.value)}
          rows={poemText.split('\n').length + 2}
          className="w-full bg-transparent border-none resize-none text-white/75 leading-loose
                     focus:outline-none placeholder-white/20 text-base"
          style={{ fontFamily: 'Spectral, Georgia, serif' }}
          spellCheck={false}
        />
      </div>

      <div className="border-t border-white/[0.06] mb-8" />

      {/* Core Image */}
      <div className="mb-6">
        <div
          className="text-xs uppercase tracking-widest text-white/25 mb-2"
          style={{ fontFamily: 'Spectral, Georgia, serif' }}
        >
          Core image
        </div>
        <p
          className="text-white/50 text-sm italic leading-relaxed"
          style={{ fontFamily: 'Spectral, Georgia, serif' }}
        >
          {poem.coreImage}
        </p>
      </div>

      {/* Core Statement */}
      <div className="mb-8">
        <div
          className="text-xs uppercase tracking-widest text-white/25 mb-2"
          style={{ fontFamily: 'Spectral, Georgia, serif' }}
        >
          What this poem holds
        </div>
        <p
          className="text-white/40 text-sm leading-relaxed"
          style={{ fontFamily: 'Spectral, Georgia, serif' }}
        >
          {poem.coreStatement}
        </p>
      </div>

      {/* Original input echo */}
      <div className="pt-6 border-t border-white/[0.04]">
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
