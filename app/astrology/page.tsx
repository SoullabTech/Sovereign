'use client';

/**
 * The Blueprint - Your Cosmic Spiral
 *
 * A living map of consciousness woven through celestial rhythms.
 * Not a dashboard — a threshold into archetypal wisdom.
 *
 * This is the SINGLE SOURCE for birth chart setup and display.
 * - If no birth data: shows setup form
 * - If birth data exists: shows full chart + insights
 */

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Sparkles, Sparkle, TrendingUp, Settings2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { ElementalBalanceDisplay } from '@/components/astrology/ElementalBalanceDisplay';
import { BirthDataForm } from '@/components/astrology/BirthDataForm';
import { getZodiacArchetype } from '@/lib/astrology/archetypeLibrary';

interface BirthChartData {
  sun: { sign: string; degree: number; house: number; retrograde?: boolean };
  moon: { sign: string; degree: number; house: number; retrograde?: boolean };
  mercury?: { sign: string; degree: number; house: number; retrograde?: boolean };
  venus?: { sign: string; degree: number; house: number; retrograde?: boolean };
  mars?: { sign: string; degree: number; house: number; retrograde?: boolean };
  jupiter?: { sign: string; degree: number; house: number; retrograde?: boolean };
  saturn?: { sign: string; degree: number; house: number; retrograde?: boolean };
  ascendant: { sign: string; degree: number };
  midheaven?: { sign: string; degree: number };
  northNode?: { sign: string; degree: number; house: number };
  southNode?: { sign: string; degree: number; house: number };
  aspects: Array<{
    planet1: string;
    planet2: string;
    type: string;
    orb: number;
  }>;
}

interface BirthDataInfo {
  date: string;
  time: string | null;
  location: string;
  houseSystem: string;
}

