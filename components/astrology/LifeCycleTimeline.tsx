'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface LifeCycleMarker {
  name: string;
  type: string;
  body: string;
  date: string;
  age: number;
  yearsAway: number;
  isActive: boolean;
  description: string;
}

interface LifeCycleData {
  birthDate: string;
  currentAge: number;
  ageDecimal: number;
  consciousness: {
    structure: string;
    symbol: string;
    description: string;
  };
  saturnCycle: {
    currentCycle: number;
    progress: number;
    nextReturn: {
      date: string;
      age: number;
      yearsAway: number;
      isActive: boolean;
      description: string;
    } | null;
  };
  uranusOpposition: {
    date: string;
    age: number;
    progress: number;
    isActive: boolean;
  };
  chironReturn: {
    date: string;
    age: number;
    progress: number;
  };
  upcomingMarkers: LifeCycleMarker[];
  insight: string;
}

interface Props {
  birthDate?: string;
  birthChart?: {
    saturn: { sign: string; degree: number };
    jupiter: { sign: string; degree: number };
    uranus: { sign: string; degree: number };
    chiron?: { sign: string; degree: number };
    northNode?: { sign: string; degree: number };
  };
  compact?: boolean;
}

const STRUCTURE_SYMBOLS: Record<string, string> = {
  point: '•',
  circle: '◯',
  triangle: '△',
  square: '◻',
  sphere: '◉',
  origin: '∞',
};

const BODY_COLORS: Record<string, string> = {
  Saturn: '#94a3b8',      // slate
  Jupiter: '#fbbf24',     // amber
  Uranus: '#06b6d4',      // cyan
  Chiron: '#a855f7',      // purple
  'North Node': '#f472b6', // pink
};

