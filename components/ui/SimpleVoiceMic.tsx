'use client';

import React from 'react';
import { Mic, Square } from 'lucide-react';

interface SimpleVoiceMicProps {
  isRecording?: boolean;
  onClick?: () => void;
  onStop?: () => void;
  className?: string;
}

export function SimpleVoiceMic({
  isRecording = false,
  onClick,
  onStop,
  className = ''
}: SimpleVoiceMicProps) {
  const handleClick = () => {
    if (isRecording) {
      onStop?.();
    } else {
      onClick?.();
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`
        w-14 h-14 rounded-full flex items-center justify-center
        ${isRecording
          ? 'bg-red-500 hover:bg-red-600 animate-pulse'
          : 'bg-blue-500 hover:bg-blue-600'
        }
        text-white shadow-lg transition-all duration-200
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
        ${className}
      `}
    >
      {isRecording ? (
        <Square className="w-6 h-6" />
      ) : (
        <Mic className="w-6 h-6" />
      )}
    </button>
  );
}