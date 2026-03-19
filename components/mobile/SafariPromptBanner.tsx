'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink, Mic } from 'lucide-react';

interface SafariPromptBannerProps {
  /** Variant: 'banner' shows inline at top; 'inline' shows in place of the mic button */
  variant?: 'banner' | 'inline';
  className?: string;
}

/**
 * SafariPromptBanner
 *
 * Shown only in iOS standalone PWA mode (installed home-screen shortcut).
 * Apple does not expose Web Speech API in this context — voice input is unavailable.
 *
 * Frames this as a recommendation, not a warning. The installed app still works
 * for text, journaling, and listening to MAIA. Voice input needs Safari.
 *
 * The banner can be dismissed for the session; it reappears next launch
 * as a gentle ongoing reminder.
 */
export function SafariPromptBanner({ variant = 'banner', className = '' }: SafariPromptBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  if (variant === 'inline') {
    return (
      <div className={`flex flex-col items-center gap-2 ${className}`}>
        {/* Disabled mic icon — visually honest */}
        <div className="w-24 h-24 rounded-full flex items-center justify-center
                        bg-white/5 border border-white/10">
          <Mic className="w-10 h-10 text-white/20" />
        </div>

        <p className="text-white/50 text-xs text-center max-w-[200px] leading-relaxed">
          Voice input works in Safari.{' '}
          <button
            onClick={openInSafari}
            className="text-amber-400/80 underline underline-offset-2"
          >
            Open MAIA in Safari
          </button>{' '}
          for full conversation.
        </p>
      </div>
    );
  }

  return (
    <AnimatePresence>
      {!dismissed && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25 }}
          className={`
            flex items-center justify-between gap-3
            px-4 py-3
            bg-amber-500/10 border-b border-amber-500/20
            ${className}
          `}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <Mic className="w-4 h-4 text-amber-400/70 flex-shrink-0" />
            <p className="text-amber-200/80 text-xs leading-snug">
              For voice conversation, open MAIA in Safari.{' '}
              <button
                onClick={openInSafari}
                className="inline-flex items-center gap-0.5 underline underline-offset-2 text-amber-300"
              >
                Open in Safari
                <ExternalLink className="w-3 h-3" />
              </button>
            </p>
          </div>

          <button
            onClick={() => setDismissed(true)}
            className="flex-shrink-0 p-1 text-white/30 hover:text-white/60 transition-colors"
            aria-label="Dismiss"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * Opens the current page in Safari.
 * On iOS, tapping a link with target="_blank" from a standalone PWA
 * opens Safari rather than the WebView.
 */
function openInSafari() {
  const a = document.createElement('a');
  a.href = window.location.href;
  a.target = '_blank';
  a.rel = 'noopener noreferrer';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
