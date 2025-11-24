'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ElementalShapingIndicatorProps {
  element: 'fire' | 'water' | 'earth' | 'air' | 'aether';
  isShaping: boolean;
  shapingApplied: boolean;
  shapingTags?: string[];
  className?: string;
}

const ELEMENTAL_GLYPHS = {
  fire: '🔥',
  water: '🌊', 
  earth: '🌍',
  air: '🌬️',
  aether: '✨'
};

const ELEMENTAL_COLORS = {
  fire: {
    primary: '#FF4500',
    secondary: '#FF6347',
    accent: '#FFD700',
    glow: 'rgba(255, 69, 0, 0.4)'
  },
  water: {
    primary: '#1E90FF',
    secondary: '#4169E1', 
    accent: '#00CED1',
    glow: 'rgba(30, 144, 255, 0.4)'
  },
  earth: {
    primary: '#8B4513',
    secondary: '#A0522D',
    accent: '#DEB887',
    glow: 'rgba(139, 69, 19, 0.4)'
  },
  air: {
    primary: '#87CEEB',
    secondary: '#B0E0E6',
    accent: '#F0F8FF', 
    glow: 'rgba(135, 206, 235, 0.4)'
  },
  aether: {
    primary: '#9370DB',
    secondary: '#8A2BE2',
    accent: '#DDA0DD',
    glow: 'rgba(147, 112, 219, 0.4)'
  }
};

const ELEMENTAL_NAMES = {
  fire: 'Fire',
  water: 'Water',
  earth: 'Earth', 
  air: 'Air',
  aether: 'Aether'
};

export const ElementalShapingIndicator: React.FC<ElementalShapingIndicatorProps> = ({
  element,
  isShaping,
  shapingApplied,
  shapingTags = [],
  className = ''
}) => {
  const [showDetails, setShowDetails] = useState(false);
  const colors = ELEMENTAL_COLORS[element];
  const glyph = ELEMENTAL_GLYPHS[element];
  const name = ELEMENTAL_NAMES[element];

  // Auto-hide details after showing
  useEffect(() => {
    if (showDetails) {
      const timer = setTimeout(() => setShowDetails(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showDetails]);

  // Show details when shaping completes
  useEffect(() => {
    if (shapingApplied && shapingTags.length > 0) {
      setShowDetails(true);
    }
  }, [shapingApplied, shapingTags]);

  return (
    <div className={`relative ${className}`}>
      {/* Main Elemental Glyph */}
      <motion.div
        className="relative cursor-pointer select-none"
        onClick={() => setShowDetails(!showDetails)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        {/* Background Glow */}
        <motion.div
          className="absolute inset-0 rounded-full blur-lg"
          style={{
            background: `radial-gradient(circle, ${colors.glow} 0%, transparent 70%)`,
          }}
          animate={{
            scale: isShaping ? [1, 1.2, 1] : 1,
            opacity: isShaping ? [0.3, 0.7, 0.3] : shapingApplied ? 0.6 : 0.2
          }}
          transition={{
            duration: isShaping ? 1.5 : 0.3,
            repeat: isShaping ? Infinity : 0,
            ease: "easeInOut"
          }}
        />

        {/* Main Glyph */}
        <motion.div
          className="relative flex items-center justify-center w-12 h-12 text-2xl bg-white/10 backdrop-blur-sm rounded-full border"
          style={{
            borderColor: shapingApplied ? colors.primary : colors.secondary,
            color: colors.primary
          }}
          animate={{
            rotate: isShaping ? [0, 360] : 0,
            scale: isShaping ? [1, 1.1, 1] : shapingApplied ? [1, 1.05, 1] : 1,
            boxShadow: isShaping 
              ? [`0 0 20px ${colors.glow}`, `0 0 40px ${colors.glow}`, `0 0 20px ${colors.glow}`]
              : shapingApplied 
                ? `0 0 15px ${colors.glow}`
                : `0 0 5px ${colors.glow}`
          }}
          transition={{
            duration: isShaping ? 2 : 0.6,
            repeat: isShaping ? Infinity : shapingApplied ? 2 : 0,
            ease: "easeInOut"
          }}
        >
          {glyph}
        </motion.div>

        {/* Shaping Status Indicator */}
        <AnimatePresence>
          {isShaping && (
            <motion.div
              className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-xs font-bold"
              style={{ backgroundColor: colors.accent, color: '#000' }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ 
                scale: 1, 
                opacity: 1,
                rotate: [0, 360]
              }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ 
                duration: 0.3,
                rotate: { duration: 1, repeat: Infinity, ease: "linear" }
              }}
            >
              ⚡
            </motion.div>
          )}
          
          {shapingApplied && !isShaping && (
            <motion.div
              className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-xs"
              style={{ backgroundColor: colors.primary, color: '#fff' }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              ✓
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Detailed Shaping Info Panel */}
      <AnimatePresence>
        {showDetails && (
          <motion.div
            className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 p-3 bg-black/90 backdrop-blur-md rounded-lg shadow-xl border min-w-64 z-50"
            style={{ borderColor: colors.primary }}
            initial={{ opacity: 0, y: -10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.9 }}
            transition={{ duration: 0.2 }}
          >
            {/* Header */}
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">{glyph}</span>
              <div>
                <div className="font-semibold text-white" style={{ color: colors.primary }}>
                  {name} Elemental Shaping
                </div>
                <div className="text-xs text-gray-400">
                  {shapingApplied ? 'Voice embodied with sacred prosody' : 'Awaiting consciousness infusion'}
                </div>
              </div>
            </div>

            {/* Shaping Status */}
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-300">Status:</span>
                <span style={{ color: shapingApplied ? colors.primary : colors.secondary }}>
                  {isShaping ? 'Shaping...' : shapingApplied ? 'Embodied' : 'Raw'}
                </span>
              </div>
              
              {shapingTags.length > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-300">Prosody:</span>
                  <span className="text-white text-xs">
                    {shapingTags.slice(0, 2).join(', ')}
                  </span>
                </div>
              )}
            </div>

            {/* Elemental Qualities */}
            <div className="mt-2 pt-2 border-t border-gray-700">
              <div className="text-xs text-gray-400 mb-1">Elemental Qualities:</div>
              <div className="flex flex-wrap gap-1">
                {getElementalQualities(element).map((quality, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 rounded text-xs font-medium"
                    style={{ 
                      backgroundColor: `${colors.primary}20`, 
                      color: colors.primary,
                      border: `1px solid ${colors.primary}40`
                    }}
                  >
                    {quality}
                  </span>
                ))}
              </div>
            </div>

            {/* Sacred Tech Indicator */}
            <div className="mt-2 pt-2 border-t border-gray-700 text-center">
              <div className="text-xs text-gray-500">
                ✨ Sacred Technology Interface ✨
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

function getElementalQualities(element: string): string[] {
  const qualities = {
    fire: ['Dynamic', 'Passionate', 'Commanding'],
    water: ['Flowing', 'Gentle', 'Adaptive'], 
    earth: ['Grounded', 'Steady', 'Warm'],
    air: ['Crisp', 'Precise', 'Clear'],
    aether: ['Spacious', 'Transcendent', 'Sacred']
  };
  return qualities[element] || ['Present'];
}