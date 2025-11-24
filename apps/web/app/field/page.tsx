'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { fieldAnalytics, type FieldState } from '@/lib/field/FieldAnalytics';
import { Users, Sparkles, TrendingUp, Activity, Waves, Zap, Eye, Heart } from 'lucide-react';
import Link from 'next/link';

export default function FieldDashboard() {
  const [fieldState, setFieldState] = useState<FieldState | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    // Initial load
    updateFieldState();

    // Refresh every 30 seconds
    const interval = setInterval(() => {
      updateFieldState();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const updateFieldState = () => {
    const state = fieldAnalytics.generateFieldState();
    setFieldState(state);
    setLastUpdate(new Date());
  };

  if (!fieldState) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-900 via-purple-900 to-indigo-900 flex items-center justify-center">
        <motion.div
          animate={{ scale: [1, 1.2, 1], rotate: [0, 360] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <Waves className="w-16 h-16 text-violet-300" />
        </motion.div>
      </div>
    );
  }

  const { metrics, symbolicWaves, archetypeActivations, dominantTheme, fieldCoherence, insights } = fieldState;

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-900 via-purple-900 to-indigo-900 text-white">
      {/* Header */}
      <div className="border-b border-white/10 bg-black/20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between"
          >
            <div>
              <div className="flex items-center gap-3 mb-2">
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center"
                >
                  <Waves className="w-6 h-6" />
                </motion.div>
                <div>
                  <h1 className="text-3xl font-bold">The Field</h1>
                  <p className="text-violet-300 text-sm">Collective Symbolic Consciousness</p>
                </div>
              </div>
            </div>
            <div className="text-right text-sm">
              <div className="text-violet-300">Last Updated</div>
              <div className="font-medium">{lastUpdate.toLocaleTimeString()}</div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Dominant Theme Banner */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-r from-fuchsia-600 to-violet-600 rounded-3xl p-8 text-center"
        >
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="inline-block mb-4"
          >
            <Sparkles className="w-12 h-12" />
          </motion.div>
          <h2 className="text-4xl font-bold mb-2">{dominantTheme}</h2>
          <p className="text-violet-200 text-lg">Current Collective Theme</p>
        </motion.div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <MetricCard
            icon={<Users className="w-6 h-6" />}
            label="Total Users"
            value={metrics.totalUsers}
            color="from-violet-500 to-violet-600"
          />
          <MetricCard
            icon={<Activity className="w-6 h-6" />}
            label="Active Today"
            value={metrics.activeToday}
            color="from-fuchsia-500 to-fuchsia-600"
          />
          <MetricCard
            icon={<Eye className="w-6 h-6" />}
            label="Total Entries"
            value={metrics.totalEntries.toLocaleString()}
            color="from-purple-500 to-purple-600"
          />
          <MetricCard
            icon={<Sparkles className="w-6 h-6" />}
            label="Field Coherence"
            value={`${Math.round(fieldCoherence * 100)}%`}
            color="from-pink-500 to-pink-600"
          />
        </div>

        {/* Insights */}
        {insights.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10"
          >
            <div className="flex items-center gap-3 mb-4">
              <Heart className="w-6 h-6 text-violet-400" />
              <h3 className="text-xl font-semibold">Field Insights</h3>
            </div>
            <div className="space-y-3">
              {insights.map((insight, i) => (
                <motion.p
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  className="text-violet-200 leading-relaxed"
                >
                  {insight}
                </motion.p>
              ))}
            </div>
          </motion.div>
        )}

        {/* Symbolic Waves */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10"
        >
          <div className="flex items-center gap-3 mb-6">
            <Waves className="w-6 h-6 text-violet-400" />
            <h3 className="text-xl font-semibold">Symbolic Waves</h3>
          </div>
          <div className="space-y-4">
            {symbolicWaves.slice(0, 8).map((wave, i) => (
              <motion.div
                key={wave.symbol}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + i * 0.05 }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-semibold">{wave.symbol}</span>
                    {wave.trend === 'rising' && (
                      <span className="px-2 py-0.5 bg-green-500/20 text-green-300 rounded-full text-xs flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        Rising
                      </span>
                    )}
                    {wave.trend === 'falling' && (
                      <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 rounded-full text-xs">
                        Fading
                      </span>
                    )}
                  </div>
                  <span className="text-violet-300 text-sm">
                    {Math.round(wave.intensity * 100)}%
                  </span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${wave.intensity * 100}%` }}
                    transition={{ delay: 0.6 + i * 0.05, duration: 0.5 }}
                    className={`h-full ${
                      wave.trend === 'rising'
                        ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                        : wave.trend === 'falling'
                        ? 'bg-gradient-to-r from-amber-500 to-orange-500'
                        : 'bg-gradient-to-r from-violet-500 to-purple-500'
                    }`}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Archetype Activations */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10"
        >
          <div className="flex items-center gap-3 mb-6">
            <Zap className="w-6 h-6 text-violet-400" />
            <h3 className="text-xl font-semibold">Archetype Activations</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {archetypeActivations.slice(0, 6).map((activation, i) => (
              <motion.div
                key={activation.archetype}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.7 + i * 0.05 }}
                className={`p-4 rounded-xl border ${
                  activation.trend === 'activating'
                    ? 'bg-fuchsia-500/10 border-fuchsia-500/30'
                    : activation.trend === 'integrating'
                    ? 'bg-ain-soph-blue/20 border-ain-soph-gold/30'
                    : 'bg-white/5 border-white/10'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-lg">{activation.archetype}</h4>
                  {activation.trend === 'activating' && (
                    <Zap className="w-4 h-4 text-fuchsia-400" />
                  )}
                </div>
                <div className="text-sm text-violet-300 mb-3">
                  {activation.activeUsers} users engaging
                </div>
                <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${activation.intensity * 100}%` }}
                    transition={{ delay: 0.8 + i * 0.05, duration: 0.5 }}
                    className="h-full bg-gradient-to-r from-fuchsia-500 to-violet-500"
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Transformation Energy */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-gradient-to-br from-violet-600/20 to-fuchsia-600/20 backdrop-blur-md rounded-2xl p-8 border border-white/10 text-center"
        >
          <h3 className="text-2xl font-bold mb-4">Collective Transformation Energy</h3>
          <div className="flex items-center justify-center gap-6 mb-4">
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400"
            >
              {Math.round(metrics.transformationEnergy * 100)}%
            </motion.div>
          </div>
          <p className="text-violet-200">
            {metrics.transformationEnergy > 0.7
              ? 'High energy — the collective is actively transforming'
              : metrics.transformationEnergy > 0.4
              ? 'Moderate energy — steady integration happening'
              : 'Quiet energy — a reflective period'}
          </p>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-center space-y-4"
        >
          <p className="text-violet-300 text-sm">
            The Field represents the collective symbolic consciousness of all MAIA users.
            <br />
            Individual data remains private — only aggregated patterns are shown.
          </p>
          <Link
            href="/journal"
            className="inline-flex items-center gap-2 text-sm text-violet-400 hover:text-violet-300 transition-colors"
          >
            ← Back to Your Journal
          </Link>
        </motion.div>
      </div>
    </div>
  );
}

function MetricCard({ icon, label, value, color }: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.05 }}
      className="bg-white/5 backdrop-blur-md rounded-xl p-4 border border-white/10"
    >
      <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center mb-3`}>
        {icon}
      </div>
      <div className="text-3xl font-bold mb-1">{value}</div>
      <div className="text-sm text-violet-300">{label}</div>
    </motion.div>
  );
}