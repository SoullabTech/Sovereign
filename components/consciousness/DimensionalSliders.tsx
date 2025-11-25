/**
 * DIMENSIONAL SLIDERS COMPONENT
 *
 * Quick consciousness state capture using 6 dimensional sliders
 * For rapid check-ins and longitudinal tracking
 *
 * Dimensions:
 * - Clarity: confused → crystal clear
 * - Energy: depleted → energized
 * - Connection: isolated → unified
 * - Expansion: contracted → expansive
 * - Presence: dissociated → embodied
 * - Flow: stuck → flowing
 */

'use client';

import React, { useState } from 'react';
import type { ConsciousnessDimensions } from '@/lib/consciousness/QualiaMeasurementEngine';

interface DimensionalSlidersProps {
  onCapture: (dimensions: ConsciousnessDimensions) => void;
  initialValues?: Partial<ConsciousnessDimensions>;
  showLabels?: boolean;
  compact?: boolean;
}

interface DimensionConfig {
  key: keyof ConsciousnessDimensions;
  label: string;
  lowLabel: string;
  highLabel: string;
  icon: string;
  color: string;
}

const DIMENSION_CONFIGS: DimensionConfig[] = [
  {
    key: 'clarity',
    label: 'Clarity',
    lowLabel: 'Confused',
    highLabel: 'Crystal Clear',
    icon: '💎',
    color: 'from-gray-500 to-blue-400'
  },
  {
    key: 'energy',
    label: 'Energy',
    lowLabel: 'Depleted',
    highLabel: 'Energized',
    icon: '⚡',
    color: 'from-gray-500 to-yellow-400'
  },
  {
    key: 'connection',
    label: 'Connection',
    lowLabel: 'Isolated',
    highLabel: 'Unified',
    icon: '🔗',
    color: 'from-gray-500 to-purple-400'
  },
  {
    key: 'expansion',
    label: 'Expansion',
    lowLabel: 'Contracted',
    highLabel: 'Expansive',
    icon: '🌟',
    color: 'from-gray-500 to-indigo-400'
  },
  {
    key: 'presence',
    label: 'Presence',
    lowLabel: 'Dissociated',
    highLabel: 'Embodied',
    icon: '🧘',
    color: 'from-gray-500 to-green-400'
  },
  {
    key: 'flow',
    label: 'Flow',
    lowLabel: 'Stuck',
    highLabel: 'Flowing',
    icon: '🌊',
    color: 'from-gray-500 to-cyan-400'
  }
];

export default function DimensionalSliders({
  onCapture,
  initialValues = {},
  showLabels = true,
  compact = false
}: DimensionalSlidersProps) {
  const [dimensions, setDimensions] = useState<ConsciousnessDimensions>({
    clarity: initialValues.clarity ?? 0.5,
    energy: initialValues.energy ?? 0.5,
    connection: initialValues.connection ?? 0.5,
    expansion: initialValues.expansion ?? 0.5,
    presence: initialValues.presence ?? 0.5,
    flow: initialValues.flow ?? 0.5
  });

  const [hasChanged, setHasChanged] = useState(false);

  const handleSliderChange = (key: keyof ConsciousnessDimensions, value: number) => {
    setDimensions(prev => ({ ...prev, [key]: value }));
    setHasChanged(true);
  };

  const handleSubmit = () => {
    onCapture(dimensions);
    setHasChanged(false);
  };

  const handleReset = () => {
    setDimensions({
      clarity: 0.5,
      energy: 0.5,
      connection: 0.5,
      expansion: 0.5,
      presence: 0.5,
      flow: 0.5
    });
    setHasChanged(false);
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className={`space-y-${compact ? '4' : '6'} p-${compact ? '4' : '6'} bg-white dark:bg-gray-800 rounded-lg shadow-lg`}>
        {/* Header */}
        {showLabels && (
          <div className="text-center mb-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              How are you feeling right now?
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              Move the sliders to capture your current state
            </p>
          </div>
        )}

        {/* Dimensional Sliders */}
        <div className="space-y-6">
          {DIMENSION_CONFIGS.map(config => (
            <DimensionSlider
              key={config.key}
              config={config}
              value={dimensions[config.key]}
              onChange={(value) => handleSliderChange(config.key, value)}
              compact={compact}
              showLabels={showLabels}
            />
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-4 justify-end mt-8 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handleReset}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
            disabled={!hasChanged}
          >
            Reset
          </button>
          <button
            onClick={handleSubmit}
            className={`px-6 py-2 text-sm font-medium text-white rounded-lg transition-all ${
              hasChanged
                ? 'bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 shadow-md'
                : 'bg-gray-400 cursor-not-allowed'
            }`}
            disabled={!hasChanged}
          >
            Capture State
          </button>
        </div>

        {/* Visualization */}
        {showLabels && (
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <DimensionalVisualization dimensions={dimensions} />
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Individual Dimension Slider
 */
function DimensionSlider({
  config,
  value,
  onChange,
  compact,
  showLabels
}: {
  config: DimensionConfig;
  value: number;
  onChange: (value: number) => void;
  compact: boolean;
  showLabels: boolean;
}) {
  const percentage = Math.round(value * 100);

  return (
    <div className="space-y-2">
      {/* Label */}
      {showLabels && (
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
            <span className="text-lg">{config.icon}</span>
            <span>{config.label}</span>
          </label>
          <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">
            {percentage}%
          </span>
        </div>
      )}

      {/* Slider */}
      <div className="relative">
        <input
          type="range"
          min="0"
          max="100"
          value={percentage}
          onChange={(e) => onChange(parseFloat(e.target.value) / 100)}
          className="w-full h-2 rounded-lg appearance-none cursor-pointer slider-thumb"
          style={{
            background: `linear-gradient(to right,
              rgb(156, 163, 175) 0%,
              rgb(156, 163, 175) ${percentage}%,
              rgb(229, 231, 235) ${percentage}%,
              rgb(229, 231, 235) 100%)`
          }}
        />
      </div>

      {/* Low/High Labels */}
      {showLabels && !compact && (
        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>{config.lowLabel}</span>
          <span>{config.highLabel}</span>
        </div>
      )}
    </div>
  );
}

/**
 * Dimensional Visualization (Radar Chart)
 */
function DimensionalVisualization({ dimensions }: { dimensions: ConsciousnessDimensions }) {
  const values = Object.values(dimensions);
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const balance = 1 - Math.sqrt(
    values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length
  );

  return (
    <div className="text-center space-y-2">
      <div className="text-sm text-gray-600 dark:text-gray-400">
        Overall State
      </div>
      <div className="flex justify-center gap-8">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {Math.round(mean * 100)}%
          </div>
          <div className="text-xs text-gray-500">Mean</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {Math.round(balance * 100)}%
          </div>
          <div className="text-xs text-gray-500">Balance</div>
        </div>
      </div>

      {/* Simple bar visualization */}
      <div className="flex gap-1 justify-center mt-4">
        {DIMENSION_CONFIGS.map((config, i) => (
          <div key={config.key} className="text-center">
            <div
              className={`w-8 bg-gradient-to-t ${config.color} rounded-t transition-all duration-300`}
              style={{ height: `${dimensions[config.key] * 100}px` }}
            />
            <div className="text-xs mt-1">{config.icon}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// CSS for custom slider thumb
const sliderStyles = `
  .slider-thumb::-webkit-slider-thumb {
    appearance: none;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    cursor: pointer;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }

  .slider-thumb::-moz-range-thumb {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    cursor: pointer;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    border: none;
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.textContent = sliderStyles;
  document.head.appendChild(styleElement);
}
