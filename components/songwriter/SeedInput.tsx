'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Loader2 } from 'lucide-react';

interface SeedInputProps {
  onSeed: (content: string) => void;
  isLoading: boolean;
}

export function SeedInput({ onSeed, isLoading }: SeedInputProps) {
  const [content, setContent] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (content.trim().length < 5 || isLoading) return;
    onSeed(content.trim());
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleSubmit(e);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-2xl mx-auto px-4 pt-24 pb-12"
    >
      <div className="mb-10 text-center">
        <h1
          className="text-3xl font-light text-amber-400/90 mb-3"
          style={{ fontFamily: 'Spectral, Georgia, serif' }}
        >
          Songwriter
        </h1>
        <p
          className="text-maia-ink-60 text-base"
          style={{ fontFamily: 'Spectral, Georgia, serif' }}
        >
          A second mind, sitting beside you.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <label
          className="block text-amber-400/70 text-sm font-light tracking-wide mb-2"
          style={{ fontFamily: 'Spectral, Georgia, serif' }}
        >
          What are you working through right now?
        </label>

        <textarea
          ref={textareaRef}
          value={content}
          onChange={e => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="A feeling, a line, a memory, or something you can't quite name yet..."
          rows={6}
          className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-5 py-4
                     text-white/80 placeholder-white/25 resize-none
                     focus:outline-none focus:border-amber-400/30 focus:bg-white/[0.05]
                     transition-all duration-200 text-base leading-relaxed"
          style={{ fontFamily: 'Spectral, Georgia, serif' }}
          disabled={isLoading}
        />

        <div className="flex items-center justify-between">
          <p className="text-white/20 text-xs" style={{ fontFamily: 'Spectral, Georgia, serif' }}>
            ⌘ + Enter to submit
          </p>
          <button
            type="submit"
            disabled={content.trim().length < 5 || isLoading}
            className="flex items-center gap-2 px-6 py-3 bg-amber-500/20 hover:bg-amber-500/30
                       text-amber-400 rounded-full transition-all duration-200
                       border border-amber-500/30 disabled:opacity-30 disabled:cursor-not-allowed
                       text-sm font-light tracking-wide"
            style={{ fontFamily: 'Spectral, Georgia, serif' }}
          >
            {isLoading ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                Interpreting...
              </>
            ) : (
              <>
                Start writing
                <ArrowRight size={14} />
              </>
            )}
          </button>
        </div>
      </form>
    </motion.div>
  );
}
