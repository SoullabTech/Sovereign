'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Mic, MicOff, Keyboard, Loader2 } from 'lucide-react';
import { unlockAudio } from '@/lib/audio/audioUnlock';
import { useToastContext } from '@/components/system/ToastProvider';

interface HybridInputProps {
  onSend: (text: string) => void;
  onTranscript?: (text: string) => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}

export default function HybridInput({ 
  onSend, 
  onTranscript,
  disabled = false,
  placeholder = 'Type or speak to Maia...',
  className = ''
}: HybridInputProps) {
  const [value, setValue] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [volume, setVolume] = useState(0);
  const [mode, setMode] = useState<'idle' | 'typing' | 'listening'>('idle');
  const [error, setError] = useState<string | null>(null);
  
  const { showToast } = useToastContext();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<any>(null);
  const rafRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [value, transcript, interimTranscript]);

  // Update mode based on activity
  useEffect(() => {
    if (isListening) {
      setMode('listening');
    } else if (value.length > 0) {
      setMode('typing');
    } else {
      setMode('idle');
    }
  }, [isListening, value]);

  // Speech recognition setup
  useEffect(() => {
    if (!isListening) return;

    const SpeechRecognition = 
      (window as any).SpeechRecognition || 
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.warn('SpeechRecognition not supported');
      showToast('Voice input not supported in this browser', { type: 'warning' });
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setError(null);
    };

    recognition.onresult = (event: any) => {
      let interim = '';
      let final = '';
      
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const transcriptChunk = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          final += transcriptChunk;
        } else {
          interim += transcriptChunk;
        }
      }
      
      setInterimTranscript(interim);
      
      if (final.trim()) {
        setTranscript(prev => prev + ' ' + final);
        setInterimTranscript('');
        
        // Auto-send after a complete sentence
        if (final.trim().match(/[.!?]$/)) {
          const fullTranscript = (transcript + ' ' + final).trim();
          if (fullTranscript) {
            onSend(fullTranscript);
            setTranscript('');
            setInterimTranscript('');
            // Keep listening for next input
          }
        }
      }
      
      // Notify parent of transcript updates
      if (onTranscript) {
        onTranscript(interim || final);
      }
    };

    recognition.onerror = (event: any) => {
      console.error('❌ Recognition error:', event.error);
      
      let errorMessage = 'Voice input error';
      switch (event.error) {
        case 'no-speech':
          errorMessage = 'No speech detected';
          break;
        case 'audio-capture':
          errorMessage = 'Microphone not available';
          break;
        case 'not-allowed':
          errorMessage = 'Microphone access denied';
          break;
        case 'network':
          errorMessage = 'Network error';
          break;
      }
      
      setError(errorMessage);
      showToast(errorMessage, { type: 'error' });
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
      
      // Send any remaining transcript
      const finalTranscript = (transcript + ' ' + interimTranscript).trim();
      if (finalTranscript) {
        onSend(finalTranscript);
        setTranscript('');
        setInterimTranscript('');
      }
    };

    recognition.start();
    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        recognitionRef.current = null;
      }
    };
  }, [isListening, transcript, interimTranscript, onSend, onTranscript, showToast]);

  // Volume animation for mic glow
  useEffect(() => {
    if (!isListening) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      setVolume(0);
      return;
    }

    async function startAudioAnalysis() {
      try {
        // Get microphone stream
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        streamRef.current = stream;
        
        // Create audio context and analyser
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        audioContextRef.current = audioContext;
        
        const source = audioContext.createMediaStreamSource(stream);
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;
        analyser.smoothingTimeConstant = 0.8;
        
        source.connect(analyser);
        analyserRef.current = analyser;
        
        const dataArray = new Uint8Array(analyser.frequencyBinCount);

        const tick = () => {
          if (!analyserRef.current) return;
          
          analyser.getByteTimeDomainData(dataArray);
          
          // Calculate RMS volume
          let sum = 0;
          for (let i = 0; i < dataArray.length; i++) {
            const v = (dataArray[i] - 128) / 128;
            sum += v * v;
          }
          const rms = Math.sqrt(sum / dataArray.length);
          setVolume(Math.min(rms * 2, 1)); // Scale and cap at 1
          
          rafRef.current = requestAnimationFrame(tick);
        };
        
        tick();
      } catch (err) {
        console.error('❌ Failed to start audio analysis:', err);
        setError('Microphone access failed');
        setIsListening(false);
      }
    }

    startAudioAnalysis();

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
      analyserRef.current = null;
    };
  }, [isListening]);

  const toggleListening = async () => {
    if (isListening) {
      // Stop listening
      setIsListening(false);
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    } else {
      // Start listening - ensure audio is unlocked first
      await unlockAudio(showToast);
      setIsListening(true);
      setValue(''); // Clear text input when switching to voice
    }
  };

  const handleSend = () => {
    const textToSend = value.trim() || transcript.trim();
    if (textToSend && !disabled) {
      onSend(textToSend);
      setValue('');
      setTranscript('');
      setInterimTranscript('');
      textareaRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && !isListening && !disabled) {
      e.preventDefault();
      handleSend();
    }
  };

  // Get dynamic placeholder
  const getDynamicPlaceholder = () => {
    if (isListening) {
      if (interimTranscript) return '...';
      return '🎤 Maia is listening...';
    }
    if (mode === 'typing') return 'Type your message...';
    return placeholder;
  };

  return (
    <div className={`relative ${className}`}>
      {/* Error message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute bottom-full left-0 mb-2 px-3 py-2 bg-red-500/90 text-white text-sm rounded-lg"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-end gap-3 p-4 bg-white dark:bg-neutral-900 border dark:border-neutral-800 rounded-2xl shadow-lg">
        {/* Textarea with auto-resize */}
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={isListening ? (transcript + ' ' + interimTranscript).trim() : value}
            onChange={(e) => !isListening && setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={getDynamicPlaceholder()}
            disabled={disabled || isListening}
            className={`
              w-full resize-none rounded-lg px-3 py-3 
              bg-transparent focus:outline-none
              placeholder-neutral-400 dark:placeholder-neutral-600
              text-neutral-900 dark:text-white
              min-h-[44px] max-h-[200px]
              text-base leading-relaxed
              transition-all duration-200
              ${isListening ? 'opacity-80' : ''}
            `}
            rows={1}
          />
          
          {/* Typing indicator */}
          {mode === 'typing' && !isListening && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute bottom-2 right-2 text-xs text-neutral-400"
            >
              Press Enter to send
            </motion.div>
          )}
        </div>

        {/* Mic Toggle Button */}
        <div className="relative flex items-center justify-center">
          {/* Pulsing rings when listening */}
          {isListening && (
            <>
              {[1, 2, 3].map((i) => (
                <motion.span
                  key={i}
                  className="absolute inset-0 rounded-full border-2 border-amber-400"
                  initial={{ scale: 1, opacity: 0 }}
                  animate={{
                    scale: 1 + volume * (i * 0.5),
                    opacity: [0.6, 0.3, 0],
                  }}
                  transition={{
                    duration: 1 + i * 0.2,
                    repeat: Infinity,
                    ease: 'easeOut',
                  }}
                  style={{ width: 40, height: 40 }}
                />
              ))}
            </>
          )}

          <motion.button
            onClick={toggleListening}
            disabled={disabled}
            className={`
              relative z-10 p-3 rounded-full shadow-md
              transition-all duration-200 min-w-[48px] min-h-[48px]
              touch-none select-none
              ${isListening 
                ? 'bg-gradient-to-r from-red-500 to-orange-600' 
                : 'bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700'
              }
              ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
              text-white
            `}
            whileTap={{ scale: disabled ? 1 : 0.95 }}
            aria-label={isListening ? 'Stop recording' : 'Start recording'}
          >
            {isListening ? (
              <MicOff className="w-5 h-5" />
            ) : (
              <Mic className="w-5 h-5" />
            )}
          </motion.button>
        </div>

        {/* Send Button (for text mode) */}
        <motion.button
          onClick={handleSend}
          disabled={disabled || isListening || (!value.trim() && !transcript.trim())}
          className={`
            p-3 rounded-full shadow-md min-w-[48px] min-h-[48px]
            transition-all duration-200 touch-none select-none
            ${value.trim() && !isListening 
              ? 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700' 
              : 'bg-neutral-400 dark:bg-neutral-700'
            }
            ${disabled || isListening ? 'opacity-50 cursor-not-allowed' : ''}
            text-white
          `}
          whileTap={{ scale: disabled || isListening ? 1 : 0.95 }}
          aria-label="Send message"
        >
          <Send className="w-5 h-5" />
        </motion.button>
      </div>

      {/* Mode indicator */}
      <div className="flex justify-center mt-2">
        <AnimatePresence mode="wait">
          <motion.div
            key={mode}
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            className="text-xs text-neutral-500 dark:text-neutral-400"
          >
            {mode === 'listening' && '🎤 Voice mode active'}
            {mode === 'typing' && '⌨️ Text mode'}
            {mode === 'idle' && '💫 Ready for input'}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}