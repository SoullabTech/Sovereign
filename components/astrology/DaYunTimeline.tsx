'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import DaYunPeriodCard from './DaYunPeriodCard';
import type { DaYunProfile, DaYunPeriod, Element, Gender } from '@/lib/astrology/types/daYun';

interface Props {
  birthDate?: string;
  birthTime?: string;
  gender?: Gender;
  compact?: boolean;
}

/** Element colors for timeline dots */
const ELEMENT_COLORS: Record<Element, string> = {
  Wood: '#10b981',   // emerald-500
  Fire: '#ef4444',   // red-500
  Earth: '#f59e0b',  // amber-500
  Metal: '#94a3b8',  // slate-400
  Water: '#3b82f6',  // blue-500
};

export default function DaYunTimeline({ birthDate, birthTime, gender, compact = false }: Props) {
  const [profile, setProfile] = useState<DaYunProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedPeriod, setExpandedPeriod] = useState<number | null>(null);

  useEffect(() => {
    if (!birthDate || !gender) {
      setLoading(false);
      return;
    }

    async function fetchDaYun() {
      try {
        setLoading(true);
        const response = await fetch('/api/astrology/da-yun', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            birthDate,
            birthTime,
            gender,
          }),
        });

        const result = await response.json();

        if (!result.success) {
          throw new Error(result.error || 'Failed to calculate Da Yun');
        }

        // Parse birthDate back to Date object
        const data = result.data;
        data.birthDate = new Date(data.birthDate);

        setProfile(data);
        setError(null);

        // Auto-expand current period
        const currentIndex = data.periods.findIndex((p: DaYunPeriod) => p.isActive);
        if (currentIndex !== -1) {
          setExpandedPeriod(currentIndex);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }

    fetchDaYun();
  }, [birthDate, birthTime, gender]);

  // Missing data state
  if (!birthDate || !gender) {
    return (
      <div className="bg-white/5 rounded-xl p-6 text-center">
        <p className="text-white/50 text-sm">
          Enter birth date and gender to see your 10-year luck cycles
        </p>
      </div>
    );
  }

  // Loading state
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

  // Error state
  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
        <p className="text-red-400 text-sm">{error}</p>
      </div>
    );
  }

  if (!profile) return null;

  // Compact view
  if (compact) {
    return (
      <div className="bg-gradient-to-br from-white/5 to-white/[0.02] rounded-xl p-4 border border-white/10">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-white/70">10-Year Luck Cycle</h3>
          <span className="text-xs text-white/40">Age {profile.currentAge}</span>
        </div>

        {/* Current period summary */}
        <div className="flex items-center gap-3 mb-3">
          <div
            className="w-3 h-3 rounded-full flex-shrink-0"
            style={{ backgroundColor: ELEMENT_COLORS[profile.currentPeriod.element] }}
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white/80">
              {profile.currentPeriod.stemChinese}{profile.currentPeriod.branchChinese} - {profile.currentPeriod.element} {profile.currentPeriod.zodiacAnimal}
            </p>
            <p className="text-xs text-white/50">{profile.currentPeriod.lifeTheme}</p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mb-2">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-white/50">
              Age {profile.currentPeriod.ageRange.start}-{profile.currentPeriod.ageRange.end}
            </span>
            <span className="text-amber-400/70">
              {Math.round(profile.periodProgress * 100)}%
            </span>
          </div>
          <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full"
              style={{ backgroundColor: ELEMENT_COLORS[profile.currentPeriod.element] }}
              initial={{ width: 0 }}
              animate={{ width: `${profile.periodProgress * 100}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />
          </div>
        </div>

        {/* Next period preview */}
        {profile.nextPeriod && (
          <div className="mt-3 pt-3 border-t border-white/10">
            <p className="text-xs text-white/40 mb-1">
              Next: Age {profile.nextPeriod.ageRange.start}+
            </p>
            <div className="flex items-center gap-2">
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: ELEMENT_COLORS[profile.nextPeriod.element] }}
              />
              <span className="text-sm text-white/60">
                {profile.nextPeriod.element} {profile.nextPeriod.zodiacAnimal}
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
          <h2 className="text-lg font-semibold text-white/90">Da Yun - 10-Year Luck Cycles</h2>
          <p className="text-sm text-white/50">
            Age {profile.currentAge} | {profile.cycleDirection === 'forward' ? 'Forward' : 'Backward'} cycle
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-white/70">
            Year {profile.yearsInCurrentPeriod + 1} of 10
          </p>
          <p className="text-xs text-white/40">
            {10 - profile.yearsInCurrentPeriod} years until next phase
          </p>
        </div>
      </div>

      {/* Three-column layout: Past | Present | Future */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Previous Period */}
        <div className={profile.previousPeriod ? '' : 'hidden md:block'}>
          {profile.previousPeriod ? (
            <div>
              <p className="text-xs text-white/40 uppercase tracking-wider mb-2">Where You've Been</p>
              <DaYunPeriodCard
                period={profile.previousPeriod}
                isExpanded={expandedPeriod === profile.periods.findIndex(p => p === profile.previousPeriod)}
                onToggle={() => {
                  const idx = profile.periods.findIndex(p => p === profile.previousPeriod);
                  setExpandedPeriod(expandedPeriod === idx ? null : idx);
                }}
              />
            </div>
          ) : (
            <div className="bg-white/5 rounded-xl p-4 flex items-center justify-center min-h-[160px]">
              <p className="text-white/30 text-sm">First life phase</p>
            </div>
          )}
        </div>

        {/* Current Period */}
        <div>
          <p className="text-xs text-amber-400/80 uppercase tracking-wider mb-2">Where You Are</p>
          <DaYunPeriodCard
            period={profile.currentPeriod}
            isExpanded={true}
            showFull={true}
          />
        </div>

        {/* Next Period */}
        <div className={profile.nextPeriod ? '' : 'hidden md:block'}>
          {profile.nextPeriod ? (
            <div>
              <p className="text-xs text-white/40 uppercase tracking-wider mb-2">Where You're Headed</p>
              <DaYunPeriodCard
                period={profile.nextPeriod}
                isExpanded={expandedPeriod === profile.periods.findIndex(p => p === profile.nextPeriod)}
                onToggle={() => {
                  const idx = profile.periods.findIndex(p => p === profile.nextPeriod);
                  setExpandedPeriod(expandedPeriod === idx ? null : idx);
                }}
              />
            </div>
          ) : (
            <div className="bg-white/5 rounded-xl p-4 flex items-center justify-center min-h-[160px]">
              <p className="text-white/30 text-sm">Final life phase</p>
            </div>
          )}
        </div>
      </div>

      {/* Full Timeline Bar */}
      <div className="bg-white/5 rounded-xl p-5 border border-white/10">
        <h3 className="text-sm font-medium text-white/70 mb-4">Life Timeline</h3>

        <div className="relative">
          {/* Timeline track */}
          <div className="h-2 bg-white/10 rounded-full overflow-hidden flex">
            {profile.periods.map((period, index) => (
              <motion.div
                key={index}
                className="relative flex-1 cursor-pointer group"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => setExpandedPeriod(expandedPeriod === index ? null : index)}
              >
                <div
                  className={`
                    h-full transition-all
                    ${period.isPast ? 'opacity-50' : period.isActive ? 'opacity-100' : 'opacity-30'}
                    group-hover:opacity-100
                  `}
                  style={{ backgroundColor: ELEMENT_COLORS[period.element] }}
                />
                {/* Current position marker */}
                {period.isActive && (
                  <motion.div
                    className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg border-2"
                    style={{
                      borderColor: ELEMENT_COLORS[period.element],
                      left: `${profile.periodProgress * 100}%`,
                      marginLeft: '-8px',
                    }}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.5, type: 'spring' }}
                  />
                )}
              </motion.div>
            ))}
          </div>

          {/* Age labels */}
          <div className="flex justify-between mt-2 text-xs text-white/40">
            <span>{profile.daYunStartAge}</span>
            {profile.periods.filter((_, i) => i % 2 === 1).map((period, i) => (
              <span key={i}>{period.ageRange.start}</span>
            ))}
            <span>{profile.periods[profile.periods.length - 1]?.ageRange.end}</span>
          </div>
        </div>

        {/* Expanded period detail */}
        {expandedPeriod !== null && expandedPeriod !== profile.periods.findIndex(p => p.isActive) && (
          <motion.div
            className="mt-4 pt-4 border-t border-white/10"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <DaYunPeriodCard
              period={profile.periods[expandedPeriod]}
              isExpanded={true}
              showFull={false}
            />
          </motion.div>
        )}
      </div>

      {/* Four Pillars Summary */}
      <div className="bg-white/5 rounded-xl p-5 border border-white/10">
        <h3 className="text-sm font-medium text-white/70 mb-4">Your Four Pillars (Ba Zi)</h3>

        <div className="grid grid-cols-4 gap-3">
          {(['year', 'month', 'day', 'hour'] as const).map((pillar) => {
            const p = profile.fourPillars[pillar];
            return (
              <div key={pillar} className="text-center">
                <p className="text-xs text-white/40 uppercase mb-1">{pillar}</p>
                <p className="text-xl font-light text-white/80">
                  {/* Find Chinese characters from stem/branch */}
                  {p.stem.charAt(0)}{p.branch.charAt(0)}
                </p>
                <p className="text-xs text-white/50">{p.stem}</p>
                <p className="text-xs text-white/50">{p.branch}</p>
                <div
                  className="mt-1 mx-auto w-2 h-2 rounded-full"
                  style={{ backgroundColor: ELEMENT_COLORS[p.element] }}
                  title={p.element}
                />
              </div>
            );
          })}
        </div>

        {/* Elemental Balance */}
        <div className="mt-4 pt-4 border-t border-white/10">
          <p className="text-xs text-white/40 mb-2">Elemental Balance</p>
          <div className="flex items-center gap-2">
            {(Object.entries(profile.fourPillars.elementTally) as [Element, number][]).map(([element, count]) => (
              <div key={element} className="flex-1">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: ELEMENT_COLORS[element] }}
                  />
                  <span className="text-xs text-white/60">{element}</span>
                </div>
                <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full"
                    style={{
                      backgroundColor: ELEMENT_COLORS[element],
                      width: `${(count / 8) * 100}%`,
                    }}
                  />
                </div>
                <p className="text-center text-xs text-white/40 mt-1">{count}</p>
              </div>
            ))}
          </div>

          {/* Dominant/Deficient */}
          <div className="mt-3 flex gap-4 text-xs">
            {profile.fourPillars.dominant.length > 0 && (
              <p className="text-emerald-400">
                Strong: {profile.fourPillars.dominant.join(', ')}
              </p>
            )}
            {profile.fourPillars.deficient.length > 0 && (
              <p className="text-orange-400">
                Needs cultivation: {profile.fourPillars.deficient.join(', ')}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
