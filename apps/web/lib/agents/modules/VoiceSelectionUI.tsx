/**
 * Voice Selection UI Component
 * Allows users to choose their PersonalOracleAgent voice
 */

import React, { useState } from 'react';
import { voiceConfig, type VoiceProfile, type VoiceMenuItem } from '@/lib/config/voiceProfiles';
import { Play, Lock, Check, Sparkles, Mic, MicIcon } from 'lucide-react';

export type VoiceMode = 'push-to-talk' | 'wake-word';
export type InteractionMode = 'conversational' | 'meditative' | 'guided';

interface VoiceSelectionUIProps {
  currentVoiceId: string;
  userLevel: number;
  onVoiceSelect: (voiceId: string) => void;
  onPreviewVoice?: (voiceId: string) => void;
  onModeChange?: (mode: VoiceMode) => void;
  onInteractionModeChange?: (mode: InteractionMode) => void;
  initialVoiceMode?: VoiceMode;
  initialInteractionMode?: InteractionMode;
}

export const VoiceSelectionUI: React.FC<VoiceSelectionUIProps> = ({
  currentVoiceId,
  userLevel,
  onVoiceSelect,
  onPreviewVoice,
  onModeChange,
  onInteractionModeChange,
  initialVoiceMode = 'push-to-talk',
  initialInteractionMode = 'conversational'
}) => {
  const [selectedCategory, setSelectedCategory] = useState<'canonical' | 'alternative' | 'experimental'>('canonical');
  const [previewingVoice, setPreviewingVoice] = useState<string | null>(null);
  const [voiceMode, setVoiceMode] = useState<VoiceMode>(initialVoiceMode);
  const [interactionMode, setInteractionMode] = useState<InteractionMode>(initialInteractionMode);

  const menu = voiceConfig.buildMenu(currentVoiceId, userLevel);

  const handlePreview = async (voiceId: string) => {
    setPreviewingVoice(voiceId);
    await onPreviewVoice?.(voiceId);
    setPreviewingVoice(null);
  };

  const handleVoiceModeToggle = (newMode: VoiceMode) => {
    setVoiceMode(newMode);
    onModeChange?.(newMode);
  };

  const handleInteractionModeChange = (newMode: InteractionMode) => {
    setInteractionMode(newMode);
    onInteractionModeChange?.(newMode);
  };

  const VoiceCard: React.FC<{ item: VoiceMenuItem }> = ({ item }) => {
    const { profile, isAvailable, isSelected, unlockHint } = item;

    return (
      <div
        className={`
          relative rounded-lg border-2 p-4 transition-all cursor-pointer
          ${isSelected ? 'border-amber-500 bg-amber-50 dark:bg-purple-950' : 'border-gray-200 dark:border-gray-700'}
          ${!isAvailable ? 'opacity-50 cursor-not-allowed' : 'hover:border-amber-300'}
        `}
        onClick={() => isAvailable && onVoiceSelect(profile.id)}
      >
        {/* Selected Indicator */}
        {isSelected && (
          <div className="absolute -top-2 -right-2">
            <div className="bg-amber-500 rounded-full p-1">
              <Check className="w-4 h-4 text-white" />
            </div>
          </div>
        )}

        {/* Lock Icon for Unavailable */}
        {!isAvailable && (
          <div className="absolute top-2 right-2">
            <Lock className="w-4 h-4 text-gray-400" />
          </div>
        )}

        {/* Voice Info */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-lg">{profile.displayName}</h3>
            <span className="text-xs text-gray-500 uppercase">
              {profile.provider}
            </span>
          </div>

          <p className="text-sm text-gray-600 dark:text-gray-400">
            {profile.description}
          </p>

          {/* Personality Indicators */}
          <div className="flex gap-1 mt-2">
            {profile.masks.map(mask => (
              <span
                key={mask}
                className={`
                  text-xs px-2 py-1 rounded-full
                  ${mask === 'fire' ? 'bg-red-100 text-red-700' : ''}
                  ${mask === 'water' ? 'bg-blue-100 text-blue-700' : ''}
                  ${mask === 'earth' ? 'bg-green-100 text-green-700' : ''}
                  ${mask === 'air' ? 'bg-gray-100 text-gray-700' : ''}
                  ${mask === 'aether' ? 'bg-amber-100 text-amber-700' : ''}
                `}
              >
                {mask}
              </span>
            ))}
          </div>

          {/* Unlock Hint */}
          {unlockHint && (
            <p className="text-xs text-amber-600 dark:text-amber-400 mt-2">
              <Sparkles className="w-3 h-3 inline mr-1" />
              {unlockHint}
            </p>
          )}

          {/* Preview Button */}
          {isAvailable && onPreviewVoice && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handlePreview(profile.id);
              }}
              disabled={previewingVoice === profile.id}
              className="mt-3 flex items-center gap-2 text-sm text-amber-600 hover:text-amber-700"
            >
              <Play className="w-4 h-4" />
              {previewingVoice === profile.id ? 'Playing...' : 'Preview'}
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Category Tabs */}
      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setSelectedCategory('canonical')}
          className={`
            px-4 py-2 -mb-px border-b-2 transition-colors
            ${selectedCategory === 'canonical'
              ? 'border-amber-500 text-amber-600'
              : 'border-transparent text-gray-600 hover:text-gray-800'}
          `}
        >
          Sacred Voices
        </button>
        <button
          onClick={() => setSelectedCategory('alternative')}
          className={`
            px-4 py-2 -mb-px border-b-2 transition-colors
            ${selectedCategory === 'alternative'
              ? 'border-amber-500 text-amber-600'
              : 'border-transparent text-gray-600 hover:text-gray-800'}
          `}
        >
          Alternative
        </button>
        <button
          onClick={() => setSelectedCategory('experimental')}
          className={`
            px-4 py-2 -mb-px border-b-2 transition-colors
            ${selectedCategory === 'experimental'
              ? 'border-amber-500 text-amber-600'
              : 'border-transparent text-gray-600 hover:text-gray-800'}
          `}
        >
          Experimental
        </button>
      </div>

      {/* Voice Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {menu[selectedCategory].map(item => (
          <VoiceCard key={item.profile.id} item={item} />
        ))}
      </div>

      {/* Voice Mode Toggle */}
      <div className="mt-6">
        <h3 className="text-md font-semibold mb-3 text-gray-800 dark:text-gray-200">Voice Activation</h3>
        <div className="flex gap-3">
          <button
            onClick={() => handleVoiceModeToggle('push-to-talk')}
            className={`flex-1 py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-all ${
              voiceMode === 'push-to-talk'
                ? 'bg-amber-600 text-white shadow-lg'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            <Mic className="w-4 h-4" />
            <span className="text-sm font-medium">Push-to-Talk</span>
          </button>
          <button
            onClick={() => handleVoiceModeToggle('wake-word')}
            className={`flex-1 py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-all ${
              voiceMode === 'wake-word'
                ? 'bg-amber-600 text-white shadow-lg'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            <MicIcon className="w-4 h-4" />
            <span className="text-sm font-medium">Wake Word</span>
          </button>
        </div>
        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
          {voiceMode === 'push-to-talk'
            ? 'Hold to speak, release to send'
            : 'Say "Hello Maya" to activate'
          }
        </p>
      </div>

      {/* Interaction Mode Selection */}
      <div className="mt-6">
        <h3 className="text-md font-semibold mb-3 text-gray-800 dark:text-gray-200">Interaction Style</h3>
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => handleInteractionModeChange('conversational')}
            className={`py-3 px-3 rounded-lg text-center transition-all ${
              interactionMode === 'conversational'
                ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 border-2 border-green-500'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-2 border-transparent hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            <div className="text-lg mb-1">🗣️</div>
            <div className="text-xs font-medium">Conversational</div>
            <div className="text-xs text-gray-500 mt-1">Natural dialogue</div>
          </button>
          <button
            onClick={() => handleInteractionModeChange('meditative')}
            className={`py-3 px-3 rounded-lg text-center transition-all ${
              interactionMode === 'meditative'
                ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 border-2 border-blue-500'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-2 border-transparent hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            <div className="text-lg mb-1">🧘</div>
            <div className="text-xs font-medium">Meditative</div>
            <div className="text-xs text-gray-500 mt-1">Gentle presence</div>
          </button>
          <button
            onClick={() => handleInteractionModeChange('guided')}
            className={`py-3 px-3 rounded-lg text-center transition-all ${
              interactionMode === 'guided'
                ? 'bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200 border-2 border-amber-500'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-2 border-transparent hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            <div className="text-lg mb-1">🌟</div>
            <div className="text-xs font-medium">Guided</div>
            <div className="text-xs text-gray-500 mt-1">Structured flow</div>
          </button>
        </div>
        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
          {interactionMode === 'conversational' && 'Back-and-forth natural conversation'}
          {interactionMode === 'meditative' && 'Quiet presence with longer pauses'}
          {interactionMode === 'guided' && 'Ritualized prompts and gentle leading'}
        </p>
      </div>

      {/* Trust Level Indicator */}
      <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Your Trust Level
          </span>
          <span className="text-lg font-semibold text-amber-600">
            Level {userLevel}
          </span>
        </div>
        <div className="mt-2 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            className="bg-amber-500 h-2 rounded-full transition-all"
            style={{ width: `${Math.min(userLevel * 20, 100)}%` }}
          />
        </div>
        <p className="mt-2 text-xs text-gray-500">
          Higher trust levels unlock special voices and masks
        </p>
      </div>

      {/* Current Selection Summary */}
      <div className="mt-4 p-3 bg-amber-50 dark:bg-purple-950 border border-amber-200 dark:border-amber-800 rounded-lg">
        <h4 className="text-sm font-semibold text-amber-800 dark:text-amber-200 mb-2">Current Selection</h4>
        <div className="text-xs text-amber-700 dark:text-amber-300 space-y-1">
          <div>Voice: {voiceConfig.getProfile(currentVoiceId)?.displayName || 'Unknown'}</div>
          <div>Activation: {voiceMode === 'push-to-talk' ? 'Push-to-Talk' : 'Wake Word'}</div>
          <div>Style: {interactionMode.charAt(0).toUpperCase() + interactionMode.slice(1)}</div>
        </div>
      </div>
    </div>
  );
};

export default VoiceSelectionUI;
export type { VoiceMode, InteractionMode };