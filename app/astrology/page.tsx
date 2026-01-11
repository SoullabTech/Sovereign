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

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Sparkles, Flame, Droplet, Sprout, Wind, Sparkle, TrendingUp, ArrowLeft, Settings2, ChevronDown, ChevronUp, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ElementalBalanceDisplay } from '@/components/astrology/ElementalBalanceDisplay';
import { SacredHouseWheel } from '@/components/astrology/SacredHouseWheel';
import { MiniHoloflower } from '@/components/holoflower/MiniHoloflower';
import { getZodiacArchetype, generateArchetypalDescription } from '@/lib/astrology/archetypeLibrary';
import { getPlanetaryArchetype } from '@/lib/astrology/spiralogicMapping';
import { getSpiralogicHouseData } from '@/lib/astrology/spiralogicHouseMapping';
import { synthesizeAspect, AspectType } from '@/lib/astrology/aspectSynthesis';
import { getOrCreateExplorerId } from '@/lib/identity/explorerId';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { getTooltip, CARD_COPY } from '@/lib/content/CrossSystemConvergenceCopy';

// Elemental colors for planet insights
const elementalColors = {
  fire: { color: '#F5A362', glow: 'rgba(245, 163, 98, 0.3)' },
  water: { color: '#8BADD6', glow: 'rgba(139, 173, 214, 0.3)' },
  earth: { color: '#A8C69F', glow: 'rgba(168, 198, 159, 0.3)' },
  air: { color: '#F5D565', glow: 'rgba(245, 213, 101, 0.3)' },
};

interface PlanetPosition {
  sign: string;
  degree: number;
  house: number;
  retrograde?: boolean;
}

interface BirthChartData {
  sun: PlanetPosition;
  moon: PlanetPosition;
  mercury?: PlanetPosition;
  venus?: PlanetPosition;
  mars?: PlanetPosition;
  jupiter?: PlanetPosition;
  saturn?: PlanetPosition;
  uranus?: PlanetPosition;
  neptune?: PlanetPosition;
  pluto?: PlanetPosition;
  chiron?: PlanetPosition;
  northNode?: PlanetPosition;
  southNode?: PlanetPosition;
  lilith?: PlanetPosition;
  ceres?: PlanetPosition;
  pallas?: PlanetPosition;
  juno?: PlanetPosition;
  vesta?: PlanetPosition;
  ascendant: { sign: string; degree: number };
  midheaven?: { sign: string; degree: number };
  aspects: Array<{
    planet1: string;
    planet2: string;
    type: string;
    orb: number;
  }>;
}

interface SavedSynastryItem {
  analysisId: string;
  savedAt?: string;  // Optional - edge cases may omit
  chartA?: { sunSign?: string; moonSign?: string; name?: string };
  chartB?: { sunSign?: string; moonSign?: string; name?: string };
  scores?: { attraction?: number; harmony?: number; friction?: number; growth?: number };
}

// House system options with descriptions
type HouseSystemType = 'porphyry' | 'placidus' | 'whole-sign' | 'equal' | 'koch';

const HOUSE_SYSTEMS: { value: HouseSystemType; label: string; description: string; fallback?: boolean }[] = [
  { value: 'porphyry', label: 'Porphyry', description: 'Destiny spine — crisp identity + vocation clarity' },
  { value: 'placidus', label: 'Placidus*', description: 'Lived experience — where life pressure actually lands', fallback: true },
  { value: 'whole-sign', label: 'Whole Sign', description: 'Mythic map — each sign a clear chapter of your journey' },
  { value: 'equal', label: 'Equal', description: 'Clean structure — stable, straightforward house map' },
  { value: 'koch', label: 'Koch*', description: 'Inner growth — how you unfold through thresholds', fallback: true },
];

