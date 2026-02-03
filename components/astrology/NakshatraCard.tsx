'use client';

/**
 * NakshatraCard Component
 *
 * Displays detailed information about a Nakshatra (lunar mansion)
 * including deity, symbol, ruler, and spiritual themes.
 */

import { motion } from 'framer-motion';
import { Sparkles, Star, Moon, Heart, Zap } from 'lucide-react';
import type { NakshatraInfo } from '@/lib/astrology/types/vedic';

interface NakshatraCardProps {
  nakshatra: NakshatraInfo;
  pada?: 1 | 2 | 3 | 4;
  isExpanded?: boolean;
  onToggle?: () => void;
  highlight?: boolean;
  showSpiralogic?: boolean;
}

const GANA_ICONS: Record<string, typeof Star> = {
  deva: Star,
  manushya: Heart,
  rakshasa: Zap,
};

const GANA_COLORS: Record<string, string> = {
  deva: 'text-amber-400',
  manushya: 'text-emerald-400',
  rakshasa: 'text-red-400',
};

const GANA_LABELS: Record<string, string> = {
  deva: 'Divine (Deva)',
  manushya: 'Human (Manushya)',
  rakshasa: 'Demon (Rakshasa)',
};

const GUNA_COLORS: Record<string, string> = {
  sattva: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  rajas: 'bg-red-500/20 text-red-300 border-red-500/30',
  tamas: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
};

export default function NakshatraCard({
  nakshatra,
  pada,
  isExpanded = true,
  onToggle,
  highlight = false,
  showSpiralogic = true,
}: NakshatraCardProps) {
  const GanaIcon = GANA_ICONS[nakshatra.gana] || Star;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`
        relative overflow-hidden rounded-2xl
        ${highlight
          ? 'bg-gradient-to-br from-indigo-900/40 via-purple-900/30 to-indigo-900/40 border-2 border-indigo-500/40'
          : 'bg-gradient-to-br from-stone-900/80 via-indigo-950/40 to-stone-900/80 border border-indigo-900/30'
        }
      `}
    >
      {/* Decorative glow for highlighted cards */}
      {highlight && (
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-transparent to-purple-500/10 pointer-events-none" />
      )}

      <div className="relative p-6">
        {/* Header */}
        <div
          className={`flex items-start justify-between ${onToggle ? 'cursor-pointer' : ''}`}
          onClick={onToggle}
        >
          <div className="flex items-center gap-4">
            {/* Number and Symbol */}
            <div className="flex flex-col items-center">
              <span className="text-4xl">{nakshatra.symbol}</span>
              <span className="text-xs text-indigo-400/60 mt-1">
                #{nakshatra.number}
              </span>
            </div>

            {/* Name and Meaning */}
            <div>
              <h3 className="text-xl font-bold text-indigo-100">
                {nakshatra.name}
                {pada && (
                  <span className="ml-2 text-sm font-normal text-indigo-400/70">
                    Pada {pada}
                  </span>
                )}
              </h3>
              <p className="text-sm text-indigo-400/70 mt-0.5">
                {nakshatra.sanskrit} • {nakshatra.meaning}
              </p>
            </div>
          </div>

          {/* Guna Badge */}
          <div
            className={`
              px-2.5 py-1 rounded-full text-xs font-medium border
              ${GUNA_COLORS[nakshatra.guna]}
            `}
          >
            {nakshatra.guna.charAt(0).toUpperCase() + nakshatra.guna.slice(1)}
          </div>
        </div>

        {/* Expanded Content */}
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            transition={{ duration: 0.3 }}
            className="mt-6 space-y-4"
          >
            {/* Key Attributes */}
            <div className="grid grid-cols-2 gap-4">
              {/* Deity */}
              <div className="bg-indigo-950/30 rounded-xl p-4">
                <div className="text-xs text-indigo-400/60 uppercase tracking-wider mb-1">
                  Deity
                </div>
                <div className="text-sm text-indigo-200 font-medium">
                  {nakshatra.deity}
                </div>
              </div>

              {/* Ruler */}
              <div className="bg-indigo-950/30 rounded-xl p-4">
                <div className="text-xs text-indigo-400/60 uppercase tracking-wider mb-1">
                  Planetary Ruler
                </div>
                <div className="text-sm text-indigo-200 font-medium">
                  {nakshatra.ruler}
                </div>
              </div>
            </div>

            {/* Gana and Animal */}
            <div className="grid grid-cols-2 gap-4">
              {/* Gana */}
              <div className="flex items-center gap-3 bg-indigo-950/30 rounded-xl p-4">
                <GanaIcon className={`w-5 h-5 ${GANA_COLORS[nakshatra.gana]}`} />
                <div>
                  <div className="text-xs text-indigo-400/60 uppercase tracking-wider mb-0.5">
                    Temperament
                  </div>
                  <div className="text-sm text-indigo-200">
                    {GANA_LABELS[nakshatra.gana]}
                  </div>
                </div>
              </div>

              {/* Yoni (Animal) */}
              <div className="bg-indigo-950/30 rounded-xl p-4">
                <div className="text-xs text-indigo-400/60 uppercase tracking-wider mb-1">
                  Yoni Animal
                </div>
                <div className="text-sm text-indigo-200 font-medium">
                  {nakshatra.animal}
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-indigo-950/30 rounded-xl p-4">
              <div className="text-xs text-indigo-400/60 uppercase tracking-wider mb-2">
                Essence
              </div>
              <p className="text-sm text-indigo-300/80 leading-relaxed">
                {nakshatra.description}
              </p>
            </div>

            {/* Themes */}
            {nakshatra.themes && nakshatra.themes.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {nakshatra.themes.map((theme, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-indigo-900/40 border border-indigo-700/30 rounded-full text-xs text-indigo-300"
                  >
                    {theme}
                  </span>
                ))}
              </div>
            )}

            {/* Rashi Span */}
            <div className="flex items-center gap-2 text-xs text-indigo-400/60">
              <Moon className="w-3.5 h-3.5" />
              <span>
                Spans: {nakshatra.rashis.join(' → ')} •{' '}
                {nakshatra.startDegree.toFixed(1)}° – {nakshatra.endDegree.toFixed(1)}°
              </span>
            </div>

            {/* Spiralogic Integration */}
            {showSpiralogic && (
              <div className="mt-4 pt-4 border-t border-indigo-800/30">
                <div className="flex items-center gap-2 text-xs text-amber-400/60 uppercase tracking-wider mb-2">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Spiralogic Connection</span>
                </div>
                <p className="text-sm text-amber-300/70 leading-relaxed">
                  {nakshatra.spiralogicConnection}
                </p>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
