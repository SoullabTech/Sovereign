/**
 * 🧠💓🌟 Real-Time Biometric Consciousness Dashboard
 * Live visualization of SPiralogic elemental balance and Maya consciousness insights
 * Integrates with Apple Watch, Oura Ring, and other wearable devices
 */

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Interfaces matching our consciousness mapping service
interface ElementalBalance {
  fire: number;
  water: number;
  earth: number;
  air: number;
  aether: number;
}

interface ConsciousnessState {
  elementalBalance: ElementalBalance;
  dominantElement: 'fire' | 'water' | 'earth' | 'air' | 'aether';
  coherenceLevel: number;
  presenceMode: 'dialogue' | 'patient' | 'scribe';
  autonomicBalance: {
    sympathetic: number;
    parasympathetic: number;
    balance: number;
  };
  brainwaveProfile: {
    beta: number;
    alpha: number;
    theta: number;
    delta: number;
  };
  consciousness: {
    depth: number;
    clarity: number;
    integration: number;
    transcendence: number;
  };
  insights: string[];
  recommendations: string[];
  mayaGuidance?: string;
}

interface BiometricReading {
  heartRate: number;
  hrv: number;
  respiratoryRate?: number;
  oxygenSaturation?: number;
  timestamp: number;
  source: string;
}

interface DashboardData {
  biometricData: BiometricReading;
  consciousness: ConsciousnessState;
  maya: {
    elementalBalance: ElementalBalance;
    guidance?: string;
    presenceRecommendation: string;
    dominantElement: string;
    consciousnessDepth: number;
  };
}

