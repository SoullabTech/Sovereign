"use client";

import React, { useState, useEffect } from 'react';
import { Settings, Save, RefreshCw, Info } from 'lucide-react';
import ToneSlider from './ToneSlider';
import { supabase } from '@/lib/supabase/client';

interface UserVoiceSettingsProps {
  userId: string;
  onClose?: () => void;
  onSave?: (settings: VoiceSettings) => void;
}

interface VoiceSettings {
  tone: number;
  adaptiveLearning: boolean;
  preferredGreetingTime: 'always' | 'first' | 'periodic';
  elementalBalance: boolean;
  symbolRecognition: boolean;
}

export default function UserVoiceSettings({
  userId,
  onClose,
  onSave
}: UserVoiceSettingsProps) {
  const [settings, setSettings] = useState<VoiceSettings>({
    tone: 0.5,
    adaptiveLearning: true,
    preferredGreetingTime: 'always',
    elementalBalance: true,
    symbolRecognition: true
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [previewGreeting, setPreviewGreeting] = useState('');

  // Load user settings on mount
  useEffect(() => {
    loadUserSettings();
  }, [userId]);

  const loadUserSettings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('user_settings')
        .select('voice_tone, adaptive_learning, greeting_frequency, elemental_balance, symbol_recognition')
        .eq('user_id', userId)
        .single();

      if (data && !error) {
        setSettings({
          tone: data.voice_tone ?? 0.5,
          adaptiveLearning: data.adaptive_learning ?? true,
          preferredGreetingTime: data.greeting_frequency ?? 'always',
          elementalBalance: data.elemental_balance ?? true,
          symbolRecognition: data.symbol_recognition ?? true
        });
      }
    } catch (error) {
      console.error('Failed to load user settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    try {
      setSaving(true);
      
      const { error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: userId,
          voice_tone: settings.tone,
          adaptive_learning: settings.adaptiveLearning,
          greeting_frequency: settings.preferredGreetingTime,
          elemental_balance: settings.elementalBalance,
          symbol_recognition: settings.symbolRecognition,
          updated_at: new Date().toISOString()
        });

      if (!error) {
        onSave?.(settings);
        
        // Show success feedback
        setPreviewGreeting('Settings saved successfully!');
        setTimeout(() => setPreviewGreeting(''), 3000);
      }
    } catch (error) {
      console.error('Failed to save settings:', error);
      setPreviewGreeting('Failed to save settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleTonePreview = async (tone: number) => {
    try {
      const response = await fetch('/api/v1/voice/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tone, userId })
      });
      
      const data = await response.json();
      if (data.greeting) {
        setPreviewGreeting(data.greeting);
      }
    } catch (error) {
      console.error('Failed to get preview:', error);
    }
  };

  const resetToDefaults = () => {
    setSettings({
      tone: 0.5,
      adaptiveLearning: true,
      preferredGreetingTime: 'always',
      elementalBalance: true,
      symbolRecognition: true
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="w-6 h-6 animate-spin text-amber-400" />
      </div>
    );
  }

  return (
    <div className="bg-slate-900 rounded-2xl shadow-2xl border border-slate-800 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <Settings className="w-5 h-5 text-amber-400" />
          <h2 className="text-xl font-semibold text-white">Voice & Personality Settings</h2>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        )}
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Tone Slider Section */}
        <div className="space-y-4">
          <div className="flex items-start gap-2">
            <h3 className="text-sm font-medium text-white">Maya&apos;s Voice Tone</h3>
            <div className="group relative">
              <Info className="w-4 h-4 text-slate-500 cursor-help" />
              <div className="absolute left-0 bottom-full mb-2 w-64 p-2 bg-slate-800 rounded-lg text-xs text-slate-300 opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity">
                Adjust how Maya speaks to you - from direct and grounded to poetic and mythic.
              </div>
            </div>
          </div>
          
          <ToneSlider
            value={settings.tone}
            onChange={(tone) => setSettings({ ...settings, tone })}
            onPreview={handleTonePreview}
            showPreview={true}
          />
        </div>

        {/* Adaptive Learning Toggle */}
        <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg">
          <div>
            <h3 className="text-sm font-medium text-white mb-1">Adaptive Learning</h3>
            <p className="text-xs text-slate-400">
              Allow Maya to learn your tone preference from your responses
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.adaptiveLearning}
              onChange={(e) => setSettings({ ...settings, adaptiveLearning: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
          </label>
        </div>

        {/* Greeting Frequency */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-white">Greeting Frequency</h3>
          <div className="grid grid-cols-3 gap-2">
            {[
              { value: 'always', label: 'Every Session' },
              { value: 'first', label: 'First of Day' },
              { value: 'periodic', label: 'Periodically' }
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => setSettings({ ...settings, preferredGreetingTime: option.value as any })}
                className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                  settings.preferredGreetingTime === option.value
                    ? 'bg-amber-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Feature Toggles */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-white">Mystical Features</h3>
          
          <div className="space-y-2">
            <label className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg cursor-pointer hover:bg-slate-800/50 transition-colors">
              <span className="text-sm text-slate-300">Elemental Balance Tracking</span>
              <input
                type="checkbox"
                checked={settings.elementalBalance}
                onChange={(e) => setSettings({ ...settings, elementalBalance: e.target.checked })}
                className="w-4 h-4 text-amber-600 bg-slate-700 border-slate-600 rounded focus:ring-amber-500"
              />
            </label>
            
            <label className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg cursor-pointer hover:bg-slate-800/50 transition-colors">
              <span className="text-sm text-slate-300">Symbol Recognition</span>
              <input
                type="checkbox"
                checked={settings.symbolRecognition}
                onChange={(e) => setSettings({ ...settings, symbolRecognition: e.target.checked })}
                className="w-4 h-4 text-amber-600 bg-slate-700 border-slate-600 rounded focus:ring-amber-500"
              />
            </label>
          </div>
        </div>

        {/* Preview Text */}
        {previewGreeting && (
          <div className="p-4 bg-amber-900/20 border border-amber-700/30 rounded-lg">
            <p className="text-sm text-amber-200 italic">
              {previewGreeting}
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between p-6 border-t border-slate-800">
        <button
          onClick={resetToDefaults}
          className="px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors"
        >
          Reset to Defaults
        </button>
        
        <div className="flex gap-3">
          {onClose && (
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
          )}
          
          <button
            onClick={saveSettings}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors"
          >
            {saving ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
}