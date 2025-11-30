'use client';

import { useState, useEffect, useRef } from 'react';
import { LabToolsService, FieldState, EEGState } from '../lib/LabToolsService';

interface GeometryPattern {
  id: string;
  name: string;
  description: string;
  frequency: number;
  complexity: number;
  resonance: number;
  active: boolean;
}

interface SacredPoint {
  x: number;
  y: number;
  energy: number;
  frequency: number;
  phase: number;
}

interface Props {
  service: LabToolsService;
  meditationActive?: boolean;
  selectedGeometry?: string;
}

export function SacredGeometryField({ service, meditationActive = false, selectedGeometry }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();
  const [fieldState, setFieldState] = useState<FieldState | null>(null);
  const [eegState, setEegState] = useState<EEGState | null>(null);
  const [activePattern, setActivePattern] = useState<string>('golden_spiral');
  const [patternIntensity, setPatternIntensity] = useState(0.5);
  const [sacredPoints, setSacredPoints] = useState<SacredPoint[]>([]);

  const geometryPatterns: { [key: string]: GeometryPattern } = {
    golden_spiral: {
      id: 'golden_spiral',
      name: 'Golden Spiral',
      description: 'Phi ratio spiral pattern for consciousness expansion',
      frequency: 1.618,
      complexity: 0.8,
      resonance: 0.7,
      active: false
    },
    flower_of_life: {
      id: 'flower_of_life',
      name: 'Flower of Life',
      description: 'Sacred geometric foundation pattern',
      frequency: 2.0,
      complexity: 0.9,
      resonance: 0.8,
      active: false
    },
    fibonacci: {
      id: 'fibonacci',
      name: 'Fibonacci Sequence',
      description: 'Natural growth pattern visualization',
      frequency: 1.414,
      complexity: 0.6,
      resonance: 0.6,
      active: false
    },
    sri_yantra: {
      id: 'sri_yantra',
      name: 'Sri Yantra',
      description: 'Ancient consciousness mapping geometry',
      frequency: 3.0,
      complexity: 1.0,
      resonance: 0.9,
      active: false
    },
    merkaba: {
      id: 'merkaba',
      name: 'Merkaba',
      description: 'Star tetrahedron consciousness vehicle',
      frequency: 2.618,
      complexity: 0.85,
      resonance: 0.75,
      active: false
    },
    torus_field: {
      id: 'torus_field',
      name: 'Consciousness Torus',
      description: 'Living field dynamics visualization',
      frequency: 1.0,
      complexity: 0.7,
      resonance: 0.8,
      active: false
    }
  };

  // Listen to real-time updates
  useEffect(() => {
    const handleFieldUpdate = (field: FieldState) => setFieldState(field);
    const handleEEGUpdate = (eeg: EEGState) => setEegState(eeg);

    service.on('fieldUpdate', handleFieldUpdate);
    service.on('eegUpdate', handleEEGUpdate);

    return () => {
      service.off('fieldUpdate', handleFieldUpdate);
      service.off('eegUpdate', handleEEGUpdate);
    };
  }, [service]);

  // Update pattern based on meditation selection
  useEffect(() => {
    if (selectedGeometry && geometryPatterns[selectedGeometry]) {
      setActivePattern(selectedGeometry);
    }
  }, [selectedGeometry]);

  // Generate sacred points based on field state and EEG
  useEffect(() => {
    if (fieldState && eegState) {
      const points = generateSacredPoints(fieldState, eegState, activePattern);
      setSacredPoints(points);

      // Update pattern intensity based on consciousness coherence
      const coherence = (eegState.theta + eegState.alpha + fieldState.torus.coherence) / 3;
      setPatternIntensity(Math.max(0.2, coherence));
    }
  }, [fieldState, eegState, activePattern]);

  // Animation loop
  useEffect(() => {
    const animate = () => {
      drawSacredGeometry();
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [sacredPoints, patternIntensity, activePattern]);

  const generateSacredPoints = (field: FieldState, eeg: EEGState, pattern: string): SacredPoint[] => {
    const points: SacredPoint[] = [];
    const centerX = 150;
    const centerY = 150;
    const phi = 1.6180339887;

    switch (pattern) {
      case 'golden_spiral':
        // Generate golden spiral points
        for (let i = 0; i < 100; i++) {
          const angle = i * 0.137508; // Golden angle
          const radius = Math.sqrt(i) * 3;
          const x = centerX + radius * Math.cos(angle);
          const y = centerY + radius * Math.sin(angle);

          points.push({
            x,
            y,
            energy: field.torus.flow * (1 - i / 100) + eeg.theta * 0.3,
            frequency: phi * (1 + i / 50),
            phase: (i * 0.1 + Date.now() * 0.001) % (2 * Math.PI)
          });
        }
        break;

      case 'flower_of_life':
        // Generate flower of life pattern
        const numCircles = 19;
        const radius = 30;

        for (let ring = 0; ring < 3; ring++) {
          const numInRing = ring === 0 ? 1 : 6 * ring;

          for (let i = 0; i < numInRing; i++) {
            const angle = (i / numInRing) * 2 * Math.PI;
            const ringRadius = ring * radius * Math.sqrt(3) / 2;
            const x = centerX + ringRadius * Math.cos(angle);
            const y = centerY + ringRadius * Math.sin(angle);

            // Generate points around each circle
            for (let j = 0; j < 12; j++) {
              const circleAngle = (j / 12) * 2 * Math.PI;
              const circleRadius = 15 * field.torus.symmetry;

              points.push({
                x: x + circleRadius * Math.cos(circleAngle),
                y: y + circleRadius * Math.sin(circleAngle),
                energy: field.torus.coherence * (1 - ring / 3) + eeg.alpha * 0.4,
                frequency: 2.0 + ring * 0.5,
                phase: (j * 0.5 + ring * 0.3 + Date.now() * 0.001) % (2 * Math.PI)
              });
            }
          }
        }
        break;

      case 'fibonacci':
        // Generate Fibonacci spiral
        const fibSequence = [1, 1, 2, 3, 5, 8, 13, 21, 34, 55];

        for (let i = 0; i < fibSequence.length; i++) {
          const fib = fibSequence[i];
          const angle = i * 2.399963; // Fibonacci angle
          const radius = fib * 2;

          for (let j = 0; j < fib * 2; j++) {
            const spiralAngle = angle + (j / (fib * 2)) * 2 * Math.PI;
            const x = centerX + radius * Math.cos(spiralAngle);
            const y = centerY + radius * Math.sin(spiralAngle);

            points.push({
              x,
              y,
              energy: field.torus.flow * (1 - i / fibSequence.length) + eeg.gamma * 0.2,
              frequency: 1.414 * (1 + i / 5),
              phase: (j * 0.1 + i * 0.2 + Date.now() * 0.001) % (2 * Math.PI)
            });
          }
        }
        break;

      case 'sri_yantra':
        // Generate Sri Yantra sacred geometry
        const triangles = [
          { direction: 1, size: 80, rotation: 0 },      // Upward triangles (Shiva)
          { direction: -1, size: 75, rotation: 0 },     // Downward triangles (Shakti)
          { direction: 1, size: 60, rotation: 15 },
          { direction: -1, size: 55, rotation: 15 },
          { direction: 1, size: 40, rotation: 30 },
          { direction: -1, size: 35, rotation: 30 },
          { direction: 1, size: 20, rotation: 45 },
          { direction: -1, size: 15, rotation: 45 },
          { direction: 1, size: 10, rotation: 60 }
        ];

        triangles.forEach((triangle, triangleIndex) => {
          for (let i = 0; i < 3; i++) {
            const angle = (i * 120 + triangle.rotation) * Math.PI / 180;
            const x = centerX + triangle.size * Math.cos(angle);
            const y = centerY + triangle.size * Math.sin(angle) * triangle.direction;

            points.push({
              x,
              y,
              energy: field.torus.coherence * (1 - triangleIndex / triangles.length) + eeg.theta * 0.5,
              frequency: 3.0 + triangleIndex * 0.1,
              phase: (i * 2.09 + triangleIndex * 0.5 + Date.now() * 0.001) % (2 * Math.PI)
            });
          }
        });
        break;

      case 'merkaba':
        // Generate Merkaba (star tetrahedron)
        const tetrahedronPoints = [
          { x: 0, y: -60, z: 0 },     // Top
          { x: -52, y: 30, z: 0 },    // Bottom left
          { x: 52, y: 30, z: 0 },     // Bottom right
          { x: 0, y: 0, z: 60 }       // Front (projected)
        ];

        // First tetrahedron (upward)
        tetrahedronPoints.forEach((point, i) => {
          const rotation = Date.now() * 0.001 * phi;
          const x = centerX + point.x * Math.cos(rotation) - point.z * Math.sin(rotation);
          const y = centerY + point.y;

          points.push({
            x,
            y,
            energy: field.torus.flow + eeg.gamma * 0.6,
            frequency: 2.618,
            phase: (i * 1.57 + rotation) % (2 * Math.PI)
          });
        });

        // Second tetrahedron (downward, counter-rotating)
        tetrahedronPoints.forEach((point, i) => {
          const rotation = -Date.now() * 0.001 * phi;
          const x = centerX - point.x * Math.cos(rotation) + point.z * Math.sin(rotation);
          const y = centerY - point.y;

          points.push({
            x,
            y,
            energy: field.torus.symmetry + eeg.alpha * 0.4,
            frequency: 2.618 * phi,
            phase: (i * 1.57 - rotation) % (2 * Math.PI)
          });
        });
        break;

      case 'torus_field':
      default:
        // Generate consciousness torus field
        for (let ring = 0; ring < 8; ring++) {
          const numPoints = 12 + ring * 4;
          const radius = 20 + ring * 12;

          for (let i = 0; i < numPoints; i++) {
            const angle = (i / numPoints) * 2 * Math.PI;
            const flowOffset = field.torus.flow * Math.sin(angle * 3 + Date.now() * 0.002) * 5;
            const x = centerX + (radius + flowOffset) * Math.cos(angle);
            const y = centerY + (radius + flowOffset) * Math.sin(angle);

            points.push({
              x,
              y,
              energy: field.torus.coherence * (1 - ring / 8) + eeg.alpha * 0.3,
              frequency: 1.0 + ring * 0.1,
              phase: (angle + ring * 0.5 + Date.now() * 0.001) % (2 * Math.PI)
            });
          }
        }
        break;
    }

    return points;
  };

  const drawSacredGeometry = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Set up drawing style
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Draw sacred points
    sacredPoints.forEach((point, index) => {
      const energyAlpha = Math.max(0.1, Math.min(1.0, point.energy * patternIntensity));
      const pulseSize = 1 + Math.sin(point.phase) * 0.3;

      // Color based on frequency and energy
      const hue = (point.frequency * 60 + Date.now() * 0.1) % 360;
      const saturation = 60 + energyAlpha * 40;
      const lightness = 30 + energyAlpha * 40;

      ctx.fillStyle = `hsla(${hue}, ${saturation}%, ${lightness}%, ${energyAlpha})`;
      ctx.strokeStyle = `hsla(${hue + 30}, ${saturation + 20}%, ${lightness + 20}%, ${energyAlpha * 0.8})`;

      // Draw energy point
      ctx.beginPath();
      ctx.arc(point.x, point.y, 1 + point.energy * 3 * pulseSize, 0, 2 * Math.PI);
      ctx.fill();

      // Draw energy glow
      if (energyAlpha > 0.5) {
        ctx.beginPath();
        ctx.arc(point.x, point.y, 3 + point.energy * 6 * pulseSize, 0, 2 * Math.PI);
        ctx.strokeStyle = `hsla(${hue}, ${saturation}%, ${lightness}%, ${energyAlpha * 0.3})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    });

    // Draw connecting lines for certain patterns
    if (activePattern === 'flower_of_life' || activePattern === 'sri_yantra') {
      drawPatternConnections(ctx);
    }

    // Draw central consciousness point
    if (fieldState) {
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const centralEnergy = fieldState.torus.coherence * patternIntensity;
      const centralSize = 5 + centralEnergy * 10;

      ctx.fillStyle = `hsla(280, 70%, 60%, ${centralEnergy})`;
      ctx.strokeStyle = `hsla(280, 90%, 80%, ${centralEnergy * 0.8})`;
      ctx.lineWidth = 2;

      ctx.beginPath();
      ctx.arc(centerX, centerY, centralSize, 0, 2 * Math.PI);
      ctx.fill();
      ctx.stroke();
    }
  };

  const drawPatternConnections = (ctx: CanvasRenderingContext2D) => {
    if (sacredPoints.length < 2) return;

    ctx.strokeStyle = `rgba(147, 51, 234, ${patternIntensity * 0.3})`;
    ctx.lineWidth = 1;

    // Draw connections between nearby points
    for (let i = 0; i < sacredPoints.length; i += 3) {
      for (let j = i + 1; j < Math.min(sacredPoints.length, i + 6); j += 2) {
        const point1 = sacredPoints[i];
        const point2 = sacredPoints[j];

        const distance = Math.sqrt(
          Math.pow(point1.x - point2.x, 2) + Math.pow(point1.y - point2.y, 2)
        );

        if (distance < 50 && (point1.energy + point2.energy) > 0.7) {
          const connectionAlpha = Math.max(0.1, (point1.energy + point2.energy) / 2 * patternIntensity);
          ctx.strokeStyle = `rgba(147, 51, 234, ${connectionAlpha * 0.5})`;

          ctx.beginPath();
          ctx.moveTo(point1.x, point1.y);
          ctx.lineTo(point2.x, point2.y);
          ctx.stroke();
        }
      }
    }
  };

  const getCurrentPattern = () => geometryPatterns[activePattern];

  return (
    <div className="bg-black/30 backdrop-blur-sm border border-purple-500/30 rounded-xl p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          🔯 Sacred Geometry Field
          {meditationActive && (
            <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full">
              Meditation Active
            </span>
          )}
        </h3>

        <div className="flex items-center gap-2">
          <select
            value={activePattern}
            onChange={(e) => setActivePattern(e.target.value)}
            className="text-xs bg-black/50 text-white border border-purple-500/30 rounded px-2 py-1"
          >
            {Object.values(geometryPatterns).map((pattern) => (
              <option key={pattern.id} value={pattern.id}>
                {pattern.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Sacred Geometry Visualization */}
      <div className="bg-black/20 rounded-lg p-4 mb-4">
        <canvas
          ref={canvasRef}
          width={300}
          height={300}
          className="w-full h-48 border border-purple-500/20 rounded-lg"
          style={{ background: 'radial-gradient(circle at center, rgba(30, 0, 50, 0.3) 0%, rgba(0, 0, 0, 0.8) 100%)' }}
        />
      </div>

      {/* Pattern Info */}
      <div className="space-y-3">
        <div className="bg-black/20 rounded-lg p-3">
          <h4 className="text-sm font-medium text-purple-300 mb-2">
            {getCurrentPattern().name}
          </h4>
          <p className="text-xs text-gray-400 mb-2">
            {getCurrentPattern().description}
          </p>

          <div className="grid grid-cols-3 gap-3 text-xs">
            <div>
              <span className="text-gray-500">Frequency:</span>
              <div className="text-white font-mono">
                {getCurrentPattern().frequency.toFixed(3)}Hz
              </div>
            </div>
            <div>
              <span className="text-gray-500">Complexity:</span>
              <div className="text-white font-mono">
                {(getCurrentPattern().complexity * 100).toFixed(0)}%
              </div>
            </div>
            <div>
              <span className="text-gray-500">Resonance:</span>
              <div className="text-white font-mono">
                {(getCurrentPattern().resonance * 100).toFixed(0)}%
              </div>
            </div>
          </div>
        </div>

        {/* Field Metrics */}
        {fieldState && (
          <div className="bg-black/20 rounded-lg p-3">
            <h5 className="text-xs font-medium text-purple-300 mb-2">Field Dynamics</h5>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="text-center">
                <div className="text-gray-400">Coherence</div>
                <div className="text-white font-mono">{(fieldState.torus.coherence * 100).toFixed(0)}%</div>
              </div>
              <div className="text-center">
                <div className="text-gray-400">Symmetry</div>
                <div className="text-white font-mono">{(fieldState.torus.symmetry * 100).toFixed(0)}%</div>
              </div>
              <div className="text-center">
                <div className="text-gray-400">Flow</div>
                <div className="text-white font-mono">{(fieldState.torus.flow * 100).toFixed(0)}%</div>
              </div>
            </div>
          </div>
        )}

        {/* Pattern Intensity */}
        <div className="bg-black/20 rounded-lg p-3">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs text-purple-300">Pattern Intensity</span>
            <span className="text-xs text-white font-mono">
              {(patternIntensity * 100).toFixed(0)}%
            </span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${patternIntensity * 100}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}