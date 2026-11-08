/**
 * The Vedic reading as presentational panels: the profile (Moon, Sun and
 * ascendant signs, birth nakshatra, current dasha, Spiralogic integration) and
 * the planets (grahas). They take a computed chart and profile and nothing about
 * the person, so the Free Vedic page (computed in the browser's request) and the
 * Pro Vedic room (computed on the server, no birth details sent) show the same
 * thing.
 */
'use client';

import { Moon, Sun, Sparkles, Clock, ChevronRight } from 'lucide-react';
import NakshatraCard from '@/components/astrology/NakshatraCard';
import DashaTimeline from '@/components/astrology/DashaTimeline';
import type { CompleteVedicProfile, RashiInfo, GrahaPosition, GrahaName, VedicChart } from '@/lib/astrology/types/vedic';
import { GRAHAS } from '@/lib/astrology/types/vedic';

// Sub-component for Rashi display
export function RashiCard({
  title,
  subtitle,
  rashi,
  highlight = false,
}: {
  title: string;
  subtitle: string;
  rashi: RashiInfo;
  highlight?: boolean;
}) {
  const elementColors: Record<string, string> = {
    fire: 'from-orange-900/40 to-red-900/40 border-orange-500/30',
    water: 'from-blue-900/40 to-indigo-900/40 border-blue-500/30',
    earth: 'from-emerald-900/40 to-green-900/40 border-emerald-500/30',
    air: 'from-cyan-900/40 to-sky-900/40 border-cyan-500/30',
  };

  const colors = elementColors[rashi.spiralogicElement] || elementColors.fire;

  return (
    <div
      className={`
        bg-gradient-to-br ${colors} border rounded-xl p-5
        ${highlight ? 'ring-2 ring-indigo-500/50' : ''}
      `}
    >
      <div className="text-xs text-indigo-400/60 uppercase tracking-wider">{title}</div>
      <div className="text-xs text-indigo-400/40 mb-3">{subtitle}</div>

      <div className="flex items-center gap-3">
        <span className="text-3xl">{rashi.symbol}</span>
        <div>
          <div className="text-lg font-semibold text-indigo-100">
            {rashi.name}
          </div>
          <div className="text-sm text-indigo-400/70">
            {rashi.westernEquivalent} • {rashi.sanskrit}
          </div>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <span className="px-2 py-0.5 bg-indigo-900/40 rounded text-xs text-indigo-300">
          {rashi.element}
        </span>
        <span className="px-2 py-0.5 bg-indigo-900/40 rounded text-xs text-indigo-300">
          {rashi.quality}
        </span>
        <span className="px-2 py-0.5 bg-indigo-900/40 rounded text-xs text-indigo-300">
          {GRAHAS[rashi.ruler].westernName}
        </span>
      </div>
    </div>
  );
}

// Sub-component for Graha (planet) display
export function GrahaCard({ position }: { position: GrahaPosition }) {
  const graha = position.graha;

  const dignityColors: Record<string, string> = {
    exalted: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    moolatrikona: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    own: 'bg-green-500/20 text-green-300 border-green-500/30',
    friendly: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
    neutral: 'bg-gray-500/20 text-gray-300 border-gray-500/30',
    enemy: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
    debilitated: 'bg-red-500/20 text-red-300 border-red-500/30',
  };

  return (
    <div className="bg-gradient-to-br from-stone-900/80 to-indigo-950/40 border border-indigo-900/30 rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">{graha.symbol}</span>
          <div>
            <div className="text-sm font-semibold text-indigo-200">
              {graha.westernName}
            </div>
            <div className="text-xs text-indigo-400/60">
              {graha.name} • {graha.sanskrit}
            </div>
          </div>
        </div>
        {position.retrograde && (
          <span className="px-1.5 py-0.5 bg-purple-500/20 text-purple-300 text-xs rounded">
            R
          </span>
        )}
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-indigo-400/60">Sign</span>
          <span className="text-indigo-200">
            {position.rashi.name} {position.rashiDegree.toFixed(1)}°
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-indigo-400/60">Nakshatra</span>
          <span className="text-indigo-200">
            {position.nakshatra.name} P{position.nakshatraPada}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-indigo-400/60">House</span>
          <span className="text-indigo-200">
            {position.house}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-indigo-400/60">Dignity</span>
          <span className={`px-2 py-0.5 rounded text-xs border ${dignityColors[position.dignity]}`}>
            {position.dignity}
          </span>
        </div>
      </div>
    </div>
  );
}

