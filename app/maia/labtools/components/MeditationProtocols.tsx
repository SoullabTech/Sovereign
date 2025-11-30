'use client';

import { useState, useEffect } from 'react';
import { LabToolsService, Protocol } from '../lib/LabToolsService';

interface MeditationProtocol extends Protocol {
  meditationType: 'consciousness_expansion' | 'sacred_geometry' | 'breakthrough_cultivation' | 'field_harmonization' | 'quantum_coherence';
  sacredPattern: 'golden_spiral' | 'fibonacci' | 'flower_of_life' | 'sri_yantra' | 'merkaba';
  frequencyProfile: {
    carrier: number;
    binaural: number;
    sacred: number;
    harmonic: number[];
  };
  consciousnessTargets: {
    theta_enhancement: number;
    gamma_activation: number;
    coherence_boost: number;
    field_synchrony: number;
  };
  adaptiveFeatures: string[];
  contraindications: string[];
}

interface Props {
  service: LabToolsService;
}

export function MeditationProtocols({ service }: Props) {
  const [selectedProtocol, setSelectedProtocol] = useState<MeditationProtocol | null>(null);
  const [activeProtocol, setActiveProtocol] = useState<Protocol | null>(null);
  const [customizing, setCustomizing] = useState(false);

  // Advanced meditation protocols beyond basic consciousness work
  const advancedMeditationProtocols: MeditationProtocol[] = [
    {
      id: 'consciousness_cascade',
      name: 'Consciousness Cascade',
      category: 'meditation',
      intensity: 0.9,
      duration: 45,
      description: 'Advanced breakthrough meditation with cascade synchronization across all consciousness modules',
      safetyLevel: 'advanced',
      meditationType: 'consciousness_expansion',
      sacredPattern: 'golden_spiral',
      frequencyProfile: {
        carrier: 528,
        binaural: 40.0,
        sacred: 741,
        harmonic: [528, 741, 852, 963, 1074]
      },
      consciousnessTargets: {
        theta_enhancement: 0.7,
        gamma_activation: 0.9,
        coherence_boost: 0.8,
        field_synchrony: 0.85
      },
      adaptiveFeatures: [
        'Real-time EEG adaptation',
        'HRV coherence optimization',
        'Breakthrough cascade triggering',
        'Sacred geometry frequency modulation'
      ],
      contraindications: [
        'Epilepsy or seizure disorders',
        'Severe anxiety disorders',
        'Recent psychedelic use (48h)',
        'Pregnancy'
      ]
    },
    {
      id: 'sacred_geometry_immersion',
      name: 'Sacred Geometry Immersion',
      category: 'meditation',
      intensity: 0.7,
      duration: 30,
      description: 'Deep meditation enhanced with golden ratio and Fibonacci frequency patterns',
      safetyLevel: 'moderate',
      meditationType: 'sacred_geometry',
      sacredPattern: 'fibonacci',
      frequencyProfile: {
        carrier: 432,
        binaural: 6.3,
        sacred: 528,
        harmonic: [432, 540, 675, 810, 1012.5]
      },
      consciousnessTargets: {
        theta_enhancement: 0.8,
        gamma_activation: 0.4,
        coherence_boost: 0.9,
        field_synchrony: 0.7
      },
      adaptiveFeatures: [
        'Golden ratio timing cycles',
        'Fibonacci harmonic progression',
        'Sacred pattern visualization sync',
        'Field geometry optimization'
      ],
      contraindications: [
        'Hearing impairments',
        'Tinnitus'
      ]
    },
    {
      id: 'quantum_coherence_protocol',
      name: 'Quantum Coherence Protocol',
      category: 'meditation',
      intensity: 0.95,
      duration: 60,
      description: 'Ultra-deep meditation accessing quantum consciousness frequencies below 1Hz',
      safetyLevel: 'advanced',
      meditationType: 'quantum_coherence',
      sacredPattern: 'merkaba',
      frequencyProfile: {
        carrier: 963,
        binaural: 0.1,
        sacred: 1618,
        harmonic: [0.1, 0.5, 1.618, 2.618, 4.236]
      },
      consciousnessTargets: {
        theta_enhancement: 0.6,
        gamma_activation: 0.3,
        coherence_boost: 0.95,
        field_synchrony: 0.9
      },
      adaptiveFeatures: [
        'Quantum epsilon frequencies',
        'Ultra-slow brainwave entrainment',
        'Consciousness field coupling',
        'Non-local awareness cultivation'
      ],
      contraindications: [
        'Heart conditions',
        'Blood pressure medication',
        'Recent head injury',
        'Dissociative disorders'
      ]
    },
    {
      id: 'breakthrough_cultivation',
      name: 'Breakthrough Cultivation',
      category: 'meditation',
      intensity: 0.85,
      duration: 40,
      description: 'Targeted protocol for facilitating consciousness breakthroughs and integration',
      safetyLevel: 'intense',
      meditationType: 'breakthrough_cultivation',
      sacredPattern: 'flower_of_life',
      frequencyProfile: {
        carrier: 741,
        binaural: 89.0,
        sacred: 852,
        harmonic: [89, 178, 356, 741, 852]
      },
      consciousnessTargets: {
        theta_enhancement: 0.75,
        gamma_activation: 0.85,
        coherence_boost: 0.7,
        field_synchrony: 0.8
      },
      adaptiveFeatures: [
        'Breakthrough threshold detection',
        'Integration phase transitions',
        'Wisdom crystallization support',
        'Pattern recognition enhancement'
      ],
      contraindications: [
        'Unstable mood disorders',
        'Psychosis history',
        'Severe PTSD'
      ]
    },
    {
      id: 'field_harmonization',
      name: 'Field Harmonization',
      category: 'meditation',
      intensity: 0.6,
      duration: 25,
      description: 'Gentle meditation focused on consciousness field coherence and torus stabilization',
      safetyLevel: 'gentle',
      meditationType: 'field_harmonization',
      sacredPattern: 'sri_yantra',
      frequencyProfile: {
        carrier: 432,
        binaural: 4.5,
        sacred: 528,
        harmonic: [108, 216, 432, 528, 639]
      },
      consciousnessTargets: {
        theta_enhancement: 0.6,
        gamma_activation: 0.2,
        coherence_boost: 0.8,
        field_synchrony: 0.95
      },
      adaptiveFeatures: [
        'Torus field stabilization',
        'Coherence field optimization',
        'Gentle frequency transitions',
        'Field symmetry enhancement'
      ],
      contraindications: []
    }
  ];

  useEffect(() => {
    const activeProtocol = service.getActiveProtocol();
    setActiveProtocol(activeProtocol);

    const handleProtocolStart = (protocol: Protocol) => setActiveProtocol(protocol);
    const handleProtocolStop = () => setActiveProtocol(null);

    service.on('protocolStarted', handleProtocolStart);
    service.on('protocolStopped', handleProtocolStop);

    return () => {
      service.off('protocolStarted', handleProtocolStart);
      service.off('protocolStopped', handleProtocolStop);
    };
  }, [service]);

  const startProtocol = async (protocol: MeditationProtocol) => {
    try {
      await service.startProtocol(protocol);
      setSelectedProtocol(null);
    } catch (error) {
      console.error('Failed to start meditation protocol:', error);
    }
  };

  const stopCurrentProtocol = async () => {
    try {
      await service.stopProtocol();
    } catch (error) {
      console.error('Failed to stop protocol:', error);
    }
  };

  const getSafetyLevelColor = (level: string) => {
    switch (level) {
      case 'gentle': return 'text-green-400 bg-green-500/20 border-green-500/50';
      case 'moderate': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/50';
      case 'intense': return 'text-orange-400 bg-orange-500/20 border-orange-500/50';
      case 'advanced': return 'text-red-400 bg-red-500/20 border-red-500/50';
      default: return 'text-gray-400 bg-gray-500/20 border-gray-500/50';
    }
  };

  const getMeditationTypeIcon = (type: string) => {
    switch (type) {
      case 'consciousness_expansion': return '🧠';
      case 'sacred_geometry': return '🔯';
      case 'breakthrough_cultivation': return '⚡';
      case 'field_harmonization': return '🌀';
      case 'quantum_coherence': return '⚛️';
      default: return '🧘';
    }
  };

  return (
    <div className="bg-black/30 backdrop-blur-sm border border-purple-500/30 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          🔮 Advanced Meditation Protocols
        </h3>
        {activeProtocol && (
          <button
            onClick={stopCurrentProtocol}
            className="bg-red-500/20 hover:bg-red-500/40 text-red-400 px-3 py-1 rounded-lg text-sm transition-colors"
          >
            Stop Active Protocol
          </button>
        )}
      </div>

      {activeProtocol ? (
        // Active Protocol Display
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-400/50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-white flex items-center gap-2">
                {getMeditationTypeIcon((activeProtocol as MeditationProtocol).meditationType || '')}
                {activeProtocol.name}
              </h4>
              <span className={`text-xs px-2 py-1 rounded-full border ${
                getSafetyLevelColor(activeProtocol.safetyLevel)
              }`}>
                {activeProtocol.safetyLevel.toUpperCase()}
              </span>
            </div>
            <p className="text-sm text-gray-300 mb-3">{activeProtocol.description}</p>

            {/* Protocol Details for Meditation Protocols */}
            {(activeProtocol as MeditationProtocol).frequencyProfile && (
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="bg-black/20 rounded-lg p-3">
                  <h5 className="text-sm font-medium text-purple-300 mb-2">Frequency Profile</h5>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Carrier:</span>
                      <span className="text-white">{(activeProtocol as MeditationProtocol).frequencyProfile.carrier}Hz</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Binaural:</span>
                      <span className="text-white">{(activeProtocol as MeditationProtocol).frequencyProfile.binaural}Hz</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Sacred:</span>
                      <span className="text-white">{(activeProtocol as MeditationProtocol).frequencyProfile.sacred}Hz</span>
                    </div>
                  </div>
                </div>

                <div className="bg-black/20 rounded-lg p-3">
                  <h5 className="text-sm font-medium text-purple-300 mb-2">Consciousness Targets</h5>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Theta:</span>
                      <span className="text-white">{((activeProtocol as MeditationProtocol).consciousnessTargets.theta_enhancement * 100).toFixed(0)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Gamma:</span>
                      <span className="text-white">{((activeProtocol as MeditationProtocol).consciousnessTargets.gamma_activation * 100).toFixed(0)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Coherence:</span>
                      <span className="text-white">{((activeProtocol as MeditationProtocol).consciousnessTargets.coherence_boost * 100).toFixed(0)}%</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-4 pt-3 border-t border-purple-500/20">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Duration: {activeProtocol.duration} minutes</span>
                <span className="text-gray-400">Intensity: {(activeProtocol.intensity * 100).toFixed(0)}%</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        // Protocol Selection
        <div className="space-y-4">
          {selectedProtocol ? (
            // Protocol Details View
            <div className="space-y-4">
              <button
                onClick={() => setSelectedProtocol(null)}
                className="text-purple-400 hover:text-purple-300 text-sm flex items-center gap-1"
              >
                ← Back to Protocols
              </button>

              <div className="bg-black/20 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-white flex items-center gap-2">
                    {getMeditationTypeIcon(selectedProtocol.meditationType)}
                    {selectedProtocol.name}
                  </h4>
                  <span className={`text-xs px-2 py-1 rounded-full border ${
                    getSafetyLevelColor(selectedProtocol.safetyLevel)
                  }`}>
                    {selectedProtocol.safetyLevel.toUpperCase()}
                  </span>
                </div>

                <p className="text-sm text-gray-300 mb-4">{selectedProtocol.description}</p>

                {/* Detailed Protocol Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  {/* Frequency Profile */}
                  <div className="bg-black/20 rounded-lg p-3">
                    <h5 className="text-sm font-medium text-purple-300 mb-2">Frequency Profile</h5>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Carrier Frequency:</span>
                        <span className="text-white">{selectedProtocol.frequencyProfile.carrier}Hz</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Binaural Beat:</span>
                        <span className="text-white">{selectedProtocol.frequencyProfile.binaural}Hz</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Sacred Frequency:</span>
                        <span className="text-white">{selectedProtocol.frequencyProfile.sacred}Hz</span>
                      </div>
                      <div className="mt-2">
                        <span className="text-gray-400">Harmonics:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {selectedProtocol.frequencyProfile.harmonic.map((freq, i) => (
                            <span key={i} className="text-xs bg-purple-500/20 text-purple-300 px-1 rounded">
                              {freq}Hz
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Consciousness Targets */}
                  <div className="bg-black/20 rounded-lg p-3">
                    <h5 className="text-sm font-medium text-purple-300 mb-2">Consciousness Targets</h5>
                    <div className="space-y-2">
                      {Object.entries(selectedProtocol.consciousnessTargets).map(([key, value]) => (
                        <div key={key} className="flex justify-between items-center">
                          <span className="text-xs text-gray-400 capitalize">
                            {key.replace('_', ' ')}:
                          </span>
                          <div className="flex items-center gap-2">
                            <div className="w-16 bg-gray-700 rounded-full h-1">
                              <div
                                className="bg-gradient-to-r from-purple-500 to-blue-500 h-1 rounded-full"
                                style={{ width: `${value * 100}%` }}
                              />
                            </div>
                            <span className="text-xs text-white w-8">{(value * 100).toFixed(0)}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Adaptive Features */}
                {selectedProtocol.adaptiveFeatures.length > 0 && (
                  <div className="mb-4">
                    <h5 className="text-sm font-medium text-purple-300 mb-2">Adaptive Features</h5>
                    <div className="flex flex-wrap gap-2">
                      {selectedProtocol.adaptiveFeatures.map((feature, i) => (
                        <span key={i} className="text-xs bg-green-500/20 text-green-300 px-2 py-1 rounded-full">
                          ✨ {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Contraindications */}
                {selectedProtocol.contraindications.length > 0 && (
                  <div className="mb-4">
                    <h5 className="text-sm font-medium text-red-300 mb-2">Contraindications</h5>
                    <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                      <ul className="text-xs text-red-200 space-y-1">
                        {selectedProtocol.contraindications.map((item, i) => (
                          <li key={i} className="flex items-center gap-2">
                            <span className="text-red-400">⚠️</span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {/* Protocol Specs */}
                <div className="flex justify-between items-center text-sm text-gray-400 mb-4">
                  <span>Duration: {selectedProtocol.duration} minutes</span>
                  <span>Sacred Pattern: {selectedProtocol.sacredPattern.replace('_', ' ')}</span>
                  <span>Intensity: {(selectedProtocol.intensity * 100).toFixed(0)}%</span>
                </div>

                {/* Start Protocol Button */}
                <button
                  onClick={() => startProtocol(selectedProtocol)}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-all transform hover:scale-105"
                >
                  Initiate {selectedProtocol.name}
                </button>
              </div>
            </div>
          ) : (
            // Protocol List
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {advancedMeditationProtocols.map((protocol) => (
                <button
                  key={protocol.id}
                  onClick={() => setSelectedProtocol(protocol)}
                  className="w-full text-left bg-black/20 hover:bg-black/40 border border-purple-500/20 hover:border-purple-400/50 rounded-lg p-4 transition-all"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-white flex items-center gap-2">
                      {getMeditationTypeIcon(protocol.meditationType)}
                      {protocol.name}
                    </h4>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-1 rounded-full border ${
                        getSafetyLevelColor(protocol.safetyLevel)
                      }`}>
                        {protocol.safetyLevel}
                      </span>
                      <span className="text-xs text-gray-400">{protocol.duration}min</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-400 mb-2">{protocol.description}</p>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Sacred Pattern: {protocol.sacredPattern.replace('_', ' ')}</span>
                    <span>Intensity: {(protocol.intensity * 100).toFixed(0)}%</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}