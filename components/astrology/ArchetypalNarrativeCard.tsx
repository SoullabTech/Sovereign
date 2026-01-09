'use client';

/**
 * Archetypal Narrative Card
 *
 * Displays a user's soul story narrative with themes and reflections.
 * Can generate new narratives via the API.
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  BookOpen,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Quote,
  Compass,
} from 'lucide-react';
import { BirthChartData } from '@/lib/story/storyWeaver';

// ═══════════════════════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════════════════════

interface ArchetypalNarrative {
  narrative: string;
  themes: string[];
  invitation: string;
  reflections: string[];
  generatedAt: Date;
}

interface ArchetypalNarrativeCardProps {
  /** Birth chart data for generation */
  chartData?: BirthChartData;
  /** Pre-loaded narrative (skip generation) */
  initialNarrative?: ArchetypalNarrative;
  /** User's name for personalization */
  userName?: string;
  /** Compact display mode */
  compact?: boolean;
  /** Day mode styling */
  isDayMode?: boolean;
  /** Focus areas for generation */
  focus?: ('identity' | 'purpose' | 'relationships' | 'growth' | 'shadow')[];
}

// ═══════════════════════════════════════════════════════════════════════════════
// Component
// ═══════════════════════════════════════════════════════════════════════════════

export default function ArchetypalNarrativeCard({
  chartData,
  initialNarrative,
  userName,
  compact = false,
  isDayMode = false,
  focus = ['identity', 'purpose'],
}: ArchetypalNarrativeCardProps) {
  const [narrative, setNarrative] = useState<ArchetypalNarrative | null>(
    initialNarrative || null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(!compact);
  const [error, setError] = useState<string | null>(null);

  const generateNarrative = async () => {
    if (!chartData) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/astrology/narrative', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chartData,
          userName,
          focus,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setNarrative(data.data);
      } else {
        setError(data.error || 'Failed to generate narrative');
      }
    } catch (err) {
      setError('Failed to connect to server');
    } finally {
      setIsLoading(false);
    }
  };

  // Empty state - no chart data
  if (!chartData && !narrative) {
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
        <p className={isDayMode ? 'text-stone-600' : 'text-stone-400'}>
          Add your birth chart to discover your soul story
        </p>
      </div>
    );
  }

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
          className="inline-block mb-4"
        >
          <Sparkles
            className={`w-10 h-10 ${
              isDayMode ? 'text-amber-500' : 'text-amber-400'
            }`}
          />
        </motion.div>
        <p className={isDayMode ? 'text-stone-700' : 'text-amber-100'}>
          Weaving your soul story...
        </p>
        <p
          className={`text-sm mt-2 ${
            isDayMode ? 'text-stone-500' : 'text-stone-400'
          }`}
        >
          This may take a moment
        </p>
      </div>
    );
  }

  // No narrative yet - offer to generate
  if (!narrative) {
    return (
      <div
        className={`rounded-2xl p-6 ${
          isDayMode ? 'bg-stone-100' : 'bg-stone-800/50'
        }`}
      >
        <div className="text-center">
          <Sparkles
            className={`w-10 h-10 mx-auto mb-3 ${
              isDayMode ? 'text-amber-500' : 'text-amber-400'
            }`}
          />
          <h3
            className={`text-lg font-medium mb-2 ${
              isDayMode ? 'text-stone-800' : 'text-amber-100'
            }`}
          >
            Your Soul Story Awaits
          </h3>
          <p
            className={`text-sm mb-4 ${
              isDayMode ? 'text-stone-600' : 'text-stone-400'
            }`}
          >
            Generate a personalized archetypal narrative based on your birth chart
          </p>
          <button
            onClick={generateNarrative}
            className={`px-6 py-3 rounded-full font-medium transition-all ${
              isDayMode
                ? 'bg-amber-500 text-white hover:bg-amber-600'
                : 'bg-amber-400 text-stone-900 hover:bg-amber-300'
            }`}
          >
            Generate My Story
          </button>
          {error && (
            <p className="text-red-400 text-sm mt-3">{error}</p>
          )}
        </div>
      </div>
    );
  }

  // Compact view
  if (compact && !isExpanded) {
    return (
      <button
        onClick={() => setIsExpanded(true)}
        className={`w-full text-left rounded-2xl p-4 transition-all ${
          isDayMode
            ? 'bg-stone-100 hover:bg-stone-200'
            : 'bg-stone-800/50 hover:bg-stone-800'
        }`}
      >
        <div className="flex items-center gap-3">
          <Sparkles
            className={`w-5 h-5 flex-shrink-0 ${
              isDayMode ? 'text-amber-500' : 'text-amber-400'
            }`}
          />
          <div className="flex-1 min-w-0">
            <p
              className={`font-medium ${
                isDayMode ? 'text-stone-800' : 'text-amber-100'
              }`}
            >
              Your Soul Story
            </p>
            <p
              className={`text-sm truncate ${
                isDayMode ? 'text-stone-600' : 'text-stone-400'
              }`}
            >
              {narrative.invitation}
            </p>
          </div>
          <ChevronDown
            className={`w-5 h-5 ${
              isDayMode ? 'text-stone-400' : 'text-stone-500'
            }`}
          />
        </div>
      </button>
    );
  }

  // Full narrative view
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl overflow-hidden ${
        isDayMode
          ? 'bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200/50'
          : 'bg-gradient-to-br from-amber-900/20 to-orange-900/10 border border-amber-500/20'
      }`}
    >
      {/* Header */}
      <div className="p-6 pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                isDayMode ? 'bg-amber-100' : 'bg-amber-500/20'
              }`}
            >
              <Sparkles
                className={`w-5 h-5 ${
                  isDayMode ? 'text-amber-600' : 'text-amber-400'
                }`}
              />
            </div>
            <div>
              <h3
                className={`font-medium ${
                  isDayMode ? 'text-stone-800' : 'text-amber-100'
                }`}
              >
                Your Soul Story
              </h3>
              <p
                className={`text-xs ${
                  isDayMode ? 'text-stone-500' : 'text-stone-400'
                }`}
              >
                Archetypal Narrative
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={generateNarrative}
              disabled={isLoading}
              className={`p-2 rounded-lg transition-all ${
                isDayMode
                  ? 'hover:bg-stone-200 text-stone-500'
                  : 'hover:bg-stone-700 text-stone-400'
              }`}
              title="Regenerate"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            {compact && (
              <button
                onClick={() => setIsExpanded(false)}
                className={`p-2 rounded-lg transition-all ${
                  isDayMode
                    ? 'hover:bg-stone-200 text-stone-500'
                    : 'hover:bg-stone-700 text-stone-400'
                }`}
              >
                <ChevronUp className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Invitation Quote */}
      <div
        className={`mx-6 p-4 rounded-xl mb-4 ${
          isDayMode ? 'bg-amber-100/50' : 'bg-amber-500/10'
        }`}
      >
        <div className="flex gap-3">
          <Quote
            className={`w-5 h-5 flex-shrink-0 ${
              isDayMode ? 'text-amber-500' : 'text-amber-400'
            }`}
          />
          <p
            className={`text-sm italic ${
              isDayMode ? 'text-stone-700' : 'text-amber-100'
            }`}
          >
            {narrative.invitation}
          </p>
        </div>
      </div>

      {/* Main Narrative */}
      <div className="px-6 pb-4">
        <div
          className={`prose prose-sm max-w-none ${
            isDayMode ? 'prose-stone' : 'prose-invert'
          }`}
        >
          {narrative.narrative.split('\n\n').map((paragraph, idx) => (
            <p
              key={idx}
              className={`leading-relaxed ${
                isDayMode ? 'text-stone-700' : 'text-stone-200'
              }`}
            >
              {paragraph}
            </p>
          ))}
        </div>
      </div>

      {/* Themes */}
      <div className="px-6 pb-4">
        <h4
          className={`text-xs uppercase tracking-wider font-semibold mb-3 ${
            isDayMode ? 'text-stone-500' : 'text-amber-400/80'
          }`}
        >
          Key Themes
        </h4>
        <div className="flex flex-wrap gap-2">
          {narrative.themes.map((theme, idx) => (
            <span
              key={idx}
              className={`px-3 py-1.5 rounded-full text-xs font-medium ${
                isDayMode
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-amber-500/20 text-amber-200'
              }`}
            >
              {theme}
            </span>
          ))}
        </div>
      </div>

      {/* Reflections */}
      <div
        className={`px-6 py-4 ${
          isDayMode ? 'bg-stone-100/50' : 'bg-stone-900/30'
        }`}
      >
        <div className="flex items-center gap-2 mb-3">
          <Compass
            className={`w-4 h-4 ${
              isDayMode ? 'text-stone-500' : 'text-amber-400/60'
            }`}
          />
          <h4
            className={`text-xs uppercase tracking-wider font-semibold ${
              isDayMode ? 'text-stone-500' : 'text-amber-400/80'
            }`}
          >
            Reflections
          </h4>
        </div>
        <ul className="space-y-2">
          {narrative.reflections.map((reflection, idx) => (
            <li
              key={idx}
              className={`text-sm ${
                isDayMode ? 'text-stone-600' : 'text-stone-300'
              }`}
            >
              {reflection}
            </li>
          ))}
        </ul>
      </div>
    </motion.div>
  );
}
