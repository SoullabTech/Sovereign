'use client';

import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Keyboard, Send, X } from 'lucide-react';

export type VoiceInteractionState = 'idle' | 'listening' | 'thinking' | 'speaking' | 'recovering';

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
      className={`fixed bottom-0 left-0 right-0 z-50 bg-maia-navy-900/95 backdrop-blur-md border-t border-white/5 ${className}`}
      style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 12px)', pointerEvents: 'auto' }}
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
            <p className="px-5 pt-2 text-sm italic text-stone-300/75 truncate">
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
