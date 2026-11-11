// @ts-nocheck
'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Calendar, User, Compass, Clock, ChevronDown, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ZodiacToggle, { type ZodiacSystem } from '@/components/astrology/ZodiacToggle';
import { apiUrl } from '@/lib/http/apiBase';
import { useVerifiedFreeAstrologyBirthProfile } from '@/lib/hooks/useVerifiedFreeAstrologyBirthProfile';
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
import { chineseYearForIsoDate } from '@/lib/astrology/chineseNewYear';
import { buildChineseReading, type ChineseReadingData } from '@/lib/astrology/chineseReading';
import ChineseReadingView from '@/components/astrology/ChineseReadingView';
import DaYunTimeline from '@/components/astrology/DaYunTimeline';
import type { Gender } from '@/lib/astrology/types/daYun';

type ViewMode = 'profile' | 'da-yun';


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
  const didAutoLoad = useRef(false);
  const generationEpochRef = useRef(0);
  const verifiedBirth = useVerifiedFreeAstrologyBirthProfile();

  const toggleSection = (section: string) => {
    setExpandedSection(prev => prev === section ? null : section);
  };

  // Only a session-verified profile can auto-fill personal birth details.
  // Never revive legacy beta_user/birthDate or gender caches across accounts.
  useEffect(() => {
    ++generationEpochRef.current;
    didAutoLoad.current=false;
    setReading(null);
    setBirthDate('');
    setBirthYear('');
    setBirthTime('');
    setGender('');

    const current=verifiedBirth.status==='verified'?verifiedBirth.birthData:null;
    if(!current)return;
    setBirthDate(current.date);
    setBirthYear(current.date.slice(0,4));
    setBirthTime(current.time||'');
    didAutoLoad.current=true;
  },[verifiedBirth.status,verifiedBirth.memberId,
     verifiedBirth.birthData?.date,verifiedBirth.birthData?.time]);

  // Automatically calculate only from an authenticated saved profile
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

    // Discard late results if the member session/source is revalidated.
    const request=++generationEpochRef.current;
    setTimeout(() => {
      if(request!==generationEpochRef.current)return;
      const date = new Date(birthDate);
      const year = chineseYearForIsoDate(birthDate).chineseYear;
      const readingData = buildChineseReading(year);
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
          href="/astrology"
          className="flex items-center gap-2 px-3 py-2 rounded-lg backdrop-blur-sm bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Back to Astrology</span>
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
            used in distinctive traditions of symbolic interpretation and calendrical inquiry.
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
                        ++generationEpochRef.current;
                        didAutoLoad.current=false;
                        setReading(null);
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
                  {isCalculating ? 'Calculating...' : 'Explore Your Symbolic Reading'}
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
                        ++generationEpochRef.current;
                        didAutoLoad.current=false;
                        setReading(null);
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
          <div className="max-w-6xl mx-auto space-y-8">
            <DaYunTimeline
              birthDate={birthDate}
              birthTime={birthTime || undefined}
              gender={gender || undefined}
            />
          </div>
        )}

        {/* Profile Reading Results */}
        {viewMode === 'profile' && reading && <ChineseReadingView reading={reading} />}
      </div>
    </div>
  );
}