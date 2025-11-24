"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TechEvolution {
  phase: string;
  year: string;
  technologies: string[];
  capabilities: string[];
  aiIntegration: string;
  costRange: string;
}

interface ModularComponent {
  id: string;
  name: string;
  category: 'sensor' | 'processing' | 'output' | 'ai' | 'integration';
  currentTech: string;
  futureTech: string[];
  upgradeability: 'direct' | 'modular' | 'platform';
  status: 'available' | 'development' | 'research';
}

export function FutureProofEvolution() {
  const [selectedPhase, setSelectedPhase] = useState(0);
  const [hoveredComponent, setHoveredComponent] = useState<string | null>(null);

  const evolutionPhases: TechEvolution[] = [
    {
      phase: "Foundation",
      year: "2025",
      technologies: ["HeartMath HRV", "Mendi EEG", "HUSO Sound", "Arduino", "Bluetooth"],
      capabilities: ["HRV Coherence", "Focus Training", "Sound Therapy", "Basic Biofeedback"],
      aiIntegration: "Pattern Recognition & Adaptive Protocols",
      costRange: "$800 - $2,000"
    },
    {
      phase: "Integration",
      year: "2026",
      technologies: ["Multi-Modal Sensors", "Edge AI", "5G/WiFi 6", "Custom PCBs", "Cloud Sync"],
      capabilities: ["Real-time Multi-Modal", "Predictive Analytics", "Personalized Sessions", "Remote Monitoring"],
      aiIntegration: "Machine Learning Models & Behavioral Prediction",
      costRange: "$3,000 - $8,000"
    },
    {
      phase: "Advanced",
      year: "2027-28",
      technologies: ["fNIRS Brain Imaging", "Haptic Arrays", "Spatial Audio", "Neural Networks", "Quantum Sensors"],
      capabilities: ["Consciousness Mapping", "Immersive Experiences", "Advanced Biomarkers", "Group Sessions"],
      aiIntegration: "Deep Learning & Consciousness State Recognition",
      costRange: "$15,000 - $50,000"
    },
    {
      phase: "Transcendent",
      year: "2029+",
      technologies: ["Direct Neural Interface", "Quantum Computing", "Holographic Display", "AGI Integration"],
      capabilities: ["Direct Consciousness Access", "Reality Synthesis", "Collective Intelligence", "Transcendent States"],
      aiIntegration: "Artificial General Intelligence & Consciousness Co-evolution",
      costRange: "$100,000+"
    }
  ];

  const modularComponents: ModularComponent[] = [
    {
      id: "bioSensors",
      name: "Biological Sensors",
      category: "sensor",
      currentTech: "HeartMath, Pulse Sensors",
      futureTech: ["fNIRS", "EEG Arrays", "Neural Implants"],
      upgradeability: "modular",
      status: "available"
    },
    {
      id: "aiProcessing",
      name: "AI Processing Unit",
      category: "ai",
      currentTech: "Raspberry Pi, Pattern Recognition",
      futureTech: ["Edge TPU", "Quantum Processors", "AGI Integration"],
      upgradeability: "direct",
      status: "available"
    },
    {
      id: "audioSystem",
      name: "Spatial Audio Array",
      category: "output",
      currentTech: "Bluetooth Speakers, HUSO",
      futureTech: ["Ultrasonic Arrays", "Neural Audio", "Quantum Sound"],
      upgradeability: "modular",
      status: "available"
    },
    {
      id: "visualization",
      name: "Consciousness Display",
      category: "output",
      currentTech: "LED Arrays, Mobile Apps",
      futureTech: ["AR/VR", "Holographic", "Direct Visual Cortex"],
      upgradeability: "platform",
      status: "development"
    },
    {
      id: "integration",
      name: "Device Integration Hub",
      category: "integration",
      currentTech: "Universal APIs, Bluetooth",
      futureTech: ["Neural Networks", "Quantum Entanglement", "Consciousness Bridges"],
      upgradeability: "platform",
      status: "available"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white overflow-hidden">
      {/* Header */}
      <div className="container mx-auto px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
            🚀 Future-Proof Evolution Architecture
          </h1>
          <p className="text-xl text-blue-200 max-w-4xl mx-auto">
            Modular consciousness interface system designed to evolve with advancing technology and AI
          </p>
        </motion.div>

        {/* Evolution Timeline */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12">
          {evolutionPhases.map((phase, index) => (
            <motion.div
              key={phase.phase}
              className={`relative p-6 rounded-xl border-2 cursor-pointer transition-all duration-300 ${
                selectedPhase === index
                  ? 'border-cyan-400 bg-cyan-500/20'
                  : 'border-blue-500/30 bg-blue-500/10 hover:border-purple-400'
              }`}
              onClick={() => setSelectedPhase(index)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="text-center">
                <h3 className="text-xl font-bold mb-2 text-cyan-300">{phase.phase}</h3>
                <p className="text-sm text-blue-200 mb-4">{phase.year}</p>
                <p className="text-xs text-green-300 font-medium">{phase.costRange}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Selected Phase Details */}
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedPhase}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="bg-black/30 backdrop-blur-sm rounded-2xl p-8 mb-12"
          >
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-2xl font-bold mb-4 text-cyan-300">
                  {evolutionPhases[selectedPhase].phase} Phase - {evolutionPhases[selectedPhase].year}
                </h3>

                <div className="mb-6">
                  <h4 className="text-lg font-semibold mb-3 text-purple-300">Technologies</h4>
                  <div className="grid grid-cols-1 gap-2">
                    {evolutionPhases[selectedPhase].technologies.map((tech, i) => (
                      <motion.div
                        key={tech}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="flex items-center space-x-2 text-blue-200"
                      >
                        <span className="w-2 h-2 bg-cyan-400 rounded-full"></span>
                        <span>{tech}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-semibold mb-3 text-purple-300">Capabilities</h4>
                  <div className="grid grid-cols-1 gap-2">
                    {evolutionPhases[selectedPhase].capabilities.map((capability, i) => (
                      <motion.div
                        key={capability}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="flex items-center space-x-2 text-green-200"
                      >
                        <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                        <span>{capability}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-lg font-semibold mb-3 text-purple-300">AI Integration</h4>
                <div className="bg-purple-500/20 rounded-lg p-4 mb-6">
                  <p className="text-purple-100">{evolutionPhases[selectedPhase].aiIntegration}</p>
                </div>

                <h4 className="text-lg font-semibold mb-3 text-purple-300">Investment Range</h4>
                <div className="bg-green-500/20 rounded-lg p-4">
                  <p className="text-2xl font-bold text-green-300">{evolutionPhases[selectedPhase].costRange}</p>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Modular Components */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-8 text-center text-cyan-300">Modular Component Evolution</h2>

          <div className="grid md:grid-cols-5 gap-6">
            {modularComponents.map((component) => (
              <motion.div
                key={component.id}
                className={`relative p-6 rounded-xl border-2 transition-all duration-300 ${
                  hoveredComponent === component.id
                    ? 'border-cyan-400 bg-cyan-500/20 scale-105'
                    : 'border-blue-500/30 bg-blue-500/10'
                }`}
                onMouseEnter={() => setHoveredComponent(component.id)}
                onMouseLeave={() => setHoveredComponent(null)}
                whileHover={{ y: -5 }}
              >
                <div className="text-center mb-4">
                  <h3 className="text-lg font-bold text-cyan-300 mb-2">{component.name}</h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    component.status === 'available' ? 'bg-green-500/20 text-green-300' :
                    component.status === 'development' ? 'bg-yellow-500/20 text-yellow-300' :
                    'bg-purple-500/20 text-purple-300'
                  }`}>
                    {component.status}
                  </span>
                </div>

                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-purple-300 mb-2">Current</h4>
                  <p className="text-xs text-blue-200">{component.currentTech}</p>
                </div>

                {hoveredComponent === component.id && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-3"
                  >
                    <div>
                      <h4 className="text-sm font-semibold text-purple-300 mb-2">Future Tech</h4>
                      {component.futureTech.map((tech, i) => (
                        <p key={tech} className="text-xs text-green-200">• {tech}</p>
                      ))}
                    </div>

                    <div className="text-center">
                      <span className={`px-2 py-1 rounded text-xs ${
                        component.upgradeability === 'direct' ? 'bg-green-500/20 text-green-300' :
                        component.upgradeability === 'modular' ? 'bg-blue-500/20 text-blue-300' :
                        'bg-purple-500/20 text-purple-300'
                      }`}>
                        {component.upgradeability} upgrade
                      </span>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Evolution Pathways */}
        <div className="bg-black/30 backdrop-blur-sm rounded-2xl p-8">
          <h2 className="text-3xl font-bold mb-8 text-center text-cyan-300">Evolution Pathways</h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <h3 className="text-xl font-bold mb-4 text-purple-300">🔄 Direct Upgrade</h3>
              <p className="text-blue-200 mb-4">
                Core processing units can be directly replaced with more powerful versions while maintaining all existing connections.
              </p>
              <ul className="text-sm text-green-200 space-y-1">
                <li>• Raspberry Pi → Edge TPU</li>
                <li>• Pattern AI → Neural Networks</li>
                <li>• Local → Cloud Hybrid</li>
              </ul>
            </div>

            <div className="text-center">
              <h3 className="text-xl font-bold mb-4 text-purple-300">🧩 Modular Extension</h3>
              <p className="text-blue-200 mb-4">
                Add new sensor arrays and output systems without replacing existing components.
              </p>
              <ul className="text-sm text-green-200 space-y-1">
                <li>• Add fNIRS to existing EEG</li>
                <li>• Expand speaker arrays</li>
                <li>• Integrate new biometrics</li>
              </ul>
            </div>

            <div className="text-center">
              <h3 className="text-xl font-bold mb-4 text-purple-300">🚀 Platform Evolution</h3>
              <p className="text-blue-200 mb-4">
                Entire system categories evolve together while maintaining backward compatibility.
              </p>
              <ul className="text-sm text-green-200 space-y-1">
                <li>• Mobile → AR/VR → Neural</li>
                <li>• Bluetooth → 5G → Quantum</li>
                <li>• Individual → Collective</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Future-Proofing Guarantee */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-12 text-center bg-gradient-to-r from-purple-500/20 to-cyan-500/20 rounded-2xl p-8"
        >
          <h2 className="text-2xl font-bold mb-4 text-cyan-300">🛡️ Future-Proofing Guarantee</h2>
          <p className="text-lg text-blue-200 max-w-3xl mx-auto">
            Every component is designed with open standards, modular interfaces, and evolutionary pathways.
            Your investment grows with advancing technology rather than becoming obsolete.
          </p>
        </motion.div>
      </div>
    </div>
  );
}