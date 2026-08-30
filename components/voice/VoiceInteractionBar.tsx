'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Keyboard, Send, X } from 'lucide-react';

export type VoiceInteractionState = 'idle' | 'listening' | 'thinking' | 'speaking' | 'recovering';

/**
 * GEOMETRY (Defect A — device-confirmed 2026-07-24, physical Safari):
 * this bar is `position: fixed; bottom: 0`, which tracks the LAYOUT
 * viewport — iOS does not shrink that for the software keyboard, so the
 * bar stayed pinned to the bottom of a viewport the keyboard no longer
 * occupies, floating above it with a gap. `window.visualViewport` reports
 * the actually-visible rectangle instead.
 *
 * This is the bar's OWN geometry, not Arrival's (#713): Arrival sizes a
 * full-screen field from `{top, height}`; this bar only needs a single
 * `bottom` inset, since it's anchored bottom/left/right and sized by its
 * own content. The keyboard's top edge — and so this bar's target `bottom`
 * offset — is `visualViewport.offsetTop + visualViewport.height`, NOT
 * `visualViewport.height` alone: the visible rectangle can itself be
 * offset within the layout viewport (e.g. the OS scrolling a focused
 * field into view), so `offsetTop` is not assumed to be 0.
 */
function useKeyboardBottomInset(): number {
  const [inset, setInset] = useState(0);

  useEffect(() => {
    const vv = typeof window !== 'undefined' ? window.visualViewport : null;
    if (!vv) return; // no API — inset stays 0, the pre-existing behavior

    const update = () => {
      const keyboardTop = vv.offsetTop + vv.height;
      const rawInset = window.innerHeight - keyboardTop;
      // Dev-only diagnostic: rawInset going negative means offsetTop+height
      // exceeded innerHeight, which shouldn't happen for any real keyboard
      // or viewport state. The Math.max clamp below already protects
      // production behavior; this just surfaces an unusual visualViewport
      // reading during development instead of silently swallowing it.
      if (process.env.NODE_ENV === 'development' && rawInset < 0) {
        console.warn('[VoiceInteractionBar] unexpected negative keyboard inset', {
          rawInset, offsetTop: vv.offsetTop, height: vv.height, innerHeight: window.innerHeight,
        });
      }
      setInset(Math.max(0, rawInset));
    };

    update();
    vv.addEventListener('resize', update);
    vv.addEventListener('scroll', update);
    return () => {
      vv.removeEventListener('resize', update);
      vv.removeEventListener('scroll', update);
    };
  }, []);

  return inset;
}

interface VoiceInteractionBarProps {
  voiceState: VoiceInteractionState;
  interimTranscript: string;
  onStop: () => void;
  onInterrupt: () => void;
  onTextSubmit: (text: string) => void;
  className?: string;
}

// State dot: small animated indicator
function StateDot({ state }: { state: VoiceInteractionState }) {
  if (state === 'listening') {
    return (
      <motion.span
        className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0"
        animate={{ opacity: [1, 0.4, 1], scale: [1, 0.8, 1] }}
        transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
      />
    );
  }
  if (state === 'thinking') {
    return (
      <motion.span
        className="w-2 h-2 rounded-full border border-amber-300 flex-shrink-0"
        animate={{ opacity: [0.5, 1, 0.5], rotate: [0, 180, 360] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: 'linear' }}
        style={{ display: 'inline-block' }}
      />
    );
  }
  if (state === 'speaking') {
    return (
      <span className="flex items-end gap-[2px] h-3 flex-shrink-0">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="w-[3px] rounded-full bg-teal-300 flex-shrink-0"
            animate={{ height: ['6px', '12px', '6px'] }}
            transition={{
              duration: 0.7,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: i * 0.15,
            }}
            style={{ display: 'inline-block' }}
          />
        ))}
      </span>
    );
  }
  // idle / recovering
  return (
    <span className="w-2 h-2 rounded-full border border-stone-500 flex-shrink-0 opacity-50" />
  );
}

// State label text
function stateLabel(state: VoiceInteractionState): string {
  switch (state) {
    case 'listening': return 'listening';
    case 'thinking': return 'thinking';
    case 'speaking': return 'speaking';
    case 'recovering': return '...';
    case 'idle': return '';
  }
}

function stateLabelClass(state: VoiceInteractionState): string {
  switch (state) {
    case 'listening': return 'text-emerald-400';
    case 'thinking': return 'text-amber-300';
    case 'speaking': return 'text-teal-300';
    default: return 'text-stone-500';
  }
}

