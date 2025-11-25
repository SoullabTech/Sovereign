/**
 * Claude Code Brain Toggle
 * Switches MAIA between generic AI and Claude Code's deep awareness
 */

'use client';

import { useState, useEffect } from 'react';
import { Brain, Cpu } from 'lucide-react';
import { motion } from 'framer-motion';

export function ClaudeCodeToggle() {
  const [isEnabled, setIsEnabled] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    // Check if Claude Code Brain is enabled
    const enabled = localStorage.getItem('use_claude_code_brain') === 'true';
    setIsEnabled(enabled);
  }, []);

  const handleToggle = () => {
    const newState = !isEnabled;
    setIsEnabled(newState);
    localStorage.setItem('use_claude_code_brain', newState.toString());

    // Also update the AI model selection
    if (newState) {
      localStorage.setItem('ai_model', 'claude-code');
      console.log('🧠 Claude Code Brain ACTIVATED - Full system awareness online!');
    } else {
      localStorage.removeItem('ai_model');
      console.log('🤖 Switched back to standard AI');
    }

    // Dispatch storage event for other components
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'use_claude_code_brain',
      newValue: newState.toString()
    }));
  };

  if (!isMounted) return null;

  return (
    <motion.div
      className="fixed top-20 md:top-20 right-36 md:right-44 z-50"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <button
        onClick={handleToggle}
        className={`
          relative group
          px-3 py-1.5 rounded-full
          backdrop-blur-md
          transition-all duration-300
          text-xs font-medium
          ${isEnabled
            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
            : 'bg-black/20 text-white/40 border border-white/10'
          }
          hover:scale-105
        `}
        title={isEnabled
          ? 'Claude Code Brain Active - Deep system awareness engaged'
          : 'Click to activate Claude Code Brain'}
      >
        <div className="flex items-center gap-2">
          {isEnabled ? (
            <Brain className="w-4 h-4" />
          ) : (
            <Cpu className="w-4 h-4" />
          )}
          <span className="hidden sm:inline">
            {isEnabled ? 'Brain Trust' : 'Standard AI'}
          </span>
        </div>

        {/* Pulse effect when enabled */}
        {isEnabled && (
          <span className="absolute -inset-1">
            <span className="absolute inset-0 rounded-full bg-amber-600/20 animate-pulse" />
          </span>
        )}

        {/* Tooltip - now appears below since button is at top */}
        <div className={`
          absolute top-full right-0 mt-2
          px-3 py-2 rounded-lg
          bg-black/90 backdrop-blur-md
          text-xs text-white
          whitespace-nowrap
          opacity-0 group-hover:opacity-100
          transition-opacity duration-200
          pointer-events-none
        `}>
          <div className="font-semibold mb-1">
            {isEnabled ? '🧠 Brain Trust Active' : '🤖 Standard AI'}
          </div>
          <div className="text-stone-400">
            {isEnabled
              ? 'Full SOUL​LAB awareness'
              : 'Click for deep awareness'
            }
          </div>
          {isEnabled && (
            <div className="text-amber-400 mt-1">
              35 years of wisdom online
            </div>
          )}
        </div>
      </button>
    </motion.div>
  );
}