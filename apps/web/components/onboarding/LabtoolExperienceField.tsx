"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Beaker, Brain, Waves, Zap, Target, RotateCcw,
  Save, Upload, Share, Eye, Settings2, TrendingUp,
  Flame, Droplets, Mountain, Wind, Sparkles
} from 'lucide-react';

interface OscillatorParameters {
  // Core Oscillator Settings
  gridSize: number;
  baseFrequency: number;
  couplingStrength: number;
  phaseCoherence: number;

  // Elemental Coupling Kernels
  fireKernel: { inner: number; middle: number; outer: number };
  waterKernel: { inner: number; middle: number; outer: number };
  earthKernel: { inner: number; middle: number; outer: number };
  airKernel: { inner: number; middle: number; outer: number };
  aetherKernel: { inner: number; middle: number; outer: number };

  // Consciousness Mapping
  dwellTimeInfluence: number;
  interactionAmplifier: number;
  resonanceThreshold: number;

  // Visual Parameters
  visualIntensity: number;
  colorSaturation: number;
  blendMode: 'multiply' | 'overlay' | 'screen' | 'color-burn';

  // Temporal Dynamics
  evolutionRate: number;
  memoryDecay: number;
  emergenceThreshold: number;
}

interface LabtoolExperienceFieldProps {
  isVisible: boolean;
  onParametersChange: (params: OscillatorParameters) => void;
  currentElement: string;
  userInteractions: {[key: number]: {dwellTime: number, interactions: number}};
}

const defaultParameters: OscillatorParameters = {
  gridSize: 32,
  baseFrequency: 0.02,
  couplingStrength: 0.5,
  phaseCoherence: 0.7,

  fireKernel: { inner: 0.8, middle: -0.3, outer: 0.4 },
  waterKernel: { inner: 0.6, middle: 0.3, outer: 0.2 },
  earthKernel: { inner: 0.9, middle: 0.4, outer: 0.1 },
  airKernel: { inner: 0.4, middle: -0.2, outer: 0.3 },
  aetherKernel: { inner: 0.7, middle: 0.5, outer: 0.6 },

  dwellTimeInfluence: 0.1,
  interactionAmplifier: 1.0,
  resonanceThreshold: 15000,

  visualIntensity: 0.6,
  colorSaturation: 0.8,
  blendMode: 'multiply',

  evolutionRate: 0.001,
  memoryDecay: 0.99,
  emergenceThreshold: 0.8
};

