'use client';

/**
 * Soul Mirror
 *
 * A first-touch entry mode into MAIA.
 * Not a feature. Not a tool. Not a dashboard.
 * A quiet threshold.
 *
 * Core principle:
 *   The system does not tell the user who they are.
 *   It reflects what is already present.
 *
 * MVP — one screen, two states:
 *   1. Asking   — six felt options + one button
 *   2. Reading  — one recognition line + one passage + quiet close
 *
 * Constraints (do not break):
 *   - No element labels visible to user (Fire/Water/etc.)
 *   - No progress indicators
 *   - No "results screen" language
 *   - No analytics or scoring surfaced
 *   - One screen only
 *
 * See: docs/book-studio/SOUL_MIRROR_ROUTING.md
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FELT_OPTIONS,
  routeSoulMirror,
  type FeltInput,
  type SoulMirrorResponse,
} from '@/lib/soulMirror/routeSoulMirror';

type View = 'asking' | 'reading';

export interface SoulMirrorProps {
  /** Optional callback invoked when the user saves the reflection. */
  onSave?: (response: SoulMirrorResponse) => void;
  /** Optional callback invoked when the user returns to the field. */
  onReturn?: () => void;
}

export default function SoulMirror({ onSave, onReturn }: SoulMirrorProps) {
  const [view, setView] = useState<View>('asking');
  const [selected, setSelected] = useState<FeltInput | null>(null);
  const [response, setResponse] = useState<SoulMirrorResponse | null>(null);
  const [saved, setSaved] = useState(false);
  const [history, setHistory] = useState<string[]>([]);

  const handleOpenDoorway = () => {
    if (!selected) return;
    const r = routeSoulMirror(selected, history);
    setResponse(r);
    setHistory((h) => [...h, r.block.id]);
    setView('reading');
  };

  const handleReturn = () => {
    setView('asking');
    setSelected(null);
    setResponse(null);
    setSaved(false);
    if (onReturn) onReturn();
  };

  const handleSave = () => {
    if (!response || saved) return;
    setSaved(true);
    if (onSave) onSave(response);
  };

  return (
    <div className="min-h-screen w-full bg-[#0f0d0b] text-amber-50/90 flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-xl">
        <AnimatePresence mode="wait">
          {view === 'asking' ? (
            <AskingView
              key="asking"
              selected={selected}
              onSelect={setSelected}
              onOpenDoorway={handleOpenDoorway}
            />
          ) : (
            response && (
              <ReadingView
                key="reading"
                response={response}
                saved={saved}
                onSave={handleSave}
                onReturn={handleReturn}
              />
            )
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ── Asking View ───────────────────────────────────────────────────────────

interface AskingViewProps {
  selected: FeltInput | null;
  onSelect: (input: FeltInput) => void;
  onOpenDoorway: () => void;
}

function AskingView({ selected, onSelect, onOpenDoorway }: AskingViewProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
      className="text-center"
    >
      <h1 className="text-amber-100/85 text-2xl md:text-[1.75rem] font-light tracking-wide mb-12 leading-relaxed">
        What is most present right now?
      </h1>

      <ul className="space-y-3.5 mb-12 text-left">
        {FELT_OPTIONS.map((opt) => {
          const isSelected = selected === opt.id;
          return (
            <li key={opt.id}>
              <button
                type="button"
                onClick={() => onSelect(opt.id)}
                className={[
                  'w-full text-left px-5 py-3 rounded-md transition-colors duration-300',
                  'text-[15px] md:text-base leading-relaxed',
                  isSelected
                    ? 'text-amber-100 bg-amber-300/10 border border-amber-300/30'
                    : 'text-amber-50/70 hover:text-amber-100 border border-transparent hover:border-white/10',
                ].join(' ')}
              >
                {opt.label}
              </button>
            </li>
          );
        })}
      </ul>

      <motion.button
        type="button"
        onClick={onOpenDoorway}
        disabled={!selected}
        initial={false}
        animate={{ opacity: selected ? 1 : 0.3 }}
        transition={{ duration: 0.4 }}
        className={[
          'text-amber-200/80 hover:text-amber-100 text-sm tracking-wide',
          'transition-colors duration-300',
          selected ? 'cursor-pointer' : 'cursor-default',
        ].join(' ')}
      >
        Show me a doorway
      </motion.button>
    </motion.div>
  );
}

// ── Reading View ──────────────────────────────────────────────────────────

interface ReadingViewProps {
  response: SoulMirrorResponse;
  saved: boolean;
  onSave: () => void;
  onReturn: () => void;
}

function ReadingView({ response, saved, onSave, onReturn }: ReadingViewProps) {
  const { recognition, block } = response;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.9, ease: 'easeOut' }}
      className="text-center"
    >
      {/* Recognition line — slightly larger, italic, gentle */}
      <p className="text-amber-100/85 text-xl md:text-[1.4rem] font-light italic leading-relaxed mb-14 max-w-md mx-auto">
        {recognition}
      </p>

      {/* Passage block — quiet, no element label */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.4, delay: 0.5, ease: 'easeOut' }}
        className="mb-14 text-left"
      >
        <div className="border-t border-amber-200/10 pt-8 pb-8 border-b">
          <p className="text-amber-200/50 text-xs tracking-wider uppercase mb-1">
            {block.title}
          </p>
          <p className="text-amber-200/30 text-[11px] tracking-wide mb-6">
            {block.source} · {block.readTime}
          </p>
          <p className="text-amber-50/80 text-base md:text-lg leading-relaxed">
            {block.openingLine}
          </p>
        </div>
      </motion.div>

      {/* Quiet close */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.6, delay: 1.4, ease: 'easeOut' }}
        className="text-amber-200/50 text-sm font-light italic mb-12"
      >
        Stay here as long as you need.
      </motion.p>

      {/* Optional, very subtle */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2, delay: 2.2, ease: 'easeOut' }}
        className="flex items-center justify-center gap-8 text-xs tracking-wide"
      >
        <button
          type="button"
          onClick={onSave}
          disabled={saved}
          className={[
            'transition-colors duration-300',
            saved
              ? 'text-amber-300/40 cursor-default'
              : 'text-amber-200/50 hover:text-amber-100 cursor-pointer',
          ].join(' ')}
        >
          {saved ? 'Kept' : 'Keep this'}
        </button>
        <span className="text-amber-200/20">·</span>
        <button
          type="button"
          onClick={onReturn}
          className="text-amber-200/50 hover:text-amber-100 transition-colors duration-300"
        >
          Return
        </button>
      </motion.div>
    </motion.div>
  );
}
