'use client';

import { motion } from 'framer-motion';

/**
 * FieldStateIndicator — Ambient collective field indicator
 *
 * Shows when collective field wisdom is present in MAIA's context.
 * NOT per-message — this sits at the conversation level (header area).
 * Subtle breathing glow. Only renders when field state data exists.
 *
 * Design: The lightest possible indicator. A faint pulse that says
 * "the field is listening" without demanding attention.
 */

interface FieldStateIndicatorProps {
  wisdomPresent: boolean;
  className?: string;
}

export function FieldStateIndicator({
  wisdomPresent,
  className = '',
}: FieldStateIndicatorProps) {
  if (!wisdomPresent) return null;

  return (
    <motion.div
      className={`inline-flex items-center gap-1.5 ${className}`}
      data-testid="field-state-indicator"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.5 }}
    >
      {/* Breathing dot */}
      <motion.div
        className="w-1.5 h-1.5 rounded-full"
        style={{ backgroundColor: '#a78bfa' }}
        animate={{
          opacity: [0.3, 0.7, 0.3],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      <span
        className="text-[9px] text-violet-300/40 tracking-wider select-none"
        style={{ fontFamily: 'Spectral, Georgia, serif' }}
      >
        field
      </span>
    </motion.div>
  );
}