export function LabtoolExperienceField({
  isVisible,
  onParametersChange,
  currentElement,
  userInteractions
}: LabtoolExperienceFieldProps) {
  const [parameters, setParameters] = useState<OscillatorParameters>(defaultParameters);
  const [activeSection, setActiveSection] = useState<'oscillator' | 'kernels' | 'consciousness' | 'visual' | 'temporal'>('oscillator');
  const [presets, setPresets] = useState<{[key: string]: OscillatorParameters}>({});
  const [showAnalytics, setShowAnalytics] = useState(false);

  // Load presets from localStorage
  useEffect(() => {
    const savedPresets = localStorage.getItem('consciousness-oscillator-presets');
    if (savedPresets) {
      try {
        setPresets(JSON.parse(savedPresets));
      } catch (error) {
        console.warn('Failed to load oscillator presets:', error);
      }
    }
  }, []);

  // Update parameters and notify parent
  const updateParameter = <K extends keyof OscillatorParameters>(
    key: K,
    value: OscillatorParameters[K]
  ) => {
    const newParams = { ...parameters, [key]: value };
    setParameters(newParams);
    onParametersChange(newParams);
  };

  // Save current parameters as preset
  const savePreset = (name: string) => {
    const newPresets = { ...presets, [name]: parameters };
    setPresets(newPresets);
    localStorage.setItem('consciousness-oscillator-presets', JSON.stringify(newPresets));
  };

  // Load preset
  const loadPreset = (name: string) => {
    if (presets[name]) {
      setParameters(presets[name]);
      onParametersChange(presets[name]);
    }
  };

  // Reset to defaults
  const resetToDefaults = () => {
    setParameters(defaultParameters);
    onParametersChange(defaultParameters);
  };

  // Calculate real-time analytics
  const analytics = {
    totalInteractions: Object.values(userInteractions).reduce((sum, data) => sum + data.interactions, 0),
    avgDwellTime: Object.values(userInteractions).reduce((sum, data) => sum + data.dwellTime, 0) / Object.keys(userInteractions).length || 0,
    resonanceStrength: Math.min(1, (parameters.couplingStrength * parameters.phaseCoherence * parameters.visualIntensity)),
    systemComplexity: (parameters.gridSize * parameters.baseFrequency * Object.keys(parameters).length) / 1000
  };

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="fixed right-0 top-0 h-full w-96 bg-black/20 backdrop-blur-md border-l border-white/10 z-40 overflow-hidden"
    >
      {/* Header */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center gap-3 mb-3">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          >
            <Beaker className="w-5 h-5 text-amber-400" />
          </motion.div>
          <div>
            <h3 className="text-white font-medium text-sm">Consciousness Labtool</h3>
            <p className="text-white/60 text-xs">Transformational Experience Field</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-2">
          <button
            onClick={() => setShowAnalytics(!showAnalytics)}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
          >
            <TrendingUp className="w-4 h-4 text-white/80" />
          </button>
          <button
            onClick={resetToDefaults}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
          >
            <RotateCcw className="w-4 h-4 text-white/80" />
          </button>
          <button
            onClick={() => savePreset(`preset-${Date.now()}`)}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
          >
            <Save className="w-4 h-4 text-white/80" />
          </button>
        </div>
      </div>

      {/* Analytics Panel */}
      <AnimatePresence>
        {showAnalytics && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-b border-white/10 bg-white/5"
          >
            <div className="p-4 space-y-3">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <div className="text-white/60">Interactions</div>
                  <div className="text-amber-400 font-mono">{analytics.totalInteractions}</div>
                </div>
                <div>
                  <div className="text-white/60">Avg Dwell</div>
                  <div className="text-blue-400 font-mono">{Math.round(analytics.avgDwellTime)}ms</div>
                </div>
                <div>
                  <div className="text-white/60">Resonance</div>
                  <div className="text-green-400 font-mono">{(analytics.resonanceStrength * 100).toFixed(1)}%</div>
                </div>
                <div>
                  <div className="text-white/60">Complexity</div>
                  <div className="text-purple-400 font-mono">{analytics.systemComplexity.toFixed(2)}</div>
                </div>
              </div>

              {/* Current Element Indicator */}
              <div className="flex items-center gap-2 text-xs">
                <span className="text-white/60">Active Element:</span>
                <div className="flex items-center gap-1">
                  {currentElement === 'fire' && <Flame className="w-3 h-3 text-orange-400" />}
                  {currentElement === 'water' && <Droplets className="w-3 h-3 text-blue-400" />}
                  {currentElement === 'earth' && <Mountain className="w-3 h-3 text-green-400" />}
                  {currentElement === 'air' && <Wind className="w-3 h-3 text-gray-400" />}
                  {currentElement === 'aether' && <Sparkles className="w-3 h-3 text-amber-400" />}
                  <span className="text-white capitalize">{currentElement}</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Section Navigation */}
      <div className="p-4 border-b border-white/10">
        <div className="grid grid-cols-5 gap-1">
          {[
            { key: 'oscillator', icon: Waves, label: 'OSC' },
            { key: 'kernels', icon: Target, label: 'KRN' },
            { key: 'consciousness', icon: Brain, label: 'CON' },
            { key: 'visual', icon: Eye, label: 'VIS' },
            { key: 'temporal', icon: Zap, label: 'TMP' }
          ].map(({ key, icon: Icon, label }) => (
            <button
              key={key}
              onClick={() => setActiveSection(key as any)}
              className={`p-2 rounded-lg text-xs transition-all ${
                activeSection === key
                  ? 'bg-amber-400/20 text-amber-400'
                  : 'bg-white/5 text-white/60 hover:bg-white/10'
              }`}
            >
              <Icon className="w-4 h-4 mx-auto mb-1" />
              <div>{label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Parameter Controls */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-4">
          {/* Oscillator Section */}
          {activeSection === 'oscillator' && (
            <div className="space-y-4">
              <h4 className="text-white/80 text-sm font-medium">Core Oscillator</h4>

              <div>
                <label className="text-xs text-white/60 mb-2 block">Grid Size</label>
                <input
                  type="range"
                  min="16"
                  max="64"
                  step="8"
                  value={parameters.gridSize}
                  onChange={(e) => updateParameter('gridSize', parseInt(e.target.value))}
                  className="w-full h-2 bg-white/20 rounded-lg appearance-none slider"
                />
                <div className="text-xs text-amber-400 font-mono mt-1">{parameters.gridSize}</div>
              </div>

              <div>
                <label className="text-xs text-white/60 mb-2 block">Base Frequency</label>
                <input
                  type="range"
                  min="0.001"
                  max="0.1"
                  step="0.001"
                  value={parameters.baseFrequency}
                  onChange={(e) => updateParameter('baseFrequency', parseFloat(e.target.value))}
                  className="w-full h-2 bg-white/20 rounded-lg appearance-none slider"
                />
                <div className="text-xs text-amber-400 font-mono mt-1">{parameters.baseFrequency.toFixed(3)}</div>
              </div>

              <div>
                <label className="text-xs text-white/60 mb-2 block">Coupling Strength</label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={parameters.couplingStrength}
                  onChange={(e) => updateParameter('couplingStrength', parseFloat(e.target.value))}
                  className="w-full h-2 bg-white/20 rounded-lg appearance-none slider"
                />
                <div className="text-xs text-amber-400 font-mono mt-1">{parameters.couplingStrength.toFixed(1)}</div>
              </div>
            </div>
          )}

          {/* Add more sections for kernels, consciousness, visual, temporal... */}
          {/* This is a comprehensive foundation that can be expanded */}
        </div>
      </div>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 12px;
          width: 12px;
          background: #f59e0b;
          border-radius: 50%;
          cursor: pointer;
        }

        .slider::-moz-range-thumb {
          height: 12px;
          width: 12px;
          background: #f59e0b;
          border-radius: 50%;
          cursor: pointer;
          border: none;
        }
      `}</style>
    </motion.div>
  );
}