'use client';

/**
 * Standalone Birth Chart Calculator - Funnel Landing Page
 *
 * chart.soullab.life entry point
 * Free: Basic chart positions
 * Signup: Archetypal overlays (34 years of research)
 * Premium: Ask MAIA about your chart
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Lock, MessageCircle, Star, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { BirthDataForm } from '@/components/astrology/BirthDataForm';
import { TraditionalHouseWheel } from '@/components/astrology/TraditionalHouseWheel';
import { ElementalBalanceDisplay } from '@/components/astrology/ElementalBalanceDisplay';
import {
  chartPositionsFromSignDegrees,
  interpretDominance,
  type DominanceVerdict,
} from '@/lib/spiralogic/interpretation';

interface PlanetPosition {
  sign: string;
  degree: number;
  house: number;
  retrograde?: boolean;
}

interface BirthChartData {
  sun: PlanetPosition;
  moon: PlanetPosition;
  mercury: PlanetPosition;
  venus: PlanetPosition;
  mars: PlanetPosition;
  jupiter: PlanetPosition;
  saturn: PlanetPosition;
  uranus: PlanetPosition;
  neptune: PlanetPosition;
  pluto: PlanetPosition;
  chiron: PlanetPosition;
  northNode: PlanetPosition;
  southNode: PlanetPosition;
  ascendant: { sign: string; degree: number };
  midheaven: { sign: string; degree: number };
  houses: number[];
  aspects: Array<{
    planet1: string;
    planet2: string;
    type: string;
    orb: number;
    exact?: boolean;
  }>;
}

function chartDataToPlanets(chart: BirthChartData) {
  const planetKeys = [
    { key: 'sun', name: 'Sun' },
    { key: 'moon', name: 'Moon' },
    { key: 'mercury', name: 'Mercury' },
    { key: 'venus', name: 'Venus' },
    { key: 'mars', name: 'Mars' },
    { key: 'jupiter', name: 'Jupiter' },
    { key: 'saturn', name: 'Saturn' },
    { key: 'uranus', name: 'Uranus' },
    { key: 'neptune', name: 'Neptune' },
    { key: 'pluto', name: 'Pluto' },
    { key: 'chiron', name: 'Chiron' },
    { key: 'northNode', name: 'North Node' },
  ];

  return planetKeys
    .map(({ key, name }) => {
      const pos = chart[key as keyof BirthChartData] as PlanetPosition;
      if (!pos?.sign) return null;
      return {
        name,
        sign: pos.sign,
        house: pos.house || 1,
        degree: pos.degree || 0,
      };
    })
    .filter(Boolean) as { name: string; sign: string; house: number; degree: number }[];
}

/**
 * Distribution + dominance from the ratified substrate: registerChart
 * (the grammar — ten Q1 bodies, all weights 1.0) via interpretDominance
 * (the single versioned rule, C-fence). This replaces the page's former
 * local 7-body count — the fourth independent distribution computation
 * in the codebase — and its always-crowning display path.
 */
function interpretChartDominance(chart: BirthChartData): DominanceVerdict | null {
  try {
    return interpretDominance(chartPositionsFromSignDegrees(chart));
  } catch {
    // Refuse-not-repair at the UI boundary: an unregistrable chart renders
    // absence (no bars, no crown), never invented data.
    return null;
  }
}

