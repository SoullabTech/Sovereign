'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Mic, Brain, Sparkles, Settings as SettingsIcon, Users, MessageSquare } from 'lucide-react';
import { useState, useEffect } from 'react';
import type { ArchetypeId } from '@/lib/services/archetypePreferenceService';
import { ConversationMode, CONVERSATION_STYLE_DESCRIPTIONS } from '@/lib/types/conversation-style';
// import { ConversationStylePreference } from '@/lib/preferences/conversation-style-preference';

interface QuickSettingsSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

interface MaiaSettings {
  voice: {
    openaiVoice: 'alloy' | 'shimmer' | 'nova' | 'fable' | 'echo' | 'onyx';
    speed: number;
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
}

const VOICE_OPTIONS = [
  { id: 'shimmer', name: 'Shimmer', emoji: '💧', gender: 'Female', quality: 'Warm & Empathetic' },
  { id: 'nova', name: 'Nova', emoji: '⭐', gender: 'Female', quality: 'Energetic & Bright' },
  { id: 'alloy', name: 'Alloy', emoji: '🌍', gender: 'Neutral', quality: 'Balanced & Clear' },
  { id: 'echo', name: 'Echo', emoji: '🎙️', gender: 'Male', quality: 'Professional & Clear' },
  { id: 'fable', name: 'Fable', emoji: '📖', gender: 'Male', quality: 'Expressive & British' },
  { id: 'onyx', name: 'Onyx', emoji: '🗣️', gender: 'Male', quality: 'Deep & Authoritative' },
];

const ARCHETYPE_OPTIONS = [
  { id: 'TRUSTED_FRIEND' as ArchetypeId, name: 'Friend', emoji: '☕' },
  { id: 'GUIDE' as ArchetypeId, name: 'Guide', emoji: '🧭' },
  { id: 'MENTOR' as ArchetypeId, name: 'Mentor', emoji: '📖' },
  { id: 'ALCHEMIST' as ArchetypeId, name: 'Alchemist', emoji: '⚗️' },
  { id: 'LAB_PARTNER' as ArchetypeId, name: 'Lab Partner', emoji: '🔬' },
  { id: 'AUTO' as ArchetypeId, name: 'Auto', emoji: '✨' },
];

const DEFAULT_SETTINGS: MaiaSettings = {
  voice: {
    openaiVoice: 'shimmer',
    speed: 0.95,
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
};

export function QuickSettingsSheet({ isOpen, onClose }: QuickSettingsSheetProps) {
  const [settings, setSettings] = useState<MaiaSettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    const loadSettings = () => {
      if (typeof window === 'undefined') return;

      // Sovereignty mode: Load from localStorage only (Supabase removed)
      const saved = localStorage.getItem('maia_settings');
      if (saved) {
        try {
          const parsedSettings = JSON.parse(saved);
          setSettings(parsedSettings);
        } catch (e) {
          console.error('Failed to parse settings', e);
          setSettings(DEFAULT_SETTINGS);
        }
      }
    };

    if (isOpen) {
      loadSettings();
    }
  }, [isOpen]);

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

        // Sovereignty mode: Settings persistence is localStorage-only (Supabase removed)
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
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 }}
                >
                  <label className="flex items-center gap-2 text-sm font-medium text-amber-200/80 mb-3">
                    <Mic size={16} />
                    Voice Model
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {VOICE_OPTIONS.map((voice) => (
                      <motion.button
                        key={voice.id}
                        onClick={() => updateSetting('voice.openaiVoice', voice.id)}
                        className={`py-3 px-3 rounded-xl border transition-all min-h-[72px] ${
                          settings.voice.openaiVoice === voice.id
                            ? 'border-amber-500/50 bg-amber-500/15 text-amber-400'
                            : 'border-white/10 bg-black/20 text-white/60'
                        }`}
                        whileTap={{ scale: 0.95 }}
                        whileHover={{ scale: 1.02 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                      >
                        <motion.div
                          className="text-xl mb-1"
                          animate={settings.voice.openaiVoice === voice.id ? {
                            scale: [1, 1.2, 1],
                            rotate: [0, 10, -10, 0]
                          } : {}}
                          transition={{ duration: 0.5 }}
                        >
                          {voice.emoji}
                        </motion.div>
                        <div className="text-xs font-medium">{voice.name}</div>
                        <div className="text-[10px] opacity-60">{voice.gender}</div>
                        <div className="text-[9px] opacity-50 mt-0.5">{voice.quality}</div>
                      </motion.button>
                    ))}
                  </div>
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

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 }}
                >
                  <label className="flex items-center gap-2 text-sm font-medium text-amber-200/80 mb-3">
                    <Brain size={16} />
                    Memory
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

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.45 }}
                >
                <motion.button
                  onClick={() => {
                    if ('vibrate' in navigator) navigator.vibrate(10);
                    window.location.href = '/settings';
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
  );
}