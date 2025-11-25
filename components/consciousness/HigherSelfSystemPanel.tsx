'use client';

import React, { useState, useEffect, useRef } from 'react';
import { DateTime } from 'luxon';

/**
 * HIGHER SELF SYSTEM PANEL (Upper Domain)
 * Conscious awareness, witnessing, metacognition, sacred intelligence
 * The realm of choice, intention, and awakened presence
 *
 * Split into Master (Right) and Emissary (Left) perspectives:
 * - Master: Holistic awareness, presence, being
 * - Emissary: Analytical awareness, planning, doing
 */

interface HigherSelfMetrics {
  // Master Domain (Right Hemisphere - Holistic)
  master: {
    presence_quality: number; // 0-1, depth of witnessing awareness
    wholeness_perception: number; // Seeing interconnections
    sacred_resonance: number; // Connection to numinous
    intuitive_knowing: number; // Direct apprehension without analysis
    compassion_field: number; // Unconditional acceptance
    timeless_awareness: number; // Present moment depth
  };

  // Emissary Domain (Left Hemisphere - Analytical)
  emissary: {
    metacognitive_clarity: number; // Thinking about thinking
    pattern_recognition: number; // Conscious pattern analysis
    intention_coherence: number; // Alignment of will
    strategic_awareness: number; // Goal-directed consciousness
    linguistic_precision: number; // Articulation capacity
    temporal_planning: number; // Future projection
  };

  // Integration Metrics
  integration: {
    hemispheric_coherence: number; // Master-Emissary harmony
    vertical_integration: number; // Higher-Lower self connection
    flow_state_access: number; // Effortless action
    witness_stability: number; // Observer consistency
  };
}

