/**
 * 🔄 Quick Mode Toggle
 * Easy-access button to switch between conversation modes
 * Mobile-first design with voice command hints
 */

'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Check } from 'lucide-react';

type ConversationMode = 'classic' | 'walking' | 'adaptive';

interface ModeConfig {
  id: ConversationMode;
  name: string;
  icon: string;
  shortName: string;
  voiceCommand: string;
}

const MODES: ModeConfig[] = [
  {
    id: 'classic',
    name: 'Deep Conversation',
    icon: '🏠',
    shortName: 'Deep',
    voiceCommand: 'deep mode'
  },
  {
    id: 'walking',
    name: 'Walking Companion',
    icon: '🚶',
    shortName: 'Walk',
    voiceCommand: 'walking mode'
  },
  {
    id: 'adaptive',
    name: 'Adaptive',
    icon: '🔄',
    shortName: 'Auto',
    voiceCommand: 'adaptive mode'
  },
];

interface QuickModeToggleProps {
  className?: string;
}

export function QuickModeToggle({ className = '' }: QuickModeToggleProps) {
  const [currentMode, setCurrentMode] = useState<ConversationMode>('walking'); // 🚶 DEFAULT: Walking mode
  const [showMenu, setShowMenu] = useState(false);

  // Load current mode from localStorage
  useEffect(() => {
    const savedMode = localStorage.getItem('conversation_mode');
    if (savedMode && ['classic', 'walking', 'adaptive'].includes(savedMode)) {
      setCurrentMode(savedMode as ConversationMode);
    } else {
      // No valid mode - set Walking as default
      setCurrentMode('walking');
      localStorage.setItem('conversation_mode', 'walking');
      window.dispatchEvent(new Event('conversationStyleChanged'));
    }

    // Listen for mode changes from other components
    const handleModeChange = () => {
      const mode = localStorage.getItem('conversation_mode');
      if (mode && ['classic', 'walking', 'adaptive'].includes(mode)) {
        setCurrentMode(mode as ConversationMode);
      }
    };

    window.addEventListener('conversationStyleChanged', handleModeChange);
    return () => window.removeEventListener('conversationStyleChanged', handleModeChange);
  }, []);

  const handleModeSelect = (mode: ConversationMode) => {
    setCurrentMode(mode);
    localStorage.setItem('conversation_mode', mode);
    window.dispatchEvent(new Event('conversationStyleChanged'));
    setShowMenu(false);
  };

  const currentModeConfig = MODES.find(m => m.id === currentMode) || MODES[0];
  const [buttonRect, setButtonRect] = React.useState<DOMRect | null>(null);
  const buttonRef = React.useRef<HTMLButtonElement>(null);

  // Update button position when menu opens
  React.useEffect(() => {
    if (showMenu && buttonRef.current) {
      setButtonRect(buttonRef.current.getBoundingClientRect());
    }
  }, [showMenu]);

  return (
    <div className={`relative ${className}`}>
      {/* Current Mode Button */}
      <button
        ref={buttonRef}
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          setShowMenu(!showMenu);
        }}
        className="flex items-center gap-2 px-3 py-2 rounded-full bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 transition-all duration-300"
        title={`Current mode: ${currentModeConfig.name}\nSay: "${currentModeConfig.voiceCommand}"`}
      >
        <span className="text-base">{currentModeConfig.icon}</span>
        <span className="text-xs text-amber-100 font-medium hidden sm:inline">
          {currentModeConfig.shortName}
        </span>
      </button>

      {/* Mode Selection Menu */}
      <AnimatePresence>
        {showMenu && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-[65]"
              onClick={() => setShowMenu(false)}
            />

            {/* Menu */}
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="fixed w-64 bg-[#0A0D16]/95 backdrop-blur-md border border-amber-500/30 rounded-lg shadow-xl z-[70] overflow-hidden"
              style={{
                bottom: buttonRect ? `${window.innerHeight - buttonRect.top + 80}px` : '140px',
                right: buttonRect ? `${window.innerWidth - buttonRect.right}px` : '16px'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-2 border-b border-amber-500/20">
                <div className="flex items-center gap-2 px-2 py-1">
                  <MessageCircle className="w-4 h-4 text-amber-400" />
                  <span className="text-xs text-amber-100 font-medium">Conversation Mode</span>
                </div>
              </div>

              <div className="p-2 space-y-1">
                {MODES.map((mode) => (
                  <button
                    key={mode.id}
                    onClick={() => handleModeSelect(mode.id)}
                    className={`
                      w-full flex items-center justify-between px-3 py-2 rounded-lg
                      transition-all duration-200 text-left
                      ${currentMode === mode.id
                        ? 'bg-amber-500/20 border border-amber-500/40'
                        : 'hover:bg-amber-500/10 border border-transparent'
                      }
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{mode.icon}</span>
                      <div>
                        <div className={`text-sm font-medium ${
                          currentMode === mode.id ? 'text-amber-100' : 'text-gray-300'
                        }`}>
                          {mode.name}
                        </div>
                        <div className="text-xs text-amber-400/60 mt-0.5">
                          Say: "{mode.voiceCommand}"
                        </div>
                      </div>
                    </div>

                    {currentMode === mode.id && (
                      <Check className="w-4 h-4 text-amber-400" />
                    )}
                  </button>
                ))}
              </div>

              <div className="px-3 py-2 border-t border-amber-500/20 bg-amber-500/5">
                <p className="text-xs text-amber-200/50 text-center">
                  Switch modes anytime with voice
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
