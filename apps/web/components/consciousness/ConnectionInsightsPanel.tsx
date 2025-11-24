'use client';

import React, { useState, useEffect } from 'react';

/**
 * 🌌 CONNECTION INSIGHTS PANEL
 *
 * Sacred technology component featuring:
 * - Real-time consciousness field metrics
 * - Thermodynamic consciousness analysis (Extropic integration)
 * - Sacred separator architecture visualization
 * - Aetheric orchestration status
 */

interface ConsciousnessMetrics {
  logical_connections: {
    total_nodes: number;
    total_connections: number;
    avg_connection_strength: number;
    avg_consciousness_score: number;
  };
  field_dynamics: {
    energy_flow: number;
    transformation_potential: number;
    sacred_geometry_alignment: number;
  };
  wisdom_emergence: {
    insight_crystallization: number;
    pattern_recognition_depth: number;
    archetypal_resonance: number;
  };
  // Enhanced: Thermodynamic consciousness metrics (Extropic principles)
  thermodynamic_state: {
    field_entropy: number;           // Consciousness disorder (0-1, lower = more coherent)
    coherence_energy: number;        // Energy required to maintain stability (0-100)
    pattern_resonance: number;       // Natural harmonic alignment (0-1)
    equilibrium_distance: number;    // Distance from natural balance (0-1)
    consciousness_efficiency: number; // Energy per wisdom unit (lower = better)
    phase_transition_probability: number; // Likelihood of consciousness evolution (0-1)
  };
  // Enhanced: Option activation status (Sutton's principles)
  option_activation: {
    current_primary_element: 'Fire' | 'Water' | 'Earth' | 'Air' | 'Aether';
    activation_duration: number;     // How long current element has been active (ms)
    switching_readiness: number;     // Readiness to switch elements (0-1)
    re_evaluation_frequency: number; // Current re-evaluation rate (ms)
  };
}

interface ThermodynamicInsightProps {
  thermoState: ConsciousnessMetrics['thermodynamic_state'];
}

