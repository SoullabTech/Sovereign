/**
 * Breakthrough Trajectory Display Component
 * Visualizes breakthrough predictions, spiral patterns, and readiness indicators
 */

import React from 'react';
import { BreakthroughPrediction, BreakthroughType, SpiralPatternAnalysis, SpiralPatternType } from '@/lib/maia/BreakthroughTrajectoryEngine';

interface BreakthroughTrajectoryDisplayProps {
  prediction: BreakthroughPrediction;
  pattern?: SpiralPatternAnalysis;
  variant?: 'detailed' | 'compact' | 'card';
}

export function BreakthroughTrajectoryDisplay({
  prediction,
  pattern,
  variant = 'detailed'
}: BreakthroughTrajectoryDisplayProps) {

  const probabilityColor = getProbabilityColor(prediction.probability);
  const readinessColor = getReadinessColor(prediction.readinessScore);
  const typeColor = getTypeColor(prediction.type);

  if (variant === 'compact') {
    return (
      <div className="bg-white/80 backdrop-blur-sm rounded-lg border border-indigo-200/50 p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${probabilityColor.bg}`} />
            <span className="font-medium text-gray-800">
              {Math.round(prediction.probability * 100)}% Breakthrough Probability
            </span>
          </div>
          <div className="text-xs text-gray-500 uppercase tracking-wide">
            {prediction.timeframe}
          </div>
        </div>
        <div className="text-sm text-gray-600">
          <span className="font-medium">{formatBreakthroughType(prediction.type)}</span> breakthrough likely
        </div>
      </div>
    );
  }

  if (variant === 'card') {
    return (
      <div className="bg-white/90 backdrop-blur-sm rounded-xl border border-indigo-200/50 p-6 shadow-lg">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Breakthrough Trajectory
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                {prediction.confidenceLevel} confidence prediction
              </p>
            </div>
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${probabilityColor.bg} ${probabilityColor.text}`}>
              {Math.round(prediction.probability * 100)}%
            </div>
          </div>

          {/* Main Prediction */}
          <div className="bg-indigo-50/50 rounded-lg p-4">
            <div className="flex items-center space-x-3 mb-2">
              <div className={`w-4 h-4 rounded-full ${typeColor}`} />
              <span className="font-medium text-gray-800">
                {formatBreakthroughType(prediction.type)} Breakthrough
              </span>
              <span className="text-sm text-gray-500">in {prediction.timeframe}</span>
            </div>
            <div className="text-sm text-gray-600">
              Readiness Score: <span className={`font-medium ${readinessColor}`}>
                {Math.round(prediction.readinessScore * 100)}%
              </span>
            </div>
          </div>

          {/* Trigger Factors */}
          {prediction.triggerFactors.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-800 mb-2">Key Triggers</h4>
              <ul className="space-y-1">
                {prediction.triggerFactors.slice(0, 3).map((factor, index) => (
                  <li key={index} className="text-xs text-gray-600 flex items-start space-x-2">
                    <span className="text-indigo-400 mt-0.5">•</span>
                    <span>{factor}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Detailed variant
  return (
    <div className="space-y-6">
      {/* Main Prediction Card */}
      <div className="bg-white/90 backdrop-blur-sm rounded-xl border border-indigo-200/50 p-6 shadow-lg">
        <div className="space-y-5">
          {/* Header with Probability */}
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Breakthrough Trajectory Analysis
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                AI-powered prediction based on spiral positioning and alchemical operations
              </p>
            </div>
            <div className="text-right">
              <div className={`inline-flex px-4 py-2 rounded-full text-lg font-bold ${probabilityColor.bg} ${probabilityColor.text}`}>
                {Math.round(prediction.probability * 100)}%
              </div>
              <div className="text-xs text-gray-500 mt-1 uppercase tracking-wide">
                {prediction.confidenceLevel} confidence
              </div>
            </div>
          </div>

          {/* Main Prediction */}
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-100">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <div className="text-sm text-gray-600 mb-1">Breakthrough Type</div>
                <div className={`font-semibold text-lg flex items-center space-x-2`}>
                  <div className={`w-3 h-3 rounded-full ${typeColor}`} />
                  <span>{formatBreakthroughType(prediction.type)}</span>
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600 mb-1">Expected Timeframe</div>
                <div className="font-semibold text-lg text-gray-800">
                  {prediction.timeframe}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600 mb-1">Readiness Score</div>
                <div className={`font-semibold text-lg ${readinessColor}`}>
                  {Math.round(prediction.readinessScore * 100)}%
                </div>
              </div>
            </div>

            {prediction.nextLikelyBreakthrough && (
              <div className="mt-4 pt-4 border-t border-indigo-200">
                <div className="text-sm text-gray-600">
                  <span className="font-medium">Predicted Date:</span>{' '}
                  {prediction.nextLikelyBreakthrough.toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Readiness Indicator */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-800">Readiness Indicators</h4>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className={`h-3 rounded-full transition-all duration-500 ${readinessColor.includes('red') ? 'bg-red-500' : readinessColor.includes('yellow') ? 'bg-yellow-500' : 'bg-green-500'}`}
                style={{ width: `${prediction.readinessScore * 100}%` }}
              />
            </div>
            <div className="text-xs text-gray-600">
              {prediction.readinessScore < 0.3
                ? 'Building foundation - breakthrough not yet imminent'
                : prediction.readinessScore < 0.7
                ? 'Gathering momentum - breakthrough becoming possible'
                : 'High readiness - breakthrough likely soon'
              }
            </div>
          </div>
        </div>
      </div>

      {/* Trigger Factors */}
      {prediction.triggerFactors.length > 0 && (
        <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-green-200/50 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
            <span className="text-green-500">⚡</span>
            <span>Breakthrough Triggers</span>
          </h3>
          <div className="space-y-3">
            {prediction.triggerFactors.map((factor, index) => (
              <div key={index} className="flex items-start space-x-3">
                <span className="text-green-400 mt-1">→</span>
                <span className="text-sm text-gray-700">{factor}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Blockers and Accelerators */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Blockers */}
        {prediction.blockers.length > 0 && (
          <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-red-200/50 p-6">
            <h4 className="text-md font-semibold text-gray-900 mb-3 flex items-center space-x-2">
              <span className="text-red-500">⚠</span>
              <span>Potential Blockers</span>
            </h4>
            <div className="space-y-2">
              {prediction.blockers.map((blocker, index) => (
                <div key={index} className="text-sm text-gray-600 flex items-start space-x-2">
                  <span className="text-red-400 mt-0.5">•</span>
                  <span>{blocker}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Accelerators */}
        {prediction.accelerators.length > 0 && (
          <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-blue-200/50 p-6">
            <h4 className="text-md font-semibold text-gray-900 mb-3 flex items-center space-x-2">
              <span className="text-blue-500">🚀</span>
              <span>Accelerators</span>
            </h4>
            <div className="space-y-2">
              {prediction.accelerators.map((accelerator, index) => (
                <div key={index} className="text-sm text-gray-600 flex items-start space-x-2">
                  <span className="text-blue-400 mt-0.5">•</span>
                  <span>{accelerator}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Spiral Pattern Analysis */}
      {pattern && (
        <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-purple-200/50 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Spiral Pattern Analysis</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-sm text-gray-600 mb-1">Current Pattern</div>
              <div className="font-semibold text-purple-700 capitalize">
                {pattern.currentPattern.replace('_', ' ')}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600 mb-1">Pattern Maturity</div>
              <div className="font-semibold text-gray-800">
                {Math.round(pattern.patternMaturity * 100)}%
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600 mb-1">Cycle Position</div>
              <div className="font-semibold text-gray-800">
                {Math.round(pattern.cyclePosition * 100)}%
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600 mb-1">Transition Probability</div>
              <div className="font-semibold text-indigo-700">
                {Math.round(pattern.transitionProbability * 100)}%
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper functions
function getProbabilityColor(probability: number) {
  if (probability < 0.3) {
    return { bg: 'bg-gray-100', text: 'text-gray-600' };
  } else if (probability < 0.6) {
    return { bg: 'bg-yellow-100', text: 'text-yellow-800' };
  } else {
    return { bg: 'bg-green-100', text: 'text-green-800' };
  }
}

function getReadinessColor(readiness: number): string {
  if (readiness < 0.3) return 'text-red-600';
  if (readiness < 0.7) return 'text-yellow-600';
  return 'text-green-600';
}

function getTypeColor(type: BreakthroughType): string {
  const colors = {
    [BreakthroughType.COGNITIVE]: 'bg-blue-500',
    [BreakthroughType.EMOTIONAL]: 'bg-pink-500',
    [BreakthroughType.ENERGETIC]: 'bg-yellow-500',
    [BreakthroughType.RELATIONAL]: 'bg-green-500',
    [BreakthroughType.CREATIVE]: 'bg-orange-500',
    [BreakthroughType.SOMATIC]: 'bg-red-500',
    [BreakthroughType.SPIRITUAL]: 'bg-purple-500',
    [BreakthroughType.SHADOW]: 'bg-gray-600',
    [BreakthroughType.ALCHEMICAL]: 'bg-indigo-500'
  };
  return colors[type] || 'bg-gray-500';
}

function formatBreakthroughType(type: BreakthroughType): string {
  return type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();
}