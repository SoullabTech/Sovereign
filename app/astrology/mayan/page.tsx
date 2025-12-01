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
  type MayanBirthSign,
} from '@/lib/astrology/mayanAstrology';

export default function MayanAstrologyPage() {
  const [birthDate, setBirthDate] = useState('');
  const [birthSign, setBirthSign] = useState<MayanBirthSign | null>(null);
  const [todaySign, setTodaySign] = useState<MayanBirthSign | null>(null);
  const [showToday, setShowToday] = useState(false);

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
            The 260-day Tzolk'in cycle reveals your galactic signature—a sacred code woven from
            20 solar seals and 13 galactic tones, mapping your soul's journey through time.
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

        {/* Toggle between Birth and Today */}
        {birthSign && todaySign && (
          <div className="flex justify-center gap-4 mb-8">
            <button
              onClick={() => setShowToday(false)}
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                !showToday
                  ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-lg'
                  : 'bg-stone-900/60 text-amber-500/60 hover:text-amber-400 border border-amber-900/30'
              }`}
            >
              <div className="flex items-center gap-2">
                <SunIcon className="w-5 h-5" />
                Your Birth Sign
              </div>
            </button>
            <button
              onClick={() => setShowToday(true)}
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                showToday
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
        )}

        {/* Sign Display */}
        <div className="max-w-3xl mx-auto">
          {birthSign && !showToday && renderSignCard(birthSign, 'Your Galactic Signature')}
          {todaySign && showToday && renderSignCard(todaySign, `Today's Galactic Energy`, true)}
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
