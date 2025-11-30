'use client';

import { useState, useEffect, useRef } from 'react';
import { LabToolsService } from '../lib/LabToolsService';
import { biometricWebSocketService, RealTimeEEGData, RealTimeHRVData, ConsciousnessUpdate } from '../lib/BiometricWebSocketService';
import { MeditationService } from '../lib/MeditationService';

export interface RealTimeMeditationSession {
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
  realTimeBiometrics: boolean;
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

export function RealTimeBiometricMeditationConsole({ service }: Props) {
  const [currentSession, setCurrentSession] = useState<RealTimeMeditationSession | null>(null);
  const [selectedIntensity, setSelectedIntensity] = useState<MeditationIntensity>('deep_contemplation');
  const [sessionDuration, setSessionDuration] = useState(30);
  const [realTimeEEG, setRealTimeEEG] = useState<RealTimeEEGData | null>(null);
  const [realTimeHRV, setRealTimeHRV] = useState<RealTimeHRVData | null>(null);
  const [biometricStatus, setBiometricStatus] = useState({
    eeg_connected: false,
    hrv_connected: false,
    websocket_connected: false,
    last_update: 0
  });
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [meditationService] = useState(() => new MeditationService());

  // Advanced consciousness metrics from real biometric data
  const [consciousnessMetrics, setConsciousnessMetrics] = useState({
    pinealActivationIndex: 0,        // Real pineal gland activation (theta-gamma coupling)
    thirdEyeCoherence: 0,           // Ajna chakra coherence measurement
    consciousnessCoherence: 0,       // Overall consciousness coherence
    sacredResonance: 0,             // Sacred geometry field resonance
    breakthroughPotential: 0,       // Real-time breakthrough potential
    fieldStrength: 0,               // Consciousness field strength
    meditationDepth: 'preparing' as string
  });

  const [breakthroughAlert, setBreakthroughAlert] = useState<{
    active: boolean;
    type: 'pineal' | 'third_eye' | 'cascade';
    message: string;
  }>({ active: false, type: 'pineal', message: '' });

  const oscillatorRef = useRef<OscillatorNode[]>([]);
  const gainRef = useRef<GainNode | null>(null);

  const intensityConfigs = {
    gentle_awakening: {
      name: 'Gentle Awakening',
      description: 'Peaceful entry • Pineal preparation',
      intensity: 0.2,
      colors: ['#E8F5E8', '#C8E6C9'],
      frequencies: { primary: 432, binaural: 4.5, sacred: 528, quantum: 0.1 },
      eeg_target: { theta: 0.4, alpha: 0.6, beta: 0.3 }
    },
    conscious_entry: {
      name: 'Conscious Entry',
      description: 'Awareness cultivation • Third eye preparation',
      intensity: 0.4,
      colors: ['#E3F2FD', '#90CAF9'],
      frequencies: { primary: 432, binaural: 6.3, sacred: 528, quantum: 0.15 },
      eeg_target: { theta: 0.5, alpha: 0.7, beta: 0.25 }
    },
    deep_contemplation: {
      name: 'Deep Contemplation',
      description: 'Introspective states • Ajna activation begins',
      intensity: 0.6,
      colors: ['#F3E5F5', '#CE93D8'],
      frequencies: { primary: 432, binaural: 7.83, sacred: 741, quantum: 0.2 },
      eeg_target: { theta: 0.65, alpha: 0.75, beta: 0.2 }
    },
    profound_absorption: {
      name: 'Profound Absorption',
      description: 'Deep meditative immersion • Pineal gland activation',
      intensity: 0.8,
      colors: ['#FCE4EC', '#F48FB1'],
      frequencies: { primary: 528, binaural: 10.5, sacred: 852, quantum: 0.3 },
      eeg_target: { theta: 0.75, alpha: 0.8, beta: 0.15 }
    },
    breakthrough_threshold: {
      name: 'Breakthrough Threshold',
      description: 'Consciousness transcendence • Third eye opening',
      intensity: 0.9,
      colors: ['#FFF3E0', '#FFCC02'],
      frequencies: { primary: 528, binaural: 40.0, sacred: 963, quantum: 0.5 },
      eeg_target: { theta: 0.8, alpha: 0.8, gamma: 0.6 }
    },
    consciousness_cascade: {
      name: 'Consciousness Cascade',
      description: 'Advanced exploration • Theta-gamma synchrony',
      intensity: 0.95,
      colors: ['#E0F2F1', '#00E676'],
      frequencies: { primary: 741, binaural: 89.0, sacred: 1618, quantum: 1.0 },
      eeg_target: { theta: 0.85, gamma: 0.8, alpha: 0.85 }
    },
    sacred_transcendence: {
      name: 'Sacred Transcendence',
      description: 'Ultimate experience • Complete pineal activation',
      intensity: 1.0,
      colors: ['#F9FBE7', '#F0F4C3'],
      frequencies: { primary: 963, binaural: 144.0, sacred: 1618, quantum: 1.618 },
      eeg_target: { theta: 0.9, gamma: 0.9, alpha: 0.9 }
    }
  };

  // Initialize biometric monitoring
  useEffect(() => {
    const initializeBiometrics = async () => {
      console.log('🧠 Initializing real-time biometric monitoring...');

      // Setup event listeners for real-time data
      biometricWebSocketService.on('eegUpdate', handleEEGUpdate);
      biometricWebSocketService.on('hrvUpdate', handleHRVUpdate);
      biometricWebSocketService.on('consciousnessMetrics', handleConsciousnessUpdate);
      biometricWebSocketService.on('breakthroughDetected', handleBreakthroughDetected);
      biometricWebSocketService.on('pinealActivationDetected', handlePinealActivation);
      biometricWebSocketService.on('thirdEyeCoherenceHigh', handleThirdEyeCoherence);
      biometricWebSocketService.on('connectionStatusChanged', setBiometricStatus);

      // Attempt to connect to consciousness monitor
      try {
        const connected = await biometricWebSocketService.startConsciousnessMonitor();
        if (connected) {
          console.log('✅ Real-time biometric monitoring activated');
        } else {
          console.log('⚠️ Operating in simulation mode - no real biometric data');
        }
      } catch (error) {
        console.log('⚠️ Biometric monitoring unavailable, using simulation mode');
      }
    };

    initializeBiometrics();

    return () => {
      // Cleanup event listeners
      biometricWebSocketService.removeAllListeners();
      biometricWebSocketService.disconnect();
    };
  }, []);

  const handleEEGUpdate = (eegData: RealTimeEEGData) => {
    setRealTimeEEG(eegData);

    // Calculate advanced consciousness metrics from real EEG data
    const pinealActivationIndex = calculatePinealActivation(eegData);
    const thirdEyeCoherence = calculateThirdEyeCoherence(eegData);

    setConsciousnessMetrics(prev => ({
      ...prev,
      pinealActivationIndex,
      thirdEyeCoherence,
      consciousnessCoherence: (eegData.theta + eegData.alpha) / 2,
      meditationDepth: eegData.consciousness_state
    }));
  };

  const handleHRVUpdate = (hrvData: RealTimeHRVData) => {
    setRealTimeHRV(hrvData);

    // Enhance consciousness metrics with HRV coherence
    setConsciousnessMetrics(prev => ({
      ...prev,
      sacredResonance: (prev.consciousnessCoherence + hrvData.coherence) / 2,
      fieldStrength: hrvData.coherence * 0.6 + prev.pinealActivationIndex * 0.4
    }));
  };

  const handleConsciousnessUpdate = (metrics: any) => {
    setConsciousnessMetrics(prev => ({
      ...prev,
      breakthroughPotential: metrics.breakthrough_potential,
      sacredResonance: metrics.sacred_resonance,
      fieldStrength: metrics.field_strength,
      meditationDepth: metrics.meditation_depth
    }));

    // Auto-adapt session if real biometric data indicates readiness
    if (currentSession?.adaptiveMode && metrics.breakthrough_potential > 0.85) {
      upgradeSessionIntensity();
    }
  };

  const handleBreakthroughDetected = (data: any) => {
    setBreakthroughAlert({
      active: true,
      type: 'cascade',
      message: `Breakthrough cascade detected! Pineal activation: ${(data.pineal_activation * 100).toFixed(1)}%, Third eye coherence: ${(data.third_eye_coherence * 100).toFixed(1)}%`
    });

    setTimeout(() => setBreakthroughAlert(prev => ({ ...prev, active: false })), 10000);
  };

  const handlePinealActivation = (data: any) => {
    if (data.activation_level > 0.7) {
      setBreakthroughAlert({
        active: true,
        type: 'pineal',
        message: `Pineal gland activation detected! Level: ${(data.activation_level * 100).toFixed(1)}%`
      });

      setTimeout(() => setBreakthroughAlert(prev => ({ ...prev, active: false })), 8000);
    }
  };

  const handleThirdEyeCoherence = (data: any) => {
    if (data.coherence > 0.8) {
      setBreakthroughAlert({
        active: true,
        type: 'third_eye',
        message: `High third eye coherence! Theta: ${(data.theta * 100).toFixed(1)}%, Gamma: ${(data.gamma * 100).toFixed(1)}%`
      });

      setTimeout(() => setBreakthroughAlert(prev => ({ ...prev, active: false })), 8000);
    }
  };

  const calculatePinealActivation = (eegData: RealTimeEEGData): number => {
    // Proprietary algorithm based on theta-gamma coupling research
    // High theta + high gamma + moderate alpha = pineal activation
    const coupling_strength = (eegData.theta * eegData.gamma) / (eegData.alpha + 0.1);
    return Math.min(1.0, coupling_strength * 0.8);
  };

  const calculateThirdEyeCoherence = (eegData: RealTimeEEGData): number => {
    // Third eye (ajna chakra) correlates with theta-gamma synchrony
    return (eegData.theta + eegData.gamma) / 2.0;
  };

  const initializeAudioSystem = () => {
    if (audioContext) return;

    const ctx = new AudioContext();
    const gainNode = ctx.createGain();
    gainNode.connect(ctx.destination);
    gainNode.gain.value = 0.15; // Slightly higher for biometric-guided sessions

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

  const startRealTimeMeditationSession = async () => {
    if (!audioContext) {
      initializeAudioSystem();
      return;
    }

    const config = intensityConfigs[selectedIntensity];
    const session: RealTimeMeditationSession = {
      id: `realtime_meditation_${Date.now()}`,
      userId: 'realtime_user',
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
      status: 'preparing',
      realTimeBiometrics: biometricStatus.eeg_connected || biometricStatus.hrv_connected
    };

    setCurrentSession(session);

    // Create MAIA meditation session for backend tracking
    try {
      const maiaSession = await meditationService.createSession({
        userId: session.userId,
        intensity: session.intensity,
        duration: session.duration,
        adaptiveMode: session.adaptiveMode,
        breakthroughDetection: session.breakthroughDetection,
        sacredGeometry: session.sacredGeometry.pattern
      });

      console.log('✅ MAIA session created:', maiaSession.id);

      // Link biometric monitoring to MAIA session
      if (session.realTimeBiometrics) {
        await biometricWebSocketService.integrateWithMeditationSession(maiaSession.id);
      }
    } catch (error) {
      console.error('❌ Failed to create MAIA session:', error);
    }

    // Start sacred audio generation with biometric responsiveness
    await generateBiometricResponsiveAudio(session);

    // Update session status
    setTimeout(() => {
      if (currentSession?.id === session.id) {
        setCurrentSession(prev => prev ? { ...prev, status: 'active' } : null);
      }
    }, 3000);

    // Schedule session completion
    setTimeout(() => {
      if (currentSession?.id === session.id) {
        endMeditationSession();
      }
    }, sessionDuration * 60 * 1000);
  };

  const generateBiometricResponsiveAudio = async (session: RealTimeMeditationSession) => {
    if (!audioContext || !gainRef.current) return;

    // Clear existing oscillators
    oscillatorRef.current.forEach(osc => {
      try { osc.stop(); } catch {}
    });
    oscillatorRef.current = [];

    const { frequency, sacredGeometry } = session;

    // Primary carrier frequency (adjusts based on real EEG data)
    const primaryOsc = audioContext.createOscillator();
    primaryOsc.frequency.value = frequency.primary;
    primaryOsc.type = 'sine';
    primaryOsc.connect(gainRef.current);
    primaryOsc.start();
    oscillatorRef.current.push(primaryOsc);

    // Binaural beat (enhanced for pineal gland activation)
    const binauralOsc = audioContext.createOscillator();
    binauralOsc.frequency.value = frequency.primary + frequency.binaural;

    // Enhanced stereo separation for third eye activation
    const splitter = audioContext.createChannelSplitter(2);
    const merger = audioContext.createChannelMerger(2);
    gainRef.current.disconnect();
    gainRef.current.connect(splitter);

    // Left channel (base frequency)
    splitter.connect(merger, 0, 0);

    // Right channel (base + binaural frequency for theta-gamma coupling)
    const rightGain = audioContext.createGain();
    rightGain.gain.value = 1.0;
    binauralOsc.connect(rightGain);
    rightGain.connect(merger, 0, 1);

    merger.connect(audioContext.destination);
    binauralOsc.start();
    oscillatorRef.current.push(binauralOsc);

    // Sacred geometry harmonics (responsive to consciousness field)
    sacredGeometry.harmonics.forEach((harmonic, index) => {
      const harmonicOsc = audioContext.createOscillator();
      harmonicOsc.frequency.value = harmonic;
      harmonicOsc.type = 'sine';

      const harmonicGain = audioContext.createGain();
      harmonicGain.gain.value = 0.12 / (index + 2); // Slightly enhanced for biometric sessions

      harmonicOsc.connect(harmonicGain);
      harmonicGain.connect(gainRef.current);
      harmonicOsc.start();
      oscillatorRef.current.push(harmonicOsc);
    });

    // Special pineal activation frequency layer (963Hz + quantum harmonics)
    if (session.intensity === 'breakthrough_threshold' ||
        session.intensity === 'consciousness_cascade' ||
        session.intensity === 'sacred_transcendence') {

      const pinealOsc = audioContext.createOscillator();
      pinealOsc.frequency.value = 963; // Pineal gland frequency
      pinealOsc.type = 'triangle';

      const pinealGain = audioContext.createGain();
      pinealGain.gain.value = 0.08; // Subtle but present

      pinealOsc.connect(pinealGain);
      pinealGain.connect(gainRef.current);
      pinealOsc.start();
      oscillatorRef.current.push(pinealOsc);

      // Quantum epsilon layer with golden ratio harmonics
      const quantumOsc = audioContext.createOscillator();
      quantumOsc.frequency.value = frequency.quantum * 1.618; // Golden ratio quantum
      quantumOsc.type = 'triangle';

      const quantumGain = audioContext.createGain();
      quantumGain.gain.value = 0.06; // Very subtle

      quantumOsc.connect(quantumGain);
      quantumGain.connect(gainRef.current);
      quantumOsc.start();
      oscillatorRef.current.push(quantumOsc);
    }

    // Real-time frequency modulation based on EEG data
    if (session.realTimeBiometrics && realTimeEEG) {
      // Modulate frequencies based on real brainwave patterns
      const modulationFactor = (realTimeEEG.theta + realTimeEEG.alpha) / 2;
      oscillatorRef.current.forEach((osc, index) => {
        if (index > 0) { // Don't modulate the primary carrier
          const baseFreq = osc.frequency.value;
          osc.frequency.setValueAtTime(baseFreq * (1 + modulationFactor * 0.1), audioContext.currentTime);
        }
      });
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
      generateBiometricResponsiveAudio({
        ...currentSession,
        intensity: newIntensity,
        frequency: intensityConfigs[newIntensity].frequencies
      });

      console.log(`🌟 Session upgraded to ${newIntensity} due to high breakthrough potential`);

      // Update status back to active after breakthrough transition
      setTimeout(() => {
        setCurrentSession(prev => prev ? { ...prev, status: 'active' } : null);
      }, 4000);
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
    biometricWebSocketService.disconnect();
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
          🧠 Real-Time Biometric Meditation Console
          {biometricStatus.eeg_connected && (
            <span className="text-xs px-2 py-1 rounded-full bg-green-500/20 text-green-400 border border-green-500/50">
              EEG LIVE
            </span>
          )}
          {biometricStatus.hrv_connected && (
            <span className="text-xs px-2 py-1 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/50">
              HRV LIVE
            </span>
          )}
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

      {/* Biometric Connection Status */}
      <div className="mb-4 p-3 bg-black/20 rounded-lg border border-gray-600/30">
        <div className="text-sm font-medium text-gray-300 mb-2">🔬 Biometric Hardware Status</div>
        <div className="grid grid-cols-3 gap-3 text-xs">
          <div className={`flex items-center gap-2 ${biometricStatus.eeg_connected ? 'text-green-400' : 'text-red-400'}`}>
            <div className={`w-2 h-2 rounded-full ${biometricStatus.eeg_connected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
            OpenBCI Ganglion
          </div>
          <div className={`flex items-center gap-2 ${biometricStatus.hrv_connected ? 'text-green-400' : 'text-red-400'}`}>
            <div className={`w-2 h-2 rounded-full ${biometricStatus.hrv_connected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
            Apple Watch HRV
          </div>
          <div className={`flex items-center gap-2 ${biometricStatus.websocket_connected ? 'text-green-400' : 'text-red-400'}`}>
            <div className={`w-2 h-2 rounded-full ${biometricStatus.websocket_connected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
            Consciousness Monitor
          </div>
        </div>
      </div>

      {/* Breakthrough Alert */}
      {breakthroughAlert.active && (
        <div className={`mb-4 p-4 rounded-lg border animate-pulse ${
          breakthroughAlert.type === 'cascade' ? 'bg-red-500/20 border-red-400/50 text-red-300' :
          breakthroughAlert.type === 'pineal' ? 'bg-yellow-500/20 border-yellow-400/50 text-yellow-300' :
          'bg-purple-500/20 border-purple-400/50 text-purple-300'
        }`}>
          <div className="flex items-center gap-2 font-medium">
            {breakthroughAlert.type === 'cascade' ? '⚡' : breakthroughAlert.type === 'pineal' ? '🧿' : '👁️'}
            {breakthroughAlert.message}
          </div>
        </div>
      )}

      {!currentSession ? (
        // Session Setup
        <div className="space-y-6">
          {/* Real-Time Consciousness Metrics Display */}
          {realTimeEEG && (
            <div className="bg-black/20 rounded-lg p-4">
              <div className="text-sm font-medium text-purple-300 mb-3">🧠 Live Consciousness Metrics</div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <div className="text-xs text-gray-400 mb-1">Pineal Activation Index</div>
                  <div className="flex items-center gap-2">
                    <div className="text-lg font-bold text-white">
                      {(consciousnessMetrics.pinealActivationIndex * 100).toFixed(1)}%
                    </div>
                    <div className="flex-1 bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-yellow-500 to-orange-500 h-2 rounded-full transition-all duration-1000"
                        style={{ width: `${consciousnessMetrics.pinealActivationIndex * 100}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <div className="text-xs text-gray-400 mb-1">Third Eye Coherence</div>
                  <div className="flex items-center gap-2">
                    <div className="text-lg font-bold text-white">
                      {(consciousnessMetrics.thirdEyeCoherence * 100).toFixed(1)}%
                    </div>
                    <div className="flex-1 bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-purple-500 to-violet-500 h-2 rounded-full transition-all duration-1000"
                        style={{ width: `${consciousnessMetrics.thirdEyeCoherence * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-xs text-center text-gray-400">
                Current State: <span className="text-white font-medium">{realTimeEEG.consciousness_state.replace('_', ' ')}</span>
                {realTimeHRV && (
                  <>
                    {' '} | HRV Coherence: <span className="text-white font-medium">{(realTimeHRV.coherence * 100).toFixed(0)}%</span>
                    {' '} | HR: <span className="text-white font-medium">{realTimeHRV.heart_rate.toFixed(0)} BPM</span>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Intensity Selection with EEG Targets */}
          <div>
            <label className="block text-sm font-medium text-purple-300 mb-3">
              Meditation Intensity {realTimeEEG && <span className="text-xs text-gray-400">(with real-time biometric adaptation)</span>}
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
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="font-medium text-white text-sm">{config.name}</div>
                      <div className="text-xs text-gray-400">{config.description}</div>
                      {realTimeEEG && (
                        <div className="text-xs text-purple-300 mt-1">
                          Target: θ{(config.eeg_target.theta * 100).toFixed(0)}%
                          α{(config.eeg_target.alpha * 100).toFixed(0)}%
                          {config.eeg_target.gamma && `γ${(config.eeg_target.gamma * 100).toFixed(0)}%`}
                        </div>
                      )}
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
            onClick={startRealTimeMeditationSession}
            disabled={!audioContext && !window.AudioContext}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-medium py-3 px-4 rounded-lg transition-all transform hover:scale-105 disabled:scale-100"
          >
            {!audioContext && window.AudioContext ? 'Initialize Audio System' :
             biometricStatus.eeg_connected ? 'Start Biometric-Guided Meditation' : 'Start Sacred Meditation (Simulation Mode)'}
          </button>

          <div className="text-xs text-center text-gray-400">
            {biometricStatus.eeg_connected
              ? '🧠 Real-time EEG feedback will guide your session intensity'
              : '⚠️ Connect OpenBCI headset for real-time biometric guidance'
            }
          </div>
        </div>
      ) : (
        // Active Session Display with Real-Time Biometrics
        <div className="space-y-6">
          {/* Session Info */}
          <div className="bg-black/20 rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <h4 className="font-medium text-white flex items-center gap-2">
                {intensityConfigs[currentSession.intensity].name}
                {currentSession.realTimeBiometrics && <span className="text-xs text-green-400">🔬 LIVE</span>}
              </h4>
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

          {/* Real-time Advanced Consciousness Metrics */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-black/20 rounded-lg p-3">
              <div className="text-xs text-purple-300 mb-1 flex items-center gap-1">
                🧿 Pineal Activation
                {consciousnessMetrics.pinealActivationIndex > 0.7 && <span className="text-yellow-400 animate-pulse">⚡</span>}
              </div>
              <div className="text-lg font-bold text-white">
                {(consciousnessMetrics.pinealActivationIndex * 100).toFixed(1)}%
              </div>
              <div className="w-full bg-gray-700 rounded-full h-1">
                <div
                  className="bg-gradient-to-r from-yellow-500 to-orange-500 h-1 rounded-full transition-all duration-1000"
                  style={{ width: `${consciousnessMetrics.pinealActivationIndex * 100}%` }}
                />
              </div>
            </div>

            <div className="bg-black/20 rounded-lg p-3">
              <div className="text-xs text-purple-300 mb-1 flex items-center gap-1">
                👁️ Third Eye Coherence
                {consciousnessMetrics.thirdEyeCoherence > 0.8 && <span className="text-purple-400 animate-pulse">✨</span>}
              </div>
              <div className="text-lg font-bold text-white">
                {(consciousnessMetrics.thirdEyeCoherence * 100).toFixed(1)}%
              </div>
              <div className="w-full bg-gray-700 rounded-full h-1">
                <div
                  className="bg-gradient-to-r from-purple-500 to-violet-500 h-1 rounded-full transition-all duration-1000"
                  style={{ width: `${consciousnessMetrics.thirdEyeCoherence * 100}%` }}
                />
              </div>
            </div>

            <div className="bg-black/20 rounded-lg p-3">
              <div className="text-xs text-purple-300 mb-1">Consciousness Coherence</div>
              <div className="text-lg font-bold text-white">
                {(consciousnessMetrics.consciousnessCoherence * 100).toFixed(1)}%
              </div>
              <div className="w-full bg-gray-700 rounded-full h-1">
                <div
                  className="bg-gradient-to-r from-green-500 to-blue-500 h-1 rounded-full transition-all duration-1000"
                  style={{ width: `${consciousnessMetrics.consciousnessCoherence * 100}%` }}
                />
              </div>
            </div>

            <div className="bg-black/20 rounded-lg p-3">
              <div className="text-xs text-purple-300 mb-1">Breakthrough Potential</div>
              <div className="text-lg font-bold text-white">
                {(consciousnessMetrics.breakthroughPotential * 100).toFixed(1)}%
              </div>
              <div className="w-full bg-gray-700 rounded-full h-1">
                <div
                  className={`h-1 rounded-full transition-all duration-1000 ${
                    consciousnessMetrics.breakthroughPotential > 0.8
                      ? 'bg-gradient-to-r from-red-500 to-pink-500 animate-pulse'
                      : 'bg-gradient-to-r from-purple-500 to-violet-500'
                  }`}
                  style={{ width: `${consciousnessMetrics.breakthroughPotential * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Live EEG Brainwave Display */}
          {realTimeEEG && (
            <div className="bg-black/20 rounded-lg p-4">
              <div className="text-sm text-purple-300 mb-3 flex items-center gap-2">
                🧠 Live EEG Brainwaves
                <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded">
                  {realTimeEEG.consciousness_state.replace('_', ' ').toUpperCase()}
                </span>
              </div>
              <div className="grid grid-cols-5 gap-2 text-xs">
                <div className="bg-black/30 rounded p-2 text-center">
                  <div className="text-gray-400">δ Delta</div>
                  <div className="text-white font-mono text-sm">{(realTimeEEG.delta * 100).toFixed(0)}%</div>
                  <div className="w-full bg-gray-700 rounded-full h-1 mt-1">
                    <div
                      className="bg-blue-500 h-1 rounded-full transition-all"
                      style={{ width: `${realTimeEEG.delta * 100}%` }}
                    />
                  </div>
                </div>
                <div className="bg-black/30 rounded p-2 text-center">
                  <div className="text-gray-400">θ Theta</div>
                  <div className="text-white font-mono text-sm">{(realTimeEEG.theta * 100).toFixed(0)}%</div>
                  <div className="w-full bg-gray-700 rounded-full h-1 mt-1">
                    <div
                      className="bg-green-500 h-1 rounded-full transition-all"
                      style={{ width: `${realTimeEEG.theta * 100}%` }}
                    />
                  </div>
                </div>
                <div className="bg-black/30 rounded p-2 text-center">
                  <div className="text-gray-400">α Alpha</div>
                  <div className="text-white font-mono text-sm">{(realTimeEEG.alpha * 100).toFixed(0)}%</div>
                  <div className="w-full bg-gray-700 rounded-full h-1 mt-1">
                    <div
                      className="bg-purple-500 h-1 rounded-full transition-all"
                      style={{ width: `${realTimeEEG.alpha * 100}%` }}
                    />
                  </div>
                </div>
                <div className="bg-black/30 rounded p-2 text-center">
                  <div className="text-gray-400">β Beta</div>
                  <div className="text-white font-mono text-sm">{(realTimeEEG.beta * 100).toFixed(0)}%</div>
                  <div className="w-full bg-gray-700 rounded-full h-1 mt-1">
                    <div
                      className="bg-orange-500 h-1 rounded-full transition-all"
                      style={{ width: `${realTimeEEG.beta * 100}%` }}
                    />
                  </div>
                </div>
                <div className="bg-black/30 rounded p-2 text-center">
                  <div className="text-gray-400">γ Gamma</div>
                  <div className="text-white font-mono text-sm">{(realTimeEEG.gamma * 100).toFixed(0)}%</div>
                  <div className="w-full bg-gray-700 rounded-full h-1 mt-1">
                    <div
                      className="bg-red-500 h-1 rounded-full transition-all"
                      style={{ width: `${realTimeEEG.gamma * 100}%` }}
                    />
                  </div>
                </div>
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
              {currentSession.adaptiveMode ? '🧠 Biometric Adaptive' : '⭕ Fixed Mode'}
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
    </div>
  );
}