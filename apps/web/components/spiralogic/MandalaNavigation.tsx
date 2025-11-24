'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Element } from '@/lib/spiralogic/core/elementalOperators';

interface MandalaNavigationProps {
  activeElement: Element;
  onElementSelect: (element: Element) => void;
  spiralPhase?: number; // 0-2π
  depth?: number;
  disabled?: boolean;
}

export const MandalaNavigation: React.FC<MandalaNavigationProps> = ({
  activeElement,
  onElementSelect,
  spiralPhase = 0,
  depth = 0,
  disabled = false
}) => {
  const [hoveredElement, setHoveredElement] = useState<Element | null>(null);
  const [pulseIntensity, setPulseIntensity] = useState(0.5);
  
  // Elements arranged in sacred geometry
  const elements: { element: Element; position: { x: number; y: number }; symbol: string; color: string }[] = [
    { element: 'Fire', position: { x: 0, y: -100 }, symbol: '🔥', color: 'from-orange-500 to-red-600' },
    { element: 'Water', position: { x: 95, y: -31 }, symbol: '💧', color: 'from-blue-400 to-blue-600' },
    { element: 'Earth', position: { x: 59, y: 81 }, symbol: '🌍', color: 'from-green-600 to-amber-700' },
    { element: 'Air', position: { x: -59, y: 81 }, symbol: '🌬️', color: 'from-cyan-300 to-sky-500' },
    { element: 'Aether', position: { x: -95, y: -31 }, symbol: '✨', color: 'from-amber-500 to-indigo-600' }
  ];
  
  // Pulse based on spiral phase
  useEffect(() => {
    const intensity = 0.5 + 0.5 * Math.sin(spiralPhase);
    setPulseIntensity(intensity);
  }, [spiralPhase]);
  
  return (
    <div className="relative w-96 h-96 flex items-center justify-center">
      {/* Background mandala pattern */}
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="-200 -200 400 400"
      >
        {/* Sacred geometry circles */}
        <circle
          cx="0"
          cy="0"
          r="150"
          fill="none"
          stroke="currentColor"
          strokeWidth="0.5"
          className="text-gray-300 dark:text-gray-700"
          strokeDasharray="5 5"
        />
        <circle
          cx="0"
          cy="0"
          r="100"
          fill="none"
          stroke="currentColor"
          strokeWidth="0.5"
          className="text-gray-300 dark:text-gray-700"
        />
        
        {/* Pentagram connecting elements */}
        <path
          d={`M ${elements[0].position.x} ${elements[0].position.y}
              L ${elements[2].position.x} ${elements[2].position.y}
              L ${elements[4].position.x} ${elements[4].position.y}
              L ${elements[1].position.x} ${elements[1].position.y}
              L ${elements[3].position.x} ${elements[3].position.y} Z`}
          fill="none"
          stroke="currentColor"
          strokeWidth="0.5"
          className="text-gray-200 dark:text-gray-800"
          opacity={0.3 + depth * 0.1}
        />
      </svg>
      
      {/* Center point - the Self */}
      <motion.div
        className="absolute w-12 h-12 bg-gradient-to-br from-white to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-full shadow-lg flex items-center justify-center"
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.7, 1, 0.7]
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <span className="text-lg">🕉️</span>
      </motion.div>
      
      {/* Elemental nodes */}
      {elements.map(({ element, position, symbol, color }) => {
        const isActive = activeElement === element;
        const isHovered = hoveredElement === element;
        
        return (
          <motion.button
            key={element}
            className={`absolute w-20 h-20 rounded-full bg-gradient-to-br ${color} shadow-xl flex items-center justify-center text-3xl transition-all ${
              disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:shadow-2xl'
            }`}
            style={{
              left: `calc(50% + ${position.x}px - 40px)`,
              top: `calc(50% + ${position.y}px - 40px)`
            }}
            onClick={() => !disabled && onElementSelect(element)}
            onHoverStart={() => setHoveredElement(element)}
            onHoverEnd={() => setHoveredElement(null)}
            animate={{
              scale: isActive ? [1.1, 1.2, 1.1] : isHovered ? 1.1 : 1,
              rotate: isActive ? [0, 5, -5, 0] : 0
            }}
            transition={{
              scale: {
                duration: isActive ? 2 : 0.2,
                repeat: isActive ? Infinity : 0,
                ease: "easeInOut"
              }
            }}
            whileTap={{ scale: 0.95 }}
          >
            {/* Glow effect for active element */}
            {isActive && (
              <motion.div
                className={`absolute inset-0 rounded-full bg-gradient-to-br ${color} blur-xl`}
                animate={{
                  opacity: [0.3, 0.6, 0.3]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            )}
            
            <span className="relative z-10">{symbol}</span>
          </motion.button>
        );
      })}
      
      {/* Elemental description tooltip */}
      <AnimatePresence>
        {hoveredElement && !disabled && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute bottom-0 left-1/2 transform -translate-x-1/2 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3 text-sm"
          >
            <p className="font-semibold">{hoveredElement}</p>
            <p className="text-gray-600 dark:text-gray-400">
              {getElementDescription(hoveredElement)}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

function getElementDescription(element: Element): string {
  const descriptions: Record<Element, string> = {
    Fire: 'Transformation, passion, breakthrough',
    Water: 'Flow, emotion, receptivity',
    Earth: 'Grounding, manifestation, stability',
    Air: 'Clarity, perspective, mental agility',
    Aether: 'Integration, wholeness, transcendence'
  };
  
  return descriptions[element];
}