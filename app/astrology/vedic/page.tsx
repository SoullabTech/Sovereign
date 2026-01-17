'use client';

/**
 * Vedic Astrology (Jyotish) Page
 *
 * Complete Vedic astrology dashboard featuring:
 * - Sidereal birth chart with selectable ayanamsa
 * - Moon nakshatra and rashi analysis
 * - Vimshottari Dasha timeline
 * - Spiralogic integration
 */

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  ArrowLeft,
  Moon,
  Sun,
  Sparkles,
  Calendar,
  Clock,
  Star,
  ChevronRight,
  Settings2,
} from 'lucide-react';

import ZodiacToggle, { AyanamsaType } from '@/components/astrology/ZodiacToggle';
import NakshatraCard from '@/components/astrology/NakshatraCard';
import DashaTimeline from '@/components/astrology/DashaTimeline';
import type { CompleteVedicProfile, RashiInfo, GrahaPosition, GrahaName } from '@/lib/astrology/types/vedic';
import { GRAHAS } from '@/lib/astrology/types/vedic';

type ViewMode = 'profile' | 'dasha' | 'chart';

export default function VedicAstrologyPage() {
  // State
  const [birthDate, setBirthDate] = useState<string>('');
  const [birthTime, setBirthTime] = useState<string>('');
  const [location, setLocation] = useState<{ lat: number; lng: number; timezone: string } | null>(null);
  const [ayanamsa, setAyanamsa] = useState<AyanamsaType>('lahiri');
  const [profile, setProfile] = useState<CompleteVedicProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<ViewMode>('profile');
  const [showSettings, setShowSettings] = useState(false);
  const didAutoLoad = useRef(false);

  // Load saved data from localStorage
  useEffect(() => {
    const savedDate = localStorage.getItem('birthDate');
    const savedTime = localStorage.getItem('birthTime');
    const savedLocation = localStorage.getItem('birthLocation');
    const savedAyanamsa = localStorage.getItem('ayanamsa');

    if (savedDate) setBirthDate(savedDate);
    if (savedTime) setBirthTime(savedTime);
    if (savedLocation) {
      try {
        setLocation(JSON.parse(savedLocation));
      } catch {
        // Use default location
        setLocation({ lat: 0, lng: 0, timezone: 'UTC' });
      }
    }
    if (savedAyanamsa) setAyanamsa(savedAyanamsa as AyanamsaType);
  }, []);

  // Auto-calculate when data is loaded
  useEffect(() => {
    if (birthDate && !didAutoLoad.current && !profile) {
      didAutoLoad.current = true;
      calculateProfile();
    }
  }, [birthDate]);

  // Save ayanamsa preference
  useEffect(() => {
    localStorage.setItem('ayanamsa', ayanamsa);
    // Recalculate if profile exists
    if (profile && birthDate) {
      calculateProfile();
    }
  }, [ayanamsa]);

  const calculateProfile = async () => {
    if (!birthDate) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/astrology/vedic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: birthDate,
          time: birthTime || '12:00',
          location: location || { lat: 0, lng: 0, timezone: 'UTC' },
          ayanamsa,
          includeDasha: true,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to calculate Vedic chart');
      }

      setProfile(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to calculate chart');
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setBirthDate(value);
    localStorage.setItem('birthDate', value);
    didAutoLoad.current = false;
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setBirthTime(value);
    localStorage.setItem('birthTime', value);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-950 via-indigo-950/20 to-black">
      {/* Decorative Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/astrology"
            className="inline-flex items-center gap-2 text-indigo-400/60 hover:text-indigo-400 transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back to Astrology</span>
          </Link>

          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start justify-between"
          >
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-200 via-purple-200 to-indigo-200 bg-clip-text text-transparent">
                Vedic Astrology
              </h1>
              <p className="text-indigo-400/60 mt-2 max-w-xl">
                Jyotish — the science of light. Explore your sidereal birth chart,
                lunar nakshatra, and the Vimshottari Dasha periods that map your life's cosmic rhythm.
              </p>
            </div>

            {/* Settings Button */}
            <button
              onClick={() => setShowSettings(!showSettings)}
              className={`
                p-2 rounded-lg transition-colors
                ${showSettings ? 'bg-indigo-600/30 text-indigo-300' : 'text-indigo-400/60 hover:text-indigo-400'}
              `}
            >
              <Settings2 className="w-5 h-5" />
            </button>
          </motion.div>
        </div>

        {/* Settings Panel */}
        <AnimatePresence>
          {showSettings && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 overflow-hidden"
            >
              <div className="bg-indigo-900/20 border border-indigo-700/30 rounded-xl p-4 space-y-4">
                <h3 className="text-sm font-semibold text-indigo-200 flex items-center gap-2">
                  <Settings2 className="w-4 h-4" />
                  Calculation Settings
                </h3>

                {/* Ayanamsa Selection */}
                <div>
                  <label className="block text-xs text-indigo-400/60 uppercase tracking-wider mb-2">
                    Ayanamsa System
                  </label>
                  <ZodiacToggle
                    value="sidereal"
                    onChange={() => {}}
                    ayanamsa={ayanamsa}
                    onAyanamsaChange={setAyanamsa}
                    compact
                  />
                  <p className="text-xs text-indigo-400/50 mt-2">
                    The ayanamsa determines the offset between tropical and sidereal zodiacs (~24°).
                    Lahiri is the most widely used standard.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Birth Data Input */}
        {!profile && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-indigo-900/30 to-purple-900/30 border border-indigo-700/30 rounded-2xl p-6 mb-8"
          >
            <h3 className="text-lg font-semibold text-indigo-200 mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-indigo-400" />
              Enter Your Birth Details
            </h3>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-indigo-400/60 uppercase tracking-wider mb-2">
                  Birth Date
                </label>
                <input
                  type="date"
                  value={birthDate}
                  onChange={handleDateChange}
                  className="w-full bg-stone-900/50 border border-indigo-700/30 rounded-lg px-4 py-2.5 text-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                />
              </div>

              <div>
                <label className="block text-xs text-indigo-400/60 uppercase tracking-wider mb-2">
                  Birth Time (optional)
                </label>
                <input
                  type="time"
                  value={birthTime}
                  onChange={handleTimeChange}
                  className="w-full bg-stone-900/50 border border-indigo-700/30 rounded-lg px-4 py-2.5 text-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                />
              </div>
            </div>

            <button
              onClick={calculateProfile}
              disabled={!birthDate || loading}
              className={`
                mt-4 px-6 py-2.5 rounded-lg font-medium
                flex items-center gap-2 transition-all
                ${loading
                  ? 'bg-indigo-600/30 text-indigo-300 cursor-wait'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                }
              `}
            >
              {loading ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  >
                    <Sparkles className="w-4 h-4" />
                  </motion.div>
                  Calculating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Calculate Vedic Chart
                </>
              )}
            </button>
          </motion.div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-4 mb-6 text-red-300">
            {error}
          </div>
        )}

        {/* Profile Display */}
        {profile && (
          <>
            {/* View Toggle */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex bg-stone-900/60 rounded-lg p-1 border border-stone-800/50">
                {[
                  { id: 'profile', label: 'Profile', icon: Star },
                  { id: 'dasha', label: 'Dasha Timeline', icon: Clock },
                  { id: 'chart', label: 'Planets', icon: Sun },
                ].map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => setActiveView(id as ViewMode)}
                    className={`
                      flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium
                      transition-all duration-200
                      ${activeView === id
                        ? 'bg-indigo-600/80 text-white'
                        : 'text-indigo-400/60 hover:text-indigo-400/80'
                      }
                    `}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{label}</span>
                  </button>
                ))}
              </div>

              {/* New Chart Button */}
              <button
                onClick={() => {
                  setProfile(null);
                  didAutoLoad.current = false;
                }}
                className="text-sm text-indigo-400/60 hover:text-indigo-400 transition-colors"
              >
                New Chart
              </button>
            </div>

            {/* Profile View */}
            <AnimatePresence mode="wait">
              {activeView === 'profile' && (
                <motion.div
                  key="profile"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  {/* Core Identity - Moon Sign */}
                  <div className="grid md:grid-cols-3 gap-4">
                    <RashiCard
                      title="Moon Sign"
                      subtitle="Chandra Rashi (Core Identity)"
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
                      Current Dasha Period
                    </h3>
                    <DashaTimeline
                      profile={profile.dasha}
                      compact
                    />
                    <button
                      onClick={() => setActiveView('dasha')}
                      className="mt-3 text-sm text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                    >
                      View full timeline
                      <ChevronRight className="w-4 h-4" />
                    </button>
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
                    Calculated using {profile.chart.ayanamsa.label} ayanamsa ({profile.chart.ayanamsaValue.toFixed(2)}°)
                  </div>
                </motion.div>
              )}

              {/* Dasha View */}
              {activeView === 'dasha' && (
                <motion.div
                  key="dasha"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <DashaTimeline
                    profile={profile.dasha}
                    birthDate={birthDate}
                    birthTime={birthTime}
                  />
                </motion.div>
              )}

              {/* Chart View */}
              {activeView === 'chart' && (
                <motion.div
                  key="chart"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  <h3 className="text-lg font-semibold text-indigo-200 flex items-center gap-2">
                    <Sun className="w-5 h-5 text-indigo-400" />
                    Planetary Positions (Grahas)
                  </h3>

                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {(Object.keys(profile.chart.grahas) as GrahaName[]).map((name) => {
                      const position = profile.chart.grahas[name];
                      return (
                        <GrahaCard key={name} position={position} />
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Talk to MAIA CTA */}
            <div className="mt-12 pt-8 border-t border-indigo-800/30 text-center">
              <p className="text-indigo-400/60 mb-4">
                Want to explore what your Vedic chart means for your life path?
              </p>
              <Link
                href="/maia"
                className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium transition-colors"
              >
                <Sparkles className="w-4 h-4" />
                Talk to MAIA about your chart
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// Sub-component for Rashi display
function RashiCard({
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
function GrahaCard({ position }: { position: GrahaPosition }) {
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
