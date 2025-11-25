/**
 * Organic Voice Maya - Sacred sound and visual experience
 * 432 Hz frequencies, pulsing light fields, and sparkle animations
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface OrganicVoiceMayaProps {
  onTranscript: (text: string) => void;
  isProcessing?: boolean;
  enabled?: boolean;
  onConversationPrompt?: (prompt: string) => void;
}

type ConversationMode = 'active' | 'paused' | 'meditative' | 'dormant';
type PresenceMode = 'active' | 'witnessing' | 'meditative' | 'dormant';

interface SilenceContext {
  type: 'thinking' | 'meditating' | 'processing' | 'distracted' | 'unknown';
  duration: number;
  shouldPrompt: boolean;
  promptCount: number;
}

// Sacred geometry sparkle generation
const generateSparkles = (count: number, concentrated = false) => {
  return Array.from({ length: count }, (_, i) => {
    const angle = (i / count) * Math.PI * 2;
    const radius = concentrated ? Math.random() * 30 : Math.random() * 50;
    return {
      id: i,
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius,
      size: Math.random() * 3 + 1,
      duration: Math.random() * 4 + 3,
      delay: Math.random() * 2,
      pulseSpeed: Math.random() * 0.5 + 0.5,
      colorShift: Math.random(),
    };
  });
};

// Gentle presence prompts - minimal and respectful
const GENTLE_PROMPTS = [
  "I'm here.",
  "Still here if you need me.",
  "Take your time.",
];

// User pause commands that trigger quiet mode
const PAUSE_COMMANDS = [
  'one moment maya',
  'give me a moment',
  'let me think',
  "i'm thinking",
  'let me meditate',
  'let me sit with that',
  'pause maya',
  'hold on',
  'let me process',
  'give me space',
  'be quiet maya',
  'silence please',
  'let me reflect',
  'wait maya',
];

// Resume commands to continue conversation
const RESUME_COMMANDS = [
  'okay maya',
  "i'm back",
  "i'm ready",
  "let's continue",
  'maya i\'m here',
  'continue maya',
  'go ahead maya',
  "i'm done thinking",
];

// Maya's acknowledgments for pause commands
const PAUSE_ACKNOWLEDGMENTS: Record<string, string> = {
  moment: "Take your time.",
  thinking: "I'll wait.",
  meditate: "🙏",
  space: "Here when you're ready.",
  process: "Of course.",
  reflect: "Taking space.",
  default: "Of course."
};

export const OrganicVoiceMaya: React.FC<OrganicVoiceMayaProps> = ({
  onTranscript,
  isProcessing = false,
  enabled = true,
  onConversationPrompt
}) => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [transcript, setTranscript] = useState('');
  const [status, setStatus] = useState<'idle' | 'awakening' | 'listening' | 'processing' | 'speaking'>('idle');
  const [sparkles, setSparkles] = useState(() => generateSparkles(20));
  const [isWakeWordMode, setIsWakeWordMode] = useState(true);
  const [lastSpeechTime, setLastSpeechTime] = useState<number>(0);
  const [accumulatedTranscript, setAccumulatedTranscript] = useState('');
  const [lastInteractionTime, setLastInteractionTime] = useState<number>(Date.now());
  const [hasPrompted, setHasPrompted] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const [conversationMode, setConversationMode] = useState<ConversationMode>('active');
  const [presenceMode, setPresenceMode] = useState<PresenceMode>('active');
  const [promptCount, setPromptCount] = useState(0);
  const [pauseAcknowledgment, setPauseAcknowledgment] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number>(0);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const isListeningRef = useRef<boolean>(false);

  // Voice Activity Detection parameters
  const VAD_THRESHOLD = 30;
  const SILENCE_DURATION = 1500;
  const FIRST_PROMPT_DELAY = 45000; // 45 seconds before first gentle check
  const MAX_PROMPTS = 1; // Only one gentle prompt ever
  const DORMANT_TIMEOUT = 300000; // 5 minutes to dormant mode
  const WAKE_WORDS = ['hey maya', 'maya', 'okay maya', 'hi maya'];
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const conversationPromptTimerRef = useRef<NodeJS.Timeout | null>(null);
  const promptIndexRef = useRef<number>(0);

  // Create 432 Hz tone
  const create432HzTone = useCallback(() => {
    if (!audioContextRef.current) return;

    // Create oscillator for 432 Hz
    const oscillator = audioContextRef.current.createOscillator();
    const gainNode = audioContextRef.current.createGain();

    oscillator.frequency.setValueAtTime(432, audioContextRef.current.currentTime);
    oscillator.type = 'sine';

    // Very subtle volume with pulsing rhythm
    gainNode.gain.setValueAtTime(0, audioContextRef.current.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.015, audioContextRef.current.currentTime + 0.5);

    // Create subtle pulsing effect (4-second breathing cycle)
    const pulseAmbient = () => {
      if (!gainNodeRef.current || !audioContextRef.current) return;
      const now = audioContextRef.current.currentTime;
      gainNodeRef.current.gain.cancelScheduledValues(now);
      gainNodeRef.current.gain.setValueAtTime(gainNodeRef.current.gain.value, now);
      gainNodeRef.current.gain.linearRampToValueAtTime(0.025, now + 2);
      gainNodeRef.current.gain.linearRampToValueAtTime(0.015, now + 4);
    };

    // Start pulsing rhythm
    setInterval(pulseAmbient, 4000);

    oscillator.connect(gainNode);
    gainNode.connect(audioContextRef.current.destination);

    oscillatorRef.current = oscillator;
    gainNodeRef.current = gainNode;

    oscillator.start();
  }, []);

  // Play gentle gong sound with harmonics
  const playGongSound = useCallback(() => {
    if (!audioContextRef.current) return;

    const osc1 = audioContextRef.current.createOscillator();
    const osc2 = audioContextRef.current.createOscillator();
    const osc3 = audioContextRef.current.createOscillator();
    const gainNode = audioContextRef.current.createGain();

    // Create harmonic frequencies for tibetan bowl sound
    osc1.frequency.setValueAtTime(108, audioContextRef.current.currentTime); // Low fundamental
    osc2.frequency.setValueAtTime(216, audioContextRef.current.currentTime); // Second harmonic
    osc3.frequency.setValueAtTime(432, audioContextRef.current.currentTime); // 432 Hz harmonic

    osc1.type = 'sine';
    osc2.type = 'sine';
    osc3.type = 'triangle';

    // Envelope for gong sound with longer fade
    gainNode.gain.setValueAtTime(0, audioContextRef.current.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.15, audioContextRef.current.currentTime + 0.05);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContextRef.current.currentTime + 3);

    osc1.connect(gainNode);
    osc2.connect(gainNode);
    osc3.connect(gainNode);
    gainNode.connect(audioContextRef.current.destination);

    osc1.start();
    osc2.start();
    osc3.start();

    osc1.stop(audioContextRef.current.currentTime + 3);
    osc2.stop(audioContextRef.current.currentTime + 3);
    osc3.stop(audioContextRef.current.currentTime + 3);

    // Visual feedback
    setStatus('awakening');
    setTimeout(() => setStatus('listening'), 500);
  }, []);

  // Check for wake words
  const checkWakeWords = useCallback((text: string): boolean => {
    const lowerText = text.toLowerCase().trim();
    return WAKE_WORDS.some(word => lowerText.includes(word));
  }, []);

  // Check for pause commands
  const checkPauseCommand = useCallback((text: string): string | null => {
    const lowerText = text.toLowerCase().trim();
    for (const command of PAUSE_COMMANDS) {
      if (lowerText.includes(command)) {
        // Determine which acknowledgment to use
        if (command.includes('moment')) return PAUSE_ACKNOWLEDGMENTS.moment;
        if (command.includes('think')) return PAUSE_ACKNOWLEDGMENTS.thinking;
        if (command.includes('meditate')) return PAUSE_ACKNOWLEDGMENTS.meditate;
        if (command.includes('space')) return PAUSE_ACKNOWLEDGMENTS.space;
        if (command.includes('process')) return PAUSE_ACKNOWLEDGMENTS.process;
        if (command.includes('reflect')) return PAUSE_ACKNOWLEDGMENTS.reflect;
        return PAUSE_ACKNOWLEDGMENTS.default;
      }
    }
    return null;
  }, []);

  // Check for resume commands
  const checkResumeCommand = useCallback((text: string): boolean => {
    const lowerText = text.toLowerCase().trim();
    return RESUME_COMMANDS.some(command => lowerText.includes(command));
  }, []);

  // Enter pause mode
  const enterPauseMode = useCallback((acknowledgment: string) => {
    console.log('Entering pause mode');
    setConversationMode('paused');
    setPresenceMode('witnessing');
    setPauseAcknowledgment(acknowledgment);
    setHasPrompted(false);
    setPromptCount(0);

    // Clear any pending timers
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
    }
    if (conversationPromptTimerRef.current) {
      clearTimeout(conversationPromptTimerRef.current);
    }

    // Show acknowledgment briefly
    setTimeout(() => setPauseAcknowledgment(null), 2000);
  }, []);

  // Exit pause mode
  const exitPauseMode = useCallback(() => {
    console.log('Exiting pause mode');
    setConversationMode('active');
    setPresenceMode('active');
    setLastInteractionTime(Date.now());
    setHasPrompted(false);
    setPromptCount(0);
  }, []);

  // Detect silence context
  const detectSilenceContext = useCallback((): SilenceContext => {
    const duration = Date.now() - lastInteractionTime;

    // If in pause mode, never prompt
    if (conversationMode === 'paused') {
      return { type: 'meditating', duration, shouldPrompt: false, promptCount };
    }

    // If user mentioned meditation/thinking, respect that
    const lastTranscript = accumulatedTranscript.toLowerCase();
    if (lastTranscript.includes('meditat') || lastTranscript.includes('breath') ||
        lastTranscript.includes('quiet') || lastTranscript.includes('reflect')) {
      return { type: 'meditating', duration, shouldPrompt: false, promptCount };
    }

    // If we've already prompted once, don't prompt again
    if (promptCount >= MAX_PROMPTS) {
      return { type: 'processing', duration, shouldPrompt: false, promptCount };
    }

    // Only prompt after significant silence and early in conversation
    if (duration > FIRST_PROMPT_DELAY && promptCount === 0) {
      return { type: 'unknown', duration, shouldPrompt: true, promptCount };
    }

    return { type: 'thinking', duration, shouldPrompt: false, promptCount };
  }, [lastInteractionTime, conversationMode, accumulatedTranscript, promptCount]);

  // Process accumulated transcript after silence
  const processTranscript = useCallback(() => {
    if (accumulatedTranscript.trim() && !isWakeWordMode) {
      onTranscript(accumulatedTranscript.trim());
      setAccumulatedTranscript('');
      setStatus('processing');
      setLastInteractionTime(Date.now());
      setHasPrompted(false);
    }
  }, [accumulatedTranscript, isWakeWordMode, onTranscript]);

  // Send gentle presence prompt - minimal and respectful
  const sendGentlePrompt = useCallback(() => {
    const context = detectSilenceContext();

    if (!context.shouldPrompt || conversationMode === 'paused') {
      return;
    }

    const prompt = GENTLE_PROMPTS[Math.floor(Math.random() * GENTLE_PROMPTS.length)];

    console.log('Sending gentle presence prompt:', prompt);
    setShowPrompt(true);
    setHasPrompted(true);
    setPromptCount(prev => prev + 1);

    // Send prompt to parent component if handler exists
    if (onConversationPrompt) {
      onConversationPrompt(prompt);
    }

    // Hide prompt after 3 seconds
    setTimeout(() => setShowPrompt(false), 3000);

    // Update presence mode to more subtle
    setPresenceMode('witnessing');
  }, [detectSilenceContext, conversationMode, onConversationPrompt]);

  // Update ref when isListening changes
  useEffect(() => {
    isListeningRef.current = isListening;
  }, [isListening]);

  // Initialize speech recognition
  const initializeSpeechRecognition = useCallback(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      console.error('Speech recognition not supported');
      return false;
    }

    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      console.log('Speech recognition started');
      setIsListening(true);
      if (!isWakeWordMode) {
        playGongSound();
      }
      // Increase sparkle density when listening
      setSparkles(generateSparkles(50, true));
    };

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

      const currentTranscript = finalTranscript || interimTranscript;

      if (currentTranscript.trim()) {
        setTranscript(currentTranscript);
        setLastSpeechTime(Date.now());

        // Check for wake words
        if (isWakeWordMode && checkWakeWords(currentTranscript)) {
          console.log('Wake word detected! Switching to active listening mode.');
          setIsWakeWordMode(false);
          setAccumulatedTranscript('');
          setTranscript('');
          setLastInteractionTime(Date.now());
          setHasPrompted(false);
          setPromptCount(0);
          setConversationMode('active');
          setPresenceMode('active');
          playGongSound();
          // Clear the wake word from display after a moment
          setTimeout(() => setTranscript(''), 500);
          return;
        }

        // Check for pause commands when in active mode
        if (!isWakeWordMode && conversationMode === 'active') {
          const pauseAck = checkPauseCommand(currentTranscript);
          if (pauseAck) {
            console.log('Pause command detected');
            enterPauseMode(pauseAck);
            setTranscript('');
            setAccumulatedTranscript('');
            return;
          }
        }

        // Check for resume commands when paused
        if (conversationMode === 'paused' && checkResumeCommand(currentTranscript)) {
          console.log('Resume command detected');
          exitPauseMode();
          setTranscript('');
          setAccumulatedTranscript('');
          return;
        }

        // Accumulate transcript in active listening mode (not when paused)
        if (!isWakeWordMode && conversationMode === 'active' && finalTranscript) {
          setAccumulatedTranscript(prev => prev + ' ' + finalTranscript);
          setLastInteractionTime(Date.now());
          setHasPrompted(false); // Reset prompt flag when user speaks
          setPromptCount(0); // Reset prompt count when user speaks
          setPresenceMode('active'); // Return to active presence

          // Clear existing timers
          if (silenceTimerRef.current) {
            clearTimeout(silenceTimerRef.current);
          }
          if (conversationPromptTimerRef.current) {
            clearTimeout(conversationPromptTimerRef.current);
          }

          // Set new silence timer
          silenceTimerRef.current = setTimeout(() => {
            processTranscript();
          }, SILENCE_DURATION);
        }
      }
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      if (isListeningRef.current && (event.error === 'no-speech' || event.error === 'aborted')) {
        // Restart recognition to maintain continuous listening
        setTimeout(() => {
          if (recognitionRef.current && isListeningRef.current) {
            try {
              recognitionRef.current.start();
              console.log('Recognition restarted after error');
            } catch (e) {
              console.log('Recognition already started');
            }
          }
        }, 100);
      }
    };

    recognition.onend = () => {
      console.log('Recognition ended, isListening:', isListeningRef.current);
      // Restart if still in listening mode for continuous operation
      if (isListeningRef.current) {
        setTimeout(() => {
          try {
            if (recognitionRef.current && isListeningRef.current) {
              recognitionRef.current.start();
              console.log('Recognition restarted for continuous listening');
            }
          } catch (e) {
            console.log('Recognition already started:', e);
          }
        }, 100);
      }
    };

    recognitionRef.current = recognition;
    return true;
  }, [isWakeWordMode, checkWakeWords, playGongSound, processTranscript]);

  // Initialize audio context
  const initializeAudioContext = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      micStreamRef.current = stream;

      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();

      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);

      analyserRef.current.fftSize = 256;

      // Start 432 Hz tone
      create432HzTone();

      // Monitor audio levels
      const monitorAudio = () => {
        if (!analyserRef.current) return;

        const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
        analyserRef.current.getByteFrequencyData(dataArray);

        const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
        setAudioLevel(average);
        setIsSpeaking(average > VAD_THRESHOLD);

        animationFrameRef.current = requestAnimationFrame(monitorAudio);
      };

      monitorAudio();
      return true;
    } catch (error) {
      console.error('Error accessing microphone:', error);
      return false;
    }
  }, [create432HzTone]);

  // Toggle voice activation
  const toggleVoiceActivation = useCallback(async () => {
    if (isListening) {
      console.log('Stopping voice activation');
      // Stop everything with fade out
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        recognitionRef.current = null;
      }
      if (oscillatorRef.current && gainNodeRef.current && audioContextRef.current) {
        const now = audioContextRef.current.currentTime;
        gainNodeRef.current.gain.linearRampToValueAtTime(0, now + 0.5);
        setTimeout(() => oscillatorRef.current?.stop(), 500);
      }
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (micStreamRef.current) {
        micStreamRef.current.getTracks().forEach(track => track.stop());
      }
      setIsListening(false);
      setStatus('idle');
      setIsWakeWordMode(true);
      // Reduce sparkles when idle
      setSparkles(generateSparkles(20));
    } else {
      console.log('Starting voice activation');
      // Start everything
      const audioReady = await initializeAudioContext();
      const speechReady = initializeSpeechRecognition();

      if (audioReady && speechReady && recognitionRef.current) {
        try {
          recognitionRef.current.start();
          console.log('Recognition started successfully');
          // Play gong on first activation
          playGongSound();
        } catch (e) {
          console.error('Error starting recognition:', e);
        }
      }
    }
  }, [isListening, initializeAudioContext, initializeSpeechRecognition, playGongSound]);

  // Update status based on processing and listening states
  useEffect(() => {
    if (isProcessing) {
      setStatus('speaking');
      setLastInteractionTime(Date.now());
      // Don't reset wake word mode while still listening
      if (isListening) {
        setTimeout(() => {
          setIsWakeWordMode(true);
          setAccumulatedTranscript('');
          setTranscript('');
          setHasPrompted(false);
        }, 3000); // Wait 3 seconds after speaking to reset
      }
    } else if (isListening) {
      setStatus('listening');
    }
  }, [isProcessing, isListening]);

  // Monitor for extended silence and update presence modes
  useEffect(() => {
    if (!isWakeWordMode && isListening && !isProcessing && conversationMode === 'active') {
      // Clear existing timer
      if (conversationPromptTimerRef.current) {
        clearTimeout(conversationPromptTimerRef.current);
      }

      // Set timer for gentle prompt after longer delay
      conversationPromptTimerRef.current = setTimeout(() => {
        const context = detectSilenceContext();
        if (context.shouldPrompt) {
          sendGentlePrompt();
        }
      }, FIRST_PROMPT_DELAY);

      // Set timer for dormant mode after 5 minutes
      const dormantTimer = setTimeout(() => {
        if (conversationMode === 'active') {
          setPresenceMode('dormant');
        }
      }, DORMANT_TIMEOUT);

      return () => {
        if (conversationPromptTimerRef.current) {
          clearTimeout(conversationPromptTimerRef.current);
        }
        clearTimeout(dormantTimer);
      };
    }
  }, [isWakeWordMode, isListening, isProcessing, conversationMode, detectSilenceContext, sendGentlePrompt]);

  // Monitor silence for auto-processing
  useEffect(() => {
    if (lastSpeechTime && !isWakeWordMode && Date.now() - lastSpeechTime > SILENCE_DURATION) {
      processTranscript();
    }
  }, [lastSpeechTime, isWakeWordMode, processTranscript]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
      }
      if (conversationPromptTimerRef.current) {
        clearTimeout(conversationPromptTimerRef.current);
      }
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (oscillatorRef.current) {
        oscillatorRef.current.stop();
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (micStreamRef.current) {
        micStreamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* Background light cloud - positioned behind and below right of mic */}
      <div className="absolute bottom-[-20px] right-[-20px] -z-10 pointer-events-none">
        <motion.div
          className="w-64 h-64 rounded-full"
          style={{
            background: isListening
              ? 'radial-gradient(ellipse, rgba(147,51,234,0.3) 0%, rgba(79,70,229,0.2) 40%, transparent 70%)'
              : 'radial-gradient(ellipse, rgba(147,51,234,0.15) 0%, rgba(79,70,229,0.1) 40%, transparent 70%)',
            filter: 'blur(40px)',
          }}
          animate={{
            scale: isListening ? [1, 1.3, 1] : [1, 1.1, 1],
            opacity: isListening ? [0.4, 0.6, 0.4] : [0.2, 0.3, 0.2],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      {/* Holoflower center pulsing field */}
      {isListening && (
        <div className="absolute inset-0 -z-20 pointer-events-none">
          <motion.div
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
            animate={{
              scale: [1, 1.5, 1],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "linear"
            }}
          >
            <svg width="400" height="400" viewBox="0 0 400 400" className="opacity-20">
              <defs>
                <radialGradient id="holoGradient">
                  <stop offset="0%" stopColor="#9333ea" stopOpacity="0.8" />
                  <stop offset="50%" stopColor="#6366f1" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                </radialGradient>
              </defs>
              {[0, 60, 120, 180, 240, 300].map((rotation, i) => (
                <motion.ellipse
                  key={i}
                  cx="200"
                  cy="200"
                  rx="150"
                  ry="50"
                  fill="url(#holoGradient)"
                  transform={`rotate(${rotation} 200 200)`}
                  animate={{
                    rx: [150, 170, 150],
                    ry: [50, 60, 50],
                  }}
                  transition={{
                    duration: 4,
                    delay: i * 0.2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
              ))}
            </svg>
          </motion.div>
        </div>
      )}

      {/* Sparkle field concentrated around mic */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {sparkles.map((sparkle) => {
          const colors = ['#9333ea', '#6366f1', '#ffffff'];
          const color = colors[Math.floor(sparkle.colorShift * 3)];
          return (
            <motion.div
              key={sparkle.id}
              className="absolute rounded-full"
              style={{
                left: `calc(50% + ${sparkle.x}px)`,
                top: `calc(50% + ${sparkle.y}px)`,
                width: sparkle.size,
                height: sparkle.size,
                backgroundColor: color,
                boxShadow: `0 0 ${sparkle.size * 3}px ${color}, 0 0 ${sparkle.size * 6}px ${color}`,
              }}
              animate={{
                opacity: isListening ? [0, 1, 0] : [0, 0.5, 0],
                scale: [0.5, 1.5, 0.5],
                x: isListening ? [0, sparkle.x * 0.3, sparkle.x * 0.6] : [0, sparkle.x * 0.2, sparkle.x * 0.4],
                y: isListening ? [0, sparkle.y * 0.3, sparkle.y * 0.6] : [0, sparkle.y * 0.2, sparkle.y * 0.4],
              }}
              transition={{
                duration: sparkle.duration * sparkle.pulseSpeed,
                delay: sparkle.delay,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          );
        })}
      </div>

      {/* Organic translucent mic button */}
      <motion.button
        onClick={toggleVoiceActivation}
        className="relative z-10"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <div className="relative w-32 h-32">
          {/* Organic translucent shape background */}
          <motion.div
            className="absolute inset-0"
            style={{
              background: conversationMode === 'paused'
                ? 'radial-gradient(circle, rgba(147,51,234,0.03) 0%, rgba(79,70,229,0.05) 40%, rgba(147,51,234,0.01) 100%)'
                : presenceMode === 'dormant'
                ? 'radial-gradient(circle, rgba(107,114,128,0.05) 0%, rgba(75,85,99,0.02) 100%)'
                : isListening
                ? 'radial-gradient(circle, rgba(147,51,234,0.1) 0%, rgba(79,70,229,0.2) 40%, rgba(147,51,234,0.05) 100%)'
                : 'radial-gradient(circle, rgba(107,114,128,0.1) 0%, rgba(75,85,99,0.05) 100%)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(147,51,234,0.3)',
              borderRadius: isListening ? '40% 60% 60% 40% / 60% 40% 60% 40%' : '50%',
            }}
            animate={{
              rotate: conversationMode === 'paused' ? 0 : isListening ? [0, 5, -5, 0] : 0,
              scale: conversationMode === 'paused' ? 0.95 : presenceMode === 'dormant' ? 0.9 : isListening ? [1, 1.05, 1] : 1,
              borderRadius: isListening ? [
                '40% 60% 60% 40% / 60% 40% 60% 40%',
                '60% 40% 40% 60% / 40% 60% 40% 60%',
                '50% 50% 50% 50% / 50% 50% 50% 50%',
                '40% 60% 60% 40% / 60% 40% 60% 40%'
              ] : '50%',
            }}
            transition={{
              duration: conversationMode === 'paused' ? 8 : presenceMode === 'dormant' ? 20 : isListening ? 4 : 12,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />

          {/* Pulsing rings when active */}
          <AnimatePresence>
            {isListening && (
              <>
                {[0, 0.3, 0.6].map((delay, i) => (
                  <motion.div
                    key={i}
                    className="absolute inset-0 rounded-full border border-amber-400/30"
                    initial={{ scale: 1, opacity: 0.5 }}
                    animate={{
                      scale: [1, 1.5, 2],
                      opacity: [0.5, 0.2, 0]
                    }}
                    transition={{
                      duration: 3,
                      delay,
                      repeat: Infinity,
                      ease: "easeOut"
                    }}
                  />
                ))}
              </>
            )}
          </AnimatePresence>

          {/* Audio level visualization */}
          {isListening && (
            <motion.div
              className="absolute inset-2 rounded-full"
              style={{
                background: `radial-gradient(circle, rgba(147,51,234,${audioLevel / 255}) 0%, transparent 70%)`,
              }}
              animate={{
                scale: 1 + (audioLevel / 255) * 0.3
              }}
              transition={{ type: "spring", stiffness: 300 }}
            />
          )}

          {/* Inner sparkles visible through translucent button */}
          {isListening && sparkles.slice(0, 8).map((sparkle) => {
            const colors = ['rgba(147,51,234,0.8)', 'rgba(99,102,241,0.8)', 'rgba(255,255,255,0.9)'];
            const color = colors[Math.floor(sparkle.colorShift * 3)];
            return (
              <motion.div
                key={`inner-${sparkle.id}`}
                className="absolute rounded-full"
                style={{
                  left: `calc(50% + ${sparkle.x * 0.4}px)`,
                  top: `calc(50% + ${sparkle.y * 0.4}px)`,
                  width: sparkle.size * 0.5,
                  height: sparkle.size * 0.5,
                  backgroundColor: color,
                  boxShadow: `0 0 ${sparkle.size * 2}px ${color}`,
                }}
                animate={{
                  opacity: [0, 0.8, 0],
                  scale: [0, 1.5, 0],
                }}
                transition={{
                  duration: 2 * sparkle.pulseSpeed,
                  delay: sparkle.delay * 0.5,
                  repeat: Infinity,
                }}
              />
            );
          })}

          {/* Microphone Icon - organic and flowing */}
          <div className="absolute inset-0 flex items-center justify-center">
            <svg
              className={`w-12 h-12 transition-all duration-500 ${
                conversationMode === 'paused' ? 'text-amber-200 opacity-40' :
                presenceMode === 'dormant' ? 'text-gray-500 opacity-30' :
                isListening ? 'text-amber-300' : 'text-gray-400'
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
            >
              <motion.path
                d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"
                animate={{
                  strokeDasharray: isListening ? [0, 100] : [100, 0],
                }}
                transition={{ duration: 1 }}
              />
              <motion.path
                d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"
                animate={{
                  opacity: isListening ? [0.5, 1, 0.5] : 1,
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity
                }}
              />
            </svg>
          </div>
        </div>
      </motion.button>

      {/* Status text with glow */}
      <motion.div
        className="absolute -bottom-12 text-center"
        animate={{ opacity: 1 }}
        initial={{ opacity: 0 }}
      >
        <p className={`text-sm font-light ${
          conversationMode === 'paused' ? 'text-amber-300 opacity-50' :
          presenceMode === 'dormant' ? 'text-gray-600' :
          isListening ? 'text-amber-400' : 'text-gray-500'
        }`}>
          {conversationMode === 'paused' && '🌙 Taking space'}
          {conversationMode !== 'paused' && status === 'idle' && 'Touch to begin'}
          {conversationMode !== 'paused' && status === 'awakening' && '🔔 Awakening...'}
          {conversationMode !== 'paused' && status === 'listening' && (
            isWakeWordMode
              ? '🌙 Say "Hey Maya" to wake me'
              : (presenceMode === 'dormant' ? '💤 Resting...' :
                 presenceMode === 'witnessing' ? '🌟 Here with you' :
                 isSpeaking ? '✨ I\'m listening...' : '👂 Listening')
          )}
          {conversationMode !== 'paused' && status === 'processing' && '💫 Maya reflects...'}
          {conversationMode !== 'paused' && status === 'speaking' && '🎵 Maya speaks...'}
        </p>
      </motion.div>

      {/* Live transcript with organic shape */}
      <AnimatePresence>
        {transcript && (
          <motion.div
            className="absolute -bottom-24 left-1/2 transform -translate-x-1/2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div className="px-6 py-3 rounded-2xl backdrop-blur-md bg-white/10 border border-white/20">
              <p className="text-sm text-amber-300">{transcript}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Conversation prompt display */}
      <AnimatePresence>
        {showPrompt && (
          <motion.div
            className="absolute -top-24 left-1/2 transform -translate-x-1/2"
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
          >
            <div className="px-6 py-3 rounded-2xl backdrop-blur-md bg-amber-500/10 border border-amber-400/20">
              <p className="text-sm text-amber-200 opacity-70">
                {GENTLE_PROMPTS[promptIndexRef.current % GENTLE_PROMPTS.length]}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pause acknowledgment display */}
      <AnimatePresence>
        {pauseAcknowledgment && (
          <motion.div
            className="absolute top-24 left-1/2 transform -translate-x-1/2"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
          >
            <div className="px-4 py-2 rounded-xl backdrop-blur-sm bg-amber-900/20 border border-amber-500/20">
              <p className="text-xs text-amber-300 opacity-60">
                {pauseAcknowledgment === '🙏' ? pauseAcknowledgment : pauseAcknowledgment}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};