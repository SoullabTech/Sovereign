import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Voice analytics tracking
const voiceAnalytics = {
  track: (event: string) => {
    console.log('🔊 Voice Analytics:', { event, timestamp: Date.now() });
  }
};

interface SimpleVoiceMicProps {
  onTranscript: (transcript: string) => void;
  pauseListening?: boolean;
  className?: string;
  enableVAD?: boolean; // Voice Activity Detection
}

export const SimpleVoiceMic: React.FC<SimpleVoiceMicProps> = ({
  onTranscript,
  pauseListening = false,
  className = "",
  enableVAD = false
}) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [vadActive, setVadActive] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const recognitionRef = useRef<any>(null);
  const hasSentRef = useRef(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const vadTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const startListening = useCallback(() => {
    if (pauseListening) return;

    const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
    if (!SpeechRecognition) {
      console.error('Speech recognition not supported');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = enableVAD; // Continuous for VAD, single for manual
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      console.log('🎤 Voice recognition started');
      voiceAnalytics.track('voice_attempt_started');
      setIsListening(true);
      hasSentRef.current = false;
      setTranscript('');
    };

    recognition.onresult = (event: any) => {
      let finalTranscript = '';

      for (let i = 0; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        }
      }

      if (finalTranscript && !hasSentRef.current) {
        console.log('🎯 Final transcript:', finalTranscript);
        voiceAnalytics.track('voice_transcript_received', {
          transcriptLength: finalTranscript.trim().length
        });
        hasSentRef.current = true;
        setTranscript(finalTranscript);
        onTranscript(finalTranscript.trim());
      }
    };

    recognition.onend = () => {
      console.log('🎤 Voice recognition ended');
      setIsListening(false);
    };

    recognition.onerror = (event: any) => {
      console.error('Voice recognition error:', event.error);
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, [onTranscript, pauseListening]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  }, []);

  // Voice Activity Detection Setup
  const setupVAD = useCallback(async () => {
    if (!enableVAD) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;

      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);

      const detectVoice = () => {
        if (!analyserRef.current || !enableVAD) return;

        const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
        analyserRef.current.getByteFrequencyData(dataArray);

        // Calculate average volume
        const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
        setAudioLevel(average);

        // Voice threshold detection
        if (average > 30 && !isListening && !pauseListening) {
          console.log('🎙️ Voice detected, starting recording');
          setVadActive(true);
          startListening();

          // Clear any existing timeout
          if (vadTimeoutRef.current) {
            clearTimeout(vadTimeoutRef.current);
          }
        } else if (average < 20 && isListening && enableVAD) {
          // Set timeout for silence detection
          if (!vadTimeoutRef.current) {
            vadTimeoutRef.current = setTimeout(() => {
              console.log('🔇 Silence detected, stopping recording');
              setVadActive(false);
              stopListening();
              vadTimeoutRef.current = null;
            }, 2000); // 2 seconds of silence
          }
        } else if (average > 30 && vadTimeoutRef.current) {
          // Clear timeout if voice continues
          clearTimeout(vadTimeoutRef.current);
          vadTimeoutRef.current = null;
        }

        animationFrameRef.current = requestAnimationFrame(detectVoice);
      };

      detectVoice();
    } catch (error) {
      console.error('Failed to setup VAD:', error);
    }
  }, [enableVAD, isListening, pauseListening, startListening, stopListening]);

  // Initialize VAD on mount
  useEffect(() => {
    if (enableVAD) {
      setupVAD();
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      if (vadTimeoutRef.current) {
        clearTimeout(vadTimeoutRef.current);
      }
    };
  }, [enableVAD, setupVAD]);

  // Auto-stop when paused
  useEffect(() => {
    if (pauseListening && isListening) {
      stopListening();
    }
  }, [pauseListening, isListening, stopListening]);

  // Generate sparkle particles
  const sparkles = Array.from({ length: 12 }, (_, i) => ({
    id: i,
    delay: Math.random() * 2,
    duration: 2 + Math.random() * 2,
    size: Math.random() * 4 + 2,
    x: Math.random() * 100 - 50,
    y: Math.random() * 100 - 50
  }));

  return (
    <div className={`fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 ${className}`}>
      <AnimatePresence>
        {/* Transcript Display */}
        {transcript && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute bottom-full mb-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-[#D4B896]/90 to-[#8B7B6B]/90 backdrop-blur-md rounded-2xl px-6 py-3 text-center shadow-2xl border border-white/20 min-w-[200px] max-w-xs"
          >
            <div className="text-white font-medium text-sm">
              {transcript}
            </div>
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-gradient-to-br from-[#D4B896]/90 to-[#8B7B6B]/90 rotate-45 border-r border-b border-white/20" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Mic Button Container */}
      <div className="relative">
        {/* Glow Effect */}
        <motion.div
          animate={{
            scale: isListening ? [1, 1.2, 1] : 1,
            opacity: isListening ? [0.5, 0.8, 0.5] : 0.3
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute inset-0 bg-gradient-to-r from-[#D4B896] to-[#8B7B6B] rounded-full blur-2xl"
          style={{
            width: '120px',
            height: '120px',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)'
          }}
        />

        {/* Sparkles */}
        {isListening && (
          <div className="absolute inset-0 pointer-events-none">
            {sparkles.map((sparkle) => (
              <motion.div
                key={sparkle.id}
                initial={{ opacity: 0, scale: 0 }}
                animate={{
                  opacity: [0, 1, 0],
                  scale: [0, 1, 0],
                  x: sparkle.x,
                  y: sparkle.y
                }}
                transition={{
                  duration: sparkle.duration,
                  delay: sparkle.delay,
                  repeat: Infinity,
                  ease: "easeOut"
                }}
                className="absolute left-1/2 top-1/2"
                style={{
                  width: `${sparkle.size}px`,
                  height: `${sparkle.size}px`
                }}
              >
                <div className="w-full h-full bg-gradient-to-r from-[#D4B896] to-[#FFD700] rounded-full" />
              </motion.div>
            ))}
          </div>
        )}

        {/* Mic Button */}
        <motion.button
          onClick={enableVAD ? undefined : (isListening ? stopListening : startListening)}
          disabled={pauseListening}
          whileHover={{ scale: enableVAD ? 1 : 1.05 }}
          whileTap={{ scale: enableVAD ? 1 : 0.95 }}
          className={`relative z-10 w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 ${
            enableVAD && !pauseListening
              ? 'cursor-default'
              : pauseListening
              ? 'cursor-not-allowed'
              : 'cursor-pointer'
          }`}
          style={{
            background: isListening
              ? 'linear-gradient(135deg, #FF6B6B 0%, #C44569 100%)'
              : vadActive
              ? 'linear-gradient(135deg, #D4B896 0%, #8B7B6B 100%)'
              : 'linear-gradient(135deg, #D4B896 0%, #B8A080 100%)',
            boxShadow: isListening
              ? '0 8px 32px rgba(212, 184, 150, 0.6), inset 0 2px 4px rgba(255, 255, 255, 0.3)'
              : '0 4px 24px rgba(212, 184, 150, 0.4), inset 0 2px 4px rgba(255, 255, 255, 0.2)',
            opacity: pauseListening ? 0.5 : 1
          }}
        >
          {/* Inner Circle */}
          <motion.div
            animate={{
              scale: isListening ? [1, 0.9, 1] : 1
            }}
            transition={{
              duration: 0.5,
              repeat: isListening ? Infinity : 0,
              ease: "easeInOut"
            }}
            className="w-14 h-14 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center"
          >
            {/* Icon */}
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="text-white"
            >
              {isListening ? (
                // Stop icon
                <rect x="6" y="6" width="12" height="12" rx="2" fill="currentColor" />
              ) : (
                // Mic icon
                <>
                  <path
                    d="M12 1C10.34 1 9 2.34 9 4V12C9 13.66 10.34 15 12 15C13.66 15 15 13.66 15 12V4C15 2.34 13.66 1 12 1Z"
                    fill="currentColor"
                  />
                  <path
                    d="M19 12C19 15.53 16.39 18.44 13 18.93V22H11V18.93C7.61 18.44 5 15.53 5 12H7C7 14.76 9.24 17 12 17C14.76 17 17 14.76 17 12H19Z"
                    fill="currentColor"
                  />
                </>
              )}
            </svg>
          </motion.div>
        </motion.button>

        {/* VAD Indicator */}
        {enableVAD && (
          <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-center">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-2 text-xs text-white/70"
            >
              {vadActive ? (
                <>
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <span>Voice Activated</span>
                </>
              ) : (
                <>
                  <div className="w-2 h-2 bg-gray-400 rounded-full" />
                  <span>Listening for voice...</span>
                </>
              )}
            </motion.div>
          </div>
        )}

        {/* Audio Level Visualizer (for VAD) */}
        {enableVAD && audioLevel > 0 && (
          <motion.div
            className="absolute inset-0 pointer-events-none"
            style={{
              width: `${100 + audioLevel / 2}px`,
              height: `${100 + audioLevel / 2}px`,
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)'
            }}
          >
            <div
              className="w-full h-full rounded-full border-2 border-[#D4B896]/30"
              style={{
                borderWidth: `${Math.min(audioLevel / 20, 4)}px`
              }}
            />
          </motion.div>
        )}
      </div>
    </div>
  );
};