export function VoiceInteractionBar({
  voiceState,
  interimTranscript,
  onStop,
  onInterrupt,
  onTextSubmit,
  className = '',
}: VoiceInteractionBarProps) {
  const [showTextInput, setShowTextInput] = useState(false);
  const [textValue, setTextValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const keyboardInset = useKeyboardBottomInset();

  const handleKeyboardToggle = useCallback(() => {
    setShowTextInput((v) => {
      if (!v) setTimeout(() => inputRef.current?.focus(), 50);
      return !v;
    });
  }, []);

  const handleSubmit = useCallback(() => {
    const trimmed = textValue.trim();
    if (!trimmed) return;
    onTextSubmit(trimmed);
    setTextValue('');
    setShowTextInput(false);
  }, [textValue, onTextSubmit]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSubmit();
      }
      if (e.key === 'Escape') {
        setShowTextInput(false);
        setTextValue('');
      }
    },
    [handleSubmit]
  );

  return (
    <div
      className={`fixed left-0 right-0 z-50 bg-maia-navy-900/95 backdrop-blur-md border-t border-white/5 ${className}`}
      style={{
        // Docks directly above the keyboard instead of floating above it
        // (see useKeyboardBottomInset). `bottom: 0` is still the resting
        // value when the keyboard is closed (inset is 0), so nothing
        // changes there.
        bottom: keyboardInset,
        // Safe-area handling applies exactly once: the home-indicator
        // clearance only means anything at rest (`bottom: 0`) — once the
        // keyboard is open, `keyboardInset` already accounts for the full
        // gap to the visible viewport's edge, so stacking a full safe-area
        // allowance on top of it would double-count. A flat 12px keeps the
        // same minimum breathing room in both states without stacking.
        paddingBottom: keyboardInset > 0 ? 12 : 'max(env(safe-area-inset-bottom), 12px)',
        pointerEvents: 'auto',
      }}
    >
      {/* Transcript row — fades in while listening */}
      <AnimatePresence>
        {voiceState === 'listening' && interimTranscript.length > 0 && (
          <motion.div
            key="transcript"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.15 }}
            className="overflow-hidden"
          >
            {/*
              ⛔ WAS `truncate` — `white-space: nowrap` plus an ellipsis. A long
              utterance was not "disappearing"; it was clamped to one line
              showing the START, so the words the member had just spoken were
              precisely the ones they could never see. The longer they talked,
              the less the display told them.

              ⭐ Now it wraps, holds the last few lines, and stays pinned to the
              bottom — newest speech visible, older speech scrolled above. The
              member watches their sentence arrive rather than watching its
              beginning sit still.
            */}
            <p
              ref={(el) => { if (el) el.scrollTop = el.scrollHeight; }}
              className="px-5 pt-2 text-sm italic text-stone-300/75 max-h-20 overflow-y-auto whitespace-pre-wrap break-words"
            >
              {interimTranscript}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Text input row — expands when keyboard toggled */}
      <AnimatePresence>
        {showTextInput && (
          <motion.div
            key="textinput"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.15 }}
            className="overflow-hidden"
          >
            <div className="flex items-center gap-2 px-4 pt-2">
              <input
                ref={inputRef}
                type="text"
                value={textValue}
                onChange={(e) => setTextValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a message..."
                // text-[16px], not text-sm (14px): iOS Safari auto-zooms on
                // focus below 16px, and zoom is never capped app-wide
                // (accessibility — see app/layout.tsx), so raising the
                // field's own font-size is the only fix that doesn't also
                // block a member's own zoom.
                className="flex-1 bg-maia-navy-800/80 text-stone-200 text-[16px] rounded-full px-4 py-2
                           placeholder-stone-600 border border-white/10 focus:outline-none
                           focus:border-maia-spice-500/40 transition-colors"
              />
              <button
                onClick={handleSubmit}
                disabled={!textValue.trim()}
                className="p-2 rounded-full bg-maia-spice-500/20 text-maia-spice-500
                           disabled:opacity-30 hover:bg-maia-spice-500/30 transition-colors"
                aria-label="Send"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Control row — always visible */}
      <div className="flex items-center gap-3 px-4 pt-3 pb-1 h-14">
        {/* State chip: dot + label */}
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <StateDot state={voiceState} />
          <span className={`text-sm font-light truncate transition-colors duration-200 ${stateLabelClass(voiceState)}`}>
            {stateLabel(voiceState)}
          </span>
        </div>

        {/* Contextual action button */}
        <AnimatePresence mode="wait">
          {voiceState === 'listening' && (
            <motion.button
              key="stop"
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85 }}
              transition={{ duration: 0.12 }}
              onClick={onStop}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs
                         border border-stone-600/60 text-stone-400 hover:border-stone-500
                         hover:text-stone-300 active:scale-95 transition-all"
              aria-label="Stop listening"
            >
              <X className="w-3 h-3" />
              stop
            </motion.button>
          )}
          {voiceState === 'speaking' && (
            <motion.button
              key="interrupt"
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85 }}
              transition={{ duration: 0.12 }}
              onClick={onInterrupt}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs
                         border border-teal-700/60 text-teal-400 hover:border-teal-600
                         hover:text-teal-300 active:scale-95 transition-all"
              aria-label="Cut in"
            >
              cut in
            </motion.button>
          )}
        </AnimatePresence>

        {/* Keyboard toggle — min 44px touch target for iOS */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            console.log('⌨️ [VoiceBar] Keyboard toggle tapped');
            handleKeyboardToggle();
          }}
          className={`min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full transition-colors ${
            showTextInput
              ? 'bg-maia-spice-500/20 text-maia-spice-500'
              : 'text-stone-400 hover:text-stone-300'
          }`}
          aria-label="Text input"
        >
          <Keyboard className="w-5 h-5" />
        </button>

      </div>
    </div>
  );
}