export default function AstrologyPage() {
  const [chartData, setChartData] = useState<BirthChartData | null>(null);
  const [birthDataInfo, setBirthDataInfo] = useState<BirthDataInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [elementalBalance, setElementalBalance] = useState({
    fire: 0.25,
    water: 0.25,
    earth: 0.25,
    air: 0.25,
  });

  // Circadian rhythm - detect time of day for color transitions
  const [isDayMode, setIsDayMode] = useState(true);

  useEffect(() => {
    const hour = new Date().getHours();
    setIsDayMode(hour >= 6 && hour < 20);
  }, []);

  // Load birth data and chart from API
  const loadChartData = useCallback(async () => {
    try {
      // First check if birth data exists
      const birthRes = await fetch('/api/astrology/birth-data');
      const birthJson = await birthRes.json();

      if (!birthJson.success || !birthJson.birthData) {
        // No birth data - show setup form
        setChartData(null);
        setBirthDataInfo(null);
        setLoading(false);
        return;
      }

      setBirthDataInfo({
        date: birthJson.birthData.birthDate,
        time: birthJson.birthData.birthTime,
        location: birthJson.birthData.birthLocationName,
        houseSystem: birthJson.birthData.houseSystem,
      });

      // Get computed natal chart
      const natalRes = await fetch('/api/astrology/natal');
      const natalJson = await natalRes.json();

      if (natalJson.success && natalJson.chart) {
        setChartData(natalJson.chart);
        // Calculate elemental balance
        if (natalJson.chart) {
          calculateElementalBalance(natalJson.chart);
        }
      }
    } catch (error) {
      console.error('Failed to load chart data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadChartData();
  }, [loadChartData]);

  // Calculate elemental balance from chart
  const calculateElementalBalance = (chart: BirthChartData) => {
    const elementMap: Record<string, 'fire' | 'water' | 'earth' | 'air'> = {
      'Aries': 'fire', 'Leo': 'fire', 'Sagittarius': 'fire',
      'Cancer': 'water', 'Scorpio': 'water', 'Pisces': 'water',
      'Taurus': 'earth', 'Virgo': 'earth', 'Capricorn': 'earth',
      'Gemini': 'air', 'Libra': 'air', 'Aquarius': 'air',
    };

    const counts = { fire: 0, water: 0, earth: 0, air: 0 };
    const positions = [
      chart.sun, chart.moon, chart.mercury, chart.venus, chart.mars,
      { sign: chart.ascendant.sign },
    ];

    for (const pos of positions) {
      if (pos?.sign) {
        const element = elementMap[pos.sign];
        if (element) counts[element]++;
      }
    }

    const total = Object.values(counts).reduce((a, b) => a + b, 0) || 1;
    setElementalBalance({
      fire: Math.round((counts.fire / total) * 100) / 100,
      water: Math.round((counts.water / total) * 100) / 100,
      earth: Math.round((counts.earth / total) * 100) / 100,
      air: Math.round((counts.air / total) * 100) / 100,
    });
  };

  // Handle birth data form submission
  const handleBirthDataSubmit = async (data: {
    date: string;
    time: string;
    location: { name: string; lat: number; lng: number; timezone: string };
    houseSystem?: string;
  }) => {
    setSaving(true);
    try {
      const res = await fetch('/api/astrology/birth-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: data.date,
          time: data.time || null,
          locationName: data.location.name,
          latitude: data.location.lat,
          longitude: data.location.lng,
          timezone: data.location.timezone,
          houseSystem: data.houseSystem || 'placidus',
          consent: true,
        }),
      });

      const json = await res.json();
      if (json.success) {
        // Reload chart data
        setShowEditForm(false);
        await loadChartData();
      } else {
        console.error('Failed to save birth data:', json.error);
        alert('Failed to save birth data. Please try again.');
      }
    } catch (error) {
      console.error('Error saving birth data:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center relative overflow-hidden transition-colors duration-3000
        ${isDayMode
          ? 'bg-gradient-to-b from-stone-50 via-amber-50/30 to-stone-100'
          : 'bg-gradient-to-b from-[#0a0a0f] via-[#1a1a2e] to-[#16213e]'
        }`}>
        <motion.div
          initial={{ opacity: 0, scale: 0.8, rotate: -180 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ duration: 2, ease: 'easeOut' }}
          className="relative z-10"
        >
          <Sparkle
            className={`w-12 h-12 ${isDayMode ? 'text-amber-600' : 'text-amber-400'} animate-pulse`}
          />
        </motion.div>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 1 }}
          className={`absolute mt-24 text-sm ${isDayMode ? 'text-stone-600' : 'text-stone-400'} font-serif italic`}
        >
          The cosmos remembers you...
        </motion.p>
      </div>
    );
  }

  // No birth data - show setup form
  if (!chartData || showEditForm) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0a0a0f] via-[#1a1a2e] to-[#16213e] relative overflow-hidden">
        {/* Starfield background */}
        <div className="absolute inset-0 opacity-30">
          {[...Array(100)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 3}s`,
              }}
            />
          ))}
        </div>

        <div className="relative z-10 py-12 px-4">
          <div className="max-w-2xl mx-auto">
            {showEditForm && (
              <button
                onClick={() => setShowEditForm(false)}
                className="mb-6 text-amber-400 hover:text-amber-300 text-sm flex items-center gap-2"
              >
                ← Back to chart
              </button>
            )}

            <BirthDataForm
              onSubmit={handleBirthDataSubmit}
              loading={saving}
              isDayMode={false}
            />
          </div>
        </div>
      </div>
    );
  }

  // Has chart data - show full display
  return (
    <div className="min-h-screen bg-gradient-to-b from-dune-ibad-blue via-dune-navigator-purple to-dune-deep-sand relative overflow-hidden">
      {/* Arrakis Night Sky - Starfield */}
      <div className="absolute inset-0 opacity-40">
        {[...Array(150)].map((_, i) => (
          <div
            key={i}
            className="absolute bg-white rounded-full"
            style={{
              width: Math.random() > 0.8 ? '2px' : '1px',
              height: Math.random() > 0.8 ? '2px' : '1px',
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `pulse ${2 + Math.random() * 3}s infinite`,
              animationDelay: `${Math.random() * 3}s`,
              opacity: 0.3 + Math.random() * 0.7,
            }}
          />
        ))}
      </div>

      {/* Distant moons glow */}
      <div className="absolute top-20 right-20 w-32 h-32 bg-dune-spice-orange/10 rounded-full blur-3xl" />
      <div className="absolute top-40 left-32 w-24 h-24 bg-dune-fremen-azure/10 rounded-full blur-3xl" />

      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-dune-dune-amber mb-2">Your Cosmic Blueprint</h1>
            <p className="text-dune-spice-sand">Spiralogic Astrology: Elemental Pathways of Consciousness</p>

            {/* Edit button */}
            {birthDataInfo && (
              <div className="mt-4 flex items-center justify-center gap-4">
                <span className="text-sm text-dune-spice-sand/60">
                  {birthDataInfo.date} • {birthDataInfo.location}
                </span>
                <button
                  onClick={() => setShowEditForm(true)}
                  className="text-sm text-dune-spice-orange hover:text-dune-spice-glow flex items-center gap-1"
                >
                  <Settings2 className="w-4 h-4" />
                  Edit
                </button>
              </div>
            )}
          </div>

          {/* Elemental Balance */}
          <div className="mb-12">
            <ElementalBalanceDisplay balance={elementalBalance} />
          </div>

          {/* Big Three */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {/* Sun */}
            <div className="bg-black/40 backdrop-blur-md border border-dune-spice-orange/40 rounded-lg p-6 shadow-xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-dune-spice-orange to-dune-spice-deep flex items-center justify-center shadow-lg shadow-dune-spice-orange/30">
                  <span className="text-2xl">☉</span>
                </div>
                <div>
                  <h3 className="text-dune-dune-amber font-semibold">Sun · Core Identity</h3>
                  <p className="text-sm text-dune-spice-sand/80">Conscious Expression</p>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-2xl font-bold text-dune-spice-glow">
                  {chartData.sun.sign} · {getZodiacArchetype(chartData.sun.sign.toLowerCase())?.facetName || 'The Explorer'}
                </p>
                <p className="text-sm text-dune-spice-sand/70">
                  {chartData.sun.degree.toFixed(1)}° · House {chartData.sun.house}
                </p>
              </div>
            </div>

            {/* Moon */}
            <div className="bg-black/40 backdrop-blur-md border border-dune-fremen-azure/50 rounded-lg p-6 shadow-xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-dune-fremen-azure to-dune-ibad-blue flex items-center justify-center shadow-lg shadow-dune-fremen-azure/30">
                  <span className="text-2xl text-white">☽</span>
                </div>
                <div>
                  <h3 className="text-dune-dune-amber font-semibold">Moon · Emotional Truth</h3>
                  <p className="text-sm text-dune-spice-sand/80">Subconscious Landscape</p>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-2xl font-bold text-dune-spice-blue">
                  {chartData.moon.sign} · {getZodiacArchetype(chartData.moon.sign.toLowerCase())?.facetName || 'The Mystic'}
                </p>
                <p className="text-sm text-dune-spice-sand/70">
                  {chartData.moon.degree.toFixed(1)}° · House {chartData.moon.house}
                </p>
              </div>
            </div>

            {/* Ascendant */}
            <div className="bg-black/40 backdrop-blur-md border border-dune-bene-gesserit-gold/40 rounded-lg p-6 shadow-xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-dune-bene-gesserit-gold to-dune-sienna-rock flex items-center justify-center shadow-lg shadow-dune-bene-gesserit-gold/30">
                  <span className="text-2xl">⇡</span>
                </div>
                <div>
                  <h3 className="text-dune-dune-amber font-semibold">Ascendant · Life Portal</h3>
                  <p className="text-sm text-dune-spice-sand/80">How You Meet the World</p>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-2xl font-bold text-dune-bene-gesserit-gold">
                  {chartData.ascendant.sign} · {getZodiacArchetype(chartData.ascendant.sign.toLowerCase())?.facetName || 'The Sustainer'}
                </p>
                <p className="text-sm text-dune-spice-sand/70">
                  {chartData.ascendant.degree.toFixed(1)}°
                </p>
              </div>
            </div>
          </div>

          {/* Major Aspects */}
          {chartData.aspects && chartData.aspects.length > 0 && (
            <div className="bg-black/40 backdrop-blur-md border border-dune-spice-orange/30 rounded-lg p-6 mb-12 shadow-xl">
              <h2 className="text-2xl font-bold text-dune-dune-amber mb-6 flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-dune-spice-orange" />
                Major Aspects
              </h2>
              <p className="text-dune-spice-sand/80 mb-6">
                Archetypal dynamics between planetary energies in your chart
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {chartData.aspects.slice(0, 8).map((aspect, index) => {
                  const aspectIcon = aspect.type === 'square' ? '□' :
                    aspect.type === 'conjunction' ? '☌' :
                    aspect.type === 'opposition' ? '☍' :
                    aspect.type === 'trine' ? '△' :
                    aspect.type === 'sextile' ? '⚹' :
                    aspect.type === 'quincunx' ? '⚻' : '○';

                  const aspectColor = aspect.type === 'square' ? 'text-red-400' :
                    aspect.type === 'opposition' ? 'text-red-300' :
                    aspect.type === 'conjunction' ? 'text-dune-spice-orange' :
                    aspect.type === 'trine' ? 'text-dune-atreides-green' :
                    aspect.type === 'sextile' ? 'text-blue-400' :
                    'text-dune-fremen-azure';

                  return (
                    <div
                      key={index}
                      className="bg-black/30 border border-dune-spice-sand/20 rounded-lg p-4"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className={`text-2xl ${aspectColor}`}>{aspectIcon}</span>
                          <span className="text-dune-dune-amber font-semibold">
                            {aspect.planet1} {aspect.type} {aspect.planet2}
                          </span>
                        </div>
                        <span className="text-xs text-dune-spice-sand/60">
                          {aspect.orb.toFixed(1)}° orb
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Spiralogic Pathways */}
          <div className="bg-black/40 backdrop-blur-md border border-dune-spice-orange/30 rounded-lg p-6 shadow-xl">
            <h2 className="text-2xl font-bold text-dune-dune-amber mb-6">Spiralogic Pathways</h2>
            <p className="text-dune-spice-sand/80 mb-6">
              The 12 houses organized by elemental pathways and consciousness functions
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Fire Pathway */}
              <Link
                href="/astrology/pathways/fire"
                className="group bg-black/30 border border-dune-spice-orange/40 hover:border-dune-spice-orange/80 hover:bg-black/50 rounded-lg p-6 transition-all duration-300 shadow-lg hover:shadow-dune-spice-orange/20"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="text-3xl">🔥</div>
                  <div>
                    <h3 className="text-xl font-bold text-dune-dune-amber">Fire Pathway</h3>
                    <p className="text-sm text-dune-spice-sand/70">Houses 1, 5, 9 · Vision & Projection</p>
                  </div>
                </div>
                <p className="text-dune-spice-sand/70 group-hover:text-dune-spice-orange transition-colors">
                  Experience → Expression → Expansion
                </p>
              </Link>

              {/* Water Pathway */}
              <Link
                href="/astrology/pathways/water"
                className="group bg-black/30 border border-dune-fremen-azure/40 hover:border-dune-fremen-azure/80 hover:bg-black/50 rounded-lg p-6 transition-all duration-300 shadow-lg hover:shadow-dune-fremen-azure/20"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="text-3xl">💧</div>
                  <div>
                    <h3 className="text-xl font-bold text-dune-dune-amber">Water Pathway</h3>
                    <p className="text-sm text-dune-spice-sand/70">Houses 4, 8, 12 · Introspection & Depth</p>
                  </div>
                </div>
                <p className="text-dune-spice-sand/70 group-hover:text-dune-fremen-azure transition-colors">
                  Heart → Healing → Holiness
                </p>
              </Link>

              {/* Earth Pathway */}
              <Link
                href="/astrology/pathways/earth"
                className="group bg-black/30 border border-dune-atreides-green/40 hover:border-dune-atreides-green/80 hover:bg-black/50 rounded-lg p-6 transition-all duration-300 shadow-lg hover:shadow-dune-atreides-green/20"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="text-3xl">🌍</div>
                  <div>
                    <h3 className="text-xl font-bold text-dune-dune-amber">Earth Pathway</h3>
                    <p className="text-sm text-dune-spice-sand/70">Houses 2, 6, 10 · Manifestation & Grounding</p>
                  </div>
                </div>
                <p className="text-dune-spice-sand/70 group-hover:text-dune-atreides-green transition-colors">
                  Mission → Means → Medicine
                </p>
              </Link>

              {/* Air Pathway */}
              <Link
                href="/astrology/pathways/air"
                className="group bg-black/30 border border-dune-bene-gesserit-gold/40 hover:border-dune-bene-gesserit-gold/80 hover:bg-black/50 rounded-lg p-6 transition-all duration-300 shadow-lg hover:shadow-dune-bene-gesserit-gold/20"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="text-3xl">🌬</div>
                  <div>
                    <h3 className="text-xl font-bold text-dune-dune-amber">Air Pathway</h3>
                    <p className="text-sm text-dune-spice-sand/70">Houses 3, 7, 11 · Communication & Connection</p>
                  </div>
                </div>
                <p className="text-dune-spice-sand/70 group-hover:text-dune-bene-gesserit-gold transition-colors">
                  Connection → Community → Consciousness
                </p>
              </Link>
            </div>

            {/* Additional Systems */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <Link
                href="/astrology/mayan"
                className="group inline-flex items-center gap-3 bg-black/30 hover:bg-black/50 border border-dune-bene-gesserit-gold/40 hover:border-dune-bene-gesserit-gold/70 rounded-xl p-6 transition-all duration-300"
              >
                <div className="text-4xl">☀️</div>
                <div className="text-left">
                  <h3 className="text-xl font-bold text-dune-dune-amber group-hover:text-dune-bene-gesserit-gold transition-colors">
                    Mayan Astrology
                  </h3>
                  <p className="text-dune-spice-sand/70 text-sm">
                    Discover your Galactic Signature →
                  </p>
                </div>
              </Link>

              <Link
                href="/astrology/chinese"
                className="group inline-flex items-center gap-3 bg-black/30 hover:bg-black/50 border border-red-500/40 hover:border-red-500/70 rounded-xl p-6 transition-all duration-300"
              >
                <div className="text-4xl">🐉</div>
                <div className="text-left">
                  <h3 className="text-xl font-bold text-dune-dune-amber group-hover:text-red-400 transition-colors">
                    Chinese Astrology
                  </h3>
                  <p className="text-dune-spice-sand/70 text-sm">
                    Explore your zodiac animal →
                  </p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
