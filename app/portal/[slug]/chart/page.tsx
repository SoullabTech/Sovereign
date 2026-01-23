'use client';

/**
 * PORTAL ASTROLOGY / CHART PAGE
 *
 * Client-facing birth chart experience within the practitioner portal.
 * Uses the same core astrology components but with portal branding.
 */

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Sparkles, Star, Moon, Sun, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { SacredHouseWheel } from '@/components/astrology/SacredHouseWheel';
import { ElementalBalanceDisplay } from '@/components/astrology/ElementalBalanceDisplay';
import { getOrCreateExplorerId } from '@/lib/identity/explorerId';
import { apiUrl } from '@/lib/http/apiBase';

interface BirthData {
  date: string;
  time: string;
  location: string;
  latitude: number;
  longitude: number;
  timezone: string;
}

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
  ascendant: { sign: string; degree: number };
  midheaven?: { sign: string; degree: number };
  aspects: Array<{
    planet1: string;
    planet2: string;
    type: string;
    orb: number;
  }>;
}

// Cosmic palette matching portal design
const colors = {
  void: '#0D0B14',
  cosmos: '#1A1625',
  nebula: '#251F33',
  gold: '#E5C158',
  violet: '#B8A5D9',
  starlight: '#FFFFFF',
  muted: '#D0C5E8',
  border: '#4A3D5C',
};

// Map signs to elements for elemental balance calculation
const signToElement: Record<string, 'fire' | 'water' | 'earth' | 'air'> = {
  Aries: 'fire', Leo: 'fire', Sagittarius: 'fire',
  Cancer: 'water', Scorpio: 'water', Pisces: 'water',
  Taurus: 'earth', Virgo: 'earth', Capricorn: 'earth',
  Gemini: 'air', Libra: 'air', Aquarius: 'air',
};

// Transform BirthChartData to planets array for SacredHouseWheel
function transformToPlanets(chartData: BirthChartData): Array<{ name: string; sign: string; house: number; degree: number }> {
  const planets: Array<{ name: string; sign: string; house: number; degree: number }> = [];
  const planetKeys = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto'] as const;

  for (const key of planetKeys) {
    const planet = chartData[key];
    if (planet) {
      planets.push({
        name: key.charAt(0).toUpperCase() + key.slice(1),
        sign: planet.sign,
        house: planet.house,
        degree: planet.degree,
      });
    }
  }
  return planets;
}

// Calculate elemental balance from chart data
function calculateElementalBalance(chartData: BirthChartData): { fire: number; water: number; earth: number; air: number } {
  const balance = { fire: 0, water: 0, earth: 0, air: 0 };
  const planetKeys = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn'] as const;

  for (const key of planetKeys) {
    const planet = chartData[key];
    if (planet) {
      const element = signToElement[planet.sign];
      if (element) {
        balance[element] += key === 'sun' || key === 'moon' ? 2 : 1;
      }
    }
  }

  // Normalize to percentages
  const total = balance.fire + balance.water + balance.earth + balance.air;
  if (total > 0) {
    balance.fire = Math.round((balance.fire / total) * 100);
    balance.water = Math.round((balance.water / total) * 100);
    balance.earth = Math.round((balance.earth / total) * 100);
    balance.air = Math.round((balance.air / total) * 100);
  }

  return balance;
}

