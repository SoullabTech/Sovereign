/**
 * Elemental Wheel Component
 * Visualizes the toroidal circulation through the four elements
 * Shows direction, progress, and current elemental state
 */

import React from 'react';
import { ElementIcon } from './ElementIcon';

export interface ElementalCirculationData {
  currentElement: 'Earth' | 'Water' | 'Fire' | 'Air';
  direction: 'ascending' | 'descending';
  completionPercentage: number;
  nextElement?: string;
  momentum?: number;
}

interface ElementalWheelProps {
  circulation: ElementalCirculationData;
  size?: 'small' | 'medium' | 'large';
  showLabels?: boolean;
  animated?: boolean;
}

export function ElementalWheel({
  circulation,
  size = 'medium',
  showLabels = true,
  animated = true
}: ElementalWheelProps) {
  const sizeClasses = {
    small: 'w-24 h-24',
    medium: 'w-32 h-32',
    large: 'w-48 h-48'
  };

  const elements = ['Fire', 'Air', 'Water', 'Earth'] as const;
  const elementPositions = {
    Fire: { top: '10%', left: '50%', angle: 0 },      // Top
    Air: { top: '50%', left: '90%', angle: 90 },       // Right
    Water: { top: '90%', left: '50%', angle: 180 },    // Bottom
    Earth: { top: '50%', left: '10%', angle: 270 }     // Left
  };

  const currentIndex = elements.indexOf(circulation.currentElement);
  const nextIndex = circulation.direction === 'ascending'
    ? (currentIndex + 1) % elements.length
    : (currentIndex - 1 + elements.length) % elements.length;

  const nextElement = elements[nextIndex];

  return (
    <div className="flex flex-col items-center space-y-4">
      {/* Main Wheel */}
      <div className={`relative ${sizeClasses[size]} mx-auto`}>
        {/* Outer Circle */}
        <div className="absolute inset-0 rounded-full border-2 border-purple-200/30 bg-gradient-to-br from-purple-50/20 to-purple-100/20">

          {/* Direction Indicator - Arrow showing circulation flow */}
          <div className="absolute inset-2 rounded-full border border-purple-300/40">
            <div
              className={`absolute inset-0 rounded-full border-2 border-transparent ${animated ? 'animate-spin' : ''}`}
              style={{
                borderTopColor: circulation.direction === 'ascending' ? '#8b5cf6' : 'transparent',
                borderBottomColor: circulation.direction === 'descending' ? '#8b5cf6' : 'transparent',
                animationDuration: circulation.momentum ? `${4 - (circulation.momentum * 3)}s` : '4s',
                animationDirection: circulation.direction === 'ascending' ? 'normal' : 'reverse'
              }}
            />
          </div>

          {/* Elements positioned around the circle */}
          {elements.map((element, index) => {
            const position = elementPositions[element];
            const isCurrent = element === circulation.currentElement;
            const isNext = element === nextElement;

            return (
              <div
                key={element}
                className="absolute transform -translate-x-1/2 -translate-y-1/2"
                style={{
                  top: position.top,
                  left: position.left
                }}
              >
                {/* Element Container */}
                <div className={`
                  relative flex items-center justify-center rounded-full transition-all duration-700
                  ${isCurrent
                    ? 'w-8 h-8 bg-purple-500 shadow-lg shadow-purple-500/50 scale-125'
                    : isNext
                    ? 'w-6 h-6 bg-purple-300 shadow-md scale-110'
                    : 'w-5 h-5 bg-purple-200/60 scale-100'
                  }
                `}>
                  <ElementIcon
                    type={element.toLowerCase() as any}
                    className={`
                      ${isCurrent ? 'w-5 h-5 filter brightness-0 invert' : 'w-4 h-4'}
                    `}
                  />

                  {/* Current Element Pulse Effect */}
                  {isCurrent && (
                    <div className="absolute inset-0 rounded-full bg-purple-400 animate-ping opacity-20" />
                  )}
                </div>

                {/* Element Label */}
                {showLabels && (
                  <div className={`
                    absolute top-full mt-2 left-1/2 transform -translate-x-1/2
                    text-xs font-medium whitespace-nowrap
                    ${isCurrent ? 'text-purple-700 font-semibold' : 'text-purple-500'}
                  `}>
                    {element}
                  </div>
                )}
              </div>
            );
          })}

          {/* Center Progress Indicator */}
          <div className="absolute inset-1/4 rounded-full bg-gradient-to-br from-purple-50 to-purple-100/50 border border-purple-200/50 flex items-center justify-center">
            <div className="text-center">
              <div className="text-lg font-bold text-purple-700">
                {circulation.completionPercentage}%
              </div>
              <div className="text-xs text-purple-500 font-medium">
                {circulation.direction === 'ascending' ? '↗' : '↙'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Status Information */}
      <div className="text-center space-y-2">
        <div className="text-sm text-purple-600">
          <span className="font-medium">Current:</span> {circulation.currentElement}
        </div>
        {circulation.nextElement && (
          <div className="text-xs text-purple-500">
            <span className="font-medium">Next:</span> {nextElement}
          </div>
        )}
        <div className="text-xs text-purple-400">
          {circulation.direction === 'ascending' ? 'Ascending Spiral' : 'Descending Integration'}
        </div>
      </div>
    </div>
  );
}

