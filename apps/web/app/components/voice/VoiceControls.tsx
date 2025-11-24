// app/components/voice/VoiceControls.tsx
'use client';

import React, { useState } from 'react';
import { useMayaVoice } from '@/hooks/useMayaVoice';
import { getMayaVoice } from '@/lib/voice/maya-voice';

interface VoiceControlsProps {
  compact?: boolean;
  showAdvanced?: boolean;
  className?: string;
}

export function VoiceControls({ 
  compact = false, 
  showAdvanced = false,
  className = '' 
}: VoiceControlsProps) {
  const {
    voiceState,
    isReady,
    speak,
    playGreeting,
    pause,
    resume,
    stop,
    setVoice,
    setRate,
    setPitch,
    setVolume,
    autoSpeak,
    setAutoSpeak,
    lastError,
    clearError,
  } = useMayaVoice();

  const [showSettings, setShowSettings] = useState(false);
  const [testText, setTestText] = useState("Hello, I am Maya, your mystical oracle guide.");

  const handlePlayPause = () => {
    if (voiceState.isPlaying && !voiceState.isPaused) {
      pause();
    } else if (voiceState.isPaused) {
      resume();
    } else {
      playGreeting();
    }
  };

  const handleTestSpeak = () => {
    if (testText.trim()) {
      speak(testText).catch(console.error);
    }
  };

  const getStatusText = () => {
    if (!isReady) return 'Loading voices...';
    if (voiceState.isPlaying && voiceState.isPaused) return 'Paused';
    if (voiceState.isPlaying) return 'Speaking...';
    return 'Ready';
  };

  const getStatusColor = () => {
    if (!isReady) return 'text-yellow-500';
    if (voiceState.isPlaying && voiceState.isPaused) return 'text-orange-500';
    if (voiceState.isPlaying) return 'text-green-500';
    return 'text-gray-500';
  };

  if (compact) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        {/* Status indicator */}
        <div className={`text-sm ${getStatusColor()}`}>
          {getStatusText()}
        </div>

        {/* Play/Pause button */}
        <button
          onClick={handlePlayPause}
          disabled={!isReady}
          className="p-2 rounded-full bg-amber-600 hover:bg-amber-700 disabled:bg-gray-400 text-white transition-colors"
          title={voiceState.isPlaying ? 'Pause Maya' : 'Hear Maya'}
        >
          {voiceState.isPlaying && !voiceState.isPaused ? (
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832L13 10.202a1 1 0 000-1.65l-3.445-2.384z" clipRule="evenodd" />
            </svg>
          )}
        </button>

        {/* Stop button */}
        {voiceState.isPlaying && (
          <button
            onClick={stop}
            className="p-2 rounded-full bg-red-600 hover:bg-red-700 text-white transition-colors"
            title="Stop Maya"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
            </svg>
          </button>
        )}

        {/* Auto-speak toggle */}
        <label className="flex items-center gap-1 text-sm cursor-pointer">
          <input
            type="checkbox"
            checked={autoSpeak}
            onChange={(e) => setAutoSpeak(e.target.checked)}
            className="rounded"
          />
          Auto
        </label>
      </div>
    );
  }

  return (
    <div className={`p-4 bg-white rounded-lg shadow-md ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Maya&apos;s Voice</h3>
        <div className={`text-sm font-medium ${getStatusColor()}`}>
          {getStatusText()}
        </div>
      </div>

      {/* Error display */}
      {lastError && (
        <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded-md">
          <div className="flex items-center justify-between">
            <p className="text-red-800 text-sm">{lastError}</p>
            <button
              onClick={clearError}
              className="text-red-600 hover:text-red-800"
              title="Clear error"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Main controls */}
      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={handlePlayPause}
          disabled={!isReady}
          className="px-4 py-2 bg-amber-600 hover:bg-amber-700 disabled:bg-gray-400 text-white rounded-md transition-colors flex items-center gap-2"
        >
          {voiceState.isPlaying && !voiceState.isPaused ? (
            <>
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              Pause
            </>
          ) : voiceState.isPaused ? (
            <>
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832L13 10.202a1 1 0 000-1.65l-3.445-2.384z" clipRule="evenodd" />
              </svg>
              Resume
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832L13 10.202a1 1 0 000-1.65l-3.445-2.384z" clipRule="evenodd" />
              </svg>
              Hear Maya
            </>
          )}
        </button>

        {voiceState.isPlaying && (
          <button
            onClick={stop}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
            </svg>
            Stop
          </button>
        )}

        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input
            type="checkbox"
            checked={autoSpeak}
            onChange={(e) => setAutoSpeak(e.target.checked)}
            className="rounded"
          />
          Auto-speak Oracle responses
        </label>
      </div>

      {/* Currently speaking text */}
      {voiceState.currentText && (
        <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-md">
          <p className="text-sm text-amber-800">
            <strong>Speaking:</strong> {voiceState.currentText.substring(0, 100)}
            {voiceState.currentText.length > 100 ? '...' : ''}
          </p>
        </div>
      )}

      {/* Advanced settings */}
      {showAdvanced && (
        <>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="mb-3 text-sm text-amber-600 hover:text-amber-800"
          >
            {showSettings ? 'Hide' : 'Show'} Advanced Settings
          </button>

          {showSettings && (
            <div className="space-y-4 p-3 bg-gray-50 rounded-md">
              {/* Voice selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Voice
                </label>
                <select
                  value={voiceState.selectedVoice?.name || ''}
                  onChange={(e) => {
                    const voice = voiceState.supportedVoices.find(v => v.name === e.target.value);
                    setVoice(voice || null);
                  }}
                  className="w-full p-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="">Default</option>
                  {voiceState.supportedVoices
                    .filter(voice => voice.lang.startsWith('en'))
                    .map((voice) => (
                      <option key={voice.name} value={voice.name}>
                        {voice.name} ({voice.lang})
                      </option>
                    ))}
                </select>
              </div>

              {/* Test input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Test Text
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={testText}
                    onChange={(e) => setTestText(e.target.value)}
                    className="flex-1 p-2 border border-gray-300 rounded-md text-sm"
                    placeholder="Enter text to test Maya&apos;s voice..."
                  />
                  <button
                    onClick={handleTestSpeak}
                    disabled={!isReady || !testText.trim()}
                    className="px-3 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-md text-sm transition-colors"
                  >
                    Test
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Voice info */}
      <div className="mt-4 text-xs text-gray-500 border-t pt-3">
        <p>
          Voices available: {voiceState.supportedVoices.length} | 
          English voices: {voiceState.supportedVoices.filter(v => v.lang.startsWith('en')).length} |
          Current: {voiceState.selectedVoice?.name || 'Default'}
        </p>
      </div>
    </div>
  );
}

// Simple button component for onboarding
export function HearMayaButton({ className = '' }: { className?: string }) {
  const { playGreeting, isPlaying, isReady, lastError } = useMayaVoice();
  
  const handleClick = () => {
    if (isPlaying) {
      const maya = getMayaVoice();
      maya.stop();
    } else {
      playGreeting().catch(console.error);
    }
  };

  return (
    <div className={className}>
      <button
        onClick={handleClick}
        disabled={!isReady}
        className="px-6 py-3 bg-amber-600 hover:bg-amber-700 disabled:bg-gray-400 text-white rounded-md transition-colors flex items-center gap-2"
      >
        {isPlaying ? (
          <>
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
            </svg>
            Stop Maya
          </>
        ) : (
          <>
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832L13 10.202a1 1 0 000-1.65l-3.445-2.384z" clipRule="evenodd" />
            </svg>
            Hear Maya
          </>
        )}
      </button>
      
      {lastError && (
        <p className="mt-2 text-sm text-red-600">{lastError}</p>
      )}
      
      {!isReady && (
        <p className="mt-2 text-sm text-gray-500">Loading voices...</p>
      )}
    </div>
  );
}