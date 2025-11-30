'use client';

import { useState, useEffect } from 'react';
import { LabToolsService, Protocol } from '../lib/LabToolsService';

interface ProtocolSelectorProps {
  service: LabToolsService;
}

export function ProtocolSelector({ service }: ProtocolSelectorProps) {
  const [activeProtocol, setActiveProtocol] = useState<Protocol | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('meditation');

  useEffect(() => {
    const handleProtocolStarted = (protocol: Protocol) => setActiveProtocol(protocol);
    const handleProtocolStopped = () => setActiveProtocol(null);

    service.on('protocolStarted', handleProtocolStarted);
    service.on('protocolStopped', handleProtocolStopped);

    return () => {
      service.off('protocolStarted', handleProtocolStarted);
      service.off('protocolStopped', handleProtocolStopped);
    };
  }, [service]);

  const protocolLibrary: Protocol[] = [
    // Meditation Protocols
    {
      id: 'alpha-training',
      name: 'Alpha Training',
      category: 'meditation',
      intensity: 2,
      duration: 15,
      description: 'Gentle alpha wave entrainment for relaxed awareness',
      safetyLevel: 'gentle'
    },
    {
      id: 'theta-journey',
      name: 'Theta Journey',
      category: 'meditation',
      intensity: 4,
      duration: 30,
      description: 'Deep theta state with vivid imagery',
      safetyLevel: 'moderate'
    },
    {
      id: 'gamma-transcendence',
      name: 'Gamma Transcendence',
      category: 'meditation',
      intensity: 6,
      duration: 20,
      description: 'Access mystical states and unity consciousness',
      safetyLevel: 'intense'
    },

    // Therapeutic Protocols
    {
      id: 'anxiety-relief',
      name: 'Anxiety Relief',
      category: 'therapeutic',
      intensity: 2,
      duration: 20,
      description: 'Alpha wave training for calm states',
      safetyLevel: 'gentle'
    },
    {
      id: 'focus-enhancement',
      name: 'Focus Enhancement',
      category: 'therapeutic',
      intensity: 3,
      duration: 25,
      description: 'Specialized neurofeedback for attention',
      safetyLevel: 'gentle'
    },
    {
      id: 'trauma-integration',
      name: 'Trauma Integration',
      category: 'therapeutic',
      intensity: 5,
      duration: 45,
      description: 'Safe EMDR-style processing with Guardian support',
      safetyLevel: 'intense'
    },

    // Altered States
    {
      id: 'dmt-simulation',
      name: 'DMT Simulation',
      category: 'altered',
      intensity: 8,
      duration: 15,
      description: 'DMT-like experiences via neurofeedback',
      safetyLevel: 'advanced'
    },
    {
      id: 'lucid-dreaming',
      name: 'Lucid Dreaming',
      category: 'altered',
      intensity: 4,
      duration: 60,
      description: 'Train consciousness during sleep states',
      safetyLevel: 'moderate'
    },

    // Performance
    {
      id: 'flow-state',
      name: 'Flow State Optimizer',
      category: 'performance',
      intensity: 5,
      duration: 30,
      description: 'Train on-demand peak performance states',
      safetyLevel: 'moderate'
    }
  ];

  const categories = [
    { id: 'meditation', name: '🧘 Meditation', icon: '🧘' },
    { id: 'therapeutic', name: '💚 Therapeutic', icon: '💚' },
    { id: 'altered', name: '🌀 Altered States', icon: '🌀' },
    { id: 'performance', name: '⚡ Performance', icon: '⚡' }
  ];

  const filteredProtocols = protocolLibrary.filter(
    protocol => protocol.category === selectedCategory
  );

  const handleStartProtocol = async (protocol: Protocol) => {
    try {
      await service.startProtocol(protocol);
    } catch (error) {
      console.error('Failed to start protocol:', error);
    }
  };

  const handleStopProtocol = async () => {
    try {
      await service.stopProtocol();
    } catch (error) {
      console.error('Failed to stop protocol:', error);
    }
  };

  return (
    <div className="bg-gray-900/50 backdrop-blur-sm border border-purple-500/30 rounded-lg p-4">
      <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        🎛️ Protocol Control
        {activeProtocol && (
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
        )}
      </h2>

      {/* Category Selector */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        {categories.map(category => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={`p-3 rounded-lg border transition-all text-sm font-semibold ${
              selectedCategory === category.id
                ? 'bg-purple-500/20 border-purple-500 text-purple-300'
                : 'bg-black/20 border-gray-600 text-gray-400 hover:border-purple-500/50'
            }`}
          >
            <div>{category.icon}</div>
            <div className="text-xs mt-1">{category.name.replace(/🧘|💚|🌀|⚡\s/, '')}</div>
          </button>
        ))}
      </div>

      {/* Protocol List */}
      <div className="space-y-2 mb-4 max-h-64 overflow-y-auto">
        {filteredProtocols.map(protocol => (
          <ProtocolCard
            key={protocol.id}
            protocol={protocol}
            isActive={activeProtocol?.id === protocol.id}
            onStart={() => handleStartProtocol(protocol)}
          />
        ))}
      </div>

      {/* Active Session Control */}
      {activeProtocol && (
        <ActiveSessionControl
          protocol={activeProtocol}
          onStop={handleStopProtocol}
        />
      )}

      {/* Safety Notice */}
      <div className="mt-4 p-3 bg-purple-900/20 border border-purple-500/30 rounded text-xs">
        <div className="font-semibold text-purple-300 mb-1">🛡️ Guardian Protected</div>
        <div className="text-purple-200">
          All protocols monitored by Guardian safety system. Emergency stop always available.
        </div>
      </div>
    </div>
  );
}

