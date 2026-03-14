'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Mic, Brain, Sparkles, Settings as SettingsIcon, Users, MessageSquare, Shield, Link, Hand } from 'lucide-react';
import { GoogleConnectSection } from './settings/GoogleConnectSection';
import { InfoBubble } from '@/components/help/FeatureTooltip';
import { useState, useEffect } from 'react';
import type { ArchetypeId } from '@/lib/services/archetypePreferenceService';
import { ConversationMode, CONVERSATION_STYLE_DESCRIPTIONS } from '@/lib/types/conversation-style';
import { getInitialSessionSettings } from '@/lib/settings/accountSettings';
import { InsightTrigger } from '@/components/guidance/InsightTrigger';
// import { ConversationStylePreference } from '@/lib/preferences/conversation-style-preference';

interface QuickSettingsSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

interface MaiaSettings {
  sanctuary: boolean; // Session-level memory exclusion
  voice: {
    speed: number;
    prosodyRange: 0 | 1 | 2 | 3 | 4; // Range of Effect: scales prosody (0-4)
  };
  memory: {
    enabled: boolean;
    depth: 'minimal' | 'moderate' | 'deep';
  };
  personality: {
    warmth: number;
  };
  archetype: ArchetypeId;
  conversationMode: ConversationMode;
  /** Voice barge-in interrupt settings */
  interrupt: {
    enabled: boolean;
    sensitivity: 'low' | 'normal' | 'high'; // Maps to debounce timing
  };
}

// Voice model selection removed — MAIA's voice adapts to elemental state.
// Fine-tuning lives in Settings → Voice (VoiceSettingsPanel).

const ARCHETYPE_OPTIONS = [
  { id: 'TRUSTED_FRIEND' as ArchetypeId, name: 'Friend', emoji: '☕' },
  { id: 'GUIDE' as ArchetypeId, name: 'Guide', emoji: '🧭' },
  { id: 'MENTOR' as ArchetypeId, name: 'Mentor', emoji: '📖' },
  { id: 'ALCHEMIST' as ArchetypeId, name: 'Alchemist', emoji: '⚗️' },
  { id: 'LAB_PARTNER' as ArchetypeId, name: 'Lab Partner', emoji: '🔬' },
  { id: 'AUTO' as ArchetypeId, name: 'Auto', emoji: '✨' },
];

const DEFAULT_SETTINGS: MaiaSettings = {
  sanctuary: false, // Default: memory enabled (continuity mode)
  voice: {
    speed: 0.95,
    prosodyRange: 1, // Subtle by default
  },
  memory: {
    enabled: true,
    depth: 'moderate',
  },
  personality: {
    warmth: 0.8,
  },
  archetype: 'AUTO' as ArchetypeId,
  conversationMode: 'her',
  interrupt: {
    enabled: true, // Default ON for voice-first users
    sensitivity: 'normal', // 200ms debounce
  },
};

