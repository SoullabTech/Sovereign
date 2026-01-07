'use client';

/**
 * Cosmic Blueprint - Birth Chart Calculator
 *
 * Professional-grade natal chart calculation with
 * Spiralogic interpretation framework.
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Sparkles, Sun, Moon, Star } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { BirthDataForm } from '@/components/astrology/BirthDataForm';
import { SacredHouseWheel } from '@/components/astrology/SacredHouseWheel';
import { ElementalBalanceDisplay } from '@/components/astrology/ElementalBalanceDisplay';
import { MiniHoloflower } from '@/components/holoflower/MiniHoloflower';

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

// Element mapping for signs
const signElements: Record<string, string> = {
  Aries: 'fire', Leo: 'fire', Sagittarius: 'fire',
  Taurus: 'earth', Virgo: 'earth', Capricorn: 'earth',
  Gemini: 'air', Libra: 'air', Aquarius: 'air',
  Cancer: 'water', Scorpio: 'water', Pisces: 'water',
};

// Transform chartData into planets array for SacredHouseWheel
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

function calculateElementalBalance(chart: BirthChartData) {
  const elements = { fire: 0, earth: 0, air: 0, water: 0 };
  const planets = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn'];

  planets.forEach(planet => {
    const pos = chart[planet as keyof BirthChartData] as PlanetPosition;
    if (pos?.sign) {
      const element = signElements[pos.sign];
      if (element) elements[element as keyof typeof elements]++;
    }
  });

  const total = Object.values(elements).reduce((a, b) => a + b, 0);
  return {
    fire: total > 0 ? elements.fire / total : 0.25,
    earth: total > 0 ? elements.earth / total : 0.25,
    air: total > 0 ? elements.air / total : 0.25,
    water: total > 0 ? elements.water / total : 0.25,
  };
}

export default function BirthChartPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [chartData, setChartData] = useState<BirthChartData | null>(null);
  const [error, setError] = useState<string | null>(null);

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

  const elementalBalance = chartData ? calculateElementalBalance(chartData) : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f1419] via-[#1a1f2e] to-[#16213e]">
      <div className="max-w-6xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => router.push('/labtools')}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#D4B896]/10
                     border border-[#D4B896]/20 text-[#D4B896] hover:bg-[#D4B896]/20 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Lab Tools
          </button>

          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#D4B896]" />
            <span className="text-[#D4B896]/60 text-sm">Cosmic Blueprint</span>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {!chartData ? (
            /* Birth Data Form */
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-2xl mx-auto"
            >
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
            </motion.div>
          ) : (
            /* Chart Results */
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              {/* Summary Header */}
              <div className="text-center">
                <div className="inline-flex items-center gap-3 mb-4">
                  <MiniHoloflower size={64} isDayMode={false} />
                </div>
                <h1 className="text-2xl font-serif text-[#D4B896] mb-2">Your Cosmic Blueprint</h1>
                <p className="text-white/60">
                  <span className="text-[#D4B896]">{chartData.sun.sign}</span> Sun ·
                  <span className="text-[#D4B896]"> {chartData.moon.sign}</span> Moon ·
                  <span className="text-[#D4B896]"> {chartData.ascendant.sign}</span> Rising
                </p>
              </div>

              {/* Main Grid */}
              <div className="grid md:grid-cols-2 gap-8">

                {/* House Wheel */}
                <div className="bg-black/30 rounded-xl p-6 border border-[#D4B896]/20">
                  <h3 className="text-[#D4B896] font-medium mb-4 text-center">House Wheel</h3>
                  <SacredHouseWheel
                    planets={chartDataToPlanets(chartData)}
                    aspects={(chartData.aspects || [])
                      .filter((a): a is typeof a & { type: 'conjunction' | 'sextile' | 'square' | 'trine' | 'opposition' } =>
                        ['conjunction', 'sextile', 'square', 'trine', 'opposition'].includes(a.type)
                      )}
                    isDayMode={false}
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
                  <ElementalBalanceDisplay
                    balance={elementalBalance}
                  />
                </div>
              )}

              {/* Aspects */}
              {chartData.aspects && chartData.aspects.length > 0 && (
                <div className="bg-black/30 rounded-xl p-6 border border-[#D4B896]/20">
                  <h3 className="text-[#D4B896] font-medium mb-4">Major Aspects</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                    {chartData.aspects
                      .filter(a => a.orb < 5)
                      .slice(0, 12)
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

              {/* Calculate Another */}
              <div className="text-center">
                <button
                  onClick={() => setChartData(null)}
                  className="px-6 py-3 bg-[#D4B896]/20 border border-[#D4B896]/40 rounded-lg
                           text-[#D4B896] hover:bg-[#D4B896]/30 transition-all"
                >
                  Calculate Another Chart
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