/**
 * Compact version for smaller displays
 */
export function ElementalWheelCompact({ circulation }: { circulation: ElementalCirculationData }) {
  return (
    <div className="flex items-center space-x-3">
      <ElementIcon
        type={circulation.currentElement.toLowerCase() as any}
        className="w-6 h-6"
      />
      <div className="flex-1">
        <div className="flex items-center space-x-2">
          <div className="text-sm font-medium text-purple-700">
            {circulation.currentElement}
          </div>
          <div className="text-xs text-purple-500">
            {circulation.completionPercentage}%
          </div>
        </div>
        <div className="w-full bg-purple-100 rounded-full h-1.5 mt-1">
          <div
            className="bg-purple-500 h-1.5 rounded-full transition-all duration-500"
            style={{ width: `${circulation.completionPercentage}%` }}
          />
        </div>
      </div>
      <div className="text-purple-400">
        {circulation.direction === 'ascending' ? '↗' : '↙'}
      </div>
    </div>
  );
}

/**
 * Detailed version with toroidal flow visualization
 */
export function ElementalWheelDetailed({
  circulation,
  momentum = 0.5
}: {
  circulation: ElementalCirculationData;
  momentum?: number;
}) {
  return (
    <div className="space-y-6">
      <ElementalWheel
        circulation={circulation}
        size="large"
        showLabels={true}
        animated={true}
      />

      {/* Toroidal Flow Indicator */}
      <div className="space-y-3">
        <div className="text-center text-sm font-medium text-purple-700">
          Toroidal Flow
        </div>

        {/* Flow Visualization */}
        <div className="relative h-8 bg-gradient-to-r from-purple-100 via-purple-200 to-purple-100 rounded-full overflow-hidden">
          {/* Flow Animation */}
          <div
            className={`absolute inset-y-0 w-8 bg-gradient-to-r from-transparent via-purple-400 to-transparent rounded-full animate-pulse`}
            style={{
              left: `${circulation.completionPercentage}%`,
              transform: 'translateX(-50%)',
              animationDuration: `${2 - momentum}s`
            }}
          />

          {/* Element Markers */}
          {[0, 25, 50, 75].map((position, index) => (
            <div
              key={index}
              className="absolute top-1/2 w-2 h-2 bg-purple-300 rounded-full transform -translate-y-1/2"
              style={{ left: `${position}%` }}
            />
          ))}
        </div>

        {/* Flow Statistics */}
        <div className="grid grid-cols-3 gap-2 text-xs text-center">
          <div>
            <div className="font-medium text-purple-600">Direction</div>
            <div className="text-purple-500 capitalize">{circulation.direction}</div>
          </div>
          <div>
            <div className="font-medium text-purple-600">Momentum</div>
            <div className="text-purple-500">{Math.round(momentum * 100)}%</div>
          </div>
          <div>
            <div className="font-medium text-purple-600">Phase</div>
            <div className="text-purple-500">{circulation.completionPercentage}%</div>
          </div>
        </div>
      </div>
    </div>
  );
}