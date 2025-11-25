/**
 * Simple Witness Toggle - Minimal implementation to avoid timing issues
 * Just a flag that tells MAIA whether to respond or just listen
 * NO complex state management, NO React effects that could interfere
 */

import React from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface SimpleWitnessToggleProps {
  isWitnessing: boolean;
  onToggle: () => void;
}

export const SimpleWitnessToggle: React.FC<SimpleWitnessToggleProps> = ({
  isWitnessing,
  onToggle
}) => {
  return (
    <button
      onClick={onToggle}
      className="fixed right-4 top-4 z-50 p-3 rounded-full backdrop-blur-sm transition-all"
      style={{
        background: isWitnessing
          ? 'rgba(168,85,247,0.2)'
          : 'rgba(0,0,0,0.2)',
        border: isWitnessing
          ? '1px solid rgba(168,85,247,0.4)'
          : '1px solid rgba(255,255,255,0.1)'
      }}
      title={isWitnessing ? "MAIA is witnessing (click to enable responses)" : "Click to enable witness mode"}
    >
      {isWitnessing ? (
        <Eye size={20} className="text-purple-400" />
      ) : (
        <EyeOff size={20} className="text-white/50" />
      )}

      {/* Simple status indicator */}
      {isWitnessing && (
        <span className="absolute -top-1 -right-1 w-3 h-3 bg-purple-500 rounded-full animate-pulse" />
      )}
    </button>
  );
};

/**
 * Witness Status - Simple visual feedback
 * Completely separate from voice processing
 */
export const WitnessStatus: React.FC<{ isActive: boolean }> = ({ isActive }) => {
  if (!isActive) return null;

  return (
    <div className="fixed top-16 right-4 z-40 px-3 py-1.5 rounded-full bg-purple-900/20 border border-purple-500/30">
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
        <span className="text-xs text-purple-300">Witness mode active</span>
      </div>
    </div>
  );
};