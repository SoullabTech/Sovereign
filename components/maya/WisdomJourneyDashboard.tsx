'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, TrendingUp, Heart, Zap, Flame, Droplet, Mountain, Wind } from 'lucide-react';
import { Holoflower } from '@/components/ui/Holoflower';

/**
 * Wisdom Journey Dashboard - Shows beta testers their emerging patterns
 *
 * This is the I-Thou made visible - showing them what MAIA sees:
 * - Their phase: Seeker → Discoverer → Wisdom Keeper
 * - Wisdom moments captured
 * - Elemental patterns emerging
 * - Readiness to share their teaching
 */

interface WisdomJourneyState {
  phase: 'seeker' | 'discoverer' | 'wisdom-keeper';
  wisdomMomentCount: number;
  readinessScore: number;
  emergingPatterns: string[];
}

interface WisdomMoment {
  timestamp: string;
  snippet: string;
  elementalSignature: string;
  recognizedPattern: string;
}

const ELEMENT_ICONS = {
  fire: Flame,
  water: Droplet,
  earth: Mountain,
  air: Wind
};

const ELEMENT_COLORS = {
  fire: 'bg-stone-900/50 border-stone-700',
  water: 'bg-stone-900/50 border-stone-700',
  earth: 'bg-stone-900/50 border-stone-700',
  air: 'bg-stone-900/50 border-stone-700'
};

const PHASE_INFO = {
  'seeker': {
    title: 'Seeker',
    description: 'Exploring the maps, discovering your patterns',
    color: 'text-stone-400',
    gradient: 'bg-stone-900/50'
  },
  'discoverer': {
    title: 'Discoverer',
    description: 'Recognizing your wisdom, seeing your gold',
    color: 'text-stone-300',
    gradient: 'bg-stone-900/50'
  },
  'wisdom-keeper': {
    title: 'Wisdom Keeper',
    description: 'Your journey is teaching, ready to share',
    color: 'text-amber-700',
    gradient: 'bg-stone-900/50'
  }
};

