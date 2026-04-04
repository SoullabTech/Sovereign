// @ts-nocheck
'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Calendar, User, Compass, Clock, ChevronDown, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ZodiacToggle, { type ZodiacSystem } from '@/components/astrology/ZodiacToggle';
import { apiUrl } from '@/lib/http/apiBase';
import {
  ChineseZodiacAnimal,
  ChineseElement,
  ElementHolisticProfile,
  getChineseZodiacAnimal,
  getChineseElement,
  getYinYang,
  getSexagenaryPosition,
  getElementHolisticProfile
} from '@/lib/astrology/chineseAstrology';
import DaYunTimeline from '@/components/astrology/DaYunTimeline';
import ChineseAstrologyDiscussion from '@/components/astrology/ChineseAstrologyDiscussion';
import type { DaYunProfile, Gender } from '@/lib/astrology/types/daYun';

type ViewMode = 'profile' | 'da-yun';

interface ChineseReadingData {
  zodiacAnimal: ChineseZodiacAnimal;
  element: ChineseElement;
  yinYang: 'yin' | 'yang';
  cycleYear: number;
  personalityProfile: string[];
  strengthsWeaknesses: {
    strengths: string[];
    weaknesses: string[];
  };
  spiralogicIntegration: {
    primaryElement: string;
    secondaryElements: string[];
    evolutionaryPath: string;
    consciousnessActivation: string;
  };
  lifeGuidance: {
    careerPaths: string[];
    relationships: string[];
    spiritualDevelopment: string[];
    healthWellness: string[];
  };
  compatibility: {
    mostCompatible: string[];
    challenging: string[];
    analysis: string;
  };
  holisticProfile: ElementHolisticProfile | null;
}

