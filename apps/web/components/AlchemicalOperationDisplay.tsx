/**
 * Alchemical Operation Display Component
 * Shows the current alchemical operation with visual indicators and guidance
 */

import React from 'react';
import { ElementalWheelCompact } from './ElementalWheel';

export interface AlchemicalOperationData {
  currentOperation: string;
  operationDescription: string;
  typicalDuration: string;
  progressIndicators: string[];
  whatToExpectNext: string;
  elementalCirculation: {
    currentElement: 'Earth' | 'Water' | 'Fire' | 'Air';
    direction: 'ascending' | 'descending';
    completionPercentage: number;
  };
  emergencePatterns?: string[];
  supportingPractices?: string[];
}

interface AlchemicalOperationDisplayProps {
  operation: AlchemicalOperationData;
  variant?: 'compact' | 'detailed' | 'card';
  showPractices?: boolean;
}

export function AlchemicalOperationDisplay({
  operation,
  variant = 'detailed',
  showPractices = true
}: AlchemicalOperationDisplayProps) {
  const operationColors = {
    calcination: 'from-red-500 to-orange-500',
    solutio: 'from-blue-500 to-cyan-500',
    separatio: 'from-yellow-500 to-amber-500',
    conjunctio: 'from-purple-500 to-pink-500',
    fermentation: 'from-green-500 to-emerald-500',
    distillation: 'from-indigo-500 to-blue-500',
    coagulation: 'from-amber-500 to-yellow-500'
  };

  const operationIcons = {
    calcination: '🔥',
    solutio: '💧',
    separatio: '🌪️',
    conjunctio: '⚡',
    fermentation: '🍄',
    distillation: '💎',
    coagulation: '🏔️'
  };

  const operationKey = operation.currentOperation.toLowerCase();
  const colorClass = operationColors[operationKey as keyof typeof operationColors] || 'from-purple-500 to-blue-500';
  const icon = operationIcons[operationKey as keyof typeof operationIcons] || '✨';

  if (variant === 'compact') {
    return (
      <div className="bg-white/80 backdrop-blur-sm rounded-lg border border-purple-200/50 p-3">
        <div className="flex items-center space-x-3">
          <div className={`w-8 h-8 rounded-full bg-gradient-to-r ${colorClass} flex items-center justify-center text-white text-sm`}>
            {icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-gray-900 truncate">
              {operation.currentOperation}
            </div>
            <div className="text-xs text-gray-500 truncate">
              {operation.typicalDuration}
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-purple-600 font-medium">
              {operation.elementalCirculation.completionPercentage}%
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'card') {
    return (
      <div className="bg-white/90 backdrop-blur-sm rounded-xl border border-purple-200/50 p-6 shadow-lg">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${colorClass} flex items-center justify-center text-white text-xl shadow-lg`}>
                {icon}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 capitalize">
                  {operation.currentOperation}
                </h3>
                <p className="text-sm text-gray-600">{operation.typicalDuration}</p>
              </div>
            </div>
          </div>

          {/* Description */}
          <p className="text-sm text-gray-700 leading-relaxed">
            {operation.operationDescription}
          </p>

          {/* Elemental Circulation */}
          <div className="space-y-2">
            <div className="text-xs font-medium text-gray-600 uppercase tracking-wide">
              Elemental Circulation
            </div>
            <ElementalWheelCompact circulation={operation.elementalCirculation} />
          </div>

          {/* Progress Indicators */}
          {operation.progressIndicators && operation.progressIndicators.length > 0 && (
            <div className="space-y-2">
              <div className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                Current Signs
              </div>
              <ul className="space-y-1">
                {operation.progressIndicators.map((indicator, index) => (
                  <li key={index} className="text-xs text-gray-600 flex items-start space-x-2">
                    <span className="text-purple-400 mt-0.5">•</span>
                    <span>{indicator}</span>
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
      {/* Main Operation Display */}
      <div className="bg-white/90 backdrop-blur-sm rounded-xl border border-purple-200/50 p-6 shadow-lg">
        <div className="space-y-5">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4">
              <div className={`w-14 h-14 rounded-full bg-gradient-to-r ${colorClass} flex items-center justify-center text-white text-2xl shadow-lg shadow-purple-200/50`}>
                {icon}
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 capitalize">
                  {operation.currentOperation}
                </h2>
                <p className="text-sm text-purple-600 font-medium">{operation.typicalDuration}</p>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="bg-purple-50/50 rounded-lg p-4 border border-purple-100">
            <p className="text-sm text-gray-700 leading-relaxed">
              {operation.operationDescription}
            </p>
          </div>

          {/* Elemental Circulation */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-800">Elemental Circulation</h4>
            <ElementalWheelCompact circulation={operation.elementalCirculation} />
          </div>

          {/* Progress Indicators */}
          {operation.progressIndicators && operation.progressIndicators.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-gray-800">What You Might Notice</h4>
              <div className="grid gap-2">
                {operation.progressIndicators.map((indicator, index) => (
                  <div key={index} className="flex items-start space-x-2 text-sm text-gray-600">
                    <span className="text-purple-400 mt-1">•</span>
                    <span>{indicator}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* What to Expect Next */}
          {operation.whatToExpectNext && (
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-gray-800">What's Coming Next</h4>
              <p className="text-sm text-gray-600">{operation.whatToExpectNext}</p>
            </div>
          )}
        </div>
      </div>

      {/* Emergence Patterns */}
      {operation.emergencePatterns && operation.emergencePatterns.length > 0 && (
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-4 border border-purple-200/50">
          <h4 className="text-sm font-semibold text-gray-800 mb-3">Emergence Patterns</h4>
          <div className="space-y-2">
            {operation.emergencePatterns.map((pattern, index) => (
              <div key={index} className="flex items-start space-x-2 text-xs text-gray-600">
                <span className="text-blue-400 mt-1">✧</span>
                <span>{pattern}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Supporting Practices */}
      {showPractices && operation.supportingPractices && operation.supportingPractices.length > 0 && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200/50">
          <h4 className="text-sm font-semibold text-gray-800 mb-3">Supporting Practices</h4>
          <div className="space-y-2">
            {operation.supportingPractices.map((practice, index) => (
              <div key={index} className="flex items-start space-x-2 text-xs text-gray-600">
                <span className="text-green-400 mt-1">⟐</span>
                <span>{practice}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Mini version for status indicators
 */
export function AlchemicalOperationBadge({ operation }: { operation: AlchemicalOperationData }) {
  const operationColors = {
    calcination: 'bg-red-500',
    solutio: 'bg-blue-500',
    separatio: 'bg-yellow-500',
    conjunctio: 'bg-purple-500',
    fermentation: 'bg-green-500',
    distillation: 'bg-indigo-500',
    coagulation: 'bg-amber-500'
  };

  const operationKey = operation.currentOperation.toLowerCase();
  const colorClass = operationColors[operationKey as keyof typeof operationColors] || 'bg-purple-500';

  return (
    <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-white ${colorClass}`}>
      <span className="w-1.5 h-1.5 bg-white/80 rounded-full mr-1.5 animate-pulse"></span>
      {operation.currentOperation}
    </div>
  );
}