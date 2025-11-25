'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Mic, MicOff, Sparkles, Play, Pause } from 'lucide-react';

interface HybridVoiceInputProps {
  onSendMessage: (message: string) => void;
  onStartVoice: () => void;
  onStopVoice: () => void;
  onPauseResponse?: () => void;
  onResumeResponse?: () => void;
  isVoiceActive: boolean;
  isResponsePlaying?: boolean;
  disabled?: boolean;
  placeholder?: string;
  transcript?: string;
  isListening?: boolean;
  showProsodyIndicator?: boolean;
  prosodyData?: any;
  phase?: string; // Elemental phase: Fire, Water, Earth, Air, Aether
  symbolHint?: string; // Active symbol: Moon, Stag, etc.
}

// Elemental aura colors
const auraColors: Record<string, string> = {
  fire: 'from-orange-500 to-pink-600',
  water: 'from-blue-500 to-cyan-600',
  earth: 'from-green-600 to-emerald-500',
  air: 'from-indigo-500 to-amber-600',
  aether: 'from-yellow-400 to-amber-600',
  mirror: 'from-indigo-500 to-amber-600',
  shadow: 'from-amber-600 to-pink-600',
  anima: 'from-pink-500 to-orange-500',
  self: 'from-amber-500 to-yellow-500',
  default: 'from-amber-500 to-indigo-600'
};

