// @ts-nocheck
'use client'

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Calendar, User, Compass, Clock } from 'lucide-react';
import {
  ChineseZodiacAnimal,
  ChineseElement,
  getChineseZodiacAnimal,
  getChineseElement,
  getYinYang,
  getSexagenaryPosition
} from '@/lib/astrology/chineseAstrology';
import DaYunTimeline from '@/components/astrology/DaYunTimeline';
import type { Gender } from '@/lib/astrology/types/daYun';

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
}

export default function ChineseAstrologyPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('profile');
  const [birthYear, setBirthYear] = useState<string>('');
  const [birthDate, setBirthDate] = useState<string>('');
  const [birthTime, setBirthTime] = useState<string>('');
  const [gender, setGender] = useState<Gender | ''>('');
  const [reading, setReading] = useState<ChineseReadingData | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const generateReading = async () => {
    if (!birthYear || isNaN(Number(birthYear))) return;

    setIsCalculating(true);

    // Calculate actual Chinese astrology data from the birth year
    setTimeout(() => {
      const year = Number(birthYear);
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

      const readingData: ChineseReadingData = {
        zodiacAnimal,
        element,
        yinYang,
        cycleYear: cyclePosition,
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
                <h2 className="text-2xl font-bold text-orange-200 mb-6 text-center">
                  Enter Your Birth Year
                </h2>

                <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
                  <select
                    value={birthYear}
                    onChange={(e) => setBirthYear(e.target.value)}
                    className="bg-black/50 border border-orange-500/50 rounded-xl px-6 py-4 text-orange-200 text-lg w-full sm:w-auto focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-400/30"
                  >
                    <option value="">Select Year...</option>
                    {yearOptions.map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>

                  <button
                    onClick={generateReading}
                    disabled={!birthYear || isCalculating}
                    className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 disabled:from-gray-600 disabled:to-gray-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 w-full sm:w-auto disabled:cursor-not-allowed"
                  >
                    {isCalculating ? 'Calculating...' : 'Reveal Destiny'}
                  </button>
                </div>
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
                        onClick={() => setGender('male')}
                        className={`flex-1 py-3 px-4 rounded-xl border transition-all ${
                          gender === 'male'
                            ? 'bg-orange-500/30 border-orange-500/50 text-orange-200'
                            : 'bg-black/30 border-orange-500/30 text-orange-200/60 hover:border-orange-500/50'
                        }`}
                      >
                        Male
                      </button>
                      <button
                        onClick={() => setGender('female')}
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
          <div className="max-w-6xl mx-auto">
            <DaYunTimeline
              birthDate={birthDate}
              birthTime={birthTime || undefined}
              gender={gender || undefined}
            />
          </div>
        )}

        {/* Profile Reading Results */}
        {viewMode === 'profile' && reading && (
          <div className="max-w-6xl mx-auto space-y-8">
            {/* Core Identity */}
            <div className="bg-black/30 backdrop-blur-sm border border-red-500/30 rounded-2xl p-8">
              <h2 className="text-3xl font-bold text-red-300 mb-6 text-center">
                Your Chinese Cosmic Identity
              </h2>

              <div className="grid md:grid-cols-2 gap-8">
                <div className="text-center">
                  <div className="text-6xl mb-4">{reading.zodiacAnimal.symbol}</div>
                  <h3 className="text-2xl font-bold text-orange-200 mb-2">
                    {reading.zodiacAnimal.name}
                  </h3>
                  <p className="text-orange-300">
                    {reading.zodiacAnimal.description}
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-2xl font-bold text-white">
                    {reading.element.symbol}
                  </div>
                  <h3 className="text-2xl font-bold text-orange-200 mb-2">
                    {reading.element.name} Element
                  </h3>
                  <p className="text-orange-300">
                    {reading.element.description}
                  </p>
                  <div className="mt-4 text-lg text-yellow-300">
                    {reading.yinYang.toUpperCase()} Energy
                  </div>
                </div>
              </div>
            </div>

            {/* Personality Profile */}
            <div className="bg-black/30 backdrop-blur-sm border border-orange-500/30 rounded-2xl p-8">
              <h2 className="text-3xl font-bold text-orange-300 mb-6">Personality Essence</h2>

              <div className="space-y-4">
                {reading.personalityProfile.map((trait, index) => (
                  <div key={index} className="flex items-start space-x-4">
                    <div className="w-2 h-2 bg-orange-400 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-orange-200 text-lg">{trait}</p>
                  </div>
                ))}
              </div>

              <div className="grid md:grid-cols-2 gap-8 mt-8">
                <div>
                  <h4 className="text-xl font-bold text-green-300 mb-4">Strengths</h4>
                  <ul className="space-y-2">
                    {reading.strengthsWeaknesses.strengths.map((strength, index) => (
                      <li key={index} className="text-green-200 flex items-center space-x-2">
                        <span className="text-green-400">✦</span>
                        <span>{strength}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="text-xl font-bold text-red-300 mb-4">Growth Areas</h4>
                  <ul className="space-y-2">
                    {reading.strengthsWeaknesses.weaknesses.map((weakness, index) => (
                      <li key={index} className="text-red-200 flex items-center space-x-2">
                        <span className="text-red-400">◈</span>
                        <span>{weakness}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Spiralogic Integration */}
            <div className="bg-black/30 backdrop-blur-sm border border-purple-500/30 rounded-2xl p-8">
              <h2 className="text-3xl font-bold text-purple-300 mb-6">Spiralogic Consciousness Integration</h2>

              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h4 className="text-xl font-bold text-purple-200 mb-4">Elemental Pathway</h4>
                  <p className="text-purple-100 mb-2">
                    <strong>Primary:</strong> {reading.spiralogicIntegration.primaryElement}
                  </p>
                  <p className="text-purple-100 mb-4">
                    <strong>Secondary:</strong> {reading.spiralogicIntegration.secondaryElements.join(', ')}
                  </p>
                  <p className="text-purple-200">
                    {reading.spiralogicIntegration.evolutionaryPath}
                  </p>
                </div>

                <div>
                  <h4 className="text-xl font-bold text-purple-200 mb-4">Consciousness Activation</h4>
                  <p className="text-purple-100 text-lg leading-relaxed">
                    {reading.spiralogicIntegration.consciousnessActivation}
                  </p>
                </div>
              </div>
            </div>

            {/* Life Guidance */}
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-black/30 backdrop-blur-sm border border-blue-500/30 rounded-2xl p-8">
                <h3 className="text-2xl font-bold text-blue-300 mb-4">Career & Purpose</h3>
                <ul className="space-y-3">
                  {reading.lifeGuidance.careerPaths.map((path, index) => (
                    <li key={index} className="text-blue-200 flex items-start space-x-2">
                      <span className="text-blue-400 mt-1">⚡</span>
                      <span>{path}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-black/30 backdrop-blur-sm border border-pink-500/30 rounded-2xl p-8">
                <h3 className="text-2xl font-bold text-pink-300 mb-4">Relationships</h3>
                <ul className="space-y-3">
                  {reading.lifeGuidance.relationships.map((aspect, index) => (
                    <li key={index} className="text-pink-200 flex items-start space-x-2">
                      <span className="text-pink-400 mt-1">💝</span>
                      <span>{aspect}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-black/30 backdrop-blur-sm border border-yellow-500/30 rounded-2xl p-8">
                <h3 className="text-2xl font-bold text-yellow-300 mb-4">Spiritual Development</h3>
                <ul className="space-y-3">
                  {reading.lifeGuidance.spiritualDevelopment.map((practice, index) => (
                    <li key={index} className="text-yellow-200 flex items-start space-x-2">
                      <span className="text-yellow-400 mt-1">🌟</span>
                      <span>{practice}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-black/30 backdrop-blur-sm border border-green-500/30 rounded-2xl p-8">
                <h3 className="text-2xl font-bold text-green-300 mb-4">Health & Wellness</h3>
                <ul className="space-y-3">
                  {reading.lifeGuidance.healthWellness.map((guidance, index) => (
                    <li key={index} className="text-green-200 flex items-start space-x-2">
                      <span className="text-green-400 mt-1">🌿</span>
                      <span>{guidance}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Compatibility */}
            <div className="bg-black/30 backdrop-blur-sm border border-indigo-500/30 rounded-2xl p-8">
              <h2 className="text-3xl font-bold text-indigo-300 mb-6">Cosmic Compatibility</h2>

              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h4 className="text-xl font-bold text-green-300 mb-4">Most Compatible Signs</h4>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {reading.compatibility.mostCompatible.map((sign, index) => (
                      <span key={index} className="bg-green-600/30 text-green-200 px-3 py-1 rounded-full text-sm">
                        {sign}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-xl font-bold text-red-300 mb-4">Challenging Connections</h4>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {reading.compatibility.challenging.map((sign, index) => (
                      <span key={index} className="bg-red-600/30 text-red-200 px-3 py-1 rounded-full text-sm">
                        {sign}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-indigo-900/30 rounded-xl">
                <p className="text-indigo-200 leading-relaxed">
                  {reading.compatibility.analysis}
                </p>
              </div>
            </div>

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
          </div>
        )}
      </div>
    </div>
  );
}