'use client';

/**
 * MAIA Voice Interface - Consciousness-Responsive Voice UI
 *
 * This component provides the visual interface for voice interaction with MAIA,
 * integrated with the consciousness state system and holoflower visualization.
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMAIAVoice, MAIATranscription, VoiceActivityState } from '@/lib/voice/maiaVoiceSystem';
import { useHoloflowerState } from '@/lib/holoflower/useHoloflowerState';
import AdvancedHoloflower from '@/components/ui/AdvancedHoloflower';

interface MAIAVoiceInterfaceProps {
  onTranscription?: (transcription: MAIATranscription) => void;
  onSpeakingStart?: () => void;
  onSpeakingEnd?: () => void;
  showTranscription?: boolean;
  showVoiceLevel?: boolean;
  className?: string;
}

export function MAIAVoiceInterface({
  onTranscription,
  onSpeakingStart,
  onSpeakingEnd,
  showTranscription = true,
  showVoiceLevel = true,
  className = ''
}: MAIAVoiceInterfaceProps) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [currentTranscription, setCurrentTranscription] = useState<MAIATranscription | null>(null);
  const [voiceActivity, setVoiceActivity] = useState<VoiceActivityState | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const voiceSystem = useMAIAVoice();
  const holoflower = useHoloflowerState({
    enableAutoDetection: true,
    debug: false
  });

  // Initialize voice system
  useEffect(() => {
    const initializeVoice = async () => {
      try {
        const success = await voiceSystem.initialize();
        setIsInitialized(success);
        if (!success) {
          setError('Failed to initialize voice system');
        }
      } catch (err) {
        setError('Voice initialization error');
        console.error('Voice initialization error:', err);
      }
    };

    initializeVoice();

    return () => {
      voiceSystem.dispose();
    };
  }, [voiceSystem]);

  // Set up voice event listeners
  useEffect(() => {
    if (!isInitialized) return;

    const unsubscribeTranscription = voiceSystem.onTranscription((transcription) => {
      setCurrentTranscription(transcription);
      onTranscription?.(transcription);

      // Update holoflower state based on transcription
      holoflower.updateContext({
        userMessage: transcription.text,
        userEmotionalTone: transcription.emotionalTone,
        cognitiveState: transcription.cognitiveState,
        processingType: transcription.processingType
      });
    });

    const unsubscribeVoiceActivity = voiceSystem.onVoiceActivity((activity) => {
      setVoiceActivity(activity);

      // Update holoflower with voice activity
      holoflower.updateContext({
        userSpeaking: activity.voiceLevel > 0.1,
        maiaListening: activity.isListening
      });
    });

    const unsubscribeError = voiceSystem.onError((err) => {
      setError(err.message);
      console.error('Voice system error:', err);
    });

    return () => {
      unsubscribeTranscription();
      unsubscribeVoiceActivity();
      unsubscribeError();
    };
  }, [isInitialized, voiceSystem, holoflower, onTranscription]);

  // Update voice system when consciousness state changes
  useEffect(() => {
    if (isInitialized) {
      voiceSystem.updateConsciousnessState(holoflower.state);
    }
  }, [holoflower.state, voiceSystem, isInitialized]);

  // Voice control handlers
  const handleStartListening = useCallback(() => {
    if (!isInitialized) return;

    voiceSystem.startListening();
    setIsListening(true);
    setError(null);
  }, [isInitialized, voiceSystem]);

  const handleStopListening = useCallback(() => {
    if (!isInitialized) return;

    voiceSystem.stopListening();
    setIsListening(false);
  }, [isInitialized, voiceSystem]);

  const handleSpeak = useCallback(async (text: string) => {
    if (!isInitialized) return;

    try {
      onSpeakingStart?.();

      // Update holoflower state for speaking
      holoflower.updateContext({
        maiaSpeaking: true,
        maiaProcessing: false
      });

      await voiceSystem.speak(text, {
        maiaSpeaking: true,
        messageType: holoflower.state.mode === 'dialogue' ? 'collaborative' :
                    holoflower.state.mode === 'patient' ? 'therapeutic' :
                    holoflower.state.mode === 'scribe' ? 'analytical' : 'contemplative'
      });

      // Reset speaking state
      holoflower.updateContext({
        maiaSpeaking: false
      });

      onSpeakingEnd?.();
    } catch (err) {
      setError('Speaking failed');
      console.error('Speaking error:', err);
    }
  }, [isInitialized, voiceSystem, holoflower, onSpeakingStart, onSpeakingEnd]);

  if (!isInitialized) {
    return (
      <div className={`voice-interface-loading ${className}`}>
        <div className="loading-content">
          <AdvancedHoloflower size="medium" reducedMotion />
          <p style={{ color: 'var(--mode-primary, #FFD700)', marginTop: '1rem' }}>
            Awakening voice consciousness...
          </p>
          {error && (
            <p style={{ color: '#ff6b6b', marginTop: '0.5rem', fontSize: '0.9rem' }}>
              {error}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`maia-voice-interface ${className}`}>
      {/* Central Holoflower with Voice Integration */}
      <div className="voice-holoflower-container">
        <AdvancedHoloflower
          isListening={voiceActivity?.isListening || false}
          isSpeaking={voiceActivity?.isSpeaking || false}
          voiceLevel={voiceActivity?.voiceLevel || 0}
          transcriptText={currentTranscription?.text || ''}
          size="dynamic"
          quality="high"
          className="voice-holoflower"
        />

        {/* Voice Control Ring */}
        <VoiceControlRing
          isListening={isListening}
          isSpeaking={voiceActivity?.isSpeaking || false}
          voiceLevel={voiceActivity?.voiceLevel || 0}
          onStartListening={handleStartListening}
          onStopListening={handleStopListening}
          onSpeak={handleSpeak}
          modeColor={holoflower.cssVariables['--mode-primary'] || '#FFD700'}
        />
      </div>

      {/* Voice Level Visualization */}
      {showVoiceLevel && voiceActivity && (
        <VoiceLevelDisplay
          voiceLevel={voiceActivity.voiceLevel}
          isListening={voiceActivity.isListening}
          modeColor={holoflower.cssVariables['--mode-primary'] || '#FFD700'}
        />
      )}

      {/* Transcription Display */}
      {showTranscription && (
        <TranscriptionDisplay
          transcription={currentTranscription}
          mode={holoflower.state.mode}
          cssVariables={holoflower.cssVariables}
        />
      )}

      {/* Error Display */}
      <AnimatePresence>
        {error && (
          <ErrorDisplay
            error={error}
            onDismiss={() => setError(null)}
          />
        )}
      </AnimatePresence>

      {/* Consciousness State Indicator */}
      <ConsciousnessStateIndicator
        state={holoflower.state}
        flow={holoflower.getCurrentFlow()}
        cssVariables={holoflower.cssVariables}
      />
    </div>
  );
}

