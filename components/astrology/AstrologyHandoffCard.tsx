'use client';

/**
 * AstrologyHandoffCard
 *
 * The threshold card that appears in the MAIA chat when a conversation
 * transitions into the Cosmic Blueprint. Three-stage coherence:
 *   Stage 1 — Recognition: why astrology is relevant to this exact moment
 *   Stage 2 — Threshold: the move is named clearly (precision, not limitation)
 *   Stage 3 — Return promise: what will happen after
 *
 * Design principle: enter a chamber, not fill out a form.
 * Animation: 200ms delay after MAIA finishes speaking — something forming, not reacting.
 */

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import type { AstrologyHandoff } from '@/lib/astrology/astrologyHandoff';

interface AstrologyHandoffCardProps {
  handoff: AstrologyHandoff;
}

export function AstrologyHandoffCard({ handoff }: AstrologyHandoffCardProps) {
  const router = useRouter();
  const [entering, setEntering] = useState(false);

  const handleEnter = () => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('astrologyEntryContext', JSON.stringify(handoff.fieldContext));
    }
    // Micro-delay: "entering a chamber" — fade + slight compress before route
    setEntering(true);
    setTimeout(() => router.push(handoff.destination), 180);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: entering ? 0 : 1, scale: entering ? 0.97 : 1, y: entering ? 4 : 0 }}
      transition={{ duration: entering ? 0.18 : 0.5, ease: 'easeOut', delay: entering ? 0 : 0.2 }}
      className="mt-4 rounded-xl overflow-hidden select-none"
      style={{
        background: 'linear-gradient(135deg, rgba(12, 9, 7, 0.96) 0%, rgba(26, 18, 10, 0.96) 100%)',
        border: '1px solid rgba(155, 107, 60, 0.4)',
        boxShadow: '0 4px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(216, 138, 45, 0.08)',
      }}
    >
      {/* Header */}
      <div
        className="px-5 py-3 flex items-center gap-2"
        style={{ borderBottom: '1px solid rgba(155, 107, 60, 0.18)' }}
      >
        <span style={{ color: '#D88A2D', fontSize: '13px' }}>◈</span>
        <span
          className="text-xs font-medium tracking-widest uppercase"
          style={{ color: '#D88A2D', letterSpacing: '0.14em' }}
        >
          Cosmic Blueprint
        </span>
      </div>

      {/* Body */}
      <div className="px-5 py-4">
        {/* Stage 1 — Recognition */}
        <p
          className="text-sm leading-relaxed mb-3 font-serif"
          style={{ color: '#E7E2CF', opacity: 0.9 }}
        >
          {handoff.cardBody}
        </p>

        {/* Stage 3 — Return promise: ties the module back to the living conversation */}
        <p
          className="text-xs leading-relaxed mb-5"
          style={{ color: '#E7E2CF', opacity: 0.5, fontStyle: 'italic' }}
        >
          Once that's loaded, we can sort what is yours to tend from what you may be absorbing from the wider field.
        </p>

        {/* Stage 2 — Threshold: CTA */}
        <button
          onClick={handleEnter}
          className="w-full py-3 px-4 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-all duration-200"
          style={{
            background: 'rgba(155, 107, 60, 0.22)',
            border: '1px solid rgba(155, 107, 60, 0.45)',
            color: '#E7E2CF',
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLButtonElement).style.background = 'rgba(155, 107, 60, 0.38)';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLButtonElement).style.background = 'rgba(155, 107, 60, 0.22)';
          }}
        >
          <span style={{ color: '#D88A2D', fontSize: '13px' }}>◈</span>
          Look through your Cosmic Blueprint
        </button>
      </div>
    </motion.div>
  );
}
