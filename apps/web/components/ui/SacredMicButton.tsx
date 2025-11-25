// Sacred Mic Button - Voice-activated breathing interface
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useVoiceCapture } from '@/lib/voice/voice-capture';
import { useSacredAudio } from '../audio/SacredAudioSystem';

interface SacredMicButtonProps {
  onVoiceStateChange?: (state: any) => void;
  onTranscript?: (text: string) => void;
  size?: number;
  position?: 'bottom-center' | 'bottom-right' | 'floating';
  autoHide?: boolean;
  auraElement?: string;
  coherenceLevel?: number;
  shadowDetected?: boolean;
  isActive?: boolean;
}

type MicState = 'idle' | 'listening' | 'processing' | 'responding' | 'error';

const elementColors: Record<string, string> = {
  fire: '#FF6B6B',
  water: '#4ECDC4',
  earth: '#95E77E',
  air: '#FFE66D',
  aether: '#C77DFF',
  void: '#2D3436',
  light: '#FFFFFF',
  shadow: '#636E72',
  spirit: '#A29BFE'
};

export const SacredMicButton: React.FC<SacredMicButtonProps> = ({
  onVoiceStateChange,
  onTranscript,
  size = 64,
  position = 'bottom-center',
  autoHide = false,
  auraElement = 'aether',
  coherenceLevel = 0.5,
  shadowDetected = false,
  isActive = false
}) => {
  const [micState, setMicState] = useState<MicState>('idle');
  const [isExpanded, setIsExpanded] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [breathAnimation, setBreathAnimation] = useState(false);
  
  const { voiceState, isCapturing, startCapture, stopCapture, error } = useVoiceCapture();
  const audioSystem = useSacredAudio();

  // Update parent with voice state changes
  useEffect(() => {
    if (voiceState && onVoiceStateChange) {
      onVoiceStateChange(voiceState);
    }
  }, [voiceState, onVoiceStateChange]);

  // Handle mic state transitions
  useEffect(() => {
    if (error) {
      setMicState('error');
      setTimeout(() => setMicState('idle'), 3000);
    } else if (isCapturing && voiceState.isSpeaking) {
      setMicState('listening');
      setBreathAnimation(true);
    } else if (isCapturing && !voiceState.isSpeaking) {
      // Brief pause to see if user continues speaking
      const timeout = setTimeout(() => {
        if (!voiceState.isSpeaking) {
          setMicState('processing');
          handleProcessing();
        }
      }, 1500);
      return () => clearTimeout(timeout);
    }
  }, [isCapturing, voiceState.isSpeaking, error]);

  const handleProcessing = async () => {
    // Use the actual captured audio for speech recognition
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';
      
      recognition.onresult = (event: any) => {
        const result = event.results[0][0].transcript;
        setTranscript(result);
        onTranscript?.(result);
        setMicState('responding');
        
        // Return to idle after response
        setTimeout(() => {
          setMicState('idle');
          setBreathAnimation(false);
        }, 3000);
      };
      
      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setError(`Speech recognition error: ${event.error}`);
        setMicState('error');
        
        setTimeout(() => {
          setMicState('idle');
          setError(null);
        }, 3000);
      };
      
      recognition.start();
    } else {
      // Fallback if speech recognition is not available
      setError('Speech recognition not available in this browser');
      setMicState('error');
      setTimeout(() => {
        setMicState('idle');
        setError(null);
      }, 3000);
    }
  };

  const toggleRecording = useCallback(async () => {
    if (micState === 'idle') {
      await startCapture();
      audioSystem?.playCue('listening_start');
      setIsExpanded(true);
    } else if (micState === 'listening') {
      stopCapture();
      setMicState('processing');
      handleProcessing();
    }
  }, [micState, startCapture, stopCapture, audioSystem]);

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

  // Animation variants
  const buttonVariants = {
    idle: {
      scale: 1,
      boxShadow: '0 4px 20px rgba(212, 184, 150, 0.3)'
    },
    listening: {
      scale: [1, 1.1, 1],
      boxShadow: [
        '0 4px 20px rgba(212, 184, 150, 0.4)',
        '0 8px 40px rgba(212, 184, 150, 0.6)',
        '0 4px 20px rgba(212, 184, 150, 0.4)'
      ],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }
    },
    processing: {
      rotate: 360,
      scale: 0.9,
      boxShadow: '0 4px 30px rgba(251, 191, 36, 0.5)',
      transition: {
        rotate: {
          duration: 1.5,
          repeat: Infinity,
          ease: "linear"
        },
        scale: {
          duration: 0.5
        }
      }
    },
    responding: {
      scale: 1.05,
      boxShadow: '0 8px 40px rgba(16, 185, 129, 0.5)',
      transition: {
        duration: 0.5
      }
    },
    error: {
      scale: [1, 0.95, 1],
      boxShadow: '0 4px 20px rgba(239, 68, 68, 0.5)',
      transition: {
        duration: 0.5
      }
    }
  };

  const ringVariants = {
    idle: { opacity: 0, scale: 1 },
    listening: {
      opacity: [0, 0.5, 0],
      scale: [1, 1.5, 2],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeOut"
      }
    },
    processing: {
      opacity: [0, 0.3, 0],
      scale: [1, 1.3, 1.6],
      transition: {
        duration: 1,
        repeat: Infinity,
        ease: "easeOut"
      }
    }
  };

  // Voice amplitude visualization
  const amplitudeRings = voiceState.isSpeaking && (
    <motion.div
      className="absolute inset-0 rounded-full"
      animate={{
        scale: 1 + voiceState.amplitude * 0.3,
        opacity: 0.3 + voiceState.amplitude * 0.4
      }}
      transition={{ duration: 0.1 }}
      style={{
        background: `radial-gradient(circle, 
          rgba(212, 184, 150, ${voiceState.amplitude * 0.6}) 0%, 
          transparent 70%)`
      }}
    />
  );

  const auraColor = elementColors[auraElement?.toLowerCase()] || '#FFD700';
  const auraOpacity = shadowDetected ? 0.2 : 0.3 + coherenceLevel * 0.4;

  return (
    <div className={`${getPositionStyles()} z-50`}>
      {/* Elemental Aura Ring */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: size * 2.2,
          height: size * 2.2,
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          border: `3px solid ${auraColor}`,
          opacity: auraOpacity
        }}
        animate={{
          rotate: shadowDetected ? [0, -360] : [0, 360],
          scale: micState === 'listening' ? [1, 1.15, 1] : [1, 1.05, 1],
          opacity: shadowDetected ? [auraOpacity, auraOpacity * 0.5, auraOpacity] : auraOpacity
        }}
        transition={{ 
          rotate: { duration: shadowDetected ? 4 : 12, repeat: Infinity, ease: "linear" },
          scale: { duration: 3, repeat: Infinity, ease: "easeInOut" },
          opacity: { duration: 2, repeat: shadowDetected ? Infinity : 0 }
        }}
      />

      {/* Coherence Rings */}
      <AnimatePresence>
        {coherenceLevel > 0.6 && (
          <motion.div
            className="absolute rounded-full"
            style={{
              width: size * 1.9,
              height: size * 1.9,
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
              border: `2px solid ${auraColor}`,
            }}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{
              scale: [1, 1.1, 1],
              opacity: [auraOpacity * 0.5, auraOpacity * 0.8, auraOpacity * 0.5]
            }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 2.5, repeat: Infinity }}
          />
        )}
      </AnimatePresence>

      {/* Sacred Geometry Pattern */}
      {micState === 'listening' && (
        <svg
          className="absolute"
          width={size * 2.5}
          height={size * 2.5}
          style={{ 
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)'
          }}
        >
          {[...Array(6)].map((_, i) => {
            const angle = (i / 6) * Math.PI * 2;
            const centerX = size * 1.25;
            const centerY = size * 1.25;
            const x1 = centerX + Math.cos(angle) * size * 0.8;
            const y1 = centerY + Math.sin(angle) * size * 0.8;
            const x2 = centerX + Math.cos(angle + Math.PI) * size * 0.8;
            const y2 = centerY + Math.sin(angle + Math.PI) * size * 0.8;
            
            return (
              <motion.line
                key={i}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={auraColor}
                strokeWidth="1"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{
                  pathLength: [0, 1, 0],
                  opacity: [0, 0.5, 0]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  delay: i * 0.2
                }}
              />
            );
          })}
        </svg>
      )}

      <AnimatePresence>
        {/* Expanding rings for listening state */}
        {(micState === 'listening' || micState === 'processing') && (
          <motion.div
            className="absolute inset-0 rounded-full border-2"
            style={{ borderColor: '#D4B896' }}
            variants={ringVariants}
            initial="idle"
            animate={micState}
            exit="idle"
            style={{
              width: size,
              height: size
            }}
          />
        )}

        {/* Voice amplitude visualization */}
        {micState === 'listening' && amplitudeRings}

        {/* Breath indicator */}
        {breathAnimation && voiceState.breathDepth > 0.5 && (
          <motion.div
            className="absolute -top-8 left-1/2 transform -translate-x-1/2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <div className="bg-green-500/20 text-green-400 text-xs px-2 py-1 rounded-full">
              Deep Breath Detected
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main button */}
      <motion.button
        className={`relative rounded-full flex items-center justify-center
          ${micState === 'idle' ? 'bg-gradient-to-br from-[#D4B896] to-[#B69A78]' :
            micState === 'listening' ? 'bg-gradient-to-br from-[#E5C9A6] to-[#D4B896]' :
            micState === 'processing' ? 'bg-gradient-to-br from-yellow-400 to-amber-500' :
            micState === 'responding' ? 'bg-gradient-to-br from-green-400 to-green-500' :
            'bg-gradient-to-br from-red-400 to-red-500'}
          text-white shadow-lg backdrop-blur-sm
          ${autoHide && micState === 'idle' ? 'opacity-60 hover:opacity-100' : 'opacity-100'}
          transition-all duration-300`}
        style={{ width: size, height: size }}
        variants={buttonVariants}
        initial="idle"
        animate={micState}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={toggleRecording}
      >
        {/* Icon based on state */}
        <div className="relative">
          {micState === 'idle' && (
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
              <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
            </svg>
          )}
          
          {micState === 'listening' && (
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
                <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
              </svg>
            </motion.div>
          )}
          
          {micState === 'processing' && (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </motion.div>
          )}
          
          {micState === 'responding' && (
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
              <path d="M9 11H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2zm2-7h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11z"/>
            </svg>
          )}
          
          {micState === 'error' && (
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
            </svg>
          )}
        </div>

        {/* Emotion indicator dot */}
        {micState === 'listening' && voiceState.emotion !== 'neutral' && (
          <motion.div
            className="absolute -top-1 -right-1 w-3 h-3 rounded-full"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            style={{
              backgroundColor: 
                voiceState.emotion === 'calm' ? '#10B981' :
                voiceState.emotion === 'excited' ? '#F59E0B' :
                voiceState.emotion === 'sad' ? '#3B82F6' :
                voiceState.emotion === 'anxious' ? '#EF4444' :
                '#6B7280'
            }}
          />
        )}
      </motion.button>

      {/* State label */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
          >
            <div className="bg-black/70 text-white text-xs px-3 py-1 rounded-full">
              {micState === 'idle' && 'Tap to speak'}
              {micState === 'listening' && 'Listening...'}
              {micState === 'processing' && 'Processing...'}
              {micState === 'responding' && 'Oracle responding'}
              {micState === 'error' && 'Mic access denied'}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Voice metrics (debug/demo) */}
      {process.env.NODE_ENV === 'development' && micState === 'listening' && (
        <motion.div
          className="absolute top-full mt-4 left-1/2 transform -translate-x-1/2 
                     bg-black/80 text-white text-xs p-2 rounded-lg w-48"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div>Amplitude: {(voiceState.amplitude * 100).toFixed(0)}%</div>
          <div>Clarity: {(voiceState.clarity * 100).toFixed(0)}%</div>
          <div>Energy: {(voiceState.energy * 100).toFixed(0)}%</div>
          <div>Emotion: {voiceState.emotion}</div>
        </motion.div>
      )}
    </div>
  );
};

export default SacredMicButton;