interface ProtocolCardProps {
  protocol: Protocol;
  isActive: boolean;
  onStart: () => void;
}

function ProtocolCard({ protocol, isActive, onStart }: ProtocolCardProps) {
  const getSafetyColor = (level: string) => {
    switch (level) {
      case 'gentle': return 'text-green-400 border-green-500/50';
      case 'moderate': return 'text-yellow-400 border-yellow-500/50';
      case 'intense': return 'text-orange-400 border-orange-500/50';
      case 'advanced': return 'text-red-400 border-red-500/50';
      default: return 'text-gray-400 border-gray-500/50';
    }
  };

  const getIntensityBars = (intensity: number) => {
    return Array.from({ length: 10 }, (_, i) => (
      <div
        key={i}
        className={`w-1 h-3 rounded-full ${
          i < intensity ? 'bg-purple-500' : 'bg-gray-700'
        }`}
      />
    ));
  };

  return (
    <div className={`border rounded-lg p-3 transition-all ${
      isActive
        ? 'bg-purple-500/20 border-purple-500 shadow-lg shadow-purple-500/20'
        : 'bg-black/20 border-gray-600 hover:border-purple-500/50'
    }`}>
      <div className="flex justify-between items-start mb-2">
        <div>
          <h3 className="font-semibold text-white text-sm">{protocol.name}</h3>
          <p className="text-xs text-gray-300 mt-1">{protocol.description}</p>
        </div>

        <div className={`text-xs px-2 py-1 rounded border ${getSafetyColor(protocol.safetyLevel)}`}>
          {protocol.safetyLevel}
        </div>
      </div>

      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="text-xs text-gray-400">Intensity:</div>
          <div className="flex gap-1">
            {getIntensityBars(protocol.intensity)}
          </div>
        </div>

        <div className="text-xs text-gray-400">
          {protocol.duration} min
        </div>
      </div>

      {!isActive && (
        <button
          onClick={onStart}
          className="w-full mt-3 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-lg transition-all"
        >
          Start Protocol
        </button>
      )}

      {isActive && (
        <div className="mt-3 p-2 bg-green-500/20 border border-green-500/50 rounded text-center">
          <span className="text-green-300 text-sm">🟢 Active Session</span>
        </div>
      )}
    </div>
  );
}

interface ActiveSessionControlProps {
  protocol: Protocol;
  onStop: () => void;
}

function ActiveSessionControl({ protocol, onStop }: ActiveSessionControlProps) {
  const [elapsed, setElapsed] = useState(0);
  const [sessionStartTime] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - sessionStartTime) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [sessionStartTime]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercentage = (elapsed / (protocol.duration * 60)) * 100;

  return (
    <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-4">
      <h3 className="font-semibold text-purple-300 mb-3">Active: {protocol.name}</h3>

      {/* Progress Bar */}
      <div className="mb-3">
        <div className="flex justify-between text-xs text-gray-400 mb-1">
          <span>{formatTime(elapsed)}</span>
          <span>{formatTime(protocol.duration * 60)}</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div
            className="bg-purple-500 h-2 rounded-full transition-all duration-1000"
            style={{ width: `${Math.min(progressPercentage, 100)}%` }}
          ></div>
        </div>
      </div>

      {/* Session Stats */}
      <div className="grid grid-cols-3 gap-2 mb-3 text-center text-xs">
        <div>
          <div className="text-gray-400">Phase</div>
          <div className="text-white">
            {progressPercentage < 25 ? 'Entry' :
             progressPercentage < 75 ? 'Active' : 'Integration'}
          </div>
        </div>
        <div>
          <div className="text-gray-400">Safety</div>
          <div className="text-green-400">Protected</div>
        </div>
        <div>
          <div className="text-gray-400">Status</div>
          <div className="text-purple-400">Running</div>
        </div>
      </div>

      {/* Stop Button */}
      <button
        onClick={onStop}
        className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg transition-all"
      >
        Stop Session
      </button>
    </div>
  );
}