export default function ChartLandingPage() {
  const [loading, setLoading] = useState(false);
  const [chartData, setChartData] = useState<BirthChartData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showSignupPrompt, setShowSignupPrompt] = useState(false);

  const handleCalculate = async (data: any) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/astrology/birth-chart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, houseSystem: 'porphyry' }),
      });

      const result = await response.json();

      if (result.success && result.data) {
        setChartData(result.data);
      } else {
        setError(result.error || 'Failed to calculate chart');
      }
    } catch (err) {
      setError('Connection error. Please try again.');
      console.error('Chart calculation error:', err);
    } finally {
      setLoading(false);
    }
  };

  const dominanceVerdict = chartData ? interpretChartDominance(chartData) : null;
  // Raw element weights from the grammar's distribution; the display
  // normalizes to presentation percentages at its boundary.
  const elementalBalance = dominanceVerdict ? dominanceVerdict.elementWeights : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0d12] via-[#111827] to-[#0f172a]">
      {/* Minimal Header */}
      <header className="border-b border-white/5">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="https://soullab.life" className="flex items-center gap-2 text-[#D4B896] hover:text-[#E5C9A7] transition-colors">
            <Sparkles className="w-5 h-5" />
            <span className="font-serif text-lg">Soullab</span>
          </Link>
          <Link
            href="/signin"
            className="text-sm text-white/60 hover:text-[#D4B896] transition-colors"
          >
            Sign in
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          {!chartData ? (
            /* Landing + Form */
            <motion.div
              key="landing"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-12"
            >
              {/* Hero Section */}
              <div className="text-center max-w-3xl mx-auto pt-8">
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  <h1 className="text-4xl md:text-5xl font-serif text-white mb-4">
                    Your <span className="text-[#D4B896]">Cosmic Blueprint</span>
                  </h1>
                  <p className="text-xl text-white/60 mb-2">
                    Professional-grade natal chart calculation
                  </p>
                  <p className="text-white/40 text-sm">
                    Powered by astronomical ephemeris data, not generic horoscopes
                  </p>
                </motion.div>
              </div>

              {/* Form */}
              <div className="max-w-2xl mx-auto">
                <BirthDataForm onSubmit={handleCalculate} loading={loading} />

                {error && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-center"
                  >
                    {error}
                  </motion.div>
                )}
              </div>

              {/* Trust Signals */}
              <div className="flex flex-wrap justify-center gap-8 text-white/40 text-sm">
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-[#D4B896]/60" />
                  <span>Swiss Ephemeris precision</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-[#D4B896]/60" />
                  <span>All 12 houses calculated</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-[#D4B896]/60" />
                  <span>Major aspects included</span>
                </div>
              </div>
            </motion.div>
          ) : (
            /* Results */
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              {/* Summary Header */}
              <div className="text-center">
                <h1 className="text-3xl font-serif text-[#D4B896] mb-2">Your Cosmic Blueprint</h1>
                <p className="text-xl text-white/80">
                  <span className="text-[#D4B896]">{chartData.sun.sign}</span> Sun ·
                  <span className="text-[#D4B896]"> {chartData.moon.sign}</span> Moon ·
                  <span className="text-[#D4B896]"> {chartData.ascendant.sign}</span> Rising
                </p>
              </div>

              {/* Chart Display */}
              <div className="grid md:grid-cols-2 gap-8">
                {/* House Wheel - Traditional Format */}
                <div className="bg-black/30 rounded-xl p-6 border border-[#D4B896]/20">
                  <h3 className="text-[#D4B896] font-medium mb-4 text-center">Natal Chart</h3>
                  <TraditionalHouseWheel
                    planets={chartDataToPlanets(chartData)}
                    aspects={(chartData.aspects || [])
                      .filter((a): a is typeof a & { type: 'conjunction' | 'sextile' | 'square' | 'trine' | 'opposition' } =>
                        ['conjunction', 'sextile', 'square', 'trine', 'opposition'].includes(a.type)
                      )}
                    ascendantSign={chartData.ascendant.sign}
                    isDayMode={false}
                    showAspects={true}
                  />
                </div>

                {/* Planetary Positions */}
                <div className="bg-black/30 rounded-xl p-6 border border-[#D4B896]/20">
                  <h3 className="text-[#D4B896] font-medium mb-4">Planetary Positions</h3>
                  <div className="space-y-2 text-sm">
                    {[
                      { name: 'Sun', icon: '☉', data: chartData.sun },
                      { name: 'Moon', icon: '☽', data: chartData.moon },
                      { name: 'Mercury', icon: '☿', data: chartData.mercury },
                      { name: 'Venus', icon: '♀', data: chartData.venus },
                      { name: 'Mars', icon: '♂', data: chartData.mars },
                      { name: 'Jupiter', icon: '♃', data: chartData.jupiter },
                      { name: 'Saturn', icon: '♄', data: chartData.saturn },
                      { name: 'Uranus', icon: '♅', data: chartData.uranus },
                      { name: 'Neptune', icon: '♆', data: chartData.neptune },
                      { name: 'Pluto', icon: '♇', data: chartData.pluto },
                      { name: 'Chiron', icon: '⚷', data: chartData.chiron },
                      { name: 'North Node', icon: '☊', data: chartData.northNode },
                    ].map(({ name, icon, data }) => (
                      <div key={name} className="flex items-center justify-between py-1 border-b border-white/5">
                        <span className="text-white/70">
                          <span className="text-lg mr-2">{icon}</span>
                          {name}
                          {data?.retrograde && <span className="text-red-400 ml-1">℞</span>}
                        </span>
                        <span className="text-[#D4B896]">
                          {data?.sign} {data?.degree?.toFixed(1)}°
                          <span className="text-white/40 ml-2">H{data?.house}</span>
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Elemental Balance */}
              {elementalBalance && (
                <div className="bg-black/30 rounded-xl p-6 border border-[#D4B896]/20">
                  <h3 className="text-[#D4B896] font-medium mb-4 text-center">Elemental Balance</h3>
                  <ElementalBalanceDisplay balance={elementalBalance} verdict={dominanceVerdict} />
                </div>
              )}

              {/* Aspects Preview */}
              {chartData.aspects && chartData.aspects.length > 0 && (
                <div className="bg-black/30 rounded-xl p-6 border border-[#D4B896]/20">
                  <h3 className="text-[#D4B896] font-medium mb-4">Major Aspects</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                    {chartData.aspects
                      .filter(a => a.orb < 5)
                      .slice(0, 6)
                      .map((aspect, i) => (
                        <div key={i} className="flex items-center gap-2 text-white/70">
                          <span>{aspect.planet1}</span>
                          <span className={`text-xs px-1 rounded ${
                            aspect.type === 'conjunction' ? 'bg-purple-500/30 text-purple-300' :
                            aspect.type === 'trine' ? 'bg-green-500/30 text-green-300' :
                            aspect.type === 'square' ? 'bg-red-500/30 text-red-300' :
                            aspect.type === 'opposition' ? 'bg-orange-500/30 text-orange-300' :
                            'bg-blue-500/30 text-blue-300'
                          }`}>
                            {aspect.type}
                          </span>
                          <span>{aspect.planet2}</span>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* === FUNNEL CTAs === */}
              <div className="space-y-4 pt-4">
                {/* Unlock Archetypes CTA */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="bg-gradient-to-r from-[#D4B896]/10 to-[#D4B896]/5 rounded-xl p-6 border border-[#D4B896]/30"
                >
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-[#D4B896]/20 rounded-lg">
                      <Lock className="w-6 h-6 text-[#D4B896]" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-white mb-1">
                        Unlock Archetypal Interpretations
                      </h3>
                      <p className="text-white/60 text-sm mb-3">
                        Click any planet to reveal its mythological lineage, Jungian archetypes,
                        and soul questions. Based on 34 years of archetypal research.
                      </p>
                      <div className="flex flex-wrap gap-2 text-xs text-white/40 mb-4">
                        <span className="px-2 py-1 bg-white/5 rounded">Prometheus</span>
                        <span className="px-2 py-1 bg-white/5 rounded">The Hero</span>
                        <span className="px-2 py-1 bg-white/5 rounded">Joan of Arc</span>
                        <span className="px-2 py-1 bg-white/5 rounded">Trust vs. Mistrust</span>
                      </div>
                      <Link
                        href="/signin"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-[#D4B896] text-black rounded-lg font-medium hover:bg-[#E5C9A7] transition-colors"
                      >
                        Create Free Account
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </motion.div>

                {/* Ask MAIA CTA */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  className="bg-gradient-to-r from-purple-500/10 to-indigo-500/10 rounded-xl p-6 border border-purple-500/30"
                >
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-purple-500/20 rounded-lg">
                      <MessageCircle className="w-6 h-6 text-purple-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-white mb-1">
                        Ask MAIA About Your Chart
                      </h3>
                      <p className="text-white/60 text-sm mb-3">
                        Get personalized insights about your natal chart and current transits.
                        MAIA understands your cosmic blueprint and can guide you through its meaning.
                      </p>
                      <Link
                        href="/signin"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/20 text-purple-300 border border-purple-500/40 rounded-lg font-medium hover:bg-purple-500/30 transition-colors"
                      >
                        Meet MAIA
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Calculate Another */}
              <div className="text-center pt-4">
                <button
                  onClick={() => setChartData(null)}
                  className="text-white/40 hover:text-white/60 text-sm transition-colors"
                >
                  Calculate another chart
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 mt-16">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-white/40">
            <div>
              <Link href="https://soullab.life" className="text-[#D4B896] hover:text-[#E5C9A7]">
                Soullab
              </Link>
              {' '}&middot; Sacred consciousness technology
            </div>
            <div className="flex gap-6">
              <Link href="/faq" className="hover:text-white/60">FAQ</Link>
              <Link href="https://soullab.life/maia/community/commons" className="hover:text-white/60">Community</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
