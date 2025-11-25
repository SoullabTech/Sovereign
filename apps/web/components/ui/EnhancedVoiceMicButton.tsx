// Enhanced Voice Mic Button with Visual Transcript Display
import React, { useState, useEffect, useCallback, useRef, forwardRef, useImperativeHandle } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Loader2 } from 'lucide-react';

interface EnhancedVoiceMicButtonProps {
  onTranscript?: (text: string) => void;
  onVoiceStateChange?: (state: any) => void;
  size?: number;
  position?: 'bottom-center' | 'bottom-right' | 'floating';
  silenceThreshold?: number; // milliseconds of silence before triggering
  pauseListening?: boolean; // External control to pause listening
}

export const EnhancedVoiceMicButton = forwardRef<any, EnhancedVoiceMicButtonProps>(({
  onTranscript,
  onVoiceStateChange,
  size = 64,
  position = 'bottom-center',
  silenceThreshold = 1500, // 1.5 seconds of silence triggers response
  pauseListening = false
}, ref) => {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [silenceTimer, setSilenceTimer] = useState<NodeJS.Timeout | null>(null);
  
  const recognitionRef = useRef<any>(null);
  const finalTranscriptRef = useRef<string>('');
  const lastSpeechTimeRef = useRef<number>(Date.now());
  const wasListeningBeforePause = useRef<boolean>(false);

  // Initialize speech recognition
  useEffect(() => {
    // Check for HTTPS or localhost
    const isSecureContext = window.location.protocol === 'https:' || 
                           window.location.hostname === 'localhost' || 
                           window.location.hostname === '127.0.0.1';
    
    if (!isSecureContext) {
      setError('Voice requires HTTPS connection');
      return;
    }
    
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      
      recognition.onstart = () => {
        console.log('Voice recognition started');
        setError(null);
        finalTranscriptRef.current = '';
      };
      
      recognition.onresult = (event: any) => {
        let interimText = '';
        let finalText = '';
        
        console.log('🎙️ Speech recognition event received');
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalText += transcript + ' ';
          } else {
            interimText += transcript;
          }
        }
        
        if (finalText) {
          console.log('📝 Final transcript received:', finalText);
          finalTranscriptRef.current += finalText;
          setTranscript(finalTranscriptRef.current);
          lastSpeechTimeRef.current = Date.now();
          
          // Reset silence timer on new speech
          if (silenceTimer) {
            clearTimeout(silenceTimer);
          }
          
          // Start new silence timer
          console.log(`⏱️ Starting silence timer (${silenceThreshold}ms)...`);
          const timer = setTimeout(() => {
            console.log('⏰ Timer expired, checking transcript...');
            if (finalTranscriptRef.current.trim() && !pauseListening) {
              handleSilenceDetected();
            } else if (pauseListening) {
              console.log('❌ Timer expired but microphone is paused (audio playing)');
            } else {
              console.log('❌ Timer expired but no transcript to send');
            }
          }, silenceThreshold);
          setSilenceTimer(timer);
        }
        
        setInterimTranscript(interimText);
        
        // Update voice state
        onVoiceStateChange?.({
          isSpeaking: true,
          amplitude: 0.5 + Math.random() * 0.5,
          emotion: 'engaged',
          energy: 0.7,
          clarity: 0.8
        });
      };
      
      recognition.onerror = (event: any) => {
        console.log('Speech recognition event:', event.error);

        // Don't show error for intentional stops (aborted is normal when we stop recognition)
        if (event.error === 'aborted') {
          console.log('Voice recognition stopped (intentional)');
          setIsListening(false);
          return;
        }

        console.error('Speech recognition error:', event.error);

        // Handle specific error types with user-friendly messages
        let errorMessage = '';
        switch(event.error) {
          case 'not-allowed':
            errorMessage = 'Microphone access denied. Please allow microphone permissions.';
            break;
          case 'no-speech':
            errorMessage = 'No speech detected. Please try again.';
            break;
          case 'audio-capture':
            errorMessage = 'Microphone not available. Check your device settings.';
            break;
          case 'network':
            errorMessage = 'Network error. Check your connection.';
            break;
          default:
            errorMessage = `Voice error: ${event.error}`;
        }

        setError(errorMessage);
        setIsListening(false);
      };
      
      recognition.onend = () => {
        console.log('Voice recognition ended, final transcript:', finalTranscriptRef.current);
        
        // Send any remaining transcript before restarting
        if (finalTranscriptRef.current.trim() && isListening && !pauseListening) {
          console.log('🔴 Sending final transcript before restart:', finalTranscriptRef.current);
          handleSilenceDetected();
        }
        
        if (isListening && !pauseListening) {
          // Restart if still supposed to be listening AND not paused
          setTimeout(() => {
            console.log('🔄 Restarting recognition...');
            try {
              recognition.start();
            } catch (e) {
              console.log('Recognition already started');
            }
          }, 100);
        }
      };
      
      recognitionRef.current = recognition;
    } else {
      setError('Speech recognition not supported');
    }
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (silenceTimer) {
        clearTimeout(silenceTimer);
      }
    };
  }, [silenceThreshold, onVoiceStateChange]);

  // Handle external pause control
  useEffect(() => {
    if (pauseListening && isListening) {
      wasListeningBeforePause.current = true;
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        setIsListening(false);
      }
    } else if (!pauseListening && wasListeningBeforePause.current) {
      wasListeningBeforePause.current = false;
      // Resume listening if we were listening before
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
          setIsListening(true);
        } catch (error) {
          console.error('Failed to resume listening:', error);
        }
      }
    }
  }, [pauseListening, isListening]);

  const handleSilenceDetected = useCallback(() => {
    console.log('🎤 Silence detected, processing transcript:', finalTranscriptRef.current);

    if (finalTranscriptRef.current.trim()) {
      console.log('🚀 Sending transcript to oracle:', finalTranscriptRef.current.trim());
      setIsProcessing(true);
      onTranscript?.(finalTranscriptRef.current.trim());

      // Clear transcripts after sending
      setTimeout(() => {
        setTranscript('');
        setInterimTranscript('');
        finalTranscriptRef.current = '';
        setIsProcessing(false);
        console.log('✅ Transcript cleared, ready for next input');

        // KEEP LISTENING - Don't stop the mic!
        // The mic will be paused automatically when audio plays
        console.log('🎙️ Continuing to listen...');
      }, 300); // Quick clear to prevent text disappearing
    } else {
      console.log('⚠️ No transcript to send (empty or whitespace only)');
    }

    // Clear timer
    if (silenceTimer) {
      clearTimeout(silenceTimer);
      setSilenceTimer(null);
    }
  }, [onTranscript, silenceTimer]);

  // Expose control methods via ref
  useImperativeHandle(ref, () => ({
    startListening: () => {
      if (!isListening && recognitionRef.current) {
        try {
          recognitionRef.current.start();
          setIsListening(true);
        } catch (error) {
          console.error('Failed to start listening:', error);
        }
      }
    },
    stopListening: () => {
      if (isListening && recognitionRef.current) {
        recognitionRef.current.stop();
        setIsListening(false);
      }
    }
  }), [isListening]);

  const toggleListening = useCallback(() => {
    if (!recognitionRef.current) {
      setError('Speech recognition not available');
      return;
    }
    
    if (isListening) {
      console.log('⏹️ Stopping recognition, current transcript:', finalTranscriptRef.current);
      
      // Send any pending transcript before stopping
      if (finalTranscriptRef.current.trim()) {
        console.log('📤 Sending transcript before stop:', finalTranscriptRef.current);
        handleSilenceDetected();
      }
      
      // Stop listening
      recognitionRef.current.stop();
      setIsListening(false);
      
      // Don't clear transcript immediately - let handleSilenceDetected do it
      setTimeout(() => {
        if (!isProcessing) {
          setTranscript('');
          setInterimTranscript('');
          finalTranscriptRef.current = '';
        }
      }, 500);
      
      if (silenceTimer) {
        clearTimeout(silenceTimer);
        setSilenceTimer(null);
      }
      
      onVoiceStateChange?.({
        isSpeaking: false,
        amplitude: 0,
        emotion: 'neutral',
        energy: 0,
        clarity: 0
      });
    } else {
      // Request microphone permissions first
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then(() => {
          // Start listening after permissions granted
          try {
            recognitionRef.current.start();
            setIsListening(true);
            lastSpeechTimeRef.current = Date.now();
            setError(null);
          } catch (err) {
            console.error('Failed to start recognition:', err);
            setError('Failed to start voice recognition');
          }
        })
        .catch((err) => {
          console.error('Microphone permission denied:', err);
          if (err.name === 'NotAllowedError') {
            setError('Microphone access denied. Please allow permissions in your browser.');
          } else if (err.name === 'NotFoundError') {
            setError('No microphone found. Please connect a microphone.');
          } else {
            setError('Unable to access microphone. Check your settings.');
          }
        });
    }
  }, [isListening, silenceTimer, onVoiceStateChange]);

  // Position styles
  const getPositionStyles = () => {
    switch (position) {
      case 'bottom-center':
        return 'fixed bottom-8 left-1/2 transform -translate-x-1/2';
      case 'bottom-right':
        return 'fixed bottom-8 right-8';
      case 'floating':
        return 'absolute bottom-12';
      default:
        return 'fixed bottom-8 left-1/2 transform -translate-x-1/2';
    }
  };

  const displayText = transcript + (interimTranscript ? ' ' + interimTranscript : '');

  return (
    <div className={`${getPositionStyles()} z-50`}>
      {/* Transcript Display */}
      <AnimatePresence>
        {displayText && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-full mb-4 left-1/2 transform -translate-x-1/2 w-80 max-w-[90vw]"
          >
            <div className="bg-black/90 backdrop-blur-md rounded-2xl p-4 border border-[#D4B896]/30">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="w-2 h-2 bg-[#D4B896] rounded-full"
                  />
                </div>
                <div className="flex-1">
                  <p className="text-white text-sm leading-relaxed">
                    {transcript}
                    {interimTranscript && (
                      <span className="text-white/50 italic"> {interimTranscript}</span>
                    )}
                  </p>
                  {isProcessing && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-[#D4B896] text-xs mt-2"
                    >
                      Processing your message...
                    </motion.p>
                  )}
                </div>
              </div>
              
              {/* Silence indicator */}
              {transcript && !isProcessing && (
                <motion.div
                  className="mt-3 flex items-center gap-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <div className="flex-1 bg-white/10 rounded-full h-1">
                    <motion.div
                      className="bg-[#D4B896] h-1 rounded-full"
                      initial={{ width: '0%' }}
                      animate={{ width: '100%' }}
                      transition={{ duration: silenceThreshold / 1000, ease: 'linear' }}
                    />
                  </div>
                  <span className="text-white/40 text-xs">
                    Speak or wait for response
                  </span>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Display */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-full mb-4 left-1/2 transform -translate-x-1/2"
          >
            <div className="bg-red-500/90 text-white text-sm px-4 py-2 rounded-lg">
              {error}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mic Button */}
      <motion.button
        className={`relative rounded-full flex items-center justify-center
          ${isListening 
            ? 'bg-gradient-to-br from-red-500 to-red-600' 
            : 'bg-gradient-to-br from-[#D4B896] to-[#B69A78]'}
          text-white shadow-lg transition-all duration-300`}
        style={{ width: size, height: size }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={toggleListening}
      >
        {/* Pulse animation when listening */}
        {isListening && (
          <>
            <motion.div
              className="absolute inset-0 rounded-full bg-red-500"
              animate={{
                scale: [1, 1.3, 1.3],
                opacity: [0.5, 0, 0],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
              }}
            />
            <motion.div
              className="absolute inset-0 rounded-full bg-red-500"
              animate={{
                scale: [1, 1.2, 1.2],
                opacity: [0.3, 0, 0],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: 0.2,
              }}
            />
          </>
        )}

        {/* Icon */}
        <div className="relative z-10">
          {isProcessing ? (
            <Loader2 className="w-8 h-8 animate-spin" />
          ) : isListening ? (
            <MicOff className="w-8 h-8" />
          ) : (
            <Mic className="w-8 h-8" />
          )}
        </div>

        {/* Listening indicator dots */}
        {isListening && !isProcessing && (
          <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-1 h-1 bg-white rounded-full"
                animate={{
                  y: [0, -4, 0],
                }}
                transition={{
                  duration: 0.6,
                  repeat: Infinity,
                  delay: i * 0.1,
                }}
              />
            ))}
          </div>
        )}
      </motion.button>

      {/* Status label */}
      <AnimatePresence>
        {(isListening || isProcessing) && (
          <motion.div
            className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
          >
            <div className="bg-black/70 text-white text-xs px-3 py-1 rounded-full">
              {isProcessing ? 'Processing...' : 'Listening... (tap to stop)'}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

EnhancedVoiceMicButton.displayName = 'EnhancedVoiceMicButton';

export default EnhancedVoiceMicButton;