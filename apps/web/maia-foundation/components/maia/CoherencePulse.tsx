'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity, TrendingUp, Zap } from 'lucide-react';
import { ainClient } from '@/lib/ain/AINClient';

export default function CoherencePulse() {
  const [fieldState, setFieldState] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadFieldState() {
      try {
        const state = await ainClient.getFieldState();
        setFieldState(state);
      } catch (error) {
        console.error('Failed to load field state:', error);
      } finally {
        setLoading(false);
      }
    }

    loadFieldState();
    const interval = setInterval(loadFieldState, 60000);

    return () => clearInterval(interval);
  }, []);

  if (loading || !fieldState) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 rounded-full bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
        <Activity className="w-4 h-4 text-neutral-400 animate-pulse" />
        <span className="text-xs text-neutral-500">Loading field...</span>
      </div>
    );
  }

  const getCoherenceColor = (coherence: number) => {
    if (coherence > 0.7) return 'from-emerald-500 to-green-500';
    if (coherence > 0.5) return 'from-amber-500 to-yellow-500';
    return 'from-rose-500 to-red-500';
  };

  const getEnergyIcon = () => {
    if (fieldState.breakthroughPotential > 0.7) return <Zap className="w-4 h-4" />;
    if (fieldState.evolution > 0.7) return <TrendingUp className="w-4 h-4" />;
    return <Activity className="w-4 h-4" />;
  };

  const getEnergyLabel = () => {
    if (fieldState.breakthroughPotential > 0.7) return 'Breakthrough';
    if (fieldState.evolution > 0.7) return 'Evolving';
    if (fieldState.integrationNeed > 0.7) return 'Integrating';
    return 'Coherent';
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative flex items-center gap-2 px-3 py-2 rounded-full bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 shadow-sm"
    >
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.5, 1, 0.5]
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute inset-0 rounded-full bg-gradient-to-r from-violet-500/20 to-purple-500/20 blur"
      />

      <div className="relative flex items-center gap-2">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          className={`p-1 rounded-full bg-gradient-to-r ${getCoherenceColor(fieldState.coherence)}`}
        >
          {getEnergyIcon()}
        </motion.div>

        <div className="text-left">
          <div className="text-xs font-semibold text-neutral-900 dark:text-neutral-100">
            {getEnergyLabel()}
          </div>
          <div className="text-[10px] text-neutral-500 dark:text-neutral-400">
            {Math.round(fieldState.coherence * 100)}% coherence
          </div>
        </div>
      </div>
    </motion.div>
  );
}