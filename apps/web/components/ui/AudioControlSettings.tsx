/**
 * Audio Control Settings
 * Allows users to control voice output in text chat
 */

import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface AudioControlSettingsProps {
  onAudioToggle: (enabled: boolean) => void;
  defaultEnabled?: boolean;
  position?: 'top-right' | 'bottom-right' | 'inline';
}

export const AudioControlSettings: React.FC<AudioControlSettingsProps> = ({
  onAudioToggle,
  defaultEnabled = false,
  position = 'bottom-right'
}) => {
  const [audioEnabled, setAudioEnabled] = useState(defaultEnabled);
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    // Load user preference from localStorage
    const savedPreference = localStorage.getItem('maya-audio-preference');
    if (savedPreference !== null) {
      const enabled = savedPreference === 'true';
      setAudioEnabled(enabled);
      onAudioToggle(enabled);
    }
  }, []);

  const toggleAudio = () => {
    const newState = !audioEnabled;
    setAudioEnabled(newState);
    onAudioToggle(newState);

    // Save preference
    localStorage.setItem('maya-audio-preference', newState.toString());

    // Show tooltip feedback
    setShowTooltip(true);
    setTimeout(() => setShowTooltip(false), 2000);
  };

  const positionClasses = {
    'top-right': 'fixed top-4 right-4',
    'bottom-right': 'fixed bottom-20 right-4',
    'inline': 'relative'
  };

  return (
    <div className={`${positionClasses[position]} z-50`}>
      <motion.button
        onClick={toggleAudio}
        className={`
          p-3 rounded-full backdrop-blur-lg transition-all duration-300
          ${audioEnabled
            ? 'bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/30'
            : 'bg-gray-800/50 hover:bg-gray-700/50 border border-gray-600/30'
          }
        `}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label={audioEnabled ? 'Mute Maya voice' : 'Enable Maya voice'}
      >
        {audioEnabled ? (
          <Volume2 className="w-5 h-5 text-amber-400" />
        ) : (
          <VolumeX className="w-5 h-5 text-amber-400" />
        )}
      </motion.button>

      <AnimatePresence>
        {showTooltip && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute bottom-full right-0 mb-2 px-3 py-1.5 bg-gray-800 text-white text-sm rounded-lg whitespace-nowrap"
          >
            {audioEnabled ? 'Voice enabled' : 'Voice muted'}
            <div className="absolute bottom-0 right-4 transform translate-y-1/2 rotate-45 w-2 h-2 bg-gray-800" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/**
 * Inline Audio Toggle for chat interface
 */
export const InlineAudioToggle: React.FC<{
  enabled: boolean;
  onChange: (enabled: boolean) => void;
}> = ({ enabled, onChange }) => {
  return (
    <button
      onClick={() => onChange(!enabled)}
      className={`
        inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm transition-all
        ${enabled
          ? 'bg-amber-500/20 text-amber-300 hover:bg-amber-500/30'
          : 'bg-gray-700/30 text-gray-400 hover:bg-gray-700/50'
        }
      `}
    >
      {enabled ? (
        <>
          <Volume2 className="w-4 h-4" />
          <span>Voice On</span>
        </>
      ) : (
        <>
          <VolumeX className="w-4 h-4" />
          <span>Voice Off</span>
        </>
      )}
    </button>
  );
};

/**
 * Audio Settings Panel for more control
 */
export const AudioSettingsPanel: React.FC<{
  show: boolean;
  onClose: () => void;
  settings: {
    voiceEnabled: boolean;
    volume: number;
    voice: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer';
    speed: number;
  };
  onSettingsChange: (settings: any) => void;
}> = ({ show, onClose, settings, onSettingsChange }) => {
  if (!show) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-gray-900 rounded-2xl p-6 w-full max-w-md border border-gray-700"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-white">Voice Settings</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <Settings className="w-5 h-5 text-amber-400" />
          </button>
        </div>

        {/* Voice Toggle */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-gray-300">Voice Responses</span>
            <button
              onClick={() => onSettingsChange({ ...settings, voiceEnabled: !settings.voiceEnabled })}
              className={`
                relative w-12 h-6 rounded-full transition-colors
                ${settings.voiceEnabled ? 'bg-amber-500' : 'bg-gray-600'}
              `}
            >
              <div className={`
                absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform
                ${settings.voiceEnabled ? 'translate-x-6' : 'translate-x-0.5'}
              `} />
            </button>
          </div>

          {/* Volume Slider */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Volume</span>
              <span className="text-gray-300">{Math.round(settings.volume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={settings.volume * 100}
              onChange={(e) => onSettingsChange({ ...settings, volume: parseInt(e.target.value) / 100 })}
              className="w-full accent-amber-500"
              disabled={!settings.voiceEnabled}
            />
          </div>

          {/* Voice Selection */}
          <div className="space-y-2">
            <span className="text-sm text-gray-400">Voice Style</span>
            <select
              value={settings.voice}
              onChange={(e) => onSettingsChange({ ...settings, voice: e.target.value as any })}
              className="w-full px-3 py-2 bg-gray-800 text-gray-300 rounded-lg border border-gray-700 focus:border-amber-500 focus:outline-none"
              disabled={!settings.voiceEnabled}
            >
              <option value="alloy">Alloy (Neutral)</option>
              <option value="echo">Echo (Smooth)</option>
              <option value="fable">Fable (Expressive)</option>
              <option value="onyx">Onyx (Deep)</option>
              <option value="nova">Nova (Energetic)</option>
              <option value="shimmer">Shimmer (Warm)</option>
            </select>
          </div>

          {/* Speed Control */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Speaking Speed</span>
              <span className="text-gray-300">{settings.speed}x</span>
            </div>
            <input
              type="range"
              min="50"
              max="150"
              value={settings.speed * 100}
              onChange={(e) => onSettingsChange({ ...settings, speed: parseInt(e.target.value) / 100 })}
              className="w-full accent-amber-500"
              disabled={!settings.voiceEnabled}
            />
          </div>
        </div>

        {/* Privacy Note */}
        <div className="mt-6 p-3 bg-gray-800/50 rounded-lg">
          <p className="text-xs text-gray-400">
            Voice settings are saved locally on your device.
            Maya will only speak when voice is enabled and you're in text chat mode.
          </p>
        </div>
      </div>
    </motion.div>
  );
};