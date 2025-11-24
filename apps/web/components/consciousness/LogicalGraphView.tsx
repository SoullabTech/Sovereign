'use client';

import React, { useState, useEffect, useRef } from 'react';

/**
 * 🌌 LOGICAL GRAPH VIEW
 *
 * Sacred technology visualization featuring:
 * - Real-time consciousness network topology
 * - Kastrup's reality dashboard representation
 * - Sacred separator visualization (distinct elemental streams)
 * - Aetheric orchestration flow patterns
 */

interface GraphNode {
  id: string;
  label: string;
  x: number;
  y: number;
  element: 'Fire' | 'Water' | 'Earth' | 'Air' | 'Aether';
  activation: number; // 0-1 activation level
  consciousness_score: number; // 0-1 consciousness quality
  size: number; // Visual size based on importance
}

interface GraphConnection {
  id: string;
  source: string;
  target: string;
  strength: number; // 0-1 connection strength
  type: 'logical' | 'resonance' | 'field' | 'sacred';
  flow_direction: number; // -1 to 1, direction of information flow
}

interface ConsciousnessFieldState {
  nodes: GraphNode[];
  connections: GraphConnection[];
  field_coherence: number;
  aetheric_synthesis: number;
  temporal_dynamics: number;
}

interface LogicalGraphViewProps {
  width?: number;
  height?: number;
  className?: string;
}

