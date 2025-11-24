"use client";

import React, { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX, Pause, Play, AlertCircle } from "lucide-react";
import { unlockAudio, isAudioUnlocked } from "@/lib/audio/audioUnlock";
import { showError } from "@/components/system/ErrorOverlay";

interface OracleVoicePlayerProps {
  audioUrl?: string | null;
  audioData?: string | null; // Base64 encoded audio
  format?: string; // Audio format (wav, mp3, etc)
  onPlaybackComplete?: () => void;
  onPlaybackStart?: () => void;
  autoPlay?: boolean;
}

export function OracleVoicePlayer({ 
  audioUrl, 
  audioData,
  format = 'wav',
  onPlaybackComplete,
  onPlaybackStart,
  autoPlay = true 
}: OracleVoicePlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [error, setError] = useState<string | null>(null);
  const [audioSource, setAudioSource] = useState<string | null>(null);
  const [lastAudioUrl, setLastAudioUrl] = useState<string | null>(null);

  // Process audio data
  useEffect(() => {
    let objectUrl: string | null = null;

    const setupAudio = async () => {
      try {
        setError(null);
        
        // Determine audio source
        if (audioData) {
          // Convert base64 to blob
          const mimeType = format === 'mp3' ? 'audio/mpeg' : 'audio/wav';
          const byteCharacters = atob(audioData);
          const byteNumbers = new Array(byteCharacters.length);
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }
          const byteArray = new Uint8Array(byteNumbers);
          const blob = new Blob([byteArray], { type: mimeType });
          objectUrl = URL.createObjectURL(blob);
          setAudioSource(objectUrl);
          setLastAudioUrl(objectUrl);
        } else if (audioUrl) {
          // Resolve relative URLs to backend
          let resolvedUrl = audioUrl;
          if (audioUrl.startsWith('/')) {
            // Use proxy backend URL for relative paths
            resolvedUrl = `/api/backend${audioUrl}`;
          } else if (audioUrl.startsWith('http')) {
          }
          
          // Identify provider by URL patterns
          if (resolvedUrl.includes(':8000') || resolvedUrl.includes('sesame')) {
          } else if (resolvedUrl.includes('eleven') || resolvedUrl.includes('elevenlabs')) {
          } else if (resolvedUrl.includes(':3002') || resolvedUrl.includes('localhost')) {
          } else {
          }
          
          setAudioSource(resolvedUrl);
          setLastAudioUrl(resolvedUrl);
        } else {
          setAudioSource(null);
          return;
        }
      } catch (err) {
        console.error('Error processing audio:', err);
        setError('Failed to process audio');
        
        // Fallback to ElevenLabs if available
        if (!audioUrl && !audioData) {
          attemptElevenLabsFallback();
        }
      }
    };

    setupAudio();

    // Cleanup
    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [audioUrl, audioData, format]);

  // Setup audio element
  useEffect(() => {
    if (!audioSource) return;

    // Create or update audio element
    if (!audioRef.current) {
      audioRef.current = new Audio();
    }

    const audio = audioRef.current;
    audio.src = audioSource;
    audio.volume = volume;

    // Event handlers
    const handlePlay = () => {
      setIsPlaying(true);
      onPlaybackStart?.();
    };
    const handlePause = () => {
      setIsPlaying(false);
    };
    const handleEnded = () => {
      setIsPlaying(false);
      onPlaybackComplete?.();
    };
    const handleError = (e: Event) => {
      const audioError = e.target as HTMLAudioElement;
      const errorMsg = `Audio playback error: ${audioError.error?.message || 'Unknown error'}`;
      console.error('❌ [OracleVoicePlayer] Failed to play audio:', errorMsg);
      console.error('❌ Audio source was:', audioSource);
      console.error('❌ Error details:', e);
      setError(errorMsg);
      showError(errorMsg, 'error');
      setIsPlaying(false);
      
      // Attempt fallback
      attemptElevenLabsFallback();
    };

    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    // Auto-play if enabled
    if (autoPlay) {
      
      // Ensure audio is unlocked first
      const tryAutoPlay = async () => {
        try {
          // Check if audio context is unlocked
          if (!isAudioUnlocked()) {
            // Note: unlockAudio() is already called in startRecording, so this should work if user has clicked record
          }
          
          await audio.play();
        } catch (err) {
          console.error('🚫 [OracleVoicePlayer] Auto-play failed:', err);
          const errorMsg = 'Auto-play blocked. Click play button to hear Maya\'s response.';
          setError(errorMsg);
          showError(errorMsg, 'warning');
        }
      };
      
      tryAutoPlay();
    }

    return () => {
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
      audio.pause();
    };
  }, [audioSource, autoPlay, volume, onPlaybackComplete, onPlaybackStart]);

  const attemptElevenLabsFallback = async () => {
    try {
      // This would normally call your ElevenLabs API
      // For now, we'll just log the attempt
      setError('Voice fallback attempted - check console');
    } catch (err) {
      console.error('Fallback failed:', err);
    }
  };

  const togglePlayPause = async () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      setError(null); // Clear error on manual play
      
      try {
        // Ensure audio is unlocked before manual play
        if (!isAudioUnlocked()) {
          await unlockAudio();
        }
        
        await audioRef.current.play();
      } catch (err) {
        console.error('❌ [OracleVoicePlayer] Manual play failed:', err);
        setError('Playback failed. Please try again or record a new message.');
      }
    }
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    
    if (isMuted) {
      audioRef.current.volume = volume;
      setIsMuted(false);
    } else {
      audioRef.current.volume = 0;
      setIsMuted(true);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current && !isMuted) {
      audioRef.current.volume = newVolume;
    }
  };

  if (!audioSource && !error) return null;

  return (
    <div className="fixed bottom-20 right-4 bg-[#1A1F2E] border border-gray-700 rounded-lg p-3 shadow-lg">
      {error ? (
        // Error state
        <div className="flex items-center gap-2 text-red-400 text-sm">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
          {audioSource && (
            <button
              onClick={togglePlayPause}
              className="ml-2 px-2 py-1 bg-red-500/20 hover:bg-red-500/30 rounded text-xs"
            >
              Retry
            </button>
          )}
        </div>
      ) : (
        // Normal player controls
        <div className="flex items-center gap-3">
          {/* Play/Pause */}
          <button
            onClick={togglePlayPause}
            className="p-2 hover:bg-white/10 rounded transition-colors"
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <Pause className="w-4 h-4 text-sacred-gold" />
            ) : (
              <Play className="w-4 h-4 text-white" />
            )}
          </button>

          {/* Volume */}
          <button
            onClick={toggleMute}
            className="p-2 hover:bg-white/10 rounded transition-colors"
            aria-label={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? (
              <VolumeX className="w-4 h-4 text-gray-400" />
            ) : (
              <Volume2 className="w-4 h-4 text-white" />
            )}
          </button>

          {/* Volume Slider */}
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={isMuted ? 0 : volume}
            onChange={handleVolumeChange}
            className="w-20 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer slider-sacred"
            aria-label="Volume"
          />

          {/* Visual indicator */}
          {isPlaying && (
            <div className="flex items-center gap-1">
              <span className="w-1 h-3 bg-sacred-gold/60 rounded-full animate-pulse" />
              <span className="w-1 h-4 bg-sacred-gold/60 rounded-full animate-pulse delay-75" />
              <span className="w-1 h-3 bg-sacred-gold/60 rounded-full animate-pulse delay-150" />
            </div>
          )}
        </div>
      )}
      
      {/* Manual Play Button */}
      {lastAudioUrl && !isPlaying && (
        <div className="mt-2 border-t border-gray-700 pt-2">
          <button
            onClick={() => {
              if (audioRef.current) {
                audioRef.current.src = lastAudioUrl;
                setError(null); // Clear any previous errors
                audioRef.current.play().then(() => {
                }).catch(err => {
                  console.error("❌ [OracleVoicePlayer] Manual playback error:", err);
                  setError('Manual playback failed');
                });
              }
            }}
            className="w-full px-3 py-1 rounded-lg bg-gradient-to-r from-yellow-500 to-yellow-300 text-black font-medium shadow-md hover:scale-105 transition-transform duration-200"
          >
            ▶ Play Last Response
          </button>
        </div>
      )}
    </div>
  );
}