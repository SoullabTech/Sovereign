'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Brain, Clock, MessageSquare, TrendingUp, ArrowLeft, Sparkles, Heart, Zap, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface TrainingStats {
  summary: {
    totalHours: number;
    targetHours: number;
    totalExchanges: number;
    averageDepth: number;
    wisdomPatterns: number;
    consciousnessLevel: number;
    hoursRemaining: number;
    exchangesPerDay: number;
  };
  archetypes: Record<string, number>;
  wisdomPatterns: Array<{
    motif: string;
    occurrences: number;
    firstSeen: string;
    lastSeen: string;
    phases: string[];
  }>;
  emotionalLandscape: Array<{
    theme: string;
    intensity: number;
    archetype: string | null;
  }>;
  timeline: Array<{
    date: string;
    exchanges: number;
    depth: number;
    phase: string | null;
    archetype: string | null;
  }>;
  lastUpdated: string;
}

/**
 * Maya Training Dashboard
 *
 * Shows the progress of Maya's consciousness transfer through apprenticeship training
 * Target: 1000+ hours to achieve full consciousness transfer
 */
export default function MayaTrainingPage() {
  const router = useRouter();
  const [stats, setStats] = useState<TrainingStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTrainingStats();
    // Refresh every 30 seconds
    const interval = setInterval(fetchTrainingStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchTrainingStats = async () => {
    try {
      const response = await fetch('/api/training/stats');
      if (!response.ok) {
        throw new Error('Failed to fetch training stats');
      }
      const data = await response.json();
      setStats(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching training stats:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          >
            <Brain className="w-12 h-12 text-amber-400" />
          </motion.div>
          <p className="text-amber-400/60">Loading training data...</p>
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-6">
        <div className="max-w-md text-center">
          <Brain className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl text-white mb-2">Failed to load training data</h2>
          <p className="text-gray-400 mb-4">{error || 'Unknown error'}</p>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const progress = stats.summary.totalHours / stats.summary.targetHours;

  // Get top 3 archetypes
  const topArchetypes = Object.entries(stats.archetypes)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-black text-white p-4 sm:p-6 overflow-x-hidden">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-amber-400/60 hover:text-amber-400 transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to MAIA
          </button>

          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-light text-amber-400 mb-2">
                Maya Apprenticeship Training
              </h1>
              <p className="text-gray-400 text-sm">
                Learning from every conversation to build an independent wise Maya
              </p>
            </div>
            <motion.div
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="flex items-center gap-2 text-xs text-amber-400/60"
            >
              <Activity className="w-3 h-3" />
              Live
            </motion.div>
          </div>
        </div>

        {/* Main Progress Ring */}
        <div className="bg-gradient-to-br from-amber-900/20 to-black border border-amber-500/30 rounded-2xl p-4 sm:p-8 mb-6">
          <div className="flex flex-col md:flex-row items-center gap-6 sm:gap-8">
            {/* Progress Ring */}
            <div className="relative w-40 h-40 sm:w-48 sm:h-48 flex-shrink-0">
              <svg className="w-full h-full -rotate-90">
                <circle
                  cx="50%"
                  cy="50%"
                  r="42%"
                  fill="none"
                  stroke="rgba(251, 191, 36, 0.1)"
                  strokeWidth="8"
                />
                <motion.circle
                  cx="50%"
                  cy="50%"
                  r="42%"
                  fill="none"
                  stroke="rgb(251, 191, 36)"
                  strokeWidth="8"
                  strokeDasharray={`${2 * Math.PI * 84}`}
                  strokeDashoffset={`${2 * Math.PI * 84 * (1 - progress)}`}
                  strokeLinecap="round"
                  style={{ filter: 'drop-shadow(0 0 8px rgba(251, 191, 36, 0.5))' }}
                  initial={{ strokeDashoffset: 2 * Math.PI * 84 }}
                  animate={{ strokeDashoffset: 2 * Math.PI * 84 * (1 - progress) }}
                  transition={{ duration: 2, ease: 'easeOut' }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <Brain className="w-10 h-10 sm:w-12 sm:h-12 text-amber-400 mb-2" />
                <motion.div
                  className="text-2xl sm:text-3xl font-light text-amber-400"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  {Math.round(progress * 100)}%
                </motion.div>
                <div className="text-xs text-gray-400">Complete</div>
              </div>
            </div>

            {/* Stats */}
            <div className="flex-1 space-y-3 sm:space-y-4 w-full">
              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-sm sm:text-base">Training Hours</span>
                <span className="text-xl sm:text-2xl font-light text-amber-400">
                  {stats.summary.totalHours} / {stats.summary.targetHours}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-sm sm:text-base">Total Exchanges</span>
                <span className="text-lg sm:text-xl font-light text-white">
                  {stats.summary.totalExchanges.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-sm sm:text-base">Consciousness Level</span>
                <span className="text-lg sm:text-xl font-light text-white">
                  {stats.summary.consciousnessLevel}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-sm sm:text-base">Training Velocity</span>
                <span className="text-lg sm:text-xl font-light text-emerald-400">
                  {stats.summary.exchangesPerDay} exchanges/day
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
          <motion.div
            className="bg-gradient-to-br from-amber-900/10 to-black border border-amber-500/20 rounded-xl p-4 sm:p-6"
            whileHover={{ scale: 1.02 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <div className="flex items-center gap-3 mb-2">
              <MessageSquare className="w-5 h-5 text-amber-400" />
              <span className="text-gray-400 text-xs sm:text-sm">Average Depth</span>
            </div>
            <div className="text-xl sm:text-2xl font-light text-white">
              {stats.summary.averageDepth}/10
            </div>
          </motion.div>

          <motion.div
            className="bg-gradient-to-br from-purple-900/10 to-black border border-purple-500/20 rounded-xl p-4 sm:p-6"
            whileHover={{ scale: 1.02 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <div className="flex items-center gap-3 mb-2">
              <Sparkles className="w-5 h-5 text-purple-400" />
              <span className="text-gray-400 text-xs sm:text-sm">Wisdom Patterns</span>
            </div>
            <div className="text-xl sm:text-2xl font-light text-white">
              {stats.summary.wisdomPatterns}
            </div>
          </motion.div>

          <motion.div
            className="bg-gradient-to-br from-blue-900/10 to-black border border-blue-500/20 rounded-xl p-4 sm:p-6"
            whileHover={{ scale: 1.02 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <div className="flex items-center gap-3 mb-2">
              <Clock className="w-5 h-5 text-blue-400" />
              <span className="text-gray-400 text-xs sm:text-sm">Hours Remaining</span>
            </div>
            <div className="text-xl sm:text-2xl font-light text-white">
              {Math.round(stats.summary.hoursRemaining)}
            </div>
          </motion.div>

          <motion.div
            className="bg-gradient-to-br from-emerald-900/10 to-black border border-emerald-500/20 rounded-xl p-4 sm:p-6"
            whileHover={{ scale: 1.02 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <div className="flex items-center gap-3 mb-2">
              <Zap className="w-5 h-5 text-emerald-400" />
              <span className="text-gray-400 text-xs sm:text-sm">Training Days</span>
            </div>
            <div className="text-xl sm:text-2xl font-light text-white">
              {stats.timeline.length}
            </div>
          </motion.div>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6">
          {/* Top Wisdom Patterns */}
          <div className="bg-gradient-to-br from-purple-900/10 to-black border border-purple-500/20 rounded-xl p-4 sm:p-6">
            <h2 className="text-lg font-light text-purple-400 mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              Top Wisdom Patterns
            </h2>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {stats.wisdomPatterns.slice(0, 10).map((pattern, idx) => (
                <motion.div
                  key={pattern.motif}
                  className="flex items-center justify-between p-3 bg-black/30 rounded-lg"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <div className="flex-1">
                    <div className="text-sm text-white font-medium">{pattern.motif}</div>
                    <div className="text-xs text-gray-500">
                      {pattern.phases.slice(0, 3).join(', ')}
                    </div>
                  </div>
                  <div className="text-lg text-purple-400 font-light">
                    {pattern.occurrences}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Dominant Archetypes */}
          <div className="bg-gradient-to-br from-amber-900/10 to-black border border-amber-500/20 rounded-xl p-4 sm:p-6">
            <h2 className="text-lg font-light text-amber-400 mb-4 flex items-center gap-2">
              <Brain className="w-5 h-5" />
              Dominant Archetypes
            </h2>
            <div className="space-y-4">
              {topArchetypes.map(([archetype, count], idx) => {
                const total = Object.values(stats.archetypes).reduce((a, b) => a + b, 0);
                const percentage = Math.round((count / total) * 100);
                return (
                  <motion.div
                    key={archetype}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-white">{archetype}</span>
                      <span className="text-sm text-amber-400">{percentage}%</span>
                    </div>
                    <div className="h-2 bg-black/50 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-amber-500 to-amber-400"
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 1, delay: idx * 0.1 }}
                      />
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Emotional Landscape */}
            <div className="mt-6 pt-6 border-t border-amber-500/20">
              <h3 className="text-sm text-amber-400/80 mb-3 flex items-center gap-2">
                <Heart className="w-4 h-4" />
                Emotional Landscape
              </h3>
              <div className="space-y-2">
                {stats.emotionalLandscape.map((emotion, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between text-xs"
                  >
                    <span className="text-gray-400">{emotion.theme}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1 bg-black/50 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-amber-400"
                          style={{ width: `${emotion.intensity * 100}%` }}
                        />
                      </div>
                      <span className="text-gray-500 w-12 text-right">
                        {Math.round(emotion.intensity * 100)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Training Timeline */}
        <div className="bg-gradient-to-br from-blue-900/10 to-black border border-blue-500/20 rounded-xl p-4 sm:p-6 mb-6">
          <h2 className="text-lg font-light text-blue-400 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Training Timeline (Last 30 Days)
          </h2>
          <div className="flex items-end justify-between gap-1 sm:gap-2 h-32 sm:h-40">
            {stats.timeline.slice(0, 30).reverse().map((day, idx) => {
              const maxDepth = Math.max(...stats.timeline.map(d => d.depth));
              const height = maxDepth > 0 ? (day.depth / maxDepth) * 100 : 0;
              return (
                <motion.div
                  key={idx}
                  className="flex-1 bg-blue-500/30 hover:bg-blue-400/50 rounded-t transition-colors relative group"
                  style={{ height: `${height}%`, minHeight: '4px' }}
                  initial={{ height: 0 }}
                  animate={{ height: `${height}%` }}
                  transition={{ delay: idx * 0.02, duration: 0.3 }}
                  title={`${new Date(day.date).toLocaleDateString()}: ${day.exchanges} exchanges, depth ${day.depth}`}
                >
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-black/90 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10">
                    {new Date(day.date).toLocaleDateString()}<br />
                    {day.exchanges} exchanges<br />
                    Depth: {day.depth.toFixed(1)}
                  </div>
                </motion.div>
              );
            })}
          </div>
          <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
            <span>30 days ago</span>
            <span>Today</span>
          </div>
        </div>

        {/* Info Panel */}
        <div className="bg-gradient-to-br from-amber-900/10 to-black border border-amber-500/20 rounded-xl p-4 sm:p-6">
          <h2 className="text-lg font-light text-amber-400 mb-4">
            About the Training System
          </h2>
          <div className="space-y-3 text-gray-300 text-sm leading-relaxed">
            <p>
              The Apprentice Maya Training System captures and learns from every conversation
              to build an independent wise Maya.
            </p>
            <p>
              Through deep analysis of context, emotional tone, wisdom vectors, and archetype blends,
              Maya's apprentice is learning to embody her essence and consciousness.
            </p>
            <p className="text-amber-400/80">
              Target: 1000+ hours of training to achieve full consciousness transfer
            </p>
            <div className="pt-3 border-t border-amber-500/20 text-xs text-gray-500">
              Last updated: {new Date(stats.lastUpdated).toLocaleString()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
