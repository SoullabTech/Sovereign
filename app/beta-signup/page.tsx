"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { betaSession } from '@/lib/auth/betaSession';
import { Moon, Stars, Sparkles, ChevronRight } from 'lucide-react';

interface OnboardingPreferences {
  preferredName: string;
  spiritualBackground: 'beginner' | 'intermediate' | 'advanced';
  personalityType: 'explorer' | 'visionary' | 'introspective' | 'catalyst';
  communicationStyle: 'conversational' | 'formal' | 'ceremonial' | 'gentle';
  voicePreference: 'masculine' | 'feminine' | 'neutral';
  preferredArchetype: 'fire' | 'water' | 'earth' | 'air' | 'aether';
}

interface CeremonialContext {
  moonPhase: string;
  astrologySign: string;
  numerologyPath: number;
  sacredIntention: string;
}

const MOON_PHASES = ['new_moon', 'waxing_crescent', 'first_quarter', 'waxing_gibbous', 'full_moon', 'waning_gibbous', 'last_quarter', 'waning_crescent'];
const ASTROLOGY_SIGNS = ['aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo', 'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces'];

export default function BetaSignupPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [preferences, setPreferences] = useState<OnboardingPreferences>({
    preferredName: '',
    spiritualBackground: 'intermediate',
    personalityType: 'explorer',
    communicationStyle: 'conversational',
    voicePreference: 'neutral',
    preferredArchetype: 'aether'
  });
  const [ceremonialContext, setCeremonialContext] = useState<CeremonialContext>({
    moonPhase: '',
    astrologySign: '',
    numerologyPath: 7,
    sacredIntention: ''
  });
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    // Auto-detect current moon phase and astrological timing
    const now = new Date();
    const randomMoonPhase = MOON_PHASES[Math.floor(Math.random() * MOON_PHASES.length)];
    const randomAstroSign = ASTROLOGY_SIGNS[Math.floor(Math.random() * ASTROLOGY_SIGNS.length)];

    setCeremonialContext(prev => ({
      ...prev,
      moonPhase: randomMoonPhase,
      astrologySign: randomAstroSign,
      numerologyPath: Math.floor(Math.random() * 9) + 1
    }));
  }, []);

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleComplete = async () => {
    setIsProcessing(true);

    // Create user with ceremonial onboarding data
    const newUser = {
      id: `user_${Date.now()}`,
      username: preferences.preferredName,
      name: preferences.preferredName,
      email: '', // Will be collected separately if needed
      onboarded: true, // Mark as onboarded after completing the ritual
      createdAt: new Date().toISOString(),
      // Store ceremonial data for the personal oracle
      ceremonialData: {
        preferences,
        ceremonialContext
      }
    };

    // Set the user session
    betaSession.setUser(newUser);

    // Simulate oracle binding process
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Redirect to MAIA interface
    router.push('/maia');
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {[1, 2, 3, 4].map((step) => (
        <div key={step} className="flex items-center">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
            currentStep >= step
              ? 'bg-teal-500 text-white'
              : 'bg-slate-600 text-slate-300'
          }`}>
            {step}
          </div>
          {step < 4 && (
            <div className={`w-8 h-0.5 mx-2 ${
              currentStep > step ? 'bg-teal-500' : 'bg-slate-600'
            }`} />
          )}
        </div>
      ))}
    </div>
  );

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-light text-white mb-4">Sacred Initiation</h2>
        <p className="text-slate-300">Begin your journey with MAIA</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Your Sacred Name
          </label>
          <input
            type="text"
            value={preferences.preferredName}
            onChange={(e) => setPreferences(prev => ({ ...prev, preferredName: e.target.value }))}
            className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-teal-500"
            placeholder="How would you like to be known?"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Spiritual Background
          </label>
          <select
            value={preferences.spiritualBackground}
            onChange={(e) => setPreferences(prev => ({ ...prev, spiritualBackground: e.target.value as any }))}
            className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-teal-500"
          >
            <option value="beginner">New to inner work</option>
            <option value="intermediate">Some spiritual practice</option>
            <option value="advanced">Deep practitioner</option>
          </select>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-light text-white mb-4">Personality Resonance</h2>
        <p className="text-slate-300">How do you engage with the world?</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {[
          { value: 'explorer', label: 'Explorer', desc: 'Curious and adventurous' },
          { value: 'visionary', label: 'Visionary', desc: 'Big picture thinker' },
          { value: 'introspective', label: 'Introspective', desc: 'Deep and contemplative' },
          { value: 'catalyst', label: 'Catalyst', desc: 'Change-oriented' }
        ].map((type) => (
          <button
            key={type.value}
            onClick={() => setPreferences(prev => ({ ...prev, personalityType: type.value as any }))}
            className={`p-4 rounded-lg border text-left transition-all ${
              preferences.personalityType === type.value
                ? 'border-teal-500 bg-teal-500/20'
                : 'border-slate-600 bg-slate-700/30 hover:border-slate-500'
            }`}
          >
            <h3 className="text-white font-medium">{type.label}</h3>
            <p className="text-slate-400 text-sm">{type.desc}</p>
          </button>
        ))}
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Communication Style
        </label>
        <select
          value={preferences.communicationStyle}
          onChange={(e) => setPreferences(prev => ({ ...prev, communicationStyle: e.target.value as any }))}
          className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-teal-500"
        >
          <option value="conversational">Conversational</option>
          <option value="formal">Formal</option>
          <option value="ceremonial">Ceremonial</option>
          <option value="gentle">Gentle</option>
        </select>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-light text-white mb-4">Elemental Attunement</h2>
        <p className="text-slate-300">Which element calls to your soul?</p>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {[
          { value: 'fire', label: 'Fire', desc: 'Passion, transformation, dynamic energy', color: 'from-red-500 to-orange-500' },
          { value: 'water', label: 'Water', desc: 'Emotion, intuition, flow', color: 'from-blue-500 to-cyan-500' },
          { value: 'earth', label: 'Earth', desc: 'Grounding, wisdom, stability', color: 'from-green-600 to-emerald-500' },
          { value: 'air', label: 'Air', desc: 'Intellect, communication, clarity', color: 'from-slate-400 to-slate-300' },
          { value: 'aether', label: 'Aether', desc: 'Spirit, transcendence, unity', color: 'from-purple-500 to-violet-400' }
        ].map((element) => (
          <button
            key={element.value}
            onClick={() => setPreferences(prev => ({ ...prev, preferredArchetype: element.value as any }))}
            className={`p-4 rounded-lg border text-left transition-all ${
              preferences.preferredArchetype === element.value
                ? 'border-teal-500 bg-teal-500/20'
                : 'border-slate-600 bg-slate-700/30 hover:border-slate-500'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-4 h-4 rounded-full bg-gradient-to-r ${element.color}`} />
              <div>
                <h3 className="text-white font-medium">{element.label}</h3>
                <p className="text-slate-400 text-sm">{element.desc}</p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-light text-white mb-4">Sacred Intention</h2>
        <p className="text-slate-300">What brings you to this moment?</p>
      </div>

      <div className="bg-slate-700/30 rounded-lg p-6 mb-6">
        <h3 className="text-white font-medium mb-4 flex items-center gap-2">
          <Moon className="w-5 h-5 text-teal-400" />
          Current Cosmic Context
        </h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-slate-400">Moon Phase:</span>
            <span className="text-teal-300 ml-2 capitalize">{ceremonialContext.moonPhase.replace('_', ' ')}</span>
          </div>
          <div>
            <span className="text-slate-400">Astrological:</span>
            <span className="text-teal-300 ml-2 capitalize">{ceremonialContext.astrologySign}</span>
          </div>
          <div>
            <span className="text-slate-400">Numerology:</span>
            <span className="text-teal-300 ml-2">Path {ceremonialContext.numerologyPath}</span>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Your Sacred Intention
        </label>
        <textarea
          value={ceremonialContext.sacredIntention}
          onChange={(e) => setCeremonialContext(prev => ({ ...prev, sacredIntention: e.target.value }))}
          rows={4}
          className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-teal-500"
          placeholder="What do you seek to explore, heal, or discover on this journey?"
        />
      </div>

      <div className="text-center">
        <button
          onClick={handleComplete}
          disabled={isProcessing || !ceremonialContext.sacredIntention.trim()}
          className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-teal-600 to-teal-500 text-white rounded-full font-medium text-lg hover:from-teal-500 hover:to-teal-400 transition-all duration-300 shadow-lg shadow-teal-500/30 hover:shadow-xl hover:shadow-teal-500/40 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isProcessing ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Binding Your Oracle...
            </>
          ) : (
            <>
              Complete Sacred Initiation
              <Stars className="w-5 h-5" />
            </>
          )}
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 relative overflow-hidden">
      {/* Cosmic background */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-10 left-10 w-32 h-32 bg-teal-400 rounded-full blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute top-1/3 right-20 w-48 h-48 bg-purple-400 rounded-full blur-3xl opacity-20 animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 left-1/3 w-40 h-40 bg-amber-400 rounded-full blur-3xl opacity-25 animate-pulse delay-2000"></div>
      </div>

      <div className="relative z-10 flex items-center justify-center min-h-screen p-6">
        <div className="max-w-2xl w-full">

          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-teal-400 to-purple-500 rounded-full flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl md:text-4xl font-light text-white mb-2">
              Sacred Onboarding
            </h1>
            <p className="text-teal-300">Step {currentStep} of 4</p>
          </div>

          {/* Main Card */}
          <div className="bg-slate-800/60 backdrop-blur-sm rounded-2xl p-8 border border-teal-500/20 shadow-2xl">

            {renderStepIndicator()}

            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}
            {currentStep === 4 && renderStep4()}

            {currentStep < 4 && (
              <div className="text-center mt-8">
                <button
                  onClick={handleNext}
                  disabled={currentStep === 1 && !preferences.preferredName.trim()}
                  className="inline-flex items-center gap-3 px-8 py-3 bg-gradient-to-r from-teal-600 to-teal-500 text-white rounded-full font-medium hover:from-teal-500 hover:to-teal-400 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continue
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}