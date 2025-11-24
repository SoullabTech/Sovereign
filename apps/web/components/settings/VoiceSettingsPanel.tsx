'use client';

import React from 'react';
import { Settings, Volume2, Timer } from 'lucide-react';
import { useVoiceSettings } from '@/lib/contexts/VoiceSettingsContext';

interface VoiceSettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function VoiceSettingsPanel({ isOpen, onClose }: VoiceSettingsPanelProps) {
  const { settings, updateSettings, toggleAdaptiveMode } = useVoiceSettings();
  
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
        onClick={onClose}
      />
      
      {/* Panel */}
      <div className="fixed inset-x-4 top-20 max-w-md mx-auto bg-[#1A1F2E] border border-gray-700 rounded-lg shadow-xl z-50">
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Settings className="w-5 h-5 text-tesla-blue" />
              <h2 className="text-lg font-medium text-white">Voice Settings</h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="p-4 space-y-6">
          {/* Adaptive Voice Timeout Toggle */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Timer className="w-4 h-4 text-tesla-blue" />
              <span className="text-white font-medium">Voice Timeout Mode</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-[#0A0D16] rounded-lg border border-gray-700">
              <div className="flex-1">
                <div className="text-white text-sm font-medium">
                  Adaptive Voice Timeout
                </div>
                <div className="text-gray-400 text-xs mt-1">
                  {settings.adaptiveMode 
                    ? 'Smart timeout based on speech length (2.5-6s)'
                    : `Fixed ${settings.silenceTimeout/1000}s timeout`
                  }
                </div>
              </div>
              
              {/* Tesla-style toggle switch */}
              <button
                onClick={toggleAdaptiveMode}
                className={`
                  relative w-12 h-6 rounded-full transition-all duration-300
                  ${settings.adaptiveMode 
                    ? 'bg-tesla-blue shadow-lg shadow-tesla-blue/30' 
                    : 'bg-gray-600'
                  }
                `}
              >
                <div 
                  className={`
                    absolute top-0.5 w-5 h-5 bg-white rounded-full transition-all duration-300 shadow-md
                    ${settings.adaptiveMode ? 'translate-x-6' : 'translate-x-0.5'}
                  `}
                />
              </button>
            </div>
          </div>

          {/* Mode Description */}
          <div className="p-3 bg-tesla-blue/10 border border-tesla-blue/20 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Volume2 className="w-4 h-4 text-tesla-blue" />
              <span className="text-tesla-blue text-sm font-medium">
                {settings.adaptiveMode ? 'Adaptive Mode' : 'Strict Mode'}
              </span>
            </div>
            <div className="text-gray-300 text-xs leading-relaxed">
              {settings.adaptiveMode ? (
                <>
                  <strong>Smart timing</strong> that adjusts based on your speech:
                  <br />• Short phrases (1-3 words): 2.5s timeout
                  <br />• Medium thoughts (4-11 words): 4s timeout  
                  <br />• Long expressions (12+ words): 6s timeout
                </>
              ) : (
                <>
                  <strong>Fixed timing</strong> for consistent behavior:
                  <br />• Always waits {settings.silenceTimeout/1000}s after you stop speaking
                  <br />• Predictable, but may feel slow for short responses
                </>
              )}
            </div>
          </div>

          {/* Additional Settings (for future expansion) */}
          {!settings.adaptiveMode && (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Timer className="w-4 h-4 text-gray-400" />
                <span className="text-gray-300 font-medium">Timeout Duration</span>
              </div>
              
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-400 min-w-8">2s</span>
                <input
                  type="range"
                  min={2000}
                  max={8000}
                  step={500}
                  value={settings.silenceTimeout}
                  onChange={(e) => updateSettings({ silenceTimeout: parseInt(e.target.value) })}
                  className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                />
                <span className="text-sm text-gray-400 min-w-8">8s</span>
              </div>
              
              <div className="text-center">
                <span className="text-tesla-blue text-sm font-mono">
                  {(settings.silenceTimeout/1000).toFixed(1)}s
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-gray-700 bg-[#0A0D16]/50">
          <div className="text-xs text-gray-400 text-center">
            Settings are saved automatically • Changes apply to new recordings
          </div>
        </div>
      </div>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: #3B82F6;
          cursor: pointer;
          box-shadow: 0 0 8px rgba(59, 130, 246, 0.5);
          transition: all 0.2s ease;
        }

        .slider::-webkit-slider-thumb:hover {
          background: #2563EB;
          transform: scale(1.1);
          box-shadow: 0 0 12px rgba(59, 130, 246, 0.7);
        }

        .slider::-moz-range-thumb {
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: #3B82F6;
          cursor: pointer;
          border: none;
          box-shadow: 0 0 8px rgba(59, 130, 246, 0.5);
          transition: all 0.2s ease;
        }

        .slider::-moz-range-thumb:hover {
          background: #2563EB;
          transform: scale(1.1);
          box-shadow: 0 0 12px rgba(59, 130, 246, 0.7);
        }

        .slider::-webkit-slider-track {
          height: 8px;
          border-radius: 4px;
          background: #374151;
        }

        .slider::-moz-range-track {
          height: 8px;
          border-radius: 4px;
          background: #374151;
          border: none;
        }
      `}</style>
    </>
  );
}