export default function HybridVoiceInput({
  onSendMessage,
  onStartVoice,
  onStopVoice,
  onPauseResponse,
  onResumeResponse,
  isVoiceActive,
  isResponsePlaying = false,
  disabled = false,
  placeholder = "Speak to Maia or type your reflection...",
  transcript = '',
  isListening = false,
  showProsodyIndicator = false,
  prosodyData,
  phase = 'default',
  symbolHint
}: HybridVoiceInputProps) {
  const [message, setMessage] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [mode, setMode] = useState<'text' | 'voice'>('text');
  const [audioLevel, setAudioLevel] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [showControls, setShowControls] = useState(false);
  
  // Speech detection state
  const [speechStarted, setSpeechStarted] = useState(false);
  const [silenceTimer, setSilenceTimer] = useState<NodeJS.Timeout | null>(null);
  const [consecutiveSilentFrames, setConsecutiveSilentFrames] = useState(0);
  const lastTranscriptRef = useRef<string>('');
  // Save draft to localStorage
  useEffect(() => {
    if (message && mode === 'text') {
      localStorage.setItem('soullab_draft', message);
    }
  }, [message, mode]);

  // Load draft on mount
  useEffect(() => {
    const draft = localStorage.getItem('soullab_draft');
    if (draft) {
      setMessage(draft);
    }
  }, []);

  // Real-time audio level monitoring
  useEffect(() => {
    if (!isListening) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      setAudioLevel(0);
      return;
    }

    const initAudioAnalyser = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        streamRef.current = stream;

        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        audioContextRef.current = audioContext;

        const source = audioContext.createMediaStreamSource(stream);
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;
        analyser.smoothingTimeConstant = 0.8;
        
        source.connect(analyser);
        analyserRef.current = analyser;

        const dataArray = new Uint8Array(analyser.frequencyBinCount);

        const updateLevel = () => {
          if (!analyserRef.current) return;
          
          analyserRef.current.getByteTimeDomainData(dataArray);
          
          // Calculate RMS (Root Mean Square) for smoother visualization
          let sum = 0;
          for (let i = 0; i < dataArray.length; i++) {
            const normalized = (dataArray[i] - 128) / 128;
            sum += normalized * normalized;
          }
          const rms = Math.sqrt(sum / dataArray.length);
          
          // Smooth the audio level
          const smoothedLevel = audioLevel * 0.7 + rms * 0.3;
          setAudioLevel(smoothedLevel);
          
          // Silence detection based on audio level
          if (mode === 'voice' && speechStarted) {
            const SILENCE_THRESHOLD = 0.01; // Very quiet audio level
            
            if (smoothedLevel < SILENCE_THRESHOLD) {
              setConsecutiveSilentFrames(prev => {
                const newCount = prev + 1;
                // ~60 frames per second, so 120 frames = 2 seconds of silence
                if (newCount > 120 && transcript && transcript.trim()) {
                  console.log('Audio silence detected, auto-stopping');
                  // Trigger stop and send
                  onStopVoice();
                  setMode('text');
                  onSendMessage(transcript.trim());
                  setMessage('');
                  lastTranscriptRef.current = '';
                  setSpeechStarted(false);
                  return 0;
                }
                return newCount;
              });
            } else {
              // Reset silence counter if sound detected
              setConsecutiveSilentFrames(0);
            }
          }
          
          animationRef.current = requestAnimationFrame(updateLevel);
        };

        updateLevel();
      } catch (err) {
        console.error('Failed to initialize audio analyser:', err);
      }
    };

    initAudioAnalyser();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [isListening, mode, speechStarted, transcript, audioLevel, onStopVoice, onSendMessage]);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage('');
      localStorage.removeItem('soullab_draft');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleVoiceToggle = () => {
    if (isVoiceActive) {
      onStopVoice();
      setMode('text');
      // Reset speech detection state
      setSpeechStarted(false);
      setConsecutiveSilentFrames(0);
      lastTranscriptRef.current = '';
      if (silenceTimer) {
        clearTimeout(silenceTimer);
        setSilenceTimer(null);
      }
    }
  };

  const getPlaceholderText = () => {
    if (mode === 'voice' && isListening) {
      return "🎤 Maia is listening...";
    }
    
    // Symbol-based prompts take priority
    if (symbolHint) {
      return `Ask Maia about the ${symbolHint}...`;
    }
    
    // Phase-based dynamic placeholders
    if (phase) {
      const phasePrompts: Record<string, string> = {
        fire: "Ignite a question...",
        water: "Flow with your feelings...",
        earth: "Ground your thoughts here...",
        air: "Let your ideas take flight...",
        aether: "Touch the divine mystery...",
        mirror: "Share what you're seeing...",
        shadow: "Explore what's hidden...",
        anima: "Connect with your intuition...",
        self: "Integrate your understanding..."
      };
      return phasePrompts[phase.toLowerCase()] || placeholder;
    }
    
    if (prosodyData?.currentPhase) {
      // Adaptive placeholder based on Jungian phase from prosody
      const phasePrompts = {
        mirror: "Share what you're seeing...",
        shadow: "Explore what's hidden...",
        anima: "Connect with your intuition...",
        self: "Integrate your understanding..."
      };
      return phasePrompts[prosodyData.currentPhase] || placeholder;
    }
    
    return placeholder;
  };

  // Get current aura color based on phase
  const getAuraColor = () => {
    const currentPhase = phase?.toLowerCase() || prosodyData?.currentPhase?.toLowerCase() || 'default';
    return auraColors[currentPhase] || auraColors.default;
  };

  return (
    <div className="relative w-full max-w-4xl mx-auto">
      {/* Prosody Indicator (ChatGPT-style emotion awareness) */}
      <AnimatePresence>
        {showProsodyIndicator && prosodyData && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute -top-8 left-0 right-0 flex justify-center"
          >
            <div className="px-3 py-1 bg-gradient-to-r from-amber-500/10 to-indigo-500/10 rounded-full border border-amber-500/20">
              <span className="text-xs text-amber-600 font-medium">
                {prosodyData.emotion || 'Sensing your energy...'}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Input Container */}
      <motion.div
        className={`
          relative flex items-end gap-2 p-3 
          bg-white dark:bg-neutral-900 
          border rounded-2xl transition-all duration-300
          ${isFocused ? 'border-amber-500 ring-2 ring-amber-500/20' : 'border-neutral-200 dark:border-neutral-700'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
        animate={{
          scale: isFocused ? 1.01 : 1,
        }}
      >
        {/* Ceremonial Aura Glow */}
        <motion.div
          className={`
            absolute inset-0 rounded-2xl pointer-events-none
            bg-gradient-to-r ${getAuraColor()}
            blur-xl opacity-20
          `}
          animate={{
            opacity: isListening ? [0.2, 0.4, 0.2] : message ? [0.15, 0.25, 0.15] : 0.1,
            scale: isListening ? [1, 1.08, 1] : message ? [1, 1.03, 1] : 1,
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        {/* Elastic Textarea (Claude-style) */}
        <textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={getPlaceholderText()}
          disabled={disabled || (mode === 'voice' && isListening)}
          className={`
            flex-1 resize-none bg-transparent outline-none
            text-neutral-900 dark:text-neutral-100
            placeholder-neutral-400 dark:placeholder-neutral-500
            ${mode === 'voice' && isListening ? 'cursor-not-allowed' : ''}
          `}
          rows={1}
          style={{ minHeight: '40px', maxHeight: '120px' }}
        />

        {/* Voice Mode Indicator */}
        <AnimatePresence>
          {mode === 'voice' && isListening && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute inset-0 pointer-events-none"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 to-indigo-500/5 rounded-2xl" />
              <div className="absolute inset-0 border-2 border-amber-500/20 rounded-2xl animate-pulse" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Control Buttons */}
        <div className="flex items-center gap-2">
          {/* Voice Controls (when response is playing) */}
          <AnimatePresence>
            {isResponsePlaying && onPauseResponse && onResumeResponse && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex gap-1"
              >
                <button
                  onClick={onPauseResponse}
                  className="p-2 rounded-full bg-orange-500 text-white hover:bg-orange-600 transition-colors"
                  aria-label="Pause"
                >
                  <Pause className="w-4 h-4" />
                </button>
                <button
                  onClick={onResumeResponse}
                  className="p-2 rounded-full bg-green-500 text-white hover:bg-green-600 transition-colors"
                  aria-label="Resume"
                >
                  <Play className="w-4 h-4" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Mic Button with Voice-Reactive Waves */}
          <div className="relative flex items-center justify-center">
            {/* Voice-reactive listening waves */}
            <AnimatePresence>
              {isListening && (
                <>
                  {[1, 2, 3].map((ring) => (
                    <motion.div
                      key={ring}
                      className={`
                        absolute inset-0 rounded-full 
                        border-2 ${audioLevel > 0.1 ? 'border-pink-400' : 'border-amber-400'}
                      `}
                      initial={{ scale: 1, opacity: 0 }}
                      animate={{
                        scale: 1 + (audioLevel * ring * 2.5),
                        opacity: [0.6 - (ring * 0.15), 0],
                      }}
                      transition={{
                        duration: 1.5 + (ring * 0.3),
                        repeat: Infinity,
                        ease: "easeOut",
                        delay: ring * 0.2,
                      }}
                      style={{
                        width: 40,
                        height: 40,
                      }}
                    />
                  ))}
                </>
              )}
            </AnimatePresence>

            <motion.button
              onClick={handleVoiceToggle}
              disabled={disabled}
              className={`
                relative z-10 p-2.5 rounded-full transition-all duration-300
                ${isVoiceActive 
                  ? 'bg-gradient-to-r from-red-500 to-pink-600 text-white' 
                  : 'bg-gradient-to-r from-amber-500 to-indigo-600 text-white hover:shadow-lg'
                }
                ${disabled ? 'cursor-not-allowed opacity-50' : ''}
              `}
              whileTap={{ scale: 0.95 }}
              animate={isListening ? {
                scale: 1 + (audioLevel * 0.3),
              } : {}}
              transition={{
                duration: 0.1,
                ease: "easeOut"
              }}
              aria-label={isVoiceActive ? "Stop recording" : "Start recording"}
            >
              {isVoiceActive ? (
                <MicOff className="w-5 h-5" />
              ) : (
                <Mic className="w-5 h-5" />
              )}
            </motion.button>
          </div>

          {/* Send Button (glows with voice rhythm while listening) */}
          <motion.button
            onClick={() => handleSubmit()}
            disabled={!message.trim() || disabled}
            className={`
              p-2.5 rounded-full transition-all duration-300
              ${message.trim() 
                ? 'bg-gradient-to-r from-orange-500 to-pink-600 text-white shadow-lg' 
                : 'bg-neutral-200 dark:bg-neutral-700 text-neutral-400 dark:text-neutral-500'
              }
              ${!message.trim() || disabled ? 'cursor-not-allowed' : 'hover:shadow-xl'}
            `}
            whileTap={{ scale: 0.95 }}
            animate={
              isListening 
                ? {
                    scale: 1 + (audioLevel * 0.2),
                    opacity: 0.6 + (audioLevel * 0.4),
                  }
                : message.trim() 
                ? {
                    boxShadow: [
                      "0 0 0 0 rgba(251, 146, 60, 0)",
                      "0 0 0 10px rgba(251, 146, 60, 0.1)",
                      "0 0 0 0 rgba(251, 146, 60, 0)"
                    ]
                  } 
                : {}
            }
            transition={
              isListening
                ? { duration: 0.1, ease: "easeOut" }
                : { duration: 2, repeat: Infinity, ease: "easeInOut" }
            }
            aria-label="Send message"
          >
            <Send className="w-5 h-5" />
          </motion.button>

          {/* Sacred Touch (optional enhancement) */}
          {showControls && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-2.5 rounded-full bg-gradient-to-r from-yellow-500 to-amber-600 text-white hover:shadow-lg transition-all"
              aria-label="Sacred mode"
            >
              <Sparkles className="w-5 h-5" />
            </motion.button>
          )}
        </div>
      </motion.div>

      {/* Voice Transcript Display (when in voice mode) */}
      <AnimatePresence>
        {mode === 'voice' && transcript && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-2 p-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg"
          >
            <p className="text-sm text-amber-700 dark:text-amber-300">
              {transcript}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}