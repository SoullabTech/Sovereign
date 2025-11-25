'use client';

/**
 * 🎙️ VOICE CONTROL BAR
 *
 * Modern voice interaction controls for MAIA
 * Replaces static voice buttons with functional, reusable component
 * Future-ready for voice pipeline integration (Alloy / Liquid / Sesame)
 */

import React from 'react';
import { Mic, Volume2, VolumeX } from 'lucide-react';

interface VoiceControlBarProps {
  isRecording: boolean;
  isSpeaking: boolean;
  onToggleMic: () => void;
  onToggleSpeaking: () => void;
  theme?: 'jade' | 'sky';
  className?: string;
}

export function VoiceControlBar({
  isRecording,
  isSpeaking,
  onToggleMic,
  onToggleSpeaking,
  theme = 'jade',
  className = ''
}: VoiceControlBarProps) {
  const getThemeClasses = () => {
    switch (theme) {
      case 'sky':
        return {
          button: 'bg-sky-500/10 border border-sky-400/30 hover:bg-sky-500/20',
          icon: 'text-sky-300',
          text: 'text-sky-400/60',
          activeRing: 'ring-2 ring-sky-400 ring-opacity-50'
        };
      case 'jade':
      default:
        return {
          button: 'bg-jade-jade/10 border border-jade-jade/30 hover:bg-jade-jade/20',
          icon: 'text-jade-sage',
          text: 'text-jade-mineral/60',
          activeRing: 'ring-2 ring-jade-jade ring-opacity-50'
        };
    }
  };

  const themeClasses = getThemeClasses();

  return (
    <div className={`flex justify-center gap-6 ${className}`}>
      <button
        className="flex flex-col items-center gap-2 group"
        onClick={onToggleMic}
        aria-label={isRecording ? 'Stop recording' : 'Start recording'}
      >
        <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 ${themeClasses.button} ${
          isRecording ? `${themeClasses.activeRing} animate-pulse` : ''
        }`}>
          <Mic className={`w-5 h-5 transition-colors ${themeClasses.icon} ${
            isRecording ? 'text-red-400' : ''
          }`} />
        </div>
        <span className={`text-xs font-light ${themeClasses.text}`}>
          {isRecording ? 'Stop' : 'Speak'}
        </span>
      </button>

      <button
        className="flex flex-col items-center gap-2 group"
        onClick={onToggleSpeaking}
        aria-label={isSpeaking ? 'Mute MAIA' : 'Unmute MAIA'}
      >
        <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 ${themeClasses.button} ${
          isSpeaking ? `${themeClasses.activeRing}` : ''
        }`}>
          {isSpeaking ? (
            <Volume2 className={`w-5 h-5 transition-colors ${themeClasses.icon} text-purple-400`} />
          ) : (
            <VolumeX className={`w-5 h-5 transition-colors ${themeClasses.icon}`} />
          )}
        </div>
        <span className={`text-xs font-light ${themeClasses.text}`}>
          {isSpeaking ? 'Speaking' : 'Listen'}
        </span>
      </button>
    </div>
  );
}

export default VoiceControlBar;