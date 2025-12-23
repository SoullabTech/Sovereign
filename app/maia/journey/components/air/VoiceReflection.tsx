/**
 * VoiceReflection - Air Layer Component
 *
 * 🌬️ Ambient whisper-tone audio playback for semantic reflections.
 * Uses Tone.js granular synthesis for atmospheric voice rendering.
 *
 * Phase: 4.4-C (Five-Element Integration)
 * Status: Phase 1 Placeholder (HTML5 audio, Tone.js in Phase 5)
 * Created: December 23, 2024
 */

'use client';

import { useState, useRef, useEffect } from 'motion/react';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';

export interface VoiceReflectionProps {
  audioUrl: string;
  transcript: string;
  onPlayStateChange?: (isPlaying: boolean) => void;
}

export function VoiceReflection({
  audioUrl,
  transcript,
  onPlayStateChange,
}: VoiceReflectionProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Phase 1: HTML5 audio
  // Phase 5: Replace with Tone.js granular synthesis

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateProgress = () => {
      setProgress((audio.currentTime / audio.duration) * 100);
    };

    audio.addEventListener('timeupdate', updateProgress);
    audio.addEventListener('ended', () => {
      setIsPlaying(false);
      onPlayStateChange?.(false);
    });

    return () => {
      audio.removeEventListener('timeupdate', updateProgress);
    };
  }, [onPlayStateChange]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
    onPlayStateChange?.(!isPlaying);
  };

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  return (
    <div className="w-full p-4 bg-air-bg border border-blue-200 rounded-lg">
      {/* Audio element (Phase 1) */}
      <audio ref={audioRef} src={audioUrl} preload="metadata" />

      {/* Controls */}
      <div className="flex items-center gap-3">
        <button
          onClick={togglePlay}
          className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-full
                     transition-colors focus:outline-none focus:ring-2 focus:ring-blue-300"
          aria-label={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? (
            <Pause className="w-4 h-4" />
          ) : (
            <Play className="w-4 h-4" />
          )}
        </button>

        <div className="flex-1">
          {/* Progress bar */}
          <div className="h-2 bg-blue-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 transition-all duration-100"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <button
          onClick={toggleMute}
          className="p-2 hover:bg-blue-100 rounded-full transition-colors
                     focus:outline-none focus:ring-2 focus:ring-blue-300"
          aria-label={isMuted ? 'Unmute' : 'Mute'}
        >
          {isMuted ? (
            <VolumeX className="w-4 h-4 text-gray-500" />
          ) : (
            <Volume2 className="w-4 h-4 text-gray-500" />
          )}
        </button>
      </div>

      {/* Transcript */}
      {transcript && (
        <div className="mt-3 pt-3 border-t border-blue-200">
          <p className="text-sm text-gray-600 font-air italic leading-relaxed">
            {transcript}
          </p>
        </div>
      )}

      {/* Phase 1 indicator */}
      <div className="mt-2 text-xs text-gray-400 italic text-center">
        Phase 1: HTML5 audio • Tone.js granular synthesis in Phase 5
      </div>
    </div>
  );
}

// ============================================================================
// Placeholder Component (for InsightPanel)
// ============================================================================

export function VoiceReflectionPlaceholder() {
  return (
    <div className="w-full p-4 bg-air-bg border border-blue-200 rounded-lg
                    flex items-center justify-center">
      <div className="text-center space-y-2">
        <Volume2 className="w-8 h-8 text-blue-400 mx-auto" />
        <p className="text-sm text-gray-600 font-air">
          Voice reflections will appear here
        </p>
        <p className="text-xs text-gray-400 italic">
          Phase 1 Placeholder
        </p>
      </div>
    </div>
  );
}
