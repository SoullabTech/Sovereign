"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Flame, Droplets, Mountain, Wind, Sparkles, 
  ChevronRight, Calendar, Hash, Compass, Star, Sun, Moon
} from 'lucide-react';

interface SpiralSymbol {
  label: string;
  meaning?: string;
  practice?: string;
  transformationPotential?: number;
}

interface SpiralNode {
  sessionId: string;
  timestamp: string;
  phase: string;
  element: string;
  arc: string;
  symbols?: SpiralSymbol[];
  narrative?: string;
  snippet: string;
  transformationPotential?: number;
  isArcTransition?: boolean;
  coordinates?: {
    angle: number;
    radius: number;
  };
}

interface Props {
  journey: SpiralNode[];
  currentArc?: string;
  elementalBalance?: Record<string, 'dominant' | 'balanced' | 'underactive'>;
  onNodeSelect?: (node: SpiralNode) => void;
}

// Arc definitions with colors and meanings
const arcDefinitions = {
  initiation: {
    color: '#f39c12',
    label: 'Initiation',
    description: 'Beginning the journey, gathering courage',
    gradient: 'from-yellow-400 to-amber-500'
  },
  descent: {
    color: '#3498db',
    label: 'Descent',
    description: 'Going deep, meeting shadows',
    gradient: 'from-blue-400 to-blue-600'
  },
  transformation: {
    color: '#e74c3c',
    label: 'Transformation',
    description: 'Fire of change, shedding skins',
    gradient: 'from-red-400 to-red-600'
  },
  integration: {
    color: '#27ae60',
    label: 'Integration',
    description: 'Weaving wisdom, finding balance',
    gradient: 'from-green-400 to-green-600'
  },
  return: {
    color: '#9b59b6',
    label: 'Return',
    description: 'Gifting medicine, completing cycle',
    gradient: 'from-amber-400 to-amber-600'
  }
};

// Element icons and colors
const elementConfig = {
  fire: { icon: Flame, color: '#FF6B6B' },
  water: { icon: Droplets, color: '#4ECDC4' },
  earth: { icon: Mountain, color: '#95E77E' },
  air: { icon: Wind, color: '#FFE66D' },
  aether: { icon: Sparkles, color: '#B57EDC' }
};

