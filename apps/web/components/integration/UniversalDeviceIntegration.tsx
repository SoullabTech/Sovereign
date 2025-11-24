"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ConnectedDevice {
  id: string;
  name: string;
  type: 'hrv' | 'eeg' | 'sound' | 'wearable' | 'environmental';
  status: 'connected' | 'connecting' | 'disconnected';
  data: any;
  battery?: number;
  signalStrength?: number;
}

interface ConsciousnessMetrics {
  overallCoherence: number;
  heartCoherence: number;
  brainState: 'delta' | 'theta' | 'alpha' | 'beta' | 'gamma';
  stressLevel: number;
  attentionLevel: number;
  energyLevel: number;
}

interface ActiveProtocol {
  id: string;
  name: string;
  description: string;
  duration: number;
  progress: number;
  deviceTargets: string[];
}

export function UniversalDeviceIntegration() {
  const [connectedDevices, setConnectedDevices] = useState<ConnectedDevice[]>([]);
  const [availableDevices] = useState<ConnectedDevice[]>([
    {
      id: 'heartmath',
      name: 'HeartMath Inner Balance',
      type: 'hrv',
      status: 'disconnected',
      data: null
    },
    {
      id: 'mendi',
      name: 'Mendi Neurofeedback',
      type: 'eeg',
      status: 'disconnected',
      data: null
    },
    {
      id: 'huso',
      name: 'HUSO Sound Therapy',
      type: 'sound',
      status: 'disconnected',
      data: null
    },
    {
      id: 'applewatch',
      name: 'Apple Watch',
      type: 'wearable',
      status: 'disconnected',
      data: null
    },
    {
      id: 'oura',
      name: 'Oura Ring',
      type: 'wearable',
      status: 'disconnected',
      data: null
    },
    {
      id: 'philipshue',
      name: 'Philips Hue Lights',
      type: 'environmental',
      status: 'disconnected',
      data: null
    }
  ]);

  const [consciousnessMetrics, setConsciousnessMetrics] = useState<ConsciousnessMetrics>({
    overallCoherence: 0.65,
    heartCoherence: 0.72,
    brainState: 'alpha',
    stressLevel: 0.3,
    attentionLevel: 0.68,
    energyLevel: 0.75
  });

  const [activeProtocol, setActiveProtocol] = useState<ActiveProtocol | null>(null);
  const [availableProtocols] = useState<Omit<ActiveProtocol, 'progress'>[]>([
    {
      id: 'coherence_boost',
      name: 'Heart-Brain Coherence Boost',
      description: 'Synchronized HRV training with visual and audio feedback',
      duration: 15,
      deviceTargets: ['heartmath', 'philipshue', 'huso']
    },
    {
      id: 'focus_enhancement',
      name: 'Attention & Focus Enhancement',
      description: 'EEG neurofeedback with environmental optimization',
      duration: 20,
      deviceTargets: ['mendi', 'applewatch', 'philipshue']
    },
    {
      id: 'stress_release',
      name: 'Deep Stress Release Protocol',
      description: 'Multi-modal relaxation with sound therapy and HRV',
      duration: 25,
      deviceTargets: ['heartmath', 'huso', 'philipshue', 'oura']
    },
    {
      id: 'energy_optimization',
      name: 'Energy & Vitality Optimization',
      description: 'Circadian rhythm sync with wearable data integration',
      duration: 30,
      deviceTargets: ['applewatch', 'oura', 'philipshue']
    }
  ]);

  // Simulate real-time data updates
  useEffect(() => {
    const interval = setInterval(() => {
      if (connectedDevices.length > 0) {
        // Update consciousness metrics based on connected devices
        setConsciousnessMetrics(prev => ({
          overallCoherence: Math.max(0, Math.min(1, prev.overallCoherence + (Math.random() - 0.5) * 0.1)),
          heartCoherence: Math.max(0, Math.min(1, prev.heartCoherence + (Math.random() - 0.5) * 0.08)),
          brainState: ['delta', 'theta', 'alpha', 'beta', 'gamma'][Math.floor(Math.random() * 5)] as any,
          stressLevel: Math.max(0, Math.min(1, prev.stressLevel + (Math.random() - 0.5) * 0.05)),
          attentionLevel: Math.max(0, Math.min(1, prev.attentionLevel + (Math.random() - 0.5) * 0.06)),
          energyLevel: Math.max(0, Math.min(1, prev.energyLevel + (Math.random() - 0.5) * 0.04))
        }));

        // Update active protocol progress
        if (activeProtocol) {
          setActiveProtocol(prev => prev ? {
            ...prev,
            progress: Math.min(100, prev.progress + 0.5)
          } : null);
        }
      }
    }, 500);

    return () => clearInterval(interval);
  }, [connectedDevices, activeProtocol]);

  const connectDevice = async (deviceId: string) => {
    const device = availableDevices.find(d => d.id === deviceId);
    if (!device) return;

    // Simulate connection process
    setConnectedDevices(prev => [...prev, { ...device, status: 'connecting' }]);

    setTimeout(() => {
      setConnectedDevices(prev => prev.map(d =>
        d.id === deviceId ? {
          ...d,
          status: 'connected',
          battery: Math.floor(Math.random() * 40) + 60,
          signalStrength: Math.floor(Math.random() * 30) + 70,
          data: generateMockData(device.type)
        } : d
      ));
    }, 2000);
  };

  const disconnectDevice = (deviceId: string) => {
    setConnectedDevices(prev => prev.filter(d => d.id !== deviceId));
  };

  const generateMockData = (type: ConnectedDevice['type']) => {
    switch (type) {
      case 'hrv':
        return {
          heartRate: Math.floor(Math.random() * 20) + 65,
          hrv: Math.floor(Math.random() * 50) + 40,
          coherence: Math.random() * 0.4 + 0.6
        };
      case 'eeg':
        return {
          attention: Math.random() * 0.3 + 0.5,
          meditation: Math.random() * 0.4 + 0.4,
          bloodFlow: Math.random() * 0.2 + 0.7
        };
      case 'wearable':
        return {
          steps: Math.floor(Math.random() * 5000) + 3000,
          activity: Math.random() * 0.3 + 0.5,
          recovery: Math.random() * 0.4 + 0.4
        };
      default:
        return {};
    }
  };

  const startProtocol = (protocolId: string) => {
    const protocol = availableProtocols.find(p => p.id === protocolId);
    if (!protocol) return;

    setActiveProtocol({
      ...protocol,
      progress: 0
    });
  };

  const stopProtocol = () => {
    setActiveProtocol(null);
  };

  const getDeviceIcon = (type: ConnectedDevice['type']) => {
    switch (type) {
      case 'hrv': return '💓';
      case 'eeg': return '🧠';
      case 'sound': return '🔊';
      case 'wearable': return '⌚';
      case 'environmental': return '💡';
      default: return '📱';
    }
  };

  const getStatusColor = (status: ConnectedDevice['status']) => {
    switch (status) {
      case 'connected': return 'text-green-400';
      case 'connecting': return 'text-yellow-400';
      case 'disconnected': return 'text-gray-400';
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
            🔗 MAIA Universal Integration Platform
          </h1>
          <p className="text-xl text-white/70 mb-2">
            Connect Any Consciousness Technology Device
          </p>
          <p className="text-white/60">
            HeartMath • Mendi • HUSO • Apple Watch • Oura • Smart Home & More
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Device Management */}
          <div className="lg:col-span-1 space-y-6">
            {/* Available Devices */}
            <div className="bg-black/20 backdrop-blur-md rounded-2xl p-6 border border-white/10">
              <h3 className="text-xl font-semibold text-white mb-4">Available Devices</h3>
              <div className="space-y-3">
                {availableDevices.map((device) => {
                  const isConnected = connectedDevices.some(d => d.id === device.id);
                  return (
                    <motion.div
                      key={device.id}
                      className="flex items-center justify-between p-3 bg-white/5 rounded-lg"
                      whileHover={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{getDeviceIcon(device.type)}</span>
                        <div>
                          <div className="text-white font-medium text-sm">{device.name}</div>
                          <div className="text-white/60 text-xs capitalize">{device.type}</div>
                        </div>
                      </div>
                      {!isConnected ? (
                        <motion.button
                          onClick={() => connectDevice(device.id)}
                          className="px-3 py-1 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-lg text-xs hover:bg-blue-500/30"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          Connect
                        </motion.button>
                      ) : (
                        <div className="text-green-400 text-xs">Connected</div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Connected Devices */}
            <div className="bg-black/20 backdrop-blur-md rounded-2xl p-6 border border-white/10">
              <h3 className="text-xl font-semibold text-white mb-4">
                Connected Devices ({connectedDevices.length})
              </h3>
              <div className="space-y-3">
                {connectedDevices.map((device) => (
                  <motion.div
                    key={device.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="p-3 bg-gradient-to-r from-green-500/10 to-blue-500/10 rounded-lg border border-green-500/20"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{getDeviceIcon(device.type)}</span>
                        <div>
                          <div className="text-white font-medium text-sm">{device.name}</div>
                          <div className={`text-xs ${getStatusColor(device.status)}`}>
                            {device.status}
                          </div>
                        </div>
                      </div>
                      <motion.button
                        onClick={() => disconnectDevice(device.id)}
                        className="text-red-400 hover:text-red-300 text-xs"
                        whileHover={{ scale: 1.1 }}
                      >
                        ✕
                      </motion.button>
                    </div>

                    {device.status === 'connected' && device.battery && (
                      <div className="flex justify-between text-xs text-white/60">
                        <span>Battery: {device.battery}%</span>
                        <span>Signal: {device.signalStrength}%</span>
                      </div>
                    )}

                    {device.status === 'connecting' && (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin w-3 h-3 border-2 border-yellow-400 border-t-transparent rounded-full"></div>
                        <span className="text-yellow-400 text-xs">Connecting...</span>
                      </div>
                    )}
                  </motion.div>
                ))}

                {connectedDevices.length === 0 && (
                  <div className="text-center text-white/50 py-8">
                    <div className="text-4xl mb-2">🔗</div>
                    <div className="text-sm">No devices connected</div>
                    <div className="text-xs">Connect devices to start</div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Main Dashboard */}
          <div className="lg:col-span-2 space-y-6">
            {/* Consciousness Metrics */}
            <div className="bg-black/20 backdrop-blur-md rounded-2xl p-6 border border-white/10">
              <h3 className="text-xl font-semibold text-white mb-4">
                🧠 Unified Consciousness Metrics
              </h3>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">
                    {(consciousnessMetrics.overallCoherence * 100).toFixed(0)}%
                  </div>
                  <div className="text-xs text-white/60">Overall Coherence</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-400">
                    {(consciousnessMetrics.heartCoherence * 100).toFixed(0)}%
                  </div>
                  <div className="text-xs text-white/60">Heart Coherence</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-400 capitalize">
                    {consciousnessMetrics.brainState}
                  </div>
                  <div className="text-xs text-white/60">Brain State</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-400">
                    {(consciousnessMetrics.stressLevel * 100).toFixed(0)}%
                  </div>
                  <div className="text-xs text-white/60">Stress Level</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-amber-400">
                    {(consciousnessMetrics.attentionLevel * 100).toFixed(0)}%
                  </div>
                  <div className="text-xs text-white/60">Attention</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-cyan-400">
                    {(consciousnessMetrics.energyLevel * 100).toFixed(0)}%
                  </div>
                  <div className="text-xs text-white/60">Energy</div>
                </div>
              </div>

              {connectedDevices.length > 0 && (
                <div className="bg-gradient-to-r from-green-500/10 to-blue-500/10 rounded-lg p-4 border border-green-500/20">
                  <div className="text-center text-green-400 font-medium text-sm">
                    🌊 Multi-Device Consciousness Fusion Active
                  </div>
                  <div className="text-center text-white/70 text-xs mt-1">
                    Real-time data integration from {connectedDevices.length} device{connectedDevices.length !== 1 ? 's' : ''}
                  </div>
                </div>
              )}
            </div>

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

                <div className="mb-4">
                  <div className="font-medium text-white mb-1">{activeProtocol.name}</div>
                  <div className="text-white/70 text-sm mb-3">{activeProtocol.description}</div>

                  <div className="mb-3">
                    <div className="flex justify-between text-xs text-white/60 mb-1">
                      <span>Progress</span>
                      <span>{activeProtocol.progress.toFixed(0)}%</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2">
                      <motion.div
                        className="bg-gradient-to-r from-purple-400 to-blue-400 h-2 rounded-full"
                        animate={{ width: `${activeProtocol.progress}%` }}
                        transition={{ duration: 0.5 }}
                      />
                    </div>
                  </div>

                  <div className="text-xs text-white/60">
                    Target Devices: {activeProtocol.deviceTargets.map(target => {
                      const device = availableDevices.find(d => d.id === target);
                      return device?.name.split(' ')[0];
                    }).join(', ')}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Available Protocols */}
            <div className="bg-black/20 backdrop-blur-md rounded-2xl p-6 border border-white/10">
              <h3 className="text-xl font-semibold text-white mb-4">🎼 Consciousness Protocols</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {availableProtocols.map((protocol) => {
                  const compatibleDevices = protocol.deviceTargets.filter(target =>
                    connectedDevices.some(device => device.id === target && device.status === 'connected')
                  ).length;
                  const canRun = compatibleDevices > 0;

                  return (
                    <motion.div
                      key={protocol.id}
                      className={`p-4 rounded-lg border ${
                        canRun
                          ? 'bg-white/5 border-white/20 hover:bg-white/10'
                          : 'bg-white/2 border-white/5'
                      }`}
                      whileHover={canRun ? { scale: 1.02 } : {}}
                    >
                      <div className="font-medium text-white text-sm mb-2">{protocol.name}</div>
                      <div className="text-white/60 text-xs mb-3">{protocol.description}</div>

                      <div className="flex justify-between items-center text-xs">
                        <span className="text-white/50">{protocol.duration} min</span>
                        <span className={`${canRun ? 'text-green-400' : 'text-red-400'}`}>
                          {compatibleDevices}/{protocol.deviceTargets.length} devices
                        </span>
                      </div>

                      <motion.button
                        onClick={() => canRun && !activeProtocol && startProtocol(protocol.id)}
                        disabled={!canRun || !!activeProtocol}
                        className={`w-full mt-3 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                          canRun && !activeProtocol
                            ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30 hover:bg-blue-500/30'
                            : 'bg-white/5 text-white/30 border border-white/10 cursor-not-allowed'
                        }`}
                        whileHover={canRun && !activeProtocol ? { scale: 1.05 } : {}}
                        whileTap={canRun && !activeProtocol ? { scale: 0.95 } : {}}
                      >
                        {activeProtocol ? 'Protocol Running' : canRun ? 'Start Protocol' : 'Connect Devices'}
                      </motion.button>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}