export default function ChineseAstrologyPage() {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<ViewMode>('profile');
  const [birthYear, setBirthYear] = useState<string>('');
  const [birthDate, setBirthDate] = useState<string>('');
  const [birthTime, setBirthTime] = useState<string>('');
  const [gender, setGender] = useState<Gender | ''>('');
  const [reading, setReading] = useState<ChineseReadingData | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [daYunProfile, setDaYunProfile] = useState<DaYunProfile | null>(null);
  const didAutoLoad = useRef(false);

  const toggleSection = (section: string) => {
    setExpandedSection(prev => prev === section ? null : section);
  };

  // Auto-load birth data from profile API, then localStorage fallback
  useEffect(() => {
    if (didAutoLoad.current) return;
    didAutoLoad.current = true;

    const loadBirthData = async () => {
      // 1. Try profile API (database — single source of truth)
      try {
        const storedUser = localStorage.getItem('beta_user');
        const memberId = storedUser ? JSON.parse(storedUser)?.id : null;

        if (memberId) {
          const profileRes = await fetch(apiUrl(`/api/members/profile?id=${encodeURIComponent(memberId)}`));
          if (profileRes.ok) {
            const profile = await profileRes.json();
            if (profile.birthData?.date) {
              const dateStr = typeof profile.birthData.date === 'string'
                ? profile.birthData.date.split('T')[0]
                : new Date(profile.birthData.date).toISOString().split('T')[0];

              setBirthDate(dateStr);

              if (profile.birthData.time) {
                const timeStr = profile.birthData.time.includes(':')
                  ? profile.birthData.time.substring(0, 5)
                  : profile.birthData.time;
                setBirthTime(timeStr);
              }

              // Also set birthYear for profile view
              const year = dateStr.split('-')[0];
              if (year) setBirthYear(year);

              // Load saved gender from localStorage (not in DB)
              const savedGender = localStorage.getItem('chineseAstrology_gender');
              if (savedGender === 'male' || savedGender === 'female') {
                setGender(savedGender);
              }

              return; // Got data from server
            }
          }
        }
      } catch (err) {
        console.error('[Chinese Astrology] Error fetching profile:', err);
      }

      // 2. Fallback: localStorage birthDate (legacy/journey flow)
      const saved = localStorage.getItem('birthDate');
      if (saved) {
        setBirthDate(saved);
        const year = saved.split('-')[0];
        if (year) setBirthYear(year);
      }

      const savedTime = localStorage.getItem('birthTime');
      if (savedTime) setBirthTime(savedTime);

      const savedGender = localStorage.getItem('chineseAstrology_gender');
      if (savedGender === 'male' || savedGender === 'female') {
        setGender(savedGender);
      }
    };

    loadBirthData();
  }, []);

  // Auto-calculate when birthDate is set from localStorage
  useEffect(() => {
    if (birthDate && didAutoLoad.current && !reading) {
      generateReading();
    }
  }, [birthDate]);

  // System selector: each system has its own authentic page
  const handleSystemChange = useCallback((mode: ZodiacSystem) => {
    if (mode === 'tropical') { router.push('/astrology'); }
    if (mode === 'sidereal') { router.push('/astrology/vedic'); }
    if (mode === 'mayan') { router.push('/astrology/mayan'); }
  }, [router]);

  const generateReading = async () => {
    if (!birthDate) return;

    setIsCalculating(true);

    // Calculate actual Chinese astrology data from the birth date
    setTimeout(() => {
      const date = new Date(birthDate);
      const year = date.getFullYear();
      const zodiacAnimal = getChineseZodiacAnimal(year);
      const element = getChineseElement(year);
      const yinYang = getYinYang(year);
      const cyclePosition = getSexagenaryPosition(year);

      // Map Chinese element to Spiralogic element
      const spiralogicMap: Record<string, { primary: string; secondary: string[] }> = {
        wood: { primary: 'Air', secondary: ['Earth', 'Water'] },
        fire: { primary: 'Fire', secondary: ['Air', 'Earth'] },
        earth: { primary: 'Earth', secondary: ['Fire', 'Water'] },
        metal: { primary: 'Aether', secondary: ['Earth', 'Air'] },
        water: { primary: 'Water', secondary: ['Earth', 'Aether'] }
      };

      const spiralogicMapping = spiralogicMap[element.name] || { primary: 'Earth', secondary: ['Fire', 'Water'] };

      // Get the holistic profile for this element
      const holisticProfile = getElementHolisticProfile(element.name);

      const readingData: ChineseReadingData = {
        zodiacAnimal,
        element,
        yinYang,
        cycleYear: cyclePosition,
        holisticProfile,
        personalityProfile: [
          `${zodiacAnimal.archetype} with ${element.name} energy`,
          `${element.name.charAt(0).toUpperCase() + element.name.slice(1)} element brings ${element.characteristics.slice(0, 2).join(' and ')}`,
          `${yinYang.charAt(0).toUpperCase() + yinYang.slice(1)} energy provides ${yinYang === 'yang' ? 'active, expressive' : 'receptive, introspective'} nature`
        ],
        strengthsWeaknesses: {
          strengths: zodiacAnimal.strengths,
          weaknesses: zodiacAnimal.challenges
        },
        spiralogicIntegration: {
          primaryElement: spiralogicMapping.primary,
          secondaryElements: spiralogicMapping.secondary,
          evolutionaryPath: `${zodiacAnimal.archetype} walking the ${element.name} path toward ${spiralogicMapping.primary} consciousness`,
          consciousnessActivation: `Your ${element.name} ${zodiacAnimal.name} energy activates through ${element.characteristics[0]} and ${zodiacAnimal.characteristics[0]}`
        },
        lifeGuidance: {
          careerPaths: [
            `Roles that honor ${zodiacAnimal.archetype.toLowerCase()} qualities`,
            `Fields aligned with ${element.name} element - ${element.characteristics.slice(0, 2).join(', ')}`,
            `Environments that support ${zodiacAnimal.characteristics[0]} expression`
          ],
          relationships: [
            `Naturally harmonious with ${zodiacAnimal.compatibility.slice(0, 2).join(' and ')}`,
            `Values ${zodiacAnimal.characteristics[1]} and ${zodiacAnimal.characteristics[2]} in partnerships`,
            `${yinYang === 'yang' ? 'Takes initiative' : 'Offers receptivity'} in relationships`
          ],
          spiritualDevelopment: [
            `Meditate with ${element.name} element imagery`,
            `Honor the ${zodiacAnimal.archetype.toLowerCase()} within`,
            `Balance ${yinYang} energy through ${yinYang === 'yang' ? 'stillness practices' : 'active movement'}`
          ],
          healthWellness: [
            `${element.name.charAt(0).toUpperCase() + element.name.slice(1)} constitution benefits from ${element.direction} direction and ${element.season} renewal`,
            `${zodiacAnimal.name} energy supports ${zodiacAnimal.strengths[0].toLowerCase()}`,
            `Lucky colors for vitality: ${zodiacAnimal.luckyColors.slice(0, 2).join(', ')}`
          ]
        },
        compatibility: {
          mostCompatible: zodiacAnimal.compatibility,
          challenging: zodiacAnimal.incompatible,
          analysis: `${element.name.charAt(0).toUpperCase() + element.name.slice(1)} ${zodiacAnimal.name}s are most harmonious with ${zodiacAnimal.compatibility.join(', ')}. Growth opportunities arise with ${zodiacAnimal.incompatible.join(', ')}.`
        }
      };

      setReading(readingData);
      setIsCalculating(false);
    }, 1000);
  };

  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 100 }, (_, i) => currentYear - i);

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-900 via-orange-800 to-yellow-900">
      {/* Navigation */}
      <div className="fixed top-4 left-4 z-50 flex gap-2">
        <Link
          href="/maia"
          className="flex items-center gap-2 px-3 py-2 rounded-lg backdrop-blur-sm bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">MAIA</span>
        </Link>
        <Link
          href="/astrology"
          className="flex items-center gap-2 px-3 py-2 rounded-lg backdrop-blur-sm bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-colors"
        >
          <span className="text-sm font-medium">Blueprint</span>
        </Link>
      </div>

      {/* System Selector */}
      <div className="fixed top-4 right-4 z-50">
        <div className="backdrop-blur-sm bg-black/20 rounded-xl p-2">
          <ZodiacToggle value="chinese" onChange={handleSystemChange} compact />
        </div>
      </div>

      {/* Floating Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-red-500/20 to-orange-500/20 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-gradient-to-br from-yellow-500/20 to-red-500/20 rounded-full blur-lg animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 left-1/3 w-40 h-40 bg-gradient-to-br from-orange-500/20 to-yellow-500/20 rounded-full blur-2xl animate-pulse delay-2000"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-red-300 via-orange-200 to-yellow-300 bg-clip-text text-transparent mb-4">
            Chinese Astrology Portal
          </h1>
          <p className="text-lg md:text-xl text-orange-200 max-w-3xl mx-auto leading-relaxed">
            Discover the ancient wisdom of Chinese zodiac animals, five elements, and the cosmic cycles
            that shape your destiny through thousands of years of celestial observation.
          </p>
        </div>

        {/* View Mode Toggle */}
        <div className="flex justify-center gap-2 mb-8">
          <button
            onClick={() => setViewMode('profile')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
              viewMode === 'profile'
                ? 'bg-orange-500/30 text-orange-200 border border-orange-500/50'
                : 'bg-black/30 text-orange-200/60 hover:bg-black/40 border border-transparent'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Zodiac Profile</span>
          </button>
          <button
            onClick={() => setViewMode('da-yun')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
              viewMode === 'da-yun'
                ? 'bg-orange-500/30 text-orange-200 border border-orange-500/50'
                : 'bg-black/30 text-orange-200/60 hover:bg-black/40 border border-transparent'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>Da Yun (10-Year Cycles)</span>
          </button>
        </div>

        {/* Input Section - Different based on view mode */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="bg-black/30 backdrop-blur-sm border border-orange-500/30 rounded-2xl p-8">
            {viewMode === 'profile' ? (
              <>
                <h2 className="text-2xl font-bold text-orange-200 mb-2 text-center">
                  Enter Your Birth Data
                </h2>
                <p className="text-orange-200/60 text-sm text-center mb-6">
                  Full date required for Four Pillars. Time optional but improves accuracy.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                  {/* Birth Date */}
                  <div>
                    <label className="flex items-center gap-2 text-orange-200/80 text-sm mb-2">
                      <Calendar className="w-4 h-4" />
                      Birth Date
                    </label>
                    <input
                      type="date"
                      value={birthDate}
                      onChange={(e) => {
                        setBirthDate(e.target.value);
                        if (e.target.value) {
                          setBirthYear(e.target.value.split('-')[0]);
                        }
                      }}
                      className="w-full bg-black/50 border border-orange-500/50 rounded-xl px-4 py-3 text-orange-200 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-400/30"
                    />
                  </div>

                  {/* Birth Time (Optional) */}
                  <div>
                    <label className="flex items-center gap-2 text-orange-200/80 text-sm mb-2">
                      <Clock className="w-4 h-4" />
                      Birth Time <span className="text-orange-200/40">(optional)</span>
                    </label>
                    <input
                      type="time"
                      value={birthTime}
                      onChange={(e) => setBirthTime(e.target.value)}
                      className="w-full bg-black/50 border border-orange-500/50 rounded-xl px-4 py-3 text-orange-200 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-400/30"
                    />
                  </div>
                </div>

                <button
                  onClick={generateReading}
                  disabled={!birthDate || isCalculating}
                  className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 disabled:from-gray-600 disabled:to-gray-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 disabled:cursor-not-allowed"
                >
                  {isCalculating ? 'Calculating...' : 'Reveal Destiny'}
                </button>
                <p className="text-xs text-orange-400/50 text-center mt-3">
                  Reveals your animal sign, element, and five-layer profile (physical, emotional, mental, spiritual, ancestral).
                </p>
              </>
            ) : (
              <>
                <h2 className="text-2xl font-bold text-orange-200 mb-2 text-center">
                  Four Pillars & Da Yun
                </h2>
                <p className="text-orange-200/60 text-sm text-center mb-6">
                  See your complete Ba Zi chart and 10-year luck cycles
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                  {/* Birth Date */}
                  <div>
                    <label className="flex items-center gap-2 text-orange-200/80 text-sm mb-2">
                      <Calendar className="w-4 h-4" />
                      Birth Date
                    </label>
                    <input
                      type="date"
                      value={birthDate}
                      onChange={(e) => {
                        setBirthDate(e.target.value);
                        // Also update birthYear for profile view sync
                        if (e.target.value) {
                          setBirthYear(e.target.value.split('-')[0]);
                        }
                      }}
                      className="w-full bg-black/50 border border-orange-500/50 rounded-xl px-4 py-3 text-orange-200 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-400/30"
                    />
                  </div>

                  {/* Birth Time (Optional) */}
                  <div>
                    <label className="flex items-center gap-2 text-orange-200/80 text-sm mb-2">
                      <Clock className="w-4 h-4" />
                      Birth Time <span className="text-orange-200/40">(optional)</span>
                    </label>
                    <input
                      type="time"
                      value={birthTime}
                      onChange={(e) => setBirthTime(e.target.value)}
                      className="w-full bg-black/50 border border-orange-500/50 rounded-xl px-4 py-3 text-orange-200 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-400/30"
                    />
                  </div>

                  {/* Gender */}
                  <div className="sm:col-span-2">
                    <label className="flex items-center gap-2 text-orange-200/80 text-sm mb-2">
                      <User className="w-4 h-4" />
                      Gender <span className="text-orange-200/40">(affects cycle direction)</span>
                    </label>
                    <div className="flex gap-4">
                      <button
                        onClick={() => { setGender('male'); localStorage.setItem('chineseAstrology_gender', 'male'); }}
                        className={`flex-1 py-3 px-4 rounded-xl border transition-all ${
                          gender === 'male'
                            ? 'bg-orange-500/30 border-orange-500/50 text-orange-200'
                            : 'bg-black/30 border-orange-500/30 text-orange-200/60 hover:border-orange-500/50'
                        }`}
                      >
                        Male
                      </button>
                      <button
                        onClick={() => { setGender('female'); localStorage.setItem('chineseAstrology_gender', 'female'); }}
                        className={`flex-1 py-3 px-4 rounded-xl border transition-all ${
                          gender === 'female'
                            ? 'bg-orange-500/30 border-orange-500/50 text-orange-200'
                            : 'bg-black/30 border-orange-500/30 text-orange-200/60 hover:border-orange-500/50'
                        }`}
                      >
                        Female
                      </button>
                    </div>
                  </div>
                </div>

                {/* Helper text */}
                <p className="text-orange-200/40 text-xs text-center">
                  Da Yun (大運) reveals the major 10-year periods that shape your life journey.
                  Birth time is optional but improves hour pillar accuracy.
                </p>
              </>
            )}
          </div>
        </div>

        {/* Da Yun Timeline View */}
        {viewMode === 'da-yun' && (
          <div className="max-w-6xl mx-auto space-y-8">
            <DaYunTimeline
              birthDate={birthDate}
              birthTime={birthTime || undefined}
              gender={gender || undefined}
              onProfileLoaded={setDaYunProfile}
            />
            {daYunProfile?.currentPeriod && (
              <ChineseAstrologyDiscussion
                mode="da-yun"
                daYunContext={{
                  currentPeriod: {
                    element: daYunProfile.currentPeriod.element,
                    stem: daYunProfile.currentPeriod.heavenlyStem,
                    branch: daYunProfile.currentPeriod.earthlyBranch,
                    ageRange: `${daYunProfile.currentPeriod.ageRange.start}-${daYunProfile.currentPeriod.ageRange.end}`,
                    lifeTheme: daYunProfile.currentPeriod.lifeTheme,
                    description: daYunProfile.currentPeriod.description,
                    opportunities: daYunProfile.currentPeriod.opportunities,
                    challenges: daYunProfile.currentPeriod.challenges,
                    healthGuidance: daYunProfile.currentPeriod.healthGuidance,
                    natalHarmony: daYunProfile.currentPeriod.natalHarmony,
                    spiritFocus: daYunProfile.currentPeriod.spiritFocus,
                  },
                  previousPeriod: daYunProfile.previousPeriod ? {
                    element: daYunProfile.previousPeriod.element,
                    lifeTheme: daYunProfile.previousPeriod.lifeTheme,
                    ageRange: `${daYunProfile.previousPeriod.ageRange.start}-${daYunProfile.previousPeriod.ageRange.end}`,
                  } : undefined,
                  nextPeriod: daYunProfile.nextPeriod ? {
                    element: daYunProfile.nextPeriod.element,
                    lifeTheme: daYunProfile.nextPeriod.lifeTheme,
                    ageRange: `${daYunProfile.nextPeriod.ageRange.start}-${daYunProfile.nextPeriod.ageRange.end}`,
                  } : undefined,
                  currentAge: daYunProfile.currentAge,
                  periodProgress: daYunProfile.periodProgress,
                }}
              />
            )}
          </div>
        )}

        {/* Profile Reading Results */}
        {viewMode === 'profile' && reading && (
          <div className="max-w-6xl mx-auto space-y-8">
            {/* Core Identity — clickable cards */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Animal Card */}
              <button
                onClick={() => toggleSection('animal')}
                className="bg-black/30 backdrop-blur-sm border border-red-500/30 rounded-2xl p-8 text-left transition-all hover:border-red-500/60 hover:bg-black/40"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="text-5xl">{reading.zodiacAnimal.symbol}</div>
                  <div className="flex items-center gap-2 text-red-300/60">
                    <Sparkles className="w-4 h-4" />
                    <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${expandedSection === 'animal' ? 'rotate-180' : ''}`} />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-orange-200 mb-1">{reading.zodiacAnimal.name}</h3>
                <p className="text-orange-200/60 text-sm">{reading.zodiacAnimal.archetype}</p>
                <p className="text-orange-300 mt-2 line-clamp-2">{reading.zodiacAnimal.description}</p>
              </button>

              {/* Element Card */}
              <button
                onClick={() => toggleSection('element')}
                className="bg-black/30 backdrop-blur-sm border border-orange-500/30 rounded-2xl p-8 text-left transition-all hover:border-orange-500/60 hover:bg-black/40"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-xl font-bold text-white">
                    {reading.element.symbol}
                  </div>
                  <div className="flex items-center gap-2 text-orange-300/60">
                    <Sparkles className="w-4 h-4" />
                    <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${expandedSection === 'element' ? 'rotate-180' : ''}`} />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-orange-200 mb-1">{reading.element.name} Element</h3>
                <p className="text-yellow-300 text-sm">{reading.yinYang.toUpperCase()} Energy</p>
                <p className="text-orange-300 mt-2 line-clamp-2">{reading.element.description}</p>
              </button>
            </div>

            {/* Expanded Animal Wisdom */}
            <AnimatePresence>
              {expandedSection === 'animal' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="bg-black/30 backdrop-blur-sm border border-red-500/20 rounded-2xl p-8 space-y-6">
                    <h3 className="text-xl font-bold text-red-300">Deeper Wisdom: {reading.zodiacAnimal.name}</h3>

                    <div className="space-y-4">
                      {reading.personalityProfile.map((trait, i) => (
                        <div key={i} className="flex items-start gap-3">
                          <span className="text-orange-400 mt-1">*</span>
                          <p className="text-orange-200">{trait}</p>
                        </div>
                      ))}
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold text-green-300 mb-3">Strengths</h4>
                        <ul className="space-y-2">
                          {reading.strengthsWeaknesses.strengths.map((s, i) => (
                            <li key={i} className="text-green-200 flex items-center gap-2">
                              <span className="text-green-400">+</span> {s}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold text-red-300 mb-3">Growth Areas</h4>
                        <ul className="space-y-2">
                          {reading.strengthsWeaknesses.weaknesses.map((w, i) => (
                            <li key={i} className="text-red-200 flex items-center gap-2">
                              <span className="text-red-400">~</span> {w}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Compatibility */}
                    <div className="grid md:grid-cols-2 gap-6 pt-4 border-t border-red-500/20">
                      <div>
                        <h4 className="font-semibold text-green-300 mb-3">Most Compatible</h4>
                        <div className="flex flex-wrap gap-2">
                          {reading.compatibility.mostCompatible.map((sign, i) => (
                            <span key={i} className="px-3 py-1 bg-green-900/30 text-green-200 text-sm rounded-full border border-green-500/30">{sign}</span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h4 className="font-semibold text-amber-300 mb-3">Challenging Pairings</h4>
                        <div className="flex flex-wrap gap-2">
                          {reading.compatibility.challenging.map((sign, i) => (
                            <span key={i} className="px-3 py-1 bg-amber-900/30 text-amber-200 text-sm rounded-full border border-amber-500/30">{sign}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Expanded Element Wisdom */}
            <AnimatePresence>
              {expandedSection === 'element' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="bg-black/30 backdrop-blur-sm border border-orange-500/20 rounded-2xl p-8 space-y-6">
                    <h3 className="text-xl font-bold text-orange-300">Deeper Wisdom: {reading.element.name} Element</h3>

                    {/* Spiralogic Integration */}
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold text-purple-300 mb-2">Elemental Pathway</h4>
                        <p className="text-purple-100 text-sm mb-1"><strong>Primary:</strong> {reading.spiralogicIntegration.primaryElement}</p>
                        <p className="text-purple-100 text-sm"><strong>Secondary:</strong> {reading.spiralogicIntegration.secondaryElements.join(', ')}</p>
                        <p className="text-purple-200 mt-3">{reading.spiralogicIntegration.evolutionaryPath}</p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-purple-300 mb-2">Consciousness Activation</h4>
                        <p className="text-purple-100">{reading.spiralogicIntegration.consciousnessActivation}</p>
                      </div>
                    </div>

                    {/* Life Guidance */}
                    <div className="grid md:grid-cols-2 gap-6 pt-4 border-t border-orange-500/20">
                      <div>
                        <h4 className="font-semibold text-blue-300 mb-3">Career & Purpose</h4>
                        <ul className="space-y-2">
                          {reading.lifeGuidance.careerPaths.map((p, i) => (
                            <li key={i} className="text-blue-200 text-sm flex items-start gap-2">
                              <span className="text-blue-400 mt-0.5">*</span> {p}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold text-pink-300 mb-3">Relationships</h4>
                        <ul className="space-y-2">
                          {reading.lifeGuidance.relationships.map((r, i) => (
                            <li key={i} className="text-pink-200 text-sm flex items-start gap-2">
                              <span className="text-pink-400 mt-0.5">*</span> {r}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold text-yellow-300 mb-3">Spiritual Development</h4>
                        <ul className="space-y-2">
                          {reading.lifeGuidance.spiritualDevelopment.map((s, i) => (
                            <li key={i} className="text-yellow-200 text-sm flex items-start gap-2">
                              <span className="text-yellow-400 mt-0.5">*</span> {s}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold text-green-300 mb-3">Health & Wellness</h4>
                        <ul className="space-y-2">
                          {reading.lifeGuidance.healthWellness.map((h, i) => (
                            <li key={i} className="text-green-200 text-sm flex items-start gap-2">
                              <span className="text-green-400 mt-0.5">*</span> {h}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Five-Layer Holistic Wisdom (nested inside Element) */}
                    {reading.holisticProfile && (
                      <div className="pt-4 border-t border-orange-500/20 space-y-3">
                        <h4 className="font-semibold text-orange-200">Five-Layer Holistic Profile</h4>
                        <p className="text-orange-200/50 text-xs">Tap a domain for deeper insight</p>

                        <div className="grid grid-cols-5 gap-2">
                          {[
                            { key: 'physical', label: 'Body', emoji: '+' },
                            { key: 'emotional', label: 'Heart', emoji: '~' },
                            { key: 'mental', label: 'Mind', emoji: '*' },
                            { key: 'spiritual', label: 'Spirit', emoji: '*' },
                            { key: 'ancestral', label: 'Roots', emoji: '*' },
                          ].map(({ key, label }) => (
                            <button
                              key={key}
                              onClick={(e) => { e.stopPropagation(); toggleSection(`holistic-${key}`); }}
                              className={`py-2 px-1 rounded-lg text-xs font-medium text-center transition-all ${
                                expandedSection === `holistic-${key}`
                                  ? 'bg-orange-500/30 text-orange-200 border border-orange-500/50'
                                  : 'bg-black/30 text-orange-200/60 hover:bg-black/40 border border-orange-500/20'
                              }`}
                            >
                              {label}
                            </button>
                          ))}
                        </div>

                        <AnimatePresence>
                          {expandedSection === 'holistic-physical' && reading.holisticProfile && (
                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                              <div className="bg-emerald-900/10 border border-emerald-500/20 rounded-xl p-5 space-y-4 mt-2">
                                <div className="grid md:grid-cols-2 gap-4 text-sm">
                                  <div className="space-y-1 text-emerald-100">
                                    <p><strong className="text-emerald-400">Yin Organ:</strong> {reading.holisticProfile.physical.yinOrgan}</p>
                                    <p><strong className="text-emerald-400">Yang Organ:</strong> {reading.holisticProfile.physical.yangOrgan}</p>
                                    <p><strong className="text-emerald-400">Body Tissue:</strong> {reading.holisticProfile.physical.bodyTissue}</p>
                                    <p><strong className="text-emerald-400">Sensory:</strong> {reading.holisticProfile.physical.sensoryOrgan}</p>
                                  </div>
                                  <div>
                                    <p className="text-emerald-300 font-semibold mb-2">Health Tendencies</p>
                                    {reading.holisticProfile.physical.healthTendencies.map((t, i) => (
                                      <p key={i} className="text-emerald-100 text-sm">! {t}</p>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          )}
                          {expandedSection === 'holistic-emotional' && reading.holisticProfile && (
                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                              <div className="bg-rose-900/10 border border-rose-500/20 rounded-xl p-5 mt-2">
                                <div className="grid grid-cols-3 gap-3 text-center text-sm">
                                  <div><p className="text-rose-300 text-xs">Primary</p><p className="text-rose-100">{reading.holisticProfile.emotional.primaryEmotion}</p></div>
                                  <div><p className="text-rose-300 text-xs">Shadow</p><p className="text-rose-100">{reading.holisticProfile.emotional.shadowEmotion}</p></div>
                                  <div><p className="text-rose-300 text-xs">Balanced</p><p className="text-rose-100">{reading.holisticProfile.emotional.balancedExpression}</p></div>
                                </div>
                              </div>
                            </motion.div>
                          )}
                          {expandedSection === 'holistic-mental' && reading.holisticProfile && (
                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                              <div className="bg-cyan-900/10 border border-cyan-500/20 rounded-xl p-5 mt-2 text-sm">
                                <p className="text-cyan-100">{reading.holisticProfile.mental.thinkingStyle}</p>
                                <p className="text-cyan-200/70 mt-2"><strong>Learning:</strong> {reading.holisticProfile.mental.learningStyle}</p>
                              </div>
                            </motion.div>
                          )}
                          {expandedSection === 'holistic-spiritual' && reading.holisticProfile && (
                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                              <div className="bg-violet-900/10 border border-violet-500/20 rounded-xl p-5 mt-2 text-sm space-y-2">
                                <p className="text-violet-100"><strong className="text-violet-300">Soul Lesson:</strong> {reading.holisticProfile.spiritual.soulLesson}</p>
                                <p className="text-violet-100"><strong className="text-violet-300">Gift:</strong> {reading.holisticProfile.spiritual.spiritualGift}</p>
                                <p className="text-violet-100"><strong className="text-violet-300">Karmic:</strong> {reading.holisticProfile.spiritual.karmicPattern}</p>
                              </div>
                            </motion.div>
                          )}
                          {expandedSection === 'holistic-ancestral' && reading.holisticProfile && (
                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                              <div className="bg-amber-900/10 border border-amber-500/20 rounded-xl p-5 mt-2 text-sm space-y-2">
                                <p className="text-amber-100"><strong className="text-amber-300">Lineage:</strong> {reading.holisticProfile.ancestral.lineageTheme}</p>
                                <p className="text-amber-100"><strong className="text-amber-300">Healing:</strong> {reading.holisticProfile.ancestral.ancestralHealing}</p>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Five holistic domains are nested inside Element Wisdom card above */}
            {false && reading.holisticProfile && (
              <div className="space-y-3">
                <h2 className="text-2xl font-bold text-orange-300 mb-4">Five-Layer Wisdom</h2>
                <p className="text-orange-200/60 text-sm mb-6">Tap each domain to explore the {reading.element.name} element's deeper teachings</p>

                {[
                  { key: 'physical', label: 'Physical Body & Health', color: 'emerald', icon: '+', summary: `${reading.holisticProfile.physical.yinOrgan} / ${reading.holisticProfile.physical.yangOrgan}` },
                  { key: 'emotional', label: 'Emotional Patterns', color: 'rose', icon: '~', summary: reading.holisticProfile.emotional.primaryEmotion },
                  { key: 'mental', label: 'Mental Qualities', color: 'cyan', icon: '*', summary: reading.holisticProfile.mental.thinkingStyle },
                  { key: 'spiritual', label: 'Spiritual Themes', color: 'violet', icon: '*', summary: reading.holisticProfile.spiritual.soulLesson },
                  { key: 'ancestral', label: 'Ancestral Patterns', color: 'amber', icon: '*', summary: reading.holisticProfile.ancestral.lineageTheme },
                ].map(({ key, label, color, summary }) => (
                  <div key={key}>
                    <button
                      onClick={() => toggleSection(key)}
                      className={`w-full bg-black/30 backdrop-blur-sm border border-${color}-500/30 rounded-2xl p-6 text-left transition-all hover:border-${color}-500/60 hover:bg-black/40`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className={`text-lg font-bold text-${color}-300`}>{label}</h3>
                          <p className={`text-${color}-200/60 text-sm mt-1`}>{summary}</p>
                        </div>
                        <div className={`flex items-center gap-2 text-${color}-300/60`}>
                          <Sparkles className="w-4 h-4" />
                          <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${expandedSection === key ? 'rotate-180' : ''}`} />
                        </div>
                      </div>
                    </button>

                    <AnimatePresence>
                      {expandedSection === key && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                          className="overflow-hidden"
                        >
                          <div className={`bg-black/30 backdrop-blur-sm border border-${color}-500/20 rounded-2xl p-8 mt-2`}>
                            {key === 'physical' && (
                              <div className="space-y-6">
                                <div className="grid md:grid-cols-2 gap-6">
                                  <div className="space-y-2 text-emerald-100">
                                    <h4 className="font-semibold text-emerald-200 mb-3">Organ Systems</h4>
                                    <p><span className="text-emerald-400 font-semibold">Yin Organ:</span> {reading.holisticProfile!.physical.yinOrgan}</p>
                                    <p><span className="text-emerald-400 font-semibold">Yang Organ:</span> {reading.holisticProfile!.physical.yangOrgan}</p>
                                    <p><span className="text-emerald-400 font-semibold">Body Tissue:</span> {reading.holisticProfile!.physical.bodyTissue}</p>
                                    <p><span className="text-emerald-400 font-semibold">Sensory Organ:</span> {reading.holisticProfile!.physical.sensoryOrgan}</p>
                                    <p><span className="text-emerald-400 font-semibold">Body Fluid:</span> {reading.holisticProfile!.physical.bodyFluid}</p>
                                  </div>
                                  <div>
                                    <h4 className="font-semibold text-emerald-200 mb-3">Health Tendencies</h4>
                                    <ul className="space-y-2">
                                      {reading.holisticProfile!.physical.healthTendencies.map((t, i) => (
                                        <li key={i} className="text-emerald-100 flex items-start gap-2"><span className="text-amber-400">!</span> {t}</li>
                                      ))}
                                    </ul>
                                  </div>
                                </div>
                                <div>
                                  <h4 className="font-semibold text-emerald-200 mb-3">Support Practices</h4>
                                  <ul className="grid md:grid-cols-2 gap-2">
                                    {reading.holisticProfile!.physical.supportPractices.map((p, i) => (
                                      <li key={i} className="text-emerald-100 flex items-start gap-2"><span className="text-emerald-400">+</span> {p}</li>
                                    ))}
                                  </ul>
                                </div>
                              </div>
                            )}
                            {key === 'emotional' && (
                              <div className="space-y-6">
                                <div className="grid grid-cols-3 gap-4">
                                  <div className="bg-rose-900/20 rounded-xl p-4 text-center">
                                    <p className="text-rose-300 text-xs font-semibold mb-1">Primary</p>
                                    <p className="text-rose-100">{reading.holisticProfile!.emotional.primaryEmotion}</p>
                                  </div>
                                  <div className="bg-rose-900/20 rounded-xl p-4 text-center">
                                    <p className="text-rose-300 text-xs font-semibold mb-1">Shadow</p>
                                    <p className="text-rose-100">{reading.holisticProfile!.emotional.shadowEmotion}</p>
                                  </div>
                                  <div className="bg-rose-900/20 rounded-xl p-4 text-center">
                                    <p className="text-rose-300 text-xs font-semibold mb-1">Balanced</p>
                                    <p className="text-rose-100">{reading.holisticProfile!.emotional.balancedExpression}</p>
                                  </div>
                                </div>
                                <div className="grid md:grid-cols-2 gap-6">
                                  <div>
                                    <h4 className="font-semibold text-rose-200 mb-3">Imbalance Signals</h4>
                                    <ul className="space-y-2">
                                      {reading.holisticProfile!.emotional.imbalanceSignals.map((s, i) => (
                                        <li key={i} className="text-rose-100 flex items-start gap-2"><span className="text-amber-400">~</span> {s}</li>
                                      ))}
                                    </ul>
                                  </div>
                                  <div>
                                    <h4 className="font-semibold text-rose-200 mb-3">Healing Practices</h4>
                                    <ul className="space-y-2">
                                      {reading.holisticProfile!.emotional.healingPractices.map((p, i) => (
                                        <li key={i} className="text-rose-100 flex items-start gap-2"><span className="text-rose-400">+</span> {p}</li>
                                      ))}
                                    </ul>
                                  </div>
                                </div>
                              </div>
                            )}
                            {key === 'mental' && (
                              <div className="space-y-6">
                                <div className="bg-cyan-900/20 rounded-xl p-5">
                                  <p className="text-cyan-100 text-lg">{reading.holisticProfile!.mental.thinkingStyle}</p>
                                  <p className="text-cyan-200/70 mt-2 text-sm"><strong>Learning Style:</strong> {reading.holisticProfile!.mental.learningStyle}</p>
                                </div>
                                <div className="grid md:grid-cols-2 gap-6">
                                  <div>
                                    <h4 className="font-semibold text-cyan-200 mb-3">Cognitive Strengths</h4>
                                    <ul className="space-y-2">
                                      {reading.holisticProfile!.mental.cognitiveStrengths.map((s, i) => (
                                        <li key={i} className="text-cyan-100 flex items-start gap-2"><span className="text-cyan-400">*</span> {s}</li>
                                      ))}
                                    </ul>
                                  </div>
                                  <div>
                                    <h4 className="font-semibold text-cyan-200 mb-3">Mental Challenges</h4>
                                    <ul className="space-y-2">
                                      {reading.holisticProfile!.mental.mentalChallenges.map((c, i) => (
                                        <li key={i} className="text-cyan-100 flex items-start gap-2"><span className="text-amber-400">~</span> {c}</li>
                                      ))}
                                    </ul>
                                  </div>
                                </div>
                              </div>
                            )}
                            {key === 'spiritual' && (
                              <div className="space-y-6">
                                <div className="grid md:grid-cols-2 gap-4">
                                  {[
                                    { label: 'Soul Lesson', value: reading.holisticProfile!.spiritual.soulLesson },
                                    { label: 'Spiritual Gift', value: reading.holisticProfile!.spiritual.spiritualGift },
                                    { label: 'Karmic Pattern', value: reading.holisticProfile!.spiritual.karmicPattern },
                                    { label: 'Evolutionary Path', value: reading.holisticProfile!.spiritual.evolutionaryPath },
                                  ].map((item, i) => (
                                    <div key={i} className="bg-violet-900/20 rounded-xl p-4">
                                      <p className="text-violet-300 text-xs font-semibold mb-1">{item.label}</p>
                                      <p className="text-violet-100">{item.value}</p>
                                    </div>
                                  ))}
                                </div>
                                <div>
                                  <h4 className="font-semibold text-violet-200 mb-3">Practices</h4>
                                  <ul className="grid md:grid-cols-2 gap-2">
                                    {reading.holisticProfile!.spiritual.practices.map((p, i) => (
                                      <li key={i} className="text-violet-100 flex items-start gap-2"><span className="text-violet-400">*</span> {p}</li>
                                    ))}
                                  </ul>
                                </div>
                              </div>
                            )}
                            {key === 'ancestral' && (
                              <div className="space-y-6">
                                <div className="bg-amber-900/20 rounded-xl p-5 text-center">
                                  <p className="text-amber-100 text-lg">{reading.holisticProfile!.ancestral.lineageTheme}</p>
                                </div>
                                <div className="grid md:grid-cols-2 gap-6">
                                  <div>
                                    <h4 className="font-semibold text-amber-200 mb-3">Inherited Strengths</h4>
                                    <ul className="space-y-2">
                                      {reading.holisticProfile!.ancestral.inheritedStrengths.map((s, i) => (
                                        <li key={i} className="text-amber-100 flex items-start gap-2"><span className="text-amber-400">+</span> {s}</li>
                                      ))}
                                    </ul>
                                  </div>
                                  <div>
                                    <h4 className="font-semibold text-amber-200 mb-3">Inherited Challenges</h4>
                                    <ul className="space-y-2">
                                      {reading.holisticProfile!.ancestral.inheritedChallenges.map((c, i) => (
                                        <li key={i} className="text-amber-100 flex items-start gap-2"><span className="text-amber-400">~</span> {c}</li>
                                      ))}
                                    </ul>
                                  </div>
                                </div>
                                <div className="bg-amber-900/20 rounded-xl p-4">
                                  <p className="text-amber-300 text-xs font-semibold mb-1">Ancestral Healing Focus</p>
                                  <p className="text-amber-100">{reading.holisticProfile!.ancestral.ancestralHealing}</p>
                                </div>
                                <div>
                                  <h4 className="font-semibold text-amber-200 mb-3">Honoring Practices</h4>
                                  <ul className="grid md:grid-cols-2 gap-2">
                                    {reading.holisticProfile!.ancestral.honoringPractices.map((p, i) => (
                                      <li key={i} className="text-amber-100 flex items-start gap-2"><span className="text-amber-400">*</span> {p}</li>
                                    ))}
                                  </ul>
                                </div>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            )}

            {/* Old static holistic sections removed — now inside Element Wisdom card */}
            {false && reading.holisticProfile && (
              <>
                {/* Physical Health Section — REMOVED: now in Element expansion */}
                <div className="bg-black/30 backdrop-blur-sm border border-emerald-500/30 rounded-2xl p-8">
                  <h2 className="text-3xl font-bold text-emerald-300 mb-2">Physical Body & Health</h2>
                  <p className="text-emerald-200/60 text-sm mb-6">Traditional Chinese Medicine organ correspondences for {reading.element.name} element</p>

                  <div className="grid md:grid-cols-2 gap-8 mb-8">
                    <div className="space-y-4">
                      <h4 className="text-xl font-bold text-emerald-200">Organ Systems</h4>
                      <div className="space-y-2 text-emerald-100">
                        <p><span className="text-emerald-400 font-semibold">Yin Organ:</span> {reading.holisticProfile.physical.yinOrgan}</p>
                        <p><span className="text-emerald-400 font-semibold">Yang Organ:</span> {reading.holisticProfile.physical.yangOrgan}</p>
                        <p><span className="text-emerald-400 font-semibold">Body Tissue:</span> {reading.holisticProfile.physical.bodyTissue}</p>
                        <p><span className="text-emerald-400 font-semibold">Sensory Organ:</span> {reading.holisticProfile.physical.sensoryOrgan}</p>
                        <p><span className="text-emerald-400 font-semibold">Body Fluid:</span> {reading.holisticProfile.physical.bodyFluid}</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-xl font-bold text-emerald-200">Health Tendencies</h4>
                      <ul className="space-y-2">
                        {reading.holisticProfile.physical.healthTendencies.map((tendency, index) => (
                          <li key={index} className="text-emerald-100 flex items-start space-x-2">
                            <span className="text-amber-400 mt-1">!</span>
                            <span>{tendency}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xl font-bold text-emerald-200 mb-4">Support Practices</h4>
                    <ul className="grid md:grid-cols-2 gap-3">
                      {reading.holisticProfile.physical.supportPractices.map((practice, index) => (
                        <li key={index} className="text-emerald-100 flex items-start space-x-2">
                          <span className="text-emerald-400 mt-1">+</span>
                          <span>{practice}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Emotional Patterns Section */}
                <div className="bg-black/30 backdrop-blur-sm border border-rose-500/30 rounded-2xl p-8">
                  <h2 className="text-3xl font-bold text-rose-300 mb-2">Emotional Patterns</h2>
                  <p className="text-rose-200/60 text-sm mb-6">The {reading.element.name} element's emotional landscape</p>

                  <div className="grid md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-rose-900/20 rounded-xl p-4 text-center">
                      <h4 className="text-rose-300 font-semibold mb-2">Primary Emotion</h4>
                      <p className="text-rose-100 text-lg">{reading.holisticProfile.emotional.primaryEmotion}</p>
                    </div>
                    <div className="bg-rose-900/20 rounded-xl p-4 text-center">
                      <h4 className="text-rose-300 font-semibold mb-2">Shadow Expression</h4>
                      <p className="text-rose-100 text-lg">{reading.holisticProfile.emotional.shadowEmotion}</p>
                    </div>
                    <div className="bg-rose-900/20 rounded-xl p-4 text-center">
                      <h4 className="text-rose-300 font-semibold mb-2">Balanced Expression</h4>
                      <p className="text-rose-100 text-lg">{reading.holisticProfile.emotional.balancedExpression}</p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-8">
                    <div>
                      <h4 className="text-xl font-bold text-rose-200 mb-4">Imbalance Signals</h4>
                      <ul className="space-y-2">
                        {reading.holisticProfile.emotional.imbalanceSignals.map((signal, index) => (
                          <li key={index} className="text-rose-100 flex items-start space-x-2">
                            <span className="text-amber-400 mt-1">~</span>
                            <span>{signal}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-rose-200 mb-4">Healing Practices</h4>
                      <ul className="space-y-2">
                        {reading.holisticProfile.emotional.healingPractices.map((practice, index) => (
                          <li key={index} className="text-rose-100 flex items-start space-x-2">
                            <span className="text-rose-400 mt-1">+</span>
                            <span>{practice}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Mental Qualities Section */}
                <div className="bg-black/30 backdrop-blur-sm border border-cyan-500/30 rounded-2xl p-8">
                  <h2 className="text-3xl font-bold text-cyan-300 mb-2">Mental Qualities</h2>
                  <p className="text-cyan-200/60 text-sm mb-6">Cognitive patterns of the {reading.element.name} mind</p>

                  <div className="bg-cyan-900/20 rounded-xl p-6 mb-8">
                    <h4 className="text-cyan-300 font-semibold mb-2">Thinking Style</h4>
                    <p className="text-cyan-100 text-xl">{reading.holisticProfile.mental.thinkingStyle}</p>
                    <p className="text-cyan-200/70 mt-3">
                      <span className="font-semibold">Learning Style:</span> {reading.holisticProfile.mental.learningStyle}
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-8">
                    <div>
                      <h4 className="text-xl font-bold text-cyan-200 mb-4">Cognitive Strengths</h4>
                      <ul className="space-y-2">
                        {reading.holisticProfile.mental.cognitiveStrengths.map((strength, index) => (
                          <li key={index} className="text-cyan-100 flex items-start space-x-2">
                            <span className="text-cyan-400 mt-1">*</span>
                            <span>{strength}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-cyan-200 mb-4">Mental Challenges</h4>
                      <ul className="space-y-2">
                        {reading.holisticProfile.mental.mentalChallenges.map((challenge, index) => (
                          <li key={index} className="text-cyan-100 flex items-start space-x-2">
                            <span className="text-amber-400 mt-1">~</span>
                            <span>{challenge}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="mt-8">
                    <h4 className="text-xl font-bold text-cyan-200 mb-4">Support Practices</h4>
                    <ul className="grid md:grid-cols-2 gap-3">
                      {reading.holisticProfile.mental.supportPractices.map((practice, index) => (
                        <li key={index} className="text-cyan-100 flex items-start space-x-2">
                          <span className="text-cyan-400 mt-1">+</span>
                          <span>{practice}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Spiritual Themes Section */}
                <div className="bg-black/30 backdrop-blur-sm border border-violet-500/30 rounded-2xl p-8">
                  <h2 className="text-3xl font-bold text-violet-300 mb-2">Spiritual Themes</h2>
                  <p className="text-violet-200/60 text-sm mb-6">Soul lessons and gifts of the {reading.element.name} path</p>

                  <div className="grid md:grid-cols-2 gap-6 mb-8">
                    <div className="bg-violet-900/20 rounded-xl p-5">
                      <h4 className="text-violet-300 font-semibold mb-2">Soul Lesson</h4>
                      <p className="text-violet-100">{reading.holisticProfile.spiritual.soulLesson}</p>
                    </div>
                    <div className="bg-violet-900/20 rounded-xl p-5">
                      <h4 className="text-violet-300 font-semibold mb-2">Spiritual Gift</h4>
                      <p className="text-violet-100">{reading.holisticProfile.spiritual.spiritualGift}</p>
                    </div>
                    <div className="bg-violet-900/20 rounded-xl p-5">
                      <h4 className="text-violet-300 font-semibold mb-2">Karmic Pattern</h4>
                      <p className="text-violet-100">{reading.holisticProfile.spiritual.karmicPattern}</p>
                    </div>
                    <div className="bg-violet-900/20 rounded-xl p-5">
                      <h4 className="text-violet-300 font-semibold mb-2">Evolutionary Path</h4>
                      <p className="text-violet-100">{reading.holisticProfile.spiritual.evolutionaryPath}</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xl font-bold text-violet-200 mb-4">Spiritual Practices</h4>
                    <ul className="grid md:grid-cols-2 gap-3">
                      {reading.holisticProfile.spiritual.practices.map((practice, index) => (
                        <li key={index} className="text-violet-100 flex items-start space-x-2">
                          <span className="text-violet-400 mt-1">*</span>
                          <span>{practice}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Ancestral Patterns Section */}
                <div className="bg-black/30 backdrop-blur-sm border border-amber-500/30 rounded-2xl p-8">
                  <h2 className="text-3xl font-bold text-amber-300 mb-2">Ancestral Patterns</h2>
                  <p className="text-amber-200/60 text-sm mb-6">Lineage themes of the {reading.element.name} element</p>

                  <div className="bg-amber-900/20 rounded-xl p-6 mb-8 text-center">
                    <h4 className="text-amber-300 font-semibold mb-2">Lineage Theme</h4>
                    <p className="text-amber-100 text-xl">{reading.holisticProfile.ancestral.lineageTheme}</p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-8 mb-8">
                    <div>
                      <h4 className="text-xl font-bold text-amber-200 mb-4">Inherited Strengths</h4>
                      <ul className="space-y-2">
                        {reading.holisticProfile.ancestral.inheritedStrengths.map((strength, index) => (
                          <li key={index} className="text-amber-100 flex items-start space-x-2">
                            <span className="text-amber-400 mt-1">+</span>
                            <span>{strength}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-amber-200 mb-4">Inherited Challenges</h4>
                      <ul className="space-y-2">
                        {reading.holisticProfile.ancestral.inheritedChallenges.map((challenge, index) => (
                          <li key={index} className="text-amber-100 flex items-start space-x-2">
                            <span className="text-amber-400 mt-1">~</span>
                            <span>{challenge}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="bg-amber-900/20 rounded-xl p-5 mb-6">
                    <h4 className="text-amber-300 font-semibold mb-2">Ancestral Healing Focus</h4>
                    <p className="text-amber-100">{reading.holisticProfile.ancestral.ancestralHealing}</p>
                  </div>

                  <div>
                    <h4 className="text-xl font-bold text-amber-200 mb-4">Honoring Practices</h4>
                    <ul className="grid md:grid-cols-2 gap-3">
                      {reading.holisticProfile.ancestral.honoringPractices.map((practice, index) => (
                        <li key={index} className="text-amber-100 flex items-start space-x-2">
                          <span className="text-amber-400 mt-1">*</span>
                          <span>{practice}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </>
            )}

            {/* Compatibility — now inside Animal Wisdom card */}

            {/* Cycle Information */}
            <div className="bg-black/30 backdrop-blur-sm border border-amber-500/30 rounded-2xl p-8 text-center">
              <h2 className="text-3xl font-bold text-amber-300 mb-4">Sexagenary Cycle Position</h2>
              <div className="text-6xl font-bold text-amber-200 mb-4">
                {reading.cycleYear}/60
              </div>
              <p className="text-amber-100 text-lg max-w-2xl mx-auto">
                You are part of the ancient 60-year cycle that combines the 12 zodiac animals with the 5 elements.
                This unique position in the cosmic wheel shapes your energetic signature and life path.
              </p>
            </div>

            {/* MAIA Discussion — Profile */}
            <ChineseAstrologyDiscussion
              mode="profile"
              profileContext={{
                animal: reading.zodiacAnimal.name,
                element: reading.element.name,
                yinYang: reading.yinYang,
                cyclePosition: reading.cycleYear,
                archetype: reading.zodiacAnimal.archetype,
                compatibility: reading.compatibility.mostCompatible,
                holisticHighlights: reading.holisticProfile
                  ? `Physical: ${reading.holisticProfile.physical.yinOrgan}/${reading.holisticProfile.physical.yangOrgan}. Emotional: ${reading.holisticProfile.emotional.primaryEmotion} (shadow: ${reading.holisticProfile.emotional.shadowEmotion}). Spiritual: ${reading.holisticProfile.spiritual.soulLesson}. Ancestral: ${reading.holisticProfile.ancestral.lineageTheme}.`
                  : undefined,
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}