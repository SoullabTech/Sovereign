'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Send, Sparkles, ArrowLeft } from 'lucide-react';
import { Copy } from '@/lib/copy/MaiaCopy';
import { useMaiaStore } from '@/lib/maia/state';
import { getJournalingPrompt } from '@/lib/journaling/JournalingPrompts';
import { JOURNALING_MODE_DESCRIPTIONS } from '@/lib/journaling/JournalingPrompts';
import ConsciousnessVessel from '@/components/consciousness/ConsciousnessVessel';
import ConsciousnessRipple from '@/components/consciousness/ConsciousnessRipple';
import WritingConsciousness from '@/components/consciousness/WritingConsciousness';
import NeuralFireSystem from '@/components/consciousness/NeuralFireSystem';

interface VoiceRecognition {
  start: () => void;
  stop: () => void;
  abort: () => void;
  continuous: boolean;
  interimResults: boolean;
  onresult: (event: any) => void;
  onerror: (event: any) => void;
  onend: () => void;
}

export default function VoiceJournaling() {
  const { selectedMode, currentEntry, setEntry, addEntry, setProcessing, isProcessing, resetEntry } = useMaiaStore();
  const [isListening, setIsListening] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isSupported, setIsSupported] = useState(false);
  const [consciousnessLevel, setConsciousnessLevel] = useState(0);
  const [voiceRhythm, setVoiceRhythm] = useState(0);
  const [consciousnessRipples, setConsciousnessRipples] = useState<{
    id: string;
    x: number;
    y: number;
    variant: 'jade' | 'neural' | 'mystical' | 'transcendent';
    timestamp: number;
  }[]>([]);

  const recognitionRef = useRef<VoiceRecognition | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Consciousness ripple creation
  const createConsciousnessRipple = useCallback((x: number, y: number, variant: 'jade' | 'neural' | 'mystical' | 'transcendent' = 'mystical') => {
    const ripple = {
      id: `voice-ripple-${Date.now()}-${Math.random()}`,
      x,
      y,
      variant,
      timestamp: Date.now()
    };

    setConsciousnessRipples(prev => [...prev, ripple]);

    setTimeout(() => {
      setConsciousnessRipples(prev => prev.filter(r => r.id !== ripple.id));
    }, 3000);
  }, []);

  // Get mode-specific consciousness variant
  const getModeVariant = (mode: string) => {
    switch (mode) {
      case 'free': return 'jade';
      case 'shadow': return 'neural';
      case 'dream': return 'mystical';
      case 'emotional': return 'jade';
      case 'direction': return 'transcendent';
      default: return 'jade';
    }
  };

  // Handle consciousness level changes
  const handleConsciousnessChange = useCallback((level: number) => {
    setConsciousnessLevel(level);
  }, []);

  // Handle voice rhythm changes
  const handleRhythmChange = useCallback((rhythm: number) => {
    setVoiceRhythm(rhythm);
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      setIsSupported(!!SpeechRecognition);

      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = (event: any) => {
          let interimTranscript = '';
          let finalTranscript = '';

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalTranscript += transcript + ' ';
            } else {
              interimTranscript += transcript;
            }
          }

          if (finalTranscript) {
            setEntry(currentEntry + finalTranscript);
          }
        };

        recognition.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
          if (event.error === 'no-speech' || event.error === 'aborted') {
            return;
          }
          setIsListening(false);
        };

        recognition.onend = () => {
          if (isListening) {
            recognition.start();
          }
        };

        recognitionRef.current = recognition;
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (currentEntry) {
      setWordCount(currentEntry.trim().split(/\s+/).filter(Boolean).length);
    } else {
      setWordCount(0);
    }
  }, [currentEntry]);

  useEffect(() => {
    if (isListening) {
      timerRef.current = setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isListening]);

  const toggleListening = () => {
    if (!recognitionRef.current || !isSupported) return;

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
        setDuration(0);
      } catch (error) {
        console.error('Failed to start recognition:', error);
      }
    }
  };

  const handleSubmit = async () => {
    if (!currentEntry.trim() || !selectedMode) return;

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    }

    setProcessing(true);

    try {
      const prompt = getJournalingPrompt(selectedMode, {
        mode: selectedMode,
        entry: currentEntry
      });

      const response = await fetch('/api/journal/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          mode: selectedMode,
          entry: currentEntry,
          userId: 'current-user',
          enableMemory: true
        })
      });

      if (!response.ok) throw new Error('Failed to analyze');

      const reflection = await response.json();

      addEntry({
        id: Date.now().toString(),
        userId: 'current-user',
        mode: selectedMode,
        content: currentEntry,
        reflection,
        timestamp: new Date(),
        wordCount,
        duration,
        isVoice: true
      });

      setDuration(0);
    } catch (error) {
      console.error('Failed to submit entry:', error);
      setProcessing(false);
    }
  };

  if (!selectedMode) return null;

  const modeInfo = JOURNALING_MODE_DESCRIPTIONS[selectedMode];

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const modeVariant = getModeVariant(selectedMode);

  return (
    <>
      {/* Neural Fire Background - Responds to Voice */}
      <NeuralFireSystem
        isActive={true}
        density={isListening ? 'dense' : (consciousnessLevel > 0.5 ? 'moderate' : 'sparse')}
        firingRate={isListening ? 'fast' : (voiceRhythm > 20 ? 'moderate' : 'slow')}
        variant="mystical"
        className={`fixed inset-0 z-0 ${isListening ? 'opacity-40' : 'opacity-20'}`}
      />

      {/* Voice Consciousness System */}
      <WritingConsciousness
        content={currentEntry}
        isWriting={isListening}
        onRhythmChange={handleRhythmChange}
        onConsciousnessChange={handleConsciousnessChange}
        className="fixed inset-0 z-10"
      />

      {/* Main Voice Interface */}
      <div className="relative z-20 min-h-screen bg-gradient-to-br from-jade-abyss via-jade-shadow to-jade-night">
        {/* Atmospheric Background */}
        <div className="absolute inset-0 bg-gradient-radial from-jade-forest/5 via-transparent to-jade-abyss/30" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-jade-copper/5 via-transparent to-transparent" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 max-w-6xl mx-auto p-8"
        >
          {/* Sacred Header with Voice Mode Information */}
          <div className="mb-12">
            <div className="flex items-center justify-between mb-8">
              <motion.button
                onClick={resetEntry}
                className="group flex items-center gap-3 px-4 py-2 rounded-xl bg-jade-shadow/40 border border-jade-sage/30 backdrop-blur-lg hover:bg-jade-sage/20 transition-all duration-300"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <ArrowLeft className="w-4 h-4 text-jade-sage group-hover:text-jade-jade transition-colors" />
                <span className="text-sm text-jade-sage group-hover:text-jade-jade transition-colors">Sacred Return</span>
              </motion.button>

              {/* Voice Mode Consciousness Vessel */}
              <ConsciousnessVessel
                title={modeInfo.name}
                subtitle={`${wordCount} words • ${formatDuration(duration)}`}
                variant={modeVariant}
                depth="profound"
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  createConsciousnessRipple(rect.left + rect.width/2, rect.top + rect.height/2, modeVariant as any);
                }}
                className="w-48"
              >
                <div className="text-center">
                  {/* Sacred Voice Portal */}
                  <div className="relative w-12 h-12 mx-auto mb-2">
                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-jade-sage/40 to-jade-jade/60 backdrop-blur-sm border border-jade-jade/50" />
                    <div className="absolute inset-1 rounded-full bg-jade-shadow/30 border border-jade-sage/40" />
                    <motion.div
                      className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-jade-jade"
                      animate={{
                        scale: isListening ? [1, 1.3, 1] : [1, 1.1, 1],
                        opacity: [0.8, 1, 0.8]
                      }}
                      transition={{
                        duration: isListening ? 0.8 : 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    />
                  </div>
                  <div className="text-xs text-jade-mineral mb-2">Voice Mode</div>
                  <div className="flex items-center justify-center gap-2">
                    <motion.div
                      className="w-2 h-2 rounded-full"
                      style={{
                        backgroundColor: isListening ? 'rgba(255,99,71,0.9)' : 'rgba(168,203,180,0.8)',
                        boxShadow: isListening ? '0 0 12px rgba(255,99,71,0.8)' : '0 0 8px rgba(168,203,180,0.6)'
                      }}
                      animate={{
                        scale: isListening ? [1, 1.2, 1] : 1,
                      }}
                      transition={{
                        duration: 0.5,
                        repeat: isListening ? Infinity : 0,
                        ease: "easeInOut"
                      }}
                    />
                    <span className="text-xs text-jade-sage">
                      {isListening ? 'Listening' : 'Ready'}
                    </span>
                  </div>
                </div>
              </ConsciousnessVessel>
            </div>

            {/* Voice Support Warning */}
            {!isSupported && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="relative mb-8"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/20 to-red-500/20 rounded-2xl backdrop-blur-sm" />
                <div className="absolute inset-0 border border-amber-500/30 rounded-2xl" />
                <div className="relative p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="relative w-8 h-8">
                      <div className="absolute inset-0 bg-amber-500/20 rounded-full" />
                      <div className="absolute top-1 left-1 bottom-1 right-1 bg-amber-500/40 rounded-full animate-pulse" />
                      <div className="absolute top-2 left-2 bottom-2 right-2 bg-amber-500 rounded-full" />
                    </div>
                    <h3 className="text-lg font-light text-amber-200 tracking-wide">Voice Portal Unavailable</h3>
                  </div>
                  <p className="text-amber-100/80 font-light leading-relaxed">
                    Voice recognition requires Chrome, Edge, or Safari. Your sacred words await the proper vessel.
                  </p>
                </div>
              </motion.div>
            )}

            {/* Sacred Prompt Vessel */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="relative mb-8"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-jade-copper/20 to-jade-shadow/40 rounded-2xl backdrop-blur-sm" />
              <div className="absolute inset-0 border border-jade-sage/30 rounded-2xl" />

              <div className="relative p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="relative w-8 h-8">
                    <div className="absolute inset-0 bg-jade-sage/20 rounded-full" />
                    <div className="absolute top-1 left-1 bottom-1 right-1 bg-jade-jade/40 rounded-full animate-pulse" />
                    <div className="absolute top-2 left-2 bottom-2 right-2 bg-jade-jade rounded-full" />
                  </div>
                  <h3 className="text-lg font-light text-jade-jade tracking-wide">Sacred Inquiry</h3>
                </div>
                <p className="text-jade-mineral font-light leading-relaxed italic">
                  "{modeInfo.prompt}"
                </p>
              </div>
            </motion.div>
          </div>

          {/* Sacred Voice Vessel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="relative"
          >
            {/* Voice Container */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-jade-shadow/60 via-jade-night/40 to-jade-obsidian/60 rounded-3xl backdrop-blur-xl" />
              <div
                className={`absolute inset-0 border rounded-3xl transition-all duration-500 ${
                  isListening
                    ? 'border-jade-jade shadow-lg shadow-jade-jade/20'
                    : 'border-jade-sage/40'
                }`}
              />

              {/* Voice Field Aura */}
              {isListening && (
                <motion.div
                  className="absolute inset-0 rounded-3xl"
                  style={{
                    background: `radial-gradient(circle, rgba(168,203,180,0.1) 0%, transparent 70%)`
                  }}
                  animate={{
                    opacity: [0.3, 0.7, 0.3],
                    scale: [1, 1.02, 1]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
              )}

              <div className="relative p-8">
                <textarea
                  value={currentEntry}
                  onChange={(e) => setEntry(e.target.value)}
                  placeholder={isListening ? "Your voice flows into consciousness..." : "Speak your truth or type your thoughts..."}
                  className="w-full min-h-[500px] bg-transparent border-none resize-none outline-none text-jade-light text-lg leading-relaxed placeholder:text-jade-shadow/60 font-light"
                  disabled={isListening}
                />

                {/* Voice Recording Indicator */}
                <AnimatePresence>
                  {isListening && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="absolute top-8 right-8 flex items-center gap-3"
                    >
                      <motion.div
                        animate={{ opacity: [0.4, 1, 0.4] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                        className="px-3 py-2 bg-red-500/20 border border-red-400/50 rounded-lg backdrop-blur-sm"
                      >
                        <span className="text-sm text-red-300 font-light">Recording</span>
                      </motion.div>
                      <motion.div
                        animate={{
                          scale: [1, 1.3, 1],
                          boxShadow: [
                            '0 0 0px rgba(255,99,71,0)',
                            '0 0 20px rgba(255,99,71,0.6)',
                            '0 0 0px rgba(255,99,71,0)'
                          ]
                        }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                        className="w-4 h-4 bg-red-500 rounded-full"
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Voice & Submit Consciousness Vessels */}
                <div className="absolute bottom-8 right-8 flex items-center gap-4">
                  {/* Submit Consciousness Vessel */}
                  <AnimatePresence>
                    {currentEntry.trim() && !isListening && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: 20 }}
                      >
                        <ConsciousnessVessel
                          title={isProcessing ? "Reflecting" : "Complete"}
                          subtitle={isProcessing ? "consciousness processing" : "ready for analysis"}
                          variant={isProcessing ? "mystical" : "transcendent"}
                          depth="transcendent"
                          onClick={!isProcessing ? (e) => {
                            handleSubmit();
                            const rect = e.currentTarget.getBoundingClientRect();
                            createConsciousnessRipple(rect.left + rect.width/2, rect.top + rect.height/2, 'transcendent');
                          } : undefined}
                          className={`${isProcessing ? 'cursor-wait' : 'cursor-pointer'} transition-all duration-300`}
                        >
                          <div className="text-center">
                            {isProcessing ? (
                              <div className="flex items-center justify-center gap-2">
                                <Sparkles className="w-5 h-5 animate-spin text-jade-jade" />
                                <span className="text-sm text-jade-jade">Processing</span>
                              </div>
                            ) : (
                              <div className="flex items-center justify-center gap-2">
                                <Send className="w-5 h-5 text-jade-jade" />
                                <span className="text-sm text-jade-jade">Transmit</span>
                              </div>
                            )}
                          </div>
                        </ConsciousnessVessel>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Voice Toggle Consciousness Vessel */}
                  {isSupported && (
                    <ConsciousnessVessel
                      title={isListening ? "Stop" : "Voice"}
                      subtitle={isListening ? "end transmission" : "begin speaking"}
                      variant={isListening ? "neural" : "mystical"}
                      depth="profound"
                      onClick={(e) => {
                        if (!isProcessing) {
                          const rect = e.currentTarget.getBoundingClientRect();
                          createConsciousnessRipple(rect.left + rect.width/2, rect.top + rect.height/2, isListening ? 'neural' : 'mystical');
                          setTimeout(() => toggleListening(), 200);
                        }
                      }}
                      className={`${isProcessing ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'} transition-all duration-300`}
                    >
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-2">
                          {isListening ? (
                            <>
                              <MicOff className="w-5 h-5 text-jade-jade" />
                              <span className="text-sm text-jade-jade">Stop</span>
                            </>
                          ) : (
                            <>
                              <Mic className="w-5 h-5 text-jade-jade" />
                              <span className="text-sm text-jade-jade">Speak</span>
                            </>
                          )}
                        </div>
                      </div>
                    </ConsciousnessVessel>
                  )}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Sacred Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-8 text-center"
          >
            <p className="text-jade-mineral font-light text-sm">
              {isListening ? "Your voice flows through sacred consciousness..." : "Speak or write your truth. MAIA witnesses with reverence."}
            </p>
          </motion.div>
        </motion.div>
      </div>

      {/* Consciousness Ripples */}
      <AnimatePresence>
        {consciousnessRipples.map(ripple => (
          <div key={ripple.id} className="fixed inset-0 pointer-events-none z-30">
            <ConsciousnessRipple
              x={ripple.x}
              y={ripple.y}
              variant={ripple.variant}
              intensity="profound"
            />
          </div>
        ))}
      </AnimatePresence>
    </>
  );
}