'use client';

/**
 * Archetype Explorer Cards
 *
 * Interactive cards showing user's active archetypes with descriptions.
 * Displays zodiac archetypes based on birth chart placements.
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Droplet, Sprout, Wind, Sparkles, ChevronDown, ChevronUp, Users, BookOpen, Lightbulb } from 'lucide-react';
import {
  getZodiacArchetype,
  ArchetypalCorrelation,
  ZODIAC_ARCHETYPES,
} from '@/lib/astrology/archetypeLibrary';

// ═══════════════════════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════════════════════

interface ActiveArchetype {
  source: string; // 'sun', 'moon', 'ascendant', 'mercury', etc.
  sign: string;
  correlation: ArchetypalCorrelation;
  strength?: number; // 0-1 based on house placement, aspects, etc.
}

interface ArchetypeExplorerCardsProps {
  /** Birth chart placements - each with sign */
  placements?: {
    sun?: { sign: string; house?: number };
    moon?: { sign: string; house?: number };
    ascendant?: { sign: string };
    mercury?: { sign: string; house?: number };
    venus?: { sign: string; house?: number };
    mars?: { sign: string; house?: number };
  };
  /** If no placements, show example data */
  showExamples?: boolean;
  /** Compact mode for dashboard widgets */
  compact?: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════════
// Constants
// ═══════════════════════════════════════════════════════════════════════════════

const ELEMENT_ICONS = {
  fire: Flame,
  water: Droplet,
  earth: Sprout,
  air: Wind,
  aether: Sparkles,
};

const ELEMENT_COLORS = {
  fire: {
    bg: 'from-orange-500/20 to-red-500/10',
    border: 'border-orange-500/30',
    text: 'text-orange-400',
    icon: 'text-orange-500',
  },
  water: {
    bg: 'from-blue-500/20 to-cyan-500/10',
    border: 'border-blue-500/30',
    text: 'text-blue-400',
    icon: 'text-blue-500',
  },
  earth: {
    bg: 'from-green-500/20 to-emerald-500/10',
    border: 'border-green-500/30',
    text: 'text-green-400',
    icon: 'text-green-500',
  },
  air: {
    bg: 'from-purple-500/20 to-violet-500/10',
    border: 'border-purple-500/30',
    text: 'text-purple-400',
    icon: 'text-purple-500',
  },
  aether: {
    bg: 'from-amber-500/20 to-yellow-500/10',
    border: 'border-amber-500/30',
    text: 'text-amber-400',
    icon: 'text-amber-500',
  },
};

const SOURCE_LABELS: Record<string, string> = {
  sun: 'Core Identity',
  moon: 'Emotional Self',
  ascendant: 'First Impression',
  mercury: 'Communication',
  venus: 'Values & Love',
  mars: 'Drive & Action',
};

// ═══════════════════════════════════════════════════════════════════════════════
// Component
// ═══════════════════════════════════════════════════════════════════════════════

