'use client';

import React from 'react';
import { Play, Plus } from 'lucide-react';
import { SessionPhase } from '@/lib/session/SessionTimer';

interface ResumeSessionPromptProps {
  onResume?: () => void;
  onNewSession?: () => void;
  lastSessionTime?: string;
  // Additional props from OracleConversation
  isOpen?: boolean;
  remainingTime?: string;
  phase?: SessionPhase;
  onStartNew?: () => void;
  onDismiss?: () => void;
}

export function ResumeSessionPrompt({
  onResume,
  onNewSession,
  lastSessionTime,
  isOpen = true,
  remainingTime,
  phase,
  onStartNew,
  onDismiss
}: ResumeSessionPromptProps) {
  // If isOpen is explicitly false, don't render
  if (!isOpen) return null;

  // Use onStartNew if provided, otherwise fall back to onNewSession
  const handleNewSession = onStartNew ?? onNewSession;

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
            onClick={handleNewSession}
            className="flex items-center gap-1 px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600"
          >
            <Plus className="w-3 h-3" />
            New
          </button>
          {onDismiss && (
            <button
              onClick={onDismiss}
              className="flex items-center gap-1 px-3 py-1 bg-transparent text-gray-500 rounded text-sm hover:bg-gray-100"
            >
              Dismiss
            </button>
          )}
        </div>
      </div>
      {remainingTime && (
        <p className="text-xs text-blue-500 mt-1">Time remaining: {remainingTime}</p>
      )}
    </div>
  );
}