'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, VolumeX, Sparkles, Loader2 } from 'lucide-react';
import { OracleVoicePlayer } from '@/components/voice/OracleVoicePlayer';

interface MaiaBubbleProps {
  message: string;
  timestamp?: Date;
  isStreaming?: boolean;
  element?: string;
  showAudio?: boolean;
  className?: string;
  onPlayAudio?: () => void;
}

export default function MaiaBubble({
  message,
  timestamp = new Date(),
  isStreaming = false,
  element = 'aether',
  showAudio = true,
  className = '',
  onPlayAudio
}: MaiaBubbleProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [displayedText, setDisplayedText] = useState('');
  const [isComplete, setIsComplete] = useState(false);

  // Streaming text effect (beta minimal - simple fade-in)
  useEffect(() => {
    if (isStreaming) {
      setDisplayedText(message);
      setIsComplete(false);
    } else {
      // Simple fade-in for completed messages
      setDisplayedText(message);
      setIsComplete(true);
    }
  }, [message, isStreaming]);

  const getElementColor = () => {
    switch (element) {
      case 'fire': return 'from-orange-500 to-red-500';
      case 'water': return 'from-blue-500 to-cyan-500';
      case 'earth': return 'from-green-500 to-emerald-500';
      case 'air': return 'from-yellow-400 to-amber-400';
      case 'aether': 
      default: return 'from-amber-500 to-indigo-500';
    }
  };

  const getElementGlow = () => {
    switch (element) {
      case 'fire': return 'shadow-orange-500/20';
      case 'water': return 'shadow-blue-500/20';
      case 'earth': return 'shadow-green-500/20';
      case 'air': return 'shadow-yellow-400/20';
      case 'aether':
      default: return 'shadow-amber-500/20';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className={`flex gap-3 ${className}`}
    >
      {/* Avatar */}
      <div className="flex-shrink-0">
        <motion.div
          className={`
            w-10 h-10 rounded-full
            bg-gradient-to-br ${getElementColor()}
            flex items-center justify-center
            shadow-lg ${getElementGlow()}
          `}
          animate={isStreaming ? {
            scale: [1, 1.05, 1],
          } : {}}
          transition={isStreaming ? {
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          } : {}}
        >
          <Sparkles className="w-5 h-5 text-white" />
        </motion.div>
      </div>

      {/* Message Content */}
      <div className="flex-1 space-y-2">
        {/* Name and timestamp */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
            Maia
          </span>
          <span className="text-xs text-neutral-500 dark:text-neutral-400">
            {timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
          {isStreaming && (
            <motion.div
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="flex items-center gap-1 text-xs text-amber-500"
            >
              <Loader2 className="w-3 h-3 animate-spin" />
              <span>thinking...</span>
            </motion.div>
          )}
        </div>

        {/* Message bubble */}
        <motion.div
          className={`
            relative inline-block max-w-full
            px-4 py-3 rounded-2xl
            bg-gradient-to-br from-neutral-100 to-neutral-50
            dark:from-neutral-800 dark:to-neutral-900
            border border-neutral-200 dark:border-neutral-700
            shadow-sm
          `}
          animate={isStreaming ? {
            borderColor: ['rgba(147, 51, 234, 0.3)', 'rgba(147, 51, 234, 0.1)', 'rgba(147, 51, 234, 0.3)']
          } : {}}
          transition={isStreaming ? {
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          } : {}}
        >
          {/* Message text with streaming effect */}
          <AnimatePresence mode="wait">
            <motion.div
              key={displayedText}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="text-sm text-neutral-800 dark:text-neutral-200 whitespace-pre-wrap"
            >
              {displayedText}
              {isStreaming && (
                <motion.span
                  animate={{ opacity: [0, 1, 0] }}
                  transition={{ duration: 0.8, repeat: Infinity }}
                  className="inline-block ml-1"
                >
                  ▊
                </motion.span>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Element indicator (subtle) */}
          <motion.div
            className={`
              absolute -bottom-1 -right-1
              w-3 h-3 rounded-full
              bg-gradient-to-br ${getElementColor()}
              opacity-60
            `}
            animate={isComplete ? {
              scale: [0, 1.2, 1],
              opacity: [0, 0.8, 0.6]
            } : {}}
            transition={{ duration: 0.5 }}
          />
        </motion.div>

        {/* Audio player (if message is complete) */}
        {showAudio && isComplete && !isStreaming && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-2"
          >
            <button
              onClick={() => {
                setIsPlaying(!isPlaying);
                onPlayAudio?.();
              }}
              className={`
                p-2 rounded-full
                bg-gradient-to-r ${getElementColor()}
                text-white shadow-md
                hover:shadow-lg transition-all duration-200
                hover:scale-105 active:scale-95
              `}
              aria-label={isPlaying ? 'Stop audio' : 'Play audio'}
            >
              {isPlaying ? (
                <VolumeX className="w-4 h-4" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </button>
            
            <span className="text-xs text-neutral-500 dark:text-neutral-400">
              {isPlaying ? 'Playing...' : 'Listen to response'}
            </span>

            {/* Hidden audio player component */}
            <div className="hidden">
              <OracleVoicePlayer
                text={message}
                element={element}
                autoPlay={false}
                onPlayStart={() => setIsPlaying(true)}
                onPlayEnd={() => setIsPlaying(false)}
              />
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}