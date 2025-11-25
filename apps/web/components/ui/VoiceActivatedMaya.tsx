/**
 * Voice-Activated Maya Conversation
 * Continuous listening with automatic speech detection
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface VoiceActivatedMayaProps {
  onTranscript: (text: string) => void;
  isProcessing?: boolean;
  enabled?: boolean;
}

export const VoiceActivatedMaya: React.FC<VoiceActivatedMayaProps> = ({
  onTranscript,
  isProcessing = false,
  enabled = true
}) => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [transcript, setTranscript] = useState('');
  const [status, setStatus] = useState<'idle' | 'listening' | 'processing' | 'speaking'>('idle');

  const recognitionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number>(0);
  const silenceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const finalTranscriptRef = useRef<string>('');

  // Voice Activity Detection parameters
  const VAD_THRESHOLD = 30; // Minimum audio level to consider as speech
  const SILENCE_DURATION = 1500; // ms of silence before processing
  const MIN_SPEECH_DURATION = 300; // Minimum ms of speech to process
  const WAKE_WORDS = ['hey maya', 'maya', 'okay maya']; // Wake word activation

  const speechStartTimeRef = useRef<number>(0);
  const isSpeakingRef = useRef(false);

  // Initialize Web Speech API
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
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      console.log('🎤 Voice recognition started');
      setIsListening(true);
      setStatus('listening');
      finalTranscriptRef.current = '';
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

      if (finalTranscript) {
        finalTranscriptRef.current += finalTranscript;
        setTranscript(finalTranscriptRef.current);

        // Check for wake words
        const transcriptLower = finalTranscriptRef.current.toLowerCase().trim();
        const hasWakeWord = WAKE_WORDS.some(wake => transcriptLower.startsWith(wake));

        if (hasWakeWord && transcriptLower.length > 10) {
          // Remove wake word and process immediately
          const withoutWake = WAKE_WORDS.reduce((text, wake) =>
            text.replace(new RegExp(`^${wake}\\s*`, 'i'), ''), finalTranscriptRef.current);

          if (withoutWake.trim()) {
            processSpeech(withoutWake.trim());
            return;
          }
        }

        // Reset silence timer on new final speech
        if (silenceTimeoutRef.current) {
          clearTimeout(silenceTimeoutRef.current);
        }

        // Set timer to process after silence
        silenceTimeoutRef.current = setTimeout(() => {
          if (finalTranscriptRef.current.trim()) {
            processSpeech(finalTranscriptRef.current.trim());
          }
        }, SILENCE_DURATION);
      } else if (interimTranscript) {
        setTranscript(finalTranscriptRef.current + interimTranscript);
      }
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      if (event.error === 'no-speech' || event.error === 'audio-capture') {
        // Restart recognition on these errors
        setTimeout(() => {
          if (enabled && recognitionRef.current) {
            try {
              recognitionRef.current.start();
            } catch (e) {
              console.log('Restarting recognition...');
            }
          }
        }, 100);
      }
    };

    recognition.onend = () => {
      console.log('🔇 Recognition ended');
      // Auto-restart if still enabled
      if (enabled && !isProcessing) {
        setTimeout(() => {
          try {
            recognition.start();
          } catch (e) {
            console.log('Restarting recognition...');
          }
        }, 100);
      }
    };

    recognitionRef.current = recognition;
    return true;
  }, [enabled, isProcessing]);

  // Process completed speech
  const processSpeech = useCallback((text: string) => {
    if (!text || isProcessing) return;

    console.log('💬 Processing speech:', text);
    setStatus('processing');
    setTranscript('');
    finalTranscriptRef.current = '';

    // Send to parent component
    onTranscript(text);

    // Clear silence timeout
    if (silenceTimeoutRef.current) {
      clearTimeout(silenceTimeoutRef.current);
      silenceTimeoutRef.current = null;
    }
  }, [onTranscript, isProcessing]);

  // Initialize audio context for voice activity detection
  const initializeAudioContext = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      micStreamRef.current = stream;
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();

      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);

      analyserRef.current.fftSize = 256;
      analyserRef.current.smoothingTimeConstant = 0.8;

      // Start monitoring audio levels
      monitorAudioLevels();

      return true;
    } catch (error) {
      console.error('Error accessing microphone:', error);
      return false;
    }
  }, []);

  // Monitor audio levels for visual feedback
  const monitorAudioLevels = useCallback(() => {
    if (!analyserRef.current) return;

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);

    const checkAudioLevel = () => {
      if (!analyserRef.current) return;

      analyserRef.current.getByteFrequencyData(dataArray);

      // Calculate average volume
      let sum = 0;
      for (let i = 0; i < dataArray.length; i++) {
        sum += dataArray[i];
      }
      const average = sum / dataArray.length;

      setAudioLevel(average);

      // Detect speech start/stop
      if (average > VAD_THRESHOLD && !isSpeakingRef.current) {
        isSpeakingRef.current = true;
        speechStartTimeRef.current = Date.now();
        setIsSpeaking(true);
      } else if (average < VAD_THRESHOLD && isSpeakingRef.current) {
        const speechDuration = Date.now() - speechStartTimeRef.current;
        if (speechDuration > MIN_SPEECH_DURATION) {
          // Valid speech detected
          isSpeakingRef.current = false;
          setIsSpeaking(false);
        }
      }

      animationFrameRef.current = requestAnimationFrame(checkAudioLevel);
    };

    checkAudioLevel();
  }, []);

  // Start/stop voice activation
  const toggleVoiceActivation = useCallback(async () => {
    if (isListening) {
      // Stop everything
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (micStreamRef.current) {
        micStreamRef.current.getTracks().forEach(track => track.stop());
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      setIsListening(false);
      setStatus('idle');
    } else {
      // Start everything
      const audioReady = await initializeAudioContext();
      const speechReady = initializeSpeechRecognition();

      if (audioReady && speechReady && recognitionRef.current) {
        try {
          recognitionRef.current.start();
        } catch (e) {
          console.log('Recognition already started');
        }
      }
    }
  }, [isListening, initializeAudioContext, initializeSpeechRecognition]);

  // Auto-start on mount if enabled
  useEffect(() => {
    if (enabled && !isListening) {
      toggleVoiceActivation();
    }

    return () => {
      // Cleanup
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (micStreamRef.current) {
        micStreamRef.current.getTracks().forEach(track => track.stop());
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      if (silenceTimeoutRef.current) {
        clearTimeout(silenceTimeoutRef.current);
      }
    };
  }, []);

  // Update status based on processing state
  useEffect(() => {
    if (isProcessing) {
      setStatus('speaking');
    } else if (isListening) {
      setStatus('listening');
    }
  }, [isProcessing, isListening]);

  return (
    <div className="relative">
      {/* Main Control Button */}
      <motion.button
        onClick={toggleVoiceActivation}
        className={`relative w-24 h-24 rounded-full flex items-center justify-center transition-all ${
          isListening
            ? 'bg-gradient-to-br from-amber-500 to-indigo-600'
            : 'bg-gradient-to-br from-gray-600 to-gray-700'
        }`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {/* Pulsing rings when active */}
        <AnimatePresence>
          {isListening && (
            <>
              <motion.div
                className="absolute inset-0 rounded-full bg-amber-500 opacity-25"
                initial={{ scale: 1 }}
                animate={{ scale: 1.5, opacity: 0 }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <motion.div
                className="absolute inset-0 rounded-full bg-indigo-500 opacity-25"
                initial={{ scale: 1 }}
                animate={{ scale: 1.3, opacity: 0 }}
                transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
              />
              {/* Ambient presence - subtle breathing effect */}
              <motion.div
                className="absolute inset-2 rounded-full bg-gradient-to-br from-amber-400/10 to-indigo-400/10"
                animate={{
                  scale: [1, 1.05, 1],
                  opacity: [0.3, 0.5, 0.3]
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            </>
          )}
        </AnimatePresence>

        {/* Audio level visualization */}
        {isListening && (
          <motion.div
            className="absolute inset-0 rounded-full bg-white opacity-20"
            animate={{
              scale: 1 + (audioLevel / 255) * 0.5
            }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          />
        )}

        {/* Microphone Icon */}
        <svg
          className={`w-10 h-10 z-10 ${isListening ? 'text-white' : 'text-gray-300'}`}
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
          <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
        </svg>
      </motion.button>

      {/* Status Text */}
      <div className="mt-4 text-center">
        <motion.p
          className="text-sm font-medium"
          animate={{ opacity: 1 }}
          initial={{ opacity: 0 }}
        >
          {status === 'idle' && 'Click to start conversation'}
          {status === 'listening' && (isSpeaking ? '🎤 Listening...' : '⏸ Ready')}
          {status === 'processing' && '💭 Maya is thinking...'}
          {status === 'speaking' && '🗣 Maya is speaking...'}
        </motion.p>
      </div>

      {/* Live Transcript */}
      <AnimatePresence>
        {transcript && (
          <motion.div
            className="mt-4 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <p className="text-sm text-gray-700 dark:text-gray-300">
              {transcript}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Instructions */}
      {!isListening && (
        <div className="mt-6 text-xs text-gray-500 text-center max-w-xs mx-auto">
          <p>Voice-activated conversation mode</p>
          <p className="mt-1">Just speak naturally - Maya listens and responds automatically</p>
        </div>
      )}
    </div>
  );
};