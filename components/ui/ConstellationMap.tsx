/**
 * ConstellationMap Component - Interactive collective consciousness visualization
 * Shows user's position within the collective field
 */

"use client"

import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface Node {
  id: string;
  x: number;
  y: number;
  value: number;
  archetype?: string;
  isUser?: boolean;
}

interface Connection {
  source: string;
  target: string;
  strength: number;
}

export interface ConstellationMapProps extends React.HTMLAttributes<HTMLDivElement> {
  userId?: string;
  showConnections?: boolean;
  animateNodes?: boolean;
  interactive?: boolean;
  height?: string | number;
}

export function ConstellationMap({ 
  userId = "demo-user",
  showConnections = true,
  animateNodes = true,
  interactive = true,
  height = 500,
  className,
  ...props 
}: ConstellationMapProps) {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [userNode, setUserNode] = useState<Node | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    fetchConstellationData();
  }, [userId]);

  const fetchConstellationData = async () => {
    try {
      const response = await fetch('/api/collective/constellation', { 
        headers: { 'x-user-id': userId }
      });
      const data = await response.json();
      
      if (data.success) {
        setNodes(data.nodes || []);
        setConnections(data.connections || []);
        setUserNode(data.userNode || null);
      }
    } catch (error) {
      console.error('Failed to fetch constellation data:', error);
      // Use demo data as fallback
      generateDemoData();
    } finally {
      setLoading(false);
    }
  };

  const generateDemoData = () => {
    // Generate demo nodes in a circular pattern
    const demoNodes: Node[] = [];
    const nodeCount = 50;
    
    for (let i = 0; i < nodeCount; i++) {
      const angle = (i / nodeCount) * Math.PI * 2;
      const radius = 150 + Math.random() * 50;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      
      demoNodes.push({
        id: `node-${i}`,
        x,
        y,
        value: Math.random() * 0.8 + 0.2,
        archetype: ['Hero', 'Sage', 'Creator', 'Lover', 'Seeker', 'Shadow'][Math.floor(Math.random() * 6)]
      });
    }

    // Add user node at center
    const userNodeData: Node = {
      id: 'user',
      x: 0,
      y: 0,
      value: 1,
      isUser: true,
      archetype: 'Seeker'
    };

    setNodes(demoNodes);
    setUserNode(userNodeData);
  };

  const getNodeColor = (node: Node) => {
    if (node.isUser) return '#FFD700'; // Gold for user
    
    const archetypeColors: Record<string, string> = {
      Hero: '#FF6B6B',
      Sage: '#4ECDC4',
      Creator: '#A78BFA',
      Lover: '#F472B6',
      Seeker: '#10B981',
      Shadow: '#6B7280'
    };
    
    return archetypeColors[node.archetype || 'Seeker'] || '#FFFFFF';
  };

  const getNodeRadius = (node: Node) => {
    const baseRadius = Math.sqrt(node.value) * 20;
    return node.isUser ? baseRadius * 1.5 : baseRadius;
  };

  if (loading) {
    return (
      <div className={cn("flex items-center justify-center", className)} style={{ height }}>
        <div className="text-gray-400">Loading constellation...</div>
      </div>
    );
  }

  return (
    <div 
      className={cn(
        "relative bg-black/50 rounded-xl overflow-hidden backdrop-blur-sm border border-white/10",
        className
      )} 
      style={{ height }}
      {...props}
    >
      <svg 
        ref={svgRef}
        width="100%" 
        height="100%" 
        viewBox="-250 -250 500 500"
        className="w-full h-full"
      >
        {/* Background grid */}
        <defs>
          <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
            <path 
              d="M 50 0 L 0 0 0 50" 
              fill="none" 
              stroke="rgba(255,255,255,0.05)" 
              strokeWidth="1"
            />
          </pattern>
        </defs>
        <rect x="-250" y="-250" width="500" height="500" fill="url(#grid)" />

        {/* Connections */}
        {showConnections && connections.map((connection, i) => {
          const sourceNode = nodes.find(n => n.id === connection.source) || userNode;
          const targetNode = nodes.find(n => n.id === connection.target) || userNode;
          
          if (!sourceNode || !targetNode) return null;

          return (
            <line
              key={i}
              x1={sourceNode.x}
              y1={sourceNode.y}
              x2={targetNode.x}
              y2={targetNode.y}
              stroke="rgba(99, 102, 241, 0.2)"
              strokeWidth={connection.strength * 2}
              className="transition-opacity duration-300"
              opacity={hoveredNode === connection.source || hoveredNode === connection.target ? 1 : 0.3}
            />
          );
        })}

        {/* Nodes */}
        {nodes.map((node) => (
          <g key={node.id}>
            {animateNodes ? (
              <motion.circle
                cx={node.x}
                cy={node.y}
                r={getNodeRadius(node)}
                fill={getNodeColor(node)}
                fillOpacity={0.7}
                stroke={getNodeColor(node)}
                strokeWidth="2"
                strokeOpacity={0.9}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ 
                  delay: Math.random() * 0.5,
                  duration: 0.5,
                  type: "spring"
                }}
                className={cn(
                  "transition-all duration-300",
                  interactive && "cursor-pointer hover:fill-opacity-100"
                )}
                onMouseEnter={() => interactive && setHoveredNode(node.id)}
                onMouseLeave={() => interactive && setHoveredNode(null)}
              />
            ) : (
              <circle
                cx={node.x}
                cy={node.y}
                r={getNodeRadius(node)}
                fill={getNodeColor(node)}
                fillOpacity={0.7}
                stroke={getNodeColor(node)}
                strokeWidth="2"
                strokeOpacity={0.9}
                className={cn(
                  "transition-all duration-300",
                  interactive && "cursor-pointer hover:fill-opacity-100"
                )}
                onMouseEnter={() => interactive && setHoveredNode(node.id)}
                onMouseLeave={() => interactive && setHoveredNode(null)}
              />
            )}
            
            {/* Hover label */}
            {hoveredNode === node.id && (
              <g>
                <rect
                  x={node.x - 40}
                  y={node.y - 30}
                  width="80"
                  height="20"
                  fill="rgba(0,0,0,0.8)"
                  rx="4"
                />
                <text
                  x={node.x}
                  y={node.y - 15}
                  textAnchor="middle"
                  fill="white"
                  fontSize="12"
                  fontFamily="monospace"
                >
                  {node.archetype || 'Unknown'}
                </text>
              </g>
            )}
          </g>
        ))}

        {/* User node */}
        {userNode && (
          <g>
            <motion.circle
              cx={userNode.x}
              cy={userNode.y}
              r={getNodeRadius(userNode)}
              fill={getNodeColor(userNode)}
              stroke="white"
              strokeWidth="3"
              initial={{ scale: 0 }}
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                repeatType: "reverse"
              }}
              className="drop-shadow-[0_0_20px_rgba(255,215,0,0.5)]"
            />
            
            {/* User label */}
            <text
              x={userNode.x}
              y={userNode.y + 35}
              textAnchor="middle"
              fill="white"
              fontSize="14"
              fontWeight="bold"
              fontFamily="monospace"
            >
              You
            </text>
          </g>
        )}
      </svg>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 space-y-1 text-xs text-gray-400">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-yellow-500 rounded-full" />
          <span>Your position</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-white/50 rounded-full" />
          <span>Other seekers</span>
        </div>
      </div>
    </div>
  );
}