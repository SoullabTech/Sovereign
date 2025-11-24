'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useMayaVoice } from '@/hooks/useMayaVoice';
import { MayaVoicePanel } from './MayaVoiceIndicator';
import { voiceJournalingService, VoiceJournalSession } from '@/lib/journaling/VoiceJournalingService';
import { JournalingMode, JOURNALING_MODES } from '@/lib/journaling/JournalingPrompts';
import { Sparkles, BookOpen, Check, X } from 'lucide-react';
import VoiceConversationLayout from './VoiceConversationLayout';
import ElementSelector, { Element } from './ElementSelector';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

/**
 * Maya Voice Journal - Voice-First Journaling with Symbolic Analysis
 * Combines continuous voice input with journaling analysis and soulprint updates
 */
export default function MayaVoiceJournal() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentMode, setCurrentMode] = useState<JournalingMode>('freewrite');
  const [currentElement, setCurrentElement] = useState<Element>('aether');
  const [activeSession, setActiveSession] = useState<VoiceJournalSession | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showModeSelector, setShowModeSelector] = useState(true);

  const userId = 'beta-user';

  // Initialize Maya Voice System
  const mayaVoice = useMayaVoice({
    userId,
    characterId: `maya-${currentElement}`,
    element: currentElement,
    enableNudges: false,
    onResponse: (text) => {
      // Add Maya's guidance to chat
      addMessage('assistant', text);
    },
    onError: (error) => {
      console.error('Voice error:', error);
      addMessage('system', `Voice error: ${error}`);
    },
  });

  // Update session transcript as user speaks
  useEffect(() => {
    if (activeSession && mayaVoice.transcript) {
      voiceJournalingService.updateTranscript(activeSession.id, mayaVoice.transcript);
    }
  }, [mayaVoice.transcript, activeSession]);

  // Helper to add messages
  const addMessage = (role: Message['role'], content: string) => {
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      role,
      content,
      timestamp: new Date(),
    }]);
  };

  // Start journaling session
  const startJournaling = async () => {
    setShowModeSelector(false);

    // Create session
    const session = voiceJournalingService.startSession(userId, currentMode, currentElement);
    setActiveSession(session);

    // Get journaling prompt
    const mode = JOURNALING_MODES[currentMode];
    addMessage('system', `Starting ${mode.name} session...`);
    addMessage('assistant', mode.prompt);

    // Start voice system
    await mayaVoice.start();
  };

  // End journaling session
  const endJournaling = async () => {
    if (!activeSession) return;

    // Stop voice
    mayaVoice.stop();

    setIsAnalyzing(true);
    addMessage('system', 'Analyzing your journal entry...');

    try {
      // Finalize and analyze session
      const finalSession = await voiceJournalingService.finalizeSession(activeSession.id);

      if (finalSession?.analysis) {
        // Show analysis results
        addMessage('assistant', finalSession.analysis.reflection);

        if (finalSession.analysis.symbols && finalSession.analysis.symbols.length > 0) {
          const symbolsText = `✨ Symbols detected: ${finalSession.analysis.symbols.join(', ')}`;
          addMessage('system', symbolsText);
        }

        if (finalSession.analysis.transformationScore) {
          addMessage('system', `🌟 Transformation score: ${finalSession.analysis.transformationScore}%`);
        }

        // Show session stats
        const stats = `Session complete: ${finalSession.wordCount} words, ${Math.floor(finalSession.duration! / 60)}:${(finalSession.duration! % 60).toString().padStart(2, '0')} duration`;
        addMessage('system', stats);
      } else {
        addMessage('system', 'Session saved. Add more content for deeper analysis.');
      }

      // Clear session
      voiceJournalingService.clearSession(activeSession.id);
      setActiveSession(null);
      setShowModeSelector(true);

    } catch (error: any) {
      console.error('Failed to finalize session:', error);
      addMessage('system', `Analysis failed: ${error.message}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Cancel session
  const cancelJournaling = () => {
    if (activeSession) {
      voiceJournalingService.clearSession(activeSession.id);
      setActiveSession(null);
    }
    mayaVoice.stop();
    setShowModeSelector(true);
    addMessage('system', 'Session cancelled');
  };

  const renderJournalMessage = (message: Message) => {
    if (message.role === 'system') {
      return (
        <div className="text-center">
          <p className="text-xs text-neutral-500 dark:text-neutral-400 italic">
            {message.content}
          </p>
        </div>
      );
    }

    if (message.role === 'assistant') {
      return (
        <div className="flex gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1 bg-white dark:bg-neutral-800 rounded-2xl p-4 shadow-sm">
            <p className="text-sm text-neutral-700 dark:text-neutral-300">{message.content}</p>
            <p className="text-xs text-neutral-400 mt-2">
              {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="flex justify-end">
        <div className="max-w-[80%] bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-4 text-white shadow-sm">
          <p className="text-sm">{message.content}</p>
          <p className="text-xs opacity-70 mt-2">
            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
      </div>
    );
  };

  return (
    <VoiceConversationLayout
      title="Maya Voice Journal"
      subtitle="Speak your truth, discover your symbols"
      messages={messages}
      renderMessage={renderJournalMessage}

    >
      {showModeSelector && !mayaVoice.isActive && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm z-50"
        >
          <div className="max-w-2xl w-full mx-4 bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl p-8">
            <h2 className="text-2xl font-bold text-center mb-2">Choose Your Journaling Mode</h2>
            <p className="text-center text-neutral-600 dark:text-neutral-400 mb-6">
              Select how you'd like to explore your inner landscape
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {(Object.entries(JOURNALING_MODES) as [JournalingMode, typeof JOURNALING_MODES[JournalingMode]][]).map(([key, mode]) => (
                <button
                  key={key}
                  onClick={() => setCurrentMode(key)}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    currentMode === key
                      ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950'
                      : 'border-neutral-200 dark:border-neutral-700 hover:border-indigo-300'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{mode.icon}</span>
                    <div>
                      <h3 className="font-semibold text-sm">{mode.name}</h3>
                      <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">
                        {mode.description}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Choose Your Element</label>
              <ElementSelector
                value={currentElement}
                onChange={setCurrentElement}
                size="lg"
              />
            </div>

            <button
              onClick={startJournaling}
              className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg font-semibold hover:from-indigo-600 hover:to-purple-600 transition-all"
            >
              Begin Voice Journaling
            </button>
          </div>
        </motion.div>
      )}

      {mayaVoice.isActive && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="border-t border-indigo-200 dark:border-indigo-800 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm"
        >
          <div className="max-w-4xl mx-auto px-6 py-4">
            <MayaVoicePanel
              state={mayaVoice.state}
              onStart={mayaVoice.start}
              onStop={endJournaling}
              onPause={mayaVoice.pause}
              onResume={mayaVoice.resume}
              transcript={mayaVoice.transcript}
              nudgesEnabled={mayaVoice.nudgesEnabled}
              onToggleNudges={mayaVoice.toggleNudges}
            />

            <div className="flex gap-3 mt-4">
              <button
                onClick={endJournaling}
                disabled={isAnalyzing}
                className="flex-1 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4" />
                {isAnalyzing ? 'Analyzing...' : 'Complete & Analyze'}
              </button>
              <button
                onClick={cancelJournaling}
                disabled={isAnalyzing}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {activeSession && (
              <div className="mt-4 p-3 bg-indigo-50 dark:bg-indigo-950 rounded-lg">
                <div className="flex justify-between text-xs text-indigo-600 dark:text-indigo-400">
                  <span>Words: {mayaVoice.transcript.split(/\s+/).filter(w => w.length > 0).length}</span>
                  <span>Mode: {JOURNALING_MODES[currentMode].name}</span>
                  <span>Element: {currentElement}</span>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </VoiceConversationLayout>
  );
}