export default function EnhancedSpiralVisualizer({
  journey,
  currentArc = 'initiation',
  elementalBalance = {},
  onNodeSelect
}: Props) {
  const [selectedNode, setSelectedNode] = useState<SpiralNode | null>(null);
  const [hoveredNode, setHoveredNode] = useState<SpiralNode | null>(null);
  const [viewMode, setViewMode] = useState<'spiral' | 'timeline'>('spiral');
  const svgRef = useRef<SVGSVGElement>(null);
  const [dimensions, setDimensions] = useState({ width: 400, height: 400 });

  // Calculate SVG dimensions based on container
  useEffect(() => {
    const updateDimensions = () => {
      if (svgRef.current) {
        const { width } = svgRef.current.getBoundingClientRect();
        setDimensions({ width, height: width });
      }
    };
    
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  const centerX = dimensions.width / 2;
  const centerY = dimensions.height / 2;
  const maxRadius = Math.min(centerX, centerY) - 40;

  // Calculate node positions on spiral
  const calculateNodePosition = (index: number, total: number) => {
    const progress = index / Math.max(total - 1, 1);
    const angle = progress * 720; // Two full rotations
    const radius = 30 + (progress * (maxRadius - 30));
    
    const x = centerX + radius * Math.cos((angle - 90) * Math.PI / 180);
    const y = centerY + radius * Math.sin((angle - 90) * Math.PI / 180);
    
    return { x, y, angle, radius };
  };

  // Get glow intensity based on transformation potential
  const getGlowIntensity = (potential?: number) => {
    if (!potential) return { level: 0, color: '#666', pulse: false };
    
    if (potential > 0.8) {
      return { level: 3, color: '#ff00ff', pulse: true }; // Intense magenta glow with pulse
    }
    if (potential > 0.5) {
      return { level: 2, color: '#ffaa00', pulse: false }; // Medium amber glow
    }
    if (potential > 0.2) {
      return { level: 1, color: '#00ffff', pulse: false }; // Soft cyan glow
    }
    return { level: 0, color: '#666', pulse: false };
  };

  // Handle node selection
  const handleNodeClick = (node: SpiralNode) => {
    setSelectedNode(node);
    onNodeSelect?.(node);
  };

  return (
    <div className="w-full space-y-4">
      {/* View Mode Toggle */}
      <div className="flex justify-center gap-2">
        <button
          onClick={() => setViewMode('spiral')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            viewMode === 'spiral' 
              ? 'bg-amber-600 text-white' 
              : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
          }`}
        >
          <Compass className="inline w-4 h-4 mr-1" />
          Spiral View
        </button>
        <button
          onClick={() => setViewMode('timeline')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            viewMode === 'timeline' 
              ? 'bg-amber-600 text-white' 
              : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
          }`}
        >
          <Calendar className="inline w-4 h-4 mr-1" />
          Timeline
        </button>
      </div>

      {/* Main Visualization */}
      <div className="relative bg-slate-900 rounded-2xl p-4 shadow-2xl">
        {viewMode === 'spiral' ? (
          <svg
            ref={svgRef}
            viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
            className="w-full h-auto"
            style={{ background: 'radial-gradient(circle at center, #1e1b4b 0%, #0f0a1f 100%)' }}
          >
            {/* Definitions for gradients and filters */}
            <defs>
              {/* Glow filters with different intensities */}
              <filter id="glow-soft">
                <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
              
              <filter id="glow-medium">
                <feGaussianBlur stdDeviation="6" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
              
              <filter id="glow-intense">
                <feGaussianBlur stdDeviation="10" result="coloredBlur"/>
                <feFlood floodColor="#ff00ff" floodOpacity="0.5"/>
                <feComposite in2="coloredBlur" operator="in"/>
                <feMerge>
                  <feMergeNode/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>

              {/* Pulse animation gradient */}
              <radialGradient id="pulseGradient">
                <stop offset="0%" stopColor="#fff" stopOpacity="0.8">
                  <animate attributeName="stopOpacity" 
                    values="0.8;0.2;0.8" 
                    dur="2s" 
                    repeatCount="indefinite"/>
                </stop>
                <stop offset="100%" stopColor="#fff" stopOpacity="0">
                  <animate attributeName="stopOpacity" 
                    values="0;0.3;0" 
                    dur="2s" 
                    repeatCount="indefinite"/>
                </stop>
              </radialGradient>
            </defs>

            {/* Arc segments (background wedges) */}
            {Object.entries(arcDefinitions).map(([arcName, config], index) => {
              const startAngle = index * 72;
              const endAngle = (index + 1) * 72;
              
              return (
                <g key={arcName}>
                  <path
                    d={describeArc(centerX, centerY, maxRadius, startAngle, endAngle)}
                    fill={config.color}
                    fillOpacity={currentArc === arcName ? 0.15 : 0.03}
                    className="transition-opacity duration-1000"
                  />
                  {/* Arc label */}
                  <text
                    x={centerX + (maxRadius * 0.7) * Math.cos(((startAngle + endAngle) / 2 - 90) * Math.PI / 180)}
                    y={centerY + (maxRadius * 0.7) * Math.sin(((startAngle + endAngle) / 2 - 90) * Math.PI / 180)}
                    fill={config.color}
                    fontSize="10"
                    textAnchor="middle"
                    opacity="0.5"
                    className="uppercase tracking-wider"
                  >
                    {config.label}
                  </text>
                </g>
              );
            })}

            {/* Spiral guide path */}
            <path
              d={generateSpiralPath(centerX, centerY, 30, maxRadius, 720)}
              fill="none"
              stroke="url(#pulseGradient)"
              strokeWidth="0.5"
              strokeDasharray="2 4"
              opacity="0.2"
            />

            {/* Journey nodes with connections */}
            {journey.map((node, index) => {
              const pos = calculateNodePosition(index, journey.length);
              const glow = getGlowIntensity(node.transformationPotential);
              const isTransition = node.isArcTransition;
              const isSelected = selectedNode?.sessionId === node.sessionId;
              const isHovered = hoveredNode?.sessionId === node.sessionId;
              
              // Determine if this is a major transformation (arc transition + high potential)
              const isMajorTransformation = isTransition && (node.transformationPotential || 0) > 0.7;
              
              return (
                <g key={node.sessionId}>
                  {/* Connection line to previous node */}
                  {index > 0 && (
                    <line
                      x1={calculateNodePosition(index - 1, journey.length).x}
                      y1={calculateNodePosition(index - 1, journey.length).y}
                      x2={pos.x}
                      y2={pos.y}
                      stroke={isTransition ? glow.color : arcDefinitions[node.arc]?.color || '#666'}
                      strokeWidth={isTransition ? "2" : "1"}
                      opacity={isTransition ? "0.6" : "0.3"}
                      strokeDasharray={isTransition ? "5 3" : "0"}
                    />
                  )}
                  
                  {/* Major transformation blazing effect */}
                  {isMajorTransformation && (
                    <>
                      {/* Outer blazing ring */}
                      <circle
                        cx={pos.x}
                        cy={pos.y}
                        r="20"
                        fill="none"
                        stroke={glow.color}
                        strokeWidth="1"
                        opacity="0.3"
                      >
                        <animate
                          attributeName="r"
                          values="15;30;15"
                          dur="3s"
                          repeatCount="indefinite"
                        />
                        <animate
                          attributeName="opacity"
                          values="0.6;0.1;0.6"
                          dur="3s"
                          repeatCount="indefinite"
                        />
                      </circle>
                      {/* Inner blazing ring */}
                      <circle
                        cx={pos.x}
                        cy={pos.y}
                        r="12"
                        fill="none"
                        stroke="#fff"
                        strokeWidth="0.5"
                        opacity="0.5"
                      >
                        <animate
                          attributeName="r"
                          values="8;15;8"
                          dur="2s"
                          repeatCount="indefinite"
                        />
                      </circle>
                    </>
                  )}
                  
                  {/* Regular transition pulse */}
                  {isTransition && !isMajorTransformation && (
                    <circle
                      cx={pos.x}
                      cy={pos.y}
                      r="12"
                      fill="none"
                      stroke={arcDefinitions[node.arc]?.color || '#fff'}
                      strokeWidth="1.5"
                      opacity="0.4"
                    >
                      <animate
                        attributeName="r"
                        values="8;14;8"
                        dur="2.5s"
                        repeatCount="indefinite"
                      />
                      <animate
                        attributeName="opacity"
                        values="0.6;0.2;0.6"
                        dur="2.5s"
                        repeatCount="indefinite"
                      />
                    </circle>
                  )}
                  
                  {/* Node circle with dynamic glow */}
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r={isSelected ? 10 : isHovered ? 8 : 6}
                    fill={elementConfig[node.element]?.color || '#999'}
                    stroke={isSelected ? '#fff' : glow.color}
                    strokeWidth={isSelected ? 2.5 : glow.level > 0 ? 2 : 1}
                    filter={glow.level > 0 ? `url(#glow-${
                      glow.level === 3 ? 'intense' : 
                      glow.level === 2 ? 'medium' : 'soft'
                    })` : undefined}
                    className="cursor-pointer transition-all duration-300"
                    onClick={() => handleNodeClick(node)}
                    onMouseEnter={() => setHoveredNode(node)}
                    onMouseLeave={() => setHoveredNode(null)}
                    style={{
                      filter: glow.pulse ? 'url(#glow-intense)' : undefined,
                      animation: glow.pulse ? 'blazePulse 1.5s infinite' : undefined
                    }}
                  />
                  
                  {/* Symbol indicators */}
                  {node.symbols && node.symbols.length > 0 && (
                    <>
                      {node.symbols.slice(0, 3).map((symbol, idx) => {
                        const symbolAngle = (idx - 1) * 30;
                        const symbolRadius = 15;
                        const sx = pos.x + symbolRadius * Math.cos((pos.angle + symbolAngle - 90) * Math.PI / 180);
                        const sy = pos.y + symbolRadius * Math.sin((pos.angle + symbolAngle - 90) * Math.PI / 180);
                        
                        return (
                          <text
                            key={idx}
                            x={sx}
                            y={sy}
                            fill="#fbbf24"
                            fontSize="8"
                            textAnchor="middle"
                            className="pointer-events-none"
                            opacity="0.8"
                          >
                            {getSymbolIcon(symbol.label)}
                          </text>
                        );
                      })}
                    </>
                  )}
                  
                  {/* Transformation score indicator */}
                  {node.transformationPotential && node.transformationPotential > 0.5 && (
                    <text
                      x={pos.x}
                      y={pos.y - 12}
                      fill={glow.color}
                      fontSize="8"
                      textAnchor="middle"
                      className="pointer-events-none font-bold"
                    >
                      {Math.round(node.transformationPotential * 100)}%
                    </text>
                  )}
                </g>
              );
            })}

            {/* Current position beacon */}
            {journey.length > 0 && (
              <g>
                <circle
                  cx={calculateNodePosition(journey.length - 1, journey.length).x}
                  cy={calculateNodePosition(journey.length - 1, journey.length).y}
                  r="3"
                  fill="#fff"
                >
                  <animate
                    attributeName="opacity"
                    values="1;0.2;1"
                    dur="1.5s"
                    repeatCount="indefinite"
                  />
                </circle>
                <circle
                  cx={calculateNodePosition(journey.length - 1, journey.length).x}
                  cy={calculateNodePosition(journey.length - 1, journey.length).y}
                  r="6"
                  fill="none"
                  stroke="#fff"
                  strokeWidth="1"
                  opacity="0.5"
                >
                  <animate
                    attributeName="r"
                    values="6;12;6"
                    dur="1.5s"
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="opacity"
                    values="0.5;0;0.5"
                    dur="1.5s"
                    repeatCount="indefinite"
                  />
                </circle>
              </g>
            )}
          </svg>
        ) : (
          <TimelineView journey={journey} onNodeSelect={handleNodeClick} />
        )}
      </div>

      {/* Arc Legend with current position */}
      <div className="flex flex-wrap justify-center gap-3">
        {Object.entries(arcDefinitions).map(([arcName, config]) => {
          const nodesInArc = journey.filter(n => n.arc === arcName).length;
          return (
            <div
              key={arcName}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-all ${
                currentArc === arcName 
                  ? 'bg-slate-800 ring-2 ring-amber-500 scale-105' 
                  : 'bg-slate-800/50'
              }`}
            >
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: config.color }}
              />
              <span className="text-xs font-medium text-slate-300">
                {config.label}
              </span>
              {nodesInArc > 0 && (
                <span className="text-xs text-slate-500">
                  ({nodesInArc})
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Selected Node Detail Panel */}
      <AnimatePresence>
        {selectedNode && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 shadow-2xl border border-slate-700"
          >
            {/* Header with transformation indicator */}
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  Session {selectedNode.sessionId}
                  {selectedNode.isArcTransition && (
                    <motion.span 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="text-xs px-2 py-1 bg-gradient-to-r from-amber-600 to-pink-600 rounded-full"
                    >
                      ✨ Transition Point
                    </motion.span>
                  )}
                </h3>
                <p className="text-sm text-slate-400 mt-1">
                  {new Date(selectedNode.timestamp).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center shadow-lg"
                  style={{ 
                    backgroundColor: elementConfig[selectedNode.element]?.color + '30',
                    boxShadow: `0 0 20px ${elementConfig[selectedNode.element]?.color}40`
                  }}
                >
                  {React.createElement(
                    elementConfig[selectedNode.element]?.icon || Sparkles,
                    { 
                      className: 'w-6 h-6',
                      style: { color: elementConfig[selectedNode.element]?.color }
                    }
                  )}
                </div>
              </div>
            </div>

            {/* Arc transition message */}
            {selectedNode.isArcTransition && journey.findIndex(n => n.sessionId === selectedNode.sessionId) > 0 && (
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="mb-4 p-3 bg-amber-900/20 border border-amber-700/30 rounded-lg"
              >
                <p className="text-sm text-amber-200">
                  <Sparkles className="inline w-4 h-4 mr-1" />
                  You crossed from{' '}
                  <span className="font-semibold">
                    {journey[journey.findIndex(n => n.sessionId === selectedNode.sessionId) - 1]?.arc}
                  </span>
                  {' '}into{' '}
                  <span className="font-semibold">{selectedNode.arc}</span>
                  {selectedNode.transformationPotential && selectedNode.transformationPotential > 0.7 && (
                    <span className="block mt-1 text-yellow-300">
                      This was a major transformation moment.
                    </span>
                  )}
                </p>
              </motion.div>
            )}

            {/* Symbols with transformation scores */}
            {selectedNode.symbols && selectedNode.symbols.length > 0 && (
              <div className="mb-4">
                <span className="text-xs text-slate-500 mb-2 block uppercase tracking-wider">
                  Archetypal Symbols Present
                </span>
                <div className="space-y-2">
                  {selectedNode.symbols.map((symbol, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="p-3 bg-slate-700/50 rounded-lg border border-slate-600/50"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="text-sm font-medium text-yellow-400 flex items-center gap-2">
                            <span className="text-lg">{getSymbolIcon(symbol.label)}</span>
                            {symbol.label}
                          </h4>
                          {symbol.meaning && (
                            <p className="text-xs text-slate-400 mt-1">
                              {symbol.meaning}
                            </p>
                          )}
                        </div>
                        {symbol.transformationPotential && (
                          <TransformationMeter 
                            value={symbol.transformationPotential}
                            compact
                          />
                        )}
                      </div>
                      {symbol.practice && (
                        <div className="mt-2 pt-2 border-t border-slate-600/50">
                          <p className="text-xs text-green-400">
                            <Star className="inline w-3 h-3 mr-1" />
                            Practice: {symbol.practice}
                          </p>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Overall transformation score with visual indicator */}
            {selectedNode.transformationPotential && (
              <div className="mt-4 pt-4 border-t border-slate-700">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500 uppercase tracking-wider">
                    Session Transformation Intensity
                  </span>
                  <TransformationMeter 
                    value={selectedNode.transformationPotential} 
                    showLabel 
                    showBlaze={selectedNode.transformationPotential > 0.8}
                  />
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Timeline view component
function TimelineView({ 
  journey, 
  onNodeSelect 
}: { 
  journey: SpiralNode[]; 
  onNodeSelect: (node: SpiralNode) => void;
}) {
  return (
    <div className="space-y-2 max-h-96 overflow-y-auto">
      {journey.map((node, idx) => (
        <motion.div
          key={node.sessionId}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: idx * 0.05 }}
          onClick={() => onNodeSelect(node)}
          className="p-3 bg-slate-800/50 hover:bg-slate-800 rounded-lg cursor-pointer transition-colors"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: arcDefinitions[node.arc]?.color }}
              />
              <div>
                <p className="text-sm text-white">
                  Session {node.sessionId}
                </p>
                <p className="text-xs text-slate-500">
                  {new Date(node.timestamp).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {node.symbols && node.symbols.length > 0 && (
                <Hash className="w-4 h-4 text-yellow-400" />
              )}
              {node.isArcTransition && (
                <ChevronRight className="w-4 h-4 text-amber-400" />
              )}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

// Enhanced transformation meter with blaze effect
function TransformationMeter({ 
  value, 
  showLabel = false,
  compact = false,
  showBlaze = false
}: { 
  value: number; 
  showLabel?: boolean;
  compact?: boolean;
  showBlaze?: boolean;
}) {
  const percentage = Math.round(value * 100);
  const color = 
    value > 0.8 ? 'from-red-500 to-pink-500' :
    value > 0.5 ? 'from-yellow-500 to-orange-500' :
    value > 0.2 ? 'from-blue-500 to-cyan-500' :
    'from-slate-600 to-slate-500';

  return (
    <div className={`flex items-center gap-2 ${compact ? 'scale-90' : ''}`}>
      <div className="relative">
        <div className={`${compact ? 'w-16' : 'w-20'} h-2 bg-slate-700 rounded-full overflow-hidden`}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className={`h-full bg-gradient-to-r ${color}`}
            style={{
              boxShadow: showBlaze ? `0 0 10px ${value > 0.8 ? '#ff0066' : '#ffaa00'}` : undefined
            }}
          />
        </div>
        {showBlaze && value > 0.8 && (
          <div className="absolute inset-0 rounded-full animate-pulse">
            <div className="h-full w-full rounded-full bg-gradient-to-r from-transparent via-pink-500/20 to-transparent" />
          </div>
        )}
      </div>
      {showLabel && (
        <span className={`text-xs ${value > 0.8 ? 'text-pink-400 font-bold' : 'text-slate-400'}`}>
          {percentage}%
        </span>
      )}
    </div>
  );
}

// Get symbol icon based on label
function getSymbolIcon(label: string): string {
  const symbolIcons: Record<string, string> = {
    Moon: '🌙',
    Sun: '☀️',
    Stars: '✨',
    Stag: '🦌',
    Snake: '🐍',
    Wolf: '🐺',
    Raven: '🦅',
    Mountain: '⛰️',
    River: '🌊',
    Cave: '🕳️',
    Tree: '🌳',
    Bridge: '🌉',
    Mirror: '🪞',
    Spiral: '🌀',
    Gate: '🚪',
    Flame: '🔥',
    Ocean: '🌊',
    Storm: '⛈️',
    Crystal: '💎'
  };
  
  return symbolIcons[label] || '✦';
}

// Utility functions
function describeArc(
  x: number,
  y: number,
  radius: number,
  startAngle: number,
  endAngle: number
): string {
  const start = polarToCartesian(x, y, radius, endAngle);
  const end = polarToCartesian(x, y, radius, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';

  return [
    'M', x, y,
    'L', start.x, start.y,
    'A', radius, radius, 0, largeArcFlag, 0, end.x, end.y,
    'Z'
  ].join(' ');
}

function polarToCartesian(
  centerX: number,
  centerY: number,
  radius: number,
  angleInDegrees: number
) {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians)
  };
}

function generateSpiralPath(
  cx: number,
  cy: number,
  startRadius: number,
  endRadius: number,
  totalAngle: number
): string {
  const points = [];
  const steps = 100;
  
  for (let i = 0; i <= steps; i++) {
    const progress = i / steps;
    const angle = progress * totalAngle;
    const radius = startRadius + (endRadius - startRadius) * progress;
    
    const x = cx + radius * Math.cos((angle - 90) * Math.PI / 180);
    const y = cy + radius * Math.sin((angle - 90) * Math.PI / 180);
    
    points.push(i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`);
  }
  
  return points.join(' ');
}

// Add CSS for custom animations
const styles = `
  @keyframes blazePulse {
    0%, 100% { 
      filter: drop-shadow(0 0 6px currentColor) drop-shadow(0 0 12px currentColor);
      transform: scale(1);
    }
    50% { 
      filter: drop-shadow(0 0 10px currentColor) drop-shadow(0 0 20px currentColor);
      transform: scale(1.1);
    }
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}