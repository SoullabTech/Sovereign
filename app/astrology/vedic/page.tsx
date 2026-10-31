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
import { apiUrl } from '@/lib/http/apiBase';
import { useVerifiedFreeAstrologyBirthProfile } from '@/lib/hooks/useVerifiedFreeAstrologyBirthProfile';

type ViewMode = 'profile' | 'dasha' | 'chart';

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
  const verifiedBirth = useVerifiedFreeAstrologyBirthProfile();
  const calculationEpochRef = useRef(0);

  // Server-verified saved birth facts only; no local birth-date/location
  // restoration. Unknown historical browser values remain untouched.
  useEffect(() => {
    ++calculationEpochRef.current;
    setProfile(null);
    setBirthDate('');
    setBirthTime('');
    setLocation(null);
    setError(null);

    const data=verifiedBirth.status==='verified' ? verifiedBirth.birthData : null;
    if(!data)return;
    setBirthDate(data.date);
    setBirthTime(data.time||'');
    if(data.location){
      setLocation({
        lat:data.location.lat,lng:data.location.lng,
        timezone:data.location.timezone,
      });
      // Use EXACT verified source of this member for the initial calculation;
      // not stale state from the preceding member or an unbound browser cache.
      void calculateProfileFor(
        data.date,data.time||'',
        {lat:data.location.lat,lng:data.location.lng,
         timezone:data.location.timezone},
      );
    }
  }, [verifiedBirth.status,verifiedBirth.memberId,
      verifiedBirth.birthData?.date,verifiedBirth.birthData?.time,
      verifiedBirth.birthData?.location?.lat,
      verifiedBirth.birthData?.location?.lng,
      verifiedBirth.birthData?.location?.timezone]);

  // Save ayanamsa preference
  useEffect(() => {
    localStorage.setItem('ayanamsa', ayanamsa);
    // Recalculate if profile exists
    if (profile && birthDate) {
      calculateProfile();
    }
  }, [ayanamsa]);

  const calculateProfileFor = async (
    date:string, time:string,
    verifiedLocation:{lat:number;lng:number;timezone:string}|null,
  ) => {
    if(!date||!verifiedLocation||
      !Number.isFinite(verifiedLocation.lat)||
      !Number.isFinite(verifiedLocation.lng)||
      !verifiedLocation.timezone){
      setError('Choose a verified birth place and timezone in your chart information first.');
      return;
    }
    const request=++calculationEpochRef.current;
    setLoading(true);
    setError(null);
    try {
      // Identity-free astronomical calculator. Never attach a member bearer
      // or route private natal data into ordinary MAIA.
      const response=await fetch(apiUrl('/api/astrology/vedic/list'),{
        method:'POST',headers:{'Content-Type':'application/json'},
        body:JSON.stringify({
          date,time:time||'12:00',location:verifiedLocation,
          ayanamsa,includeDasha:Boolean(time),
        }),
      });
      if(request!==calculationEpochRef.current)return;
      const result=await response.json().catch(()=>null);
      if(request!==calculationEpochRef.current)return;
      if(!response.ok||result?.success!==true||!result.data){
        const message = result?.code === 'VEDIC_BIRTH_TIME_NONEXISTENT'
          ? 'That local clock time did not occur in the saved birthplace timezone. Correct the recorded birth time before calculating this chart.'
          : result?.code === 'VEDIC_BIRTH_TIME_AMBIGUOUS'
          ? 'That local time occurred twice in the saved birthplace timezone. Soullab will not choose between the two instants; time-sensitive Vedic calculation is withheld until an explicit offset choice is available.'
          : result?.code === 'VEDIC_BIRTH_TIME_UNRESOLVED'
          ? 'Soullab could not establish one exact birth instant from the saved local time and timezone. Review the recorded birth details before calculating this chart.'
          : 'This chart could not be calculated. Check your verified birth details and try again.';
        throw new Error(message);
      }
      setProfile(result.data);
    } catch (caught) {
      if(request===calculationEpochRef.current)
        setError(caught instanceof Error
          ? caught.message
          : 'This chart could not be calculated. Check your verified birth details and try again.');
    } finally {
      if(request===calculationEpochRef.current)setLoading(false);
    }
  };
  const calculateProfile=async()=>{
    await calculateProfileFor(birthDate,birthTime,location);
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setBirthDate(value);
    ++calculationEpochRef.current;
    setProfile(null);
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setBirthTime(value);
    ++calculationEpochRef.current;
    setProfile(null);
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
                Jyotish — the science of light. Explore a locally calculated sidereal chart,
                lunar nakshatra and Vimshottari Dasha timeline as symbolic lenses rather than fixed verdicts.
              </p>
              <p className="mt-3 max-w-2xl rounded-lg border border-amber-500/25 bg-amber-500/10 px-3 py-2 text-xs text-amber-200/80" role="note">
                Method boundary: this local natal and nakshatra view uses Soullab provisional approximations
                to named ayanamsa conventions. The Dasha timeline is symbolic and not professionally certified timing.
                Current Gochara and Ashtakavarga forecasts remain withheld pending independent qualification.
              </p>
            </div>

            {/* Settings Button */}
            <button
              aria-label="Vedic calculation settings"
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
                    ayanamsaDescriptionMode="provisional"
                    compact
                  />
                  <p className="text-xs text-indigo-400/50 mt-2">
                    The selected name orients the provisional local offset model; it does not claim an exact,
                    official or reference-certified implementation of that convention.
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

            {!location && (
              <p role="status" className="mt-4 text-xs text-indigo-200/75">
                Birthplace/timezone unknown. You can study Jyotisha here,
                but a personalized chart requires the location saved in
                <Link href="/astrology" className="underline ml-1">
                  your existing Chart Information
                </Link>. No geographic default is assumed.
              </p>
            )}
            {!birthTime && (
              <p className="mt-3 text-xs text-indigo-200/75">
                Without a recorded birth time, noon is an explicitly
                approximate calculation and a Dasha timeline is withheld.
              </p>
            )}
            <button
              onClick={calculateProfile}
              disabled={!birthDate || !location || loading}
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
                  ++calculationEpochRef.current;
                  setProfile(null);
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
                          displayTimeZone={location?.timezone || 'UTC'}
                          compact
                        />
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
                    location={location || undefined}
                    displayTimeZone={location?.timezone || 'UTC'}
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