export default function LifeCycleTimeline({ birthDate, birthChart, compact = false }: Props) {
  const [data, setData] = useState<LifeCycleData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMarker, setSelectedMarker] = useState<LifeCycleMarker | null>(null);

  useEffect(() => {
    if (!birthDate) {
      setLoading(false);
      return;
    }

    async function fetchLifeCycles() {
      try {
        setLoading(true);

        let response;
        if (birthChart) {
          response = await fetch('/api/astrology/life-cycles', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ birthDate, birthChart }),
          });
        } else {
          response = await fetch(`/api/astrology/life-cycles?birthDate=${birthDate}`);
        }

        const result = await response.json();

        if (!result.success) {
          throw new Error(result.error || 'Failed to fetch life cycles');
        }

        setData(result.data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }

    fetchLifeCycles();
  }, [birthDate, birthChart]);

  if (!birthDate) {
    return (
      <div className="bg-white/5 rounded-xl p-6 text-center">
        <p className="text-white/50 text-sm">Enter birth date to see life cycles</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-white/5 rounded-xl p-6">
        <div className="animate-pulse flex items-center justify-center gap-2">
          <div className="w-2 h-2 bg-amber-500/50 rounded-full" />
          <div className="w-2 h-2 bg-amber-500/50 rounded-full animation-delay-200" />
          <div className="w-2 h-2 bg-amber-500/50 rounded-full animation-delay-400" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
        <p className="text-red-400 text-sm">{error}</p>
      </div>
    );
  }

  if (!data) return null;

  if (compact) {
    return (
      <div className="bg-gradient-to-br from-white/5 to-white/[0.02] rounded-xl p-4 border border-white/10">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-white/70">Life Cycles</h3>
          <span className="text-xs text-white/40">Age {data.currentAge}</span>
        </div>

        {/* Saturn Progress Bar */}
        <div className="mb-3">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-white/50">Saturn Cycle {data.saturnCycle.currentCycle}</span>
            <span className="text-amber-400/70">{data.saturnCycle.progress.toFixed(0)}%</span>
          </div>
          <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-amber-500/50 to-amber-400"
              initial={{ width: 0 }}
              animate={{ width: `${data.saturnCycle.progress}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />
          </div>
        </div>

        {/* Consciousness Structure */}
        <div className="flex items-center gap-2 p-2 bg-white/5 rounded-lg">
          <span className="text-xl">{STRUCTURE_SYMBOLS[data.consciousness.symbol] || '?'}</span>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-white/80">{data.consciousness.structure}</p>
            <p className="text-xs text-white/40 truncate">{data.consciousness.description}</p>
          </div>
        </div>

        {/* Next Major Event */}
        {data.upcomingMarkers[0] && (
          <div className="mt-3 pt-3 border-t border-white/10">
            <p className="text-xs text-white/40 mb-1">Next:</p>
            <div className="flex items-center gap-2">
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: BODY_COLORS[data.upcomingMarkers[0].body] || '#888' }}
              />
              <span className="text-sm text-white/80">{data.upcomingMarkers[0].name}</span>
              <span className="text-xs text-white/40 ml-auto">
                {data.upcomingMarkers[0].yearsAway.toFixed(1)}y
              </span>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Full view
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white/90">Life Cycles</h2>
          <p className="text-sm text-white/50">
            Age {data.currentAge} ({data.ageDecimal.toFixed(1)} years)
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-white/70">Saturn Cycle {data.saturnCycle.currentCycle}</p>
          <p className="text-xs text-white/40">{data.saturnCycle.progress.toFixed(1)}% complete</p>
        </div>
      </div>

      {/* Consciousness Structure Card */}
      <motion.div
        className="bg-gradient-to-br from-purple-500/10 to-indigo-500/10 rounded-xl p-5 border border-purple-500/20"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-start gap-4">
          <div className="text-4xl text-purple-400">
            {STRUCTURE_SYMBOLS[data.consciousness.symbol] || '?'}
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-medium text-white/90 mb-1">
              {data.consciousness.structure} Consciousness
            </h3>
            <p className="text-sm text-white/60">{data.consciousness.description}</p>
          </div>
        </div>
      </motion.div>

      {/* Saturn Return Progress */}
      <div className="bg-white/5 rounded-xl p-5 border border-white/10">
        <h3 className="text-sm font-medium text-white/70 mb-4">Saturn Return Progress</h3>

        <div className="relative h-3 bg-white/10 rounded-full overflow-hidden mb-4">
          <motion.div
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-slate-500 to-amber-500"
            initial={{ width: 0 }}
            animate={{ width: `${data.saturnCycle.progress}%` }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
          />
          <div
            className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg"
            style={{ left: `${data.saturnCycle.progress}%`, marginLeft: '-6px' }}
          />
        </div>

        <div className="flex justify-between text-xs text-white/40">
          <span>0 years</span>
          <span>~29.5 years</span>
        </div>

        {data.saturnCycle.nextReturn && (
          <div className="mt-4 p-3 bg-white/5 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-slate-400" />
              <span className="text-sm font-medium text-white/80">
                Next Saturn Return
              </span>
              {data.saturnCycle.nextReturn.isActive && (
                <span className="px-2 py-0.5 text-xs bg-amber-500/20 text-amber-400 rounded-full">
                  Active
                </span>
              )}
            </div>
            <p className="text-xs text-white/50 mb-1">
              Age {data.saturnCycle.nextReturn.age.toFixed(1)} • {data.saturnCycle.nextReturn.yearsAway.toFixed(1)} years away
            </p>
            <p className="text-sm text-white/60">{data.saturnCycle.nextReturn.description}</p>
          </div>
        )}
      </div>

      {/* Major Life Cycles Grid */}
      <div className="grid grid-cols-2 gap-4">
        {/* Uranus Opposition */}
        <div className="bg-gradient-to-br from-cyan-500/10 to-cyan-500/5 rounded-xl p-4 border border-cyan-500/20">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            <span className="text-sm font-medium text-white/80">Uranus Opposition</span>
          </div>
          <p className="text-2xl font-light text-cyan-400 mb-1">~{data.uranusOpposition.age.toFixed(0)}</p>
          <p className="text-xs text-white/40">years old</p>
          <div className="mt-2 h-1 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-cyan-400/50"
              style={{ width: `${Math.min(data.uranusOpposition.progress, 100)}%` }}
            />
          </div>
          {data.uranusOpposition.isActive && (
            <p className="mt-2 text-xs text-cyan-400">Currently active!</p>
          )}
        </div>

        {/* Chiron Return */}
        <div className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 rounded-xl p-4 border border-purple-500/20">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-purple-400" />
            <span className="text-sm font-medium text-white/80">Chiron Return</span>
          </div>
          <p className="text-2xl font-light text-purple-400 mb-1">~{data.chironReturn.age.toFixed(0)}</p>
          <p className="text-xs text-white/40">years old</p>
          <div className="mt-2 h-1 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-purple-400/50"
              style={{ width: `${Math.min(data.chironReturn.progress, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Upcoming Markers Timeline */}
      <div className="bg-white/5 rounded-xl p-5 border border-white/10">
        <h3 className="text-sm font-medium text-white/70 mb-4">Upcoming Life Markers</h3>

        <div className="space-y-3">
          {data.upcomingMarkers.map((marker, index) => (
            <motion.div
              key={marker.name}
              className={`p-3 rounded-lg cursor-pointer transition-colors ${
                selectedMarker?.name === marker.name
                  ? 'bg-white/10 border border-white/20'
                  : 'bg-white/5 hover:bg-white/8'
              }`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => setSelectedMarker(selectedMarker?.name === marker.name ? null : marker)}
            >
              <div className="flex items-center gap-3">
                <span
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: BODY_COLORS[marker.body] || '#888' }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-white/80">{marker.name}</span>
                    {marker.isActive && (
                      <span className="px-1.5 py-0.5 text-xs bg-amber-500/20 text-amber-400 rounded">
                        Active
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-white/40">
                    Age {marker.age.toFixed(1)} • {marker.yearsAway.toFixed(1)} years
                  </p>
                </div>
                <span className="text-xs text-white/30 font-mono">{marker.date}</span>
              </div>

              <AnimatePresence>
                {selectedMarker?.name === marker.name && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <p className="mt-3 pt-3 border-t border-white/10 text-sm text-white/60">
                      {marker.description}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Insight */}
      {data.insight && (
        <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-xl p-5 border border-amber-500/20">
          <h3 className="text-sm font-medium text-amber-400/80 mb-3">Current Phase Insight</h3>
          <div className="space-y-3">
            {data.insight.split('\n\n').map((paragraph, i) => (
              <p key={i} className="text-sm text-white/60 leading-relaxed">
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
