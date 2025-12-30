'use client';

import React from 'react';
import { Play, Plus } from 'lucide-react';

interface ResumeSessionPromptProps {
  onResume?: () => void;
  onNewSession?: () => void;
  lastSessionTime?: string;
  // OracleConversation-expected properties
  isOpen?: boolean;
  remainingTime?: string;
  phase?: any;
  onStartNew?: () => void;
  onDismiss?: () => void;
}

export function ResumeSessionPrompt({ onResume, onNewSession, lastSessionTime }: ResumeSessionPromptProps) {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-blue-900">Resume Session?</h3>
          {lastSessionTime && (
            <p className="text-xs text-blue-600">Last session: {lastSessionTime}</p>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={onResume}
            className="flex items-center gap-1 px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
          >
            <Play className="w-3 h-3" />
            Resume
          </button>
          <button
            onClick={onNewSession}
            className="flex items-center gap-1 px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600"
          >
            <Plus className="w-3 h-3" />
            New
          </button>
        </div>
      </div>
    </div>
  );
}