'use client';

/**
 * Shift Patterns Chart
 * Visualizes consciousness state transitions over time with attended/unattended markers
 */

import React from 'react';
import { type ShiftPatternMetrics, type ConsciousnessShift } from '@/lib/insights/ShiftPatternTracker';

interface ShiftPatternsChartProps {
  metrics: ShiftPatternMetrics;
}

export function ShiftPatternsChart({ metrics }: ShiftPatternsChartProps) {
  const { totalShifts, avgMagnitude, attendedPercentage, dominantDirection, shifts } = metrics;

  // Prepare data for visualization
  const chartWidth = 500;
  const chartHeight = 200;
  const maxMagnitude = Math.max(...shifts.map(s => s.magnitude), 0.3);

  return (
    <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-purple-700/30 p-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="text-3xl">🌊</div>
        <h2 className="text-2xl font-bold text-white">Shift Patterns</h2>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div>
          <div className="text-sm text-gray-400 mb-1">Total Shifts</div>
          <div className="text-4xl font-bold text-blue-300">{totalShifts}</div>
        </div>
        <div>
          <div className="text-sm text-gray-400 mb-1">Avg Magnitude</div>
          <div className="text-4xl font-bold text-cyan-300">{avgMagnitude}%</div>
        </div>
        <div>
          <div className="text-sm text-gray-400 mb-1">Attended Shifts</div>
          <div className="text-4xl font-bold text-green-300">{attendedPercentage}%</div>
        </div>
        <div>
          <div className="text-sm text-gray-400 mb-1">Dominant Direction</div>
          <div className="text-3xl font-bold text-purple-300 uppercase">{dominantDirection}</div>
        </div>
      </div>

      {/* Timeline Chart */}
      {shifts.length > 0 ? (
        <div className="relative" style={{ height: chartHeight }}>
          <svg width="100%" height={chartHeight} className="overflow-visible">
            {/* Grid lines */}
            {[0.12, 0.16, 0.2, 0.24].map((value, i) => (
              <g key={i}>
                <line
                  x1="0"
                  y1={chartHeight - (value / maxMagnitude) * chartHeight}
                  x2="100%"
                  y2={chartHeight - (value / maxMagnitude) * chartHeight}
                  stroke="#374151"
                  strokeWidth="1"
                  strokeDasharray="2,2"
                />
                <text
                  x="0"
                  y={chartHeight - (value / maxMagnitude) * chartHeight - 5}
                  fill="#6B7280"
                  fontSize="10"
                >
                  {value.toFixed(2)}
                </text>
              </g>
            ))}

            {/* Y-axis label */}
            <text
              x="-80"
              y="15"
              fill="#9CA3AF"
              fontSize="12"
              transform="rotate(-90)"
              style={{ transformOrigin: 'left top' }}
            >
              Magnitude
            </text>

            {/* Plot shifts */}
            {shifts.map((shift, i) => {
              const x = (i / (shifts.length - 1 || 1)) * 90 + 5; // Percentage with padding
              const y = chartHeight - (shift.magnitude / maxMagnitude) * (chartHeight - 20);
              const prevShift = shifts[i - 1];
              const prevX = prevShift ? ((i - 1) / (shifts.length - 1 || 1)) * 90 + 5 : x;
              const prevY = prevShift ? chartHeight - (prevShift.magnitude / maxMagnitude) * (chartHeight - 20) : y;

              return (
                <g key={shift.id || i}>
                  {/* Line connecting to previous point */}
                  {i > 0 && (
                    <line
                      x1={`${prevX}%`}
                      y1={prevY}
                      x2={`${x}%`}
                      y2={y}
                      stroke="#3B82F6"
                      strokeWidth="2"
                    />
                  )}

                  {/* Shift marker */}
                  <circle
                    cx={`${x}%`}
                    cy={y}
                    r="4"
                    fill={shift.wasAttended ? '#10B981' : '#EF4444'}
                    stroke={shift.wasAttended ? '#34D399' : '#F87171'}
                    strokeWidth="2"
                    className="cursor-pointer hover:r-6 transition-all"
                  >
                    <title>
                      {shift.fromState} → {shift.toState}
                      {'\n'}Magnitude: {(shift.magnitude * 100).toFixed(1)}%
                      {'\n'}{shift.wasAttended ? 'Attended ✓' : 'Unattended'}
                      {shift.trigger && `\nTrigger: ${shift.trigger}`}
                    </title>
                  </circle>
                </g>
              );
            })}

            {/* X-axis labels (dates) */}
            {[0, 25, 50, 75, 100].map((percent, i) => {
              const shiftIndex = Math.floor((shifts.length - 1) * (percent / 100));
              const shift = shifts[shiftIndex];
              if (!shift) return null;

              const date = new Date(shift.timestamp);
              const label = `${date.getMonth() + 1}/${date.getDate()}`;

              return (
                <text
                  key={i}
                  x={`${percent}%`}
                  y={chartHeight + 15}
                  fill="#6B7280"
                  fontSize="10"
                  textAnchor="middle"
                >
                  {label}
                </text>
              );
            })}
          </svg>

          {/* Legend */}
          <div className="flex items-center justify-end space-x-4 mt-4 text-xs">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="text-gray-400">Attended</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span className="text-gray-400">Unattended</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500">
          No shift data yet. Shifts will appear as you engage with MAIA and track your development.
        </div>
      )}
    </div>
  );
}
