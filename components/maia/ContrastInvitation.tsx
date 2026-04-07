'use client';

/**
 * ContrastInvitation — Perceptual threshold, not a feature.
 *
 * Appears inline below oracle responses when the contrast gate passes.
 * Invitation feels like a door opening. Transition feels like crossing.
 * Never names traditions. Never explains the system.
 *
 * Pre-accept: "There's another way this could be seen."
 * Post-accept: breath transition → alternate response → integration question
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ContrastInvitationProps {
  /** Whether the invitation is visible (pre-accept state) */
  visible: boolean;
  /** The alternate lens response text (null before generation) */
  contrastText: string | null;
  /** Whether contrast response is currently streaming */
  isLoading: boolean;
  /** Whether user has accepted this contrast */
  accepted: boolean;
  /** Integration question to show after contrast */
  integrationQuestion: string | null;
  /** Called when user taps the invitation */
  onAccept: () => void;
  /** Called when user taps "Not now" */
  onDismiss: () => void;
}

export function ContrastInvitation({
  visible,
  contrastText,
  isLoading,
  accepted,
  integrationQuestion,
  onAccept,
  onDismiss,
}: ContrastInvitationProps) {
  // Pre-accept: show invitation
  if (!accepted) {
    return (
      <AnimatePresence>
        {visible && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ type: 'spring', damping: 30, stiffness: 300, delay: 0.8 }}
            className="mt-3 mb-2 ml-2"
          >
            <div className="max-w-xs">
              <button
                onClick={onAccept}
                className="text-white/80 hover:text-white text-sm transition-colors duration-200 group"
              >
                <span className="text-amber-300/70 group-hover:text-amber-300 mr-1.5">
                  &rarr;
                </span>
                There&apos;s another way this could be seen.
              </button>

              <button
                onClick={onDismiss}
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

  // Post-accept: breath transition → contrast response → integration question
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="mt-4 mb-2"
    >
      {/* Breath transition while loading */}
      {isLoading && !contrastText && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="h-px bg-amber-200/20 mx-4 my-6"
        />
      )}

      {/* Contrast response */}
      {contrastText && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          <p
            className="text-stone-300/80 leading-relaxed"
            style={{ fontFamily: 'Spectral, Georgia, serif' }}
          >
            {contrastText}
          </p>

          {/* Integration question */}
          {integrationQuestion && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2, duration: 0.6 }}
              className="text-amber-200/50 text-sm italic mt-4"
            >
              {integrationQuestion}
            </motion.p>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}