export function WisdomJourneyDashboard({
  userId,
  compact = false
}: {
  userId: string;
  compact?: boolean;
}) {
  const [journeyState, setJourneyState] = useState<WisdomJourneyState | null>(null);
  const [wisdomMoments, setWisdomMoments] = useState<WisdomMoment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAllMoments, setShowAllMoments] = useState(false);

  useEffect(() => {
    loadWisdomJourney();
  }, [userId]);

  const loadWisdomJourney = async () => {
    try {
      // For now, create mock data structure
      // TODO: Replace with actual API call when backend endpoint ready
      const mockState: WisdomJourneyState = {
        phase: 'seeker',
        wisdomMomentCount: 0,
        readinessScore: 0,
        emergingPatterns: []
      };

      setJourneyState(mockState);
      setWisdomMoments([]);
      setIsLoading(false);
    } catch (error) {
      console.error('Failed to load wisdom journey:', error);
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  if (!journeyState) {
    return null;
  }

  const phaseInfo = PHASE_INFO[journeyState.phase];
  const readinessPercent = Math.round(journeyState.readinessScore * 100);

  if (compact) {
    // Compact view - just show phase and moment count
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-4"
      >
        <div className={`bg-gradient-to-r ${phaseInfo.gradient} border border-white/10 rounded-xl p-4`}>
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className={`w-4 h-4 ${phaseInfo.color}`} />
                <span className={`text-sm font-medium ${phaseInfo.color}`}>
                  {phaseInfo.title}
                </span>
              </div>
              <p className="text-xs text-stone-400">
                {journeyState.wisdomMomentCount} wisdom moments captured
              </p>
            </div>
            {journeyState.wisdomMomentCount > 0 && (
              <div className="text-right">
                <div className="text-xs text-stone-500 mb-1">Readiness</div>
                <div className={`text-lg font-bold ${phaseInfo.color}`}>
                  {readinessPercent}%
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    );
  }

  // Full dashboard view
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Phase Card - Utilitarian */}
      <div className="border border-stone-800 rounded-lg p-4">
        <div className="mb-3">
          <h3 className="text-sm font-medium text-stone-300 mb-1">
            Current Phase: {phaseInfo.title}
          </h3>
          <p className="text-xs text-stone-500">
            {phaseInfo.description}
          </p>
        </div>

        {/* Simple Stats */}
        <div className="flex gap-6 text-xs">
          <div>
            <span className="text-stone-500">Conversations:</span>
            <span className="text-stone-300 ml-1">{journeyState.wisdomMomentCount}</span>
          </div>
          <div>
            <span className="text-stone-500">Patterns:</span>
            <span className="text-stone-300 ml-1">{journeyState.emergingPatterns.length}</span>
          </div>
          <div>
            <span className="text-stone-500">Readiness:</span>
            <span className="text-stone-300 ml-1">{readinessPercent}%</span>
          </div>
        </div>
      </div>

      {/* Emerging Patterns */}
      {journeyState.emergingPatterns.length > 0 && (
        <div className="bg-black/40 border border-white/10 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-green-400" />
            <h3 className="text-lg font-semibold text-white">
              Your Emerging Patterns
            </h3>
          </div>
          <div className="space-y-2">
            {journeyState.emergingPatterns.map((pattern, idx) => {
              const element = pattern.toLowerCase().includes('fire') ? 'fire' :
                            pattern.toLowerCase().includes('water') ? 'water' :
                            pattern.toLowerCase().includes('earth') ? 'earth' :
                            pattern.toLowerCase().includes('air') ? 'air' : 'fire';

              const Icon = ELEMENT_ICONS[element];

              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className={`bg-gradient-to-r ${ELEMENT_COLORS[element]} rounded-lg p-4 border`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-5 h-5 text-white" />
                    <span className="text-white font-medium">{pattern}</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* Wisdom Moments */}
      {wisdomMoments.length > 0 && (
        <div className="bg-black/40 border border-white/10 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-pink-400" />
              <h3 className="text-lg font-semibold text-white">
                Wisdom Moments
              </h3>
            </div>
            {wisdomMoments.length > 3 && (
              <button
                onClick={() => setShowAllMoments(!showAllMoments)}
                className="text-sm text-amber-400 hover:text-amber-300 transition-colors"
              >
                {showAllMoments ? 'Show less' : `Show all ${wisdomMoments.length}`}
              </button>
            )}
          </div>

          <div className="space-y-3">
            <AnimatePresence>
              {(showAllMoments ? wisdomMoments : wisdomMoments.slice(0, 3)).map((moment, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-black/30 border border-white/5 rounded-lg p-4"
                >
                  <div className="flex items-start gap-3">
                    <Zap className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-1" />
                    <div className="flex-1">
                      <p className="text-stone-300 text-sm mb-2">
                        "{moment.snippet}"
                      </p>
                      <div className="flex items-center gap-3 text-xs">
                        <span className="text-stone-500">
                          {new Date(moment.timestamp).toLocaleDateString()}
                        </span>
                        <span className="text-amber-400">
                          {moment.elementalSignature}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Empty State - First time */}
      {journeyState.wisdomMomentCount === 0 && (
        <div className="border border-stone-800 rounded-lg p-6 text-center">
          <div className="mb-4 flex justify-center">
            <Holoflower size="md" glowIntensity="low" />
          </div>
          <h3 className="text-sm font-medium text-stone-300 mb-2">
            Your Wisdom Journey Begins
          </h3>
          <p className="text-xs text-stone-500 max-w-md mx-auto">
            As you share your story with MAIA, she'll recognize patterns and wisdom emerging.
            Your moments will be captured here - your teaching voice taking form.
          </p>
        </div>
      )}
    </motion.div>
  );
}
