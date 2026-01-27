'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Hand, Sparkles, MessageSquare, Shield } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import type { ConversationMode } from '@/lib/types/conversation-style';

interface VoiceHUDProps {
  /** Whether the HUD is visible */
  isVisible: boolean;
  /** Called when user taps interrupt */
  onInterrupt: () => void;
  /** Whether MAIA is currently speaking (shows interrupt as active) */
  isMaiaSpeaking: boolean;
}

/**
 * Voice HUD — Minimal in-conversation controls
 *
 * Four sacred controls, nothing more:
 * - Interrupt (tap while MAIA speaks)
 * - Expressiveness (Prosody Range 0-4)
 * - Mode (her/classic/adaptive)
 * - Sanctuary (toggle)
 */
export function VoiceHUD({ isVisible, onInterrupt, isMaiaSpeaking }: VoiceHUDProps) {
  // Local state synced with maia_settings
  const [prosodyRange, setProsodyRange] = useState<0 | 1 | 2 | 3 | 4>(1);
  const [conversationMode, setConversationMode] = useState<ConversationMode>('her');
  const [sanctuary, setSanctuary] = useState(false);

  // Load initial state from localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const loadSettings = () => {
      try {
        const saved = localStorage.getItem('maia_settings');
        if (saved) {
          const settings = JSON.parse(saved);
          setProsodyRange(settings.voice?.prosodyRange ?? 1);
          setConversationMode(settings.conversationMode ?? 'her');
          setSanctuary(settings.sanctuary ?? false);
        }
      } catch (e) {
        console.warn('[VoiceHUD] Failed to load settings:', e);
      }
    };

    loadSettings();

    // Listen for settings changes from QuickSettings
    const handleSettingsChange = (event: CustomEvent) => {
      const settings = event.detail;
      if (settings.voice?.prosodyRange !== undefined) {
        setProsodyRange(settings.voice.prosodyRange);
      }
      if (settings.conversationMode !== undefined) {
        setConversationMode(settings.conversationMode);
      }
      if (settings.sanctuary !== undefined) {
        setSanctuary(settings.sanctuary);
      }
    };

    window.addEventListener('maia-settings-changed', handleSettingsChange as EventListener);
    return () => {
      window.removeEventListener('maia-settings-changed', handleSettingsChange as EventListener);
    };
  }, []);

  // Update a setting and emit event
  const updateSetting = useCallback((path: string, value: any) => {
    if (typeof window === 'undefined') return;

    // Haptic feedback
    if ('vibrate' in navigator) {
      navigator.vibrate(5);
    }

    try {
      const saved = localStorage.getItem('maia_settings');
      const settings = saved ? JSON.parse(saved) : {};

      // Handle nested paths like 'voice.prosodyRange'
      const keys = path.split('.');
      let current: any = settings;
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) current[keys[i]] = {};
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = value;

      localStorage.setItem('maia_settings', JSON.stringify(settings));
      window.dispatchEvent(new CustomEvent('maia-settings-changed', { detail: settings }));
    } catch (e) {
      console.error('[VoiceHUD] Failed to update setting:', e);
    }
  }, []);

  // Prosody range labels
  const prosodyLabels = ['Neutral', 'Subtle', 'Expressive', 'Deep', 'Ceremonial'];

  // Mode labels
  const modeLabels: Record<ConversationMode, string> = {
    her: 'Natural',
    classic: 'Classic',
    adaptive: 'Adaptive',
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[100]"
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        >
          <div
            className="flex items-center gap-2 px-3 py-2 rounded-2xl
                       bg-black/80 backdrop-blur-xl border border-white/10
                       shadow-lg shadow-black/30"
          >
            {/* Interrupt Button - Only active when MAIA is speaking */}
            <motion.button
              onClick={onInterrupt}
              disabled={!isMaiaSpeaking}
              className={`p-2.5 rounded-xl transition-all ${
                isMaiaSpeaking
                  ? 'bg-orange-500/20 text-orange-400 hover:bg-orange-500/30'
                  : 'bg-white/5 text-white/30 cursor-not-allowed'
              }`}
              whileTap={isMaiaSpeaking ? { scale: 0.9 } : {}}
              title="Interrupt MAIA"
            >
              <Hand size={18} />
            </motion.button>

            {/* Divider */}
            <div className="w-px h-6 bg-white/10" />

            {/* Prosody Range - Compact stepper */}
            <div className="flex items-center gap-1">
              <Sparkles size={14} className="text-amber-400/60" />
              <div className="flex gap-0.5">
                {[0, 1, 2, 3, 4].map((level) => (
                  <motion.button
                    key={level}
                    onClick={() => {
                      setProsodyRange(level as 0 | 1 | 2 | 3 | 4);
                      updateSetting('voice.prosodyRange', level);
                    }}
                    className={`w-5 h-5 rounded text-[10px] font-medium transition-all ${
                      prosodyRange === level
                        ? 'bg-amber-500/30 text-amber-300'
                        : 'bg-white/5 text-white/40 hover:bg-white/10'
                    }`}
                    whileTap={{ scale: 0.9 }}
                    title={prosodyLabels[level]}
                  >
                    {level}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Divider */}
            <div className="w-px h-6 bg-white/10" />

            {/* Conversation Mode - 3-way pill */}
            <div className="flex items-center gap-1">
              <MessageSquare size={14} className="text-cyan-400/60" />
              <div className="flex bg-white/5 rounded-lg p-0.5">
                {(['her', 'classic', 'adaptive'] as ConversationMode[]).map((mode) => (
                  <motion.button
                    key={mode}
                    onClick={() => {
                      setConversationMode(mode);
                      updateSetting('conversationMode', mode);
                    }}
                    className={`px-2 py-1 rounded-md text-[10px] font-medium transition-all ${
                      conversationMode === mode
                        ? 'bg-cyan-500/30 text-cyan-300'
                        : 'text-white/40 hover:text-white/60'
                    }`}
                    whileTap={{ scale: 0.95 }}
                    title={modeLabels[mode]}
                  >
                    {mode === 'her' ? 'N' : mode === 'classic' ? 'C' : 'A'}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Divider */}
            <div className="w-px h-6 bg-white/10" />

            {/* Sanctuary Toggle */}
            <motion.button
              onClick={() => {
                const newValue = !sanctuary;
                setSanctuary(newValue);
                updateSetting('sanctuary', newValue);
              }}
              className={`p-2.5 rounded-xl transition-all ${
                sanctuary
                  ? 'bg-emerald-500/20 text-emerald-400'
                  : 'bg-white/5 text-white/40 hover:bg-white/10'
              }`}
              whileTap={{ scale: 0.9 }}
              title={sanctuary ? 'Sanctuary ON' : 'Sanctuary OFF'}
            >
              <Shield size={18} />
            </motion.button>
          </div>

          {/* Subtle label below */}
          <motion.div
            className="text-center mt-1.5 text-[10px] text-white/30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {sanctuary && <span className="text-emerald-400/60">Sanctuary</span>}
            {!sanctuary && (
              <span>
                {prosodyLabels[prosodyRange]} · {modeLabels[conversationMode]}
              </span>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
