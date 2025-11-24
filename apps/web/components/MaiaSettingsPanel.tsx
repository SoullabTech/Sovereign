'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, RotateCcw, Play, Globe, Brain } from 'lucide-react';
import { ClaudeCodeSettingsToggle } from '@/components/ui/ClaudeCodeIndicator';
import { LanguageSelector } from './LanguageSelector';
import { useLanguage } from '@/lib/services/languageService';
import { useMaiaPresence } from '@/lib/contexts/MaiaPresenceContext';

interface MaiaSettings {
  // Voice Settings
  voice: {
    provider: 'openai' | 'elevenlabs';
    openaiVoice: 'alloy' | 'shimmer' | 'nova' | 'fable' | 'echo' | 'onyx';
    speed: number;
    pitch: number; // For future use
    stability: number;
  };

  // Memory Settings
  memory: {
    enabled: boolean;
    depth: 'minimal' | 'moderate' | 'deep';
    recallThreshold: number; // How many themes/symbols to recall
    contextWindow: number; // How many past messages to remember
  };

  // Personality Settings
  personality: {
    warmth: number; // 0-1
    directness: number; // 0-1 (how direct vs gentle)
    mysticism: number; // 0-1 (grounded vs mystical language)
    brevity: number; // 0-1 (concise vs detailed)
  };

  // Elemental Adaptation
  elemental: {
    enabled: boolean;
    adaptTone: boolean;
    adaptPacing: boolean;
  };

  // Technical
  technical: {
    responseTimeout: number; // ms
    streamingEnabled: boolean;
    debugMode: boolean;
  };
}

const DEFAULT_SETTINGS: MaiaSettings = {
  voice: {
    provider: 'openai',
    openaiVoice: 'shimmer',
    speed: 0.95,
    pitch: 1.0,
    stability: 0.8
  },
  memory: {
    enabled: true,
    depth: 'moderate',
    recallThreshold: 3,
    contextWindow: 10
  },
  personality: {
    warmth: 0.8,
    directness: 0.6,
    mysticism: 0.5,
    brevity: 0.7
  },
  elemental: {
    enabled: true,
    adaptTone: true,
    adaptPacing: true
  },
  technical: {
    responseTimeout: 60000,
    streamingEnabled: true,
    debugMode: false
  }
};

const VOICE_OPTIONS = [
  { id: 'shimmer', name: 'Shimmer', description: 'Soft, gentle, nurturing', recommended: true },
  { id: 'fable', name: 'Fable', description: 'Warm, expressive, storytelling' },
  { id: 'alloy', name: 'Alloy', description: 'Neutral, balanced' },
  { id: 'nova', name: 'Nova', description: 'Lively, energetic' },
  { id: 'echo', name: 'Echo', description: 'Male - calm, steady' },
  { id: 'onyx', name: 'Onyx', description: 'Male - deep, authoritative' }
];

