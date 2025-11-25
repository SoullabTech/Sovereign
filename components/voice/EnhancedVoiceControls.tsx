"use client";

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Mic, MicOff, Settings, Volume2, Activity } from 'lucide-react';
import { Analytics } from '@/lib/analytics/supabaseAnalytics';

interface VoiceSettings {
  provider: 'elevenlabs' | 'openai' | 'browser';
  voice: string;
  speed: number;
  pitch: number;
  stability: number;
  similarity: number;
  autoListen: boolean;
  silenceThreshold: number;
  silenceDuration: number;
}

const DEFAULT_SETTINGS: VoiceSettings = {
  provider: 'elevenlabs',
  voice: 'nova', // More expressive voice
  speed: 1.1, // Slightly faster for engagement
  pitch: 1.0,
  stability: 0.65, // More variation for expressiveness
  similarity: 0.75,
  autoListen: false,
  silenceThreshold: -40, // dB threshold for voice detection
  silenceDuration: 1500 // ms of silence before auto-stop
};

// ElevenLabs voices with descriptions
const ELEVENLABS_VOICES = [
  { id: 'rachel', name: 'Rachel', description: 'Warm and conversational' },
  { id: 'nova', name: 'Nova', description: 'Young and energetic' },
  { id: 'bella', name: 'Bella', description: 'Soft and calming' },
  { id: 'antoni', name: 'Antoni', description: 'Professional and clear' },
  { id: 'elli', name: 'Elli', description: 'Friendly and expressive' },
  { id: 'josh', name: 'Josh', description: 'Deep and authoritative' },
  { id: 'domi', name: 'Domi', description: 'Mystical and ethereal' }
];

// OpenAI voices
const OPENAI_VOICES = [
  { id: 'nova', name: 'Nova', description: 'Friendly and conversational' },
  { id: 'alloy', name: 'Alloy', description: 'Neutral and balanced' },
  { id: 'shimmer', name: 'Shimmer', description: 'Warm and inviting' },
  { id: 'echo', name: 'Echo', description: 'Smooth and confident' },
  { id: 'fable', name: 'Fable', description: 'Expressive storyteller' },
  { id: 'onyx', name: 'Onyx', description: 'Deep and resonant' }
];

interface EnhancedVoiceControlsProps {
  onTranscript: (text: string) => void;
  onSettingsChange?: (settings: VoiceSettings) => void;
  isProcessing?: boolean;
}

