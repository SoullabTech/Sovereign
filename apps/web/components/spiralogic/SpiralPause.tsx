'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface SpiralPauseProps {
  duration?: number; // milliseconds
  onComplete: () => void;
  message?: string;
  showSpiral?: boolean;
}

export const SpiralPause: React.FC<SpiralPauseProps> = ({
  duration = 5000,
  onComplete,
  message = 'Take a breath... Let the spiral unfold...',
  showSpiral = true
}) => {
  const [progress, setProgress] = useState(0);
  const [breathPhase, setBreathPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
  
  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min((elapsed / duration) * 100, 100);
      setProgress(pct);
      
      // Update breath phase
      if (pct < 33) {
        setBreathPhase('inhale');
      } else if (pct < 66) {
        setBreathPhase('hold');
      } else {
        setBreathPhase('exhale');
      }
      
      if (pct >= 100) {
        clearInterval(interval);
        onComplete();
      }
    }, 50);
    
    return () => clearInterval(interval);
  }, [duration, onComplete]);
  
  const spiralPath = "M 200 200 Q 250 200 250 250 T 200 300 Q 150 300 150 250 T 200 200";
  
  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-6">
      {/* Spiral visualization */}
      {showSpiral && (
        <div className="relative w-64 h-64">
          <svg
            viewBox="0 0 400 400"
            className="absolute inset-0 w-full h-full"
          >
            {/* Background spiral */}
            <motion.path
              d={generateSpiralPath(200, 200, 10, 80, progress / 10)}
              fill="none"
              stroke="url(#spiralGradient)"
              strokeWidth="2"
              opacity="0.3"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: duration / 1000, ease: "easeInOut" }}
            />
            
            {/* Active spiral trace */}
            <motion.path
              d={generateSpiralPath(200, 200, 10, 80, progress / 10)}
              fill="none"
              stroke="url(#activeGradient)"
              strokeWidth="3"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: progress / 100 }}
              transition={{ duration: 0.1 }}
            />
            
            {/* Gradients */}
            <defs>
              <linearGradient id="spiralGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#9333ea" stopOpacity="0.2" />
                <stop offset="50%" stopColor="#3b82f6" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0.2" />
              </linearGradient>
              <linearGradient id="activeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#9333ea" />
                <stop offset="50%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#10b981" />
              </linearGradient>
            </defs>
          </svg>
          
          {/* Center breathing circle */}
          <motion.div
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-blue-500"
            animate={{
              scale: breathPhase === 'inhale' ? [1, 1.5] : breathPhase === 'hold' ? 1.5 : [1.5, 1],
              opacity: breathPhase === 'hold' ? [0.8, 1, 0.8] : 1
            }}
            transition={{
              duration: duration / 3000,
              ease: "easeInOut"
            }}
          />
        </div>
      )}
      
      {/* Breath guidance text */}
      <motion.div
        className="text-center space-y-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <motion.p
          className="text-lg font-medium text-gray-700 dark:text-gray-300"
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          {breathPhase === 'inhale' && '✨ Breathe in...'}
          {breathPhase === 'hold' && '🌀 Hold...'}
          {breathPhase === 'exhale' && '💫 Release...'}
        </motion.p>
        
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {message}
        </p>
      </motion.div>
      
      {/* Progress bar */}
      <div className="w-64 bg-gray-200 dark:bg-gray-700 h-1 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-amber-500 via-blue-500 to-green-500"
          initial={{ width: '0%' }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.1 }}
        />
      </div>
      
      {/* Skip option (appears after 2 seconds) */}
      {progress > 40 && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          whileHover={{ opacity: 1 }}
          onClick={onComplete}
          className="text-xs text-gray-400 hover:text-gray-600 dark:text-gray-600 dark:hover:text-gray-400 transition-colors"
        >
          Continue without pause →
        </motion.button>
      )}
    </div>
  );
};

/**
 * Generate spiral path for SVG
 */
function generateSpiralPath(
  cx: number,
  cy: number,
  innerRadius: number,
  outerRadius: number,
  rotations: number
): string {
  const points: string[] = [];
  const totalSteps = Math.floor(rotations * 20);
  
  for (let i = 0; i <= totalSteps; i++) {
    const angle = (i / 20) * 2 * Math.PI;
    const radius = innerRadius + (outerRadius - innerRadius) * (i / totalSteps);
    const x = cx + radius * Math.cos(angle);
    const y = cy + radius * Math.sin(angle);
    
    if (i === 0) {
      points.push(`M ${x} ${y}`);
    } else {
      points.push(`L ${x} ${y}`);
    }
  }
  
  return points.join(' ');
}