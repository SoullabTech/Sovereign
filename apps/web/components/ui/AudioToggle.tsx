'use client';

import React from 'react';
import { motion } from 'framer-motion';

const states = ["on", "silent", "off"] as const;
export type AudioState = typeof states[number];

interface AudioToggleProps {
  state: AudioState;
  onChange: (state: AudioState) => void;
}

export const AudioToggle: React.FC<AudioToggleProps> = ({
  state,
  onChange
}) => {
  const nextState = () => {
    const idx = states.indexOf(state);
    onChange(states[(idx + 1) % states.length]);
  };
  return (
    <motion.button
      onClick={nextState}
      className={`
        relative px-4 py-2 rounded-full text-sm font-medium
        transition-all duration-300 backdrop-blur-sm
        ${state === 'on' 
          ? 'bg-amber-500/20 text-amber-300 border border-amber-400/30' 
          : state === 'silent'
          ? 'bg-amber-500/20 text-amber-300 border border-amber-400/30'
          : 'bg-gray-800/20 text-gray-400 border border-gray-600/30'}
      `}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <span className="flex items-center gap-2">
        {state === 'on' && (
          <>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M11 5L6 9H2v6h4l5 4V5z"/>
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14" opacity="0.6"/>
              <path d="M15.54 8.46a5 5 0 0 1 0 7.07" opacity="0.8"/>
            </svg>
            Sacred Audio
          </>
        )}
        {state === 'silent' && (
          <>
            <span className="text-lg">🌸</span>
            Silent Resonance
          </>
        )}
        {state === 'off' && (
          <>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M11 5L6 9H2v6h4l5 4V5z"/>
              <line x1="23" y1="9" x2="17" y2="15" strokeLinecap="round"/>
              <line x1="17" y1="9" x2="23" y2="15" strokeLinecap="round"/>
            </svg>
            Muted
          </>
        )}
      </span>
    </motion.button>
  );
};

export default AudioToggle;