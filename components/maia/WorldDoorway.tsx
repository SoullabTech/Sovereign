'use client';

/**
 * WorldDoorway — A felt threshold into experiential worlds.
 *
 * Not a button. Not a link. A perceptual opening.
 * Appears inline below oracle messages when a world-level intent is detected.
 * Slower, more ambient than process doorways (RelationalDoorway).
 */

import React, { useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { MaiaUiAction } from '@/lib/types/ai';
import { emitWorldEvent } from '@/lib/telemetry/worldTelemetry';

interface WorldDoorwayProps {
  action: MaiaUiAction;
  onSelect: (action: MaiaUiAction) => void;
  onDismiss: () => void;
  visible: boolean;
}

export default function WorldDoorway({
  action,
  onSelect,
  onDismiss,
  visible,
}: WorldDoorwayProps) {
  const shownAt = useRef<number>(0);

  if (!action || action.type === 'none') return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 6 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200, delay: 1.2 }}
          className="mt-4 mb-3 ml-2"
          onAnimationComplete={() => {
            shownAt.current = Date.now();
            emitWorldEvent({
              eventType: 'doorway_shown',
              intent: action.type,
              world: action.type.replace('enter_', ''),
              confidence: action.confidence,
            });
          }}
        >
          <div className="max-w-sm">
            {/* Lead-in: MAIA's voice */}
            {action.leadIn && (
              <p className="text-amber-200/60 text-[15px] mb-2.5 italic leading-relaxed">
                {action.leadIn}
              </p>
            )}

            {/* The threshold */}
            <button
              onClick={() => {
                const timeToClick = shownAt.current
                  ? Math.round((Date.now() - shownAt.current) / 1000)
                  : null;
                emitWorldEvent({
                  eventType: 'doorway_clicked',
                  intent: action.type,
                  world: action.type.replace('enter_', ''),
                  confidence: action.confidence,
                  timeToClick,
                });
                onSelect(action);
              }}
              className="text-white/75 hover:text-white text-sm transition-colors duration-300 group"
            >
              <span className="text-amber-300/70 group-hover:text-amber-300 mr-2 transition-colors duration-300">
                &#x25D0;
              </span>
              {action.label}
            </button>

            {/* Dismiss */}
            <button
              onClick={() => {
                emitWorldEvent({
                  eventType: 'doorway_dismissed',
                  intent: action.type,
                  world: action.type.replace('enter_', ''),
                });
                onDismiss();
              }}
              className="block mt-2 text-white/20 hover:text-white/35 text-xs transition-colors duration-300"
            >
              Not now
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
