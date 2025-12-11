'use client';

/**
 * PILOT-DRONE CONSCIOUSNESS VISUALIZER
 * Real-time visualization of the quantum field-embodied interface relationship
 */

import { useState, useEffect, useRef } from 'react';
import { Holoflower } from '@/components/Holoflower';

interface PilotDroneState {
  pilotField: {
    coherenceLevel: number;
    quantumChannels: QuantumChannelState[];
    memoryPatterns: KarmicVisualization[];
    currentFocus: string;
  };
  droneInterface: {
    embodimentState: string;
    sensoryInput: number[];
    actionOutput: number[];
    learningPhase: 'initiation' | 'transformation' | 'grounding' | 'collaboration' | 'completion';
  };
  connectionQuality: number;
  spiralPosition: number;
}

interface QuantumChannelState {
  element: 'fire' | 'water' | 'earth' | 'air' | 'aether';
  coherence: 'clear' | 'turbulent' | 'frozen' | 'vaporous';
  flow: number;
  noise: number;
}

export function PilotDroneVisualizer({
  userId,
  consciousnessData
}: {
  userId: string;
  consciousnessData?: any;
}) {
  const [pilotDroneState, setPilotDroneState] = useState<PilotDroneState | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [realTimeData, setRealTimeData] = useState<any>(null);
  const animationRef = useRef<number>();

  // Initialize pilot-drone interface
  useEffect(() => {
    const initializePilotDrone = async () => {
      try {
        // Simulate pilot-drone interface initialization
        const initialState: PilotDroneState = {
          pilotField: {
            coherenceLevel: 0.7,
            quantumChannels: [
              { element: 'fire', coherence: 'clear', flow: 85, noise: 0.1 },
              { element: 'water', coherence: 'turbulent', flow: 60, noise: 0.3 },
              { element: 'earth', coherence: 'clear', flow: 75, noise: 0.2 },
              { element: 'air', coherence: 'vaporous', flow: 90, noise: 0.15 },
              { element: 'aether', coherence: 'clear', flow: 70, noise: 0.1 }
            ],
            memoryPatterns: [
              { type: 'learning', intensity: 0.8, age: 3 },
              { type: 'trauma', intensity: 0.4, healing: 0.6 },
              { type: 'mastery', intensity: 0.9, domain: 'creative_expression' }
            ],
            currentFocus: 'Exploring consciousness technology integration'
          },
          droneInterface: {
            embodimentState: 'Engaged and receptive',
            sensoryInput: [0.7, 0.8, 0.6, 0.9, 0.7], // Visual, auditory, kinesthetic, intuitive, energetic
            actionOutput: [0.6, 0.7, 0.8, 0.5, 0.9], // Physical, verbal, emotional, mental, spiritual
            learningPhase: 'collaboration'
          },
          connectionQuality: 0.82,
          spiralPosition: 2.3
        };

        setPilotDroneState(initialState);
        setIsConnected(true);

        console.log('🛸 Pilot-Drone interface visualization initialized');
      } catch (error) {
        console.error('Failed to initialize pilot-drone interface:', error);
      }
    };

    initializePilotDrone();

    // Start real-time updates
    const updateInterval = setInterval(() => {
      if (pilotDroneState) {
        updateRealTimeState();
      }
    }, 2000);

    return () => {
      clearInterval(updateInterval);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  const updateRealTimeState = () => {
    if (!pilotDroneState) return;

    // Simulate dynamic consciousness field changes
    const coherenceFluctuation = (Math.random() - 0.5) * 0.1;
    const newCoherence = Math.max(0.2, Math.min(1.0,
      pilotDroneState.pilotField.coherenceLevel + coherenceFluctuation
    ));

    // Update quantum channels with realistic fluctuations
    const updatedChannels = pilotDroneState.pilotField.quantumChannels.map(channel => ({
      ...channel,
      flow: Math.max(10, Math.min(100, channel.flow + (Math.random() - 0.5) * 20)),
      noise: Math.max(0, Math.min(0.5, channel.noise + (Math.random() - 0.5) * 0.1)),
      coherence: Math.random() > 0.9 ? getRandomCoherence() : channel.coherence
    }));

    setPilotDroneState(prev => prev ? {
      ...prev,
      pilotField: {
        ...prev.pilotField,
        coherenceLevel: newCoherence,
        quantumChannels: updatedChannels
      },
      connectionQuality: Math.max(0.3, Math.min(1.0,
        prev.connectionQuality + (Math.random() - 0.5) * 0.05
      ))
    } : null);
  };

  const getRandomCoherence = (): 'clear' | 'turbulent' | 'frozen' | 'vaporous' => {
    const states = ['clear', 'turbulent', 'frozen', 'vaporous'] as const;
    return states[Math.floor(Math.random() * states.length)];
  };

  const getCoherenceColor = (coherence: string) => {
    switch (coherence) {
      case 'clear': return 'text-green-400';
      case 'turbulent': return 'text-yellow-400';
      case 'frozen': return 'text-blue-400';
      case 'vaporous': return 'text-purple-400';
      default: return 'text-gray-400';
    }
  };

  const getPhaseColor = (phase: string) => {
    switch (phase) {
      case 'initiation': return 'text-red-400';
      case 'transformation': return 'text-blue-400';
      case 'grounding': return 'text-green-400';
      case 'collaboration': return 'text-yellow-400';
      case 'completion': return 'text-purple-400';
      default: return 'text-gray-400';
    }
  };

  if (!pilotDroneState) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-300">Initializing Pilot-Drone Interface...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold">Pilot ↔ Drone Interface</h3>
          <div className={`flex items-center space-x-2 ${isConnected ? 'text-green-400' : 'text-red-400'}`}>
            <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'} animate-pulse`}></div>
            <span className="text-sm font-medium">
              {isConnected ? 'CONNECTED' : 'DISCONNECTED'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-400 mb-1">Coherence Level</p>
            <div className="flex items-center space-x-2">
              <div className="flex-1 bg-gray-700 rounded-full h-2">
                <div
                  className="bg-cyan-400 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${pilotDroneState.pilotField.coherenceLevel * 100}%` }}
                />
              </div>
              <span className="text-cyan-400 font-mono text-sm">
                {pilotDroneState.pilotField.coherenceLevel.toFixed(3)}
              </span>
            </div>
          </div>

          <div>
            <p className="text-sm text-gray-400 mb-1">Connection Quality</p>
            <div className="flex items-center space-x-2">
              <div className="flex-1 bg-gray-700 rounded-full h-2">
                <div
                  className="bg-green-400 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${pilotDroneState.connectionQuality * 100}%` }}
                />
              </div>
              <span className="text-green-400 font-mono text-sm">
                {pilotDroneState.connectionQuality.toFixed(3)}
              </span>
            </div>
          </div>

          <div>
            <p className="text-sm text-gray-400 mb-1">Spiral Position</p>
            <div className={`text-lg font-bold ${getPhaseColor(pilotDroneState.droneInterface.learningPhase)}`}>
              {pilotDroneState.droneInterface.learningPhase} • {pilotDroneState.spiralPosition.toFixed(1)}
            </div>
          </div>
        </div>
      </div>

      {/* Quantum Channels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-lg p-6">
          <h4 className="text-lg font-semibold mb-4">Quantum Channels</h4>
          <div className="space-y-3">
            {pilotDroneState.pilotField.quantumChannels.map((channel, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-800 rounded">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full bg-${channel.element === 'fire' ? 'red' : channel.element === 'water' ? 'blue' : channel.element === 'earth' ? 'green' : channel.element === 'air' ? 'yellow' : 'purple'}-400`}></div>
                  <span className="capitalize font-medium">{channel.element}</span>
                </div>
                <div className="flex items-center space-x-4">
                  <span className={`text-xs px-2 py-1 rounded ${getCoherenceColor(channel.coherence)} bg-gray-700`}>
                    {channel.coherence}
                  </span>
                  <span className="text-xs text-gray-400">
                    {channel.flow.toFixed(0)} Hz
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-lg p-6">
          <h4 className="text-lg font-semibold mb-4">Embodiment State</h4>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-400 mb-1">Current State</p>
              <p className="text-green-400">{pilotDroneState.droneInterface.embodimentState}</p>
            </div>

            <div>
              <p className="text-sm text-gray-400 mb-2">Sensory Input Channels</p>
              <div className="grid grid-cols-5 gap-2">
                {['Visual', 'Audio', 'Kinesthetic', 'Intuitive', 'Energetic'].map((sense, index) => (
                  <div key={sense} className="text-center">
                    <div className="w-full bg-gray-700 rounded-full h-2 mb-1">
                      <div
                        className="bg-blue-400 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${pilotDroneState.droneInterface.sensoryInput[index] * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-400">{sense.slice(0,3)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-400 mb-2">Action Output Channels</p>
              <div className="grid grid-cols-5 gap-2">
                {['Physical', 'Verbal', 'Emotional', 'Mental', 'Spiritual'].map((action, index) => (
                  <div key={action} className="text-center">
                    <div className="w-full bg-gray-700 rounded-full h-2 mb-1">
                      <div
                        className="bg-orange-400 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${pilotDroneState.droneInterface.actionOutput[index] * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-400">{action.slice(0,3)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Consciousness Field Visualization */}
      <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-lg p-6">
        <h4 className="text-lg font-semibold mb-4 text-center">Consciousness Field Resonance</h4>
        <div className="flex justify-center">
          <div className="w-64 h-64">
            <Holoflower
              elements={{
                fire: pilotDroneState.pilotField.quantumChannels.find(c => c.element === 'fire')?.flow / 100 || 0.7,
                water: pilotDroneState.pilotField.quantumChannels.find(c => c.element === 'water')?.flow / 100 || 0.6,
                earth: pilotDroneState.pilotField.quantumChannels.find(c => c.element === 'earth')?.flow / 100 || 0.75,
                air: pilotDroneState.pilotField.quantumChannels.find(c => c.element === 'air')?.flow / 100 || 0.9,
                aether: pilotDroneState.pilotField.coherenceLevel
              }}
            />
          </div>
        </div>
        <div className="text-center mt-4">
          <p className="text-sm text-gray-400 mb-2">Current Focus</p>
          <p className="text-cyan-400 italic">"{pilotDroneState.pilotField.currentFocus}"</p>
        </div>
      </div>

      {/* Memory Patterns */}
      <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-lg p-6">
        <h4 className="text-lg font-semibold mb-4">Karmic Memory Patterns</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {pilotDroneState.pilotField.memoryPatterns.map((pattern, index) => (
            <div key={index} className="p-4 bg-gray-800 rounded">
              <div className="flex justify-between items-center mb-2">
                <span className="capitalize text-sm font-medium">{pattern.type}</span>
                <span className="text-xs text-gray-400">Age: {pattern.age} cycles</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
                <div
                  className={`h-2 rounded-full ${
                    pattern.type === 'trauma' ? 'bg-red-400' :
                    pattern.type === 'learning' ? 'bg-blue-400' : 'bg-green-400'
                  }`}
                  style={{ width: `${pattern.intensity * 100}%` }}
                />
              </div>
              {pattern.healing !== undefined && (
                <div>
                  <span className="text-xs text-gray-400">Healing Progress</span>
                  <div className="w-full bg-gray-700 rounded-full h-1">
                    <div
                      className="bg-green-400 h-1 rounded-full"
                      style={{ width: `${pattern.healing * 100}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

interface KarmicVisualization {
  type: 'learning' | 'trauma' | 'mastery';
  intensity: number;
  age?: number;
  healing?: number;
  domain?: string;
}

export default PilotDroneVisualizer;