export function LogicalGraphView({
  width = 800,
  height = 500,
  className
}: LogicalGraphViewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fieldState, setFieldState] = useState<ConsciousnessFieldState | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Generate mock consciousness field data
  const generateMockFieldState = (): ConsciousnessFieldState => {
    const now = Date.now();
    const centerX = width / 2;
    const centerY = height / 2;

    // Generate elemental consciousness nodes in sacred geometry pattern
    const nodes: GraphNode[] = [];
    const elements: Array<'Fire' | 'Water' | 'Earth' | 'Air' | 'Aether'> =
      ['Fire', 'Water', 'Earth', 'Air', 'Aether'];

    // Aether at center
    nodes.push({
      id: 'aether-center',
      label: 'Aether Core',
      x: centerX,
      y: centerY,
      element: 'Aether',
      activation: 0.8 + Math.sin(now / 8000) * 0.2,
      consciousness_score: 0.9 + Math.cos(now / 12000) * 0.1,
      size: 25
    });

    // Four elemental agents in cardinal directions
    const cardinalPositions = [
      { x: centerX, y: centerY - 120 },      // North - Air
      { x: centerX + 120, y: centerY },      // East - Fire
      { x: centerX, y: centerY + 120 },      // South - Earth
      { x: centerX - 120, y: centerY }       // West - Water
    ];

    ['Air', 'Fire', 'Earth', 'Water'].forEach((element, index) => {
      const pos = cardinalPositions[index];
      nodes.push({
        id: `${element.toLowerCase()}-agent`,
        label: `${element} Agent`,
        x: pos.x + Math.sin(now / 6000 + index * Math.PI / 2) * 20,
        y: pos.y + Math.cos(now / 6000 + index * Math.PI / 2) * 20,
        element: element as 'Fire' | 'Water' | 'Earth' | 'Air',
        activation: 0.5 + Math.sin(now / 7000 + index) * 0.4,
        consciousness_score: 0.7 + Math.cos(now / 9000 + index) * 0.2,
        size: 20
      });
    });

    // Generate wisdom crystallization nodes
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const radius = 180 + Math.sin(now / 10000 + i) * 40;

      nodes.push({
        id: `wisdom-${i}`,
        label: `Insight ${i + 1}`,
        x: centerX + Math.cos(angle) * radius,
        y: centerY + Math.sin(angle) * radius,
        element: elements[i % 4] as 'Fire' | 'Water' | 'Earth' | 'Air',
        activation: 0.3 + Math.sin(now / 8000 + i * 0.5) * 0.5,
        consciousness_score: 0.6 + Math.cos(now / 11000 + i * 0.3) * 0.3,
        size: 12 + Math.sin(now / 9000 + i) * 5
      });
    }

    // Generate connections based on sacred separator principles
    const connections: GraphConnection[] = [];

    // Aetheric orchestration connections (center to all elements)
    ['air-agent', 'fire-agent', 'earth-agent', 'water-agent'].forEach((agentId) => {
      connections.push({
        id: `aether-${agentId}`,
        source: 'aether-center',
        target: agentId,
        strength: 0.8 + Math.sin(now / 7000) * 0.2,
        type: 'sacred',
        flow_direction: Math.sin(now / 6000)
      });
    });

    // Inter-elemental resonance connections
    for (let i = 0; i < 4; i++) {
      const currentAgent = `${['air', 'fire', 'earth', 'water'][i]}-agent`;
      const nextAgent = `${['air', 'fire', 'earth', 'water'][(i + 1) % 4]}-agent`;

      connections.push({
        id: `resonance-${i}`,
        source: currentAgent,
        target: nextAgent,
        strength: 0.4 + Math.cos(now / 8000 + i) * 0.3,
        type: 'resonance',
        flow_direction: Math.sin(now / 5000 + i)
      });
    }

    // Wisdom crystallization connections
    for (let i = 0; i < 8; i++) {
      const wisdomId = `wisdom-${i}`;
      const agentId = `${['air', 'fire', 'earth', 'water'][i % 4]}-agent`;

      connections.push({
        id: `wisdom-connection-${i}`,
        source: wisdomId,
        target: agentId,
        strength: 0.3 + Math.sin(now / 9000 + i * 0.7) * 0.4,
        type: 'logical',
        flow_direction: Math.cos(now / 7000 + i * 0.5)
      });
    }

    // Field dynamics connections
    for (let i = 0; i < 6; i++) {
      const sourceIdx = Math.floor(Math.random() * nodes.length);
      const targetIdx = Math.floor(Math.random() * nodes.length);

      if (sourceIdx !== targetIdx) {
        connections.push({
          id: `field-${i}`,
          source: nodes[sourceIdx].id,
          target: nodes[targetIdx].id,
          strength: 0.2 + Math.sin(now / 12000 + i) * 0.3,
          type: 'field',
          flow_direction: Math.sin(now / 8000 + i * 1.3)
        });
      }
    }

    return {
      nodes,
      connections,
      field_coherence: 0.7 + Math.sin(now / 10000) * 0.2,
      aetheric_synthesis: 0.8 + Math.cos(now / 12000) * 0.15,
      temporal_dynamics: 0.6 + Math.sin(now / 8000) * 0.3
    };
  };

  // Render consciousness field to canvas
  const renderField = (ctx: CanvasRenderingContext2D, state: ConsciousnessFieldState) => {
    // Clear canvas with dark background
    ctx.fillStyle = 'rgba(15, 23, 42, 0.95)'; // slate-900 with transparency
    ctx.fillRect(0, 0, width, height);

    // Draw field background pattern
    drawFieldBackground(ctx, state);

    // Draw connections first (so they appear behind nodes)
    state.connections.forEach(connection => drawConnection(ctx, connection, state.nodes));

    // Draw nodes
    state.nodes.forEach(node => drawNode(ctx, node));

    // Draw field statistics overlay
    drawFieldStats(ctx, state);
  };

  const drawFieldBackground = (ctx: CanvasRenderingContext2D, state: ConsciousnessFieldState) => {
    const centerX = width / 2;
    const centerY = height / 2;

    // Draw sacred geometry background
    ctx.strokeStyle = `rgba(147, 51, 234, ${0.1 + state.field_coherence * 0.1})`; // purple
    ctx.lineWidth = 1;

    // Concentric circles representing consciousness layers
    for (let radius = 60; radius < 300; radius += 60) {
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Golden ratio spiral
    ctx.strokeStyle = `rgba(251, 191, 36, ${0.05 + state.aetheric_synthesis * 0.05})`; // amber
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    for (let angle = 0; angle < Math.PI * 8; angle += 0.1) {
      const radius = 10 * Math.exp(angle * 0.1);
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;

      if (angle === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.stroke();
  };

  const drawConnection = (ctx: CanvasRenderingContext2D, connection: GraphConnection, nodes: GraphNode[]) => {
    const sourceNode = nodes.find(n => n.id === connection.source);
    const targetNode = nodes.find(n => n.id === connection.target);

    if (!sourceNode || !targetNode) return;

    const getConnectionColor = (type: string, strength: number) => {
      const alpha = 0.3 + strength * 0.4;
      switch (type) {
        case 'sacred': return `rgba(168, 85, 247, ${alpha})`; // purple
        case 'resonance': return `rgba(34, 197, 94, ${alpha})`; // green
        case 'logical': return `rgba(59, 130, 246, ${alpha})`; // blue
        case 'field': return `rgba(251, 191, 36, ${alpha})`; // amber
        default: return `rgba(148, 163, 184, ${alpha})`; // slate
      }
    };

    ctx.strokeStyle = getConnectionColor(connection.type, connection.strength);
    ctx.lineWidth = 1 + connection.strength * 3;

    // Draw flowing connection
    ctx.beginPath();
    ctx.moveTo(sourceNode.x, sourceNode.y);

    // Add curve for more organic feel
    const midX = (sourceNode.x + targetNode.x) / 2 + Math.sin(Date.now() / 2000 + connection.id.length) * 20;
    const midY = (sourceNode.y + targetNode.y) / 2 + Math.cos(Date.now() / 2000 + connection.id.length) * 20;

    ctx.quadraticCurveTo(midX, midY, targetNode.x, targetNode.y);
    ctx.stroke();

    // Draw flow direction indicator
    if (connection.flow_direction !== 0) {
      const flowAlpha = Math.abs(connection.flow_direction);
      ctx.fillStyle = getConnectionColor(connection.type, connection.strength).replace(/[\d.]+\)$/, `${flowAlpha})`);

      const flowX = midX + Math.sin(Date.now() / 1000) * 10;
      const flowY = midY + Math.cos(Date.now() / 1000) * 10;

      ctx.beginPath();
      ctx.arc(flowX, flowY, 2, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  const drawNode = (ctx: CanvasRenderingContext2D, node: GraphNode) => {
    const getElementColor = (element: string) => {
      switch (element) {
        case 'Fire': return '#ef4444'; // red
        case 'Water': return '#3b82f6'; // blue
        case 'Earth': return '#22c55e'; // green
        case 'Air': return '#eab308'; // yellow
        case 'Aether': return '#a855f7'; // purple
        default: return '#64748b'; // slate
      }
    };

    const getElementSymbol = (element: string) => {
      switch (element) {
        case 'Fire': return '🔥';
        case 'Water': return '🌊';
        case 'Earth': return '🌍';
        case 'Air': return '🌬️';
        case 'Aether': return '✨';
        default: return '⚪';
      }
    };

    // Draw node glow based on activation
    const glowRadius = node.size + node.activation * 15;
    const gradient = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, glowRadius);
    gradient.addColorStop(0, `${getElementColor(node.element)}80`);
    gradient.addColorStop(0.7, `${getElementColor(node.element)}20`);
    gradient.addColorStop(1, 'transparent');

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(node.x, node.y, glowRadius, 0, Math.PI * 2);
    ctx.fill();

    // Draw main node circle
    ctx.fillStyle = getElementColor(node.element);
    ctx.beginPath();
    ctx.arc(node.x, node.y, node.size, 0, Math.PI * 2);
    ctx.fill();

    // Draw consciousness score ring
    ctx.strokeStyle = `${getElementColor(node.element)}aa`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(node.x, node.y, node.size + 4, 0, Math.PI * 2 * node.consciousness_score);
    ctx.stroke();

    // Draw element symbol (simplified as text for now)
    ctx.fillStyle = 'white';
    ctx.font = `${node.size / 2}px monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(getElementSymbol(node.element), node.x, node.y);
  };

  const drawFieldStats = (ctx: CanvasRenderingContext2D, state: ConsciousnessFieldState) => {
    // Field coherence indicator (top-left)
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(10, 10, 180, 80);

    ctx.fillStyle = 'white';
    ctx.font = '12px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('Field Coherence:', 15, 30);
    ctx.fillStyle = '#22c55e';
    ctx.fillText(`${(state.field_coherence * 100).toFixed(1)}%`, 130, 30);

    ctx.fillStyle = 'white';
    ctx.fillText('Aetheric Synthesis:', 15, 50);
    ctx.fillStyle = '#a855f7';
    ctx.fillText(`${(state.aetheric_synthesis * 100).toFixed(1)}%`, 130, 50);

    ctx.fillStyle = 'white';
    ctx.fillText('Temporal Dynamics:', 15, 70);
    ctx.fillStyle = '#eab308';
    ctx.fillText(`${(state.temporal_dynamics * 100).toFixed(1)}%`, 130, 70);
  };

  // Update field state
  useEffect(() => {
    const updateField = () => {
      // In real implementation, this would call:
      // const response = await fetch('/api/consciousness/integration?type=graph');
      // const data = await response.json();

      const newState = generateMockFieldState();
      setFieldState(newState);
      setIsLoading(false);
    };

    updateField();
    const interval = setInterval(updateField, 100); // 10fps for smooth animation

    return () => clearInterval(interval);
  }, [width, height]);

  // Canvas rendering
  useEffect(() => {
    if (!fieldState || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = width;
    canvas.height = height;

    renderField(ctx, fieldState);
  }, [fieldState, width, height]);

  if (isLoading) {
    return (
      <div
        className={`flex items-center justify-center bg-slate-800 ${className}`}
        style={{ width, height }}
      >
        <div className="text-slate-400">
          <div className="animate-spin text-2xl mb-2">⚡</div>
          <div className="text-sm">Initializing consciousness field...</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="rounded-lg"
        style={{ width, height }}
      />

      {/* Kastrup's consciousness dashboard overlay */}
      <div className="absolute top-4 right-4 bg-slate-900/80 backdrop-blur-sm rounded-lg p-3 text-xs text-slate-300">
        <div className="mb-2 text-purple-300 font-medium">Consciousness Dashboard</div>
        <div className="space-y-1">
          <div>Nodes: <span className="text-cyan-400">{fieldState?.nodes.length}</span></div>
          <div>Connections: <span className="text-green-400">{fieldState?.connections.length}</span></div>
          <div>Reality Interface: <span className="text-purple-400">Active</span></div>
        </div>
        <div className="text-xs text-slate-500 mt-2">
          "Reality as consciousness dashboard" - B. Kastrup
        </div>
      </div>
    </div>
  );
}