'use client';

/**
 * Mayan Astrology Dashboard
 *
 * Tzolk'in Sacred Calendar - 260-day cycle
 * Shows birth sign (Solar Seal) and Galactic Tone
 * Integrates with Spiralogic elemental model
 *
 * Dune/Blade Runner aesthetic: Desert mysticism meets ancient future
 */

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Calendar, Sparkles, Sun as SunIcon, Moon as MoonIcon } from 'lucide-react';
import ZodiacToggle, { type ZodiacSystem } from '@/components/astrology/ZodiacToggle';
import { useVerifiedFreeAstrologyBirthProfile } from '@/lib/hooks/useVerifiedFreeAstrologyBirthProfile';
import { motion } from 'framer-motion';
import { MayanSignCard, MayanPathOfLife } from '@/components/astrology/MayanRoomViews';
import {
  calculateMayanBirthSign,
  getTodaysMayanSign,
  calculateCompleteMayanProfile,
  type MayanBirthSign,
  type CompleteMayanProfile,
  type PathOfLife,
} from '@/lib/astrology/mayanAstrology';

export default function MayanAstrologyPage() {
  const router = useRouter();

  const handleSystemChange = useCallback((mode: ZodiacSystem) => {
    if (mode === 'tropical') { router.push('/astrology'); }
    if (mode === 'sidereal') { router.push('/astrology/vedic'); }
    if (mode === 'chinese') { router.push('/astrology/chinese'); }
  }, [router]);

  const verifiedBirth = useVerifiedFreeAstrologyBirthProfile();
  const [birthDate, setBirthDate] = useState('');
  const [birthSign, setBirthSign] = useState<MayanBirthSign | null>(null);
  const [todaySign, setTodaySign] = useState<MayanBirthSign | null>(null);
  const [showToday, setShowToday] = useState(false);
  const [completeProfile, setCompleteProfile] = useState<CompleteMayanProfile | null>(null);
  const [activeView, setActiveView] = useState<'signature' | 'pillars' | 'today'>('pillars');

  // Public today's Dreamspell calendar display never needs natal data.
  useEffect(() => {
    setTodaySign(getTodaysMayanSign());
  }, []);

  // A saved personal date may only arrive from the verified member profile.
  // Historic local birthDate and beta_user caches are left untouched and
  // cannot automatically become a different person's calendar reading.
  useEffect(() => {
    setBirthDate('');
    setBirthSign(null);
    setCompleteProfile(null);
    const day=verifiedBirth.status==='verified'?verifiedBirth.birthData?.date:null;
    if(!day)return;
    setBirthDate(day);
    calculateSign(new Date(day+'T12:00:00.000Z'));
  },[verifiedBirth.status,verifiedBirth.memberId,verifiedBirth.birthData?.date]);

  const calculateSign = (date: Date) => {
    const sign = calculateMayanBirthSign(date);
    setBirthSign(sign);
    const profile = calculateCompleteMayanProfile(date);
    setCompleteProfile(profile);
  };

  const handleDateChange = (dateString: string) => {
    setBirthDate(dateString);
    if (dateString) {
      calculateSign(new Date(dateString+'T12:00:00.000Z'));
    } else {
      setBirthSign(null);
      setCompleteProfile(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-950 via-amber-950/20 to-black">
      {/* Ambient background */}
      <div className="fixed inset-0 opacity-10">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-500 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-orange-600 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* System selector */}
        <div className="flex items-center gap-4 mb-8">
          <Link
            href="/astrology"
            className="inline-flex items-center text-amber-500/40 hover:text-amber-400 transition-colors"
            aria-label="Back to Astrology"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <ZodiacToggle value="mayan" onChange={handleSystemChange} compact />
        </div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 text-amber-500 mb-4">
            <Calendar className="w-6 h-6" />
            <span className="text-sm uppercase tracking-wider font-light">Modern Dreamspell · Calendar-Inspired Reflection</span>
          </div>
          <h1 className="text-5xl font-bold text-amber-100 mb-4">
            Dreamspell · Modern Calendar-Inspired Astrology
          </h1>
          <p className="text-amber-300/80 text-lg max-w-3xl mx-auto leading-relaxed">
            Explore an optional symbolic reading from the modern Dreamspell
            system. Its Solar Seals and Galactic Tones are not identical to
            traditional Tzolk'in/Chol Q'ij daykeeping in living Maya communities.
            These reflections are possibilities, not facts about your future.
          </p>
        </motion.div>

        {/* Date Input — always visible so user can edit and try other birthdays */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md mx-auto mb-12"
        >
          <div className="bg-gradient-to-br from-stone-900/80 via-amber-950/40 to-stone-900/80 backdrop-blur-xl border border-amber-900/30 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-amber-100 mb-2">
              {birthSign ? 'Birth Date' : 'Discover Your Galactic Signature'}
            </h3>
            <p className="text-amber-400/70 text-xs mb-4">
              {birthSign
                ? 'Change the date to read another signature.'
                : 'Enter your birth date to reveal your Mayan solar seal and galactic tone.'}
            </p>
            <input
              type="date"
              value={birthDate}
              onChange={(e) => handleDateChange(e.target.value)}
              className="w-full px-4 py-3 bg-black/40 border border-amber-800/50 rounded-lg text-amber-100 focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all"
              min="1900-01-01"
              max={new Date().toISOString().split('T')[0]}
            />
          </div>
        </motion.div>

        {/* View Toggle */}
        {birthSign && todaySign && completeProfile && (
          <>
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            <button
              onClick={() => setActiveView('signature')}
              className={`px-5 py-3 rounded-lg font-semibold transition-all ${
                activeView === 'signature'
                  ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-lg'
                  : 'bg-stone-900/60 text-amber-500/60 hover:text-amber-400 border border-amber-900/30'
              }`}
            >
              <div className="flex items-center gap-2">
                <SunIcon className="w-5 h-5" />
                <span className="hidden sm:inline">Galactic</span> Signature
              </div>
            </button>
            <button
              onClick={() => setActiveView('pillars')}
              className={`px-5 py-3 rounded-lg font-semibold transition-all ${
                activeView === 'pillars'
                  ? 'bg-gradient-to-r from-purple-600 to-teal-600 text-white shadow-lg'
                  : 'bg-stone-900/60 text-amber-500/60 hover:text-amber-400 border border-amber-900/30'
              }`}
            >
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                Path of Life
              </div>
            </button>
            <button
              onClick={() => setActiveView('today')}
              className={`px-5 py-3 rounded-lg font-semibold transition-all ${
                activeView === 'today'
                  ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-lg'
                  : 'bg-stone-900/60 text-amber-500/60 hover:text-amber-400 border border-amber-900/30'
              }`}
            >
              <div className="flex items-center gap-2">
                <MoonIcon className="w-5 h-5" />
                Today's Energy
              </div>
            </button>
          </div>
          <p className="text-xs text-amber-400/50 text-center mt-2">
            Path of Life shows your 3-pillar developmental arc. Signature reveals your core day-sign imprint.
          </p>
          </>
        )}

        {/* Sign Display */}
        <div className="max-w-5xl mx-auto">
          {birthSign && activeView === 'signature' && (
            <div className="max-w-3xl mx-auto">
              <MayanSignCard sign={birthSign} title="Your Galactic Signature" />
            </div>
          )}
          {completeProfile && activeView === 'pillars' && <MayanPathOfLife profile={completeProfile} />}
          {todaySign && activeView === 'today' && (
            <div className="max-w-3xl mx-auto">
              <MayanSignCard sign={todaySign} title="Today's Galactic Energy" isToday />
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
