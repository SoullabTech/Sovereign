"use client";

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Mic, MicOff, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import HybridMicIndicator, { HybridMicFallback } from './HybridMicIndicator';

interface MicInputWithTorusProps {
  onTranscription?: (text: string) => void;
  onSubmit?: (text: string) => void;
  disabled?: boolean;
  className?: string;
  placeholder?: string;
}

interface AudioChunk {
  data: Blob;
  timestamp: number;
}

export default function MicInputWithTorus({ 
  onTranscription, 
  onSubmit, 
  disabled = false, 
  className = "",
  placeholder = "Speak to Maya or type your message..."
}: MicInputWithTorusProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcribedText, setTranscribedText] = useState('');
  const [audioLevel, setAudioLevel] = useState(0);
  const [hasWebGLSupport, setHasWebGLSupport] = useState(true);
  const [permissionStatus, setPermissionStatus] = useState<'granted' | 'denied' | 'prompt'>('prompt');
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number>();
  const chunksRef = useRef<AudioChunk[]>([]);

  // Check WebGL support on mount
  useEffect(() => {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    setHasWebGLSupport(!!gl);
  }, []);

  // Audio level monitoring
  const updateAudioLevel = useCallback(() => {
    if (analyserRef.current && isRecording) {
      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
      analyserRef.current.getByteFrequencyData(dataArray);
      const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;
      setAudioLevel(average / 255);
      animationFrameRef.current = requestAnimationFrame(updateAudioLevel);
    }
  }, [isRecording]);

  // Start recording
  const startRecording = async () => {
    try {
      // Request microphone permission
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 44100
        }
      });

      streamRef.current = stream;
      setPermissionStatus('granted');

      // Set up audio analysis for visual feedback
      audioContextRef.current = new AudioContext();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
      source.connect(analyserRef.current);

      // Set up recording
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported('audio/webm;codecs=opus') 
          ? 'audio/webm;codecs=opus'
          : 'audio/webm'
      });

      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push({
            data: event.data,
            timestamp: Date.now()
          });
        }
      };

      mediaRecorder.onstop = async () => {
        setIsProcessing(true);
        
        try {
          // Combine audio chunks
          const audioBlob = new Blob(
            chunksRef.current.map(chunk => chunk.data),
            { type: 'audio/webm' }
          );

          // Send for transcription
          await transcribeAudio(audioBlob);
        } catch (error) {
          console.error('Transcription failed:', error);
        } finally {
          setIsProcessing(false);
          cleanup();
        }
      };

      // Start recording
      mediaRecorder.start(100); // Collect data every 100ms
      setIsRecording(true);
      updateAudioLevel();

    } catch (error) {
      console.error('Microphone access failed:', error);
      setPermissionStatus('denied');
      
      // You could fallback to browser's built-in speech recognition here
      startBrowserSpeechRecognition();
    }
  };

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    }
  };

  // Clean up resources
  const cleanup = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    
    mediaRecorderRef.current = null;
    analyserRef.current = null;
    chunksRef.current = [];
    setAudioLevel(0);
  };

  // Transcribe audio using backend API
  const transcribeAudio = async (audioBlob: Blob) => {
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');
      formData.append('userId', 'current-user'); // Replace with actual user ID
      formData.append('language', 'en');

      const response = await fetch('/api/oracle/voice/transcribe', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error(`Transcription failed: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.text) {
        setTranscribedText(result.text);
        onTranscription?.(result.text);
      }
    } catch (error) {
      console.error('Transcription API failed:', error);
      // Fallback could be implemented here
    }
  };

  // Fallback to browser speech recognition
  const startBrowserSpeechRecognition = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      
      recognition.onstart = () => {
        setIsRecording(true);
      };
      
      recognition.onresult = (event) => {
        let finalTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        
        if (finalTranscript) {
          setTranscribedText(finalTranscript);
          onTranscription?.(finalTranscript);
        }
      };
      
      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsRecording(false);
      };
      
      recognition.onend = () => {
        setIsRecording(false);
      };
      
      recognition.start();
    }
  };

  // Handle submit
  const handleSubmit = () => {
    if (transcribedText.trim() && onSubmit) {
      onSubmit(transcribedText);
      setTranscribedText('');
    }
  };

  // Toggle recording
  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return (
    <div className={`relative flex items-center space-x-4 ${className}`}>
      {/* Hybrid Mic Indicator with 3D Torus + Waveform */}
      <div className="relative" onClick={toggleRecording}>
        {hasWebGLSupport ? (
          <HybridMicIndicator 
            isRecording={isRecording} 
            isProcessing={isProcessing}
            audioStream={streamRef.current || undefined}
            audioLevel={audioLevel}
          />
        ) : (
          <HybridMicFallback 
            isRecording={isRecording} 
            isProcessing={isProcessing}
            audioLevel={audioLevel}
          />
        )}
      </div>

      {/* Input Area */}
      <div className="flex-1 space-y-2">
        {/* Transcribed Text Display */}
        <AnimatePresence>
          {transcribedText && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-sacred-gold/10 border border-sacred-gold/20 rounded-lg p-3"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm text-sacred-gold/90 flex-1">
                  {transcribedText}
                </p>
                <Button
                  size="sm"
                  onClick={handleSubmit}
                  className="ml-2 bg-sacred-gold hover:bg-sacred-gold/90 text-black"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Status Indicators */}
        <AnimatePresence>
          {(isRecording || isProcessing) && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center space-x-2 text-sm text-sacred-gold/70"
            >
              {isRecording && (
                <>
                  <div className="flex items-center space-x-2">
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ repeat: Infinity, duration: 1 }}
                      className="w-2 h-2 bg-red-500 rounded-full"
                    />
                    <span>Listening...</span>
                  </div>
                  {audioLevel > 0 && (
                    <div className="flex-1 h-1 bg-sacred-gold/20 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-sacred-gold"
                        initial={{ width: 0 }}
                        animate={{ width: `${audioLevel * 100}%` }}
                        transition={{ duration: 0.1 }}
                      />
                    </div>
                  )}
                </>
              )}
              
              {isProcessing && (
                <div className="flex items-center space-x-2">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1 }}
                    className="w-4 h-4"
                  >
                    <div className="w-full h-full border-2 border-sacred-gold/30 border-t-sacred-gold rounded-full" />
                  </motion.div>
                  <span>Processing speech...</span>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Permission Error */}
        <AnimatePresence>
          {permissionStatus === 'denied' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="bg-red-500/10 border border-red-500/20 rounded-lg p-3"
            >
              <p className="text-sm text-red-400">
                Microphone access denied. Please enable microphone permissions or use the text input.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// Type declarations for browser APIs
declare global {
  interface Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
  }
}