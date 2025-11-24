'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TranscriptStreamProps {
  transcript: string;
  interimTranscript?: string;
  isListening: boolean;
  className?: string;
}

export default function TranscriptStream({ 
  transcript,
  interimTranscript = '',
  isListening,
  className = ''
}: TranscriptStreamProps) {
  const [displayText, setDisplayText] = useState('');
  const [fadeInWords, setFadeInWords] = useState<string[]>([]);

  // Update display text smoothly
  useEffect(() => {
    if (transcript) {
      setDisplayText(transcript);
      // Simple fade-in line by line (no word-by-word for beta)
      const lines = transcript.split('\n').filter(Boolean);
      setFadeInWords(lines);
    }
  }, [transcript]);

  // Combine transcript and interim for display
  const fullText = interimTranscript 
    ? `${displayText} ${interimTranscript}`.trim()
    : displayText;

  if (!isListening && !fullText) return null;

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.3 }}
      className={`rounded-lg bg-amber-50 dark:bg-amber-900/20 p-3 ${className}`}
    >
      <div className="space-y-1">
        {/* Display finalized transcript with fade-in */}
        <AnimatePresence mode="popLayout">
          {fadeInWords.map((line, index) => (
            <motion.div
              key={`line-${index}`}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ 
                duration: 0.3,
                delay: index * 0.1
              }}
              className="text-sm text-amber-700 dark:text-amber-300"
            >
              {line}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Display interim transcript with cursor */}
        {interimTranscript && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.7 }}
            className="text-sm text-amber-600 dark:text-amber-400 italic"
          >
            {interimTranscript}
            <motion.span
              animate={{ opacity: [1, 0, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="ml-1"
            >
              |  
            </motion.span>
          </motion.div>
        )}

        {/* Listening indicator when no text yet */}
        {isListening && !fullText && (
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-1.5 h-1.5 bg-amber-500 rounded-full"
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.5, 1, 0.5]
                  }}
                  transition={{
                    duration: 1,
                    delay: i * 0.2,
                    repeat: Infinity
                  }}
                />
              ))}
            </div>
            <span className="text-xs text-amber-600 dark:text-amber-400">
              Listening...
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );
}