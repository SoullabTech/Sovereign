'use client';

import React from 'react';
import { Mic } from 'lucide-react';

interface EnhancedVoiceMicButtonProps {
  isRecording?: boolean;
  onClick?: () => void;
  className?: string;
}

export function EnhancedVoiceMicButton({
  isRecording = false,
  onClick,
  className = ''
}: EnhancedVoiceMicButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`
        w-12 h-12 rounded-full flex items-center justify-center
        ${isRecording
          ? 'bg-red-500 hover:bg-red-600'
          : 'bg-amber-500 hover:bg-amber-600'
        }
        text-white shadow-lg transition-all duration-200
        ${className}
      `}
    >
      <Mic className="w-5 h-5" />
    </button>
  );
}