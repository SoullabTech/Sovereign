'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Volume2, Loader } from 'lucide-react';

interface MayaVoiceInterfaceProps {
  sessionId: string;
  onTranscript?: (text: string) => void;
  onMayaResponse?: (response: string) => void;
}

export default function MayaVoiceInterface({
  sessionId,
  onTranscript,
  onMayaResponse
}: MayaVoiceInterfaceProps) {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isMayaSpeaking, setIsMayaSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [audioLevel, setAudioLevel] = useState(0);

  const recognitionRef = useRef<any>(null);
  const audioQueueRef = useRef<HTMLAudioElement[]>([]);
  const isPlayingRef = useRef(false);
  const streamRef = useRef<MediaStream | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number>(0);

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition;
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

        const currentTranscript = finalTranscript || interimTranscript;
        setTranscript(currentTranscript);

        if (finalTranscript) {
          handleFinalTranscript(finalTranscript.trim());
        }
      };
      
      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        if (event.error !== 'no-speech' && event.error !== 'aborted') {
          setError(`Recognition error: ${event.error}`);
        }
        
        // Auto-restart on aborted
        if (event.error === 'aborted' && isListening) {
          setTimeout(() => {
            if (recognitionRef.current && isListening) {
              try {
                recognitionRef.current.start();
              } catch (e) {
                console.error('Restart failed:', e);
              }
            }
          }, 100);
        }
      };
      
      recognition.onend = () => {
        // Auto-restart if still listening
        if (isListening) {
          try {
            recognition.start();
          } catch (e) {
            console.error('Recognition restart failed:', e);
          }
        }
      };

      try {
        recognition.start();
      } catch (e) {
        console.error('Recognition start failed:', e);
      }
    }
  }, [isListening]);

  return <div>Maya Voice Interface Placeholder</div>;
}

export default MayaVoiceInterface;