"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface PrototypeComponent {
  id: string;
  name: string;
  type: 'sensor' | 'output' | 'processing';
  status: 'active' | 'inactive' | 'connecting';
  cost: number;
  data?: any;
}

interface ConsciousnessMetrics {
  heartRate: number;
  hrv: number;
  coherence: number;
  stress: number;
  energy: number;
  attention: number;
  environmentalScore: number;
}

interface ProtocolExecution {
  id: string;
  name: string;
  description: string;
  duration: number;
  progress: number;
  activeOutputs: string[];
  targetMetrics: string[];
}

export function PrototypeDemo() {
  const [components, setComponents] = useState<PrototypeComponent[]>([
    // Sensors
    { id: 'heartmath', name: 'HeartMath Inner Balance', type: 'sensor', status: 'inactive', cost: 179 },
    { id: 'arduino', name: 'Arduino Environmental', type: 'sensor', status: 'inactive', cost: 45 },
    { id: 'pulse_sensor', name: 'DIY Pulse Sensor', type: 'sensor', status: 'inactive', cost: 25 },

    // Outputs
    { id: 'speakers', name: '4x Bluetooth Speakers', type: 'output', status: 'inactive', cost: 120 },
    { id: 'hue_lights', name: 'Philips Hue System', type: 'output', status: 'inactive', cost: 150 },
    { id: 'haptic', name: 'Haptic Feedback Array', type: 'output', status: 'inactive', cost: 80 },

    // Processing
    { id: 'raspberry_pi', name: 'Raspberry Pi 4', type: 'processing', status: 'inactive', cost: 90 },
    { id: 'maia_software', name: 'MAIA Integration', type: 'processing', status: 'inactive', cost: 0 }
  ]);

  const [metrics, setMetrics] = useState<ConsciousnessMetrics>({
    heartRate: 72,
    hrv: 45,
    coherence: 0.65,
    stress: 0.3,
    energy: 0.7,
    attention: 0.6,
    environmentalScore: 0.8
  });

  const [activeProtocol, setActiveProtocol] = useState<ProtocolExecution | null>(null);
  const [isSystemActive, setIsSystemActive] = useState(false);
  const [buildPhase, setBuildPhase] = useState<'planning' | 'building' | 'testing' | 'demonstrating'>('planning');

  const protocols = [
    {
      id: 'coherence_training',
      name: 'Heart Coherence Training',
      description: 'HRV-guided breathing with synchronized audio and lighting',
      duration: 10,
      activeOutputs: ['speakers', 'hue_lights'],
      targetMetrics: ['coherence', 'stress']
    },
    {
      id: 'focus_enhancement',
      name: 'Focus Enhancement Protocol',
      description: 'Environmental optimization with attention feedback',
      duration: 15,
      activeOutputs: ['speakers', 'hue_lights', 'haptic'],
      targetMetrics: ['attention', 'energy']
    },
    {
      id: 'stress_release',
      name: 'Stress Release Session',
      description: 'Multi-modal relaxation with real-time adaptation',
      duration: 20,
      activeOutputs: ['speakers', 'hue_lights', 'haptic'],
      targetMetrics: ['stress', 'coherence']
    }
  ];

  // Simulate real-time data when system is active
  useEffect(() => {
    if (!isSystemActive) return;

    const interval = setInterval(() => {
      setMetrics(prev => ({
        heartRate: Math.max(60, Math.min(100, prev.heartRate + (Math.random() - 0.5) * 4)),
        hrv: Math.max(20, Math.min(80, prev.hrv + (Math.random() - 0.5) * 8)),
        coherence: Math.max(0.2, Math.min(1, prev.coherence + (Math.random() - 0.5) * 0.1)),
        stress: Math.max(0, Math.min(1, prev.stress + (Math.random() - 0.5) * 0.05)),
        energy: Math.max(0.3, Math.min(1, prev.energy + (Math.random() - 0.5) * 0.04)),
        attention: Math.max(0.2, Math.min(1, prev.attention + (Math.random() - 0.5) * 0.06)),
        environmentalScore: Math.max(0.5, Math.min(1, prev.environmentalScore + (Math.random() - 0.5) * 0.02))
      }));

      // Update active protocol progress
      if (activeProtocol) {
        setActiveProtocol(prev => prev ? {
          ...prev,
          progress: Math.min(100, prev.progress + 1)
        } : null);
      }
    }, 500);

    return () => clearInterval(interval);
  }, [isSystemActive, activeProtocol]);

  const activateComponent = (componentId: string) => {
    setComponents(prev => prev.map(comp =>
      comp.id === componentId
        ? { ...comp, status: comp.status === 'active' ? 'inactive' : 'connecting' }
        : comp
    ));

    // Simulate connection process
    setTimeout(() => {
      setComponents(prev => prev.map(comp =>
        comp.id === componentId && comp.status === 'connecting'
          ? { ...comp, status: 'active', data: generateMockData(comp.type) }
          : comp
      ));
    }, 2000);
  };

  const generateMockData = (type: string) => {
    switch (type) {
      case 'sensor':
        return {
          readings: Math.floor(Math.random() * 100),
          quality: Math.random() * 0.3 + 0.7,
          lastUpdate: Date.now()
        };
      case 'output':
        return {
          intensity: Math.random() * 0.5 + 0.5,
          frequency: Math.random() * 40 + 10,
          pattern: ['steady', 'pulsing', 'breathing'][Math.floor(Math.random() * 3)]
        };
      default:
        return { status: 'operational' };
    }
  };

  const startProtocol = (protocolId: string) => {
    const protocol = protocols.find(p => p.id === protocolId);
    if (!protocol) return;

    setActiveProtocol({
      ...protocol,
      progress: 0
    });

    // Activate required components
    setComponents(prev => prev.map(comp =>
      protocol.activeOutputs.includes(comp.id) || comp.type === 'sensor'
        ? { ...comp, status: 'active' }
        : comp
    ));

    setIsSystemActive(true);
  };

  const stopProtocol = () => {
    setActiveProtocol(null);
    setIsSystemActive(false);
  };

  const getTotalCost = () => {
    return components.reduce((total, comp) => total + comp.cost, 0);
  };

  const getActiveCost = () => {
    return components
      .filter(comp => comp.status === 'active')
      .reduce((total, comp) => total + comp.cost, 0);
  };

  const getComponentIcon = (type: string) => {
    switch (type) {
      case 'sensor': return '📡';
      case 'output': return '🔊';
      case 'processing': return '🧠';
      default: return '⚡';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-400 bg-green-500/20 border-green-500/30';
      case 'connecting': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
      case 'inactive': return 'text-gray-400 bg-gray-500/10 border-gray-500/20';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-4">
            🛠️ MAIA Consciousness Interface Prototype
          </h1>
          <p className="text-xl text-white/70 mb-2">
            Build Your Own Multi-Modal System with Existing Hardware
          </p>
          <div className="flex justify-center gap-6 text-sm">
            <div className="text-green-400">
              Total Cost: ${getTotalCost().toLocaleString()}
            </div>
            <div className="text-blue-400">
              Active Components: ${getActiveCost().toLocaleString()}
            </div>
            <div className="text-purple-400">
              Build Time: 2-4 weeks
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Component Management */}
          <div className="lg:col-span-1 space-y-6">
            {/* Build Phase */}
            <div className="bg-black/20 backdrop-blur-md rounded-2xl p-6 border border-white/10">
              <h3 className="text-xl font-semibold text-white mb-4">Build Progress</h3>
              <div className="space-y-3">
                {(['planning', 'building', 'testing', 'demonstrating'] as const).map((phase, index) => (
                  <motion.button
                    key={phase}
                    onClick={() => setBuildPhase(phase)}
                    className={`w-full p-3 rounded-lg text-left transition-all ${
                      buildPhase === phase
                        ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                        : 'bg-white/5 text-white/60 hover:bg-white/10'
                    }`}
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">
                        {phase === 'planning' && '📋'}
                        {phase === 'building' && '🔧'}
                        {phase === 'testing' && '🧪'}
                        {phase === 'demonstrating' && '🎯'}
                      </span>
                      <div>
                        <div className="font-medium capitalize">{phase}</div>
                        <div className="text-xs opacity-80">
                          {phase === 'planning' && 'Component selection & ordering'}
                          {phase === 'building' && 'Assembly & integration'}
                          {phase === 'testing' && 'Calibration & validation'}
                          {phase === 'demonstrating' && 'Live system operation'}
                        </div>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Component List */}
            <div className="bg-black/20 backdrop-blur-md rounded-2xl p-6 border border-white/10">
              <h3 className="text-xl font-semibold text-white mb-4">
                System Components ({components.filter(c => c.status === 'active').length}/{components.length} Active)
              </h3>
              <div className="space-y-3">
                {components.map((component) => (
                  <motion.div
                    key={component.id}
                    className={`p-3 rounded-lg border transition-all cursor-pointer ${getStatusColor(component.status)}`}
                    onClick={() => buildPhase === 'demonstrating' && activateComponent(component.id)}
                    whileHover={{ scale: buildPhase === 'demonstrating' ? 1.02 : 1 }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{getComponentIcon(component.type)}</span>
                        <div>
                          <div className="text-sm font-medium">{component.name}</div>
                          <div className="text-xs opacity-80 capitalize">
                            {component.type} • ${component.cost}
                          </div>
                        </div>
                      </div>
                      <div className="text-xs">
                        {component.status === 'connecting' && (
                          <div className="animate-spin w-3 h-3 border-2 border-current border-t-transparent rounded-full"></div>
                        )}
                        {component.status === 'active' && '●'}
                        {component.status === 'inactive' && '○'}
                      </div>
                    </div>

                    {component.status === 'active' && component.data && (
                      <div className="mt-2 text-xs opacity-70">
                        {component.type === 'sensor' && `Signal: ${(component.data.quality * 100).toFixed(0)}%`}
                        {component.type === 'output' && `Active: ${component.data.pattern}`}
                        {component.type === 'processing' && 'Processing data...'}
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Main Dashboard */}
          <div className="lg:col-span-2 space-y-6">
            {/* Real-time Consciousness Metrics */}
            {isSystemActive && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-r from-green-500/10 to-blue-500/10 rounded-2xl p-6 border border-green-500/20"
              >
                <h3 className="text-xl font-semibold text-white mb-4">
                  🧠 Live Consciousness Metrics
                </h3>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-400">
                      {(metrics.coherence * 100).toFixed(0)}%
                    </div>
                    <div className="text-xs text-white/60">Coherence</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-400">
                      {metrics.heartRate}
                    </div>
                    <div className="text-xs text-white/60">Heart Rate</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-400">
                      {metrics.hrv}
                    </div>
                    <div className="text-xs text-white/60">HRV Score</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-amber-400">
                      {(metrics.attention * 100).toFixed(0)}%
                    </div>
                    <div className="text-xs text-white/60">Attention</div>
                  </div>
                </div>

                <div className="mt-4 bg-green-500/10 rounded-lg p-3 border border-green-500/20">
                  <div className="text-center text-green-400 font-medium text-sm">
                    🌊 Multi-Modal Consciousness Interface Active
                  </div>
                  <div className="text-center text-white/70 text-xs mt-1">
                    Real-time biofeedback with synchronized audio, lighting, and haptic response
                  </div>
                </div>
              </motion.div>
            )}

            {/* Active Protocol */}
            {activeProtocol && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-2xl p-6 border border-purple-500/30"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-white">🎯 Active Protocol</h3>
                  <motion.button
                    onClick={stopProtocol}
                    className="px-3 py-1 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg text-xs hover:bg-red-500/30"
                    whileHover={{ scale: 1.05 }}
                  >
                    Stop
                  </motion.button>
                </div>

                <div>
                  <div className="font-medium text-white mb-1">{activeProtocol.name}</div>
                  <div className="text-white/70 text-sm mb-3">{activeProtocol.description}</div>

                  <div className="mb-3">
                    <div className="flex justify-between text-xs text-white/60 mb-1">
                      <span>Progress</span>
                      <span>{activeProtocol.progress.toFixed(0)}% • {Math.ceil((100 - activeProtocol.progress) * activeProtocol.duration / 100)} min remaining</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2">
                      <motion.div
                        className="bg-gradient-to-r from-purple-400 to-blue-400 h-2 rounded-full"
                        animate={{ width: `${activeProtocol.progress}%` }}
                        transition={{ duration: 0.5 }}
                      />
                    </div>
                  </div>

                  <div className="text-xs text-white/60 mb-2">
                    Active Outputs: {activeProtocol.activeOutputs.map(output =>
                      components.find(c => c.id === output)?.name.split(' ')[0]
                    ).join(', ')}
                  </div>
                  <div className="text-xs text-white/60">
                    Target Metrics: {activeProtocol.targetMetrics.join(', ')}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Available Protocols */}
            <div className="bg-black/20 backdrop-blur-md rounded-2xl p-6 border border-white/10">
              <h3 className="text-xl font-semibold text-white mb-4">
                🎼 Consciousness Training Protocols
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {protocols.map((protocol) => {
                  const activeComponents = components.filter(c =>
                    c.status === 'active' && (
                      c.type === 'sensor' || protocol.activeOutputs.includes(c.id)
                    )
                  ).length;
                  const requiredComponents = protocol.activeOutputs.length + 2; // sensors + outputs
                  const canRun = activeComponents >= requiredComponents && buildPhase === 'demonstrating';

                  return (
                    <motion.div
                      key={protocol.id}
                      className={`p-4 rounded-lg border ${
                        canRun && !activeProtocol
                          ? 'bg-white/5 border-white/20 hover:bg-white/10 cursor-pointer'
                          : 'bg-white/2 border-white/5'
                      }`}
                      whileHover={canRun && !activeProtocol ? { scale: 1.02 } : {}}
                    >
                      <div className="font-medium text-white text-sm mb-2">{protocol.name}</div>
                      <div className="text-white/60 text-xs mb-3">{protocol.description}</div>

                      <div className="flex justify-between items-center text-xs mb-3">
                        <span className="text-white/50">{protocol.duration} min</span>
                        <span className={`${canRun ? 'text-green-400' : 'text-red-400'}`}>
                          {activeComponents}/{requiredComponents} ready
                        </span>
                      </div>

                      <motion.button
                        onClick={() => canRun && !activeProtocol && startProtocol(protocol.id)}
                        disabled={!canRun || !!activeProtocol}
                        className={`w-full px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                          canRun && !activeProtocol
                            ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30 hover:bg-blue-500/30'
                            : 'bg-white/5 text-white/30 border border-white/10 cursor-not-allowed'
                        }`}
                        whileHover={canRun && !activeProtocol ? { scale: 1.05 } : {}}
                        whileTap={canRun && !activeProtocol ? { scale: 0.95 } : {}}
                      >
                        {activeProtocol ? 'Protocol Running' :
                         canRun ? 'Start Protocol' :
                         buildPhase !== 'demonstrating' ? 'Complete Build First' : 'Activate Components'}
                      </motion.button>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Build Instructions */}
            {buildPhase === 'planning' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-blue-500/10 rounded-2xl p-6 border border-blue-500/20"
              >
                <h3 className="text-xl font-semibold text-white mb-4">📋 Getting Started</h3>

                <div className="space-y-4">
                  <div className="bg-white/5 rounded-lg p-4">
                    <h4 className="font-medium text-blue-400 mb-2">Minimal Viable Prototype ($400)</h4>
                    <div className="text-sm text-white/70 mb-2">
                      • Arduino + Pulse Sensor + 2x Speakers + Hue Lights
                    </div>
                    <div className="text-xs text-white/60">
                      Basic HRV monitoring, 2-channel spatial audio, smart lighting response
                    </div>
                  </div>

                  <div className="bg-white/5 rounded-lg p-4">
                    <h4 className="font-medium text-green-400 mb-2">Full Featured System ($1200)</h4>
                    <div className="text-sm text-white/70 mb-2">
                      • All components + Haptic feedback + Advanced sensors
                    </div>
                    <div className="text-xs text-white/60">
                      Complete neuropod functionality at prototype scale
                    </div>
                  </div>

                  <div className="bg-amber-500/10 rounded-lg p-4 border border-amber-500/20">
                    <div className="font-medium text-amber-400 mb-2">⚡ Quick Start</div>
                    <div className="text-sm text-white/80">
                      Order components → Set up Raspberry Pi → Connect sensors → Build MAIA integration → Test protocols
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}