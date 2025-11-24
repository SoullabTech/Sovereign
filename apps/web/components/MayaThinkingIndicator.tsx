'use client';

import React, { useEffect, useState } from 'react';
import { motion, useAnimation, AnimatePresence } from 'framer-motion';

interface MayaThinkingIndicatorProps {
  isThinking: boolean;
  stage?: string;
  element?: string;
}

// Sacred breathing animation (golden ratio timing)
const breathingVariants = {
  idle: {
    scale: 1,
    opacity: 0.8,
    transition: {
      duration: 2,
      repeat: Infinity,
      repeatType: "reverse" as const,
      ease: "easeInOut"
    }
  },
  thinking: {
    scale: [1, 1.08, 1],
    opacity: [0.9, 1, 0.9],
    transition: {
      duration: 1.618, // Golden ratio timing
      repeat: Infinity,
      ease: "easeInOut"
    }
  },
  responding: {
    scale: [1, 1.15, 1],
    opacity: [1, 0.7, 1],
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

// Sacred geometry ripples
const rippleVariants = {
  hidden: { scale: 0, opacity: 0 },
  visible: {
    scale: 2.5,
    opacity: [0, 0.3, 0],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "easeOut"
    }
  }
};

// Element-based colors
const getElementColors = (element?: string) => {
  const colors = {
    fire: {
      primary: '#FF6B47',
      secondary: '#FF8E7A', 
      glow: 'rgba(255, 107, 71, 0.3)'
    },
    water: {
      primary: '#4A90E2',
      secondary: '#7BB3F0',
      glow: 'rgba(74, 144, 226, 0.3)'
    },
    earth: {
      primary: '#8FBC8F',
      secondary: '#A8D5A8',
      glow: 'rgba(143, 188, 143, 0.3)'
    },
    air: {
      primary: '#B19CD9',
      secondary: '#C9B6E8',
      glow: 'rgba(177, 156, 217, 0.3)'
    },
    aether: {
      primary: '#FFD700',
      secondary: '#FDE047',
      glow: 'rgba(255, 215, 0, 0.3)'
    }
  };
  
  return element && colors[element as keyof typeof colors] 
    ? colors[element as keyof typeof colors]
    : colors.aether; // Default to golden aether
};

export default function MayaThinkingIndicator({ isThinking, stage, element }: MayaThinkingIndicatorProps) {
  const controls = useAnimation();
  const [currentState, setCurrentState] = useState<'idle' | 'thinking' | 'responding'>('idle');
  const elementColors = getElementColors(element);

  useEffect(() => {
    if (isThinking) {
      setCurrentState('thinking');
      controls.start('thinking');
    } else {
      setCurrentState('idle');
      controls.start('idle');
    }
  }, [isThinking, controls]);

  // Get stage-appropriate icon
  const getStageIcon = () => {
    const stages = {
      structured_guide: 'SL', // Soullab initials
      dialogical_companion: '∞', // Infinity symbol
      cocreative_partner: '◈', // Diamond
      transparent_prism: '◊'  // Hollow diamond
    };
    return stages[stage as keyof typeof stages] || 'SL';
  };

  return (
    <div className="relative flex items-center justify-center">
      {/* Background sacred geometry - only show when thinking */}
      <AnimatePresence>
        {isThinking && (
          <>
            {/* Outer ripple */}
            <motion.div
              className="absolute inset-0 rounded-full border opacity-20"
              style={{ borderColor: elementColors.primary }}
              variants={rippleVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
            />
            
            {/* Middle ripple */}
            <motion.div
              className="absolute inset-0 rounded-full border opacity-30"
              style={{ borderColor: elementColors.secondary }}
              variants={rippleVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              transition={{ delay: 1 }}
            />
            
            {/* Inner glow */}
            <motion.div
              className="absolute inset-0 rounded-full blur-md opacity-40"
              style={{ backgroundColor: elementColors.glow }}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1.2, opacity: 0.4 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.6 }}
            />
          </>
        )}
      </AnimatePresence>

      {/* Main Logo */}
      <motion.div
        variants={breathingVariants}
        animate={controls}
        className="relative z-10 w-12 h-12 rounded-full flex items-center justify-center text-lg font-light tracking-wider border-2"
        style={{ 
          borderColor: isThinking ? elementColors.primary : elementColors.secondary,
          backgroundColor: isThinking ? `${elementColors.glow}` : 'rgba(0,0,0,0.8)',
          color: elementColors.primary
        }}
      >
        {getStageIcon()}
      </motion.div>

      {/* Thinking dots */}
      <AnimatePresence>
        {isThinking && (
          <motion.div
            className="absolute -bottom-6 flex items-center space-x-1"
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
          >
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: elementColors.primary }}
                animate={{
                  scale: [0.8, 1.2, 0.8],
                  opacity: [0.5, 1, 0.5]
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: i * 0.2,
                  ease: "easeInOut"
                }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sacred status text */}
      <AnimatePresence>
        {isThinking && (
          <motion.div
            className="absolute -bottom-12 text-xs font-light tracking-wide opacity-60"
            style={{ color: elementColors.primary }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            exit={{ opacity: 0 }}
          >
            {currentState === 'thinking' && 'Contemplating...'}
            {currentState === 'responding' && 'Weaving response...'}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}