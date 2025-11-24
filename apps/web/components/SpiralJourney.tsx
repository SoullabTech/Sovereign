'use client';
import React, { useState } from 'react';
import { PolarAngleAxis, PolarRadiusAxis, RadialBarChart, RadialBar, Tooltip, ResponsiveContainer } from 'recharts';
import { Flame, Droplets, Mountain, Wind, Sparkles } from 'lucide-react';

// Types
interface SpiralNode {
  sessionId: string;
  phase: string;
  element: 'fire' | 'water' | 'earth' | 'air' | 'aether';
  symbols: string[];
  snippet: string;
  practices: string[];
  timestamp?: string;
  emotionalTone?: string;
  insights?: string[];
}

interface SpiralJourneyProps {
  nodes: SpiralNode[];
  onSelectNode?: (node: SpiralNode) => void;
  className?: string;
}

// Element mapping with colors and icons
const elementMap = {
  fire: { 
    color: '#ef4444', 
    icon: Flame,
    label: 'Fire',
    bgClass: 'bg-red-500'
  },
  water: { 
    color: '#3b82f6', 
    icon: Droplets,
    label: 'Water',
    bgClass: 'bg-blue-500'
  },
  earth: { 
    color: '#10b981', 
    icon: Mountain,
    label: 'Earth',
    bgClass: 'bg-green-500'
  },
  air: { 
    color: '#f59e0b', 
    icon: Wind,
    label: 'Air',
    bgClass: 'bg-amber-500'
  },
  aether: { 
    color: '#a855f7', 
    icon: Sparkles,
    label: 'Aether',
    bgClass: 'bg-amber-500'
  },
};

// Phase progression mapping
const phaseOrder = [
  'initiation',
  'challenge',
  'integration',
  'mastery',
  'transcendence'
];

export default function SpiralJourney({ 
  nodes, 
  onSelectNode,
  className = ""
}: SpiralJourneyProps) {
  const [hoveredNode, setHoveredNode] = useState<SpiralNode | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  // Transform nodes into radial data with spiral progression
  const data = nodes.map((node, idx) => {
    // Calculate spiral position based on phase and index
    const phaseIndex = phaseOrder.indexOf(node.phase) !== -1 
      ? phaseOrder.indexOf(node.phase) 
      : 2; // default to integration
    
    // Create spiral effect: angle increases with each session
    const angleStep = 360 / Math.max(nodes.length, 8);
    const angle = idx * angleStep;
    
    // Radius increases with phase progression
    const baseRadius = 30;
    const radiusStep = 15;
    const radius = baseRadius + (phaseIndex * radiusStep) + (idx * 2);
    
    return {
      name: `S${idx + 1}`,
      value: radius,
      angle: angle,
      fill: elementMap[node.element]?.color || elementMap.aether.color,
      node: node,
      isSelected: node.sessionId === selectedNodeId
    };
  });

  const handleNodeClick = (entry: any) => {
    if (entry && entry.node) {
      setSelectedNodeId(entry.node.sessionId);
      onSelectNode?.(entry.node);
    }
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload[0]) {
      const node: SpiralNode = payload[0].payload.node;
      const ElementIcon = elementMap[node.element]?.icon || Sparkles;
      
      return (
        <div className="bg-black/90 backdrop-blur-sm text-white p-3 rounded-lg border border-amber-500/30">
          <div className="flex items-center gap-2 mb-2">
            <ElementIcon size={16} className="text-amber-400" />
            <span className="font-semibold">
              {node.phase.charAt(0).toUpperCase() + node.phase.slice(1)}
            </span>
          </div>
          <p className="text-xs text-gray-300 mb-1">
            Element: {elementMap[node.element]?.label || 'Unknown'}
          </p>
          {node.symbols.length > 0 && (
            <p className="text-xs text-gray-300">
              Symbols: {node.symbols.slice(0, 3).join(', ')}
              {node.symbols.length > 3 && '...'}
            </p>
          )}
          {node.emotionalTone && (
            <p className="text-xs text-amber-300 mt-1">
              Tone: {node.emotionalTone}
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <h2 className="text-lg font-bold mb-4 text-white">Your Spiral Journey</h2>
      
      <div className="relative">
        <ResponsiveContainer width={400} height={400}>
          <RadialBarChart
            cx="50%"
            cy="50%"
            innerRadius="20%"
            outerRadius="90%"
            barSize={16}
            data={data}
            startAngle={90}
            endAngle={-270}
          >
            <PolarAngleAxis 
              type="number" 
              domain={[0, 360]}
              dataKey="angle"
              tick={false}
            />
            <PolarRadiusAxis 
              angle={90} 
              domain={[0, 100]}
              tick={false}
            />
            <RadialBar
              minAngle={15}
              background={{ fill: '#1f2937' }}
              clockWise
              dataKey="value"
              cornerRadius={8}
              onClick={handleNodeClick}
              onMouseEnter={(data) => setHoveredNode(data.node)}
              onMouseLeave={() => setHoveredNode(null)}
              className="cursor-pointer hover:opacity-80 transition-opacity"
            />
            <Tooltip 
              content={<CustomTooltip />}
              cursor={false}
            />
          </RadialBarChart>
        </ResponsiveContainer>
        
        {/* Center visualization */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center">
            <Sparkles className="w-8 h-8 text-amber-400 mx-auto mb-2" />
            <p className="text-xs text-gray-400">
              {nodes.length} Sessions
            </p>
          </div>
        </div>
      </div>

      {/* Element Legend */}
      <div className="flex flex-wrap gap-3 mt-4 justify-center">
        {Object.entries(elementMap).map(([key, { color, icon: Icon, label }]) => {
          const elementCount = nodes.filter(n => n.element === key).length;
          if (elementCount === 0) return null;
          
          return (
            <div 
              key={key} 
              className="flex items-center gap-1.5 text-xs"
            >
              <span 
                style={{ backgroundColor: color }} 
                className="w-3 h-3 rounded-full"
              />
              <Icon size={14} />
              <span className="text-gray-300">
                {label} ({elementCount})
              </span>
            </div>
          );
        })}
      </div>

      {/* Phase Indicator */}
      <div className="mt-4 w-full max-w-sm">
        <p className="text-xs text-gray-400 mb-2 text-center">Phase Progression</p>
        <div className="flex justify-between items-center">
          {phaseOrder.map((phase, idx) => {
            const hasPhase = nodes.some(n => n.phase === phase);
            return (
              <div 
                key={phase}
                className={`flex flex-col items-center ${
                  hasPhase ? 'opacity-100' : 'opacity-30'
                }`}
              >
                <div className={`w-2 h-2 rounded-full ${
                  hasPhase ? 'bg-amber-500' : 'bg-gray-600'
                }`} />
                <span className="text-xs mt-1 text-gray-400">
                  {phase.slice(0, 3).toUpperCase()}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Node Detail */}
      {hoveredNode && (
        <div className="mt-4 p-3 bg-gray-800/50 rounded-lg w-full max-w-sm">
          <p className="text-xs text-gray-300 line-clamp-2">
            "{hoveredNode.snippet}"
          </p>
          {hoveredNode.practices.length > 0 && (
            <p className="text-xs text-amber-400 mt-2">
              Practices: {hoveredNode.practices.length}
            </p>
          )}
        </div>
      )}
    </div>
  );
}