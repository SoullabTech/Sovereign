'use client';

import { useEffect, useState } from 'react';
import { Mic, MicOff, Volume2, Loader2, Sparkles } from 'lucide-react';

interface TranscriptPreviewProps {
  interimTranscript: string;
  finalTranscript: string;
  isRecording: boolean;
  isProcessing?: boolean;
  isSpeaking?: boolean;
}

type VoiceState = 'idle' | 'recording' | 'transcribing' | 'speaking';

const stateConfig = {
  idle: {
    icon: MicOff,
    label: 'Ready',
    color: 'text-gray-400',
    bgColor: 'bg-gray-800/50',
    borderColor: 'border-gray-700',
    tooltip: 'Click mic to start',
    pulse: false
  },
  recording: {
    icon: Mic,
    label: 'Recording',
    color: 'text-sacred-gold',
    bgColor: 'bg-sacred-gold/10',
    borderColor: 'border-sacred-gold/50',
    tooltip: 'Listening to you...',
    pulse: true
  },
  transcribing: {
    icon: Loader2,
    label: 'Transcribing',
    color: 'text-amber-400',
    bgColor: 'bg-amber-900/20',
    borderColor: 'border-amber-600/50',
    tooltip: 'Processing your words...',
    pulse: false,
    spin: true
  },
  speaking: {
    icon: Volume2,
    label: 'Speaking',
    color: 'text-blue-400',
    bgColor: 'bg-blue-900/20',
    borderColor: 'border-blue-600/50',
    tooltip: 'Maya is responding...',
    pulse: true
  }
};

export default function TranscriptPreview({ 
  interimTranscript, 
  finalTranscript,
  isRecording,
  isProcessing = false,
  isSpeaking = false
}: TranscriptPreviewProps) {
  const [displayText, setDisplayText] = useState('');
  const [isAnimating, setIsAnimating] = useState(false);
  const [currentState, setCurrentState] = useState<VoiceState>('idle');
  const [showTooltip, setShowTooltip] = useState(false);

  // Determine current state based on props
  useEffect(() => {
    if (isSpeaking) {
      setCurrentState('speaking');
    } else if (isProcessing || (finalTranscript && !interimTranscript)) {
      setCurrentState('transcribing');
    } else if (isRecording) {
      setCurrentState('recording');
    } else {
      setCurrentState('idle');
    }
  }, [isRecording, isProcessing, isSpeaking, finalTranscript, interimTranscript]);

  useEffect(() => {
    const text = interimTranscript || finalTranscript;
    if (text && text !== displayText) {
      setDisplayText(text);
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 300);
    }
  }, [interimTranscript, finalTranscript, displayText]);

  // Auto-show tooltip on state change
  useEffect(() => {
    if (currentState !== 'idle') {
      setShowTooltip(true);
      const timer = setTimeout(() => setShowTooltip(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [currentState]);

  if (currentState === 'idle' && !displayText) return null;

  const config = stateConfig[currentState];
  const StateIcon = config.icon;

  return (
    <div className="flex items-center gap-3 px-4 py-2 text-sm group">
      {/* Sacred Torus Animation Container with State Indicator */}
      <div 
        className="relative w-16 h-16 overflow-hidden rounded-lg transition-all duration-500"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        {/* Dynamic background based on state */}
        <div className={`
          absolute inset-0 transition-all duration-500
          ${config.bgColor} ${config.borderColor} border
          backdrop-blur-sm
        `} />
        
        {/* Torus animation - now responds to all states */}
        <div className="absolute inset-0 flex items-center justify-center">
          {currentState !== 'idle' && (
            <div className="sacred-torus-container">
              {/* Enhanced torus with state-based styling */}
              <div className={`
                w-12 h-12 rounded-full transition-all duration-500
                ${currentState === 'recording' ? 'bg-sacred-gold/30 animate-pulse' : ''}
                ${currentState === 'transcribing' ? 'bg-amber-500/20 animate-spin' : ''}
                ${currentState === 'speaking' ? 'bg-blue-500/20 animate-pulse' : ''}
              `}>
                {/* Inner glow effect */}
                <div className={`
                  absolute inset-2 rounded-full
                  ${currentState === 'recording' ? 'bg-sacred-gold/50' : ''}
                  ${currentState === 'transcribing' ? 'bg-amber-400/40' : ''}
                  ${currentState === 'speaking' ? 'bg-blue-400/40' : ''}
                  ${config.pulse ? 'animate-ping' : ''}
                `} />
              </div>
            </div>
          )}
        </div>

        {/* State icon overlay */}
        <div className={`
          absolute bottom-1 right-1 z-10 transition-all duration-300
          ${config.color}
        `}>
          <StateIcon className={`
            w-3 h-3
            ${config.spin ? 'animate-spin' : ''}
            ${config.pulse ? 'animate-pulse' : ''}
          `} />
        </div>

        {/* Tesla-gold tooltip */}
        {showTooltip && (
          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 z-20">
            <div className="bg-black/90 text-sacred-gold text-xs px-2 py-1 rounded whitespace-nowrap border border-sacred-gold/30">
              {config.tooltip}
              <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-black/90 border-r border-b border-sacred-gold/30 rotate-45" />
            </div>
          </div>
        )}
      </div>

      {/* Transcript Text with State Labels */}
      <div className="flex-1 min-w-0">
        {/* State label */}
        <div className={`
          text-xs font-medium transition-all duration-300 mb-0.5
          ${config.color}
        `}>
          {config.label}
          {currentState !== 'idle' && (
            <Sparkles className="inline w-3 h-3 ml-1 animate-pulse" />
          )}
        </div>
        
        {/* Transcript text */}
        <div className={`
          transition-all duration-300
          ${isAnimating ? 'scale-105' : ''}
          ${interimTranscript ? 'text-gray-400 italic' : 'text-gray-200'}
          ${currentState === 'recording' ? 'text-sacred-gold/90' : ''}
          ${currentState === 'transcribing' ? 'text-amber-400/90' : ''}
          ${currentState === 'speaking' ? 'text-blue-400/90' : ''}
        `}>
          {displayText || 
            (currentState === 'recording' ? "Listening to your voice..." : 
             currentState === 'transcribing' ? "Processing your message..." :
             currentState === 'speaking' ? "Maya is speaking..." :
             "Ready to listen")}
        </div>
      </div>

      {/* Animated state indicator bars */}
      <div className="flex gap-1">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className={`
              w-1 rounded-full transition-all duration-300
              ${currentState === 'idle' ? 'h-1 bg-gray-600' : ''}
              ${currentState === 'recording' ? 'h-3 bg-sacred-gold animate-pulse' : ''}
              ${currentState === 'transcribing' ? 'h-2 bg-amber-400 animate-bounce' : ''}
              ${currentState === 'speaking' ? 'h-4 bg-blue-400 animate-pulse' : ''}
            `}
            style={{ 
              animationDelay: `${i * 0.15}s`,
              height: currentState === 'recording' ? `${8 + i * 4}px` : undefined
            }}
          />
        ))}
      </div>
    </div>
  );
}