/** Profile view: signs, birth nakshatra, current dasha, Spiralogic integration, ayanamsa note. */
export function VedicProfilePanel({
  profile, displayTimeZone = 'UTC', onViewDasha,
}: { profile: CompleteVedicProfile; displayTimeZone?: string; onViewDasha?: () => void }) {
  return (
    <div className="space-y-6">
{/* Core Identity - Moon Sign */}
    <div className="grid md:grid-cols-3 gap-4">
      <RashiCard
        title="Moon Sign"
        subtitle="Primary lunar reference"
        rashi={profile.moonSign}
        highlight
      />
      <RashiCard
        title="Sun Sign"
        subtitle="Surya Rashi"
        rashi={profile.sunSign}
      />
      <RashiCard
        title="Ascendant"
        subtitle="Lagna"
        rashi={profile.ascendantSign}
      />
    </div>

    {/* Birth Nakshatra */}
    <div>
      <h3 className="text-lg font-semibold text-indigo-200 mb-4 flex items-center gap-2">
        <Moon className="w-5 h-5 text-indigo-400" />
        Birth Nakshatra (Lunar Mansion)
      </h3>
      <NakshatraCard
        nakshatra={profile.birthNakshatra}
        pada={profile.chart.grahas.Chandra.nakshatraPada}
        highlight
      />
    </div>

    {/* Current Dasha Preview */}
    <div>
      <h3 className="text-lg font-semibold text-indigo-200 mb-4 flex items-center gap-2">
        <Clock className="w-5 h-5 text-indigo-400" />
        {profile.dasha ? 'Current Dasha Period' : 'Dasha Timeline'}
      </h3>
      {profile.dasha ? (
        <>
          <DashaTimeline
            profile={profile.dasha}
            displayTimeZone={displayTimeZone}
            compact
          />
          {onViewDasha && (
            <button
              onClick={onViewDasha}
              className="mt-3 text-sm text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
            >
              View full timeline
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </>
      ) : (
        <div className="bg-indigo-900/20 border border-indigo-700/30 rounded-xl p-4 text-sm text-indigo-400/70">
          A recorded birth time is required. The resulting timeline remains provisional and unqualified.
        </div>
      )}
    </div>

    {/* Spiralogic Integration */}
    <div className="bg-amber-900/20 border border-amber-700/30 rounded-xl p-6">
      <div className="flex items-center gap-2 text-amber-400 mb-3">
        <Sparkles className="w-5 h-5" />
        <h3 className="text-lg font-semibold">Spiralogic Integration</h3>
      </div>
      <p className="text-amber-300/80 leading-relaxed">
        {profile.spiralogicIntegration.integration}
      </p>
      <div className="mt-3 flex items-center gap-2">
        <span className="px-3 py-1 bg-amber-900/40 border border-amber-600/30 rounded-full text-xs text-amber-300">
          {profile.spiralogicIntegration.element.charAt(0).toUpperCase() + profile.spiralogicIntegration.element.slice(1)} Element
        </span>
        <span className="px-3 py-1 bg-amber-900/40 border border-amber-600/30 rounded-full text-xs text-amber-300">
          {profile.spiralogicIntegration.pathway}
        </span>
      </div>
    </div>

    {/* Ayanamsa Info */}
    <div className="text-center text-xs text-indigo-400/50">
      Soullab provisional approximation to {profile.chart.ayanamsa.label} ({profile.chart.ayanamsaValue.toFixed(2)}°); not reference-certified
    </div>
    </div>
  );
}

/** Planets view: one card per graha. */
export function VedicPlanetsPanel({ chart }: { chart: VedicChart }) {
  return (
    <div className="space-y-6">
    <h3 className="text-lg font-semibold text-indigo-200 flex items-center gap-2">
      <Sun className="w-5 h-5 text-indigo-400" />
      Planetary Positions (Grahas)
    </h3>

    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
      {(Object.keys(chart.grahas) as GrahaName[]).map((name) => {
        const position = chart.grahas[name];
        return (
          <GrahaCard key={name} position={position} />
        );
      })}
    </div>
    </div>
  );
}
