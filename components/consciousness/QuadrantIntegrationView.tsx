'use client';

import React, { useState } from 'react';
import HigherSelfSystemPanel from './HigherSelfSystemPanel';
import SubconsciousOperationsPanel from './SubconsciousOperationsPanel';

/**
 * QUADRANT INTEGRATION VIEW
 * Maps Jung + McGilchrist + Herrmann into unified consciousness model
 *
 * HERRMANN'S WHOLE BRAIN MODEL:
 * A (Upper Left): Analytical, Logical, Fact-based (Emissary Conscious)
 * D (Upper Right): Holistic, Intuitive, Synthesizing (Master Conscious)
 * B (Lower Left): Sequential, Organized, Detailed (Emissary Unconscious)
 * C (Lower Right): Interpersonal, Feeling, Kinesthetic (Master Unconscious)
 *
 * JUNG'S MAP:
 * Upper: Ego consciousness, Persona
 * Lower: Shadow, Personal & Collective Unconscious
 * Left: Personal, Individual
 * Right: Transpersonal, Collective
 *
 * MCGILCHRIST'S HEMISPHERES:
 * Left: Emissary - Parts, Categories, Manipulation, Control
 * Right: Master - Whole, Context, Relationship, Being
 */

interface ConsciousnessQuadrant {
  id: 'A' | 'B' | 'C' | 'D';
  herrmann: string;
  jung: string;
  mcgilchrist: string;
  primary_function: string;
  field_dimensions: string[];
  color: string;
}

