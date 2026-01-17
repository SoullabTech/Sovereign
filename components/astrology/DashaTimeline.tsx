'use client';

/**
 * DashaTimeline Component
 *
 * Visualizes the Vimshottari Dasha periods (120-year planetary cycle).
 * Shows Mahadashas with optional Antardasha detail for the current period.
 *
 * Follows the DaYunTimeline pattern for consistency.
 */

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, Clock, Sparkles, Calendar } from 'lucide-react';
import type { VimshottariDashaProfile, DashaPeriod, MahadashaInfo, DashaRuler } from '@/lib/astrology/types/vedic';
import { MAHADASHA_SEQUENCE, GRAHAS } from '@/lib/astrology/types/vedic';
import { AyanamsaType } from './ZodiacToggle';

interface DashaTimelineProps {
  birthDate?: string;
  birthTime?: string;
  location?: {
    lat: number;
    lng: number;
    timezone?: string;
  };
  ayanamsa?: AyanamsaType;
  compact?: boolean;
  profile?: VimshottariDashaProfile; // Can pass pre-calculated profile
}

// Planet colors (traditional Jyotish associations)
const DASHA_COLORS: Record<DashaRuler, { bg: string; border: string; text: string }> = {
  Ketu: { bg: 'from-purple-900/40 to-purple-950/40', border: 'border-purple-500/30', text: 'text-purple-300' },
  Shukra: { bg: 'from-pink-900/40 to-pink-950/40', border: 'border-pink-500/30', text: 'text-pink-300' },
  Surya: { bg: 'from-amber-900/40 to-amber-950/40', border: 'border-amber-500/30', text: 'text-amber-300' },
  Chandra: { bg: 'from-slate-800/40 to-slate-900/40', border: 'border-slate-400/30', text: 'text-slate-200' },
  Mangala: { bg: 'from-red-900/40 to-red-950/40', border: 'border-red-500/30', text: 'text-red-300' },
  Rahu: { bg: 'from-slate-900/40 to-indigo-950/40', border: 'border-indigo-500/30', text: 'text-indigo-300' },
  Guru: { bg: 'from-yellow-900/40 to-yellow-950/40', border: 'border-yellow-500/30', text: 'text-yellow-300' },
  Shani: { bg: 'from-gray-800/40 to-gray-900/40', border: 'border-gray-500/30', text: 'text-gray-300' },
  Budha: { bg: 'from-green-900/40 to-green-950/40', border: 'border-green-500/30', text: 'text-green-300' },
};

function getDashaInfo(ruler: DashaRuler): MahadashaInfo {
  return MAHADASHA_SEQUENCE.find(m => m.ruler === ruler)!;
}

function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric',
  });
}

function formatDuration(years: number): string {
  const wholeYears = Math.floor(years);
  const months = Math.round((years - wholeYears) * 12);
  if (months === 0) return `${wholeYears}y`;
  if (wholeYears === 0) return `${months}m`;
  return `${wholeYears}y ${months}m`;
}