/**
 * Voice Control Ring - Controls around the holoflower
 */
function VoiceControlRing({
  isListening,
  isSpeaking,
  voiceLevel,
  onStartListening,
  onStopListening,
  onSpeak,
  modeColor
}: {
  isListening: boolean;
  isSpeaking: boolean;
  voiceLevel: number;
  onStartListening: () => void;
  onStopListening: () => void;
  onSpeak: (text: string) => void;
  modeColor: string;
}) {
  const [testSpeechText, setTestSpeechText] = useState('');

  return (
    <div className="voice-control-ring">
      {/* Listen Button */}
      <motion.button
        className={`voice-button listen-button ${isListening ? 'active' : ''}`}
        onClick={isListening ? onStopListening : onStartListening}
        style={{
          position: 'absolute',
          bottom: '-60px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '50px',
          height: '50px',
          borderRadius: '50%',
          border: `2px solid ${modeColor}`,
          background: isListening ? modeColor : 'transparent',
          color: isListening ? '#000' : modeColor,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.2rem'
        }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        {isListening ? '🛑' : '🎤'}
      </motion.button>

      {/* Quick Speech Test */}
      <div
        style={{
          position: 'absolute',
          top: '-80px',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: '10px',
          alignItems: 'center'
        }}
      >
        <input
          type="text"
          placeholder="Test speech..."
          value={testSpeechText}
          onChange={(e) => setTestSpeechText(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter' && testSpeechText.trim()) {
              onSpeak(testSpeechText);
              setTestSpeechText('');
            }
          }}
          style={{
            padding: '8px 12px',
            border: `1px solid ${modeColor}`,
            borderRadius: '20px',
            background: 'transparent',
            color: modeColor,
            fontSize: '0.9rem',
            width: '200px'
          }}
        />
        <motion.button
          onClick={() => {
            if (testSpeechText.trim()) {
              onSpeak(testSpeechText);
              setTestSpeechText('');
            }
          }}
          style={{
            padding: '8px 16px',
            border: `1px solid ${modeColor}`,
            borderRadius: '15px',
            background: 'transparent',
            color: modeColor,
            cursor: 'pointer'
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Speak
        </motion.button>
      </div>
    </div>
  );
}

/**
 * Voice Level Display
 */
function VoiceLevelDisplay({
  voiceLevel,
  isListening,
  modeColor
}: {
  voiceLevel: number;
  isListening: boolean;
  modeColor: string;
}) {
  return (
    <div
      className="voice-level-display"
      style={{
        position: 'absolute',
        bottom: '-120px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '200px',
        height: '10px',
        background: 'rgba(255,255,255,0.1)',
        borderRadius: '5px',
        overflow: 'hidden'
      }}
    >
      <motion.div
        style={{
          height: '100%',
          background: `linear-gradient(90deg, ${modeColor}40, ${modeColor})`,
          borderRadius: '5px'
        }}
        animate={{
          width: `${voiceLevel * 100}%`,
          opacity: isListening ? 1 : 0.5
        }}
        transition={{ duration: 0.1 }}
      />
    </div>
  );
}

/**
 * Transcription Display
 */
function TranscriptionDisplay({
  transcription,
  mode,
  cssVariables
}: {
  transcription: MAIATranscription | null;
  mode: string;
  cssVariables: Record<string, string>;
}) {
  if (!transcription) return null;

  return (
    <motion.div
      className="transcription-display"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      style={{
        position: 'absolute',
        top: '-150px',
        left: '50%',
        transform: 'translateX(-50%)',
        maxWidth: '400px',
        padding: '16px 20px',
        background: 'rgba(0,0,0,0.8)',
        border: `1px solid ${cssVariables['--mode-primary'] || '#FFD700'}`,
        borderRadius: '15px',
        color: cssVariables['--mode-primary'] || '#FFD700',
        fontSize: '0.9rem',
        textAlign: 'center'
      }}
    >
      <div style={{ marginBottom: '8px' }}>"{transcription.text}"</div>
      <div style={{ fontSize: '0.7rem', opacity: 0.7 }}>
        {transcription.emotionalTone && (
          <span style={{ marginRight: '10px' }}>
            Tone: {transcription.emotionalTone}
          </span>
        )}
        {transcription.confidence && (
          <span>Confidence: {Math.round(transcription.confidence * 100)}%</span>
        )}
      </div>
    </motion.div>
  );
}

/**
 * Error Display
 */
function ErrorDisplay({
  error,
  onDismiss
}: {
  error: string;
  onDismiss: () => void;
}) {
  return (
    <motion.div
      className="error-display"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        padding: '16px 20px',
        background: 'rgba(255, 107, 107, 0.9)',
        color: 'white',
        borderRadius: '10px',
        fontSize: '0.9rem',
        cursor: 'pointer',
        zIndex: 1000
      }}
      onClick={onDismiss}
    >
      <div>{error}</div>
      <div style={{ fontSize: '0.7rem', marginTop: '5px', opacity: 0.8 }}>
        Tap to dismiss
      </div>
    </motion.div>
  );
}

/**
 * Consciousness State Indicator
 */
function ConsciousnessStateIndicator({
  state,
  flow,
  cssVariables
}: {
  state: any;
  flow: string;
  cssVariables: Record<string, string>;
}) {
  return (
    <div
      className="consciousness-indicator"
      style={{
        position: 'absolute',
        top: '-200px',
        right: '-100px',
        padding: '10px 15px',
        background: 'rgba(0,0,0,0.6)',
        border: `1px solid ${cssVariables['--mode-primary'] || '#FFD700'}`,
        borderRadius: '10px',
        color: cssVariables['--mode-primary'] || '#FFD700',
        fontSize: '0.8rem',
        whiteSpace: 'nowrap'
      }}
    >
      <div style={{ marginBottom: '5px', fontWeight: 'bold' }}>
        Consciousness State
      </div>
      <div style={{ fontSize: '0.7rem', opacity: 0.8 }}>
        {flow}
      </div>
      {state.shimmer && (
        <div style={{ fontSize: '0.7rem', marginTop: '3px' }}>
          Shimmer: {state.shimmer}
        </div>
      )}
    </div>
  );
}

export default MAIAVoiceInterface;