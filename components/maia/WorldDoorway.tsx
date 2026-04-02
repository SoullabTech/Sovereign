'use client';

import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';

type WorldDoorwayProps = {
  leadIn: string;
  label: string;
  visible?: boolean;
  onSelect: () => void;
  onDismiss: () => void;
};

export default function WorldDoorway({
  leadIn,
  label,
  visible = true,
  onSelect,
  onDismiss,
}: WorldDoorwayProps) {
  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          transition={{
            type: 'spring',
            damping: 24,
            stiffness: 190,
            delay: 1.2,
          }}
          className="mt-4"
        >
          <p className="mb-2 text-sm italic text-amber-200/[0.68]">{leadIn}</p>

          <button
            type="button"
            onClick={onSelect}
            className="group inline-flex items-center gap-2 text-sm text-white/[0.78] transition hover:text-white"
          >
            <span className="text-base text-amber-300/[0.82] transition group-hover:text-amber-300">
              &#x25D0;
            </span>
            <span>{label}</span>
          </button>

          <div>
            <button
              type="button"
              onClick={onDismiss}
              className="mt-1.5 text-xs text-white/[0.22] transition hover:text-white/40"
            >
              Not now
            </button>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
