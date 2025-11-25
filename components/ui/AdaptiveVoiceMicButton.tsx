'use client';

import React from 'react';
import { Mic, MicOff } from 'lucide-react';

interface AdaptiveVoiceMicButtonProps {
  isRecording?: boolean;
  isEnabled?: boolean;
  onClick?: () => void;
  className?: string;
}

export default function AdaptiveVoiceMicButton({
  isRecording = false,
  isEnabled = true,
  onClick,
  className = ''
}: AdaptiveVoiceMicButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={!isEnabled}
      className={`
        w-10 h-10 rounded-full flex items-center justify-center
        ${isRecording
          ? 'bg-red-500 hover:bg-red-600 animate-pulse'
          : isEnabled
          ? 'bg-blue-500 hover:bg-blue-600'
          : 'bg-gray-400 cursor-not-allowed'
        }
        text-white shadow-md transition-all duration-200
        ${className}
      `}
    >
      {isEnabled ? (
        <Mic className="w-4 h-4" />
      ) : (
        <MicOff className="w-4 h-4" />
      )}
    </button>
  );
}