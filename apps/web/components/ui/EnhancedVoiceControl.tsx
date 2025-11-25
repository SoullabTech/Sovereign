/**
 * Enhanced Voice Control for MAIA
 *
 * Features:
 * - Adaptive silence thresholds (quick/normal/deep conversation)
 * - Manual "Done Speaking" button
 * - Audio cues before MAIA responds
 * - Enhanced visual feedback
 */

'use client';

import React, { useRef, useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WhisperVoiceRecognition, VoiceActivatedMaiaRef } from './WhisperVoiceRecognition';
import { Mic, MicOff, StopCircle, Volume2 } from 'lucide-react';

interface EnhancedVoiceControlProps {
  enabled: boolean;
  isMuted: boolean;
  isMayaSpeaking: boolean;
  onTranscript: (text: string) => void;
  conversationDepth?: 'quick' | 'normal' | 'deep';
}

export const EnhancedVoiceControl: React.FC<EnhancedVoiceControlProps> = ({
  enabled,
  isMuted,
  isMayaSpeaking,
  onTranscript,
  conversationDepth = 'normal'
}) => {
  const voiceRef = useRef<VoiceActivatedMaiaRef>(null);
  const [audioLevel, setAudioLevel] = useState(0);
  const [showManualStop, setShowManualStop] = useState(false);
  const [willRespondSoon, setWillRespondSoon] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Play gentle audio cue before MAIA responds
  const playResponseCue = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext();
    }

    const ctx = audioContextRef.current;
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    // Gentle chime: A4 (440Hz) -> E5 (659Hz)
    oscillator.frequency.setValueAtTime(440, ctx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(659, ctx.currentTime + 0.15);

    // Fade in and out
    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 0.05);
    gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.2);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.2);

    console.log('🔔 Playing response cue');
  }, []);

  // Show manual stop button when user is speaking
  useEffect(() => {
    if (audioLevel > 0.12 && !isMayaSpeaking) {
      setShowManualStop(true);
    } else {
      setShowManualStop(false);
    }
  }, [audioLevel, isMayaSpeaking]);

  // Play audio cue when MAIA is about to speak
  useEffect(() => {
    if (isMayaSpeaking && !willRespondSoon) {
      playResponseCue();
      setWillRespondSoon(true);
    } else if (!isMayaSpeaking) {
      setWillRespondSoon(false);
    }
  }, [isMayaSpeaking, willRespondSoon, playResponseCue]);

  const handleManualStop = useCallback(() => {
    console.log('👆 User clicked manual stop');
    voiceRef.current?.manualStop();
  }, []);

  const getThresholdDisplay = () => {
    switch (conversationDepth) {
      case 'quick': return '3s';
      case 'deep': return '8s';
      case 'normal':
      default: return '6s';
    }
  };

  return (
    <div className="relative flex flex-col items-center space-y-4">
      {/* Hidden Whisper component - handles actual recording */}
      <WhisperVoiceRecognition
        ref={voiceRef}
        enabled={enabled}
        isMuted={isMuted}
        isMayaSpeaking={isMayaSpeaking}
        onTranscript={onTranscript}
        onAudioLevelChange={setAudioLevel}
        conversationDepth={conversationDepth}
        onManualStop={() => console.log('Manual stop completed')}
      />

      {/* Visual Feedback */}
      <div className="relative w-32 h-32">
        {/* Audio Level Visualization */}
        <AnimatePresence>
          {voiceRef.current?.isListening && (
            <>
              {/* Outer pulsing ring */}
              <motion.div
                className="absolute inset-0 rounded-full bg-amber-500/20 border-2 border-amber-500/40"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{
                  scale: 1 + audioLevel * 0.5,
                  opacity: 0.3 + audioLevel * 0.4
                }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />

              {/* Middle ring - breathing effect */}
              <motion.div
                className="absolute inset-4 rounded-full bg-indigo-500/20 border border-indigo-500/40"
                animate={{
                  scale: [1, 1.05, 1],
                  opacity: [0.4, 0.6, 0.4]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            </>
          )}
        </AnimatePresence>

        {/* Center status indicator */}
        <div className="absolute inset-8 rounded-full bg-gradient-to-br from-amber-400 to-indigo-600 flex items-center justify-center shadow-lg">
          {isMayaSpeaking ? (
            <Volume2 className="w-8 h-8 text-white animate-pulse" />
          ) : voiceRef.current?.isListening ? (
            <Mic className="w-8 h-8 text-white" />
          ) : (
            <MicOff className="w-8 h-8 text-white/50" />
          )}
        </div>
      </div>

      {/* Manual Stop Button - appears when speaking */}
      <AnimatePresence>
        {showManualStop && (
          <motion.button
            onClick={handleManualStop}
            className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-full font-medium shadow-lg flex items-center space-x-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <StopCircle className="w-5 h-5" />
            <span>Done Speaking</span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Status Text */}
      <div className="text-center space-y-1">
        <motion.p
          className="text-sm font-medium"
          animate={{ opacity: 1 }}
          initial={{ opacity: 0 }}
        >
          {isMayaSpeaking && '🗣 MAIA is speaking...'}
          {!isMayaSpeaking && voiceRef.current?.isListening && audioLevel > 0.12 && '🎤 Listening...'}
          {!isMayaSpeaking && voiceRef.current?.isListening && audioLevel <= 0.12 && '⏸ Ready (speak to continue)'}
          {!voiceRef.current?.isListening && '🔇 Voice inactive'}
        </motion.p>

        {/* Conversation depth indicator */}
        {voiceRef.current?.isListening && (
          <p className="text-xs text-gray-500">
            Mode: <span className="font-semibold capitalize">{conversationDepth}</span>
            {' '}({getThresholdDisplay()} pause)
          </p>
        )}
      </div>

      {/* Instructions */}
      {!voiceRef.current?.isListening && (
        <div className="text-xs text-gray-500 text-center max-w-xs">
          <p>Voice chat inactive. Enable to start conversation.</p>
        </div>
      )}
    </div>
  );
};