export default function PortalChartPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [birthData, setBirthData] = useState<BirthData | null>(null);
  const [chartData, setChartData] = useState<BirthChartData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showEntry, setShowEntry] = useState(false);

  // Birth data form
  const [formDate, setFormDate] = useState('');
  const [formTime, setFormTime] = useState('');
  const [formLocation, setFormLocation] = useState('');
  const [formSubmitting, setFormSubmitting] = useState(false);

  useEffect(() => {
    loadChartData();
  }, []);

  const loadChartData = async () => {
    try {
      const explorerId = getOrCreateExplorerId();
      const response = await fetch(apiUrl(`/api/astrology/birth-chart?userId=${explorerId}`));

      if (response.ok) {
        const data = await response.json();
        if (data.birthChart) {
          setChartData(data.birthChart);
          setBirthData(data.birthData);
        } else {
          setShowEntry(true);
        }
      } else {
        setShowEntry(true);
      }
    } catch (err) {
      console.error('Failed to load chart:', err);
      setShowEntry(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitBirthData = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitting(true);

    try {
      const explorerId = getOrCreateExplorerId();

      // First geocode the location
      const geoResponse = await fetch(apiUrl(`/api/astrology/geocode?query=${encodeURIComponent(formLocation)}`));
      const geoData = await geoResponse.json();

      if (!geoData.latitude || !geoData.longitude) {
        alert('Could not find that location. Please try a different format.');
        setFormSubmitting(false);
        return;
      }

      // Calculate chart
      const calcResponse = await fetch(apiUrl('/api/astrology/calculate'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: explorerId,
          birthDate: formDate,
          birthTime: formTime,
          latitude: geoData.latitude,
          longitude: geoData.longitude,
          timezone: geoData.timezone || 'UTC',
          location: formLocation,
        }),
      });

      if (calcResponse.ok) {
        const data = await calcResponse.json();
        setChartData(data.birthChart);
        setBirthData({
          date: formDate,
          time: formTime,
          location: formLocation,
          latitude: geoData.latitude,
          longitude: geoData.longitude,
          timezone: geoData.timezone || 'UTC',
        });
        setShowEntry(false);
      }
    } catch (err) {
      console.error('Failed to calculate chart:', err);
    } finally {
      setFormSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        >
          <Star className="w-12 h-12" style={{ color: colors.gold }} />
        </motion.div>
      </div>
    );
  }

  // Birth data entry form
  if (showEntry || !chartData) {
    return (
      <div className="max-w-lg mx-auto py-12 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div className="flex items-center justify-center space-x-4 mb-6">
            <div className="h-px w-12" style={{ backgroundColor: colors.border }} />
            <Sparkles className="w-6 h-6" style={{ color: colors.gold }} />
            <div className="h-px w-12" style={{ backgroundColor: colors.border }} />
          </div>

          <h1 className="font-display text-3xl tracking-wide mb-4" style={{ color: colors.starlight }}>
            Your Birth Chart
          </h1>
          <p className="text-lg" style={{ color: colors.muted }}>
            Enter your birth details to reveal your cosmic blueprint
          </p>
        </motion.div>

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          onSubmit={handleSubmitBirthData}
          className="rounded-2xl p-8 backdrop-blur-xl"
          style={{
            background: `linear-gradient(135deg, rgba(45, 38, 64, 0.6), rgba(184, 165, 217, 0.1))`,
            border: `1px solid ${colors.border}`,
          }}
        >
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: colors.muted }}>
                Birth Date
              </label>
              <input
                type="date"
                value={formDate}
                onChange={(e) => setFormDate(e.target.value)}
                required
                className="w-full rounded-xl px-4 py-3 outline-none transition-all"
                style={{
                  background: 'rgba(13, 11, 20, 0.6)',
                  border: `1px solid ${colors.border}`,
                  color: colors.starlight,
                }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: colors.muted }}>
                Birth Time
              </label>
              <input
                type="time"
                value={formTime}
                onChange={(e) => setFormTime(e.target.value)}
                required
                className="w-full rounded-xl px-4 py-3 outline-none transition-all"
                style={{
                  background: 'rgba(13, 11, 20, 0.6)',
                  border: `1px solid ${colors.border}`,
                  color: colors.starlight,
                }}
              />
              <p className="text-xs mt-1" style={{ color: colors.muted }}>
                If unknown, use 12:00 noon (chart will be less precise)
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: colors.muted }}>
                Birth Location
              </label>
              <input
                type="text"
                value={formLocation}
                onChange={(e) => setFormLocation(e.target.value)}
                placeholder="City, Country"
                required
                className="w-full rounded-xl px-4 py-3 outline-none transition-all"
                style={{
                  background: 'rgba(13, 11, 20, 0.6)',
                  border: `1px solid ${colors.border}`,
                  color: colors.starlight,
                }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={formSubmitting}
            className="w-full mt-8 py-4 rounded-xl font-semibold transition-all hover:scale-[1.02] disabled:opacity-50"
            style={{
              backgroundColor: colors.gold,
              color: colors.void,
              boxShadow: `0 4px 20px ${colors.gold}40`,
            }}
          >
            {formSubmitting ? 'Calculating...' : 'Reveal My Chart'}
          </button>
        </motion.form>
      </div>
    );
  }

  // Chart display
  return (
    <div className="space-y-12 pb-12">
      {/* Header */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center pt-8"
      >
        <div className="flex items-center justify-center space-x-4 mb-6">
          <div className="h-px w-12" style={{ backgroundColor: colors.border }} />
          <Star className="w-5 h-5" style={{ color: colors.gold }} />
          <div className="h-px w-12" style={{ backgroundColor: colors.border }} />
        </div>

        <h1 className="font-display text-3xl md:text-4xl tracking-wide mb-4" style={{ color: colors.starlight }}>
          Your Cosmic Blueprint
        </h1>

        {/* Big Three Summary */}
        <div className="flex items-center justify-center gap-6 flex-wrap mt-6">
          <div className="flex items-center gap-2">
            <Sun className="w-5 h-5" style={{ color: colors.gold }} />
            <span style={{ color: colors.muted }}>
              Sun in <strong style={{ color: colors.starlight }}>{chartData.sun.sign}</strong>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Moon className="w-5 h-5" style={{ color: colors.violet }} />
            <span style={{ color: colors.muted }}>
              Moon in <strong style={{ color: colors.starlight }}>{chartData.moon.sign}</strong>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5" style={{ color: colors.gold }} />
            <span style={{ color: colors.muted }}>
              Rising <strong style={{ color: colors.starlight }}>{chartData.ascendant.sign}</strong>
            </span>
          </div>
        </div>
      </motion.section>

      {/* Sacred House Wheel */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="flex justify-center"
      >
        <div className="w-full max-w-xl">
          <SacredHouseWheel
            planets={transformToPlanets(chartData)}
            aspects={chartData.aspects.map(a => ({
              ...a,
              type: a.type as 'conjunction' | 'sextile' | 'square' | 'trine' | 'opposition',
            }))}
          />
        </div>
      </motion.section>

      {/* Elemental Balance */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="rounded-2xl p-8 backdrop-blur-xl"
        style={{
          background: `linear-gradient(135deg, rgba(45, 38, 64, 0.6), rgba(184, 165, 217, 0.1))`,
          border: `1px solid ${colors.border}`,
        }}
      >
        <h2 className="font-display text-2xl tracking-wide mb-6 text-center" style={{ color: colors.starlight }}>
          Elemental Balance
        </h2>
        <ElementalBalanceDisplay balance={calculateElementalBalance(chartData)} />
      </motion.section>

      {/* CTA to Book */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center rounded-2xl p-10 backdrop-blur-xl"
        style={{
          background: `linear-gradient(135deg, rgba(229, 193, 88, 0.1), rgba(45, 38, 64, 0.6))`,
          border: `1px solid ${colors.border}`,
        }}
      >
        <h2 className="font-display text-2xl tracking-wide mb-4" style={{ color: colors.starlight }}>
          Want to go deeper?
        </h2>
        <p className="mb-6" style={{ color: colors.muted }}>
          Book a session for a personalized reading of your chart.
        </p>
        <Link
          href={`/portal/${slug}/book`}
          className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-semibold transition-all hover:scale-105"
          style={{
            backgroundColor: colors.gold,
            color: colors.void,
            boxShadow: `0 4px 20px ${colors.gold}40`,
          }}
        >
          <span>Book a Reading</span>
          <ArrowRight className="w-5 h-5" />
        </Link>
      </motion.section>
    </div>
  );
}
