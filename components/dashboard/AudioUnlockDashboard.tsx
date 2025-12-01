'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { createClientComponentClient } from '@/lib/supabase';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { Volume2, TrendingUp, AlertCircle, Check } from 'lucide-react';
import { soullabColors, chartColorSequence } from '@/lib/theme/soullabColors';

interface AudioUnlockMetrics {
  totalAttempts: number;
  successRate: number;
  trendData: Array<{
    date: string;
    success: number;
    failure: number;
  }>;
  browserData: Array<{
    browser: string;
    success: number;
    failure: number;
  }>;
  deviceBreakdown: {
    mobile: number;
    desktop: number;
    tablet: number;
  };
}

export default function AudioUnlockDashboard() {
  const [metrics, setMetrics] = useState<AudioUnlockMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | 'all'>('7d');
  const supabase = createClientComponentClient();

  useEffect(() => {
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, [timeRange]);

  async function fetchMetrics() {
    try {
      const now = new Date();
      let startDate = new Date();
      
      if (timeRange === '7d') {
        startDate.setDate(now.getDate() - 7);
      } else if (timeRange === '30d') {
        startDate.setDate(now.getDate() - 30);
      } else {
        startDate = new Date('2024-01-01');
      }

      // Fetch audio unlock events
      const { data, error } = await supabase
        .from('event_logs')
        .select('*')
        .eq('event_name', 'audio_unlock')
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Process metrics
      const totalAttempts = data?.length || 0;
      const successCount = data?.filter(e => e.metadata?.success).length || 0;
      const successRate = totalAttempts > 0 ? (successCount / totalAttempts) * 100 : 0;

      // Daily trend
      const dailyData = data?.reduce((acc, event) => {
        const date = new Date(event.created_at).toLocaleDateString();
        if (!acc[date]) {
          acc[date] = { success: 0, failure: 0 };
        }
        if (event.metadata?.success) {
          acc[date].success++;
        } else {
          acc[date].failure++;
        }
        return acc;
      }, {} as Record<string, any>) || {};

      const trendData = Object.entries(dailyData)
        .map(([date, counts]) => ({ date, ...counts }))
        .slice(-7);

      // Browser breakdown
      const browserCounts = data?.reduce((acc, event) => {
        const browser = event.metadata?.browser || 'Unknown';
        if (!acc[browser]) {
          acc[browser] = { success: 0, failure: 0 };
        }
        if (event.metadata?.success) {
          acc[browser].success++;
        } else {
          acc[browser].failure++;
        }
        return acc;
      }, {} as Record<string, any>) || {};

      const browserData = Object.entries(browserCounts)
        .map(([browser, counts]) => ({ browser, ...counts }))
        .sort((a, b) => (b.success + b.failure) - (a.success + a.failure))
        .slice(0, 5);

      // Device breakdown
      const deviceCounts = data?.reduce((acc, event) => {
        const device = event.metadata?.deviceType || 'desktop';
        acc[device] = (acc[device] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      setMetrics({
        totalAttempts,
        successRate,
        trendData,
        browserData,
        deviceBreakdown: {
          mobile: deviceCounts.mobile || 0,
          desktop: deviceCounts.desktop || 0,
          tablet: deviceCounts.tablet || 0
        }
      });
    } catch (error) {
      console.error('Error fetching audio unlock metrics:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen relative overflow-hidden flex items-center justify-center">
        {/* Hypnotic Jade Loading Sequence */}
        <div className="absolute inset-0 bg-gradient-to-br from-jade-abyss via-jade-shadow to-jade-night" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,_var(--tw-gradient-stops))] from-jade-forest/10 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,_var(--tw-gradient-stops))] from-jade-copper/8 via-transparent to-transparent" />

        {/* Floating Consciousness Particles */}
        <motion.div
          animate={{
            y: [-20, 20, -20],
            x: [-10, 10, -10],
            scale: [0.8, 1.2, 0.8],
            opacity: [0.3, 0.7, 0.3]
          }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-20 left-32 w-1 h-1 bg-jade-sage/60 rounded-full"
        />
        <motion.div
          animate={{
            y: [20, -20, 20],
            x: [10, -10, 10],
            scale: [1.2, 0.8, 1.2],
            opacity: [0.4, 0.8, 0.4]
          }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-32 right-24 w-1.5 h-1.5 bg-jade-malachite/50 rounded-full"
        />

        <div className="relative z-10 text-center">
          {/* Crystalline Loading Indicator */}
          <div className="relative w-16 h-16 mx-auto mb-8">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 border border-jade-sage/30 rounded-full"
            />
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
              className="absolute top-2 left-2 bottom-2 right-2 border border-jade-malachite/40 rounded-full"
            />
            <motion.div
              animate={{
                opacity: [0.4, 1, 0.4],
                scale: [0.8, 1.1, 0.8]
              }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-4 left-4 bottom-4 right-4 bg-jade-jade/80 rounded-full"
            />
          </div>

          <motion.p
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            className="text-xl font-extralight text-jade-jade tracking-[0.3em] uppercase"
          >
            Crystallizing Sonic Pathways
          </motion.p>
          <motion.div
            animate={{
              scaleX: [0, 1, 0],
              opacity: [0, 0.6, 0]
            }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
            className="w-32 h-px bg-gradient-to-r from-transparent via-jade-sage to-transparent mx-auto mt-4"
          />
        </div>
      </div>
    );
  }

  if (!metrics) return null;

  // Custom tooltip with Jade styling
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload) return null;

    return (
      <div className="bg-jade-shadow/95 border border-jade-sage/30 rounded-lg p-4 backdrop-blur-sm shadow-lg">
        <p className="text-sm font-extralight text-jade-jade mb-2 tracking-wide">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-xs font-light tracking-wide" style={{ color: entry.color }}>
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    );
  };

  // Device pie chart data with jade colors
  const deviceData = [
    { name: 'Mobile', value: metrics.deviceBreakdown.mobile, color: '#618B6E' },
    { name: 'Desktop', value: metrics.deviceBreakdown.desktop, color: '#739B7F' },
    { name: 'Tablet', value: metrics.deviceBreakdown.tablet, color: '#85AB91' }
  ].filter(d => d.value > 0);

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Cinematic Jade Environment */}
      <div className="absolute inset-0 bg-gradient-to-br from-jade-abyss via-jade-shadow to-jade-night" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,_var(--tw-gradient-stops))] from-jade-forest/8 via-transparent to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_70%,_var(--tw-gradient-stops))] from-jade-copper/6 via-transparent to-transparent" />
      <div className="absolute inset-0 bg-[linear-gradient(135deg,transparent_0%,rgba(151,187,163,0.03)_50%,transparent_100%)]" />

      {/* Atmospheric Consciousness Particles */}
      <motion.div
        animate={{
          y: [-30, 30, -30],
          x: [-20, 20, -20],
          opacity: [0.2, 0.5, 0.2],
          scale: [0.8, 1.2, 0.8]
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-16 left-1/4 w-1 h-1 bg-jade-sage/40 rounded-full"
      />
      <motion.div
        animate={{
          y: [25, -25, 25],
          x: [15, -15, 15],
          opacity: [0.3, 0.6, 0.3],
          scale: [1.1, 0.9, 1.1]
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="absolute bottom-20 right-1/3 w-1.5 h-1.5 bg-jade-malachite/30 rounded-full"
      />

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-12 text-jade-jade">
        {/* Cinematic Header Sequence */}
        <motion.div
          initial={{ opacity: 0, y: -30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="mb-20 relative"
        >
          {/* Background Glow */}
          <div className="absolute inset-0 bg-gradient-to-r from-jade-bronze/10 via-jade-copper/5 to-jade-silver/8 rounded-2xl blur-xl" />

          <div className="relative max-w-5xl">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="flex items-center gap-6 mb-8"
            >
              <div className="relative w-8 h-8">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 border border-jade-sage/40 rounded-full"
                />
                <motion.div
                  animate={{ rotate: -360 }}
                  transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                  className="absolute top-1 left-1 bottom-1 right-1 border border-jade-malachite/30 rounded-full"
                />
                <div className="absolute top-2 left-2 bottom-2 right-2 bg-jade-jade rounded-full" />
              </div>
              <div className="h-12 w-px bg-gradient-to-b from-transparent via-jade-forest/50 to-transparent" />
              <motion.h1
                initial={{ opacity: 0, letterSpacing: "0.5em" }}
                animate={{ opacity: 1, letterSpacing: "0.1em" }}
                transition={{ delay: 0.5, duration: 1 }}
                className="text-5xl md:text-6xl font-extralight text-jade-jade tracking-wide"
              >
                Sonic Resonance Matrix
              </motion.h1>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.8 }}
              className="flex items-center gap-6"
            >
              <div className="w-16 h-px bg-gradient-to-r from-jade-sage via-jade-malachite to-jade-forest" />
              <p className="text-xl font-light text-jade-mineral max-w-3xl leading-relaxed">
                Real-time consciousness synchronization analytics and{' '}
                <motion.span
                  animate={{ color: ['#618B6E', '#739B7F', '#618B6E'] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="text-jade-sage"
                >
                  neural pathway
                </motion.span>
                {' '}crystallization performance metrics
              </p>
            </motion.div>
          </div>
        </motion.div>

        {/* Temporal Analysis Protocol Matrix */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="mb-16 text-center relative"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.0, duration: 0.8 }}
            className="mb-8"
          >
            <div className="flex items-center justify-center gap-6 mb-6">
              <div className="w-8 h-px bg-gradient-to-r from-transparent via-jade-sage/50 to-jade-malachite/30" />
              <h3 className="text-xl font-extralight text-jade-jade tracking-[0.3em] uppercase">
                Temporal Crystallization Protocol
              </h3>
              <div className="w-8 h-px bg-gradient-to-l from-transparent via-jade-sage/50 to-jade-malachite/30" />
            </div>
            <motion.div
              animate={{
                scaleX: [0.8, 1.2, 0.8],
                opacity: [0.3, 0.7, 0.3]
              }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="w-24 h-px bg-gradient-to-r from-jade-forest via-jade-sage to-jade-malachite mx-auto"
            />
          </motion.div>

          <div className="relative inline-flex bg-jade-shadow/40 border border-jade-sage/20 rounded-lg p-2 backdrop-blur-sm">
            <div className="absolute inset-0 bg-gradient-to-r from-jade-bronze/10 via-jade-copper/5 to-jade-silver/8 rounded-lg" />
            {(['7d', '30d', 'all'] as const).map((range, index) => (
              <motion.button
                key={range}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.1 + index * 0.1 }}
                onClick={() => setTimeRange(range)}
                className={`relative px-8 py-4 rounded-md text-sm font-extralight tracking-wider uppercase transition-all duration-500 ${
                  timeRange === range
                    ? 'bg-gradient-to-r from-jade-sage/60 to-jade-malachite/60 text-jade-night shadow-lg shadow-jade-sage/30 border border-jade-jade/30'
                    : 'text-jade-mineral hover:text-jade-jade hover:bg-jade-sage/10 hover:border hover:border-jade-sage/20'
                }`}
              >
                {range === 'all' ? 'Complete Neural Archive' : `${range} Crystallization Cycle`}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Crystalline Sonic Metrics Matrix */}
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 1.4, duration: 1 }}
          className="mb-20 relative"
        >
          {/* Section Background Atmosphere */}
          <div className="absolute inset-0 bg-gradient-to-br from-jade-bronze/5 via-jade-copper/3 to-jade-silver/5 rounded-3xl blur-2xl" />

          <div className="relative">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.6, duration: 0.8 }}
              className="text-center mb-16"
            >
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.7 }}
                className="flex items-center justify-center gap-6 mb-6"
              >
                <div className="w-8 h-px bg-gradient-to-r from-transparent via-jade-sage/50 to-jade-malachite/30" />
                <h3 className="text-2xl font-extralight text-jade-jade mb-4 tracking-[0.3em] uppercase">
                  Crystalline Sonic Synchronization
                </h3>
                <div className="w-8 h-px bg-gradient-to-l from-transparent via-jade-sage/50 to-jade-malachite/30" />
              </motion.div>

              <motion.div
                animate={{
                  scaleX: [0.8, 1.2, 0.8],
                  opacity: [0.3, 0.7, 0.3]
                }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="w-32 h-px bg-gradient-to-r from-jade-forest via-jade-sage to-jade-malachite mx-auto"
              />
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {/* Crystalline Consciousness Vessel 1 - Neural Attempts */}
              <motion.div
                initial={{ opacity: 0, y: 30, rotateX: 15 }}
                animate={{ opacity: 1, y: 0, rotateX: 0 }}
                transition={{ delay: 1.8, duration: 0.8, ease: "easeOut" }}
                className="group relative perspective-1000"
              >
                {/* Multi-dimensional Background Layers */}
                <div className="absolute inset-0 bg-gradient-to-br from-jade-bronze/20 via-jade-copper/10 to-jade-shadow/30 rounded-xl blur-sm" />
                <div className="absolute inset-0 bg-gradient-to-t from-jade-dusk/40 via-transparent to-jade-forest/20 rounded-xl" />

                <motion.div
                  whileHover={{
                    scale: 1.02,
                    rotateY: 2,
                    z: 10
                  }}
                  transition={{ duration: 0.4 }}
                  className="relative p-10 text-center border border-jade-sage/30 rounded-xl backdrop-blur-md
                           hover:border-jade-malachite/50 transition-all duration-700 group-hover:shadow-2xl
                           group-hover:shadow-jade-forest/20 bg-gradient-to-br from-jade-shadow/60 to-jade-night/80"
                >
                  {/* Sacred Geometric Corner Vessels */}
                  <div className="absolute top-3 left-3 w-3 h-3">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                      className="absolute inset-0 border-l border-t border-jade-sage/40"
                    />
                  </div>
                  <div className="absolute top-3 right-3 w-3 h-3">
                    <motion.div
                      animate={{ rotate: -360 }}
                      transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                      className="absolute inset-0 border-r border-t border-jade-malachite/40"
                    />
                  </div>

                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 2.0, type: "spring", stiffness: 150 }}
                    className="mb-6"
                  >
                    <motion.p
                      animate={{
                        textShadow: [
                          "0 0 10px rgba(168, 203, 180, 0.5)",
                          "0 0 20px rgba(168, 203, 180, 0.3)",
                          "0 0 10px rgba(168, 203, 180, 0.5)"
                        ]
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="text-5xl font-extralight text-jade-jade tracking-wide"
                    >
                      {metrics.totalAttempts}
                    </motion.p>
                  </motion.div>

                  <motion.div
                    animate={{
                      scaleX: [0.6, 1, 0.6],
                      opacity: [0.4, 0.8, 0.4]
                    }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    className="w-12 h-px bg-gradient-to-r from-jade-sage via-jade-jade to-jade-malachite mx-auto mb-4"
                  />

                  <p className="text-sm font-extralight text-jade-mineral uppercase tracking-[0.3em] opacity-80">
                    Neural Sonic Attempts
                  </p>
                </motion.div>
              </motion.div>

              {/* Crystalline Consciousness Vessel 2 - Sync Success */}
              <motion.div
                initial={{ opacity: 0, y: 30, rotateX: 15 }}
                animate={{ opacity: 1, y: 0, rotateX: 0 }}
                transition={{ delay: 1.9, duration: 0.8, ease: "easeOut" }}
                className="group relative perspective-1000"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-jade-copper/20 via-jade-silver/10 to-jade-shadow/30 rounded-xl blur-sm" />
                <div className="absolute inset-0 bg-gradient-to-t from-jade-dusk/40 via-transparent to-jade-malachite/20 rounded-xl" />

                <motion.div
                  whileHover={{
                    scale: 1.02,
                    rotateY: -2,
                    z: 10
                  }}
                  transition={{ duration: 0.4 }}
                  className="relative p-10 text-center border border-jade-malachite/30 rounded-xl backdrop-blur-md
                           hover:border-jade-jade/50 transition-all duration-700 group-hover:shadow-2xl
                           group-hover:shadow-jade-copper/20 bg-gradient-to-br from-jade-shadow/60 to-jade-night/80"
                >
                  <div className="absolute top-3 left-3 w-3 h-3">
                    <motion.div
                      animate={{ rotate: -360 }}
                      transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                      className="absolute inset-0 border-l border-t border-jade-malachite/40"
                    />
                  </div>
                  <div className="absolute top-3 right-3 w-3 h-3">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 13, repeat: Infinity, ease: "linear" }}
                      className="absolute inset-0 border-r border-t border-jade-silver/40"
                    />
                  </div>

                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 2.1, type: "spring", stiffness: 150 }}
                    className="mb-6"
                  >
                    <motion.p
                      animate={{
                        textShadow: [
                          "0 0 10px rgba(115, 155, 127, 0.5)",
                          "0 0 20px rgba(115, 155, 127, 0.3)",
                          "0 0 10px rgba(115, 155, 127, 0.5)"
                        ]
                      }}
                      transition={{ duration: 2.5, repeat: Infinity }}
                      className="text-5xl font-extralight text-jade-malachite tracking-wide"
                    >
                      {metrics.successRate.toFixed(1)}%
                    </motion.p>
                  </motion.div>

                  <motion.div
                    animate={{
                      scaleX: [0.6, 1, 0.6],
                      opacity: [0.4, 0.8, 0.4]
                    }}
                    transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
                    className="w-12 h-px bg-gradient-to-r from-jade-malachite via-jade-jade to-jade-copper mx-auto mb-4"
                  />

                  <p className="text-sm font-extralight text-jade-mineral uppercase tracking-[0.3em] opacity-80">
                    Sonic Crystallization Success
                  </p>
                </motion.div>
              </motion.div>

              {/* Crystalline Consciousness Vessel 3 - Pattern Flow */}
              <motion.div
                initial={{ opacity: 0, y: 30, rotateX: 15 }}
                animate={{ opacity: 1, y: 0, rotateX: 0 }}
                transition={{ delay: 2.0, duration: 0.8, ease: "easeOut" }}
                className="group relative perspective-1000"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-jade-gold/20 via-jade-bronze/10 to-jade-shadow/30 rounded-xl blur-sm" />
                <div className="absolute inset-0 bg-gradient-to-t from-jade-dusk/40 via-transparent to-jade-sage/20 rounded-xl" />

                <motion.div
                  whileHover={{
                    scale: 1.02,
                    rotateY: 3,
                    z: 10
                  }}
                  transition={{ duration: 0.4 }}
                  className="relative p-10 text-center border border-jade-sage/30 rounded-xl backdrop-blur-md
                           hover:border-jade-forest/50 transition-all duration-700 group-hover:shadow-2xl
                           group-hover:shadow-jade-gold/20 bg-gradient-to-br from-jade-shadow/60 to-jade-night/80"
                >
                  <div className="absolute top-3 left-3 w-3 h-3">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                      className="absolute inset-0 border-l border-t border-jade-gold/40"
                    />
                  </div>
                  <div className="absolute top-3 right-3 w-3 h-3">
                    <motion.div
                      animate={{ rotate: -360 }}
                      transition={{ duration: 11, repeat: Infinity, ease: "linear" }}
                      className="absolute inset-0 border-r border-t border-jade-platinum/40"
                    />
                  </div>

                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 2.2, type: "spring", stiffness: 150 }}
                    className="mb-6"
                  >
                    <motion.p
                      animate={{
                        textShadow: [
                          "0 0 10px rgba(127, 161, 136, 0.5)",
                          "0 0 20px rgba(127, 161, 136, 0.3)",
                          "0 0 10px rgba(127, 161, 136, 0.5)"
                        ]
                      }}
                      transition={{ duration: 3, repeat: Infinity }}
                      className="text-2xl font-extralight text-jade-gold tracking-wide"
                    >
                      {metrics.trendData.length > 1
                        ? metrics.trendData[metrics.trendData.length - 1].success > metrics.trendData[0].success ? '↗ Crystallizing' : '↘ Recalibrating'
                        : '— Neural Equilibrium'}
                    </motion.p>
                  </motion.div>

                  <motion.div
                    animate={{
                      scaleX: [0.6, 1, 0.6],
                      opacity: [0.4, 0.8, 0.4]
                    }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className="w-12 h-px bg-gradient-to-r from-jade-gold via-jade-sage to-jade-bronze mx-auto mb-4"
                  />

                  <p className="text-sm font-extralight text-jade-mineral uppercase tracking-[0.3em] opacity-80">
                    Sonic Pattern Resonance
                  </p>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Crystalline Analytics Matrix */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.3 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-16"
        >
          {/* Neural Temporal Flow Analysis */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 2.5, duration: 0.8 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-jade-bronze/10 via-jade-copper/5 to-jade-shadow/20 rounded-xl blur-sm" />
            <div className="relative bg-jade-shadow/40 border border-jade-sage/20 rounded-xl p-8 backdrop-blur-md">
              <div className="absolute top-3 left-3 w-3 h-3 border-l border-t border-jade-sage/30" />
              <div className="absolute top-3 right-3 w-3 h-3 border-r border-t border-jade-sage/30" />
              <div className="absolute bottom-3 left-3 w-3 h-3 border-l border-b border-jade-sage/30" />
              <div className="absolute bottom-3 right-3 w-3 h-3 border-r border-b border-jade-sage/30" />

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2.7 }}
                className="mb-8"
              >
                <h4 className="text-xl font-extralight text-jade-jade mb-4 tracking-[0.3em] uppercase">
                  Temporal Sonic Flow Analysis
                </h4>
                <motion.div
                  animate={{
                    scaleX: [0.7, 1.3, 0.7],
                    opacity: [0.3, 0.8, 0.3]
                  }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                  className="w-20 h-px bg-gradient-to-r from-jade-sage via-jade-malachite to-jade-forest"
                />
              </motion.div>

              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={metrics.trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(97, 139, 110, 0.1)" />
                  <XAxis
                    dataKey="date"
                    stroke="rgba(151, 187, 163, 0.6)"
                    tick={{ fontSize: 10, fill: "rgba(151, 187, 163, 0.6)" }}
                    tickFormatter={(date) => new Date(date).toLocaleDateString('en', { month: 'short', day: 'numeric' })}
                  />
                  <YAxis stroke="rgba(151, 187, 163, 0.6)" tick={{ fontSize: 10, fill: "rgba(151, 187, 163, 0.6)" }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="success"
                    stroke="#A8CBB4"
                    strokeWidth={2}
                    dot={{ fill: "#A8CBB4", r: 4 }}
                    activeDot={{ r: 6, fill: "#A8CBB4" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="failure"
                    stroke="#618B6E"
                    strokeWidth={1.5}
                    strokeDasharray="4 4"
                    dot={{ fill: "#618B6E", r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Neural Interface Compatibility Matrix */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 2.7, duration: 0.8 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-jade-copper/10 via-jade-silver/5 to-jade-shadow/20 rounded-xl blur-sm" />
            <div className="relative bg-jade-shadow/40 border border-jade-malachite/20 rounded-xl p-8 backdrop-blur-md">
              <div className="absolute top-3 left-3 w-3 h-3 border-l border-t border-jade-malachite/30" />
              <div className="absolute top-3 right-3 w-3 h-3 border-r border-t border-jade-malachite/30" />
              <div className="absolute bottom-3 left-3 w-3 h-3 border-l border-b border-jade-malachite/30" />
              <div className="absolute bottom-3 right-3 w-3 h-3 border-r border-b border-jade-malachite/30" />

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2.9 }}
                className="mb-8"
              >
                <h4 className="text-xl font-extralight text-jade-jade mb-4 tracking-[0.3em] uppercase">
                  Neural Interface Crystallization
                </h4>
                <motion.div
                  animate={{
                    scaleX: [0.7, 1.3, 0.7],
                    opacity: [0.3, 0.8, 0.3]
                  }}
                  transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                  className="w-20 h-px bg-gradient-to-r from-jade-malachite via-jade-jade to-jade-copper"
                />
              </motion.div>

              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={metrics.browserData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(115, 155, 127, 0.1)" />
                  <XAxis
                    dataKey="browser"
                    stroke="rgba(151, 187, 163, 0.6)"
                    tick={{ fontSize: 10, fill: "rgba(151, 187, 163, 0.6)" }}
                  />
                  <YAxis stroke="rgba(151, 187, 163, 0.6)" tick={{ fontSize: 10, fill: "rgba(151, 187, 163, 0.6)" }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="success" fill="#739B7F" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="failure" fill="#618B6E" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </motion.div>

        {/* Crystalline Consciousness Intelligence Matrix */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 3.0 }}
          className="mt-20 relative"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-jade-bronze/8 via-jade-copper/4 to-jade-gold/6 rounded-2xl blur-2xl" />

          <div className="relative bg-jade-shadow/40 border border-jade-forest/20 rounded-xl p-12 backdrop-blur-md">
            <div className="absolute top-4 left-4 w-4 h-4 border-l border-t border-jade-forest/30" />
            <div className="absolute top-4 right-4 w-4 h-4 border-r border-t border-jade-forest/30" />
            <div className="absolute bottom-4 left-4 w-4 h-4 border-l border-b border-jade-forest/30" />
            <div className="absolute bottom-4 right-4 w-4 h-4 border-r border-b border-jade-forest/30" />

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 3.2, duration: 0.8 }}
              className="text-center mb-12"
            >
              <div className="flex items-center justify-center gap-8 mb-6">
                <div className="w-12 h-px bg-gradient-to-r from-transparent via-jade-forest/50 to-jade-sage/30" />
                <h3 className="text-2xl font-extralight text-jade-jade tracking-[0.3em] uppercase">
                  Neural Synchronization Intelligence
                </h3>
                <div className="w-12 h-px bg-gradient-to-l from-transparent via-jade-forest/50 to-jade-sage/30" />
              </div>
              <motion.div
                animate={{
                  scaleX: [0.6, 1.4, 0.6],
                  opacity: [0.3, 0.8, 0.3]
                }}
                transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
                className="w-32 h-px bg-gradient-to-r from-jade-forest via-jade-sage to-jade-malachite mx-auto"
              />
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 3.4 }}
                className="text-center group"
              >
                <motion.div
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.6, 1, 0.6]
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="w-4 h-4 bg-jade-sage rounded-full mx-auto mb-6 relative"
                >
                  <div className="absolute inset-0 bg-jade-sage/40 rounded-full animate-ping" />
                </motion.div>
                <p className="text-lg font-extralight text-jade-jade mb-4 tracking-wide leading-relaxed">
                  Crystallization Efficiency:{' '}
                  <motion.span
                    animate={{ color: ['#A8CBB4', '#739B7F', '#A8CBB4'] }}
                    transition={{ duration: 4, repeat: Infinity }}
                    className="text-jade-jade font-light"
                  >
                    {metrics.successRate.toFixed(1)}%
                  </motion.span>
                </p>
                <p className="text-sm text-jade-mineral/80 font-light tracking-wide">
                  {metrics.successRate > 80 ? 'Optimal neural crystalline resonance' : 'Sonic recalibration protocols engaging'}
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 3.6 }}
                className="text-center group"
              >
                <motion.div
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.6, 1, 0.6]
                  }}
                  transition={{ duration: 3.5, repeat: Infinity, delay: 1 }}
                  className="w-4 h-4 bg-jade-malachite rounded-full mx-auto mb-6 relative"
                >
                  <div className="absolute inset-0 bg-jade-malachite/40 rounded-full animate-ping" />
                </motion.div>
                <p className="text-lg font-extralight text-jade-jade mb-4 tracking-wide leading-relaxed">
                  Primary Neural Gateway:{' '}
                  <motion.span
                    animate={{ color: ['#739B7F', '#85AB91', '#739B7F'] }}
                    transition={{ duration: 5, repeat: Infinity }}
                    className="text-jade-malachite font-light"
                  >
                    {metrics.browserData[0]?.browser || 'Unknown'}
                  </motion.span>
                </p>
                <p className="text-sm text-jade-mineral/80 font-light tracking-wide">
                  Optimal consciousness interface harmonization
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 3.8 }}
                className="text-center group"
              >
                <motion.div
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.6, 1, 0.6]
                  }}
                  transition={{ duration: 4, repeat: Infinity, delay: 2 }}
                  className="w-4 h-4 bg-jade-forest rounded-full mx-auto mb-6 relative"
                >
                  <div className="absolute inset-0 bg-jade-forest/40 rounded-full animate-ping" />
                </motion.div>
                <p className="text-lg font-extralight text-jade-jade mb-4 tracking-wide leading-relaxed">
                  Mobile Consciousness Flow:{' '}
                  <motion.span
                    animate={{ color: ['#4F7B5C', '#618B6E', '#4F7B5C'] }}
                    transition={{ duration: 6, repeat: Infinity }}
                    className="text-jade-forest font-light"
                  >
                    {((metrics.deviceBreakdown.mobile / metrics.totalAttempts) * 100).toFixed(0)}%
                  </motion.span>
                </p>
                <p className="text-sm text-jade-mineral/80 font-light tracking-wide">
                  Portable neural crystalline accessibility matrix
                </p>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}