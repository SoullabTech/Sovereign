/**
 * Fixed Voice-Activated Maya Conversation
 * Prevents double abort issues with proper state management
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface VoiceActivatedMayaProps {
  onTranscript: (text: string) => void;
  isProcessing?: boolean;
  enabled?: boolean;
  isMayaSpeaking?: boolean;
  mayaVoiceState?: any;
}

export interface VoiceActivatedMayaRef {
  toggleListening: () => void;
  startListening: () => void;
  stopListening: () => void;
  isListening: boolean;
  status: string;
  audioLevel: number;
}

export const VoiceActivatedMaya = React.forwardRef<VoiceActivatedMayaRef, VoiceActivatedMayaProps>(({
  onTranscript,
  isProcessing = false,
  enabled = true,
  isMayaSpeaking = false,
  mayaVoiceState
}, ref) => {
  const [isListening, setIsListening] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [transcript, setTranscript] = useState('');
  const [status, setStatus] = useState<'idle' | 'listening' | 'processing' | 'speaking'>('idle');

  const recognitionRef = useRef<any>(null);
  const isRestartingRef = useRef(false);
  const isStoppingRef = useRef(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number>(0);
  const silenceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const finalTranscriptRef = useRef<string>('');

  // Voice Activity Detection parameters
  const SILENCE_DURATION = 1500; // ms of silence before processing

  // Initialize Web Speech API - SINGLETON PATTERN
  const initializeSpeechRecognition = useCallback(() => {
    // Prevent multiple instances
    if (recognitionRef.current) {
      console.log('Recognition already initialized');
      return true;
    }

    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      console.error('Speech recognition not supported');
      alert('Voice input requires Chrome or Edge browser');
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
      isRestartingRef.current = false;
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

        // Clear existing timer
        if (silenceTimeoutRef.current) {
          clearTimeout(silenceTimeoutRef.current);
        }

        // Set timer to process after silence
        silenceTimeoutRef.current = setTimeout(() => {
          const message = finalTranscriptRef.current.trim();
          if (message) {
            processSpeech(message);
          }
        }, SILENCE_DURATION);
      } else if (interimTranscript) {
        setTranscript(finalTranscriptRef.current + interimTranscript);
      }
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);

      // Only restart on specific recoverable errors
      if (event.error === 'no-speech') {
        // Silently continue - this is normal
        return;
      }

      if (event.error === 'aborted') {
        // Don't restart if we're intentionally stopping
        if (!isStoppingRef.current) {
          console.log('Recognition aborted unexpectedly');
        }
        return;
      }

      // For other errors, show user feedback
      if (event.error === 'not-allowed') {
        alert('Microphone permission denied. Please enable in browser settings.');
        setIsListening(false);
        setStatus('idle');
      }
    };

    recognition.onend = () => {
      console.log('🔇 Recognition ended');
      setIsListening(false);

      // Only auto-restart if enabled and not already restarting
      if (enabled && !isProcessing && !isRestartingRef.current && !isStoppingRef.current) {
        isRestartingRef.current = true;
        setTimeout(() => {
          if (recognitionRef.current && enabled) {
            startRecognition();
          }
        }, 200);
      } else {
        setStatus('idle');
      }
    };

    recognitionRef.current = recognition;
    return true;
  }, [enabled, isProcessing]);

  // Safe start recognition
  const startRecognition = useCallback(() => {
    if (!recognitionRef.current) {
      if (!initializeSpeechRecognition()) {
        return;
      }
    }

    try {
      isStoppingRef.current = false;
      recognitionRef.current.start();
    } catch (error) {
      // Already started, that's ok
      console.log('Recognition already active');
    }
  }, [initializeSpeechRecognition]);

  // Safe stop recognition
  const stopRecognition = useCallback(() => {
    if (recognitionRef.current) {
      try {
        isStoppingRef.current = true;
        recognitionRef.current.stop();
      } catch (error) {
        console.log('Recognition already stopped');
      }
    }

    // Clear any pending timeouts
    if (silenceTimeoutRef.current) {
      clearTimeout(silenceTimeoutRef.current);
      silenceTimeoutRef.current = null;
    }
  }, []);

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

    const updateLevels = () => {
      if (!analyserRef.current) return;

      analyserRef.current.getByteFrequencyData(dataArray);

      // Calculate average volume
      let sum = 0;
      for (let i = 0; i < dataArray.length; i++) {
        sum += dataArray[i];
      }
      const average = sum / dataArray.length;

      setAudioLevel(Math.min(100, average * 1.5)); // Scale for visual

      animationFrameRef.current = requestAnimationFrame(updateLevels);
    };

    updateLevels();
  }, []);

  // Toggle listening
  const toggleListening = useCallback(async () => {
    if (isListening) {
      stopRecognition();
      setStatus('idle');
    } else {
      // Request permissions and initialize
      const audioReady = await initializeAudioContext();
      if (!audioReady) {
        alert('Microphone access required for voice input');
        return;
      }

      startRecognition();
    }
  }, [isListening, startRecognition, stopRecognition, initializeAudioContext]);

  // Handle Maya's speaking state
  useEffect(() => {
    if (isProcessing) {
      setStatus('speaking');
    } else if (isListening) {
      setStatus('listening');
    } else {
      setStatus('idle');
    }
  }, [isProcessing, isListening]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopRecognition();

      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }

      if (micStreamRef.current) {
        micStreamRef.current.getTracks().forEach(track => track.stop());
      }

      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [stopRecognition]);

  // Auto-start if enabled
  useEffect(() => {
    if (enabled && !isListening && !isProcessing) {
      // Small delay to prevent mount issues
      const timer = setTimeout(() => {
        toggleListening();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [enabled]);

  // Expose methods for external control
  React.useImperativeHandle(ref, () => ({
    toggleListening,
    startListening: startRecognition,
    stopListening: stopRecognition,
    isListening,
    status,
    audioLevel
  }), [toggleListening, startRecognition, stopRecognition, isListening, status, audioLevel]);

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-40">
      {/* Status Text - Minimal UI */}
      <AnimatePresence mode="wait">
        <motion.div
          key={status}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="text-center mb-2"
        >
          {status === 'listening' && (
            <p className="text-white/80 text-sm font-medium">Listening...</p>
          )}
          {status === 'processing' && (
            <p className="text-blue-400 text-sm">Processing...</p>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Transcript Display */}
      {transcript && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="max-w-md mx-auto mb-2"
        >
          <p className="text-sm text-white/80 bg-black/50 backdrop-blur-sm rounded-lg px-4 py-2">
            {transcript}
          </p>
        </motion.div>
      )}
    </div>
  );
});