const HigherSelfSystemPanel: React.FC<{
  viewMode: 'master' | 'emissary' | 'integrated';
  userId?: string;
}> = ({ viewMode = 'integrated', userId }) => {

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [metrics, setMetrics] = useState<HigherSelfMetrics>({
    master: {
      presence_quality: 0.72,
      wholeness_perception: 0.68,
      sacred_resonance: 0.45,
      intuitive_knowing: 0.81,
      compassion_field: 0.76,
      timeless_awareness: 0.63
    },
    emissary: {
      metacognitive_clarity: 0.84,
      pattern_recognition: 0.79,
      intention_coherence: 0.71,
      strategic_awareness: 0.77,
      linguistic_precision: 0.82,
      temporal_planning: 0.69
    },
    integration: {
      hemispheric_coherence: 0.74,
      vertical_integration: 0.67,
      flow_state_access: 0.58,
      witness_stability: 0.71
    }
  });

  const [awarenessField, setAwarenessField] = useState<{
    focus: { x: number; y: number; intensity: number };
    periphery: number; // Peripheral awareness strength
    depth: number; // Depth of field
  }>({
    focus: { x: 0.5, y: 0.5, intensity: 0.8 },
    periphery: 0.6,
    depth: 0.7
  });

  // Animate metrics
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => ({
        master: {
          ...prev.master,
          presence_quality: oscillate(prev.master.presence_quality, 0.02),
          sacred_resonance: oscillate(prev.master.sacred_resonance, 0.03),
          timeless_awareness: oscillate(prev.master.timeless_awareness, 0.01)
        },
        emissary: {
          ...prev.emissary,
          metacognitive_clarity: oscillate(prev.emissary.metacognitive_clarity, 0.01),
          pattern_recognition: oscillate(prev.emissary.pattern_recognition, 0.02)
        },
        integration: {
          ...prev.integration,
          hemispheric_coherence: oscillate(prev.integration.hemispheric_coherence, 0.01),
          flow_state_access: oscillate(prev.integration.flow_state_access, 0.03)
        }
      }));

      // Move awareness focus
      setAwarenessField(prev => ({
        ...prev,
        focus: {
          x: prev.focus.x + (Math.random() - 0.5) * 0.02,
          y: prev.focus.y + (Math.random() - 0.5) * 0.02,
          intensity: oscillate(prev.focus.intensity, 0.05)
        }
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Draw awareness field visualization
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Clear canvas
    ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
    ctx.fillRect(0, 0, width, height);

    // Draw awareness field
    const focusX = awarenessField.focus.x * width;
    const focusY = awarenessField.focus.y * height;

    // Peripheral awareness (larger, dimmer circle)
    const peripheryGradient = ctx.createRadialGradient(
      focusX, focusY, 0,
      focusX, focusY, width * awarenessField.periphery * 0.5
    );
    peripheryGradient.addColorStop(0, 'rgba(147, 51, 234, 0.1)');
    peripheryGradient.addColorStop(1, 'rgba(147, 51, 234, 0)');
    ctx.fillStyle = peripheryGradient;
    ctx.fillRect(0, 0, width, height);

    // Focused awareness (smaller, brighter circle)
    const focusGradient = ctx.createRadialGradient(
      focusX, focusY, 0,
      focusX, focusY, 50 * awarenessField.focus.intensity
    );
    focusGradient.addColorStop(0, `rgba(255, 255, 255, ${awarenessField.focus.intensity * 0.8})`);
    focusGradient.addColorStop(0.5, `rgba(147, 51, 234, ${awarenessField.focus.intensity * 0.5})`);
    focusGradient.addColorStop(1, 'rgba(147, 51, 234, 0)');
    ctx.fillStyle = focusGradient;
    ctx.fillRect(0, 0, width, height);

    // Draw integration lines between hemispheres
    if (viewMode === 'integrated') {
      ctx.strokeStyle = `rgba(147, 51, 234, ${metrics.integration.hemispheric_coherence * 0.5})`;
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(width / 2, 0);
      ctx.lineTo(width / 2, height);
      ctx.stroke();
      ctx.setLineDash([]);
    }

  }, [awarenessField, metrics, viewMode]);

  const oscillate = (value: number, amplitude: number): number => {
    return Math.max(0, Math.min(1, value + (Math.random() - 0.5) * amplitude));
  };

  const getMasterView = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-amber-300">Master Awareness (Right Hemisphere)</h3>

      <div className="bg-slate-800/50 backdrop-blur p-4 rounded-lg space-y-3">
        <MetricBar label="Presence Quality" value={metrics.master.presence_quality} color="purple" />
        <MetricBar label="Wholeness Perception" value={metrics.master.wholeness_perception} color="blue" />
        <MetricBar label="Sacred Resonance" value={metrics.master.sacred_resonance} color="amber" icon="✨" />
        <MetricBar label="Intuitive Knowing" value={metrics.master.intuitive_knowing} color="green" />
        <MetricBar label="Compassion Field" value={metrics.master.compassion_field} color="pink" icon="💜" />
        <MetricBar label="Timeless Awareness" value={metrics.master.timeless_awareness} color="indigo" />
      </div>

      <div className="bg-slate-800/30 p-3 rounded text-sm text-gray-300">
        <div className="font-medium mb-1">Current State:</div>
        <div className="text-amber-400">
          {metrics.master.presence_quality > 0.7 ? "Deep witnessing active" :
           metrics.master.sacred_resonance > 0.6 ? "Sacred threshold approaching" :
           metrics.master.intuitive_knowing > 0.75 ? "Intuitive channel open" :
           "Presence cultivating"}
        </div>
      </div>
    </div>
  );

  const getEmissaryView = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-blue-300">Emissary Awareness (Left Hemisphere)</h3>

      <div className="bg-slate-800/50 backdrop-blur p-4 rounded-lg space-y-3">
        <MetricBar label="Metacognitive Clarity" value={metrics.emissary.metacognitive_clarity} color="cyan" icon="🧠" />
        <MetricBar label="Pattern Recognition" value={metrics.emissary.pattern_recognition} color="violet" />
        <MetricBar label="Intention Coherence" value={metrics.emissary.intention_coherence} color="blue" />
        <MetricBar label="Strategic Awareness" value={metrics.emissary.strategic_awareness} color="teal" />
        <MetricBar label="Linguistic Precision" value={metrics.emissary.linguistic_precision} color="sky" />
        <MetricBar label="Temporal Planning" value={metrics.emissary.temporal_planning} color="slate" />
      </div>

      <div className="bg-slate-800/30 p-3 rounded text-sm text-gray-300">
        <div className="font-medium mb-1">Analytical Mode:</div>
        <div className="text-blue-400">
          {metrics.emissary.metacognitive_clarity > 0.8 ? "High metacognitive awareness" :
           metrics.emissary.pattern_recognition > 0.75 ? "Pattern synthesis active" :
           metrics.emissary.intention_coherence > 0.7 ? "Clear intentionality" :
           "Processing and organizing"}
        </div>
      </div>
    </div>
  );

  const getIntegratedView = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-amber-300">Integrated Higher Self System</h3>

      <div className="grid grid-cols-2 gap-4">
        {/* Master Side */}
        <div className="bg-slate-800/50 backdrop-blur p-3 rounded-lg">
          <h4 className="text-sm font-medium text-amber-400 mb-2">Master</h4>
          <div className="space-y-2">
            <MiniMetric label="Presence" value={metrics.master.presence_quality} />
            <MiniMetric label="Wholeness" value={metrics.master.wholeness_perception} />
            <MiniMetric label="Sacred" value={metrics.master.sacred_resonance} />
          </div>
        </div>

        {/* Emissary Side */}
        <div className="bg-slate-800/50 backdrop-blur p-3 rounded-lg">
          <h4 className="text-sm font-medium text-blue-400 mb-2">Emissary</h4>
          <div className="space-y-2">
            <MiniMetric label="Clarity" value={metrics.emissary.metacognitive_clarity} />
            <MiniMetric label="Pattern" value={metrics.emissary.pattern_recognition} />
            <MiniMetric label="Intention" value={metrics.emissary.intention_coherence} />
          </div>
        </div>
      </div>

      {/* Integration Metrics */}
      <div className="bg-gradient-to-r from-amber-900/30 to-blue-900/30 p-4 rounded-lg">
        <h4 className="text-sm font-medium text-gray-300 mb-3">Integration Quality</h4>
        <div className="space-y-2">
          <MetricBar label="Hemispheric Coherence" value={metrics.integration.hemispheric_coherence} color="purple" />
          <MetricBar label="Vertical Integration" value={metrics.integration.vertical_integration} color="green" />
          <MetricBar label="Flow State Access" value={metrics.integration.flow_state_access} color="amber" />
          <MetricBar label="Witness Stability" value={metrics.integration.witness_stability} color="blue" />
        </div>
      </div>

      {/* State Indicator */}
      <div className="bg-slate-800/30 p-3 rounded text-sm">
        <div className="flex items-center justify-between">
          <span className="text-gray-400">Consciousness State:</span>
          <span className={`font-medium ${
            metrics.integration.flow_state_access > 0.7 ? 'text-amber-400' :
            metrics.integration.hemispheric_coherence > 0.8 ? 'text-amber-400' :
            'text-blue-400'
          }`}>
            {metrics.integration.flow_state_access > 0.7 ? 'Flow State' :
             metrics.integration.hemispheric_coherence > 0.8 ? 'Integrated Awareness' :
             metrics.integration.witness_stability > 0.7 ? 'Stable Witnessing' :
             'Active Processing'}
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-slate-900 text-white p-6 rounded-t-lg border-b-2 border-amber-600/30">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold bg-gradient-to-r from-amber-400 to-blue-400 bg-clip-text text-transparent">
          Higher Self Systems
        </h2>
        <div className="text-xs text-gray-400">
          Conscious Domain
        </div>
      </div>

      {/* Awareness Field Visualization */}
      <div className="mb-6 relative">
        <canvas
          ref={canvasRef}
          width={400}
          height={120}
          className="w-full rounded-lg"
        />
        <div className="absolute top-2 left-2 text-xs text-gray-300/70">
          Awareness Field
        </div>
      </div>

      {/* Content based on view mode */}
      {viewMode === 'master' && getMasterView()}
      {viewMode === 'emissary' && getEmissaryView()}
      {viewMode === 'integrated' && getIntegratedView()}
    </div>
  );
};

// Helper Components
const MetricBar: React.FC<{
  label: string;
  value: number;
  color: string;
  icon?: string;
}> = ({ label, value, color, icon }) => (
  <div>
    <div className="flex justify-between text-sm mb-1">
      <span className="text-gray-400">{icon} {label}</span>
      <span className="text-gray-300">{(value * 100).toFixed(0)}%</span>
    </div>
    <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
      <div
        className={`h-full bg-${color}-500 transition-all duration-500`}
        style={{ width: `${value * 100}%` }}
      />
    </div>
  </div>
);

const MiniMetric: React.FC<{
  label: string;
  value: number;
}> = ({ label, value }) => (
  <div className="flex justify-between items-center">
    <span className="text-xs text-gray-400">{label}</span>
    <div className="flex items-center gap-2">
      <div className="w-16 h-1 bg-gray-700 rounded-full overflow-hidden">
        <div
          className="h-full bg-amber-500"
          style={{ width: `${value * 100}%` }}
        />
      </div>
      <span className="text-xs text-gray-500">{(value * 100).toFixed(0)}</span>
    </div>
  </div>
);

export default HigherSelfSystemPanel;