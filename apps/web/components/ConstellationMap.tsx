"use client";

import { useEffect, useState } from "react";

interface Node {
  id: string;
  value: number;
  x: number;
  y: number;
  archetype?: string;
}

export default function ConstellationMap() {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [userNode, setUserNode] = useState<Node | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/collective/constellation", {
      headers: { "x-user-id": "demo-user" },
    })
      .then((res) => res.json())
      .then((data) => {
        setNodes(data.nodes);
        setUserNode(data.userNode);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load constellation data:", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="relative w-full h-[500px]  from-indigo-900 via-amber-900 to-black rounded-xl flex items-center justify-center">
        <div className="text-white text-lg">✨ Mapping the constellation...</div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[500px]  from-indigo-900 via-amber-900 to-black rounded-xl overflow-hidden">
      <svg width="100%" height="100%" viewBox="-300 -250 600 500">
        {/* Background stars */}
        {Array.from({ length: 50 }).map((_, i) => (
          <circle
            key={`star-${i}`}
            cx={Math.random() * 600 - 300}
            cy={Math.random() * 500 - 250}
            r={Math.random() * 1.5 + 0.5}
            fill="rgba(255,255,255,0.3)"
          />
        ))}
        
        {/* Connection lines between nodes */}
        {nodes.map((node, i) => 
          nodes.slice(i + 1).map((otherNode, j) => (
            <line
              key={`connection-${i}-${j}`}
              x1={node.x}
              y1={node.y}
              x2={otherNode.x}
              y2={otherNode.y}
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="1"
            />
          ))
        )}

        {/* Archetype nodes */}
        {nodes.map((node, i) => (
          <g key={i}>
            <circle
              cx={node.x}
              cy={node.y}
              r={Math.sqrt(node.value) * 4 + 10}
              fill="rgba(255,255,255,0.1)"
              stroke="cyan"
              strokeWidth="2"
              className="animate-pulse"
            />
            <circle
              cx={node.x}
              cy={node.y}
              r={Math.sqrt(node.value) * 2 + 5}
              fill="rgba(0,255,255,0.3)"
              stroke="white"
              strokeWidth="1"
            />
            <text
              x={node.x}
              y={node.y - Math.sqrt(node.value) * 4 - 20}
              textAnchor="middle"
              fill="white"
              fontSize="12"
              fontWeight="bold"
            >
              {node.id}
            </text>
            <text
              x={node.x}
              y={node.y - Math.sqrt(node.value) * 4 - 8}
              textAnchor="middle"
              fill="rgba(255,255,255,0.7)"
              fontSize="10"
            >
              {node.value} souls
            </text>
          </g>
        ))}

        {/* User node */}
        {userNode && (
          <g>
            <circle
              cx={userNode.x}
              cy={userNode.y}
              r={30}
              fill="rgba(255,215,0,0.2)"
              stroke="gold"
              strokeWidth="3"
              className="animate-pulse"
            />
            <circle
              cx={userNode.x}
              cy={userNode.y}
              r={15}
              fill="gold"
              stroke="white"
              strokeWidth="2"
            />
            <text
              x={userNode.x}
              y={userNode.y + 45}
              textAnchor="middle"
              fill="gold"
              fontSize="14"
              fontWeight="bold"
            >
              You
            </text>
            <text
              x={userNode.x}
              y={userNode.y + 60}
              textAnchor="middle"
              fill="rgba(255,215,0,0.8)"
              fontSize="10"
            >
              {userNode.archetype}
            </text>
          </g>
        )}
      </svg>
      
      <div className="absolute bottom-4 left-4 text-white text-sm space-y-1">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-gold rounded-full"></div>
          <span>🌌 Your light within the constellation</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-cyan-400 rounded-full"></div>
          <span>✨ Collective archetype clusters</span>
        </div>
      </div>
      
      <div className="absolute top-4 right-4 text-white text-right text-sm">
        <div className="font-semibold">Sacred Geometry</div>
        <div className="text-xs opacity-70">Individual within Universal</div>
      </div>
    </div>
  );
}