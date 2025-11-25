// lib/components/VoiceConfigurationPanel.tsx
// Enhanced voice configuration with preference integration

"use client";

import React from 'react';
import { useVoiceConfig } from '../hooks/useUserPreferences';
import VoiceSelectionUI from '../agents/modules/VoiceSelectionUI';
import { Settings, Save, RefreshCw } from 'lucide-react';

interface VoiceConfigurationPanelProps {
  userId: string;
  userLevel?: number;
  onPreviewVoice?: (voiceId: string) => Promise<void>;
  className?: string;
}

export const VoiceConfigurationPanel: React.FC<VoiceConfigurationPanelProps> = ({
  userId,
  userLevel = 1,
  onPreviewVoice,
  className = ''
}) => {
  const {
    voiceId,
    voiceMode,
    interactionMode,
    customWakeWord,
    nudgesEnabled,
    setVoiceId,
    setVoiceMode,
    setInteractionMode,
    setCustomWakeWord,
    setNudgesEnabled,
    loading,
    error
  } = useVoiceConfig(userId);

  const [isExpanded, setIsExpanded] = React.useState(false);
  const [customWakeWordInput, setCustomWakeWordInput] = React.useState(customWakeWord || '');
  const [saveStatus, setSaveStatus] = React.useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  const handleVoiceSelect = async (selectedVoiceId: string) => {
    setSaveStatus('saving');
    try {
      await setVoiceId(selectedVoiceId);
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (err) {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  };

  const handleModeChange = async (mode: typeof voiceMode) => {
    setSaveStatus('saving');
    try {
      await setVoiceMode(mode);
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (err) {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  };

  const handleInteractionModeChange = async (mode: typeof interactionMode) => {
    setSaveStatus('saving');
    try {
      await setInteractionMode(mode);
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (err) {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  };

  const handleSaveCustomWakeWord = async () => {
    if (customWakeWordInput.trim() === customWakeWord) return;

    setSaveStatus('saving');
    try {
      await setCustomWakeWord(customWakeWordInput.trim());
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (err) {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  };

  const handleNudgeToggle = async (enabled: boolean) => {
    setSaveStatus('saving');
    try {
      await setNudgesEnabled(enabled);
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (err) {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  };

  if (loading) {
    return (
      <div className={`animate-pulse bg-gray-100 dark:bg-gray-800 rounded-lg p-6 ${className}`}>
        <div className="flex items-center space-x-2 mb-4">
          <div className="w-5 h-5 bg-gray-300 dark:bg-gray-600 rounded"></div>
          <div className="w-32 h-5 bg-gray-300 dark:bg-gray-600 rounded"></div>
        </div>
        <div className="space-y-3">
          <div className="w-full h-4 bg-gray-300 dark:bg-gray-600 rounded"></div>
          <div className="w-3/4 h-4 bg-gray-300 dark:bg-gray-600 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Settings className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Voice Configuration
            </h3>
          </div>

          <div className="flex items-center space-x-2">
            {/* Save Status Indicator */}
            {saveStatus !== 'idle' && (
              <div className="flex items-center space-x-1 text-sm">
                {saveStatus === 'saving' && (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-blue-500" />
                    <span className="text-blue-600">Saving...</span>
                  </>
                )}
                {saveStatus === 'saved' && (
                  <>
                    <Save className="w-4 h-4 text-green-500" />
                    <span className="text-green-600">Saved</span>
                  </>
                )}
                {saveStatus === 'error' && (
                  <span className="text-red-600">Save failed</span>
                )}
              </div>
            )}

            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              {isExpanded ? 'Collapse' : 'Expand'}
            </button>
          </div>
        </div>

        {/* Current Configuration Summary */}
        {!isExpanded && (
          <div className="mt-3 grid grid-cols-3 gap-4 text-sm">
            <div>
              <div className="text-gray-500 dark:text-gray-400">Voice</div>
              <div className="font-medium text-gray-900 dark:text-gray-100">
                {voiceId === 'maya-alloy' ? 'Maya' : voiceId === 'anthony-onyx' ? 'Anthony' : voiceId}
              </div>
            </div>
            <div>
              <div className="text-gray-500 dark:text-gray-400">Mode</div>
              <div className="font-medium text-gray-900 dark:text-gray-100 capitalize">
                {voiceMode.replace('-', ' ')}
              </div>
            </div>
            <div>
              <div className="text-gray-500 dark:text-gray-400">Style</div>
              <div className="font-medium text-gray-900 dark:text-gray-100 capitalize">
                {interactionMode}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Expanded Configuration */}
      {isExpanded && (
        <div className="p-4">
          {error && (
            <div className="mb-4 p-3 bg-red-100 dark:bg-red-900 border border-red-300 dark:border-red-700 rounded-lg">
              <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
            </div>
          )}

          <VoiceSelectionUI
            currentVoiceId={voiceId}
            userLevel={userLevel}
            onVoiceSelect={handleVoiceSelect}
            onPreviewVoice={onPreviewVoice}
            onModeChange={handleModeChange}
            onInteractionModeChange={handleInteractionModeChange}
            initialVoiceMode={voiceMode}
            initialInteractionMode={interactionMode}
          />

          {/* Custom Wake Word */}
          {voiceMode === 'wake-word' && (
            <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3">
                Custom Wake Word
              </h4>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={customWakeWordInput}
                  onChange={(e) => setCustomWakeWordInput(e.target.value)}
                  placeholder={`Hello ${voiceId === 'maya-alloy' ? 'Maya' : 'Anthony'}`}
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm"
                />
                <button
                  onClick={handleSaveCustomWakeWord}
                  disabled={customWakeWordInput.trim() === customWakeWord || saveStatus === 'saving'}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 disabled:bg-gray-400 text-white rounded-lg text-sm transition-colors"
                >
                  Save
                </button>
              </div>
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                Leave empty to use default wake phrase
              </p>
            </div>
          )}

          {/* Nudge Settings */}
          <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-900/30 rounded-lg">
            <h4 className="text-sm font-semibold text-amber-800 dark:text-amber-200 mb-3">
              Conversation Settings
            </h4>
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm text-amber-700 dark:text-amber-300">
                  Gentle nudges during silence
                </span>
                <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                  Maya will softly remind you she's here after 45 seconds of silence (max once per 5 minutes)
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={nudgesEnabled}
                  onChange={(e) => handleNudgeToggle(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-amber-300 dark:peer-focus:ring-amber-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-amber-600"></div>
              </label>
            </div>
          </div>

          {/* Configuration Tips */}
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
            <h4 className="text-sm font-semibold text-blue-800 dark:text-blue-200 mb-2">
              Configuration Tips
            </h4>
            <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
              <li>• <strong>Push-to-Talk</strong> gives you full control over when to speak</li>
              <li>• <strong>Wake Word</strong> allows hands-free activation but uses more battery</li>
              <li>• <strong>Conversational</strong> mode is best for natural dialogue</li>
              <li>• <strong>Meditative</strong> mode uses longer pauses and softer tones</li>
              <li>• <strong>Guided</strong> mode provides structured prompts and rituals</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default VoiceConfigurationPanel;