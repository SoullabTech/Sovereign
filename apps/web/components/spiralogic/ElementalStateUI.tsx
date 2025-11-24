'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Element, ElementalState } from '@/lib/spiralogic/core/elementalOperators';

interface ElementalStateUIProps {
  elementalState: ElementalState;
  className?: string;
}

export const ElementalStateUI: React.FC<ElementalStateUIProps> = ({
  elementalState,
  className = ''
}) => {
  const [particles, setParticles] = useState<Particle[]>([]);
  
  useEffect(() => {
    // Generate particles based on dominant element
    const newParticles = generateParticles(elementalState.dominant, elementalState.intensity);
    setParticles(newParticles);
  }, [elementalState.dominant, elementalState.intensity]);
  
  const elementColors: Record<Element, { primary: string; secondary: string; glow: string }> = {
    Fire: { 
      primary: 'from-orange-500 to-red-600',
      secondary: 'from-yellow-400 to-orange-500',
      glow: 'shadow-orange-500/50'
    },
    Water: { 
      primary: 'from-blue-400 to-blue-600',
      secondary: 'from-cyan-300 to-blue-500',
      glow: 'shadow-blue-500/50'
    },
    Earth: { 
      primary: 'from-green-600 to-amber-700',
      secondary: 'from-green-500 to-green-700',
      glow: 'shadow-green-500/50'
    },
    Air: { 
      primary: 'from-cyan-300 to-sky-500',
      secondary: 'from-gray-300 to-cyan-400',
      glow: 'shadow-cyan-400/50'
    },
    Aether: { 
      primary: 'from-amber-500 to-indigo-600',
      secondary: 'from-pink-500 to-amber-600',
      glow: 'shadow-amber-500/50'
    }
  };
  
  const colors = elementColors[elementalState.dominant];
  
  return (
    <div className={`relative ${className}`}>
      {/* Background aura */}
      <motion.div
        className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${colors.primary} opacity-10 blur-3xl`}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.1, 0.2, 0.1]
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      
      {/* Elemental balance visualization */}
      <div className="relative bg-white/10 dark:bg-black/10 backdrop-blur-lg rounded-2xl p-6 shadow-2xl">
        <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-4">
          Elemental Balance
        </h3>
        
        {/* Balance bars */}
        <div className="space-y-3">
          {(Object.entries(elementalState.balance) as [Element, number][]).map(([element, value]) => (
            <div key={element} className="flex items-center space-x-3">
              <span className="w-16 text-xs font-medium text-gray-600 dark:text-gray-400">
                {element}
              </span>
              <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <motion.div
                  className={`h-full bg-gradient-to-r ${
                    element === elementalState.dominant 
                      ? colors.primary 
                      : elementColors[element].primary
                  }`}
                  initial={{ width: 0 }}
                  animate={{ width: `${value * 100}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                />
              </div>
              <span className="w-12 text-xs text-gray-500 dark:text-gray-500 text-right">
                {Math.round(value * 100)}%
              </span>
            </div>
          ))}
        </div>
        
        {/* Evolution indicator */}
        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
              Evolution
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-500">
              {Math.round(elementalState.evolution * 100)}%
            </span>
          </div>
          <div className="h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-amber-500 to-pink-500"
              initial={{ width: 0 }}
              animate={{ width: `${elementalState.evolution * 100}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
        </div>
        
        {/* Intensity indicator */}
        <motion.div
          className="mt-4 text-center"
          animate={{
            opacity: [0.5, 1, 0.5]
          }}
          transition={{
            duration: 2 / elementalState.intensity,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
            Intensity: {getIntensityLabel(elementalState.intensity)}
          </span>
        </motion.div>
      </div>
      
      {/* Floating particles */}
      <AnimatePresence>
        {particles.map((particle) => (
          <Particle key={particle.id} {...particle} color={colors.secondary} />
        ))}
      </AnimatePresence>
    </div>
  );
};

interface Particle {
  id: string;
  x: number;
  y: number;
  size: number;
  duration: number;
}

const Particle: React.FC<Particle & { color: string }> = ({ x, y, size, duration, color }) => {
  return (
    <motion.div
      className={`absolute rounded-full bg-gradient-to-br ${color}`}
      style={{
        width: size,
        height: size,
        left: x,
        top: y
      }}
      initial={{ opacity: 0, scale: 0 }}
      animate={{
        opacity: [0, 0.8, 0],
        scale: [0, 1, 0],
        y: [0, -50, -100]
      }}
      exit={{ opacity: 0 }}
      transition={{
        duration,
        ease: "easeOut"
      }}
    />
  );
};

function generateParticles(element: Element, intensity: number): Particle[] {
  const count = Math.floor(intensity * 10);
  const particles: Particle[] = [];
  
  for (let i = 0; i < count; i++) {
    particles.push({
      id: `${Date.now()}-${i}`,
      x: Math.random() * 300 - 150,
      y: Math.random() * 200,
      size: Math.random() * 4 + 2,
      duration: Math.random() * 2 + 1
    });
  }
  
  return particles;
}

function getIntensityLabel(intensity: number): string {
  if (intensity < 0.3) return 'Gentle';
  if (intensity < 0.5) return 'Moderate';
  if (intensity < 0.7) return 'Strong';
  if (intensity < 0.9) return 'Powerful';
  return 'Peak';
}