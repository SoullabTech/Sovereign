'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useMaiaStore } from '@/lib/maia/state';
import { mockEntries } from '@/lib/maia/mockData';

import SoulfulAppShell from '@/components/onboarding/SoulfulAppShell';
import { MAIANavigation } from './sections/MAIANavigation';
import { MAIAMainContent } from './sections/MAIAMainContent';
import { MAIAModals } from './sections/MAIAModals';
import { VoiceControlBar } from '@/components/voice/VoiceControlBar';

/**
 * MAIA Experimental Gateway
 * Safe space to evolve visuals, flows, and interactions.
 *
 * This component uses modular architecture for maintainability
 * and can be freely modified to test new features, UI patterns,
 * and consciousness-responsive designs without affecting the sacred baseline.
 */
export default function MAIAExperimental() {
  const { currentView, entries } = useMaiaStore();

  console.log('🎯 [MAIA PAGE] Rendering with currentView:', currentView);
  const [userId] = useState('demo-user');
  const [showHelp, setShowHelp] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showSoulprint, setShowSoulprint] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [isDevMode, setIsDevMode] = useState(false);
  const [useVoiceMode, setUseVoiceMode] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const demo = params.get('demo');
      const dev = params.get('dev');

      if (demo === 'true') {
        setIsDemoMode(true);
      }
      if (dev === 'true') {
        setIsDevMode(true);
      }
    }
  }, []);

  useEffect(() => {
    if (isDemoMode && entries.length === 0) {
      mockEntries.forEach(entry => {
        useMaiaStore.setState((state) => ({
          entries: [...state.entries, entry]
        }));
      });
    }
  }, [isDemoMode, entries.length]);

  return (
    <SoulfulAppShell userId={userId}>
      <div className="min-h-screen bg-gradient-to-br from-jade-abyss via-jade-shadow to-jade-night">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <MAIANavigation
            entries={entries}
            currentView={currentView}
            onShowHelp={() => setShowHelp(!showHelp)}
            onShowSettings={() => setShowSettings(!showSettings)}
            onShowAnalytics={() => setShowAnalytics(!showAnalytics)}
            onShowSoulprint={() => setShowSoulprint(!showSoulprint)}
          />

          <MAIAMainContent />

          {/* Voice Controls for Oracle conversation */}
          {currentView === 'oracle-conversation' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-6 flex items-center justify-center"
            >
              <VoiceControlBar
                isRecording={isRecording}
                isSpeaking={isSpeaking}
                onToggleMic={() => setIsRecording((prev) => !prev)}
                onToggleSpeaking={() => setIsSpeaking((prev) => !prev)}
              />
            </motion.div>
          )}

          {entries.length === 0 && !isDemoMode && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
              className="fixed bottom-6 right-6 flex flex-col gap-2"
            >
              <button
                onClick={() => setIsDemoMode(true)}
                className="px-4 py-2 bg-violet-600 text-white rounded-full text-sm font-medium hover:bg-violet-700 transition-colors shadow-lg"
              >
                Load Demo Entries
              </button>
            </motion.div>
          )}

          {isDevMode && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="fixed top-20 right-6 p-3 bg-amber-100 dark:bg-amber-900 rounded-lg border border-amber-300 dark:border-amber-700 text-xs"
            >
              <div className="font-bold mb-1">Dev Mode</div>
              <div>Entries: {entries.length}</div>
              <div>View: {currentView}</div>
              <label className="flex items-center gap-2 mt-2">
                <input
                  type="checkbox"
                  checked={useVoiceMode}
                  onChange={(e) => setUseVoiceMode(e.target.checked)}
                  className="rounded"
                />
                Voice Mode
              </label>
            </motion.div>
          )}

          <MAIAModals
            showHelp={showHelp}
            showSettings={showSettings}
            showAnalytics={showAnalytics}
            showSoulprint={showSoulprint}
            isDevMode={isDevMode}
            userId={userId}
            onCloseHelp={() => setShowHelp(false)}
            onCloseSettings={() => setShowSettings(false)}
            onCloseAnalytics={() => setShowAnalytics(false)}
            onCloseSoulprint={() => setShowSoulprint(false)}
          />
        </div>
      </div>
    </SoulfulAppShell>
  );
}