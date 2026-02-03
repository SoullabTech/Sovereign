'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Heart, Zap, AlertCircle } from 'lucide-react';
import type { DaYunPeriod, Element } from '@/lib/astrology/types/daYun';

interface Props {
  period: DaYunPeriod;
  isExpanded?: boolean;
  showFull?: boolean;
  onToggle?: () => void;
}

/** Element color gradients for card backgrounds */
const ELEMENT_GRADIENTS: Record<Element, { bg: string; border: string; text: string; accent: string }> = {
  Wood: {
    bg: 'from-emerald-900/40 to-green-900/20',
    border: 'border-emerald-500/30',
    text: 'text-emerald-300',
    accent: 'bg-emerald-500',
  },
  Fire: {
    bg: 'from-red-900/40 to-orange-900/20',
    border: 'border-red-500/30',
    text: 'text-red-300',
    accent: 'bg-red-500',
  },
  Earth: {
    bg: 'from-amber-900/40 to-yellow-900/20',
    border: 'border-amber-500/30',
    text: 'text-amber-300',
    accent: 'bg-amber-500',
  },
  Metal: {
    bg: 'from-slate-700/40 to-gray-800/20',
    border: 'border-slate-400/30',
    text: 'text-slate-300',
    accent: 'bg-slate-400',
  },
  Water: {
    bg: 'from-blue-900/40 to-indigo-900/20',
    border: 'border-blue-500/30',
    text: 'text-blue-300',
    accent: 'bg-blue-500',
  },
};

/** Harmony badges */
const HARMONY_STYLES = {
  supportive: { label: 'Favorable', bg: 'bg-emerald-500/20', text: 'text-emerald-400' },
  neutral: { label: 'Balanced', bg: 'bg-slate-500/20', text: 'text-slate-400' },
  challenging: { label: 'Growth', bg: 'bg-orange-500/20', text: 'text-orange-400' },
};

export default function DaYunPeriodCard({ period, isExpanded = false, showFull = false, onToggle }: Props) {
  const [localExpanded, setLocalExpanded] = useState(isExpanded);
  const expanded = onToggle ? isExpanded : localExpanded;
  const toggle = onToggle || (() => setLocalExpanded(!localExpanded));

  const colors = ELEMENT_GRADIENTS[period.element];
  const harmony = HARMONY_STYLES[period.natalHarmony];

  return (
    <motion.div
      className={`
        relative rounded-xl border overflow-hidden
        bg-gradient-to-br ${colors.bg} ${colors.border}
        ${period.isActive ? 'ring-2 ring-amber-400/50' : ''}
        ${period.isPast ? 'opacity-60' : ''}
      `}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Active indicator */}
      {period.isActive && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 to-orange-400" />
      )}

      {/* Header - always visible */}
      <div
        className="p-4 cursor-pointer hover:bg-white/5 transition-colors"
        onClick={toggle}
      >
        <div className="flex items-start justify-between gap-4">
          {/* Left: Age range and Chinese characters */}
          <div className="flex-shrink-0">
            <p className="text-xs text-white/50 uppercase tracking-wider">
              {period.isPast ? 'Past' : period.isActive ? 'Current' : 'Future'}
            </p>
            <p className="text-lg font-medium text-white/90">
              Age {period.ageRange.start}-{period.ageRange.end}
            </p>
            <p className={`text-2xl font-light ${colors.text}`}>
              {period.stemChinese}{period.branchChinese}
            </p>
          </div>

          {/* Center: Element and animal */}
          <div className="flex-1 text-center">
            <p className={`text-sm font-medium ${colors.text}`}>
              {period.element} {period.zodiacAnimal}
            </p>
            <p className="text-xs text-white/50">
              {period.heavenlyStem} {period.earthlyBranch}
            </p>
            <p className="text-sm text-white/70 mt-1">
              {period.lifeTheme}
            </p>
          </div>

          {/* Right: Harmony badge and expand */}
          <div className="flex flex-col items-end gap-2">
            <span className={`px-2 py-0.5 text-xs rounded-full ${harmony.bg} ${harmony.text}`}>
              {harmony.label}
            </span>
            <motion.div
              animate={{ rotate: expanded ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown className="w-4 h-4 text-white/40" />
            </motion.div>
          </div>
        </div>
      </div>

      {/* Expanded content */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-4 border-t border-white/10 pt-4">
              {/* Description */}
              <p className="text-sm text-white/60 leading-relaxed">
                {period.description}
              </p>

              {/* TCM Focus */}
              <div className="bg-white/5 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Heart className="w-4 h-4 text-rose-400" />
                  <span className="text-sm font-medium text-white/80">
                    Health Focus: {period.organFocus.yin} & {period.organFocus.yang}
                  </span>
                </div>
                <p className="text-xs text-white/50 mb-2">
                  {period.spiritFocus} - {period.spiritDescription}
                </p>
                <ul className="space-y-1">
                  {period.healthGuidance.slice(0, showFull ? undefined : 3).map((guidance, i) => (
                    <li key={i} className="text-xs text-white/60 flex items-start gap-2">
                      <span className={`w-1 h-1 rounded-full ${colors.accent} mt-1.5 flex-shrink-0`} />
                      {guidance}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Opportunities & Challenges */}
              <div className="grid grid-cols-2 gap-3">
                {/* Opportunities */}
                <div className="bg-emerald-500/10 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-medium text-emerald-400">Opportunities</span>
                  </div>
                  <ul className="space-y-1">
                    {period.opportunities.slice(0, showFull ? undefined : 3).map((opp, i) => (
                      <li key={i} className="text-xs text-white/60">{opp}</li>
                    ))}
                  </ul>
                </div>

                {/* Challenges */}
                <div className="bg-orange-500/10 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="w-4 h-4 text-orange-400" />
                    <span className="text-xs font-medium text-orange-400">Challenges</span>
                  </div>
                  <ul className="space-y-1">
                    {period.challenges.slice(0, showFull ? undefined : 2).map((ch, i) => (
                      <li key={i} className="text-xs text-white/60">{ch}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
