// lib/components/BetaRitualFlow.tsx
// Beta initiation flow with preference seeding

"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUserPreferences } from '../hooks/useUserPreferences';
import { Sparkles, Mic, MicIcon, Heart, Brain, Mountain } from 'lucide-react';

interface BetaRitualFlowProps {
  userId: string;
  onComplete?: (preferences: any) => void;
}

type RitualStep = 'welcome' | 'voice_choice' | 'interaction_mode' | 'first_breath' | 'completion';

export const BetaRitualFlow: React.FC<BetaRitualFlowProps> = ({
  userId,
  onComplete
}) => {
  const router = useRouter();
  const {
    voiceId,
    voiceMode,
    interactionMode,
    setVoiceId,
    setVoiceMode,
    setInteractionMode,
    loading,
    updateJourneyProgress
  } = useUserPreferences(userId);

  const [currentStep, setCurrentStep] = useState<RitualStep>('welcome');
  const [hasInitialized, setHasInitialized] = useState(false);

  // Check if user has already completed ritual
  useEffect(() => {
    const ritualComplete = localStorage.getItem('ritualComplete');
    if (ritualComplete === 'true') {
      router.push('/oracle');
    }
  }, [router]);

  // Initialize ritual state
  useEffect(() => {
    if (!loading && !hasInitialized) {
      setHasInitialized(true);
      // If user already has preferences, skip to completion
      if (voiceId !== 'maya-alloy' || voiceMode !== 'push-to-talk') {
        setCurrentStep('completion');
      }
    }
  }, [loading, hasInitialized, voiceId, voiceMode]);

  const handleVoiceChoice = async (selectedVoiceId: string) => {
    await setVoiceId(selectedVoiceId);
    setCurrentStep('interaction_mode');
  };

  const handleModeChoice = async (selectedMode: typeof voiceMode) => {
    await setVoiceMode(selectedMode);
    setCurrentStep('first_breath');
  };

  const handleInteractionChoice = async (selectedMode: typeof interactionMode) => {
    await setInteractionMode(selectedMode);
    setCurrentStep('completion');
  };

  const completeRitual = async () => {
    // Update journey progress
    await updateJourneyProgress({
      daysCompleted: 0,
      currentPhase: 'initiation-complete'
    });

    // Mark ritual as complete
    localStorage.setItem('ritualComplete', 'true');
    localStorage.setItem('ritualCompletedAt', new Date().toISOString());

    // Call completion callback
    onComplete?.({
      voiceId,
      voiceMode,
      interactionMode,
      completedAt: new Date()
    });

    // Redirect to Oracle
    router.push('/oracle');
  };

  const skipWithDefaults = async () => {
    // Set default preferences
    await setVoiceId('maya-alloy');
    await setVoiceMode('push-to-talk');
    await setInteractionMode('conversational');

    setCurrentStep('completion');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <Sparkles className="w-8 h-8 text-amber-300 animate-spin mx-auto mb-4" />
          <p className="text-amber-200">Preparing your sacred space...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">

        {/* Welcome Step */}
        {currentStep === 'welcome' && (
          <div className="text-center space-y-8">
            <div className="space-y-4">
              <Sparkles className="w-16 h-16 text-amber-300 mx-auto animate-pulse" />
              <h1 className="text-4xl font-bold text-white">Welcome to the Oracle</h1>
              <p className="text-amber-200 text-lg">
                You're about to begin a journey of self-discovery through the five elements.
                First, let's create your sacred configuration.
              </p>
            </div>

            <div className="bg-amber-800/30 backdrop-blur-sm rounded-xl p-6 border border-amber-500/30">
              <p className="text-amber-100 mb-4">
                This is a beta experience. Your choices will shape how the Oracle connects with you.
              </p>
              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => setCurrentStep('voice_choice')}
                  className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-3 rounded-lg transition-colors"
                >
                  Begin Configuration
                </button>
                <button
                  onClick={skipWithDefaults}
                  className="bg-gray-700 hover:bg-gray-600 text-gray-200 px-6 py-3 rounded-lg transition-colors"
                >
                  Use Defaults
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Voice Choice Step */}
        {currentStep === 'voice_choice' && (
          <div className="text-center space-y-8">
            <div className="space-y-4">
              <h2 className="text-3xl font-bold text-white">Choose Your Companion Voice</h2>
              <p className="text-amber-200">
                Select the voice that will guide your journey through the elements.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <button
                onClick={() => handleVoiceChoice('maya-alloy')}
                className="bg-amber-800/50 hover:bg-amber-700/50 backdrop-blur-sm rounded-xl p-8 border border-amber-500/50 transition-all group"
              >
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-amber-600 rounded-full flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                    <Heart className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-white">Maya</h3>
                  <p className="text-amber-200 text-sm">
                    Warm, intuitive presence. Maya speaks with gentle wisdom and emotional attunement.
                  </p>
                  <div className="text-xs text-amber-300">OpenAI Alloy Voice</div>
                </div>
              </button>

              <button
                onClick={() => handleVoiceChoice('anthony-onyx')}
                className="bg-blue-800/50 hover:bg-blue-700/50 backdrop-blur-sm rounded-xl p-8 border border-blue-500/50 transition-all group"
              >
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                    <Brain className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-white">Anthony</h3>
                  <p className="text-blue-200 text-sm">
                    Clear, grounded presence. Anthony offers practical wisdom and steady guidance.
                  </p>
                  <div className="text-xs text-blue-300">OpenAI Onyx Voice</div>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Voice Mode Step */}
        {currentStep === 'interaction_mode' && (
          <div className="text-center space-y-8">
            <div className="space-y-4">
              <h2 className="text-3xl font-bold text-white">How Do You Want to Connect?</h2>
              <p className="text-amber-200">
                Choose how you'd like to activate your conversations with the Oracle.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <button
                onClick={() => handleModeChoice('push-to-talk')}
                className="bg-gray-800/50 hover:bg-gray-700/50 backdrop-blur-sm rounded-xl p-8 border border-gray-500/50 transition-all"
              >
                <div className="text-center space-y-4">
                  <Mic className="w-12 h-12 text-gray-300 mx-auto" />
                  <h3 className="text-xl font-semibold text-white">Push-to-Talk</h3>
                  <p className="text-gray-200 text-sm">
                    Hold a button to speak, release to send. You control when to engage.
                  </p>
                </div>
              </button>

              <button
                onClick={() => handleModeChoice('wake-word')}
                className="bg-green-800/50 hover:bg-green-700/50 backdrop-blur-sm rounded-xl p-8 border border-green-500/50 transition-all"
              >
                <div className="text-center space-y-4">
                  <MicIcon className="w-12 h-12 text-green-300 mx-auto" />
                  <h3 className="text-xl font-semibold text-white">Wake Word</h3>
                  <p className="text-green-200 text-sm">
                    Say "Hello {voiceId === 'maya-alloy' ? 'Maya' : 'Anthony'}" to begin. Hands-free interaction.
                  </p>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* First Breath Step */}
        {currentStep === 'first_breath' && (
          <div className="text-center space-y-8">
            <div className="space-y-4">
              <h2 className="text-3xl font-bold text-white">Choose Your Journey Style</h2>
              <p className="text-amber-200">
                How would you like the Oracle to guide your exploration?
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <button
                onClick={() => handleInteractionChoice('conversational')}
                className="bg-green-800/50 hover:bg-green-700/50 backdrop-blur-sm rounded-xl p-6 border border-green-500/50 transition-all"
              >
                <div className="text-center space-y-3">
                  <div className="text-2xl">🗣️</div>
                  <h3 className="text-lg font-semibold text-white">Conversational</h3>
                  <p className="text-green-200 text-xs">Natural back-and-forth dialogue</p>
                </div>
              </button>

              <button
                onClick={() => handleInteractionChoice('meditative')}
                className="bg-blue-800/50 hover:bg-blue-700/50 backdrop-blur-sm rounded-xl p-6 border border-blue-500/50 transition-all"
              >
                <div className="text-center space-y-3">
                  <div className="text-2xl">🧘</div>
                  <h3 className="text-lg font-semibold text-white">Meditative</h3>
                  <p className="text-blue-200 text-xs">Gentle presence with longer pauses</p>
                </div>
              </button>

              <button
                onClick={() => handleInteractionChoice('guided')}
                className="bg-amber-800/50 hover:bg-amber-700/50 backdrop-blur-sm rounded-xl p-6 border border-amber-500/50 transition-all"
              >
                <div className="text-center space-y-3">
                  <div className="text-2xl">🌟</div>
                  <h3 className="text-lg font-semibold text-white">Guided</h3>
                  <p className="text-amber-200 text-xs">Structured prompts and rituals</p>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Completion Step */}
        {currentStep === 'completion' && (
          <div className="text-center space-y-8">
            <div className="space-y-4">
              <Sparkles className="w-16 h-16 text-amber-300 mx-auto animate-pulse" />
              <h2 className="text-3xl font-bold text-white">Your Sacred Configuration</h2>
              <p className="text-amber-200">
                The Oracle is now attuned to your preferences. Your journey begins.
              </p>
            </div>

            <div className="bg-amber-800/30 backdrop-blur-sm rounded-xl p-6 border border-amber-500/30 space-y-4">
              <div className="text-amber-100">
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <div className="text-amber-300 mb-1">Voice</div>
                    <div className="font-semibold">
                      {voiceId === 'maya-alloy' ? 'Maya' : 'Anthony'}
                    </div>
                  </div>
                  <div>
                    <div className="text-amber-300 mb-1">Activation</div>
                    <div className="font-semibold">
                      {voiceMode === 'push-to-talk' ? 'Push-to-Talk' : 'Wake Word'}
                    </div>
                  </div>
                  <div>
                    <div className="text-amber-300 mb-1">Style</div>
                    <div className="font-semibold capitalize">
                      {interactionMode}
                    </div>
                  </div>
                </div>
              </div>

              <p className="text-amber-200 text-sm">
                You can always change these preferences later in your Oracle settings.
              </p>
            </div>

            <button
              onClick={completeRitual}
              className="bg-gradient-to-r from-amber-600 to-blue-600 hover:from-amber-700 hover:to-blue-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all transform hover:scale-105"
            >
              Enter the Oracle
            </button>
          </div>
        )}

        {/* Progress Indicator */}
        <div className="mt-12 flex justify-center space-x-2">
          {['welcome', 'voice_choice', 'interaction_mode', 'first_breath', 'completion'].map((step, index) => (
            <div
              key={step}
              className={`w-3 h-3 rounded-full transition-colors ${
                ['welcome', 'voice_choice', 'interaction_mode', 'first_breath', 'completion'].indexOf(currentStep) >= index
                  ? 'bg-amber-400'
                  : 'bg-amber-800'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default BetaRitualFlow;