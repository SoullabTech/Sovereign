"use client";

import { motion } from 'framer-motion';
import { ConversationState } from '@/lib/voice/MayaHybridVoiceSystem';
import { Mic, MicOff, Pause, Loader2 } from 'lucide-react';

interface MayaVoiceIndicatorProps {
  state: ConversationState;
  onClick?: () => void;
  className?: string;
}

/**
 * Breathing visual indicator for Maya's voice state
 * Implements animations from Voice System White Paper
 */
export function MayaVoiceIndicator({ state, onClick, className = '' }: MayaVoiceIndicatorProps) {
  // Animation variants based on state
  const animations = {
    dormant: {
      scale: 1,
      opacity: 0.5,
    },
    listening: {
      scale: [1, 1.05, 1],
      opacity: [0.8, 1, 0.8],
      transition: {
        duration: 4,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    },
    processing: {
      rotate: 360,
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: 'linear',
      },
    },
    speaking: {
      scale: [1, 1.1, 1],
      opacity: [0.9, 1, 0.9],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    },
    paused: {
      scale: [1, 1.02, 1],
      opacity: [0.3, 0.4, 0.3],
      transition: {
        duration: 8,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    },
  };

  // Colors based on state
  const stateColors = {
    dormant: 'bg-gray-400',
    listening: 'bg-green-500',
    processing: 'bg-blue-500',
    speaking: 'bg-purple-500',
    paused: 'bg-gray-600',
  };

  // Icons based on state
  const stateIcons = {
    dormant: MicOff,
    listening: Mic,
    processing: Loader2,
    speaking: Mic,
    paused: Pause,
  };

  const Icon = stateIcons[state];
  const colorClass = stateColors[state];

  return (
    <motion.button
      onClick={onClick}
      animate={animations[state]}
      className={`relative flex items-center justify-center rounded-full ${colorClass} ${className}`}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
    >
      {/* Glow effect for active states */}
      {(state === 'listening' || state === 'speaking') && (
        <motion.div
          className={`absolute inset-0 rounded-full ${colorClass}`}
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.5, 0, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      )}

      {/* Icon */}
      <Icon className="w-6 h-6 text-white relative z-10" />
    </motion.button>
  );
}

/**
 * Full voice control panel with indicator and state display
 */
export function MayaVoicePanel({
  state,
  onStart,
  onStop,
  onPause,
  onResume,
  transcript = '',
  nudgesEnabled = false,
  onToggleNudges,
}: {
  state: ConversationState;
  onStart: () => void;
  onStop: () => void;
  onPause?: () => void;
  onResume?: () => void;
  transcript?: string;
  nudgesEnabled?: boolean;
  onToggleNudges?: () => void;
}) {
  const isActive = state !== 'dormant';
  const isPaused = state === 'paused';

  return (
    <div className="flex flex-col items-center gap-4 p-6 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10">
      {/* Voice Indicator */}
      <div className="flex items-center gap-4">
        <MayaVoiceIndicator
          state={state}
          onClick={isActive ? onStop : onStart}
          className="w-16 h-16"
        />

        <div className="flex flex-col">
          <span className="text-sm font-medium text-white/80">
            {state === 'dormant' && 'Click to start'}
            {state === 'listening' && '🎤 Listening...'}
            {state === 'processing' && '🧠 Thinking...'}
            {state === 'speaking' && '🗣️ Maya is speaking...'}
            {state === 'paused' && '🌙 Paused'}
          </span>

          {transcript && (
            <span className="text-xs text-white/60 mt-1 max-w-xs truncate">
              "{transcript}"
            </span>
          )}
        </div>
      </div>

      {/* Controls */}
      {isActive && (
        <div className="flex gap-2">
          {!isPaused && onPause && (
            <button
              onClick={onPause}
              className="px-4 py-2 text-sm bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
            >
              Pause
            </button>
          )}

          {isPaused && onResume && (
            <button
              onClick={onResume}
              className="px-4 py-2 text-sm bg-green-500/20 hover:bg-green-500/30 rounded-lg transition-colors"
            >
              Resume
            </button>
          )}

          <button
            onClick={onStop}
            className="px-4 py-2 text-sm bg-red-500/20 hover:bg-red-500/30 rounded-lg transition-colors"
          >
            End Session
          </button>
        </div>
      )}

      {/* Settings */}
      {isActive && onToggleNudges && (
        <div className="flex items-center gap-2 text-xs text-white/60">
          <input
            type="checkbox"
            checked={nudgesEnabled}
            onChange={onToggleNudges}
            className="rounded"
          />
          <label>Enable gentle nudges after silence</label>
        </div>
      )}

      {/* Tips */}
      {isActive && !isPaused && (
        <div className="text-xs text-white/40 text-center">
          Say "pause Maya" to pause • Say "okay Maya" to resume
        </div>
      )}
    </div>
  );
}