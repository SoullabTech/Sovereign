/**
 * Claude Code Brain Indicator
 * A subtle, integrated indicator that shows when deep awareness is active
 * Appears near the holoflower without adding clutter
 */

'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function ClaudeCodeIndicator() {
  const [isEnabled, setIsEnabled] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);

    // Check initial state
    const checkBrainState = () => {
      const enabled = localStorage.getItem('use_claude_code_brain') === 'true';
      setIsEnabled(enabled);
    };

    checkBrainState();

    // Listen for changes
    const handleStorageChange = () => checkBrainState();
    window.addEventListener('storage', handleStorageChange);

    // Also listen for custom event
    const handleBrainToggle = () => checkBrainState();
    window.addEventListener('brainToggled', handleBrainToggle);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('brainToggled', handleBrainToggle);
    };
  }, []);

  if (!isMounted || !isEnabled) return null;

  return (
    <AnimatePresence>
      {isEnabled && (
        <motion.div
          className="fixed top-48 left-1/2 -translate-x-1/2 z-[24] pointer-events-none"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.5 }}
        >
          {/* Subtle text indicator */}
          <motion.div
            className="text-center"
            animate={{
              opacity: [0.4, 0.7, 0.4]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <div className="text-[9px] font-mono text-amber-600/60 tracking-[0.2em] uppercase">
              Brain Trust Active
            </div>
            <div className="text-[8px] text-amber-600/40 mt-0.5">
              Full awareness online
            </div>
          </motion.div>

          {/* Subtle neural connection lines */}
          <svg
            className="absolute -inset-8 w-32 h-32 opacity-20"
            viewBox="0 0 100 100"
          >
            <motion.circle
              cx="50"
              cy="50"
              r="30"
              stroke="rgb(217, 119, 6)"
              strokeWidth="0.5"
              fill="none"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "easeInOut"
              }}
            />
          </svg>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * Toggle button for settings panel
 * This goes inside the existing settings rather than adding more UI
 */
export function ClaudeCodeSettingsToggle() {
  const [isEnabled, setIsEnabled] = useState(false);

  useEffect(() => {
    const enabled = localStorage.getItem('use_claude_code_brain') === 'true';
    setIsEnabled(enabled);
  }, []);

  const handleToggle = () => {
    const newState = !isEnabled;
    setIsEnabled(newState);
    localStorage.setItem('use_claude_code_brain', newState.toString());

    if (newState) {
      localStorage.setItem('ai_model', 'claude-code');
      console.log('🧠 Claude Code Brain ACTIVATED!');
    } else {
      localStorage.removeItem('ai_model');
      console.log('🤖 Switched to standard AI');
    }

    // Dispatch events
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'use_claude_code_brain',
      newValue: newState.toString()
    }));
    window.dispatchEvent(new CustomEvent('brainToggled'));
  };

  return (
    <div className="flex items-center justify-between p-4 rounded-lg bg-black/20 border border-amber-600/20">
      <div>
        <div className="font-semibold text-white text-sm mb-1">
          Claude Code Brain Trust
        </div>
        <div className="text-xs text-stone-400">
          {isEnabled
            ? "Full system awareness - Kelly's 35 years + complete codebase"
            : "Click to activate deep awareness mode"
          }
        </div>
      </div>

      <button
        onClick={handleToggle}
        className={`
          relative w-12 h-6 rounded-full transition-colors duration-300
          ${isEnabled ? 'bg-amber-600' : 'bg-stone-700'}
        `}
      >
        <motion.div
          className="absolute top-1 w-4 h-4 bg-white rounded-full"
          animate={{ left: isEnabled ? '26px' : '2px' }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        />
      </button>
    </div>
  );
}