'use client';

/**
 * FieldOrientationHeader
 *
 * When a member arrives at the journey/astrology screen via the MAIA handoff,
 * this header surfaces the living question they carried here — so the screen
 * opens already oriented to what matters rather than as a neutral tool.
 *
 * Reads from sessionStorage('astrologyEntryContext') — present only when
 * navigation originated from an AstrologyHandoffCard in the MAIA chat.
 * Renders nothing if no context is present.
 */

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import type { FieldContext } from '@/lib/astrology/astrologyHandoff';

export function FieldOrientationHeader() {
  const [fieldContext, setFieldContext] = useState<FieldContext | null>(null);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem('astrologyEntryContext');
      if (raw) {
        const ctx = JSON.parse(raw) as FieldContext;
        setFieldContext(ctx);
        console.info(JSON.stringify({
          tag: 'astrology-handoff-audit',
          journeyContextRead: true,
          inquiry: ctx.inquiry,
          emotionalSignature: ctx.emotionalSignature,
        }));
      }
    } catch {
      /* non-fatal — context is optional enrichment */
    }
  }, []);

  if (!fieldContext) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="mb-6 px-5 py-4 rounded-xl"
      style={{
        background: 'linear-gradient(135deg, rgba(12, 9, 7, 0.92) 0%, rgba(26, 18, 10, 0.92) 100%)',
        border: '1px solid rgba(155, 107, 60, 0.3)',
        boxShadow: 'inset 0 1px 0 rgba(216, 138, 45, 0.06)',
      }}
    >
      {/* Label */}
      <div className="flex items-center gap-2 mb-3">
        <span style={{ color: '#D88A2D', fontSize: '11px' }}>◈</span>
        <span
          className="text-xs font-medium tracking-widest uppercase"
          style={{ color: '#D88A2D', letterSpacing: '0.14em', opacity: 0.8 }}
        >
          Carried from your conversation
        </span>
      </div>

      {/* Living inquiry */}
      <p
        className="text-sm leading-relaxed font-serif mb-2"
        style={{ color: '#E7E2CF', opacity: 0.9 }}
      >
        {fieldContext.inquiry}
      </p>

      {/* Anchoring line — tells the user why this is here */}
      <p
        className="text-xs mt-2 mb-3"
        style={{ color: '#E7E2CF', opacity: 0.5 }}
      >
        We&apos;re using your chart to distinguish personal timing from the wider field.
      </p>

      {/* Emotional signature */}
      {fieldContext.emotionalSignature && (
        <p
          className="text-xs"
          style={{ color: '#E7E2CF', opacity: 0.4, fontStyle: 'italic' }}
        >
          {fieldContext.emotionalSignature}
        </p>
      )}

      {/* Symbolic frame if present */}
      {fieldContext.symbolicFrame && (
        <p
          className="text-xs mt-1"
          style={{ color: '#D88A2D', opacity: 0.55 }}
        >
          {fieldContext.symbolicFrame}
        </p>
      )}
    </motion.div>
  );
}
