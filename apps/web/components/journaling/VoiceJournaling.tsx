'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { JournalingMode, JOURNALING_MODE_DESCRIPTIONS } from '@/lib/journaling/JournalingPrompts';
import ContextualHelp from '@/components/onboarding/ContextualHelp';
import JournalNavigation from './JournalNavigation';
import { trackVoiceUsage } from '@/components/onboarding/FeatureDiscovery';
import { Mic, MicOff, Play, Pause, Volume2 } from 'lucide-react';

interface VoiceJournalEntry {
  id: string;
  mode: JournalingMode;
  transcript: string;
  reflection?: any;
  audioUrl?: string;
  timestamp: Date;
  isProcessing?: boolean;
  archetypalSignatures?: string[];
  recognitionMoment?: boolean;
  wisdomDepth?: 'surface' | 'symbolic' | 'archetypal' | 'transcendent';
}

export default function VoiceJournaling() {
  const [selectedMode, setSelectedMode] = useState<JournalingMode>('free');
  const [isRecording, setIsRecording] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [entries, setEntries] = useState<VoiceJournalEntry[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [enableVoiceResponse, setEnableVoiceResponse] = useState(true);
  const [userArchetypalProfile, setUserArchetypalProfile] = useState({
    primary: 'unknown',
    secondary: 'unknown',
    confidence: 0,
    recognitionEvents: 0
  });

  const recognitionRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
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

          setCurrentTranscript(prev => prev + finalTranscript || interimTranscript);
        };

        recognition.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
          setIsRecording(false);
        };

        recognitionRef.current = recognition;
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      setIsRecording(true);
      setCurrentTranscript('');
      trackVoiceUsage();

      if (recognitionRef.current) {
        recognitionRef.current.start();
      }
    } catch (error) {
      console.error('Microphone access error:', error);
      alert('Please allow microphone access to use voice journaling');
    }
  };

  const stopRecording = async () => {
    setIsRecording(false);

    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }

    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }

    if (currentTranscript.trim()) {
      await processVoiceEntry(currentTranscript);
    }
  };

  const processVoiceEntry = async (transcript: string) => {
    // Detect archetypal patterns in the voice journal entry
    const detections = detectArchetypalPatterns(transcript);
    updateArchetypalProfile(detections);

    const newEntry: VoiceJournalEntry = {
      id: Date.now().toString(),
      mode: selectedMode,
      transcript,
      timestamp: new Date(),
      isProcessing: true,
      archetypalSignatures: detections.map(d => d.element),
      recognitionMoment: detections.some(d => d.confidence > 0.5),
      wisdomDepth: detections.length > 2 ? 'archetypal' : detections.length > 1 ? 'symbolic' : 'surface'
    };

    setEntries(prev => [...prev, newEntry]);
    setIsProcessing(true);
    setCurrentTranscript('');

    try {
      const response = await fetch('/api/journal/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entry: transcript,
          mode: selectedMode,
          userId: 'beta-user',
          enableVoice: enableVoiceResponse
        })
      });

      const data = await response.json();

      if (data.success) {
        setEntries(prev =>
          prev.map(e =>
            e.id === newEntry.id
              ? {
                  ...e,
                  reflection: data.reflection,
                  audioUrl: data.audioUrl,
                  isProcessing: false
                }
              : e
          )
        );

        if (data.audioUrl && enableVoiceResponse) {
          playAudioResponse(data.audioUrl);
        }

        await fetch('/api/journal/export', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            entry: transcript,
            mode: selectedMode,
            reflection: data.reflection,
            userId: 'beta-user',
            element: 'aether'
          })
        });
      }
    } catch (error) {
      console.error('Voice journal processing error:', error);
      setEntries(prev =>
        prev.map(e =>
          e.id === newEntry.id ? { ...e, isProcessing: false } : e
        )
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const playAudioResponse = (audioUrl: string) => {
    const audio = new Audio(audioUrl);
    audio.play().catch(error => {
      console.error('Audio playback error:', error);
    });
  };

  // Consciousness-aware archetypal pattern detection
  const detectArchetypalPatterns = (transcript: string) => {
    const patterns = {
      fire: /\b(vision|create|inspire|passion|breakthrough|transform|energy|burn|drive|power|activate|ignite)\b/gi,
      water: /\b(feel|flow|emotion|intuition|empathy|connect|heart|depth|love|compassion|tears|healing)\b/gi,
      earth: /\b(ground|practical|build|structure|stability|nature|body|concrete|tangible|roots|material)\b/gi,
      air: /\b(think|analyze|clarity|communicate|understand|wisdom|mind|breath|space|perspective|light)\b/gi,
      aether: /\b(integrate|wholeness|synthesis|transcend|sacred|unity|spirit|soul|consciousness|divine|infinite)\b/gi
    };

    const detections: { element: string; confidence: number; moment: 'emerging' | 'confirmed' | 'shifting' }[] = [];
    Object.entries(patterns).forEach(([element, pattern]) => {
      const matches = transcript.match(pattern);
      if (matches && matches.length > 0) {
        detections.push({
          element,
          confidence: Math.min(matches.length * 0.3, 1),
          moment: matches.length > 2 ? 'confirmed' : 'emerging'
        });
      }
    });

    return detections.sort((a, b) => b.confidence - a.confidence);
  };

  const updateArchetypalProfile = (detections: { element: string; confidence: number }[]) => {
    if (detections.length > 0) {
      const primary = detections[0];
      setUserArchetypalProfile(prev => ({
        primary: primary.element,
        secondary: detections[1]?.element || prev.secondary,
        confidence: Math.min(prev.confidence + primary.confidence, 1),
        recognitionEvents: prev.recognitionEvents + (primary.confidence > 0.5 ? 1 : 0)
      }));
    }
  };

  const modeStyles = {
    free: {
      gradient: 'from-soul-accent via-soul-accentGlow to-soul-highlight',
      borderColor: 'border-soul-accent/30',
      bgColor: 'bg-soul-accent/10',
      name: 'Open Expression',
      description: 'Natural flow of consciousness'
    },
    dream: {
      gradient: 'from-soul-waterWarm via-spiralogic-water to-caladan-water-400',
      borderColor: 'border-soul-waterWarm/30',
      bgColor: 'bg-soul-waterWarm/10',
      name: 'Subconscious Reflection',
      description: 'Dreams and deeper awareness'
    },
    emotional: {
      gradient: 'from-soul-fireWarm via-spiralogic-fire to-soul-accent',
      borderColor: 'border-soul-fireWarm/30',
      bgColor: 'bg-soul-fireWarm/10',
      name: 'Emotional Processing',
      description: 'Feelings and inner truth'
    },
    shadow: {
      gradient: 'from-soul-earthWarm via-brown-700 to-sienna-600',
      borderColor: 'border-soul-earthWarm/30',
      bgColor: 'bg-soul-earthWarm/10',
      name: 'Shadow Integration',
      description: 'Hidden aspects and resistance'
    },
    direction: {
      gradient: 'from-soul-airWarm via-sage-500 to-soul-highlight',
      borderColor: 'border-soul-airWarm/30',
      bgColor: 'bg-soul-airWarm/10',
      name: 'Future Visioning',
      description: 'Clarity and forward movement'
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-soul-background via-soul-surface to-soul-background">
      <div className="max-w-7xl mx-auto px-6 py-12 text-soul-textPrimary">
        {/* Header */}
        <div className="mb-16">
          <h1 className="text-5xl md:text-6xl font-extralight text-soul-textPrimary tracking-tight mb-6">
            Voice Reflection
          </h1>
          <p className="text-xl font-light text-soul-textSecondary max-w-2xl leading-relaxed">
            {modeStyles[selectedMode].name}: {modeStyles[selectedMode].description}
          </p>

          {/* Recording Status */}
          {isRecording && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 flex items-center gap-3"
            >
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="w-3 h-3 bg-soul-accent rounded-full"
              />
              <span className="text-sm font-light text-soul-textSecondary tracking-wide">Recording in progress</span>
            </motion.div>
          )}
        </div>

        {/* Voice Controls Section */}
        <div className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-light text-soul-textPrimary tracking-wide">Voice Settings</h3>
            <label className="flex items-center gap-3 text-sm font-light text-soul-textSecondary cursor-pointer">
              <input
                type="checkbox"
                checked={enableVoiceResponse}
                onChange={(e) => setEnableVoiceResponse(e.target.checked)}
                className="w-4 h-4 rounded border border-soul-accent/30 bg-soul-background/60 text-soul-accent focus:ring-soul-accent/50"
              />
              <Volume2 className="w-4 h-4" />
              <span className="tracking-wide">Audio responses enabled</span>
            </label>
          </div>
        </div>

        {/* Consciousness Modes - Bene Gesserit Interface */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h3 className="text-2xl font-extralight text-soul-textPrimary mb-4 tracking-[0.2em] uppercase">
              Consciousness Protocol
            </h3>
            <div className="w-24 h-px bg-gradient-to-r from-transparent via-soul-accent to-transparent mx-auto mb-2" />
            <p className="text-sm font-light text-soul-textSecondary tracking-wide opacity-80">
              Select your archetypal interface
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            {(Object.keys(modeStyles) as JournalingMode[]).map((mode, index) => (
              <motion.button
                key={mode}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: isRecording ? 1 : 1.03, y: -2 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setSelectedMode(mode)}
                disabled={isRecording}
                className={`group relative p-8 rounded-lg backdrop-blur-sm transition-all duration-500 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden ${
                  selectedMode === mode
                    ? `bg-gradient-to-br ${modeStyles[mode].gradient} text-soul-background shadow-2xl shadow-soul-accent/30 border border-soul-accent/40`
                    : `${modeStyles[mode].bgColor} ${modeStyles[mode].borderColor} text-soul-textPrimary hover:shadow-xl hover:shadow-black/20 border`
                }`}
              >
                {/* Geometric Pattern Overlay */}
                <div className={`absolute inset-0 opacity-10 ${selectedMode === mode ? 'opacity-20' : 'group-hover:opacity-20'} transition-opacity duration-500`}>
                  <div className="absolute top-2 left-2 w-3 h-3 border-l border-t border-current opacity-40" />
                  <div className="absolute top-2 right-2 w-3 h-3 border-r border-t border-current opacity-40" />
                  <div className="absolute bottom-2 left-2 w-3 h-3 border-l border-b border-current opacity-40" />
                  <div className="absolute bottom-2 right-2 w-3 h-3 border-r border-b border-current opacity-40" />
                  <div className="absolute inset-4 border border-current opacity-20 rounded" />
                </div>

                {/* Content */}
                <div className="relative z-10 text-center">
                  <div className={`text-lg font-extralight tracking-[0.15em] uppercase mb-3 ${selectedMode === mode ? 'text-soul-background' : 'text-soul-textPrimary'}`}>
                    {modeStyles[mode].name.replace(' ', '\n').split('\n')[0]}
                  </div>
                  <div className={`text-lg font-extralight tracking-[0.15em] uppercase mb-4 ${selectedMode === mode ? 'text-soul-background/80' : 'text-soul-textPrimary/80'}`}>
                    {modeStyles[mode].name.split(' ')[1] || ''}
                  </div>
                  <div className={`text-xs leading-relaxed tracking-wide ${selectedMode === mode ? 'text-soul-background/70' : 'text-soul-textSecondary'}`}>
                    {modeStyles[mode].description}
                  </div>
                </div>

                {/* Selection Indicator */}
                {selectedMode === mode && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="absolute top-4 right-4 w-2 h-2 bg-soul-background rounded-full shadow-lg"
                  />
                )}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Live Transcript */}
        {currentTranscript && (
          <div className="mb-16">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-soul-surface/40 border border-soul-accent/20 rounded-lg p-8 backdrop-blur-sm"
            >
              <div className="flex items-center gap-3 mb-6">
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="w-3 h-3 bg-soul-accent rounded-full"
                />
                <span className="text-sm font-light text-soul-textSecondary tracking-wide">
                  Recording active
                </span>
              </div>
              <p className="text-soul-textPrimary font-light leading-relaxed whitespace-pre-wrap">
                {currentTranscript}
              </p>
              {detectArchetypalPatterns(currentTranscript).length > 0 && (
                <div className="flex gap-2 mt-6">
                  {detectArchetypalPatterns(currentTranscript).slice(0, 3).map(detection => (
                    <span
                      key={detection.element}
                      className="text-xs px-3 py-1 rounded-full bg-soul-accent/20 text-soul-textSecondary border border-soul-accent/30"
                    >
                      {detection.element}
                    </span>
                  ))}
                </div>
              )}
            </motion.div>
          </div>
        )}

        {/* Entries */}
        <div className="space-y-8">
          {entries.map((entry) => (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="bg-soul-surface/40 border border-soul-accent/20 rounded-lg p-8 backdrop-blur-sm">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${modeStyles[entry.mode].gradient} flex items-center justify-center`}>
                      <Mic className="w-5 h-5 text-soul-background" />
                    </div>
                    <div>
                      <div className="text-sm font-light text-soul-textPrimary tracking-wide">
                        {modeStyles[entry.mode].name}
                      </div>
                      <div className="text-xs text-soul-textSecondary">
                        {entry.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      {entry.wisdomDepth && (
                        <div className="text-xs px-2 py-1 rounded-full bg-soul-accent/20 text-soul-textSecondary border border-soul-accent/30 mt-1 inline-block">
                          {entry.wisdomDepth} depth
                        </div>
                      )}
                    </div>
                  </div>
                  {entry.audioUrl && (
                    <button
                      onClick={() => playAudioResponse(entry.audioUrl!)}
                      className="p-3 rounded-lg bg-soul-accent/10 border border-soul-accent/30 text-soul-accent hover:bg-soul-accent/20 transition-colors"
                    >
                      <Play className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Archetypal Signatures */}
                {entry.archetypalSignatures && entry.archetypalSignatures.length > 0 && (
                  <div className="flex gap-2 mb-6">
                    {entry.archetypalSignatures.slice(0, 3).map(element => (
                      <span
                        key={element}
                        className="text-xs px-3 py-1 rounded-full bg-soul-accent/20 text-soul-textSecondary border border-soul-accent/30"
                      >
                        {element}
                      </span>
                    ))}
                    {entry.recognitionMoment && (
                      <span className="text-xs px-3 py-1 rounded-full bg-soul-highlight/20 text-soul-textSecondary border border-soul-highlight/30">
                        recognized pattern
                      </span>
                    )}
                  </div>
                )}

                <p className="text-soul-textPrimary font-light leading-relaxed whitespace-pre-wrap">
                  {entry.transcript}
                </p>
              </div>

              {entry.isProcessing && (
                <div className="bg-soul-surface/40 border border-soul-accent/30 rounded-lg p-8 backdrop-blur-sm">
                  <div className="flex items-center gap-4">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    >
                      <div className="w-6 h-6 border-2 border-soul-accent/30 border-t-soul-accent rounded-full" />
                    </motion.div>
                    <span className="text-sm font-light text-soul-textSecondary tracking-wide">
                      Processing your reflection...
                    </span>
                  </div>
                </div>
              )}

              {entry.reflection && (
                <div className="bg-soul-surface/40 border border-soul-accent/30 rounded-lg p-8 backdrop-blur-sm">
                  <h4 className="text-lg font-light text-soul-textPrimary mb-6 tracking-wide">
                    Analysis
                  </h4>
                  <p className="text-soul-textPrimary font-light leading-relaxed mb-4">
                    {entry.reflection.reflection}
                  </p>
                  <p className="text-sm font-light text-soul-textSecondary italic">
                    {entry.reflection.prompt}
                  </p>
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Neural Interface Control Matrix */}
        <div className="mt-20">
          <div className="relative max-w-md mx-auto">
            {/* Outer Geometric Frame */}
            <div className="absolute inset-0 border border-soul-accent/30 rounded-lg transform rotate-1" />
            <div className="absolute inset-0 border border-soul-accent/20 rounded-lg transform -rotate-1" />

            <div className="relative bg-gradient-to-br from-soul-surface/60 via-soul-surface/40 to-soul-background/80 backdrop-blur-sm border border-soul-accent/40 rounded-lg p-12">
              {/* Central Control */}
              <div className="text-center">
                <div className="relative inline-block">
                  {/* Orbital Rings */}
                  <div className={`absolute inset-0 rounded-full border border-soul-accent/30 animate-spin`} style={{ animationDuration: '20s' }} />
                  <div className={`absolute inset-2 rounded-full border border-soul-accent/20 animate-spin`} style={{ animationDuration: '15s', animationDirection: 'reverse' }} />

                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    whileHover={{ scale: isProcessing ? 1 : 1.1 }}
                    onClick={isRecording ? stopRecording : startRecording}
                    disabled={isProcessing}
                    className={`relative w-32 h-32 rounded-full flex items-center justify-center transition-all duration-500 disabled:opacity-50 disabled:cursor-not-allowed group overflow-hidden ${
                      isRecording
                        ? 'bg-gradient-to-br from-soul-fireWarm via-soul-accent to-soul-highlight shadow-2xl shadow-soul-accent/40'
                        : `bg-gradient-to-br ${modeStyles[selectedMode].gradient} shadow-xl shadow-soul-accent/30 hover:shadow-2xl hover:shadow-soul-accent/50`
                    }`}
                  >
                    {/* Inner geometric patterns */}
                    <div className="absolute inset-4 border border-current opacity-20 rounded-full" />
                    <div className="absolute inset-6 border border-current opacity-10 rounded-full" />

                    {isRecording ? (
                      <MicOff className="w-16 h-16 text-soul-background relative z-10" />
                    ) : (
                      <Mic className="w-16 h-16 text-soul-background relative z-10" />
                    )}

                    {/* Pulse effect when recording */}
                    {isRecording && (
                      <>
                        <motion.div
                          className="absolute inset-0 rounded-full bg-soul-accent/30"
                          animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        />
                        <motion.div
                          className="absolute inset-0 rounded-full bg-soul-fireWarm/20"
                          animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0, 0.3] }}
                          transition={{ duration: 2.5, repeat: Infinity }}
                        />
                      </>
                    )}
                  </motion.button>
                </div>

                {/* Status Display */}
                <div className="mt-8 space-y-2">
                  <div className="text-center">
                    <div className={`text-sm font-extralight tracking-[0.2em] uppercase mb-2 ${isRecording ? 'text-soul-accent' : 'text-soul-textPrimary'}`}>
                      {isRecording ? 'Neural Link Active' : 'Consciousness Interface Ready'}
                    </div>
                    <div className="w-16 h-px bg-gradient-to-r from-transparent via-soul-accent to-transparent mx-auto mb-4" />
                    <div className="text-xs font-light text-soul-textSecondary tracking-wide">
                      {isRecording ? 'Pattern analysis in progress' : 'Initiate archetypal interface'}
                    </div>
                  </div>

                  {/* Current Mode Indicator */}
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-soul-accent/10 border border-soul-accent/30">
                    <div className="w-1.5 h-1.5 rounded-full bg-current opacity-60" />
                    <span className="text-xs font-extralight tracking-wider uppercase text-soul-textSecondary">
                      {modeStyles[selectedMode].name} Protocol
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Archetypal Recognition Matrix */}
            {userArchetypalProfile.confidence > 0.3 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-8 bg-gradient-to-r from-soul-surface/40 via-soul-surface/60 to-soul-surface/40 backdrop-blur-sm border border-soul-highlight/30 rounded-lg p-6"
              >
                <div className="text-center">
                  <div className="text-xs font-extralight tracking-[0.15em] uppercase text-soul-textSecondary mb-3">
                    Archetypal Recognition Matrix
                  </div>
                  <div className="flex items-center justify-center gap-4">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-soul-highlight rounded-full animate-pulse" />
                      <span className="text-sm font-light text-soul-highlight tracking-wide">
                        {Math.round(userArchetypalProfile.confidence * 100)}%
                      </span>
                    </div>
                    <div className="text-xs text-soul-textTertiary opacity-60">•</div>
                    <div className="text-xs font-light text-soul-textTertiary tracking-wider uppercase">
                      {userArchetypalProfile.primary} Dominance
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      <ContextualHelp />
    </div>
  );
}