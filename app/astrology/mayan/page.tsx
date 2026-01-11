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

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Calendar, Sparkles, Sun as SunIcon, Moon as MoonIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import {
  calculateMayanBirthSign,
  getTodaysMayanSign,
  calculateCompleteMayanProfile,
  type MayanBirthSign,
  type CompleteMayanProfile,
  type PathOfLife,
} from '@/lib/astrology/mayanAstrology';

export default function MayanAstrologyPage() {
  const [birthDate, setBirthDate] = useState('');
  const [birthSign, setBirthSign] = useState<MayanBirthSign | null>(null);
  const [todaySign, setTodaySign] = useState<MayanBirthSign | null>(null);
  const [showToday, setShowToday] = useState(false);
  const [completeProfile, setCompleteProfile] = useState<CompleteMayanProfile | null>(null);
  const [activeView, setActiveView] = useState<'signature' | 'pillars' | 'today'>('pillars');

  useEffect(() => {
    // Load saved birth date
    const saved = localStorage.getItem('birthDate');
    if (saved) {
      setBirthDate(saved);
      calculateSign(new Date(saved));
    }

    // Always show today's sign
    setTodaySign(getTodaysMayanSign());
  }, []);

  const calculateSign = (date: Date) => {
    const sign = calculateMayanBirthSign(date);
    setBirthSign(sign);
    const profile = calculateCompleteMayanProfile(date);
    setCompleteProfile(profile);
  };

  const handleDateChange = (dateString: string) => {
    setBirthDate(dateString);
    if (dateString) {
      localStorage.setItem('birthDate', dateString);
      calculateSign(new Date(dateString));
    }
  };

  const getElementColor = (element: string) => {
    const colors = {
      fire: 'from-orange-500 to-red-600',
      water: 'from-blue-500 to-indigo-600',
      earth: 'from-green-500 to-emerald-600',
      air: 'from-cyan-500 to-sky-600',
    };
    return colors[element as keyof typeof colors] || colors.fire;
  };

  const getElementBorder = (element: string) => {
    const borders = {
      fire: 'border-orange-500/30',
      water: 'border-blue-500/30',
      earth: 'border-green-500/30',
      air: 'border-cyan-500/30',
    };
    return borders[element as keyof typeof borders] || borders.fire;
  };

  const getToneStageColor = (stage: string) => {
    const colors = {
      initiation: 'text-amber-400',
      challenge: 'text-orange-400',
      empowerment: 'text-yellow-400',
      completion: 'text-amber-300',
    };
    return colors[stage as keyof typeof colors] || colors.initiation;
  };

  const renderSignCard = (sign: MayanBirthSign, title: string, isToday: boolean = false) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-gradient-to-br from-stone-900/80 via-amber-950/40 to-stone-900/80 backdrop-blur-xl border ${getElementBorder(sign.daySign.element)} rounded-2xl p-8 shadow-2xl`}
    >
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-amber-100 mb-2">{title}</h2>
        <p className="text-amber-500/60 text-sm uppercase tracking-wider">
          {sign.tzolkinNumber} / 260 Days
        </p>
      </div>

      {/* Galactic Signature */}
      <div className="text-center mb-8">
        <div className="text-8xl mb-4">{sign.daySign.glyph}</div>
        <h3 className="text-4xl font-bold text-amber-100 mb-2">
          {sign.galacticSignature}
        </h3>
        <p className="text-amber-400/80 text-lg">
          {sign.daySign.meaning}
        </p>
      </div>

      {/* Tone Card */}
      <div className="bg-black/40 border border-amber-900/30 rounded-xl p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="text-xl font-bold text-amber-100">Tone {sign.tone.number}</h4>
            <p className="text-amber-500/80">{sign.tone.name}</p>
          </div>
          <div className={`text-2xl ${getToneStageColor(sign.tone.stage)}`}>
            {sign.tone.stage === 'initiation' && '◉'}
            {sign.tone.stage === 'challenge' && '◈'}
            {sign.tone.stage === 'empowerment' && '◆'}
            {sign.tone.stage === 'completion' && '◐'}
          </div>
        </div>
        <p className="text-amber-300/70 italic mb-3">"{sign.tone.intention}"</p>
        <p className="text-amber-400/60 text-sm">{sign.tone.description}</p>
      </div>

      {/* Day Sign Details */}
      <div className="bg-gradient-to-br from-amber-950/30 to-stone-900/50 border border-amber-900/30 rounded-xl p-6 mb-6">
        <h4 className="text-xl font-bold text-amber-100 mb-4">
          {sign.daySign.archetype}
        </h4>

        <div className="grid grid-cols-3 gap-4 mb-4">
          <div>
            <p className="text-amber-600/60 text-xs uppercase mb-1">Power</p>
            <p className="text-amber-300 font-semibold">{sign.daySign.power}</p>
          </div>
          <div>
            <p className="text-amber-600/60 text-xs uppercase mb-1">Action</p>
            <p className="text-amber-300 font-semibold">{sign.daySign.action}</p>
          </div>
          <div>
            <p className="text-amber-600/60 text-xs uppercase mb-1">Essence</p>
            <p className="text-amber-300 font-semibold">{sign.daySign.essence}</p>
          </div>
        </div>

        <p className="text-amber-400/70 leading-relaxed mb-4">
          {sign.daySign.description}
        </p>

        <div className="flex items-center gap-2">
          <div className={`px-4 py-2 bg-gradient-to-r ${getElementColor(sign.daySign.element)} rounded-lg text-white text-sm font-semibold`}>
            {sign.daySign.element.toUpperCase()}
          </div>
          <div className="text-amber-600/60 text-sm">
            {sign.wavespell}
          </div>
        </div>
      </div>

      {/* Spiralogic Integration */}
      {!isToday && (
        <div className="bg-amber-950/20 border border-amber-800/30 rounded-xl p-6">
          <h4 className="text-lg font-bold text-amber-100 mb-2 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            Spiralogic Integration
          </h4>
          <p className="text-amber-400/70 text-sm">
            Your Mayan {sign.daySign.name} essence ({sign.daySign.element} element) flows through the
            Spiralogic {sign.daySign.element} pathway, weaving ancient wisdom with conscious evolution.
          </p>
        </div>
      )}
    </motion.div>
  );

  const renderPathOfLife = (profile: CompleteMayanProfile) => {
    const { pathOfLife, cardinalDirection, lifeCycleInsight, haab } = profile;

    const getDirectionColor = (dir: string) => {
      const colors: Record<string, string> = {
        east: 'from-red-500 to-orange-500',
        north: 'from-gray-100 to-gray-300',
        west: 'from-gray-800 to-black',
        south: 'from-yellow-400 to-amber-500',
      };
      return colors[dir] || colors.east;
    };

    const getPillarGradient = (stage: 'youth' | 'adulthood' | 'future') => {
      const gradients = {
        youth: 'from-purple-900/60 via-indigo-900/40 to-purple-900/60',
        adulthood: 'from-amber-900/60 via-orange-900/40 to-amber-900/60',
        future: 'from-teal-900/60 via-cyan-900/40 to-teal-900/60',
      };
      return gradients[stage];
    };

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        {/* Life Cycle Insight */}
        <div className="bg-gradient-to-br from-stone-900/80 via-amber-950/40 to-stone-900/80 backdrop-blur-xl border border-amber-900/30 rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-amber-100 mb-4 text-center">Your Life Cycle Reading</h2>
          <p className="text-amber-300/90 text-lg leading-relaxed text-center italic">
            "{lifeCycleInsight}"
          </p>
        </div>

        {/* Three Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Youth Pillar */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className={`bg-gradient-to-br ${getPillarGradient('youth')} backdrop-blur-xl border border-purple-500/30 rounded-2xl p-6`}
          >
            <div className="text-center mb-4">
              <span className="text-purple-400/60 text-xs uppercase tracking-wider">Past Influence</span>
              <h3 className="text-xl font-bold text-purple-100">Youth</h3>
              <p className="text-purple-300/60 text-sm">Birth to ~26 years</p>
            </div>
            <div className="text-center mb-4">
              <div className="text-6xl mb-2">{pathOfLife.youth.daySign.glyph}</div>
              <h4 className="text-2xl font-bold text-purple-100">{pathOfLife.youth.galacticSignature}</h4>
              <p className="text-purple-400/80">{pathOfLife.youth.daySign.archetype}</p>
            </div>
            <div className="bg-black/30 rounded-xl p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-purple-400/60">Power:</span>
                <span className="text-purple-200">{pathOfLife.youth.daySign.power}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-purple-400/60">Essence:</span>
                <span className="text-purple-200">{pathOfLife.youth.daySign.essence}</span>
              </div>
              <p className="text-purple-300/70 text-xs mt-3 italic">
                Early life patterns shaped by {pathOfLife.youth.daySign.meaning.toLowerCase()}
              </p>
            </div>
          </motion.div>

          {/* Adulthood Pillar (Main) */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className={`bg-gradient-to-br ${getPillarGradient('adulthood')} backdrop-blur-xl border border-amber-500/30 rounded-2xl p-6 ring-2 ring-amber-500/20`}
          >
            <div className="text-center mb-4">
              <span className="text-amber-400/60 text-xs uppercase tracking-wider">Core Identity</span>
              <h3 className="text-xl font-bold text-amber-100">Adulthood</h3>
              <p className="text-amber-300/60 text-sm">Your Primary Signature</p>
            </div>
            <div className="text-center mb-4">
              <div className="text-7xl mb-2">{pathOfLife.adulthood.daySign.glyph}</div>
              <h4 className="text-2xl font-bold text-amber-100">{pathOfLife.adulthood.galacticSignature}</h4>
              <p className="text-amber-400/80">{pathOfLife.adulthood.daySign.archetype}</p>
            </div>
            <div className="bg-black/30 rounded-xl p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-amber-400/60">Power:</span>
                <span className="text-amber-200">{pathOfLife.adulthood.daySign.power}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-amber-400/60">Action:</span>
                <span className="text-amber-200">{pathOfLife.adulthood.daySign.action}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-amber-400/60">Essence:</span>
                <span className="text-amber-200">{pathOfLife.adulthood.daySign.essence}</span>
              </div>
            </div>
          </motion.div>

          {/* Future Pillar */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className={`bg-gradient-to-br ${getPillarGradient('future')} backdrop-blur-xl border border-teal-500/30 rounded-2xl p-6`}
          >
            <div className="text-center mb-4">
              <span className="text-teal-400/60 text-xs uppercase tracking-wider">Destiny</span>
              <h3 className="text-xl font-bold text-teal-100">Future</h3>
              <p className="text-teal-300/60 text-sm">Fading in from ~52 years</p>
            </div>
            <div className="text-center mb-4">
              <div className="text-6xl mb-2">{pathOfLife.future.daySign.glyph}</div>
              <h4 className="text-2xl font-bold text-teal-100">{pathOfLife.future.galacticSignature}</h4>
              <p className="text-teal-400/80">{pathOfLife.future.daySign.archetype}</p>
            </div>
            <div className="bg-black/30 rounded-xl p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-teal-400/60">Power:</span>
                <span className="text-teal-200">{pathOfLife.future.daySign.power}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-teal-400/60">Essence:</span>
                <span className="text-teal-200">{pathOfLife.future.daySign.essence}</span>
              </div>
              <p className="text-teal-300/70 text-xs mt-3 italic">
                Your soul evolves toward {pathOfLife.future.daySign.meaning.toLowerCase()}
              </p>
            </div>
          </motion.div>
        </div>

        {/* Haab Solar Calendar & Cardinal Direction */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Haab Date */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-br from-stone-900/80 via-emerald-950/30 to-stone-900/80 backdrop-blur-xl border border-emerald-900/30 rounded-2xl p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <Calendar className="w-6 h-6 text-emerald-500" />
              <div>
                <h3 className="text-lg font-bold text-emerald-100">Haab Solar Calendar</h3>
                <p className="text-emerald-400/60 text-xs">365-day civil calendar</p>
              </div>
            </div>
            <div className="text-center py-4">
              <div className="text-4xl mb-2">{haab.month.glyph}</div>
              <h4 className="text-2xl font-bold text-emerald-100">{haab.fullDate}</h4>
              <p className="text-emerald-400/80">{haab.month.meaning}</p>
              {haab.isWayeb && (
                <div className="mt-3 bg-red-900/30 border border-red-500/30 rounded-lg px-4 py-2">
                  <p className="text-red-300 text-sm">Wayeb - The Nameless Days</p>
                  <p className="text-red-400/70 text-xs">A time of reflection and caution</p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Cardinal Direction */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-gradient-to-br from-stone-900/80 via-rose-950/30 to-stone-900/80 backdrop-blur-xl border border-rose-900/30 rounded-2xl p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-6 h-6 rounded-full bg-gradient-to-br ${getDirectionColor(cardinalDirection.direction)}`} />
              <div>
                <h3 className="text-lg font-bold text-rose-100">Cardinal Direction</h3>
                <p className="text-rose-400/60 text-xs">Your cosmic orientation</p>
              </div>
            </div>
            <div className="text-center py-4">
              <h4 className="text-3xl font-bold text-rose-100 uppercase tracking-wider">
                {cardinalDirection.direction}
              </h4>
              <div className={`inline-block px-4 py-1 rounded-full bg-gradient-to-r ${getDirectionColor(cardinalDirection.direction)} mt-2`}>
                <span className="text-white text-sm font-semibold">{cardinalDirection.color}</span>
              </div>
            </div>
            <div className="bg-black/30 rounded-xl p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-rose-400/60">Meaning:</span>
                <span className="text-rose-200">{cardinalDirection.meaning}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-rose-400/60">Activity:</span>
                <span className="text-rose-200">{cardinalDirection.activity}</span>
              </div>
              <p className="text-rose-300/70 text-xs mt-3">
                {cardinalDirection.description}
              </p>
            </div>
          </motion.div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-950 via-amber-950/20 to-black">
      {/* Ambient background */}
      <div className="fixed inset-0 opacity-10">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-500 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-orange-600 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back button */}
        <Link
          href="/astrology"
          className="inline-flex items-center gap-2 text-amber-500/60 hover:text-amber-400 transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Astrology
        </Link>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 text-amber-500 mb-4">
            <Calendar className="w-6 h-6" />
            <span className="text-sm uppercase tracking-wider font-light">Tzolk'in Sacred Calendar</span>
          </div>
          <h1 className="text-5xl font-bold text-amber-100 mb-4">
            Mayan Astrology
          </h1>
          <p className="text-amber-300/80 text-lg max-w-3xl mx-auto leading-relaxed">
            Discover your galactic signature through the sacred Tzolk'in and Haab calendars.
            The Path of Life reveals three pillars—Youth, Adulthood, and Future—mapping
            your soul's journey from past influences through present power to ultimate destiny.
          </p>
        </motion.div>

        {/* Date Input */}
        {!birthSign && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-md mx-auto mb-12"
          >
            <div className="bg-gradient-to-br from-stone-900/80 via-amber-950/40 to-stone-900/80 backdrop-blur-xl border border-amber-900/30 rounded-2xl p-8">
              <h3 className="text-xl font-bold text-amber-100 mb-4">
                Discover Your Galactic Signature
              </h3>
              <p className="text-amber-400/70 text-sm mb-6">
                Enter your birth date to reveal your Mayan solar seal and galactic tone
              </p>
              <input
                type="date"
                value={birthDate}
                onChange={(e) => handleDateChange(e.target.value)}
                className="w-full px-4 py-3 bg-black/40 border border-amber-800/50 rounded-lg text-amber-100 focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all"
                max={new Date().toISOString().split('T')[0]}
              />
            </div>
          </motion.div>
        )}

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
              {renderSignCard(birthSign, 'Your Galactic Signature')}
            </div>
          )}
          {completeProfile && activeView === 'pillars' && renderPathOfLife(completeProfile)}
          {todaySign && activeView === 'today' && (
            <div className="max-w-3xl mx-auto">
              {renderSignCard(todaySign, `Today's Galactic Energy`, true)}
            </div>
          )}
        </div>

        {/* Talk to MAIA CTA */}
        {birthSign && (
          <div className="mt-16 text-center">
            <div className="bg-gradient-to-br from-amber-950/40 to-stone-900/80 border border-amber-900/30 rounded-2xl p-8 max-w-2xl mx-auto">
              <h3 className="text-2xl font-bold text-amber-100 mb-4">
                Explore Your Mayan Signature with MAIA
              </h3>
              <p className="text-amber-400/70 mb-6">
                Have a conversation with MAIA about how your {birthSign.daySign.name} energy
                flows through your life and integrates with your Western astrology chart.
              </p>
              <Link
                href="/maia"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white px-8 py-4 rounded-full font-semibold shadow-lg shadow-amber-900/30 hover:shadow-amber-600/30 transition-all duration-300"
              >
                <Sparkles className="w-5 h-5" />
                Talk to MAIA
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
