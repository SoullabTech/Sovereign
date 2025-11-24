'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { FractalPattern, FractalScale } from '@/lib/spiralogic/core/fractalRecursion';

interface FractalMirrorProps {
  pattern: FractalPattern;
  className?: string;
}

export const FractalMirror: React.FC<FractalMirrorProps> = ({ pattern, className = '' }) => {
  const scales: FractalScale[] = ['personal', 'interpersonal', 'collective', 'cosmic'];
  
  const scaleIcons: Record<FractalScale, string> = {
    personal: '👤',
    interpersonal: '👥',
    collective: '🌍',
    cosmic: '✨'
  };
  
  const scaleColors: Record<FractalScale, string> = {
    personal: 'from-blue-400 to-blue-600',
    interpersonal: 'from-green-400 to-green-600',
    collective: 'from-amber-400 to-amber-600',
    cosmic: 'from-indigo-400 to-pink-600'
  };
  
  return (
    <div className={`space-y-6 ${className}`}>
      <div className="text-center">
        <h3 className="text-xl font-light text-gray-800 dark:text-gray-200 mb-2">
          Fractal Pattern: {pattern.core}
        </h3>
        <div className="flex items-center justify-center space-x-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Coherence:
          </span>
          <div className="w-32 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-amber-500 to-pink-500"
              initial={{ width: 0 }}
              animate={{ width: `${pattern.coherence * 100}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </div>
          <span className="text-sm text-gray-500">
            {Math.round(pattern.coherence * 100)}%
          </span>
        </div>
      </div>
      
      {/* Fractal scales visualization */}
      <div className="relative">
        {/* Connecting lines */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{ height: `${scales.length * 120}px` }}
        >
          {scales.map((scale, index) => {
            if (index === scales.length - 1) return null;
            return (
              <motion.line
                key={`${scale}-line`}
                x1="50%"
                y1={60 + index * 120}
                x2="50%"
                y2={60 + (index + 1) * 120}
                stroke="url(#fractalGradient)"
                strokeWidth="2"
                strokeDasharray="5 5"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1, delay: index * 0.2 }}
              />
            );
          })}
          <defs>
            <linearGradient id="fractalGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#9333ea" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#ec4899" stopOpacity="0.3" />
            </linearGradient>
          </defs>
        </svg>
        
        {/* Scale cards */}
        <div className="space-y-4 relative">
          {scales.map((scale, index) => {
            const expression = pattern.scales[scale];
            return (
              <motion.div
                key={scale}
                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="relative"
              >
                <div className={`bg-white/80 dark:bg-gray-800/80 backdrop-blur rounded-xl p-4 shadow-lg border border-gray-200 dark:border-gray-700`}>
                  {/* Scale header */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl">{scaleIcons[scale]}</span>
                      <h4 className="font-medium text-gray-800 dark:text-gray-200 capitalize">
                        {scale}
                      </h4>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-gray-500">Intensity:</span>
                      <div className="flex space-x-1">
                        {[...Array(5)].map((_, i) => (
                          <div
                            key={i}
                            className={`w-2 h-2 rounded-full ${
                              i < Math.round(expression.intensity * 5)
                                ? `bg-gradient-to-br ${scaleColors[scale]}`
                                : 'bg-gray-300 dark:bg-gray-600'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  {/* Manifestation */}
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                    {expression.manifestation}
                  </p>
                  
                  {/* Insights */}
                  {expression.insights.length > 0 && (
                    <div className="space-y-1 pt-2 border-t border-gray-200 dark:border-gray-700">
                      {expression.insights.slice(0, 2).map((insight, i) => (
                        <motion.p
                          key={i}
                          className="text-xs text-gray-600 dark:text-gray-400 italic"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: index * 0.1 + i * 0.1 }}
                        >
                          {insight}
                        </motion.p>
                      ))}
                    </div>
                  )}
                  
                  {/* Connections */}
                  {expression.connections.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {expression.connections.map((connection, i) => (
                        <span
                          key={i}
                          className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 rounded-full text-gray-600 dark:text-gray-400"
                        >
                          {connection}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                
                {/* Intensity glow */}
                <motion.div
                  className={`absolute inset-0 rounded-xl bg-gradient-to-br ${scaleColors[scale]} blur-xl`}
                  style={{ zIndex: -1 }}
                  animate={{
                    opacity: [0, expression.intensity * 0.3, 0]
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: index * 0.2
                  }}
                />
              </motion.div>
            );
          })}
        </div>
      </div>
      
      {/* Pattern depth indicator */}
      <motion.div
        className="text-center pt-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Recursion Depth: Level {pattern.depth}
        </p>
        <div className="flex justify-center mt-2 space-x-1">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full ${
                i < pattern.depth
                  ? 'bg-gradient-to-br from-amber-500 to-pink-500'
                  : 'bg-gray-300 dark:bg-gray-600'
              }`}
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
};