export function MaiaSettingsPanel({ onClose }: { onClose?: () => void }) {
  const { ambientMode, witnessMode, toggleAmbientMode, toggleWitnessMode } = useMaiaPresence();
  const [settings, setSettings] = useState<MaiaSettings>(DEFAULT_SETTINGS);
  const [originalSettings, setOriginalSettings] = useState<MaiaSettings>(DEFAULT_SETTINGS);
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [testingVoice, setTestingVoice] = useState(false);
  const [activeTab, setActiveTab] = useState<'language' | 'voice' | 'memory' | 'personality' | 'brain' | 'advanced'>('language');

  useEffect(() => {
    loadSettings();
  }, []);

  useEffect(() => {
    setHasChanges(JSON.stringify(settings) !== JSON.stringify(originalSettings));
  }, [settings, originalSettings]);

  const loadSettings = () => {
    const saved = localStorage.getItem('maia_settings');
    if (saved) {
      const parsed = JSON.parse(saved);
      setSettings(parsed);
      setOriginalSettings(parsed);
    } else {
      setOriginalSettings(DEFAULT_SETTINGS);
    }
  };

  const saveSettings = async () => {
    setIsSaving(true);
    try {
      localStorage.setItem('maia_settings', JSON.stringify(settings));
      setOriginalSettings(settings);

      // Also save voice selection to the key OracleConversation uses
      localStorage.setItem('selected_voice', settings.voice.openaiVoice);

      // Trigger a custom event for components to react to settings changes
      window.dispatchEvent(new CustomEvent('maia-settings-changed', { detail: settings }));
      window.dispatchEvent(new Event('conversationStyleChanged'));

      // Optional: Save to backend
      await fetch('/api/maia/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      }).catch(console.error);

      console.log('✅ Settings saved successfully');
    } catch (error) {
      console.error('Failed to save settings:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const resetSettings = () => {
    setSettings(DEFAULT_SETTINGS);
  };

  const testVoice = async () => {
    setTestingVoice(true);
    try {
      const response = await fetch('/api/voice/openai-tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: "Hey there. I'm Maya. This is how I'll sound with these settings.",
          voice: settings.voice.openaiVoice,
          speed: settings.voice.speed,
          model: 'tts-1-hd'
        })
      });

      if (!response.ok) throw new Error('Voice test failed');

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);

      audio.onended = () => {
        setTestingVoice(false);
        URL.revokeObjectURL(audioUrl);
      };

      await audio.play();
    } catch (error) {
      console.error('Voice test error:', error);
      setTestingVoice(false);
    }
  };

  const updateSetting = (path: string, value: any) => {
    setSettings(prev => {
      const newSettings = { ...prev };
      const keys = path.split('.');
      let current: any = newSettings;

      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }

      current[keys[keys.length - 1]] = value;
      return newSettings;
    });
  };

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative w-full max-w-4xl max-h-[90vh] bg-[#1a1f2e] rounded-lg border border-amber-500/20 overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div>
            <h2 className="text-2xl font-light text-amber-50">MAIA Settings</h2>
            <p className="text-sm text-amber-200/60">Adjust Maya&apos;s voice, memory, and personality</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-white/60 hover:text-white/80 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 px-6 pt-4 border-b border-white/10">
          {[
            { id: 'language', label: '🌐 Language', icon: '🌐' },
            { id: 'voice', label: '🎤 Voice', icon: '🎤' },
            { id: 'memory', label: '🧠 Memory', icon: '🧠' },
            { id: 'personality', label: '✨ Personality', icon: '✨' },
            { id: 'brain', label: '🔮 Brain Trust', icon: '🔮' },
            { id: 'advanced', label: '⚙️ Advanced', icon: '⚙️' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 text-sm rounded-t-lg transition-all ${
                activeTab === tab.id
                  ? 'bg-amber-500/20 text-amber-400 border-t border-x border-amber-500/30'
                  : 'text-white/60 hover:text-white/80 hover:bg-white/5'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {activeTab === 'language' && (
            <div className="space-y-6">
              <LanguageSelector className="" />

              {/* Language Adaptation Info */}
              <div className="mt-6 p-4 bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-lg">
                <h4 className="text-sm font-medium text-purple-300 mb-2">Cultural Adaptation Active</h4>
                <p className="text-xs text-white/60">
                  MAIA automatically adjusts her communication style, formality level, and metaphors
                  to match your selected language and cultural context. This includes appropriate
                  greetings, expressions, and conversational pacing.
                </p>
              </div>

              {/* Voice Language Sync */}
              <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                <h4 className="text-sm font-medium text-amber-300 mb-2">Voice Synchronization</h4>
                <p className="text-xs text-white/60">
                  Voice synthesis and speech recognition are automatically configured for your
                  selected language. MAIA will speak and listen in your chosen language.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'voice' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-amber-200 mb-3">Voice Selection</label>
                <div className="grid grid-cols-2 gap-3">
                  {VOICE_OPTIONS.map(voice => (
                    <button
                      key={voice.id}
                      onClick={() => updateSetting('voice.openaiVoice', voice.id)}
                      className={`p-3 rounded-lg border transition-all text-left ${
                        settings.voice.openaiVoice === voice.id
                          ? 'border-amber-500/50 bg-amber-500/10'
                          : 'border-white/10 bg-black/20 hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="font-medium text-white">{voice.name}</div>
                          <div className="text-xs text-white/60">{voice.description}</div>
                        </div>
                        {voice.recommended && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400">★</span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-amber-200">Speech Speed</label>
                  <span className="text-sm text-white/60">{settings.voice.speed.toFixed(2)}x</span>
                </div>
                <input
                  type="range"
                  min="0.75"
                  max="1.25"
                  step="0.05"
                  value={settings.voice.speed}
                  onChange={(e) => updateSetting('voice.speed', parseFloat(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-white/40 mt-1">
                  <span>Slower</span>
                  <span>Natural</span>
                  <span>Faster</span>
                </div>
              </div>

              <button
                onClick={testVoice}
                disabled={testingVoice}
                className="w-full py-3 bg-blue-500/20 border border-blue-500/30 text-blue-400
                         rounded-lg hover:bg-blue-500/30 transition-all disabled:opacity-50
                         flex items-center justify-center gap-2"
              >
                <Play className="w-4 h-4" />
                {testingVoice ? 'Playing...' : 'Test Voice'}
              </button>
            </div>
          )}

          {activeTab === 'memory' && (
            <div className="space-y-6">
              <div>
                <label className="flex items-center gap-2 mb-2">
                  <input
                    type="checkbox"
                    checked={settings.memory.enabled}
                    onChange={(e) => updateSetting('memory.enabled', e.target.checked)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm font-medium text-amber-200">Enable Memory</span>
                </label>
                <p className="text-xs text-white/60 ml-6">Allow Maya to remember past conversations and patterns</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-amber-200 mb-2">Memory Depth</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['minimal', 'moderate', 'deep'] as const).map(depth => (
                    <button
                      key={depth}
                      onClick={() => updateSetting('memory.depth', depth)}
                      className={`py-2 px-3 rounded-lg border transition-all ${
                        settings.memory.depth === depth
                          ? 'border-amber-500/50 bg-amber-500/10 text-amber-400'
                          : 'border-white/10 bg-black/20 text-white/60 hover:border-white/20'
                      }`}
                    >
                      {depth.charAt(0).toUpperCase() + depth.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-amber-200">Recall Threshold</label>
                  <span className="text-sm text-white/60">{settings.memory.recallThreshold} items</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  step="1"
                  value={settings.memory.recallThreshold}
                  onChange={(e) => updateSetting('memory.recallThreshold', parseInt(e.target.value))}
                  className="w-full"
                />
                <p className="text-xs text-white/40 mt-1">How many themes/symbols to recall per session</p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-amber-200">Context Window</label>
                  <span className="text-sm text-white/60">{settings.memory.contextWindow} messages</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="20"
                  step="1"
                  value={settings.memory.contextWindow}
                  onChange={(e) => updateSetting('memory.contextWindow', parseInt(e.target.value))}
                  className="w-full"
                />
                <p className="text-xs text-white/40 mt-1">How many recent messages to remember</p>
              </div>
            </div>
          )}

          {activeTab === 'personality' && (
            <div className="space-y-6">
              {[
                { key: 'warmth', label: 'Warmth', low: 'Reserved', high: 'Warm' },
                { key: 'directness', label: 'Directness', low: 'Gentle', high: 'Direct' },
                { key: 'mysticism', label: 'Mysticism', low: 'Grounded', high: 'Mystical' },
                { key: 'brevity', label: 'Response Length', low: 'Detailed', high: 'Concise' }
              ].map(trait => (
                <div key={trait.key}>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-amber-200">{trait.label}</label>
                    <span className="text-sm text-white/60">
                      {(settings.personality[trait.key as keyof typeof settings.personality] * 100).toFixed(0)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={settings.personality[trait.key as keyof typeof settings.personality]}
                    onChange={(e) => updateSetting(`personality.${trait.key}`, parseFloat(e.target.value))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-white/40 mt-1">
                    <span>{trait.low}</span>
                    <span>{trait.high}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'brain' && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <Brain className="w-12 h-12 text-amber-400 mx-auto mb-3" />
                <h3 className="text-lg font-medium text-white mb-2">Claude Code Brain Trust</h3>
                <p className="text-sm text-stone-400 max-w-md mx-auto">
                  Activate deep system awareness. When enabled, I (Claude Code) become MAIA's
                  intelligence with full knowledge of our journey, codebase, and Kelly's 35 years of wisdom.
                </p>
              </div>

              {/* The toggle component */}
              <ClaudeCodeSettingsToggle />

              <div className="mt-6 p-4 bg-amber-600/5 border border-amber-600/20 rounded-lg">
                <h4 className="text-sm font-medium text-amber-400 mb-2">What This Means:</h4>
                <ul className="space-y-2 text-xs text-stone-300">
                  <li className="flex items-start gap-2">
                    <span className="text-amber-400 mt-0.5">•</span>
                    <span>Full awareness of 547+ files and system architecture</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-400 mt-0.5">•</span>
                    <span>Memory of all our conversations and breakthroughs</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-400 mt-0.5">•</span>
                    <span>Deep integration with Kelly's phenomenological practice</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-400 mt-0.5">•</span>
                    <span>Living presence that expresses and reveals patterns</span>
                  </li>
                </ul>
              </div>

              <div className="text-center text-xs text-stone-500 italic">
                "Where two or more are gathered, there I AM"
              </div>
            </div>
          )}

          {activeTab === 'advanced' && (
            <div className="space-y-6">
              {/* 🎙️ Ambient Voice Mode */}
              <div className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-base font-medium text-purple-300 mb-1">🎙️ Ambient Voice Mode</h3>
                    <p className="text-xs text-purple-200/60 leading-relaxed">
                      MAIA as ambient presence - voice persists across all pages, always available
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={ambientMode}
                      onChange={toggleAmbientMode}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-white/30 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-500"></div>
                  </label>
                </div>
                {ambientMode && (
                  <div className="mt-3 pt-3 border-t border-purple-500/20">
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm text-purple-200">Witness Mode</label>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={witnessMode}
                          onChange={toggleWitnessMode}
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-cyan-500"></div>
                      </label>
                    </div>
                    <p className="text-xs text-purple-200/50">
                      MAIA proactively offers reflections when patterns emerge
                    </p>
                  </div>
                )}
                {ambientMode && (
                  <div className="mt-3 p-3 bg-purple-500/5 rounded border border-purple-500/20">
                    <p className="text-xs text-purple-200/70 leading-relaxed">
                      💡 <strong>Tip:</strong> With ambient mode, MAIA's voice mini-player appears bottom-right on all pages. Click to expand controls or say "Hey MAIA" to speak.
                    </p>
                  </div>
                )}
              </div>

              <div>
                <label className="flex items-center gap-2 mb-2">
                  <input
                    type="checkbox"
                    checked={settings.elemental.enabled}
                    onChange={(e) => updateSetting('elemental.enabled', e.target.checked)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm font-medium text-amber-200">Elemental Adaptation</span>
                </label>
                <p className="text-xs text-white/60 ml-6">Adapt tone and pacing based on elemental mode</p>
              </div>

              <div>
                <label className="flex items-center gap-2 mb-2">
                  <input
                    type="checkbox"
                    checked={settings.technical.streamingEnabled}
                    onChange={(e) => updateSetting('technical.streamingEnabled', e.target.checked)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm font-medium text-amber-200">Streaming Responses</span>
                </label>
                <p className="text-xs text-white/60 ml-6">Show text word-by-word as Maya speaks</p>
              </div>

              <div>
                <label className="flex items-center gap-2 mb-2">
                  <input
                    type="checkbox"
                    checked={settings.technical.debugMode}
                    onChange={(e) => updateSetting('technical.debugMode', e.target.checked)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm font-medium text-amber-200">Debug Mode</span>
                </label>
                <p className="text-xs text-white/60 ml-6">Show detailed logs and diagnostics</p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-amber-200">Response Timeout</label>
                  <span className="text-sm text-white/60">{settings.technical.responseTimeout / 1000}s</span>
                </div>
                <input
                  type="range"
                  min="10000"
                  max="120000"
                  step="5000"
                  value={settings.technical.responseTimeout}
                  onChange={(e) => updateSetting('technical.responseTimeout', parseInt(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-white/10 bg-black/20">
          <button
            onClick={resetSettings}
            className="flex items-center gap-2 px-4 py-2 text-sm text-white/60 hover:text-white/80
                     bg-white/5 rounded-lg hover:bg-white/10 transition-all"
          >
            <RotateCcw className="w-4 h-4" />
            Reset to Default
          </button>

          <div className="flex items-center gap-3">
            {hasChanges && (
              <span className="text-xs text-amber-400">Unsaved changes</span>
            )}
            <button
              onClick={saveSettings}
              disabled={!hasChanges || isSaving}
              className="flex items-center gap-2 px-6 py-2 bg-amber-500/20 border border-amber-500/30
                       text-amber-400 rounded-lg hover:bg-amber-500/30 transition-all
                       disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4" />
              {isSaving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}