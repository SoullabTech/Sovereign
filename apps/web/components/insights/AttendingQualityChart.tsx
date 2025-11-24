'use client';

/**
 * Attending Quality Chart
 * Visualizes coherence, presence, and overall attending quality over time
 */

import React from 'react';
import { type AttendingQualityMetrics } from '@/lib/insights/AttendingQualityEngine';

interface AttendingQualityChartProps {
  metrics: AttendingQualityMetrics;
}

export function AttendingQualityChart({ metrics }: AttendingQualityChartProps) {
  const { currentCoherence, currentPresence, currentOverall, trajectory, history } = metrics;

  // Prepare chart data
  const chartHeight = 250;
  const maxValue = 100;

  return (
    <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-pink-700/30 p-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="text-3xl">🎯</div>
        <h2 className="text-2xl font-bold text-white">Attending Quality</h2>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <div className="text-sm text-gray-400 mb-1">Coherence</div>
          <div className="text-4xl font-bold text-blue-300">{currentCoherence}%</div>
        </div>
        <div>
          <div className="text-sm text-gray-400 mb-1">Presence</div>
          <div className="text-4xl font-bold text-purple-300">{currentPresence}%</div>
        </div>
        <div>
          <div className="text-sm text-gray-400 mb-1">Overall Attending</div>
          <div className="text-4xl font-bold text-green-300">{currentOverall}%</div>
        </div>
        <div>
          <div className="text-sm text-gray-400 mb-1">Trajectory</div>
          <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
            trajectory === 'improving' ? 'bg-green-900/50 text-green-300' :
            trajectory === 'declining' ? 'bg-red-900/50 text-red-300' :
            'bg-gray-800/50 text-gray-300'
          }`}>
            {trajectory === 'improving' && '● Improving'}
            {trajectory === 'declining' && '● Declining'}
            {trajectory === 'stable' && '● Stable'}
          </div>
        </div>
      </div>

      {/* Timeline Chart */}
      {history.length > 0 ? (
        <div className="relative" style={{ height: chartHeight }}>
          <svg width="100%" height={chartHeight} className="overflow-visible">
            {/* Grid lines */}
            {[0.2, 0.4, 0.6, 0.8, 1.0].map((value, i) => (
              <g key={i}>
                <line
                  x1="0"
                  y1={chartHeight - value * chartHeight}
                  x2="100%"
                  y2={chartHeight - value * chartHeight}
                  stroke="#374151"
                  strokeWidth="1"
                  strokeDasharray="2,2"
                />
                <text
                  x="0"
                  y={chartHeight - value * chartHeight - 5}
                  fill="#6B7280"
                  fontSize="10"
                >
                  {Math.round(value * 100)}
                </text>
              </g>
            ))}

            {/* Y-axis label */}
            <text
              x="-100"
              y="15"
              fill="#9CA3AF"
              fontSize="12"
              transform="rotate(-90)"
              style={{ transformOrigin: 'left top' }}
            >
              Score
            </text>

            {/* Plot coherence line (blue) */}
            {history.map((snapshot, i) => {
              if (i === 0) return null;
              const prevSnapshot = history[i - 1];
              const x = (i / (history.length - 1)) * 90 + 5;
              const prevX = ((i - 1) / (history.length - 1)) * 90 + 5;
              const y = chartHeight - (snapshot.coherence / maxValue) * (chartHeight - 20);
              const prevY = chartHeight - (prevSnapshot.coherence / maxValue) * (chartHeight - 20);

              return (
                <line
                  key={`coherence-${i}`}
                  x1={`${prevX}%`}
                  y1={prevY}
                  x2={`${x}%`}
                  y2={y}
                  stroke="#3B82F6"
                  strokeWidth="2"
                  opacity="0.8"
                />
              );
            })}

            {/* Plot presence line (purple) */}
            {history.map((snapshot, i) => {
              if (i === 0) return null;
              const prevSnapshot = history[i - 1];
              const x = (i / (history.length - 1)) * 90 + 5;
              const prevX = ((i - 1) / (history.length - 1)) * 90 + 5;
              const y = chartHeight - (snapshot.presence / maxValue) * (chartHeight - 20);
              const prevY = chartHeight - (prevSnapshot.presence / maxValue) * (chartHeight - 20);

              return (
                <line
                  key={`presence-${i}`}
                  x1={`${prevX}%`}
                  y1={prevY}
                  x2={`${x}%`}
                  y2={y}
                  stroke="#A855F7"
                  strokeWidth="2"
                  opacity="0.8"
                />
              );
            })}

            {/* Plot overall line (green) */}
            {history.map((snapshot, i) => {
              if (i === 0) return null;
              const prevSnapshot = history[i - 1];
              const x = (i / (history.length - 1)) * 90 + 5;
              const prevX = ((i - 1) / (history.length - 1)) * 90 + 5;
              const y = chartHeight - (snapshot.overallAttending / maxValue) * (chartHeight - 20);
              const prevY = chartHeight - (prevSnapshot.overallAttending / maxValue) * (chartHeight - 20);

              return (
                <line
                  key={`overall-${i}`}
                  x1={`${prevX}%`}
                  y1={prevY}
                  x2={`${x}%`}
                  y2={y}
                  stroke="#10B981"
                  strokeWidth="2"
                  opacity="0.8"
                />
              );
            })}

            {/* X-axis labels (dates) */}
            {[0, 25, 50, 75, 100].map((percent, i) => {
              const snapshotIndex = Math.floor((history.length - 1) * (percent / 100));
              const snapshot = history[snapshotIndex];
              if (!snapshot) return null;

              const date = new Date(snapshot.timestamp);
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

            {/* X-axis title */}
            <text
              x="50%"
              y={chartHeight + 35}
              fill="#9CA3AF"
              fontSize="12"
              textAnchor="middle"
            >
              Date
            </text>
          </svg>

          {/* Legend */}
          <div className="flex items-center justify-end space-x-4 mt-6 text-xs">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-0.5 bg-blue-500"></div>
              <span className="text-gray-400">Coherence</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-0.5 bg-purple-500"></div>
              <span className="text-gray-400">Presence</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-0.5 bg-green-500"></div>
              <span className="text-gray-400">Overall</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500">
          No attending data yet. Data will appear as you engage with practices and track biometrics.
        </div>
      )}
    </div>
  );
}