export function QuickSettingsSheet({ isOpen, onClose }: QuickSettingsSheetProps) {
  const [settings, setSettings] = useState<MaiaSettings>(DEFAULT_SETTINGS);
  const [userId, setUserId] = useState<string | null>(null);
  const [streamingVoiceEnabled, setStreamingVoiceEnabled] = useState(false);
  // Removed: Supabase client (now using localStorage only for sovereign mode)

  // Track streaming voice state reactively
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const read = () =>
      setStreamingVoiceEnabled(localStorage.getItem('maia_streaming_voice') === 'true');

    read(); // Initial read

    // Listen for changes from this tab (custom event)
    const onCustomEvent = () => read();
    window.addEventListener('maia-streaming-voice-changed', onCustomEvent);

    // Listen for changes from other tabs (storage event)
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'maia_streaming_voice') read();
    };
    window.addEventListener('storage', onStorage);

    return () => {
      window.removeEventListener('maia-streaming-voice-changed', onCustomEvent);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  // Get userId from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const betaUser = localStorage.getItem('beta_user');
      if (betaUser) {
        try {
          const parsed = JSON.parse(betaUser);
          setUserId(parsed.email || parsed.id || parsed.username);
        } catch {
          // Fallback to raw value if not JSON
          setUserId(betaUser);
        }
      }
    }
  }, []);

  useEffect(() => {
    const loadSettings = async () => {
      if (typeof window === 'undefined') return;

      // const conversationMode = ConversationStylePreference.get();
      const conversationMode: ConversationMode = 'her'; // Default fallback

      try {
        // Load settings from localStorage (sovereign mode - no cloud storage)
        const saved = localStorage.getItem('maia_settings');
        if (saved) {
          const parsedSettings = JSON.parse(saved);
          setSettings({
            ...parsedSettings,
            conversationMode: conversationMode, // Always use latest from preference
          });
        } else {
          // No session settings yet — initialize from account defaults
          const defaults = getInitialSessionSettings();
          const sessionSettings = {
            ...DEFAULT_SETTINGS,
            ...defaults,
            conversationMode: conversationMode,
          };
          localStorage.setItem('maia_settings', JSON.stringify(sessionSettings));
          setSettings(sessionSettings);
        }
      } catch (e) {
        console.error('Failed to load settings', e);
        const saved = localStorage.getItem('maia_settings');
        if (saved) {
          const parsedSettings = JSON.parse(saved);
          setSettings({
            ...parsedSettings,
            conversationMode: conversationMode,
          });
        }
      }
    };

    if (isOpen) {
      loadSettings();
    }
  }, [isOpen]); // Removed supabase dependency (no longer used)

  const updateSetting = async (path: string, value: any) => {
    if ('vibrate' in navigator) {
      navigator.vibrate(5);
    }

    setSettings((prev) => {
      const newSettings = { ...prev };
      const keys = path.split('.');
      let current: any = newSettings;

      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }

      current[keys[keys.length - 1]] = value;

      if (typeof window !== 'undefined') {
        localStorage.setItem('maia_settings', JSON.stringify(newSettings));
        window.dispatchEvent(new CustomEvent('maia-settings-changed', { detail: newSettings }));

        // Special handling for conversation mode
        if (path === 'conversationMode') {
          // ConversationStylePreference.set(value as ConversationMode); // Disabled while ConversationStylePreference is disabled
          window.dispatchEvent(new CustomEvent('maya-style-changed', {
            detail: {
              mode: value,
              acknowledgment: getStyleAcknowledgment(value as ConversationMode)
            }
          }));
        }

        // Settings are saved to localStorage only (sovereign mode - no cloud storage)
      }

      return newSettings;
    });
  };

  const getStyleAcknowledgment = (mode: ConversationMode): string => {
    const acknowledgments = {
      her: "Okay, natural mode. I'll keep it short and present.",
      classic: "Switching to classic style - more reflective.",
      adaptive: "Got it. I'll match your rhythm and energy."
    };
    return acknowledgments[mode];
  };

  return (
    <>
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          <motion.div
            className="fixed bottom-0 left-0 right-0 bg-gradient-to-b from-[#1a1a2e] to-[#16162b]
                     rounded-t-3xl z-[10000] max-h-[85vh] overflow-y-auto shadow-2xl
                     border-t border-amber-500/10"
            style={{
              paddingBottom: 'max(20px, env(safe-area-inset-bottom))',
              boxShadow: '0 -20px 60px rgba(255, 215, 0, 0.05), 0 -10px 30px rgba(0, 0, 0, 0.3)'
            }}
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{
              type: 'spring',
              damping: 25,
              stiffness: 250,
              mass: 0.8
            }}
            drag="y"
            dragConstraints={{ top: 0 }}
            dragElastic={0.2}
            onDragEnd={(e, { velocity }) => {
              if (velocity.y > 500) {
                if ('vibrate' in navigator) navigator.vibrate(8);
                onClose();
              }
            }}
          >
            <motion.div
              className="w-12 h-1.5 bg-gradient-to-r from-amber-500/40 via-amber-400/60 to-amber-500/40
                       rounded-full mx-auto mt-3 mb-4 cursor-grab active:cursor-grabbing"
              animate={{
                opacity: [0.4, 0.7, 0.4],
                scaleX: [1, 1.1, 1],
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />

            <motion.div
              className="absolute inset-0 pointer-events-none opacity-30 rounded-t-3xl overflow-hidden"
              style={{
                background: 'radial-gradient(circle at 50% 0%, rgba(255, 215, 0, 0.08), transparent 60%)'
              }}
              animate={{
                opacity: [0.2, 0.35, 0.2],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />

            <div className="px-6 pb-6 relative z-10">
              <div className="flex items-center justify-between mb-6">
                <motion.h3
                  className="text-xl font-light text-amber-50"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  Quick Settings
                </motion.h3>
                <motion.button
                  onClick={onClose}
                  className="w-10 h-10 flex items-center justify-center rounded-full
                           bg-white/5 text-white/60 hover:bg-white/10 transition-all"
                  whileTap={{ scale: 0.9, rotate: 90 }}
                  whileHover={{ scale: 1.1 }}
                  initial={{ opacity: 0, rotate: -90 }}
                  animate={{ opacity: 1, rotate: 0 }}
                  transition={{ delay: 0.15 }}
                >
                  <X size={20} />
                </motion.button>
              </div>

              <motion.div
                className="space-y-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, staggerChildren: 0.1 }}
              >
                {/* Sanctuary Session Toggle - The Trust Lever */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="pb-4 border-b border-white/10"
                >
                  <motion.button
                    onClick={() => updateSetting('sanctuary', !settings.sanctuary)}
                    className={`w-full p-4 rounded-xl border transition-all ${
                      settings.sanctuary
                        ? 'border-emerald-500/50 bg-emerald-500/15'
                        : 'border-white/10 bg-black/20'
                    }`}
                    whileTap={{ scale: 0.98 }}
                    whileHover={{ scale: 1.01 }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <motion.div
                          className={`p-2 rounded-lg ${
                            settings.sanctuary
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : 'bg-white/5 text-white/40'
                          }`}
                          animate={settings.sanctuary ? {
                            scale: [1, 1.1, 1],
                          } : {}}
                          transition={{ duration: 0.3 }}
                        >
                          <Shield size={20} />
                        </motion.div>
                        <div className="text-left">
                          <div className={`text-sm font-medium flex items-center gap-1.5 ${
                            settings.sanctuary ? 'text-emerald-300' : 'text-white/80'
                          }`}>
                            Sanctuary Session
                            <InsightTrigger featureKey="maia.sanctuary" />
                          </div>
                          <div className="text-xs text-white/50 mt-0.5">
                            {settings.sanctuary
                              ? "This session won't be saved to memory. Speak freely."
                              : "MAIA may remember what's helpful for continuity."}
                          </div>
                          {settings.sanctuary && (
                            <div className="text-[10px] text-emerald-400/60 mt-1">
                              No patterns formed. This session leaves no memory behind.
                            </div>
                          )}
                        </div>
                      </div>
                      {/* Toggle Switch */}
                      <div className={`w-12 h-7 rounded-full p-1 transition-colors ${
                        settings.sanctuary ? 'bg-emerald-500' : 'bg-white/20'
                      }`}>
                        <motion.div
                          className="w-5 h-5 rounded-full bg-white shadow-md"
                          animate={{ x: settings.sanctuary ? 20 : 0 }}
                          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                        />
                      </div>
                    </div>
                  </motion.button>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 }}
                >
                  <label className="flex items-center gap-2 text-sm font-medium text-amber-200/80 mb-2">
                    <Mic size={16} />
                    Voice
                  </label>
                  <p className="text-xs text-stone-400 mb-2">
                    MAIA&apos;s voice adapts to her elemental state. Fine-tune pace, warmth, and energy in Voice settings.
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <label className="flex items-center gap-2 text-sm font-medium text-amber-200/80 mb-3">
                    <Sparkles size={16} />
                    Voice Speed: {settings.voice.speed.toFixed(2)}x
                  </label>
                  <input
                    type="range"
                    min="0.75"
                    max="1.25"
                    step="0.05"
                    value={settings.voice.speed}
                    onChange={(e) => updateSetting('voice.speed', parseFloat(e.target.value))}
                    className="w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer
                             [&::-webkit-slider-thumb]:appearance-none
                             [&::-webkit-slider-thumb]:w-5
                             [&::-webkit-slider-thumb]:h-5
                             [&::-webkit-slider-thumb]:rounded-full
                             [&::-webkit-slider-thumb]:bg-amber-500
                             [&::-webkit-slider-thumb]:shadow-lg
                             [&::-webkit-slider-thumb]:shadow-amber-500/40"
                  />
                  <div className="flex justify-between text-xs text-white/40 mt-2">
                    <span>Slower</span>
                    <span>Natural</span>
                    <span>Faster</span>
                  </div>
                </motion.div>

                {/* Range of Effect - MAIA's prosody scaling */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.32 }}
                  className="mt-4"
                >
                  <label className="flex items-center justify-between text-sm font-medium text-amber-200/80 mb-3">
                    <div className="flex items-center gap-2">
                      <Sparkles size={16} />
                      Range of Effect
                      <InfoBubble featureId="range-of-effect" side="right" />
                    </div>
                    <span className="text-xs text-white/60">
                      {settings.voice.prosodyRange === 0 && 'Neutral'}
                      {settings.voice.prosodyRange === 1 && 'Subtle'}
                      {settings.voice.prosodyRange === 2 && 'Expressive'}
                      {settings.voice.prosodyRange === 3 && 'Deep'}
                      {settings.voice.prosodyRange === 4 && 'Ceremonial'}
                    </span>
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="4"
                    step="1"
                    value={settings.voice.prosodyRange}
                    onChange={(e) => updateSetting('voice.prosodyRange', parseInt(e.target.value) as 0|1|2|3|4)}
                    className="w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer
                             [&::-webkit-slider-thumb]:appearance-none
                             [&::-webkit-slider-thumb]:w-5
                             [&::-webkit-slider-thumb]:h-5
                             [&::-webkit-slider-thumb]:rounded-full
                             [&::-webkit-slider-thumb]:bg-amber-500
                             [&::-webkit-slider-thumb]:shadow-lg
                             [&::-webkit-slider-thumb]:shadow-amber-500/40"
                  />
                  <div className="flex justify-between text-xs text-white/40 mt-2">
                    <span>0</span>
                    <span>1</span>
                    <span>2</span>
                    <span>3</span>
                    <span>4</span>
                  </div>
                  <div className="text-xs text-white/50 mt-1 text-center">
                    Scales how MAIA's voice lands — pacing, warmth, ceremony
                  </div>
                </motion.div>

                {/* Streaming Voice Mode Toggle - Experimental */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.32 }}
                >
                  <motion.button
                    onClick={() => {
                      if ('vibrate' in navigator) navigator.vibrate(5);
                      const newValue = !streamingVoiceEnabled;
                      localStorage.setItem('maia_streaming_voice', String(newValue));
                      window.dispatchEvent(new CustomEvent('maia-streaming-voice-changed', { detail: { enabled: newValue } }));
                    }}
                    className={`w-full p-4 rounded-xl border transition-all ${
                      streamingVoiceEnabled
                        ? 'border-cyan-500/50 bg-cyan-500/15'
                        : 'border-white/10 bg-black/20'
                    }`}
                    whileTap={{ scale: 0.98 }}
                    whileHover={{ scale: 1.01 }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${
                          streamingVoiceEnabled
                            ? 'bg-cyan-500/20 text-cyan-400'
                            : 'bg-white/5 text-white/40'
                        }`}>
                          <Sparkles size={20} />
                        </div>
                        <div className="text-left">
                          <div className={`text-sm font-medium flex items-center gap-1.5 ${
                            streamingVoiceEnabled ? 'text-cyan-300' : 'text-white/80'
                          }`}>
                            Streaming Voice (Beta)
                            <InfoBubble featureId="streaming-voice" side="right" />
                          </div>
                          <div className="text-xs text-white/50 mt-0.5">
                            Natural flow with sentence-by-sentence TTS
                          </div>
                        </div>
                      </div>
                      <div className={`w-12 h-7 rounded-full p-1 transition-colors ${
                        streamingVoiceEnabled ? 'bg-cyan-500' : 'bg-white/20'
                      }`}>
                        <motion.div
                          className="w-5 h-5 rounded-full bg-white shadow-md"
                          animate={{ x: streamingVoiceEnabled ? 20 : 0 }}
                          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                        />
                      </div>
                    </div>
                  </motion.button>
                </motion.div>

                {/* Allow Interruption Toggle - Barge-in (only show when Streaming Voice is enabled) */}
                {streamingVoiceEnabled && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.33 }}
                >
                  <motion.button
                    onClick={() => updateSetting('interrupt.enabled', !settings.interrupt.enabled)}
                    className={`w-full p-4 rounded-xl border transition-all ${
                      settings.interrupt.enabled
                        ? 'border-orange-500/50 bg-orange-500/15'
                        : 'border-white/10 bg-black/20'
                    }`}
                    whileTap={{ scale: 0.98 }}
                    whileHover={{ scale: 1.01 }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <motion.div
                          className={`p-2 rounded-lg ${
                            settings.interrupt.enabled
                              ? 'bg-orange-500/20 text-orange-400'
                              : 'bg-white/5 text-white/40'
                          }`}
                          animate={settings.interrupt.enabled ? {
                            scale: [1, 1.1, 1],
                          } : {}}
                          transition={{ duration: 0.3 }}
                        >
                          <Hand size={20} />
                        </motion.div>
                        <div className="text-left">
                          <div className={`text-sm font-medium ${
                            settings.interrupt.enabled ? 'text-orange-300' : 'text-white/80'
                          }`}>
                            Allow Interruption
                          </div>
                          <div className="text-xs text-white/50 mt-0.5">
                            {settings.interrupt.enabled
                              ? "Speak to interrupt MAIA while she's talking"
                              : "MAIA will finish speaking before listening"}
                          </div>
                        </div>
                      </div>
                      {/* Toggle Switch */}
                      <div className={`w-12 h-7 rounded-full p-1 transition-colors ${
                        settings.interrupt.enabled ? 'bg-orange-500' : 'bg-white/20'
                      }`}>
                        <motion.div
                          className="w-5 h-5 rounded-full bg-white shadow-md"
                          animate={{ x: settings.interrupt.enabled ? 20 : 0 }}
                          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                        />
                      </div>
                    </div>
                  </motion.button>

                  {/* Sensitivity selector - only show when enabled */}
                  {settings.interrupt.enabled && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-2 px-2"
                    >
                      <div className="text-xs text-white/50 mb-2">Sensitivity</div>
                      <div className="grid grid-cols-3 gap-2">
                        {(['low', 'normal', 'high'] as const).map((level) => (
                          <motion.button
                            key={level}
                            onClick={() => updateSetting('interrupt.sensitivity', level)}
                            className={`py-2 px-3 rounded-lg border text-xs transition-all ${
                              settings.interrupt.sensitivity === level
                                ? 'border-orange-500/50 bg-orange-500/15 text-orange-400'
                                : 'border-white/10 bg-black/20 text-white/60'
                            }`}
                            whileTap={{ scale: 0.95 }}
                          >
                            <span className="capitalize">{level}</span>
                            <div className="text-[10px] opacity-60 mt-0.5">
                              {level === 'low' && '300ms'}
                              {level === 'normal' && '200ms'}
                              {level === 'high' && '150ms'}
                            </div>
                          </motion.button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </motion.div>
                )}

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 }}
                >
                  <label className="flex items-center gap-2 text-sm font-medium text-amber-200/80 mb-3">
                    <Brain size={16} />
                    Memory
                    <InfoBubble featureId="memory-control" side="right" />
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['minimal', 'moderate', 'deep'] as const).map((depth) => (
                      <motion.button
                        key={depth}
                        onClick={() => updateSetting('memory.depth', depth)}
                        className={`py-3 px-3 rounded-xl border transition-all min-h-[56px] ${
                          settings.memory.depth === depth
                            ? 'border-amber-500/50 bg-amber-500/15 text-amber-400'
                            : 'border-white/10 bg-black/20 text-white/60'
                        }`}
                        whileTap={{ scale: 0.95 }}
                        whileHover={{ scale: 1.02 }}
                      >
                        <div className="text-xs capitalize">{depth}</div>
                      </motion.button>
                    ))}
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.38 }}
                >
                  <label className="flex items-center gap-2 text-sm font-medium text-amber-200/80 mb-3">
                    <Users size={16} />
                    Maia's Presence
                    <InfoBubble featureId="archetype-selector" side="right" />
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {ARCHETYPE_OPTIONS.map((archetype) => (
                      <motion.button
                        key={archetype.id}
                        onClick={() => updateSetting('archetype', archetype.id)}
                        className={`py-3 px-3 rounded-xl border transition-all min-h-[56px] ${
                          settings.archetype === archetype.id
                            ? archetype.id === 'AUTO'
                              ? 'border-purple-500/50 bg-purple-500/15 text-purple-300'
                              : 'border-amber-500/50 bg-amber-500/15 text-amber-400'
                            : 'border-white/10 bg-black/20 text-white/60'
                        }`}
                        whileTap={{ scale: 0.95 }}
                        whileHover={{ scale: 1.02 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                      >
                        <motion.div
                          className="text-xl mb-1"
                          animate={settings.archetype === archetype.id ? {
                            scale: [1, 1.2, 1],
                            rotate: [0, 10, -10, 0]
                          } : {}}
                          transition={{ duration: 0.5 }}
                        >
                          {archetype.emoji}
                        </motion.div>
                        <div className="text-xs">{archetype.name}</div>
                      </motion.button>
                    ))}
                  </div>
                </motion.div>

                {/* Conversation Style Selector */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <label className="flex items-center gap-2 text-sm font-medium text-amber-200/80 mb-3">
                    <MessageSquare size={16} />
                    Conversation Style
                    <InfoBubble featureId="conversation-style" side="right" />
                  </label>
                  <div className="space-y-2">
                    {(['her', 'classic', 'adaptive'] as ConversationMode[]).map((mode) => {
                      const description = CONVERSATION_STYLE_DESCRIPTIONS[mode];
                      const isSelected = settings.conversationMode === mode;

                      return (
                        <motion.button
                          key={mode}
                          onClick={() => updateSetting('conversationMode', mode)}
                          className={`w-full text-left p-3 rounded-xl border transition-all ${
                            isSelected
                              ? 'border-amber-500/50 bg-amber-500/15 text-amber-300'
                              : 'border-white/10 bg-black/20 text-white/60'
                          }`}
                          whileTap={{ scale: 0.98 }}
                          whileHover={{ scale: 1.01 }}
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{description.icon}</span>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium">{description.title}</span>
                                {isSelected && (
                                  <motion.span
                                    className="text-xs text-amber-400"
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                                  >
                                    Active
                                  </motion.span>
                                )}
                              </div>
                              <p className="text-xs text-white/50 mt-0.5">
                                {description.description}
                              </p>
                            </div>
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>
                </motion.div>

                {/* Connections Section - Google Calendar/Gmail */}
                {userId && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.43 }}
                  >
                    <label className="flex items-center gap-2 text-sm font-medium text-amber-200/80 mb-3">
                      <Link size={16} />
                      Connections
                    </label>
                    <div className="p-4 rounded-xl border border-white/10 bg-black/20">
                      <GoogleConnectSection userId={userId} />
                    </div>
                  </motion.div>
                )}

                {/* New Conversation Button */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.44 }}
                >
                  <motion.button
                    onClick={() => {
                      if ('vibrate' in navigator) navigator.vibrate(15);
                      // Dispatch event to clear conversation in OracleConversation
                      window.dispatchEvent(new CustomEvent('maia-new-conversation'));
                      onClose();
                    }}
                    className="w-full py-4 bg-gradient-to-r from-rose-500/20 to-orange-500/20
                             border border-rose-500/30 rounded-xl text-rose-300 font-medium
                             hover:from-rose-500/30 hover:to-orange-500/30 transition-all
                             flex items-center justify-center gap-2"
                    whileTap={{ scale: 0.98 }}
                    whileHover={{ scale: 1.01 }}
                  >
                    <Sparkles size={18} />
                    <span>New Conversation</span>
                  </motion.button>
                  <p className="text-xs text-white/40 text-center mt-2">
                    Clear history and start fresh with the welcome screen
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.45 }}
                >
                <motion.button
                  onClick={() => {
                    if ('vibrate' in navigator) navigator.vibrate(10);
                    window.location.href = '/account/settings';
                  }}
                  className="w-full py-4 bg-gradient-to-r from-purple-500/20 to-blue-500/20
                           border border-purple-500/30 rounded-xl text-purple-300 font-medium
                           hover:from-purple-500/30 hover:to-blue-500/30 transition-all
                           flex items-center justify-center gap-2 relative overflow-hidden"
                  whileTap={{ scale: 0.98 }}
                  whileHover={{ scale: 1.01 }}
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-purple-400/10 to-blue-400/10"
                    initial={{ x: '-100%' }}
                    animate={{ x: '100%' }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  />
                  <SettingsIcon size={18} />
                  <span className="relative z-10">Open Full Settings</span>
                </motion.button>
                </motion.div>
              </motion.div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
    </>
  );
}