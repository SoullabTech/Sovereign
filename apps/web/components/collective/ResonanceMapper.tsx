/**
 * Resonance Mapper Component
 * Visualizes collective field dynamics, member interactions, and toroidal flow patterns
 * Shows real-time resonance patterns and field coherence in an intuitive interface
 */

import React, { useEffect, useRef, useState } from 'react';
import { MemberFieldState, ResonancePattern, FieldInteraction } from '@/lib/maia/CollectiveFieldOrchestrator';
import { FieldMetrics } from '@/lib/maia/FieldCoherenceEngine';

interface ResonanceMapperProps {
  members: MemberFieldState[];
  resonancePatterns: ResonancePattern[];
  fieldInteractions: FieldInteraction[];
  fieldMetrics: FieldMetrics;
  variant?: 'full' | 'compact' | 'dashboard';
  width?: number;
  height?: number;
}

export function ResonanceMapper({
  members,
  resonancePatterns,
  fieldInteractions,
  fieldMetrics,
  variant = 'full',
  width = 800,
  height = 600
}: ResonanceMapperProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hoveredMember, setHoveredMember] = useState<string | null>(null);
  const [showConnections, setShowConnections] = useState(true);
  const [showToroidal, setShowToroidal] = useState(true);

  useEffect(() => {
    drawResonanceField();
  }, [members, resonancePatterns, fieldInteractions, fieldMetrics, showConnections, showToroidal]);

  const drawResonanceField = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = '#0a0118'; // Deep purple space
    ctx.fillRect(0, 0, width, height);

    // Draw toroidal field if enabled
    if (showToroidal) {
      drawToroidalField(ctx);
    }

    // Draw field coherence background
    drawFieldCoherence(ctx);

    // Draw connections between members
    if (showConnections) {
      drawMemberConnections(ctx);
    }

    // Draw members as consciousness nodes
    drawMemberNodes(ctx);

    // Draw resonance patterns
    drawResonancePatterns(ctx);

    // Draw field metrics overlay
    drawMetricsOverlay(ctx);
  };

  const drawToroidalField = (ctx: CanvasRenderingContext2D) => {
    const centerX = width / 2;
    const centerY = height / 2;
    const outerRadius = Math.min(width, height) * 0.4;
    const innerRadius = outerRadius * 0.3;

    // Create toroidal gradient
    const gradient = ctx.createRadialGradient(centerX, centerY, innerRadius, centerX, centerY, outerRadius);
    gradient.addColorStop(0, 'rgba(139, 92, 246, 0)');
    gradient.addColorStop(0.3, 'rgba(139, 92, 246, 0.1)');
    gradient.addColorStop(0.7, 'rgba(139, 92, 246, 0.05)');
    gradient.addColorStop(1, 'rgba(139, 92, 246, 0)');

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(centerX, centerY, outerRadius, 0, Math.PI * 2);
    ctx.arc(centerX, centerY, innerRadius, 0, Math.PI * 2, true);
    ctx.fill();

    // Draw flow lines
    drawToroidalFlow(ctx, centerX, centerY, outerRadius, innerRadius);
  };

  const drawToroidalFlow = (
    ctx: CanvasRenderingContext2D,
    centerX: number,
    centerY: number,
    outerRadius: number,
    innerRadius: number
  ) => {
    const flowDirection = fieldMetrics.toroidalFlow.direction;
    const velocity = fieldMetrics.toroidalFlow.velocity;

    ctx.strokeStyle = `rgba(167, 139, 250, ${velocity * 0.5})`;
    ctx.lineWidth = 2;

    // Draw spiral flow lines
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const spiralTurns = 3;

      ctx.beginPath();
      for (let t = 0; t <= 1; t += 0.01) {
        const spiralAngle = angle + (flowDirection === 'ascending' ? t : -t) * spiralTurns * Math.PI * 2;
        const r = innerRadius + (outerRadius - innerRadius) * t;
        const x = centerX + Math.cos(spiralAngle) * r;
        const y = centerY + Math.sin(spiralAngle) * r;

        if (t === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.stroke();
    }
  };

  const drawFieldCoherence = (ctx: CanvasRenderingContext2D) => {
    const coherence = fieldMetrics.globalCoherence;

    // Draw coherence field as subtle background waves
    ctx.globalAlpha = coherence * 0.2;

    for (let ring = 1; ring <= 5; ring++) {
      const radius = (Math.min(width, height) / 2) * (ring / 5) * 0.8;
      const centerX = width / 2;
      const centerY = height / 2;

      ctx.strokeStyle = `hsl(${260 + ring * 10}, 70%, 60%)`;
      ctx.lineWidth = 1;

      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.globalAlpha = 1;
  };

  const drawMemberConnections = (ctx: CanvasRenderingContext2D) => {
    fieldInteractions.forEach(interaction => {
      const source = getMemberPosition(interaction.sourceUserId);
      const target = getMemberPosition(interaction.targetUserId);

      if (!source || !target) return;

      // Set connection style based on interaction type
      const connectionStyles = {
        resonance: { color: 'rgba(34, 197, 94, 0.6)', width: 2 },
        interference: { color: 'rgba(239, 68, 68, 0.4)', width: 1 },
        amplification: { color: 'rgba(251, 191, 36, 0.7)', width: 3 },
        grounding: { color: 'rgba(139, 92, 246, 0.5)', width: 2 }
      };

      const style = connectionStyles[interaction.interactionType];

      ctx.strokeStyle = style.color;
      ctx.lineWidth = style.width * interaction.strength;

      // Draw connection line
      ctx.beginPath();
      ctx.moveTo(source.x, source.y);
      ctx.lineTo(target.x, target.y);
      ctx.stroke();

      // Draw interaction strength indicator
      const midX = (source.x + target.x) / 2;
      const midY = (source.y + target.y) / 2;

      ctx.fillStyle = style.color;
      ctx.beginPath();
      ctx.arc(midX, midY, 2 + interaction.strength * 3, 0, Math.PI * 2);
      ctx.fill();
    });
  };

  const drawMemberNodes = (ctx: CanvasRenderingContext2D) => {
    members.forEach((member, index) => {
      const position = getMemberPosition(member.userId);
      if (!position) return;

      // Node size based on field contribution
      const baseRadius = 8;
      const radius = baseRadius + (member.fieldContribution * 12);

      // Color based on alchemical operation
      const operationColors = {
        calcination: '#ef4444',
        solutio: '#3b82f6',
        separatio: '#eab308',
        conjunctio: '#a855f7',
        fermentation: '#22c55e',
        distillation: '#6366f1',
        coagulation: '#f59e0b'
      };

      const color = operationColors[member.alchemicalOperation as keyof typeof operationColors] || '#8b5cf6';

      // Draw outer glow
      const glowGradient = ctx.createRadialGradient(position.x, position.y, 0, position.x, position.y, radius * 2);
      glowGradient.addColorStop(0, `${color}40`);
      glowGradient.addColorStop(1, 'transparent');

      ctx.fillStyle = glowGradient;
      ctx.beginPath();
      ctx.arc(position.x, position.y, radius * 2, 0, Math.PI * 2);
      ctx.fill();

      // Draw main node
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(position.x, position.y, radius, 0, Math.PI * 2);
      ctx.fill();

      // Draw inner core
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.beginPath();
      ctx.arc(position.x, position.y, radius * 0.4, 0, Math.PI * 2);
      ctx.fill();

      // Draw directional indicator
      drawDirectionIndicator(ctx, position.x, position.y, radius, member.elementalCirculation.direction);

      // Draw breakthrough indicator if applicable
      if (member.breakthroughPrediction && member.breakthroughPrediction.probability > 0.7) {
        drawBreakthroughIndicator(ctx, position.x, position.y, radius);
      }

      // Show hover info
      if (hoveredMember === member.userId) {
        drawMemberInfo(ctx, position.x, position.y, member);
      }
    });
  };

  const drawDirectionIndicator = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    radius: number,
    direction: string
  ) => {
    const arrowSize = radius * 0.3;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';

    ctx.beginPath();
    if (direction === 'ascending') {
      // Upward arrow
      ctx.moveTo(x, y - arrowSize);
      ctx.lineTo(x - arrowSize * 0.6, y + arrowSize * 0.3);
      ctx.lineTo(x + arrowSize * 0.6, y + arrowSize * 0.3);
    } else {
      // Downward arrow
      ctx.moveTo(x, y + arrowSize);
      ctx.lineTo(x - arrowSize * 0.6, y - arrowSize * 0.3);
      ctx.lineTo(x + arrowSize * 0.6, y - arrowSize * 0.3);
    }
    ctx.fill();
  };

  const drawBreakthroughIndicator = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    radius: number
  ) => {
    const time = Date.now() * 0.01;
    const pulseRadius = radius + 5 + Math.sin(time) * 3;

    ctx.strokeStyle = 'rgba(251, 191, 36, 0.8)';
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.arc(x, y, pulseRadius, 0, Math.PI * 2);
    ctx.stroke();
  };

  const drawMemberInfo = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    member: MemberFieldState
  ) => {
    const boxWidth = 200;
    const boxHeight = 80;
    const boxX = x + 20;
    const boxY = y - 40;

    // Info box background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.roundRect(boxX, boxY, boxWidth, boxHeight, 8);
    ctx.fill();

    // Info text
    ctx.fillStyle = 'white';
    ctx.font = '12px sans-serif';
    ctx.fillText(`Operation: ${member.alchemicalOperation}`, boxX + 8, boxY + 20);
    ctx.fillText(`Element: ${member.elementalCirculation.currentElement}`, boxX + 8, boxY + 35);
    ctx.fillText(`Contribution: ${Math.round(member.fieldContribution * 100)}%`, boxX + 8, boxY + 50);

    if (member.breakthroughPrediction) {
      ctx.fillText(`Breakthrough: ${Math.round(member.breakthroughPrediction.probability * 100)}%`, boxX + 8, boxY + 65);
    }
  };

  const drawResonancePatterns = (ctx: CanvasRenderingContext2D) => {
    resonancePatterns.forEach(pattern => {
      if (pattern.type === 'synchronous' && pattern.memberIds.length >= 2) {
        drawSynchronousPattern(ctx, pattern);
      } else if (pattern.type === 'harmonic') {
        drawHarmonicPattern(ctx, pattern);
      }
    });
  };

  const drawSynchronousPattern = (ctx: CanvasRenderingContext2D, pattern: ResonancePattern) => {
    const positions = pattern.memberIds
      .map(id => getMemberPosition(id))
      .filter(pos => pos !== null) as Array<{x: number, y: number}>;

    if (positions.length < 2) return;

    // Calculate center point
    const centerX = positions.reduce((sum, pos) => sum + pos.x, 0) / positions.length;
    const centerY = positions.reduce((sum, pos) => sum + pos.y, 0) / positions.length;

    // Draw synchrony ring
    const avgDistance = positions.reduce((sum, pos) =>
      sum + Math.sqrt(Math.pow(pos.x - centerX, 2) + Math.pow(pos.y - centerY, 2)), 0
    ) / positions.length;

    ctx.strokeStyle = `rgba(34, 197, 94, ${pattern.strength * 0.6})`;
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.arc(centerX, centerY, avgDistance, 0, Math.PI * 2);
    ctx.stroke();

    // Draw pattern label
    ctx.fillStyle = 'rgba(34, 197, 94, 0.8)';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('SYNC', centerX, centerY + 3);
  };

  const drawHarmonicPattern = (ctx: CanvasRenderingContext2D, pattern: ResonancePattern) => {
    if (pattern.memberIds.length !== 2) return;

    const pos1 = getMemberPosition(pattern.memberIds[0]);
    const pos2 = getMemberPosition(pattern.memberIds[1]);

    if (!pos1 || !pos2) return;

    // Draw harmonic wave between members
    const steps = 20;
    const amplitude = 10;

    ctx.strokeStyle = `rgba(251, 191, 36, ${pattern.strength * 0.7})`;
    ctx.lineWidth = 2;

    ctx.beginPath();
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const x = pos1.x + (pos2.x - pos1.x) * t;
      const y = pos1.y + (pos2.y - pos1.y) * t + Math.sin(t * Math.PI * 4) * amplitude * pattern.strength;

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.stroke();
  };

  const drawMetricsOverlay = (ctx: CanvasRenderingContext2D) => {
    if (variant === 'compact') return;

    // Draw field metrics in corner
    const metrics = [
      `Coherence: ${Math.round(fieldMetrics.globalCoherence * 100)}%`,
      `Intensity: ${Math.round(fieldMetrics.toroidalIntensity * 100)}%`,
      `Emergence: ${Math.round(fieldMetrics.emergenceIndex * 100)}%`
    ];

    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.roundRect(width - 180, 10, 170, 80, 8);
    ctx.fill();

    ctx.fillStyle = 'white';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'left';

    metrics.forEach((metric, index) => {
      ctx.fillText(metric, width - 170, 30 + index * 20);
    });
  };

  // Helper functions
  const getMemberPosition = (userId: string): {x: number, y: number} | null => {
    const memberIndex = members.findIndex(m => m.userId === userId);
    if (memberIndex === -1) return null;

    // Position members in a spiral pattern around the center
    const centerX = width / 2;
    const centerY = height / 2;
    const angle = (memberIndex / members.length) * Math.PI * 2;
    const radius = Math.min(width, height) * 0.3;

    return {
      x: centerX + Math.cos(angle) * radius,
      y: centerY + Math.sin(angle) * radius
    };
  };

  const handleCanvasMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Check if hovering over a member
    let hoveredMemberId: string | null = null;

    for (const member of members) {
      const position = getMemberPosition(member.userId);
      if (!position) continue;

      const distance = Math.sqrt(Math.pow(x - position.x, 2) + Math.pow(y - position.y, 2));
      const radius = 8 + (member.fieldContribution * 12);

      if (distance <= radius) {
        hoveredMemberId = member.userId;
        break;
      }
    }

    setHoveredMember(hoveredMemberId);
  };

  if (variant === 'compact') {
    return (
      <div className="bg-purple-950/30 rounded-lg border border-purple-800/30 p-4">
        <h4 className="text-sm font-semibold text-purple-300 mb-3">Field Resonance</h4>
        <canvas
          ref={canvasRef}
          width={300}
          height={200}
          className="w-full h-auto rounded cursor-pointer"
          onMouseMove={handleCanvasMouseMove}
        />
        <div className="mt-2 text-xs text-purple-400">
          {members.length} active members • {resonancePatterns.length} patterns
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex items-center space-x-4 text-sm">
        <button
          onClick={() => setShowConnections(!showConnections)}
          className={`px-3 py-1 rounded ${showConnections ? 'bg-purple-600 text-white' : 'bg-purple-200 text-purple-800'}`}
        >
          Connections
        </button>
        <button
          onClick={() => setShowToroidal(!showToroidal)}
          className={`px-3 py-1 rounded ${showToroidal ? 'bg-purple-600 text-white' : 'bg-purple-200 text-purple-800'}`}
        >
          Toroidal Field
        </button>
      </div>

      {/* Main canvas */}
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="w-full h-auto bg-purple-950/30 rounded-lg border border-purple-800/30 cursor-pointer"
        onMouseMove={handleCanvasMouseMove}
      />

      {/* Legend */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
        <div className="space-y-1">
          <div className="font-medium text-purple-300">Operations</div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span className="text-purple-400">Calcination</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span className="text-purple-400">Solutio</span>
          </div>
        </div>
        <div className="space-y-1">
          <div className="font-medium text-purple-300">Connections</div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-1 bg-green-500"></div>
            <span className="text-purple-400">Resonance</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-1 bg-yellow-500"></div>
            <span className="text-purple-400">Amplification</span>
          </div>
        </div>
        <div className="space-y-1">
          <div className="font-medium text-purple-300">Indicators</div>
          <div className="flex items-center space-x-2">
            <div className="text-purple-400">↑</div>
            <span className="text-purple-400">Ascending</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="text-yellow-400">○</div>
            <span className="text-purple-400">Breakthrough</span>
          </div>
        </div>
        <div className="space-y-1">
          <div className="font-medium text-purple-300">Patterns</div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 border border-green-500 rounded-full"></div>
            <span className="text-purple-400">Synchrony</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="text-yellow-400">~</div>
            <span className="text-purple-400">Harmonic</span>
          </div>
        </div>
      </div>
    </div>
  );
}