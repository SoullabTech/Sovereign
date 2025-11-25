/**
 * MAIA Mode Toggle - Simple mode switcher for different interaction styles
 * Keeps it simple and clean for voice mode compatibility
 */

'use client';

import { useState } from 'react';
import { MessageCircle, Eye, Mic, Music } from 'lucide-react';

export type MaiaMode = 'interactive' | 'witness' | 'muse' | 'creative';

interface MayaModeToggleProps {
  currentMode: MaiaMode;
  onModeChange: (mode: MaiaMode) => void;
  isActive?: boolean;
}

export function MayaModeToggle({
  currentMode,
  onModeChange,
  isActive = false
}: MayaModeToggleProps) {

  const modes: Array<{
    id: MaiaMode;
    icon: React.ComponentType<any>;
    label: string;
    description: string;
    color: string;
  }> = [
    {
      id: 'interactive',
      icon: MessageCircle,
      label: 'Interactive',
      description: 'Normal conversation',
      color: 'amber'
    },
    {
      id: 'witness',
      icon: Eye,
      label: 'Witness',
      description: 'Silent observation',
      color: 'purple'
    },
    {
      id: 'muse',
      icon: Mic,
      label: 'Muse',
      description: 'Stream of consciousness',
      color: 'blue'
    },
    {
      id: 'creative',
      icon: Music,
      label: 'Creative',
      description: 'Poetry & songs',
      color: 'pink'
    }
  ];

  const currentModeData = modes.find(m => m.id === currentMode);

  return (
    <div className="flex items-center gap-2">
      {/* Compact mode indicators */}
      <div className="flex bg-black/30 rounded-full p-1 border border-amber-500/20">
        {modes.map((mode) => {
          const Icon = mode.icon;
          const isSelected = currentMode === mode.id;

          return (
            <button
              key={mode.id}
              onClick={() => onModeChange(mode.id)}
              disabled={isActive && currentMode !== 'interactive'}
              className={`
                relative p-2 rounded-full transition-all
                ${isSelected
                  ? `bg-${mode.color}-500/20 text-${mode.color}-400`
                  : 'text-gray-500 hover:text-gray-300'
                }
                ${isActive && currentMode !== 'interactive' ? 'opacity-50' : ''}
              `}
              title={`${mode.label}: ${mode.description}`}
            >
              <Icon className="w-4 h-4" />
              {isSelected && isActive && currentMode !== 'interactive' && (
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              )}
            </button>
          );
        })}
      </div>

      {/* Current mode label */}
      {currentModeData && (
        <div className="text-xs text-amber-200/60">
          {currentModeData.label}
          {isActive && currentMode !== 'interactive' && (
            <span className="ml-1 text-red-400">• Recording</span>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Mode Status Bar - Shows when in special modes
 */
export function MayaModeStatus({
  mode,
  isActive,
  onEndSession
}: {
  mode: MaiaMode;
  isActive: boolean;
  onEndSession?: () => void;
}) {

  if (mode === 'interactive' || !isActive) return null;

  const modeMessages = {
    witness: "MAIA is silently witnessing this conversation",
    muse: "MAIA is receiving your stream of consciousness",
    creative: "MAIA is ready to receive your creative expression"
  };

  const modeColors = {
    witness: 'purple',
    muse: 'blue',
    creative: 'pink'
  };

  return (
    <div className={`
      px-4 py-2
      bg-gradient-to-r from-${modeColors[mode]}-900/30 to-${modeColors[mode]}-800/20
      border-b border-${modeColors[mode]}-500/30
      flex items-center justify-between
    `}>
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
        <span className="text-sm text-gray-300">
          {modeMessages[mode]}
        </span>
      </div>

      {onEndSession && (
        <button
          onClick={onEndSession}
          className="text-xs px-3 py-1 bg-black/30 rounded-full hover:bg-black/50 transition-colors"
        >
          End & Get Synthesis
        </button>
      )}
    </div>
  );
}