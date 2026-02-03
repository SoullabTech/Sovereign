'use client';

/**
 * Journal-Chart Insights Panel
 *
 * Displays patterns and insights from journal entries linked to astrological elements.
 * "You often journal about Venus themes during Moon transits..."
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  TrendingUp,
  Moon,
  Sun,
  Star,
  Home,
  Flame,
  Droplets,
  Wind,
  Mountain,
  ChevronRight,
  RefreshCw,
  BookOpen,
  Lightbulb,
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════════════════════
// Types (matching service types)
// ═══════════════════════════════════════════════════════════════════════════════

interface JournalPattern {
  id: string;
  patternType: 'planet_timing' | 'house_theme' | 'element_cycle' | 'transit_correlation';
  description: string;
  frequency: number;
  confidence: number;
  insight: string;
  firstSeen: string;
  lastSeen: string;
}

interface ChartJournalInsight {
  userId: string;
  generatedAt: string;
  dominantPlanets: { planet: string; entryCount: number; themes: string[] }[];
  housePatterns: { house: number; entryCount: number; lifeArea: string }[];
  transitCorrelations: { transit: string; journalTheme: string; frequency: number }[];
  elementBalance: Record<string, number>;
  rhythmInsight: string;
  growthRecommendation: string;
}

interface JournalChartInsightsProps {
  userId: string;
  isDayMode?: boolean;
  compact?: boolean;
  onPatternClick?: (pattern: JournalPattern) => void;
}

// ═══════════════════════════════════════════════════════════════════════════════
// Icons & Colors
// ═══════════════════════════════════════════════════════════════════════════════

const PLANET_ICONS: Record<string, typeof Sun> = {
  Sun: Sun,
  Moon: Moon,
  Mercury: Wind,
  Venus: Sparkles,
  Mars: Flame,
  Jupiter: TrendingUp,
  Saturn: Mountain,
  Uranus: Star,
  Neptune: Droplets,
  Pluto: Moon,
  Chiron: Lightbulb,
  NorthNode: Star,
};

const ELEMENT_ICONS: Record<string, typeof Flame> = {
  fire: Flame,
  water: Droplets,
  earth: Mountain,
  air: Wind,
};

const ELEMENT_COLORS: Record<string, { bg: string; text: string; ring: string }> = {
  fire: { bg: 'bg-orange-500/20', text: 'text-orange-400', ring: 'ring-orange-500/30' },
  water: { bg: 'bg-blue-500/20', text: 'text-blue-400', ring: 'ring-blue-500/30' },
  earth: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', ring: 'ring-emerald-500/30' },
  air: { bg: 'bg-sky-500/20', text: 'text-sky-400', ring: 'ring-sky-500/30' },
};

// ═══════════════════════════════════════════════════════════════════════════════
// Component
// ═══════════════════════════════════════════════════════════════════════════════

export default function JournalChartInsights({
  userId,
  isDayMode = false,
  compact = false,
  onPatternClick,
}: JournalChartInsightsProps) {
  const [insights, setInsights] = useState<ChartJournalInsight | null>(null);
  const [patterns, setPatterns] = useState<JournalPattern[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'planets' | 'patterns'>('overview');

  // Fetch insights and patterns
  const fetchData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [insightsRes, patternsRes] = await Promise.all([
        fetch(`/api/journal/chart-integration?userId=${userId}&insights=true`),
        fetch(`/api/journal/chart-integration?userId=${userId}&patterns=true`),
      ]);

      const insightsData = await insightsRes.json();
      const patternsData = await patternsRes.json();

      if (insightsData.success) {
        setInsights(insightsData.data.insights);
      }
      if (patternsData.success) {
        setPatterns(patternsData.data.patterns || []);
      }
    } catch (err) {
      setError('Failed to load insights');
      console.error('Failed to fetch journal insights:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [userId]);

  // Loading state
  if (isLoading) {
    return (
      <div
        className={`rounded-2xl p-8 text-center ${
          isDayMode ? 'bg-stone-100' : 'bg-stone-800/50'
        }`}
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="inline-block"
        >
          <BookOpen className={`w-8 h-8 ${isDayMode ? 'text-violet-500' : 'text-violet-400'}`} />
        </motion.div>
        <p className={`mt-3 ${isDayMode ? 'text-stone-600' : 'text-stone-400'}`}>
          Analyzing your journal patterns...
        </p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div
        className={`rounded-2xl p-6 text-center ${
          isDayMode ? 'bg-stone-100' : 'bg-stone-800/50'
        }`}
      >
        <p className={`${isDayMode ? 'text-stone-600' : 'text-stone-400'}`}>{error}</p>
        <button
          onClick={fetchData}
          className={`mt-3 px-4 py-2 rounded-lg text-sm ${
            isDayMode
              ? 'bg-stone-200 text-stone-700 hover:bg-stone-300'
              : 'bg-stone-700 text-stone-300 hover:bg-stone-600'
          }`}
        >
          Retry
        </button>
      </div>
    );
  }

  // No data state
  if (!insights || (insights.dominantPlanets.length === 0 && patterns.length === 0)) {
    return (
      <div
        className={`rounded-2xl p-6 text-center ${
          isDayMode ? 'bg-stone-100' : 'bg-stone-800/50'
        }`}
      >
        <BookOpen
          className={`w-10 h-10 mx-auto mb-3 ${
            isDayMode ? 'text-stone-400' : 'text-stone-500'
          }`}
        />
        <p className={`font-medium mb-1 ${isDayMode ? 'text-stone-700' : 'text-stone-300'}`}>
          No Patterns Yet
        </p>
        <p className={`text-sm ${isDayMode ? 'text-stone-500' : 'text-stone-500'}`}>
          Keep journaling to discover your archetypal patterns
        </p>
      </div>
    );
  }

  // Compact view
  if (compact) {
    return (
      <div
        className={`rounded-2xl p-4 ${
          isDayMode ? 'bg-stone-100' : 'bg-stone-800/50'
        }`}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Sparkles
              className={`w-5 h-5 ${isDayMode ? 'text-violet-500' : 'text-violet-400'}`}
            />
            <span className={`font-medium ${isDayMode ? 'text-stone-800' : 'text-white'}`}>
              Journal Patterns
            </span>
          </div>
          <span className={`text-xs ${isDayMode ? 'text-stone-500' : 'text-stone-500'}`}>
            {patterns.length} patterns
          </span>
        </div>

        {/* Quick stats */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {insights.dominantPlanets.slice(0, 3).map((planet) => {
            const Icon = PLANET_ICONS[planet.planet] || Star;
            return (
              <div
                key={planet.planet}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs ${
                  isDayMode ? 'bg-stone-200 text-stone-700' : 'bg-stone-700 text-stone-300'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {planet.planet}
              </div>
            );
          })}
        </div>

        {insights.rhythmInsight && (
          <p
            className={`text-xs mt-3 line-clamp-2 ${
              isDayMode ? 'text-stone-600' : 'text-stone-400'
            }`}
          >
            {insights.rhythmInsight}
          </p>
        )}
      </div>
    );
  }

  // Full view
  return (
    <div
      className={`rounded-2xl overflow-hidden ${
        isDayMode
          ? 'bg-gradient-to-br from-violet-50 to-indigo-50 border border-violet-200/50'
          : 'bg-gradient-to-br from-violet-900/20 to-indigo-900/10 border border-violet-500/20'
      }`}
    >
      {/* Header */}
      <div className="p-6 pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                isDayMode ? 'bg-violet-100' : 'bg-violet-500/20'
              }`}
            >
              <Sparkles
                className={`w-5 h-5 ${isDayMode ? 'text-violet-600' : 'text-violet-400'}`}
              />
            </div>
            <div>
              <h3 className={`font-medium ${isDayMode ? 'text-stone-800' : 'text-white'}`}>
                Journal-Chart Insights
              </h3>
              <p className={`text-sm ${isDayMode ? 'text-stone-500' : 'text-stone-400'}`}>
                Patterns in your reflective practice
              </p>
            </div>
          </div>
          <button
            onClick={fetchData}
            className={`p-2 rounded-lg transition-all ${
              isDayMode ? 'hover:bg-stone-200 text-stone-500' : 'hover:bg-stone-700 text-stone-400'
            }`}
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className={`px-6 border-b ${isDayMode ? 'border-stone-200' : 'border-stone-700'}`}>
        <div className="flex gap-6">
          {(['overview', 'planets', 'patterns'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-3 text-sm font-medium border-b-2 transition-all ${
                activeTab === tab
                  ? isDayMode
                    ? 'border-violet-500 text-violet-700'
                    : 'border-violet-400 text-violet-300'
                  : isDayMode
                  ? 'border-transparent text-stone-500 hover:text-stone-700'
                  : 'border-transparent text-stone-500 hover:text-stone-300'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {/* Rhythm insight */}
              {insights.rhythmInsight && (
                <div
                  className={`p-4 rounded-xl ${
                    isDayMode ? 'bg-violet-100/50' : 'bg-violet-500/10'
                  }`}
                >
                  <p className={`${isDayMode ? 'text-stone-700' : 'text-stone-200'}`}>
                    {insights.rhythmInsight}
                  </p>
                </div>
              )}

              {/* Element balance */}
              <div>
                <h4
                  className={`text-xs uppercase tracking-wider font-semibold mb-3 ${
                    isDayMode ? 'text-stone-500' : 'text-violet-400/80'
                  }`}
                >
                  Elemental Balance
                </h4>
                <div className="flex gap-2">
                  {Object.entries(insights.elementBalance).map(([element, count]) => {
                    const Icon = ELEMENT_ICONS[element];
                    const colors = ELEMENT_COLORS[element];
                    const total = Object.values(insights.elementBalance).reduce((a, b) => a + b, 0);
                    const percentage = total > 0 ? Math.round((count / total) * 100) : 0;

                    return (
                      <div
                        key={element}
                        className={`flex-1 p-3 rounded-xl text-center ${colors.bg}`}
                      >
                        <Icon className={`w-5 h-5 mx-auto mb-1 ${colors.text}`} />
                        <p className={`text-lg font-semibold ${colors.text}`}>{percentage}%</p>
                        <p className={`text-xs capitalize ${isDayMode ? 'text-stone-600' : 'text-stone-400'}`}>
                          {element}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Growth recommendation */}
              {insights.growthRecommendation && (
                <div
                  className={`flex items-start gap-3 p-4 rounded-xl ${
                    isDayMode ? 'bg-amber-50 border border-amber-200' : 'bg-amber-500/10 border border-amber-500/20'
                  }`}
                >
                  <Lightbulb
                    className={`w-5 h-5 flex-shrink-0 ${
                      isDayMode ? 'text-amber-600' : 'text-amber-400'
                    }`}
                  />
                  <p className={`text-sm ${isDayMode ? 'text-amber-800' : 'text-amber-200'}`}>
                    {insights.growthRecommendation}
                  </p>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'planets' && (
            <motion.div
              key="planets"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              {/* Dominant planets */}
              <div>
                <h4
                  className={`text-xs uppercase tracking-wider font-semibold mb-3 ${
                    isDayMode ? 'text-stone-500' : 'text-violet-400/80'
                  }`}
                >
                  Dominant Planetary Themes
                </h4>
                <div className="space-y-2">
                  {insights.dominantPlanets.map((planet) => {
                    const Icon = PLANET_ICONS[planet.planet] || Star;
                    return (
                      <div
                        key={planet.planet}
                        className={`p-3 rounded-xl ${
                          isDayMode ? 'bg-white border border-stone-200' : 'bg-stone-800/50 border border-stone-700'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Icon
                              className={`w-5 h-5 ${isDayMode ? 'text-violet-500' : 'text-violet-400'}`}
                            />
                            <span
                              className={`font-medium ${isDayMode ? 'text-stone-800' : 'text-white'}`}
                            >
                              {planet.planet}
                            </span>
                          </div>
                          <span
                            className={`text-sm ${isDayMode ? 'text-stone-500' : 'text-stone-500'}`}
                          >
                            {planet.entryCount} entries
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {planet.themes.map((theme) => (
                            <span
                              key={theme}
                              className={`px-2 py-0.5 rounded text-xs ${
                                isDayMode
                                  ? 'bg-stone-100 text-stone-600'
                                  : 'bg-stone-700 text-stone-300'
                              }`}
                            >
                              {theme}
                            </span>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* House patterns */}
              {insights.housePatterns.length > 0 && (
                <div>
                  <h4
                    className={`text-xs uppercase tracking-wider font-semibold mb-3 ${
                      isDayMode ? 'text-stone-500' : 'text-violet-400/80'
                    }`}
                  >
                    Life Areas in Focus
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    {insights.housePatterns.map((house) => (
                      <div
                        key={house.house}
                        className={`p-3 rounded-xl ${
                          isDayMode ? 'bg-white border border-stone-200' : 'bg-stone-800/50 border border-stone-700'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <Home
                            className={`w-4 h-4 ${isDayMode ? 'text-stone-500' : 'text-stone-400'}`}
                          />
                          <span
                            className={`text-sm font-medium ${isDayMode ? 'text-stone-700' : 'text-stone-300'}`}
                          >
                            House {house.house}
                          </span>
                        </div>
                        <p
                          className={`text-xs ${isDayMode ? 'text-stone-500' : 'text-stone-500'}`}
                        >
                          {house.lifeArea}
                        </p>
                        <p
                          className={`text-xs mt-1 ${isDayMode ? 'text-violet-600' : 'text-violet-400'}`}
                        >
                          {house.entryCount} entries
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'patterns' && (
            <motion.div
              key="patterns"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-3"
            >
              {patterns.length === 0 ? (
                <p className={`text-center py-6 ${isDayMode ? 'text-stone-500' : 'text-stone-500'}`}>
                  Keep journaling to discover patterns
                </p>
              ) : (
                patterns.map((pattern) => (
                  <button
                    key={pattern.id}
                    onClick={() => onPatternClick?.(pattern)}
                    className={`w-full text-left p-4 rounded-xl transition-all ${
                      isDayMode
                        ? 'bg-white border border-stone-200 hover:border-violet-300'
                        : 'bg-stone-800/50 border border-stone-700 hover:border-violet-500/50'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className={`px-2 py-0.5 rounded text-xs font-medium ${
                              pattern.patternType === 'planet_timing'
                                ? isDayMode
                                  ? 'bg-violet-100 text-violet-700'
                                  : 'bg-violet-500/20 text-violet-300'
                                : pattern.patternType === 'house_theme'
                                ? isDayMode
                                  ? 'bg-blue-100 text-blue-700'
                                  : 'bg-blue-500/20 text-blue-300'
                                : pattern.patternType === 'element_cycle'
                                ? isDayMode
                                  ? 'bg-emerald-100 text-emerald-700'
                                  : 'bg-emerald-500/20 text-emerald-300'
                                : isDayMode
                                ? 'bg-amber-100 text-amber-700'
                                : 'bg-amber-500/20 text-amber-300'
                            }`}
                          >
                            {pattern.patternType.replace('_', ' ')}
                          </span>
                          <span
                            className={`text-xs ${isDayMode ? 'text-stone-500' : 'text-stone-500'}`}
                          >
                            {pattern.frequency}× observed
                          </span>
                        </div>
                        <p
                          className={`font-medium mb-1 ${
                            isDayMode ? 'text-stone-800' : 'text-white'
                          }`}
                        >
                          {pattern.description}
                        </p>
                        <p
                          className={`text-sm line-clamp-2 ${
                            isDayMode ? 'text-stone-600' : 'text-stone-400'
                          }`}
                        >
                          {pattern.insight}
                        </p>
                      </div>
                      <ChevronRight
                        className={`w-5 h-5 flex-shrink-0 ${
                          isDayMode ? 'text-stone-400' : 'text-stone-500'
                        }`}
                      />
                    </div>
                  </button>
                ))
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
