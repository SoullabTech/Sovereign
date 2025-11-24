"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Heart, Activity, Crown, TrendingUp, Calendar } from 'lucide-react';

interface EmotionalTrend {
  date: string;
  avg_valence: number;
  avg_arousal: number;
  avg_dominance: number;
  entry_count: number;
}

interface EmotionalState {
  valence: number;
  arousal: number;
  dominance: number;
  insight: string;
}

interface EmotionalResonanceChartProps {
  userId: string;
  className?: string;
}

export default function EmotionalResonanceChart({ userId, className = "" }: EmotionalResonanceChartProps) {
  const [trends, setTrends] = useState<EmotionalTrend[]>([]);
  const [currentState, setCurrentState] = useState<EmotionalState | null>(null);
  const [timeframe, setTimeframe] = useState<'day' | 'week' | 'month'>('week');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchEmotionalData();
  }, [timeframe, userId]);

  const fetchEmotionalData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/oracle/emotional-resonance?userId=${userId}&timeframe=${timeframe}`);
      const data = await response.json();
      
      if (data.success) {
        setTrends(data.trends);
        setCurrentState(data.current_state);
      }
    } catch (error) {
      console.error('Failed to fetch emotional resonance:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDimensionColor = (dimension: 'valence' | 'arousal' | 'dominance') => {
    switch (dimension) {
      case 'valence': return 'from-pink-500 to-rose-600';
      case 'arousal': return 'from-orange-500 to-amber-600'; 
      case 'dominance': return 'from-amber-500 to-indigo-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const getDimensionIcon = (dimension: 'valence' | 'arousal' | 'dominance') => {
    switch (dimension) {
      case 'valence': return <Heart className="w-4 h-4" />;
      case 'arousal': return <Activity className="w-4 h-4" />;
      case 'dominance': return <Crown className="w-4 h-4" />;
      default: return null;
    }
  };

  const getDimensionLabel = (dimension: 'valence' | 'arousal' | 'dominance') => {
    switch (dimension) {
      case 'valence': return 'Emotional Tone';
      case 'arousal': return 'Energy Level';
      case 'dominance': return 'Inner Strength';
      default: return '';
    }
  };

  const getDimensionValue = (value: number, dimension: 'valence' | 'arousal' | 'dominance') => {
    if (dimension === 'valence') {
      if (value > 0.3) return 'Positive';
      if (value < -0.3) return 'Processing';
      return 'Balanced';
    }
    if (dimension === 'arousal') {
      if (value > 0.7) return 'High Energy';
      if (value < 0.3) return 'Calm';
      return 'Steady';
    }
    if (dimension === 'dominance') {
      if (value > 0.7) return 'Empowered';
      if (value < 0.3) return 'Receptive';
      return 'Centered';
    }
    return '';
  };

  const normalizeValue = (value: number, dimension: 'valence' | 'arousal' | 'dominance') => {
    // Convert valence from [-1, 1] to [0, 1] for display
    if (dimension === 'valence') {
      return (value + 1) / 2;
    }
    return value;
  };

  if (loading) {
    return (
      <div className={` from-slate-800/50 to-amber-900/20 backdrop-blur-xl border border-amber-500/20 rounded-2xl p-6 ${className}`}>
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
          <span className="ml-2 text-amber-300">Loading emotional resonance...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={` from-slate-800/50 to-amber-900/20 backdrop-blur-xl border border-amber-500/20 rounded-2xl p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2  from-pink-500 to-amber-600 rounded-lg">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Emotional Resonance</h3>
            <p className="text-sm text-gray-400">Your inner landscape over time</p>
          </div>
        </div>
        
        {/* Timeframe selector */}
        <div className="flex gap-1 p-1 bg-gray-800/50 rounded-lg">
          {(['day', 'week', 'month'] as const).map((period) => (
            <button
              key={period}
              onClick={() => setTimeframe(period)}
              className={`px-3 py-1.5 text-sm rounded-md transition-all ${
                timeframe === period
                  ? 'bg-amber-600 text-white'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-gray-700/50'
              }`}
            >
              {period.charAt(0).toUpperCase() + period.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Current State */}
      {currentState && (
        <div className="mb-6 p-4 bg-gray-800/30 rounded-xl">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4 text-amber-400" />
            <span className="text-sm font-medium text-amber-300">Current Resonance</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(['valence', 'arousal', 'dominance'] as const).map((dimension) => {
              const value = currentState[dimension];
              const normalizedValue = normalizeValue(value, dimension);
              
              return (
                <div key={dimension} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getDimensionIcon(dimension)}
                      <span className="text-xs text-gray-400">{getDimensionLabel(dimension)}</span>
                    </div>
                    <span className="text-xs font-medium text-white">
                      {getDimensionValue(value, dimension)}
                    </span>
                  </div>
                  
                  <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${normalizedValue * 100}%` }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                      className={`h-full  ${getDimensionColor(dimension)}`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="mt-4 p-3  from-amber-500/10 to-pink-500/10 rounded-lg">
            <p className="text-sm text-amber-200">{currentState.insight}</p>
          </div>
        </div>
      )}

      {/* Trend Chart */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span className="text-sm font-medium text-gray-300">Emotional Journey</span>
        </div>
        
        <div className="h-32 relative">
          {trends.length > 0 ? (
            <div className="flex items-end justify-between h-full gap-1">
              {trends.slice(-14).map((trend, index) => {
                const valenceHeight = ((trend.avg_valence + 1) / 2) * 100; // Normalize valence
                const arousalHeight = trend.avg_arousal * 100;
                const dominanceHeight = trend.avg_dominance * 100;
                
                return (
                  <div key={index} className="flex-1 flex items-end gap-0.5">
                    {/* Valence bar */}
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${valenceHeight}%` }}
                      transition={{ duration: 0.6, delay: index * 0.05 }}
                      className="flex-1  from-pink-600 to-pink-400 rounded-t-sm min-h-[2px]"
                      title={`${new Date(trend.date).toLocaleDateString()}: Emotional Tone ${(trend.avg_valence > 0 ? '+' : '')}${trend.avg_valence.toFixed(2)}`}
                    />
                    
                    {/* Arousal bar */}
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${arousalHeight}%` }}
                      transition={{ duration: 0.6, delay: index * 0.05 }}
                      className="flex-1  from-orange-600 to-orange-400 rounded-t-sm min-h-[2px]"
                      title={`${new Date(trend.date).toLocaleDateString()}: Energy Level ${trend.avg_arousal.toFixed(2)}`}
                    />
                    
                    {/* Dominance bar */}
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${dominanceHeight}%` }}
                      transition={{ duration: 0.6, delay: index * 0.05 }}
                      className="flex-1  from-amber-600 to-amber-400 rounded-t-sm min-h-[2px]"
                      title={`${new Date(trend.date).toLocaleDateString()}: Inner Strength ${trend.avg_dominance.toFixed(2)}`}
                    />
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              <span className="text-sm">No emotional data yet</span>
            </div>
          )}
        </div>
        
        {/* Legend */}
        <div className="flex justify-center gap-6 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3  from-pink-600 to-pink-400 rounded"></div>
            <span className="text-gray-400">Emotional Tone</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3  from-orange-600 to-orange-400 rounded"></div>
            <span className="text-gray-400">Energy Level</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3  from-amber-600 to-amber-400 rounded"></div>
            <span className="text-gray-400">Inner Strength</span>
          </div>
        </div>
      </div>
    </div>
  );
}