'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SacredColors } from './types';

interface TeenOnboardingProps {
  onComplete: (profile: TeenProfile) => void;
  onSkip?: () => void;
}

export interface TeenProfile {
  age: number;
  isNeurodivergent?: boolean;
  neurodivergentTypes?: string[];
  familyDynamics?: 'supportive' | 'challenging' | 'prefer-not-to-say';
  strugglingWith?: string[];
  supportNeeds?: string[];
  consentGiven: boolean;
  parentalConsent?: boolean; // For under 18
}

export default function TeenOnboarding({ onComplete, onSkip }: TeenOnboardingProps) {
  const [step, setStep] = useState(0);
  const [profile, setProfile] = useState<Partial<TeenProfile>>({
    consentGiven: false,
  });

  const updateProfile = (updates: Partial<TeenProfile>) => {
    setProfile(prev => ({ ...prev, ...updates }));
  };

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => Math.max(0, s - 1));

  const handleComplete = () => {
    if (profile.age && profile.consentGiven) {
      onComplete(profile as TeenProfile);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center p-6">
      <div className="max-w-2xl w-full">
        <AnimatePresence mode="wait">
          {step === 0 && (
            <WelcomeStep
              key="welcome"
              onNext={nextStep}
              onSkip={onSkip}
            />
          )}

          {step === 1 && (
            <AgeConsentStep
              key="age"
              profile={profile}
              updateProfile={updateProfile}
              onNext={nextStep}
              onBack={prevStep}
            />
          )}

          {step === 2 && (
            <NeurodivergenceStep
              key="neurodivergence"
              profile={profile}
              updateProfile={updateProfile}
              onNext={nextStep}
              onBack={prevStep}
            />
          )}

          {step === 3 && (
            <SupportNeedsStep
              key="support"
              profile={profile}
              updateProfile={updateProfile}
              onNext={nextStep}
              onBack={prevStep}
            />
          )}

          {step === 4 && (
            <SafetyResourcesStep
              key="safety"
              onNext={handleComplete}
              onBack={prevStep}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// Step 1: Welcome
function WelcomeStep({ onNext, onSkip }: { onNext: () => void; onSkip?: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20"
    >
      <div className="text-center space-y-6">
        <h1 className="text-4xl font-bold text-white">
          Welcome to Your Space
        </h1>

        <p className="text-xl text-white/90 leading-relaxed">
          This is a safe place to explore who you are, without judgment.
        </p>

        <div className="bg-blue-500/20 border border-blue-400/30 rounded-lg p-6 text-left">
          <p className="text-white/90 text-lg leading-relaxed">
            <strong className="text-white">Real talk:</strong> We're going to ask you some questions.
            You don't have to answer anything you're not comfortable with. You can skip anything.
            This is YOUR space, and you get to decide what you share.
          </p>
        </div>

        <div className="space-y-3">
          <button
            onClick={onNext}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold py-4 px-6 rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all shadow-lg"
          >
            Let's Go
          </button>

          {onSkip && (
            <button
              onClick={onSkip}
              className="w-full text-white/60 hover:text-white/80 py-2 text-sm transition-colors"
            >
              Skip this for now
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// Step 2: Age & Consent
function AgeConsentStep({
  profile,
  updateProfile,
  onNext,
  onBack
}: {
  profile: Partial<TeenProfile>;
  updateProfile: (updates: Partial<TeenProfile>) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const [age, setAge] = useState(profile.age || 16);
  const [parentalConsent, setParentalConsent] = useState(profile.parentalConsent || false);
  const [userConsent, setUserConsent] = useState(false);

  const handleNext = () => {
    updateProfile({
      age,
      parentalConsent: age < 18 ? parentalConsent : true,
      consentGiven: userConsent
    });
    onNext();
  };

  const canProceed = userConsent && (age >= 18 || parentalConsent);

  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20"
    >
      <h2 className="text-3xl font-bold text-white mb-6">Quick Check-In</h2>

      <div className="space-y-6">
        {/* Age Selection */}
        <div>
          <label className="block text-white text-lg mb-3">
            How old are you?
          </label>
          <select
            value={age}
            onChange={(e) => setAge(Number(e.target.value))}
            className="w-full bg-white/10 border border-white/30 rounded-lg px-4 py-3 text-white text-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
          >
            {Array.from({ length: 8 }, (_, i) => i + 13).map(a => (
              <option key={a} value={a} className="bg-gray-800">{a}</option>
            ))}
            <option value={21} className="bg-gray-800">21+</option>
          </select>
        </div>

        {/* Parental Consent (if under 18) */}
        {age < 18 && (
          <div className="bg-yellow-500/20 border border-yellow-400/30 rounded-lg p-4">
            <label className="flex items-start space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={parentalConsent}
                onChange={(e) => setParentalConsent(e.target.checked)}
                className="mt-1 w-5 h-5 rounded border-white/30 bg-white/10 checked:bg-purple-500"
              />
              <span className="text-white/90 text-sm">
                I have permission from a parent or guardian to use this platform
              </span>
            </label>
          </div>
        )}

        {/* User Consent */}
        <div className="bg-white/5 border border-white/20 rounded-lg p-6 space-y-4">
          <h3 className="text-white font-semibold text-lg">Before we continue...</h3>

          <p className="text-white/80 text-sm leading-relaxed">
            MAIA is here to help you explore your thoughts and feelings. She's NOT a therapist or a replacement
            for professional help. If you're in crisis or struggling with serious mental health challenges,
            please reach out to a trusted adult or professional.
          </p>

          <label className="flex items-start space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={userConsent}
              onChange={(e) => setUserConsent(e.target.checked)}
              className="mt-1 w-5 h-5 rounded border-white/30 bg-white/10 checked:bg-purple-500"
            />
            <span className="text-white text-sm">
              I understand that MAIA is a supportive tool, not professional therapy
            </span>
          </label>
        </div>

        {/* Navigation */}
        <div className="flex gap-4 pt-4">
          <button
            onClick={onBack}
            className="px-6 py-3 text-white/60 hover:text-white transition-colors"
          >
            ← Back
          </button>
          <button
            onClick={handleNext}
            disabled={!canProceed}
            className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold py-3 px-6 rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Continue
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// Step 3: Neurodivergence (Optional)
function NeurodivergenceStep({
  profile,
  updateProfile,
  onNext,
  onBack
}: {
  profile: Partial<TeenProfile>;
  updateProfile: (updates: Partial<TeenProfile>) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const [isNeurodivergent, setIsNeurodivergent] = useState<boolean | undefined>(profile.isNeurodivergent);
  const [selectedTypes, setSelectedTypes] = useState<string[]>(profile.neurodivergentTypes || []);

  const neurodivergentOptions = [
    { id: 'adhd', label: 'ADHD', description: 'Attention, focus, executive function differences' },
    { id: 'autism', label: 'Autism/Asperger\'s', description: 'Social communication, sensory, pattern differences' },
    { id: 'dyslexia', label: 'Dyslexia', description: 'Reading, writing processing differences' },
    { id: 'anxiety', label: 'Anxiety', description: 'Worry, nervousness, panic' },
    { id: 'depression', label: 'Depression', description: 'Low mood, low energy, lack of interest' },
    { id: 'other', label: 'Other/Unsure', description: 'Something else or still figuring it out' },
  ];

  const toggleType = (id: string) => {
    setSelectedTypes(prev =>
      prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
    );
  };

  const handleNext = () => {
    updateProfile({
      isNeurodivergent,
      neurodivergentTypes: isNeurodivergent ? selectedTypes : undefined
    });
    onNext();
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 max-h-[90vh] overflow-y-auto"
    >
      <h2 className="text-3xl font-bold text-white mb-4">Your Brain is Awesome</h2>

      <p className="text-white/80 text-lg mb-6">
        Everyone's brain works differently. We're asking because it helps MAIA understand you better -
        NOT to label you or make you feel broken. Different is not wrong.
      </p>

      <div className="space-y-6">
        {/* Main Question */}
        <div className="space-y-3">
          <p className="text-white font-semibold">
            Do you identify as neurodivergent, or have you been diagnosed with anything?
          </p>

          <div className="space-y-2">
            <button
              onClick={() => setIsNeurodivergent(true)}
              className={`w-full text-left px-4 py-3 rounded-lg border transition-all ${
                isNeurodivergent === true
                  ? 'bg-purple-500/30 border-purple-400 text-white'
                  : 'bg-white/5 border-white/20 text-white/70 hover:bg-white/10'
              }`}
            >
              Yes
            </button>
            <button
              onClick={() => setIsNeurodivergent(false)}
              className={`w-full text-left px-4 py-3 rounded-lg border transition-all ${
                isNeurodivergent === false
                  ? 'bg-purple-500/30 border-purple-400 text-white'
                  : 'bg-white/5 border-white/20 text-white/70 hover:bg-white/10'
              }`}
            >
              No
            </button>
            <button
              onClick={() => setIsNeurodivergent(undefined)}
              className={`w-full text-left px-4 py-3 rounded-lg border transition-all ${
                isNeurodivergent === undefined
                  ? 'bg-purple-500/30 border-purple-400 text-white'
                  : 'bg-white/5 border-white/20 text-white/70 hover:bg-white/10'
              }`}
            >
              Prefer not to say / Not sure
            </button>
          </div>
        </div>

        {/* Type Selection (if yes) */}
        {isNeurodivergent === true && (
          <div className="space-y-3">
            <p className="text-white/90 text-sm">
              You can select as many as apply (totally optional):
            </p>

            <div className="space-y-2">
              {neurodivergentOptions.map(option => (
                <button
                  key={option.id}
                  onClick={() => toggleType(option.id)}
                  className={`w-full text-left px-4 py-3 rounded-lg border transition-all ${
                    selectedTypes.includes(option.id)
                      ? 'bg-purple-500/30 border-purple-400'
                      : 'bg-white/5 border-white/20 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="font-semibold text-white">{option.label}</div>
                      <div className="text-sm text-white/60">{option.description}</div>
                    </div>
                    {selectedTypes.includes(option.id) && (
                      <span className="text-purple-300">✓</span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Affirmation Box */}
        <div className="bg-green-500/20 border border-green-400/30 rounded-lg p-6">
          <p className="text-white font-semibold mb-2">✨ Here's the truth:</p>
          <p className="text-white/90 text-sm leading-relaxed">
            Your brain's unique wiring is not a bug - it's a feature. ADHD hyperfocus, autistic pattern recognition,
            anxiety's sensitivity, depression's depth - these are SUPERPOWERS when you learn to work with them,
            not against them. You're not broken. You're different. And different is powerful.
          </p>
        </div>

        {/* Navigation */}
        <div className="flex gap-4 pt-4">
          <button
            onClick={onBack}
            className="px-6 py-3 text-white/60 hover:text-white transition-colors"
          >
            ← Back
          </button>
          <button
            onClick={handleNext}
            className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold py-3 px-6 rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all"
          >
            Continue
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// Step 4: Support Needs
function SupportNeedsStep({
  profile,
  updateProfile,
  onNext,
  onBack
}: {
  profile: Partial<TeenProfile>;
  updateProfile: (updates: Partial<TeenProfile>) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const [selectedNeeds, setSelectedNeeds] = useState<string[]>(profile.supportNeeds || []);
  const [familyDynamics, setFamilyDynamics] = useState<string | undefined>(
    profile.familyDynamics
  );

  const supportOptions = [
    { id: 'boundaries', label: 'Learning to set boundaries', icon: '🛡️' },
    { id: 'self-trust', label: 'Trusting myself and my feelings', icon: '💫' },
    { id: 'anxiety', label: 'Managing anxiety or worry', icon: '🌊' },
    { id: 'family', label: 'Navigating family dynamics', icon: '👨‍👩‍👧‍👦' },
    { id: 'identity', label: 'Figuring out who I am', icon: '🔍' },
    { id: 'control', label: 'Feeling out of control', icon: '🎭' },
    { id: 'perfectionism', label: 'Dealing with perfectionism', icon: '🎯' },
    { id: 'other', label: 'Something else', icon: '💭' },
  ];

  const toggleNeed = (id: string) => {
    setSelectedNeeds(prev =>
      prev.includes(id) ? prev.filter(n => n !== id) : [...prev, id]
    );
  };

  const handleNext = () => {
    updateProfile({
      supportNeeds: selectedNeeds,
      familyDynamics: familyDynamics as any
    });
    onNext();
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 max-h-[90vh] overflow-y-auto"
    >
      <h2 className="text-3xl font-bold text-white mb-4">What brings you here?</h2>

      <p className="text-white/80 mb-6">
        Select anything you'd like support with. You can pick multiple or skip this entirely.
      </p>

      <div className="space-y-6">
        {/* Support Needs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {supportOptions.map(option => (
            <button
              key={option.id}
              onClick={() => toggleNeed(option.id)}
              className={`text-left px-4 py-3 rounded-lg border transition-all ${
                selectedNeeds.includes(option.id)
                  ? 'bg-purple-500/30 border-purple-400'
                  : 'bg-white/5 border-white/20 hover:bg-white/10'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{option.icon}</span>
                <span className="text-white text-sm">{option.label}</span>
                {selectedNeeds.includes(option.id) && (
                  <span className="ml-auto text-purple-300">✓</span>
                )}
              </div>
            </button>
          ))}
        </div>

        {/* Family Dynamics (Optional) */}
        <div className="space-y-3">
          <p className="text-white/90 text-sm">
            How would you describe your family situation? (Optional)
          </p>

          <div className="space-y-2">
            {['supportive', 'challenging', 'prefer-not-to-say'].map(option => (
              <button
                key={option}
                onClick={() => setFamilyDynamics(option)}
                className={`w-full text-left px-4 py-2 rounded-lg border text-sm transition-all ${
                  familyDynamics === option
                    ? 'bg-purple-500/30 border-purple-400 text-white'
                    : 'bg-white/5 border-white/20 text-white/70 hover:bg-white/10'
                }`}
              >
                {option === 'supportive' && 'Pretty supportive overall'}
                {option === 'challenging' && 'Kind of challenging or complicated'}
                {option === 'prefer-not-to-say' && 'Prefer not to say'}
              </button>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex gap-4 pt-4">
          <button
            onClick={onBack}
            className="px-6 py-3 text-white/60 hover:text-white transition-colors"
          >
            ← Back
          </button>
          <button
            onClick={handleNext}
            className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold py-3 px-6 rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all"
          >
            Continue
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// Step 5: Safety Resources
function SafetyResourcesStep({
  onNext,
  onBack
}: {
  onNext: () => void;
  onBack: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 max-h-[90vh] overflow-y-auto"
    >
      <h2 className="text-3xl font-bold text-white mb-4">One More Important Thing</h2>

      <p className="text-white/80 mb-6">
        If you're ever in crisis or need immediate help, here are resources that can support you:
      </p>

      <div className="space-y-4 mb-8">
        {/* Crisis Resources */}
        <div className="bg-red-500/20 border border-red-400/30 rounded-lg p-4">
          <h3 className="text-white font-semibold mb-2">🚨 Crisis Support (24/7)</h3>
          <ul className="text-white/90 text-sm space-y-2">
            <li><strong>988 Suicide & Crisis Lifeline:</strong> Call or text 988</li>
            <li><strong>Crisis Text Line:</strong> Text HOME to 741741</li>
            <li><strong>Trevor Project (LGBTQ+):</strong> 1-866-488-7386 or text START to 678678</li>
          </ul>
        </div>

        {/* ED Resources */}
        <div className="bg-blue-500/20 border border-blue-400/30 rounded-lg p-4">
          <h3 className="text-white font-semibold mb-2">🫂 Eating Disorder Support</h3>
          <ul className="text-white/90 text-sm space-y-2">
            <li><strong>NEDA Helpline:</strong> 1-800-931-2237 or text "NEDA" to 741741</li>
            <li><strong>Online:</strong> <a href="https://www.nationaleatingdisorders.org" className="underline">nationaleatingdisorders.org</a></li>
          </ul>
        </div>

        {/* General Support */}
        <div className="bg-green-500/20 border border-green-400/30 rounded-lg p-4">
          <h3 className="text-white font-semibold mb-2">💚 Talk to Someone</h3>
          <ul className="text-white/90 text-sm space-y-2">
            <li>A trusted teacher, school counselor, or coach</li>
            <li>A family member you feel safe with</li>
            <li>Your doctor or therapist if you have one</li>
          </ul>
        </div>
      </div>

      <div className="bg-white/5 border border-white/20 rounded-lg p-6 mb-6">
        <p className="text-white/90 text-sm leading-relaxed">
          <strong className="text-white">Remember:</strong> MAIA is here to help you explore and grow,
          but she can't replace professional help. If you're struggling with your safety, an eating disorder,
          severe depression, or anything that feels overwhelming - please reach out to one of these resources.
          You deserve real, professional support.
        </p>
      </div>

      {/* Navigation */}
      <div className="flex gap-4">
        <button
          onClick={onBack}
          className="px-6 py-3 text-white/60 hover:text-white transition-colors"
        >
          ← Back
        </button>
        <button
          onClick={onNext}
          className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold py-3 px-6 rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all"
        >
          I'm Ready - Let's Begin
        </button>
      </div>
    </motion.div>
  );
}
