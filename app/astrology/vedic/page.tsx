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
  Settings2,
} from 'lucide-react';

import ZodiacToggle, { type ZodiacSystem, type AyanamsaType } from '@/components/astrology/ZodiacToggle';
import DashaTimeline from '@/components/astrology/DashaTimeline';
import { VedicProfilePanel, VedicPlanetsPanel } from '@/components/astrology/VedicRoomViews';
import type { CompleteVedicProfile } from '@/lib/astrology/types/vedic';
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
                  <VedicProfilePanel
                    profile={profile}
                    displayTimeZone={location?.timezone || 'UTC'}
                    onViewDasha={() => setActiveView('dasha')}
                  />
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
                  <VedicPlanetsPanel chart={profile.chart} />
                </motion.div>
              )}

            </AnimatePresence>

          </>
        )}
      </div>
    </div>
  );
}