export default function DashaTimeline({
  birthDate,
  birthTime = '12:00',
  location,
  ayanamsa = 'lahiri',
  compact = false,
  profile: passedProfile,
}: DashaTimelineProps) {
  const [profile, setProfile] = useState<VimshottariDashaProfile | null>(passedProfile || null);
  const [loading, setLoading] = useState(!passedProfile && !!birthDate);
  const [error, setError] = useState<string | null>(null);
  const [expandedPeriod, setExpandedPeriod] = useState<number | null>(null);
  const didAutoLoad = useRef(false);

  // Fetch dasha profile if not passed and birth date is provided
  useEffect(() => {
    if (passedProfile) {
      setProfile(passedProfile);
      return;
    }

    if (!birthDate) return;
    if (didAutoLoad.current) return;

    const fetchDasha = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/astrology/vedic/dasha', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            date: birthDate,
            time: birthTime,
            location: location || { lat: 0, lng: 0, timezone: 'UTC' },
            ayanamsa,
          }),
        });

        const result = await response.json();

        if (!result.success) {
          throw new Error(result.error || 'Failed to calculate dasha');
        }

        setProfile(result.data.profile);
        didAutoLoad.current = true;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load dasha');
      } finally {
        setLoading(false);
      }
    };

    fetchDasha();
  }, [birthDate, birthTime, location, ayanamsa, passedProfile]);

  // Auto-expand current period
  useEffect(() => {
    if (profile && expandedPeriod === null) {
      const currentIndex = profile.mahadashas.findIndex(p => p.isActive);
      if (currentIndex >= 0) {
        setExpandedPeriod(currentIndex);
      }
    }
  }, [profile, expandedPeriod]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center gap-3 text-indigo-400">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          >
            <Sparkles className="w-5 h-5" />
          </motion.div>
          <span>Calculating Vimshottari Dasha...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-4 text-red-300 text-sm">
        {error}
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="bg-indigo-900/20 border border-indigo-500/30 rounded-xl p-6 text-center">
        <p className="text-indigo-300/70">
          Enter your birth details to see your Vimshottari Dasha periods.
        </p>
      </div>
    );
  }

  // Compact view - just current period
  if (compact) {
    const current = profile.currentMahadasha;
    const colors = DASHA_COLORS[current.ruler];
    const info = getDashaInfo(current.ruler);
    const graha = GRAHAS[current.ruler];

    return (
      <div className={`bg-gradient-to-br ${colors.bg} border ${colors.border} rounded-xl p-4`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-lg">{graha.symbol}</span>
            <div>
              <div className={`text-sm font-semibold ${colors.text}`}>
                {graha.westernName} Mahadasha
              </div>
              <div className="text-xs text-indigo-400/60">
                {formatDate(current.startDate)} – {formatDate(current.endDate)}
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-indigo-400/60">Duration</div>
            <div className={`text-sm font-medium ${colors.text}`}>
              {formatDuration(current.durationYears)}
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="h-2 bg-stone-900/50 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${getProgress(current) * 100}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className={`h-full bg-gradient-to-r ${colors.bg.replace('/40', '/80')}`}
          />
        </div>
      </div>
    );
  }

  // Full timeline view
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-indigo-100 flex items-center gap-2">
            <Clock className="w-5 h-5 text-indigo-400" />
            Vimshottari Dasha Timeline
          </h3>
          <p className="text-sm text-indigo-400/60 mt-1">
            120-year planetary period cycle based on your Moon nakshatra ({profile.birthNakshatra.name})
          </p>
        </div>
        <div className="text-right">
          <div className="text-xs text-indigo-400/60">Balance at Birth</div>
          <div className="text-sm font-medium text-indigo-300">
            {formatDuration(profile.balanceAtBirth)}
          </div>
        </div>
      </div>

      {/* Timeline Bar */}
      <div className="relative h-4 bg-stone-900/50 rounded-full overflow-hidden flex">
        {profile.mahadashas.map((period, index) => {
          const width = (period.durationYears / 120) * 100;
          const colors = DASHA_COLORS[period.ruler];
          return (
            <motion.div
              key={index}
              initial={{ width: 0 }}
              animate={{ width: `${width}%` }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`
                h-full relative
                ${period.isActive ? 'ring-2 ring-white/50 ring-offset-1 ring-offset-stone-900' : ''}
                ${period.isPast ? 'opacity-40' : ''}
              `}
              style={{
                background: period.isActive
                  ? `linear-gradient(90deg, var(--tw-gradient-from), var(--tw-gradient-to))`
                  : undefined,
              }}
            >
              <div
                className={`absolute inset-0 bg-gradient-to-r ${colors.bg.replace('/40', '/60')}`}
              />
              {period.isActive && (
                <motion.div
                  className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-white rounded-full"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Period Cards */}
      <div className="space-y-3">
        {profile.mahadashas.map((period, index) => (
          <DashaPeriodCard
            key={index}
            period={period}
            isExpanded={expandedPeriod === index}
            onToggle={() => setExpandedPeriod(expandedPeriod === index ? null : index)}
            birthDate={birthDate ? new Date(birthDate) : new Date()}
          />
        ))}
      </div>
    </div>
  );
}

// Helper function to calculate progress through a period
function getProgress(period: DashaPeriod): number {
  const now = new Date();
  if (now <= period.startDate) return 0;
  if (now >= period.endDate) return 1;

  const total = period.endDate.getTime() - period.startDate.getTime();
  const elapsed = now.getTime() - period.startDate.getTime();

  return elapsed / total;
}

// Sub-component for individual period cards
function DashaPeriodCard({
  period,
  isExpanded,
  onToggle,
  birthDate,
}: {
  period: DashaPeriod;
  isExpanded: boolean;
  onToggle: () => void;
  birthDate: Date;
}) {
  const colors = DASHA_COLORS[period.ruler];
  const info = getDashaInfo(period.ruler);
  const graha = GRAHAS[period.ruler];

  const startAge = Math.floor((period.startDate.getTime() - birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
  const endAge = Math.floor((period.endDate.getTime() - birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000));

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`
        relative overflow-hidden rounded-xl
        bg-gradient-to-br ${colors.bg} border ${colors.border}
        ${period.isActive ? 'ring-2 ring-indigo-500/50' : ''}
        ${period.isPast ? 'opacity-60' : ''}
      `}
    >
      {/* Header - Always Visible */}
      <button
        onClick={onToggle}
        className="w-full px-5 py-4 flex items-center justify-between text-left"
      >
        <div className="flex items-center gap-4">
          <span className="text-2xl">{graha.symbol}</span>
          <div>
            <div className={`font-semibold ${colors.text}`}>
              {graha.westernName} ({graha.name}) Mahadasha
            </div>
            <div className="text-xs text-indigo-400/60 mt-0.5">
              Ages {startAge}–{endAge} • {formatDate(period.startDate)} – {formatDate(period.endDate)}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Status Badge */}
          {period.isActive && (
            <span className="px-2 py-0.5 bg-indigo-500/30 text-indigo-200 text-xs rounded-full">
              Current
            </span>
          )}

          {/* Duration */}
          <div className="text-right">
            <div className="text-xs text-indigo-400/60">Duration</div>
            <div className={`text-sm font-medium ${colors.text}`}>
              {formatDuration(period.durationYears)}
            </div>
          </div>

          {/* Expand Icon */}
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-indigo-400/60" />
          ) : (
            <ChevronDown className="w-5 h-5 text-indigo-400/60" />
          )}
        </div>
      </button>

      {/* Expanded Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 space-y-4 border-t border-indigo-800/30 pt-4">
              {/* Progress (if active) */}
              {period.isActive && (
                <div>
                  <div className="flex justify-between text-xs text-indigo-400/60 mb-1">
                    <span>Progress</span>
                    <span>{Math.round(getProgress(period) * 100)}%</span>
                  </div>
                  <div className="h-2 bg-stone-900/50 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${getProgress(period) * 100}%` }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                      className="h-full bg-indigo-500/60"
                    />
                  </div>
                </div>
              )}

              {/* Themes */}
              <div>
                <div className="text-xs text-indigo-400/60 uppercase tracking-wider mb-2">
                  Themes
                </div>
                <div className="flex flex-wrap gap-2">
                  {info.themes.map((theme, i) => (
                    <span
                      key={i}
                      className="px-2 py-1 bg-indigo-900/40 border border-indigo-700/30 rounded text-xs text-indigo-300"
                    >
                      {theme}
                    </span>
                  ))}
                </div>
              </div>

              {/* Opportunities & Challenges Grid */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-emerald-900/20 border border-emerald-700/30 rounded-lg p-3">
                  <div className="text-xs text-emerald-400/60 uppercase tracking-wider mb-2">
                    Opportunities
                  </div>
                  <ul className="space-y-1">
                    {info.opportunities.map((opp, i) => (
                      <li key={i} className="text-sm text-emerald-300/80">
                        • {opp}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-amber-900/20 border border-amber-700/30 rounded-lg p-3">
                  <div className="text-xs text-amber-400/60 uppercase tracking-wider mb-2">
                    Challenges
                  </div>
                  <ul className="space-y-1">
                    {info.challenges.map((chal, i) => (
                      <li key={i} className="text-sm text-amber-300/80">
                        • {chal}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Health Focus */}
              <div className="bg-rose-900/20 border border-rose-700/30 rounded-lg p-3">
                <div className="text-xs text-rose-400/60 uppercase tracking-wider mb-2">
                  Health Focus Areas
                </div>
                <div className="flex flex-wrap gap-2">
                  {info.healthFocus.map((area, i) => (
                    <span
                      key={i}
                      className="px-2 py-1 bg-rose-900/40 rounded text-xs text-rose-300"
                    >
                      {area}
                    </span>
                  ))}
                </div>
              </div>

              {/* Spiralogic Connection */}
              <div className="pt-3 border-t border-indigo-800/30">
                <div className="flex items-center gap-2 text-xs text-amber-400/60 uppercase tracking-wider mb-2">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Spiralogic Connection</span>
                </div>
                <p className="text-sm text-amber-300/70">
                  {info.spiralogicConnection}
                </p>
              </div>

              {/* Antardashas (sub-periods) */}
              {period.isActive && period.subPeriods && period.subPeriods.length > 0 && (
                <div className="pt-3 border-t border-indigo-800/30">
                  <div className="text-xs text-indigo-400/60 uppercase tracking-wider mb-3">
                    Antardasha Sub-Periods
                  </div>
                  <div className="space-y-2">
                    {period.subPeriods.map((sub, i) => {
                      const subGraha = GRAHAS[sub.ruler];
                      const subColors = DASHA_COLORS[sub.ruler];
                      return (
                        <div
                          key={i}
                          className={`
                            flex items-center justify-between p-2 rounded-lg
                            bg-gradient-to-r ${subColors.bg} border ${subColors.border}
                            ${sub.isActive ? 'ring-1 ring-white/30' : sub.isPast ? 'opacity-40' : ''}
                          `}
                        >
                          <div className="flex items-center gap-2">
                            <span>{subGraha.symbol}</span>
                            <span className={`text-sm ${subColors.text}`}>
                              {subGraha.westernName}
                            </span>
                            {sub.isActive && (
                              <span className="px-1.5 py-0.5 bg-indigo-500/30 text-indigo-200 text-xs rounded">
                                Now
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-indigo-400/60">
                            {formatDate(sub.startDate)} – {formatDate(sub.endDate)}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
