'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, Heart, FileText } from 'lucide-react';

export type InteractionMode = 'dialogue' | 'counsel' | 'scribe';

interface ModeTabBarProps {
  mode: InteractionMode;
  onModeChange: (mode: InteractionMode) => void;
  disabled?: boolean;
  className?: string;
}

const MODES: { id: InteractionMode; label: string; icon: typeof MessageCircle; description: string }[] = [
  {
    id: 'dialogue',
    label: 'Talk',
    icon: MessageCircle,
    description: 'Peer presence in conversation'
  },
  {
    id: 'counsel',
    label: 'Care',
    icon: Heart,
    description: 'Therapeutic guidance and support'
  },
  {
    id: 'scribe',
    label: 'Note',
    icon: FileText,
    description: 'Capture and witness patterns'
  },
];

export function ModeTabBar({ mode, onModeChange, disabled = false, className = '' }: ModeTabBarProps) {
  return (
    <div className={`relative flex items-center justify-center gap-1 ${className}`}>
      {/* Background container */}
      <div className="flex items-center bg-[#0D0D0D]/80 backdrop-blur-sm rounded-full p-1 border border-white/[0.08]">
        {MODES.map((m) => {
          const isActive = mode === m.id;
          const Icon = m.icon;

          return (
            <button
              key={m.id}
              onClick={() => !disabled && onModeChange(m.id)}
              disabled={disabled}
              className={`
                relative flex items-center gap-2 px-4 py-2 rounded-full
                transition-all duration-200 ease-out
                ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
                ${isActive
                  ? 'text-[#D4B896]'
                  : 'text-white/50 hover:text-white/70'
                }
              `}
              title={m.description}
            >
              {/* Active background */}
              {isActive && (
                <motion.div
                  layoutId="mode-tab-active"
                  className="absolute inset-0 bg-white/[0.08] rounded-full"
                  initial={false}
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}

              {/* Content */}
              <span className="relative z-10 flex items-center gap-2">
                <Icon size={16} strokeWidth={isActive ? 2 : 1.5} />
                <span className="text-sm font-medium">{m.label}</span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Compact version for mobile or constrained spaces
 */
export function ModeTabBarCompact({ mode, onModeChange, disabled = false, className = '' }: ModeTabBarProps) {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <div className="flex items-center bg-[#0D0D0D]/80 backdrop-blur-sm rounded-full p-0.5 border border-white/[0.08]">
        {MODES.map((m) => {
          const isActive = mode === m.id;
          const Icon = m.icon;

          return (
            <button
              key={m.id}
              onClick={() => !disabled && onModeChange(m.id)}
              disabled={disabled}
              className={`
                relative flex items-center justify-center w-10 h-10 rounded-full
                transition-all duration-200 ease-out
                ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
                ${isActive
                  ? 'text-[#D4B896]'
                  : 'text-white/40 hover:text-white/60'
                }
              `}
              title={`${m.label}: ${m.description}`}
            >
              {isActive && (
                <motion.div
                  layoutId="mode-tab-compact-active"
                  className="absolute inset-0 bg-white/[0.08] rounded-full"
                  initial={false}
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <Icon size={18} strokeWidth={isActive ? 2 : 1.5} className="relative z-10" />
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default ModeTabBar;