export default function ArchetypeExplorerCards({
  placements,
  showExamples = false,
  compact = false,
}: ArchetypeExplorerCardsProps) {
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  // Build active archetypes from placements
  const archetypes: ActiveArchetype[] = [];

  if (placements) {
    for (const [source, placement] of Object.entries(placements)) {
      if (placement?.sign) {
        const correlation = getZodiacArchetype(placement.sign);
        if (correlation) {
          const house = 'house' in placement ? placement.house : undefined;
          archetypes.push({
            source,
            sign: placement.sign,
            correlation,
            strength: house
              ? calculateStrength(source, house)
              : 0.7,
          });
        }
      }
    }
  } else if (showExamples) {
    // Show example archetypes
    archetypes.push(
      {
        source: 'sun',
        sign: 'Sagittarius',
        correlation: ZODIAC_ARCHETYPES.sagittarius,
        strength: 0.9,
      },
      {
        source: 'moon',
        sign: 'Pisces',
        correlation: ZODIAC_ARCHETYPES.pisces,
        strength: 0.85,
      },
      {
        source: 'ascendant',
        sign: 'Leo',
        correlation: ZODIAC_ARCHETYPES.leo,
        strength: 0.8,
      }
    );
  }

  if (archetypes.length === 0) {
    return (
      <div className="bg-white/5 rounded-xl p-6 text-center">
        <Sparkles className="w-8 h-8 text-amber-400/50 mx-auto mb-3" />
        <p className="text-white/50 text-sm">
          Add your birth chart to explore your archetypes
        </p>
      </div>
    );
  }

  if (compact) {
    return (
      <div className="space-y-2">
        {archetypes.slice(0, 3).map((arch) => (
          <CompactArchetypeCard key={arch.source} archetype={arch} />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white/90">Your Archetypes</h2>
        <span className="text-xs text-white/40">
          {archetypes.length} active
        </span>
      </div>

      {/* Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {archetypes.map((arch) => (
          <ArchetypeCard
            key={arch.source}
            archetype={arch}
            isExpanded={expandedCard === arch.source}
            onToggle={() =>
              setExpandedCard(
                expandedCard === arch.source ? null : arch.source
              )
            }
          />
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Sub-Components
// ═══════════════════════════════════════════════════════════════════════════════

function ArchetypeCard({
  archetype,
  isExpanded,
  onToggle,
}: {
  archetype: ActiveArchetype;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const { source, sign, correlation, strength = 0.7 } = archetype;
  const colors = ELEMENT_COLORS[correlation.element];
  const ElementIcon = ELEMENT_ICONS[correlation.element];

  return (
    <motion.div
      className={`bg-gradient-to-br ${colors.bg} rounded-xl border ${colors.border} overflow-hidden`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header - Always visible */}
      <button
        onClick={onToggle}
        className="w-full p-4 text-left focus:outline-none focus:ring-2 focus:ring-white/20 rounded-t-xl"
      >
        <div className="flex items-start gap-3">
          {/* Element Icon */}
          <div className={`p-2 rounded-lg bg-white/10 ${colors.icon}`}>
            <ElementIcon className="w-5 h-5" />
          </div>

          {/* Main Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className={`text-sm font-medium ${colors.text}`}>
                {SOURCE_LABELS[source] || source}
              </span>
              <span className="text-xs text-white/40">•</span>
              <span className="text-sm text-white/70">{sign}</span>
            </div>
            <h3 className="text-lg font-semibold text-white/90 mt-0.5">
              {correlation.facetName}
            </h3>

            {/* Strength bar */}
            <div className="mt-2 h-1.5 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                className={`h-full bg-gradient-to-r ${colors.bg.replace('/20', '').replace('/10', '')}`}
                initial={{ width: 0 }}
                animate={{ width: `${strength * 100}%` }}
                transition={{ duration: 0.5, delay: 0.2 }}
              />
            </div>
          </div>

          {/* Expand toggle */}
          <div className="text-white/40">
            {isExpanded ? (
              <ChevronUp className="w-5 h-5" />
            ) : (
              <ChevronDown className="w-5 h-5" />
            )}
          </div>
        </div>
      </button>

      {/* Expanded content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-4">
              {/* Divider */}
              <div className="h-px bg-white/10" />

              {/* Jungian Archetypes */}
              {correlation.archetypes.jungian &&
                correlation.archetypes.jungian.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Lightbulb className="w-4 h-4 text-white/40" />
                      <span className="text-xs font-medium text-white/50 uppercase tracking-wider">
                        Jungian Archetype
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {correlation.archetypes.jungian.map((arch) => (
                        <span
                          key={arch}
                          className="px-2 py-1 text-sm bg-white/10 rounded-lg text-white/80"
                        >
                          {arch}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

              {/* Mythological Figures */}
              {correlation.archetypes.mythological &&
                correlation.archetypes.mythological.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <BookOpen className="w-4 h-4 text-white/40" />
                      <span className="text-xs font-medium text-white/50 uppercase tracking-wider">
                        Mythological Resonance
                      </span>
                    </div>
                    <p className="text-sm text-white/70">
                      {correlation.archetypes.mythological.slice(0, 3).join(', ')}
                    </p>
                  </div>
                )}

              {/* Cultural Examples */}
              {correlation.archetypes.cultural &&
                correlation.archetypes.cultural.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="w-4 h-4 text-white/40" />
                      <span className="text-xs font-medium text-white/50 uppercase tracking-wider">
                        Cultural Examples
                      </span>
                    </div>
                    <p className="text-sm text-white/70">
                      {correlation.archetypes.cultural.slice(0, 3).join(', ')}
                    </p>
                  </div>
                )}

              {/* Developmental Stage */}
              {correlation.developmentalStages?.erikson && (
                <div className="p-3 bg-white/5 rounded-lg">
                  <span className="text-xs text-white/50">
                    Developmental Stage (Erikson)
                  </span>
                  <p className="text-sm text-white/80 mt-1">
                    {correlation.developmentalStages.erikson}
                  </p>
                </div>
              )}

              {/* Additional Info */}
              <div className="flex flex-wrap gap-2 text-xs">
                {correlation.temperament && (
                  <span className="px-2 py-1 bg-white/5 rounded text-white/50">
                    {correlation.temperament} temperament
                  </span>
                )}
                {correlation.learningStyle && (
                  <span className="px-2 py-1 bg-white/5 rounded text-white/50">
                    {correlation.learningStyle} learner
                  </span>
                )}
                {correlation.lifeStage && (
                  <span className="px-2 py-1 bg-white/5 rounded text-white/50">
                    {correlation.lifeStage}
                  </span>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function CompactArchetypeCard({ archetype }: { archetype: ActiveArchetype }) {
  const { source, sign, correlation } = archetype;
  const colors = ELEMENT_COLORS[correlation.element];
  const ElementIcon = ELEMENT_ICONS[correlation.element];

  return (
    <div
      className={`flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r ${colors.bg} border ${colors.border}`}
    >
      <div className={`${colors.icon}`}>
        <ElementIcon className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <span className="text-sm text-white/90">{correlation.facetName}</span>
        <span className="text-xs text-white/50 ml-2">
          {SOURCE_LABELS[source] || source}
        </span>
      </div>
      <span className="text-xs text-white/40">{sign}</span>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Helpers
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Calculate archetype strength based on source and house placement
 */
function calculateStrength(source: string, house: number): number {
  // Angular houses (1, 4, 7, 10) are stronger
  const angularBonus = [1, 4, 7, 10].includes(house) ? 0.15 : 0;

  // Source importance
  const sourceWeights: Record<string, number> = {
    sun: 0.85,
    moon: 0.8,
    ascendant: 0.9,
    mercury: 0.65,
    venus: 0.7,
    mars: 0.7,
  };

  const base = sourceWeights[source] || 0.6;
  return Math.min(1, base + angularBonus);
}
