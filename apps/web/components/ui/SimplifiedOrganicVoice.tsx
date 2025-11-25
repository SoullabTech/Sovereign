/**
 * Simplified Organic Voice - Clean, golden mic with holoflower visualization
 * No annoying sounds, just beautiful visuals
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import { ConversationalMagicEngine } from '@/lib/voice/ConversationalMagic';
// TEMPORARILY DISABLED FOR PRODUCTION
// import {
//   ElementalMode,
//   ELEMENTAL_TIMINGS,
//   detectElementalMode,
//   getActiveListeningPrompt
// } from '@/lib/elemental-timing';

interface SimplifiedOrganicVoiceProps {
  onTranscript: (text: string) => void;
  enabled?: boolean;
  isMayaSpeaking?: boolean;
  onAudioLevelChange?: (level: number) => void;
}

// Silence detection thresholds (in milliseconds)
const SMART_THRESHOLD = 1200;        // Complete sentences with punctuation (1.2 seconds)
const SILENCE_THRESHOLD = 2000;      // Normal conversation pause (2 seconds)
const CONTEMPLATION_THRESHOLD = 4000; // Extended pause for deep thought (4 seconds)

// Sacred geometry sparkle generation
const generateSparkles = (count: number) => {
  return Array.from({ length: count }, (_, i) => {
    const angle = (i / count) * Math.PI * 2;
    const radius = Math.random() * 100 + 50;
    return {
      id: i,
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius,
      size: Math.random() * 3 + 1,
      duration: Math.random() * 4 + 3,
      delay: Math.random() * 2,
    };
  });
};

export interface VoiceActivatedMaiaRef {
  startListening: () => void;
  stopListening: () => void;
  muteImmediately: () => void;
  toggleContemplationMode: () => void;
  getResponseStyle: () => any; // 🌀 Get conversational response style from MagicEngine
  // switchElementalMode: (mode: ElementalMode) => void; // TEMPORARILY DISABLED
  isListening: boolean;
  audioLevel: number;
  isContemplationMode: boolean;
  conversationMode: 'active' | 'contemplating';
  // elementalMode: ElementalMode; // TEMPORARILY DISABLED
}

export const SimplifiedOrganicVoice = React.forwardRef<VoiceActivatedMaiaRef, SimplifiedOrganicVoiceProps>(({
  onTranscript,
  enabled = true,
  isMayaSpeaking = false,
  onAudioLevelChange,
}, ref) => {
  const [isListening, setIsListening] = useState(false);
  const [isWaitingForInput, setIsWaitingForInput] = useState(false);
  const [isPausedForMaya, setIsPausedForMaya] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [sparkles] = useState(() => generateSparkles(30));
  const [audioLevel, setAudioLevel] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isContemplationMode, setIsContemplationMode] = useState(false);
  const [conversationMode, setConversationMode] = useState<'active' | 'contemplating'>('active');
  // TEMPORARILY DISABLED
  // const [elementalMode, setElementalMode] = useState<ElementalMode>('water');
  // const [recentSilences, setRecentSilences] = useState<number[]>([]);
  const lastSpeechTime = useRef<number>(Date.now()); // Uncommented - being used in code
  const [isActivelyExpressing, setIsActivelyExpressing] = useState(false);
  const expressionStartTime = useRef<number>(Date.now());
  const consecutiveWords = useRef<number>(0);

  const recognitionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const isStartingRef = useRef<boolean>(false); // Prevent multiple starts
  const isPausedForMayaRef = useRef<boolean>(false); // CRITICAL: Use ref to access current value in onresult closure
  const lastRestartAttemptRef = useRef<number>(0); // Prevent restart thrashing
  const animationFrameRef = useRef<number>(0);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const accumulatedTranscriptRef = useRef<string>('');
  const lastSentMessageRef = useRef<string>('');
  const lastSentTimeRef = useRef<number>(0);

  // 🔧 FALLBACK: Track interim transcript for stuck recognition
  const lastInterimTranscriptRef = useRef<string>('');
  const interimStableTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 🌀 CONVERSATIONAL MAGIC ENGINE
  const magicEngineRef = useRef<ConversationalMagicEngine>(new ConversationalMagicEngine());
  const pauseDurationsRef = useRef<number[]>([]);
  const utteranceLengthsRef = useRef<number[]>([]);

  // === ANALYTICS: Voice interaction tracking ===
  const sessionStartTime = useRef<number>(Date.now());
  const sessionId = useRef<string>(`voice_${Date.now()}`);
  const exchangeCount = useRef<number>(0);
  const userSpeechStartTime = useRef<number>(0);
  const totalUserSpeechDuration = useRef<number>(0);
  const totalMaiaSpeechDuration = useRef<number>(0);
  const listeningPauseCount = useRef<number>(0);
  const interruptionCount = useRef<number>(0);

  // No wake words needed - always listening when active
  const WAKE_WORDS: string[] = [];
  // Optimized timing for natural conversation flow
  const SILENCE_THRESHOLD = 1800;  // Further reduced for even faster response
  const SMART_THRESHOLD = 1000;    // Quick detection for natural conversation
  const CONTEMPLATION_THRESHOLD = 10000;

  // Initialize audio context and analyzer
  const initializeAudioContext = useCallback(async () => {
    // Check if window exists (not on server)
    if (typeof window === 'undefined' || !navigator?.mediaDevices) {
      return false;
    }

    try {
      console.log('📡 Requesting microphone permission...');
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          // ENHANCED SENSITIVITY: Better mic settings for normal speech levels
          sampleRate: 44100,
          channelCount: 1,
          volume: 1.0
        }
      });
      console.log('✅ Microphone permission granted');
      micStreamRef.current = stream;

      const AudioContextClass = (window as any).AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) {
        console.error('AudioContext not supported');
        return false;
      }
      audioContextRef.current = new AudioContextClass();
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;

      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);

      // Start monitoring audio levels
      const monitorAudioLevel = () => {
        if (!analyserRef.current) return;

        const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
        analyserRef.current.getByteFrequencyData(dataArray);

        const average = dataArray.reduce((acc, val) => acc + val, 0) / dataArray.length;
        // INCREASED SENSITIVITY: Multiply by 3 for better detection of normal speech
        const level = Math.min(1, (average / 255) * 3);
        setAudioLevel(level);
        onAudioLevelChange?.(level);

        if (typeof window !== 'undefined') {
          animationFrameRef.current = requestAnimationFrame(monitorAudioLevel);
        }
      };

      monitorAudioLevel();
      return true;
    } catch (error) {
      console.error('Failed to initialize audio:', error);
      return false;
    }
  }, []);

  // Initialize speech recognition
  const initializeSpeechRecognition = useCallback(() => {
    // Check if window exists (not on server)
    if (typeof window === 'undefined') {
      return false;
    }

    // Debug browser info
    console.log('🌐 Browser info:', {
      userAgent: navigator.userAgent,
      vendor: navigator.vendor,
      platform: navigator.platform
    });

    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    if (!SpeechRecognition) {
      console.error('Speech recognition not supported in this browser');
      console.log('Available:', {
        webkitSpeechRecognition: !!(window as any).webkitSpeechRecognition,
        SpeechRecognition: !!(window as any).SpeechRecognition
      });
      return false;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      console.log('🟢 Speech recognition started');
      userSpeechStartTime.current = Date.now(); // Track when user starts speaking
      console.log('Recognition settings:', {
        continuous: recognition.continuous,
        interimResults: recognition.interimResults,
        lang: recognition.lang,
        maxAlternatives: recognition.maxAlternatives
      });
    };

    recognition.onspeechstart = () => {
      console.log('🎙️ Speech detected');
    };

    recognition.onaudiostart = () => {
      console.log('🔊 Audio capture started');
    };

    recognition.onnomatch = () => {
      console.log('⚠️ No speech match found');
    };

    recognition.onsoundstart = () => {
      console.log('🔉 Sound detected');
    };

    recognition.onsoundend = () => {
      console.log('🔇 Sound ended');
    };

    recognition.onresult = (event: any) => {
      // 🚨 CRITICAL: Reject ALL recognition events if Maya is speaking (prevents echo)
      // MUST use ref to access current value inside this closure
      if (isPausedForMayaRef.current) {
        console.log('🛑 [ECHO BLOCKED] Ignoring recognition event - Maia is speaking');
        return;
      }

      console.log('🎤 Speech recognition event:', {
        results: event.results,
        resultIndex: event.resultIndex,
        length: event.results.length
      });
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        console.log(`📝 Result ${i}:`, transcript, 'isFinal:', event.results[i].isFinal);
        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' ';
        } else {
          interimTranscript += transcript;
        }
      }

      // 🌀 CHECK FOR BACK-CHANNELING (don't interrupt MAIA for "mm-hmm", "yeah")
      const currentTranscript = finalTranscript || interimTranscript;
      if (currentTranscript.trim() && magicEngineRef.current.detectBackChanneling(currentTranscript.trim())) {
        console.log('🎯 Back-channeling detected:', currentTranscript.trim(), '- continuing...');
        // Don't process as interruption, but acknowledge
        return;
      }

      // Track active expression
      if (finalTranscript || interimTranscript) {
        if (!isActivelyExpressing) {
          setIsActivelyExpressing(true);
          expressionStartTime.current = Date.now();
          console.log('🎤 User started expressing');
        }
        consecutiveWords.current = (finalTranscript + interimTranscript).split(' ').length;
        lastSpeechTime.current = Date.now();
      }

      setTranscript(currentTranscript);

      // 🔧 FALLBACK: If we have stable interim results, process them after 2 seconds
      // This handles cases where Web Speech API gets stuck in interim mode
      // CRITICAL: Don't check isPausedForMaya here - we want to capture speech even if state is confused
      if (interimTranscript && !finalTranscript) {
        const trimmedInterim = interimTranscript.trim();

        // Clear previous timer
        if (interimStableTimerRef.current) {
          clearTimeout(interimStableTimerRef.current);
        }

        // If interim transcript changed significantly, reset timer
        if (trimmedInterim !== lastInterimTranscriptRef.current) {
          lastInterimTranscriptRef.current = trimmedInterim;
          console.log('⏱️ Interim transcript changed, starting 2s fallback timer:', trimmedInterim);

          // Set a 2-second timer to process interim if it stabilizes (reduced from 3s)
          interimStableTimerRef.current = setTimeout(() => {
            const stableInterim = lastInterimTranscriptRef.current;
            console.log('⏰ Fallback timer fired! stableInterim:', stableInterim, 'isPausedForMaya:', isPausedForMayaRef.current);

            if (stableInterim && stableInterim.length > 3) {
              // Only send if MAIA is not currently speaking
              if (isPausedForMayaRef.current) {
                console.log('🛑 MAIA speaking - queuing transcript for after she finishes');
                // Don't clear - will retry when MAIA finishes
                return;
              }

              console.log('🔧 Processing stable interim transcript:', stableInterim);

              // Treat it as final and send
              const expressionDuration = Date.now() - expressionStartTime.current;
              console.log(`📊 User spoke for ${expressionDuration}ms`);

              // 🌀 CALCULATE ENGAGEMENT SCORE
              const engagementScore = magicEngineRef.current.calculateEngagementScore();
              console.log('🎯 Engagement score:', engagementScore);

              console.log('🚀 Sending to Maya:', stableInterim);
              onTranscript(stableInterim);

              // Clear state
              lastInterimTranscriptRef.current = '';
              accumulatedTranscriptRef.current = '';
              setTranscript('');
              setIsActivelyExpressing(false);
              consecutiveWords.current = 0;
            }
          }, 2000); // 2 seconds (reduced from 3) of stable interim = send it
        }
      }

      // Always process speech without wake word requirement
      if (finalTranscript && !isPausedForMaya) {
        // Clear interim fallback timer since we got a final result
        if (interimStableTimerRef.current) {
          clearTimeout(interimStableTimerRef.current);
          interimStableTimerRef.current = null;
        }
        lastInterimTranscriptRef.current = '';
        // Accumulate transcript
        const cleanTranscript = finalTranscript.trim();

        if (cleanTranscript) {
          accumulatedTranscriptRef.current += ' ' + cleanTranscript;
          console.log('📝 Accumulated transcript:', accumulatedTranscriptRef.current.trim());

          // Reset silence timer
          if (silenceTimerRef.current) {
            clearTimeout(silenceTimerRef.current);
          }

          // Check if this looks like end of sentence/thought
          const accumulated = accumulatedTranscriptRef.current.trim();
          const endsWithPunctuation = /[.!?]$/.test(accumulated);
          const hasQuestionWords = /^(what|where|when|why|how|who|can|could|would|should|is|are|do|does)/i.test(accumulated);
          const wordCount = accumulated.split(/\s+/).length;

          // 🚀 IMMEDIATE SEND only for COMPLETE thoughts
          // Don't send mid-sentence - wait for natural pause
          const shouldSendImmediately =
            (endsWithPunctuation && accumulated.length > 5) ||  // Complete sentence with punctuation
            (hasQuestionWords && wordCount >= 4 && endsWithPunctuation);  // Complete question

          if (shouldSendImmediately) {
            console.log('🚀 Complete thought detected, sending immediately:', accumulated);

            // Prevent duplicates
            const now = Date.now();
            const timeSinceLastSent = now - lastSentTimeRef.current;
            const isDuplicate = accumulated === lastSentMessageRef.current && timeSinceLastSent < 5000;

            if (!isDuplicate) {
              // Track analytics
              if (userSpeechStartTime.current > 0) {
                const speechDuration = Date.now() - userSpeechStartTime.current;
                totalUserSpeechDuration.current += speechDuration;
                console.log(`📊 User spoke for ${speechDuration}ms`);
              }
              exchangeCount.current++;

              // Send immediately
              onTranscript(accumulated);
              lastSentMessageRef.current = accumulated;
              lastSentTimeRef.current = now;
              accumulatedTranscriptRef.current = '';
              setTranscript('');
              setIsActivelyExpressing(false);
              consecutiveWords.current = 0;

              // Clear any pending timer
              if (silenceTimerRef.current) {
                clearTimeout(silenceTimerRef.current);
                silenceTimerRef.current = null;
              }

              // Reset contemplation mode
              if (isContemplationMode) {
                setIsContemplationMode(false);
                setConversationMode('active');
              }

              // Don't set a new timer - message already sent
              return;
            } else {
              console.log('⚠️ Duplicate complete sentence, skipping');
              accumulatedTranscriptRef.current = '';
              setTranscript('');
              return;
            }
          }

          // Track silence duration and learn user rhythm
          const silenceDuration = Date.now() - lastSpeechTime.current;
          lastSpeechTime.current = Date.now();

          // 🌀 LEARN USER'S CONVERSATIONAL RHYTHM
          pauseDurationsRef.current.push(silenceDuration);
          utteranceLengthsRef.current.push(cleanTranscript.length);
          magicEngineRef.current.learnUserRhythm(
            pauseDurationsRef.current.slice(-5),
            utteranceLengthsRef.current.slice(-3)
          );

          // 🌀 GET DYNAMIC SILENCE THRESHOLD from MagicEngine
          const dynamicThreshold = magicEngineRef.current.getDynamicSilenceThreshold();
          console.log('🎯 Dynamic silence threshold:', dynamicThreshold, 'ms');

          // Intelligent timing based on content and magic engine
          let threshold;

          if (isContemplationMode) {
            // In contemplation mode, use elemental contemplation threshold
            threshold = CONTEMPLATION_THRESHOLD;
          } else if (hasQuestionWords && accumulated.length > 20) {
            // Quick response for questions
            threshold = Math.min(SMART_THRESHOLD, dynamicThreshold * 0.7);
          } else {
            // Use dynamic threshold from MagicEngine
            threshold = dynamicThreshold;
          }

          // Set timer to process after silence
          silenceTimerRef.current = setTimeout(() => {
            const finalMessage = accumulatedTranscriptRef.current.trim();

            // Check if expression seems complete
            const seemsComplete = finalMessage.endsWith('.') ||
                                  finalMessage.endsWith('!') ||
                                  finalMessage.endsWith('?') ||
                                  finalMessage.split(' ').length > 15; // Reduced from 50 - send after ~15 words

            // Send if we have ANY message after silence threshold
            if (finalMessage && finalMessage.length > 3) {
              // Prevent duplicate sends (but allow if 5+ seconds have passed)
              const now = Date.now();
              const timeSinceLastSent = now - lastSentTimeRef.current;
              const isDuplicate = finalMessage === lastSentMessageRef.current && timeSinceLastSent < 5000;

              if (isDuplicate) {
                console.log('⚠️ Duplicate message detected, skipping:', finalMessage);
                accumulatedTranscriptRef.current = '';
                setTranscript('');
                setIsActivelyExpressing(false);
                return;
              }

              // === ANALYTICS: Track user speech duration ===
              if (userSpeechStartTime.current > 0) {
                const speechDuration = Date.now() - userSpeechStartTime.current;
                totalUserSpeechDuration.current += speechDuration;
                console.log(`📊 User spoke for ${speechDuration}ms`);
              }
              exchangeCount.current++;

              // 🌀 CALCULATE ENGAGEMENT SCORE
              const engagementScore = magicEngineRef.current.calculateEngagementScore();
              console.log('🎯 Engagement score:', engagementScore);

              console.log('🚀 Sending to Maya:', finalMessage);
              onTranscript(finalMessage);
              lastSentMessageRef.current = finalMessage;
              lastSentTimeRef.current = now;
              accumulatedTranscriptRef.current = '';
              setTranscript('');
              setIsActivelyExpressing(false);
              consecutiveWords.current = 0;

              // Reset to active conversation mode after sending
              if (isContemplationMode) {
                setIsContemplationMode(false);
                setConversationMode('active');
              }
            } else if (isActivelyExpressing) {
              // User is still expressing - extend the timer
              console.log('💭 User still expressing, extending patience...');
              // Double the threshold for ongoing expression
              silenceTimerRef.current = setTimeout(() => {
                const extendedMessage = accumulatedTranscriptRef.current.trim();
                if (extendedMessage) {
                  // Prevent duplicate sends (but allow if 5+ seconds have passed)
                  const now = Date.now();
                  const timeSinceLastSent = now - lastSentTimeRef.current;
                  const isDuplicate = extendedMessage === lastSentMessageRef.current && timeSinceLastSent < 5000;

                  if (isDuplicate) {
                    console.log('⚠️ Duplicate extended message detected, skipping');
                    accumulatedTranscriptRef.current = '';
                    setTranscript('');
                    setIsActivelyExpressing(false);
                    return;
                  }

                  console.log('🚀 Sending extended expression:', extendedMessage);
                  onTranscript(extendedMessage);
                  lastSentMessageRef.current = extendedMessage;
                  lastSentTimeRef.current = now;
                  accumulatedTranscriptRef.current = '';
                  setTranscript('');
                  setIsActivelyExpressing(false);
                  consecutiveWords.current = 0;
                }
              }, threshold * 2);
            }
          }, threshold);

          // ELEMENTAL MODE DETECTION TEMPORARILY DISABLED
        }
      }
    };

    recognition.onerror = (event: any) => {
      // 'no-speech' is normal - just means user didn't speak within timeout (~5-8 seconds)
      // This happens naturally in conversation and should be silent
      if (event.error === 'no-speech') {
        console.log('⏱️ No speech detected within timeout - will auto-restart');
        // Let onend handler restart it seamlessly
        return;
      }

      // Log other errors for debugging
      console.error('❌ Speech recognition error:', event.error, event);
      console.log('Error details:', {
        error: event.error,
        message: event.message,
        timeStamp: event.timeStamp
      });

      // DON'T auto-restart on 'aborted' - this is intentional (MAIA speaking or manual stop)
      if (event.error === 'aborted') {
        console.log('🛑 Recognition aborted intentionally - not restarting');
        setIsListening(false);
        return;
      }

      // Auto-restart on other errors to maintain continuous listening
      if (!isPausedForMayaRef.current && enabled && !isMuted) {
        setTimeout(() => {
          if (recognitionRef.current && isListening && !isPausedForMayaRef.current && !isStartingRef.current) {
            try {
              recognitionRef.current.stop();
              setTimeout(() => {
                try {
                  if (!isPausedForMayaRef.current && !isStartingRef.current) {
                    isStartingRef.current = true;
                    recognitionRef.current.start();
                    console.log('Speech recognition restarted after error');
                    setTimeout(() => {
                      isStartingRef.current = false;
                    }, 1000);
                  }
                } catch (e) {
                  isStartingRef.current = false;
                  console.log('Could not restart speech recognition:', e);
                }
              }, 500);
            } catch (e) {
              // Already stopped
            }
          }
        }, 100);
      }
    };

    recognition.onend = () => {
      console.log('🏁 Speech recognition ended, isPausedForMaya:', isPausedForMayaRef.current);
      isStartingRef.current = false; // Clear flag on end
      setIsListening(false); // Update state

      // 🛡️ ANTI-THRASHING: Prevent restart attempts within 1 second
      const now = Date.now();
      const timeSinceLastRestart = now - lastRestartAttemptRef.current;
      if (timeSinceLastRestart < 1000) {
        console.log('⏸️ Restart throttled - too soon after last attempt');
        return;
      }

      // Auto-restart for continuous listening ONLY if:
      // 1. Not paused for Maia (use ref for current value)
      // 2. Enabled and not muted
      // 3. Not already starting
      if (!isPausedForMayaRef.current && enabled && !isMuted && !isStartingRef.current) {
        lastRestartAttemptRef.current = now;
        console.log('🔄 Auto-restarting recognition after onend...');
        setTimeout(() => {
          if (recognitionRef.current && !isPausedForMayaRef.current && !isStartingRef.current) {
            try {
              isStartingRef.current = true;
              recognitionRef.current.start();
              setIsListening(true);
              console.log('✅ Speech recognition auto-restarted');
              setTimeout(() => {
                isStartingRef.current = false;
              }, 500);
            } catch (e) {
              isStartingRef.current = false;
              console.log('Could not auto-restart:', e);
            }
          }
        }, 500);
      } else {
        console.log('⏸️ Skipping auto-restart (paused or disabled)');
      }
    };

    recognitionRef.current = recognition;
    return true;
  }, [isWaitingForInput, isListening, onTranscript, isMayaSpeaking, isPausedForMaya]);

  // Expose methods via ref
  React.useImperativeHandle(ref, () => ({
    startListening: async () => {
      if (!isListening && !isPausedForMaya) {
        console.log('🎤 startListening called externally');

        // Initialize if needed
        if (!recognitionRef.current) {
          console.log('⚠️ Recognition not initialized, initializing now...');
          const audioInit = await initializeAudioContext();
          const speechInit = initializeSpeechRecognition();

          if (!audioInit || !speechInit || !recognitionRef.current) {
            console.error('❌ Failed to initialize voice recognition');
            return;
          }
        }

        // Prevent multiple simultaneous starts
        if (isStartingRef.current) {
          console.log('⚠️ Recognition already starting, skipping...');
          return;
        }

        try {
          isStartingRef.current = true;
          recognitionRef.current.start();
          setIsListening(true);
          console.log('✅ Voice recognition started successfully');

          setTimeout(() => {
            isStartingRef.current = false;
          }, 1000);
        } catch (e) {
          isStartingRef.current = false;
          console.error('❌ Could not start recognition:', e);
        }
      }
    },
    stopListening: () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
          setIsListening(false);
          lastSentMessageRef.current = '';
          lastSentTimeRef.current = 0;
        } catch (e) {
          // Already stopped
        }
      }
    },
    muteImmediately: () => {
      setIsPausedForMaya(true);
      lastSentMessageRef.current = '';
      lastSentTimeRef.current = 0;
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          // Already stopped
        }
      }
    },
    toggleContemplationMode: () => {
      const newMode = !isContemplationMode;
      setIsContemplationMode(newMode);
      setConversationMode(newMode ? 'contemplating' : 'active');
      console.log(`🧘 Contemplation mode ${newMode ? 'ON' : 'OFF'} - ${newMode ? 'Extended listening for deep reflection' : 'Natural conversation timing'}`);

      // Clear any pending timers when switching modes
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = null;
      }
    },
    // 🌀 GET RESPONSE STYLE from MagicEngine (for TTS pacing)
    getResponseStyle: () => {
      return magicEngineRef.current.getResponseStyle();
    },
    // TEMPORARILY DISABLED
    // switchElementalMode: (mode: ElementalMode) => {
    //   console.log(`🔮 Switching to ${mode} mode`);
    //   setElementalMode(mode);
    // },
    isListening,
    audioLevel,
    isContemplationMode,
    conversationMode,
    // elementalMode // TEMPORARILY DISABLED
  }), [isListening, isPausedForMaya, audioLevel, isContemplationMode, conversationMode, initializeAudioContext, initializeSpeechRecognition]);

  // Start/stop listening
  const toggleListening = useCallback(async () => {
    if (!isListening) {
      console.log('🎤 Starting voice recognition...');
      console.log('Current state:', { enabled, isMuted, isMayaSpeaking, isListening });
      // Start listening
      const audioInit = await initializeAudioContext();
      const speechInit = initializeSpeechRecognition();

      if (audioInit && speechInit && recognitionRef.current) {
        // Prevent multiple simultaneous starts
        if (isStartingRef.current) {
          console.log('⚠️ Recognition already starting, skipping...');
          return;
        }

        try {
          isStartingRef.current = true;
          recognitionRef.current.start();
          setIsListening(true);
          console.log('✅ Voice recognition started successfully');
          console.log('Recognition object:', recognitionRef.current);

          // Clear starting flag after a delay
          setTimeout(() => {
            isStartingRef.current = false;
          }, 1000);
        } catch (error) {
          isStartingRef.current = false;
          console.error('❌ Failed to start recognition:', error);
          if (error instanceof DOMException) {
            console.error('DOMException details:', {
              name: error.name,
              message: error.message,
              code: error.code
            });
          }
        }
      } else {
        console.error('❌ Failed to initialize:', { audioInit, speechInit, hasRecognition: !!recognitionRef.current });
      }
    } else {
      // Stop listening
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (animationFrameRef.current && typeof window !== 'undefined') {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (micStreamRef.current) {
        micStreamRef.current.getTracks().forEach(track => track.stop());
      }
      setIsListening(false);
      setIsWaitingForInput(false);
      setTranscript('');
      console.log('Stopped listening');
    }
  }, [isListening, initializeAudioContext, initializeSpeechRecognition]);

  // Auto-start listening when enabled and not muted
  useEffect(() => {
    // Don't auto-start if already starting
    if (isStartingRef.current) {
      console.log('⏳ Already starting, skipping auto-start');
      return;
    }

    const shouldStart = enabled && !isListening && !isMayaSpeaking && !isMuted;

    if (shouldStart) {
      console.log('🎤 Auto-starting voice recognition...', {
        enabled,
        isListening,
        isMayaSpeaking,
        isMuted
      });
      toggleListening();
    }
  }, [enabled, isListening, isMayaSpeaking, isMuted]);

  // Stop listening when muted
  useEffect(() => {
    if (isMuted && isListening) {
      // Stop listening
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (animationFrameRef.current && typeof window !== 'undefined') {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (micStreamRef.current) {
        micStreamRef.current.getTracks().forEach(track => track.stop());
      }
      setIsListening(false);
      setIsWaitingForInput(false);
      setTranscript('');
      console.log('🔇 Muted - stopped listening');
    } else if (!isMuted && !isListening && enabled && !isMayaSpeaking) {
      // Resume listening when unmuted
      toggleListening();
    }
  }, [isMuted, enabled, isMayaSpeaking]);

  // Keyboard shortcut for muting (Cmd/Ctrl + M)
  useEffect(() => {
    // Only add event listener on client side
    if (typeof window === 'undefined') {
      return;
    }

    const handleKeyPress = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'm') {
        e.preventDefault();
        setIsMuted(prev => !prev);
        console.log('🎛️ Toggled mute via keyboard');
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  // Pause/resume listening when Maya is speaking to prevent feedback loop
  useEffect(() => {
    // Reduced logging to prevent console spam
    // console.log('🔄 Voice state check:', { isMayaSpeaking, isListening, isPausedForMaya, enabled });

    if (isMayaSpeaking && !isPausedForMaya) {
      console.log('🔇 Pausing voice - Maia speaking');

      // 🌀 HANDLE INTERRUPTION in MagicEngine
      magicEngineRef.current.handleInterruption(isListening, isMayaSpeaking);

      setIsPausedForMaya(true);
      isPausedForMayaRef.current = true; // CRITICAL: Update ref for onresult closure
      listeningPauseCount.current++; // Track listening pauses
      setIsWaitingForInput(false);
      setTranscript('🔇 Paused while Maia speaks...');

      // Clear any pending silence timers
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = null;
      }

      // Reset accumulated transcript to prevent old text from being sent
      accumulatedTranscriptRef.current = '';

      // IMMEDIATELY stop recognition while Maia speaks
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort(); // Use abort() instead of stop() to clear buffer immediately
          console.log('💥 Recognition ABORTED for Maia (clears buffer)');
          setIsListening(false);
        } catch (e) {
          console.log('Recognition already stopped');
        }
      }

      // IMMEDIATELY mute microphone stream to prevent feedback
      if (micStreamRef.current) {
        micStreamRef.current.getAudioTracks().forEach(track => {
          track.enabled = false;
          console.log('🔇 Microphone track disabled');
        });
      }
    } else if (!isMayaSpeaking && isPausedForMaya && enabled) {
      console.log('🔊 Resuming voice recognition - Maia finished speaking');
      setIsPausedForMaya(false);
      isPausedForMayaRef.current = false; // CRITICAL: Update ref immediately
      setTranscript('');

      // Clear any accumulated text to prevent sending old speech
      accumulatedTranscriptRef.current = '';

      // Reset expression state to allow new messages to send
      setIsActivelyExpressing(false);
      consecutiveWords.current = 0;

      // Re-enable microphone
      if (micStreamRef.current) {
        micStreamRef.current.getAudioTracks().forEach(track => {
          track.enabled = true;
        });
      }

      // DON'T manually restart here - let the onend handler do it
      // This prevents double-restart conflicts
      console.log('⏳ Waiting for onend auto-restart (preventing double-restart)');
    }
  }, [isMayaSpeaking, isListening, enabled, isPausedForMaya, isMuted, toggleListening]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Only cleanup on client side
      if (typeof window === 'undefined') {
        return;
      }

      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
      }
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (animationFrameRef.current && typeof window !== 'undefined') {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (micStreamRef.current) {
        micStreamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // === ANALYTICS: Export voice metrics ===
  // This function can be called from parent components to retrieve analytics
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).__getVoiceAnalytics = () => ({
        sessionId: sessionId.current,
        sessionDurationMs: Date.now() - sessionStartTime.current,
        exchangeCount: exchangeCount.current,
        totalUserSpeechDurationMs: totalUserSpeechDuration.current,
        totalMaiaSpeechDurationMs: totalMaiaSpeechDuration.current,
        listeningPauses: listeningPauseCount.current,
        interruptions: interruptionCount.current,
        avgUserSpeechDurationMs: exchangeCount.current > 0
          ? totalUserSpeechDuration.current / exchangeCount.current
          : 0,
        avgMaiaSpeechDurationMs: exchangeCount.current > 0
          ? totalMaiaSpeechDuration.current / exchangeCount.current
          : 0
      });
    }
  }, []);

  // Return minimal UI - voice logic only
  return (
    <div className="hidden">
      {/* Living Field - Always breathing, responsive to both voices */}
      <div className="absolute inset-0 -z-10">
        {/* Ambient breathing glow - always present to show the field is alive */}
        <motion.div
          className="w-48 h-48 sm:w-56 sm:h-56 md:w-64 md:h-64 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
          style={{
            background: 'radial-gradient(ellipse, rgba(212,184,150,0.05) 0%, rgba(212,184,150,0.02) 50%, transparent 70%)',
            filter: 'blur(60px)',
          }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />

        {/* User voice glow - golden/amber */}
        <motion.div
          className="w-36 h-36 sm:w-40 sm:h-40 md:w-48 md:h-48 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
          style={{
            background: isListening
              ? `radial-gradient(ellipse, rgba(251,191,36,${0.15 + audioLevel * 0.3}) 0%, rgba(251,191,36,${0.05 + audioLevel * 0.2}) 40%, transparent 70%)`
              : 'radial-gradient(ellipse, rgba(251,191,36,0.03) 0%, transparent 70%)',
            filter: 'blur(40px)',
          }}
          animate={{
            scale: isListening ? (audioLevel > 0.1 ? 1 + audioLevel * 0.8 : [1, 1.4, 1]) : 1,
            opacity: isListening ? (audioLevel > 0.1 ? 0.3 + audioLevel * 0.5 : [0.3, 0.6, 0.3]) : 0.1,
          }}
          transition={{
            duration: audioLevel > 0.1 ? 0.1 : 3,
            repeat: audioLevel > 0.1 ? 0 : Infinity,
            ease: audioLevel > 0.1 ? "linear" : "easeInOut"
          }}
        />

        {/* Maya's voice signature - purple/violet crystalline patterns */}
        {isMayaSpeaking && (
          <motion.div
            className="w-40 h-40 sm:w-48 sm:h-48 md:w-56 md:h-56 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
            style={{
              background: 'radial-gradient(ellipse, rgba(147,51,234,0.3) 0%, rgba(147,51,234,0.1) 40%, transparent 70%)',
              filter: 'blur(35px)',
            }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{
              scale: [1, 1.3, 1.1, 1.2, 1],
              opacity: [0.4, 0.7, 0.5, 0.6, 0.4],
              rotate: [0, 30, -20, 15, 0],
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        )}

        {/* Additional glow when registering words */}
        {isWaitingForInput && (
          <motion.div
            className="w-48 h-48 sm:w-56 sm:h-56 md:w-64 md:h-64 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
            style={{
              background: 'radial-gradient(ellipse, rgba(251,191,36,0.2) 0%, transparent 60%)',
              filter: 'blur(50px)',
            }}
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0, 0.4, 0],
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
            }}
          />
        )}
      </div>

      {/* Ambient particles - always present but subtle */}
      <div className="absolute inset-0 overflow-visible pointer-events-none">
        {sparkles.slice(0, 10).map((sparkle) => (
          <motion.div
            key={`ambient-${sparkle.id}`}
            className="absolute rounded-full"
            style={{
              left: `calc(50% + ${sparkle.x * 1.5}px)`,
              top: `calc(50% + ${sparkle.y * 1.5}px)`,
              width: 1,
              height: 1,
              backgroundColor: 'rgba(212,184,150,0.3)',
              boxShadow: '0 0 2px rgba(212,184,150,0.2)',
            }}
            animate={{
              opacity: [0, 0.3, 0],
              x: [0, sparkle.x * 0.2, sparkle.x * 0.4],
              y: [0, sparkle.y * 0.2, sparkle.y * 0.4],
            }}
            transition={{
              duration: sparkle.duration * 2,
              delay: sparkle.delay * 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>

      {/* User voice sparkles - golden */}
      {isListening && (
        <div className="absolute inset-0 overflow-visible pointer-events-none">
          {sparkles.map((sparkle) => (
            <motion.div
              key={`user-${sparkle.id}`}
              className="absolute rounded-full"
              style={{
                left: `calc(50% + ${sparkle.x}px)`,
                top: `calc(50% + ${sparkle.y}px)`,
                width: isWaitingForInput ? sparkle.size * 2 : sparkle.size,
                height: isWaitingForInput ? sparkle.size * 2 : sparkle.size,
                backgroundColor: isWaitingForInput ? '#fbbf24' : 'rgba(251,191,36,0.6)',
                boxShadow: `0 0 ${sparkle.size * 3}px ${isWaitingForInput ? '#fbbf24' : 'rgba(251,191,36,0.4)'}`,
              }}
              animate={{
                opacity: isWaitingForInput ? [0, 1, 0] : [0, 0.6, 0],
                scale: isWaitingForInput ? [0, 1.5, 0] : [0, 1, 0],
                rotate: isWaitingForInput ? [0, 180, 360] : 0,
              }}
              transition={{
                duration: isWaitingForInput ? sparkle.duration * 0.5 : sparkle.duration,
                delay: isWaitingForInput ? sparkle.delay * 0.5 : sparkle.delay,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          ))}
        </div>
      )}

      {/* Maya's voice sparkles - crystalline purple */}
      {isMayaSpeaking && (
        <div className="absolute inset-0 overflow-visible pointer-events-none">
          {sparkles.map((sparkle, i) => (
            <motion.div
              key={`maya-${sparkle.id}`}
              className="absolute"
              style={{
                left: `calc(50% + ${Math.cos(i * 0.5) * 80}px)`,
                top: `calc(50% + ${Math.sin(i * 0.5) * 80}px)`,
                width: 3,
                height: 3,
              }}
              animate={{
                x: [0, Math.cos(i) * 30, 0],
                y: [0, Math.sin(i) * 30, 0],
                opacity: [0, 0.8, 0],
              }}
              transition={{
                duration: 2,
                delay: i * 0.1,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <div
                className="w-full h-full"
                style={{
                  background: 'linear-gradient(45deg, #9333ea, #ec4899)',
                  boxShadow: '0 0 6px rgba(147,51,234,0.8)',
                  transform: 'rotate(45deg)',
                }}
              />
            </motion.div>
          ))}
        </div>
      )}

      {/* Mute Button */}
      <motion.button
        onClick={() => setIsMuted(!isMuted)}
        className="absolute -left-14 sm:-left-16 top-1/2 transform -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center"
        style={{
          background: isMuted
            ? 'linear-gradient(135deg, rgba(239,68,68,0.15), rgba(239,68,68,0.25))'
            : 'linear-gradient(135deg, rgba(212,184,150,0.05), rgba(212,184,150,0.1))',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          border: isMuted ? '1px solid rgba(239,68,68,0.3)' : '1px solid rgba(212,184,150,0.1)',
          boxShadow: isMuted
            ? '0 0 20px rgba(239,68,68,0.15)'
            : '0 4px 15px rgba(0,0,0,0.1)',
        }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        title={isMuted ? "Unmute (⌘+M)" : "Mute (⌘+M)"}
      >
        {isMuted ? (
          <VolumeX className="w-3 h-3 sm:w-4 sm:h-4" style={{ color: 'rgba(239,68,68,0.8)' }} />
        ) : (
          <Volume2 className="w-3 h-3 sm:w-4 sm:h-4" style={{ color: 'rgba(212,184,150,0.6)' }} />
        )}
      </motion.button>

      {/* Golden Mic Button - Subtle and elegant */}
      <motion.button
        onClick={() => !isMuted && toggleListening()}
        className="relative w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center"
        style={{
          background: isListening
            ? 'linear-gradient(135deg, rgba(212,184,150,0.15), rgba(212,184,150,0.25))'
            : 'linear-gradient(135deg, rgba(212,184,150,0.08), rgba(212,184,150,0.12))',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          border: isListening ? '1px solid rgba(212,184,150,0.3)' : '1px solid rgba(212,184,150,0.15)',
          boxShadow: isMuted
            ? '0 4px 15px rgba(0,0,0,0.1)'
            : isListening
            ? '0 0 30px rgba(212,184,150,0.2), inset 0 0 20px rgba(212,184,150,0.1)'
            : '0 4px 20px rgba(0,0,0,0.2)',
          opacity: isMuted ? 0.5 : 1,
          cursor: isMuted ? 'not-allowed' : 'pointer',
        }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        animate={{
          scale: isListening ? [1, 1.05, 1] : 1,
        }}
        transition={{
          duration: 2,
          repeat: isListening ? Infinity : 0,
          ease: "easeInOut"
        }}
      >
        {isMuted ? (
          <MicOff className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5" style={{ color: 'rgba(239,68,68,0.6)' }} />
        ) : isListening ? (
          <Mic className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5" style={{ color: 'rgba(212,184,150,0.9)' }} />
        ) : (
          <MicOff className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5" style={{ color: 'rgba(212,184,150,0.5)' }} />
        )}

        {/* Pulse animation when listening */}
        {isListening && !isMuted && (
          <>
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{
                background: 'radial-gradient(circle, rgba(251,191,36,0.4), transparent)',
              }}
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 0.2, 0.5],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />

            {/* Audio level indicator - ripples */}
            <motion.div
              className="absolute inset-0 rounded-full border border-amber-400/50"
              style={{
                scale: 1 + audioLevel * 0.3,
              }}
              animate={{
                opacity: audioLevel > 0.1 ? [0.6, 0.2] : 0,
              }}
              transition={{
                duration: 0.3,
                repeat: audioLevel > 0.1 ? Infinity : 0,
              }}
            />
          </>
        )}

        {/* Sparkle effect when registering words */}
        {isWaitingForInput && !isMuted && (
          <motion.div
            className="absolute inset-0 rounded-full"
            animate={{
              boxShadow: [
                '0 0 10px rgba(251,191,36,0.5)',
                '0 0 20px rgba(251,191,36,0.8)',
                '0 0 10px rgba(251,191,36,0.5)',
              ],
            }}
            transition={{
              duration: 0.5,
              repeat: Infinity,
            }}
          />
        )}
      </motion.button>

      {/* Status text */}
      <AnimatePresence>
        {isMuted && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute bottom-14 sm:bottom-16 md:bottom-20 left-1/2 transform -translate-x-1/2 whitespace-nowrap"
          >
            <div className="backdrop-blur-md px-2.5 py-1 sm:px-3 sm:py-1.5 md:px-4 md:py-2 rounded-full text-[10px] sm:text-xs md:text-sm" style={{
              background: 'rgba(239,68,68,0.2)',
              border: '1px solid rgba(239,68,68,0.25)',
              color: '#ef4444'
            }}>
              🔇 Muted - Press ⌘+M to unmute
            </div>
          </motion.div>
        )}
        {transcript && !isMuted && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute bottom-14 sm:bottom-16 md:bottom-20 left-1/2 transform -translate-x-1/2 whitespace-nowrap"
          >
            <div className="backdrop-blur-md px-2.5 py-1 sm:px-3 sm:py-1.5 md:px-4 md:py-2 rounded-full text-[10px] sm:text-xs md:text-sm" style={{
              background: 'rgba(30,30,40,0.3)',
              border: '1px solid rgba(212,184,150,0.15)',
              color: '#d4b896'
            }}>
              {isWaitingForInput ? '✨ Listening...' : transcript}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});