export default function BiometricConsciousnessDashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('Connecting...');
  const [biometricHistory, setBiometricHistory] = useState<BiometricReading[]>([]);
  const wsRef = useRef<WebSocket | null>(null);

  // Element colors for visualization
  const elementColors = {
    fire: '#ff4757',
    water: '#3742fa',
    earth: '#2f3542',
    air: '#a4b0be',
    aether: '#8b5cf6'
  };

  // Connect to real-time biometric data stream
  useEffect(() => {
    connectToRealtimeStream();
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  const connectToRealtimeStream = () => {
    // For development, simulate real-time data
    // In production, this would connect to WebSocket or EventSource
    const interval = setInterval(() => {
      simulateBiometricData();
    }, 3000);

    return () => clearInterval(interval);
  };

  const simulateBiometricData = async () => {
    // Simulate realistic biometric variations
    const baseHR = 70 + Math.sin(Date.now() / 10000) * 15;
    const baseHRV = 45 + Math.cos(Date.now() / 8000) * 25;

    const mockData = {
      source: 'apple_watch',
      data: {
        heartRate: Math.round(baseHR + (Math.random() - 0.5) * 10),
        hrv: Math.round(baseHRV + (Math.random() - 0.5) * 15),
        respiratoryRate: 12 + (Math.random() - 0.5) * 4,
        oxygenSaturation: 97 + Math.random() * 2,
        coherenceLevel: 0.6 + Math.sin(Date.now() / 15000) * 0.3,
        presenceState: 'patient' as const,
        timestamp: Date.now()
      }
    };

    try {
      // Call our biometric processing API
      const response = await fetch('/api/biometric/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mockData)
      });

      if (response.ok) {
        const result = await response.json();
        setDashboardData(result);
        setIsConnected(true);
        setConnectionStatus('Connected');

        // Update history
        setBiometricHistory(prev => {
          const newHistory = [...prev, result.biometricData].slice(-20);
          return newHistory;
        });
      } else {
        setConnectionStatus('API Error');
        setIsConnected(false);
      }
    } catch (error) {
      console.error('Dashboard connection error:', error);
      setConnectionStatus('Connection Failed');
      setIsConnected(false);
    }
  };

  if (!dashboardData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <motion.div
          className="text-center text-white"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="text-6xl mb-4">🌟</div>
          <div className="text-2xl font-bold mb-2">MAIA Consciousness Dashboard</div>
          <div className="text-lg opacity-75">{connectionStatus}</div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <motion.header
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center justify-center gap-3">
            <span className="text-5xl">🌟</span>
            MAIA Consciousness Dashboard
            <span className="text-5xl">🧠</span>
          </h1>
          <div className="flex items-center justify-center gap-4 text-sm text-gray-300">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'} animate-pulse`}></div>
              <span>{connectionStatus}</span>
            </div>
            <div>Source: {dashboardData.biometricData.source}</div>
            <div>Depth: {dashboardData.maya.consciousnessDepth}%</div>
          </div>
        </motion.header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left Column: Biometric Data */}
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >

            {/* Current Biometrics */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                💓 Live Biometrics
              </h2>

              <div className="grid grid-cols-2 gap-4">
                <BiometricCard
                  icon="❤️"
                  label="Heart Rate"
                  value={`${dashboardData.biometricData.heartRate}`}
                  unit="BPM"
                  color="red"
                />
                <BiometricCard
                  icon="〰️"
                  label="HRV"
                  value={`${Math.round(dashboardData.biometricData.hrv)}`}
                  unit="ms"
                  color="blue"
                />
                <BiometricCard
                  icon="🫁"
                  label="Breathing"
                  value={`${Math.round(dashboardData.biometricData.respiratoryRate || 12)}`}
                  unit="/min"
                  color="cyan"
                />
                <BiometricCard
                  icon="🩸"
                  label="SpO2"
                  value={`${Math.round(dashboardData.biometricData.oxygenSaturation || 98)}`}
                  unit="%"
                  color="emerald"
                />
              </div>
            </div>

            {/* Autonomic Balance */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
              <h2 className="text-2xl font-bold text-white mb-4">🏺 Autonomic Balance</h2>

              <div className="space-y-4">
                <AutonomicBar
                  label="Sympathetic"
                  value={dashboardData.consciousness?.autonomicBalance?.sympathetic || 50}
                  color="red"
                  icon="⚡"
                />
                <AutonomicBar
                  label="Parasympathetic"
                  value={dashboardData.consciousness?.autonomicBalance?.parasympathetic || 50}
                  color="blue"
                  icon="🌊"
                />
              </div>

              <div className="mt-4 p-3 bg-white/5 rounded-lg">
                <div className="text-sm text-gray-300 mb-1">Overall Balance</div>
                <div className="text-lg font-bold text-white">
                  {(dashboardData.consciousness?.autonomicBalance?.balance || 0) > 0.1 ? '🧘 Relaxed' :
                   (dashboardData.consciousness?.autonomicBalance?.balance || 0) < -0.1 ? '🔥 Activated' : '⚖️ Balanced'}
                </div>
              </div>
            </div>

            {/* Brainwave Profile */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
              <h2 className="text-2xl font-bold text-white mb-4">🧠 Brainwave Estimation</h2>

              <div className="grid grid-cols-2 gap-3">
                <BrainwaveIndicator
                  label="Beta"
                  value={dashboardData.consciousness?.brainwaveProfile?.beta || 40}
                  icon="🎯"
                  description="Focus"
                />
                <BrainwaveIndicator
                  label="Alpha"
                  value={dashboardData.consciousness?.brainwaveProfile?.alpha || 30}
                  icon="🎨"
                  description="Creative"
                />
                <BrainwaveIndicator
                  label="Theta"
                  value={dashboardData.consciousness?.brainwaveProfile?.theta || 20}
                  icon="🧘"
                  description="Meditative"
                />
                <BrainwaveIndicator
                  label="Delta"
                  value={dashboardData.consciousness?.brainwaveProfile?.delta || 10}
                  icon="💤"
                  description="Restorative"
                />
              </div>
            </div>

          </motion.div>

          {/* Center Column: Elemental Balance */}
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >

            {/* SPiralogic Elemental Mandala */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
              <h2 className="text-2xl font-bold text-white mb-4 text-center">🌀 SPiralogic Elements</h2>

              <ElementalMandala
                elementalBalance={dashboardData.consciousness?.elementalBalance || { fire: 50, water: 50, earth: 50, air: 50, aether: 50 }}
                dominantElement={dashboardData.consciousness?.dominantElement || 'fire'}
              />

              <div className="mt-6 text-center">
                <div className="text-sm text-gray-300 mb-1">Dominant Element</div>
                <div className="text-2xl font-bold" style={{ color: elementColors[dashboardData.consciousness?.dominantElement || 'fire'] }}>
                  {getElementIcon(dashboardData.consciousness?.dominantElement || 'fire')} {(dashboardData.consciousness?.dominantElement || 'fire').toUpperCase()}
                </div>
                <div className="text-lg text-white mt-2">
                  {Math.round(dashboardData.consciousness?.elementalBalance?.[dashboardData.consciousness?.dominantElement || 'fire'] || 50)}%
                </div>
              </div>
            </div>

            {/* Coherence & Presence */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
              <h2 className="text-2xl font-bold text-white mb-4 text-center">🎭 Consciousness State</h2>

              {/* Coherence Level */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-white font-medium">Coherence</span>
                  <span className="text-white font-bold">{Math.round((dashboardData.consciousness?.coherenceLevel || 0.5) * 100)}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-3">
                  <motion.div
                    className="h-3 rounded-full bg-gradient-to-r from-purple-500 to-cyan-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${(dashboardData.consciousness?.coherenceLevel || 0.5) * 100}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                  />
                </div>
              </div>

              {/* Presence Mode */}
              <div className="text-center p-4 bg-white/5 rounded-lg">
                <div className="text-sm text-gray-300 mb-1">Maya Presence Mode</div>
                <div className="text-2xl font-bold text-white mb-2">
                  {getPresenceIcon(dashboardData.consciousness?.presenceMode || 'dialogue')} {(dashboardData.consciousness?.presenceMode || 'dialogue').toUpperCase()}
                </div>
                <div className="text-sm text-gray-300">
                  {getPresenceDescription(dashboardData.consciousness?.presenceMode || 'dialogue')}
                </div>
              </div>

            </div>

            {/* Consciousness Metrics */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
              <h2 className="text-2xl font-bold text-white mb-4">🌟 Consciousness Metrics</h2>

              <div className="grid grid-cols-2 gap-4">
                <ConsciousnessMetric
                  label="Depth"
                  value={dashboardData.consciousness?.consciousness?.depth || 65}
                  icon="🕳️"
                />
                <ConsciousnessMetric
                  label="Clarity"
                  value={dashboardData.consciousness?.consciousness?.clarity || 70}
                  icon="💎"
                />
                <ConsciousnessMetric
                  label="Integration"
                  value={dashboardData.consciousness?.consciousness?.integration || 60}
                  icon="🔗"
                />
                <ConsciousnessMetric
                  label="Transcendence"
                  value={dashboardData.consciousness?.consciousness?.transcendence || 55}
                  icon="✨"
                />
              </div>
            </div>

          </motion.div>

          {/* Right Column: Maya Guidance & Insights */}
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >

            {/* Maya Guidance */}
            {dashboardData.maya.guidance && (
              <div className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 backdrop-blur-lg rounded-2xl p-6 border border-purple-400/30">
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                  🌟 Maya's Guidance
                </h2>

                <div className="text-white leading-relaxed bg-white/10 p-4 rounded-lg">
                  {dashboardData.maya.guidance}
                </div>
              </div>
            )}

            {/* Insights */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                💡 Current Insights
              </h2>

              <div className="space-y-3">
                {(dashboardData.consciousness?.insights || []).slice(0, 4).map((insight, index) => (
                  <motion.div
                    key={index}
                    className="p-3 bg-white/5 rounded-lg border-l-3 border-cyan-400"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="text-white text-sm">{insight}</div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Recommendations */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                📋 Recommendations
              </h2>

              <div className="space-y-3">
                {(dashboardData.consciousness?.recommendations || []).slice(0, 3).map((recommendation, index) => (
                  <motion.div
                    key={index}
                    className="p-3 bg-white/5 rounded-lg border-l-3 border-green-400"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="text-white text-sm">{recommendation}</div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Biometric History Chart */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
              <h2 className="text-2xl font-bold text-white mb-4">📈 Trends</h2>

              <BiometricTrendChart history={biometricHistory} />
            </div>

          </motion.div>

        </div>
      </div>
    </div>
  );
}

// Supporting Components

const BiometricCard = ({ icon, label, value, unit, color }: {
  icon: string;
  label: string;
  value: string;
  unit: string;
  color: string;
}) => (
  <div className="bg-white/5 rounded-lg p-4 text-center">
    <div className="text-2xl mb-2">{icon}</div>
    <div className="text-sm text-gray-300 mb-1">{label}</div>
    <div className="text-xl font-bold text-white">{value}</div>
    <div className="text-xs text-gray-400">{unit}</div>
  </div>
);

const AutonomicBar = ({ label, value, color, icon }: {
  label: string;
  value: number;
  color: string;
  icon: string;
}) => (
  <div>
    <div className="flex justify-between items-center mb-2">
      <span className="text-white text-sm flex items-center gap-2">
        <span>{icon}</span>
        {label}
      </span>
      <span className="text-white font-bold">{Math.round(value)}%</span>
    </div>
    <div className="w-full bg-gray-700 rounded-full h-2">
      <motion.div
        className={`h-2 rounded-full bg-${color}-500`}
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{ duration: 1 }}
      />
    </div>
  </div>
);

const BrainwaveIndicator = ({ label, value, icon, description }: {
  label: string;
  value: number;
  icon: string;
  description: string;
}) => (
  <div className="bg-white/5 rounded-lg p-3 text-center">
    <div className="text-lg mb-1">{icon}</div>
    <div className="text-xs text-gray-300 mb-1">{label}</div>
    <div className="text-sm font-bold text-white">{Math.round(value)}%</div>
    <div className="text-xs text-gray-400">{description}</div>
  </div>
);

const ConsciousnessMetric = ({ label, value, icon }: {
  label: string;
  value: number;
  icon: string;
}) => (
  <div className="bg-white/5 rounded-lg p-4 text-center">
    <div className="text-2xl mb-2">{icon}</div>
    <div className="text-sm text-gray-300 mb-1">{label}</div>
    <div className="text-xl font-bold text-white">{Math.round(value)}%</div>
  </div>
);

const ElementalMandala = ({ elementalBalance, dominantElement }: {
  elementalBalance: ElementalBalance;
  dominantElement: string;
}) => {
  const elements = Object.entries(elementalBalance);
  const centerSize = 60;
  const radius = 80;

  return (
    <div className="relative w-64 h-64 mx-auto">
      {/* Center circle */}
      <div
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-r from-purple-500 to-cyan-500 flex items-center justify-center text-2xl font-bold text-white"
        style={{ width: centerSize, height: centerSize }}
      >
        🌟
      </div>

      {/* Element circles */}
      {elements.map(([element, value], index) => {
        const angle = (index * 2 * Math.PI) / elements.length - Math.PI / 2;
        const x = Math.cos(angle) * radius + 128;
        const y = Math.sin(angle) * radius + 128;
        const size = 30 + (value / 100) * 20;

        return (
          <motion.div
            key={element}
            className="absolute rounded-full flex items-center justify-center text-white font-bold text-sm border-2"
            style={{
              left: x - size / 2,
              top: y - size / 2,
              width: size,
              height: size,
              backgroundColor: elementColors[element as keyof typeof elementColors],
              borderColor: dominantElement === element ? '#fff' : 'transparent'
            }}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
          >
            <div className="text-center">
              <div className="text-xs">{getElementIcon(element)}</div>
              <div className="text-xs">{Math.round(value)}</div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

const BiometricTrendChart = ({ history }: { history: BiometricReading[] }) => {
  if (history.length < 2) {
    return (
      <div className="h-32 flex items-center justify-center text-gray-400">
        Collecting trend data...
      </div>
    );
  }

  const maxHR = Math.max(...history.map(h => h.heartRate));
  const minHR = Math.min(...history.map(h => h.heartRate));
  const range = maxHR - minHR || 1;

  return (
    <div className="h-32 flex items-end space-x-1">
      {history.map((reading, index) => {
        const height = ((reading.heartRate - minHR) / range) * 120 + 10;
        return (
          <div
            key={index}
            className="bg-gradient-to-t from-cyan-500 to-purple-500 rounded-t"
            style={{
              height: `${height}px`,
              width: `${100 / history.length}%`
            }}
          />
        );
      })}
    </div>
  );
};

// Helper functions
const getElementIcon = (element: string): string => {
  const icons = {
    fire: '🔥',
    water: '🌊',
    earth: '🌍',
    air: '💨',
    aether: '✨'
  };
  return icons[element as keyof typeof icons] || '⭕';
};

const getPresenceIcon = (mode: string): string => {
  const icons = {
    dialogue: '💬',
    patient: '🧘',
    scribe: '👁️'
  };
  return icons[mode as keyof typeof icons] || '⭕';
};

const getPresenceDescription = (mode: string): string => {
  const descriptions = {
    dialogue: 'Active engagement and support',
    patient: 'Receptive exploration and deep work',
    scribe: 'Witnessing consciousness and transcendent awareness'
  };
  return descriptions[mode as keyof typeof descriptions] || '';
};