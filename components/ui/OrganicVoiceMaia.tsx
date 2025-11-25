'use client';

import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Pause, Play } from 'lucide-react';

interface OrganicVoiceMaiaProps {
  text?: string;
  voice?: string;
  autoPlay?: boolean;
  onPlayStart?: () => void;
  onPlayEnd?: () => void;
  className?: string;
}

export function OrganicVoiceMaia({
  text = '',
  voice = 'shimmer',
  autoPlay = false,
  onPlayStart,
  onPlayEnd,
  className = ''
}: OrganicVoiceMaiaProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    if (autoPlay && text && 'speechSynthesis' in window) {
      handlePlay();
    }
  }, [text, autoPlay]);

  const handlePlay = () => {
    if (!text || !('speechSynthesis' in window)) return;

    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      onPlayEnd?.();
    } else {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.voice = window.speechSynthesis.getVoices().find(v => v.name.includes('female')) || null;
      utterance.rate = 0.9;
      utterance.pitch = 1.1;

      utterance.onstart = () => {
        setIsPlaying(true);
        onPlayStart?.();
      };

      utterance.onend = () => {
        setIsPlaying(false);
        onPlayEnd?.();
      };

      if (!isMuted) {
        window.speechSynthesis.speak(utterance);
      }
    }
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <button
        onClick={handlePlay}
        className={`
          w-10 h-10 rounded-full flex items-center justify-center
          ${isPlaying
            ? 'bg-amber-500 hover:bg-amber-600'
            : 'bg-gray-500 hover:bg-gray-600'
          }
          text-white shadow-md transition-all duration-200
        `}
      >
        {isPlaying ? (
          <Pause className="w-4 h-4" />
        ) : (
          <Play className="w-4 h-4" />
        )}
      </button>

      <button
        onClick={() => setIsMuted(!isMuted)}
        className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-100 hover:bg-gray-200 transition-colors"
      >
        {isMuted ? (
          <VolumeX className="w-4 h-4 text-gray-600" />
        ) : (
          <Volume2 className="w-4 h-4 text-gray-600" />
        )}
      </button>
    </div>
  );
}