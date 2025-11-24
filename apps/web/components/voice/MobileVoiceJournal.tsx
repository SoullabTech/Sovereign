'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, PanInfo, useMotionValue, useTransform } from 'framer-motion';
import { useMayaVoice } from '@/hooks/useMayaVoice';
import { voiceJournalingService, VoiceJournalSession } from '@/lib/journaling/VoiceJournalingService';
import { JournalingMode } from '@/lib/journaling/JournalingPrompts';
import { Copy } from '@/lib/copy/MaiaCopy';
import { Mic, Pause, Play, Check, X, ChevronUp, ChevronDown, HelpCircle } from 'lucide-react';
import { trackJournalEntry, trackVoiceUsage } from '@/components/onboarding/FeatureDiscovery';
import SoulfulAppShell from '@/components/onboarding/SoulfulAppShell';

interface MobileVoiceJournalProps {
  userId: string;
  onSessionComplete?: (session: VoiceJournalSession) => void;
}

/**
 * Mobile-First Voice Journal
 * Optimized for one-handed use with large tap targets and swipe gestures
 */
export default function MobileVoiceJournal({ userId, onSessionComplete }: MobileVoiceJournalProps) {
  const [currentMode, setCurrentMode] = useState<JournalingMode | null>(null);
  const [currentElement, setCurrentElement] = useState<'fire' | 'water' | 'earth' | 'air' | 'aether'>('aether');
  const [activeSession, setActiveSession] = useState<VoiceJournalSession | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showModeSelector, setShowModeSelector] = useState(true);
  const [showElementSelector, setShowElementSelector] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);

  // Swipe for mode selection
  const y = useMotionValue(0);
  const opacity = useTransform(y, [-100, 0], [0, 1]);

  // Initialize Maya Voice System
  const mayaVoice = useMayaVoice({
    userId,
    characterId: `maya-${currentElement}`,
    element: currentElement,
    enableNudges: false,
    onResponse: (text) => {
      // Maya's response (if needed in future)
    },
    onError: (error) => {
      console.error('Voice error:', error);
      // Vibrate on error
      if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
    },
  });

  // Update session transcript
  useEffect(() => {
    if (activeSession && mayaVoice.transcript) {
      voiceJournalingService.updateTranscript(activeSession.id, mayaVoice.transcript);
    }
  }, [mayaVoice.transcript, activeSession]);

  // Haptic feedback helper
  const haptic = useCallback((pattern: number | number[] = 10) => {
    if (navigator.vibrate) {
      navigator.vibrate(pattern);
    }
  }, []);

  // Start journaling
  const startJournaling = async (mode: JournalingMode) => {
    haptic(50);
    setCurrentMode(mode);
    setShowModeSelector(false);
    setShowElementSelector(true);
  };

  // Begin recording
  const beginRecording = async () => {
    if (!currentMode) return;

    haptic([50, 100, 50]);
    setShowElementSelector(false);

    // Create session
    const session = voiceJournalingService.startSession(userId, currentMode, currentElement);
    setActiveSession(session);
    setSessionStartTime(new Date());

    // Start voice system
    await mayaVoice.start();

    // Track voice usage for progressive discovery
    trackVoiceUsage();
  };

  // Complete session
  const completeSession = async () => {
    if (!activeSession) return;

    haptic([100, 50, 100]);
    mayaVoice.stop();
    setIsAnalyzing(true);

    try {
      const finalSession = await voiceJournalingService.finalizeSession(activeSession.id);

      if (finalSession) {
        // Track journal entry for progressive discovery
        trackJournalEntry();
        onSessionComplete?.(finalSession);
      }

      // Clear and reset
      voiceJournalingService.clearSession(activeSession.id);
      setActiveSession(null);
      setCurrentMode(null);
      setShowModeSelector(true);
      setSessionStartTime(null);

    } catch (error: any) {
      console.error('Session completion failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Cancel session
  const cancelSession = () => {
    haptic(100);
    if (activeSession) {
      voiceJournalingService.clearSession(activeSession.id);
      setActiveSession(null);
    }
    mayaVoice.stop();
    setCurrentMode(null);
    setShowModeSelector(true);
    setShowElementSelector(false);
    setSessionStartTime(null);
  };

  // Toggle pause/resume
  const togglePauseResume = () => {
    haptic(30);
    if (mayaVoice.isPaused) {
      mayaVoice.resume();
    } else {
      mayaVoice.pause();
    }
  };

  // Calculate duration
  const duration = sessionStartTime
    ? Math.floor((Date.now() - sessionStartTime.getTime()) / 1000)
    : 0;

  const mins = Math.floor(duration / 60);
  const secs = duration % 60;

  return (
    <SoulfulAppShell userId={userId}>
    <div className="fixed inset-0 bg-gradient-to-b from-indigo-50 via-purple-50 to-pink-50 dark:from-neutral-950 dark:via-indigo-950 dark:to-purple-950 overflow-hidden">
      {/* Mode Selector */}
      <AnimatePresence>
        {showModeSelector && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute inset-0 flex flex-col p-6 safe-area-inset"
          >
            {/* Header */}
            <div className="text-center mb-8 mt-12">
              <motion.h1
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-3xl font-bold mb-2"
              >
                {Copy.welcome}
              </motion.h1>
              <p className="text-neutral-600 dark:text-neutral-400">
                {Copy.introPrompt}
              </p>
            </div>

            {/* Help Button */}
            <button
              onClick={() => {
                haptic(10);
                setShowHelp(true);
              }}
              className="absolute top-6 right-6 p-3 rounded-full bg-white/50 dark:bg-neutral-900/50 backdrop-blur-sm"
            >
              <HelpCircle className="w-5 h-5" />
            </button>

            {/* Mode Cards */}
            <div className="flex-1 overflow-y-auto space-y-4 pb-24">
              {(Object.entries(Copy.modes) as [JournalingMode, typeof Copy.modes[JournalingMode]][]).map(([key, mode]) => (
                <motion.button
                  key={key}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => startJournaling(key)}
                  className="w-full p-6 bg-white dark:bg-neutral-900 rounded-2xl shadow-lg text-left active:shadow-xl transition-shadow"
                >
                  <h3 className="text-xl font-semibold mb-2">{mode.name}</h3>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-3">
                    {mode.description}
                  </p>
                  <p className="text-xs text-indigo-600 dark:text-indigo-400 italic">
                    "{mode.hint}"
                  </p>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Element Selector */}
      <AnimatePresence>
        {showElementSelector && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute inset-0 flex flex-col p-6 safe-area-inset"
          >
            <div className="text-center mb-8 mt-12">
              <h2 className="text-2xl font-bold mb-2">Choose Your Element</h2>
              <p className="text-neutral-600 dark:text-neutral-400">
                This shapes MAIA's voice and energy
              </p>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pb-24">
              {(Object.entries(Copy.elements) as [string, typeof Copy.elements.fire][]).map(([key, element]) => (
                <motion.button
                  key={key}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    haptic(30);
                    setCurrentElement(key as any);
                  }}
                  className={`w-full p-6 rounded-2xl shadow-lg text-left transition-all ${
                    currentElement === key
                      ? 'bg-indigo-500 text-white scale-105'
                      : 'bg-white dark:bg-neutral-900'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <span className="text-4xl">{element.emoji}</span>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold">{element.name}</h3>
                      <p className={`text-sm ${
                        currentElement === key
                          ? 'text-white/80'
                          : 'text-neutral-600 dark:text-neutral-400'
                      }`}>
                        {element.description}
                      </p>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>

            {/* Bottom Actions */}
            <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-white dark:from-neutral-950 safe-area-inset-bottom">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={beginRecording}
                className="w-full py-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-full font-semibold text-lg shadow-lg active:shadow-xl"
              >
                {Copy.buttons.startJournaling}
              </motion.button>
              <button
                onClick={cancelSession}
                className="w-full mt-3 py-2 text-neutral-600 dark:text-neutral-400"
              >
                {Copy.buttons.maybeLater}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Recording Interface */}
      <AnimatePresence>
        {mayaVoice.isActive && currentMode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex flex-col"
          >
            {/* Header with mode */}
            <div className="p-6 text-center safe-area-inset-top">
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">
                {Copy.modes[currentMode].name}
              </p>
              <h2 className="text-xl font-semibold">
                {mayaVoice.isListening ? Copy.voice.speaking :
                 mayaVoice.isPaused ? Copy.voice.paused :
                 Copy.voice.processing}
              </h2>
            </div>

            {/* Center: Visual feedback */}
            <div className="flex-1 flex items-center justify-center">
              <motion.div
                animate={{
                  scale: mayaVoice.isListening ? [1, 1.1, 1] : 1,
                  opacity: mayaVoice.isPaused ? 0.3 : 1,
                }}
                transition={{
                  duration: mayaVoice.isListening ? 2 : 0.3,
                  repeat: mayaVoice.isListening ? Infinity : 0,
                }}
                className={`w-48 h-48 rounded-full flex items-center justify-center ${
                  mayaVoice.isListening
                    ? 'bg-gradient-to-br from-indigo-500 to-purple-500'
                    : mayaVoice.isPaused
                    ? 'bg-neutral-300 dark:bg-neutral-700'
                    : 'bg-gradient-to-br from-blue-500 to-cyan-500'
                }`}
              >
                <Mic className="w-24 h-24 text-white" />
              </motion.div>
            </div>

            {/* Stats */}
            <div className="px-6 mb-4 text-center">
              <div className="flex justify-center gap-6 text-sm text-neutral-600 dark:text-neutral-400">
                <span>{Copy.voice.wordCount(mayaVoice.transcript.split(/\s+/).filter(w => w).length)}</span>
                <span>•</span>
                <span>{Copy.voice.duration(mins, secs)}</span>
              </div>
            </div>

            {/* Transcript Preview */}
            {mayaVoice.transcript && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mx-6 mb-4 p-4 bg-white/50 dark:bg-neutral-900/50 backdrop-blur-md rounded-2xl max-h-32 overflow-y-auto"
              >
                <p className="text-sm text-neutral-700 dark:text-neutral-300">
                  {mayaVoice.transcript}
                </p>
              </motion.div>
            )}

            {/* Hints */}
            <div className="px-6 mb-4 text-center">
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                {mayaVoice.isPaused ? Copy.voice.resumeHint : Copy.voice.pauseHint}
              </p>
            </div>

            {/* Bottom Controls */}
            <div className="p-6 pb-8 bg-gradient-to-t from-white dark:from-neutral-950 safe-area-inset-bottom">
              <div className="flex gap-4">
                {/* Cancel */}
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={cancelSession}
                  disabled={isAnalyzing}
                  className="w-16 h-16 rounded-full bg-red-500 text-white flex items-center justify-center shadow-lg active:shadow-xl disabled:opacity-50"
                >
                  <X className="w-8 h-8" />
                </motion.button>

                {/* Pause/Resume */}
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={togglePauseResume}
                  disabled={isAnalyzing}
                  className="flex-1 h-16 rounded-full bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center gap-3 font-semibold shadow-lg active:shadow-xl disabled:opacity-50"
                >
                  {mayaVoice.isPaused ? (
                    <>
                      <Play className="w-6 h-6" />
                      {Copy.buttons.resume}
                    </>
                  ) : (
                    <>
                      <Pause className="w-6 h-6" />
                      {Copy.buttons.pause}
                    </>
                  )}
                </motion.button>

                {/* Complete */}
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={completeSession}
                  disabled={isAnalyzing}
                  className="w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 text-white flex items-center justify-center shadow-lg active:shadow-xl disabled:opacity-50"
                >
                  {isAnalyzing ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    >
                      <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full" />
                    </motion.div>
                  ) : (
                    <Check className="w-8 h-8" />
                  )}
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Help Modal */}
      <AnimatePresence>
        {showHelp && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowHelp(false)}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end"
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full bg-white dark:bg-neutral-900 rounded-t-3xl p-6 safe-area-inset-bottom max-h-[80vh] overflow-y-auto"
            >
              <div className="w-12 h-1 bg-neutral-300 dark:bg-neutral-700 rounded-full mx-auto mb-6" />

              <h2 className="text-2xl font-bold mb-4">{Copy.modal.whatIsMaiaTitle}</h2>
              <p className="text-neutral-700 dark:text-neutral-300 mb-6">
                {Copy.modal.whatIsMaiaText}
              </p>

              <div className="space-y-4">
                {Object.entries(Copy.help).slice(1).map(([key, value]) => (
                  <button
                    key={key}
                    className="w-full p-4 bg-neutral-100 dark:bg-neutral-800 rounded-xl text-left hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
                  >
                    {value}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setShowHelp(false)}
                className="w-full mt-6 py-3 bg-indigo-500 text-white rounded-full font-semibold"
              >
                Got it
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
    </SoulfulAppShell>
  );
}