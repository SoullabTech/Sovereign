'use client';

/**
 * The Blueprint - Your Cosmic Spiral
 *
 * A living map of consciousness woven through celestial rhythms.
 * Not a dashboard — a threshold into archetypal wisdom.
 *
 * Integrates:
 * - Birth chart archetypal essence
 * - Elemental balance (Fire/Water/Earth/Air/Aether)
 * - MAIA's astrological intelligence
 * - Circadian color rhythm (day/night transitions)
 */

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Sparkles, Flame, Droplet, Sprout, Wind, Sparkle, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { ElementalBalanceDisplay } from '@/components/astrology/ElementalBalanceDisplay';
import { getZodiacArchetype } from '@/lib/astrology/archetypeLibrary';

interface BirthChartData {
  sun: { sign: string; degree: number; house: number };
  moon: { sign: string; degree: number; house: number };
  ascendant: { sign: string; degree: number };
  aspects: Array<{
    planet1: string;
    planet2: string;
    type: string;
    orb: number;
  }>;
}

export default function AstrologyPage() {
  const [chartData, setChartData] = useState<BirthChartData | null>(null);
  const [loading, setLoading] = useState(true);
  const [elementalBalance, setElementalBalance] = useState({
    fire: 0.28,
    water: 0.38,
    earth: 0.18,
    air: 0.16,
  });

  // Circadian rhythm - detect time of day for color transitions
  const [isDayMode, setIsDayMode] = useState(true);

  useEffect(() => {
    const hour = new Date().getHours();
    setIsDayMode(hour >= 6 && hour < 20); // Day mode 6am-8pm
  }, []);

  useEffect(() => {
    // TODO: Fetch real birth chart from API
    // For now, use archetypal example data
    setChartData({
      sun: { sign: 'Sagittarius', degree: 17.23, house: 4 },
      moon: { sign: 'Pisces', degree: 23.45, house: 7 },
      ascendant: { sign: 'Leo', degree: 28.12 },
      aspects: [
        { planet1: 'Sun', planet2: 'Saturn', type: 'square', orb: 5.89 },
        { planet1: 'Moon', planet2: 'Saturn', type: 'conjunction', orb: 0.33 },
        { planet1: 'Sun', planet2: 'Jupiter', type: 'quincunx', orb: 9.2 },
        { planet1: 'Moon', planet2: 'Neptune', type: 'trine', orb: 0.56 },
      ],
    });
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center relative overflow-hidden transition-colors duration-3000
        ${isDayMode
          ? 'bg-gradient-to-b from-stone-50 via-amber-50/30 to-stone-100'
          : 'bg-gradient-to-b from-[#0a0a0f] via-[#1a1a2e] to-[#16213e]'
        }`}>
        {/* Soft spiral unfurling */}
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

  if (!chartData) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-dune-ibad-blue via-dune-navigator-purple to-dune-deep-sand flex items-center justify-center relative overflow-hidden">
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
        <div className="text-center relative z-10">
          <p className="text-dune-dune-amber mb-4">No birth chart data available</p>
          <Link href="/settings" className="text-dune-spice-orange hover:text-dune-spice-glow">
            Calculate your chart
          </Link>
        </div>
      </div>
    );
  }

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
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-dune-dune-amber mb-2">Your Cosmic Blueprint</h1>
            <p className="text-dune-spice-sand">Spiralogic Astrology: Elemental Pathways of Consciousness</p>
          </div>

          {/* Archetypal Profile */}
          <div className="bg-black/40 backdrop-blur-md border border-dune-bene-gesserit-gold/40 rounded-lg p-6 mb-12 shadow-xl">
            <h2 className="text-2xl font-bold text-dune-dune-amber mb-4">Your Archetypal Profile</h2>
            <p className="text-dune-spice-sand/80 mb-6">
              The core archetypal energies shaping your soul's journey
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-black/30 border border-dune-spice-orange/30 rounded-lg p-4">
                <h3 className="text-dune-spice-orange font-semibold mb-2">The Seeker</h3>
                <p className="text-dune-spice-sand/70 text-sm">Sagittarius Sun energy driving philosophical expansion and truth-seeking</p>
              </div>
              <div className="bg-black/30 border border-dune-fremen-azure/30 rounded-lg p-4">
                <h3 className="text-dune-fremen-azure font-semibold mb-2">The Mystic</h3>
                <p className="text-dune-spice-sand/70 text-sm">Pisces Moon connecting to emotional depth and universal compassion</p>
              </div>
            </div>
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
                <p className="text-sm text-dune-dune-amber/80 italic mt-2">
                  {getZodiacArchetype(chartData.sun.sign.toLowerCase())?.archetypes.mythological?.[0] || 'Archetypal essence'}
                </p>
                <Link
                  href={`/astrology/placements/sun`}
                  className="text-sm text-dune-spice-orange hover:text-dune-spice-glow hover:underline inline-flex items-center gap-1"
                >
                  Explore deeper <Sparkles className="w-3 h-3" />
                </Link>
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
                <p className="text-sm text-dune-dune-amber/80 italic mt-2">
                  {getZodiacArchetype(chartData.moon.sign.toLowerCase())?.archetypes.mythological?.[0] || 'Emotional archetype'}
                </p>
                <Link
                  href={`/astrology/placements/moon`}
                  className="text-sm text-dune-spice-blue hover:text-dune-fremen-azure hover:underline inline-flex items-center gap-1"
                >
                  Explore deeper <Sparkles className="w-3 h-3" />
                </Link>
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
                <p className="text-sm text-dune-dune-amber/80 italic mt-2">
                  {getZodiacArchetype(chartData.ascendant.sign.toLowerCase())?.archetypes.mythological?.[0] || 'Rising energy'}
                </p>
                <Link
                  href={`/astrology/placements/ascendant`}
                  className="text-sm text-dune-bene-gesserit-gold hover:text-dune-dune-amber hover:underline inline-flex items-center gap-1"
                >
                  Explore deeper <Sparkles className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </div>

          {/* Major Aspects */}
          <div className="bg-black/40 backdrop-blur-md border border-dune-spice-orange/30 rounded-lg p-6 mb-12 shadow-xl">
            <h2 className="text-2xl font-bold text-dune-dune-amber mb-6 flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-dune-spice-orange" />
              Major Aspects
            </h2>
            <p className="text-dune-spice-sand/80 mb-6">
              Archetypal dynamics between planetary energies in your chart
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {chartData.aspects.map((aspect, index) => {
                const aspectIcon = aspect.type === 'square' ? '□' :
                  aspect.type === 'conjunction' ? '☌' :
                    aspect.type === 'trine' ? '△' :
                      aspect.type === 'quincunx' ? '⚻' : '○';

                const aspectColor = aspect.type === 'square' ? 'text-red-400' :
                  aspect.type === 'conjunction' ? 'text-dune-spice-orange' :
                    aspect.type === 'trine' ? 'text-dune-atreides-green' :
                      'text-dune-fremen-azure';

                return (
                  <Link
                    key={index}
                    href={`/astrology/aspects/${aspect.planet1.toLowerCase()}-${aspect.type}-${aspect.planet2.toLowerCase()}`}
                    className="group bg-black/30 border border-dune-spice-sand/20 hover:border-dune-spice-orange/60 rounded-lg p-4 transition-all duration-300 hover:shadow-lg hover:shadow-dune-spice-orange/20"
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
                    <p className="text-sm text-dune-spice-sand/70 group-hover:text-dune-spice-glow transition-colors">
                      Tap to explore archetypal interpretation →
                    </p>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* North & South Nodes */}
          <div className="bg-black/40 backdrop-blur-md border border-dune-navigator-purple/40 rounded-lg p-6 mb-12 shadow-xl">
            <h2 className="text-2xl font-bold text-dune-dune-amber mb-6 flex items-center gap-2">
              <span className="text-3xl">☊☋</span>
              North & South Nodes
            </h2>
            <p className="text-dune-spice-sand/80 mb-6">
              Your soul's evolutionary path: past mastery and future growth
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* North Node */}
              <div className="bg-black/30 border border-dune-atreides-green/40 rounded-lg p-5">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl">☊</span>
                  <h3 className="text-xl font-bold text-dune-atreides-green">North Node</h3>
                </div>
                <p className="text-lg font-semibold text-dune-dune-amber mb-2">Gemini in 11th House</p>
                <p className="text-dune-spice-sand/70 text-sm mb-3">
                  Your soul's calling toward communication, community connections, and intellectual exchange.
                  Learning to embrace curiosity and share ideas within collective networks.
                </p>
                <div className="text-xs text-dune-spice-sand/60">
                  Keywords: Communication, Networks, Ideas, Community
                </div>
              </div>

              {/* South Node */}
              <div className="bg-black/30 border border-dune-sienna-rock/40 rounded-lg p-5">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl">☋</span>
                  <h3 className="text-xl font-bold text-dune-sienna-rock">South Node</h3>
                </div>
                <p className="text-lg font-semibold text-dune-dune-amber mb-2">Sagittarius in 5th House</p>
                <p className="text-dune-spice-sand/70 text-sm mb-3">
                  Past life mastery in philosophical wisdom and creative self-expression.
                  Comfortable with teaching and sharing truth, but now evolving toward listening and collaboration.
                </p>
                <div className="text-xs text-dune-spice-sand/60">
                  Keywords: Philosophy, Teaching, Creativity, Independence
                </div>
              </div>
            </div>
          </div>

          {/* Current Transits */}
          <div className="bg-black/40 backdrop-blur-md border border-dune-spice-blue/40 rounded-lg p-6 mb-12 shadow-xl">
            <h2 className="text-2xl font-bold text-dune-dune-amber mb-6 flex items-center gap-2">
              <span className="text-2xl">🌙</span>
              Current Transits & Activations
            </h2>
            <p className="text-dune-spice-sand/80 mb-6">
              Planetary movements currently influencing your chart
            </p>

            <div className="space-y-4">
              <div className="bg-black/30 border border-dune-spice-orange/30 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-dune-spice-orange">Jupiter conjunct Natal Sun</h3>
                  <span className="text-xs text-dune-spice-sand/60">Active Now</span>
                </div>
                <p className="text-dune-spice-sand/70 text-sm">
                  A time of expansion and opportunity. Your philosophical nature is amplified, bringing growth in teaching, travel, or higher learning.
                </p>
              </div>

              <div className="bg-black/30 border border-dune-fremen-azure/30 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-dune-fremen-azure">Saturn trine Natal Moon</h3>
                  <span className="text-xs text-dune-spice-sand/60">Approaching</span>
                </div>
                <p className="text-dune-spice-sand/70 text-sm">
                  Emotional maturity and structure. A supportive time for grounding feelings and building sustainable emotional foundations.
                </p>
              </div>
            </div>
          </div>

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

            {/* Deep Dive Link */}
            <div className="mt-8">
              <Link
                href="/deep-dive"
                className="group block bg-black/30 hover:bg-black/50 border border-dune-spice-orange/40 hover:border-dune-spice-orange/70 rounded-xl p-8 transition-all duration-300 shadow-lg hover:shadow-dune-spice-orange/20"
              >
                <div className="flex items-start gap-4">
                  <div className="text-5xl">📖</div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-dune-dune-amber group-hover:text-dune-spice-orange transition-colors mb-2">
                      The Deep Dive: Elemental Alchemy
                    </h3>
                    <p className="text-dune-spice-sand/70 mb-3">
                      Go beyond your chart into the phenomenological journey through consciousness.
                      Kelly Nezat's book as living curriculum.
                    </p>
                    <div className="flex items-center gap-2 text-dune-spice-glow text-sm">
                      <span>Begin your transformation</span>
                      <span>→</span>
                    </div>
                  </div>
                </div>
              </Link>
            </div>

            {/* Additional Astrological Systems */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Mayan Astrology */}
              <Link
                href="/astrology/mayan"
                className="group inline-flex items-center gap-3 bg-black/30 hover:bg-black/50 border border-dune-bene-gesserit-gold/40 hover:border-dune-bene-gesserit-gold/70 rounded-xl p-6 transition-all duration-300 shadow-lg hover:shadow-dune-bene-gesserit-gold/20"
              >
                <div className="text-4xl">☀️</div>
                <div className="text-left">
                  <h3 className="text-xl font-bold text-dune-dune-amber group-hover:text-dune-bene-gesserit-gold transition-colors">
                    Mayan Astrology
                  </h3>
                  <p className="text-dune-spice-sand/70 text-sm">
                    Discover your Galactic Signature in the Tzolk'in Sacred Calendar →
                  </p>
                </div>
              </Link>

              {/* Chinese Astrology */}
              <Link
                href="/astrology/chinese"
                className="group inline-flex items-center gap-3 bg-black/30 hover:bg-black/50 border border-red-500/40 hover:border-red-500/70 rounded-xl p-6 transition-all duration-300 shadow-lg hover:shadow-red-500/20"
              >
                <div className="text-4xl">🐉</div>
                <div className="text-left">
                  <h3 className="text-xl font-bold text-dune-dune-amber group-hover:text-red-400 transition-colors">
                    Chinese Astrology
                  </h3>
                  <p className="text-dune-spice-sand/70 text-sm">
                    Explore your zodiac animal, element, and cosmic destiny →
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