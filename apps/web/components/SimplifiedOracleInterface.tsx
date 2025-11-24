/**
 * Simplified Oracle Interface - Beta Version
 * 
 * Subtle visual indicators only:
 * - Gold pulse for breakthroughs (intent 17 - breakthrough moment)
 * - Gentle border shifts for emotional state changes
 * - All intelligence kept implicit in backend
 */

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Crown } from 'lucide-react';

interface SimplifiedOracleInterfaceProps {
  message: string;
  metadata?: {
    element?: string;
    emotionalShift?: boolean;
    breakthroughDetected?: boolean;
    confidence?: number;
  };
  isStreaming?: boolean;
  onGrounding?: () => void;
}

export const SimplifiedOracleInterface: React.FC<SimplifiedOracleInterfaceProps> = ({
  message,
  metadata = {},
  isStreaming = false,
  onGrounding
}) => {
  const [showPulse, setShowPulse] = useState(false);
  const [borderColor, setBorderColor] = useState('border-amber-500/20');
  const messageRef = useRef<HTMLDivElement>(null);

  // Breakthrough pulse effect (intent 17)
  useEffect(() => {
    if (metadata.breakthroughDetected) {
      setShowPulse(true);
      setTimeout(() => setShowPulse(false), 3000); // 3 second pulse
    }
  }, [metadata.breakthroughDetected]);

  // Subtle border color shifts for emotional states
  useEffect(() => {
    if (metadata.emotionalShift) {
      // Gentle transition to new emotional state color
      const emotionColors = {
        high: 'border-orange-400/30',      // High energy/arousal
        balanced: 'border-amber-500/30',  // Balanced state
        calm: 'border-blue-400/30',        // Calm/reflective
        processing: 'border-amber-400/30'  // Processing/working through
      };
      
      // Determine emotional tone based on backend analysis (kept implicit)
      const newColor = emotionColors.balanced; // Default, actual logic in backend
      setBorderColor(newColor);
    }
  }, [metadata.emotionalShift]);

  return (
    <div className="relative">
      {/* Subtle breakthrough pulse overlay */}
      <AnimatePresence>
        {showPulse && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ 
              opacity: [0, 0.3, 0],
              scale: [0.8, 1.2, 1.3],
            }}
            transition={{
              duration: 3,
              times: [0, 0.5, 1],
              ease: "easeOut"
            }}
            className="absolute inset-0 bg-gradient-to-r from-yellow-300/20 to-amber-300/20 rounded-2xl pointer-events-none blur-xl"
          />
        )}
      </AnimatePresence>

      {/* Main message card */}
      <motion.div
        ref={messageRef}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`
          bg-background/80 backdrop-blur-xl 
          border ${borderColor} 
          rounded-2xl p-4 
          transition-colors duration-1000 ease-in-out
          ${showPulse ? 'shadow-lg shadow-amber-200/20' : ''}
        `}
      >
        {/* Simple header */}
        <div className="flex items-center space-x-2 mb-2">
          <Crown className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-medium text-amber-400">Maya</span>
        </div>

        {/* Message content */}
        <p className="text-sm leading-relaxed text-foreground">
          {message}
        </p>

        {/* Ultra-subtle confidence indicator (high confidence = slightly brighter text) */}
        {metadata.confidence && metadata.confidence > 0.8 && (
          <style jsx>{`
            p {
              filter: brightness(1.05);
            }
          `}</style>
        )}
      </motion.div>
    </div>
  );
};