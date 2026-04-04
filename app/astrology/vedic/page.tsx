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

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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

import ZodiacToggle, { type ZodiacSystem, type AyanamsaType } from '@/components/astrology/ZodiacToggle';
import NakshatraCard from '@/components/astrology/NakshatraCard';
import DashaTimeline from '@/components/astrology/DashaTimeline';
import type { CompleteVedicProfile, RashiInfo, GrahaPosition, GrahaName } from '@/lib/astrology/types/vedic';
import { GRAHAS } from '@/lib/astrology/types/vedic';
import type { GocharaProfile } from '@/lib/astrology/gocharaTransits';
import type { AshtakavargaProfile } from '@/lib/astrology/ashtakavarga';

type ViewMode = 'profile' | 'dasha' | 'chart' | 'gochara' | 'ashtakavarga';

export default function VedicAstrologyPage() {
  const router = useRouter();

  // System selector: navigate to sibling systems
  const handleSystemChange = useCallback((mode: ZodiacSystem) => {
    if (mode === 'tropical') { router.push('/astrology'); }
    if (mode === 'chinese') { router.push('/astrology/chinese'); }
    if (mode === 'mayan') { router.push('/astrology/mayan'); }
  }, [router]);

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

  // Vedic forecasting state
  const [gocharaProfile, setGocharaProfile] = useState<GocharaProfile | null>(null);
  const [gocharaLoading, setGocharaLoading] = useState(false);
  const [ashtakavargaProfile, setAshtakavargaProfile] = useState<AshtakavargaProfile | null>(null);
  const [ashtakavargaLoading, setAshtakavargaLoading] = useState(false);

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

  // Auto-calculate only when restoring saved data on mount (not during fresh input)
  const isRestoringRef = useRef(true);
  useEffect(() => {
    if (isRestoringRef.current && birthDate && !didAutoLoad.current && !profile) {
      didAutoLoad.current = true;
      calculateProfile();
    }
    isRestoringRef.current = false;
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
      const response = await fetch('/api/astrology/vedic/list', {
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

  // Calculate Gochara (Vedic Transits)
  const calculateGochara = async () => {
    if (!profile) return;

    setGocharaLoading(true);
    try {
      const response = await fetch('/api/astrology/vedic/gochara', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          natalMoonRashi: profile.moonSign.name,
          ayanamsa,
        }),
      });

      const result = await response.json();
      if (result.success) {
        setGocharaProfile(result.data.profile);
      }
    } catch (err) {
      console.error('Gochara calculation error:', err);
    } finally {
      setGocharaLoading(false);
    }
  };

  // Calculate Ashtakavarga (Transit Strength)
  const calculateAshtakavarga = async () => {
    if (!birthDate) return;

    setAshtakavargaLoading(true);
    try {
      const response = await fetch('/api/astrology/vedic/ashtakavarga', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: birthDate,
          time: birthTime || '12:00',
          location: location || { lat: 0, lng: 0, timezone: 'UTC' },
          ayanamsa,
          includeCurrentTransits: true,
        }),
      });

      const result = await response.json();
      if (result.success) {
        setAshtakavargaProfile(result.data.profile);
      }
    } catch (err) {
      console.error('Ashtakavarga calculation error:', err);
    } finally {
      setAshtakavargaLoading(false);
    }
  };

  // Auto-load forecasting data when switching views
  useEffect(() => {
    if (activeView === 'gochara' && profile && !gocharaProfile && !gocharaLoading) {
      calculateGochara();
    }
    if (activeView === 'ashtakavarga' && birthDate && !ashtakavargaProfile && !ashtakavargaLoading) {
      calculateAshtakavarga();
    }
  }, [activeView, profile, birthDate]);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setBirthDate(value);
    localStorage.setItem('birthDate', value);
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

      {/* System Selector */}
      <div className="fixed top-4 right-4 z-50">
        <div className="backdrop-blur-sm bg-black/20 rounded-xl p-2">
          <ZodiacToggle value="sidereal" onChange={handleSystemChange} compact />
        </div>
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
              <div className="flex flex-wrap bg-stone-900/60 rounded-lg p-1 border border-stone-800/50">
                {[
                  { id: 'profile', label: 'Profile', icon: Star },
                  { id: 'dasha', label: 'Dasha', icon: Clock, requiresDasha: true },
                  { id: 'chart', label: 'Planets', icon: Sun },
                  { id: 'gochara', label: 'Transits', icon: Moon },
                  { id: 'ashtakavarga', label: 'Strength', icon: Sparkles },
                ]
                  .filter((tab) => !tab.requiresDasha || profile.dasha)
                  .map(({ id, label, icon: Icon }) => (
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
                      {profile.dasha ? 'Current Dasha Period' : 'Dasha Timeline'}
                    </h3>
                    {profile.dasha ? (
                      <>
                        <DashaTimeline profile={profile.dasha} compact />
                        <button
                          onClick={() => setActiveView('dasha')}
                          className="mt-3 text-sm text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                        >
                          View full timeline
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </>
                    ) : (
                      <div className="bg-indigo-900/20 border border-indigo-700/30 rounded-xl p-4 text-sm text-indigo-400/70">
                        Dasha timeline requires birth time for accurate calculation.
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
                    Calculated using {profile.chart.ayanamsa.label} ayanamsa ({profile.chart.ayanamsaValue.toFixed(2)}°)
                  </div>
                </motion.div>
              )}

              {/* Dasha View */}
              {activeView === 'dasha' && profile.dasha && (
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

              {/* Gochara View */}
              {activeView === 'gochara' && (
                <motion.div
                  key="gochara"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-indigo-200 flex items-center gap-2">
                      <Moon className="w-5 h-5 text-indigo-400" />
                      Gochara — Current Transits from Moon
                    </h3>
                    <button
                      onClick={calculateGochara}
                      disabled={gocharaLoading}
                      className="text-sm text-indigo-400 hover:text-indigo-300 disabled:opacity-50"
                    >
                      {gocharaLoading ? 'Updating...' : 'Refresh'}
                    </button>
                  </div>

                  <p className="text-sm text-indigo-400/60">
                    Vedic transits are read from your Moon sign ({profile.moonSign.name}), not the Sun.
                    This shows how current planetary positions affect you.
                  </p>

                  {gocharaLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                      >
                        <Sparkles className="w-6 h-6 text-indigo-400" />
                      </motion.div>
                    </div>
                  ) : gocharaProfile ? (
                    <div className="space-y-4">
                      {/* Overall Tone */}
                      <div className={`
                        p-4 rounded-xl border
                        ${gocharaProfile.overallTone === 'excellent' || gocharaProfile.overallTone === 'good'
                          ? 'bg-emerald-900/20 border-emerald-700/30'
                          : gocharaProfile.overallTone === 'challenging' || gocharaProfile.overallTone === 'difficult'
                          ? 'bg-amber-900/20 border-amber-700/30'
                          : 'bg-indigo-900/20 border-indigo-700/30'
                        }
                      `}>
                        <div className="text-sm font-medium text-indigo-200 mb-1">
                          Overall Transit Period: {gocharaProfile.overallTone.charAt(0).toUpperCase() + gocharaProfile.overallTone.slice(1)}
                        </div>
                        <div className="text-sm text-indigo-400/70">
                          {gocharaProfile.summary}
                        </div>
                      </div>

                      {/* Transit Cards */}
                      <div className="grid md:grid-cols-2 gap-4">
                        {gocharaProfile.transits.map((transit, idx) => (
                          <GocharaCard key={idx} transit={transit} />
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-indigo-400/60">
                      Loading transit data...
                    </div>
                  )}
                </motion.div>
              )}

              {/* Ashtakavarga View */}
              {activeView === 'ashtakavarga' && (
                <motion.div
                  key="ashtakavarga"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-indigo-200 flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-indigo-400" />
                      Ashtakavarga — Transit Strength
                    </h3>
                    <button
                      onClick={calculateAshtakavarga}
                      disabled={ashtakavargaLoading}
                      className="text-sm text-indigo-400 hover:text-indigo-300 disabled:opacity-50"
                    >
                      {ashtakavargaLoading ? 'Updating...' : 'Refresh'}
                    </button>
                  </div>

                  <p className="text-sm text-indigo-400/60">
                    The 8-point strength system reveals which transits carry power.
                    Higher bindu counts indicate stronger, more favorable transit effects.
                  </p>

                  {ashtakavargaLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                      >
                        <Sparkles className="w-6 h-6 text-indigo-400" />
                      </motion.div>
                    </div>
                  ) : ashtakavargaProfile ? (
                    <div className="space-y-6">
                      {/* SAV Summary */}
                      <div className="bg-indigo-900/20 border border-indigo-700/30 rounded-xl p-4">
                        <div className="text-sm font-medium text-indigo-200 mb-2">
                          Sarva Ashtakavarga — Combined Chart Strength
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-3xl font-bold text-indigo-100">
                            {ashtakavargaProfile.sarvaAshtakavarga.totalSarva}
                          </div>
                          <div className="text-sm text-indigo-400/70">
                            Total bindus across all houses
                            <br />
                            <span className="text-xs">
                              Strong houses: {ashtakavargaProfile.sarvaAshtakavarga.sarvaBindus.map((b, i) => b >= 28 ? i + 1 : null).filter(Boolean).join(', ') || 'None'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Transit Strength Cards */}
                      <div>
                        <h4 className="text-sm font-medium text-indigo-300 mb-3">
                          Current Transit Strengths
                        </h4>
                        <div className="grid md:grid-cols-2 gap-4">
                          {ashtakavargaProfile.transitStrengths.map((transit, idx) => (
                            <AshtakavargaCard key={idx} transit={transit} />
                          ))}
                        </div>
                      </div>

                      {/* Bindu Scale Legend */}
                      <div className="text-xs text-indigo-400/50 border-t border-indigo-800/30 pt-4">
                        <div className="font-medium mb-1">Bindu Scale:</div>
                        <div className="flex flex-wrap gap-3">
                          <span><span className="text-emerald-400">6-8</span> Excellent</span>
                          <span><span className="text-green-400">5</span> Good</span>
                          <span><span className="text-indigo-400">4</span> Average</span>
                          <span><span className="text-amber-400">3</span> Weak</span>
                          <span><span className="text-red-400">0-2</span> Poor</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-indigo-400/60">
                      Loading strength data...
                    </div>
                  )}
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

// Sub-component for Gochara transit display
function GocharaCard({ transit }: { transit: GocharaProfile['transits'][0] }) {
  const effectColors: Record<string, string> = {
    benefic: 'from-emerald-900/40 to-green-900/40 border-emerald-500/30',
    malefic: 'from-amber-900/40 to-orange-900/40 border-amber-500/30',
    neutral: 'from-stone-900/40 to-indigo-950/40 border-indigo-500/30',
  };

  const colors = effectColors[transit.effect] || effectColors.neutral;

  return (
    <div className={`bg-gradient-to-br ${colors} border rounded-xl p-4`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div>
            <div className="text-sm font-semibold text-indigo-200">
              {transit.graha}
            </div>
            <div className="text-xs text-indigo-400/60">
              House {transit.houseFromMoon} from Moon
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {transit.vedhaBlocked && (
            <span className="px-2 py-0.5 bg-red-500/20 text-red-300 text-xs rounded border border-red-500/30">
              Blocked
            </span>
          )}
          <span className={`
            px-2 py-0.5 text-xs rounded
            ${transit.effect === 'excellent' || transit.effect === 'good'
              ? 'bg-emerald-500/20 text-emerald-300'
              : transit.effect === 'challenging' || transit.effect === 'difficult'
              ? 'bg-amber-500/20 text-amber-300'
              : 'bg-indigo-500/20 text-indigo-300'
            }
          `}>
            {transit.effect}
          </span>
        </div>
      </div>

      <div className="text-sm text-indigo-300/70 mb-2">
        {transit.interpretation}
      </div>

      {transit.keywords && transit.keywords.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {transit.keywords.map((keyword, i) => (
            <span
              key={i}
              className="px-2 py-0.5 bg-indigo-900/40 text-xs text-indigo-400 rounded"
            >
              {keyword}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

// Sub-component for Ashtakavarga transit strength display
function AshtakavargaCard({
  transit,
}: {
  transit: AshtakavargaProfile['transitStrengths'][0];
}) {
  const strengthColors: Record<string, string> = {
    excellent: 'from-emerald-900/40 to-green-900/40 border-emerald-500/30',
    good: 'from-green-900/40 to-emerald-900/40 border-green-500/30',
    average: 'from-indigo-900/40 to-purple-900/40 border-indigo-500/30',
    weak: 'from-amber-900/40 to-orange-900/40 border-amber-500/30',
    poor: 'from-red-900/40 to-orange-900/40 border-red-500/30',
  };

  const colors = strengthColors[transit.strength] || strengthColors.average;

  return (
    <div className={`bg-gradient-to-br ${colors} border rounded-xl p-4`}>
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm font-semibold text-indigo-200">
          {transit.planet}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-indigo-100">
            {transit.bindus}
          </span>
          <span className="text-xs text-indigo-400/60">bindus</span>
        </div>
      </div>

      <div className="text-xs text-indigo-400/60 mb-2">
        House {transit.transitHouse} • {transit.strength.charAt(0).toUpperCase() + transit.strength.slice(1)} strength
      </div>

      <div className="text-sm text-indigo-300/70">
        {transit.interpretation}
      </div>

      {/* Show remedies for weak transits */}
      {'remedies' in transit && (transit as { remedies?: string[] }).remedies && (transit as { remedies: string[] }).remedies.length > 0 && (
        <div className="mt-3 pt-3 border-t border-indigo-700/30">
          <div className="text-xs text-amber-400 mb-1">Remedial Measures:</div>
          <ul className="text-xs text-indigo-400/70 space-y-0.5">
            {(transit as { remedies: string[] }).remedies.slice(0, 2).map((remedy, i) => (
              <li key={i}>• {remedy}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
