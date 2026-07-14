'use client';

/**
 * RelationalDoorway — MAIA's conversational continuation into process.
 *
 * Not a button. A relational threshold.
 * Appears inline below oracle messages when intent is detected.
 * Lead-in text feels like MAIA speaking; action feels like an invitation.
 */

import React, { useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { MaiaUiAction } from '@/lib/types/ai';
import { emitWorldEvent } from '@/lib/telemetry/worldTelemetry';

interface RelationalDoorwayProps {
  action: MaiaUiAction;
  onSelect: (action: MaiaUiAction) => void;
  onDismiss: () => void;
  visible: boolean;
}

export default function RelationalDoorway({
  action,
  onSelect,
  onDismiss,
  visible,
}: RelationalDoorwayProps) {
  const shownAt = useRef<number>(0);

  if (!action || action.type === 'none') return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 4 }}
          transition={{ type: 'spring', damping: 30, stiffness: 300, delay: 0.8 }}
          className="mt-3 mb-2 ml-2"
          onAnimationComplete={() => {
            shownAt.current = Date.now();
            emitWorldEvent({
              eventType: 'doorway_shown',
              intent: action.type,
              confidence: action.confidence,
            });
          }}
        >
          <div className="max-w-xs">
            {/* Lead-in: MAIA's voice */}
            {action.leadIn && (
              <p className="text-amber-200/60 text-sm mb-2 italic">
                {action.leadIn}
              </p>
            )}

            {/* Action: the doorway */}
            <button
              onClick={() => {
                console.log('[Doorway] clicked', { type: action.type });
                const timeToClick = shownAt.current
                  ? Math.round((Date.now() - shownAt.current) / 1000)
                  : null;
                emitWorldEvent({
                  eventType: 'doorway_clicked',
                  intent: action.type,
                  confidence: action.confidence,
                  timeToClick,
                });
                onSelect(action);
              }}
              className="text-white/80 hover:text-white text-sm transition-colors duration-200 group"
            >
              <span className="text-amber-300/70 group-hover:text-amber-300 mr-1.5">
                &rarr;
              </span>
              {action.label}
            </button>

            {/* Dismiss */}
            <button
              onClick={() => {
                emitWorldEvent({
                  eventType: 'doorway_dismissed',
                  intent: action.type,
                });
                onDismiss();
              }}
              className="block mt-1.5 text-white/25 hover:text-white/40 text-xs transition-colors duration-200"
            >
              Not now
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
