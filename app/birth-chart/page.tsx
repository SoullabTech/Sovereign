'use client';

/**
 * Cosmic Blueprint - Birth Chart Calculator
 *
 * Professional-grade natal chart calculation with
 * Spiralogic interpretation framework.
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Sparkles, Sun, Moon, Star, ChevronDown, ChevronUp, RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { BirthDataForm } from '@/components/astrology/BirthDataForm';
import { SacredHouseWheel } from '@/components/astrology/SacredHouseWheel';
import { ElementalBalanceDisplay } from '@/components/astrology/ElementalBalanceDisplay';
import { MiniHoloflower } from '@/components/holoflower/MiniHoloflower';
import { getZodiacArchetype, generateArchetypalDescription } from '@/lib/astrology/archetypeLibrary';
import { getPlanetaryArchetype } from '@/lib/astrology/spiralogicMapping';
import { getSpiralogicHouseData } from '@/lib/astrology/spiralogicHouseMapping';
import { synthesizeAspect, AspectType } from '@/lib/astrology/aspectSynthesis';

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

// Elemental colors for planet insights
const elementalColors = {
  fire: { color: '#F5A362', glow: 'rgba(245, 163, 98, 0.3)' },
  water: { color: '#8BADD6', glow: 'rgba(139, 173, 214, 0.3)' },
  earth: { color: '#A8C69F', glow: 'rgba(168, 198, 159, 0.3)' },
  air: { color: '#F5D565', glow: 'rgba(245, 213, 101, 0.3)' },
};

export default function BirthChartPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [chartData, setChartData] = useState<BirthChartData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [expandedPlanet, setExpandedPlanet] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  // Load saved chart data from localStorage on mount
  useEffect(() => {
    const savedChartJson = localStorage.getItem('birthChartData');
    if (savedChartJson) {
      try {
        const savedChart = JSON.parse(savedChartJson);
        // Check if it has calculated chart data (not just birth input)
        if (savedChart.sun && savedChart.moon && savedChart.ascendant) {
          setChartData(savedChart);
        }
      } catch (e) {
        console.error('Error loading saved chart:', e);
      }
    }
  }, []);

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
        setShowForm(false);
        // Save to localStorage for persistence
        localStorage.setItem('birthChartData', JSON.stringify(result.data));
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

  const handleNewChart = () => {
    setChartData(null);
    setShowForm(true);
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

          <div className="flex items-center gap-4">
            {chartData && !showForm && (
              <button
                onClick={handleNewChart}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-violet-500/10
                         border border-violet-500/20 text-violet-300 hover:bg-violet-500/20 transition-all text-sm"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                New Chart
              </button>
            )}
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#D4B896]" />
              <span className="text-[#D4B896]/60 text-sm">Cosmic Blueprint</span>
            </div>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {!chartData || showForm ? (
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
                <div className="bg-black/30 rounded-xl p-6 border border-[#D4B896]/20 overflow-visible relative" style={{ zIndex: 10 }}>
                  <h3 className="text-[#D4B896] font-medium mb-4 text-center">House Wheel</h3>
                  <p className="text-white/40 text-xs mb-4 text-center italic">Click a planet on the wheel for insights</p>
                  <SacredHouseWheel
                    planets={chartDataToPlanets(chartData)}
                    aspects={(chartData.aspects || [])
                      .filter((a): a is typeof a & { type: 'conjunction' | 'sextile' | 'square' | 'trine' | 'opposition' } =>
                        ['conjunction', 'sextile', 'square', 'trine', 'opposition'].includes(a.type)
                      )}
                    isDayMode={false}
                    layoutMode="traditional"
                    className="max-h-[500px]"
                  />
                </div>

                {/* Planetary Positions - Clickable with Insights */}
                <div className="bg-black/30 rounded-xl p-6 border border-[#D4B896]/20">
                  <h3 className="text-[#D4B896] font-medium mb-4">Planetary Positions</h3>
                  <p className="text-white/40 text-xs mb-4 italic">Click a planet to reveal archetypal insights</p>
                  <div className="space-y-1 text-sm">
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
                    ].map(({ name, icon, data }) => {
                      const isExpanded = expandedPlanet === name;
                      const zodiacArchetype = data?.sign ? getZodiacArchetype(data.sign) : null;
                      const planetArchetype = getPlanetaryArchetype(name);
                      const houseData = data?.house ? getSpiralogicHouseData(data.house) : null;
                      const element = zodiacArchetype?.element || 'fire';
                      const elementStyle = elementalColors[element as keyof typeof elementalColors];
                      const planetAspects = chartData.aspects?.filter(
                        a => a.planet1 === name || a.planet2 === name
                      ) || [];

                      return (
                        <div key={name}>
                          {/* Planet Row - Clickable */}
                          <div
                            className={`flex items-center justify-between py-2 px-2 rounded-lg cursor-pointer transition-all duration-200 ${
                              isExpanded
                                ? 'bg-[#D4B896]/10 border border-[#D4B896]/30'
                                : 'hover:bg-white/5 border border-transparent'
                            }`}
                            onClick={() => setExpandedPlanet(isExpanded ? null : name)}
                          >
                            <span className="text-white/70 flex items-center gap-2">
                              <span className="text-lg">{icon}</span>
                              {name}
                              {data?.retrograde && <span className="text-red-400 text-xs">℞</span>}
                            </span>
                            <div className="flex items-center gap-2">
                              <span className="text-[#D4B896]">
                                {data?.sign} {data?.degree?.toFixed(1)}°
                                <span className="text-white/40 ml-2">H{data?.house}</span>
                              </span>
                              {isExpanded ? (
                                <ChevronUp className="w-4 h-4 text-[#D4B896]/60" />
                              ) : (
                                <ChevronDown className="w-4 h-4 text-white/30" />
                              )}
                            </div>
                          </div>

                          {/* Expanded Insight Panel */}
                          <AnimatePresence>
                            {isExpanded && data?.sign && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.2 }}
                                className="overflow-hidden"
                              >
                                <div
                                  className="mx-2 mb-3 p-4 rounded-lg border"
                                  style={{
                                    background: `linear-gradient(135deg, ${elementStyle.color}10, transparent)`,
                                    borderColor: `${elementStyle.color}30`,
                                  }}
                                >
                                  {/* Element & Modality Tags */}
                                  <div className="flex items-center gap-2 mb-3">
                                    <span
                                      className="px-2 py-0.5 rounded-full text-xs font-medium uppercase tracking-wide"
                                      style={{ background: `${elementStyle.color}20`, color: elementStyle.color }}
                                    >
                                      {zodiacArchetype?.element || 'Unknown'}
                                    </span>
                                    <span className="px-2 py-0.5 rounded-full text-xs bg-white/10 text-white/60 uppercase tracking-wide">
                                      {zodiacArchetype?.modality || 'Unknown'}
                                    </span>
                                    {zodiacArchetype?.temperament && (
                                      <span className="px-2 py-0.5 rounded-full text-xs bg-purple-500/20 text-purple-300 uppercase tracking-wide">
                                        {zodiacArchetype.temperament}
                                      </span>
                                    )}
                                  </div>

                                  {/* Two Column Grid */}
                                  <div className="grid grid-cols-2 gap-4">
                                    {/* Left - Archetype Info */}
                                    <div className="space-y-3">
                                      {/* Planetary Archetype */}
                                      <div>
                                        <h5 className="text-xs uppercase tracking-wider text-white/50 mb-1">
                                          {name} Archetype
                                        </h5>
                                        <p className="text-white/90 text-sm font-medium">
                                          {planetArchetype?.archetype || 'The Guide'}
                                        </p>
                                        <p className="text-white/50 text-xs mt-1">
                                          {planetArchetype?.description}
                                        </p>
                                      </div>

                                      {/* Sign Facet */}
                                      <div>
                                        <h5 className="text-xs uppercase tracking-wider text-white/50 mb-1">
                                          {data.sign} Expression
                                        </h5>
                                        <p className="text-[#D4B896] text-sm font-medium">
                                          {zodiacArchetype?.facetName}
                                        </p>
                                        {zodiacArchetype?.archetypes?.jungian && (
                                          <p className="text-white/50 text-xs mt-1">
                                            <span className="text-white/30">Archetypes:</span>{' '}
                                            {zodiacArchetype.archetypes.jungian.slice(0, 2).join(', ')}
                                          </p>
                                        )}
                                        {zodiacArchetype?.archetypes?.mythological && (
                                          <p className="text-white/50 text-xs mt-1 italic">
                                            <span className="text-white/30">Mythology:</span>{' '}
                                            {zodiacArchetype.archetypes.mythological.slice(0, 2).join(', ')}
                                          </p>
                                        )}
                                      </div>
                                    </div>

                                    {/* Right - House & Aspects */}
                                    <div className="space-y-3">
                                      {/* House Activation */}
                                      {houseData && (
                                        <div>
                                          <h5 className="text-xs uppercase tracking-wider text-white/50 mb-1">
                                            House {data.house} Activation
                                          </h5>
                                          <p className="text-white/90 text-sm font-medium">
                                            {houseData.facet}
                                          </p>
                                          <p className="text-white/50 text-xs mt-1">
                                            {houseData.lesson}
                                          </p>
                                        </div>
                                      )}

                                      {/* Aspects */}
                                      {planetAspects.length > 0 && (
                                        <div>
                                          <h5 className="text-xs uppercase tracking-wider text-white/50 mb-1">
                                            Connections ({planetAspects.length})
                                          </h5>
                                          <div className="space-y-1">
                                            {planetAspects.slice(0, 3).map((aspect, idx) => {
                                              const otherPlanet = aspect.planet1 === name ? aspect.planet2 : aspect.planet1;
                                              const aspectSynthesis = synthesizeAspect(
                                                name,
                                                otherPlanet,
                                                aspect.type as AspectType
                                              );
                                              return (
                                                <div key={idx} className="text-xs">
                                                  <span className={`font-medium ${
                                                    aspect.type === 'conjunction' ? 'text-amber-400' :
                                                    aspect.type === 'trine' ? 'text-blue-400' :
                                                    aspect.type === 'square' ? 'text-red-400' :
                                                    aspect.type === 'opposition' ? 'text-purple-400' :
                                                    'text-green-400'
                                                  }`}>
                                                    {aspect.type}
                                                  </span>
                                                  <span className="text-white/50"> with {otherPlanet}</span>
                                                  {aspectSynthesis?.coreQuestion && (
                                                    <p className="text-white/40 text-xs italic mt-0.5 pl-2 border-l border-white/10">
                                                      {aspectSynthesis.coreQuestion}
                                                    </p>
                                                  )}
                                                </div>
                                              );
                                            })}
                                            {planetAspects.length > 3 && (
                                              <p className="text-white/30 text-xs italic">
                                                +{planetAspects.length - 3} more
                                              </p>
                                            )}
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  </div>

                                  {/* Synthesis Quote */}
                                  {generateArchetypalDescription(name, data.sign, data.house) && (
                                    <div className="mt-3 pt-3 border-t border-white/10">
                                      <p className="text-xs italic text-[#D4B896]/80">
                                        "{generateArchetypalDescription(name, data.sign, data.house)}"
                                      </p>
                                    </div>
                                  )}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}
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
