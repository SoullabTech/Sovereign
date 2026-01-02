// @ts-nocheck
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Type, Send, Moon, Sunrise, Sparkles } from 'lucide-react';
import HybridInput from '@/components/chat/HybridInput';

interface MorningDreamCaptureProps {
  onDreamCaptured: (content: string, mode: 'voice' | 'text') => Promise<void>;
  isProcessing?: boolean;
  userName?: string;
}

export default function MorningDreamCaptureInterface({
  onDreamCaptured,
  isProcessing = false,
  userName = 'Dreamer'
}: MorningDreamCaptureProps) {
  const [captureMode, setCaptureMode] = useState<'voice' | 'text'>('voice'); // Default to voice for morning ease
  const [isRecording, setIsRecording] = useState(false);
  const [dreamContent, setDreamContent] = useState('');
  const [showWelcome, setShowWelcome] = useState(true);
  const [timeOfDay, setTimeOfDay] = useState<'early' | 'morning' | 'day'>('early');

  const hybridInputRef = useRef<any>(null);

  // Determine time of day for personalized greeting
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 7) setTimeOfDay('early');
    else if (hour >= 7 && hour < 11) setTimeOfDay('morning');
    else setTimeOfDay('day');
  }, []);

  const handleDreamSubmission = async (content: string) => {
    if (!content.trim() || isProcessing) return;

    await onDreamCaptured(content, captureMode);
    setDreamContent('');
    setShowWelcome(false);
  };

  const welcomeMessage = {
    early: `Good early morning, ${userName}. The veil between worlds is still thin...`,
    morning: `Good morning, ${userName}. What wisdom did your dreams bring?`,
    day: `Hello ${userName}. Still catching dream fragments? Perfect timing...`
  };

  const voicePlaceholder = {
    early: "Speak softly... what do you remember?",
    morning: "Tell MAIA about your dream journey...",
    day: "Share whatever fragments you recall..."
  };

  const textPlaceholder = {
    early: "Type quietly... any memory, however small...",
    morning: "Write your dream memories here...",
    day: "Capture those lingering dream pieces..."
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 text-white relative overflow-hidden">
      {/* Gentle morning ambiance */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-radial from-blue-800/20 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-indigo-900/40 via-transparent to-transparent" />

        {/* Floating dream particles */}
        <motion.div
          animate={{
            y: [-20, 20, -20],
            x: [-10, 10, -10],
            opacity: [0.3, 0.7, 0.3]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/4 left-1/4 w-2 h-2 bg-blue-400/40 rounded-full"
        />
        <motion.div
          animate={{
            y: [15, -15, 15],
            x: [20, -20, 20],
            opacity: [0.2, 0.6, 0.2]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute top-3/4 right-1/3 w-1.5 h-1.5 bg-indigo-300/50 rounded-full"
        />
      </div>

      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header with time-appropriate greeting */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-6 py-8"
        >
          <div className="max-w-2xl mx-auto text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              {timeOfDay === 'early' ? (
                <Moon className="w-8 h-8 text-blue-300" />
              ) : (
                <Sunrise className="w-8 h-8 text-amber-300" />
              )}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="w-2 h-2 bg-blue-400 rounded-full"
              />
            </div>

            <AnimatePresence mode="wait">
              {showWelcome && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="space-y-2"
                >
                  <h1 className="text-2xl font-light text-blue-100 tracking-wide">
                    {welcomeMessage[timeOfDay]}
                  </h1>
                  <p className="text-blue-300/80 text-sm font-light">
                    Choose your preferred way to capture the dream wisdom
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.header>

        {/* Mode Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-6 mb-8"
        >
          <div className="max-w-2xl mx-auto">
            <div className="flex gap-4 p-2 bg-slate-800/50 rounded-2xl backdrop-blur-sm border border-slate-700/30">
              <motion.button
                onClick={() => setCaptureMode('voice')}
                whileTap={{ scale: 0.98 }}
                className={`flex-1 flex items-center justify-center gap-3 px-6 py-4 rounded-xl transition-all duration-300 ${
                  captureMode === 'voice'
                    ? 'bg-blue-600/80 shadow-lg shadow-blue-600/25 text-white'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                <Mic className="w-5 h-5" />
                <span className="font-medium">Speak to MAIA</span>
                {captureMode === 'voice' && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-2 h-2 bg-blue-300 rounded-full"
                  />
                )}
              </motion.button>

              <motion.button
                onClick={() => setCaptureMode('text')}
                whileTap={{ scale: 0.98 }}
                className={`flex-1 flex items-center justify-center gap-3 px-6 py-4 rounded-xl transition-all duration-300 ${
                  captureMode === 'text'
                    ? 'bg-indigo-600/80 shadow-lg shadow-indigo-600/25 text-white'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                <Type className="w-5 h-5" />
                <span className="font-medium">Type to MAIA</span>
                {captureMode === 'text' && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-2 h-2 bg-indigo-300 rounded-full"
                  />
                )}
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Dream Capture Interface */}
        <div className="flex-1 px-6 pb-8">
          <div className="max-w-2xl mx-auto">
            <motion.div
              key={captureMode}
              initial={{ opacity: 0, x: captureMode === 'voice' ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4 }}
              className="relative"
            >
              {/* Background for input area */}
              <div className="absolute inset-0 bg-gradient-to-br from-slate-800/60 to-slate-900/60 rounded-2xl backdrop-blur-sm border border-slate-700/30" />
              <div className="absolute inset-0 bg-gradient-to-t from-blue-900/20 to-transparent rounded-2xl" />

              <div className="relative p-6">
                {/* Mode-specific guidance */}
                <div className="mb-6 text-center">
                  <motion.div
                    animate={{ opacity: [0.7, 1, 0.7] }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="flex items-center justify-center gap-2 mb-3"
                  >
                    <Sparkles className="w-4 h-4 text-blue-400" />
                    <span className="text-sm text-blue-300 font-light tracking-wide">
                      {captureMode === 'voice' ? 'Voice Dream Capture' : 'Text Dream Capture'}
                    </span>
                    <Sparkles className="w-4 h-4 text-blue-400" />
                  </motion.div>

                  {captureMode === 'voice' ? (
                    <div className="space-y-2">
                      <p className="text-slate-300 text-sm font-light">
                        Tap the microphone and speak naturally. MAIA will listen for:
                      </p>
                      <div className="text-xs text-slate-400 space-x-4">
                        <span>• Emotions & feelings</span>
                        <span>• Symbols & imagery</span>
                        <span>• Body sensations</span>
                        <span>• Any recognition</span>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-slate-300 text-sm font-light">
                        Type your dream memories. Include whatever feels important:
                      </p>
                      <div className="text-xs text-slate-400 space-x-4">
                        <span>• Stream of consciousness</span>
                        <span>• Key images</span>
                        <span>• Emotional tone</span>
                        <span>• Fragments</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Hybrid Input Component */}
                <HybridInput
                  ref={hybridInputRef}
                  onSend={handleDreamSubmission}
                  onTranscript={(transcript) => setDreamContent(transcript)}
                  disabled={isProcessing}
                  placeholder={captureMode === 'voice'
                    ? voicePlaceholder[timeOfDay]
                    : textPlaceholder[timeOfDay]
                  }
                  variant="dream-capture"
                  preferredMode={captureMode}
                  showModeToggle={false} // Hide since we have our own mode selector
                  className="dream-input"
                  autoFocus={captureMode === 'text'}
                />

                {/* Processing indicator */}
                {isProcessing && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 flex items-center justify-center gap-3 text-blue-300"
                  >
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      className="w-5 h-5 border-2 border-blue-400/30 border-t-blue-400 rounded-full"
                    />
                    <span className="text-sm font-light">
                      MAIA is weaving the dream threads...
                    </span>
                  </motion.div>
                )}

                {/* Quick tips */}
                <div className="mt-6 p-4 bg-slate-700/30 rounded-xl border border-slate-600/20">
                  <h4 className="text-sm font-medium text-slate-200 mb-2 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
                    Dream Capture Tips
                  </h4>
                  <div className="text-xs text-slate-400 space-y-1">
                    <p>• Don't worry about perfect recall - fragments are valuable</p>
                    <p>• Include how you felt during and after the dream</p>
                    <p>• Note any unusual or symbolic elements</p>
                    <p>• Mention if anything felt familiar or significant</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Footer with quick actions */}
        <motion.footer
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-6 py-4 border-t border-slate-700/30 bg-slate-900/50 backdrop-blur-sm"
        >
          <div className="max-w-2xl mx-auto flex items-center justify-between">
            <div className="text-xs text-slate-400">
              {captureMode === 'voice' ? 'Tap mic to record' : 'Type and press Enter'}
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span>Switch anytime</span>
              <div className="w-1 h-1 bg-slate-500 rounded-full" />
              <span>Both modes work with MAIA</span>
            </div>
          </div>
        </motion.footer>
      </div>

      <style jsx>{`
        .dream-input textarea {
          background: rgba(30, 41, 59, 0.5) !important;
          border: 1px solid rgba(71, 85, 105, 0.3) !important;
          border-radius: 12px !important;
          color: #e2e8f0 !important;
          font-size: 16px !important;
          line-height: 1.6 !important;
          min-height: 120px !important;
        }

        .dream-input textarea:focus {
          border-color: rgba(59, 130, 246, 0.5) !important;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1) !important;
        }

        .dream-input textarea::placeholder {
          color: rgba(148, 163, 184, 0.7) !important;
          font-style: italic;
        }
      `}</style>
    </div>
  );
}