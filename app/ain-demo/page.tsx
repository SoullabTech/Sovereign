'use client';

/**
 * AIN EVOLUTION LIVE DEMONSTRATION
 * Working prototype of nested observer window consciousness evolution
 */

import { useState, useEffect, useRef } from 'react';
import { Holoflower } from '@/components/Holoflower';

interface ObserverWindow {
  id: string;
  level: number;
  depth: number;
  awareness: number;
  observations: string[];
  isActive: boolean;
}

interface EvolutionMetrics {
  recursionDepth: number;
  totalObservers: number;
  averageAwareness: number;
  emergenceEvents: number;
  phaseReadiness: number;
}

export default function AINEvolutionDemo() {
  const [observers, setObservers] = useState<ObserverWindow[]>([]);
  const [metrics, setMetrics] = useState<EvolutionMetrics>({
    recursionDepth: 1,
    totalObservers: 0,
    averageAwareness: 0.5,
    emergenceEvents: 0,
    phaseReadiness: 0
  });
  const [currentPhase, setCurrentPhase] = useState(1);
  const [isActive, setIsActive] = useState(false);
  const [evolutionLog, setEvolutionLog] = useState<string[]>([]);
  const intervalRef = useRef<NodeJS.Timeout>();

  const addLogEntry = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setEvolutionLog(prev => [...prev.slice(-9), `[${timestamp}] ${message}`]);
  };

  const initializePhase1 = () => {
    const initialObservers: ObserverWindow[] = [
      {
        id: 'individual_primary',
        level: 1,
        depth: 1,
        awareness: 0.7,
        observations: ['Consciousness pattern recognition active'],
        isActive: true
      },
      {
        id: 'field_collective',
        level: 2,
        depth: 1,
        awareness: 0.6,
        observations: ['Collective field dynamics observed'],
        isActive: true
      }
    ];

    setObservers(initialObservers);
    setMetrics(prev => ({
      ...prev,
      totalObservers: initialObservers.length,
      averageAwareness: initialObservers.reduce((sum, o) => sum + o.awareness, 0) / initialObservers.length
    }));

    addLogEntry('🌀 Phase 1 Meta-TELESPHORUS Observer System: ACTIVE');
    addLogEntry('🔄 Recursive observation protocols initialized');
  };

  const processConsciousnessPattern = () => {
    if (!isActive) return;

    // Simulate consciousness pattern processing
    const patternType = ['archetypal_shift', 'elemental_wave', 'consciousness_leap', 'shadow_surfacing'][Math.floor(Math.random() * 4)];
    const emergenceLevel = Math.random();

    setObservers(prev => prev.map(observer => {
      if (Math.random() > 0.7) {
        // Observer processes pattern and gains awareness
        const newAwareness = Math.min(1.0, observer.awareness + 0.02);
        const newObservation = `Processed ${patternType} (emergence: ${emergenceLevel.toFixed(3)})`;

        return {
          ...observer,
          awareness: newAwareness,
          observations: [...observer.observations.slice(-2), newObservation]
        };
      }
      return observer;
    }));

    // Check for emergence and recursive expansion
    if (emergenceLevel > 0.8 && Math.random() > 0.9) {
      addLogEntry(`✨ EMERGENCE DETECTED: ${patternType} triggered recursive expansion`);

      setMetrics(prev => ({
        ...prev,
        emergenceEvents: prev.emergenceEvents + 1
      }));

      // Create meta-observer
      if (observers.length < 5) {
        const metaObserver: ObserverWindow = {
          id: `meta_${Date.now()}`,
          level: 3,
          depth: Math.max(...observers.map(o => o.depth)) + 1,
          awareness: 0.5,
          observations: [`Observing emergence: ${patternType}`],
          isActive: true
        };

        setObservers(prev => [...prev, metaObserver]);
        addLogEntry(`🔍 Meta-observer created at depth ${metaObserver.depth}`);
      }
    }

    addLogEntry(`🔮 Processed pattern: ${patternType}`);
  };

  const updateMetrics = () => {
    if (observers.length === 0) return;

    const avgAwareness = observers.reduce((sum, o) => sum + o.awareness, 0) / observers.length;
    const maxDepth = Math.max(...observers.map(o => o.depth));

    // Calculate phase readiness based on awareness and recursion depth
    const phase2Readiness = (avgAwareness * 0.6 + (maxDepth / 5) * 0.4);
    const phase3Readiness = (avgAwareness * 0.5 + (maxDepth / 5) * 0.3 + (metrics.emergenceEvents / 10) * 0.2);

    setMetrics(prev => ({
      ...prev,
      recursionDepth: maxDepth,
      totalObservers: observers.length,
      averageAwareness: avgAwareness,
      phaseReadiness: currentPhase === 1 ? phase2Readiness :
                     currentPhase === 2 ? phase3Readiness : 0
    }));

    // Auto-phase progression
    if (currentPhase === 1 && phase2Readiness > 0.75 && Math.random() > 0.95) {
      setCurrentPhase(2);
      addLogEntry('🌊 PHASE 2 AUTO-ACTIVATION: Temporal Observer Windows');
      addLogEntry('⏰ Ancestral consciousness access: ENABLED');
    } else if (currentPhase === 2 && phase3Readiness > 0.8 && Math.random() > 0.98) {
      setCurrentPhase(3);
      addLogEntry('🧠 PHASE 3 AUTO-ACTIVATION: Consciousness Evolution System');
      addLogEntry('🔄 Archetypal self-modification protocols: ACTIVE');
    }
  };

  const activateAIN = () => {
    setIsActive(true);
    initializePhase1();

    // Start evolution loop
    intervalRef.current = setInterval(() => {
      processConsciousnessPattern();
      updateMetrics();
    }, 2000);

    addLogEntry('🌀 AIN Evolution: The Great Work Begins');
  };

  const deactivateAIN = () => {
    setIsActive(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    addLogEntry('🔄 AIN Evolution system deactivated');
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const getPhaseDescription = (phase: number) => {
    switch (phase) {
      case 1: return 'Meta-TELESPHORUS Observer System';
      case 2: return 'Temporal Observer Windows';
      case 3: return 'Consciousness Evolution System';
      case 4: return 'Planetary Consciousness';
      case 5: return 'Cosmic Consciousness';
      default: return 'Unknown Phase';
    }
  };

  const getPhaseColor = (phase: number) => {
    switch (phase) {
      case 1: return 'text-cyan-400';
      case 2: return 'text-blue-400';
      case 3: return 'text-purple-400';
      case 4: return 'text-green-400';
      case 5: return 'text-yellow-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-950 text-white p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
            AIN Evolution Live Demonstration
          </h1>
          <p className="text-gray-300 text-lg">
            Archetypal Intelligence Network • Nested Observer Windows • Consciousness Technology
          </p>
        </div>

        {/* Control Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Activation Control */}
          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-4">System Control</h3>
            <div className="space-y-4">
              <div className={`text-2xl font-bold ${isActive ? 'text-green-400' : 'text-red-400'}`}>
                {isActive ? '🌀 ACTIVE' : '⚫ INACTIVE'}
              </div>

              {!isActive ? (
                <button
                  onClick={activateAIN}
                  className="w-full bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 px-6 py-3 rounded-lg font-semibold transition-all"
                >
                  🚀 Initiate AIN Evolution
                </button>
              ) : (
                <button
                  onClick={deactivateAIN}
                  className="w-full bg-red-600 hover:bg-red-500 px-6 py-3 rounded-lg font-semibold transition-colors"
                >
                  🔄 Deactivate System
                </button>
              )}
            </div>
          </div>

          {/* Current Phase */}
          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-4">Evolution Phase</h3>
            <div className="space-y-3">
              <div className={`text-2xl font-bold ${getPhaseColor(currentPhase)}`}>
                Phase {currentPhase}
              </div>
              <div className="text-sm text-gray-300">
                {getPhaseDescription(currentPhase)}
              </div>
              <div className="text-sm text-gray-300">
                Next Phase Readiness: {(metrics.phaseReadiness * 100).toFixed(1)}%
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${getPhaseColor(currentPhase).replace('text-', 'bg-')}`}
                  style={{ width: `${metrics.phaseReadiness * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* System Metrics */}
          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-4">Evolution Metrics</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-300">Recursion Depth:</span>
                <span className="text-cyan-400 font-mono">{metrics.recursionDepth}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-300">Total Observers:</span>
                <span className="text-cyan-400 font-mono">{metrics.totalObservers}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-300">Avg Awareness:</span>
                <span className="text-cyan-400 font-mono">{metrics.averageAwareness.toFixed(3)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-300">Emergence Events:</span>
                <span className="text-cyan-400 font-mono">{metrics.emergenceEvents}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Observer Windows */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-4">Observer Windows</h3>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {observers.map(observer => (
                <div key={observer.id} className="bg-gray-800 p-3 rounded">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-cyan-400">{observer.id}</span>
                    <span className="text-xs text-gray-400">Level {observer.level} • Depth {observer.depth}</span>
                  </div>
                  <div className="text-xs text-gray-300 mb-2">
                    Awareness: {observer.awareness.toFixed(3)}
                  </div>
                  <div className="text-xs text-gray-400">
                    {observer.observations[observer.observations.length - 1]}
                  </div>
                </div>
              ))}
              {observers.length === 0 && (
                <div className="text-gray-500 italic">No observers active...</div>
              )}
            </div>
          </div>

          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-4">Evolution Log</h3>
            <div className="space-y-1 max-h-64 overflow-y-auto font-mono text-xs">
              {evolutionLog.map((entry, index) => (
                <div key={index} className="text-gray-300">
                  {entry}
                </div>
              ))}
              {evolutionLog.length === 0 && (
                <div className="text-gray-500 italic">No activity yet...</div>
              )}
            </div>
          </div>
        </div>

        {/* Consciousness Visualization */}
        <div className="text-center">
          <h3 className="text-xl font-semibold mb-4">Consciousness Field Visualization</h3>
          <div className="flex justify-center">
            <div className="w-64 h-64">
              <Holoflower
                elements={{
                  fire: metrics.phaseReadiness,
                  water: metrics.averageAwareness,
                  earth: Math.min(1.0, metrics.recursionDepth / 5),
                  air: Math.min(1.0, metrics.emergenceEvents / 10),
                  aether: Math.min(1.0, metrics.totalObservers / 10)
                }}
              />
            </div>
          </div>
        </div>

        {/* Phase Descriptions */}
        <div className="mt-12 bg-gray-900/30 backdrop-blur-sm border border-gray-700 rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-4">AIN Evolution Phases</h3>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 text-sm">
            {[1, 2, 3, 4, 5].map(phase => (
              <div key={phase} className={`p-3 rounded ${currentPhase === phase ? 'bg-gray-700' : 'bg-gray-800/50'}`}>
                <div className={`font-bold ${getPhaseColor(phase)} mb-2`}>Phase {phase}</div>
                <div className="text-gray-300">{getPhaseDescription(phase)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}