'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, Mic, Brain, Users, MessageSquare, RotateCcw, Check } from 'lucide-react';
import {
  getAccountSettings,
  saveAccountSettings,
  resetAccountSettings,
  DEFAULT_ACCOUNT_SETTINGS,
  type AccountSettings as AccountSettingsType,
} from '@/lib/settings/accountSettings';
import type { ArchetypeId } from '@/lib/services/archetypePreferenceService';
import { ConversationMode, CONVERSATION_STYLE_DESCRIPTIONS } from '@/lib/types/conversation-style';

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

export function AccountSettings() {
  const [settings, setSettings] = useState<AccountSettingsType>(DEFAULT_ACCOUNT_SETTINGS);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setSettings(getAccountSettings());
  }, []);

  const updateSetting = <K extends keyof AccountSettingsType>(
    key: K,
    value: AccountSettingsType[K]
  ) => {
    if ('vibrate' in navigator) {
      navigator.vibrate(5);
    }

    const updated = { ...settings, [key]: value };
    setSettings(updated);
    saveAccountSettings(updated);

    // Brief save indicator
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  const updateNestedSetting = (path: string, value: unknown) => {
    if ('vibrate' in navigator) {
      navigator.vibrate(5);
    }

    const keys = path.split('.');
    const updated = { ...settings };
    let current: Record<string, unknown> = updated;

    for (let i = 0; i < keys.length - 1; i++) {
      current[keys[i]] = { ...(current[keys[i]] as Record<string, unknown>) };
      current = current[keys[i]] as Record<string, unknown>;
    }
    current[keys[keys.length - 1]] = value;

    setSettings(updated);
    saveAccountSettings(updated);

    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  const handleReset = () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }
    const defaults = resetAccountSettings();
    setSettings(defaults);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-light text-amber-50">Account Settings</h1>
          <p className="text-sm text-white/50 mt-1">
            Defaults for new sessions. Override anytime in Quick Settings.
          </p>
        </div>

        {/* Save indicator */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: saved ? 1 : 0, scale: saved ? 1 : 0.8 }}
          className="flex items-center gap-1.5 text-emerald-400 text-sm"
        >
          <Check size={16} />
          <span>Saved</span>
        </motion.div>
      </div>

      <div className="space-y-8">
        {/* Default Memory Mode */}
        <section>
          <label className="flex items-center gap-2 text-sm font-medium text-amber-200/80 mb-3">
            <Shield size={16} />
            Default Memory Mode
          </label>
          <p className="text-xs text-white/50 mb-4">
            Choose whether new sessions start with memory enabled or in Sanctuary.
          </p>
          <div className="grid grid-cols-2 gap-3">
            <motion.button
              onClick={() => updateSetting('defaultMemoryMode', 'continuity')}
              className={`p-4 rounded-xl border text-left transition-all ${
                settings.defaultMemoryMode === 'continuity'
                  ? 'border-amber-500/50 bg-amber-500/15'
                  : 'border-white/10 bg-black/20'
              }`}
              whileTap={{ scale: 0.98 }}
            >
              <div className="text-sm font-medium text-white/90">Continuity</div>
              <div className="text-xs text-white/50 mt-1">
                MAIA remembers what's helpful for growth.
              </div>
            </motion.button>

            <motion.button
              onClick={() => updateSetting('defaultMemoryMode', 'sanctuary')}
              className={`p-4 rounded-xl border text-left transition-all ${
                settings.defaultMemoryMode === 'sanctuary'
                  ? 'border-emerald-500/50 bg-emerald-500/15'
                  : 'border-white/10 bg-black/20'
              }`}
              whileTap={{ scale: 0.98 }}
            >
              <div className="text-sm font-medium text-emerald-300">Sanctuary</div>
              <div className="text-xs text-white/50 mt-1">
                Sessions aren't saved. Speak freely.
              </div>
            </motion.button>
          </div>
        </section>

        {/* Voice Model */}
        <section>
          <label className="flex items-center gap-2 text-sm font-medium text-amber-200/80 mb-3">
            <Mic size={16} />
            Voice Model
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {VOICE_OPTIONS.map((voice) => (
              <motion.button
                key={voice.id}
                onClick={() => updateNestedSetting('voice.openaiVoice', voice.id)}
                className={`py-3 px-3 rounded-xl border transition-all ${
                  settings.voice.openaiVoice === voice.id
                    ? 'border-amber-500/50 bg-amber-500/15 text-amber-400'
                    : 'border-white/10 bg-black/20 text-white/60'
                }`}
                whileTap={{ scale: 0.95 }}
              >
                <div className="text-xl mb-1">{voice.emoji}</div>
                <div className="text-xs font-medium">{voice.name}</div>
                <div className="text-[10px] opacity-60">{voice.gender}</div>
              </motion.button>
            ))}
          </div>
        </section>

        {/* Voice Speed */}
        <section>
          <label className="flex items-center gap-2 text-sm font-medium text-amber-200/80 mb-3">
            Voice Speed: {settings.voice.speed.toFixed(2)}x
          </label>
          <input
            type="range"
            min="0.75"
            max="1.25"
            step="0.05"
            value={settings.voice.speed}
            onChange={(e) => updateNestedSetting('voice.speed', parseFloat(e.target.value))}
            className="w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer
                     [&::-webkit-slider-thumb]:appearance-none
                     [&::-webkit-slider-thumb]:w-5
                     [&::-webkit-slider-thumb]:h-5
                     [&::-webkit-slider-thumb]:rounded-full
                     [&::-webkit-slider-thumb]:bg-amber-500"
          />
          <div className="flex justify-between text-xs text-white/40 mt-2">
            <span>Slower</span>
            <span>Natural</span>
            <span>Faster</span>
          </div>
        </section>

        {/* Memory Depth */}
        <section>
          <label className="flex items-center gap-2 text-sm font-medium text-amber-200/80 mb-3">
            <Brain size={16} />
            Memory Depth (when in Continuity)
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(['minimal', 'moderate', 'deep'] as const).map((depth) => (
              <motion.button
                key={depth}
                onClick={() => updateNestedSetting('memory.depth', depth)}
                className={`py-3 px-3 rounded-xl border transition-all ${
                  settings.memory.depth === depth
                    ? 'border-amber-500/50 bg-amber-500/15 text-amber-400'
                    : 'border-white/10 bg-black/20 text-white/60'
                }`}
                whileTap={{ scale: 0.95 }}
              >
                <div className="text-xs capitalize">{depth}</div>
              </motion.button>
            ))}
          </div>
        </section>

        {/* Archetype */}
        <section>
          <label className="flex items-center gap-2 text-sm font-medium text-amber-200/80 mb-3">
            <Users size={16} />
            MAIA's Presence
          </label>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {ARCHETYPE_OPTIONS.map((archetype) => (
              <motion.button
                key={archetype.id}
                onClick={() => updateSetting('archetype', archetype.id)}
                className={`py-3 px-3 rounded-xl border transition-all ${
                  settings.archetype === archetype.id
                    ? archetype.id === 'AUTO'
                      ? 'border-purple-500/50 bg-purple-500/15 text-purple-300'
                      : 'border-amber-500/50 bg-amber-500/15 text-amber-400'
                    : 'border-white/10 bg-black/20 text-white/60'
                }`}
                whileTap={{ scale: 0.95 }}
              >
                <div className="text-xl mb-1">{archetype.emoji}</div>
                <div className="text-xs">{archetype.name}</div>
              </motion.button>
            ))}
          </div>
        </section>

        {/* Conversation Style */}
        <section>
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
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{description.icon}</span>
                    <div className="flex-1">
                      <span className="text-sm font-medium">{description.title}</span>
                      <p className="text-xs text-white/50 mt-0.5">{description.description}</p>
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </section>

        {/* Reset */}
        <section className="pt-4 border-t border-white/10">
          <motion.button
            onClick={handleReset}
            className="flex items-center gap-2 text-sm text-white/50 hover:text-white/70 transition-colors"
            whileTap={{ scale: 0.98 }}
          >
            <RotateCcw size={14} />
            Reset to defaults
          </motion.button>
        </section>
      </div>
    </div>
  );
}
