'use client';

import React from 'react';
import { ToggleLeft, ToggleRight } from 'lucide-react';

interface QuickModeToggleProps {
  isEnabled?: boolean;
  onToggle?: (enabled: boolean) => void;
  label?: string;
  className?: string;
}

export function QuickModeToggle({
  isEnabled = false,
  onToggle,
  label = 'Quick Mode',
  className = ''
}: QuickModeToggleProps) {
  return (
    <button
      onClick={() => onToggle?.(!isEnabled)}
      className={`
        flex items-center gap-2 px-3 py-2 rounded-lg
        ${isEnabled
          ? 'bg-green-100 text-green-700 border border-green-300'
          : 'bg-gray-100 text-gray-700 border border-gray-300'
        }
        hover:opacity-80 transition-all duration-200
        ${className}
      `}
    >
      {isEnabled ? (
        <ToggleRight className="w-5 h-5" />
      ) : (
        <ToggleLeft className="w-5 h-5" />
      )}
      <span className="text-sm font-medium">{label}</span>
    </button>
  );
}