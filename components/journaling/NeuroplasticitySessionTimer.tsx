'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, Brain, Zap, Heart, Target } from 'lucide-react';

interface NeuroplasticitySessionTimerProps {
  mode: 'expressive' | 'gratitude' | 'reflective';
  onComplete?: () => void;
  onTimeUpdate?: (remaining: number) => void;
}

const SESSION_CONFIGS = {
  expressive: {
    duration: 18 * 60, // 18 minutes (optimal for expressive writing)
    icon: Brain,
    color: 'from-purple-500 to-pink-500',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/30',
    science: 'Prefrontal cortex ↔ amygdala synchronization',
    effect: 'Completing emotional processing loops'
  },
  gratitude: {
    duration: 7 * 60, // 7 minutes (optimal for gratitude practice)
    icon: Heart,
    color: 'from-emerald-500 to-teal-500',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/30',
    science: 'Ventral striatum + medial prefrontal activation',
    effect: 'Building stability-focused attention'
  },
  reflective: {
    duration: 12 * 60, // 12 minutes (optimal for reflective reframing)
    icon: Target,
    color: 'from-blue-500 to-indigo-500',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30',
    science: 'Enhanced prefrontal emotional regulation',
    effect: 'Strengthening pause-response pathways'
  }
};

export function NeuroplasticitySessionTimer({ mode, onComplete, onTimeUpdate }: NeuroplasticitySessionTimerProps) {
  const config = SESSION_CONFIGS[mode];
  const [timeLeft, setTimeLeft] = useState(config.duration);
  const [isActive, setIsActive] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const IconComponent = config.icon;
  const progress = ((config.duration - timeLeft) / config.duration) * 100;
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => {
          const newTime = prev - 1;
          onTimeUpdate?.(newTime);

          if (newTime === 0) {
            setIsComplete(true);
            setIsActive(false);
            onComplete?.();
          }

          return newTime;
        });
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timeLeft, onComplete, onTimeUpdate]);

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(config.duration);
    setIsComplete(false);
  };

  return (
    <div className={`rounded-lg border ${config.borderColor} ${config.bgColor} p-6 backdrop-blur-sm`}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className={`p-2 rounded-lg bg-gradient-to-br ${config.color}`}>
          <IconComponent className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="font-medium text-white">Neuroplasticity Session</h3>
          <p className="text-xs text-stone-400 capitalize">{mode} writing therapy</p>
        </div>
      </div>

      {/* Progress Circle */}
      <div className="flex items-center justify-center mb-6">
        <div className="relative w-32 h-32">
          {/* Background circle */}
          <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 144 144">
            <circle
              cx="72"
              cy="72"
              r="64"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              className="text-stone-700"
            />
            <motion.circle
              cx="72"
              cy="72"
              r="64"
              stroke="url(#gradient)"
              strokeWidth="8"
              fill="none"
              strokeDasharray={`${2 * Math.PI * 64}`}
              strokeDashoffset={`${2 * Math.PI * 64 * (1 - progress / 100)}`}
              strokeLinecap="round"
              className="transition-all duration-1000"
            />
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" className={`stop-color-${mode === 'expressive' ? 'purple' : mode === 'gratitude' ? 'emerald' : 'blue'}-500`} />
                <stop offset="100%" className={`stop-color-${mode === 'expressive' ? 'pink' : mode === 'gratitude' ? 'teal' : 'indigo'}-500`} />
              </linearGradient>
            </defs>
          </svg>

          {/* Time display */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">
                {minutes:String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
              </div>
              <div className="text-xs text-stone-400">
                {isComplete ? 'Complete!' : isActive ? 'Active' : 'Ready'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex gap-3 mb-4">
        <button
          onClick={toggleTimer}
          className={`flex-1 py-2 px-4 rounded-lg font-medium text-white transition-all
            ${isActive
              ? 'bg-red-500/20 border border-red-500/30 hover:bg-red-500/30'
              : `bg-gradient-to-r ${config.color} hover:opacity-90`
            }`}
        >
          {isActive ? 'Pause' : isComplete ? 'Session Complete' : 'Start Session'}
        </button>

        <button
          onClick={resetTimer}
          className="px-4 py-2 rounded-lg border border-stone-600 text-stone-400 hover:text-white hover:border-stone-500 transition-all"
        >
          Reset
        </button>
      </div>

      {/* Science explanation */}
      <div className="space-y-2 text-xs">
        <div className="flex items-center gap-2">
          <Zap className="w-3 h-3 text-amber-400" />
          <span className="text-stone-300">{config.science}</span>
        </div>
        <div className="flex items-center gap-2">
          <Brain className="w-3 h-3 text-purple-400" />
          <span className="text-stone-400">{config.effect}</span>
        </div>
      </div>

      {/* Progress indicators */}
      {isActive && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-3 rounded-lg bg-black/20 border border-white/5"
        >
          <div className="flex items-center gap-2 text-xs text-stone-400">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
            <span>Your brain is actively forming new neural pathways...</span>
          </div>

          {progress > 25 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-2 text-xs text-emerald-400"
            >
              ✓ Emotional-reasoning synchronization beginning
            </motion.div>
          )}

          {progress > 50 && mode === 'expressive' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-1 text-xs text-purple-400"
            >
              ✓ Processing unfinished emotional material
            </motion.div>
          )}

          {progress > 75 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-1 text-xs text-blue-400"
            >
              ✓ New neural patterns strengthening
            </motion.div>
          )}
        </motion.div>
      )}

      {/* Completion celebration */}
      {isComplete && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mt-4 p-4 rounded-lg bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 text-center"
        >
          <div className="text-lg">🧠✨</div>
          <div className="text-sm text-green-300 font-medium">Session Complete!</div>
          <div className="text-xs text-stone-400 mt-1">
            Your brain has completed a full neuroplasticity cycle
          </div>
        </motion.div>
      )}
    </div>
  );
}