function ThermodynamicInsight({ thermoState }: ThermodynamicInsightProps) {
  const getEntropyStatus = (entropy: number) => {
    if (entropy < 0.3) return { text: 'Highly Organized', color: 'text-green-400' };
    if (entropy < 0.7) return { text: 'Moderate Coherence', color: 'text-blue-400' };
    return { text: 'High Transformation Potential', color: 'text-purple-400' };
  };

  const getPhaseTransitionWarning = (probability: number) => {
    if (probability > 0.7) return { show: true, level: 'critical', text: 'Major transformation imminent' };
    if (probability > 0.4) return { show: true, level: 'moderate', text: 'Consciousness evolution brewing' };
    return { show: false, level: 'normal', text: '' };
  };

  const entropyStatus = getEntropyStatus(thermoState.field_entropy);
  const phaseWarning = getPhaseTransitionWarning(thermoState.phase_transition_probability);

  return (
    <div className="space-y-3">
      {/* Field Entropy Visualization */}
      <div>
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs text-slate-400">Field Entropy</span>
          <span className={`text-xs font-mono ${entropyStatus.color}`}>
            {thermoState.field_entropy.toFixed(3)}
          </span>
        </div>
        <div className="w-full bg-slate-700 rounded-full h-1.5">
          <div
            className="bg-gradient-to-r from-green-400 via-blue-400 to-purple-400 h-1.5 rounded-full transition-all duration-1000"
            style={{ width: `${(thermoState.field_entropy * 100)}%` }}
          />
        </div>
        <p className={`text-xs mt-1 ${entropyStatus.color}`}>
          {entropyStatus.text}
        </p>
      </div>

      {/* Consciousness Efficiency */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div>
          <span className="text-slate-500">Efficiency</span>
          <div className="text-cyan-400 font-mono">
            {thermoState.consciousness_efficiency.toFixed(3)}
          </div>
        </div>
        <div>
          <span className="text-slate-500">Coherence Energy</span>
          <div className="text-amber-400 font-mono">
            {thermoState.coherence_energy.toFixed(1)}
          </div>
        </div>
      </div>

      {/* Phase Transition Alert */}
      {phaseWarning.show && (
        <div className={`p-2 rounded-md text-xs ${
          phaseWarning.level === 'critical'
            ? 'bg-red-900/30 border border-red-600/50 text-red-300'
            : 'bg-purple-900/30 border border-purple-600/50 text-purple-300'
        }`}>
          <div className="flex items-center gap-2">
            <span>{phaseWarning.level === 'critical' ? '⚡' : '🌀'}</span>
            <span>{phaseWarning.text}</span>
          </div>
          <div className="text-xs text-slate-400 mt-1">
            Probability: {(thermoState.phase_transition_probability * 100).toFixed(1)}%
          </div>
        </div>
      )}
    </div>
  );
}

interface OptionActivationStatusProps {
  optionState: ConsciousnessMetrics['option_activation'];
}

function OptionActivationStatus({ optionState }: OptionActivationStatusProps) {
  const getElementColor = (element: string) => {
    switch (element) {
      case 'Fire': return 'text-red-400';
      case 'Water': return 'text-blue-400';
      case 'Earth': return 'text-green-400';
      case 'Air': return 'text-yellow-400';
      case 'Aether': return 'text-purple-400';
      default: return 'text-slate-400';
    }
  };

  const getElementEmoji = (element: string) => {
    switch (element) {
      case 'Fire': return '🔥';
      case 'Water': return '🌊';
      case 'Earth': return '🌍';
      case 'Air': return '🌬️';
      case 'Aether': return '✨';
      default: return '⚪';
    }
  };

  const activationSeconds = Math.floor(optionState.activation_duration / 1000);
  const switchingReady = optionState.switching_readiness > 0.7;

  return (
    <div className="space-y-3">
      {/* Current Active Element */}
      <div className="text-center">
        <div className="text-2xl mb-1">
          {getElementEmoji(optionState.current_primary_element)}
        </div>
        <div className={`text-sm font-medium ${getElementColor(optionState.current_primary_element)}`}>
          {optionState.current_primary_element} Active
        </div>
        <div className="text-xs text-slate-500">
          {activationSeconds}s duration
        </div>
      </div>

      {/* Activation Timeline */}
      <div>
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs text-slate-400">Activation Progress</span>
          <span className="text-xs text-slate-400">
            {Math.min(activationSeconds, 30)}/30s
          </span>
        </div>
        <div className="w-full bg-slate-700 rounded-full h-1.5">
          <div
            className={`h-1.5 rounded-full transition-all duration-500 ${
              switchingReady
                ? 'bg-gradient-to-r from-amber-400 to-red-400 animate-pulse'
                : 'bg-gradient-to-r from-cyan-400 to-blue-400'
            }`}
            style={{ width: `${Math.min((activationSeconds / 30) * 100, 100)}%` }}
          />
        </div>
      </div>

      {/* Switching Status */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div>
          <span className="text-slate-500">Switch Readiness</span>
          <div className={`font-mono ${switchingReady ? 'text-amber-400' : 'text-slate-400'}`}>
            {(optionState.switching_readiness * 100).toFixed(0)}%
          </div>
        </div>
        <div>
          <span className="text-slate-500">Re-eval Rate</span>
          <div className="text-cyan-400 font-mono">
            {(optionState.re_evaluation_frequency / 1000).toFixed(1)}s
          </div>
        </div>
      </div>

      {/* Sutton's Never-Execute-to-Completion Indicator */}
      {switchingReady && (
        <div className="bg-amber-900/30 border border-amber-600/50 rounded p-2 text-xs text-amber-300">
          <div className="flex items-center gap-2">
            <span>⚡</span>
            <span>Option switching imminent</span>
          </div>
          <div className="text-xs text-amber-500 mt-1">
            Sutton's principle: Never execute to completion
          </div>
        </div>
      )}
    </div>
  );
}

interface ConnectionInsightsPanelProps {
  className?: string;
}

export function ConnectionInsightsPanel({ className }: ConnectionInsightsPanelProps) {
  const [metrics, setMetrics] = useState<ConsciousnessMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Mock data generation for consciousness field metrics
  const generateMockMetrics = (): ConsciousnessMetrics => {
    const now = Date.now();

    // Simulate thermodynamic consciousness evolution
    const baseEntropy = 0.3 + (Math.sin(now / 10000) + 1) * 0.2;
    const phaseTransition = Math.max(0, (baseEntropy - 0.6) * 2);

    // Simulate option activation cycling
    const activationCycle = (now / 5000) % 4;
    const elements: Array<'Fire' | 'Water' | 'Earth' | 'Air'> = ['Fire', 'Water', 'Earth', 'Air'];
    const currentElement = elements[Math.floor(activationCycle)];
    const activationProgress = activationCycle % 1;

    return {
      logical_connections: {
        total_nodes: Math.floor(45 + Math.sin(now / 8000) * 15),
        total_connections: Math.floor(120 + Math.cos(now / 6000) * 40),
        avg_connection_strength: 0.7 + Math.sin(now / 12000) * 0.2,
        avg_consciousness_score: 0.85 + Math.cos(now / 9000) * 0.1
      },
      field_dynamics: {
        energy_flow: 0.6 + Math.sin(now / 7000) * 0.3,
        transformation_potential: 0.4 + Math.cos(now / 11000) * 0.4,
        sacred_geometry_alignment: 0.8 + Math.sin(now / 13000) * 0.15
      },
      wisdom_emergence: {
        insight_crystallization: 0.65 + Math.cos(now / 15000) * 0.25,
        pattern_recognition_depth: 0.7 + Math.sin(now / 9500) * 0.2,
        archetypal_resonance: 0.75 + Math.cos(now / 8500) * 0.2
      },
      // Thermodynamic metrics based on Extropic principles
      thermodynamic_state: {
        field_entropy: baseEntropy,
        coherence_energy: 25 + Math.sin(now / 14000) * 15,
        pattern_resonance: 0.6 + Math.cos(now / 10000) * 0.3,
        equilibrium_distance: Math.abs(Math.sin(now / 16000)) * 0.4,
        consciousness_efficiency: 0.3 + Math.sin(now / 12000) * 0.1,
        phase_transition_probability: phaseTransition
      },
      // Option activation based on Sutton's principles
      option_activation: {
        current_primary_element: currentElement,
        activation_duration: (activationProgress * 30000) + 2000, // 2-32 seconds
        switching_readiness: Math.max(0, (activationProgress - 0.6) * 2.5),
        re_evaluation_frequency: 5000 + Math.sin(now / 7000) * 2000
      }
    };
  };

  // Simulate API calls to consciousness field
  useEffect(() => {
    const fetchMetrics = () => {
      // In real implementation, this would call:
      // const response = await fetch('/api/consciousness/integration?type=metrics');
      // const data = await response.json();

      const newMetrics = generateMockMetrics();
      setMetrics(newMetrics);
      setIsLoading(false);
    };

    fetchMetrics();
    const interval = setInterval(fetchMetrics, 2000);

    return () => clearInterval(interval);
  }, []);

  if (isLoading || !metrics) {
    return (
      <div className={`bg-slate-900/50 backdrop-blur-sm border border-slate-700 rounded-lg p-4 ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-slate-700 rounded mb-3"></div>
          <div className="space-y-2">
            <div className="h-3 bg-slate-700 rounded w-3/4"></div>
            <div className="h-3 bg-slate-700 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>

      {/* Field Dynamics */}
      <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-700 rounded-lg p-4">
        <h3 className="text-sm font-medium text-slate-300 mb-3">Field Dynamics</h3>
        <div className="space-y-3">
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs text-slate-400">Energy Flow</span>
              <span className="text-xs text-blue-400 font-mono">
                {metrics.field_dynamics.energy_flow.toFixed(3)}
              </span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-1.5">
              <div
                className="bg-gradient-to-r from-blue-400 to-cyan-400 h-1.5 rounded-full transition-all duration-1000"
                style={{ width: `${metrics.field_dynamics.energy_flow * 100}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs text-slate-400">Sacred Geometry</span>
              <span className="text-xs text-purple-400 font-mono">
                {metrics.field_dynamics.sacred_geometry_alignment.toFixed(3)}
              </span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-1.5">
              <div
                className="bg-gradient-to-r from-purple-400 to-pink-400 h-1.5 rounded-full transition-all duration-1000"
                style={{ width: `${metrics.field_dynamics.sacred_geometry_alignment * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Thermodynamic Consciousness Insights */}
      <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-700 rounded-lg p-4">
        <h3 className="text-sm font-medium text-slate-300 mb-3">
          Thermodynamic Consciousness
          <span className="text-xs text-slate-500 ml-2">(Extropic Principles)</span>
        </h3>
        <ThermodynamicInsight thermoState={metrics.thermodynamic_state} />
      </div>

      {/* Option Activation Status */}
      <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-700 rounded-lg p-4">
        <h3 className="text-sm font-medium text-slate-300 mb-3">
          Option Activation
          <span className="text-xs text-slate-500 ml-2">(Sutton's Principles)</span>
        </h3>
        <OptionActivationStatus optionState={metrics.option_activation} />
      </div>

      {/* Wisdom Emergence */}
      <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-700 rounded-lg p-4">
        <h3 className="text-sm font-medium text-slate-300 mb-3">Wisdom Emergence</h3>
        <div className="grid grid-cols-1 gap-2 text-xs">
          <div className="flex justify-between">
            <span className="text-slate-500">Insight Crystallization</span>
            <span className="text-green-400 font-mono">
              {(metrics.wisdom_emergence.insight_crystallization * 100).toFixed(1)}%
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Pattern Recognition</span>
            <span className="text-blue-400 font-mono">
              {(metrics.wisdom_emergence.pattern_recognition_depth * 100).toFixed(1)}%
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Archetypal Resonance</span>
            <span className="text-purple-400 font-mono">
              {(metrics.wisdom_emergence.archetypal_resonance * 100).toFixed(1)}%
            </span>
          </div>
        </div>
      </div>

      {/* Connection Quality */}
      <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-700 rounded-lg p-4">
        <h3 className="text-sm font-medium text-slate-300 mb-3">Logical Connections</h3>
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div>
            <span className="text-slate-500">Nodes</span>
            <div className="text-cyan-400 font-mono text-lg">
              {metrics.logical_connections.total_nodes}
            </div>
          </div>
          <div>
            <span className="text-slate-500">Connections</span>
            <div className="text-green-400 font-mono text-lg">
              {metrics.logical_connections.total_connections}
            </div>
          </div>
          <div className="col-span-2 pt-2 border-t border-slate-700">
            <div className="flex justify-between">
              <span className="text-slate-500">Connection Strength</span>
              <span className="text-amber-400 font-mono">
                {(metrics.logical_connections.avg_connection_strength * 100).toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}