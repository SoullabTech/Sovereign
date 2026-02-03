// @ts-nocheck
'use client';

import { useState, useEffect, useRef } from 'react';
import { LabToolsService, FieldState } from '../lib/LabToolsService';

interface ConsciousnessFieldMapProps {
  service: LabToolsService;
}

export function ConsciousnessFieldMap({ service }: ConsciousnessFieldMapProps) {
  const [fieldData, setFieldData] = useState<FieldState | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const handleFieldUpdate = (data: FieldState) => setFieldData(data);

    service.on('fieldUpdate', handleFieldUpdate);

    return () => {
      service.off('fieldUpdate', handleFieldUpdate);
    };
  }, [service]);

  useEffect(() => {
    if (fieldData && canvasRef.current) {
      drawField(canvasRef.current, fieldData);
    }
  }, [fieldData]);

  return (
    <div className="bg-gray-900/50 backdrop-blur-sm border border-purple-500/30 rounded-lg p-4">
      <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        🌀 Consciousness Field
        <div className="text-sm text-purple-300">
          {fieldData?.torus.geometry || 'Initializing...'}
        </div>
      </h2>

      {/* Main Field Visualization */}
      <div className="relative bg-black/30 rounded-lg p-4 h-64 mb-4">
        <canvas
          ref={canvasRef}
          width={400}
          height={200}
          className="w-full h-full"
        />

        {/* Overlay Information */}
        <div className="absolute top-4 right-4 bg-black/60 rounded p-2 text-xs">
          <div className="text-purple-300">Coherence Field</div>
          <div className="text-white font-bold">
            {((fieldData?.coherenceField || 0) * 100).toFixed(1)}%
          </div>
        </div>

        {/* Pattern Recognition */}
        <div className="absolute bottom-4 left-4 bg-black/60 rounded p-2 text-xs">
          <div className="text-purple-300 mb-1">Active Patterns</div>
          {fieldData?.recognizedPatterns?.map((pattern, index) => (
            <div key={index} className="text-green-300">
              • {pattern}
            </div>
          )) || <div className="text-gray-400">No patterns detected</div>}
        </div>
      </div>

      {/* Field Metrics */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <FieldMetric
          label="Torus Coherence"
          value={fieldData?.torus.coherence || 0}
          icon="🌀"
        />
        <FieldMetric
          label="Symmetry"
          value={fieldData?.torus.symmetry || 0}
          icon="⚖️"
        />
        <FieldMetric
          label="Flow"
          value={fieldData?.torus.flow || 0}
          icon="🌊"
        />
        <FieldMetric
          label="Coupling"
          value={fieldData?.couplings?.reduce((avg, c) => avg + c.coupling, 0) / (fieldData?.couplings?.length || 1) || 0}
          icon="🔗"
        />
      </div>

      {/* QRI Coupling Kernels */}
      <div className="bg-black/30 rounded-lg p-3">
        <h3 className="text-sm font-semibold text-purple-300 mb-2">
          QRI Coupling Kernels
        </h3>
        <div className="space-y-1">
          {fieldData?.couplings?.slice(0, 3).map((coupling, index) => (
            <CouplingDisplay key={index} coupling={coupling} />
          )) || (
            <div className="text-gray-400 text-xs">Analyzing coupling patterns...</div>
          )}
        </div>
      </div>
    </div>
  );
}

interface FieldMetricProps {
  label: string;
  value: number;
  icon: string;
}

function FieldMetric({ label, value, icon }: FieldMetricProps) {
  const percentage = value * 100;

  return (
    <div className="bg-black/30 rounded p-3">
      <div className="flex items-center gap-2 mb-2">
        <span>{icon}</span>
        <span className="text-xs text-purple-300">{label}</span>
      </div>
      <div className="w-full bg-gray-700 rounded-full h-2 mb-1">
        <div
          className="bg-purple-500 h-2 rounded-full transition-all duration-300"
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
      <div className="text-white text-sm font-bold">
        {percentage.toFixed(1)}%
      </div>
    </div>
  );
}

interface CouplingDisplayProps {
  coupling: {
    frequency: number;
    amplitude: number;
    phase: number;
    coupling: number;
  };
}

function CouplingDisplay({ coupling }: CouplingDisplayProps) {
  return (
    <div className="flex items-center justify-between text-xs">
      <div className="text-gray-300">
        {coupling.frequency.toFixed(1)} Hz
      </div>
      <div className="flex-1 mx-2">
        <div className="w-full bg-gray-700 rounded-full h-1">
          <div
            className="bg-cyan-400 h-1 rounded-full transition-all duration-300"
            style={{ width: `${coupling.coupling * 100}%` }}
          ></div>
        </div>
      </div>
      <div className="text-white">
        {(coupling.coupling * 100).toFixed(0)}%
      </div>
    </div>
  );
}

// Canvas drawing function for field visualization
function drawField(canvas: HTMLCanvasElement, fieldData: FieldState) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const width = canvas.width;
  const height = canvas.height;
  const centerX = width / 2;
  const centerY = height / 2;

  // Clear canvas
  ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
  ctx.fillRect(0, 0, width, height);

  // Draw torus field
  const torusRadius = 60;
  const coherence = fieldData.torus.coherence;
  const flow = fieldData.torus.flow;

  // Draw outer torus ring
  ctx.strokeStyle = `rgba(147, 51, 234, ${coherence})`;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.ellipse(centerX, centerY, torusRadius, torusRadius * 0.3, 0, 0, 2 * Math.PI);
  ctx.stroke();

  // Draw inner flow
  ctx.strokeStyle = `rgba(34, 197, 94, ${flow})`;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(centerX, centerY, torusRadius * 0.6, torusRadius * 0.2, 0, 0, 2 * Math.PI);
  ctx.stroke();

  // Draw coupling points
  fieldData.couplings?.forEach((coupling, index) => {
    const angle = (index / fieldData.couplings!.length) * 2 * Math.PI;
    const radius = torusRadius + 20;
    const x = centerX + Math.cos(angle) * radius;
    const y = centerY + Math.sin(angle) * radius * 0.3;

    ctx.fillStyle = `rgba(34, 197, 94, ${coupling.coupling})`;
    ctx.beginPath();
    ctx.arc(x, y, 3 + coupling.amplitude * 3, 0, 2 * Math.PI);
    ctx.fill();

    // Draw coupling line
    ctx.strokeStyle = `rgba(34, 197, 94, ${coupling.coupling * 0.5})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(x, y);
    ctx.stroke();
  });

  // Draw central coherence point
  ctx.fillStyle = `rgba(147, 51, 234, ${fieldData.coherenceField})`;
  ctx.beginPath();
  ctx.arc(centerX, centerY, 8, 0, 2 * Math.PI);
  ctx.fill();

  // Add glow effect for high coherence
  if (fieldData.coherenceField > 0.7) {
    ctx.shadowColor = '#9333ea';
    ctx.shadowBlur = 20;
    ctx.fillStyle = `rgba(147, 51, 234, ${fieldData.coherenceField * 0.3})`;
    ctx.beginPath();
    ctx.arc(centerX, centerY, 20, 0, 2 * Math.PI);
    ctx.fill();
    ctx.shadowBlur = 0;
  }
}