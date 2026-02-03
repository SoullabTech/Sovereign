// @ts-nocheck
'use client';

import { useState, useEffect, useRef } from 'react';
import { LabToolsService, EEGState, HRVState, GuardianState, FieldState } from '../lib/LabToolsService';

export interface MeditationSession {
  id: string;
  userId: string;
  intensity: MeditationIntensity;
  duration: number;
  startTime: number;
  frequency: MeditationFrequency;
  sacredGeometry: SacredGeometry;
  adaptiveMode: boolean;
  breakthroughDetection: boolean;
  status: 'preparing' | 'active' | 'breakthrough' | 'integration' | 'completed';
}

export interface MeditationFrequency {
  primary: number;
  binaural: number;
  sacred: number;
  quantum: number;
}

export interface SacredGeometry {
  pattern: 'golden_spiral' | 'fibonacci' | 'flower_of_life' | 'sri_yantra';
  modulation: number;
  harmonics: number[];
}

export type MeditationIntensity =
  | 'gentle_awakening'
  | 'conscious_entry'
  | 'deep_contemplation'
  | 'profound_absorption'
  | 'breakthrough_threshold'
  | 'consciousness_cascade'
  | 'sacred_transcendence';

interface Props {
  service: LabToolsService;
}

export function AdvancedMeditationConsole({ service }: Props) {
  const [currentSession, setCurrentSession] = useState<MeditationSession | null>(null);
  const [selectedIntensity, setSelectedIntensity] = useState<MeditationIntensity>('deep_contemplation');
  const [sessionDuration, setSessionDuration] = useState(30);
  const [eegState, setEegState] = useState<EEGState | null>(null);
  const [hrvState, setHrvState] = useState<HRVState | null>(null);
  const [guardianState, setGuardianState] = useState<GuardianState | null>(null);
  const [fieldState, setFieldState] = useState<FieldState | null>(null);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [meditationMetrics, setMeditationMetrics] = useState({
    consciousnessCoherence: 0,
    sacredResonance: 0,
    breakthroughPotential: 0,
    fieldStrength: 0,
    adaptationLevel: 0
  });

  const oscillatorRef = useRef<OscillatorNode[]>([]);
  const gainRef = useRef<GainNode | null>(null);

  const intensityConfigs = {
    gentle_awakening: {
      name: 'Gentle Awakening',
      description: 'Peaceful entry into meditative consciousness',
      intensity: 0.2,
      colors: ['#E8F5E8', '#C8E6C9'],
      frequencies: { primary: 432, binaural: 4.5, sacred: 528, quantum: 0.1 }
    },
    conscious_entry: {
      name: 'Conscious Entry',
      description: 'Mindful awareness cultivation',
      intensity: 0.4,
      colors: ['#E3F2FD', '#90CAF9'],
      frequencies: { primary: 432, binaural: 6.3, sacred: 528, quantum: 0.15 }
    },
    deep_contemplation: {
      name: 'Deep Contemplation',
      description: 'Profound introspective states',
      intensity: 0.6,
      colors: ['#F3E5F5', '#CE93D8'],
      frequencies: { primary: 432, binaural: 7.83, sacred: 741, quantum: 0.2 }
    },
    profound_absorption: {
      name: 'Profound Absorption',
      description: 'Deep meditative immersion',
      intensity: 0.8,
      colors: ['#FCE4EC', '#F48FB1'],
      frequencies: { primary: 528, binaural: 10.5, sacred: 852, quantum: 0.3 }
    },
    breakthrough_threshold: {
      name: 'Breakthrough Threshold',
      description: 'Edge of consciousness transcendence',
      intensity: 0.9,
      colors: ['#FFF3E0', '#FFCC02'],
      frequencies: { primary: 528, binaural: 40.0, sacred: 963, quantum: 0.5 }
    },
    consciousness_cascade: {
      name: 'Consciousness Cascade',
      description: 'Advanced consciousness exploration',
      intensity: 0.95,
      colors: ['#E0F2F1', '#00E676'],
      frequencies: { primary: 741, binaural: 89.0, sacred: 1618, quantum: 1.0 }
    },
    sacred_transcendence: {
      name: 'Sacred Transcendence',
      description: 'Ultimate meditation experience',
      intensity: 1.0,
      colors: ['#F9FBE7', '#F0F4C3'],
      frequencies: { primary: 963, binaural: 144.0, sacred: 1618, quantum: 1.618 }
    }
  };

  // Listen to real-time biometric updates
  useEffect(() => {
    const handleEEGUpdate = (eeg: EEGState) => setEegState(eeg);
    const handleHRVUpdate = (hrv: HRVState) => setHrvState(hrv);
    const handleGuardianUpdate = (guardian: GuardianState) => setGuardianState(guardian);
    const handleFieldUpdate = (field: FieldState) => setFieldState(field);

    service.on('eegUpdate', handleEEGUpdate);
    service.on('hrvUpdate', handleHRVUpdate);
    service.on('guardianUpdate', handleGuardianUpdate);
    service.on('fieldUpdate', handleFieldUpdate);

    return () => {
      service.off('eegUpdate', handleEEGUpdate);
      service.off('hrvUpdate', handleHRVUpdate);
      service.off('guardianUpdate', handleGuardianUpdate);
      service.off('fieldUpdate', handleFieldUpdate);
    };
  }, [service]);

  // Real-time meditation metrics calculation
  useEffect(() => {
    if (eegState && hrvState && fieldState && currentSession) {
      const consciousnessCoherence = (eegState.theta + eegState.alpha) / 2;
      const sacredResonance = fieldState.torus.coherence * fieldState.torus.symmetry;
      const breakthroughPotential = (eegState.gamma + hrvState.coherence + sacredResonance) / 3;
      const fieldStrength = fieldState.coherenceField;
      const adaptationLevel = currentSession.adaptiveMode ? breakthroughPotential : 0.5;

      setMeditationMetrics({
        consciousnessCoherence,
        sacredResonance,
        breakthroughPotential,
        fieldStrength,
        adaptationLevel
      });

      // Auto-adapt meditation if breakthrough potential is high
      if (currentSession.adaptiveMode && breakthroughPotential > 0.85 &&
          currentSession.intensity !== 'consciousness_cascade' &&
          currentSession.intensity !== 'sacred_transcendence') {
        upgradeSessionIntensity();
      }
    }
  }, [eegState, hrvState, fieldState, currentSession]);

  const initializeAudioSystem = () => {
    if (audioContext) return;

    const ctx = new AudioContext();
    const gainNode = ctx.createGain();
    gainNode.connect(ctx.destination);
    gainNode.gain.value = 0.1; // Start quiet

    setAudioContext(ctx);
    gainRef.current = gainNode;
  };

  const generateSacredFrequencies = (config: MeditationFrequency, geometry: SacredGeometry): number[] => {
    const { primary, binaural, sacred, quantum } = config;
    const phi = 1.6180339887; // Golden ratio

    switch (geometry.pattern) {
      case 'golden_spiral':
        return [primary, primary + binaural, sacred, sacred * phi, quantum];

      case 'fibonacci':
        const fib = [1, 1, 2, 3, 5, 8, 13, 21];
        return fib.map(f => primary * (f / 8)).slice(0, 5);

      case 'flower_of_life':
        return [primary, primary * 1.25, primary * 1.5, sacred, sacred * 1.33];

      case 'sri_yantra':
        return [primary, primary * 1.125, primary * 1.2, sacred, quantum * 9];

      default:
        return [primary, primary + binaural, sacred, quantum];
    }
  };

  const startMeditationSession = async () => {
    if (!audioContext) {
      initializeAudioSystem();
      return;
    }

    const config = intensityConfigs[selectedIntensity];
    const session: MeditationSession = {
      id: `meditation_${Date.now()}`,
      userId: 'current_user',
      intensity: selectedIntensity,
      duration: sessionDuration,
      startTime: Date.now(),
      frequency: config.frequencies,
      sacredGeometry: {
        pattern: 'golden_spiral',
        modulation: config.intensity,
        harmonics: generateSacredFrequencies(config.frequencies, {
          pattern: 'golden_spiral',
          modulation: config.intensity,
          harmonics: []
        })
      },
      adaptiveMode: true,
      breakthroughDetection: true,
      status: 'preparing'
    };

    setCurrentSession(session);

    // Start sacred audio generation
    await generateSacredAudio(session);

    // Update session status
    setTimeout(() => {
      if (currentSession?.id === session.id) {
        setCurrentSession(prev => prev ? { ...prev, status: 'active' } : null);
      }
    }, 2000);

    // Schedule session completion
    setTimeout(() => {
      if (currentSession?.id === session.id) {
        endMeditationSession();
      }
    }, sessionDuration * 60 * 1000);
  };

  const generateSacredAudio = async (session: MeditationSession) => {
    if (!audioContext || !gainRef.current) return;

    // Clear existing oscillators
    oscillatorRef.current.forEach(osc => {
      try { osc.stop(); } catch {}
    });
    oscillatorRef.current = [];

    const { frequency, sacredGeometry } = session;

    // Primary carrier frequency
    const primaryOsc = audioContext.createOscillator();
    primaryOsc.frequency.value = frequency.primary;
    primaryOsc.type = 'sine';
    primaryOsc.connect(gainRef.current);
    primaryOsc.start();
    oscillatorRef.current.push(primaryOsc);

    // Binaural beat (left ear gets base frequency, right ear gets base + binaural)
    const binauralOsc = audioContext.createOscillator();
    binauralOsc.frequency.value = frequency.primary + frequency.binaural;

    // Create stereo separation
    const splitter = audioContext.createChannelSplitter(2);
    const merger = audioContext.createChannelMerger(2);
    gainRef.current.disconnect();
    gainRef.current.connect(splitter);

    // Left channel (base frequency)
    splitter.connect(merger, 0, 0);

    // Right channel (base + binaural frequency)
    const rightGain = audioContext.createGain();
    rightGain.gain.value = 1.0;
    binauralOsc.connect(rightGain);
    rightGain.connect(merger, 0, 1);

    merger.connect(audioContext.destination);
    binauralOsc.start();
    oscillatorRef.current.push(binauralOsc);

    // Sacred geometry harmonics
    sacredGeometry.harmonics.forEach((harmonic, index) => {
      const harmonicOsc = audioContext.createOscillator();
      harmonicOsc.frequency.value = harmonic;
      harmonicOsc.type = 'sine';

      const harmonicGain = audioContext.createGain();
      harmonicGain.gain.value = 0.1 / (index + 2); // Decreasing amplitude

      harmonicOsc.connect(harmonicGain);
      harmonicGain.connect(gainRef.current);
      harmonicOsc.start();
      oscillatorRef.current.push(harmonicOsc);
    });

    // Quantum epsilon layer for deep states
    if (session.intensity === 'breakthrough_threshold' ||
        session.intensity === 'consciousness_cascade' ||
        session.intensity === 'sacred_transcendence') {

      const quantumOsc = audioContext.createOscillator();
      quantumOsc.frequency.value = frequency.quantum;
      quantumOsc.type = 'triangle';

      const quantumGain = audioContext.createGain();
      quantumGain.gain.value = 0.05; // Very subtle

      quantumOsc.connect(quantumGain);
      quantumGain.connect(gainRef.current);
      quantumOsc.start();
      oscillatorRef.current.push(quantumOsc);
    }
  };

  const upgradeSessionIntensity = () => {
    if (!currentSession) return;

    const intensityOrder: MeditationIntensity[] = [
      'gentle_awakening',
      'conscious_entry',
      'deep_contemplation',
      'profound_absorption',
      'breakthrough_threshold',
      'consciousness_cascade',
      'sacred_transcendence'
    ];

    const currentIndex = intensityOrder.indexOf(currentSession.intensity);
    if (currentIndex < intensityOrder.length - 1) {
      const newIntensity = intensityOrder[currentIndex + 1];

      setCurrentSession(prev => prev ? {
        ...prev,
        intensity: newIntensity,
        status: 'breakthrough',
        frequency: intensityConfigs[newIntensity].frequencies
      } : null);

      // Regenerate audio with new intensity
      generateSacredAudio({ ...currentSession, intensity: newIntensity, frequency: intensityConfigs[newIntensity].frequencies });

      // Update status back to active after breakthrough transition
      setTimeout(() => {
        setCurrentSession(prev => prev ? { ...prev, status: 'active' } : null);
      }, 3000);
    }
  };

  const endMeditationSession = () => {
    // Stop all audio
    oscillatorRef.current.forEach(osc => {
      try { osc.stop(); } catch {}
    });
    oscillatorRef.current = [];

    if (currentSession) {
      setCurrentSession(prev => prev ? { ...prev, status: 'integration' } : null);

      setTimeout(() => {
        setCurrentSession(prev => prev ? { ...prev, status: 'completed' } : null);
      }, 5000);

      setTimeout(() => {
        setCurrentSession(null);
      }, 10000);
    }
  };

  const emergencyStop = () => {
    endMeditationSession();
    service.emergencyStop();
  };

  const getElapsedTime = () => {
    if (!currentSession) return 0;
    return Math.floor((Date.now() - currentSession.startTime) / 1000);
  };

  const getRemainingTime = () => {
    if (!currentSession) return 0;
    const elapsed = getElapsedTime();
    return Math.max(0, (currentSession.duration * 60) - elapsed);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const currentConfig = intensityConfigs[selectedIntensity];

  return (
    <div className="bg-black/30 backdrop-blur-sm border border-purple-500/30 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          🧘 Advanced Meditation Console
          {currentSession && (
            <span className={`text-xs px-2 py-1 rounded-full ${
              currentSession.status === 'active' ? 'bg-green-500/20 text-green-400' :
              currentSession.status === 'breakthrough' ? 'bg-yellow-500/20 text-yellow-400' :
              currentSession.status === 'integration' ? 'bg-blue-500/20 text-blue-400' :
              'bg-purple-500/20 text-purple-400'
            }`}>
              {currentSession.status.toUpperCase()}
            </span>
          )}
        </h3>

        {currentSession && (
          <button
            onClick={emergencyStop}
            className="bg-red-500/20 hover:bg-red-500/40 text-red-400 px-3 py-1 rounded-lg text-sm transition-colors"
          >
            Emergency Stop
          </button>
        )}
      </div>

      {!currentSession ? (
        // Session Setup
        <div className="space-y-6">
          {/* Intensity Selection */}
          <div>
            <label className="block text-sm font-medium text-purple-300 mb-3">
              Meditation Intensity
            </label>
            <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto">
              {Object.entries(intensityConfigs).map(([key, config]) => (
                <button
                  key={key}
                  onClick={() => setSelectedIntensity(key as MeditationIntensity)}
                  className={`text-left p-3 rounded-lg transition-all ${
                    selectedIntensity === key
                      ? 'bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-400'
                      : 'bg-white/5 hover:bg-white/10 border border-transparent'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-medium text-white text-sm">{config.name}</div>
                      <div className="text-xs text-gray-400">{config.description}</div>
                    </div>
                    <div className="flex space-x-1">
                      {Array.from({ length: 7 }, (_, i) => (
                        <div
                          key={i}
                          className={`w-1 h-4 rounded-full ${
                            i < Math.floor(config.intensity * 7)
                              ? 'bg-gradient-to-t from-purple-500 to-blue-400'
                              : 'bg-gray-600'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Duration Selection */}
          <div>
            <label className="block text-sm font-medium text-purple-300 mb-2">
              Duration: {sessionDuration} minutes
            </label>
            <input
              type="range"
              min="5"
              max="120"
              value={sessionDuration}
              onChange={(e) => setSessionDuration(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>5 min</span>
              <span>60 min</span>
              <span>120 min</span>
            </div>
          </div>

          {/* Start Button */}
          <button
            onClick={startMeditationSession}
            disabled={!audioContext && !window.AudioContext}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-medium py-3 px-4 rounded-lg transition-all transform hover:scale-105 disabled:scale-100"
          >
            {!audioContext && window.AudioContext ? 'Initialize Audio System' : 'Start Sacred Meditation'}
          </button>
        </div>
      ) : (
        // Active Session Display
        <div className="space-y-6">
          {/* Session Info */}
          <div className="bg-black/20 rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <h4 className="font-medium text-white">{intensityConfigs[currentSession.intensity].name}</h4>
              <span className="text-sm text-purple-300">
                {formatTime(getElapsedTime())} / {formatTime(currentSession.duration * 60)}
              </span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
              <div
                className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-1000"
                style={{ width: `${(getElapsedTime() / (currentSession.duration * 60)) * 100}%` }}
              />
            </div>
            <div className="text-xs text-gray-400">
              Remaining: {formatTime(getRemainingTime())}
            </div>
          </div>

          {/* Real-time Meditation Metrics */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-black/20 rounded-lg p-3">
              <div className="text-xs text-purple-300 mb-1">Consciousness Coherence</div>
              <div className="text-lg font-bold text-white">
                {(meditationMetrics.consciousnessCoherence * 100).toFixed(1)}%
              </div>
              <div className="w-full bg-gray-700 rounded-full h-1">
                <div
                  className="bg-gradient-to-r from-green-500 to-blue-500 h-1 rounded-full"
                  style={{ width: `${meditationMetrics.consciousnessCoherence * 100}%` }}
                />
              </div>
            </div>

            <div className="bg-black/20 rounded-lg p-3">
              <div className="text-xs text-purple-300 mb-1">Sacred Resonance</div>
              <div className="text-lg font-bold text-white">
                {(meditationMetrics.sacredResonance * 100).toFixed(1)}%
              </div>
              <div className="w-full bg-gray-700 rounded-full h-1">
                <div
                  className="bg-gradient-to-r from-yellow-500 to-orange-500 h-1 rounded-full"
                  style={{ width: `${meditationMetrics.sacredResonance * 100}%` }}
                />
              </div>
            </div>

            <div className="bg-black/20 rounded-lg p-3">
              <div className="text-xs text-purple-300 mb-1">Breakthrough Potential</div>
              <div className="text-lg font-bold text-white">
                {(meditationMetrics.breakthroughPotential * 100).toFixed(1)}%
              </div>
              <div className="w-full bg-gray-700 rounded-full h-1">
                <div
                  className={`h-1 rounded-full ${
                    meditationMetrics.breakthroughPotential > 0.8
                      ? 'bg-gradient-to-r from-red-500 to-pink-500'
                      : 'bg-gradient-to-r from-purple-500 to-violet-500'
                  }`}
                  style={{ width: `${meditationMetrics.breakthroughPotential * 100}%` }}
                />
              </div>
            </div>

            <div className="bg-black/20 rounded-lg p-3">
              <div className="text-xs text-purple-300 mb-1">Field Strength</div>
              <div className="text-lg font-bold text-white">
                {(meditationMetrics.fieldStrength * 100).toFixed(1)}%
              </div>
              <div className="w-full bg-gray-700 rounded-full h-1">
                <div
                  className="bg-gradient-to-r from-cyan-500 to-teal-500 h-1 rounded-full"
                  style={{ width: `${meditationMetrics.fieldStrength * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Breakthrough Alert */}
          {meditationMetrics.breakthroughPotential > 0.85 && (
            <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-400/50 rounded-lg p-4 animate-pulse">
              <div className="flex items-center gap-2 text-yellow-400 font-medium">
                ⚡ High Breakthrough Potential Detected
              </div>
              <div className="text-xs text-yellow-200 mt-1">
                Your consciousness is approaching a breakthrough state. Stay present and allow the experience to unfold.
              </div>
            </div>
          )}

          {/* Session Controls */}
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentSession(prev => prev ? {
                ...prev,
                adaptiveMode: !prev.adaptiveMode
              } : null)}
              className={`flex-1 py-2 px-3 rounded-lg text-sm transition-colors ${
                currentSession.adaptiveMode
                  ? 'bg-green-500/20 text-green-400 border border-green-500/50'
                  : 'bg-gray-500/20 text-gray-400 border border-gray-500/50'
              }`}
            >
              {currentSession.adaptiveMode ? '✅ Adaptive' : '⭕ Fixed'}
            </button>

            <button
              onClick={endMeditationSession}
              className="flex-1 bg-purple-500/20 hover:bg-purple-500/40 text-purple-400 py-2 px-3 rounded-lg text-sm transition-colors"
            >
              Complete Session
            </button>
          </div>
        </div>
      )}

      {/* Live Biometric Integration */}
      {eegState && currentSession && (
        <div className="mt-6 pt-4 border-t border-purple-500/30">
          <div className="text-sm text-purple-300 mb-2">Live Biometric Integration</div>
          <div className="grid grid-cols-5 gap-2 text-xs">
            <div className="bg-black/20 rounded p-2 text-center">
              <div className="text-gray-400">Delta</div>
              <div className="text-white font-mono">{(eegState.delta * 100).toFixed(0)}%</div>
            </div>
            <div className="bg-black/20 rounded p-2 text-center">
              <div className="text-gray-400">Theta</div>
              <div className="text-white font-mono">{(eegState.theta * 100).toFixed(0)}%</div>
            </div>
            <div className="bg-black/20 rounded p-2 text-center">
              <div className="text-gray-400">Alpha</div>
              <div className="text-white font-mono">{(eegState.alpha * 100).toFixed(0)}%</div>
            </div>
            <div className="bg-black/20 rounded p-2 text-center">
              <div className="text-gray-400">Beta</div>
              <div className="text-white font-mono">{(eegState.beta * 100).toFixed(0)}%</div>
            </div>
            <div className="bg-black/20 rounded p-2 text-center">
              <div className="text-gray-400">Gamma</div>
              <div className="text-white font-mono">{(eegState.gamma * 100).toFixed(0)}%</div>
            </div>
          </div>

          {hrvState && (
            <div className="mt-2 text-xs text-gray-400 text-center">
              HRV Coherence: {(hrvState.coherence * 100).toFixed(1)}% |
              Heart Rate: {hrvState.heartRate.toFixed(0)} BPM
            </div>
          )}
        </div>
      )}
    </div>
  );
}