export const EnhancedVoiceControls: React.FC<EnhancedVoiceControlsProps> = ({
  onTranscript,
  onSettingsChange,
  isProcessing = false
}) => {
  const [settings, setSettings] = useState<VoiceSettings>(DEFAULT_SETTINGS);
  const [isListening, setIsListening] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [isVoiceDetected, setIsVoiceDetected] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  // Initialize audio context for voice activity detection
  const initializeAudioContext = async (stream: MediaStream) => {
    audioContextRef.current = new AudioContext();
    analyserRef.current = audioContextRef.current.createAnalyser();
    
    const source = audioContextRef.current.createMediaStreamSource(stream);
    source.connect(analyserRef.current);
    
    analyserRef.current.fftSize = 256;
    
    // Start monitoring audio levels
    monitorAudioLevel();
  };

  // Monitor audio levels for voice activity detection
  const monitorAudioLevel = () => {
    if (!analyserRef.current) return;
    
    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    
    const checkLevel = () => {
      if (!isListening) return;
      
      analyserRef.current!.getByteFrequencyData(dataArray);
      
      // Calculate average volume
      let sum = 0;
      for (let i = 0; i < dataArray.length; i++) {
        sum += dataArray[i];
      }
      const average = sum / dataArray.length;
      
      // Convert to dB
      const db = 20 * Math.log10(average / 255);
      
      setAudioLevel(average);
      
      // Detect voice activity
      if (db > settings.silenceThreshold) {
        setIsVoiceDetected(true);
        
        // Clear silence timer
        if (silenceTimerRef.current) {
          clearTimeout(silenceTimerRef.current);
          silenceTimerRef.current = null;
        }
      } else {
        setIsVoiceDetected(false);
        
        // Start silence timer if voice was detected before
        if (settings.autoListen && !silenceTimerRef.current && mediaRecorderRef.current?.state === 'recording') {
          silenceTimerRef.current = setTimeout(() => {
            stopRecording();
          }, settings.silenceDuration);
        }
      }
      
      requestAnimationFrame(checkLevel);
    };
    
    checkLevel();
  };

  // Start recording with voice activation
  const startRecording = useCallback(async () => {
    try {
      // Track recording start
      Analytics.startRecording({ autoListen: settings.autoListen });

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 16000
        }
      });
      
      streamRef.current = stream;
      
      // Initialize voice activity detection
      await initializeAudioContext(stream);
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        
        // Send to transcription
        try {
          const formData = new FormData();
          formData.append('file', audioBlob, 'recording.webm');
          
          const response = await fetch('/api/voice/transcribe-simple', {
            method: 'POST',
            body: formData
          });
          
          if (response.ok) {
            const data = await response.json();
            if (data.transcription) {
              onTranscript(data.transcription);
              
              // If auto-listen is enabled, restart listening after processing
              if (settings.autoListen && !isProcessing) {
                setTimeout(() => startRecording(), 500);
              }
            }
          }
        } catch (error) {
          console.error('Transcription error:', error);
        }
        
        // Clean up
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorder.start(100);
      setIsListening(true);
      
      
    } catch (error) {
      console.error('Microphone access error:', error);
      alert('Unable to access microphone. Please check permissions.');
    }
  }, [settings, onTranscript, isProcessing]);

  // Stop recording
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      setIsListening(false);
      setIsVoiceDetected(false);
      setAudioLevel(0);
      
      // Clean up audio context
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
      
      // Clear timers
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = null;
      }
      
    }
  }, []);

  // Toggle recording
  const toggleRecording = () => {
    if (isListening) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  // Update settings
  const updateSettings = (newSettings: Partial<VoiceSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    onSettingsChange?.(updated);
    
    // Save to localStorage
    localStorage.setItem('maya-voice-settings', JSON.stringify(updated));
  };

  // Load settings from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('maya-voice-settings');
    if (saved) {
      const parsed = JSON.parse(saved);
      setSettings(parsed);
      onSettingsChange?.(parsed);
    }
  }, []);

  // Auto-start listening if enabled
  useEffect(() => {
    if (settings.autoListen && !isListening && !isProcessing) {
      startRecording();
    }
  }, [settings.autoListen, isProcessing]);

  return (
    <div className="relative">
      {/* Main Controls */}
      <div className="flex items-center gap-2">
        {/* Recording Button */}
        <button
          onClick={toggleRecording}
          disabled={isProcessing}
          className={`
            relative p-4 rounded-full transition-all duration-200
            ${isListening 
              ? 'bg-red-500/20 hover:bg-red-500/30' 
              : 'bg-white/10 hover:bg-white/20'
            }
            ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          {isListening ? (
            <Mic className="w-6 h-6 text-red-400" />
          ) : (
            <MicOff className="w-6 h-6 text-gray-400" />
          )}
          
          {/* Voice Activity Indicator */}
          {isListening && (
            <div className="absolute inset-0 rounded-full overflow-hidden pointer-events-none">
              <div 
                className={`
                  absolute inset-0 rounded-full
                  ${isVoiceDetected ? 'bg-green-500' : 'bg-gray-500'}
                  transition-all duration-100
                `}
                style={{
                  transform: `scale(${0.3 + (audioLevel / 255) * 0.7})`,
                  opacity: 0.3 + (audioLevel / 255) * 0.7
                }}
              />
            </div>
          )}
          
          {/* Auto-Listen Badge */}
          {settings.autoListen && (
            <span className="absolute -top-1 -right-1 px-1.5 py-0.5 text-xs bg-green-500 text-white rounded-full">
              AUTO
            </span>
          )}
        </button>
        
        {/* Settings Button */}
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="p-3 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
        >
          <Settings className="w-5 h-5 text-gray-400" />
        </button>
        
        {/* Audio Level Meter */}
        {isListening && (
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-gray-400" />
            <div className="w-32 h-2 bg-gray-700 rounded-full overflow-hidden">
              <div 
                className={`
                  h-full transition-all duration-100
                  ${isVoiceDetected ? 'bg-green-500' : 'bg-gray-500'}
                `}
                style={{ width: `${(audioLevel / 255) * 100}%` }}
              />
            </div>
          </div>
        )}
      </div>
      
      {/* Settings Panel */}
      {showSettings && (
        <div className="absolute top-full mt-2 right-0 w-96 bg-gray-800 rounded-lg shadow-xl p-4 z-50">
          <h3 className="text-lg font-semibold mb-4 text-white">Voice Settings</h3>
          
          {/* Auto-Listen Toggle */}
          <div className="mb-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={settings.autoListen}
                onChange={(e) => updateSettings({ autoListen: e.target.checked })}
                className="w-4 h-4"
              />
              <span className="text-white">Auto-listen (Voice Activation)</span>
            </label>
            <p className="text-xs text-gray-400 mt-1">
              Automatically start listening and detect when you stop speaking
            </p>
          </div>
          
          {/* Voice Provider */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Voice Provider
            </label>
            <select
              value={settings.provider}
              onChange={(e) => updateSettings({ provider: e.target.value as any })}
              className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg"
            >
              <option value="elevenlabs">ElevenLabs (Most Expressive)</option>
              <option value="openai">OpenAI (Fast & Clear)</option>
              <option value="browser">Browser (Offline)</option>
            </select>
          </div>
          
          {/* Voice Selection */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Voice
            </label>
            <select
              value={settings.voice}
              onChange={(e) => updateSettings({ voice: e.target.value })}
              className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg"
            >
              {(settings.provider === 'elevenlabs' ? ELEVENLABS_VOICES : OPENAI_VOICES).map(voice => (
                <option key={voice.id} value={voice.id}>
                  {voice.name} - {voice.description}
                </option>
              ))}
            </select>
          </div>
          
          {/* Voice Settings */}
          <div className="space-y-3">
            <div>
              <label className="flex items-center justify-between text-sm text-gray-300 mb-1">
                <span>Speed</span>
                <span>{settings.speed}x</span>
              </label>
              <input
                type="range"
                min="0.5"
                max="2"
                step="0.1"
                value={settings.speed}
                onChange={(e) => updateSettings({ speed: parseFloat(e.target.value) })}
                className="w-full"
              />
            </div>
            
            {settings.provider === 'elevenlabs' && (
              <>
                <div>
                  <label className="flex items-center justify-between text-sm text-gray-300 mb-1">
                    <span>Stability (Consistency)</span>
                    <span>{Math.round(settings.stability * 100)}%</span>
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={settings.stability}
                    onChange={(e) => updateSettings({ stability: parseFloat(e.target.value) })}
                    className="w-full"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Lower = more expressive, Higher = more consistent
                  </p>
                </div>
                
                <div>
                  <label className="flex items-center justify-between text-sm text-gray-300 mb-1">
                    <span>Similarity (Voice Match)</span>
                    <span>{Math.round(settings.similarity * 100)}%</span>
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={settings.similarity}
                    onChange={(e) => updateSettings({ similarity: parseFloat(e.target.value) })}
                    className="w-full"
                  />
                </div>
              </>
            )}
            
            {settings.autoListen && (
              <div>
                <label className="flex items-center justify-between text-sm text-gray-300 mb-1">
                  <span>Silence Duration (ms)</span>
                  <span>{settings.silenceDuration}ms</span>
                </label>
                <input
                  type="range"
                  min="500"
                  max="3000"
                  step="100"
                  value={settings.silenceDuration}
                  onChange={(e) => updateSettings({ silenceDuration: parseInt(e.target.value) })}
                  className="w-full"
                />
                <p className="text-xs text-gray-400 mt-1">
                  How long to wait after silence before stopping
                </p>
              </div>
            )}
          </div>
          
          {/* Test Voice Button */}
          <button
            onClick={() => {
              const audio = new Audio();
              const utterance = new SpeechSynthesisUtterance("Hello! This is how I'll sound with these settings.");
              utterance.rate = settings.speed;
              utterance.pitch = settings.pitch;
              window.speechSynthesis.speak(utterance);
            }}
            className="mt-4 w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <Volume2 className="w-4 h-4" />
            Test Voice
          </button>
        </div>
      )}
    </div>
  );
};