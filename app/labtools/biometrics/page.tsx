'use client';

/**
 * Biometrics Dashboard
 *
 * Visualizes coherence, HRV, circadian rhythm, and elemental balance
 * from the existing biometrics backend.
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Heart,
  Activity,
  Sun,
  Moon,
  Zap,
  Waves,
  Mountain,
  Wind,
  Flame,
  TrendingUp,
  TrendingDown,
  Minus,
  Clock,
  RefreshCw
} from 'lucide-react';

interface CoherenceState {
  level: 'low' | 'medium' | 'high' | 'peak';
  score: number;
  trend: 'rising' | 'stable' | 'falling';
  description: string;
}

interface ElementalBalance {
  fire: number;
  water: number;
  earth: number;
  air: number;
  aether: number;
}

interface CircadianPhase {
  phase: 'morning' | 'midday' | 'afternoon' | 'evening' | 'night' | 'deep_night';
  energy: number;
  recommendation: string;
}

export default function BiometricsPage() {
  const router = useRouter();
  const [coherence, setCoherence] = useState<CoherenceState>({
    level: 'medium',
    score: 65,
    trend: 'stable',
    description: 'Your coherence is balanced. Continue with mindful awareness.'
  });
  const [elementalBalance, setElementalBalance] = useState<ElementalBalance>({
    fire: 60,
    water: 70,
    earth: 55,
    air: 75,
    aether: 50
  });
  const [circadian, setCircadian] = useState<CircadianPhase>({
    phase: 'morning',
    energy: 70,
    recommendation: 'Optimal time for focused work and creative expression.'
  });
  const [heartRate, setHeartRate] = useState(72);
  const [hrv, setHrv] = useState(45);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [isSimulating, setIsSimulating] = useState(false);

  useEffect(() => {
    // Determine circadian phase based on time
    const hour = new Date().getHours();
    let phase: CircadianPhase['phase'] = 'morning';
    let energy = 70;
    let recommendation = '';

    if (hour >= 5 && hour < 9) {
      phase = 'morning';
      energy = 75;
      recommendation = 'Rising energy. Excellent for meditation and intention setting.';
    } else if (hour >= 9 && hour < 12) {
      phase = 'midday';
      energy = 90;
      recommendation = 'Peak cognitive performance. Ideal for focused work.';
    } else if (hour >= 12 && hour < 15) {
      phase = 'afternoon';
      energy = 70;
      recommendation = 'Post-lunch dip. Light movement or rest supports integration.';
    } else if (hour >= 15 && hour < 18) {
      phase = 'afternoon';
      energy = 80;
      recommendation = 'Second wind. Good for creative work and collaboration.';
    } else if (hour >= 18 && hour < 21) {
      phase = 'evening';
      energy = 60;
      recommendation = 'Winding down. Favor reflection and gentle activities.';
    } else if (hour >= 21 || hour < 1) {
      phase = 'night';
      energy = 40;
      recommendation = 'Prepare for rest. Avoid screens, embrace stillness.';
    } else {
      phase = 'deep_night';
      energy = 20;
      recommendation = 'Deep rest time. Honor your body\'s need for regeneration.';
    }

    setCircadian({ phase, energy, recommendation });
  }, []);

  const simulateReading = () => {
    setIsSimulating(true);

    // Simulate coherence changes
    const newScore = Math.min(100, Math.max(0, coherence.score + (Math.random() * 20 - 10)));
    const newLevel = newScore < 40 ? 'low' : newScore < 60 ? 'medium' : newScore < 80 ? 'high' : 'peak';
    const newTrend = newScore > coherence.score ? 'rising' : newScore < coherence.score ? 'falling' : 'stable';

    setCoherence({
      level: newLevel,
      score: Math.round(newScore),
      trend: newTrend,
      description: getCoherenceDescription(newLevel, newTrend)
    });

    // Simulate elemental changes
    setElementalBalance({
      fire: Math.round(Math.min(100, Math.max(0, elementalBalance.fire + (Math.random() * 10 - 5)))),
      water: Math.round(Math.min(100, Math.max(0, elementalBalance.water + (Math.random() * 10 - 5)))),
      earth: Math.round(Math.min(100, Math.max(0, elementalBalance.earth + (Math.random() * 10 - 5)))),
      air: Math.round(Math.min(100, Math.max(0, elementalBalance.air + (Math.random() * 10 - 5)))),
      aether: Math.round(Math.min(100, Math.max(0, elementalBalance.aether + (Math.random() * 10 - 5))))
    });

    // Simulate vitals
    setHeartRate(Math.round(60 + Math.random() * 30));
    setHrv(Math.round(30 + Math.random() * 40));
    setLastUpdated(new Date());

    setTimeout(() => setIsSimulating(false), 1000);
  };

  const getCoherenceDescription = (level: string, trend: string): string => {
    const descriptions: Record<string, Record<string, string>> = {
      low: {
        rising: 'Coherence is building. Continue your centering practice.',
        stable: 'Take a moment to breathe deeply and ground yourself.',
        falling: 'Consider a brief pause. Gentle breathing can help restore balance.'
      },
      medium: {
        rising: 'Good progress! Your coherence is strengthening.',
        stable: 'Balanced state maintained. Awareness is clear.',
        falling: 'Slight decrease noted. A moment of stillness may help.'
      },
      high: {
        rising: 'Excellent coherence! Approaching peak state.',
        stable: 'Strong coherence maintained. Ideal for deep work.',
        falling: 'Still in high coherence. Minor fluctuations are natural.'
      },
      peak: {
        rising: 'Peak coherence achieved! Optimal state for insight.',
        stable: 'Sustaining peak coherence. Remarkable presence.',
        falling: 'Transitioning from peak. This is a natural cycle.'
      }
    };
    return descriptions[level]?.[trend] || 'Monitoring your coherence state.';
  };

  const coherenceColor = {
    low: 'text-red-400',
    medium: 'text-yellow-400',
    high: 'text-emerald-400',
    peak: 'text-purple-400'
  };

  const trendIcon = {
    rising: <TrendingUp className="w-4 h-4 text-emerald-400" />,
    stable: <Minus className="w-4 h-4 text-slate-400" />,
    falling: <TrendingDown className="w-4 h-4 text-red-400" />
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-cyan-950 to-slate-950 relative overflow-hidden">
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div
          className="absolute top-1/3 right-1/4 w-[400px] h-[400px] rounded-full opacity-20"
          style={{
            background: 'radial-gradient(circle, rgba(34, 211, 238, 0.2) 0%, transparent 70%)',
            filter: 'blur(60px)',
          }}
        />
      </div>

      <div className="relative z-10 min-h-screen">
        {/* Header */}
        <div className="p-4 flex items-center justify-between border-b border-white/10 backdrop-blur-sm">
          <button
            onClick={() => router.push('/labtools')}
            className="flex items-center gap-2 text-slate-400 hover:text-slate-300 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm">Back to Labs</span>
          </button>

          <div className="flex items-center gap-4">
            <span className="text-slate-500 text-xs">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </span>
            <button
              onClick={simulateReading}
              disabled={isSimulating}
              className="flex items-center gap-2 px-3 py-1.5 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/30 rounded-lg text-cyan-400 text-sm transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isSimulating ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        <div className="p-6 max-w-6xl mx-auto">
          <h1 className="text-2xl font-light text-white mb-8 flex items-center gap-3">
            <Activity className="w-7 h-7 text-cyan-400" />
            Biometrics Dashboard
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Coherence Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="col-span-1 md:col-span-2 lg:col-span-1 p-6 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium text-white flex items-center gap-2">
                  <Zap className="w-5 h-5 text-cyan-400" />
                  Coherence
                </h2>
                {trendIcon[coherence.trend]}
              </div>

              <div className="text-center mb-4">
                <motion.div
                  key={coherence.score}
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  className={`text-5xl font-light ${coherenceColor[coherence.level]}`}
                >
                  {coherence.score}
                </motion.div>
                <div className={`text-sm ${coherenceColor[coherence.level]} capitalize`}>
                  {coherence.level} Coherence
                </div>
              </div>

              {/* Coherence bar */}
              <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden mb-4">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${coherence.score}%` }}
                  transition={{ duration: 0.5 }}
                  className={`h-full rounded-full ${
                    coherence.level === 'low' ? 'bg-red-500' :
                    coherence.level === 'medium' ? 'bg-yellow-500' :
                    coherence.level === 'high' ? 'bg-emerald-500' : 'bg-purple-500'
                  }`}
                />
              </div>

              <p className="text-slate-400 text-sm">{coherence.description}</p>
            </motion.div>

            {/* Vitals Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="p-6 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl"
            >
              <h2 className="text-lg font-medium text-white flex items-center gap-2 mb-6">
                <Heart className="w-5 h-5 text-rose-400" />
                Vitals
              </h2>

              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-slate-400 text-sm">Heart Rate</span>
                    <span className="text-rose-400 font-medium">{heartRate} BPM</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${((heartRate - 40) / 80) * 100}%` }}
                      className="h-full bg-rose-500 rounded-full"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-slate-400 text-sm">HRV (ms)</span>
                    <span className="text-cyan-400 font-medium">{hrv} ms</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(hrv / 100) * 100}%` }}
                      className="h-full bg-cyan-500 rounded-full"
                    />
                  </div>
                  <p className="text-slate-500 text-xs mt-1">Higher HRV indicates better recovery</p>
                </div>
              </div>
            </motion.div>

            {/* Circadian Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="p-6 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl"
            >
              <h2 className="text-lg font-medium text-white flex items-center gap-2 mb-6">
                <Clock className="w-5 h-5 text-amber-400" />
                Circadian Phase
              </h2>

              <div className="flex items-center gap-4 mb-4">
                {circadian.phase.includes('night') ? (
                  <Moon className="w-10 h-10 text-indigo-400" />
                ) : (
                  <Sun className="w-10 h-10 text-amber-400" />
                )}
                <div>
                  <div className="text-white font-medium capitalize">
                    {circadian.phase.replace('_', ' ')}
                  </div>
                  <div className="text-slate-400 text-sm">Energy: {circadian.energy}%</div>
                </div>
              </div>

              <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden mb-4">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${circadian.energy}%` }}
                  className="h-full bg-amber-500 rounded-full"
                />
              </div>

              <p className="text-slate-400 text-sm">{circadian.recommendation}</p>
            </motion.div>

            {/* Elemental Balance Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="col-span-1 md:col-span-2 lg:col-span-3 p-6 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl"
            >
              <h2 className="text-lg font-medium text-white flex items-center gap-2 mb-6">
                <Waves className="w-5 h-5 text-blue-400" />
                Elemental Coherence
              </h2>

              <div className="grid grid-cols-5 gap-6">
                {[
                  { element: 'Fire', value: elementalBalance.fire, icon: Flame, color: 'text-orange-400', bg: 'bg-orange-500' },
                  { element: 'Water', value: elementalBalance.water, icon: Waves, color: 'text-blue-400', bg: 'bg-blue-500' },
                  { element: 'Earth', value: elementalBalance.earth, icon: Mountain, color: 'text-emerald-400', bg: 'bg-emerald-500' },
                  { element: 'Air', value: elementalBalance.air, icon: Wind, color: 'text-cyan-400', bg: 'bg-cyan-500' },
                  { element: 'Aether', value: elementalBalance.aether, icon: Zap, color: 'text-purple-400', bg: 'bg-purple-500' },
                ].map((el) => (
                  <div key={el.element} className="text-center">
                    <el.icon className={`w-6 h-6 ${el.color} mx-auto mb-2`} />
                    <div className="text-white font-medium mb-1">{el.value}%</div>
                    <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden mb-1">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${el.value}%` }}
                        className={`h-full ${el.bg} rounded-full`}
                      />
                    </div>
                    <div className="text-slate-400 text-xs">{el.element}</div>
                  </div>
                ))}
              </div>

              <p className="text-slate-500 text-xs mt-6 text-center">
                Elemental balance reflects the harmony of your consciousness qualities.
                Meditation and breathwork can help balance deficient elements.
              </p>
            </motion.div>
          </div>

          {/* HealthKit Notice */}
          <div className="mt-8 p-4 bg-cyan-500/10 border border-cyan-500/20 rounded-xl">
            <p className="text-cyan-300 text-sm text-center">
              For real-time biometrics, connect Apple HealthKit on iOS.
              Currently showing simulated data for demonstration.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