// Transit position interface for current sky
interface TransitPosition {
  planet: string;
  sign: string;
  degree: number;
  longitude: number;
}

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
    { key: 'southNode', name: 'South Node' },
    { key: 'lilith', name: 'Lilith' },
    { key: 'ceres', name: 'Ceres' },
    { key: 'pallas', name: 'Pallas' },
    { key: 'juno', name: 'Juno' },
    { key: 'vesta', name: 'Vesta' },
  ];

  return planetKeys
    .map(({ key, name }) => {
      const pos = chart[key as keyof BirthChartData] as PlanetPosition | undefined;
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

export default function AstrologyPage() {
  const router = useRouter();
  const [chartData, setChartData] = useState<BirthChartData | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasBirthData, setHasBirthData] = useState(false);
  const [elementalBalance, setElementalBalance] = useState({
    fire: 0.28,
    water: 0.38,
    earth: 0.18,
    air: 0.16,
  });

  // Circadian rhythm - detect time of day for color transitions
  const [isDayMode, setIsDayMode] = useState(true);

  // Expanded planet for planetary positions panel
  const [expandedPlanet, setExpandedPlanet] = useState<string | null>(null);

  // Saved synastry for timeline surfacing
  const [savedSynastry, setSavedSynastry] = useState<SavedSynastryItem[]>([]);
  const [savedSynastryLoading, setSavedSynastryLoading] = useState(false);

  // House system selection
  const [houseSystem, setHouseSystem] = useState<HouseSystemType>('porphyry');
  const [houseSystemLoading, setHouseSystemLoading] = useState(false);

  // Transits display
  const [showTransits, setShowTransits] = useState(false);
  const [transitPositions, setTransitPositions] = useState<TransitPosition[]>([]);
  const [transitLoading, setTransitLoading] = useState(false);

  // House system guide toggle
  const [showHouseGuide, setShowHouseGuide] = useState(false);

  // Memoized sort - avoid re-sorting on every render
  const sortedSavedSynastry = useMemo(() => {
    // NaN-safe timestamp parser (handles malformed dates gracefully)
    const ts = (s?: string) => {
      const n = s ? Date.parse(s) : 0;
      return Number.isFinite(n) ? n : 0;
    };
    return [...savedSynastry].sort((a, b) => ts(b.savedAt) - ts(a.savedAt));
  }, [savedSynastry]);

  useEffect(() => {
    const hour = new Date().getHours();
    setIsDayMode(hour >= 6 && hour < 20); // Day mode 6am-8pm
  }, []);

  // Fetch saved synastry
  useEffect(() => {
    const memberId = getOrCreateExplorerId();
    if (!memberId) return;

    let isMounted = true;

    (async () => {
      try {
        setSavedSynastryLoading(true);
        const res = await fetch(
          `/api/astrology/synastry/saved?memberId=${encodeURIComponent(memberId)}&limit=3`,
          { cache: 'no-store' }
        );
        const json = await res.json();
        const items = Array.isArray(json?.items) ? json.items : [];
        if (isMounted) setSavedSynastry(items);
      } catch {
        // Silent fail - not critical
      } finally {
        if (isMounted) setSavedSynastryLoading(false);
      }
    })();

    return () => { isMounted = false; };
  }, []);

  // Load birth chart data from localStorage or redirect to /journey
  useEffect(() => {
    const loadChartData = async () => {
      try {
        // Check localStorage for existing chart data
        const savedChartJson = localStorage.getItem('birthChartData');

        if (savedChartJson) {
          const savedChart = JSON.parse(savedChartJson);

          // If we have calculated chart data (with planets), use it directly
          if (savedChart.sun && savedChart.moon && savedChart.ascendant) {
            setChartData(savedChart);
            setHasBirthData(true);
            // Initialize house system from saved chart
            if (savedChart.houseSystem && HOUSE_SYSTEMS.some(h => h.value === savedChart.houseSystem)) {
              setHouseSystem(savedChart.houseSystem);
            }

            // Calculate elemental balance from chart
            const planets = [
              savedChart.sun, savedChart.moon, savedChart.mercury, savedChart.venus,
              savedChart.mars, savedChart.jupiter, savedChart.saturn
            ].filter(Boolean);

            const elementCounts = { fire: 0, water: 0, earth: 0, air: 0 };
            const fireSign = ['Aries', 'Leo', 'Sagittarius'];
            const waterSigns = ['Cancer', 'Scorpio', 'Pisces'];
            const earthSigns = ['Taurus', 'Virgo', 'Capricorn'];
            const airSigns = ['Gemini', 'Libra', 'Aquarius'];

            planets.forEach(p => {
              if (fireSign.includes(p.sign)) elementCounts.fire++;
              else if (waterSigns.includes(p.sign)) elementCounts.water++;
              else if (earthSigns.includes(p.sign)) elementCounts.earth++;
              else if (airSigns.includes(p.sign)) elementCounts.air++;
            });

            const total = planets.length || 1;
            setElementalBalance({
              fire: elementCounts.fire / total,
              water: elementCounts.water / total,
              earth: elementCounts.earth / total,
              air: elementCounts.air / total,
            });

            setLoading(false);
            return;
          }

          // If we only have birth data (not calculated), recalculate
          if (savedChart.date && savedChart.time && savedChart.location) {
            const res = await fetch('/api/astrology/birth-chart', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                date: savedChart.date,
                time: savedChart.time,
                location: savedChart.location,
                houseSystem: savedChart.houseSystem || 'porphyry',
              }),
            });

            if (res.ok) {
              const { data } = await res.json();
              // Merge birth data with calculated chart
              const fullChart = { ...savedChart, ...data };
              localStorage.setItem('birthChartData', JSON.stringify(fullChart));
              setChartData(fullChart);
              setHasBirthData(true);
              setLoading(false);
              return;
            }
          }
        }

        // No valid chart data found - redirect to /journey to collect birth data
        setLoading(false);
        setHasBirthData(false);

      } catch (error) {
        console.error('Error loading chart data:', error);
        setLoading(false);
        setHasBirthData(false);
      }
    };

    loadChartData();
  }, []);

  // Handle house system change - recalculate chart with new system
  const handleHouseSystemChange = async (newSystem: HouseSystemType) => {
    if (!chartData || newSystem === houseSystem) return;

    setHouseSystemLoading(true);
    try {
      const savedChartJson = localStorage.getItem('birthChartData');
      if (!savedChartJson) return;

      const savedChart = JSON.parse(savedChartJson);
      if (!savedChart.date || !savedChart.time || !savedChart.location) {
        console.error('Missing birth data for recalculation');
        return;
      }

      const res = await fetch('/api/astrology/birth-chart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: savedChart.date,
          time: savedChart.time,
          location: savedChart.location,
          houseSystem: newSystem,
        }),
      });

      if (res.ok) {
        const { data } = await res.json();
        const fullChart = { ...savedChart, ...data, houseSystem: newSystem };
        localStorage.setItem('birthChartData', JSON.stringify(fullChart));
        setChartData(fullChart);
        setHouseSystem(newSystem);
      }
    } catch (error) {
      console.error('Error changing house system:', error);
    } finally {
      setHouseSystemLoading(false);
    }
  };

  // Fetch current transit positions
  const fetchTransits = async () => {
    setTransitLoading(true);
    try {
      const res = await fetch('/api/astrology/current-transits');
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data?.positions) {
          // Transform to our TransitPosition interface
          const positions = json.data.positions.map((p: { planet: string; sign: string; degree: number; longitude: number }) => ({
            planet: p.planet,
            sign: p.sign,
            degree: p.degree,
            longitude: p.longitude,
          }));
          setTransitPositions(positions);
        }
      }
    } catch (error) {
      console.error('Error fetching transits:', error);
    } finally {
      setTransitLoading(false);
    }
  };

  // Fetch transits when toggle is enabled
  useEffect(() => {
    if (showTransits && transitPositions.length === 0) {
      fetchTransits();
    }
  }, [showTransits, transitPositions.length]);

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

  if (!chartData || !hasBirthData) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-dune-ibad-blue via-dune-navigator-purple to-dune-deep-sand flex items-center justify-center relative overflow-hidden">
        {/* Back to MAIA */}
        <Link
          href="/maia"
          className="fixed top-4 left-4 z-50 flex items-center gap-2 px-3 py-2 rounded-lg backdrop-blur-sm bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">MAIA</span>
        </Link>

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
          <div className="mx-auto mb-6 flex justify-center">
            <MiniHoloflower size={80} isDayMode={false} animated={true} />
          </div>
          <h2 className="text-2xl font-bold text-dune-amber mb-2">Your Cosmic Blueprint Awaits</h2>
          <p className="text-dune-spice-sand/80 mb-6 max-w-md mx-auto">
            Enter your birth details to unlock your personalized astrological map
          </p>
          <Link
            href="/journey"
            className="inline-flex items-center gap-2 px-6 py-3 bg-dune-spice-orange/80 hover:bg-dune-spice-orange text-white font-semibold rounded-lg transition-colors"
          >
            <Sparkles className="w-5 h-5" />
            Enter Birth Details
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-dune-ibad-blue via-dune-navigator-purple to-dune-deep-sand relative overflow-hidden">
      {/* Fixed Navigation Header */}
      <div className="fixed top-4 left-4 right-4 z-50 flex justify-between items-center">
        <Link
          href="/maia"
          className="flex items-center gap-2 px-3 py-2 rounded-lg backdrop-blur-sm bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">MAIA</span>
        </Link>

        <Link
          href="/journey"
          className="flex items-center gap-2 px-3 py-2 rounded-lg backdrop-blur-sm bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-colors"
          title="Edit birth data"
        >
          <Settings2 className="w-4 h-4" />
          <span className="text-sm font-medium hidden sm:inline">Edit Birth Data</span>
        </Link>
      </div>

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
            <h1 className="text-4xl font-bold text-dune-amber mb-2">Your Cosmic Blueprint</h1>
            <p className="text-dune-spice-sand">Spiralogic Astrology: Elemental Pathways of Consciousness</p>
          </div>

          {/* Archetypal Profile */}
          <div className="bg-black/40 backdrop-blur-md border border-dune-bene-gesserit-gold/40 rounded-lg p-6 mb-12 shadow-xl">
            <h2 className="text-2xl font-bold text-dune-amber mb-4">Your Archetypal Profile</h2>
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
                  <h3 className="text-dune-amber font-semibold">Sun · Core Identity</h3>
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
                <p className="text-sm text-dune-amber/80 italic mt-2">
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
                  <h3 className="text-dune-amber font-semibold">Moon · Emotional Truth</h3>
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
                <p className="text-sm text-dune-amber/80 italic mt-2">
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
                  <h3 className="text-dune-amber font-semibold">Ascendant · Life Portal</h3>
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
                <p className="text-sm text-dune-amber/80 italic mt-2">
                  {getZodiacArchetype(chartData.ascendant.sign.toLowerCase())?.archetypes.mythological?.[0] || 'Rising energy'}
                </p>
                <Link
                  href={`/astrology/placements/ascendant`}
                  className="text-sm text-dune-bene-gesserit-gold hover:text-dune-amber hover:underline inline-flex items-center gap-1"
                >
                  Explore deeper <Sparkles className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </div>

          {/* House Wheel & Planetary Positions */}
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* House Wheel */}
            <div className="bg-black/40 backdrop-blur-md border border-dune-bene-gesserit-gold/30 rounded-lg p-6 shadow-xl overflow-visible relative" style={{ zIndex: 10 }}>
              <h3 className="text-dune-amber font-semibold mb-4 text-center">House Wheel</h3>

              {/* House System Selector & Transits Toggle */}
              <div className="flex flex-col sm:flex-row gap-3 mb-4">
                {/* House System Dropdown */}
                <div className="flex-1 relative">
                  <label className="block text-xs text-dune-spice-sand/60 mb-1">House System</label>
                  <select
                    value={houseSystem}
                    onChange={(e) => handleHouseSystemChange(e.target.value as HouseSystemType)}
                    disabled={houseSystemLoading}
                    className="w-full bg-black/50 border border-dune-bene-gesserit-gold/30 rounded-lg px-3 py-2 text-sm text-dune-spice-sand appearance-none cursor-pointer hover:border-dune-amber/50 transition-colors disabled:opacity-50"
                  >
                    {HOUSE_SYSTEMS.map((sys) => (
                      <option key={sys.value} value={sys.value}>
                        {sys.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-7 w-4 h-4 text-dune-spice-sand/40 pointer-events-none" />
                  {houseSystemLoading && (
                    <div className="absolute right-8 top-7">
                      <div className="w-4 h-4 border-2 border-dune-amber/30 border-t-dune-amber rounded-full animate-spin" />
                    </div>
                  )}
                </div>

                {/* Transits Toggle */}
                <div className="flex items-end">
                  <button
                    onClick={() => setShowTransits(!showTransits)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${
                      showTransits
                        ? 'bg-dune-amber/20 border-dune-amber text-dune-amber'
                        : 'bg-black/30 border-dune-bene-gesserit-gold/30 text-dune-spice-sand/70 hover:border-dune-amber/50'
                    }`}
                  >
                    {transitLoading ? (
                      <div className="w-4 h-4 border-2 border-dune-amber/30 border-t-dune-amber rounded-full animate-spin" />
                    ) : (
                      <span className="text-lg">🌙</span>
                    )}
                    <span className="text-sm">Transits</span>
                  </button>
                </div>
              </div>

              {/* House System Description + Fallback footnote */}
              <div className="mb-3">
                <p className="text-dune-spice-sand/50 text-xs text-center italic">
                  {HOUSE_SYSTEMS.find(s => s.value === houseSystem)?.description || 'Click a planet on the wheel for insights'}
                </p>
                {HOUSE_SYSTEMS.find(s => s.value === houseSystem)?.fallback && (
                  <p className="text-dune-spice-sand/40 text-[10px] mt-1 text-center">
                    *Uses Porphyry calculation — true {houseSystem === 'placidus' ? 'Placidus' : 'Koch'} requires complex iterative solving
                  </p>
                )}
              </div>

              {/* Collapsible House System Guide */}
              <div className="mb-4">
                <button
                  onClick={() => setShowHouseGuide(!showHouseGuide)}
                  className="w-full flex items-center justify-center gap-1 text-dune-spice-sand/40 hover:text-dune-spice-sand/60 text-[10px] transition-colors"
                >
                  <span>Which lens fits your inquiry?</span>
                  {showHouseGuide ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </button>
                <AnimatePresence>
                  {showHouseGuide && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-3 p-3 bg-black/30 rounded-lg border border-dune-bene-gesserit-gold/20 text-[10px] text-dune-spice-sand/60 space-y-2">
                        <p><span className="text-dune-amber">Inner growth:</span> Koch — how you unfold through thresholds</p>
                        <p><span className="text-dune-amber">Timing & transits:</span> Whole Sign — cleanest for house-based prediction</p>
                        <p><span className="text-dune-amber">Soul story:</span> Whole Sign — each sign a chapter of the journey</p>
                        <p><span className="text-dune-amber">Lived experience:</span> Placidus — where life pressure actually lands</p>
                        <p><span className="text-dune-amber">Clean structure:</span> Equal — stable, straightforward for learning</p>
                        <p><span className="text-dune-amber">Destiny spine:</span> Porphyry — crisp identity + vocation clarity</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <SacredHouseWheel
                planets={chartDataToPlanets(chartData)}
                aspects={(chartData.aspects || [])
                  .filter((a): a is typeof a & { type: 'conjunction' | 'sextile' | 'square' | 'trine' | 'opposition' } =>
                    ['conjunction', 'sextile', 'square', 'trine', 'opposition'].includes(a.type)
                  )}
                transits={showTransits ? transitPositions : undefined}
                isDayMode={false}
                layoutMode="traditional"
                showAspects={true}
                className="max-h-[500px]"
              />
            </div>

            {/* Planetary Positions - Clickable with Insights */}
            <div className="bg-black/40 backdrop-blur-md border border-dune-bene-gesserit-gold/30 rounded-lg p-6 shadow-xl">
              <h3 className="text-dune-amber font-semibold mb-4">Planetary Positions</h3>
              <p className="text-dune-spice-sand/50 text-xs mb-4 italic">Click a planet to reveal archetypal insights</p>
              <div className="space-y-1 text-sm max-h-[500px] overflow-y-auto">
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
                  { name: 'South Node', icon: '☋', data: chartData.southNode },
                  { name: 'Lilith', icon: '⚸', data: chartData.lilith },
                  { name: 'Ceres', icon: '⚳', data: chartData.ceres },
                  { name: 'Pallas', icon: '⚴', data: chartData.pallas },
                  { name: 'Juno', icon: '⚵', data: chartData.juno },
                  { name: 'Vesta', icon: '⚶', data: chartData.vesta },
                ].filter(p => p.data?.sign).map(({ name, icon, data }) => {
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
                            ? 'bg-dune-amber/10 border border-dune-amber/30'
                            : 'hover:bg-white/5 border border-transparent'
                        }`}
                        onClick={() => setExpandedPlanet(isExpanded ? null : name)}
                      >
                        <span className="text-dune-spice-sand/80 flex items-center gap-2">
                          <span className="text-lg">{icon}</span>
                          {name}
                          {(data as PlanetPosition)?.retrograde && <span className="text-red-400 text-xs">℞</span>}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-dune-amber">
                            {data?.sign} {data?.degree?.toFixed(1)}°
                            <span className="text-dune-spice-sand/50 ml-2">H{(data as PlanetPosition)?.house}</span>
                          </span>
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4 text-dune-amber/60" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-dune-spice-sand/40" />
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
                              <div className="flex items-center gap-2 mb-3 flex-wrap">
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

                              {/* Archetype Info */}
                              <div className="space-y-3">
                                {/* Planetary Archetype */}
                                <div>
                                  <h5 className="text-xs uppercase tracking-wider text-dune-spice-sand/50 mb-1">
                                    {name} Archetype
                                  </h5>
                                  <p className="text-dune-spice-sand/90 text-sm font-medium">
                                    {planetArchetype?.archetype || 'The Guide'}
                                  </p>
                                  <p className="text-dune-spice-sand/50 text-xs mt-1">
                                    {planetArchetype?.description}
                                  </p>
                                </div>

                                {/* Sign Facet */}
                                <div>
                                  <h5 className="text-xs uppercase tracking-wider text-dune-spice-sand/50 mb-1">
                                    {data.sign} Expression
                                  </h5>
                                  <p className="text-dune-amber text-sm font-medium">
                                    {zodiacArchetype?.facetName}
                                  </p>
                                  {zodiacArchetype?.archetypes?.mythological && (
                                    <p className="text-dune-spice-sand/50 text-xs mt-1 italic">
                                      {zodiacArchetype.archetypes.mythological.slice(0, 2).join(', ')}
                                    </p>
                                  )}
                                </div>

                                {/* House Activation */}
                                {houseData && (
                                  <div>
                                    <h5 className="text-xs uppercase tracking-wider text-dune-spice-sand/50 mb-1">
                                      House {(data as PlanetPosition).house} Activation
                                    </h5>
                                    <p className="text-dune-spice-sand/90 text-sm font-medium">
                                      {houseData.facet}
                                    </p>
                                    <p className="text-dune-spice-sand/50 text-xs mt-1">
                                      {houseData.lesson}
                                    </p>
                                  </div>
                                )}

                                {/* Aspects */}
                                {planetAspects.length > 0 && (
                                  <div>
                                    <h5 className="text-xs uppercase tracking-wider text-dune-spice-sand/50 mb-1">
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
                                            <span className="text-dune-spice-sand/60"> with {otherPlanet}</span>
                                            {aspectSynthesis?.coreQuestion && (
                                              <p className="text-dune-spice-sand/40 text-xs italic mt-0.5 pl-2 border-l border-white/10">
                                                {aspectSynthesis.coreQuestion}
                                              </p>
                                            )}
                                          </div>
                                        );
                                      })}
                                      {planetAspects.length > 3 && (
                                        <p className="text-dune-spice-sand/30 text-xs italic">
                                          +{planetAspects.length - 3} more
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>

                              {/* Synthesis Quote */}
                              {generateArchetypalDescription(name, data.sign, (data as PlanetPosition).house) && (
                                <div className="mt-3 pt-3 border-t border-white/10">
                                  <p className="text-xs italic text-dune-amber/80">
                                    "{generateArchetypalDescription(name, data.sign, (data as PlanetPosition).house)}"
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

          {/* Major Aspects */}
          <div className="bg-black/40 backdrop-blur-md border border-dune-spice-orange/30 rounded-lg p-6 mb-12 shadow-xl">
            <h2 className="text-2xl font-bold text-dune-amber mb-6 flex items-center gap-2">
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
                        <span className="text-dune-amber font-semibold">
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
          {(chartData.northNode || chartData.southNode) && (
          <div className="bg-black/40 backdrop-blur-md border border-dune-navigator-purple/40 rounded-lg p-6 mb-12 shadow-xl">
            <h2 className="text-2xl font-bold text-dune-amber mb-6 flex items-center gap-2">
              <span className="text-3xl">☊☋</span>
              North & South Nodes
            </h2>
            <p className="text-dune-spice-sand/80 mb-6">
              Your soul's evolutionary path: past mastery and future growth
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* North Node */}
              {chartData.northNode && (
              <div className="bg-black/30 border border-dune-atreides-green/40 rounded-lg p-5">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl">☊</span>
                  <h3 className="text-xl font-bold text-dune-atreides-green">North Node</h3>
                </div>
                <p className="text-lg font-semibold text-dune-amber mb-2">
                  {chartData.northNode.sign} in {chartData.northNode.house}
                  {chartData.northNode.house === 1 ? 'st' :
                   chartData.northNode.house === 2 ? 'nd' :
                   chartData.northNode.house === 3 ? 'rd' : 'th'} House
                </p>
                <p className="text-sm text-dune-spice-sand/70 mb-2">
                  {chartData.northNode.degree.toFixed(1)}°
                </p>
                <p className="text-dune-spice-sand/70 text-sm mb-3">
                  Your soul's calling toward {getZodiacArchetype(chartData.northNode.sign.toLowerCase())?.facetName?.toLowerCase() || 'growth'} energy.
                  {getZodiacArchetype(chartData.northNode.sign.toLowerCase())?.archetypes?.mythological?.[0] &&
                   ` Embrace the archetype of ${getZodiacArchetype(chartData.northNode.sign.toLowerCase())?.archetypes?.mythological?.[0]}.`}
                </p>
              </div>
              )}

              {/* South Node */}
              {chartData.southNode && (
              <div className="bg-black/30 border border-dune-sienna-rock/40 rounded-lg p-5">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl">☋</span>
                  <h3 className="text-xl font-bold text-dune-sienna-rock">South Node</h3>
                </div>
                <p className="text-lg font-semibold text-dune-amber mb-2">
                  {chartData.southNode.sign} in {chartData.southNode.house}
                  {chartData.southNode.house === 1 ? 'st' :
                   chartData.southNode.house === 2 ? 'nd' :
                   chartData.southNode.house === 3 ? 'rd' : 'th'} House
                </p>
                <p className="text-sm text-dune-spice-sand/70 mb-2">
                  {chartData.southNode.degree.toFixed(1)}°
                </p>
                <p className="text-dune-spice-sand/70 text-sm mb-3">
                  Past life mastery in {getZodiacArchetype(chartData.southNode.sign.toLowerCase())?.facetName?.toLowerCase() || 'expression'} energy.
                  {getZodiacArchetype(chartData.southNode.sign.toLowerCase())?.archetypes?.mythological?.[0] &&
                   ` Release the shadow of ${getZodiacArchetype(chartData.southNode.sign.toLowerCase())?.archetypes?.mythological?.[0]}.`}
                </p>
              </div>
              )}
            </div>
          </div>
          )}

          {/* Current Transits */}
          <div className="bg-black/40 backdrop-blur-md border border-dune-spice-blue/40 rounded-lg p-6 mb-12 shadow-xl">
            <h2 className="text-2xl font-bold text-dune-amber mb-6 flex items-center gap-2">
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
            <h2 className="text-2xl font-bold text-dune-amber mb-6">Spiralogic Pathways</h2>
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
                    <h3 className="text-xl font-bold text-dune-amber">Fire Pathway</h3>
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
                    <h3 className="text-xl font-bold text-dune-amber">Water Pathway</h3>
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
                    <h3 className="text-xl font-bold text-dune-amber">Earth Pathway</h3>
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
                    <h3 className="text-xl font-bold text-dune-amber">Air Pathway</h3>
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
                    <h3 className="text-2xl font-bold text-dune-amber group-hover:text-dune-spice-orange transition-colors mb-2">
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

            {/* Cross-System Convergence */}
            <div className="mt-6">
              <div className="flex items-center gap-2 mb-4">
                <h2 className="text-lg font-semibold text-white/80">
                  Additional Wisdom Systems
                </h2>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        aria-label="What does cross-system convergence mean?"
                        className="inline-flex items-center"
                      >
                        <Info className="w-4 h-4 text-white/40 hover:text-white/70" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p>{getTooltip('s', 'pragmatic')}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <p className="text-sm text-white/50 mb-4">
                {CARD_COPY.pragmatic}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Mayan Astrology */}
              <Link
                href="/astrology/mayan"
                className="group inline-flex items-center gap-3 bg-black/30 hover:bg-black/50 border border-dune-bene-gesserit-gold/40 hover:border-dune-bene-gesserit-gold/70 rounded-xl p-6 transition-all duration-300 shadow-lg hover:shadow-dune-bene-gesserit-gold/20"
              >
                <div className="text-4xl">☀️</div>
                <div className="text-left">
                  <h3 className="text-xl font-bold text-dune-amber group-hover:text-dune-bene-gesserit-gold transition-colors">
                    Mayan Astrology
                  </h3>
                  <p className="text-dune-spice-sand/70 text-sm">
                    Discover your Galactic Signature in the Tzolk&apos;in Sacred Calendar →
                  </p>
                </div>
              </Link>

              {/* Synastry */}
              <Link
                href="/astrology/synastry"
                className="group inline-flex items-center gap-3 bg-black/30 hover:bg-black/50 border border-violet-500/40 hover:border-violet-500/70 rounded-xl p-6 transition-all duration-300 shadow-lg hover:shadow-violet-500/20"
              >
                <div className="text-4xl">💞</div>
                <div className="text-left">
                  <h3 className="text-xl font-bold text-dune-amber group-hover:text-violet-300 transition-colors">
                    Synastry
                  </h3>
                  <p className="text-dune-spice-sand/70 text-sm">
                    Compare two charts for harmony, friction, and soul-growth vectors →
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
                  <h3 className="text-xl font-bold text-dune-amber group-hover:text-red-400 transition-colors">
                    Chinese Astrology
                  </h3>
                  <p className="text-dune-spice-sand/70 text-sm">
                    Explore your zodiac animal, element, and cosmic destiny →
                  </p>
                </div>
              </Link>
              </div>
            </div>

            {/* Saved Synastry */}
            <div className="mt-6 rounded-2xl border border-white/10 bg-black/20 p-5 shadow-lg">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-white">Saved Synastry</h2>
                  <p className="text-sm text-white/60">Your recent relationship analyses</p>
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    href="/astrology/synastry"
                    className="rounded-lg border border-white/20 bg-white/5 px-3 py-1.5 text-xs text-white/70 hover:bg-white/10"
                  >
                    New
                  </Link>
                  <Link
                    href="/astrology/synastry/saved"
                    className="rounded-lg border border-white/20 bg-white/5 px-3 py-1.5 text-xs text-white/70 hover:bg-white/10"
                  >
                    View all
                  </Link>
                </div>
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-3">
                {savedSynastryLoading ? (
                  <>
                    <div className="h-20 rounded-xl bg-white/5 animate-pulse" />
                    <div className="h-20 rounded-xl bg-white/5 animate-pulse" />
                    <div className="h-20 rounded-xl bg-white/5 animate-pulse" />
                  </>
                ) : sortedSavedSynastry.length === 0 ? (
                  <div className="col-span-3 text-sm text-white/60 py-4">
                    No saved synastry yet. Run one and hit <span className="text-white/80">Save to Timeline</span>.
                  </div>
                ) : (
                  sortedSavedSynastry.map((item) => {
                    const a = item.chartA?.sunSign ?? 'Person A';
                    const b = item.chartB?.sunSign ?? 'Person B';
                    const when = item.savedAt ? new Date(item.savedAt).toLocaleDateString() : '';
                    const s = item.scores ?? {};
                    return (
                      <Link
                        key={item.analysisId}
                        href={`/astrology/synastry/${item.analysisId}`}
                        className="group rounded-xl border border-white/10 bg-black/20 p-4 hover:border-violet-500/40 hover:bg-black/30 transition"
                      >
                        <div className="text-sm font-semibold text-white group-hover:text-violet-200">
                          {a} × {b}
                        </div>
                        <div className="mt-1 text-xs text-white/50">Saved {when}</div>
                        <div className="mt-2 flex flex-wrap gap-2 text-[10px] text-white/50">
                          {typeof s.attraction === 'number' && <span>A:{s.attraction.toFixed(1)}</span>}
                          {typeof s.harmony === 'number' && <span>H:{s.harmony.toFixed(1)}</span>}
                          {typeof s.friction === 'number' && <span>F:{s.friction.toFixed(1)}</span>}
                          {typeof s.growth === 'number' && <span>G:{s.growth.toFixed(1)}</span>}
                        </div>
                      </Link>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}