const QuadrantIntegrationView: React.FC<{ userId?: string }> = ({ userId }) => {
  const [activeQuadrant, setActiveQuadrant] = useState<'A' | 'B' | 'C' | 'D' | 'all'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'flow' | 'depth'>('grid');

  const quadrants: ConsciousnessQuadrant[] = [
    {
      id: 'A',
      herrmann: 'Analytical (Blue)',
      jung: 'Conscious Thinking',
      mcgilchrist: 'Left Emissary',
      primary_function: 'Logical analysis, problem-solving, critical thinking',
      field_dimensions: ['Semantic Landscape', 'Pattern Recognition'],
      color: 'blue'
    },
    {
      id: 'D',
      herrmann: 'Experimental (Yellow)',
      jung: 'Conscious Intuition',
      mcgilchrist: 'Right Master',
      primary_function: 'Holistic synthesis, imagination, metaphor',
      field_dimensions: ['Sacred Markers', 'Connection Dynamics'],
      color: 'yellow'
    },
    {
      id: 'B',
      herrmann: 'Practical (Green)',
      jung: 'Unconscious Sensation',
      mcgilchrist: 'Left Sequential',
      primary_function: 'Procedural memory, habits, safety protocols',
      field_dimensions: ['Temporal Dynamics', 'Safety Patterns'],
      color: 'green'
    },
    {
      id: 'C',
      herrmann: 'Relational (Red)',
      jung: 'Unconscious Feeling',
      mcgilchrist: 'Right Embodied',
      primary_function: 'Somatic wisdom, emotional intelligence, empathy',
      field_dimensions: ['Emotional Weather', 'Somatic Intelligence'],
      color: 'red'
    }
  ];

  const getQuadrantView = (quadrant: ConsciousnessQuadrant) => (
    <div
      key={quadrant.id}
      className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
        activeQuadrant === quadrant.id
          ? `border-${quadrant.color}-500 bg-${quadrant.color}-950/20`
          : 'border-gray-700 bg-slate-900/50'
      }`}
      onClick={() => setActiveQuadrant(quadrant.id)}
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className={`text-lg font-bold text-${quadrant.color}-400`}>
          Quadrant {quadrant.id}
        </h3>
        <div className={`w-8 h-8 rounded-full bg-${quadrant.color}-500/30 flex items-center justify-center`}>
          {quadrant.id}
        </div>
      </div>

      <div className="space-y-2 text-sm">
        <div>
          <span className="text-gray-500">Herrmann:</span>
          <span className="ml-2 text-gray-300">{quadrant.herrmann}</span>
        </div>
        <div>
          <span className="text-gray-500">Jung:</span>
          <span className="ml-2 text-gray-300">{quadrant.jung}</span>
        </div>
        <div>
          <span className="text-gray-500">McGilchrist:</span>
          <span className="ml-2 text-gray-300">{quadrant.mcgilchrist}</span>
        </div>
        <div className="pt-2 border-t border-gray-800">
          <div className="text-xs text-gray-400 mb-1">Primary Function:</div>
          <div className="text-xs text-gray-300">{quadrant.primary_function}</div>
        </div>
        <div>
          <div className="text-xs text-gray-400 mb-1">Field Dimensions:</div>
          <div className="flex flex-wrap gap-1">
            {quadrant.field_dimensions.map(dim => (
              <span key={dim} className={`text-xs px-2 py-1 rounded bg-${quadrant.color}-900/30 text-${quadrant.color}-400`}>
                {dim}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const getGridView = () => (
    <div className="grid grid-cols-2 gap-1">
      {/* Upper quadrants */}
      <div className="space-y-1">
        {getQuadrantView(quadrants[0])} {/* A - Upper Left */}
      </div>
      <div className="space-y-1">
        {getQuadrantView(quadrants[1])} {/* D - Upper Right */}
      </div>
      {/* Lower quadrants */}
      <div className="space-y-1">
        {getQuadrantView(quadrants[2])} {/* B - Lower Left */}
      </div>
      <div className="space-y-1">
        {getQuadrantView(quadrants[3])} {/* C - Lower Right */}
      </div>
    </div>
  );

  const getFlowView = () => (
    <div className="relative h-96">
      {/* Central integration point */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-amber-600 to-indigo-600 flex items-center justify-center">
          <span className="text-white font-bold">SELF</span>
        </div>
      </div>

      {/* Quadrant circles positioned around center */}
      <div className="absolute top-0 left-0 w-1/2 h-1/2 p-4">
        <div className="w-full h-full rounded-full bg-blue-900/20 border-2 border-blue-500 flex items-center justify-center">
          <div className="text-center">
            <div className="text-blue-400 font-bold">A</div>
            <div className="text-xs text-gray-400">Analytical</div>
          </div>
        </div>
      </div>

      <div className="absolute top-0 right-0 w-1/2 h-1/2 p-4">
        <div className="w-full h-full rounded-full bg-yellow-900/20 border-2 border-yellow-500 flex items-center justify-center">
          <div className="text-center">
            <div className="text-yellow-400 font-bold">D</div>
            <div className="text-xs text-gray-400">Experimental</div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 w-1/2 h-1/2 p-4">
        <div className="w-full h-full rounded-full bg-green-900/20 border-2 border-green-500 flex items-center justify-center">
          <div className="text-center">
            <div className="text-green-400 font-bold">B</div>
            <div className="text-xs text-gray-400">Practical</div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 right-0 w-1/2 h-1/2 p-4">
        <div className="w-full h-full rounded-full bg-red-900/20 border-2 border-red-500 flex items-center justify-center">
          <div className="text-center">
            <div className="text-red-400 font-bold">C</div>
            <div className="text-xs text-gray-400">Relational</div>
          </div>
        </div>
      </div>

      {/* Flow lines connecting quadrants */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        <line x1="25%" y1="25%" x2="75%" y2="75%" stroke="rgba(147, 51, 234, 0.3)" strokeWidth="2" />
        <line x1="75%" y1="25%" x2="25%" y2="75%" stroke="rgba(147, 51, 234, 0.3)" strokeWidth="2" />
        <circle cx="50%" cy="50%" r="20%" fill="none" stroke="rgba(147, 51, 234, 0.2)" strokeWidth="1" strokeDasharray="5,5" />
      </svg>
    </div>
  );

  const getDepthView = () => (
    <div className="space-y-0">
      {/* Conscious Domain */}
      <HigherSelfSystemPanel viewMode="integrated" userId={userId} />

      {/* Integration Layer */}
      <div className="relative h-24 bg-gradient-to-b from-slate-900 to-slate-950">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-sm text-gray-500 mb-1">Liminal Threshold</div>
            <div className="flex gap-4 items-center">
              <div className="h-px w-32 bg-gradient-to-r from-transparent to-amber-600" />
              <div className="text-amber-400 font-medium">EGO ↔ SELF</div>
              <div className="h-px w-32 bg-gradient-to-l from-transparent to-amber-600" />
            </div>
            <div className="text-xs text-gray-600 mt-1">Conscious ↕ Unconscious</div>
          </div>
        </div>
      </div>

      {/* Unconscious Domain */}
      <SubconsciousOperationsPanel viewMode="integrated" userId={userId} />
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">
          Integrated Consciousness Architecture
        </h1>
        <div className="text-sm text-gray-400">
          Jung × McGilchrist × Herrmann Whole Brain Model
        </div>
      </div>

      {/* View Mode Selector */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setViewMode('grid')}
          className={`px-4 py-2 rounded text-sm ${
            viewMode === 'grid'
              ? 'bg-amber-600 text-white'
              : 'bg-gray-800 text-gray-400'
          }`}
        >
          Grid View
        </button>
        <button
          onClick={() => setViewMode('flow')}
          className={`px-4 py-2 rounded text-sm ${
            viewMode === 'flow'
              ? 'bg-amber-600 text-white'
              : 'bg-gray-800 text-gray-400'
          }`}
        >
          Flow View
        </button>
        <button
          onClick={() => setViewMode('depth')}
          className={`px-4 py-2 rounded text-sm ${
            viewMode === 'depth'
              ? 'bg-amber-600 text-white'
              : 'bg-gray-800 text-gray-400'
          }`}
        >
          Depth View
        </button>
      </div>

      {/* Content based on view mode */}
      {viewMode === 'grid' && getGridView()}
      {viewMode === 'flow' && getFlowView()}
      {viewMode === 'depth' && getDepthView()}

      {/* Integration Metrics */}
      {activeQuadrant === 'all' && viewMode !== 'depth' && (
        <div className="mt-6 bg-slate-900/50 p-4 rounded-lg">
          <h3 className="text-lg font-medium mb-3">Whole Brain Integration</h3>
          <div className="grid grid-cols-4 gap-4">
            <IntegrationMetric label="Left-Right Balance" value={0.74} />
            <IntegrationMetric label="Upper-Lower Flow" value={0.67} />
            <IntegrationMetric label="Diagonal Integration" value={0.58} />
            <IntegrationMetric label="Central Coherence" value={0.81} />
          </div>
        </div>
      )}
    </div>
  );
};

const IntegrationMetric: React.FC<{
  label: string;
  value: number;
}> = ({ label, value }) => (
  <div className="text-center">
    <div className="text-xs text-gray-500 mb-1">{label}</div>
    <div className="text-2xl font-bold text-amber-400">
      {(value * 100).toFixed(0)}%
    </div>
    <div className="h-1 bg-gray-700 rounded-full mt-2">
      <div
        className="h-full bg-amber-500 rounded-full"
        style={{ width: `${value * 100}%` }}
      />
    </div>
  </div>
);

export default QuadrantIntegrationView;